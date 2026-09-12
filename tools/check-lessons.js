/* Offline sanity check for the workbook.
   Runs every step's reference solution through its own checks using the real
   CPython on this machine, and confirms the starter code does NOT pass.
   Usage:  node tools/check-lessons.js                                       */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PY = process.env.PYTHON || "python3";
const RUNNER = path.join(__dirname, "runner.py");

const CHAPTERS = [];
global.WB = { chapter: (d) => CHAPTERS.push(d) };

fs.readdirSync(path.join(ROOT, "lessons")).sort().forEach((f) => {
  if (f.endsWith(".js")) {
    // eslint-disable-next-line no-eval
    eval(fs.readFileSync(path.join(ROOT, "lessons", f), "utf8"));
  }
});

function pyrun(code, expr) {
  const input = JSON.stringify(expr === undefined ? { code } : { code, expr });
  const raw = execFileSync(PY, [RUNNER], { input, encoding: "utf8" });
  return JSON.parse(raw);
}

// Lessons from chapter 16 import numpy and friends. If they are missing, say so
// once and clearly rather than reporting every exercise as broken.
(function checkImports() {
  const needed = ["numpy", "pandas"];
  const missing = needed.filter((m) => {
    try { return !!pyrun("import " + m).error; } catch (e) { return true; }
  });
  if (missing.length) {
    console.error("\nMissing Python packages the lessons import: " + missing.join(", "));
    console.error("Install them with:  python3 -m pip install " + missing.join(" ") + "\n");
    process.exit(2);
  }
})();

const norm = (s) => String(s == null ? "" : s).replace(/\r/g, "").trim();
const lines = (s) => norm(s).split("\n").map((l) => l.trim()).filter((l) => l.length);

function makeCtx(code) {
  const base = pyrun(code);
  const get = (name) => {
    const r = pyrun(code, name);
    return r.ok ? r.value : undefined;
  };
  return {
    code,
    stdout: base.stdout,
    out: norm(base.stdout),
    outLines: lines(base.stdout),
    error: base.error,
    figures: new Array(base.figures || 0).fill(null),
    get,
    py: (expr) => {
      const r = pyrun(code, expr);
      if (!r.ok) { throw new Error("python could not evaluate " + expr); }
      return r.value;
    },
    tryPy: (expr) => { const r = pyrun(code, expr); return r.ok ? r.value : undefined; },
    has: (n) => get(n) !== undefined,
    printed: (w) => lines(base.stdout).indexOf(String(w).trim()) >= 0,
    codeHas: (re) => (re instanceof RegExp ? re.test(code) : code.indexOf(re) >= 0),
    rerun: (codeText) => {
      const r = pyrun(codeText);
      return {
        error: r.error,
        stdout: r.stdout,
        out: norm(r.stdout),
        outLines: lines(r.stdout),
        py: (expr) => {
          const q = pyrun(codeText, expr);
          if (!q.ok) { throw new Error("python could not evaluate " + expr); }
          return q.value;
        },
        tryPy: (expr) => { const q = pyrun(codeText, expr); return q.ok ? q.value : undefined; },
        get: (name) => { const q = pyrun(codeText, name); return q.ok ? q.value : undefined; }
      };
    }
  };
}

function evaluate(step, code) {
  const ctx = makeCtx(code);
  return step.checks.map((c) => {
    let ok = false, why = "";
    try {
      const r = c.test(ctx);
      if (r === true) { ok = true; }
      else if (typeof r === "string") { why = r; }
      else { ok = !!r; }
    } catch (e) { why = "check threw: " + e.message; }
    return { label: c.label, ok, why };
  });
}

let problems = 0, tasks = 0;

// Step ids are the keys her saved progress is stored under. They must be
// explicit and must never change, or her ticks land on the wrong steps.
const seenIds = new Set();
CHAPTERS.forEach((ch) => ch.steps.forEach((st, i) => {
  const where = ch.id + " step " + (i + 1) + " (" + st.title + ")";
  if (!st.id) {
    problems++;
    console.log("  \u2715  " + where + " — NO EXPLICIT id, progress would break if steps move");
  } else if (seenIds.has(st.id)) {
    problems++;
    console.log("  \u2715  " + where + " — DUPLICATE id '" + st.id + "'");
  } else {
    seenIds.add(st.id);
  }
}));

CHAPTERS.forEach((ch) => {
  console.log("\n" + ch.id + "  " + ch.title);
  ch.steps.forEach((st, i) => {
    const id = ch.id + "-" + (i + 1);
    if (!st.checks) { console.log("  ·  " + id + "  " + st.title + "  (read-only)"); return; }
    tasks++;
    if (!st.solution) {
      problems++;
      console.log("  ✕  " + id + "  " + st.title + "  — NO REFERENCE SOLUTION");
      return;
    }
    const solved = evaluate(st, st.solution);
    const failed = solved.filter((r) => !r.ok);
    if (failed.length) {
      problems++;
      console.log("  ✕  " + id + "  " + st.title + "  — solution fails its own checks:");
      failed.forEach((f) => console.log("        · " + f.label + "  → " + (f.why || "returned false")));
    } else {
      // the starter must not already pass, or the task is meaningless
      const starter = evaluate(st, st.starter || "");
      const starterAll = starter.every((r) => r.ok);
      if (starterAll) {
        problems++;
        console.log("  ✕  " + id + "  " + st.title + "  — STARTER CODE ALREADY PASSES");
      } else {
        console.log("  ✓  " + id + "  " + st.title);
      }
    }
  });
});

console.log("\n" + tasks + " graded steps, " + problems + " problem(s).");
process.exit(problems ? 1 : 0);
