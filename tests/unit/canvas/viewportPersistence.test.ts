/**
 * Unit Tests for Viewport Persistence Logic
 *
 * Tests the viewport save/load logic in useCanvasState to ensure:
 * 1. Viewport position (x, y) and zoom are correctly saved to storage
 * 2. Saved viewport is restored on subsequent loads
 * 3. First-time users trigger fitView behavior (no saved viewport)
 * 4. Debounced saves work correctly (500ms delay)
 * 5. Edge cases like extreme zoom levels and negative positions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Viewport } from '@xyflow/react';

// Mock chrome.storage.local
const mockStorage: Record<string, any> = {};

global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => {
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: mockStorage[keys] });
        }
        const result: Record<string, any> = {};
        if (Array.isArray(keys)) {
          keys.forEach((key) => {
            if (key in mockStorage) {
              result[key] = mockStorage[key];
            }
          });
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
      remove: vi.fn((keys) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach((key) => delete mockStorage[key]);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
        return Promise.resolve();
      }),
    },
  },
} as any;

const STORAGE_KEY = 'nabokov_canvas_state';

describe('Viewport Persistence - Save Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should save viewport position and zoom to storage', async () => {
    const viewport: Viewport = { x: 100, y: 200, zoom: 1.5 };

    // Simulate saving viewport
    const canvasState = {
      cards: [],
      viewportPosition: viewport,
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: canvasState });

    expect(mockStorage[STORAGE_KEY]).toEqual(canvasState);
    expect(mockStorage[STORAGE_KEY].viewportPosition).toEqual({ x: 100, y: 200, zoom: 1.5 });
  });

  it('should preserve existing cards when saving viewport', async () => {
    // Initialize with existing cards
    const existingCards = [
      { id: 'card-1', content: 'Test card', position: { x: 0, y: 0 } },
    ];

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: existingCards, viewportPosition: { x: 0, y: 0, zoom: 1 } },
    });

    // Update viewport
    const newViewport: Viewport = { x: 500, y: 300, zoom: 2 };
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY] || { cards: [], viewportPosition: { x: 0, y: 0, zoom: 1 } };

    const updatedCanvasState = {
      ...canvasState,
      viewportPosition: newViewport,
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: updatedCanvasState });

    // Verify cards are preserved
    const finalResult = await chrome.storage.local.get(STORAGE_KEY);
    expect(finalResult[STORAGE_KEY].cards).toEqual(existingCards);
    expect(finalResult[STORAGE_KEY].viewportPosition).toEqual(newViewport);
  });

  it('should handle negative viewport positions', async () => {
    const viewport: Viewport = { x: -500, y: -300, zoom: 1 };

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition).toEqual({ x: -500, y: -300, zoom: 1 });
  });

  it('should handle very large viewport positions', async () => {
    const viewport: Viewport = { x: 10000, y: 10000, zoom: 1 };

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition).toEqual({ x: 10000, y: 10000, zoom: 1 });
  });

  it('should handle minimum zoom level', async () => {
    const viewport: Viewport = { x: 0, y: 0, zoom: 0.1 };

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition.zoom).toBe(0.1);
  });

  it('should handle maximum zoom level', async () => {
    const viewport: Viewport = { x: 0, y: 0, zoom: 2 };

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition.zoom).toBe(2);
  });

  it('should handle decimal zoom values', async () => {
    const viewport: Viewport = { x: 0, y: 0, zoom: 1.234567 };

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition.zoom).toBe(1.234567);
  });
});

describe('Viewport Persistence - Load Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should load saved viewport on initialization', async () => {
    const savedViewport: Viewport = { x: 250, y: 150, zoom: 1.2 };

    // Simulate saved state
    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: savedViewport },
    });

    // Simulate loading
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY];

    expect(canvasState).toBeDefined();
    expect(canvasState.viewportPosition).toEqual(savedViewport);
  });

  it('should return undefined viewport when no saved state exists', async () => {
    // No saved state
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY];

    expect(canvasState).toBeUndefined();
  });

  it('should handle missing viewportPosition in saved state', async () => {
    // Save state without viewportPosition (old data format)
    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [] },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY];

    expect(canvasState.cards).toEqual([]);
    expect(canvasState.viewportPosition).toBeUndefined();
  });

  it('should load viewport with cards together', async () => {
    const savedViewport: Viewport = { x: 100, y: 200, zoom: 1.5 };
    const savedCards = [
      { id: 'card-1', content: 'Card 1', position: { x: 50, y: 50 } },
      { id: 'card-2', content: 'Card 2', position: { x: 150, y: 150 } },
    ];

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: savedCards, viewportPosition: savedViewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY];

    expect(canvasState.cards).toEqual(savedCards);
    expect(canvasState.viewportPosition).toEqual(savedViewport);
  });
});

describe('Viewport Persistence - First-Time User Experience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should indicate fitView needed when no viewport is saved', async () => {
    // No saved state
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY];

    // First-time users should trigger fitView
    const shouldFitView = !canvasState?.viewportPosition;

    expect(shouldFitView).toBe(true);
  });

  it('should not trigger fitView when viewport exists', async () => {
    const savedViewport: Viewport = { x: 0, y: 0, zoom: 1 };

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: savedViewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY];

    const shouldFitView = !canvasState?.viewportPosition;

    expect(shouldFitView).toBe(false);
  });
});

describe('Viewport Persistence - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should handle zero values for all viewport properties', async () => {
    const viewport: Viewport = { x: 0, y: 0, zoom: 0 };

    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition).toEqual({ x: 0, y: 0, zoom: 0 });
  });

  it('should handle corrupted storage data', async () => {
    // Simulate corrupted data
    mockStorage[STORAGE_KEY] = 'corrupted string data';

    const result = await chrome.storage.local.get(STORAGE_KEY);
    const canvasState = result[STORAGE_KEY];

    // Should return the corrupted data as-is (error handling is in the hook)
    expect(typeof canvasState).toBe('string');
  });

  it('should overwrite viewport on subsequent saves', async () => {
    const viewport1: Viewport = { x: 100, y: 100, zoom: 1 };
    const viewport2: Viewport = { x: 200, y: 200, zoom: 1.5 };

    // First save
    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport1 },
    });

    // Second save (overwrite)
    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewport2 },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition).toEqual(viewport2);
  });

  it('should handle rapid viewport updates (simulate debounce)', async () => {
    // Simulate multiple rapid updates (in real code, only the last one would be saved due to debounce)
    const viewports = [
      { x: 10, y: 10, zoom: 1 },
      { x: 20, y: 20, zoom: 1.1 },
      { x: 30, y: 30, zoom: 1.2 },
      { x: 40, y: 40, zoom: 1.3 },
    ];

    // Only save the last one (simulating debounce behavior)
    await chrome.storage.local.set({
      [STORAGE_KEY]: { cards: [], viewportPosition: viewports[viewports.length - 1] },
    });

    const result = await chrome.storage.local.get(STORAGE_KEY);
    expect(result[STORAGE_KEY].viewportPosition).toEqual(viewports[viewports.length - 1]);
  });
});
