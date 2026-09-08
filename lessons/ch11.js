WB.chapter({
  id: "ch11",
  part: "Part 3 — Writing real code",
  title: "Functions",
  steps: [

    {
      id: "ch11-why-functions",
      title: "Why you would ever want one",
      prose: `
<p>Chapter 2 made an argument about <em>values</em>: write a number down once, give it a name,
and you only ever have to change it in one place. This chapter makes exactly the same argument
about <em>actions</em>.</p>

<p>Look at this. It works out a dose for three participants at 0.5 mg per kilogram.</p>

<pre><code>print(f"P01: {68 * 0.5:.1f} mg")
print(f"P02: {72 * 0.5:.1f} mg")
print(f"P03: {55 * 0.5:.1f} mg")</code></pre>

<p>You already know what is wrong with it, because it is the same disease as before. The rule
"multiply weight by 0.5" is written down three times. When the protocol changes — and it
will — you have to find and fix all three, and if you miss one, nothing complains.</p>

<h3>What a function is</h3>

<p>A <strong>function</strong> is a chunk of work that you give a name to, so you can do it
again by name instead of writing it out again. That is the whole idea.</p>

<pre><code>def dose_for(weight_kg):
    return weight_kg * 0.5

print(f"P01: {dose_for(68):.1f} mg")
print(f"P02: {dose_for(72):.1f} mg")
print(f"P03: {dose_for(55):.1f} mg")</code></pre>

<p>Now the rule lives in one place. Change <code>0.5</code> to <code>0.6</code> on that one
line and all three participants update.</p>

<h3>The three things you get</h3>

<ol>
<li><strong>One rule in one place.</strong> The same argument as variables, and just as
important.</li>
<li><strong>The name says what the work is.</strong> <code>dose_for(68)</code> reads as
English. <code>68 * 0.5</code> requires you to remember what 0.5 was.</li>
<li><strong>You can test it.</strong> This is the one people underrate. Once the rule is a
named thing, you can check it on its own — does <code>dose_for(10)</code> give 5? — instead
of squinting at output and hoping. Nearly everything in science that goes wrong in code goes
wrong because nobody could easily check one piece in isolation.</li>
</ol>

<div class="note"><span class="lbl">You have been using functions all along</span>
<p><code>print()</code>, <code>len()</code>, <code>round()</code>, <code>sum()</code> — all
functions somebody else wrote and named. You have been calling them since chapter 1. The only
new thing here is writing your own.</p></div>
`,
      starter: 'print(f"P01: {68 * 0.5:.1f} mg")\nprint(f"P02: {72 * 0.5:.1f} mg")\nprint(f"P03: {55 * 0.5:.1f} mg")',
      task: `<p>Rewrite this so the rule exists once.</p>
<ol>
<li>Write a function <code>dose_for(weight_kg)</code> that <strong>returns</strong> the
dose.</li>
<li>Use it in all three lines.</li>
<li>The protocol has changed to <strong>0.8</strong> mg per kilogram — make that change, in
the one place it now lives.</li>
</ol>
<p>Expected output:</p>
<pre><code>P01: 54.4 mg
P02: 57.6 mg
P03: 44.0 mg</code></pre>`,
      hint: `The function is two lines:
<pre><code>def dose_for(weight_kg):
    return weight_kg * 0.8</code></pre>
Then swap each <code>68 * 0.5</code> for <code>dose_for(68)</code>, keeping the
<code>:.1f</code> part.`,
      solution: 'def dose_for(weight_kg):\n    return weight_kg * 0.8\n\nprint(f"P01: {dose_for(68):.1f} mg")\nprint(f"P02: {dose_for(72):.1f} mg")\nprint(f"P03: {dose_for(55):.1f} mg")',
      checks: [
        {
          label: "There is a function called dose_for that returns a dose",
          test: function (c) {
            if (!/def\s+dose_for\s*\(/.test(c.code)) { return "No function called dose_for yet."; }
            var v = c.tryPy("dose_for(10)");
            if (v === undefined || v === null) {
              return "dose_for(10) gave nothing back. Does it say return, rather than print?";
            }
            return Math.abs(v - 8) < 0.0001 ||
              "dose_for(10) gave " + v + ". At 0.8 mg per kg it should be 8.";
          }
        },
        {
          label: "The old rate is gone and the new one appears once",
          test: function (c) {
            if (/\b0\.5\b/.test(c.code)) { return "0.5 is still in there somewhere."; }
            var n = (c.code.match(/\b0\.8\b/g) || []).length;
            if (n === 0) { return "The new rate 0.8 does not appear at all."; }
            return n === 1 || "0.8 appears " + n + " times — the whole point is that it now " +
              "lives in exactly one place.";
          }
        },
        {
          label: "The three doses are right",
          test: function (c) {
            var want = ["P01: 54.4 mg", "P02: 57.6 mg", "P03: 44.0 mg"];
            for (var i = 0; i < 3; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "Changing the rule once changes all three participants",
          test: function (c) {
            var swapped = c.code.replace(/\b0\.8\b/, "0.5");
            var r = c.rerun(swapped);
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            var want = ["P01: 34.0 mg", "P02: 36.0 mg", "P03: 27.5 mg"];
            for (var i = 0; i < 3; i++) {
              if (r.outLines[i] !== want[i]) {
                return "Putting the rate back to 0.5 should have changed every line, but line " +
                  (i + 1) + " came out as “" + r.outLines[i] + "”. One of them is not going " +
                  "through the function.";
              }
            }
            return true;
          }
        }
      ]
    },

    {
      id: "ch11-def-and-calling",
      title: "Writing one: def, arguments, calling",
      prose: `
<p>The anatomy, with the words named — you will see these words in every error message and
every piece of documentation, so they are worth knowing.</p>

<pre><code>def dose_for(weight_kg):
    return weight_kg * 0.8

result = dose_for(68)</code></pre>

<ul>
<li><code>def</code> — "I am defining a function". Like <code>if</code> and <code>for</code>,
the line ends in a colon and the body is indented.</li>
<li><code>dose_for</code> — the name. Same rules and conventions as variable names:
lower_case_with_underscores, and it should say what the thing does.</li>
<li><code>weight_kg</code> — a <strong>parameter</strong>. A variable that does not have a
value yet; it gets one when somebody calls the function.</li>
<li><code>dose_for(68)</code> — a <strong>call</strong>. 68 is the
<strong>argument</strong>: the actual value handed in this time.</li>
</ul>

<p>Parameter is the slot, argument is what you put in it. People use the two words
interchangeably and nothing bad happens, but the distinction is what error messages are
talking about when they say <em>"takes 1 positional argument but 2 were given"</em>.</p>

<h3>Defining is not doing</h3>

<p>This catches everyone once. Running a <code>def</code> does <strong>not</strong> run the
body. It creates the function and puts it in a box with that name, exactly like
<code>x = 5</code> puts 5 in a box — and then waits. The body only runs when something calls
it.</p>

<p>So a file full of <code>def</code>s and nothing else produces no output at all, and that is
not a bug.</p>

<div class="note warn"><span class="lbl">Define before you call</span>
<p>Python still reads top to bottom, so the <code>def</code> has to run before the call. Put
your functions at the top of the file and the code that uses them underneath. Calling a
function above its definition gives you the chapter 5 error:
<code>NameError: name 'dose_for' is not defined</code>.</p></div>

<p>A function can take more than one parameter — just separate them with commas.</p>
`,
      starter: '# Define the function here\n\n\nprint(area_of(3, 4))\nprint(area_of(10, 10))\nprint(area_of(7, 2))',
      task: `<p>Write a function <code>area_of(width, height)</code> that returns the area of a
rectangle. The three calls at the bottom should print <code>12</code>, <code>100</code> and
<code>14</code>. Do not change the calls.</p>`,
      hint: `Two lines, above the prints:
<pre><code>def area_of(width, height):
    return width * height</code></pre>`,
      solution: 'def area_of(width, height):\n    return width * height\n\n\nprint(area_of(3, 4))\nprint(area_of(10, 10))\nprint(area_of(7, 2))',
      checks: [
        {
          label: "The three calls print 12, 100 and 14",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            var want = ["12", "100", "14"];
            for (var i = 0; i < 3; i++) {
              if (c.outLines[i] !== want[i]) {
                return "Line " + (i + 1) + " was “" + c.outLines[i] + "”, expected “" + want[i] + "”.";
              }
            }
            return true;
          }
        },
        {
          label: "It works for sizes the lesson never mentioned",
          test: function (c) {
            var v = c.tryPy("area_of(6, 9)");
            if (v === undefined || v === null) {
              return "area_of(6, 9) gave nothing back — check that it returns.";
            }
            return v === 54 || "area_of(6, 9) gave " + v + ", expected 54.";
          }
        },
        {
          label: "It takes two parameters, not one",
          test: function (c) {
            return /def\s+area_of\s*\(\s*\w+\s*,\s*\w+\s*\)/.test(c.code) ||
              "The definition should take two parameters, a width and a height.";
          }
        }
      ]
    },

    {
      id: "ch11-return-vs-print",
      title: "return is not print (read this one twice)",
      prose: `
<p>This is the most important idea in the chapter and the one that costs beginners the most
time, so it gets its own step.</p>

<div class="note"><span class="lbl">The difference</span>
<p><strong><code>print</code> shows something to a human.</strong> The value goes to the
screen and is gone.</p>
<p><strong><code>return</code> hands a value back to the program.</strong> The code that
called the function receives it and can do anything with it — store it, add it to something,
pass it to another function.</p></div>

<p>They look interchangeable when you are testing, because both put a number in front of you.
They are not remotely interchangeable.</p>

<pre><code>def doubled_printed(x):
    print(x * 2)

def doubled_returned(x):
    return x * 2

a = doubled_printed(5)      # prints 10, and a is None
b = doubled_returned(5)     # prints nothing, and b is 10

print(doubled_returned(5) + 1)   # 11
print(doubled_printed(5) + 1)    # TypeError</code></pre>

<p><strong>A function with no <code>return</code> gives back <code>None</code></strong> —
the "nothing here" value from chapter 6. So the printing version is useless as a building
block: you cannot add to it, store it, or feed it into anything. It is a dead end that happens
to look right.</p>

<p>The symptom to recognise: <code>TypeError: unsupported operand type(s) for +: 'NoneType'
and 'int'</code>. That almost always means a function printed when it should have
returned.</p>

<p>Rule of thumb: <strong>functions that work something out should return it.</strong> Print
at the end, in the code that called them, where you are deciding what a human should see.</p>
`,
      starter: 'def celsius_to_f(celsius):\n    print(celsius * 9 / 5 + 32)\n\n\n# These should work once the function returns instead of printing\nprint(celsius_to_f(100))\nprint(celsius_to_f(0) + celsius_to_f(100))',
      task: `<p>Run it first and read the error — that <code>NoneType</code> message is one
you will meet again. Then change the function so it <em>returns</em> the temperature instead
of printing it. The output should become:</p>
<pre><code>212.0
244.0</code></pre>`,
      hint: `Change the one word <code>print</code> to <code>return</code>, and remove the
brackets that belonged to print.`,
      solution: 'def celsius_to_f(celsius):\n    return celsius * 9 / 5 + 32\n\n\n# These should work once the function returns instead of printing\nprint(celsius_to_f(100))\nprint(celsius_to_f(0) + celsius_to_f(100))',
      checks: [
        {
          label: "No error",
          test: function (c) {
            if (!c.error) { return true; }
            return "Still failing: " + c.error.split("\n").pop();
          }
        },
        {
          label: "celsius_to_f gives a value back instead of printing it",
          test: function (c) {
            var v = c.tryPy("celsius_to_f(100)");
            if (v === undefined || v === null) {
              return "celsius_to_f(100) still hands back None — it is printing, not returning.";
            }
            return Math.abs(v - 212) < 0.0001 ||
              "celsius_to_f(100) gave " + v + ", expected 212.";
          }
        },
        {
          label: "The result can be used in a calculation",
          test: function (c) {
            var v = c.tryPy("celsius_to_f(0) + celsius_to_f(100)");
            if (v === undefined || v === null) { return "That sum still does not work."; }
            return Math.abs(v - 244) < 0.0001 || "It came out as " + v + ", expected 244.";
          }
        },
        {
          label: "The function no longer prints anything itself",
          test: function (c) {
            return c.outLines.length === 2 ||
              "Expected exactly 2 lines of output, got " + c.outLines.length +
              ". The function should not print at all now — only the two lines at the bottom do.";
          }
        },
        {
          label: "It is right for temperatures the lesson never mentioned",
          test: function (c) {
            var v = c.tryPy("celsius_to_f(37)");
            return (v !== undefined && v !== null && Math.abs(v - 98.6) < 0.0001) ||
              "celsius_to_f(37) gave " + v + ", expected 98.6.";
          }
        }
      ]
    },

    {
      id: "ch11-default-arguments",
      title: "Sensible defaults",
      prose: `
<p>A parameter can have a default value, used when the caller does not supply one:</p>

<pre><code>def is_long_enough(minutes, threshold=300):
    return minutes >= threshold

is_long_enough(412)            # True  — uses the default 300
is_long_enough(412, 500)       # False — 500 this time</code></pre>

<p>This is how you make a function that has an obvious normal behaviour but can still be
argued with. Most of your analysis has one standard threshold; occasionally one participant
or one pilot study needs a different one. Defaults let you write the common case simply
without hard-coding it.</p>

<h3>Naming arguments at the call</h3>

<p>You can also pass arguments by name, in any order:</p>

<pre><code>is_long_enough(minutes=412, threshold=500)
is_long_enough(412, threshold=500)</code></pre>

<p>Worth doing whenever the value alone would be cryptic. <code>trim(data, True, False)</code>
tells the reader nothing; <code>trim(data, remove_edges=True, verbose=False)</code> tells them
everything. You will thank yourself when you come back to it.</p>

<div class="note warn"><span class="lbl">One trap, so you recognise it later</span>
<p>Never use a list (or dict) as a default: <code>def f(items=[]):</code> is a classic Python
bug, because that one list is created once and shared by every call that uses the default, so
it accumulates. Use <code>def f(items=None):</code> and create the list inside. You will not
hit this for a while, but when you do it is baffling, and now it will not be.</p></div>
`,
      starter: 'def usable(minutes, threshold=300):\n    return minutes >= threshold\n\n\n# Fill these in without editing the function\nstandard = None\nstricter = None\npilot = None\n\nprint(standard, stricter, pilot)',
      task: `<p>Without changing the function, set:</p>
<ul>
<li><code>standard</code> — is a 412-minute recording usable at the default threshold?</li>
<li><code>stricter</code> — is the same 412-minute recording usable if the threshold is
500?</li>
<li><code>pilot</code> — is a 200-minute recording usable at a threshold of 120, passing the
threshold <strong>by name</strong>?</li>
</ul>
<p>The output should be <code>True False True</code>.</p>`,
      hint: `<code>usable(412)</code>, then <code>usable(412, 500)</code>, then
<code>usable(200, threshold=120)</code>.`,
      solution: 'def usable(minutes, threshold=300):\n    return minutes >= threshold\n\n\n# Fill these in without editing the function\nstandard = usable(412)\nstricter = usable(412, 500)\npilot = usable(200, threshold=120)\n\nprint(standard, stricter, pilot)',
      checks: [
        {
          label: "standard uses the default threshold and is True",
          test: function (c) {
            if (c.get("standard") !== true) { return "standard is " + c.get("standard") + "."; }
            return /standard\s*=\s*usable\s*\(\s*412\s*\)/.test(c.code) ||
              "Call usable(412) with no second argument, so it falls back to the default.";
          }
        },
        {
          label: "stricter overrides the threshold and is False",
          test: function (c) {
            return c.get("stricter") === false || "stricter is " + c.get("stricter") + ".";
          }
        },
        {
          label: "pilot is True and passes the threshold by name",
          test: function (c) {
            if (c.get("pilot") !== true) { return "pilot is " + c.get("pilot") + "."; }
            return /usable\s*\(\s*200\s*,\s*threshold\s*=\s*120\s*\)/.test(c.code) ||
              "Write it as usable(200, threshold=120) — naming the argument is the point here.";
          }
        },
        {
          label: "The function itself was not edited",
          test: function (c) {
            return /def\s+usable\s*\(\s*minutes\s*,\s*threshold\s*=\s*300\s*\)/.test(c.code) ||
              "Leave the function definition exactly as it was.";
          }
        }
      ]
    },

    {
      id: "ch11-scope",
      title: "What happens inside stays inside",
      prose: `
<p>Variables created inside a function are <strong>local</strong> to it. They come into
existence when the function is called and vanish when it finishes, and the outside world never
sees them.</p>

<pre><code>def add_tax(price):
    tax = price * 0.1        # local: exists only during this call
    return price + tax

print(add_tax(100))          # 110.0
print(tax)                   # NameError: name 'tax' is not defined</code></pre>

<p>This feels like an obstacle for about a day and then becomes the thing you rely on most.
It means a function is <strong>self-contained</strong>: you can read it, understand it, and
trust it without holding the rest of the file in your head. Nothing inside it can quietly
break something a hundred lines away.</p>

<p>It is also why the parameter name is yours to choose. Inside <code>add_tax</code>, the
value is called <code>price</code>, whatever the caller happened to call it outside.</p>

<h3>Reading out is allowed; writing out is not</h3>

<p>A function <em>can</em> read a variable from outside itself. That is how it finds
<code>print</code>, and other functions. But if it assigns to a name, Python treats that name
as local for the whole function.</p>

<pre><code>count = 0

def bump():
    count = count + 1     # UnboundLocalError

bump()</code></pre>

<p>Python sees <code>count =</code> inside the function, decides <code>count</code> is local,
and then the right-hand side asks for a local <code>count</code> that has not been set yet.
There is a keyword (<code>global</code>) that overrides this, and you should almost never use
it. The good fix is the one you already know: take the value in, hand the new one back.</p>

<pre><code>def bump(count):
    return count + 1

count = bump(count)</code></pre>
`,
      starter: 'total = 0\n\ndef add_reading(total, reading):\n    # your line here\n    pass\n\n\ntotal = add_reading(total, 5)\ntotal = add_reading(total, 12)\ntotal = add_reading(total, 3)\n\nprint(total)',
      task: `<p>Make <code>add_reading</code> return the running total with the new reading
added, so the final output is <code>20</code>. Do not use <code>global</code>, and do not
change the three calls.</p>`,
      hint: `Replace the comment and the <code>pass</code> with a single line:
<code>return total + reading</code>.`,
      solution: 'total = 0\n\ndef add_reading(total, reading):\n    return total + reading\n\n\ntotal = add_reading(total, 5)\ntotal = add_reading(total, 12)\ntotal = add_reading(total, 3)\n\nprint(total)',
      checks: [
        {
          label: "It prints 20",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            return c.out === "20" || "It printed “" + c.out + "”.";
          }
        },
        {
          label: "add_reading returns the sum",
          test: function (c) {
            var v = c.tryPy("add_reading(100, 5)");
            if (v === undefined || v === null) {
              return "add_reading(100, 5) gave nothing back — it needs to return.";
            }
            return v === 105 || "add_reading(100, 5) gave " + v + ", expected 105.";
          }
        },
        {
          label: "No global keyword",
          test: function (c) {
            return !/\bglobal\b/.test(c.code) ||
              "Solve it by returning the new value rather than reaching outside the function.";
          }
        }
      ]
    },

    {
      id: "ch11-challenge-summarise",
      title: "Challenge: a function you would actually reuse",
      prose: `
<p>Everything so far, turned into one reusable tool. This is chapter 9's summarising loop —
but as a function, which means you can point it at any recording instead of editing it every
time.</p>

<p>Note that it returns a <strong>dictionary</strong>. That is the normal way a Python
function hands back several related values at once, and it is exactly the shape real
libraries use — including the ones you will meet in part 4.</p>
`,
      starter: 'def summarise(amplitudes, clip_at=300):\n    # your code here\n    pass\n\n\nnight = [22.5, 41.0, None, 380.0, 18.2, None, 55.5, 402.1, 30.0]\nresult = summarise(night)\n\nprint(result["valid"], result["clipped"], result["missing"])\nprint(f"{result[\'mean\']:.2f}")',
      task: `<p>Write <code>summarise</code> so it walks the list once and returns a
dictionary with four keys:</p>
<ul>
<li><code>"missing"</code> — how many values are <code>None</code></li>
<li><code>"clipped"</code> — how many are <code>clip_at</code> or more</li>
<li><code>"valid"</code> — how many are neither</li>
<li><code>"mean"</code> — the mean of the valid ones, or <code>0</code> if there are none</li>
</ul>
<p>Expected output:</p>
<pre><code>5 2 2
33.44</code></pre>`,
      hint: `Start the four counters at 0 before the loop. Inside, an
<code>if / elif / else</code> like chapter 9's. Keep a running <code>total</code> for the
valid ones, and after the loop guard the division with
<code>if valid > 0:</code>. Then <code>return {"missing": missing, ...}</code>.`,
      solution: 'def summarise(amplitudes, clip_at=300):\n    missing = 0\n    clipped = 0\n    valid = 0\n    total = 0\n\n    for amplitude in amplitudes:\n        if amplitude is None:\n            missing += 1\n        elif amplitude >= clip_at:\n            clipped += 1\n        else:\n            valid += 1\n            total += amplitude\n\n    mean = 0\n    if valid > 0:\n        mean = total / valid\n\n    return {"missing": missing, "clipped": clipped, "valid": valid, "mean": mean}\n\n\nnight = [22.5, 41.0, None, 380.0, 18.2, None, 55.5, 402.1, 30.0]\nresult = summarise(night)\n\nprint(result["valid"], result["clipped"], result["missing"])\nprint(f"{result[\'mean\']:.2f}")',
      checks: [
        {
          label: "The counts and mean are right for this recording",
          test: function (c) {
            if (c.error) { return "It stopped with: " + c.error.split("\n").pop(); }
            if (c.outLines[0] !== "5 2 2") {
              return "The first line was “" + c.outLines[0] + "”, expected “5 2 2”.";
            }
            return c.outLines[1] === "33.44" ||
              "The mean line was “" + c.outLines[1] + "”, expected “33.44”.";
          }
        },
        {
          label: "It returns a dictionary with all four keys",
          test: function (c) {
            var r = c.tryPy('summarise([1.0, 2.0])');
            if (r === undefined || r === null) { return "summarise returned nothing."; }
            var keys = ["missing", "clipped", "valid", "mean"];
            for (var i = 0; i < keys.length; i++) {
              if (!(keys[i] in r)) { return "The returned dictionary has no \"" + keys[i] + "\" key."; }
            }
            return true;
          }
        },
        {
          label: "It works on a completely different recording",
          test: function (c) {
            var r = c.tryPy('summarise([10.0, 20.0, None, 900.0])');
            if (!r) { return "It failed on another list."; }
            if (r.missing !== 1 || r.clipped !== 1 || r.valid !== 2) {
              return "On [10.0, 20.0, None, 900.0] it gave valid " + r.valid + ", clipped " +
                r.clipped + ", missing " + r.missing + " — expected 2, 1, 1.";
            }
            return Math.abs(r.mean - 15) < 0.0001 || "The mean came out as " + r.mean + ", expected 15.";
          }
        },
        {
          label: "clip_at is actually used, not ignored",
          test: function (c) {
            var r = c.tryPy('summarise([100.0, 200.0], clip_at=150)');
            if (!r) { return "It failed when clip_at was passed."; }
            return (r.clipped === 1 && r.valid === 1) ||
              "With clip_at=150, [100.0, 200.0] should be 1 valid and 1 clipped, but it gave " +
              r.valid + " valid and " + r.clipped + " clipped.";
          }
        },
        {
          label: "An all-missing recording does not crash",
          test: function (c) {
            var r = c.tryPy('summarise([None, None])');
            if (r === undefined || r === null) {
              return "It crashed or returned nothing on [None, None] — guard the division " +
                "when there are no valid readings.";
            }
            return r.mean === 0 || "With no valid readings the mean should be 0, but it was " + r.mean + ".";
          }
        }
      ]
    }
  ]
});
