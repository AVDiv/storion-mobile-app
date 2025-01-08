import { Preferences } from "@capacitor/preferences";
import { DEFAULT_STORAGE_VALUES, StorageKey } from "./config";

class StorageService {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    await this.initializeDefaultValues();
    this.initialized = true;
  }

  private async initializeDefaultValues() {
    for (const [key, defaultValue] of Object.entries(DEFAULT_STORAGE_VALUES)) {
      const { value } = await Preferences.get({ key });
      if (!value) {
        await Preferences.set({ key, value: JSON.stringify(defaultValue) });
      }
    }
  }

  async get<T>(key: StorageKey): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value === null) return null;
    return JSON.parse(value) as T;
  }

  async set(key: StorageKey, value: any): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) });
  }

  async remove(key: StorageKey): Promise<void> {
    await Preferences.remove({ key });
  }
}

export const storageService = new StorageService();
