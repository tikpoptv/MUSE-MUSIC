export class LocalStorageManager {
  static isSupported(): boolean {
    return (typeof window !== 'undefined') && !!window.localStorage;
  }

  static set<T>(key: string, value: T) {
    if (!this.isSupported()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // silent fail or log
    }
  }

  static get<T>(key: string): T | null {
    if (!this.isSupported()) return null;
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null') return null;
      return JSON.parse(item) as T;
    } catch {
      this.remove(key);
      return null;
    }
  }

  static remove(key: string) {
    if (!this.isSupported()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // silent fail or log
    }
  }

  static clear() {
    if (!this.isSupported()) return;
    try {
      localStorage.clear();
    } catch {
      // silent fail or log
    }
  }
}
