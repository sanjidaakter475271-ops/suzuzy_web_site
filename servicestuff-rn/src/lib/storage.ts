/**
 * Global high-performance synchronous storage instance.
 * Replaces AsyncStorage for blazing fast, thread-safe caching.
 */
let mmkvStorage: any;

try {
  // Use lazy require to prevent top-level import crash in Expo Go
  const { createMMKV } = require('react-native-mmkv');
  mmkvStorage = createMMKV({
    id: 'suzuzy-staff-storage',
  });
} catch (e) {
  console.warn('[STORAGE] MMKV could not be initialized. Falling back to in-memory mock. (This happens in Expo Go without a development build)');
  const mockStorage = new Map();
  mmkvStorage = {
    set: (key: string, value: any) => mockStorage.set(key, value),
    getString: (key: string) => mockStorage.get(key),
    getNumber: (key: string) => mockStorage.get(key),
    getBoolean: (key: string) => mockStorage.get(key),
    contains: (key: string) => mockStorage.has(key),
    remove: (key: string) => mockStorage.delete(key),
    clearAll: () => mockStorage.clear(),
    getAllKeys: () => Array.from(mockStorage.keys()),
  };
}

export const storage = mmkvStorage;

/**
 * Helper to get JSON data from storage
 */
export const getStorageJSON = <T>(key: string): T | null => {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`[STORAGE] Error parsing JSON for key: ${key}`, e);
    return null;
  }
};

/**
 * Helper to set JSON data in storage
 */
export const setStorageJSON = (key: string, value: any): void => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[STORAGE] Error stringifying JSON for key: ${key}`, e);
  }
};
