/**
 * Tests for beautificationService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { beautificationService } from '@/services/beautificationService';
import type { Card } from '@/types/card';

// Mock chrome.storage.local
const mockStorage: Record<string, any> = {};
global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        const result: Record<string, any> = {};
        const keyArray = Array.isArray(keys) ? keys : [keys];
        keyArray.forEach(key => {
          if (key in mockStorage) {
            result[key] = mockStorage[key];
          }
        });
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, any>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
} as any;

// Mock window.dispatchEvent
global.window = {
  dispatchEvent: vi.fn(),
} as any;

describe('BeautificationService', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  it('should check if card is beautified', () => {
    const regularCard: Card = {
      id: 'card1',
      content: '<p>Original content</p>',
      metadata: {
        url: 'https://example.com',
        title: 'Test Card',
        domain: 'example.com',
        timestamp: Date.now(),
      },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const beautifiedCard: Card = {
      ...regularCard,
      beautifiedContent: '<p>Beautified content</p>',
    };

    expect(beautificationService.isBeautified(regularCard)).toBe(false);
    expect(beautificationService.isBeautified(beautifiedCard)).toBe(true);
  });

  it('should beautify a card with recreate-design mode', async () => {
    const testCard: Card = {
      id: 'test-card-1',
      content: '<p>Original content</p>',
      metadata: {
        url: 'https://example.com',
        title: 'Test Card',
        domain: 'example.com',
        timestamp: Date.now(),
      },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Store card in mock storage
    mockStorage.cards = [testCard];

    await beautificationService.beautifyCard('test-card-1', 'recreate-design');

    // Verify card was updated
    expect(chrome.storage.local.set).toHaveBeenCalled();
    const savedCards = mockStorage.cards;
    expect(savedCards).toHaveLength(1);
    expect(savedCards[0].beautifiedContent).toBeDefined();
    expect(savedCards[0].beautificationMode).toBe('recreate-design');
    expect(savedCards[0].originalHTML).toBe('<p>Original content</p>');
  });

  it('should beautify a card with organize-content mode', async () => {
    const testCard: Card = {
      id: 'test-card-2',
      content: '<p>Unorganized content</p>',
      metadata: {
        url: 'https://example.com',
        title: 'Test Card',
        domain: 'example.com',
        timestamp: Date.now(),
      },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStorage.cards = [testCard];

    await beautificationService.beautifyCard('test-card-2', 'organize-content');

    expect(chrome.storage.local.set).toHaveBeenCalled();
    const savedCards = mockStorage.cards;
    expect(savedCards[0].beautificationMode).toBe('organize-content');
  });

  it('should revert beautification', async () => {
    const testCard: Card = {
      id: 'test-card-3',
      content: '<p>Original content</p>',
      originalHTML: '<p>Original content</p>',
      beautifiedContent: '<p>Beautified content</p>',
      beautificationMode: 'recreate-design' as const,
      beautificationTimestamp: Date.now(),
      metadata: {
        url: 'https://example.com',
        title: 'Test Card',
        domain: 'example.com',
        timestamp: Date.now(),
      },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStorage.cards = [testCard];

    await beautificationService.revertBeautification('test-card-3');

    const savedCards = mockStorage.cards;
    expect(savedCards[0].beautifiedContent).toBeUndefined();
    expect(savedCards[0].beautificationMode).toBeUndefined();
    expect(savedCards[0].beautificationTimestamp).toBeUndefined();
    expect(savedCards[0].originalHTML).toBeUndefined();
    expect(savedCards[0].content).toBe('<p>Original content</p>');
  });

  it('should not revert a non-beautified card', async () => {
    const testCard: Card = {
      id: 'test-card-4',
      content: '<p>Original content</p>',
      metadata: {
        url: 'https://example.com',
        title: 'Test Card',
        domain: 'example.com',
        timestamp: Date.now(),
      },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStorage.cards = [testCard];

    await beautificationService.revertBeautification('test-card-4');

    // Should not have called set since card was not beautified
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it('should throw error for non-existent card', async () => {
    mockStorage.cards = [];

    await expect(
      beautificationService.beautifyCard('non-existent', 'recreate-design')
    ).rejects.toThrow('Card not found');
  });
});
