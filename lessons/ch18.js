WB.chapter({
  id: "ch18",
  part: "Part 4 — The scientific stack",
  title: "pandas",
  steps: [

    {
      id: "ch18-why-pandas",
      title: "Why you need one more thing after NumPy",
      prose: `
<p>NumPy is superb at one kind of data: a grid of numbers that are all the same type. A lot of
your data is not like that.</p>

<pre><code>subject   night   stage   minutes
P01       1       N2      210
P01       1       N3      75
P02       1       N2      180</code></pre>

<p>That table has text in it and numbers in it, and — more importantly — the columns
<strong>have names that mean something</strong>. In NumPy you would be back to
<code>data[:, 3]</code> and remembering that column 3 is minutes. That is exactly the
<code>row[3]</code> versus <code>row["minutes"]</code> problem from chapter 10, at scale.</p>

<p>A <strong>DataFrame</strong> is pandas' answer: a table where each column has a name and
its own type, and where filtering, grouping and summarising are one line each. Think of it as
a spreadsheet you can program.</p>

<h3>The reason this chapter matters more than the others</h3>

<p>Every result Luna hands back is a DataFrame.</p>

<pre><code>rec.eval("PSD sig=EEG dB spectrum")
df = rec.table("PSD", "CH_F")      # &lt;- this is a DataFrame

rec.channels()                     # so is this
rec.headers()                      # and this</code></pre>

<p>So this is not a general-purpose detour. Whatever you end up doing with Luna, the thing it
gives you is what this chapter teaches you to hold. The same is true of almost every other
scientific Python library you will meet.</p>

<div class="note warn"><span class="lbl">The first run takes a moment</span>
<p>Pressing Run below fetches pandas into this tab — a bigger download than NumPy, so give it
ten seconds or so the first time. After that it is instant.</p></div>
`,
      reading: [
        { title: "10 minutes to pandas",
          url: "https://pandas.pydata.org/docs/user_guide/10min.html",
          note: "The official whirlwind tour. Denser than this chapter and covers far more ground — worth reading once you have finished here." },
      ],
      starter: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P02", "P02"],\n    "stage": ["N2", "N3", "N2", "N3"],\n    "minutes": [210, 75, 180, 40],\n})\n\nprint(df)\nprint()\nprint(df["minutes"].sum())'
    },

    {
      id: "ch18-first-look",
      title: "The first four things you type at any new table",
      prose: `
<p>You have been handed a table and you do not know what is in it. These four, every time,
before anything else:</p>

<pre><code>df.shape       # (rows, columns) — how much is there?
df.columns     # what are the columns called?
df.head()      # the first five rows — what does it look like?
df.dtypes      # what type is each column?</code></pre>

<p>Note which of those have brackets. <code>shape</code>, <code>columns</code> and
<code>dtypes</code> are <strong>attributes</strong> — things the table has.
<code>head()</code> is a <strong>method</strong> — something it does. Chapter 13's rule, and
this is where you will use it daily.</p>

<h3>Why dtypes is the one people skip and regret</h3>

<p>A column that looks like numbers is not necessarily numbers. If one row of your CSV had
<code>n/a</code> in the minutes column, pandas gives up on making that column numeric and
stores the whole thing as text — <code>object</code> is what it calls that. Then
<code>df["minutes"].sum()</code> glues the values together instead of adding them, or fails
outright.</p>

<p><code>dtypes</code> is a ten-second check that catches it. <code>int64</code> and
<code>float64</code> are numbers; <code>object</code> is text.</p>

<div class="note"><span class="lbl">Reading a CSV is one line</span>
<p><code>df = pd.read_csv("data.csv")</code> — and after chapter 15 you know what it is doing
for you: opening the file, handling quoted fields, using the first row as the column names,
and working out each column's type. All the fiddly parts you did by hand.</p></div>
`,
      starter: 'import pandas as pd\n\ncsv_text = """subject,night,stage,minutes\nP01,1,N2,210\nP01,1,N3,75\nP01,1,R,90\nP02,1,N2,180\nP02,1,N3,40\nP02,1,R,60\nP03,1,N2,260\nP03,1,N3,95\nP03,1,R,105\n"""\n\nwith open("sleep.csv", "w") as f:\n    f.write(csv_text)\n\ndf = None\nn_rows = 0\nn_cols = 0\ncolumn_names = []\n\nprint(n_rows, n_cols)\nprint(column_names)',
      task: `<p>Read <code>sleep.csv</code> into <code>df</code> with
<code>pd.read_csv</code>, then fill in:</p>
<ul>
<li><code>n_rows</code> and <code>n_cols</code>, from <code>shape</code></li>
<li><code>column_names</code>, as an ordinary Python list of the column names</li>
</ul>
<p>Expected output:</p>
<pre><code>9 4
['subject', 'night', 'stage', 'minutes']</code></pre>`,
      hint: `<code>pd.read_csv("sleep.csv")</code>. Then <code>df.shape</code> is a tuple, so
<code>df.shape[0]</code> and <code>df.shape[1]</code>. For the names,
<code>list(df.columns)</code> turns them into an ordinary list.`,
      solution: 'import pandas as pd\n\ncsv_text = """subject,night,stage,minutes\nP01,1,N2,210\nP01,1,N3,75\nP01,1,R,90\nP02,1,N2,180\nP02,1,N3,40\nP02,1,R,60\nP03,1,N2,260\nP03,1,N3,95\nP03,1,R,105\n"""\n\nwith open("sleep.csv", "w") as f:\n    f.write(csv_text)\n\ndf = pd.read_csv("sleep.csv")\nn_rows = df.shape[0]\nn_cols = df.shape[1]\ncolumn_names = list(df.columns)\n\nprint(n_rows, n_cols)\nprint(column_names)',
      checks: [
        {
          label: "The table was read from the CSV",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            if (!/read_csv/.test(c.code)) { return "Use pd.read_csv(\"sleep.csv\")."; }
            return c.tryPy("type(df).__name__") === "DataFrame" || "df is not a DataFrame yet.";
          }
        },
        {
          label: "9 rows and 4 columns",
          test: function (c) {
            var r = c.tryPy("int(n_rows)"), n = c.tryPy("int(n_cols)");
            if (r === 4 && n === 9) { return "Those are the wrong way round — shape is (rows, columns)."; }
            return (r === 9 && n === 4) || "You have " + r + " rows and " + n + " columns.";
          }
        },
        {
          label: "The column names are a plain list",
          test: function (c) {
            var v = c.get("column_names");
            return JSON.stringify(v) === '["subject","night","stage","minutes"]' ||
              "column_names is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It adapts if the file gains a row",
          test: function (c) {
            var r = c.rerun(c.code.replace("P03,1,R,105\n", "P03,1,R,105\nP04,1,N2,200\n"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.tryPy("int(n_rows)") === 10 ||
              "With an extra row, n_rows came out as " + r.tryPy("int(n_rows)") + ".";
          }
        }
      ]
    },

    {
      id: "ch18-selecting-and-filtering",
      title: "Getting at the bits you want",
      prose: `
<p>Three moves, and you will use them constantly.</p>

<h3>One column</h3>

<pre><code>df["minutes"]              # a single column, called a Series
df["minutes"].mean()       # Series behave like NumPy arrays
df["minutes"].sum()</code></pre>

<p>A <strong>Series</strong> is one column: a NumPy array with labels attached. Everything you
learned in chapter 16 applies to it.</p>

<h3>Several columns</h3>

<pre><code>df[["subject", "minutes"]]     # note the DOUBLE brackets</code></pre>

<p>The double brackets look like a typo and are not. The inner <code>[...]</code> is a
<em>list</em> of column names, and you are handing that list to the table. One name gives you a
column; a list of names gives you a smaller table.</p>

<h3>Some rows: filtering</h3>

<p>Exactly the boolean masks from chapter 16, and they read beautifully:</p>

<pre><code>df[df["minutes"] &gt; 100]                            # rows where minutes is over 100
df[df["stage"] == "N2"]                            # rows for one stage
df[(df["minutes"] &gt; 100) &amp; (df["stage"] == "N2")]  # both</code></pre>

<p>Same rules as NumPy: <code>&amp;</code> and <code>|</code>, never <code>and</code> /
<code>or</code>, and every condition in its own brackets.</p>

<div class="note"><span class="lbl">Filtering never changes the original</span>
<p><code>df[df["minutes"] &gt; 100]</code> hands you a <em>new</em> table. <code>df</code> is
untouched. If you want to keep the result, give it a name:
<code>long_stages = df[df["minutes"] &gt; 100]</code>. Forgetting that is the pandas equivalent
of forgetting <code>text = text.strip()</code>.</p></div>
`,
      starter: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P01", "P02", "P02", "P02"],\n    "stage": ["N2", "N3", "R", "N2", "N3", "R"],\n    "minutes": [210, 75, 90, 180, 40, 60],\n})\n\ntotal_minutes = 0\nn2_rows = None\nlong_n2 = None\n\nprint(total_minutes)\nprint(len(n2_rows))\nprint(len(long_n2))',
      task: `<ul>
<li><code>total_minutes</code> — the total of the minutes column</li>
<li><code>n2_rows</code> — only the rows where the stage is <code>"N2"</code></li>
<li><code>long_n2</code> — only the N2 rows that are also over 200 minutes</li>
</ul>
<p>Expected output:</p>
<pre><code>655
2
1</code></pre>`,
      hint: `<code>df["minutes"].sum()</code> for the first.
<code>df[df["stage"] == "N2"]</code> for the second. For the third, filter
<code>n2_rows</code> again, or combine two conditions with <code>&</code>, each in its own
brackets.`,
      solution: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P01", "P02", "P02", "P02"],\n    "stage": ["N2", "N3", "R", "N2", "N3", "R"],\n    "minutes": [210, 75, 90, 180, 40, 60],\n})\n\ntotal_minutes = df["minutes"].sum()\nn2_rows = df[df["stage"] == "N2"]\nlong_n2 = n2_rows[n2_rows["minutes"] > 200]\n\nprint(total_minutes)\nprint(len(n2_rows))\nprint(len(long_n2))',
      checks: [
        {
          label: "total_minutes is 655",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            return c.tryPy("int(total_minutes)") === 655 ||
              "total_minutes is " + c.tryPy("int(total_minutes)") + ".";
          }
        },
        {
          label: "n2_rows holds the two N2 rows",
          test: function (c) {
            var n = c.tryPy("len(n2_rows)");
            if (n === 6) { return "That is the whole table — you need to filter it."; }
            if (n !== 2) { return "n2_rows has " + n + " rows, expected 2."; }
            return JSON.stringify(c.tryPy('list(n2_rows["stage"])')) === '["N2","N2"]' ||
              "The rows kept are not the N2 ones.";
          }
        },
        {
          label: "long_n2 is the single N2 row over 200 minutes",
          test: function (c) {
            var n = c.tryPy("len(long_n2)");
            if (n === 2) {
              return "Both N2 rows got through — the 180-minute one should be excluded.";
            }
            if (n !== 1) { return "long_n2 has " + n + " rows, expected 1."; }
            return c.tryPy('int(long_n2["minutes"].iloc[0])') === 210 ||
              "The wrong row survived.";
          }
        },
        {
          label: "The original table is untouched",
          test: function (c) {
            return c.tryPy("len(df)") === 6 ||
              "df has been changed — filtering should hand back a new table and leave df alone.";
          }
        },
        {
          label: "It works on different data",
          test: function (c) {
            var r = c.rerun(c.code.replace("[210, 75, 90, 180, 40, 60]", "[300, 10, 10, 250, 10, 10]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.tryPy("len(long_n2)") === 2 ||
              "With two N2 rows over 200, long_n2 came out with " +
              r.tryPy("len(long_n2)") + " rows.";
          }
        }
      ]
    },

    {
      id: "ch18-new-columns",
      title: "Adding a column",
      prose: `
<p>Making a new column is assignment, and the calculation applies to every row at once —
vectorised, exactly like NumPy:</p>

<pre><code>df["hours"] = df["minutes"] / 60</code></pre>

<p>No loop. Every row gets its own answer, in order, and the table now has an extra column.</p>

<p>You can build a column from other columns too:</p>

<pre><code>df["proportion"] = df["minutes"] / df["minutes"].sum()</code></pre>

<p>Read the right-hand side carefully: <code>df["minutes"]</code> is a whole column and
<code>df["minutes"].sum()</code> is one number, so this divides every value by the total. That
mixing of "a column" and "a single number" in one expression is normal and worth getting
comfortable with — it is the same broadcasting NumPy does.</p>

<div class="note warn"><span class="lbl">Text columns need .str</span>
<p>String methods do not work directly on a column: <code>df["subject"].lower()</code> fails.
You have to go through <code>.str</code>, which applies the method to every value:</p>
<pre><code>df["subject"].str.lower()
df["subject"].str.startswith("P")</code></pre>
<p>Slightly annoying, entirely consistent, and the error when you forget is
<code>AttributeError: 'Series' object has no attribute 'lower'</code>.</p></div>
`,
      starter: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P02", "P02"],\n    "stage": ["N2", "N3", "N2", "N3"],\n    "minutes": [210, 75, 180, 40],\n})\n\n# add the two columns here\n\nprint(list(df.columns))\nprint([round(h, 2) for h in df["hours"]])\nprint(list(df["subject_lower"]))',
      task: `<p>Add two columns to <code>df</code>:</p>
<ul>
<li><code>"hours"</code> — the minutes converted to hours</li>
<li><code>"subject_lower"</code> — the subject code in lower case</li>
</ul>
<p>Expected output:</p>
<pre><code>['subject', 'stage', 'minutes', 'hours', 'subject_lower']
[3.5, 1.25, 3.0, 0.67]
['p01', 'p01', 'p02', 'p02']</code></pre>`,
      hint: `<code>df["hours"] = df["minutes"] / 60</code>, and
<code>df["subject_lower"] = df["subject"].str.lower()</code> — note the <code>.str</code>
in the middle.`,
      solution: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P02", "P02"],\n    "stage": ["N2", "N3", "N2", "N3"],\n    "minutes": [210, 75, 180, 40],\n})\n\ndf["hours"] = df["minutes"] / 60\ndf["subject_lower"] = df["subject"].str.lower()\n\nprint(list(df.columns))\nprint([round(h, 2) for h in df["hours"]])\nprint(list(df["subject_lower"]))',
      checks: [
        {
          label: "Both columns were added, in order",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("list(df.columns)");
            return JSON.stringify(v) === '["subject","stage","minutes","hours","subject_lower"]' ||
              "The columns are " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "hours is minutes converted, row by row",
          test: function (c) {
            var v = c.tryPy('[round(float(h), 2) for h in df["hours"]]');
            return JSON.stringify(v) === "[3.5,1.25,3,0.67]" ||
              "hours came out as " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "subject_lower used .str",
          test: function (c) {
            var v = c.tryPy('list(df["subject_lower"])');
            if (JSON.stringify(v) !== '["p01","p01","p02","p02"]') {
              return "subject_lower is " + JSON.stringify(v) + ".";
            }
            return /\.str\s*\.\s*lower/.test(c.code) ||
              "Use df[\"subject\"].str.lower() — string methods on a column go through .str.";
          }
        },
        {
          label: "It works on other numbers",
          test: function (c) {
            var r = c.rerun(c.code.replace("[210, 75, 180, 40]", "[120, 30, 90, 60]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return JSON.stringify(r.tryPy('[round(float(h), 2) for h in df["hours"]]')) ===
              "[2,0.5,1.5,1]" ||
              "On different minutes the hours came out as " +
              JSON.stringify(r.tryPy('[round(float(h), 2) for h in df["hours"]]')) + ".";
          }
        }
      ]
    },

    {
      id: "ch18-groupby",
      title: "groupby: the one that replaces a page of code",
      prose: `
<p>This is the reason people love pandas.</p>

<p>"Total minutes per subject." In chapter 10 that was a dictionary, a loop, and a tally.
Here:</p>

<pre><code>df.groupby("subject")["minutes"].sum()</code></pre>

<p>Read it left to right, because it is three separate ideas in a row:</p>

<ol>
<li><code>.groupby("subject")</code> — split the table into one pile per subject.</li>
<li><code>["minutes"]</code> — in each pile, look at the minutes column.</li>
<li><code>.sum()</code> — squash each pile down to one number.</li>
</ol>

<p>Split, apply, combine. Once you can see those three parts, every groupby you ever meet is
readable — including the ones in other people\'s code.</p>

<p>Change the last part to change the question:</p>

<pre><code>df.groupby("subject")["minutes"].mean()
df.groupby("stage")["minutes"].max()
df.groupby("stage")["minutes"].count()
df.groupby(["subject", "night"])["minutes"].sum()   # group by two things</code></pre>

<p>What comes back is a <strong>Series</strong> whose labels are the group names. To get an
ordinary dictionary out of it — handy for checking, and for printing predictably — use
<code>.to_dict()</code>.</p>

<div class="note"><span class="lbl">This is where the manual version pays off</span>
<p>You wrote the tally by hand in chapter 10, so you know what groupby is doing rather than
trusting it. That is the whole reason those chapters came first — when a groupby gives you a
surprising answer, you can reason about it instead of guessing.</p></div>
`,
      starter: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P01", "P02", "P02", "P02", "P03", "P03", "P03"],\n    "stage": ["N2", "N3", "R", "N2", "N3", "R", "N2", "N3", "R"],\n    "minutes": [210, 75, 90, 180, 40, 60, 260, 95, 105],\n})\n\nper_subject = None\nper_stage_mean = None\n\nprint(per_subject.to_dict())\nprint({k: round(v, 2) for k, v in per_stage_mean.to_dict().items()})',
      task: `<ul>
<li><code>per_subject</code> — total minutes for each subject</li>
<li><code>per_stage_mean</code> — the mean minutes for each stage</li>
</ul>
<p>Expected output:</p>
<pre><code>{'P01': 375, 'P02': 280, 'P03': 460}
{'N2': 216.67, 'N3': 70.0, 'R': 85.0}</code></pre>`,
      hint: `<code>df.groupby("subject")["minutes"].sum()</code> for the first. The second is
the same shape, grouped by stage, ending in <code>.mean()</code>.`,
      solution: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P01", "P02", "P02", "P02", "P03", "P03", "P03"],\n    "stage": ["N2", "N3", "R", "N2", "N3", "R", "N2", "N3", "R"],\n    "minutes": [210, 75, 90, 180, 40, 60, 260, 95, 105],\n})\n\nper_subject = df.groupby("subject")["minutes"].sum()\nper_stage_mean = df.groupby("stage")["minutes"].mean()\n\nprint(per_subject.to_dict())\nprint({k: round(v, 2) for k, v in per_stage_mean.to_dict().items()})',
      checks: [
        {
          label: "per_subject totals the minutes for each subject",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("{k: int(x) for k, x in per_subject.to_dict().items()}");
            return JSON.stringify(v) === '{"P01":375,"P02":280,"P03":460}' ||
              "per_subject is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "per_stage_mean averages the minutes for each stage",
          test: function (c) {
            var v = c.tryPy("{k: round(float(x), 2) for k, x in per_stage_mean.to_dict().items()}");
            if (v && v.N2 === 650) {
              return "That is the total, not the mean — the last part of the chain decides " +
                "the question.";
            }
            return JSON.stringify(v) === '{"N2":216.67,"N3":70,"R":85}' ||
              "per_stage_mean is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "You used groupby rather than filtering by hand",
          test: function (c) {
            return (c.code.match(/groupby/g) || []).length >= 2 ||
              "Both of these should be a groupby.";
          }
        }
      ]
    },

    {
      id: "ch18-project-sleep-report",
      kind: "project",
      title: "Project: a sleep summary from a raw file",
      prose: `
<p>No gaps to fill this time. Here is a file and a specification; write the program.</p>

<p>This is what the rest of your working life looks like, in miniature: a file arrives, it has
something wrong with it, and somebody wants a number out of the end. Everything you need is in
chapters 15 and 18.</p>

<h3>How to approach it</h3>

<p>Do not try to write it all at once. Do one line, print what you have got, then do the next.
That is not a beginner\'s method — it is the method.</p>

<ol>
<li>Read the file. Print <code>df.head()</code> and <code>df.dtypes</code> and actually look
at them.</li>
<li>Deal with the problem you find.</li>
<li>Add the column you need.</li>
<li>Group and summarise.</li>
</ol>

<div class="note warn"><span class="lbl">There is something wrong with this file</span>
<p>One row has a blank in the minutes column. That is enough to make pandas store the whole
column as text, and everything downstream will then behave strangely. Check
<code>dtypes</code> early — this is exactly the case this chapter warned you about.</p>
<p><code>pd.to_numeric(df["minutes"], errors="coerce")</code> converts a text column to
numbers, turning anything it cannot parse into <code>NaN</code> — pandas\' version of
"missing". <code>.isna().sum()</code> counts those, and
<code>df.dropna(subset=["minutes"])</code> removes the rows that have them.</p></div>
`,
      starter: 'import pandas as pd\n\ncsv_text = """subject,night,stage,minutes\nP01,1,N2,210\nP01,1,N3,75\nP01,1,R,90\nP02,1,N2,180\nP02,1,N3,\nP02,1,R,60\nP03,1,N2,260\nP03,1,N3,95\nP03,1,R,105\n"""\n\nwith open("sleep.csv", "w") as f:\n    f.write(csv_text)\n\n\n# Write your program here.\n\n\nn_dropped = 0\nper_subject_hours = None\nlongest_subject = ""\n\nprint("dropped:", n_dropped)\nprint({k: round(v, 2) for k, v in per_subject_hours.to_dict().items()})\nprint("longest:", longest_subject)',
      task: `<p>Read <code>sleep.csv</code> and produce three things:</p>
<ul>
<li><code>n_dropped</code> — how many rows had to be dropped because the minutes were
missing</li>
<li><code>per_subject_hours</code> — total <em>hours</em> of sleep per subject, from the rows
that remain</li>
<li><code>longest_subject</code> — the subject code with the most sleep, as a plain
string</li>
</ul>
<p>Expected output:</p>
<pre><code>dropped: 1
{'P01': 6.25, 'P02': 4.0, 'P03': 7.67}
longest: P03</code></pre>`,
      hint: `After reading:
<code>df["minutes"] = pd.to_numeric(df["minutes"], errors="coerce")</code>. Count the missing
ones with <code>df["minutes"].isna().sum()</code> <em>before</em> you drop them. Then
<code>df = df.dropna(subset=["minutes"])</code>, add an hours column, group by subject and
sum. For the last one, a Series has <code>.idxmax()</code>, which gives the <em>label</em> of
the largest value rather than the value itself — the same idea as <code>argmax</code> in
chapter 16.`,
      solution: 'import pandas as pd\n\ncsv_text = """subject,night,stage,minutes\nP01,1,N2,210\nP01,1,N3,75\nP01,1,R,90\nP02,1,N2,180\nP02,1,N3,\nP02,1,R,60\nP03,1,N2,260\nP03,1,N3,95\nP03,1,R,105\n"""\n\nwith open("sleep.csv", "w") as f:\n    f.write(csv_text)\n\n\ndf = pd.read_csv("sleep.csv")\ndf["minutes"] = pd.to_numeric(df["minutes"], errors="coerce")\n\nn_dropped = int(df["minutes"].isna().sum())\ndf = df.dropna(subset=["minutes"])\n\ndf["hours"] = df["minutes"] / 60\nper_subject_hours = df.groupby("subject")["hours"].sum()\nlongest_subject = per_subject_hours.idxmax()\n\nprint("dropped:", n_dropped)\nprint({k: round(v, 2) for k, v in per_subject_hours.to_dict().items()})\nprint("longest:", longest_subject)',
      checks: [
        {
          label: "One row was identified as unusable",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("int(n_dropped)");
            return v === 1 || "n_dropped is " + v + ", expected 1.";
          }
        },
        {
          label: "The per-subject hours are right",
          test: function (c) {
            var v = c.tryPy("{k: round(float(x), 2) for k, x in per_subject_hours.to_dict().items()}");
            if (!v) { return "per_subject_hours is not set."; }
            if (v.P01 && Math.abs(v.P01 - 375) < 1) {
              return "Those are minutes, not hours — divide by 60 somewhere.";
            }
            return JSON.stringify(v) === '{"P01":6.25,"P02":4,"P03":7.67}' ||
              "per_subject_hours is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "longest_subject is P03, as a plain string",
          test: function (c) {
            var v = c.get("longest_subject");
            if (typeof v === "number") {
              return "That is a value, not a label. idxmax() gives the label of the biggest one.";
            }
            return v === "P03" || "longest_subject is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "The minutes column really was made numeric",
          test: function (c) {
            var kind = c.tryPy('str(df["minutes"].dtype)');
            if (kind === "object") {
              return "The minutes column is still text. Convert it with pd.to_numeric before " +
                "doing arithmetic on it.";
            }
            return true;
          }
        },
        {
          label: "It works on a file with the gap somewhere else",
          test: function (c) {
            var swapped = c.code
              .replace("P02,1,N3,\n", "P02,1,N3,40\n")
              .replace("P01,1,R,90\n", "P01,1,R,\n");
            if (swapped === c.code) { return "Keep the CSV in the variable csv_text."; }
            var r = c.rerun(swapped);
            if (r.error) { return "It broke on a different file: " + r.error.split("\n").pop(); }
            if (r.tryPy("int(n_dropped)") !== 1) {
              return "With the gap moved, n_dropped came out as " + r.tryPy("int(n_dropped)") + ".";
            }
            return r.get("longest_subject") === "P03" ||
              "With the gap moved, longest came out as " +
              JSON.stringify(r.get("longest_subject")) + ".";
          }
        }
      ]
    }
  ]
});
