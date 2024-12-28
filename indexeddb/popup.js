document.getElementById('load-databases').addEventListener('click', async () => {
  const databaseList = document.getElementById('database-list');
  databaseList.innerHTML = '';

  // List available databases
  const dbNames = await indexedDB.databases();
  dbNames.forEach(dbInfo => {
    const dbButton = document.createElement('button');
    dbButton.textContent = dbInfo.name;
    dbButton.onclick = () => loadFiles(dbInfo.name);
    databaseList.appendChild(dbButton);
  });
});

async function loadFiles(dbName) {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = `<h3>Files in ${dbName}</h3>`;
  
  const request = indexedDB.open(dbName);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(db.objectStoreNames, 'readonly');
    db.objectStoreNames.forEach(storeName => {
      const store = transaction.objectStore(storeName);
      store.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
          const item = cursor.value;
          const fileButton = document.createElement('button');
          fileButton.textContent = item.name || `File ${cursor.key}`;
          fileButton.onclick = () => downloadFile(item, cursor.key);
          fileList.appendChild(fileButton);
          cursor.continue();
        }
      };
    });
  };

  request.onerror = function () {
    fileList.textContent = `Failed to load files from ${dbName}`;
  };
}

function downloadFile(fileData, key) {
  const blob = new Blob([fileData.content], { type: fileData.type || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileData.name || `file_${key}`;
  anchor.click();

  URL.revokeObjectURL(url);
}
