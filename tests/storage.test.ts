import storage from '../src/storage/storage';

describe('Storage', () => {
    beforeEach(async () => {
        await storage.clear();
    });

    it('should set and get a value', async () => {
        await storage.set({ key: 'value' });
        const result = await storage.get('key');
        expect(result).toEqual({key:'value'});
    });

    it('should set and get a nested value', async () => {
        await storage.set({ key1: { key2: 'value' } });
        const result = await storage.get('key1');
        expect(result).toEqual({ key1: { key2: 'value' } });
    });

    it('should set and get a number value', async () => {
        await storage.set({ key: 123 });
        const result = await storage.get('key');
        expect(result).toEqual({ key: 123 });
    });

    it('should set and get a boolean value', async () => {
        await storage.set({ key: true });
        const result = await storage.get('key');
        expect(result).toEqual({ key: true });
    });

    it('should set and get an array value', async () => {
        await storage.set({ key: [1, 2, 3] });
        const result = await storage.get('key');
        expect(result).toEqual({ key: [1, 2, 3] });
    });

    it('should set and get a null value', async () => {
        await storage.set({ key: null });
        const result = await storage.get('key');
        expect(result).toEqual({ key: null });
    });

    it("should allow set without removing other keys", async () => {
        await storage.set({ key1: 'value1' });
        await storage.set({ key2: 'value2' });
        const result = await storage.get(null);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it("should replace the whole object when setting", async () => {
        await storage.set({ key1: {key2:'value2', key3: 'value3'}});
        const result1 = await storage.get(null);
        expect(result1).toEqual({ key1: {key2:'value2', key3: 'value3'}});

        await storage.set({ key1: {key2:'value2'}});
        const result2 = await storage.get(null);
        expect(result2).toEqual({ key1: {key2:'value2'}});
    });

    it('should remove a value', async () => {
        await storage.set({ key: 'value' });
        await storage.remove('key');
        const result = await storage.get('key');
        expect(result).toEqual({});
    });

    it('should clear all values', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        await storage.clear();
        const result1 = await storage.get('key1');
        const result2 = await storage.get('key2');
        expect(result1).toEqual({});
        expect(result2).toEqual({});
    });

    it('should get multiple values', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        const result = await storage.get(['key1', 'key2']);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should get empty object when keys is an empty string', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        const result = await storage.get('');
        expect(result).toEqual({});
    });

    it('should get empty object when keys is an empty array', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        const result = await storage.get([]);
        expect(result).toEqual({});
    });

    it('should get empty object when keys is an empty object', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        const result = await storage.get({});
        expect(result).toEqual({});
    });

    it('should get all values when keys is null', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        const result = await storage.get(null);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should get all values when keys is undefined', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        const result = await storage.get(undefined);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should get all values when keys is not provided', async () => {
        await storage.set({ key1: 'value1', key2: 'value2' });
        const result = await storage.get();
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should get values with default values', async () => {
        await storage.set({ key1: 'value1' });
        const result = await storage.get({ key1: 'default1', key2: 'default2' });
        expect(result).toEqual({ key1: 'value1', key2: 'default2' });
    });
});
