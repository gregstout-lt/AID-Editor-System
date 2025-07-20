# Director: An "easier" way to execute hooks

Director is an "easier" way to execute functions, scripts, and hooks within your AI Dungeon scripting scenarios.

Director executes provided `modifier` functions in a _chain_ (`FuncA => FuncB => etc.`). The return value(s) are then _passed down_ to the next function.

```js
// `onInput` hook

const fn = (text) => {
  text = 'My example.';
  return { text };
};
const fnA = (text) => {
  text += ' function A.';
  return { text };
};
const fnB = (text) => {
  text += ' function B.';
  return { text };
};
const fnC = (text) => {
  text += ' function C.';
  return { text };
};

director.input(fnA, fnB, fnC);

// Output: "My example. function A. function B. function C."

// Alternative(s)

// load('input', fnA, fnB, fnC);
// director.load('input', fnA, fnB, fnC);
// director.onInput(fnA, fnB, fnC);
```

---

## Installation

For scenario creators, recommend using my "[Types for Scripting API](<https://github.com/magicoflolis/aidungeon.js/blob/main/Scripting%20Guidebook.md#types-for-scripting-api>)" along side.

**Shared Library:**

Copy n paste [director.js](https://raw.githubusercontent.com/magicoflolis/aidungeon.js/refs/heads/main/scripting/director.js)

**Hooks (Input/Context/Output):**

- **IMPORTANT:**
  - Ensure `// Do not remove this line` is ALWAYS present at the bottom of your hook(s)! _Or just add `//` as the last line._
  - Remove/rename your `modifier` function!
    - Example: `const modifier` => `const fn`
  - Remove the `modifier(text)` lines

```js
const fn = (text) => {
  return { text };
};

director.input(fn); // `onInput` hook

director.context(fn); // `onModelContext` hook

director.output(fn); // `onOutput` hook

// Do not remove this line
```

**Alternative(s):**

```js
// Wrap entire "modifier()" inside `{ }`

{
  const modifier = (text) => {
    return { text };
  };

  // Replace the "modifier(text)" line
  director.input(modifier);
}

// Do not remove this line
```

---

## Use Cases

_Yes it works with AutoCards._

**AutoCards:**

```js
// Shared Library
function AutoCards() {}

// Replace the "AutoCards(null);" line
director.library(AutoCards);

// `onInput` hook

director.input(AutoCards);

// `onModelContext` hook

director.context(AutoCards);

// `onOutput` hook

director.output(AutoCards);
```

---

**Strings:**

```js
// `onOutput` hook

const fn = () => 'My character will ';
const fnStr = '(text) => { return { text: "Draw a card " } }';
const myFunction = (text) => {
  text += 'then pause the story.';
  return { text };
};

director.output(fn, fnStr, myFunction.toString());

// Output: "My character will draw a card then pause the story."
```

---

**Arrays:**

```js
// `onModelContext` hook

const arr = () => {
  return ['My text.', true];
};

director.context(arr);

// Output: "stop" & stop = true
```

---
