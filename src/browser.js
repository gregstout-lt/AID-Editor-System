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
