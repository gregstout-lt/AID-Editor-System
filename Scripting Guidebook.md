# Magic's Scripting Guidebook

A collection of tips & tricks + improvements for AI Dungeons code editor, Monaco.

*Monaco is the code editor that powers VS Code. <https://microsoft.github.io/monaco-editor/>*

**Throughout the guidebook, I refer to this code editor as `VSCode`.**

||AI Dungeons code editor = Monaco = VSCode||

---

## **External Links**

Useful and *highly* recommended links to browse through.

**Editor:**

- VSCode features: <https://code.visualstudio.com/docs/editing/editingevolved>
- Working with JavaScript: <https://code.visualstudio.com/docs/nodejs/working-with-javascript>

**JavaScript:**

- MDN: <https://developer.mozilla.org/en-US/docs/Web/JavaScript>
- JavaScript info: <https://javascript.info/>
- JavaScript utilities: <https://phuoc.ng/collection/1-loc/>

**TypeScript:**

- TypeScript Handbook: <https://www.typescriptlang.org/docs/handbook/intro.html>
- JSDoc: <https://jsdoc.app/>
- Utilizing TypeScript in JS: <https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html>
- Type Checking JavaScript Files: <https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html>

---

## Types for Scripting API

By default, AID types are not present in VSCode.

To fix this, copy n paste everything within "ScriptingTypes.js" and add it to the top of your `Library`, `Input`, `Context`, `Output` scripts.

- ScriptingTypes\.js: <https://github.com/magicoflolis/aidungeon.js/blob/main/tests/ScriptingTypes.js>

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

- Triple\-Slash Directives: <https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html>

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
