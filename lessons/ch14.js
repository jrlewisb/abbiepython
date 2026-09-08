WB.chapter({
  id: "ch14",
  part: "Part 3 — Writing real code",
  title: "Modules and the standard library",
  steps: [

    {
      id: "ch14-why-modules",
      title: "Somebody has already written it",
      prose: `
<p>In chapter 8 you worked out a mean with <code>sum(readings) / len(readings)</code>. That
was the right thing to do — you should know what a mean is made of. But you would not want to
hand-write a median, and you certainly would not want to hand-write a standard deviation and
then wonder at 2am whether you used the right denominator.</p>

<p>You do not have to. Python ships with a large collection of ready-made, tested code called
the <strong>standard library</strong>, and it is already on your computer. Nothing to install.
You just have to ask for it.</p>

<pre><code>import statistics

statistics.mean([12, 7, 40, 3])      # 15.5
statistics.median([12, 7, 40, 3])    # 9.5
statistics.stdev([12, 7, 40, 3])     # 16.62...</code></pre>

<h3>Why this is not cheating</h3>

<p>Because the code someone else wrote has been read by thousands of people, tested against
edge cases you have not thought of, and fixed over twenty years. Yours has been read by you,
once, at midnight. For anything with a known correct answer, using the library version is not
laziness — it is the accurate choice.</p>

<p>Write it yourself when you are learning what it does, or when nothing suitable exists.
Otherwise import it.</p>

<div class="note"><span class="lbl">This is also how everything else arrives</span>
<p><code>import numpy</code>, <code>import pandas</code>, <code>import lunapi</code> — all the
same mechanism. The difference is that the standard library is already there, while those
three have to be installed first (chapter 21). Once installed, they behave identically to what
you are about to do.</p></div>
`,
      starter: 'import statistics\n\ndurations = [412, 388, 455, 301, 502, 377]\n\nprint(statistics.mean(durations))\nprint(statistics.median(durations))\nprint(round(statistics.stdev(durations), 2))'
    },

    {
      id: "ch14-import-forms",
      title: "The three ways to import, and which to use",
      prose: `
<p>There are three shapes, and the differences matter more than they look.</p>

<h3>1. Import the module — the safe default</h3>
<pre><code>import statistics
statistics.mean(values)</code></pre>
<p>Everything stays behind the module's name. Slightly more typing, and worth it: when you
read <code>statistics.mean(...)</code> six months later you know exactly where that
<code>mean</code> came from.</p>

<h3>2. Import specific names</h3>
<pre><code>from statistics import mean, median
mean(values)</code></pre>
<p>Shorter to use. The cost is that <code>mean</code> is now loose in your file, and if you
later define your own <code>mean</code>, or import one from somewhere else, one silently
replaces the other. Fine for one or two obvious names; risky as a habit.</p>

<h3>3. Import with a shorter name</h3>
<pre><code>import numpy as np
import pandas as pd
np.mean(values)</code></pre>
<p>The best of both: still namespaced, but short. <code>np</code> and <code>pd</code> are
near-universal conventions — every tutorial, every StackOverflow answer, every colleague's
script uses them. Follow the convention rather than inventing your own.</p>

<div class="note warn"><span class="lbl">Never do this</span>
<p><code>from statistics import *</code> pulls every name into your file at once. You cannot
tell what came from where, and things overwrite each other invisibly. You will see it in old
code and tutorials. Do not copy it.</p></div>

<h3>Two things that go wrong</h3>

<p><code>ModuleNotFoundError: No module named 'pandas'</code> — the module is not installed.
Nothing to do with your code; you need to install it (chapter 21).</p>

<p><strong>Never name your own file after a module.</strong> Save a script as
<code>statistics.py</code> or <code>random.py</code> and Python will import <em>your</em> file
instead of the real one, producing errors that make no sense at all. It is a rite of passage
and it costs people an entire afternoon.</p>
`,
      starter: 'import math\n\n# Rewrite these three using the "from" form and the "as" form as directed.\n\nroot = math.sqrt(64)\nrounded_up = math.ceil(4.2)\ncircle = math.pi * 3 ** 2\n\nprint(root, rounded_up, round(circle, 2))',
      task: `<p>Change the imports so that:</p>
<ul>
<li><code>sqrt</code> and <code>ceil</code> are imported by name and used without any module
prefix</li>
<li>the module <code>math</code> is <em>also</em> imported under the short name
<code>m</code>, and <code>pi</code> is used as <code>m.pi</code></li>
</ul>
<p>The output should stay exactly <code>8.0 5 28.27</code>.</p>`,
      hint: `Two import lines: <code>from math import sqrt, ceil</code> and
<code>import math as m</code>. Then drop the <code>math.</code> from sqrt and ceil, and change
<code>math.pi</code> to <code>m.pi</code>.`,
      solution: 'from math import sqrt, ceil\nimport math as m\n\n# Rewrite these three using the "from" form and the "as" form as directed.\n\nroot = sqrt(64)\nrounded_up = ceil(4.2)\ncircle = m.pi * 3 ** 2\n\nprint(root, rounded_up, round(circle, 2))',
      checks: [
        {
          label: "The output is unchanged",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            return c.out === "8.0 5 28.27" || "The output was “" + c.out + "”.";
          }
        },
        {
          label: "sqrt and ceil are imported by name",
          test: function (c) {
            if (!/from\s+math\s+import\s+[^\n]*\bsqrt\b/.test(c.code)) {
              return "Import sqrt by name with: from math import sqrt, ceil";
            }
            return /from\s+math\s+import\s+[^\n]*\bceil\b/.test(c.code) ||
              "ceil needs importing by name too.";
          }
        },
        {
          label: "They are used without a module prefix",
          test: function (c) {
            return !/\b(math|m)\.(sqrt|ceil)\s*\(/.test(c.code) ||
              "Now that they are imported by name, call them as sqrt(64) and ceil(4.2).";
          }
        },
        {
          label: "math is also imported as m, and pi comes from it",
          test: function (c) {
            if (!/import\s+math\s+as\s+m\b/.test(c.code)) { return "Add: import math as m"; }
            return /\bm\.pi\b/.test(c.code) || "Use m.pi for the circle calculation.";
          }
        },
        {
          label: "No star import",
          test: function (c) {
            return !/from\s+\w+\s+import\s+\*/.test(c.code) ||
              "Star imports hide where names came from — name them explicitly.";
          }
        }
      ]
    },

    {
      id: "ch14-whats-in-the-box",
      title: "What is actually in there",
      prose: `
<p>A short tour of the parts you will genuinely use. You do not need to memorise any of it —
you need to know these exist, so that when you have the problem you remember there is an
answer.</p>

<h3>math and statistics — the numbers</h3>
<p><code>math.sqrt</code>, <code>math.log</code>, <code>math.pi</code>,
<code>math.floor</code>/<code>ceil</code>. <code>statistics.mean</code>,
<code>median</code>, <code>mode</code>, <code>stdev</code>, <code>variance</code>. For serious
array work you will use NumPy instead, but for a handful of numbers these are perfect.</p>

<h3>collections — better containers</h3>
<p><code>Counter</code> does chapter 10's tally pattern in one line, and adds
<code>.most_common()</code>:</p>
<pre><code>from collections import Counter
tally = Counter(stages)              # {'N2': 4, 'W': 2, ...}
tally.most_common(2)                 # the two most frequent</code></pre>

<h3>pathlib — file paths that work everywhere</h3>
<p>Windows uses backslashes, macOS and Linux use forward slashes.
<code>pathlib.Path</code> handles that for you, so your script runs on your laptop and on the
cluster:</p>
<pre><code>from pathlib import Path
data = Path("recordings") / "P07" / "night1.edf"</code></pre>

<h3>datetime — dates and times</h3>
<p>Real timestamps, real arithmetic. Sleep data is full of times that cross midnight, and this
is what stops that turning into hand-written misery.</p>

<h3>csv and json — reading structured files</h3>
<p>Chapter 15's business. <code>json</code> in particular is how most configuration and
metadata travels.</p>

<div class="note"><span class="lbl">How to find things</span>
<p>The official documentation at <strong>docs.python.org/3/library</strong> is genuinely good
and searchable. And <code>help(statistics.mean)</code> works right here, offline, in any
Python. Searching the web is completely normal too — nobody remembers this stuff, they
remember that it exists.</p></div>
`,
      starter: 'from collections import Counter\nimport statistics\n\nstages = ["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"]\ndurations = [412, 388, 455, 301, 502, 377]\n\ntally = None\nmost_common_stage = None\nspread = None\n\nprint(tally)\nprint(most_common_stage)\nprint(round(spread, 2))',
      task: `<p>Use the imports at the top:</p>
<ul>
<li><code>tally</code> — a <code>Counter</code> of the stages</li>
<li><code>most_common_stage</code> — just the name of the single most frequent stage, as a
string (<code>"N2"</code>), not a pair</li>
<li><code>spread</code> — the standard deviation of the durations</li>
</ul>
<p>Expected output:</p>
<pre><code>Counter({'N2': 4, 'W': 2, 'R': 2, 'N1': 1, 'N3': 1})
N2
69.05</code></pre>`,
      hint: `<code>Counter(stages)</code> builds the tally.
<code>tally.most_common(1)</code> gives a list with one pair in it, like
<code>[('N2', 4)]</code> — so you need <code>[0][0]</code> on the end to reach into the list
and then the pair. <code>statistics.stdev(durations)</code> for the spread.`,
      solution: 'from collections import Counter\nimport statistics\n\nstages = ["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"]\ndurations = [412, 388, 455, 301, 502, 377]\n\ntally = Counter(stages)\nmost_common_stage = tally.most_common(1)[0][0]\nspread = statistics.stdev(durations)\n\nprint(tally)\nprint(most_common_stage)\nprint(round(spread, 2))',
      checks: [
        {
          label: "tally counts every stage correctly",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var t = c.tryPy("dict(tally)");
            if (!t) { return "tally is not a Counter yet."; }
            var want = { W: 2, N1: 1, N2: 4, N3: 1, R: 2 };
            for (var k in want) {
              if (t[k] !== want[k]) {
                return "Stage " + k + " counted as " + t[k] + ", expected " + want[k] + ".";
              }
            }
            return true;
          }
        },
        {
          label: "It was built with Counter rather than by hand",
          test: function (c) {
            return /Counter\s*\(\s*stages\s*\)/.test(c.code) ||
              "Use Counter(stages) — that is the whole point of importing it.";
          }
        },
        {
          label: "most_common_stage is the string N2, not a pair",
          test: function (c) {
            var v = c.get("most_common_stage");
            if (Array.isArray(v)) {
              return "That is still a list or a pair. Reach into it: .most_common(1)[0][0]";
            }
            return v === "N2" || "It is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "spread is the standard deviation",
          test: function (c) {
            var v = c.get("spread");
            if (typeof v !== "number") { return "spread is not a number."; }
            if (Math.abs(v - 63.04) < 0.5) {
              return "That looks like statistics.pstdev, the population version. Use " +
                "statistics.stdev, which is the sample standard deviation.";
            }
            return Math.abs(v - 69.05) < 0.01 || "It came out as " + v + ", expected about 69.05.";
          }
        },
        {
          label: "It all works on different data",
          test: function (c) {
            var r = c.rerun(c.code
              .replace(/\["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"\]/, '["R", "R", "W"]')
              .replace(/\[412, 388, 455, 301, 502, 377\]/, "[10, 20, 30]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.get("most_common_stage") !== "R") {
              return 'On ["R", "R", "W"] the most common stage came out as ' +
                JSON.stringify(r.get("most_common_stage")) + ".";
            }
            return Math.abs(r.get("spread") - 10) < 0.0001 ||
              "On [10, 20, 30] the standard deviation came out as " + r.get("spread") + ".";
          }
        }
      ]
    }
  ]
});
