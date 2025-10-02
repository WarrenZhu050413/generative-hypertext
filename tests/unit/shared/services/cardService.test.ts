/**
 * Unit tests for Card Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadAllCards,
  getCard,
  upsertCard,
  updateCard,
  stashCard,
  restoreCard,
  deleteCardPermanently,
  duplicateCard,
  getStashedCards,
  getStorageStats,
} from '@/shared/services/cardService';
import type { Card } from '@/types/card';

// Mock chrome API
const mockStorageLocal = {
  get: vi.fn(),
  set: vi.fn(),
  getBytesInUse: vi.fn(() => Promise.resolve(12345)),
  QUOTA_BYTES: 5242880, // 5MB
};

const mockRuntimeSendMessage = vi.fn(() => Promise.resolve());

global.chrome = {
  storage: {
    local: mockStorageLocal,
  },
  runtime: {
    sendMessage: mockRuntimeSendMessage,
  },
} as any;

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
global.window = {
  dispatchEvent: mockDispatchEvent,
} as any;

// Mock storage utilities
vi.mock('@/utils/storage', () => ({
  getCards: vi.fn(),
  saveCard: vi.fn(),
  deleteCard: vi.fn(),
  generateId: vi.fn(() => 'new-id-123'),
}));

import { getCards, saveCard, deleteCard, generateId } from '@/utils/storage';

describe('CardService', () => {
  let sampleCards: Card[];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create sample cards
    sampleCards = [
      {
        id: 'card-1',
        content: '<p>Card 1 content</p>',
        metadata: {
          title: 'Card 1',
          domain: 'example.com',
          url: 'https://example.com/1',
          favicon: '📄',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: 1000,
        updatedAt: 1000,
        stashed: false,
      },
      {
        id: 'card-2',
        content: '<p>Card 2 content</p>',
        metadata: {
          title: 'Card 2',
          domain: 'example.com',
          url: 'https://example.com/2',
          favicon: '📄',
          timestamp: Date.now(),
        },
        starred: true,
        tags: ['test', 'starred'],
        createdAt: 2000,
        updatedAt: 2000,
        stashed: true, // Stashed card
      },
      {
        id: 'card-3',
        content: '<p>Card 3 content</p>',
        metadata: {
          title: 'Card 3',
          domain: 'example.org',
          url: 'https://example.org/3',
          favicon: '📄',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: 3000,
        updatedAt: 3000,
        stashed: false,
      },
    ];

    // Default mock implementation
    vi.mocked(getCards).mockResolvedValue(sampleCards);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadAllCards', () => {
    it('should load all cards when includeStashed is true', async () => {
      const cards = await loadAllCards(true);

      expect(cards).toHaveLength(3);
      expect(cards).toEqual(sampleCards);
    });

    it('should filter out stashed cards when includeStashed is false', async () => {
      const cards = await loadAllCards(false);

      expect(cards).toHaveLength(2);
      expect(cards.every(c => !c.stashed)).toBe(true);
      expect(cards.find(c => c.id === 'card-2')).toBeUndefined();
    });

    it('should filter out stashed cards by default', async () => {
      const cards = await loadAllCards();

      expect(cards).toHaveLength(2);
      expect(cards.every(c => !c.stashed)).toBe(true);
    });
  });

  describe('getCard', () => {
    it('should return a card by ID', async () => {
      const card = await getCard('card-1');

      expect(card).toBeDefined();
      expect(card?.id).toBe('card-1');
      expect(card?.metadata.title).toBe('Card 1');
    });

    it('should return undefined for non-existent card', async () => {
      const card = await getCard('non-existent');

      expect(card).toBeUndefined();
    });
  });

  describe('upsertCard', () => {
    it('should save a card and broadcast update', async () => {
      const newCard: Card = {
        ...sampleCards[0],
        id: 'new-card',
      };

      await upsertCard(newCard);

      expect(saveCard).toHaveBeenCalledWith(newCard);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'nabokov:cards-updated',
        })
      );
      expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
        type: 'CARD_UPDATED',
        cardId: 'new-card',
      });
    });
  });

  describe('updateCard', () => {
    it('should update a card with partial changes', async () => {
      await updateCard('card-1', { starred: true });

      expect(mockStorageLocal.set).toHaveBeenCalledWith({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 'card-1',
            starred: true,
            updatedAt: expect.any(Number),
          }),
        ]),
      });

      expect(mockDispatchEvent).toHaveBeenCalled();
      expect(mockRuntimeSendMessage).toHaveBeenCalled();
    });

    it('should throw error for non-existent card', async () => {
      await expect(
        updateCard('non-existent', { starred: true })
      ).rejects.toThrow('Card not found: non-existent');
    });

    it('should update updatedAt timestamp', async () => {
      const beforeTime = Date.now();

      await updateCard('card-1', { content: 'Updated content' });

      const updatedCards = mockStorageLocal.set.mock.calls[0][0].cards;
      const updatedCard = updatedCards.find((c: Card) => c.id === 'card-1');

      expect(updatedCard.updatedAt).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('stashCard', () => {
    it('should set stashed to true', async () => {
      await stashCard('card-1');

      expect(mockStorageLocal.set).toHaveBeenCalledWith({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 'card-1',
            stashed: true,
          }),
        ]),
      });
    });

    it('should broadcast stash-specific events', async () => {
      await stashCard('card-1');

      // Check for general card update
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'nabokov:cards-updated' })
      );

      // Check for stash-specific event
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'nabokov:stash-updated' })
      );

      // Check runtime messages
      expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
        type: 'CARD_STASHED',
        cardId: 'card-1',
      });

      expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
        type: 'STASH_UPDATED',
        cardId: 'card-1',
      });
    });
  });

  describe('restoreCard', () => {
    it('should set stashed to false', async () => {
      await restoreCard('card-2'); // card-2 is stashed

      expect(mockStorageLocal.set).toHaveBeenCalledWith({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 'card-2',
            stashed: false,
          }),
        ]),
      });
    });

    it('should broadcast restore-specific events', async () => {
      await restoreCard('card-2');

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'nabokov:cards-updated' })
      );

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'nabokov:stash-updated' })
      );

      expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
        type: 'CARD_RESTORED',
        cardId: 'card-2',
      });
    });
  });

  describe('deleteCardPermanently', () => {
    it('should delete a card and broadcast', async () => {
      await deleteCardPermanently('card-1');

      expect(deleteCard).toHaveBeenCalledWith('card-1');
      expect(mockDispatchEvent).toHaveBeenCalled();
      expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
        type: 'CARD_DELETED',
        cardId: 'card-1',
      });
    });
  });

  describe('duplicateCard', () => {
    it('should create a duplicate with new ID', async () => {
      const duplicate = await duplicateCard('card-1');

      expect(duplicate.id).toBe('new-id-123'); // From mocked generateId
      expect(duplicate.id).not.toBe('card-1');
      expect(duplicate.content).toBe(sampleCards[0].content);
      expect(duplicate.metadata.title).toBe(sampleCards[0].metadata.title);
    });

    it('should offset position by 20px', async () => {
      const originalCard = {
        ...sampleCards[0],
        position: { x: 100, y: 200 },
      };

      vi.mocked(getCards).mockResolvedValue([originalCard]);

      const duplicate = await duplicateCard('card-1');

      expect(duplicate.position).toEqual({
        x: 120,
        y: 220,
      });
    });

    it('should update timestamps', async () => {
      const beforeTime = Date.now();
      const duplicate = await duplicateCard('card-1');

      expect(duplicate.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(duplicate.updatedAt).toBeGreaterThanOrEqual(beforeTime);
    });

    it('should throw error for non-existent card', async () => {
      await expect(duplicateCard('non-existent')).rejects.toThrow(
        'Card not found: non-existent'
      );
    });

    it('should broadcast CARD_CREATED event', async () => {
      await duplicateCard('card-1');

      expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
        type: 'CARD_CREATED',
        cardId: 'new-id-123',
      });
    });
  });

  describe('getStashedCards', () => {
    it('should return only stashed cards', async () => {
      const stashed = await getStashedCards();

      expect(stashed).toHaveLength(1);
      expect(stashed[0].id).toBe('card-2');
      expect(stashed[0].stashed).toBe(true);
    });

    it('should return empty array when no stashed cards', async () => {
      vi.mocked(getCards).mockResolvedValue(
        sampleCards.filter(c => !c.stashed)
      );

      const stashed = await getStashedCards();

      expect(stashed).toHaveLength(0);
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      const stats = await getStorageStats();

      expect(stats).toEqual({
        totalCards: 3,
        stashedCards: 1,
        bytesUsed: 12345,
        quotaBytes: 5242880,
      });
    });

    it('should call getBytesInUse', async () => {
      await getStorageStats();

      expect(mockStorageLocal.getBytesInUse).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle runtime.sendMessage errors gracefully', async () => {
      mockRuntimeSendMessage.mockRejectedValueOnce(new Error('No listeners'));

      // Should not throw
      await expect(upsertCard(sampleCards[0])).resolves.not.toThrow();
    });
  });
});
