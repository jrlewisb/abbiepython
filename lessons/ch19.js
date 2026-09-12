WB.chapter({
  id: "ch19",
  part: "Part 4 — The scientific stack",
  title: "Drawing figures",
  steps: [

    {
      id: "ch19-why-look",
      title: "Look at the data before you analyse it",
      prose: `
<p>You have spent four chapters learning to summarise things. Means, counts, groupbys. Here is
the problem with summaries: <strong>very different data can have identical ones.</strong></p>

<p>Four datasets can share the same mean, the same standard deviation and the same correlation,
and look completely different when you draw them — one a clean line, one a curve, one a
straight line with a single wild outlier dragging everything. That is a real and famous result
(Anscombe's quartet), and it is the entire argument for plotting.</p>

<p>For your data specifically: a flat channel, a saturated amplifier, an electrode that came
loose at 3am, a participant who never got past N1 — every one of those is instantly obvious in
a picture and invisible in a mean.</p>

<div class="note"><span class="lbl">The habit worth building</span>
<p><strong>Plot it before you trust it.</strong> Not at the end to make a figure for the
paper — at the start, roughly, for yourself, to find out what you are actually holding. Most
of the plots you draw should be ugly and thrown away ten seconds later.</p></div>

<h3>The one line to know</h3>

<pre><code>import matplotlib.pyplot as plt</code></pre>

<p><code>pyplot</code> is the drawing part of matplotlib, and <code>plt</code> is its
universal nickname — like <code>np</code> and <code>pd</code>, use it and everybody's code
will look like yours.</p>

<p>Run the code below. The figure appears underneath the output.</p>
`,
      reading: [
        { title: "Matplotlib: quick start",
          url: "https://matplotlib.org/stable/users/explain/quick_start.html",
          note: "The official introduction, and the clearest explanation of the Figure/Axes structure this chapter introduces." },
      ],
      starter: 'import numpy as np\nimport matplotlib.pyplot as plt\n\ntime = np.linspace(0, 2, 200)\nsignal = np.sin(2 * np.pi * 5 * time)\n\nfig, ax = plt.subplots()\nax.plot(time, signal)\nplt.show()'
    },

    {
      id: "ch19-figure-and-axes",
      title: "Figure and axes, and why labels are not optional",
      prose: `
<p>Almost every matplotlib example starts with this line, so it is worth knowing exactly what
it gives you:</p>

<pre><code>fig, ax = plt.subplots()</code></pre>

<p>That is tuple unpacking from chapter 10, handing back two things:</p>

<ul>
<li><strong><code>fig</code></strong> — the figure: the whole picture, the piece of paper. You
use it to set the overall size and to save the file.</li>
<li><strong><code>ax</code></strong> — the axes: one set of x and y axes to draw inside. This
is the one you talk to almost all the time.</li>
</ul>

<p>You will see older code that skips this and writes <code>plt.plot(...)</code> directly. It
works, but it draws onto whatever figure happens to be current, which gets confusing the moment
you have two. <strong>Use <code>fig, ax</code>.</strong> It is what the matplotlib
documentation recommends and what you will see in any recent codebase.</p>

<h3>Everything you say to the axes</h3>

<pre><code>ax.plot(x, y)                 # draw a line
ax.set_xlabel("Time (s)")     # label the x axis
ax.set_ylabel("Amplitude (µV)")
ax.set_title("Channel EEG1")
ax.legend()                   # show the key (only if things are labelled)
ax.set_ylim(-100, 100)        # fix the y range</code></pre>

<div class="note warn"><span class="lbl">Label both axes, with units. Every time.</span>
<p>An unlabelled axis is not a stylistic lapse, it is a figure nobody can check — including
you, next week. Is that amplitude in microvolts or millivolts? Is that time in seconds or
samples? The difference is a factor of a thousand and there is no way to tell by looking.</p>
<p>Get into the habit now, on throwaway plots, and you will never have to remember to do it on
the one that goes in the paper.</p></div>
`,
      starter: 'import numpy as np\nimport matplotlib.pyplot as plt\n\ntime = np.linspace(0, 2, 200)\nsignal = 50 * np.sin(2 * np.pi * 5 * time)\n\nfig, ax = plt.subplots()\nax.plot(time, signal)\n\n# add the three labels here\n\nplt.show()',
      task: `<p>Add the labels this figure is missing:</p>
<ul>
<li>x axis: <code>Time (s)</code></li>
<li>y axis: <code>Amplitude (µV)</code></li>
<li>title: <code>Channel EEG1</code></li>
</ul>
<p>Match the text exactly, units included.</p>`,
      hint: `Three lines, all on <code>ax</code>: <code>ax.set_xlabel("Time (s)")</code>, then
<code>set_ylabel</code> and <code>set_title</code> in the same shape.`,
      solution: 'import numpy as np\nimport matplotlib.pyplot as plt\n\ntime = np.linspace(0, 2, 200)\nsignal = 50 * np.sin(2 * np.pi * 5 * time)\n\nfig, ax = plt.subplots()\nax.plot(time, signal)\n\nax.set_xlabel("Time (s)")\nax.set_ylabel("Amplitude (µV)")\nax.set_title("Channel EEG1")\n\nplt.show()',
      checks: [
        {
          label: "A figure was actually drawn",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            return c.figures.length > 0 || "No figure came out. Is the ax.plot line still there?";
          }
        },
        {
          label: "The x axis says what it is, with units",
          test: function (c) {
            var v = c.tryPy("ax.get_xlabel()");
            if (!v) { return "The x axis has no label yet."; }
            return v === "Time (s)" || "It says “" + v + "”, expected “Time (s)”.";
          }
        },
        {
          label: "The y axis says what it is, with units",
          test: function (c) {
            var v = c.tryPy("ax.get_ylabel()");
            if (!v) { return "The y axis has no label yet."; }
            return v === "Amplitude (µV)" || "It says “" + v + "”, expected “Amplitude (µV)”.";
          }
        },
        {
          label: "The figure has a title",
          test: function (c) {
            var v = c.tryPy("ax.get_title()");
            if (!v) { return "No title yet."; }
            return v === "Channel EEG1" || "It says “" + v + "”, expected “Channel EEG1”.";
          }
        }
      ]
    },

    {
      id: "ch19-choosing-the-form",
      title: "Choosing the right kind of plot",
      prose: `
<p>Four kinds cover nearly everything you will do. The question to ask is not "which looks
nice" but <strong>"what is this data's job?"</strong></p>

<h3>Change over time → a line</h3>
<pre><code>ax.plot(time, signal)</code></pre>
<p>A line implies the points are connected in order. Use it when the x axis is time or
another continuous sequence — a raw trace, a power spectrum, a learning curve.</p>

<h3>The shape of one variable → a histogram</h3>
<pre><code>ax.hist(amplitudes, bins=20)</code></pre>
<p>Where do the values pile up? Is it symmetric? Are there two humps, suggesting two
different things mixed together? This is the plot that catches a bad channel fastest.</p>
<p><code>bins</code> matters more than people expect. Too few hides structure, too many turns
it into noise. Try a few — that is normal, not indecision.</p>

<h3>Two variables against each other → a scatter</h3>
<pre><code>ax.scatter(sleep_hours, accuracy)</code></pre>
<p>Does one move with the other? Scatter, never a line, when the x axis is not a sequence —
joining unrelated points with a line invents a relationship that is not there.</p>

<h3>A number per category → a bar</h3>
<pre><code>ax.bar(["N1", "N2", "N3", "R"], minutes)</code></pre>
<p>Distinct groups, one value each. Bars must start at zero, because the eye compares their
lengths — a bar chart with a chopped axis exaggerates differences and is genuinely
misleading.</p>

<div class="note warn"><span class="lbl">One thing never to do</span>
<p><strong>Never put two different measures on one plot with two y axes.</strong> Amplitude on
the left, temperature on the right, two lines crossing — it looks sophisticated and it is the
most misleading chart there is, because you can make the lines cross wherever you like by
choosing the scales. If you have two measures, draw two plots stacked above each other with a
shared x axis.</p></div>
`,
      starter: 'import numpy as np\nimport matplotlib.pyplot as plt\n\n# amplitudes from one channel, in microvolts\nrng = np.random.default_rng(0)\namplitudes = rng.normal(20, 8, 500)\n\nfig, ax = plt.subplots()\n\n# draw the right kind of plot here, with 25 bins\n\nax.set_xlabel("Amplitude (µV)")\nax.set_ylabel("Number of samples")\nax.set_title("Amplitude distribution, EEG1")\n\nplt.show()',
      task: `<p>You want to see <em>the shape</em> of these 500 amplitudes — where they pile up,
and whether anything looks odd. Draw the plot that answers that, with <code>25</code>
bins.</p>`,
      hint: `The shape of one variable is a histogram: <code>ax.hist(amplitudes, bins=25)</code>.`,
      solution: 'import numpy as np\nimport matplotlib.pyplot as plt\n\n# amplitudes from one channel, in microvolts\nrng = np.random.default_rng(0)\namplitudes = rng.normal(20, 8, 500)\n\nfig, ax = plt.subplots()\n\nax.hist(amplitudes, bins=25)\n\nax.set_xlabel("Amplitude (µV)")\nax.set_ylabel("Number of samples")\nax.set_title("Amplitude distribution, EEG1")\n\nplt.show()',
      checks: [
        {
          label: "A figure was drawn",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            return c.figures.length > 0 || "No figure came out.";
          }
        },
        {
          label: "It is a histogram, not a line",
          test: function (c) {
            if (/ax\.plot\s*\(/.test(c.code)) {
              return "A line joins points in order, which these are not. The shape of one " +
                "variable is a histogram.";
            }
            return /ax\.hist\s*\(/.test(c.code) || "Use ax.hist(...).";
          }
        },
        {
          label: "It has 25 bins",
          test: function (c) {
            var n = c.tryPy("len([p for p in ax.patches])");
            if (n === undefined || n === null) { return "Could not read the bars back."; }
            return n === 25 || "There are " + n + " bars — pass bins=25.";
          }
        },
        {
          label: "The labels survived",
          test: function (c) {
            return c.tryPy("ax.get_xlabel()") === "Amplitude (µV)" ||
              "The x label has gone missing.";
          }
        }
      ]
    },

    {
      id: "ch19-several-series",
      title: "More than one thing on a plot",
      prose: `
<p>Call <code>plot</code> twice and both lines land on the same axes. But if you do that
without saying which is which, you have drawn a figure nobody can read:</p>

<pre><code>ax.plot(time, eeg1, label="EEG1")
ax.plot(time, eeg2, label="EEG2")
ax.legend()</code></pre>

<p>Two rules, and they go together:</p>

<ul>
<li><strong><code>label=</code> on every series</strong>, at the moment you draw it.</li>
<li><strong><code>ax.legend()</code> once</strong>, after them all. It collects whatever has
been labelled.</li>
</ul>

<p>Leave out the labels and <code>legend()</code> draws an empty box and warns you. Leave out
<code>legend()</code> and the labels are simply never shown.</p>

<h3>Two plots instead of one</h3>

<p>When the two things are not on the same scale, stack them rather than forcing them
together:</p>

<pre><code>fig, axes = plt.subplots(2, 1, sharex=True)
axes[0].plot(time, eeg)
axes[1].plot(time, emg)</code></pre>

<p><code>plt.subplots(2, 1)</code> means two rows, one column, and <code>axes</code> is now a
list of them. <code>sharex=True</code> locks their x axes together so the same moment lines up
vertically — which is exactly what you want when comparing channels in time.</p>

<div class="note"><span class="lbl">Colours</span>
<p>Matplotlib's default colour cycle is fine, and deliberately so — it is readable and
reasonably colourblind-friendly. Do not spend time picking colours until something specifically
needs it. If you do choose, avoid red-and-green as your two series: that is the most common
form of colour blindness, and about one man in twelve will not be able to tell your lines
apart.</p></div>
`,
      starter: 'import numpy as np\nimport matplotlib.pyplot as plt\n\ntime = np.linspace(0, 1, 200)\neeg1 = 50 * np.sin(2 * np.pi * 8 * time)\neeg2 = 30 * np.sin(2 * np.pi * 12 * time)\n\nfig, ax = plt.subplots()\n\n# draw both, labelled, and add the key\n\nax.set_xlabel("Time (s)")\nax.set_ylabel("Amplitude (µV)")\n\nplt.show()',
      task: `<p>Draw both channels on the same axes. Label the first <code>EEG1</code> and the
second <code>EEG2</code>, and add the legend so the labels actually appear.</p>`,
      hint: `<code>ax.plot(time, eeg1, label="EEG1")</code>, the same for eeg2, then
<code>ax.legend()</code> on its own line afterwards.`,
      solution: 'import numpy as np\nimport matplotlib.pyplot as plt\n\ntime = np.linspace(0, 1, 200)\neeg1 = 50 * np.sin(2 * np.pi * 8 * time)\neeg2 = 30 * np.sin(2 * np.pi * 12 * time)\n\nfig, ax = plt.subplots()\n\nax.plot(time, eeg1, label="EEG1")\nax.plot(time, eeg2, label="EEG2")\nax.legend()\n\nax.set_xlabel("Time (s)")\nax.set_ylabel("Amplitude (µV)")\n\nplt.show()',
      checks: [
        {
          label: "Both channels are drawn",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var n = c.tryPy("len(ax.lines)");
            if (n === 1) { return "Only one line — plot the second channel too."; }
            return n === 2 || "There are " + n + " lines on the axes, expected 2.";
          }
        },
        {
          label: "Each line is labelled",
          test: function (c) {
            var v = c.tryPy("[l.get_label() for l in ax.lines]");
            return JSON.stringify(v) === '["EEG1","EEG2"]' ||
              "The labels are " + JSON.stringify(v) + ". Pass label= when you draw each one.";
          }
        },
        {
          label: "The legend is shown",
          test: function (c) {
            if (!/legend\s*\(/.test(c.code)) {
              return "Labels alone do not appear — you need ax.legend() as well.";
            }
            return c.tryPy("ax.get_legend() is not None") === true ||
              "The legend did not end up on the figure.";
          }
        }
      ]
    },

    {
      id: "ch19-project-stage-summary",
      kind: "project",
      title: "Project: a figure from a real table",
      prose: `
<p>Chapters 18 and 19 together, which is how you will actually use them: get the numbers with
pandas, draw them with matplotlib.</p>

<p>Build it in stages and look at what you have after each one. Get the grouped numbers right
and printed <em>before</em> you draw anything — a wrong figure and a right figure look equally
convincing.</p>
`,
      starter: 'import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P01", "P01", "P02", "P02", "P02", "P02"],\n    "stage": ["N1", "N2", "N3", "R", "N1", "N2", "N3", "R"],\n    "minutes": [25, 210, 75, 90, 40, 180, 55, 60],\n})\n\n# 1. total minutes per stage, across both subjects\nper_stage = None\n\n# 2. draw it as a bar chart with labelled axes and a title\nfig, ax = plt.subplots()\n\n\nplt.show()\nprint(per_stage.to_dict())',
      task: `<p>Two parts:</p>
<ol>
<li><code>per_stage</code> — total minutes for each stage, across both subjects, using
<code>groupby</code>.</li>
<li>Draw it as a <strong>bar chart</strong>, with the stage names along the bottom. Label the
x axis <code>Sleep stage</code>, the y axis <code>Total minutes</code>, and title it
<code>Time in each stage</code>.</li>
</ol>
<p>The printed line should be
<code>{'N1': 65, 'N2': 390, 'N3': 130, 'R': 150}</code>.</p>`,
      hint: `The groupby is the same shape as chapter 18:
<code>df.groupby("stage")["minutes"].sum()</code>. For the bars, a Series carries its labels
with it — <code>ax.bar(per_stage.index, per_stage.values)</code> uses the stage names as the
categories.`,
      solution: 'import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    "subject": ["P01", "P01", "P01", "P01", "P02", "P02", "P02", "P02"],\n    "stage": ["N1", "N2", "N3", "R", "N1", "N2", "N3", "R"],\n    "minutes": [25, 210, 75, 90, 40, 180, 55, 60],\n})\n\nper_stage = df.groupby("stage")["minutes"].sum()\n\nfig, ax = plt.subplots()\nax.bar(per_stage.index, per_stage.values)\nax.set_xlabel("Sleep stage")\nax.set_ylabel("Total minutes")\nax.set_title("Time in each stage")\n\nplt.show()\nprint(per_stage.to_dict())',
      checks: [
        {
          label: "per_stage totals the minutes for each stage",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("{k: int(x) for k, x in per_stage.to_dict().items()}");
            return JSON.stringify(v) === '{"N1":65,"N2":390,"N3":130,"R":150}' ||
              "per_stage is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It was grouped, not added up by hand",
          test: function (c) {
            return /groupby/.test(c.code) || "Use df.groupby(\"stage\")[\"minutes\"].sum().";
          }
        },
        {
          label: "There are four bars, one per stage",
          test: function (c) {
            if (c.figures.length === 0) { return "No figure came out."; }
            var n = c.tryPy("len(ax.patches)");
            return n === 4 || "There are " + n + " bars, expected 4.";
          }
        },
        {
          label: "The bars are the right heights",
          test: function (c) {
            var v = c.tryPy("[int(p.get_height()) for p in ax.patches]");
            return JSON.stringify(v) === "[65,390,130,150]" ||
              "The bar heights are " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "Both axes and the title are labelled",
          test: function (c) {
            if (c.tryPy("ax.get_xlabel()") !== "Sleep stage") {
              return "The x label is “" + c.tryPy("ax.get_xlabel()") + "”.";
            }
            if (c.tryPy("ax.get_ylabel()") !== "Total minutes") {
              return "The y label is “" + c.tryPy("ax.get_ylabel()") + "”.";
            }
            return c.tryPy("ax.get_title()") === "Time in each stage" ||
              "The title is “" + c.tryPy("ax.get_title()") + "”.";
          }
        },
        {
          label: "It works when the data changes",
          test: function (c) {
            var r = c.rerun(c.code.replace("[25, 210, 75, 90, 40, 180, 55, 60]",
                                           "[10, 10, 10, 10, 10, 10, 10, 10]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            var v = r.tryPy("[int(p.get_height()) for p in ax.patches]");
            return JSON.stringify(v) === "[20,20,20,20]" ||
              "With every stage at 10 minutes the bars came out as " + JSON.stringify(v) + ".";
          }
        }
      ]
    }
  ]
});
