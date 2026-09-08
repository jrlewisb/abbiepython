/* ---------------------------------------------------------------
   Abbie's Python Workbook — engine
   Loads a real Python interpreter (Pyodide) into the page, runs the
   learner's code in a fresh namespace, and grades it against the
   checks each step declares.
   --------------------------------------------------------------- */
(function () {
  "use strict";

  /* ---------- curriculum registration ---------- */

  var CHAPTERS = [];
  window.WB = {
    chapter: function (def) { CHAPTERS.push(def); }
  };

  /* ---------- tiny helpers ---------- */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (html != null) { n.innerHTML = html; }
    return n;
  };

  function norm(s) { return String(s == null ? "" : s).replace(/\r/g, "").trim(); }
  function lines(s) {
    return norm(s).split("\n").map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 0; });
  }

  /* ---------- progress ---------- */

  var KEY = "abbie-python-workbook-v1";
  var state = { done: {}, code: {} };

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        state.done = p.done || {};
        state.code = p.code || {};
      }
    } catch (e) { /* private browsing, whatever — carry on in memory */ }
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------- python ---------- */

  var pyodide = null;
  var stdoutBuf = [];
  var stderrBuf = [];

  var PYODIDE_SOURCES = [
    "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
    "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/",
    "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
  ];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("could not load " + src)); };
      document.head.appendChild(s);
    });
  }

  async function bootPython(onStatus) {
    var lastErr = null;
    for (var i = 0; i < PYODIDE_SOURCES.length; i++) {
      var base = PYODIDE_SOURCES[i];
      try {
        onStatus("Downloading Python… (" + (i + 1) + ")");
        if (!window.loadPyodide) { await loadScript(base + "pyodide.js"); }
        pyodide = await window.loadPyodide({ indexURL: base });
        break;
      } catch (e) {
        lastErr = e;
        pyodide = null;
        try { delete window.loadPyodide; } catch (e2) { window.loadPyodide = undefined; }
      }
    }
    if (!pyodide) { throw lastErr || new Error("Python could not be loaded"); }

    pyodide.setStdout({ batched: function (s) { stdoutBuf.push(s); } });
    pyodide.setStderr({ batched: function (s) { stderrBuf.push(s); } });
    pyodide.runPython("import os; os.environ['MPLBACKEND'] = 'AGG'");
  }

  function toJs(v) {
    if (v && typeof v.toJs === "function") {
      var out;
      try { out = v.toJs({ dict_converter: Object.fromEntries }); }
      catch (e) { out = String(v); }
      try { if (v.destroy) { v.destroy(); } } catch (e2) { /* ignore */ }
      return out;
    }
    return v;
  }

  function cleanTraceback(msg) {
    var keep = [];
    String(msg).split("\n").forEach(function (l) {
      if (/File "\/lib\/python/.test(l)) { return; }
      if (/pyodide\/_pyodide/.test(l)) { return; }
      if (/^\s*File "<exec>"/.test(l)) { l = l.replace('File "<exec>", ', ""); }
      keep.push(l);
    });
    return keep.join("\n").trim();
  }

  var PLOT_SNIPPET = [
    "def _wb_figs():",
    "    import sys",
    "    if 'matplotlib' not in sys.modules:",
    "        return []",
    "    import io as _io, base64 as _b64",
    "    import matplotlib.pyplot as _plt",
    "    out = []",
    "    for _n in _plt.get_fignums():",
    "        _f = _plt.figure(_n)",
    "        _b = _io.BytesIO()",
    "        _f.savefig(_b, format='png', dpi=110, bbox_inches='tight')",
    "        out.append(_b64.b64encode(_b.getvalue()).decode())",
    "    _plt.close('all')",
    "    return out"
  ].join("\n");

  var plotHelperReady = false;

  async function runCode(code) {
    stdoutBuf = [];
    stderrBuf = [];
    var result = { stdout: "", stderr: "", error: null, figures: [], ns: null };

    var ns = pyodide.runPython("dict()");
    result.ns = ns;

    try {
      await pyodide.loadPackagesFromImports(code);
    } catch (e) { /* a bad import will surface properly below */ }

    try {
      await pyodide.runPythonAsync(code, { globals: ns });
    } catch (e) {
      result.error = cleanTraceback(e.message || String(e));
    }

    result.stdout = stdoutBuf.join("");
    result.stderr = stderrBuf.join("");

    try {
      if (!plotHelperReady) { pyodide.runPython(PLOT_SNIPPET); plotHelperReady = true; }
      var figs = toJs(pyodide.runPython("_wb_figs()"));
      if (figs && figs.length) { result.figures = figs; }
    } catch (e) { /* no matplotlib in play */ }

    return result;
  }

  function makeCtx(run) {
    var ns = run.ns;
    function py(expr) {
      return toJs(pyodide.runPython(expr, { globals: ns }));
    }
    return {
      stdout: run.stdout,
      out: norm(run.stdout),
      outLines: lines(run.stdout),
      stderr: run.stderr,
      error: run.error,
      figures: run.figures,
      code: run.code,
      py: py,
      tryPy: function (expr) { try { return py(expr); } catch (e) { return undefined; } },
      get: function (name) { try { return py(name); } catch (e) { return undefined; } },
      has: function (name) {
        try { return !!pyodide.runPython("'" + name + "' in globals()", { globals: ns }); }
        catch (e) { return false; }
      },
      printed: function (what) { return lines(run.stdout).indexOf(String(what).trim()) >= 0; },
      codeHas: function (re) { return re instanceof RegExp ? re.test(run.code) : run.code.indexOf(re) >= 0; },
      /* Re-run a modified copy of her code in a brand new namespace.
         This is how a check proves the answer was calculated rather than
         typed in: change an input, and see whether the output follows. */
      rerun: function (codeText) {
        var saved = stdoutBuf;
        stdoutBuf = [];
        var ns2 = pyodide.runPython("dict()");
        var err = null;
        try { pyodide.runPython(codeText, { globals: ns2 }); }
        catch (e) { err = cleanTraceback(e.message || String(e)); }
        var captured = stdoutBuf.join("");
        stdoutBuf = saved;
        var sub = {
          error: err,
          stdout: captured,
          out: norm(captured),
          outLines: lines(captured),
          get: function (name) {
            try { return toJs(pyodide.runPython(name, { globals: ns2 })); }
            catch (e) { return undefined; }
          }
        };
        return sub;
      }
    };
  }

  /* ---------- flatten the curriculum ---------- */

  var FLAT = [];   // every step in order
  function buildIndex() {
    FLAT = [];
    CHAPTERS.forEach(function (ch, ci) {
      ch.index = ci;
      (ch.steps || []).forEach(function (st, si) {
        st.chapter = ch;
        st.n = si + 1;
        st.id = st.id || (ch.id + "-" + (si + 1));
        st.flat = FLAT.length;
        FLAT.push(st);
      });
    });
  }

  function chapterDone(ch) {
    return (ch.steps || []).every(function (s) { return state.done[s.id]; });
  }
  function chapterCount(ch) {
    var d = 0;
    (ch.steps || []).forEach(function (s) { if (state.done[s.id]) { d++; } });
    return d;
  }

  /* ---------- sidebar ---------- */

  var current = null;

  function renderSidebar() {
    var sb = $("#sidebar");
    sb.innerHTML = "";

    var totalDone = 0;
    FLAT.forEach(function (s) { if (state.done[s.id]) { totalDone++; } });
    var pct = FLAT.length ? Math.round((totalDone / FLAT.length) * 100) : 0;

    var brand = el("div", "brand",
      "<h1>Python, from scratch</h1>" +
      '<div class="sub">' + totalDone + " of " + FLAT.length + " steps done · " + pct + "%</div>" +
      '<div class="overall"><i style="width:' + pct + '%"></i></div>');
    sb.appendChild(brand);

    var lastPart = null;
    CHAPTERS.forEach(function (ch) {
      if (ch.part !== lastPart) {
        lastPart = ch.part;
        sb.appendChild(el("div", "part-label", ch.part));
      }
      var wrap = el("div", "chap");
      if (chapterDone(ch)) { wrap.classList.add("done"); }
      if (current && current.chapter === ch) { wrap.classList.add("open"); }

      var head = el("button", null,
        '<span class="num">' + (ch.index + 1) + "</span>" +
        '<span class="ttl">' + ch.title + "</span>" +
        '<span class="tally">' + chapterCount(ch) + "/" + (ch.steps || []).length + "</span>");
      head.addEventListener("click", function () { wrap.classList.toggle("open"); });
      wrap.appendChild(head);

      var steps = el("div", "steps");
      (ch.steps || []).forEach(function (st) {
        var b = el("button", null,
          '<span class="tick">' + (state.done[st.id] ? "✓" : "") + "</span>" +
          "<span>" + st.title + "</span>" +
          (st.checks ? '<span class="kind">task</span>' : ""));
        if (current === st) { b.classList.add("current"); }
        b.addEventListener("click", function () { go(st.flat); });
        steps.appendChild(b);
      });
      wrap.appendChild(steps);
      sb.appendChild(wrap);
    });

    var reset = el("div", "part-label");
    var rb = el("button", "ghost", "Start over");
    rb.style.cssText = "margin:8px 20px 0;font-size:12px;padding:5px 10px;";
    rb.addEventListener("click", function () {
      if (confirm("This clears every tick and every bit of code you have written. Sure?")) {
        state = { done: {}, code: {} };
        saveState();
        go(0);
      }
    });
    sb.appendChild(reset);
    sb.appendChild(rb);
  }

  /* ---------- step rendering ---------- */

  function renderStep(step) {
    var main = $("#main-inner");
    main.innerHTML = "";

    main.appendChild(el("div", "crumb",
      "Chapter " + (step.chapter.index + 1) + " · " + step.chapter.title +
      " · step " + step.n + " of " + step.chapter.steps.length));
    main.appendChild(el("h2", "step-title", step.title));

    var prose = el("div", "prose", step.prose || "");
    main.appendChild(prose);
    wireOsTabs(prose);
    // colour the example snippets the same way the editor does
    Array.prototype.forEach.call(prose.querySelectorAll("pre > code"), function (node) {
      node.innerHTML = window.PyEditor.highlight(node.textContent);
    });

    var editor = null;
    var checksBox = null;
    var verdict = null;
    var outBox = null;

    if (step.starter != null || step.checks) {
      if (step.task) {
        main.appendChild(el("div", "task",
          '<span class="lbl">Your turn</span>' + step.task));
      }

      var wrap = el("div", "editor-wrap");
      var bar = el("div", "editor-bar",
        "<span>python</span><span class='spacer'></span>");
      var resetBtn = el("button", null, "Reset code");
      resetBtn.addEventListener("click", function () {
        editor.setValue(step.starter || "");
        delete state.code[step.id];
        saveState();
      });
      bar.appendChild(resetBtn);
      if (step.solution) {
        var solBtn = el("button", null, "Show me one answer");
        solBtn.addEventListener("click", function () {
          if (confirm("Have a proper go first — peeking is how you end up copying instead of learning. Show it anyway?")) {
            editor.setValue(step.solution);
          }
        });
        bar.appendChild(solBtn);
      }
      wrap.appendChild(bar);
      main.appendChild(wrap);

      editor = window.PyEditor.make(wrap, {
        value: state.code[step.id] != null ? state.code[step.id] : (step.starter || ""),
        onChange: function (v) { state.code[step.id] = v; saveState(); },
        onRun: function () { doRun(); }
      });

      var row = el("div", "runrow");
      var runBtn = el("button", "primary", "Run ▶");
      row.appendChild(runBtn);
      if (step.hint) {
        var hintBtn = el("button", "ghost", "Hint");
        var hintNode = el("div", "note warn", '<span class="lbl">Hint</span>' + step.hint);
        hintNode.style.display = "none";
        hintBtn.addEventListener("click", function () {
          hintNode.style.display = hintNode.style.display === "none" ? "block" : "none";
        });
        row.appendChild(hintBtn);
        main.appendChild(row);
        main.appendChild(hintNode);
      } else {
        main.appendChild(row);
      }
      row.appendChild(el("span", "hintmsg", "or press " +
        (navigator.platform.indexOf("Mac") >= 0 ? "⌘" : "Ctrl") + "+Enter"));

      outBox = el("div", "outbox",
        '<div class="head">Output</div><pre class="empty">Nothing yet — press Run.</pre>');
      main.appendChild(outBox);

      if (step.checks) {
        verdict = el("div", "verdict");
        checksBox = el("div", "checks",
          '<div class="head">Checks</div><ul></ul>');
        var ul = $("ul", checksBox);
        step.checks.forEach(function (c) {
          ul.appendChild(el("li", "idle", '<span class="mark">·</span><span>' + c.label + "</span>"));
        });
        main.appendChild(checksBox);
        main.appendChild(verdict);
      }

      var doRun = async function () {
        runBtn.disabled = true;
        runBtn.textContent = "Running…";
        var code = editor.getValue();
        var run;
        try {
          run = await runCode(code);
        } catch (e) {
          run = { stdout: "", stderr: "", error: String(e), figures: [], ns: null };
        }
        run.code = code;

        // ---- output pane
        var body = "";
        if (run.stdout) { body += run.stdout; }
        if (run.stderr) { body += run.stderr; }
        outBox.innerHTML = '<div class="head">Output</div>';
        if (run.error) {
          if (body) { outBox.appendChild(el("pre", null, escapeHtml(body))); }
          outBox.appendChild(el("pre", "err", escapeHtml(run.error)));
        } else if (body) {
          outBox.appendChild(el("pre", null, escapeHtml(body)));
        } else if (!run.figures.length) {
          outBox.appendChild(el("pre", "empty", "Your code ran without errors, but it did not print anything."));
        }
        run.figures.forEach(function (b64) {
          var img = new Image();
          img.src = "data:image/png;base64," + b64;
          outBox.appendChild(img);
        });

        // ---- checks
        if (step.checks) {
          var ctx = run.ns ? makeCtx(run) : null;
          var ul2 = $("ul", checksBox);
          ul2.innerHTML = "";
          var allPass = true;
          step.checks.forEach(function (c) {
            var ok = false, why = "";
            if (!ctx) {
              why = "Your code could not run at all.";
            } else {
              try {
                var r = c.test(ctx);
                if (r === true) { ok = true; }
                else if (typeof r === "string") { why = r; }
                else { ok = !!r; }
              } catch (e) {
                why = "This check could not run: " + (e.message || e);
              }
            }
            if (!ok) { allPass = false; }
            var li = el("li", ok ? "pass" : "fail",
              '<span class="mark">' + (ok ? "✓" : "✕") + "</span><span>" + c.label +
              (!ok && (why || c.why) ? '<span class="why">' + (why || c.why) + "</span>" : "") +
              "</span>");
            ul2.appendChild(li);
          });

          if (allPass) {
            verdict.className = "verdict ok";
            verdict.textContent = "All checks passed. On you go.";
            if (!state.done[step.id]) {
              state.done[step.id] = true;
              saveState();
              renderSidebar();
            }
          } else {
            verdict.className = "verdict no";
            verdict.textContent = run.error
              ? "Python stopped with an error — read the red text above, it usually names the line."
              : "Not quite yet. Look at the failing check.";
          }
        }

        if (run.ns && run.ns.destroy) { try { run.ns.destroy(); } catch (e) { /* ignore */ } }
        runBtn.disabled = false;
        runBtn.textContent = "Run ▶";
      };

      runBtn.addEventListener("click", doRun);
    }

    /* ---------- footer nav ---------- */

    var nav = el("div", "footnav");
    if (step.flat > 0) {
      var prev = el("button", "ghost", "← Back");
      prev.addEventListener("click", function () { go(step.flat - 1); });
      nav.appendChild(prev);
    }
    nav.appendChild(el("span", "spacer"));

    if (!step.checks) {
      var nxt = el("button", "primary",
        step.flat < FLAT.length - 1 ? "Got it — next →" : "Finish");
      nxt.addEventListener("click", function () {
        state.done[step.id] = true;
        saveState();
        if (step.flat < FLAT.length - 1) { go(step.flat + 1); }
        else { renderSidebar(); }
      });
      nav.appendChild(nxt);
    } else if (step.flat < FLAT.length - 1) {
      var nxt2 = el("button", "ghost", "Next →");
      nxt2.addEventListener("click", function () { go(step.flat + 1); });
      nav.appendChild(nxt2);
    }
    main.appendChild(nav);

    $("#main").scrollTop = 0;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function wireOsTabs(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".ostabs"), function (box) {
      var btns = box.querySelectorAll(".tabrow button");
      var panes = box.querySelectorAll(".body > div");
      Array.prototype.forEach.call(btns, function (b, i) {
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(btns, function (x) { x.classList.remove("on"); });
          Array.prototype.forEach.call(panes, function (x) { x.classList.remove("on"); });
          b.classList.add("on");
          if (panes[i]) { panes[i].classList.add("on"); }
        });
      });
    });
  }

  /* ---------- routing ---------- */

  function go(flatIndex) {
    if (flatIndex < 0 || flatIndex >= FLAT.length) { return; }
    current = FLAT[flatIndex];
    location.hash = current.id;
    renderSidebar();
    renderStep(current);
  }

  function stepFromHash() {
    var h = location.hash.replace("#", "");
    for (var i = 0; i < FLAT.length; i++) { if (FLAT[i].id === h) { return i; } }
    return -1;
  }

  window.addEventListener("hashchange", function () {
    var i = stepFromHash();
    if (i >= 0 && FLAT[i] !== current) { go(i); }
  });

  /* ---------- boot ---------- */

  async function main() {
    loadState();
    buildIndex();
    var boot = $("#boot");
    var status = $("#boot-status");

    try {
      await bootPython(function (msg) { status.textContent = msg; });
    } catch (e) {
      status.innerHTML = '<span class="err">Python could not load. This workbook needs an ' +
        "internet connection the first time you open it (it downloads Python itself). " +
        "Check you are online and refresh the page.<br><br>Technical detail: " +
        escapeHtml(e.message || String(e)) + "</span>";
      $("#boot .bar").style.display = "none";
      return;
    }

    boot.classList.add("hidden");
    var i = stepFromHash();
    if (i < 0) {
      // resume where she left off: first step not yet ticked
      i = 0;
      for (var k = 0; k < FLAT.length; k++) {
        if (!state.done[FLAT[k].id]) { i = k; break; }
      }
    }
    go(i);
  }

  window.addEventListener("DOMContentLoaded", main);
})();
