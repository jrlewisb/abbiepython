const { test, expect } = require("@playwright/test");

/* ---------------------------------------------------------------------------
   These tests exist because of three real bugs that shipped: multi-line output
   arriving concatenated, tracebacks showing Pyodide's internals, and Python's
   None being indistinguishable from a missing variable. All three passed the
   offline lesson checker, because that runs CPython directly rather than
   Pyodide in a browser. Only a real browser can catch them, so every one of
   them has a named regression test below.
   --------------------------------------------------------------------------- */

async function openWorkbook(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));
  page.on("console", (m) => { if (m.type() === "error") { errors.push(m.text()); } });
  await page.goto("/index.html");
  // Pyodide downloads a real interpreter on first load; CI is cold every time.
  await page.waitForFunction(() => window.__workbook !== undefined, null,
    { timeout: 5 * 60 * 1000 });
  return errors;
}

test.describe("the workbook boots", () => {
  test("the interpreter loads and the first lesson renders", async ({ page }) => {
    const errors = await openWorkbook(page);

    await expect(page.locator("#boot")).toHaveClass(/hidden/);
    await expect(page.locator(".step-title")).toBeVisible();
    expect(await page.locator("#sidebar .chap").count()).toBeGreaterThan(5);
    expect(await page.locator("#sidebar .steps button").count()).toBeGreaterThan(20);
    expect(errors, "no JavaScript errors on load").toEqual([]);
  });

  test("it really is CPython, not a simulation", async ({ page }) => {
    await openWorkbook(page);
    const r = await page.evaluate(() =>
      window.__workbook.run('import sys\nprint(sys.version_info.major)'));
    expect(r.error).toBeNull();
    expect(r.stdout.trim()).toBe("3");
  });
});

test.describe("regressions", () => {
  test("multi-line output keeps its newlines", async ({ page }) => {
    await openWorkbook(page);
    const r = await page.evaluate(() =>
      window.__workbook.run('print("one")\nprint("two", "three")\nprint(2026)'));

    expect(r.error).toBeNull();
    // The bug: Pyodide's setStdout({batched}) strips the newline from each
    // chunk, so this arrived as "onetwo three2026" and every line-by-line
    // check in the course failed.
    expect(r.stdout).toBe("one\ntwo three\n2026\n");
  });

  test("print(end='') is not swallowed", async ({ page }) => {
    await openWorkbook(page);
    const r = await page.evaluate(() =>
      window.__workbook.run('print("no", end="")\nprint("newline", end="")'));
    expect(r.stdout).toBe("nonewline");
  });

  test("tracebacks show her code, not Pyodide's internals", async ({ page }) => {
    await openWorkbook(page);
    const r = await page.evaluate(() =>
      window.__workbook.run('def f(x):\n    return x / 0\n\nf(3)'));

    expect(r.error).toBeTruthy();
    expect(r.error).not.toContain("_pyodide");
    expect(r.error).not.toContain("/lib/python");
    expect(r.error).not.toContain("eval_code");
    expect(r.error).not.toContain("<exec>");
    // the parts she is taught to read: the error type, and a line number
    expect(r.error).toContain("ZeroDivisionError");
    expect(r.error).toMatch(/line \d+/);
  });

  test("a syntax error still names the line and the problem", async ({ page }) => {
    await openWorkbook(page);
    const r = await page.evaluate(() =>
      window.__workbook.run('print("unterminated)'));
    expect(r.error).toContain("SyntaxError");
    expect(r.error).not.toContain("_pyodide");
  });

  test("a variable holding None is not mistaken for a missing one", async ({ page }) => {
    await openWorkbook(page);
    const steps = await page.evaluate(() => window.__workbook.steps);
    const step = steps.find((s) => s.id === "ch08-lists-can-be-changed");
    expect(step, "the lists-are-mutable step still exists").toBeTruthy();

    // The classic mistake the step is designed to catch. Pyodide converts
    // None to undefined, which is also what a missing variable looks like,
    // so this check silently stopped working.
    const r = await page.evaluate(() => window.__workbook.grade(
      "ch08-lists-can-be-changed",
      'kept = [40, 12, 7]\nkept = kept.append(22)'));

    const first = r.checks[0];
    expect(first.ok).toBe(false);
    expect(first.why.toLowerCase()).toContain("none");
  });
});

test.describe("every exercise grades correctly", () => {
  test("each reference solution passes all of its own checks", async ({ page }) => {
    await openWorkbook(page);
    const steps = await page.evaluate(() => window.__workbook.steps);
    const graded = steps.filter((s) => s.graded);
    expect(graded.length).toBeGreaterThan(20);

    const failures = [];
    for (const step of graded) {
      expect(step.hasSolution, step.id + " has a reference solution").toBe(true);
      const r = await page.evaluate(
        ([id, code]) => window.__workbook.grade(id, code),
        [step.id, step.solution]);
      const bad = r.checks.filter((c) => !c.ok);
      if (bad.length) {
        failures.push(step.id + " → " +
          bad.map((c) => c.label + ": " + (c.why || "returned false")).join("; "));
      }
    }
    expect(failures, "reference solutions that fail their own checks").toEqual([]);
  });

  test("no starter code already passes — every task has something to do", async ({ page }) => {
    await openWorkbook(page);
    const steps = await page.evaluate(() => window.__workbook.steps);
    const graded = steps.filter((s) => s.graded);

    const alreadyDone = [];
    for (const step of graded) {
      const r = await page.evaluate(
        ([id, code]) => window.__workbook.grade(id, code),
        [step.id, step.starter]);
      if (r.checks.every((c) => c.ok)) { alreadyDone.push(step.id); }
    }
    expect(alreadyDone, "steps whose starter already passes").toEqual([]);
  });
});

test.describe("the reference panel and further reading", () => {
  test("the cheatsheet opens, filters, and links back to lessons", async ({ page }) => {
    await openWorkbook(page);

    await page.locator("#sheet-toggle").click();
    await expect(page.locator("#sheet")).toHaveClass(/open/);
    expect(await page.locator("#sheet .item").count()).toBeGreaterThan(30);

    await page.locator("#sheet input.filter").fill("axis");
    const visible = page.locator("#sheet .item:not(.hidden)");
    expect(await visible.count()).toBeGreaterThan(0);
    expect(await visible.count()).toBeLessThan(6);

    // every "taught in chapter N" link must point at a step that exists
    await page.locator("#sheet input.filter").fill("");
    const targets = await page.$$eval("#sheet .item a.at",
      (els) => els.map((e) => e.getAttribute("href").replace("#", "")));
    const ids = (await page.evaluate(() => window.__workbook.steps)).map((s) => s.id);
    const dangling = targets.filter((t) => !ids.includes(t));
    expect(dangling, "cheatsheet links pointing at steps that do not exist").toEqual([]);
  });

  test("further reading renders as opt-in external links", async ({ page }) => {
    await openWorkbook(page);
    await page.evaluate(() => { location.hash = "ch05-one-line-at-time"; });
    await expect(page.locator("details.reading")).toBeVisible();

    // collapsed until she asks for it
    expect(await page.locator("details.reading").evaluate((e) => e.open)).toBe(false);
    await page.locator("details.reading summary").click();

    const links = page.locator("details.reading a");
    expect(await links.count()).toBeGreaterThan(0);
    for (const href of await links.evaluateAll((els) => els.map((e) => e.href))) {
      expect(href).toMatch(/^https:\/\//);
    }
    // must not steal her tab
    expect(await links.first().getAttribute("target")).toBe("_blank");
  });
});

test.describe("progress", () => {
  test("finishing a step ticks it, and the tick survives a reload", async ({ page }) => {
    await openWorkbook(page);

    await page.evaluate(() => { location.hash = "ch02-label-on-box"; });
    await expect(page.locator(".step-title")).toHaveText("A label on a box");

    await page.locator(".ed textarea").click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type("p = 999\n\nprint(p)");
    await page.locator(".runrow button.primary").click();

    await expect(page.locator(".verdict.ok")).toBeVisible();
    expect(await page.locator(".checks li.fail").count()).toBe(0);

    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("abbie-python-workbook-v1")));
    const keys = Object.keys(saved.done);
    expect(keys.length).toBe(1);
    // progress is keyed on the step id plus a hash of the question, so that
    // editing a question brings the step back for her to redo
    expect(keys[0]).toMatch(/^ch02-label-on-box@[a-z0-9]+$/);
    expect(saved.code["ch02-label-on-box"]).toContain("999");

    await page.reload();
    await page.waitForFunction(() => window.__workbook !== undefined,
      null, { timeout: 5 * 60 * 1000 });
    expect(await page.locator("#sidebar .steps .tick").filter({ hasText: "✓" }).count())
      .toBe(1);
  });

  test("a wrong answer explains itself rather than just failing", async ({ page }) => {
    await openWorkbook(page);
    const r = await page.evaluate(() =>
      window.__workbook.grade("ch02-label-on-box", "p = 50\n\nprint(p)"));

    const failed = r.checks.filter((c) => !c.ok);
    expect(failed.length).toBeGreaterThan(0);
    for (const c of failed) {
      expect(c.why, "check '" + c.label + "' explains why it failed").toBeTruthy();
      expect(c.why.length).toBeGreaterThan(10);
    }
  });
});
