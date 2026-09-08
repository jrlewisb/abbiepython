/* ---------------------------------------------------------------
   The always-open reference panel. Every entry says where it was
   taught, so it doubles as a way back to the lesson.

   Keep entries SHORT. This is for "what was the syntax again?",
   not for learning from — the chapters do the teaching.
   --------------------------------------------------------------- */
window.CHEATSHEET = [

  {
    title: "The absolute basics",
    items: [
      { code: 'print("hello")', note: "Show something. Text goes in quotes.",
        at: "ch01-print-brackets-are" },
      { code: 'print("age:", 36, "years")', note: "Several things at once — one space between each.",
        at: "ch01-print-brackets-are" },
      { code: "# this is ignored", note: "A comment. For humans, not Python.",
        at: "ch01-notes-yourself-comments" },
      { code: "p = 50", note: "Put 50 in a box labelled p. No quotes around a name.",
        at: "ch02-label-on-box" },
      { code: "x = x + 3\nx += 3", note: "Same thing. Work out the right, store it on the left.",
        at: "ch02-does-mean-equals" },
      { code: "trial_count = 12", note: "Names: lower_case_with_underscores, and say what it is.",
        at: "ch02-naming-things" }
    ]
  },

  {
    title: "Indentation — the one that bites",
    note: "In Python the spaces at the start of a line are part of the grammar, not decoration. " +
          "Indented lines are INSIDE the thing above them. Four spaces per level. Press Tab.",
    items: [
      { code: 'if score > 10:\n    print("inside the if")\n    print("also inside")\n\nprint("outside — always runs")',
        note: "The colon opens a block. The indented lines are the block.",
        at: "ch07-if-indentation-point" },
      { code: 'for x in items:\n    if x > 0:\n        print(x)',
        note: "Two levels: the if is inside the loop, the print is inside the if.",
        at: "ch09-doing-something-every-item" },
      { code: "SyntaxError: expected ':'", note: "You forgot the colon at the end of the opening line.",
        at: "ch07-if-indentation-point" },
      { code: "IndentationError", note: "Lines that should line up do not. Never mix tabs and spaces.",
        at: "ch07-if-indentation-point" }
    ]
  },

  {
    title: "Numbers",
    items: [
      { code: "7        # int, a whole number\n7.0      # float, a decimal", note: "Count with ints, measure with floats.",
        at: "ch03-two-kinds-number" },
      { code: "+  -  *  /", note: "Ordinary arithmetic. / always gives a float: 10 / 2 is 5.0",
        at: "ch03-arithmetic-have-two-have" },
      { code: "17 // 5   # 3, whole times it goes in\n17 % 5    # 2, the remainder\n2 ** 10   # 1024, to the power of",
        note: "// and % answer 'how many whole, and what is left'.",
        at: "ch03-arithmetic-have-two-have" },
      { code: "round(3.14159, 2)   # 3.14\nint(3.9)            # 3, chopped\nabs(-7)             # 7",
        note: "int() chops, round() rounds.", at: "ch03-converting-rounding" },
      { code: "(a + b + c) / 3", note: "Use brackets whenever there is any doubt.",
        at: "ch03-brackets-beat-memory" }
    ]
  },

  {
    title: "Text, and f-strings",
    items: [
      { code: '"double" or \'single\'', note: "Either, as long as both ends match.",
        at: "ch04-strings-gluing-them-together" },
      { code: 'f"{name} is {age} years old"',
        note: "The f before the quote is required. Braces are holes that get filled in.",
        at: "ch04-f-strings-good-way" },
      { code: 'f"{value:.2f}"   # 0.87\nf"{n:02d}"       # 07',
        note: "After the colon: how to display it. .2f = 2 decimal places. 02d = pad to 2 digits.",
        at: "ch04-f-strings-good-way" },
      { code: 'word[0]     # first\nword[-1]    # last\nword[0:3]   # first three',
        note: "Counting starts at 0. The stop is NOT included.", at: "ch04-reaching-into-string" },
      { code: 'text.strip()\ntext.lower()\ntext.replace(" ", "_")\ntext.split(",")',
        note: "These return a NEW string — catch the result: text = text.strip()",
        at: "ch04-things-strings-can-do" }
    ]
  },

  {
    title: "True and False",
    items: [
      { code: "==  !=  <  >  <=  >=", note: "= assigns. == compares.",
        at: "ch06-asking-questions-about-values" },
      { code: "a > 5 and b < 10\nx == 1 or x == 2\nnot flagged",
        note: "Write both comparisons out — 'x == 1 or 2' does not mean what it looks like.",
        at: "ch06-combining-questions-or" },
      { code: "if value is None:\nif value is not None:",
        note: "For None use 'is', never '=='.", at: "ch06-empty-things-are-false" },
      { code: '0   ""   []   {}   None', note: "All count as False. Everything else is True.",
        at: "ch06-empty-things-are-false" }
    ]
  },

  {
    title: "Making decisions",
    items: [
      { code: 'if score >= 80:\n    grade = "high"\nelif score >= 50:\n    grade = "medium"\nelse:\n    grade = "low"',
        note: "First match wins, then the rest is skipped. Order matters.", at: "ch07-else-elif" },
      { code: "# three separate ifs = a bug", note: "They all run, and later ones overwrite earlier ones.",
        at: "ch07-bug-elif-exists-prevent" }
    ]
  },

  {
    title: "Lists",
    items: [
      { code: "readings = [12, 7, 40]", note: "Ordered, and you can change it.",
        at: "ch08-many-values-one-name" },
      { code: "readings[0]    # 12, the first\nreadings[-1]   # 40, the last\nlen(readings)  # 3",
        note: "Positions start at 0. MATLAB starts at 1 — this is where off-by-ones live.",
        at: "ch08-many-values-one-name" },
      { code: "readings[1:3]   # items 1 and 2\nreadings[:2]    # from the start\nreadings[-2:]   # the last two",
        note: "Start included, stop not.", at: "ch08-slicing-out-piece" },
      { code: "readings.append(9)\nreadings.remove(7)\nreadings.sort()",
        note: "These change the list in place and return nothing. Never write x = x.append(9).",
        at: "ch08-lists-can-be-changed" },
      { code: "sum(x)   min(x)   max(x)\nsorted(x)   40 in x   x.count(40)",
        note: "These leave the list alone.", at: "ch08-questions-can-ask-list" }
    ]
  },

  {
    title: "Loops",
    items: [
      { code: "for reading in readings:\n    print(reading)", note: "Once per item. Singular name for the item.",
        at: "ch09-doing-something-every-item" },
      { code: "for i in range(5):       # 0,1,2,3,4\nfor i in range(1, 6):   # 1..5",
        note: "Stops BEFORE the end number.", at: "ch09-looping-fixed-number-times" },
      { code: "for i, item in enumerate(items, 1):",
        note: "Position and item together. The 1 makes it count from 1.",
        at: "ch09-looping-fixed-number-times" },
      { code: "total = 0\nfor x in values:\n    total += x\nprint(total)",
        note: "The accumulator: set up before, update inside, use after.",
        at: "ch09-accumulator-pattern-behind-almost" },
      { code: "continue   # skip to the next one\nbreak      # leave the loop now",
        at: "ch09-while-break-continue" }
    ]
  },

  {
    title: "Dictionaries, tuples, sets",
    items: [
      { code: 'rec = {"subject": "P07", "minutes": 412}\nrec["subject"]      # "P07"\nrec["scored"] = True',
        note: "Look things up by name instead of position.", at: "ch10-dictionaries-looking-things-up" },
      { code: 'rec.get("stage")\nrec.get("stage", "unknown")\n"stage" in rec',
        note: "Use .get() when the key might be missing — [] raises KeyError.",
        at: "ch10-dictionaries-looking-things-up" },
      { code: "for key, value in rec.items():", note: "Both halves at once.",
        at: "ch10-walking-through-dictionary" },
      { code: "tally = {}\nfor item in things:\n    tally[item] = tally.get(item, 0) + 1",
        note: "The tally pattern. Counts how many of each.", at: "ch10-counting-things-tally-pattern" },
      { code: "point = (10, 20)     # tuple: cannot change\na, b = b, a          # unpacking\nset(stages)          # the distinct ones",
        at: "ch10-tuples-sets-briefly" }
    ]
  },

  {
    title: "Functions",
    items: [
      { code: "def dose_for(weight_kg):\n    return weight_kg * 0.8\n\ndose_for(68)",
        note: "def defines it; it only runs when called. Define above the call.",
        at: "ch11-def-and-calling" },
      { code: "return   # hands the value back\nprint    # shows it and throws it away",
        note: "A function with no return gives back None.", at: "ch11-return-vs-print" },
      { code: "def usable(minutes, threshold=300):\n    ...\n\nusable(412)\nusable(412, threshold=500)",
        note: "Defaults for the normal case; name the argument when the value alone is cryptic.",
        at: "ch11-default-arguments" },
      { code: "# variables made inside stay inside", note: "Take values in as parameters, hand results back with return.",
        at: "ch11-scope" }
    ]
  },

  {
    title: "When it breaks",
    note: "Read the LAST line first — that says what went wrong. Then the line number. " +
          "Python stops at the first problem, so fix one and run again.",
    items: [
      { code: "NameError: name 'x' is not defined", note: "Typo, or used before the line that creates it.",
        at: "ch12-five-errors" },
      { code: "TypeError: ... 'NoneType' and 'int'", note: "A function printed when it should have returned.",
        at: "ch12-five-errors" },
      { code: "IndexError / KeyError", note: "Asked for a position or key that is not there.",
        at: "ch12-five-errors" },
      { code: 'ValueError: invalid literal for int()', note: "Right type, impossible value — int(\"hello\").",
        at: "ch12-five-errors" },
      { code: 'print("total:", total)\nprint(repr(value))',
        note: "Label your prints. repr() shows quotes and hidden whitespace.",
        at: "ch12-print-debugging" },
      { code: "try:\n    value = int(text)\nexcept ValueError:\n    value = None",
        note: "For messy data, not for your own bugs. Never a bare except:.",
        at: "ch12-try-except" }
    ]
  },

  {
    title: "The dot",
    items: [
      { code: "text.upper()      # method: something it DOES — brackets\narray.shape       # attribute: something it HAS — no brackets",
        note: "<bound method ...> in your output means you forgot the brackets.",
        at: "ch13-attributes-vs-methods" },
      { code: "dir(thing)\nhelp(thing.method)", note: "What can this object do?",
        at: "ch13-methods-vs-functions" },
      { code: "class Recording:\n    def __init__(self, subject):\n        self.subject = subject\n\n    def summary(self):\n        return self.subject",
        note: "__init__ runs when you make one. self is the object itself.",
        at: "ch13-your-own-class" }
    ]
  },

  {
    title: "Imports and files",
    items: [
      { code: "import statistics\nfrom math import sqrt\nimport numpy as np",
        note: "Prefer the module form or 'as'. Never 'from x import *'.", at: "ch14-import-forms" },
      { code: "statistics.mean(x)\nCounter(items).most_common(1)\nPath(\"data\") / \"file.csv\"",
        at: "ch14-whats-in-the-box" },
      { code: 'with open("run.log") as f:\n    for line in f:\n        line = line.strip()\n        if not line:\n            continue',
        note: "Always 'with'. Always strip — every line arrives with its \\n attached.",
        at: "ch15-reading-line-by-line" },
      { code: 'import csv\nwith open("data.csv") as f:\n    for row in csv.DictReader(f):\n        print(row["subject"])',
        note: "Handles commas inside quoted fields. .split(\",\") does not.", at: "ch15-csv-by-hand" },
      { code: 'line.split(None, 3)', note: "Split at most 3 times — the rest stays in one piece.",
        at: "ch15-challenge-log-parser" }
    ]
  },

  {
    title: "NumPy",
    items: [
      { code: "import numpy as np\nsignal = np.array([12.5, -3.0, 44.2])",
        at: "ch16-making-arrays" },
      { code: "signal.shape   signal.size\nsignal.ndim    signal.dtype",
        note: "Attributes — no brackets. shape is (rows, columns).", at: "ch16-making-arrays" },
      { code: "signal / 1000\nsignal - baseline\nsignal.mean()   np.abs(signal)   signal.argmax()",
        note: "Whole-array maths. No loop needed — argmax gives the position, not the value.",
        at: "ch16-vectorised-maths" },
      { code: "signal[signal > 300]\n(signal > 300).sum()\nsignal[(signal > -300) & (signal < 300)]",
        note: "Masks. Use & and | (not 'and'/'or'), and bracket each condition.",
        at: "ch16-boolean-masks" },
      { code: "data[0, 2]      # row 0, column 2\ndata[:, 0]      # column 0 of every row\ndata.mean(axis=1)",
        note: "axis names the dimension that DISAPPEARS. Check .shape before and after.",
        at: "ch16-axes" }
    ]
  }
];
