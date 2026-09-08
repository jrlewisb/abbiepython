WB.chapter({
  id: "ch17",
  part: "Part 4 — The scientific stack",
  title: "Reading MATLAB without fear",
  steps: [

    {
      id: "ch17-why-matlab",
      title: "You do not have to write it — you have to read it",
      prose: `
<p>A lot of neuroimaging runs on MATLAB, and a lot of the analysis code in your field was
written in it. At some point somebody will send you a script, or you will inherit a pipeline,
or you will need to get numbers out of a <code>.mat</code> file.</p>

<p>You do not need to become a MATLAB programmer. You need to be able to <strong>read</strong>
it well enough to know what it does, and get the data out the other side. That is a much
smaller job, and this chapter is the whole of it.</p>

<h3>The good news</h3>

<p>MATLAB and Python are more alike than they look. Both run top to bottom. Both have
variables, loops, conditions and functions, and they mean the same things. Most MATLAB code
you meet will be immediately recognisable — you will be reading it and thinking "ah, that is a
for loop" within about a minute.</p>

<pre><code>% MATLAB                     # Python
total = 0;                   total = 0
for i = 1:5                  for i in range(1, 6):
    total = total + i;           total = total + i
end
disp(total)                  print(total)</code></pre>

<p>Same program. Different punctuation.</p>

<h3>The bad news, stated plainly</h3>

<p>There are three differences that do <strong>not</strong> announce themselves. They do not
cause errors. They cause a program that runs perfectly and gives you a slightly wrong answer —
the failure mode chapter 12 taught you to fear most.</p>

<p>They are all about counting, and they are the reason this chapter exists rather than being
a footnote. You have been warned about two of them already, in chapters 8 and 16. Here they
are together, with a chapter to make them stick.</p>
`
    },

    {
      id: "ch17-same-ideas-different-clothes",
      reading: [
        { title: "NumPy for MATLAB users",
          url: "https://numpy.org/doc/stable/user/numpy-for-matlab-users.html",
          note: "The official side-by-side table, far longer than this chapter. Worth bookmarking rather than reading — go to it when you have a specific line to translate." },
      ],
      title: "The same ideas in different clothes",
      prose: `
<p>A translation table for the things you will actually see. You do not need to memorise it —
you need to recognise the shapes.</p>

<h3>Blocks: <code>end</code> versus indentation</h3>

<p>MATLAB closes every block with the word <code>end</code>. Python uses indentation and a
colon. This is the most visible difference and the least dangerous one.</p>

<pre><code>% MATLAB                        # Python
if x &gt; 10                       if x &gt; 10:
    disp('big');                    print("big")
elseif x &gt; 5                    elif x &gt; 5:
    disp('medium');                 print("medium")
else                            else:
    disp('small');                  print("small")
end</code></pre>

<h3>The bits of punctuation</h3>

<ul>
<li><code>%</code> starts a comment. Python uses <code>#</code>.</li>
<li>A trailing <strong>semicolon suppresses output</strong>. In MATLAB, a line without one
prints its result. That is why MATLAB code is covered in semicolons and Python is not — Python
never prints anything unless you ask.</li>
<li><code>~=</code> means "not equal". Python writes <code>!=</code>.</li>
<li><code>&amp;&amp;</code> and <code>||</code> are and/or. Python spells them
<code>and</code> and <code>or</code>.</li>
<li>Strings use single quotes. Python accepts either.</li>
</ul>

<h3>Functions</h3>

<p>MATLAB names the output variable in the signature and assigns to it. Python
<code>return</code>s a value.</p>

<pre><code>% MATLAB                            # Python
function m = channel_mean(data)     def channel_mean(data):
    m = mean(data);                     return data.mean()
end</code></pre>

<h3>Arrays</h3>

<p>MATLAB has whole-array maths built in. That is exactly what NumPy gives Python, so chapter
16 has already prepared you:</p>

<pre><code>% MATLAB                    # Python (NumPy)
y = x * 2;                  y = x * 2
m = mean(x);                m = x.mean()
s = size(x);                s = x.shape
n = numel(x);               n = x.size
z = zeros(1, 10);           z = np.zeros(10)</code></pre>

<div class="note"><span class="lbl">One structural difference</span>
<p>In MATLAB, each function traditionally lives in its own file named after it. In Python, one
file can hold as many functions as you like, and a file is a module you import (chapter 14).
So a MATLAB "toolbox" of thirty files often becomes one or two Python modules.</p></div>
`
    },

    {
      id: "ch17-the-three-that-bite",
      title: "The three differences that actually bite",
      prose: `
<p>Everything above is cosmetic. These three are not.</p>

<h3>1. Counting starts at 0, not 1</h3>

<pre><code>% MATLAB          # Python
x(1)               x[0]        &lt;- the first one
x(3)               x[2]
x(end)             x[-1]       &lt;- the last one</code></pre>

<p>Also note the brackets: MATLAB indexes with round brackets, Python with square ones. That
one at least is visible.</p>

<h3>2. Ranges include the end in MATLAB, exclude it in Python</h3>

<pre><code>% MATLAB          # Python
x(2:4)             x[1:4]      &lt;- three elements either way</code></pre>

<p>Look carefully at that line, because both numbers changed. MATLAB's <code>2:4</code> means
elements 2, 3 and 4. Python's <code>1:4</code> means elements 1, 2 and 3 — starting one
earlier because of rule 1, and stopping before 4 because the end is excluded. The two effects
partly cancel out, which is exactly what makes this so easy to get wrong.</p>

<p>The reliable way to translate: work out <em>which elements</em> the MATLAB line means, then
write the Python that selects those elements. Never translate the numbers directly.</p>

<h3>3. Rows and columns are stored the other way round</h3>

<p>MATLAB stores a matrix column by column; NumPy stores it row by row. For ordinary indexing
this makes no difference at all — <code>data(2, 3)</code> and <code>data[1, 2]</code> are the
same element. It shows up when something <em>reshapes</em> or <em>flattens</em>: the same
values come out in a different order.</p>

<p>If you are translating code with <code>reshape</code> in it, that is the moment to be
careful and check a few values by hand rather than trusting it.</p>

<div class="note warn"><span class="lbl">Why this is worth real care</span>
<p>None of these produce an error. <code>x[1]</code> is perfectly valid Python — it just gives
you the second element when you wanted the first. Your script runs, your figure appears, and
one participant's data is shifted by one sample. Nothing will tell you.</p>
<p>When you translate something, check a few values against the original by hand. Every time.
It is ten minutes and it is the difference between a result and a retraction.</p></div>
`,
      starter: 'import numpy as np\n\nx = np.array([10, 20, 30, 40, 50])\n\n# Fill in the Python that selects the SAME elements as the MATLAB.\n\n# MATLAB:  x(1)\nfirst = None\n\n# MATLAB:  x(end)\nlast = None\n\n# MATLAB:  x(2:4)\nmiddle = None\n\nprint(first, last)\nprint(middle)',
      task: `<p>Fill in each one so it selects the same elements the MATLAB line would.
Expected output:</p>
<pre><code>10 50
[20 30 40]</code></pre>
<p>For the last one, work out which elements <code>x(2:4)</code> means first — the second,
third and fourth — and then write the Python that gets those.</p>`,
      hint: `MATLAB counts from 1, so <code>x(1)</code> is the first element, which Python
calls <code>x[0]</code>. <code>x(end)</code> is <code>x[-1]</code>. For the range: the second
element is at Python index 1, and you want to stop before the fifth, so <code>x[1:4]</code>.`,
      solution: 'import numpy as np\n\nx = np.array([10, 20, 30, 40, 50])\n\n# Fill in the Python that selects the SAME elements as the MATLAB.\n\n# MATLAB:  x(1)\nfirst = x[0]\n\n# MATLAB:  x(end)\nlast = x[-1]\n\n# MATLAB:  x(2:4)\nmiddle = x[1:4]\n\nprint(first, last)\nprint(middle)',
      checks: [
        {
          label: "first is the first element",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("int(first)");
            if (v === 20) { return "That is the second element — MATLAB's x(1) is Python's x[0]."; }
            return v === 10 || "first is " + v + ".";
          }
        },
        {
          label: "last is the last element",
          test: function (c) {
            var v = c.tryPy("int(last)");
            return v === 50 || "last is " + v + ".";
          }
        },
        {
          label: "middle selects the same three elements as x(2:4)",
          test: function (c) {
            var v = c.tryPy("[int(n) for n in middle]");
            if (JSON.stringify(v) === "[30,40,50]") {
              return "You translated the numbers straight across. MATLAB's x(2:4) means the " +
                "second, third and fourth elements — which are 20, 30 and 40.";
            }
            if (JSON.stringify(v) === "[20,30]") {
              return "One short. Python's stop is excluded, so you need to stop at 4, not 3.";
            }
            return JSON.stringify(v) === "[20,30,40]" || "middle is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It still works on a longer array",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\[10, 20, 30, 40, 50\]/, "[1, 2, 3, 4, 5, 6, 7]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.tryPy("int(last)") !== 7) {
              return "On a 7-element array, last came out as " + r.tryPy("int(last)") +
                ". Use -1 rather than a fixed position.";
            }
            return JSON.stringify(r.tryPy("[int(n) for n in middle]")) === "[2,3,4]" ||
              "On the longer array, middle came out as " +
              JSON.stringify(r.tryPy("[int(n) for n in middle]")) + ".";
          }
        }
      ]
    },

    {
      id: "ch17-translate-a-function",
      title: "Translating a whole function",
      prose: `
<p>Here is a MATLAB function of the kind you will actually be handed. Read it before you write
anything.</p>

<pre><code>function m = channel_mean(data, ch)
    % mean of one channel
    row = data(ch, :);
    m = mean(row);
end</code></pre>

<p>Line by line:</p>

<ul>
<li><code>function m = channel_mean(data, ch)</code> — takes two arguments, and whatever ends
up in <code>m</code> is what comes back.</li>
<li><code>data(ch, :)</code> — row <code>ch</code>, all columns. The <code>:</code> means
"everything in this dimension", which is the same as NumPy.</li>
<li><code>mean(row)</code> — the mean of that row.</li>
<li><code>m = ...</code> — MATLAB's way of saying <code>return</code>.</li>
</ul>

<div class="note warn"><span class="lbl">The decision you have to make when translating</span>
<p>In MATLAB, <code>channel_mean(data, 1)</code> asks for the first channel. If your Python
version keeps that convention, every caller stays the same but the inside has to subtract
one — and you have carried a MATLAB-ism into Python where it will confuse everyone.</p>
<p>Better: make the Python version 0-based like the rest of Python, and fix the call sites.
That is what the task asks for. But <strong>write the decision down in a comment</strong>, or
somebody — probably you — will call it with the old numbers.</p></div>
`,
      starter: 'import numpy as np\n\ndata = np.array([\n    [10.0, 12.0, -8.0, 11.0],\n    [-5.0, 20.0, 35.0, -4.0],\n    [ 1.0,  2.0,  3.0,  4.0],\n])\n\n# Write the Python version of channel_mean here.\n# It takes a 0-based channel number, like the rest of Python.\n\n\nprint(channel_mean(data, 0))\nprint(channel_mean(data, 1))\nprint(channel_mean(data, 2))',
      task: `<p>Write <code>channel_mean(data, ch)</code> in Python, taking a
<strong>0-based</strong> channel number. The three calls should print:</p>
<pre><code>6.25
11.5
2.5</code></pre>`,
      hint: `<pre><code>def channel_mean(data, ch):
    row = data[ch, :]
    return row.mean()</code></pre>
<code>data[ch]</code> on its own would also work — for a 2-D array, giving one index means
"that whole row".`,
      solution: 'import numpy as np\n\ndata = np.array([\n    [10.0, 12.0, -8.0, 11.0],\n    [-5.0, 20.0, 35.0, -4.0],\n    [ 1.0,  2.0,  3.0,  4.0],\n])\n\n# Write the Python version of channel_mean here.\n# It takes a 0-based channel number, like the rest of Python.\ndef channel_mean(data, ch):\n    row = data[ch, :]\n    return row.mean()\n\n\nprint(channel_mean(data, 0))\nprint(channel_mean(data, 1))\nprint(channel_mean(data, 2))',
      checks: [
        {
          label: "The three calls print the right channel means",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var want = ["6.25", "11.5", "2.5"];
            for (var i = 0; i < 3; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "Channel 0 really is the first channel",
          test: function (c) {
            var v = c.tryPy("float(channel_mean(data, 0))");
            if (v === undefined || v === null) { return "channel_mean handed back nothing."; }
            if (Math.abs(v - 11.5) < 0.0001) {
              return "channel_mean(data, 0) gave the SECOND channel — the function is still " +
                "subtracting one somewhere, MATLAB-style.";
            }
            return Math.abs(v - 6.25) < 0.0001 || "channel_mean(data, 0) gave " + v + ".";
          }
        },
        {
          label: "It works on data it has never seen",
          test: function (c) {
            var v = c.tryPy("float(channel_mean(np.array([[1.0, 3.0], [10.0, 20.0]]), 1))");
            return (v !== undefined && Math.abs(v - 15) < 0.0001) ||
              "On a different array it gave " + v + ", expected 15.0.";
          }
        }
      ]
    },

    {
      id: "ch17-mat-files",
      kind: "debug",
      title: "Debug: an off-by-one that came across in translation",
      prose: `
<p>Your first debugging job of the kind you will actually get: somebody translated a MATLAB
helper into Python, it runs without complaint, and the numbers are wrong.</p>

<p>Here is what it is supposed to do. <code>first_n_samples(data, n)</code> takes a
channels-by-samples array and returns the <strong>first n samples of every channel</strong>.
So with <code>n = 3</code> and the data below, it should hand back:</p>

<pre><code>[[10. 12. -8.]
 [-5. 20. 35.]
 [ 1.  2.  3.]]</code></pre>

<p>It does not. Run it and look at what comes out — check the shape as well as the values.</p>

<p>The original MATLAB line was <code>data(:, 1:n)</code>, and whoever translated it typed the
numbers straight across. This is the single most common translation bug there is, and now you
have met it somewhere safe.</p>

<div class="note"><span class="lbl">How to approach any bug like this</span>
<p>Do not stare at the code trying to spot it. Run it, print what you actually got, compare
with what you wanted, and let the difference tell you where to look. Here: how many columns
came back, and which one is missing?</p></div>
`,
      starter: 'import numpy as np\n\ndata = np.array([\n    [10.0, 12.0, -8.0, 11.0],\n    [-5.0, 20.0, 35.0, -4.0],\n    [ 1.0,  2.0,  3.0,  4.0],\n])\n\n\ndef first_n_samples(data, n):\n    # translated from MATLAB:  data(:, 1:n)\n    return data[:, 1:n]\n\n\nresult = first_n_samples(data, 3)\nprint(result)\nprint("shape:", result.shape)',
      task: `<p>Find and fix the bug so <code>first_n_samples(data, 3)</code> returns the first
three samples of each channel — a 3 by 3 array. Change only the line inside the function.</p>`,
      hint: `Count the columns that came back: two, not three. MATLAB's <code>1:n</code> means
elements 1 to n inclusive. In Python the first element is at 0 and the stop is excluded, so
the whole range you want is written <code>:n</code>.`,
      solution: 'import numpy as np\n\ndata = np.array([\n    [10.0, 12.0, -8.0, 11.0],\n    [-5.0, 20.0, 35.0, -4.0],\n    [ 1.0,  2.0,  3.0,  4.0],\n])\n\n\ndef first_n_samples(data, n):\n    # translated from MATLAB:  data(:, 1:n)\n    return data[:, :n]\n\n\nresult = first_n_samples(data, 3)\nprint(result)\nprint("shape:", result.shape)',
      checks: [
        {
          label: "The result is 3 channels by 3 samples",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.tryPy("list(result.shape)");
            if (JSON.stringify(v) === "[3,2]") {
              return "Still two samples wide — the slice is starting in the wrong place.";
            }
            return JSON.stringify(v) === "[3,3]" || "The shape is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It starts at the first sample, not the second",
          test: function (c) {
            var v = c.tryPy("[float(x) for x in result[0]]");
            if (v && v[0] === 12) {
              return "The first sample (10.0) is missing — the slice starts at index 1.";
            }
            return JSON.stringify(v) === "[10,12,-8]" || "The first row is " + JSON.stringify(v) + ".";
          }
        },
        {
          label: "It is right for other values of n",
          test: function (c) {
            var v = c.tryPy("[[float(x) for x in row] for row in first_n_samples(data, 1)]");
            if (JSON.stringify(v) !== "[[10],[-5],[1]]") {
              return "first_n_samples(data, 1) should give one sample per channel, but gave " +
                JSON.stringify(v) + ".";
            }
            var w = c.tryPy("list(first_n_samples(data, 4).shape)");
            return JSON.stringify(w) === "[3,4]" ||
              "first_n_samples(data, 4) should return all four samples, but its shape is " +
              JSON.stringify(w) + ".";
          }
        },
        {
          label: "Only the slice was changed",
          test: function (c) {
            return /def\s+first_n_samples\s*\(\s*data\s*,\s*n\s*\)/.test(c.code) ||
              "Leave the function's name and parameters alone — only the line inside needed fixing.";
          }
        }
      ]
    },

    {
      id: "ch17-getting-data-out",
      reading: [
        { title: "scipy.io.loadmat",
          url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.io.loadmat.html",
          note: "The real function's documentation, including the options for structs and cell arrays — which is where .mat files get genuinely awkward." },
      ],
      title: "Getting data out of a .mat file",
      prose: `
<p>The practical reason for this chapter. Somebody hands you <code>subject07.mat</code> and
you need the numbers.</p>

<pre><code>from scipy.io import loadmat

contents = loadmat("subject07.mat")</code></pre>

<p>That is the whole call. What comes back is a <strong>dictionary</strong> — chapter 10 — and
there are two surprises in it.</p>

<h3>Surprise 1: metadata keys</h3>

<p>Alongside your variables there are three entries MATLAB puts in every file:
<code>__header__</code>, <code>__version__</code> and <code>__globals__</code>. Ignore them.
The real variables are the keys that do not start with underscores — the same convention you
saw with <code>dir()</code> in chapter 13.</p>

<h3>Surprise 2: everything has an extra dimension</h3>

<p>MATLAB has no concept of a plain 1-D list — everything is at least a matrix. So a recording
you think of as 1000 samples arrives with shape <code>(1, 1000)</code>: one row, a thousand
columns. Index it as if it were 1-D and you will get confusing results.</p>

<p><code>np.squeeze()</code> removes dimensions of length 1, which is exactly the fix:</p>

<pre><code>signal = np.squeeze(contents["signal"])    # (1, 1000) -> (1000,)</code></pre>

<p>Get into the habit of printing <code>.shape</code> on anything that comes out of a
<code>.mat</code> file, before you do anything else with it.</p>

<div class="note"><span class="lbl">About the exercise below</span>
<p><code>scipy</code> is not available in this browser sandbox, so the code below builds a
dictionary with exactly the shape <code>loadmat</code> would hand you, and the task is what
you would do next. When you have Python installed for real (chapter 21), the only line that
changes is the first one — <code>contents = loadmat("subject07.mat")</code> — and everything
after it is identical.</p></div>
`,
      starter: 'import numpy as np\n\n# This is exactly what loadmat("subject07.mat") would hand you.\ncontents = {\n    "__header__": b"MATLAB 5.0 MAT-file",\n    "__version__": "1.0",\n    "__globals__": [],\n    "signal": np.array([[10.0, 12.0, -8.0, 11.0, 9.0]]),\n    "sample_rate": np.array([[256]]),\n}\n\nvariable_names = []\nsignal = None\nsample_rate = 0\n\nprint(variable_names)\nprint(signal, signal.shape)\nprint(sample_rate)',
      task: `<p>Three things, all of which you will do every single time you open a
<code>.mat</code> file:</p>
<ul>
<li><code>variable_names</code> — a sorted list of the real variable names, with MATLAB's
metadata keys left out</li>
<li><code>signal</code> — the signal as a proper 1-D array, so its shape is
<code>(5,)</code> and not <code>(1, 5)</code></li>
<li><code>sample_rate</code> — the sample rate as a plain Python <code>int</code>, not an
array</li>
</ul>
<p>Expected output:</p>
<pre><code>['sample_rate', 'signal']
[10. 12. -8. 11.  9.] (5,)
256</code></pre>`,
      hint: `For the names, loop over <code>contents</code> and keep the keys where
<code>not key.startswith("__")</code>, then <code>sorted(...)</code> the result.
For the signal, <code>np.squeeze(contents["signal"])</code>. For the sample rate, squeeze it
too and then wrap it in <code>int(...)</code>.`,
      solution: 'import numpy as np\n\n# This is exactly what loadmat("subject07.mat") would hand you.\ncontents = {\n    "__header__": b"MATLAB 5.0 MAT-file",\n    "__version__": "1.0",\n    "__globals__": [],\n    "signal": np.array([[10.0, 12.0, -8.0, 11.0, 9.0]]),\n    "sample_rate": np.array([[256]]),\n}\n\nvariable_names = []\nfor key in contents:\n    if not key.startswith("__"):\n        variable_names.append(key)\nvariable_names = sorted(variable_names)\n\nsignal = np.squeeze(contents["signal"])\nsample_rate = int(np.squeeze(contents["sample_rate"]))\n\nprint(variable_names)\nprint(signal, signal.shape)\nprint(sample_rate)',
      checks: [
        {
          label: "variable_names has the real variables and none of the metadata",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var v = c.get("variable_names");
            var j = JSON.stringify(v);
            if (j && j.indexOf("__header__") >= 0) {
              return "The metadata keys are still in there — skip the ones starting with __.";
            }
            return j === '["sample_rate","signal"]' || "variable_names is " + j + ".";
          }
        },
        {
          label: "signal is 1-D, shape (5,)",
          test: function (c) {
            var shape = c.tryPy("list(signal.shape)");
            if (JSON.stringify(shape) === "[1,5]") {
              return "Still 2-D — that extra dimension of length 1 is what squeeze removes.";
            }
            return JSON.stringify(shape) === "[5]" || "signal.shape is " + JSON.stringify(shape) + ".";
          }
        },
        {
          label: "sample_rate is a plain int",
          test: function (c) {
            var kind = c.tryPy("type(sample_rate).__name__");
            if (kind !== "int") {
              return "sample_rate is a " + kind + ". Squeeze it, then wrap it in int().";
            }
            return c.tryPy("sample_rate") === 256 || "sample_rate is " + c.tryPy("sample_rate") + ".";
          }
        },
        {
          label: "It works on a different file's contents",
          test: function (c) {
            var swapped = c.code
              .replace(/"signal": np\.array\(\[\[10\.0, 12\.0, -8\.0, 11\.0, 9\.0\]\]\),/,
                       '"signal": np.array([[1.0, 2.0]]), "extra": np.array([[7]]),')
              .replace(/"sample_rate": np\.array\(\[\[256\]\]\),/, '"sample_rate": np.array([[512]]),');
            var r = c.rerun(swapped);
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (JSON.stringify(r.get("variable_names")) !== '["extra","sample_rate","signal"]') {
              return "With an extra variable in the file, variable_names came out as " +
                JSON.stringify(r.get("variable_names")) + ".";
            }
            return r.tryPy("sample_rate") === 512 ||
              "The sample rate came out as " + r.tryPy("sample_rate") + ".";
          }
        }
      ]
    }
  ]
});
