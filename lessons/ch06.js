WB.chapter({
  id: "ch06",
  part: "Part 2 — Decisions and repetition",
  title: "True and False",
  steps: [

    {
      id: "ch06-asking-questions-about-values",
      title: "Asking questions about values",
      prose: `
<p>So far your code has <em>stated</em> things: this variable is 68, that one is "P07". Now
it starts <em>asking</em> things — and this is the doorway to everything that follows.</p>

<p>Here is why it matters. A computer cannot decide anything on its own. To get it to treat
one recording differently from another — skip this file, flag that epoch, exclude this
participant — you have to reduce the situation to a yes-or-no question it can answer, and
then tell it what to do with each answer.</p>

<p>Every single "if this, do that" you will ever write starts with a question of this kind.
So this chapter is about writing the question; the next one is about acting on the
answer.</p>

<h3>Asking a question</h3>

<p>A comparison <em>is</em> a question, and the answer is always one of exactly two values:
<code>True</code> or <code>False</code>. That type has a name — <strong>bool</strong>, short
for boolean, after George Boole, who worked this out about a century before there were any
computers to use it.</p>

<ul>
<li><code>==</code> is the same as</li>
<li><code>!=</code> is not the same as</li>
<li><code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code> — less, greater,
and their "or equal to" versions</li>
</ul>

<p>The important and slightly odd thing: a comparison is not a special kind of sentence, it
is an <strong>expression that produces a value</strong>, exactly like <code>2 + 2</code>
produces 4. <code>duration &gt; 300</code> produces <code>True</code>. You can print it, and
you can store it in a variable and use it later:</p>

<pre><code>long_enough = duration &gt; 300      # long_enough now holds True</code></pre>

<div class="note warn"><span class="lbl">The one that bites everybody</span>
<p><code>=</code> assigns. <code>==</code> compares.</p>
<p><code>x = 5</code> means "put 5 into x". <code>x == 5</code> asks "is x 5?" and hands back
True or False. Getting these the wrong way round is a rite of passage, and Python will
usually catch it with a SyntaxError rather than letting it slide.</p></div>

<p>Comparisons work on text too — <code>"cat" == "cat"</code> is True. Case matters, so
<code>"Cat" == "cat"</code> is False, which is a real source of bugs when your data has
inconsistent capitalisation in it.</p>
`,
      starter: 'duration = 480\n\nprint(duration > 300)\nprint(duration == 480)\nprint(duration != 480)\nprint("REM" == "rem")'
    },

    {
      id: "ch06-combining-questions-or",
      title: "Combining questions: and, or, not",
      prose: `
<p>Real questions are rarely simple. Python spells the joining words out in English, which
makes them unusually readable:</p>

<ul>
<li><code>and</code> — True only when <strong>both</strong> sides are True</li>
<li><code>or</code> — True when <strong>at least one</strong> side is True</li>
<li><code>not</code> — flips True to False and back</li>
</ul>

<pre><code>age > 18 and consent_given          # both must hold
stage == "N2" or stage == "N3"      # either will do
not artefact_detected               # True when there is no artefact</code></pre>

<div class="note"><span class="lbl">A common trap</span>
<p><code>x == 1 or 2</code> does <strong>not</strong> mean "x is 1 or 2". Python reads it as
<code>(x == 1) or (2)</code>, and a bare 2 counts as True, so the whole thing is always True.
Write both comparisons out: <code>x == 1 or x == 2</code>. Or use the neater
<code>x in (1, 2)</code>, which you will meet properly in chapter 10.</p></div>

<p>There is also a nice shorthand for ranges: <code>0 &lt; x &lt; 10</code> works exactly as it
does in maths, and means the same as <code>x &gt; 0 and x &lt; 10</code>.</p>
`,
      starter: 'amplitude = 42\nchannel = "EEG"\nflagged = False\n\nusable = False\n\nprint(usable)',
      task: `<p>Set <code>usable</code> so it is <code>True</code> only when <em>all three</em>
of these hold: the amplitude is above 10, the amplitude is below 100, and the recording is not
flagged. Build it from the variables — do not type <code>True</code>.</p>`,
      hint: `Three conditions joined with <code>and</code>. The last one is
<code>not flagged</code>.`,
      solution: 'amplitude = 42\nchannel = "EEG"\nflagged = False\n\nusable = amplitude > 10 and amplitude < 100 and not flagged\n\nprint(usable)',
      checks: [
        {
          label: "usable is True for this recording",
          test: function (c) {
            var u = c.get("usable");
            if (u === undefined) { return "Keep the variable named usable."; }
            return u === true || "usable came out as " + u + ".";
          }
        },
        {
          label: "It is worked out from the variables, not typed in",
          test: function (c) {
            return /usable\s*=\s*.*amplitude/.test(c.code) ||
              "The right-hand side needs to mention amplitude and flagged.";
          }
        },
        {
          label: "An amplitude of 250 makes it False",
          test: function (c) {
            var r = c.rerun(c.code.replace(/amplitude\s*=\s*42/, "amplitude = 250"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.get("usable") === false ||
              "With amplitude 250 it should be False, but it was " + r.get("usable") + ".";
          }
        },
        {
          label: "A flagged recording makes it False",
          test: function (c) {
            var r = c.rerun(c.code.replace(/flagged\s*=\s*False/, "flagged = True"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.get("usable") === false ||
              "With flagged = True it should be False, but it was " + r.get("usable") + ".";
          }
        },
        {
          label: "An amplitude of 5 makes it False",
          test: function (c) {
            var r = c.rerun(c.code.replace(/amplitude\s*=\s*42/, "amplitude = 5"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.get("usable") === false ||
              "With amplitude 5 it should be False, but it was " + r.get("usable") + ".";
          }
        }
      ]
    },

    {
      id: "ch06-empty-things-are-false",
      title: "Empty things are False",
      prose: `
<p>Python will accept any value where it expects a True or False, and it has firm opinions
about which ones count as "no". These are all treated as False:</p>

<ul>
<li><code>False</code> itself</li>
<li><code>0</code> and <code>0.0</code></li>
<li><code>""</code> — the empty string</li>
<li><code>[]</code> — an empty list, and every other empty container</li>
<li><code>None</code> — the special "there is no value here" value</li>
</ul>

<p>Everything else is True. This is called <strong>truthiness</strong>, and it is why you will
see experienced code written as <code>if filename:</code> rather than
<code>if filename != "":</code> — they mean the same thing, and the short one reads better
once you know the rule.</p>

<div class="note"><span class="lbl">None is worth meeting properly</span>
<p><code>None</code> is Python's way of saying "nothing here yet". It is not zero, and it is
not an empty string — it is the absence of a value. You will see it constantly: a function
that does not return anything actually returns <code>None</code>, and a missing entry in a
data file often comes through as <code>None</code>.</p></div>

<p>The <code>bool()</code> function shows you what Python thinks of any value. Run this.</p>
`,
      starter: 'print(bool(0))\nprint(bool(42))\nprint(bool(""))\nprint(bool("no"))\nprint(bool([]))\nprint(bool(None))'
    },

    {
      id: "ch06-challenge-quality-control-flag",
      title: "Challenge: a quality-control flag",
      prose: `
<p>This is the shape of a real check you will write over and over: several conditions, one
answer, and a name that says what it means.</p>

<p>A recording is worth analysing when it is long enough, has a subject ID filled in, and has
not been marked as excluded.</p>
`,
      starter: 'subject_id = "P07"\nminutes_recorded = 412\nexcluded = False\n\nworth_analysing = False\n\nprint(f"{subject_id}: {worth_analysing}")',
      task: `<p>Set <code>worth_analysing</code> to True only when all three hold:
<code>minutes_recorded</code> is at least 300, <code>subject_id</code> is not empty, and the
recording is not excluded. Use truthiness for the subject ID rather than comparing it to
<code>""</code>.</p>`,
      hint: `<code>minutes_recorded >= 300 and subject_id and not excluded</code> — note that
the middle one is just the variable on its own.`,
      solution: 'subject_id = "P07"\nminutes_recorded = 412\nexcluded = False\n\nworth_analysing = minutes_recorded >= 300 and bool(subject_id) and not excluded\n\nprint(f"{subject_id}: {worth_analysing}")',
      checks: [
        {
          label: "True for this recording",
          test: function (c) {
            var w = c.get("worth_analysing");
            if (w === undefined) { return "Keep the variable named worth_analysing."; }
            return w === true || "It came out as " + w + ".";
          }
        },
        {
          label: "A 300-minute recording still counts (at least, not more than)",
          test: function (c) {
            var r = c.rerun(c.code.replace(/minutes_recorded\s*=\s*412/, "minutes_recorded = 300"));
            return r.get("worth_analysing") === true ||
              "Exactly 300 minutes should pass. Check whether you used > where you want >=.";
          }
        },
        {
          label: "A 299-minute recording does not",
          test: function (c) {
            var r = c.rerun(c.code.replace(/minutes_recorded\s*=\s*412/, "minutes_recorded = 299"));
            return r.get("worth_analysing") === false ||
              "299 minutes should fail, but it came out as " + r.get("worth_analysing") + ".";
          }
        },
        {
          label: "A missing subject ID fails",
          test: function (c) {
            var r = c.rerun(c.code.replace(/subject_id\s*=\s*"P07"/, 'subject_id = ""'));
            return !r.get("worth_analysing") ||
              "An empty subject_id should fail the check.";
          }
        },
        {
          label: "An excluded recording fails",
          test: function (c) {
            var r = c.rerun(c.code.replace(/excluded\s*=\s*False/, "excluded = True"));
            return r.get("worth_analysing") === false ||
              "excluded = True should fail the check.";
          }
        }
      ]
    }
  ]
});
