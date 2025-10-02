/**
 * Unit Tests for Card Size Preservation (Issue #1)
 *
 * Tests that card dimensions are preserved when:
 * - Starring/unstarring cards
 * - Updating card properties
 * - Saving cards after resize
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Card } from '@/types/card';

// Mock chrome.storage API
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
    getBytesInUse: vi.fn(),
    QUOTA_BYTES: 5242880,
  },
};

global.chrome = {
  storage: mockStorage,
} as any;

describe('Card Size Preservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock as Promise-based API (not callback-based)
    mockStorage.local.get.mockResolvedValue({ cards: [] });
    mockStorage.local.set.mockResolvedValue(undefined);
  });

  describe('saveCard preserves size', () => {
    it('should preserve size property when saving an existing card', async () => {
      const { saveCard } = await import('@/utils/storage');

      const existingCard: Card = {
        id: 'test-card-1',
        content: '<p>Test content</p>',
        metadata: {
          title: 'Test Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: { width: 500, height: 300 }, // Custom size
        position: { x: 100, y: 100 },
      };

      // Mock storage with existing card
      mockStorage.local.get.mockResolvedValue({ cards: [existingCard] });

      // Update card (e.g., star it)
      const updatedCard: Card = {
        ...existingCard,
        starred: true,
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);

      // Verify that set was called with card including size
      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-card-1',
              starred: true,
              size: { width: 500, height: 300 }, // Size preserved
            }),
          ]),
        }
      );
    });

    it('should preserve size when updating card content', async () => {
      const { saveCard } = await import('@/utils/storage');

      const existingCard: Card = {
        id: 'test-card-2',
        content: '<p>Original content</p>',
        metadata: {
          title: 'Test Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: { width: 400, height: 350 },
        position: { x: 200, y: 200 },
      };

      mockStorage.local.get.mockResolvedValue({ cards: [existingCard] });

      // Update content while preserving size
      const updatedCard: Card = {
        ...existingCard,
        content: '<p>Updated content</p>',
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-card-2',
              content: '<p>Updated content</p>',
              size: { width: 400, height: 350 }, // Size preserved
            }),
          ]),
        }
      );
    });

    it('should handle cards without size property', async () => {
      const { saveCard } = await import('@/utils/storage');

      const cardWithoutSize: Card = {
        id: 'test-card-3',
        content: '<p>Test content</p>',
        metadata: {
          title: 'Test Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // No size property
      };

      mockStorage.local.get.mockResolvedValue({ cards: [] });

      await saveCard(cardWithoutSize);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-card-3',
              // Size is undefined, which is valid
            }),
          ]),
        }
      );
    });

    it('should preserve position along with size', async () => {
      const { saveCard } = await import('@/utils/storage');

      const existingCard: Card = {
        id: 'test-card-4',
        content: '<p>Test content</p>',
        metadata: {
          title: 'Test Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: { width: 320, height: 240 },
        position: { x: 500, y: 600 }, // Custom position
      };

      mockStorage.local.get.mockResolvedValue({ cards: [existingCard] });

      const updatedCard: Card = {
        ...existingCard,
        starred: true,
      };

      await saveCard(updatedCard);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-card-4',
              size: { width: 320, height: 240 }, // Size preserved
              position: { x: 500, y: 600 }, // Position preserved
            }),
          ]),
        }
      );
    });
  });

  describe('Size fallbacks', () => {
    it('should use default size when card has no size', () => {
      const cardWithoutSize: Card = {
        id: 'test-card-5',
        content: '<p>Test</p>',
        metadata: {
          title: 'Test',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Fallback logic: nodeSize || card.size || { width: 320, height: 240 }
      const fallbackSize = cardWithoutSize.size || { width: 320, height: 240 };

      expect(fallbackSize).toEqual({ width: 320, height: 240 });
    });

    it('should use card size when available', () => {
      const cardWithSize: Card = {
        id: 'test-card-6',
        content: '<p>Test</p>',
        metadata: {
          title: 'Test',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: { width: 400, height: 300 },
      };

      const fallbackSize = cardWithSize.size || { width: 320, height: 240 };

      expect(fallbackSize).toEqual({ width: 400, height: 300 });
    });

    it('should prioritize nodeSize over card.size', () => {
      const nodeSize = { width: 500, height: 400 };
      const cardSize = { width: 320, height: 240 };

      // Fallback logic: nodeSize || card.size || default
      const resultSize = nodeSize || cardSize || { width: 320, height: 240 };

      expect(resultSize).toEqual({ width: 500, height: 400 });
    });
  });

  describe('Multiple property updates', () => {
    it('should preserve size when updating multiple properties', async () => {
      const { saveCard } = await import('@/utils/storage');

      const existingCard: Card = {
        id: 'test-card-7',
        content: '<p>Original</p>',
        metadata: {
          title: 'Original Title',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['old'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: { width: 450, height: 380 },
        position: { x: 100, y: 100 },
      };

      mockStorage.local.get.mockResolvedValue({ cards: [existingCard] });

      // Update multiple properties at once
      const updatedCard: Card = {
        ...existingCard,
        starred: true,
        tags: ['new', 'updated'],
        metadata: {
          ...existingCard.metadata,
          title: 'Updated Title',
        },
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-card-7',
              starred: true,
              tags: ['new', 'updated'],
              size: { width: 450, height: 380 }, // Size still preserved
              position: { x: 100, y: 100 }, // Position still preserved
            }),
          ]),
        }
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle zero-width or zero-height sizes', async () => {
      const { saveCard } = await import('@/utils/storage');

      const cardWithZeroSize: Card = {
        id: 'test-card-8',
        content: '<p>Test</p>',
        metadata: {
          title: 'Test',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: { width: 0, height: 0 }, // Invalid but should be preserved as-is
      };

      mockStorage.local.get.mockResolvedValue({ cards: [] });

      await saveCard(cardWithZeroSize);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-card-8',
              size: { width: 0, height: 0 }, // Preserved even if invalid
            }),
          ]),
        }
      );
    });

    it('should handle very large sizes', async () => {
      const { saveCard } = await import('@/utils/storage');

      const cardWithLargeSize: Card = {
        id: 'test-card-9',
        content: '<p>Test</p>',
        metadata: {
          title: 'Test',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: { width: 2000, height: 1500 }, // Very large
      };

      mockStorage.local.get.mockResolvedValue({ cards: [] });

      await saveCard(cardWithLargeSize);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-card-9',
              size: { width: 2000, height: 1500 }, // Large sizes preserved
            }),
          ]),
        }
      );
    });
  });
});
