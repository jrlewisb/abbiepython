WB.chapter({
  id: "ch04",
  part: "Part 1 — The absolute basics",
  title: "Text",
  steps: [

    {
      id: "ch04-strings-gluing-them-together",
      title: "Strings, and gluing them together",
      prose: `
<p>A <strong>string</strong> is text: anything between a matching pair of quotes. Single or
double, your choice — pick one and be consistent, except when the text itself contains a
quote, in which case use the other kind:</p>

<pre><code>name = "Abbie"
line = 'she said "hello" and left'</code></pre>

<p><code>+</code> on two strings glues them together. This catches people out, because
<code>+</code> on two numbers adds them. Python decides what <code>+</code> means from the
<em>types</em> either side.</p>

<p>And that is why the last line below fails. You cannot glue a number onto a string — Python
refuses to guess whether you meant text or arithmetic. Run it, read the error, then comment
that line out and run again.</p>
`,
      starter: 'first = "Ada"\nlast = "Lovelace"\n\nprint(first + " " + last)\nprint(2 + 2)\nprint("age: " + 36)',
      task: `<p>Comment out the broken last line so the rest runs cleanly.</p>`,
      hint: `A <code>#</code> at the start of the line.`,
      solution: 'first = "Ada"\nlast = "Lovelace"\n\nprint(first + " " + last)\nprint(2 + 2)\n# print("age: " + 36)',
      checks: [
        {
          label: "No error",
          test: function (c) { return !c.error || "Still erroring: " + c.error.split("\n").pop(); }
        },
        {
          label: "It prints the full name and the sum",
          test: function (c) {
            return (c.outLines[0] === "Ada Lovelace" && c.outLines[1] === "4") ||
              "Expected “Ada Lovelace” then “4”, got: " + JSON.stringify(c.outLines);
          }
        }
      ]
    },

    {
      id: "ch04-f-strings-good-way",
      title: "f-strings: the good way to build text",
      prose: `
<p>Gluing with <code>+</code> gets ugly fast, and it breaks the moment a number is involved.
The modern way is an <strong>f-string</strong>: put an <code>f</code> immediately before the
opening quote, and then anything inside curly braces is evaluated and dropped into the text.</p>

<pre><code>name = "Ada"
age = 36
print(f"{name} is {age} years old")     # Ada is 36 years old</code></pre>

<p>Anything can go in the braces — a variable, a calculation, a function call:</p>

<pre><code>print(f"next year she is {age + 1}")</code></pre>

<p>You can also format numbers inside the braces. <code>{value:.2f}</code> means "as a
decimal number with 2 places", which is how you stop 0.30000000000000004 appearing in your
results table.</p>
`,
      starter: 'participant = "P07"\ntrials = 240\naccuracy = 0.8733333\n\nprint("participant " + participant)\n',
      task: `<p>Replace that print with a single f-string that prints exactly:</p>
<pre><code>P07 completed 240 trials at 87.3% accuracy</code></pre>
<p>Use the variables, not the literal text. The percentage should come from
<code>accuracy</code> — multiply by 100 and show one decimal place with
<code>{...:.1f}</code>.</p>`,
      hint: `The braces can hold a calculation: <code>{accuracy * 100:.1f}</code>.`,
      solution: 'participant = "P07"\ntrials = 240\naccuracy = 0.8733333\n\nprint(f"{participant} completed {trials} trials at {accuracy * 100:.1f}% accuracy")\n',
      checks: [
        {
          label: "The output matches exactly",
          test: function (c) {
            return c.out === "P07 completed 240 trials at 87.3% accuracy" ||
              "Got “" + c.out + "”.";
          }
        },
        {
          label: "It is an f-string using the variables",
          test: function (c) {
            return /f["'][^"']*\{\s*participant\s*\}/.test(c.code) ||
              "Use an f-string with {participant} in it, rather than typing P07.";
          }
        },
        {
          label: "The percentage is calculated from accuracy",
          test: function (c) {
            return /\{\s*accuracy\s*\*\s*100\s*:\s*\.1f\s*\}/.test(c.code) ||
              "Put {accuracy * 100:.1f} in the f-string rather than typing 87.3.";
          }
        }
      ]
    },

    {
      id: "ch04-reaching-into-string",
      title: "Reaching into a string",
      prose: `
<p>A string is a sequence of characters, and you can grab them by position with square
brackets. <strong>Counting starts at 0.</strong> This is universal in programming and it will
feel wrong for about a week.</p>

<pre><code>word = "neuron"
#        012345
word[0]     # 'n'
word[3]     # 'r'
word[-1]    # 'n'  — negative counts back from the end</code></pre>

<p>You can take a <strong>slice</strong> with a colon. The rule to memorise:
<em>start is included, stop is not</em>.</p>

<pre><code>word[0:3]   # 'neu'   — characters 0, 1, 2
word[2:]    # 'uron'  — from 2 to the end
word[:2]    # 'ne'    — from the start up to (not including) 2</code></pre>

<p><code>len(word)</code> gives the number of characters. Because counting starts at 0, the
last valid position is always <code>len(word) - 1</code>.</p>
`,
      starter: 'code = "SUBJ-2041-B"\n\nsubject_id = ""\nprint(subject_id)',
      task: `<p>Using a slice, set <code>subject_id</code> to just the digits:
<code>2041</code> (as text, not a number). Do not type the digits yourself — slice them out
of <code>code</code>.</p>`,
      hint: `Count the characters: S=0, U=1, B=2, J=3, -=4, 2=5. So the digits start at 5.
They run to position 8, and the stop is not included, so the stop is 9.`,
      solution: 'code = "SUBJ-2041-B"\n\nsubject_id = code[5:9]\nprint(subject_id)',
      checks: [
        {
          label: "subject_id is the text 2041",
          test: function (c) {
            var v = c.get("subject_id");
            return v === "2041" || "subject_id is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It was sliced out of code, not typed",
          test: function (c) {
            return /subject_id\s*=\s*code\s*\[/.test(c.code) ||
              "Write subject_id = code[...] using a slice.";
          }
        }
      ]
    },

    {
      id: "ch04-things-strings-can-do",
      title: "Things strings can do to themselves",
      prose: `
<p>Strings come with built-in <strong>methods</strong> — functions attached to the value
itself, called with a dot. You will meet the dot properly later; for now, read
<code>text.upper()</code> as "ask this string for its upper-case version".</p>

<ul>
<li><code>.upper()</code> / <code>.lower()</code> — change case</li>
<li><code>.strip()</code> — remove spaces and line breaks from both ends</li>
<li><code>.replace(a, b)</code> — swap every occurrence of a for b</li>
<li><code>.split(sep)</code> — chop into a list of pieces</li>
<li><code>.startswith(x)</code> / <code>.endswith(x)</code> — True or False</li>
</ul>

<div class="note"><span class="lbl">Important</span>
<p>None of these change the original string. Strings in Python are
<strong>immutable</strong> — a method hands you a <em>new</em> string and leaves the old one
alone. So <code>text.strip()</code> on its own does nothing useful; you must catch the
result: <code>text = text.strip()</code>.</p></div>

<p>Methods can be chained left to right: <code>text.strip().lower()</code> strips first, then
lower-cases what comes back.</p>
`,
      starter: 'messy = "   Prefrontal Cortex \\n"\n\ntidy = messy\nprint(f"[{tidy}]")',
      task: `<p>Make <code>tidy</code> hold <code>prefrontal_cortex</code> — no surrounding
whitespace, all lower case, and the space in the middle turned into an underscore. The output
should read exactly <code>[prefrontal_cortex]</code>.</p>`,
      hint: `Three methods, chained: strip the ends, lower the case, then replace the space
with an underscore.`,
      solution: 'messy = "   Prefrontal Cortex \\n"\n\ntidy = messy.strip().lower().replace(" ", "_")\nprint(f"[{tidy}]")',
      checks: [
        {
          label: "tidy is exactly “prefrontal_cortex”",
          test: function (c) {
            var v = c.get("tidy");
            return v === "prefrontal_cortex" || "tidy is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It was derived from messy, not typed out",
          test: function (c) {
            return /tidy\s*=\s*messy\s*\./.test(c.code) ||
              "Start from messy and call methods on it.";
          }
        },
        {
          label: "It works on other messy text too",
          test: function (c) {
            var swapped = c.code.replace(/messy\s*=\s*"[^"]*"/, 'messy = "  Visual Cortex \\n"');
            if (swapped === c.code) { return "Keep the variable named messy."; }
            var r = c.rerun(swapped);
            if (r.error) { return "It broke on different input: " + r.error.split("\n").pop(); }
            return r.get("tidy") === "visual_cortex" ||
              "On “  Visual Cortex ” it produced " + JSON.stringify(r.get("tidy")) +
              " instead of “visual_cortex”.";
          }
        }
      ]
    },

    {
      id: "ch04-challenge-filename-from-parts",
      title: "Challenge: a filename from parts",
      prose: `
<p>Everything in this chapter, together. Read the task twice before you start typing — half
of programming is understanding the question.</p>
`,
      starter: 'study = "Memory Task"\nsubject = 7\nsession = 2\n\nfilename = ""\nprint(filename)',
      task: `<p>Build <code>filename</code> so it prints exactly:</p>
<pre><code>memory_task_sub07_ses02.csv</code></pre>
<p>The study name must come from <code>study</code>, lower-cased with the space replaced by an
underscore. The subject and session numbers must be padded to two digits — an f-string can do
that for you with <code>{subject:02d}</code>, which means "as a whole number, at least 2
digits, padded with zeros".</p>`,
      hint: `Do the study name first on its own line:
<code>name = study.lower().replace(" ", "_")</code>. Then build the filename with an f-string
containing <code>{name}</code>, <code>{subject:02d}</code> and <code>{session:02d}</code>.`,
      solution: 'study = "Memory Task"\nsubject = 7\nsession = 2\n\nname = study.lower().replace(" ", "_")\nfilename = f"{name}_sub{subject:02d}_ses{session:02d}.csv"\nprint(filename)',
      checks: [
        {
          label: "It prints memory_task_sub07_ses02.csv",
          test: function (c) {
            return c.out === "memory_task_sub07_ses02.csv" || "Got “" + c.out + "”.";
          }
        },
        {
          label: "filename is a string variable, not just printed text",
          test: function (c) {
            return c.get("filename") === "memory_task_sub07_ses02.csv" ||
              "The value must end up in a variable called filename.";
          }
        },
        {
          label: "It generalises: study “Face Task”, subject 12, session 10",
          test: function (c) {
            var swapped = c.code
              .replace(/study\s*=\s*"[^"]*"/, 'study = "Face Task"')
              .replace(/subject\s*=\s*\d+/, "subject = 12")
              .replace(/session\s*=\s*\d+/, "session = 10");
            var r = c.rerun(swapped);
            if (r.error) { return "It broke on different input: " + r.error.split("\n").pop(); }
            return r.get("filename") === "face_task_sub12_ses10.csv" ||
              "With those inputs it produced " + JSON.stringify(r.get("filename")) +
              " instead of “face_task_sub12_ses10.csv”. Something is hard-coded.";
          }
        }
      ]
    }
  ]
});
