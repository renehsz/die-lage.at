import { openDB, IDBPDatabase } from 'idb';

class SettingsStore {
    private db: Promise<IDBPDatabase>;

    constructor(name: string) {
        const version = 1;
        this.db = openDB(name, version, {
            upgrade(db) {
                db.createObjectStore('settings');
            },
        });
    }

    async get(key: string): Promise<string | undefined> {
        const db = await this.db;
        return db.get('settings', key);
    }

    async set(key: string, value: string): Promise<IDBValidKey> {
        const db = await this.db;
        return db.put('settings', value, key);
    }
}

export let store: SettingsStore;

export function initSettingsStore() {
    store = new SettingsStore('lage');
}

