/**
 * Chrome Storage Tests
 *
 * Tests for chrome.storage.local wrapper functions with quota management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveCard,
  getCard,
  getAllCards,
  deleteCard,
  updateCard,
  getStorageQuota,
  clearAllCards,
  exportCards,
  importCards,
  type Card,
} from '../../nabokov-clipper/src/utils/chromeStorage';

// Helper function to create test cards with proper structure
function createTestCard(overrides: Partial<Card> = {}): Card {
  const timestamp = Date.now();
  return {
    id: `test-card-${timestamp}`,
    content: 'Test content',
    metadata: {
      url: 'https://example.com',
      title: 'Test Card',
      domain: 'example.com',
      timestamp,
    },
    starred: false,
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

describe('Chrome Storage - Card Operations', () => {
  beforeEach(() => {
    // Clear storage before each test
    chrome.storage.local.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saveCard', () => {
    it('should save a new card', async () => {
      const card: Card = {
        id: 'test-card-1',
        content: '<p>Test content</p>',
        metadata: {
          url: 'https://example.com',
          title: 'Test Card',
          domain: 'example.com',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = await saveCard(card);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(card);
      }

      // Verify stored
      const retrieved = await getCard(card.id);
      expect(retrieved.success).toBe(true);
      if (retrieved.success) {
        expect(retrieved.data.id).toBe(card.id);
      }
    });

    it('should reject duplicate card IDs', async () => {
      const card: Card = {
        id: 'duplicate-card',
        content: 'Content',
        metadata: {
          url: 'https://example.com',
          title: 'First Card',
          domain: 'example.com',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveCard(card);

      // Try to save again
      const result = await saveCard(card);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('already exists');
      }
    });

    it('should handle multiple cards', async () => {
      const cards: Card[] = [
        {
          id: 'card-1',
          content: 'Content 1',
          metadata: {
            url: 'https://example.com/1',
            title: 'Card 1',
            domain: 'example.com',
            timestamp: Date.now(),
          },
          starred: false,
          tags: ['tag1'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'card-2',
          content: 'Content 2',
          metadata: {
            url: 'https://example.com/2',
            title: 'Card 2',
            domain: 'example.com',
            timestamp: Date.now(),
          },
          starred: false,
          tags: ['tag2'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      for (const card of cards) {
        const result = await saveCard(card);
        expect(result.success).toBe(true);
      }

      const allCards = await getAllCards();
      expect(allCards.success).toBe(true);
      if (allCards.success) {
        expect(Object.keys(allCards.data).length).toBe(2);
      }
    });
  });

  describe('getCard', () => {
    it('should retrieve existing card', async () => {
      const card: Card = {
        id: 'get-test',
        content: 'Content',
        metadata: {
          url: 'https://example.com',
          title: 'Get Test',
          domain: 'example.com',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveCard(card);
      const result = await getCard('get-test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('get-test');
        expect(result.data.metadata.title).toBe('Get Test');
      }
    });

    it('should return error for non-existent card', async () => {
      const result = await getCard('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe('getAllCards', () => {
    it('should return empty object when no cards exist', async () => {
      const result = await getAllCards();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data).length).toBe(0);
      }
    });

    it('should return all stored cards', async () => {
      const card1 = createTestCard({
        id: 'card-1',
        content: 'Content 1',
        metadata: { url: 'https://example.com/1', title: 'Card 1', domain: 'example.com', timestamp: Date.now() },
      });

      const card2 = createTestCard({
        id: 'card-2',
        content: 'Content 2',
        metadata: { url: 'https://example.com/2', title: 'Card 2', domain: 'example.com', timestamp: Date.now() },
      });

      await saveCard(card1);
      await saveCard(card2);

      const result = await getAllCards();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data).length).toBe(2);
        expect(result.data['card-1']).toBeDefined();
        expect(result.data['card-2']).toBeDefined();
      }
    });
  });

  describe('updateCard', () => {
    it('should update existing card', async () => {
      const card = createTestCard({
        id: 'update-test',
        content: 'Original Content',
        metadata: { url: 'https://example.com', title: 'Original Title', domain: 'example.com', timestamp: Date.now() },
        tags: ['original'],
      });

      await saveCard(card);

      const result = await updateCard('update-test', {
        tags: ['updated'],
        metadata: { ...card.metadata, title: 'Updated Title' },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.title).toBe('Updated Title');
        expect(result.data.tags).toContain('updated');
        expect(result.data.content).toBe('Original Content'); // Unchanged
      }
    });

    it('should update timestamp automatically', async () => {
      const card = createTestCard({
        id: 'timestamp-test',
        content: 'Content',
      });

      await saveCard(card);

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await updateCard('timestamp-test', {
        content: 'Updated Content',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updatedAt).toBeGreaterThan(card.updatedAt);
      }
    });

    it('should return error for non-existent card', async () => {
      const result = await updateCard('non-existent', {
        content: 'Updated',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
      }
    });

    it('should not change card ID', async () => {
      const card = createTestCard({
        id: 'id-test',
        content: 'Content',
      });

      await saveCard(card);

      // Try to pass id (should be ignored by updateCard)
      const updateData: any = {
        id: 'different-id', // This should be ignored
        content: 'Updated',
      };
      const result = await updateCard('id-test', updateData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('id-test'); // Should remain unchanged
      }
    });
  });

  describe('deleteCard', () => {
    it('should delete existing card', async () => {
      const card = createTestCard({
        id: 'delete-test',
        content: 'Content',
      });

      await saveCard(card);

      const deleteResult = await deleteCard('delete-test');
      expect(deleteResult.success).toBe(true);

      // Verify deleted
      const getResult = await getCard('delete-test');
      expect(getResult.success).toBe(false);
    });

    it('should return error for non-existent card', async () => {
      const result = await deleteCard('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
      }
    });

    it('should not affect other cards', async () => {
      const card1 = createTestCard({
        id: 'keep-1',
        content: 'Content',
      });

      const card2 = createTestCard({
        id: 'delete-2',
        content: 'Content',
      });

      await saveCard(card1);
      await saveCard(card2);

      await deleteCard('delete-2');

      const allCards = await getAllCards();
      expect(allCards.success).toBe(true);
      if (allCards.success) {
        expect(Object.keys(allCards.data).length).toBe(1);
        expect(allCards.data['keep-1']).toBeDefined();
        expect(allCards.data['delete-2']).toBeUndefined();
      }
    });
  });

  describe('clearAllCards', () => {
    it('should clear all cards', async () => {
      const card1 = createTestCard({
        id: 'card-1',
        content: 'Content',
      });

      const card2 = createTestCard({
        id: 'card-2',
        content: 'Content',
      });

      await saveCard(card1);
      await saveCard(card2);

      const clearResult = await clearAllCards();
      expect(clearResult.success).toBe(true);

      const allCards = await getAllCards();
      expect(allCards.success).toBe(true);
      if (allCards.success) {
        expect(Object.keys(allCards.data).length).toBe(0);
      }
    });
  });

  describe('exportCards', () => {
    it('should export cards as JSON', async () => {
      const card = createTestCard({
        id: 'export-test',
        content: 'Content',
        tags: ['export'],
        metadata: { url: 'https://example.com', title: 'Export Test', domain: 'example.com', timestamp: Date.now() },
      });

      await saveCard(card);

      const result = await exportCards();
      expect(result.success).toBe(true);

      if (result.success) {
        const parsed = JSON.parse(result.data);
        expect(parsed['export-test']).toBeDefined();
        expect(parsed['export-test'].metadata.title).toBe('Export Test');
      }
    });

    it('should export empty object when no cards', async () => {
      const result = await exportCards();
      expect(result.success).toBe(true);

      if (result.success) {
        const parsed = JSON.parse(result.data);
        expect(Object.keys(parsed).length).toBe(0);
      }
    });
  });

  describe('importCards', () => {
    it('should import cards from JSON', async () => {
      const card1 = createTestCard({ id: 'import-1', metadata: { url: 'https://example.com', title: 'Import 1', domain: 'example.com', timestamp: Date.now() } });
      const card2 = createTestCard({ id: 'import-2', metadata: { url: 'https://example.com', title: 'Import 2', domain: 'example.com', timestamp: Date.now() } });
      const cardsData = {
        'import-1': card1,
        'import-2': card2,
      };

      const json = JSON.stringify(cardsData);
      const result = await importCards(json, false);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(2); // 2 cards imported
      }

      const allCards = await getAllCards();
      expect(allCards.success).toBe(true);
      if (allCards.success) {
        expect(Object.keys(allCards.data).length).toBe(2);
      }
    });

    it('should merge when merge option is true', async () => {
      const existingCard = createTestCard({
        id: 'existing',
        content: 'Content',
      });

      await saveCard(existingCard);

      const newCard = createTestCard({
        id: 'new-card',
        content: 'Content',
      });
      const newCardsData = {
        'new-card': newCard,
      };

      const json = JSON.stringify(newCardsData);
      const result = await importCards(json, true);

      expect(result.success).toBe(true);

      const allCards = await getAllCards();
      expect(allCards.success).toBe(true);
      if (allCards.success) {
        expect(Object.keys(allCards.data).length).toBe(2);
        expect(allCards.data['existing']).toBeDefined();
        expect(allCards.data['new-card']).toBeDefined();
      }
    });

    it('should replace when merge option is false', async () => {
      const existingCard = createTestCard({
        id: 'existing',
        content: 'Content',
      });

      await saveCard(existingCard);

      const newCard = createTestCard({
        id: 'new-card',
        content: 'Content',
      });
      const newCardsData = {
        'new-card': newCard,
      };

      const json = JSON.stringify(newCardsData);
      const result = await importCards(json, false);

      expect(result.success).toBe(true);

      const allCards = await getAllCards();
      expect(allCards.success).toBe(true);
      if (allCards.success) {
        expect(Object.keys(allCards.data).length).toBe(1);
        expect(allCards.data['existing']).toBeUndefined();
        expect(allCards.data['new-card']).toBeDefined();
      }
    });

    it('should reject invalid JSON', async () => {
      const result = await importCards('invalid json', false);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid JSON');
      }
    });
  });

  describe('getStorageQuota', () => {
    it('should return quota information', async () => {
      const quota = await getStorageQuota();

      expect(quota).toBeDefined();
      expect(quota.bytesInUse).toBeGreaterThanOrEqual(0);
      expect(quota.bytesAvailable).toBeGreaterThan(0);
      expect(quota.percentUsed).toBeGreaterThanOrEqual(0);
      expect(quota.percentUsed).toBeLessThanOrEqual(1);
    });

    it('should reflect actual usage', async () => {
      const quotaBefore = await getStorageQuota();

      const card = createTestCard({
        id: 'quota-test',
        content: 'Some content that uses storage',
      });

      await saveCard(card);

      const quotaAfter = await getStorageQuota();

      expect(quotaAfter.bytesInUse).toBeGreaterThan(quotaBefore.bytesInUse);
    });
  });
});