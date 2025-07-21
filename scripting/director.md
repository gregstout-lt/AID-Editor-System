# Director: An "easier" way to execute hooks

Director is an "easier" way to execute functions, scripts, and hooks within your AI Dungeon scripting scenarios.

Director executes provided `modifier` functions in a _chain_ (`FuncA => FuncB => etc.`). The return value(s) are then _passed down_ to the next function.

<details>
  <summary>Code Example</summary>

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

</details>

---

## Installation

> For scenario creators, recommend using my "[Types for Scripting API](<https://github.com/magicoflolis/aidungeon.js/blob/main/Scripting%20Guidebook.md#types-for-scripting-api>)" along side.

<details>
  <summary>Shared Library</summary>

- Location: `Shared Library > Library`
- Code: [director.js](<https://raw.githubusercontent.com/magicoflolis/aidungeon.js/refs/heads/main/scripting/director.js>)
  - _Copy and paste Code into Location._

<details>
  <summary>Example Usage</summary>

```js
const stateA = () => {
  state.fooA = 'barA'
};
const stateB = () => {
  state.fooB = 'barB'
};
const stateC = () => {
  state.fooC = 'barC'
};

director.library(stateA, stateB, stateC);

// Equivalent to

const stateA = () => {
  state.fooA = 'barA'
};
const stateB = () => {
  state.fooB = 'barB'
};
const stateC = () => {
  state.fooC = 'barC'
};

stateA();
stateB();
stateC();
```

</details>

</details>

<details>
  <summary>Hooks (Input/Context/Output)</summary>

> [!IMPORTANT]
> Ensure `void 0` is **ALWAYS** present at the bottom of your hooks! _Or just add `//` as the last line._

- Remove/rename your `modifier` function!
  - Example: `const modifier` => `const fn`
- Remove any `modifier(text)` lines

<details>
  <summary>Code Examples</summary>

Primary:

```js
const fn = (text) => {
  return { text };
};

director.input(fn); // `onInput` hook

director.context(fn); // `onModelContext` hook

director.output(fn); // `onOutput` hook

void 0
```

Alternative:

```js
// Wrap entire "modifier()" inside `{ }`

{
  const modifier = (text) => {
    return { text };
  };

  // Replace the "modifier(text)" line
  director.input(modifier);
}

void 0
```

</details>

</details>

---

## API & Usages

<details>
  <summary>API</summary>

<details>
  <summary>Modifier Functions</summary>

```ts
function ModifierFN<T extends typeof text, S extends typeof stop>(this: typeof Director, text: T, stop: S, type: "library"): {
  text: T;
  stop?: S;
};
```

```js
/**
 * @typedef { <T extends unknown, S extends boolean>(this: typeof Director, text: T, stop?: S, type: 'output') => { text: T; stop?: S } } ModifierFN
 */

/**
 * @type { ModifierFN }
 */
const fn = function (text, stop, type) {
  // Note using "this" is typeof Director
  console.log(this.text, text, stop, type);
  return { text, stop }
}
```

</details>

<details>
  <summary>Parameter: Strings</summary>

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

void 0
```

</details>

<details>
  <summary>Return: Arrays</summary>

```js
// `onModelContext` hook

const arr = () => {
  return ['My text.', true];
};

director.context(arr);

// Output: "stop" & stop = true

void 0
```

</details>

---

</details>

<details>
  <summary>AutoCards</summary>

> [!IMPORTANT]
> Replace `AutoCards(null);` line with `director.library(AutoCards);`

_Yes it works with AutoCards._

```js
// Shared Library

//#region Director
// ...
//#endregion

function AutoCards() {} director.library(AutoCards); // ...

// `onInput` hook

director.input(AutoCards);

// `onModelContext` hook

director.context(AutoCards);

// `onOutput` hook

director.output(AutoCards);
```

</details>

---
