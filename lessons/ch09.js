WB.chapter({
  id: "ch09",
  part: "Part 2 — Decisions and repetition",
  title: "Loops",
  steps: [

    {
      id: "ch09-doing-something-every-item",
      title: "Doing something to every item",
      prose: `
<p>This is the point where programming starts paying for itself. A <code>for</code> loop
takes a list and runs the same block of code once for each item in it.</p>

<pre><code>for reading in readings:
    print(reading)</code></pre>

<p>Read it as English: "for each reading in readings, print that reading". The word
<code>reading</code> is a name <em>you</em> choose — Python creates it fresh on each pass and
fills it with the next item. Singular name for the item, plural for the list, is the
convention worth adopting.</p>

<p>Same two rules as <code>if</code>: colon at the end of the opening line, and the indented
block is what repeats. Anything unindented afterwards runs once, at the end.</p>

<p>Loops work over strings too — you get one character at a time.</p>
`,
      starter: 'channels = ["EEG", "EOG", "EMG"]\n\nfor channel in channels:\n    print("checking", channel)\n\nprint("all channels checked")'
    },

    {
      id: "ch09-looping-fixed-number-times",
      title: "Looping a fixed number of times: range",
      prose: `
<p>When you want to repeat something a set number of times rather than walk a list, use
<code>range</code>:</p>

<pre><code>for i in range(5):
    print(i)          # 0, 1, 2, 3, 4</code></pre>

<p><code>range(5)</code> gives you five numbers <strong>starting at 0</strong>, and — the
same rule yet again — <strong>stopping before</strong> 5. It is the same convention as
slicing, and for the same reason: <code>range(len(things))</code> gives you exactly the valid
positions of <code>things</code>.</p>

<p>It takes up to three arguments, like a slice:</p>

<pre><code>range(1, 6)        # 1, 2, 3, 4, 5
range(0, 10, 2)    # 0, 2, 4, 6, 8   — every second one
range(10, 0, -1)   # 10, 9, 8 ... 1  — backwards</code></pre>

<div class="note"><span class="lbl">If you want the position as well as the item</span>
<p>Reach for <code>enumerate</code> rather than <code>range(len(...))</code>:</p>
<pre><code>for index, channel in enumerate(channels):
    print(index, channel)</code></pre>
<p>It hands you both at once, and it is what experienced Python code looks like.</p></div>
`,
      starter: 'stages = ["W", "N1", "N2", "N2", "N3"]\n\n# loop here\n',
      task: `<p>Print one line per stage, numbered from 1, in exactly this form:</p>
<pre><code>epoch 1: W
epoch 2: N1
epoch 3: N2
epoch 4: N2
epoch 5: N3</code></pre>
<p>Use <code>enumerate</code>, and remember it starts counting at 0 — so you will need to
adjust.</p>`,
      hint: `<code>for i, stage in enumerate(stages):</code> then print an f-string using
<code>{i + 1}</code>. Or pass a start value: <code>enumerate(stages, 1)</code>.`,
      solution: 'stages = ["W", "N1", "N2", "N2", "N3"]\n\nfor i, stage in enumerate(stages, 1):\n    print(f"epoch {i}: {stage}")\n',
      checks: [
        {
          label: "Five lines, correctly numbered and labelled",
          test: function (c) {
            var want = ["epoch 1: W", "epoch 2: N1", "epoch 3: N2", "epoch 4: N2", "epoch 5: N3"];
            if (c.outLines.length !== 5) {
              return "Expected 5 lines of output, got " + c.outLines.length + ".";
            }
            for (var i = 0; i < 5; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "You used a loop rather than five print statements",
          test: function (c) {
            return /^\s*for\b/m.test(c.code) || "Write it as a loop.";
          }
        },
        {
          label: "It adapts to a different list",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\["W", "N1", "N2", "N2", "N3"\]/, '["R", "W"]'));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return (r.outLines.length === 2 && r.outLines[0] === "epoch 1: R" &&
              r.outLines[1] === "epoch 2: W") ||
              "On a 2-item list it printed: " + JSON.stringify(r.outLines);
          }
        }
      ]
    },

    {
      id: "ch09-accumulator-pattern-behind-almost",
      title: "The accumulator: the pattern behind almost everything",
      prose: `
<p>If you learn one loop shape, learn this one. You want a single answer out of a whole list —
a total, a count, a list of the interesting ones. The pattern is always the same three parts:</p>

<ol>
<li><strong>Before the loop</strong>, create the thing you are building and set it to empty
or zero.</li>
<li><strong>Inside the loop</strong>, update it using the current item.</li>
<li><strong>After the loop</strong>, use it.</li>
</ol>

<pre><code>total = 0                    # start empty
for reading in readings:
    total = total + reading  # update
print(total)                 # use</code></pre>

<p><code>total = total + reading</code> is chapter 2's <code>x = x + 3</code> again, and it
is worth pausing on: Python works out the right-hand side using the <em>current</em> total,
then stores the answer back. Python has a shorthand for this, and you will see it everywhere:
<code>total += reading</code> means exactly the same thing.</p>

<div class="note warn"><span class="lbl">The two ways this goes wrong</span>
<p>Putting <code>total = 0</code> <em>inside</em> the loop resets it every pass, and you end
up with just the last value. Putting <code>print(total)</code> inside the loop prints a
running total instead of one answer. Both are indentation mistakes, and both are worth
deliberately trying once so you recognise the symptom.</p></div>
`,
      starter: 'durations = [412, 388, 455, 301, 502, 377]\n\ntotal = 0\nlong_count = 0\n\n# your loop here\n\nprint(total)\nprint(long_count)',
      task: `<p>One loop that does two jobs: add every duration into <code>total</code>, and
count how many are 400 or more into <code>long_count</code>. Expected output:
<code>2435</code> then <code>3</code>.</p>`,
      hint: `Inside the loop: <code>total += duration</code>, then an <code>if</code> that adds
1 to <code>long_count</code> when the duration is big enough. The <code>if</code> goes inside
the loop, indented one more level.`,
      solution: 'durations = [412, 388, 455, 301, 502, 377]\n\ntotal = 0\nlong_count = 0\n\nfor duration in durations:\n    total += duration\n    if duration >= 400:\n        long_count += 1\n\nprint(total)\nprint(long_count)',
      checks: [
        {
          label: "total is 2435",
          test: function (c) {
            var t = c.get("total");
            if (t === 377) { return "That is only the last duration — is total = 0 inside the loop?"; }
            return t === 2435 || "total is " + t + ".";
          }
        },
        {
          label: "long_count is 3",
          test: function (c) { return c.get("long_count") === 3 || "It is " + c.get("long_count") + "."; }
        },
        {
          label: "Exactly two lines are printed",
          test: function (c) {
            return c.outLines.length === 2 ||
              c.outLines.length + " lines were printed. If you got one per item, a print is " +
              "indented inside the loop.";
          }
        },
        {
          label: "It was done with a loop",
          test: function (c) { return /^\s*for\b/m.test(c.code) || "Use a for loop."; }
        },
        {
          label: "It works on a different list",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\[412, 388, 455, 301, 502, 377\]/, "[100, 400, 900]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.get("total") !== 1400) { return "On [100, 400, 900] the total was " + r.get("total") + "."; }
            return r.get("long_count") === 2 ||
              "On [100, 400, 900] the count was " + r.get("long_count") + " — 400 counts as long.";
          }
        }
      ]
    },

    {
      id: "ch09-while-break-continue",
      title: "while, break and continue",
      prose: `
<p>A <code>for</code> loop runs once per item. A <code>while</code> loop runs
<strong>as long as a condition stays True</strong>, and you use it when you do not know in
advance how many passes you need.</p>

<pre><code>remaining = 10
while remaining &gt; 0:
    print(remaining)
    remaining = remaining - 1</code></pre>

<div class="note warn"><span class="lbl">Infinite loops</span>
<p>If nothing inside the loop ever makes the condition False, it runs forever and the page
will lock up. Forgetting the <code>remaining - 1</code> line is how that happens. If you do
freeze the tab, close it and reopen — your progress is saved.</p>
<p>This is the main reason to prefer <code>for</code> whenever you can: it cannot run
forever, because the list eventually ends.</p></div>

<p>Two words work in both kinds of loop:</p>
<ul>
<li><code>break</code> — leave the loop immediately</li>
<li><code>continue</code> — skip the rest of this pass and go to the next item</li>
</ul>

<pre><code>for reading in readings:
    if reading is None:
        continue          # skip the gaps
    if reading &gt; 1000:
        break             # something is badly wrong, stop here
    print(reading)</code></pre>
`,
      starter: 'readings = [12, 7, None, 40, None, 3, 9001, 22, 5]\n\nkept = []\n\n# your loop here\n\nprint(kept)',
      task: `<p>Walk the list and build <code>kept</code>, skipping any <code>None</code>
values and stopping completely as soon as you hit a reading above 1000. The result should be
<code>[12, 7, 40, 3]</code>.</p>`,
      hint: `Inside the loop, first an <code>if reading is None: continue</code>, then an
<code>if reading > 1000: break</code>, then <code>kept.append(reading)</code>. Order matters —
the checks have to come before the append.`,
      solution: 'readings = [12, 7, None, 40, None, 3, 9001, 22, 5]\n\nkept = []\n\nfor reading in readings:\n    if reading is None:\n        continue\n    if reading > 1000:\n        break\n    kept.append(reading)\n\nprint(kept)',
      checks: [
        {
          label: "kept is [12, 7, 40, 3]",
          test: function (c) {
            var k = JSON.stringify(c.get("kept"));
            if (k === "[12,7,40,3,22,5]") {
              return "The 9001 did not stop the loop — check your break.";
            }
            if (k === "[12,7,null,40,null,3]") {
              return "The Nones are still getting through — the continue is not firing.";
            }
            return k === "[12,7,40,3]" || "It is " + k + ".";
          }
        },
        {
          label: "You used continue",
          test: function (c) { return /\bcontinue\b/.test(c.code) || "Use continue to skip the Nones."; }
        },
        {
          label: "You used break",
          test: function (c) { return /\bbreak\b/.test(c.code) || "Use break to stop at the bad reading."; }
        },
        {
          label: "It behaves on a list with no bad values",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\[12, 7, None, 40, None, 3, 9001, 22, 5\]/, "[1, 2, 3]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return JSON.stringify(r.get("kept")) === "[1,2,3]" ||
              "On [1, 2, 3] it kept " + JSON.stringify(r.get("kept")) + ".";
          }
        }
      ]
    },

    {
      id: "ch09-challenge-summarise-recording",
      title: "Challenge: summarise a recording",
      prose: `
<p>Everything in this chapter at once. This is genuinely the shape of the first useful script
you will write for real: walk the data, ignore what is unusable, count what matters, and
report.</p>
`,
      starter: 'amplitudes = [22.5, 41.0, None, 380.0, 18.2, None, 55.5, 402.1, 30.0]\n\nvalid_count = 0\nclipped_count = 0\nmissing_count = 0\nmean_valid = 0\n\n# your loop here\n\nprint(f"{valid_count} valid, {clipped_count} clipped, {missing_count} missing")\nprint(f"mean of valid: {mean_valid:.2f}")',
      task: `<p>Walk <code>amplitudes</code> once and work out four things. A value is
<strong>missing</strong> if it is <code>None</code>, <strong>clipped</strong> if it is 300 or
more, and <strong>valid</strong> otherwise. <code>mean_valid</code> is the mean of the valid
ones only. Expected output:</p>
<pre><code>5 valid, 2 clipped, 2 missing
mean of valid: 33.44</code></pre>`,
      hint: `Keep a running <code>valid_total</code> alongside <code>valid_count</code>, then
divide once after the loop. Watch out for dividing by zero if there are no valid readings —
guard it with an <code>if valid_count > 0:</code>.`,
      solution: 'amplitudes = [22.5, 41.0, None, 380.0, 18.2, None, 55.5, 402.1, 30.0]\n\nvalid_count = 0\nclipped_count = 0\nmissing_count = 0\nmean_valid = 0\nvalid_total = 0\n\nfor amplitude in amplitudes:\n    if amplitude is None:\n        missing_count += 1\n    elif amplitude >= 300:\n        clipped_count += 1\n    else:\n        valid_count += 1\n        valid_total += amplitude\n\nif valid_count > 0:\n    mean_valid = valid_total / valid_count\n\nprint(f"{valid_count} valid, {clipped_count} clipped, {missing_count} missing")\nprint(f"mean of valid: {mean_valid:.2f}")',
      checks: [
        {
          label: "The counts are 5 valid, 2 clipped, 2 missing",
          test: function (c) {
            return c.outLines[0] === "5 valid, 2 clipped, 2 missing" ||
              "The first line was “" + c.outLines[0] + "”.";
          }
        },
        {
          label: "The mean of the valid readings is 33.44",
          test: function (c) {
            return c.outLines[1] === "mean of valid: 33.44" ||
              "The second line was “" + c.outLines[1] + "”. The mean should use only the " +
              "five valid readings.";
          }
        },
        {
          label: "One loop, not several passes",
          test: function (c) {
            var loops = (c.code.match(/^\s*for\b/gm) || []).length;
            return loops === 1 || "There are " + loops + " loops — this can all be done in one pass.";
          }
        },
        {
          label: "It survives a list with no valid readings at all",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\[22\.5, 41\.0, None, 380\.0, 18\.2, None, 55\.5, 402\.1, 30\.0\]/,
              "[None, 900.0]"));
            if (r.error) {
              return "It crashed on [None, 900.0]: " + r.error.split("\n").pop() +
                " — guard the division with an if.";
            }
            return r.outLines[0] === "0 valid, 1 clipped, 1 missing" ||
              "On [None, 900.0] the first line was “" + r.outLines[0] + "”.";
          }
        },
        {
          label: "It works on a completely different list",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\[22\.5, 41\.0, None, 380\.0, 18\.2, None, 55\.5, 402\.1, 30\.0\]/,
              "[10.0, 20.0, 300.0]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.outLines[0] !== "2 valid, 1 clipped, 0 missing") {
              return "On [10.0, 20.0, 300.0] the counts came out as “" + r.outLines[0] + "”.";
            }
            return r.outLines[1] === "mean of valid: 15.00" ||
              "On that list the mean line was “" + r.outLines[1] + "”.";
          }
        }
      ]
    }
  ]
});
