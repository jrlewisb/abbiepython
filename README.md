# Python, from scratch — a workbook for Abbie

Open **`Python-Workbook.html`** in any browser (double-click it). That's the whole
installation procedure until chapter 20.

## What it is

A linear course of short lessons and graded exercises. A real Python interpreter
(Pyodide — CPython compiled to WebAssembly) is downloaded into the browser tab the first
time the page opens, so the code she writes genuinely runs. Every exercise has hidden
checks; **Run** reports each one as pass or fail with a plain-English reason. Progress and
her code are saved in the browser's local storage, so closing the tab loses nothing.

Needs an internet connection the first time (≈10 MB download for Python itself, plus more
later when NumPy and pandas appear). After that the browser caches it.

## Layout

```
Python-Workbook.html   the page she opens
app/style.css          styling
app/editor.js          the little code editor (highlighting, auto-indent, line numbers)
app/engine.js          Pyodide boot, running code, grading, navigation, progress
lessons/chNN.js        one file per chapter — this is where the content lives
tools/check-lessons.js offline sanity check (see below)
tools/runner.py        helper used by that check
```

## Adding or editing a chapter

Each `lessons/chNN.js` calls `WB.chapter({...})` with a list of steps. A step is:

```js
{
  title:   "Naming things",
  prose:   `<p>HTML explanation…</p>`,
  starter: "code the editor opens with",     // omit for a pure reading step
  task:    `<p>what she has to do</p>`,      // shows in the green "Your turn" box
  hint:    `shown behind the Hint button`,
  solution:"a reference answer",             // behind a confirm dialog
  checks: [                                  // omit and the step is just "read and run"
    { label: "shown to her", test: function (c) { return true; } }
  ]
}
```

A `test` returns `true` to pass, or a **string** explaining what went wrong — that string is
shown under the failed check, so make it useful.

The context `c` gives you:

| | |
|---|---|
| `c.out` | everything printed, trimmed |
| `c.outLines` | printed output as trimmed non-empty lines |
| `c.error` | the traceback, or `null` |
| `c.get("x")` | the value of a variable after her code ran, or `undefined` |
| `c.py("f(3)")` | evaluate any Python expression in her namespace — this is how you test a function she wrote |
| `c.code` | her source, for checks like "did she actually use a loop" |
| `c.rerun(modifiedSource)` | run a changed copy of her code in a fresh namespace — this is how you catch hard-coded answers |
| `c.figures` | base64 PNGs of any matplotlib figures |

New chapter files must be added as a `<script>` tag at the bottom of
`Python-Workbook.html`, in order.

## Before shipping a change

```
node tools/check-lessons.js
```

Runs every step's reference solution through its own checks with the local CPython, and
also asserts the starter code *fails* — so a task can't be accidentally already-solved.
Exits non-zero on any problem.

## Deploying it

The whole thing is static files with no build step and no backend, so any static host works.
**GitHub Pages is the easiest**, and it gives you a push-to-deploy loop for free:

```bash
cd /Users/josh/abbiepython
git init && git add -A && git commit -m "Python workbook"
gh repo create abbiepython --public --source=. --push     # or create it on github.com
```

Then Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
A minute later it is live at `https://<your-username>.github.io/abbiepython/Python-Workbook.html`.

To make the URL nicer, symlink or copy `Python-Workbook.html` to `index.html` and the address
becomes just `https://<your-username>.github.io/abbiepython/`.

After that, every `git push` is a deploy. She bookmarks the URL once and refreshes.

**Do not** ask her to clone the repo and `git pull` — that is a terminal, a git install and a
mental model of branches, all before she has printed "hello". Send a link.

### What to know before she starts

- **Pages needs a public repo** unless you have GitHub Pro. Nothing here is sensitive.
- **Pick the URL once and keep it.** Progress is stored in her browser against the exact
  origin, so `file://`, `username.github.io` and a custom domain each have their own separate
  save. Moving the site later means she starts from zero.
- **Serving over https is better than opening the file directly** — no `file://` quirks, and
  Pyodide's downloads are cleanly cached by the browser.
- GitHub Pages caches assets for about ten minutes, so a push can take that long to reach
  her. If she needs an update immediately: Cmd/Ctrl + Shift + R.

### How progress is saved

In `localStorage`, under the key `abbie-python-workbook-v1`, on whatever origin the page is
served from. It holds two things: which step ids are ticked, and the code she has typed into
every step. There is no account and no server — which means:

- It survives closing the tab, quitting the browser, and every deploy you make.
- It is **per browser and per device**. Chrome on her laptop and Safari on her iPad are two
  separate save files.
- Clearing site data or "clear browsing history including cookies and site data" wipes it.
  Worth telling her once.
- You cannot see her progress from your end. If you want to know how she is going, ask her.

### Step ids, and what happens when a question changes

Progress is keyed on `<step id>@<content hash>`.

The **id** is written explicitly in the lesson file (`ch02-label-on-box`) rather than generated
from position, so inserting or reordering steps never shifts her ticks onto the wrong lessons.
Don't change an id once she has started — a changed id reads as a step she has never seen.

The **hash** covers the parts that decide whether a past pass still counts: the task wording,
the starter code, and the source of every check. So if you rewrite a question or tighten its
grading, the key changes, the step comes back unticked, and she does it again against the new
version. Prose is deliberately *not* hashed — fixing a typo in an explanation should not wipe
her tick.

Her typed code is stored under the plain id, so a question edit never destroys what she wrote.
The old code stays in the editor for her to adapt, and "Reset code" is there if it is no longer
relevant.

Superseded keys are left in place rather than pruned. They are a few bytes each, and pruning
would risk wiping real progress if a lesson file happened to 404 mid-deploy.

`node tools/check-lessons.js` fails if an id is missing or duplicated.

### What the offline checker cannot catch

`tools/check-lessons.js` runs the lessons against the CPython on this machine, which is the
right way to verify the exercises but is *not* the environment Abbie uses. Anything specific to
Pyodide-in-a-browser has to be checked by loading the deployed page and running code in it.

One real example, found that way: Pyodide's `setStdout({ batched })` strips the newline from
every chunk, so multi-line output arrived concatenated and line-by-line checks all failed —
while the offline checker passed 37/37. The engine now uses the byte-level `write` handler
instead. If you touch stdout handling, test it in a browser, not here.

## Letting Claude push (autonomous loop)

Claude can write files into this folder but has no network and no credentials —
`device_bash` is an isolated Linux VM with the folder mounted, not your Mac. So the push
runs on your side instead, and your GitHub credentials never leave your machine.

**One-time setup.** In a terminal tab you leave open:

```bash
cd /Users/josh/abbiepython
./tools/claude-push.sh
```

It polls every five seconds. When Claude writes `.claude-push-request` (containing a commit
message), the script commits everything, pushes to the **`claude/work`** branch, and writes
`.claude-push-result` so Claude can see whether it worked. All three files are gitignored.

**Why a work branch and not main.** GitHub Pages serves `main`, which is what Abbie is
reading. `.github/workflows/promote.yml` runs the full Playwright suite against
`claude/work` and fast-forwards `main` only if it passes. So Claude can work unattended
without a broken build reaching her — which has already happened once, when three
Pyodide-only bugs shipped to the live site.

If main has moved on independently, promotion stops and asks you to merge by hand rather
than clobbering your work.

To stop the loop, Ctrl-C the script. Nothing is pushed while it is not running; requests
just queue up in the file.
