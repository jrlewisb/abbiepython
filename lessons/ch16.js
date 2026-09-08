WB.chapter({
  id: "ch16",
  part: "Part 4 — The scientific stack",
  title: "NumPy",
  steps: [

    {
      id: "ch16-why-numpy",
      reading: [
        { title: "NumPy: the absolute basics for beginners",
          url: "https://numpy.org/doc/stable/user/absolute_beginners.html",
          note: "Written for exactly where you are now, and covers reshaping, broadcasting and saving arrays, which this chapter does not." },
      ],
      title: "Why lists stop being enough",
      prose: `
<p>Everything so far has used lists, and lists are excellent — for a few dozen things. Now
count what you actually have.</p>

<p>One EEG channel, recorded at 256 samples per second, over an eight-hour night, is
<strong>about 7.4 million numbers</strong>. With six channels, forty-four million. An fMRI run
is a few hundred volumes, each a 3-D grid of a hundred thousand voxels.</p>

<p>Two things go wrong with lists at that size.</p>

<h3>1. Writing it is painful</h3>

<p>To convert a list of readings from microvolts to millivolts, you need a loop:</p>

<pre><code>millivolts = []
for value in microvolts:
    millivolts.append(value / 1000)</code></pre>

<p>Four lines to express one idea. And every operation needs its own loop, so real analysis
becomes a stack of loops inside loops that is hard to read and easy to get subtly wrong.</p>

<h3>2. Running it is slow</h3>

<p>A Python list can hold anything — numbers, strings, other lists — so for every single item
Python has to stop and ask what type it is before it can add. Over seven million items that
overhead is most of the work.</p>

<p>A <strong>NumPy array</strong> holds one type of number, packed together in memory, and
runs its operations in compiled C. For numeric work it is routinely 10 to 100 times faster,
and it lets you write the same idea as:</p>

<pre><code>millivolts = microvolts / 1000</code></pre>

<p>One line. No loop. That is the whole pitch, and it is why every scientific library in
Python — pandas, scipy, matplotlib, and the tools that read your recordings — is built on
arrays underneath.</p>

<div class="note"><span class="lbl">If you have used MATLAB</span>
<p>This will feel familiar, because MATLAB has whole-array operations built into the language.
NumPy is how Python gets them. Chapter 17 is entirely about where the two disagree — and they
disagree in ways that produce plausible wrong answers rather than errors, so it matters.</p></div>

<div class="note warn"><span class="lbl">The first run takes a few seconds</span>
<p>Pressing Run below fetches NumPy into this browser tab. It only happens once — after that
it is instant.</p></div>
`,
      starter: 'import numpy as np\n\nmicrovolts = np.array([12.5, -3.0, 44.2, 8.1, -19.7])\n\nprint(microvolts)\nprint(microvolts / 1000)\nprint(microvolts * 2)\nprint(microvolts.mean())'
    },

    {
      id: "ch16-making-arrays",
      title: "Making arrays, and what they know about themselves",
      prose: `
<p>The usual way in is a list you already have:</p>

<pre><code>signal = np.array([12.5, -3.0, 44.2])</code></pre>

<p>There are also constructors for arrays you have not got yet:</p>

<pre><code>np.zeros(10)              # ten zeros — a common starting point
np.ones(5)
np.arange(0, 10, 2)       # 0, 2, 4, 6, 8 — like range(), but an array
np.linspace(0, 1, 5)      # 5 values evenly spaced from 0 to 1 inclusive</code></pre>

<p><code>linspace</code> is the one you will want for time axes: "give me 2048 evenly spaced
time points between 0 and 8 seconds" is exactly the shape of that problem.</p>

<h3>What an array knows</h3>

<p>Chapter 13's attributes, in the wild. No brackets on any of these — they are things the
array <em>has</em>, not things it does:</p>

<pre><code>signal.shape     # (3,)      — its dimensions, as a tuple
signal.size      # 3         — how many numbers in total
signal.ndim      # 1         — how many dimensions
signal.dtype     # float64   — what kind of number</code></pre>

<p><code>shape</code> is the one you will check constantly, and <code>(3,)</code> with the
trailing comma is just how Python writes a one-item tuple — it is not a typo.</p>

<div class="note"><span class="lbl">dtype matters more than you expect</span>
<p>An array is all one type. <code>np.array([1, 2, 3])</code> is integers, so dividing gives
floats but <em>storing</em> a float back into it silently chops the decimals off. If your
numbers are measurements, make sure they are floats — writing <code>1.0</code> instead of
<code>1</code>, or passing <code>dtype=float</code>, is enough.</p></div>
`,
      starter: 'import numpy as np\n\nvoltages = [12.5, -3.0, 44.2, 8.1, -19.7, 30.0]\n\nsignal = None\nn_samples = 0\ntime_axis = None\n\nprint(signal)\nprint(n_samples)\nprint(np.round(time_axis, 3))',
      task: `<p>Three things:</p>
<ul>
<li><code>signal</code> — a NumPy array made from <code>voltages</code></li>
<li><code>n_samples</code> — how many samples there are, taken from the array's
<code>size</code> attribute (not <code>len</code>, and no brackets)</li>
<li><code>time_axis</code> — <code>n_samples</code> evenly spaced times from 0 to 1 inclusive,
using <code>linspace</code></li>
</ul>
<p>The last line should print <code>[0.  0.2 0.4 0.6 0.8 1. ]</code>.</p>`,
      hint: `<code>np.array(voltages)</code>, then <code>signal.size</code>, then
<code>np.linspace(0, 1, n_samples)</code>.`,
      solution: 'import numpy as np\n\nvoltages = [12.5, -3.0, 44.2, 8.1, -19.7, 30.0]\n\nsignal = np.array(voltages)\nn_samples = signal.size\ntime_axis = np.linspace(0, 1, n_samples)\n\nprint(signal)\nprint(n_samples)\nprint(np.round(time_axis, 3))',
      checks: [
        {
          label: "signal is a NumPy array of the voltages",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var kind = c.tryPy("type(signal).__name__");
            if (kind !== "ndarray") { return "signal is a " + kind + ", not a NumPy array."; }
            return c.tryPy("float(signal[0])") === 12.5 || "The values do not match voltages.";
          }
        },
        {
          label: "n_samples came from the size attribute",
          test: function (c) {
            if (c.get("n_samples") !== 6) { return "n_samples is " + c.get("n_samples") + "."; }
            return /signal\s*\.\s*size\b/.test(c.code) ||
              "Use signal.size — an attribute, so no brackets.";
          }
        },
        {
          label: "time_axis is six evenly spaced values from 0 to 1",
          test: function (c) {
            var v = c.tryPy("[round(float(x), 3) for x in time_axis]");
            if (!v) { return "time_axis is not set."; }
            return JSON.stringify(v) === "[0,0.2,0.4,0.6,0.8,1]" ||
              "time_axis is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It adapts if the recording is a different length",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\[12\.5, -3\.0, 44\.2, 8\.1, -19\.7, 30\.0\]/, "[1.0, 2.0, 3.0]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.tryPy("int(n_samples)") !== 3) {
              return "n_samples came out as " + r.tryPy("int(n_samples)") + ".";
            }
            var v = r.tryPy("[round(float(x), 3) for x in time_axis]");
            return JSON.stringify(v) === "[0,0.5,1]" ||
              "For a 3-sample recording the time axis came out as " + JSON.stringify(v) +
              ", expected [0, 0.5, 1]. It should follow n_samples rather than being fixed at 6.";
          }
        }
      ]
    },

    {
      id: "ch16-vectorised-maths",
      title: "Doing maths to everything at once",
      prose: `
<p>This is the habit to build, and it takes a little unlearning after chapters 9 and 11:
<strong>when you are working with arrays, you almost never write a loop.</strong></p>

<pre><code>signal / 1000          # every value divided
signal - baseline      # every value shifted
signal ** 2            # every value squared
signal * gain          # every value scaled</code></pre>

<p>The operation applies to every element. This is called <strong>vectorisation</strong>, and
it is both faster and — once your eye adjusts — much easier to read, because the line says
what you meant rather than how to iterate.</p>

<p>Two arrays of the same shape combine element by element:</p>

<pre><code>corrected = eeg - reference     # subtract one channel from another, sample by sample</code></pre>

<h3>Summaries</h3>

<p>Arrays can summarise themselves, as methods:</p>

<pre><code>signal.mean()    signal.std()     signal.min()
signal.max()     signal.sum()     np.median(signal)</code></pre>

<p>And a few that are worth knowing by name because they answer questions you will actually
ask:</p>

<pre><code>np.abs(signal)          # size, ignoring sign — for amplitude
signal.argmax()         # the POSITION of the largest value, not the value
np.sqrt(signal)         # element-wise square root</code></pre>

<p><code>argmax</code> is the one people forget exists and then reimplement badly with a loop.
"When did the biggest deflection happen" is an <code>argmax</code>.</p>
`,
      starter: 'import numpy as np\n\nraw = np.array([1020.0, 1042.0, 998.0, 1180.0, 1005.0, 991.0])\nbaseline = 1000.0\n\ncentred = None\namplitude = None\npeak_index = 0\n\nprint(centred)\nprint(round(float(amplitude), 2))\nprint(peak_index)',
      task: `<p>Without writing a single loop:</p>
<ul>
<li><code>centred</code> — every reading with the baseline subtracted</li>
<li><code>amplitude</code> — the largest absolute deviation from baseline (so a swing of -200
would count as 200)</li>
<li><code>peak_index</code> — the position in the array where that largest deviation
happens</li>
</ul>
<p>Expected output:</p>
<pre><code>[ 20.  42.  -2. 180.   5.  -9.]
180.0
3</code></pre>`,
      hint: `<code>raw - baseline</code> for the first. Then <code>np.abs(centred)</code> gives
the sizes — take its <code>.max()</code> for the amplitude and its <code>.argmax()</code> for
the position.`,
      solution: 'import numpy as np\n\nraw = np.array([1020.0, 1042.0, 998.0, 1180.0, 1005.0, 991.0])\nbaseline = 1000.0\n\ncentred = raw - baseline\namplitude = np.abs(centred).max()\npeak_index = np.abs(centred).argmax()\n\nprint(centred)\nprint(round(float(amplitude), 2))\nprint(peak_index)',
      checks: [
        {
          label: "centred is the readings minus the baseline",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("[float(x) for x in centred]");
            return JSON.stringify(v) === "[20,42,-2,180,5,-9]" ||
              "centred is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "amplitude is the largest deviation either way",
          test: function (c) {
            var v = c.tryPy("float(amplitude)");
            return v === 180 || "amplitude is " + v + ".";
          }
        },
        {
          label: "peak_index is where it happens",
          test: function (c) {
            var v = c.tryPy("int(peak_index)");
            if (v === 180) { return "That is the value, not the position — argmax gives the index."; }
            return v === 3 || "peak_index is " + v + ".";
          }
        },
        {
          label: "No loops — this is all whole-array work",
          test: function (c) {
            return !/^\s*for\b/m.test(c.code) ||
              "There is a loop in there. Every one of these is a single whole-array operation.";
          }
        },
        {
          label: "It handles a negative swing correctly",
          test: function (c) {
            var r = c.rerun(c.code.replace(/1180\.0/, "700.0"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.tryPy("int(peak_index)") === 3 ||
              "With a -300 swing at position 3, peak_index came out as " + r.tryPy("int(peak_index)") +
              " instead of 3. Make sure you are using the absolute size.";
          }
        }
      ]
    },

    {
      id: "ch16-boolean-masks",
      title: "Filtering with a question",
      prose: `
<p>This is the single most useful thing NumPy does, and it has no real equivalent in what you
have learned so far.</p>

<p>Compare an array to something and you do not get one True or False — you get an array of
them, one per element:</p>

<pre><code>signal = np.array([12.0, 400.0, -8.0, 350.0])
signal &gt; 300
# array([False,  True, False,  True])</code></pre>

<p>That array of True and False is called a <strong>mask</strong>. And you can index an array
with a mask, which gives you back only the elements where it was True:</p>

<pre><code>signal[signal &gt; 300]        # array([400., 350.])  — just the clipped ones
signal[signal &lt;= 300]       # array([ 12.,  -8.])  — everything else</code></pre>

<p>Read <code>signal[signal &gt; 300]</code> as "the parts of signal where signal is over 300".
Once that clicks it is hard to go back — it is one line for what would otherwise be a loop, a
condition and an accumulator.</p>

<h3>Counting with masks</h3>

<p>Because True counts as 1 and False as 0, <code>.sum()</code> on a mask counts how many
passed:</p>

<pre><code>(signal &gt; 300).sum()        # 2 — how many are clipped
(signal &gt; 300).any()        # True  — are there any?
(signal &gt; 300).all()        # False — are they all?</code></pre>

<div class="note warn"><span class="lbl">and / or do not work here</span>
<p>Combining masks needs <code>&amp;</code> for and, <code>|</code> for or, and each condition
must be in its own brackets:</p>
<pre><code>clean = signal[(signal &gt; -300) &amp; (signal &lt; 300)]</code></pre>
<p>Using the words <code>and</code> / <code>or</code> raises
<code>ValueError: The truth value of an array with more than one element is ambiguous</code>.
It is a confusing message; it means "you gave me a whole array of answers where I expected
one". Now you will recognise it.</p></div>
`,
      starter: 'import numpy as np\n\nsignal = np.array([12.0, 400.0, -8.0, 350.0, 22.0, -320.0, 5.0])\n\nclean = None\nn_clipped = 0\nclean_mean = None\n\nprint(clean)\nprint(n_clipped)\nprint(round(float(clean_mean), 3))',
      task: `<p>A reading counts as clipped when its absolute size is 300 or more.</p>
<ul>
<li><code>clean</code> — only the readings that are <em>not</em> clipped</li>
<li><code>n_clipped</code> — how many were clipped</li>
<li><code>clean_mean</code> — the mean of the clean readings only</li>
</ul>
<p>Expected output:</p>
<pre><code>[12. -8. 22.  5.]
3
7.75</code></pre>`,
      hint: `Build the mask once and reuse it:
<pre><code>clipped = np.abs(signal) >= 300
clean = signal[~clipped]        # ~ flips a mask
n_clipped = clipped.sum()</code></pre>
Or write <code>signal[np.abs(signal) < 300]</code> directly.`,
      solution: 'import numpy as np\n\nsignal = np.array([12.0, 400.0, -8.0, 350.0, 22.0, -320.0, 5.0])\n\nclipped = np.abs(signal) >= 300\nclean = signal[~clipped]\nn_clipped = int(clipped.sum())\nclean_mean = clean.mean()\n\nprint(clean)\nprint(n_clipped)\nprint(round(float(clean_mean), 3))',
      checks: [
        {
          label: "clean holds only the unclipped readings",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("[float(x) for x in clean]");
            if (JSON.stringify(v) === "[12,-8,22,5,-320]") {
              return "The -320 got through — a big negative reading is clipped too. Use np.abs.";
            }
            return JSON.stringify(v) === "[12,-8,22,5]" || "clean is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "n_clipped is 3",
          test: function (c) {
            var v = c.tryPy("int(n_clipped)");
            return v === 3 || "n_clipped is " + v + ".";
          }
        },
        {
          label: "clean_mean is the mean of the clean readings",
          test: function (c) {
            var v = c.tryPy("round(float(clean_mean), 3)");
            return v === 7.75 || "clean_mean is " + v + ".";
          }
        },
        {
          label: "It was done with masks, not a loop",
          test: function (c) {
            return !/^\s*for\b/m.test(c.code) ||
              "There is a loop — the whole point of this step is that you do not need one.";
          }
        },
        {
          label: "It works on a signal with nothing clipped at all",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              /\[12\.0, 400\.0, -8\.0, 350\.0, 22\.0, -320\.0, 5\.0\]/, "[1.0, 2.0, 3.0]"));
            if (r.error) { return "It broke on a clean signal: " + r.error.split("\n").pop(); }
            return r.get("n_clipped") === 0 ||
              "With nothing clipped, n_clipped came out as " + r.get("n_clipped") + ".";
          }
        }
      ]
    },

    {
      id: "ch16-axes",
      reading: [
        { title: "Indexing on ndarrays",
          url: "https://numpy.org/doc/stable/user/basics.indexing.html",
          note: "Every way of getting at parts of an array. Worth a look when a slice does not do what you expected." },
      ],
      title: "More than one dimension, and what axis means",
      prose: `
<p>Real data is rarely a single line of numbers. Six EEG channels recorded together is a
<strong>2-D</strong> array — a grid, channels down and time across:</p>

<pre><code>data = np.array([
    [10.0, 12.0, -8.0, 11.0],     # channel 0, four samples
    [-5.0, 20.0, 35.0, -4.0],     # channel 1
    [ 1.0,  2.0,  3.0,  4.0],     # channel 2
])

data.shape      # (3, 4) — three channels, four samples each</code></pre>

<p>Read <code>shape</code> as (rows, columns). An fMRI run goes further: shape
<code>(64, 64, 30, 200)</code> is x, y, z and time — same idea, more dimensions.</p>

<h3>Indexing goes row first</h3>

<pre><code>data[0]         # all of channel 0
data[0, 2]      # channel 0, sample 2  →  -8.0
data[:, 0]      # sample 0 from EVERY channel — the whole first column
data[1, 1:3]    # channel 1, samples 1 and 2</code></pre>

<p><code>:</code> on its own means "all of this dimension". <code>data[:, 0]</code> is the
one to stare at: <em>every</em> row, column 0.</p>

<h3>axis= is the question "in which direction?"</h3>

<p>This trips up nearly everyone, so here is the version that sticks:</p>

<pre><code>data.mean()            # 6.75 — one number, the mean of everything
data.mean(axis=1)      # one mean PER CHANNEL — collapses the columns
data.mean(axis=0)      # one mean PER TIME POINT — collapses the rows</code></pre>

<p><strong><code>axis</code> names the dimension that disappears.</strong> The array is
(3, 4); <code>axis=1</code> removes the 4, leaving 3 numbers — one per channel.
<code>axis=0</code> removes the 3, leaving 4 numbers — one per sample.</p>

<p>When you are unsure, check <code>.shape</code> before and after. That habit will save you
more time than memorising the rule.</p>
`,
      starter: 'import numpy as np\n\ndata = np.array([\n    [10.0, 12.0, -8.0, 11.0],\n    [-5.0, 20.0, 35.0, -4.0],\n    [ 1.0,  2.0,  3.0,  4.0],\n])\n\nn_channels = 0\nchannel_means = None\nfirst_sample = None\n\nprint(n_channels)\nprint(np.round(channel_means, 3))\nprint(first_sample)',
      task: `<p>From <code>data</code>:</p>
<ul>
<li><code>n_channels</code> — how many channels, taken from <code>shape</code></li>
<li><code>channel_means</code> — the mean of each channel (one number per channel)</li>
<li><code>first_sample</code> — the first sample from every channel</li>
</ul>
<p>Expected output:</p>
<pre><code>3
[ 6.25 11.5   2.5 ]
[10. -5.  1.]</code></pre>`,
      hint: `<code>data.shape[0]</code> is the number of rows. For the means, the dimension
you want to collapse is the samples, which is dimension 1. For the first sample of every
channel you want every row, column 0.`,
      solution: 'import numpy as np\n\ndata = np.array([\n    [10.0, 12.0, -8.0, 11.0],\n    [-5.0, 20.0, 35.0, -4.0],\n    [ 1.0,  2.0,  3.0,  4.0],\n])\n\nn_channels = data.shape[0]\nchannel_means = data.mean(axis=1)\nfirst_sample = data[:, 0]\n\nprint(n_channels)\nprint(np.round(channel_means, 3))\nprint(first_sample)',
      checks: [
        {
          label: "n_channels is 3, from the shape",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            if (c.tryPy("int(n_channels)") !== 3) {
              return "n_channels is " + c.tryPy("int(n_channels)") + ".";
            }
            return /shape\s*\[\s*0\s*\]/.test(c.code) || "Take it from data.shape[0].";
          }
        },
        {
          label: "channel_means has one mean per channel",
          test: function (c) {
            var v = c.tryPy("[round(float(x), 3) for x in channel_means]");
            if (!v) { return "channel_means is not set."; }
            if (v.length === 4) {
              return "That is one mean per sample — you collapsed the wrong dimension. " +
                "You want the samples to disappear, not the channels.";
            }
            return JSON.stringify(v) === "[6.25,11.5,2.5]" ||
              "channel_means is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "first_sample is column 0 of every channel",
          test: function (c) {
            var v = c.tryPy("[float(x) for x in first_sample]");
            if (JSON.stringify(v) === "[10,12,-8,11]") {
              return "That is all of channel 0. You want sample 0 from every channel — " +
                "every row, column 0.";
            }
            return JSON.stringify(v) === "[10,-5,1]" ||
              "first_sample is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It still works if a channel is added",
          test: function (c) {
            var r = c.rerun(c.code.replace(
              "    [ 1.0,  2.0,  3.0,  4.0],",
              "    [ 1.0,  2.0,  3.0,  4.0],\n    [ 0.0,  0.0,  0.0,  0.0],"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.get("n_channels") === 4 ||
              "With a fourth channel, n_channels came out as " + r.get("n_channels") + ".";
          }
        }
      ]
    },

    {
      id: "ch16-challenge-clean-signals",
      title: "Challenge: quality control across channels",
      prose: `
<p>Masks and axes together, on the shape of problem you will meet on day one of real work:
several channels, some of them misbehaving, and a decision to make about which.</p>

<p>Work it out in pieces. Print <code>.shape</code> after each step if you are unsure what you
are holding — that is not a beginner's crutch, it is what everybody does.</p>
`,
      starter: 'import numpy as np\n\ndata = np.array([\n    [ 10.0,  12.0,  -8.0, 400.0,   9.0,  11.0],\n    [ -5.0, 320.0, 350.0, -310.0, -4.0,  -6.0],\n    [  1.0,   2.0,   3.0,   4.0,   5.0,   6.0],\n])\n\nchannel_means = None\nn_clipped = 0\nworst_channel = 0\n\nprint(np.round(channel_means, 2))\nprint(n_clipped)\nprint(worst_channel)',
      task: `<p>A sample is clipped when its absolute value is 300 or more.</p>
<ul>
<li><code>channel_means</code> — the mean of each channel (all samples, clipped or not)</li>
<li><code>n_clipped</code> — the total number of clipped samples across the whole array</li>
<li><code>worst_channel</code> — the index of the channel with the most clipped samples</li>
</ul>
<p>Expected output:</p>
<pre><code>[72.33 57.5   3.5 ]
4
1</code></pre>`,
      hint: `Make the mask once: <code>clipped = np.abs(data) >= 300</code> — it has the same
shape as the data. Then <code>clipped.sum()</code> counts them all, and
<code>clipped.sum(axis=1)</code> counts them per channel. <code>argmax</code> on that gives
the worst one.`,
      solution: 'import numpy as np\n\ndata = np.array([\n    [ 10.0,  12.0,  -8.0, 400.0,   9.0,  11.0],\n    [ -5.0, 320.0, 350.0, -310.0, -4.0,  -6.0],\n    [  1.0,   2.0,   3.0,   4.0,   5.0,   6.0],\n])\n\nclipped = np.abs(data) >= 300\n\nchannel_means = data.mean(axis=1)\nn_clipped = int(clipped.sum())\nworst_channel = int(clipped.sum(axis=1).argmax())\n\nprint(np.round(channel_means, 2))\nprint(n_clipped)\nprint(worst_channel)',
      checks: [
        {
          label: "channel_means has one value per channel",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("[round(float(x), 2) for x in channel_means]");
            if (!v) { return "channel_means is not set."; }
            if (v.length === 6) { return "That is per sample — collapse the samples, not the channels."; }
            return JSON.stringify(v) === "[72.33,57.5,3.5]" ||
              "channel_means is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "n_clipped counts every clipped sample in the array",
          test: function (c) {
            var v = c.tryPy("int(n_clipped)");
            if (v === 3) {
              return "That looks like only the positive ones. A large negative sample is " +
                "clipped too — use np.abs.";
            }
            return v === 4 || "n_clipped is " + v + ".";
          }
        },
        {
          label: "worst_channel is the one with the most clipping",
          test: function (c) {
            var v = c.tryPy("int(worst_channel)");
            if (v === 3) { return "That is a count, not an index — argmax gives the position."; }
            return v === 1 || "worst_channel is " + v + ".";
          }
        },
        {
          label: "No loops",
          test: function (c) {
            return !/^\s*for\b/m.test(c.code) ||
              "This is all whole-array work — no loop needed anywhere.";
          }
        },
        {
          label: "It finds the right channel when the data changes",
          test: function (c) {
            var swapped = c.code.replace(
              "    [  1.0,   2.0,   3.0,   4.0,   5.0,   6.0],",
              "    [900.0, 900.0, 900.0, 900.0, 900.0, 900.0],");
            var r = c.rerun(swapped);
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.get("n_clipped") !== 10) {
              return "With a fully clipped third channel the total came out as " +
                r.get("n_clipped") + ", expected 10.";
            }
            return r.get("worst_channel") === 2 ||
              "The worst channel should now be 2, but it came out as " + r.get("worst_channel") + ".";
          }
        }
      ]
    }
  ]
});
