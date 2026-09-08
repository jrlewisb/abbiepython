WB.chapter({
  id: "ch05",
  part: "Part 1 — The absolute basics",
  title: "How Python actually runs your code",
  steps: [

    {
      id: "ch05-one-line-at-time",
      title: "One line at a time, top to bottom",
      prose: `
<p>This chapter has no new syntax in it. It is about building the right picture in your head
of what the computer is doing, because almost every confusing bug you will ever have comes
from that picture being slightly wrong.</p>

<p>Here is the whole model:</p>

<div class="note"><span class="lbl">The model</span>
<p>Python starts at the first line. It does that line completely. Then it moves to the next
one. It never looks ahead, and it never goes back unless you explicitly tell it to.</p></div>

<p>That is it. Everything else in this course is a variation on that sentence.</p>

<p>Run the code below and watch the order the messages come out in. Then add a
<code>print</code> between two of the lines to prove to yourself where Python was at that
moment.</p>
`,
      starter: 'print("step one")\n\nx = 10\nprint("x is now", x)\n\nx = x * 3\nprint("x is now", x)\n\nprint("step last")'
    },

    {
      id: "ch05-nothing-exists-until-its",
      title: "Nothing exists until its line has run",
      prose: `
<p>A variable is created by the line that assigns to it. Before that line has run, the name
means nothing at all — and Python will tell you so, in the bluntest possible terms:
<code>NameError: name 'total' is not defined</code>.</p>

<p>This is the single most common beginner error, and it is almost always the same cause:
the line that <em>uses</em> a variable is above the line that <em>makes</em> it.</p>

<div class="note"><span class="lbl">Why this is good news</span>
<p>A NameError is a friendly error. Python noticed, stopped, and told you the exact name and
the exact line. The errors you want to worry about are the ones that produce a plausible
wrong number in silence — and those are rarer than you would think.</p></div>

<p>Run this to see the error. Then fix it.</p>
`,
      starter: 'print("the total is", total)\n\nprice = 12\nquantity = 3\ntotal = price * quantity',
      task: `<p>Reorder the lines so the total is worked out <em>before</em> it is printed.
The output should read <code>the total is 36</code>.</p>`,
      hint: `Move the <code>print</code> line to the bottom. Nothing else needs to change.`,
      solution: 'price = 12\nquantity = 3\ntotal = price * quantity\n\nprint("the total is", total)',
      checks: [
        {
          label: "No NameError",
          test: function (c) {
            if (!c.error) { return true; }
            return "Still failing: " + c.error.split("\n").pop();
          }
        },
        {
          label: "It prints “the total is 36”",
          test: function (c) { return c.out === "the total is 36" || "Got “" + c.out + "”."; }
        },
        {
          label: "The total is still calculated, not typed in",
          test: function (c) {
            return /total\s*=\s*price\s*\*\s*quantity/.test(c.code) ||
              "Keep the line total = price * quantity — just move things around.";
          }
        }
      ]
    },

    {
      id: "ch05-run-head-first",
      title: "Run it in your head first",
      prose: `
<p>Being able to predict what code will do, before running it, is the skill this whole
chapter exists to build. It is what separates "changing things until it works" from
programming.</p>

<p>Here is a short snippet. <strong>Do not paste it in yet.</strong> Work through it line by
line on paper, keeping track of what each name holds:</p>

<pre><code>a = 2
b = a + 3
a = 10
print(a, b)</code></pre>

<p>The trap is line 3. When <code>a</code> changes, does <code>b</code> change with it?
Think back to chapter 2: <code>b</code> was handed the <em>answer</em> to <code>a + 3</code>
at the moment that line ran. It is a number in a box, not a live formula.</p>
`,
      starter: '# Work it out on paper first, then write your answer here,\n# exactly as Python would print it.\n\nprediction = ""',
      task: `<p>Set <code>prediction</code> to the exact text Python would print. Once the check
goes green, paste the snippet in underneath and run it to confirm you were right.</p>`,
      hint: `<code>print(a, b)</code> puts a single space between the two values. So the answer
is two numbers separated by a space.`,
      solution: 'prediction = "10 5"',
      checks: [
        {
          label: "Your prediction is correct",
          test: function (c) {
            var p = c.get("prediction");
            if (p === undefined) { return "Keep the variable named prediction."; }
            if (typeof p !== "string") { return "Write it as text in quotes, e.g. \"1 2\"."; }
            if (p.trim() === "") { return "Have a go — write what you think Python prints."; }
            if (p.trim() === "10 13") {
              return "Close, but b did not update when a changed. b was set to 5 back on line 2 " +
                "and nothing has touched it since.";
            }
            if (p.trim() === "2 5") {
              return "b is right, but a was reassigned to 10 on line 3.";
            }
            return p.trim() === "10 5" || "Not quite. Walk through it one line at a time, " +
              "writing down what a and b hold after each line.";
          }
        }
      ]
    },

    {
      id: "ch05-swapping-two-variables",
      title: "Swapping two variables",
      prose: `
<p>A classic, and a genuinely good test of whether the model has landed. You have two
variables and you want them to trade values.</p>

<p>The obvious attempt does not work:</p>

<pre><code>left = "A"
right = "B"

left = right      # left is now "B"
right = left      # ... but left is "B" now, so right becomes "B" too</code></pre>

<p>By the time line 2 runs, the original value of <code>left</code> is gone — nothing is
holding onto it any more. The fix is to park it somewhere first.</p>

<div class="note"><span class="lbl">Aside</span>
<p>Python does have a one-line shortcut for this (<code>a, b = b, a</code>) and you will meet
it in chapter 10. Do it the long way here — the point is the sequencing, not the trick.</p></div>
`,
      starter: 'left = "A"\nright = "B"\n\n# your lines here\n\nprint(left, right)',
      task: `<p>Make the output read <code>B A</code>, using a third variable to hold one of
the values while you move the other. Do not just type the letters in the other order.</p>`,
      hint: `Three lines: save <code>left</code> into something like <code>spare</code>, then
put <code>right</code> into <code>left</code>, then put <code>spare</code> into
<code>right</code>.`,
      solution: 'left = "A"\nright = "B"\n\nspare = left\nleft = right\nright = spare\n\nprint(left, right)',
      checks: [
        {
          label: "It prints “B A”",
          test: function (c) { return c.out === "B A" || "Got “" + c.out + "”."; }
        },
        {
          label: "The starting values were not just swapped by hand",
          test: function (c) {
            return /left\s*=\s*["']A["']/.test(c.code) && /right\s*=\s*["']B["']/.test(c.code) ||
              "Leave the first two lines alone — left starts as \"A\" and right starts as \"B\".";
          }
        },
        {
          label: "It works for any two values, not just A and B",
          test: function (c) {
            var swapped = c.code
              .replace(/left\s*=\s*["']A["']/, 'left = "north"')
              .replace(/right\s*=\s*["']B["']/, 'right = "south"');
            var r = c.rerun(swapped);
            if (r.error) { return "It broke on other values: " + r.error.split("\n").pop(); }
            return r.out === "south north" ||
              "With \"north\" and \"south\" it printed “" + r.out + "”. Something is hard-coded.";
          }
        }
      ]
    }
  ]
});
