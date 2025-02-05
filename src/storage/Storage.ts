/**
 * Interface representing a storage mechanism.
 */
interface Storage {
    get(keys?: null | string | object | string[]): Promise<unknown>;
    set(keys: object): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}

class ChromeStorage implements Storage {
    async get(keys?: null | string | object | string[]): Promise<unknown> {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys ?? null, resolve);
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

    // A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
    async get(keys?: null | string | object | string[]): Promise<unknown> {
        if (keys === null || keys === undefined) {
            return this.storage;
        } else if (typeof keys === 'string' && keys === '') {
            return {};
        } else if (typeof keys === 'string') {
            return { [keys]: this.storage[keys] };
        } else if (Array.isArray(keys)) {
            return (keys as string[]).reduce((acc: Record<string, unknown>, key: string) => {
                acc[key] = this.storage[key];
                return acc;
            }, {} as Record<string, unknown>);
        } else {
            return Object.entries(keys).reduce((acc: Record<string, unknown>, [key, defaultValue]) => {
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
