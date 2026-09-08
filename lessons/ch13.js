WB.chapter({
  id: "ch13",
  part: "Part 3 — Writing real code",
  title: "Objects, and what the dot means",
  steps: [

    {
      id: "ch13-what-the-dot-means",
      title: "What the dot means",
      prose: `
<p>You have been writing dots since chapter 4 without anyone explaining them:</p>

<pre><code>text.strip()
readings.append(9)
tally.get("N2", 0)</code></pre>

<p>Time to say what is actually going on, because once you start using real libraries almost
everything you write will have a dot in it.</p>

<h3>An object is a thing that knows how to do things to itself</h3>

<p>In Python, every value is an <strong>object</strong>: a bundle of some data plus the
operations that make sense for that kind of data. A string carries its characters and knows
how to upper-case itself. A list carries its items and knows how to append.</p>

<p><strong>The dot means "belonging to this thing".</strong> Read it out loud as "'s":</p>

<pre><code>text.strip()        # this text's strip
readings.append(9)  # this list's append</code></pre>

<p>And crucially, <code>readings.append</code> is <em>this particular list's</em> append. It
adds to <code>readings</code> and to nothing else. The object on the left of the dot is what
the operation happens to.</p>

<h3>Why this matters more than it looks</h3>

<p>This is the entire shape of the libraries you are heading towards. When you get to Luna:</p>

<pre><code>rec = p.inst("subject_01")
rec.attach_edf("night1.edf")
rec.channels()
rec.eval("PSD sig=EEG")</code></pre>

<p><code>rec</code> is an object representing one recording. It holds that recording's data,
and it knows how to attach a file to itself, list its own channels, and run an analysis on
itself. Every one of those dots is the same dot you have been using on strings and lists.</p>

<p>So there is nothing new to learn when you get there. That is the point of this chapter: to
make sure the syntax is already boring by the time the science arrives.</p>

<div class="note"><span class="lbl">Chaining</span>
<p>Because most methods hand back another object, you can put another dot on the end:
<code>text.strip().lower().replace(" ", "_")</code>. Read left to right: strip it, then
lower what comes back, then replace on what comes back from that.</p></div>
`,
      starter: 'recording = "  Night_01_EEG.EDF  "\n\nprint(recording.strip())\nprint(recording.strip().lower())\nprint(recording.strip().lower().endswith(".edf"))\n\nreadings = [3, 1, 2]\nreadings.sort()\nprint(readings)'
    },

    {
      id: "ch13-methods-vs-functions",
      title: "Why some things have dots and some do not",
      prose: `
<p>A reasonable question at this point: why is it <code>len(readings)</code> but
<code>readings.append(9)</code>? Why does one go on the outside and one on the inside?</p>

<ul>
<li><strong>A function</strong> stands on its own and you hand things to it:
<code>len(x)</code>, <code>sum(x)</code>, <code>round(x, 2)</code>, <code>print(x)</code>.
These are general — <code>len</code> works on lists, strings, dictionaries and things that do
not exist yet.</li>
<li><strong>A method</strong> belongs to an object and is called with a dot:
<code>x.append()</code>, <code>x.upper()</code>, <code>x.items()</code>. These are specific to
that kind of thing — only lists have <code>append</code>, only dictionaries have
<code>items</code>.</li>
</ul>

<p>The rough rule: if the operation makes sense for almost anything, it is a function. If it
only makes sense for one kind of thing, it is that thing's method.</p>

<div class="note"><span class="lbl">How to find out what an object can do</span>
<p>You do not memorise these. Two things tell you, and both work in any Python:</p>
<pre><code>print(dir(readings))     # every name this object has
help(readings.append)    # what this one does</code></pre>
<p><code>dir()</code> lists a lot of names starting with underscores — Python's own internal
machinery. Ignore those and read the plain ones. In a real editor or Jupyter notebook you get
the same list by typing <code>readings.</code> and pressing Tab, which is how most people
actually do it.</p></div>

<p>Run the code to see what a list can do, then answer the question below it.</p>
`,
      starter: 'readings = [12, 7, 40]\n\n# Print every name a list has, skipping Python\'s internal ones.\nfor name in dir(readings):\n    if not name.startswith("_"):\n        print(name)\n\n# A list has a method for counting how many times a value appears.\n# Use it to count how many 7s are in this list.\nsevens = 0\n\nprint("sevens:", sevens)',
      task: `<p>Look at the printed list of what a list can do, find the method that counts
occurrences, and use it to set <code>sevens</code>. The last line of output should be
<code>sevens: 1</code>.</p>`,
      hint: `The method is called <code>count</code>, and you call it as
<code>readings.count(7)</code>.`,
      solution: 'readings = [12, 7, 40]\n\n# Print every name a list has, skipping Python\'s internal ones.\nfor name in dir(readings):\n    if not name.startswith("_"):\n        print(name)\n\n# A list has a method for counting how many times a value appears.\n# Use it to count how many 7s are in this list.\nsevens = readings.count(7)\n\nprint("sevens:", sevens)',
      checks: [
        {
          label: "sevens is 1",
          test: function (c) { return c.get("sevens") === 1 || "sevens is " + c.get("sevens") + "."; }
        },
        {
          label: "You used the list's own count method",
          test: function (c) {
            return /readings\s*\.\s*count\s*\(/.test(c.code) ||
              "Use readings.count(7) — the method belonging to that list.";
          }
        },
        {
          label: "It still works if the list changes",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\[12, 7, 40\]/, "[7, 7, 1, 7]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            return r.get("sevens") === 3 ||
              "On [7, 7, 1, 7] it gave " + r.get("sevens") + ", expected 3.";
          }
        }
      ]
    },

    {
      id: "ch13-attributes-vs-methods",
      title: "Brackets, or no brackets",
      prose: `
<p>Objects carry two kinds of thing after the dot, and telling them apart saves a lot of
confusion later.</p>

<ul>
<li><strong>A method</strong> is something the object <em>does</em>. It needs brackets:
<code>text.upper()</code>.</li>
<li><strong>An attribute</strong> is something the object <em>has</em>. No brackets, because
nothing is being done — you are just reading a value off it.</li>
</ul>

<p>You have not met attributes yet, but you are about to meet them constantly. In part 4:</p>

<pre><code>array.shape       # attribute — the dimensions. No brackets.
array.dtype       # attribute — what kind of numbers. No brackets.
array.mean()      # method — go and calculate the mean. Brackets.

df.columns        # attribute
df.head()         # method</code></pre>

<h3>What happens when you get it wrong</h3>

<p>Both mistakes have a distinctive symptom, so learn to recognise them:</p>

<p><strong>Forgetting the brackets</strong> does not raise an error. It hands you back the
method itself rather than running it, and printing it gives you something like
<code>&lt;built-in method upper of str object at 0x...&gt;</code>. If you ever see
<code>&lt;bound method ...&gt;</code> in your output, you left the brackets off.</p>

<p><strong>Adding brackets to an attribute</strong> gives
<code>TypeError: 'tuple' object is not callable</code> — you tried to call something that is
not a function.</p>

<div class="note"><span class="lbl">A complex number, for a real example</span>
<p>Python has complex numbers built in, and they carry their parts as attributes:</p>
<pre><code>z = 3 + 4j
z.real        # 3.0   — attribute
z.imag        # 4.0   — attribute
z.conjugate() # (3-4j) — method</code></pre></div>
`,
      starter: 'z = 3 + 4j\n\n# One of these is written wrongly. Fix it.\nreal_part = z.real\nimag_part = z.imag()\nflipped = z.conjugate\n\nprint(real_part, imag_part, flipped)',
      task: `<p>Two of those three lines are wrong. Fix them so the output is
<code>3.0 4.0 (3-4j)</code> — one attribute is being called like a method, and one method is
being read like an attribute.</p>`,
      hint: `<code>imag</code> is a value the number has, so it needs no brackets.
<code>conjugate</code> is something it does, so it needs them.`,
      solution: 'z = 3 + 4j\n\n# One of these is written wrongly. Fix it.\nreal_part = z.real\nimag_part = z.imag\nflipped = z.conjugate()\n\nprint(real_part, imag_part, flipped)',
      checks: [
        {
          label: "No error",
          test: function (c) { return !c.error || "Still failing: " + c.error.split("\n").pop(); }
        },
        {
          label: "The output is 3.0 4.0 (3-4j)",
          test: function (c) {
            if (/bound method|built-in method/.test(c.out)) {
              return "Something printed as a method object — one of them is still missing its brackets.";
            }
            return c.out === "3.0 4.0 (3-4j)" || "The output was “" + c.out + "”.";
          }
        }
      ]
    },

    {
      id: "ch13-your-own-class",
      title: "Making your own kind of thing",
      prose: `
<p>You will spend far more time using other people's objects than writing your own. But seeing
one built takes the mystery out of the ones you use, so here is the whole idea in twenty
lines.</p>

<p>A <strong>class</strong> is a template. An <strong>object</strong> is one thing made from
that template.</p>

<pre><code>class Recording:
    def __init__(self, subject, minutes):
        self.subject = subject
        self.minutes = minutes

    def is_long_enough(self):
        return self.minutes &gt;= 300


night = Recording("P07", 412)

night.subject            # "P07"        — attribute
night.is_long_enough()   # True         — method</code></pre>

<ul>
<li><strong><code>__init__</code></strong> runs once, automatically, when you make one. Its
job is to store the starting data. The double underscores mean "Python calls this for you" —
you never call it yourself.</li>
<li><strong><code>self</code></strong> is the object being worked on. When you write
<code>night.is_long_enough()</code>, Python passes <code>night</code> in as
<code>self</code>. That is why <code>self</code> appears in every method definition and never
in the call.</li>
<li><strong><code>self.minutes = minutes</code></strong> stores the value <em>on the
object</em>, so other methods can find it later. Without <code>self.</code>, it would be an
ordinary local variable that vanishes when <code>__init__</code> ends — chapter 11's scope
rule, still applying.</li>
</ul>

<p>That is genuinely it. Every object you have used — strings, lists, dictionaries, and later
DataFrames and Luna recordings — is this idea, with more methods.</p>
`,
      starter: 'class Recording:\n    def __init__(self, subject, minutes):\n        self.subject = subject\n        self.minutes = minutes\n\n    def is_long_enough(self):\n        return self.minutes >= 300\n\n    # add a summary method here\n\n\nnight = Recording("P07", 412)\n\nprint(night.subject)\nprint(night.is_long_enough())\nprint(night.summary())',
      task: `<p>Add a method <code>summary()</code> that returns a string like
<code>P07: 412 minutes</code>, built from the object's own attributes. Expected output:</p>
<pre><code>P07
True
P07: 412 minutes</code></pre>`,
      hint: `<pre><code>    def summary(self):
        return f"{self.subject}: {self.minutes} minutes"</code></pre>
It goes inside the class, indented to the same level as the other methods, and it needs
<code>self</code> as its parameter.`,
      solution: 'class Recording:\n    def __init__(self, subject, minutes):\n        self.subject = subject\n        self.minutes = minutes\n\n    def is_long_enough(self):\n        return self.minutes >= 300\n\n    def summary(self):\n        return f"{self.subject}: {self.minutes} minutes"\n\n\nnight = Recording("P07", 412)\n\nprint(night.subject)\nprint(night.is_long_enough())\nprint(night.summary())',
      checks: [
        {
          label: "The three lines print correctly",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var want = ["P07", "True", "P07: 412 minutes"];
            for (var i = 0; i < 3; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "summary uses the object's own attributes",
          test: function (c) {
            var v = c.tryPy('Recording("X99", 55).summary()');
            if (v === undefined || v === null) {
              return "A new Recording's summary() gave nothing back — does it return?";
            }
            return v === "X99: 55 minutes" ||
              'Recording("X99", 55).summary() gave “' + v + '”, expected “X99: 55 minutes”. ' +
              "Build it from self.subject and self.minutes rather than typing the values.";
          }
        },
        {
          label: "It is a method on the class, not a loose function",
          test: function (c) {
            return /def\s+summary\s*\(\s*self\s*\)/.test(c.code) ||
              "Define it inside the class as def summary(self):";
          }
        }
      ]
    }
  ]
});
