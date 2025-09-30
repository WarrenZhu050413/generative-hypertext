import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import 'fake-indexeddb/auto';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// ============================================================================
// Chrome API Mocks
// ============================================================================

/**
 * Mock chrome.storage.local API
 */
const createStorageMock = () => {
  const storage: Record<string, any> = {};

  return {
    get: vi.fn((keys: string | string[] | null, callback?: (items: any) => void) => {
      const promise = Promise.resolve(() => {
        if (keys === null) {
          return storage;
        }
        if (typeof keys === 'string') {
          return { [keys]: storage[keys] };
        }
        const result: Record<string, any> = {};
        keys.forEach((key) => {
          result[key] = storage[key];
        });
        return result;
      });

      if (callback) {
        promise.then((fn) => callback(fn()));
      }

      return promise.then((fn) => fn());
    }),

    set: vi.fn((items: Record<string, any>, callback?: () => void) => {
      Object.assign(storage, items);
      if (callback) callback();
      return Promise.resolve();
    }),

    remove: vi.fn((keys: string | string[], callback?: () => void) => {
      if (typeof keys === 'string') {
        delete storage[keys];
      } else {
        keys.forEach((key) => delete storage[key]);
      }
      if (callback) callback();
      return Promise.resolve();
    }),

    clear: vi.fn((callback?: () => void) => {
      Object.keys(storage).forEach((key) => delete storage[key]);
      if (callback) callback();
      return Promise.resolve();
    }),

    getBytesInUse: vi.fn((keys: string | string[] | null, callback: (bytes: number) => void) => {
      const data = keys === null ? storage :
                   typeof keys === 'string' ? { [keys]: storage[keys] } :
                   keys.reduce((acc, key) => ({ ...acc, [key]: storage[key] }), {});
      const bytes = new Blob([JSON.stringify(data)]).size;
      callback(bytes);
      return Promise.resolve(bytes);
    }),

    QUOTA_BYTES: 10485760, // 10MB
  };
};

/**
 * Mock chrome.runtime API
 */
const createRuntimeMock = () => {
  const listeners: Record<string, Function[]> = {};

  return {
    id: 'test-extension-id',

    sendMessage: vi.fn((message: any, callback?: (response: any) => void) => {
      if (callback) {
        // Simulate async response
        setTimeout(() => callback({ success: true }), 0);
      }
      return Promise.resolve({ success: true });
    }),

    onMessage: {
      addListener: vi.fn((callback: Function) => {
        if (!listeners.message) listeners.message = [];
        listeners.message.push(callback);
      }),
      removeListener: vi.fn((callback: Function) => {
        if (listeners.message) {
          listeners.message = listeners.message.filter(cb => cb !== callback);
        }
      }),
      hasListener: vi.fn((callback: Function) => {
        return listeners.message?.includes(callback) ?? false;
      }),
      // Helper to simulate message
      _trigger: (message: any, sender: any, sendResponse: Function) => {
        listeners.message?.forEach(cb => cb(message, sender, sendResponse));
      },
    },

    getURL: vi.fn((path: string) => `chrome-extension://test-extension-id/${path}`),

    getManifest: vi.fn(() => ({
      manifest_version: 3,
      name: 'Nabokov Web Clipper',
      version: '1.0.0',
    })),
  };
};

/**
 * Mock chrome.tabs API
 */
const createTabsMock = () => ({
  query: vi.fn((queryInfo: any, callback?: (tabs: any[]) => void) => {
    const result = [{ id: 1, url: 'https://example.com', title: 'Example' }];
    if (callback) callback(result);
    return Promise.resolve(result);
  }),

  sendMessage: vi.fn((tabId: number, message: any, callback?: (response: any) => void) => {
    const response = { success: true };
    if (callback) callback(response);
    return Promise.resolve(response);
  }),

  getCurrent: vi.fn((callback?: (tab: any) => void) => {
    const tab = { id: 1, url: 'https://example.com', title: 'Example' };
    if (callback) callback(tab);
    return Promise.resolve(tab);
  }),
});

/**
 * Global chrome object mock
 */
(global as any).chrome = {
  storage: {
    local: createStorageMock(),
    sync: createStorageMock(),
  },
  runtime: createRuntimeMock(),
  tabs: createTabsMock(),
};

// ============================================================================
// DOM API Enhancements
// ============================================================================

/**
 * Mock html2canvas for screenshot testing
 */
vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
      width: 100,
      height: 100,
    })
  ),
}));

/**
 * Mock canvas for screenshot testing
 * This provides a minimal canvas implementation for tests
 */
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(function(contextType: string) {
    if (contextType === '2d') {
      return {
        fillStyle: '',
        strokeStyle: '',
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        canvas: {} as HTMLCanvasElement,
      } as any;
    }
    return null;
  }) as any;

  HTMLCanvasElement.prototype.toDataURL = vi.fn(function(type?: string, quality?: number) {
    // Return data URL with the correct MIME type based on the format parameter
    const format = type || 'image/png';
    if (format === 'image/jpeg') {
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8A';
    }
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }) as any;
}

/**
 * Mock DOMPurify for sanitization testing
 * Import the actual DOMPurify implementation instead of mocking it
 */

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Wait for a condition to be true
 */
export const waitFor = (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
};

/**
 * Reset all chrome API mocks
 */
export const resetChromeMocks = () => {
  vi.clearAllMocks();

  // Check if chrome storage exists before trying to clear
  if (!(global as any).chrome?.storage) {
    return;
  }

  // Clear storage by resetting the internal storage objects
  const localStorage = (global as any).chrome.storage.local;
  const syncStorage = (global as any).chrome.storage.sync;

  // Call clear and handle both callback and promise styles
  if (localStorage && typeof localStorage.clear === 'function') {
    localStorage.clear();
  }
  if (syncStorage && typeof syncStorage.clear === 'function') {
    syncStorage.clear();
  }
};

/**
 * Mock ResizeObserver for React Flow
 */
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// ============================================================================
// Test Lifecycle Hooks
// ============================================================================

// Reset before each test
beforeEach(() => {
  resetChromeMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});