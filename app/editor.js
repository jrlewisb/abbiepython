/* ---------------------------------------------------------------
   A very small Python code editor: a textarea with a syntax
   highlighted layer drawn behind it, line numbers, and the
   indentation habits a beginner expects.
   --------------------------------------------------------------- */
(function () {
  "use strict";

  var KEYWORDS = ("False None True and as assert async await break class continue def del " +
    "elif else except finally for from global if import in is lambda nonlocal not or pass " +
    "raise return try while with yield match case").split(" ");
  var BUILTINS = ("abs all any bool dict enumerate filter float format input int len list map " +
    "max min object open print range repr reversed round set sorted str sum tuple type zip " +
    "isinstance range").split(" ");

  var KW = {}, BI = {};
  KEYWORDS.forEach(function (k) { KW[k] = 1; });
  BUILTINS.forEach(function (k) { BI[k] = 1; });

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function span(cls, text) { return '<span class="' + cls + '">' + esc(text) + "</span>"; }

  function highlight(src) {
    var out = "", i = 0, n = src.length;
    while (i < n) {
      var c = src[i];

      // comment
      if (c === "#") {
        var j = src.indexOf("\n", i);
        if (j < 0) { j = n; }
        out += span("tk-com", src.slice(i, j));
        i = j;
        continue;
      }

      // string (triple or single quoted, with prefix letters like f, r, b)
      if (c === '"' || c === "'") {
        var quote = c;
        var triple = src.substr(i, 3) === quote + quote + quote;
        var end;
        if (triple) {
          end = src.indexOf(quote + quote + quote, i + 3);
          end = end < 0 ? n : end + 3;
        } else {
          end = i + 1;
          while (end < n && src[end] !== quote && src[end] !== "\n") {
            if (src[end] === "\\") { end++; }
            end++;
          }
          end = Math.min(end + 1, n);
        }
        out += span("tk-str", src.slice(i, end));
        i = end;
        continue;
      }

      // number
      if (/[0-9]/.test(c)) {
        var k = i;
        while (k < n && /[0-9a-fA-FxX_.]/.test(src[k])) { k++; }
        out += span("tk-num", src.slice(i, k));
        i = k;
        continue;
      }

      // word
      if (/[A-Za-z_]/.test(c)) {
        var w = i;
        while (w < n && /[A-Za-z0-9_]/.test(src[w])) { w++; }
        var word = src.slice(i, w);
        // string prefix such as f"..." — let the string branch colour it
        if ((word === "f" || word === "r" || word === "b" || word === "rf" || word === "fr") &&
            (src[w] === '"' || src[w] === "'")) {
          out += '<span class="tk-str">' + esc(word) + "</span>";
          i = w;
          continue;
        }
        if (KW[word]) { out += span("tk-kw", word); }
        else if (BI[word]) { out += span("tk-bi", word); }
        else if (src[w] === "(") { out += span("tk-fn", word); }
        else { out += esc(word); }
        i = w;
        continue;
      }

      out += esc(c);
      i++;
    }
    return out;
  }

  function lineStart(value, pos) {
    var s = value.lastIndexOf("\n", pos - 1);
    return s + 1;
  }

  function makeEditor(mount, opts) {
    opts = opts || {};
    var ed = document.createElement("div");
    ed.className = "ed";
    ed.innerHTML =
      '<div class="gutter"></div>' +
      '<div class="stack"><pre class="hl" aria-hidden="true"></pre>' +
      '<textarea spellcheck="false" autocapitalize="off" autocorrect="off"></textarea></div>';
    mount.appendChild(ed);

    var gutter = ed.querySelector(".gutter");
    var hl = ed.querySelector("pre.hl");
    var ta = ed.querySelector("textarea");

    function paint() {
      var v = ta.value;
      hl.innerHTML = highlight(v) + "\n";
      var lines = v.split("\n").length;
      var g = "";
      for (var i = 1; i <= lines; i++) { g += i + "\n"; }
      gutter.textContent = g;
      // grow to fit
      ta.style.height = "auto";
      var h = Math.max(150, lines * 22 + 28);
      ta.style.height = h + "px";
      hl.scrollTop = ta.scrollTop;
      hl.scrollLeft = ta.scrollLeft;
      if (opts.onChange) { opts.onChange(v); }
    }

    ta.addEventListener("input", paint);
    ta.addEventListener("scroll", function () {
      hl.scrollTop = ta.scrollTop;
      hl.scrollLeft = ta.scrollLeft;
    });

    ta.addEventListener("keydown", function (e) {
      var v = ta.value, s = ta.selectionStart, t = ta.selectionEnd;

      // Ctrl/Cmd + Enter runs
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (opts.onRun) { opts.onRun(); }
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          var ls = lineStart(v, s);
          var removed = 0;
          if (v.substr(ls, 4) === "    ") { removed = 4; }
          else { while (removed < 4 && v[ls + removed] === " ") { removed++; } }
          if (removed) {
            ta.value = v.slice(0, ls) + v.slice(ls + removed);
            ta.selectionStart = ta.selectionEnd = Math.max(ls, s - removed);
          }
        } else {
          ta.value = v.slice(0, s) + "    " + v.slice(t);
          ta.selectionStart = ta.selectionEnd = s + 4;
        }
        paint();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        var ls2 = lineStart(v, s);
        var line = v.slice(ls2, s);
        var indent = (line.match(/^[ ]*/) || [""])[0];
        if (/:\s*$/.test(line)) { indent += "    "; }
        var insert = "\n" + indent;
        ta.value = v.slice(0, s) + insert + v.slice(t);
        ta.selectionStart = ta.selectionEnd = s + insert.length;
        paint();
        return;
      }

      if (e.key === "Backspace" && s === t) {
        var ls3 = lineStart(v, s);
        var before = v.slice(ls3, s);
        if (before.length >= 4 && /^[ ]+$/.test(before) && before.length % 4 === 0) {
          e.preventDefault();
          ta.value = v.slice(0, s - 4) + v.slice(s);
          ta.selectionStart = ta.selectionEnd = s - 4;
          paint();
        }
      }
    });

    var api = {
      element: ed,
      getValue: function () { return ta.value; },
      setValue: function (v) { ta.value = v == null ? "" : v; paint(); },
      focus: function () { ta.focus(); },
      textarea: ta
    };
    api.setValue(opts.value || "");
    return api;
  }

  window.PyEditor = { make: makeEditor, highlight: highlight };
})();
