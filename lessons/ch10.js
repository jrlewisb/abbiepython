WB.chapter({
  id: "ch10",
  part: "Part 2 — Decisions and repetition",
  title: "Dictionaries, tuples and sets",
  steps: [

    {
      id: "ch10-dictionaries-looking-things-up",
      title: "Dictionaries: looking things up by name",
      prose: `
<p>A list finds things by <em>position</em>. A <strong>dictionary</strong> finds them by
<em>name</em>. That is the whole difference, and it is the difference between
<code>row[3]</code> and <code>row["duration"]</code> — one of which you can still read next
month.</p>

<pre><code>recording = {
    "subject": "P07",
    "channels": 6,
    "minutes": 412,
}

recording["subject"]      # "P07"
recording["minutes"]      # 412</code></pre>

<p>Curly braces, <code>key: value</code> pairs, commas between them. Keys are usually strings.
Values can be anything at all — numbers, strings, lists, even other dictionaries.</p>

<p>You add or change an entry by assigning to it, and there is no difference between the two:</p>

<pre><code>recording["scored"] = True      # adds it if absent, replaces it if present</code></pre>

<div class="note"><span class="lbl">Asking for a key that is not there</span>
<p><code>recording["stage"]</code> raises a <code>KeyError</code>. When you are not sure a key
exists, use <code>.get()</code>, which hands back <code>None</code> instead of crashing —
or a default you supply:</p>
<pre><code>recording.get("stage")            # None
recording.get("stage", "unknown") # "unknown"</code></pre>
<p>Also useful: <code>"stage" in recording</code> asks whether a key exists, True or
False.</p></div>
`,
      starter: 'recording = {\n    "subject": "P07",\n    "channels": 6,\n    "minutes": 412,\n}\n\nprint(recording["subject"])\nprint(recording.get("stage", "not scored yet"))\nprint("minutes" in recording)\n\n# add a "scored" entry set to True\n\nprint(recording)',
      task: `<p>Add an entry to <code>recording</code> with the key <code>"scored"</code> and
the value <code>True</code>, without rewriting the whole dictionary.</p>`,
      hint: `<code>recording["scored"] = True</code>`,
      solution: 'recording = {\n    "subject": "P07",\n    "channels": 6,\n    "minutes": 412,\n}\n\nprint(recording["subject"])\nprint(recording.get("stage", "not scored yet"))\nprint("minutes" in recording)\n\nrecording["scored"] = True\n\nprint(recording)',
      checks: [
        {
          label: "recording has scored set to True",
          test: function (c) {
            var r = c.get("recording");
            if (!r) { return "Keep the dictionary named recording."; }
            return r.scored === true || "The “scored” entry is " + JSON.stringify(r.scored) + ".";
          }
        },
        {
          label: "The original entries are still there",
          test: function (c) {
            var r = c.get("recording") || {};
            return (r.subject === "P07" && r.channels === 6 && r.minutes === 412) ||
              "Something got lost — add the new key rather than rewriting the dictionary.";
          }
        }
      ]
    },

    {
      id: "ch10-walking-through-dictionary",
      title: "Walking through a dictionary",
      prose: `
<p>Looping over a dictionary directly gives you the <strong>keys</strong>. Almost always what
you actually want is both halves, which is what <code>.items()</code> is for:</p>

<pre><code>for key, value in recording.items():
    print(key, "=", value)</code></pre>

<p>The three views, all loopable:</p>
<ul>
<li><code>.keys()</code> — just the names</li>
<li><code>.values()</code> — just the values</li>
<li><code>.items()</code> — both, as a pair per loop pass</li>
</ul>

<p>Since Python 3.7 a dictionary remembers the order things were added, so looping is
predictable rather than random.</p>
`,
      starter: 'durations = {\n    "P01": 412,\n    "P02": 288,\n    "P03": 455,\n    "P04": 301,\n}\n\n# your loop here\n',
      task: `<p>Print one line per subject, but only for those with 300 minutes or more, in
this form:</p>
<pre><code>P01: 412 minutes
P03: 455 minutes
P04: 301 minutes</code></pre>`,
      hint: `<code>for subject, minutes in durations.items():</code> then an <code>if</code>
inside, then an f-string.`,
      solution: 'durations = {\n    "P01": 412,\n    "P02": 288,\n    "P03": 455,\n    "P04": 301,\n}\n\nfor subject, minutes in durations.items():\n    if minutes >= 300:\n        print(f"{subject}: {minutes} minutes")\n',
      checks: [
        {
          label: "The right three lines, in order",
          test: function (c) {
            var want = ["P01: 412 minutes", "P03: 455 minutes", "P04: 301 minutes"];
            if (c.outLines.length !== 3) {
              return "Expected 3 lines, got " + c.outLines.length + ": " + JSON.stringify(c.outLines);
            }
            for (var i = 0; i < 3; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "You used .items()",
          test: function (c) {
            return /\.items\s*\(\s*\)/.test(c.code) ||
              "Loop with durations.items() so you get the subject and the minutes together.";
          }
        },
        {
          label: "It adapts to different data",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\{\s*"P01": 412,\s*"P02": 288,\s*"P03": 455,\s*"P04": 301,\s*\}/,
              '{"A": 100, "B": 500}'));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return (r.outLines.length === 1 && r.outLines[0] === "B: 500 minutes") ||
              "On a different dictionary it printed: " + JSON.stringify(r.outLines);
          }
        }
      ]
    },

    {
      id: "ch10-counting-things-tally-pattern",
      title: "Counting things — the tally pattern",
      prose: `
<p>This is the single most useful thing dictionaries do, and you will reach for it constantly:
counting how many times each distinct value appears.</p>

<p>The pattern is the accumulator from chapter 9, with a dictionary instead of a number:</p>

<pre><code>tally = {}
for item in things:
    if item in tally:
        tally[item] = tally[item] + 1
    else:
        tally[item] = 1</code></pre>

<p>Or the same thing written more compactly with <code>.get()</code>, which is the version
you will see in real code:</p>

<pre><code>tally = {}
for item in things:
    tally[item] = tally.get(item, 0) + 1</code></pre>

<p>Read that middle line as: "take the current count for this item, or 0 if we have not seen
it before, add one, and store it back".</p>

<div class="note"><span class="lbl">There is a built-in for this</span>
<p><code>collections.Counter</code> does exactly this in one line, and you will meet it in
chapter 14. Write it by hand once first — the pattern generalises to things Counter cannot
do, like summing durations per subject rather than just counting.</p></div>
`,
      starter: 'stages = ["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"]\n\ntally = {}\n\n# your loop here\n\nprint(tally)\nprint(tally["N2"])',
      task: `<p>Count how many epochs there are of each stage. The result should be
<code>{'W': 2, 'N1': 1, 'N2': 4, 'N3': 1, 'R': 2}</code> and the second line should print
<code>4</code>.</p>`,
      hint: `<code>tally[stage] = tally.get(stage, 0) + 1</code> inside the loop.`,
      solution: 'stages = ["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"]\n\ntally = {}\n\nfor stage in stages:\n    tally[stage] = tally.get(stage, 0) + 1\n\nprint(tally)\nprint(tally["N2"])',
      checks: [
        {
          label: "Every stage is counted correctly",
          test: function (c) {
            var t = c.get("tally");
            if (!t) { return "Keep the dictionary named tally."; }
            var want = { W: 2, N1: 1, N2: 4, N3: 1, R: 2 };
            for (var k in want) {
              if (t[k] !== want[k]) {
                return "Stage " + k + " counted as " + t[k] + ", should be " + want[k] + ".";
              }
            }
            return Object.keys(t).length === 5 ||
              "There are extra keys in the tally: " + JSON.stringify(Object.keys(t));
          }
        },
        {
          label: "It was counted with a loop, not written out",
          test: function (c) {
            return /^\s*for\b/m.test(c.code) || "Build the tally with a loop.";
          }
        },
        {
          label: "It works on different stage data",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"\]/,
              '["R", "R", "R", "W", "N2"]'));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            var t = r.get("tally") || {};
            return (t.R === 3 && t.W === 1 && t.N2 === 1) ||
              "On different data the tally was " + JSON.stringify(t) + ".";
          }
        }
      ]
    },

    {
      id: "ch10-tuples-sets-briefly",
      title: "Tuples and sets, briefly",
      prose: `
<p>Two more containers. You will use them less often than lists and dictionaries, but you
need to recognise them, because Python hands them back to you whether you asked or not.</p>

<h3>Tuples — a list that cannot change</h3>

<p>Round brackets instead of square. Once made, it is fixed:</p>

<pre><code>position = (10, 20, 30)
position[0]          # 10
position[0] = 5      # TypeError — tuples do not support item assignment</code></pre>

<p>They are used for things where the <em>number</em> of items is part of the meaning — a
coordinate, a start-and-end pair, a row from a database. And they are why this works:</p>

<pre><code>a, b = b, a          # the swap from chapter 5, in one line
start, end = (30, 60)</code></pre>

<p>The right-hand side builds a tuple, and the left-hand side takes it apart again. That is
called <strong>unpacking</strong>, and it is also what <code>for key, value in .items()</code>
has been quietly doing.</p>

<h3>Sets — a bag of unique things, no order</h3>

<pre><code>seen = {"N2", "W", "N2", "R"}    # {'N2', 'W', 'R'} — the duplicate vanishes
"W" in seen                      # True, and very fast
set(stages)                      # which distinct stages appear at all?</code></pre>

<p>Sets answer two questions well: "what are the distinct values here" and "is this one of
them". They cannot hold duplicates and they have no order, so you cannot index into one.</p>
`,
      starter: 'stages = ["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"]\n\ndistinct = set()\nn_distinct = 0\nhas_rem = False\n\nfirst, second = 0, 0\n\nprint(sorted(distinct))\nprint(n_distinct)\nprint(has_rem)\nprint(first, second)',
      task: `<p>Set <code>distinct</code> to the set of stages that appear,
<code>n_distinct</code> to how many that is, and <code>has_rem</code> to whether
<code>"R"</code> is among them. Then unpack the first two entries of <code>stages</code> into
<code>first</code> and <code>second</code> in a single line. Expected output:</p>
<pre><code>['N1', 'N2', 'N3', 'R', 'W']
5
True
W N1</code></pre>`,
      hint: `<code>set(stages)</code>, then <code>len(distinct)</code>, then
<code>"R" in distinct</code>. For the unpack: <code>first, second = stages[0], stages[1]</code>
— or more neatly, <code>first, second = stages[:2]</code>.`,
      solution: 'stages = ["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"]\n\ndistinct = set(stages)\nn_distinct = len(distinct)\nhas_rem = "R" in distinct\n\nfirst, second = stages[:2]\n\nprint(sorted(distinct))\nprint(n_distinct)\nprint(has_rem)\nprint(first, second)',
      checks: [
        {
          label: "distinct holds the five stages that appear",
          test: function (c) {
            return c.outLines[0] === "['N1', 'N2', 'N3', 'R', 'W']" ||
              "The first line printed “" + c.outLines[0] + "”.";
          }
        },
        {
          label: "n_distinct is 5",
          test: function (c) { return c.get("n_distinct") === 5 || "It is " + c.get("n_distinct") + "."; }
        },
        {
          label: "has_rem is True",
          test: function (c) { return c.get("has_rem") === true || "It is " + c.get("has_rem") + "."; }
        },
        {
          label: "first and second are unpacked in one line",
          test: function (c) {
            if (c.get("first") !== "W" || c.get("second") !== "N1") {
              return "first is " + JSON.stringify(c.get("first")) + " and second is " +
                JSON.stringify(c.get("second")) + ".";
            }
            return /first\s*,\s*second\s*=/.test(c.code) ||
              "Assign both on one line: first, second = ...";
          }
        },
        {
          label: "It all works on different data",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\["W", "N1", "N2", "N2", "N3", "N2", "R", "W", "N2", "R"\]/,
              '["N1", "N1", "W"]'));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.get("n_distinct") !== 2) {
              return "On [\"N1\", \"N1\", \"W\"] n_distinct came out as " + r.get("n_distinct") + ".";
            }
            return r.get("has_rem") === false ||
              "That list has no R in it, so has_rem should be False.";
          }
        }
      ]
    }
  ]
});
