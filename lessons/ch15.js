WB.chapter({
  id: "ch15",
  part: "Part 3 — Writing real code",
  title: "Files and data",
  steps: [

    {
      id: "ch15-everything-is-text",
      title: "A file is just a very long string",
      prose: `
<p>Everything you have written so far has invented its own data. Real work does not: the data
arrives in a file that somebody or something else produced, and your first job is always the
same — get it out of the file and into Python.</p>

<h3>Two kinds of file</h3>

<p><strong>Text files</strong> — CSV, TSV, JSON, log files, annotation files, anything you can
open in TextEdit or Notepad and read. Underneath, a text file is one long string with
<code>\\n</code> newline characters in it. That is genuinely all a "line" is: the text between
two newlines.</p>

<p><strong>Binary files</strong> — EDF recordings, <code>.mat</code> files, images. Not text,
not readable by eye, and you will never parse one by hand. A library does it and hands you
numbers: <code>lunapi</code> for EDF, <code>scipy.io</code> for <code>.mat</code>.</p>

<p>This chapter is about the first kind, because that is where the fiddly bits are, and
because understanding what a library is doing for you is what stops it being magic.</p>

<h3>Opening a file</h3>

<pre><code>with open("notes.txt", "w") as f:
    f.write("first line\\n")
    f.write("second line\\n")

with open("notes.txt") as f:
    contents = f.read()

print(contents)</code></pre>

<ul>
<li><code>open(name, mode)</code> — <code>"r"</code> read (the default), <code>"w"</code>
write (<strong>this erases the file first</strong>), <code>"a"</code> append.</li>
<li><code>with</code> — closes the file for you when the block ends, even if something goes
wrong inside it. Always use it. An unclosed file can leave your data half-written on disk.</li>
<li><code>f.write()</code> does not add newlines. If you want lines, put <code>\\n</code>
in yourself.</li>
</ul>

<div class="note"><span class="lbl">Where these files live</span>
<p>Right now, in a small pretend filesystem inside this browser tab. It behaves exactly like a
real one, and it is wiped when you reload the page — so each exercise here writes the file it
is about to read. On your own machine in chapter 21, the same code writes real files next to
your script.</p></div>
`,
      starter: 'with open("notes.txt", "w") as f:\n    f.write("first line\\n")\n    f.write("second line\\n")\n\nwith open("notes.txt") as f:\n    contents = f.read()\n\nprint(repr(contents))\nprint(contents)'
    },

    {
      id: "ch15-reading-line-by-line",
      title: "Reading it line by line",
      prose: `
<p><code>f.read()</code> gives you the whole file as one string. Usually you want the lines,
and there are three ways to get them.</p>

<pre><code>with open("run.log") as f:
    for line in f:              # best: one line at a time
        print(line)

with open("run.log") as f:
    all_lines = f.readlines()   # a list of all the lines at once</code></pre>

<p><strong>Looping over the file directly is the one to use.</strong> It reads one line at a
time rather than loading everything into memory, which matters the day someone hands you a
2 GB recording log.</p>

<h3>The newline that ruins everything</h3>

<p>Each line you get still has its <code>\\n</code> on the end. This causes a specific,
maddening bug: <code>line == "ERROR"</code> is <code>False</code> because the line is actually
<code>"ERROR\\n"</code>. You cannot see the difference on screen, which is exactly why
chapter 12 told you to print with <code>repr()</code>.</p>

<p>The fix is always the same, and you should do it reflexively on every line you read:</p>

<pre><code>for line in f:
    line = line.strip()
    if not line:          # skip blank lines while you are at it
        continue</code></pre>

<p><code>.strip()</code> removes the newline and any stray spaces at both ends. The blank-line
guard uses chapter 6's truthiness: an empty string is False.</p>
`,
      starter: 'text = "alpha\\nbeta\\n\\ngamma\\n"\n\nwith open("words.txt", "w") as f:\n    f.write(text)\n\nkept = []\n\n# read words.txt and fill in kept\n\nprint(kept)',
      task: `<p>Read <code>words.txt</code> line by line and put each non-blank line into
<code>kept</code>, with its newline stripped off. The result should be exactly
<code>['alpha', 'beta', 'gamma']</code> — note the blank line in the middle must not
appear.</p>`,
      hint: `<pre><code>with open("words.txt") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        kept.append(line)</code></pre>`,
      solution: 'text = "alpha\\nbeta\\n\\ngamma\\n"\n\nwith open("words.txt", "w") as f:\n    f.write(text)\n\nkept = []\n\nwith open("words.txt") as f:\n    for line in f:\n        line = line.strip()\n        if not line:\n            continue\n        kept.append(line)\n\nprint(kept)',
      checks: [
        {
          label: "kept is exactly ['alpha', 'beta', 'gamma']",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var k = c.get("kept");
            var j = JSON.stringify(k);
            if (j === '["alpha\\n","beta\\n","gamma\\n"]') {
              return "The newlines are still attached — strip each line.";
            }
            if (j === '["alpha","beta","","gamma"]') {
              return "The blank line got through. Skip it with a truthiness check.";
            }
            return j === '["alpha","beta","gamma"]' || "kept is " + j + ".";
          }
        },
        {
          label: "It was read from the file, not taken from the text variable",
          test: function (c) {
            return /open\s*\(\s*["']words\.txt["']\s*\)/.test(c.code) ||
              "Open words.txt and read it — the point is getting data out of a file.";
          }
        },
        {
          label: "It works on a different file's worth of content",
          test: function (c) {
            var r = c.rerun(c.code.replace(/"alpha\\nbeta\\n\\ngamma\\n"/, '"one\\n\\n\\ntwo\\n"'));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return JSON.stringify(r.get("kept")) === '["one","two"]' ||
              "On different content kept came out as " + JSON.stringify(r.get("kept")) + ".";
          }
        }
      ]
    },

    {
      id: "ch15-csv-by-hand",
      title: "CSV, the hard way and the right way",
      prose: `
<p>A CSV file is text where each line is a row and commas separate the columns. The first line
is usually the header — the column names.</p>

<pre><code>subject,minutes,stage
P01,412,N2
P02,388,N3</code></pre>

<p>You can absolutely parse that yourself with what you already know:</p>

<pre><code>with open("data.csv") as f:
    header = f.readline().strip().split(",")   # take the first line separately
    for line in f:                             # the loop starts from line 2
        fields = line.strip().split(",")
        print(fields[0], int(fields[1]))</code></pre>

<p>Two things worth noticing. <code>f.readline()</code> takes a single line, so the
<code>for</code> loop afterwards continues from where it left off. And every field arrives as
<strong>text</strong> — <code>fields[1]</code> is the string <code>"412"</code>, not the
number. If you forget the <code>int(...)</code> you will get <code>"412388"</code> where you
expected 800, because <code>+</code> on strings glues them.</p>

<h3>Why you should not actually do this</h3>

<p>Hand-splitting breaks the moment a field contains a comma:</p>

<pre><code>P03,412,"stage N2, artefact"</code></pre>

<p><code>.split(",")</code> gives you four fields instead of three and everything after is
misaligned — silently, with no error. The <code>csv</code> module knows about quoting and
gets it right:</p>

<pre><code>import csv

with open("data.csv") as f:
    reader = csv.DictReader(f)     # uses the header row for names
    for row in reader:
        print(row["subject"], int(row["minutes"]))</code></pre>

<p><code>DictReader</code> hands you each row as a dictionary keyed by column name, so you
write <code>row["minutes"]</code> instead of <code>fields[1]</code> — which cannot break when
somebody inserts a column.</p>

<div class="note"><span class="lbl">And in part 4, you will not do either</span>
<p><code>pandas.read_csv("data.csv")</code> is one line and gives you a whole table with types
already worked out. You are seeing the manual version first so that when pandas does something
surprising, you know what it was doing on your behalf.</p></div>
`,
      starter: 'import csv\n\ncsv_text = """subject,minutes,note\nP01,412,clean\nP02,388,"noisy, EOG2 saturated"\nP03,455,clean\n"""\n\nwith open("data.csv", "w") as f:\n    f.write(csv_text)\n\nsubjects = []\ntotal_minutes = 0\n\n# read data.csv with csv.DictReader\n\nprint(subjects)\nprint(total_minutes)',
      task: `<p>Using <code>csv.DictReader</code>, collect every subject into
<code>subjects</code> and add up all the minutes into <code>total_minutes</code>. Note that
P02's note contains a comma — which is exactly why you are not using
<code>.split(",")</code>. Expected output:</p>
<pre><code>['P01', 'P02', 'P03']
1255</code></pre>`,
      hint: `<pre><code>with open("data.csv") as f:
    for row in csv.DictReader(f):
        subjects.append(row["subject"])
        total_minutes += int(row["minutes"])</code></pre>
Do not forget the <code>int(...)</code> — everything out of a file is text.`,
      solution: 'import csv\n\ncsv_text = """subject,minutes,note\nP01,412,clean\nP02,388,"noisy, EOG2 saturated"\nP03,455,clean\n"""\n\nwith open("data.csv", "w") as f:\n    f.write(csv_text)\n\nsubjects = []\ntotal_minutes = 0\n\nwith open("data.csv") as f:\n    for row in csv.DictReader(f):\n        subjects.append(row["subject"])\n        total_minutes += int(row["minutes"])\n\nprint(subjects)\nprint(total_minutes)',
      checks: [
        {
          label: "All three subjects are collected",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            return JSON.stringify(c.get("subjects")) === '["P01","P02","P03"]' ||
              "subjects is " + JSON.stringify(c.get("subjects")) + ".";
          }
        },
        {
          label: "total_minutes is the number 1255, not glued-together text",
          test: function (c) {
            var v = c.get("total_minutes");
            if (typeof v === "string") {
              return "That is text, not a number — the fields need int() around them.";
            }
            return v === 1255 || "total_minutes is " + v + ".";
          }
        },
        {
          label: "You used csv.DictReader rather than splitting on commas",
          test: function (c) {
            if (/\.split\s*\(\s*["'],["']\s*\)/.test(c.code)) {
              return "Splitting on commas breaks on P02's quoted note — use csv.DictReader.";
            }
            return /DictReader/.test(c.code) || "Use csv.DictReader(f).";
          }
        },
        {
          label: "It survives a row being added",
          test: function (c) {
            var r = c.rerun(c.code.replace("P03,455,clean\n", "P03,455,clean\nP04,100,clean\n"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.get("total_minutes") === 1355 ||
              "With an extra 100-minute row the total came out as " + r.get("total_minutes") + ".";
          }
        }
      ]
    },

    {
      id: "ch15-challenge-log-parser",
      title: "Challenge: read an error log",
      prose: `
<p>This is the one. Everything from chapters 1 to 14, on a task you will genuinely do: a
pipeline ran overnight, it produced a log, and you need to know what went wrong without
reading eight hundred lines by eye.</p>

<p>Each line looks like this:</p>

<pre><code>2026-03-11 22:15:44 ERROR could not parse annotation at epoch 118
     date       time  level  message (which contains spaces)</code></pre>

<p>Four fields, but the message has spaces in it, so a plain <code>.split()</code> would chop
it into pieces. <code>split</code> takes a second argument that says <strong>how many times to
split</strong>:</p>

<pre><code>parts = line.split(None, 3)
# ['2026-03-11', '22:15:44', 'ERROR', 'could not parse annotation at epoch 118']</code></pre>

<p><code>None</code> means "split on any whitespace", and <code>3</code> means "at most three
times", so everything after the third split stays in one piece. That single detail is what
makes log parsing tractable.</p>

<p>Take your time with this one. Write it in pieces and print as you go.</p>
`,
      starter: 'log_text = """2026-03-11 22:14:03 INFO loading recording P07 night1\n2026-03-11 22:14:07 WARN channel EMG1 flat for 12.5 s\n2026-03-11 22:15:44 ERROR could not parse annotation at epoch 118\n2026-03-11 22:16:02 INFO resuming\n2026-03-11 23:01:19 WARN channel EOG2 saturated\n2026-03-12 00:22:51 ERROR missing epoch 1440\n2026-03-12 01:05:00 INFO staging complete\n\n2026-03-12 01:05:01 ERROR export failed: disk full\n"""\n\nwith open("run.log", "w") as f:\n    f.write(log_text)\n\ncounts = {}\nerror_messages = []\nfirst_error_time = None\n\n# your code here\n\nfor level in ["INFO", "WARN", "ERROR"]:\n    print(f"{level}: {counts.get(level, 0)}")\nprint("first error at", first_error_time)\nfor message in error_messages:\n    print("  -", message)',
      task: `<p>Read <code>run.log</code> and work out three things:</p>
<ul>
<li><code>counts</code> — a dictionary tallying how many lines of each level
(chapter 10's pattern)</li>
<li><code>error_messages</code> — the message part of every ERROR line, in order</li>
<li><code>first_error_time</code> — the date and time of the <em>first</em> ERROR, as one
string like <code>"2026-03-11 22:15:44"</code></li>
</ul>
<p>Skip blank lines. Expected output:</p>
<pre><code>INFO: 3
WARN: 2
ERROR: 3
first error at 2026-03-11 22:15:44
  - could not parse annotation at epoch 118
  - missing epoch 1440
  - export failed: disk full</code></pre>`,
      hint: `Skeleton:
<pre><code>with open("run.log") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        date, time, level, message = line.split(None, 3)
        counts[level] = counts.get(level, 0) + 1
        if level == "ERROR":
            error_messages.append(message)
            if first_error_time is None:
                first_error_time = f"{date} {time}"</code></pre>
The <code>if first_error_time is None</code> guard is what makes it the <em>first</em> one
rather than the last.`,
      solution: 'log_text = """2026-03-11 22:14:03 INFO loading recording P07 night1\n2026-03-11 22:14:07 WARN channel EMG1 flat for 12.5 s\n2026-03-11 22:15:44 ERROR could not parse annotation at epoch 118\n2026-03-11 22:16:02 INFO resuming\n2026-03-11 23:01:19 WARN channel EOG2 saturated\n2026-03-12 00:22:51 ERROR missing epoch 1440\n2026-03-12 01:05:00 INFO staging complete\n\n2026-03-12 01:05:01 ERROR export failed: disk full\n"""\n\nwith open("run.log", "w") as f:\n    f.write(log_text)\n\ncounts = {}\nerror_messages = []\nfirst_error_time = None\n\nwith open("run.log") as f:\n    for line in f:\n        line = line.strip()\n        if not line:\n            continue\n        date, time, level, message = line.split(None, 3)\n        counts[level] = counts.get(level, 0) + 1\n        if level == "ERROR":\n            error_messages.append(message)\n            if first_error_time is None:\n                first_error_time = f"{date} {time}"\n\nfor level in ["INFO", "WARN", "ERROR"]:\n    print(f"{level}: {counts.get(level, 0)}")\nprint("first error at", first_error_time)\nfor message in error_messages:\n    print("  -", message)',
      checks: [
        {
          label: "The three levels are counted correctly",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var t = c.get("counts");
            if (!t) { return "counts is empty."; }
            var want = { INFO: 3, WARN: 2, ERROR: 3 };
            for (var k in want) {
              if (t[k] !== want[k]) {
                return k + " counted as " + t[k] + ", expected " + want[k] +
                  ". Did the blank line get through?";
              }
            }
            return true;
          }
        },
        {
          label: "The error messages are captured whole, spaces and all",
          test: function (c) {
            var e = c.get("error_messages");
            var j = JSON.stringify(e);
            if (j && j.indexOf("could") >= 0 && j.indexOf("annotation") < 0) {
              return "The messages are being cut short — use line.split(None, 3) so the " +
                "message stays in one piece.";
            }
            return j === '["could not parse annotation at epoch 118","missing epoch 1440",' +
              '"export failed: disk full"]' || "error_messages is " + j + ".";
          }
        },
        {
          label: "first_error_time is the first one, not the last",
          test: function (c) {
            var v = c.get("first_error_time");
            if (v === "2026-03-12 01:05:01") {
              return "That is the last error. Only record it when first_error_time is still None.";
            }
            return v === "2026-03-11 22:15:44" || "It is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "The whole report prints correctly",
          test: function (c) {
            var want = ["INFO: 3", "WARN: 2", "ERROR: 3",
              "first error at 2026-03-11 22:15:44",
              "- could not parse annotation at epoch 118",
              "- missing epoch 1440",
              "- export failed: disk full"];
            for (var i = 0; i < want.length; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" +
                  want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "It works on a log it has never seen",
          test: function (c) {
            var newLog = '"""2026-04-01 08:00:00 INFO started\\n2026-04-01 08:00:05 ERROR bad channel count\\n"""';
            var swapped = c.code.replace(/log_text = """[\s\S]*?"""/, "log_text = " + newLog);
            if (swapped === c.code) { return "Keep the variable named log_text."; }
            var r = c.rerun(swapped);
            if (r.error) { return "It broke on a different log: " + r.error.split("\n").pop(); }
            if (r.get("first_error_time") !== "2026-04-01 08:00:05") {
              return "On a different log the first error time came out as " +
                JSON.stringify(r.get("first_error_time")) + ".";
            }
            var t = r.get("counts") || {};
            return (t.INFO === 1 && t.ERROR === 1 && t.WARN === undefined) ||
              "On a two-line log the counts came out as " + JSON.stringify(t) + ".";
          }
        }
      ]
    }
  ]
});
