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

    /* Use the byte-level writer, NOT { batched: ... }. The batched callback
       strips the trailing newline from every chunk, so multi-line output comes
       back concatenated ("onetwo three2026") and every check that looks at
       individual lines fails. Only shows up in a real browser — the offline
       lesson checker runs CPython directly and never sees it. */
    var outDecoder = new TextDecoder();
    var errDecoder = new TextDecoder();
    pyodide.setStdout({
      write: function (buf) {
        stdoutBuf.push(outDecoder.decode(buf, { stream: true }));
        return buf.length;
      }
    });
    pyodide.setStderr({
      write: function (buf) {
        stderrBuf.push(errDecoder.decode(buf, { stream: true }));
        return buf.length;
      }
    });
    pyodide.runPython("import os; os.environ['MPLBACKEND'] = 'AGG'");

    /* Chapter 20's Luna stand-in, dropped in as a real importable module. */
    if (window.LUNA_DEMO_SOURCE) {
      try {
        try { pyodide.FS.mkdir("/wb"); } catch (e) { /* already there */ }
        pyodide.FS.writeFile("/wb/lunapi_demo.py", window.LUNA_DEMO_SOURCE);
        pyodide.runPython("import sys\nif '/wb' not in sys.path: sys.path.insert(0, '/wb')");
      } catch (e) { /* the chapter will say so if the import fails */ }
    }
  }

  function flushStreams() {
    try { pyodide.runPython("import sys; sys.stdout.flush(); sys.stderr.flush()"); }
    catch (e) { /* nothing buffered */ }
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

  /* Pyodide prefixes every traceback with three frames from its own
     _base.py. Showing those to a beginner is cruel and teaches the wrong
     reading habit, so keep the header, then everything from the first frame
     in her own code onward, with the meaningless File "<exec>" removed. */
  function cleanTraceback(msg) {
    var raw = String(msg).replace(/\s+$/, "").split("\n");
    var start = -1;
    for (var i = 0; i < raw.length; i++) {
      if (raw[i].indexOf('File "<exec>"') >= 0) { start = i; break; }
    }
    var body = start >= 0 ? raw.slice(start) : raw.filter(function (l) {
      return l.indexOf("/lib/python") < 0 && l.indexOf("_pyodide") < 0;
    });
    var out = body.map(function (l) {
      return l.replace('File "<exec>", ', "").replace('File "<exec>"', "line");
    });
    if (/^Traceback/.test(raw[0]) && start >= 0) { out.unshift(raw[0]); }
    return out.join("\n").trim();
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
      // importing the Luna stand-in pulls in numpy/pandas indirectly, which
      // loadPackagesFromImports cannot see from the source alone
      if (/lunapi_demo/.test(code)) {
        await pyodide.loadPackage(["numpy", "pandas", "matplotlib"]);
      }
      await pyodide.loadPackagesFromImports(code);
    } catch (e) { /* a bad import will surface properly below */ }

    try {
      await pyodide.runPythonAsync(code, { globals: ns });
    } catch (e) {
      result.error = cleanTraceback(e.message || String(e));
    }

    flushStreams();
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
    /* Pyodide converts Python None to JavaScript undefined, which is also what
       a missing variable looks like. Checks need to tell those apart, so a
       variable that exists and holds None comes back as null — matching what
       the offline checker returns for the same code. */
    function hasName(name) {
      try { return !!pyodide.runPython("'" + name + "' in globals()", { globals: ns }); }
      catch (e) { return false; }
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
      get: function (name) {
        try {
          var v = py(name);
          if (v === undefined && hasName(name)) { return null; }
          return v;
        } catch (e) { return undefined; }
      },
      has: hasName,
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
        flushStreams();
        var captured = stdoutBuf.join("");
        stdoutBuf = saved;
        function subPy(expr) {
          return toJs(pyodide.runPython(expr, { globals: ns2 }));
        }
        var sub = {
          error: err,
          stdout: captured,
          out: norm(captured),
          outLines: lines(captured),
          py: subPy,
          tryPy: function (expr) { try { return subPy(expr); } catch (e) { return undefined; } },
          get: function (name) {
            try {
              var v = toJs(pyodide.runPython(name, { globals: ns2 }));
              if (v === undefined) {
                var there = pyodide.runPython("'" + name + "' in globals()", { globals: ns2 });
                if (there) { return null; }
              }
              return v;
            } catch (e) { return undefined; }
          }
        };
        return sub;
      }
    };
  }

  /* Run a step's checks against a completed run. Used by the UI and by the
     browser test suite, so the two can never disagree about what passing means. */
  function evaluateChecks(step, run) {
    var ctx = run.ns ? makeCtx(run) : null;
    return (step.checks || []).map(function (c) {
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
      return { label: c.label, ok: ok, why: why || c.why || "" };
    });
  }

  /* ---------- flatten the curriculum ---------- */

  var FLAT = [];   // every step in order

  /* A step's progress key is its stable id plus a hash of the parts that decide
     whether a past pass still counts: the task wording, the starter code, and
     the checks themselves (a function's source changes when the check changes).
     Prose is deliberately excluded — fixing a typo should not wipe her tick.
     Change the question and the key changes, so the step comes back unticked
     and she does it again against the new version. Her typed code is stored
     under the plain id, so she never loses what she wrote. */
  function hashStep(step) {
    var parts = [
      step.task || "",
      step.starter || "",
      (step.checks || []).map(function (c) {
        return c.label + "|" + String(c.test);
      }).join("~")
    ].join("\u0000");
    var h = 2166136261;
    for (var i = 0; i < parts.length; i++) {
      h ^= parts.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(36);
  }

  function buildIndex() {
    FLAT = [];
    CHAPTERS.forEach(function (ch, ci) {
      ch.index = ci;
      (ch.steps || []).forEach(function (st, si) {
        st.chapter = ch;
        st.n = si + 1;
        st.id = st.id || (ch.id + "-" + (si + 1));
        st.key = st.id + "@" + hashStep(st);
        st.flat = FLAT.length;
        FLAT.push(st);
      });
    });
  }

  function chapterDone(ch) {
    return (ch.steps || []).every(function (s) { return state.done[s.key]; });
  }
  function chapterCount(ch) {
    var d = 0;
    (ch.steps || []).forEach(function (s) { if (state.done[s.key]) { d++; } });
    return d;
  }

  /* ---------- sidebar ---------- */

  var current = null;

  function renderSidebar() {
    var sb = $("#sidebar");
    sb.innerHTML = "";

    var totalDone = 0;
    FLAT.forEach(function (s) { if (state.done[s.key]) { totalDone++; } });
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
          '<span class="tick">' + (state.done[st.key] ? "✓" : "") + "</span>" +
          "<span>" + st.title + "</span>" +
          (st.checks ? '<span class="kind">' + (st.kind || "task") + "</span>" : ""));
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
          var results = evaluateChecks(step, run);
          var ul2 = $("ul", checksBox);
          ul2.innerHTML = "";
          var allPass = true;
          results.forEach(function (r) {
            if (!r.ok) { allPass = false; }
            var li = el("li", r.ok ? "pass" : "fail",
              '<span class="mark">' + (r.ok ? "✓" : "✕") + "</span><span>" + r.label +
              (!r.ok && r.why ? '<span class="why">' + r.why + "</span>" : "") +
              "</span>");
            ul2.appendChild(li);
          });

          if (allPass) {
            verdict.className = "verdict ok";
            verdict.textContent = "All checks passed. On you go.";
            if (!state.done[step.key]) {
              state.done[step.key] = true;
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

    /* ---------- optional further reading ---------- */

    if (step.reading && step.reading.length) {
      var box = el("details", "reading");
      var sum = el("summary", null, "Want to read more about this? (optional)");
      box.appendChild(sum);
      var inner = el("div", "inner");
      var ul3 = el("ul");
      step.reading.forEach(function (r) {
        var li = el("li");
        var a = el("a", null, escapeHtml(r.title));
        a.href = r.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        li.appendChild(a);
        li.appendChild(el("span", "ext", " \u2197"));
        if (r.note) { li.appendChild(el("span", "why", r.note)); }
        ul3.appendChild(li);
      });
      inner.appendChild(ul3);
      box.appendChild(inner);
      main.appendChild(box);
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
        state.done[step.key] = true;
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

  /* ---------- cheatsheet drawer ---------- */

  var SHEET_KEY = "abbie-python-cheatsheet-open";

  function buildCheatsheet() {
    var data = window.CHEATSHEET || [];
    if (!data.length) { return; }

    var toggle = el("button", null, "Cheatsheet<span class='k'>?</span>");
    toggle.id = "sheet-toggle";
    document.body.appendChild(toggle);

    var sheet = el("div", null,
      '<div class="head">' +
        '<div class="row"><h2>Cheatsheet</h2><button class="close" title="Close">\u00d7</button></div>' +
        '<div class="hint">Every entry links back to where it was taught.</div>' +
        '<input class="filter" type="search" placeholder="Filter — try “loop”, “dict”, “axis”">' +
      '</div><div class="body"></div>');
    sheet.id = "sheet";
    document.body.appendChild(sheet);

    var body = $(".body", sheet);
    var filter = $("input.filter", sheet);

    data.forEach(function (section) {
      var sec = el("div", "sec");
      sec.appendChild(el("h3", null, section.title));
      if (section.note) { sec.appendChild(el("p", "secnote", section.note)); }
      (section.items || []).forEach(function (item) {
        var row = el("div", "item");
        var pre = el("pre", null, window.PyEditor.highlight(item.code));
        row.appendChild(pre);
        if (item.note) { row.appendChild(el("span", "n", item.note)); }
        if (item.at) {
          var chap = (item.at.match(/^ch(\d+)/) || [])[1];
          var link = el("a", "at", "chapter " + (chap ? parseInt(chap, 10) : "?") + " \u2197");
          link.href = "#" + item.at;
          link.addEventListener("click", function () { setOpen(false); });
          row.appendChild(document.createTextNode(" "));
          row.appendChild(link);
        }
        row.dataset.hay = ((item.code || "") + " " + (item.note || "") + " " +
          section.title).toLowerCase();
        sec.appendChild(row);
      });
      body.appendChild(sec);
    });

    var noMatch = el("div", "empty", "Nothing matches that.");
    noMatch.style.display = "none";
    body.appendChild(noMatch);

    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      var anyShown = false;
      Array.prototype.forEach.call(body.querySelectorAll(".sec"), function (sec) {
        var shown = 0;
        Array.prototype.forEach.call(sec.querySelectorAll(".item"), function (item) {
          var hit = !q || item.dataset.hay.indexOf(q) >= 0;
          item.classList.toggle("hidden", !hit);
          if (hit) { shown++; }
        });
        sec.classList.toggle("hidden", shown === 0);
        if (shown) { anyShown = true; }
      });
      noMatch.style.display = anyShown ? "none" : "block";
    });

    function setOpen(open) {
      sheet.classList.toggle("open", open);
      toggle.textContent = open ? "Close" : "Cheatsheet";
      if (!open) { toggle.innerHTML = "Cheatsheet<span class='k'>?</span>"; }
      try { localStorage.setItem(SHEET_KEY, open ? "1" : "0"); } catch (e) { /* ignore */ }
      if (open) { filter.focus(); }
    }

    toggle.addEventListener("click", function () { setOpen(!sheet.classList.contains("open")); });
    $(".close", sheet).addEventListener("click", function () { setOpen(false); });

    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || "");
      if (e.key === "Escape" && sheet.classList.contains("open")) { setOpen(false); return; }
      if (e.key === "?" && !typing) { e.preventDefault(); setOpen(!sheet.classList.contains("open")); }
    });

    try {
      if (localStorage.getItem(SHEET_KEY) === "1") { setOpen(true); }
    } catch (e) { /* ignore */ }
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
    buildCheatsheet();

    /* Hook for the Playwright suite. It drives the real interpreter and the
       real checks rather than clicking through every step. Nothing in the app
       reads this, and it is inert unless a test calls it. */
    window.__workbook = {
      steps: FLAT.map(function (st) {
        return { id: st.id, key: st.key, title: st.title, chapter: st.chapter.id,
                 graded: !!st.checks, hasSolution: !!st.solution,
                 starter: st.starter || "", solution: st.solution || "" };
      }),
      run: async function (code) {
        var r = await runCode(code);
        var o = { stdout: r.stdout, stderr: r.stderr, error: r.error };
        if (r.ns && r.ns.destroy) { try { r.ns.destroy(); } catch (e) { /* ignore */ } }
        return o;
      },
      grade: async function (stepId, code) {
        var step = null;
        for (var i = 0; i < FLAT.length; i++) {
          if (FLAT[i].id === stepId) { step = FLAT[i]; break; }
        }
        if (!step) { throw new Error("no such step: " + stepId); }
        var src = code == null ? (step.starter || "") : code;
        var r = await runCode(src);
        r.code = src;
        var results = evaluateChecks(step, r);
        if (r.ns && r.ns.destroy) { try { r.ns.destroy(); } catch (e) { /* ignore */ } }
        return { stdout: r.stdout, error: r.error, checks: results };
      }
    };
    var i = stepFromHash();
    if (i < 0) {
      // resume where she left off: first step not yet ticked
      i = 0;
      for (var k = 0; k < FLAT.length; k++) {
        if (!state.done[FLAT[k].key]) { i = k; break; }
      }
    }
    go(i);
  }

  window.addEventListener("DOMContentLoaded", main);
})();
