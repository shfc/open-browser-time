/**
 * Interface representing a storage mechanism.
 */
interface Storage {
    get(keys: null | string | object | string[]): Promise<unknown>;
    set(keys: object): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}

class ChromeStorage implements Storage {
    async get(keys: null | string | object | string[]): Promise<unknown> {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    }

    async set(keys: object): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set(keys, resolve);
        });
    }

    async remove(key: string): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.remove([key], resolve);
        });
    }

    async clear(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.clear(resolve);
        });
    }
}

class MemoryStorage implements Storage {
    private storage: Record<string, unknown> = {};

    async get(keys: null | string | object | string[]): Promise<unknown> {
        if (keys === null) {
            return this.storage;
        } else if (typeof keys === 'string') {
            return this.storage[keys];
        } else if (Array.isArray(keys)) {
            return keys.reduce((acc, key) => {
                acc[key] = this.storage[key];
                return acc;
            }, {} as Record<string, unknown>);
        } else {
            return Object.entries(keys).reduce((acc, [key, defaultValue]) => {
                acc[key] = this.storage[key] ?? defaultValue;
                return acc;
            }, {} as Record<string, unknown>);
        }
    }

    async set(keys: object): Promise<void> {
        Object.assign(this.storage, keys);
    }

    async remove(key: string): Promise<void> {
        delete this.storage[key];
    }

    async clear(): Promise<void> {
        this.storage = {};
    }
}

let storageInstance: Storage | null = null;

function createStorage(): Storage {
    if (!storageInstance) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            console.info("Using Chrome storage");
            storageInstance = new ChromeStorage();
        } else {
            console.info("Using memory storage");
            storageInstance = new MemoryStorage();
        }
    }
    return storageInstance;
}

const storage = createStorage();
export default storage;
