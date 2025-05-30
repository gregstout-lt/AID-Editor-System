# aidungeon.js

Edit AI Dungeon scenarios in your favorite editor and upload changes.

## **Features**

- Build + minimize scenario scripts to local disk, default folder `./dist`.
- Update *multiple* scenarios.
- Supports common AI Dungeon GraphQL queries.
- Supports custom GraphQL queries.

## Pre-requirements

- [Node.js](https://nodejs.org/) + basic understanding of Node.JS and `package.json` workspaces
- Access to your [Firebase token](#getting-your-firebase-token)

## **Install**

**npm:**

```bash
npm install aidungeon.js
```

**pnpm:**

```bash
pnpm add aidungeon.js
```

### Getting Your Firebase Token

> Tokens will expire after `x` amount of time

**DevTools (recommended):**

- Open your web browsers DevTools, `Ctrl` + `Shift` + `I`
- Navigate to the `console` tab
- Copy n paste the code below into the console and hit `Enter`
- The console will print: `AID_TOKEN="Your Token"`
- Repeat steps to refresh your token

```js filename="tests/browser.js"
(async () => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB !== 'undefined') {
      const dbReq = indexedDB.open('firebaseLocalStorageDb');
      dbReq.onerror = reject;
      dbReq.onsuccess = (event) => {
        const transaction = event.target.result.transaction(['firebaseLocalStorage'], 'readwrite');
        const objectStore = transaction.objectStore('firebaseLocalStorage');
        const allKeys = objectStore.getAllKeys();
        allKeys.onerror = reject;
        allKeys.onsuccess = (evt) => {
          const key = evt.target.result.find((r) => r.includes('firebase:authUser:'));
          objectStore.get(key).onsuccess = (evt) => {
            const { value } = evt.target.result;
            resolve(`AID_TOKEN="${value.stsTokenManager.accessToken}"`);
          };
        };
      };
    } else {
      reject(new Error('indexedDB is not defined.'));
    }
  });
})()
  .then(console.log)
  .catch(console.error);
```

**Bookmarklet (not recommended):**

- Save this URL as a bookmark, clicking it will cause the file to inject itself into the current webpage.
  - Does not work on all browsers
- Open your web browsers DevTools, `Ctrl` + `Shift` + `I`
- Navigate to the `console` tab
- The console will print: `AID_TOKEN="Your Token"`
- Repeat steps to refresh your token

```js filename="tests/browser.js"
javascript:(function(){['https://cdn.jsdelivr.net/gh/magicoflolis/aidungeon.js@master/tests/browser.js'].map(s=>document.body.appendChild(document.createElement('script')).src=s)})();
```

### Example Setup

> See [upload.js](https://github.com/magicoflolis/aidungeon.js/tree/main/tests/upload)

### TODO

- Add better examples
- Support custom queries
