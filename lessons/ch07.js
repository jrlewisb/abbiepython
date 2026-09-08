WB.chapter({
  id: "ch07",
  part: "Part 2 — Decisions and repetition",
  title: "Making decisions",
  steps: [

    {
      id: "ch07-if-indentation-point",
      reading: [
        { title: "More control flow tools",
          url: "https://docs.python.org/3/tutorial/controlflow.html",
          note: "if, for, while and friends, from the official tutorial." },
      ],
      title: "if, and why the indentation is the point",
      prose: `
<p>Back to the recipe from chapter 1. Real recipes are not just a straight list of steps —
they contain lines like "if the sauce is too thick, add a splash of water". The instruction
only applies sometimes, and the cook has to look at what is actually in the pan.</p>

<p>That is an <code>if</code> statement, and it is what turns a fixed list of instructions
into something that can cope with data it has not seen. Your recordings will not all be the
same. Some will be short, some will have a channel missing, some will have a participant who
fell asleep in the scanner. Branching is how one script handles all of them without you
sitting there sorting them by hand.</p>

<h3>The shape of it</h3>

<pre><code>if temperature &gt; 38:
    print("fever")
    print("check again in an hour")

print("done")</code></pre>

<p>The condition is the question from chapter 6 — something that comes out True or False. If
it is True, the indented block runs. If it is False, Python skips the whole block and carries
on underneath.</p>

<p>Two things to notice, and they are the two things everybody gets wrong at first.</p>

<p><strong>The colon.</strong> The line that opens a block ends in <code>:</code>. Forget it
and you get <code>SyntaxError: expected ':'</code>. You will do this roughly four hundred
times and then stop.</p>

<p><strong>The indentation is not decoration.</strong> In most languages, indenting your code
is a politeness to other humans. In Python it is the actual grammar. The indented lines are
<em>inside</em> the if; the unindented <code>print("done")</code> is outside it and runs
either way. Move a line in or out by four spaces and you have changed what the program
does — with no error to tell you.</p>

<p>People often complain about this. It is worth knowing why Python does it: in other
languages you have to mark the block with braces <em>and</em> indent it for readability, so
the two can disagree and mislead you. Here they cannot, because they are the same thing.</p>

<div class="note"><span class="lbl">Use four spaces</span>
<p>The editor here inserts four spaces when you press Tab, and indents automatically after a
colon, so mostly this looks after itself. Just keep it consistent — mixing tabs and spaces
causes <code>IndentationError</code>, and the difference is invisible on screen, which is
what makes it maddening.</p></div>
`,
      starter: 'reading = 42\n\nif reading > 100:\n    print("too high")\n\nif reading > 10:\n    print("above the noise floor")\n\nprint("finished checking")'
    },

    {
      id: "ch07-else-elif",
      title: "else, and elif",
      prose: `
<p><code>else</code> catches everything the <code>if</code> did not:</p>

<pre><code>if usable:
    print("keep")
else:
    print("discard")</code></pre>

<p><code>elif</code> — short for "else if" — lets you chain alternatives:</p>

<pre><code>if score &gt;= 80:
    grade = "high"
elif score &gt;= 50:
    grade = "medium"
else:
    grade = "low"</code></pre>

<div class="note"><span class="lbl">Only one branch ever runs</span>
<p>Python checks each condition in order and takes the <strong>first</strong> one that is
True, then skips the entire rest of the chain. So the order matters enormously. If you put
<code>score >= 50</code> first, a score of 90 would be labelled "medium" — it matches, so
Python never looks at the rest.</p></div>

<p>That is also why the second condition can be written as plain <code>score >= 50</code>
rather than <code>score >= 50 and score &lt; 80</code>. If Python has reached that line at
all, the first condition must have been False, so the score is already known to be under 80.</p>
`,
      starter: 'score = 64\n\ngrade = "unset"\n\nprint(grade)',
      task: `<p>Write an if / elif / else chain that sets <code>grade</code> to
<code>"high"</code> for 80 or more, <code>"medium"</code> for 50 to 79, and
<code>"low"</code> below 50. With the score at 64 it should print <code>medium</code>.</p>`,
      hint: `Start with the highest band. Each branch does one thing: sets
<code>grade</code>.`,
      solution: 'score = 64\n\nif score >= 80:\n    grade = "high"\nelif score >= 50:\n    grade = "medium"\nelse:\n    grade = "low"\n\nprint(grade)',
      checks: [
        {
          label: "64 gives “medium”",
          test: function (c) { return c.out === "medium" || "It printed “" + c.out + "”."; }
        },
        {
          label: "You used an elif chain",
          test: function (c) {
            return /\belif\b/.test(c.code) ||
              "Use if / elif / else rather than three separate ifs — this is what elif is for.";
          }
        },
        {
          label: "90 gives “high”",
          test: function (c) {
            var r = c.rerun(c.code.replace(/score\s*=\s*64/, "score = 90"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.out === "high" || "A score of 90 printed “" + r.out + "”.";
          }
        },
        {
          label: "80 exactly gives “high”",
          test: function (c) {
            var r = c.rerun(c.code.replace(/score\s*=\s*64/, "score = 80"));
            return r.out === "high" || "80 printed “" + r.out + "”. Check > against >=.";
          }
        },
        {
          label: "12 gives “low”",
          test: function (c) {
            var r = c.rerun(c.code.replace(/score\s*=\s*64/, "score = 12"));
            return r.out === "low" || "A score of 12 printed “" + r.out + "”.";
          }
        }
      ]
    },

    {
      id: "ch07-bug-elif-exists-prevent",
      title: "The bug that elif exists to prevent",
      prose: `
<p>Here is the same logic written with separate <code>if</code> statements instead of a
chain. Read it before running it, and see if you can spot what goes wrong.</p>

<p>Separate <code>if</code>s are independent: Python evaluates <strong>every one</strong> of
them. So a score of 90 is 80-or-more <em>and</em> 50-or-more, both branches run, and the
second one overwrites the first.</p>

<p>The result is a program that is wrong only for some inputs — which is exactly the kind of
bug that survives a quick test and turns up in your results three months later.</p>
`,
      starter: 'score = 90\n\nif score >= 80:\n    grade = "high"\nif score >= 50:\n    grade = "medium"\nif score < 50:\n    grade = "low"\n\nprint(grade)',
      task: `<p>Run it first and watch it print the wrong answer. Then fix it by turning the
second and third <code>if</code>s into <code>elif</code> and <code>else</code>.</p>`,
      hint: `The second <code>if</code> becomes <code>elif</code>. The third becomes
<code>else:</code> with no condition at all.`,
      solution: 'score = 90\n\nif score >= 80:\n    grade = "high"\nelif score >= 50:\n    grade = "medium"\nelse:\n    grade = "low"\n\nprint(grade)',
      checks: [
        {
          label: "90 now gives “high”",
          test: function (c) { return c.out === "high" || "It printed “" + c.out + "”."; }
        },
        {
          label: "There is only one if in the chain",
          test: function (c) {
            var ifs = (c.code.match(/^\s*if\b/gm) || []).length;
            return ifs === 1 || "There are " + ifs + " separate if statements — there should be one, " +
              "followed by elif and else.";
          }
        },
        {
          label: "There is an else branch",
          test: function (c) {
            return /^\s*else\s*:/m.test(c.code) || "Use else for the final catch-all case.";
          }
        },
        {
          label: "Still correct for 60 and for 10",
          test: function (c) {
            var a = c.rerun(c.code.replace(/score\s*=\s*90/, "score = 60"));
            if (a.out !== "medium") { return "A score of 60 printed “" + a.out + "”."; }
            var b = c.rerun(c.code.replace(/score\s*=\s*90/, "score = 10"));
            return b.out === "low" || "A score of 10 printed “" + b.out + "”.";
          }
        }
      ]
    },

    {
      id: "ch07-challenge-classify-signal",
      title: "Challenge: classify a signal",
      prose: `
<p>A practical one. You are given a reading from a channel and you want a one-word verdict on
it. Note the order you will need to test the conditions in — a negative number is smaller
than the flat threshold too, so "clipped" has to be recognised before "flat" gets a look in.</p>

<p>This is the real skill in branching: not the syntax, but working out what order the
questions have to be asked in so that no case falls through a gap.</p>
`,
      starter: 'reading = 340.0\n\nverdict = "unset"\n\nprint(verdict)',
      task: `<p>Set <code>verdict</code> from <code>reading</code>:</p>
<ul>
<li><code>"clipped"</code> if the reading is 300 or more, or -300 or less (the amplifier has
hit its limit in either direction)</li>
<li><code>"flat"</code> if it is between -1 and 1</li>
<li><code>"normal"</code> otherwise</li>
</ul>
<p>With the reading at 340.0 it should print <code>clipped</code>.</p>`,
      hint: `<code>abs(reading)</code> gives the size ignoring the sign, which collapses the
first rule into a single comparison: <code>abs(reading) >= 300</code>. The flat test is the
same trick: <code>abs(reading) < 1</code>.`,
      solution: 'reading = 340.0\n\nif abs(reading) >= 300:\n    verdict = "clipped"\nelif abs(reading) < 1:\n    verdict = "flat"\nelse:\n    verdict = "normal"\n\nprint(verdict)',
      checks: [
        {
          label: "340.0 is clipped",
          test: function (c) { return c.out === "clipped" || "It printed “" + c.out + "”."; }
        },
        {
          label: "-500 is clipped too",
          test: function (c) {
            var r = c.rerun(c.code.replace(/reading\s*=\s*340\.0/, "reading = -500"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.out === "clipped" || "-500 printed “" + r.out + "” — the limit is hit in " +
              "both directions.";
          }
        },
        {
          label: "0.2 is flat",
          test: function (c) {
            var r = c.rerun(c.code.replace(/reading\s*=\s*340\.0/, "reading = 0.2"));
            return r.out === "flat" || "0.2 printed “" + r.out + "”.";
          }
        },
        {
          label: "-0.4 is flat as well",
          test: function (c) {
            var r = c.rerun(c.code.replace(/reading\s*=\s*340\.0/, "reading = -0.4"));
            return r.out === "flat" || "-0.4 printed “" + r.out + "”. A small negative reading " +
              "is still flat.";
          }
        },
        {
          label: "45.5 is normal",
          test: function (c) {
            var r = c.rerun(c.code.replace(/reading\s*=\s*340\.0/, "reading = 45.5"));
            return r.out === "normal" || "45.5 printed “" + r.out + "”.";
          }
        },
        {
          label: "-120 is normal",
          test: function (c) {
            var r = c.rerun(c.code.replace(/reading\s*=\s*340\.0/, "reading = -120"));
            return r.out === "normal" || "-120 printed “" + r.out + "”.";
          }
        }
      ]
    }
  ]
});
