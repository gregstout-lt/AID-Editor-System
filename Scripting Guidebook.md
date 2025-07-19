# Magic's Scripting Guidebook

A collection of tips & tricks + improvements for AI Dungeons code editor, Monaco.

*Monaco is the code editor that powers VS Code. <https://microsoft.github.io/monaco-editor/>*

**Throughout the guidebook, I refer to this code editor as `VSCode`.**

`AI Dungeons code editor = Monaco = VSCode`

## **External Links**

**General:**

- ⭐[AI Dungeon Guidebook](https://help.aidungeon.com)
  - ⭐[Creating Scripts for AI Dungeon](https://help.aidungeon.com/scripting)
  - ⭐[What are Scripts and how do you Install them?](https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them)

**Editor:**

- General:
  - [Code Navigation | VSCode](https://code.visualstudio.com/docs/editing/editingevolved)
  - [Working with JavaScript | VSCode](https://code.visualstudio.com/docs/nodejs/working-with-javascript)

**JavaScript:**

- General:
  - ⭐[JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  - ⭐[Favorite single line of code | 1loc](https://github.com/phuocng/1loc) / [Wayback Machine](https://web.archive.org/web/20250419154835/https://phuoc.ng/collection/1-loc/)
  - ⭐[Airbnb JavaScript Style Guide | GitHub](https://github.com/airbnb/javascript)
  - [You Don't Know JS Yet (book series) - 2nd Edition | GitHub](https://github.com/getify/You-Dont-Know-JS)
  - [The Modern JavaScript Tutorial | javascript.info](https://javascript.info/)
- Videos:
  - ⭐[JS Destructuring in 100 Seconds | YouTube](https://youtu.be/UgEaJBz3bjY)
  - ⭐[JavaScript Visualized - Event Loop, Web APIs, (Micro)task Queue | YouTube](https://youtu.be/eiC58R16hb8)

**TypeScript:**

- General:
  - ⭐[@use JSDoc | JSDoc](https://jsdoc.app/)
  - ⭐[JS Projects Utilizing TypeScript | TypeScript](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html)
  - ⭐[Type Checking JavaScript Files | TypeScript](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
  - [TypeScript Handbook | TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## Types for Scripting API

By default, AID types are not present in VSCode.

To fix this, copy n paste everything within "ScriptingTypes.js" and add it to the top of your `Library`, `Input`, `Context`, `Output` scripts.

- [ScriptingTypes.js](https://github.com/magicoflolis/aidungeon.js/blob/main/tests/ScriptingTypes.js)

*Example(s):*

```js
// #region Type Definitions

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

---

## Fix References

> Not needed when [Types for Scripting API](#types-for-scripting-api) is already setup!

- [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)

By default, VSCode loads many libraries that are not present in AID Scripting such as DOM types (`window`, `setTimout`, etc.)

To stop this from occurring, add these to the top of your `Library`, `Input`, `Context`, `Output` scripts.

```ts
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
```

*Example(s):*

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

```js
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>

// Checkout the Guidebook examples to get an idea of other ways you can use scripting
// https://help.aidungeon.com/scripting

// Every script needs a modifier function
const modifier = (text) => {
  return { text }
}

// Don't modify this part
modifier(text)
```

---

## The Console

```js
// Output: "null"
log(state.foo);

// Output: "foo: undefined"
log(`foo: ${state.foo}`);

// Output: "is null: false"
log(`is null: ${Object.is(state.foo, null)}`);

// Output: "is undefined: true"
log(`is undefined: ${Object.is(state.foo, undefined)}`);
```

---
