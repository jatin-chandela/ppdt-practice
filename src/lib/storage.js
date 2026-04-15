const DB = 'ppdt';
const STORE = 'attempts';
const VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' });
        os.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const result = fn(store);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export async function addAttempt({ sceneId, sceneUrl, blob, note = '' }) {
  const id = crypto.randomUUID?.() || String(Date.now());
  const record = {
    id,
    sceneId,
    sceneUrl,
    blob,
    note,
    createdAt: new Date().toISOString(),
  };
  await tx('readwrite', (store) => store.add(record));
  return record;
}

export async function listAttempts() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readonly');
    const req = t.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = req.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAttempt(id) {
  await tx('readwrite', (store) => store.delete(id));
}
