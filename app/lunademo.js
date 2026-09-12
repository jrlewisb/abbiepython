/* ---------------------------------------------------------------
   A stand-in for lunapi.

   The real lunapi is a compiled C++ extension and cannot run in a
   browser, so this module mimics its API over synthetic but plausible
   sleep data. The CALL SEQUENCE is the real one — lp.proj(), p.inst(),
   attach_edf(), channels(), eval(), table() — so the code she writes
   here is the code she will run for real in chapter 21.

   Single source of truth: the engine writes this into Python's
   filesystem at boot, and tools/runner.py extracts the same text
   between the sentinels below. Edit it here and nowhere else.
   --------------------------------------------------------------- */

/* LUNA_DEMO_SOURCE_START */
window.LUNA_DEMO_SOURCE = String.raw`
"""A stand-in for lunapi, with the same API over synthetic sleep data.

Chapter 21 replaces this with:  import lunapi as lp
Nothing else about your code has to change.
"""

import numpy as np
import pandas as pd

__all__ = ["proj", "hypno"]

_STAGE_CYCLE = ["W", "N1", "N2", "N2", "N3", "N3", "N2", "R"]
_CHANNELS = [
    ("EEG1", "uV", 256),
    ("EEG2", "uV", 256),
    ("EOG", "uV", 128),
    ("EMG", "uV", 512),
]


def _stages_for(n_epochs):
    out = []
    for i in range(n_epochs):
        if i < 4:
            out.append("W")
        else:
            out.append(_STAGE_CYCLE[i % len(_STAGE_CYCLE)])
    return out


def _spectrum(channel):
    """A 1/f spectrum, with an alpha bump on EEG1 only."""
    freqs = np.arange(0.5, 30.5, 0.5)
    power = 100.0 / (freqs ** 1.2)
    if channel == "EEG1":
        power = power + 40.0 * np.exp(-((freqs - 10.0) ** 2) / 2.0)
    return freqs, np.round(10.0 * np.log10(power), 4)


class _Inst:
    def __init__(self, ident):
        self.id = ident
        self._edf = None
        self._annot = None
        self._n_epochs = 480          # four hours of 30-second epochs
        self._cache = {}

    # ---- attaching ----
    def attach_edf(self, path):
        self._edf = path
        return True

    def attach_annot(self, path):
        self._annot = path
        return True

    # ---- looking around ----
    def channels(self):
        self._require_edf()
        return pd.DataFrame({"CH": [c[0] for c in _CHANNELS]})

    def chs(self):
        return self.channels()

    def headers(self):
        self._require_edf()
        return pd.DataFrame({
            "CH": [c[0] for c in _CHANNELS],
            "UNIT": [c[1] for c in _CHANNELS],
            "SR": [c[2] for c in _CHANNELS],
        })

    def stages(self):
        self._require_edf()
        return _stages_for(self._n_epochs)

    # ---- running commands ----
    def eval(self, cmdstr):
        self._require_edf()
        head = cmdstr.strip().split()[0].upper()

        if head == "EPOCH":
            self._cache[("EPOCH", "BL")] = pd.DataFrame({
                "NE": [self._n_epochs], "DUR": [30.0],
            })
        elif head == "STAGE":
            stages = _stages_for(self._n_epochs)
            self._cache[("STAGE", "E")] = pd.DataFrame({
                "E": list(range(1, self._n_epochs + 1)), "STAGE": stages,
            })
        elif head == "HYPNO":
            stages = _stages_for(self._n_epochs)
            counted = pd.Series(stages).value_counts()
            self._cache[("HYPNO", "BL")] = pd.DataFrame({
                "TST": [round(float((len(stages) - counted.get("W", 0)) * 0.5), 2)],
                "TIB": [round(float(len(stages) * 0.5), 2)],
            })
            self._cache[("HYPNO", "SS")] = pd.DataFrame({
                "SS": list(counted.index),
                "MINS": [float(v) * 0.5 for v in counted.values],
            })
        elif head == "PSD":
            rows = []
            for ch, _unit, _sr in _CHANNELS[:2]:
                freqs, psd = _spectrum(ch)
                for f, p in zip(freqs, psd):
                    rows.append({"CH": ch, "F": float(f), "PSD": float(p)})
            self._cache[("PSD", "CH_F")] = pd.DataFrame(rows)
        else:
            raise ValueError(
                "this stand-in does not know the command '" + head + "'. "
                "It understands EPOCH, STAGE, HYPNO and PSD."
            )
        return list(self._cache.keys())

    def table(self, cmd, strata="BL"):
        key = (cmd.strip().upper(), strata)
        if key not in self._cache:
            raise KeyError(
                "no table " + str(key) + " — run inst.eval(\"" + cmd + "\") first, "
                "and check the strata name."
            )
        return self._cache[key].copy()

    def _require_edf(self):
        if self._edf is None:
            raise RuntimeError("no recording attached — call attach_edf() first")


class _Proj:
    def __init__(self):
        self._insts = {}

    def inst(self, ident):
        if ident not in self._insts:
            self._insts[ident] = _Inst(ident)
        return self._insts[ident]


def proj(verbose=False):
    """Create (or return) the project. Mirrors lunapi's lp.proj()."""
    return _Proj()


def hypno(stages, e=None, xsize=20, ysize=2, title=None):
    """Plot a hypnogram from a list of stage names."""
    import matplotlib.pyplot as plt
    order = ["N3", "N2", "N1", "R", "W"]
    y = [order.index(s) if s in order else 4 for s in stages]
    fig, ax = plt.subplots(figsize=(xsize / 2.0, ysize))
    ax.step(range(len(y)), y, where="post")
    ax.set_yticks(range(len(order)))
    ax.set_yticklabels(order)
    ax.set_xlabel("Epoch")
    if title:
        ax.set_title(title)
    return ax
`;
/* LUNA_DEMO_SOURCE_END */
