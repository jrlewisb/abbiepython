WB.chapter({
  id: "ch08",
  part: "Part 2 — Decisions and repetition",
  title: "Lists",
  steps: [

    {
      id: "ch08-many-values-one-name",
      reading: [
        { title: "Data structures",
          url: "https://docs.python.org/3/tutorial/datastructures.html",
          note: "Lists, dictionaries, tuples and sets in one place, with every method they have." },
      ],
      title: "Many values, one name",
      prose: `
<p>Every variable so far has held exactly one thing. That is fine for a weight or a subject
ID, and completely useless for data.</p>

<p>Think about what you actually have in front of you at work: a night of sleep chopped into
thirty-second epochs is roughly <strong>1,000 epochs</strong>. An fMRI run is a few hundred
volumes. You are not going to write <code>epoch_1</code>, <code>epoch_2</code>, …,
<code>epoch_1000</code>, and even if you did, you would then have no way to say "do this to
all of them".</p>

<p>A <strong>list</strong> holds an ordered collection of values under a single name. This is
the idea that makes the next chapter — loops — possible, and loops are where the computer
starts doing the boring work for you. One name, one instruction, a thousand epochs.</p>

<h3>Making one</h3>

<pre><code>readings = [12, 7, 40, 3, 22]
channels = ["EEG", "EOG", "EMG"]
mixed    = [1, "two", 3.0]          # legal, but usually a sign something is wrong</code></pre>

<p>Square brackets, commas between the items. The list keeps them <strong>in order</strong>,
and that order does not change unless you change it — which matters when the order is the
data, as it is for a time series.</p>

<p>You get at individual items by position, and — as with strings in chapter 4 —
<strong>positions start at 0</strong>:</p>

<pre><code>readings[0]     # 12, the first one
readings[4]     # 22, the fifth one
readings[-1]    # 22, the last one, counting backwards
len(readings)   # 5, how many there are</code></pre>

<p><code>readings[-1]</code> is worth adopting as a habit straight away: it means "the last
one" no matter how long the list is, so it keeps working when your data changes size.</p>

<div class="note warn"><span class="lbl">Remember this one — it will matter later</span>
<p>MATLAB counts from 1. Python counts from 0.</p>
<p>So in a list of 5 items, the first is at index 0 and the last is at index 4.
<code>readings[5]</code> is an <code>IndexError</code>. When you are moving between MATLAB and
Python — which you will be — this is where off-by-one errors live, and they are the quiet
kind that produce a plausible wrong answer rather than a crash. Chapter 17 is devoted to
this.</p></div>
`,
      starter: 'readings = [12, 7, 40, 3, 22]\n\nprint(readings)\nprint(readings[0])\nprint(readings[-1])\nprint(len(readings))\nprint(readings[5])',
      task: `<p>The last line crashes. Read the error, then change it so it prints the last
reading — in a way that would still work if the list got longer.</p>`,
      hint: `<code>readings[-1]</code> always means "the last one", however long the list is.`,
      solution: 'readings = [12, 7, 40, 3, 22]\n\nprint(readings)\nprint(readings[0])\nprint(readings[-1])\nprint(len(readings))\nprint(readings[-1])',
      checks: [
        {
          label: "No IndexError",
          test: function (c) { return !c.error || "Still failing: " + c.error.split("\n").pop(); }
        },
        {
          label: "The last line prints 22",
          test: function (c) {
            return c.outLines[c.outLines.length - 1] === "22" ||
              "The last line of output was “" + c.outLines[c.outLines.length - 1] + "”.";
          }
        },
        {
          label: "It still works when the list is a different length",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\[12, 7, 40, 3, 22\]/, "[5, 6, 7]"));
            if (r.error) { return "It broke on a shorter list: " + r.error.split("\n").pop(); }
            return r.outLines[r.outLines.length - 1] === "7" ||
              "On a 3-item list the last line printed “" +
              r.outLines[r.outLines.length - 1] + "”. Use -1 rather than a fixed number.";
          }
        }
      ]
    },

    {
      id: "ch08-slicing-out-piece",
      title: "Slicing out a piece",
      prose: `
<p>Slicing works exactly as it did on strings, and the same rule applies:
<strong>the start is included, the stop is not</strong>.</p>

<pre><code>readings = [12, 7, 40, 3, 22]

readings[1:3]    # [7, 40]      — items 1 and 2
readings[:2]     # [12, 7]      — from the start
readings[2:]     # [40, 3, 22]  — to the end
readings[-2:]    # [3, 22]      — the last two</code></pre>

<p>A slice always hands you back a <strong>new list</strong>. The original is untouched.</p>

<div class="note"><span class="lbl">Why exclusive ends are actually nicer</span>
<p>It looks arbitrary until you notice two things. <code>readings[:n]</code> and
<code>readings[n:]</code> split the list perfectly with no overlap and nothing missed. And
the length of <code>readings[a:b]</code> is just <code>b - a</code>. Every alternative
convention breaks one of those.</p>
<p>MATLAB includes the end, so <code>x(2:4)</code> there is three elements. In Python
<code>x[2:4]</code> is two. Same-looking code, different answer.</p></div>
`,
      starter: 'epochs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\n\nfirst_three = []\nlast_three = []\nmiddle = []\n\nprint(first_three)\nprint(last_three)\nprint(middle)',
      task: `<p>Using slices of <code>epochs</code>, set <code>first_three</code> to the first
three epochs, <code>last_three</code> to the last three, and <code>middle</code> to epochs 4,
5 and 6 (that is, the values <code>4, 5, 6</code>). Do not type the numbers out.</p>`,
      hint: `For the middle one, the value 4 sits at index 4, and you want to stop before
index 7.`,
      solution: 'epochs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\n\nfirst_three = epochs[:3]\nlast_three = epochs[-3:]\nmiddle = epochs[4:7]\n\nprint(first_three)\nprint(last_three)\nprint(middle)',
      checks: [
        {
          label: "first_three is [0, 1, 2]",
          test: function (c) {
            return JSON.stringify(c.get("first_three")) === "[0,1,2]" ||
              "It is " + JSON.stringify(c.get("first_three")) + ".";
          }
        },
        {
          label: "last_three is [7, 8, 9]",
          test: function (c) {
            return JSON.stringify(c.get("last_three")) === "[7,8,9]" ||
              "It is " + JSON.stringify(c.get("last_three")) + ".";
          }
        },
        {
          label: "middle is [4, 5, 6]",
          test: function (c) {
            var m = JSON.stringify(c.get("middle"));
            if (m === "[4,5,6,7]") { return "One too many — the stop index is not included."; }
            return m === "[4,5,6]" || "It is " + m + ".";
          }
        },
        {
          label: "All three came from slicing, not typing",
          test: function (c) {
            return (c.code.match(/epochs\s*\[/g) || []).length >= 3 ||
              "Each of the three should be a slice of epochs.";
          }
        }
      ]
    },

    {
      id: "ch08-lists-can-be-changed",
      title: "Lists can be changed; strings cannot",
      prose: `
<p>This is a real difference and it trips people up. A string is <strong>immutable</strong> —
every string method hands you a new string. A list is <strong>mutable</strong> — you can
change it in place, and the methods that do so return nothing.</p>

<pre><code>readings.append(9)        # add 9 to the end
readings.insert(0, 99)    # put 99 at position 0, shuffling everything along
readings.remove(40)       # delete the first 40 you find
last = readings.pop()     # remove the last item AND hand it back
readings.sort()           # reorder in place
readings.reverse()        # flip in place</code></pre>

<div class="note warn"><span class="lbl">The classic mistake</span>
<p><code>readings = readings.append(9)</code> destroys your list. <code>append</code> changes
the list and returns <code>None</code>, so you have just assigned <code>None</code> over the
top of it. Call it on its own line: <code>readings.append(9)</code>.</p>
<p>Compare with <code>sorted(readings)</code>, which leaves the original alone and returns a
new sorted list. As a rough rule: methods called <em>on</em> the list change it, and
functions called <em>with</em> the list give you something new.</p></div>
`,
      starter: 'kept = [40, 12, 7]\n\n# add 22 to the end\n\n# remove the 7\n\n# sort it smallest to largest\n\nprint(kept)',
      task: `<p>Follow the three comments so the final list prints as
<code>[12, 22, 40]</code>. Use the methods, not a rewritten list.</p>`,
      hint: `Three lines, each on its own: <code>kept.append(22)</code>,
<code>kept.remove(7)</code>, <code>kept.sort()</code>. None of them go on the right of an
<code>=</code>.`,
      solution: 'kept = [40, 12, 7]\n\nkept.append(22)\n\nkept.remove(7)\n\nkept.sort()\n\nprint(kept)',
      checks: [
        {
          label: "The list prints as [12, 22, 40]",
          test: function (c) {
            var k = c.get("kept");
            if (k === null) {
              return "kept is None — that happens when you write kept = kept.append(...). " +
                "Call the method on its own line.";
            }
            return JSON.stringify(k) === "[12,22,40]" || "It is " + JSON.stringify(k) + ".";
          }
        },
        {
          label: "You used append",
          test: function (c) { return /\.append\s*\(/.test(c.code) || "Use kept.append(22)."; }
        },
        {
          label: "You used remove",
          test: function (c) { return /\.remove\s*\(/.test(c.code) || "Use kept.remove(7)."; }
        },
        {
          label: "You sorted rather than retyping the list",
          test: function (c) {
            return /\.sort\s*\(|sorted\s*\(/.test(c.code) || "Use kept.sort().";
          }
        }
      ]
    },

    {
      id: "ch08-questions-can-ask-list",
      title: "Questions you can ask a list",
      prose: `
<p>These come up constantly, and all of them leave the list alone:</p>

<pre><code>len(readings)        # how many
sum(readings)        # total
min(readings)        # smallest
max(readings)        # largest
sorted(readings)     # a new sorted list
40 in readings       # True or False — is it there?
readings.count(40)   # how many times does it appear
readings.index(40)   # at what position is the first one</code></pre>

<p>The mean is just <code>sum(readings) / len(readings)</code>. There is a
<code>statistics</code> module with a proper <code>mean()</code> in it, which you will meet in
chapter 14 — but it is worth seeing that the arithmetic is not hiding anything.</p>
`,
      starter: 'durations = [412, 388, 455, 301, 502, 377]\n\nlongest = 0\nshortest = 0\naverage = 0\nany_short = False\n\nprint(longest, shortest)\nprint(round(average, 1))\nprint(any_short)',
      task: `<p>Set <code>longest</code> and <code>shortest</code> to the largest and smallest
durations, <code>average</code> to the mean, and <code>any_short</code> to whether
<code>301</code> appears in the list. Expected output:</p>
<pre><code>502 301
405.8
True</code></pre>`,
      hint: `<code>max</code>, <code>min</code>, <code>sum(...) / len(...)</code>, and
<code>301 in durations</code>.`,
      solution: 'durations = [412, 388, 455, 301, 502, 377]\n\nlongest = max(durations)\nshortest = min(durations)\naverage = sum(durations) / len(durations)\nany_short = 301 in durations\n\nprint(longest, shortest)\nprint(round(average, 1))\nprint(any_short)',
      checks: [
        {
          label: "longest is 502",
          test: function (c) { return c.get("longest") === 502 || "It is " + c.get("longest") + "."; }
        },
        {
          label: "shortest is 301",
          test: function (c) { return c.get("shortest") === 301 || "It is " + c.get("shortest") + "."; }
        },
        {
          label: "average is the mean, 405.83…",
          test: function (c) {
            var a = c.get("average");
            if (typeof a !== "number") { return "average is not a number."; }
            return Math.abs(a - 405.8333333333333) < 0.001 || "It is " + a + ".";
          }
        },
        {
          label: "any_short is True",
          test: function (c) { return c.get("any_short") === true || "It is " + c.get("any_short") + "."; }
        },
        {
          label: "It all still works on a different list",
          test: function (c) {
            var r = c.rerun(c.code.replace(/\[412, 388, 455, 301, 502, 377\]/, "[10, 20, 30]"));
            if (r.error) { return "It broke: " + r.error.split("\n").pop(); }
            if (r.get("longest") !== 30 || r.get("shortest") !== 10) {
              return "On [10, 20, 30] it gave longest " + r.get("longest") +
                " and shortest " + r.get("shortest") + ".";
            }
            return Math.abs(r.get("average") - 20) < 0.001 ||
              "On [10, 20, 30] the average came out as " + r.get("average") + ".";
          }
        }
      ]
    }
  ]
});
