/**
 * Chrome Storage Mock Utilities
 *
 * Advanced mocking utilities for chrome.storage.local API with
 * quota simulation, error scenarios, and storage events.
 */

import { vi } from 'vitest';

interface StorageMockOptions {
  initialData?: Record<string, any>;
  quotaBytes?: number;
  simulateQuotaExceeded?: boolean;
  simulateErrors?: boolean;
}

/**
 * Creates an enhanced chrome.storage.local mock with advanced features
 *
 * @param options - Configuration options for the mock
 * @returns Mock storage object with additional test helpers
 *
 * @example
 * const storage = mockChromeStorage({
 *   initialData: { cards: {} },
 *   quotaBytes: 1024 * 1024, // 1MB
 * });
 *
 * await storage.set({ 'cards': { 'card-1': {...} } });
 * const data = await storage.get('cards');
 *
 * // Access internal storage for assertions
 * expect(storage._getInternalStorage()).toEqual({ cards: { 'card-1': {...} } });
 */
export function mockChromeStorage(options: StorageMockOptions = {}) {
  const {
    initialData = {},
    quotaBytes = 10485760, // 10MB default
    simulateQuotaExceeded = false,
    simulateErrors = false,
  } = options;

  // Internal storage
  const storage: Record<string, any> = { ...initialData };

  // Storage change listeners
  const changeListeners: Array<(changes: any, areaName: string) => void> = [];

  /**
   * Calculate storage size in bytes
   */
  function calculateStorageSize(data: Record<string, any>): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Check if adding data would exceed quota
   */
  function wouldExceedQuota(newData: Record<string, any>): boolean {
    const currentSize = calculateStorageSize(storage);
    const additionalSize = calculateStorageSize(newData);
    return currentSize + additionalSize > quotaBytes;
  }

  /**
   * Trigger storage change listeners
   */
  function triggerChangeListeners(changes: Record<string, { oldValue?: any; newValue?: any }>) {
    changeListeners.forEach(listener => {
      listener(changes, 'local');
    });
  }

  /**
   * Mock chrome.storage.local.get
   */
  const get = vi.fn((keys: string | string[] | null, callback?: (items: any) => void) => {
    if (simulateErrors) {
      const error = new Error('Storage error');
      if (callback) callback({});
      return Promise.reject(error);
    }

    const promise = new Promise<any>((resolve) => {
      let result: Record<string, any>;

      if (keys === null) {
        result = { ...storage };
      } else if (typeof keys === 'string') {
        result = { [keys]: storage[keys] };
      } else if (Array.isArray(keys)) {
        result = {};
        keys.forEach(key => {
          result[key] = storage[key];
        });
      } else if (typeof keys === 'object' && keys !== null) {
        // keys is an object with default values
        const defaultValues = keys as Record<string, any>;
        result = { ...defaultValues };
        Object.keys(defaultValues).forEach(key => {
          if (storage[key] !== undefined) {
            result[key] = storage[key];
          }
        });
      } else {
        result = {};
      }

      resolve(result);
    });

    if (callback) {
      promise.then(callback);
    }

    return promise;
  });

  /**
   * Mock chrome.storage.local.set
   */
  const set = vi.fn((items: Record<string, any>, callback?: () => void) => {
    if (simulateErrors) {
      const error = new Error('Storage error');
      if (callback) callback();
      return Promise.reject(error);
    }

    if (simulateQuotaExceeded || wouldExceedQuota(items)) {
      const error = new Error('QUOTA_BYTES quota exceeded');
      if (callback) callback();
      return Promise.reject(error);
    }

    const promise = new Promise<void>((resolve) => {
      const changes: Record<string, { oldValue?: any; newValue?: any }> = {};

      Object.entries(items).forEach(([key, value]) => {
        changes[key] = {
          oldValue: storage[key],
          newValue: value,
        };
        storage[key] = value;
      });

      triggerChangeListeners(changes);
      resolve();
    });

    if (callback) {
      promise.then(callback);
    }

    return promise;
  });

  /**
   * Mock chrome.storage.local.remove
   */
  const remove = vi.fn((keys: string | string[], callback?: () => void) => {
    if (simulateErrors) {
      const error = new Error('Storage error');
      if (callback) callback();
      return Promise.reject(error);
    }

    const promise = new Promise<void>((resolve) => {
      const changes: Record<string, { oldValue?: any; newValue?: any }> = {};
      const keysArray = typeof keys === 'string' ? [keys] : keys;

      keysArray.forEach(key => {
        if (storage[key] !== undefined) {
          changes[key] = {
            oldValue: storage[key],
            newValue: undefined,
          };
          delete storage[key];
        }
      });

      triggerChangeListeners(changes);
      resolve();
    });

    if (callback) {
      promise.then(callback);
    }

    return promise;
  });

  /**
   * Mock chrome.storage.local.clear
   */
  const clear = vi.fn((callback?: () => void) => {
    if (simulateErrors) {
      const error = new Error('Storage error');
      if (callback) callback();
      return Promise.reject(error);
    }

    const promise = new Promise<void>((resolve) => {
      const changes: Record<string, { oldValue?: any; newValue?: any }> = {};

      Object.keys(storage).forEach(key => {
        changes[key] = {
          oldValue: storage[key],
          newValue: undefined,
        };
        delete storage[key];
      });

      triggerChangeListeners(changes);
      resolve();
    });

    if (callback) {
      promise.then(callback);
    }

    return promise;
  });

  /**
   * Mock chrome.storage.local.getBytesInUse
   */
  const getBytesInUse = vi.fn((keys: string | string[] | null, callback: (bytes: number) => void) => {
    const promise = new Promise<number>((resolve) => {
      let data: Record<string, any>;

      if (keys === null) {
        data = storage;
      } else if (typeof keys === 'string') {
        data = { [keys]: storage[keys] };
      } else {
        data = {};
        keys.forEach(key => {
          data[key] = storage[key];
        });
      }

      const bytes = calculateStorageSize(data);
      resolve(bytes);
    });

    promise.then(callback);
    return promise;
  });

  /**
   * Mock chrome.storage.onChanged.addListener
   */
  const onChanged = {
    addListener: vi.fn((callback: (changes: any, areaName: string) => void) => {
      changeListeners.push(callback);
    }),
    removeListener: vi.fn((callback: (changes: any, areaName: string) => void) => {
      const index = changeListeners.indexOf(callback);
      if (index > -1) {
        changeListeners.splice(index, 1);
      }
    }),
    hasListener: vi.fn((callback: (changes: any, areaName: string) => void) => {
      return changeListeners.includes(callback);
    }),
  };

  return {
    get,
    set,
    remove,
    clear,
    getBytesInUse,
    QUOTA_BYTES: quotaBytes,
    onChanged,

    // Test helpers (not part of actual API)
    _getInternalStorage: () => ({ ...storage }),
    _setInternalStorage: (data: Record<string, any>) => {
      Object.keys(storage).forEach(key => delete storage[key]);
      Object.assign(storage, data);
    },
    _getStorageSize: () => calculateStorageSize(storage),
    _triggerChange: (changes: Record<string, { oldValue?: any; newValue?: any }>) => {
      triggerChangeListeners(changes);
    },
    _reset: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
      Object.assign(storage, initialData);
      changeListeners.length = 0;
      vi.clearAllMocks();
    },
  };
}

/**
 * Creates a mock that simulates quota exceeded errors
 */
export function mockChromeStorageWithQuotaExceeded() {
  return mockChromeStorage({
    simulateQuotaExceeded: true,
  });
}

/**
 * Creates a mock that simulates general storage errors
 */
export function mockChromeStorageWithErrors() {
  return mockChromeStorage({
    simulateErrors: true,
  });
}

/**
 * Replace global chrome.storage.local with mock
 */
export function installChromeStorageMock(options?: StorageMockOptions) {
  const mock = mockChromeStorage(options);

  if (!(global as any).chrome) {
    (global as any).chrome = {};
  }

  if (!(global as any).chrome.storage) {
    (global as any).chrome.storage = {};
  }

  (global as any).chrome.storage.local = mock;

  return mock;
}