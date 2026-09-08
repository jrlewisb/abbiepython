WB.chapter({
  id: "ch12",
  part: "Part 3 — Writing real code",
  title: "Errors and debugging",
  steps: [

    {
      id: "ch12-errors-are-good-news",
      title: "An error is the good outcome",
      prose: `
<p>Chapter 1 told you errors are normal. This chapter makes the stronger claim, and it is one
worth actually believing: <strong>an error is the best thing that can happen when your code is
wrong.</strong></p>

<p>Think about the two ways a mistake can end.</p>

<ul>
<li><strong>It crashes.</strong> Python stops, refuses to go further, and tells you the exact
line and the exact reason. Nothing downstream is contaminated. You have a name for the problem
before you have even started looking.</li>
<li><strong>It runs.</strong> You get a number. The number is wrong. Nothing anywhere says so.
It goes in the figure, the figure goes in the thesis.</li>
</ul>

<p>The second one is the disaster, and it is the one you should actually be afraid of. Every
error message you see is a case where Python caught something before it could become the
second kind. Being annoyed at a traceback is a bit like being annoyed at a smoke alarm.</p>

<h3>Errors are not a judgement</h3>

<p>You will see a great many of them, forever, at every level of experience. They are not a
sign you are bad at this or that you have missed something everyone else knows. Writing code
is a conversation: you say something slightly wrong, the computer says which bit it did not
understand, you say it better. The tracebacks are the computer's half of the conversation, not
a report card.</p>

<div class="note"><span class="lbl">What this chapter is for</span>
<p>Learning to read the message rather than react to it. Most beginners see a wall of red,
feel a small drop of dread, and start changing things at random. By the end of this chapter
you will read three specific bits of that wall and usually know exactly what to do — which is
genuinely most of what debugging is.</p></div>

<p>Run the code below. It contains a mistake. Look at what comes back and notice that it
tells you, in order: what went wrong, and where.</p>
`,
      starter: 'readings = [12, 7, 40]\n\ntotal = 0\nfor reading in readings:\n    total = total + reading\n\nprint("mean:", total / len(readngs))'
    },

    {
      id: "ch12-reading-a-traceback",
      reading: [
        { title: "Errors and exceptions",
          url: "https://docs.python.org/3/tutorial/errors.html",
          note: "The official chapter on tracebacks, try/except and the exception types." },
        { title: "Built-in exceptions, listed",
          url: "https://docs.python.org/3/library/exceptions.html",
          note: "When you meet an error type this workbook has not covered, it is defined here." },
      ],
      title: "How to read a traceback",
      prose: `
<p>Here is a real one. It looks like a lot. It is actually three facts and some scaffolding.</p>

<pre><code>Traceback (most recent call last):
  line 6, in &lt;module&gt;
  line 2, in f
ZeroDivisionError: division by zero</code></pre>

<h3>Read it from the bottom</h3>

<p><strong>1. The last line is what went wrong.</strong> Always. It has two halves separated
by a colon: the <em>type</em> of error (<code>ZeroDivisionError</code>) and a plain-English
explanation (<code>division by zero</code>). Read this line first, every time. Often it is
the only line you need.</p>

<p><strong>2. The line just above it is where it broke.</strong>
<code>line 2, in f</code> — the actual failure happened on line 2, inside a function called
<code>f</code>.</p>

<p><strong>3. The lines above that are how Python got there.</strong> Read top to bottom, they
are the trail: line 6 of the main script called <code>f</code>, and inside <code>f</code>,
line 2 blew up. That trail is why it is called a traceback — it traces back the path.</p>

<p>The deeper the trail, the more useful this is. When a library you did not write appears in
the middle of it, the frame you care about is almost always the last one that is
<em>your</em> code.</p>

<div class="note"><span class="lbl">One error at a time</span>
<p>Python stops at the first thing it cannot do, so a traceback only ever shows you one
problem, even if there are five. Fix the one you are shown, run it again, and see what the
next one is. Trying to spot them all before running again is wasted effort.</p></div>
`,
      starter: '# Read the traceback in the lesson above and fill these in.\n\nerror_type = ""\nbroke_at_line = 0\ncalled_from_line = 0\n\nprint(error_type, broke_at_line, called_from_line)',
      task: `<p>Using the traceback above, fill in the three answers: the type of error, the
line number where it actually broke, and the line number that called into it.</p>`,
      hint: `Every one of the three answers is written somewhere in those four lines. The type
is the first word of the last line.`,
      solution: '# Read the traceback in the lesson above and fill these in.\n\nerror_type = "ZeroDivisionError"\nbroke_at_line = 2\ncalled_from_line = 6\n\nprint(error_type, broke_at_line, called_from_line)',
      checks: [
        {
          label: "The error type is right",
          test: function (c) {
            var v = c.get("error_type");
            if (typeof v !== "string" || !v) { return "Write the error type as text in quotes."; }
            if (v.trim() === "division by zero") {
              return "That is the explanation half. The type is the bit before the colon.";
            }
            return v.trim() === "ZeroDivisionError" || "You put “" + v + "”.";
          }
        },
        {
          label: "The line it broke on is right",
          test: function (c) {
            var v = c.get("broke_at_line");
            if (v === 6) {
              return "Line 6 is where the call came from. The break happened deeper in — " +
                "the frame nearest the error message.";
            }
            return v === 2 || "You put " + v + ".";
          }
        },
        {
          label: "The line that called into it is right",
          test: function (c) {
            var v = c.get("called_from_line");
            if (v === 2) { return "That is where it broke. This one asks what called it."; }
            return v === 6 || "You put " + v + ".";
          }
        }
      ]
    },

    {
      id: "ch12-five-errors",
      title: "The five you will actually meet",
      prose: `
<p>There are dozens of error types. In practice, five of them account for almost everything
you will hit in your first year. Learning to translate them on sight is a genuinely large
speed-up.</p>

<h3>NameError: name 'x' is not defined</h3>
<p><em>You used a name that does not exist.</em> Usually a typo, or the line that creates it
is below the line that uses it. Check the spelling first — <code>readngs</code> and
<code>readings</code> look identical at a glance.</p>

<h3>TypeError: ... </h3>
<p><em>The right operation, the wrong kind of thing.</em> Adding a number to a string.
Calling something that is not a function. The <code>NoneType</code> flavour from chapter 11
means a function printed when it should have returned.</p>

<h3>IndexError / KeyError</h3>
<p><em>You asked for something that is not there.</em> <code>IndexError</code> is a list
position past the end — remember, a list of 5 has positions 0 to 4. <code>KeyError</code> is
a dictionary key that does not exist; use <code>.get()</code> when it might be missing.</p>

<h3>ValueError: ...</h3>
<p><em>Right type, impossible value.</em> The classic is <code>int("hello")</code> — it is a
string as expected, but there is no number in it. You will meet this constantly when reading
data files, because everything in a file arrives as text and some of it is not what you
hoped.</p>

<h3>IndentationError / SyntaxError</h3>
<p><em>Python could not even read your code.</em> Nothing ran at all. Look for a missing
colon, an unclosed bracket or quote, or indentation that does not line up. If the flagged line
looks perfect, check the line <strong>above</strong> it — an unclosed bracket makes Python
complain about the next line.</p>
`,
      starter: 'temperatures = [18, 22, 25]\n\nlabel = "readings: "\nprint(label + len(temperatures))\n\nprint(temperatures[3])\n\nprint(avarage)',
      task: `<p>Three errors, and Python will only show you one at a time. Fix them one by one,
running after each, until it prints:</p>
<pre><code>readings: 3
25
21.666666666666668</code></pre>
<p>The third line is the mean of the temperatures — you will need to make that variable, and
spell it correctly.</p>`,
      hint: `First error: you cannot add a number to a string — wrap it in
<code>str(...)</code>. Second: the last position of a 3-item list is 2, or use
<code>-1</code>. Third: <code>avarage</code> is a typo and the variable does not exist yet —
create <code>average</code> from <code>sum</code> and <code>len</code>, and print that.`,
      solution: 'temperatures = [18, 22, 25]\n\nlabel = "readings: "\nprint(label + str(len(temperatures)))\n\nprint(temperatures[-1])\n\naverage = sum(temperatures) / len(temperatures)\nprint(average)',
      checks: [
        {
          label: "It runs without an error",
          test: function (c) {
            return !c.error || "Still stopping with: " + c.error.split("\n").pop();
          }
        },
        {
          label: "The three lines are right",
          test: function (c) {
            var want = ["readings: 3", "25", "21.666666666666668"];
            for (var i = 0; i < 3; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "The mean is calculated, not typed in",
          test: function (c) {
            return /sum\s*\(\s*temperatures\s*\)/.test(c.code) ||
              "Work the mean out with sum(temperatures) / len(temperatures).";
          }
        },
        {
          label: "It still works with different temperatures",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\[18, 22, 25\]/, "[10, 20]"));
            if (r.error) { return "It broke on a shorter list: " + r.error.split("\n").pop(); }
            return (r.outLines[0] === "readings: 2" && r.outLines[1] === "20" &&
                    r.outLines[2] === "15.0") ||
              "On [10, 20] it printed: " + JSON.stringify(r.outLines);
          }
        }
      ]
    },

    {
      id: "ch12-print-debugging",
      title: "The technique everybody actually uses",
      prose: `
<p>There are sophisticated debugging tools. Working programmers, including very good ones,
solve most problems by adding <code>print</code> statements. It is not a beginner's crutch —
it is the fastest way to answer the only question that matters: <strong>what is actually in
that variable at that moment?</strong></p>

<p>Almost every bug is a gap between what you think a value is and what it is. Printing closes
the gap.</p>

<pre><code>for row in rows:
    print("row is:", row)            # what am I actually looping over?
    value = row.split(",")[2]
    print("  value is:", repr(value))  # what did I actually get?</code></pre>

<div class="note"><span class="lbl">Two habits that make it much better</span>
<p><strong>Label your prints.</strong> <code>print("total:", total)</code>, not
<code>print(total)</code>. Ten unlabelled numbers scrolling past tell you nothing.</p>
<p><strong>Use <code>repr()</code> when text is involved.</strong> <code>print(value)</code>
shows <code>42</code> whether the value is the number 42 or the string "42", and shows
nothing at all for an empty string or a stray space. <code>print(repr(value))</code> shows
<code>42</code> versus <code>'42'</code> versus <code>' 42\\n'</code> — and that difference is
the entire bug, surprisingly often.</p></div>

<p>The code below should print the mean of the valid numbers, but it prints something wrong.
Add prints, find the bad value, then fix the code.</p>
`,
      starter: 'values = ["12", "7", "", "40", "3"]\n\ntotal = 0\ncount = 0\n\nfor v in values:\n    total = total + int(v)\n    count = count + 1\n\nprint("mean:", total / count)',
      task: `<p>Run it and read the error. One entry in the list is not a number. Fix the loop
so it skips any entry that is empty, counting and totalling only the real ones. It should
print <code>mean: 15.5</code>.</p>`,
      hint: `An empty string is falsy (chapter 6), so <code>if not v: continue</code> at the
top of the loop skips it. Or test <code>if v == "": continue</code>.`,
      solution: 'values = ["12", "7", "", "40", "3"]\n\ntotal = 0\ncount = 0\n\nfor v in values:\n    if not v:\n        continue\n    total = total + int(v)\n    count = count + 1\n\nprint("mean:", total / count)',
      checks: [
        {
          label: "It runs without a ValueError",
          test: function (c) {
            return !c.error || "Still failing: " + c.error.split("\n").pop();
          }
        },
        {
          label: "It prints mean: 15.5",
          test: function (c) {
            var last = c.outLines[c.outLines.length - 1];
            return last === "mean: 15.5" || "The last line was “" + last + "”.";
          }
        },
        {
          label: "The empty entry was skipped, not counted",
          test: function (c) {
            return c.get("count") === 4 ||
              "count is " + c.get("count") + " — it should be 4, the number of real values.";
          }
        },
        {
          label: "It handles a list with more gaps in it",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\["12", "7", "", "40", "3"\]/, '["10", "", "", "20"]'));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            var last = r.outLines[r.outLines.length - 1];
            return last === "mean: 15.0" ||
              'On ["10", "", "", "20"] it printed “' + last + '”, expected “mean: 15.0”.';
          }
        }
      ]
    },

    {
      id: "ch12-try-except",
      title: "try / except: handling what you expect to go wrong",
      prose: `
<p>Sometimes a failure is not a bug — it is just what data is like. One participant's file has
a blank cell. One row has <code>n/a</code> where a number should be. You do not want the whole
analysis to stop because of row 4,000 of 12,000.</p>

<p><code>try</code> / <code>except</code> lets you attempt something and decide what to do if
it fails:</p>

<pre><code>try:
    value = int(text)
except ValueError:
    value = None        # not a number — record that and move on</code></pre>

<p>Python runs the <code>try</code> block. If it raises the kind of error you named, it runs
the <code>except</code> block instead of stopping. If nothing goes wrong, the
<code>except</code> block is skipped entirely.</p>

<div class="note warn"><span class="lbl">Name the error you expect</span>
<p>Write <code>except ValueError:</code>, not a bare <code>except:</code>.</p>
<p>A bare except catches <em>everything</em> — including the typo in your variable name, the
file that was never opened, and the mistake you have not found yet. You end up with a script
that silently swallows real bugs and produces confident nonsense, which is the exact failure
mode this whole chapter is trying to protect you from. Catch the specific thing you are
prepared to handle, and let everything else crash loudly.</p></div>

<h3>When to use it, and when not to</h3>

<p>Use it for problems that come from <strong>outside</strong> your code: messy data, a
missing file, a value that could legitimately be anything. Do not use it to paper over a bug
in your own logic — if <code>total</code> is sometimes undefined, the fix is to define it,
not to catch the NameError.</p>
`,
      starter: 'raw = ["12", "7", "n/a", "40", "", "3", "twenty"]\n\nnumbers = []\nrejected = []\n\nfor text in raw:\n    # your code here\n    pass\n\nprint(numbers)\nprint(rejected)\nprint(f"mean of the usable ones: {sum(numbers) / len(numbers):.2f}")',
      task: `<p>Convert each entry to a whole number. The ones that convert go into
<code>numbers</code>; the ones that do not go into <code>rejected</code>, as their original
text. Catch <code>ValueError</code> specifically. Expected output:</p>
<pre><code>[12, 7, 40, 3]
['n/a', '', 'twenty']
mean of the usable ones: 15.50</code></pre>`,
      hint: `Inside the loop:
<pre><code>try:
    numbers.append(int(text))
except ValueError:
    rejected.append(text)</code></pre>`,
      solution: 'raw = ["12", "7", "n/a", "40", "", "3", "twenty"]\n\nnumbers = []\nrejected = []\n\nfor text in raw:\n    try:\n        numbers.append(int(text))\n    except ValueError:\n        rejected.append(text)\n\nprint(numbers)\nprint(rejected)\nprint(f"mean of the usable ones: {sum(numbers) / len(numbers):.2f}")',
      checks: [
        {
          label: "The numbers that convert are kept, in order",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            return JSON.stringify(c.get("numbers")) === "[12,7,40,3]" ||
              "numbers is " + JSON.stringify(c.get("numbers")) + ".";
          }
        },
        {
          label: "The ones that do not convert are kept as their original text",
          test: function (c) {
            return JSON.stringify(c.get("rejected")) === '["n/a","","twenty"]' ||
              "rejected is " + JSON.stringify(c.get("rejected")) + ".";
          }
        },
        {
          label: "You caught ValueError specifically, not everything",
          test: function (c) {
            if (/except\s*:/.test(c.code)) {
              return "That is a bare except — it would also swallow your own mistakes. " +
                "Write except ValueError:";
            }
            return /except\s+ValueError\s*:/.test(c.code) || "Use except ValueError:";
          }
        },
        {
          label: "It copes with data it has never seen",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\["12", "7", "n\/a", "40", "", "3", "twenty"\]/,
              '["5", "?", "15"]'));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (JSON.stringify(r.get("numbers")) !== "[5,15]") {
              return 'On ["5", "?", "15"] numbers came out as ' +
                JSON.stringify(r.get("numbers")) + ".";
            }
            return JSON.stringify(r.get("rejected")) === '["?"]' ||
              "rejected came out as " + JSON.stringify(r.get("rejected")) + ".";
          }
        }
      ]
    }
  ]
});
