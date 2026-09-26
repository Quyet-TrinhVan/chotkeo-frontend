/**
 * Storage Abstraction
 * Supports expo-secure-store interface with web/memory fallback
 */

const memoryStore: Record<string, string> = {};

export const secureStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(`chotkeo_${key}`);
      }
      return memoryStore[key] || null;
    } catch {
      return memoryStore[key] || null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`chotkeo_${key}`, value);
      }
      memoryStore[key] = value;
    } catch {
      memoryStore[key] = value;
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(`chotkeo_${key}`);
      }
      delete memoryStore[key];
    } catch {
      delete memoryStore[key];
    }
  },
};
