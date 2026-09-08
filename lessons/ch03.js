WB.chapter({
  id: "ch03",
  part: "Part 1 — The absolute basics",
  title: "Numbers",
  steps: [

    {
      id: "ch03-two-kinds-number",
      title: "Two kinds of number",
      prose: `
<p>Python has two kinds of number, and the difference is not pedantry — it changes what your
code does.</p>

<ul>
<li><strong>int</strong> — a whole number: <code>7</code>, <code>0</code>, <code>-3</code>.
For things you <em>count</em>: epochs, channels, participants, trials.</li>
<li><strong>float</strong> — a number with a decimal point: <code>7.0</code>,
<code>0.5</code>, <code>-3.25</code>. For things you <em>measure</em>: microvolts, seconds,
a mean.</li>
</ul>

<p>The distinction maps onto something real. You can have 2.5 seconds of recording. You
cannot have 2.5 epochs — an epoch is a thing you count, and half of one is meaningless. When
a piece of code hands you a float where you expected a count, that is usually a bug worth
chasing down rather than rounding away.</p>

<p><code>7</code> and <code>7.0</code> are the same quantity but different types. The built-in
<code>type()</code> function tells you which one you are holding, and you will use it more
than you expect when something is behaving strangely.</p>

<h3>The one that surprises everybody</h3>

<p><strong>Ordinary division always gives you a float</strong>, even when it comes out even.
<code>10 / 2</code> is <code>5.0</code>, not <code>5</code>. Python takes the view that
division is a measuring operation, so it always hands back a measuring kind of number. If you
want a whole number back you have to ask for one — which is the next step.</p>

<div class="note warn"><span class="lbl">Floats are slightly approximate</span>
<p>Run the code and look at the last line. <code>0.1 + 0.2</code> does not give exactly
<code>0.3</code>; it gives <code>0.30000000000000004</code>.</p>
<p>This is not a Python bug. Computers store decimals in binary, and 0.1 in binary is a
recurring fraction in the same way 1/3 is in decimal — it has to be cut off somewhere, and
the tiny error shows up when you add. Every programming language does this, including MATLAB.</p>
<p>It almost never matters for real measurements. It matters exactly once: never test two
floats with <code>==</code>. <code>0.1 + 0.2 == 0.3</code> is <code>False</code>. Compare with
a tolerance instead — <code>abs(a - b) &lt; 0.0001</code> — and you will never be bitten by
this again.</p></div>
`,
      starter: "print(type(7))\nprint(type(7.0))\nprint(10 / 2)\nprint(0.1 + 0.2)"
    },

    {
      id: "ch03-arithmetic-have-two-have",
      title: "The arithmetic you have, and two you have not",
      prose: `
<p>The familiar four work as you would expect: <code>+</code> <code>-</code> <code>*</code>
<code>/</code>. Two more are extremely useful and probably new:</p>

<ul>
<li><code>//</code> — <strong>floor division</strong>: divide and throw away the remainder.
<code>17 // 5</code> is <code>3</code>.</li>
<li><code>%</code> — <strong>modulo</strong>: the remainder only. <code>17 % 5</code> is
<code>2</code>.</li>
</ul>

<p>Together they answer "how many whole times does this go in, and what is left over" — which
comes up far more often than you would think: splitting things into groups, converting seconds
into minutes, checking whether a number is even (<code>n % 2 == 0</code>).</p>

<p>And <code>**</code> is "to the power of": <code>2 ** 10</code> is <code>1024</code>.</p>
`,
      starter: "print(17 + 5)\nprint(17 - 5)\nprint(17 * 5)\nprint(17 / 5)\nprint(17 // 5)\nprint(17 % 5)\nprint(17 ** 2)",
      task: `<p>A tray holds 12 samples. You have 100 samples. Set <code>full_trays</code> to
the number of completely full trays, and <code>left_over</code> to the number of samples that
do not fit. Work them out with operators — do not type <code>8</code> and <code>4</code> in
by hand.</p>`,
      hint: `<code>//</code> gives the whole trays and <code>%</code> gives the remainder.
Start from <code>100</code> and <code>12</code>.`,
      solution: "samples = 100\nper_tray = 12\n\nfull_trays = samples // per_tray\nleft_over = samples % per_tray\n\nprint(full_trays, left_over)",
      checks: [
        {
          label: "full_trays is 8",
          test: function (c) { return c.get("full_trays") === 8 || "full_trays is " + c.get("full_trays") + "."; }
        },
        {
          label: "left_over is 4",
          test: function (c) { return c.get("left_over") === 4 || "left_over is " + c.get("left_over") + "."; }
        },
        {
          label: "Both were calculated, not typed in",
          test: function (c) {
            return (/full_trays\s*=[^=\n]*\/\//.test(c.code) && /left_over\s*=[^=\n]*%/.test(c.code)) ||
              "Use // for full_trays and % for left_over.";
          }
        }
      ]
    },

    {
      id: "ch03-brackets-beat-memory",
      title: "Brackets beat memory",
      prose: `
<p>Python follows the usual order of operations: powers first, then multiply and divide, then
add and subtract, left to right. So <code>2 + 3 * 4</code> is <code>14</code>, not
<code>20</code>.</p>

<p>You could memorise the full precedence table. Do not bother. <strong>Use round brackets
whenever there is the slightest doubt.</strong> They cost nothing, they never change the
answer when they agree with the default, and they make the line readable:</p>

<pre><code>mean = (a + b + c) / 3        # obvious
mean = a + b + c / 3          # silently wrong</code></pre>
`,
      starter: "a = 10\nb = 20\nc = 30\n\nmean = a + b + c / 3\nprint(mean)",
      task: `<p>The line is wrong: it prints <code>40.0</code> instead of the mean.
Fix it with brackets so it prints <code>20.0</code>.</p>`,
      hint: `Everything being added must happen before the division.`,
      solution: "a = 10\nb = 20\nc = 30\n\nmean = (a + b + c) / 3\nprint(mean)",
      checks: [
        {
          label: "mean is 20.0",
          test: function (c) {
            var m = c.get("mean");
            return m === 20 || "mean is " + m + ".";
          }
        },
        {
          label: "It is still a calculation, not a typed-in answer",
          test: function (c) {
            return /mean\s*=\s*\(/.test(c.code) && /a/.test(c.code.split("mean")[1] || "") ||
              "Keep using a, b and c — just add brackets.";
          }
        }
      ]
    },

    {
      id: "ch03-converting-rounding",
      title: "Converting and rounding",
      prose: `
<p>Four functions you will use forever:</p>
<ul>
<li><code>int(x)</code> — turn into a whole number by <strong>chopping off</strong> the
decimal part. <code>int(3.9)</code> is <code>3</code>, not 4.</li>
<li><code>round(x)</code> — turn into the <strong>nearest</strong> whole number.
<code>round(3.9)</code> is <code>4</code>. You can ask for decimal places too:
<code>round(3.14159, 2)</code> is <code>3.14</code>.</li>
<li><code>float(x)</code> — turn into a decimal number.</li>
<li><code>abs(x)</code> — the size, ignoring the minus sign. <code>abs(-7)</code> is
<code>7</code>.</li>
</ul>

<p><code>int()</code> and <code>float()</code> also work on text that looks like a number:
<code>int("42")</code> gives the number <code>42</code>. You will need that the first time you
read numbers out of a file, because everything in a file is text.</p>
`,
      starter: "reading = 36.7492\n\n# your lines here\n\nprint(rounded)\nprint(chopped)",
      task: `<p>Set <code>rounded</code> to the reading rounded to <strong>two</strong> decimal
places, and <code>chopped</code> to the reading with the decimals thrown away entirely.
The output should be <code>36.75</code> then <code>36</code>.</p>`,
      hint: `<code>round</code> takes a second argument for decimal places.
<code>int</code> takes only the one.`,
      solution: "reading = 36.7492\n\nrounded = round(reading, 2)\nchopped = int(reading)\n\nprint(rounded)\nprint(chopped)",
      checks: [
        {
          label: "rounded is 36.75",
          test: function (c) { return c.get("rounded") === 36.75 || "rounded is " + c.get("rounded") + "."; }
        },
        {
          label: "chopped is 36",
          test: function (c) { return c.get("chopped") === 36 || "chopped is " + c.get("chopped") + "."; }
        },
        {
          label: "Both come from the reading variable",
          test: function (c) {
            return /rounded\s*=\s*round\s*\(\s*reading/.test(c.code) &&
              /chopped\s*=\s*int\s*\(\s*reading/.test(c.code) ||
              "Use round(reading, 2) and int(reading) rather than typing the answers.";
          }
        }
      ]
    },

    {
      id: "ch03-challenge-seconds-into-minutes",
      title: "Challenge: seconds into minutes",
      prose: `
<p>Nothing new here — this is the first time you put several pieces together on your own.
Take a moment before you type anything and work out, on paper or in your head, which two
operators you need.</p>
`,
      starter: "total_seconds = 500\n\n# minutes = ?\n# seconds = ?\n\nprint(minutes, \"minutes and\", seconds, \"seconds\")",
      task: `<p>Given <code>total_seconds</code>, work out <code>minutes</code> and
<code>seconds</code> so the output reads <code>8 minutes and 20 seconds</code>. It must still
be correct if someone changes 500 to a different number — so no typing in 8 and 20.</p>`,
      hint: `There are 60 seconds in a minute. Whole minutes is a floor division by 60; the
seconds left over is a modulo by 60.`,
      solution: "total_seconds = 500\n\nminutes = total_seconds // 60\nseconds = total_seconds % 60\n\nprint(minutes, \"minutes and\", seconds, \"seconds\")",
      checks: [
        {
          label: "It prints “8 minutes and 20 seconds”",
          test: function (c) {
            return c.out === "8 minutes and 20 seconds" || "The output was “" + c.out + "”.";
          }
        },
        {
          label: "It still works for a different number of seconds",
          test: function (c) {
            var swapped = c.code.replace(/total_seconds\s*=\s*500/, "total_seconds = 1000");
            if (swapped === c.code) { return "Keep the variable named total_seconds."; }
            var r = c.rerun(swapped);
            if (r.error) { return "It broke when the input changed: " + r.error.split("\n").pop(); }
            return r.out === "16 minutes and 40 seconds" ||
              "With 1000 seconds it printed “" + r.out + "”, but it should print " +
              "“16 minutes and 40 seconds”. Something is hard-coded.";
          }
        }
      ]
    }
  ]
});
