import { createMMKV } from 'react-native-mmkv';

/**
 * Global high-performance synchronous storage instance.
 * Replaces AsyncStorage for blazing fast, thread-safe caching.
 */
export const storage = createMMKV({
  id: 'suzuzy-staff-storage',
  // encryptionKey: 'hunter2' // Optional: add encryption if sensitive data is stored here
});

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
