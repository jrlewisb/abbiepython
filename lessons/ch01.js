WB.chapter({
  id: "ch01",
  part: "Part 1 — The absolute basics",
  title: "Your first program",
  steps: [

    {
      id: "ch01-this-thing",
      reading: [
        { title: "Automate the Boring Stuff with Python",
          url: "https://automatetheboringstuff.com/",
          note: "A whole beginner's book, free to read online. Al Sweigart writes for people who are not programmers and have a job to do. If you want a second voice explaining the same things, start here." },
      ],
      title: "What this thing is",
      prose: `
<p>Welcome. Before any code, one paragraph on what you are actually about to learn, because
"programming" sounds much more mysterious than it is.</p>

<h3>A program is a recipe</h3>

<p>That is not a cute analogy, it is nearly literal. A recipe is a list of instructions,
written in order, that someone follows one at a time to get a result. A program is the same
thing, except the someone is a computer, and the computer is <em>extremely</em> literal —
it will do exactly what you wrote, including the bits you did not mean.</p>

<p>The computer brings one thing to the deal that you do not have: it will follow those
instructions thirty thousand times, identically, without getting bored, distracted or
tired. That is the entire reason anybody does this. You are not learning to be a computer
scientist. You are learning to write down a procedure once — check every epoch, pull out
every subject's value, apply the same correction to all of it — so that a machine can carry
it out on data far too big to do by hand.</p>

<h3>What is on this page</h3>

<p>The dark box below is a <strong>code editor</strong>. The green <em>Run</em> button
underneath it does exactly what it says: a real Python interpreter is loaded into this
browser tab right now, and it will run whatever is in that box.</p>

<p>The line in it is one instruction. It says: take the words in the quotes, and show them
to me.</p>

<p>Press <strong>Run</strong>. Then change the words inside the quotes to something of your
own and press Run again.</p>

<div class="note"><span class="lbl">Read this bit properly</span>
<p>You cannot break anything here. Not the page, not your computer, not the workbook. The
worst outcome available to you is that Python prints a complaint and nothing happens.</p>
<p>And that will happen constantly — to you, and to every programmer who has ever lived.
Write something, run it, read the complaint, fix it, run it again. That loop
<strong>is</strong> the job. It is not a sign you are doing it wrong, and it never stops
being the loop, no matter how experienced you get. If you take one thing from this chapter,
take that.</p></div>
`,
      starter: 'print("Hello. I am a computer.")'
    },

    {
      id: "ch01-print-brackets-are",
      title: "print(), and what the brackets are for",
      prose: `
<p><code>print</code> is a <strong>function</strong>: a named thing that does a job for you.
You use a function by writing its name followed by round brackets, and you put what you want
it to work on inside those brackets:</p>

<pre><code>print("some words")
 ↑        ↑
 name    the thing you are handing it</code></pre>

<p>The quote marks matter. They tell Python "the stuff between these is text, not an
instruction". Text in quotes is called a <strong>string</strong> — as in a string of
characters. You can use single quotes <code>'like this'</code> or double quotes
<code>"like this"</code>, as long as you use the same kind at both ends.</p>

<p>You can print more than one thing at a time by separating them with commas. Python puts a
space between them for you.</p>
`,
      starter: 'print("one")\nprint("two", "three")\nprint(2026)',
      task: `<p>Add a fourth line that prints your own name.</p>`,
      hint: `Copy the shape of line 1 exactly, and swap the words between the quotes.
Do not forget the closing bracket.`,
      solution: 'print("one")\nprint("two", "three")\nprint(2026)\nprint("Abbie")',
      checks: [
        {
          label: "The code runs without an error",
          test: function (c) { return c.error ? "Python stopped: " + c.error.split("\n").pop() : true; }
        },
        {
          label: "It still prints the three original lines",
          test: function (c) {
            var L = c.outLines;
            return (L[0] === "one" && L[1] === "two three" && L[2] === "2026") ||
              "Keep the first three lines as they were, and add yours underneath.";
          }
        },
        {
          label: "There is a fourth line of output",
          test: function (c) {
            return c.outLines.length >= 4 || "Nothing new appeared. Did you add a fourth print line?";
          }
        }
      ]
    },

    {
      id: "ch01-errors-are-big-deal",
      title: "Errors are not a big deal",
      prose: `
<p>Right now, the code below is broken. Run it and read what comes back.</p>

<p>Python's complaints look intimidating and are mostly boilerplate. The two parts that matter
are the <strong>last line</strong> — which says what went wrong — and the
<strong>line number</strong> — which says where. Everything in between is Python showing its
working.</p>

<p>Here the last line will say something like <code>SyntaxError: unterminated string
literal</code>. Translated into English: <em>you opened a quote and never closed it.</em></p>

<div class="note"><span class="lbl">A habit worth forming now</span>
<p>When something breaks, read the bottom line first. Then look at the line number. That is
90% of debugging, forever.</p></div>
`,
      starter: 'print("this quote is never closed)',
      task: `<p>Fix the line so it runs and prints <code>this quote is never closed</code>.</p>`,
      hint: `Something is missing right before the closing round bracket.`,
      solution: 'print("this quote is never closed")',
      checks: [
        {
          label: "No error",
          test: function (c) { return !c.error || "Still broken: " + c.error.split("\n").pop(); }
        },
        {
          label: "It prints the sentence",
          test: function (c) {
            return c.out === "this quote is never closed" ||
              "Expected exactly “this quote is never closed”, got “" + c.out + "”.";
          }
        }
      ]
    },

    {
      id: "ch01-notes-yourself-comments",
      title: "Notes to yourself: comments",
      prose: `
<p>A line starting with <code>#</code> is a <strong>comment</strong>. Python ignores it
completely. Comments are for humans — usually for you, six months later, wondering what on
earth you were doing.</p>

<pre><code># this line does nothing at all
print("this line does something")  # so does this bit, up to the #</code></pre>

<p>Good comments explain <em>why</em>, not <em>what</em>. <code># add 1 to x</code> is noise.
<code># skip the first trial, the participant was still reading the instructions</code> is
gold.</p>
`,
      starter: 'print("kept")\nprint("also kept")\nprint("this one should be silenced")',
      task: `<p>Without deleting it, stop the third line from printing. Add a comment above the
first line explaining what this snippet does.</p>`,
      hint: `Put a <code>#</code> at the very start of the third line. A comment on its own
line just starts with <code>#</code>.`,
      solution: '# prints two lines and demonstrates commenting out a third\nprint("kept")\nprint("also kept")\n# print("this one should be silenced")',
      checks: [
        {
          label: "Only two lines are printed",
          test: function (c) {
            return c.outLines.length === 2 ||
              "Expected 2 lines of output, got " + c.outLines.length + ".";
          }
        },
        {
          label: "The third line is commented out, not deleted",
          test: function (c) {
            return /#\s*print\(\s*["']this one should be silenced/.test(c.code) ||
              "Keep the line in the file — just put a # in front of it.";
          }
        },
        {
          label: "There is a comment of your own on its own line",
          test: function (c) {
            var own = c.code.split("\n").filter(function (l) {
              return /^\s*#/.test(l) && !/print\(/.test(l);
            });
            return own.length >= 1 || "Add a line that starts with # explaining what this does.";
          }
        }
      ]
    }
  ]
});
