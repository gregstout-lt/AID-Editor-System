<h1 align="center">
<sub>
<img src="https://assets.super.so/311da5e0-9a02-4177-9f6a-b89435645aea/uploads/favicon/bbfec7e8-617f-4912-aa47-3e4f616731c6.jpg" height="38" width="38">
</sub>
Magic's Scripting Guidebook
</h1>

Collection of tips & tricks + improvements for [AI Dungeon's](<https://www.aidungeon.com>) code editor.

**Things to keep in-mind:**

- `AI Dungeon's code editor = Monaco = VSCode / Visual Studio Code`
- `Scripting API = Scripting environment in the Scenario editor`

## **External Links**

**General:**

- ⭐[AI Dungeon Guidebook](<https://help.aidungeon.com>)
  - ⭐[Creating Scripts for AI Dungeon](<https://help.aidungeon.com/scripting>)
  - ⭐[What are Scripts and how do you Install them?](<https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them>)
- [Monaco - The Editor of the Web](<https://microsoft.github.io/monaco-editor>)
- [Visual Studio Code - The open source AI code editor](<https://code.visualstudio.com>)

**VSCode:**

- ⭐[Basic editing | VSCode](<https://code.visualstudio.com/docs/editing/codebasics>)
  - ⭐[Case changing in regex replace | Basic editing](<https://code.visualstudio.com/docs/editing/codebasics#_case-changing-in-regex-replace>)
- [Code Navigation | VSCode](<https://code.visualstudio.com/docs/editing/editingevolved>)
- [Working with JavaScript | VSCode](<https://code.visualstudio.com/docs/nodejs/working-with-javascript>)
- [Glob Patterns Reference | VSCode](<https://code.visualstudio.com/docs/editor/glob-patterns>)
- Local Code Editor:
  - Downloads:
    - ⭐[VSCodium](<https://github.com/VSCodium/vscodium/releases>) - [🏠](<https://vscodium.com>)
    - [VSCode](<https://code.visualstudio.com/Download>)
  - Extensions (Ctrl + Shift + X):
    - ⭐[ESLint](<https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint>) - [🏠](<https://eslint.org>)
    - ⭐[Local History](<https://marketplace.visualstudio.com/items?itemName=xyz.local-history>) - [🏠](<https://github.com/zabel-xyz/local-history>)
    - ⭐[Region Viewer](<https://marketplace.visualstudio.com/items?itemName=SantaCodes.santacodes-region-viewer>) - [🏠](<https://github.com/berabue/vscode-region-viewer>)
    - [EditorConfig for VS Code](<https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig>) - [🏠](<https://editorconfig.org>)
    - [Prettier - Code formatter](<https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>) - [🏠](<https://prettier.io>)

**JavaScript:**

- General:
  - ⭐[JavaScript | MDN](<https://developer.mozilla.org/en-US/docs/Web/JavaScript>)
  - ⭐[Favorite single line of code | 1loc](<https://github.com/phuocng/1loc>) / [Wayback Machine](<https://web.archive.org/web/20250419154835/https://phuoc.ng/collection/1-loc/>)
  - ⭐[Airbnb JavaScript Style Guide | GitHub](<https://github.com/airbnb/javascript>)
  - [You Don't Know JS Yet (book series) - 2nd Edition | GitHub](<https://github.com/getify/You-Dont-Know-JS>)
  - [The Modern JavaScript Tutorial | javascript.info](<https://javascript.info/>)
- Videos:
  - ⭐[JS Destructuring in 100 Seconds | YouTube](<https://youtu.be/UgEaJBz3bjY>)
  - ⭐[JavaScript Visualized - Event Loop, Web APIs, (Micro)task Queue | YouTube](<https://youtu.be/eiC58R16hb8>)

**TypeScript:**

- General:
  - ⭐[@use JSDoc | JSDoc](<https://jsdoc.app/>)
  - ⭐[JS Projects Utilizing TypeScript | TypeScript](<https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html>)
  - ⭐[Type Checking JavaScript Files | TypeScript](<https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html>)
  - [Triple-Slash Directives | TypeScript](<https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html>)
  - [TypeScript Handbook | TypeScript](<https://www.typescriptlang.org/docs/handbook/intro.html>)

---

## Types for Scripting API

AI Dungeon's code editor <ins>does not</ins> include typings for `Scripting API`.

Follow these instructions below:

- **AI Dungeon:**
  - *The only difference between **SharedLibraryTypes.js** and **ScriptingTypes.js** is `ScriptingTypes.js` adds typings for the `modifier` function.*
  - Shared Library:
    - Copy everything within [SharedLibraryTypes.js](<https://github.com/magicoflolis/aidungeon.js/blob/main/types/SharedLibraryTypes.js>).
    - Paste into the top of your `Shared Library > Library` script.
  - Scripts:
    - Copy everything within [ScriptingTypes.js](<https://github.com/magicoflolis/aidungeon.js/blob/main/types/ScriptingTypes.js>).
    - Paste into the top of your `Scripts > Input | Context | Output` script sections.

---

<details>
  <summary>Example Layout</summary>

Shared Library:

```js
// #region "Shared Library" Typings

// Big loooooong list

// #endregion

// Your library scripts
// ...
```

Scripts:

```js
// #region "Scripts" Typings

// Big loooooong list

// #endregion

// Checkout the Guidebook examples to get an idea of other ways you can use scripting
// https://help.aidungeon.com/scripting

// Every script needs a modifier function
const modifier = (text) => {
  return { text }
}

// Don't modify this part
modifier(text)
```

</details>

---

- **Local Code Editor:**
  - *You may use the same method instructed **above**.*
  - Or, save [SharedLibraryTypes.d.ts](<https://github.com/magicoflolis/aidungeon.js/blob/main/types/SharedLibraryTypes.d.ts>) + [ScriptingTypes.d.ts](<https://github.com/magicoflolis/aidungeon.js/blob/main/types/ScriptingTypes.d.ts>) as local files into your workspace.
  - Add `/// <reference types="${relative path}/SharedLibraryTypes.d.ts"/>` to the top of your file if it is a `Library` script.
  - Add `/// <reference types="${relative path}/ScriptingTypes.d.ts"/>` to the top of your file if it is a `Input | Context | Output` script.

---

<details>
  <summary>Example Workspace</summary>

Workspace:

```bash
My-Workspace-Folder
├───src
│       context.js
│       input.js
│       library.js
│       output.js
│
└───types
        ScriptingTypes.d.ts
        SharedLibraryTypes.d.ts
```

library.js:

```js
/// <reference types="../types/SharedLibraryTypes.d.ts"/>

log(info.actionCount); // Hover over to test
```

context.js:

```js
/// <reference types="../types/ScriptingTypes.d.ts"/>

log(info.actionCount); // Hover over to test

// Every script needs a modifier function
const modifier = (text) => {
  return { text }
}

// Don't modify this part
modifier(text)
```

</details>

---

## Fix Type References for Scripting API

> Not needed when [Types for Scripting API](#types-for-scripting-api) is already setup!

AI Dungeon's code editor types are <ins>not configured</ins> properly.

For example, DOM types (`window`, `setTimout`, etc.) exist within the editor but **not** in `Scripting API`.

Follow these instructions below:

- **AI Dungeon:**
  - Copy + Paste `Reference Code` into the top of your `Shared Library > Library` AND `Scripts > Input | Context | Output` script sections.
- **Local Code Editor:**
  - *Use the same method instructed **above** into each file.*

---

<details>
  <summary>Reference Code</summary>

```ts
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
```

</details>

---

<details>
  <summary>Example Layout</summary>

```js
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>

// Checkout the Guidebook examples to get an idea of other ways you can use scripting
// https://help.aidungeon.com/scripting

// Any functions or variables you define here will be available in your other modifier scripts.

const secretNameOfTheKing = "Bob"

function getKingName() {
  return secretNameOfTheKing
}
```

</details>

---

## Scripting API

<details>
  <summary>Console</summary>

> The console's output is **"different"** from the "adverage" JavaScript console.

When working with the JavaScript [console](<https://developer.mozilla.org/docs/Web/API/console/log_static>), normally you would expect your output to look like this:

```js
const foo = {};

foo.bar = undefined;

// Output: undefined
console.log(foo.bar);
```

However, in AI Dungeon, your output looks like this:

```js
const foo = {};

foo.bar = undefined;

// Output: null
console.log(foo.bar);
```

---

**What is actually happening:**

- When `console.log` is called or when the user inputs an action in an adventure, it is parsed through AI Dungeon's GraphQL.
- AI Dungeon's GraphQL **always** returns a JSON type response, causing our input to be *stringify*.

---

<details>
  <summary>Visual Response</summary>

<p>
  <img src="https://raw.githubusercontent.com/magicoflolis/aidungeon.js/refs/heads/main/assets/console-graphql.png">
  <img src="https://raw.githubusercontent.com/magicoflolis/aidungeon.js/refs/heads/main/assets/console-scripting.png">
</p>

</details>

---

- Below is an example of what is happening behind the scenes.

---

<details>
  <summary>Example: console.log</summary>

```js
// For a visual result;
// Paste into your web browsers console or some other javascript console.

const foo = {};

foo.bar = undefined;

const output = { logs: [] };

output.logs.push(foo.bar);

// Result: { "logs": [ null ] }
console.log(JSON.stringify(output, null, ' '));
```

</details>

</details>

---

<details>
  <summary>Functions</summary>

Scripting API hooks have access to the following functions.

<details>
  <summary>log</summary>

Work in progress.

</details>

---

<details>
  <summary>addStoryCard</summary>

Work in progress.

</details>

---

<details>
  <summary>removeStoryCard</summary>

Work in progress.

</details>

---

<details>
  <summary>updateStoryCard</summary>

Work in progress.

</details>

</details>

---

<details>
  <summary>Hooks</summary>

The Scripting API consists of three lifecycle hooks.

<details>
  <summary>onInput</summary>

Work in progress.

</details>

---

<details>
  <summary>onModelContext</summary>

Work in progress.

</details>

---

<details>
  <summary>onOutput</summary>

Work in progress.

</details>

---

<details>
  <summary>sharedLibrary</summary>

Work in progress.

</details>

</details>

---

<details>
  <summary>Params</summary>

Scripting API hooks have access to the following information. When referencing one of these params in a script, you can reference the name of the parameter directly—you do not need to deconstruct it from an object.

<details>
  <summary>info</summary>

Work in progress.

</details>

---

<details>
  <summary>history</summary>

Work in progress.

</details>

---

<details>
  <summary>state</summary>

Work in progress.

</details>

---

<details>
  <summary>storyCards</summary>

Work in progress.

</details>

---

<details>
  <summary>text</summary>

Work in progress.

</details>

</details>

---

<details>
  <summary>Return</summary>

Scripting API hooks can return the following values.

<details>
  <summary>text</summary>

Work in progress.

</details>

---

<details>
  <summary>stop</summary>

Work in progress.

</details>

</details>

---

## Scenario Scripts

Example scripts and scripts you can add to your scenarios.

<details>
  <summary>Prevent the AI from generating a starting message</summary>

Script section: `Scripts > Output`

```js
// Example: message = '[Find a sword.]'
let startMessage = ''

const modifier = (text) => {
  return { text: info.actionCount ? text : ` ${typeof startMessage === 'string' ? startMessage : ''}` }
}

modifier(text)
```

</details>

---
