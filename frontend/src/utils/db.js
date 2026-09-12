const DB_NAME = "OfflineUPIDatabase";
const STORE_NAME = "transactions";

// Open or create the database
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "transactionId" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// Save a new transaction while offline
export const saveOfflineTransaction = async (transaction) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        store.add(transaction);

        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
    });
};

// Get all offline transactions
export const getPendingTransactions = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

// Delete a transaction after it successfully syncs
export const deleteTransaction = async (transactionId) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(transactionId);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
};