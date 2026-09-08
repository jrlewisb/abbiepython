WB.chapter({
  id: "ch02",
  part: "Part 1 — The absolute basics",
  title: "Variables",
  steps: [

    {
      id: "ch02-bother-giving-things-names",
      title: "Why bother giving things names?",
      prose: `
<p>Before the how, the why — because variables are the idea the entire rest of this course
sits on, and they look pointless until you have felt the problem they solve.</p>

<p>Here is a small script. It works out a dose from a participant's body weight: 0.5 mg for
every kilogram. The participant weighs 72 kg.</p>

<pre><code>print("dose now:", 72 * 0.5)
print("over three days:", 72 * 0.5 * 3)
print("half dose:", 72 * 0.5 / 2)</code></pre>

<p>It runs. It gives the right answers. And it is a small disaster waiting to happen.</p>

<h3>The problem</h3>

<p>You go back and check the file. The participant is actually <strong>68 kg</strong>.</p>

<p>Now you have to find every 72 and change it. Three of them here. In a real script it might
be fifteen, spread over two hundred lines. Miss one, and here is the thing that should
genuinely worry you: <strong>the program still runs perfectly happily</strong>. No error, no
warning, no red text. It just quietly prints one wrong number in among the right ones, and
you have no way of knowing.</p>

<p>Now the same thing with the weight given a name:</p>

<pre><code>weight_kg = 68

print("dose now:", weight_kg * 0.5)
print("over three days:", weight_kg * 0.5 * 3)
print("half dose:", weight_kg * 0.5 / 2)</code></pre>

<p>One place to change. It is impossible to miss one, because there is only one.</p>

<h3>The three reasons, in order of how much they matter</h3>

<ol>
<li><strong>One fact lives in one place.</strong> When it changes, you change it once. This is
the big one, and it stays the big one forever.</li>
<li><strong>The name explains the number.</strong> <code>72</code> tells you nothing.
<code>weight_kg</code> tells you what it is <em>and</em> what units it is in. When you open
this file in six months — or when a reviewer asks what you did — the name is the
explanation.</li>
<li><strong>You cannot build anything without them.</strong> Every useful program works
something out and then uses that answer on a later line. A variable is the only way to hand
a result from one line to the next.</li>
</ol>

<div class="note"><span class="lbl">If you have used a spreadsheet</span>
<p>A variable is close to a cell you have given a name to. You put <code>68</code> in it once
and refer to it from everywhere else, instead of typing 68 into fifteen formulas. Same
instinct, same payoff — anyone who has ever had to fix a spreadsheet where a number was typed
in by hand fifteen times already understands why this matters.</p></div>
`,
      starter: '# Dose = 0.5 mg per kilogram of body weight.\n\nprint("dose now:", 72 * 0.5)\nprint("over three days:", 72 * 0.5 * 3)\nprint("half dose:", 72 * 0.5 / 2)',
      task: `<p>Fix this script the way you have just been shown.</p>
<ol>
<li>Add a line at the top that puts the weight in a variable called
<code>weight_kg</code>.</li>
<li>Replace all three <code>72</code>s with <code>weight_kg</code>.</li>
<li>Now that there is only one place to change it — correct the weight to
<strong>68</strong>.</li>
</ol>
<p>The output should be:</p>
<pre><code>dose now: 34.0
over three days: 102.0
half dose: 17.0</code></pre>`,
      hint: `First line: <code>weight_kg = 68</code>. Then in each print, swap the
<code>72</code> for <code>weight_kg</code>. When you are done, the number 72 should not
appear anywhere in the file, and 68 should appear exactly once.`,
      solution: '# Dose = 0.5 mg per kilogram of body weight.\n\nweight_kg = 68\n\nprint("dose now:", weight_kg * 0.5)\nprint("over three days:", weight_kg * 0.5 * 3)\nprint("half dose:", weight_kg * 0.5 / 2)',
      checks: [
        {
          label: "There is a variable called weight_kg holding 68",
          test: function (c) {
            var w = c.get("weight_kg");
            if (w === undefined) { return "No variable called weight_kg yet."; }
            return w === 68 || "weight_kg is " + w + ", and the corrected weight is 68.";
          }
        },
        {
          label: "The number 72 has gone from the file entirely",
          test: function (c) {
            return !/\b72\b/.test(c.code) ||
              "72 still appears somewhere. Every one of them should now be weight_kg.";
          }
        },
        {
          label: "The weight is written down exactly once",
          test: function (c) {
            var n = (c.code.match(/\b68\b/g) || []).length;
            if (n === 0) { return "The weight 68 does not appear at all."; }
            return n === 1 || "68 appears " + n + " times. That is the problem we are " +
              "solving — it should be written once, at the top, and referred to by name after that.";
          }
        },
        {
          label: "The three doses are right for a 68 kg participant",
          test: function (c) {
            var want = ["dose now: 34.0", "over three days: 102.0", "half dose: 17.0"];
            for (var i = 0; i < 3; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "Changing the weight once now updates every line",
          test: function (c) {
            var r = c.rerun(c.code.replace(/weight_kg\s*=\s*68/, "weight_kg = 100"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            var want = ["dose now: 50.0", "over three days: 150.0", "half dose: 25.0"];
            for (var i = 0; i < 3; i++) {
              if (r.outLines[i] !== want[i]) {
                return "Setting weight_kg to 100 should have changed every line, but line " +
                  (i + 1) + " came out as “" + r.outLines[i] + "”. One of them is still not " +
                  "using the variable.";
              }
            }
            return true;
          }
        }
      ]
    },

    {
      id: "ch02-label-on-box",
      title: "A label on a box",
      prose: `
<p>Now the mechanics, which are mercifully simple.</p>

<pre><code>p = 50</code></pre>

<p>Read that out loud as "<em>p is now 50</em>". Python takes the value 50, puts it somewhere
in the computer's memory, and sticks a label reading <code>p</code> on it. From that point on,
anywhere you write <code>p</code>, Python goes and looks in the box.</p>

<p>Three things happen on that one line, and it is worth being able to name them:</p>

<ul>
<li><code>p</code> — the <strong>name</strong> you chose. You could have called it anything.</li>
<li><code>=</code> — the instruction "put the thing on the right into the thing on the
left".</li>
<li><code>50</code> — the <strong>value</strong> being stored.</li>
</ul>

<p>So <code>print(p)</code> shows <code>50</code>. Notice there are no quotes around
<code>p</code>. That matters: <code>print("p")</code> would print the letter p, because
quotes mean "these exact characters". Without quotes, Python treats it as a name to look
up.</p>

<div class="note"><span class="lbl">The two ways this goes wrong at first</span>
<p><code>print("p")</code> prints the letter, not the value — you quoted a name.</p>
<p><code>print(weight)</code> when you never made a <code>weight</code> gives you
<code>NameError: name 'weight' is not defined</code> — Python looked for a box with that
label and there wasn't one. It is not being difficult; it genuinely has no idea what you
mean.</p></div>

<p>Run the code below and you will see <code>50</code>.</p>
`,
      starter: "p = 50\n\nprint(p)",
      task: `<p>Without touching the <code>print</code> line, make <strong>999</strong>
appear.</p>`,
      hint: `There is only one other line. Change the number on it. This is the whole point of
the previous step — you change the value in one place and everything that uses it follows.`,
      solution: "p = 999\n\nprint(p)",
      checks: [
        {
          label: "p holds the value 999",
          test: function (c) {
            var p = c.get("p");
            if (p === undefined) { return "There is no variable called p any more — keep the name p."; }
            return p === 999 || "p is " + p + ", not 999.";
          }
        },
        {
          label: "999 appears in the output",
          test: function (c) { return c.out === "999" || "The output was “" + c.out + "”."; }
        },
        {
          label: "The print line still prints the variable, not the number",
          test: function (c) {
            return /print\(\s*p\s*\)/.test(c.code) ||
              "Leave the last line as print(p) — the point is that p is what changed, and the " +
              "print line did not have to know about it.";
          }
        }
      ]
    },

    {
      id: "ch02-does-mean-equals",
      title: "= does not mean “equals”",
      prose: `
<p>This is the single most common stumble for anyone arriving from maths or statistics, so it
is worth slowing right down.</p>

<p>In algebra, <code>x = x + 3</code> is nonsense. No number is three more than itself.</p>

<p>In Python, <code>=</code> is not a claim about the world. It is an
<strong>instruction</strong>, and it happens in a specific order:</p>

<ol>
<li>Work out everything on the <strong>right</strong> of the <code>=</code>, completely.</li>
<li>Put that answer into the box named on the <strong>left</strong>, throwing away whatever
was in it.</li>
</ol>

<p>So:</p>

<pre><code>x = 5        # box x now holds 5
x = x + 3    # right side first: look in x, find 5, add 3, get 8.
             # then: put 8 into x. The old 5 is gone.
             # x now holds 8</code></pre>

<div class="note"><span class="lbl">A way to picture it</span>
<p>Think of a jar with a label. <code>x = x + 3</code> means: tip out what is in the jar,
count it, add three, put the new amount back in. It is a sequence of physical actions, not a
statement of fact. That is why the same name can appear on both sides without the universe
collapsing.</p></div>

<p>Because of this, <strong>order matters enormously</strong>. Python runs lines top to
bottom, one at a time, and a variable does not exist until the line that creates it has
actually run. This will come up again properly in chapter 5, because it explains most
confusing bugs.</p>

<p>One more piece of everyday shorthand, since you will see it everywhere:
<code>x += 3</code> means exactly the same as <code>x = x + 3</code>. Same for
<code>-=</code>, <code>*=</code> and <code>/=</code>.</p>
`,
      starter: "x = 5\nx = x + 3\nprint(x)",
      task: `<p>Add exactly <strong>one</strong> line, anywhere you like among the existing
ones, so that the printed answer is <code>20</code>. Do not edit the lines that are already
there.</p>`,
      hint: `Run it first and see what it prints on its own — that tells you what x holds
before your line. Then work out what single operation gets you from there to 20.`,
      solution: "x = 5\nx = x + 3\nx = x + 12\nprint(x)",
      checks: [
        {
          label: "The output is 20",
          test: function (c) { return c.out === "20" || "It printed “" + c.out + "”."; }
        },
        {
          label: "The original three lines are untouched",
          test: function (c) {
            var need = ["x = 5", "x = x + 3", "print(x)"];
            var got = c.code.split("\n").map(function (l) { return l.trim(); })
              .filter(function (l) { return l.length; });
            for (var i = 0; i < need.length; i++) {
              if (got.indexOf(need[i]) < 0) { return "The line “" + need[i] + "” is gone or was edited."; }
            }
            return true;
          }
        },
        {
          label: "You added exactly one line",
          test: function (c) {
            var n = c.code.split("\n").filter(function (l) { return l.trim().length; }).length;
            return n === 4 || "There are " + n + " lines of code; there should be 4.";
          }
        }
      ]
    },

    {
      id: "ch02-naming-things",
      title: "Naming things",
      prose: `
<p>The rules first, because they are short. A name must:</p>
<ul>
<li>start with a letter or an underscore — not a digit</li>
<li>contain only letters, digits and underscores — no spaces, no dashes, no punctuation</li>
<li>not be a word Python has already claimed (<code>if</code>, <code>for</code>,
<code>class</code>, <code>import</code>…)</li>
</ul>

<p>Beyond the rules there is a convention that every Python programmer follows, and you should
too: <strong>lower_case_with_underscores</strong>. Not <code>trialCount</code>, not
<code>TrialCount</code> — <code>trial_count</code>. Nothing breaks if you ignore this, but
code that follows the convention is easier for other people to read, and "other people"
includes you next semester.</p>

<h3>Why the name is worth thinking about for five seconds</h3>

<p>Compare these two lines. Both are correct. Both do the same thing.</p>

<pre><code>x = n * 0.5

dose_mg = weight_kg * mg_per_kg</code></pre>

<p>The second one <strong>cannot be misread</strong>. You can see the units. You can see that
it is a dose. If it were wrong — if someone had written <code>weight_kg * 0.5</code> where the
protocol said 0.6 — you would have a chance of spotting it. In the first line you would have
no chance at all, because there is nothing to compare against.</p>

<p>Good names are not tidiness. They are the main way code tells you when it is wrong.</p>

<div class="note warn"><span class="lbl">Case matters</span>
<p><code>Total</code> and <code>total</code> are two completely different variables. Python
will not warn you about this — it will either use the wrong one or tell you the name is not
defined, and both are annoying to track down.</p></div>
`,
      starter: "# This works, but the names tell you nothing.\nq = 12\nZZ = 4\nprint(q, ZZ)",
      task: `<p>These are eggs. Rewrite it so the first variable is called
<code>eggs_per_box</code> and the second is called <code>box_count</code>. Keep the same
values, and keep printing both.</p>`,
      hint: `Change the name on the left of each <code>=</code>, and change the names inside
<code>print(...)</code> to match. Four places in total — if you miss one, you will get a
NameError telling you exactly which.`,
      solution: "eggs_per_box = 12\nbox_count = 4\nprint(eggs_per_box, box_count)",
      checks: [
        {
          label: "eggs_per_box is 12",
          test: function (c) { return c.get("eggs_per_box") === 12 || "eggs_per_box is not 12."; }
        },
        {
          label: "box_count is 4",
          test: function (c) { return c.get("box_count") === 4 || "box_count is not 4."; }
        },
        {
          label: "The old names are gone",
          test: function (c) {
            return (c.get("q") === undefined && c.get("ZZ") === undefined) ||
              "q or ZZ still exists — rename them rather than adding new lines alongside.";
          }
        },
        {
          label: "It prints 12 4",
          test: function (c) { return c.out === "12 4" || "The output was “" + c.out + "”."; }
        }
      ]
    },

    {
      id: "ch02-variables-built-from-other",
      title: "Variables built from other variables",
      prose: `
<p>Here is where the third reason from the first step shows up: handing a result from one line
to the next.</p>

<p>The right-hand side of an <code>=</code> can be any calculation, including one that uses
variables you made earlier:</p>

<pre><code>width = 3
height = 4
area = width * height
print(area)          # 12</code></pre>

<p>Now the top of your file is the <strong>inputs</strong> and everything below is
<strong>what follows from them</strong>. That is the shape of essentially every analysis
script you will ever write: settings at the top, work in the middle, results at the bottom.
Change a setting, rerun, get the new answer.</p>

<div class="note warn"><span class="lbl">One important difference from a spreadsheet</span>
<p>In Excel, a cell containing <code>=A1*B1</code> updates itself the moment A1 changes. A
Python variable does <strong>not</strong>. <code>area</code> was worked out once, at the
instant that line ran, and what it holds now is the number 12 — not the formula. Change
<code>width</code> afterwards and <code>area</code> sits there still holding 12.</p>
<p>The fix is not to worry about it: you change the input and run the script again from the
top. That is why the input goes at the top, and it is why "just run it again" is such a
common answer to "but what if the number changes".</p></div>
`,
      starter: "price = 4\nquantity = 7\n\n# your line here\n\nprint(total)",
      task: `<p>Add the line that makes <code>total</code> hold the full cost. Run it — it
should print <code>28</code>. Then change <code>quantity</code> to 10 and run again, and watch
the total follow along without you touching it.</p>`,
      hint: `Multiplication is <code>*</code>. The line looks like
<code>total = price * quantity</code>.`,
      solution: "price = 4\nquantity = 10\n\ntotal = price * quantity\n\nprint(total)",
      checks: [
        {
          label: "total is worked out from price and quantity, not typed in by hand",
          test: function (c) {
            return /total\s*=\s*(price\s*\*\s*quantity|quantity\s*\*\s*price)/.test(c.code) ||
              "Write total = price * quantity, so it recalculates when the inputs change.";
          }
        },
        {
          label: "quantity has been changed to 10",
          test: function (c) {
            var q = c.get("quantity");
            return q === 10 || "quantity is " + q + ". The second half of the task asks for 10.";
          }
        },
        {
          label: "It prints 40",
          test: function (c) { return c.out === "40" || "The output was “" + c.out + "”."; }
        }
      ]
    }
  ]
});
