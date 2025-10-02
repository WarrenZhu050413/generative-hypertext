/**
 * Unit Tests for Skeleton Loading (Issue #2)
 *
 * Tests that skeleton loading works correctly when generating cards:
 * - Skeleton card is created immediately with isGenerating: true
 * - Final card is updated with content and isGenerating: false
 * - Error states are handled gracefully
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Card } from '@/types/card';
import type { CardButton } from '@/types/button';

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

// Mock window.dispatchEvent
const dispatchEventSpy = vi.fn();
global.window.dispatchEvent = dispatchEventSpy as any;

describe('Skeleton Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dispatchEventSpy.mockClear();
    mockStorage.local.get.mockResolvedValue({ cards: [], nabokov_connections: [] });
    mockStorage.local.set.mockResolvedValue(undefined);
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cardGenerationService', () => {
    it('should create skeleton card immediately before generation', async () => {
      // Mock API key exists
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        if (keys === 'nabokov_connections') {
          return Promise.resolve({ nabokov_connections: [] });
        }
        return Promise.resolve({ cards: [] });
      });

      // Track order of saveCard calls
      const saveCardCalls: Card[] = [];
      vi.doMock('@/utils/storage', () => ({
        generateId: vi.fn(() => 'test-id-123'),
        saveCard: vi.fn((card: Card) => {
          saveCardCalls.push(card);
          return Promise.resolve();
        }),
      }));

      vi.doMock('@/utils/connectionStorage', () => ({
        addConnection: vi.fn(),
      }));

      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn(async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'Generated content';
          }),
        },
      }));

      vi.doMock('@/services/apiConfig', () => ({
        apiConfigService: {
          hasAPIKey: vi.fn(async () => true),
          getAPIKey: vi.fn(async () => 'test-api-key'),
        },
      }));

      const { cardGenerationService } = await import('@/services/cardGenerationService');

      const sourceCard: Card = {
        id: 'source-card',
        content: '<p>Source content</p>',
        metadata: {
          title: 'Source Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      };

      const button: CardButton = {
        id: 'test-button',
        label: 'Test',
        prompt: 'Test {{content}}',
        icon: '🔘',
        connectionType: 'generated-from',
        enabled: true,
      };

      await cardGenerationService.generateCardFromButton(sourceCard, button);

      // Should have called saveCard twice: skeleton then final
      expect(saveCardCalls.length).toBe(2);

      // First call: skeleton card with isGenerating: true
      const skeletonCard = saveCardCalls[0];
      expect(skeletonCard.isGenerating).toBe(true);
      expect(skeletonCard.content).toContain('Generating');
      expect(skeletonCard.id).toBeDefined();

      // Second call: final card with isGenerating: false
      const finalCard = saveCardCalls[1];
      expect(finalCard.isGenerating).toBe(false);
      expect(finalCard.content).not.toContain('Generating');
      expect(finalCard.content).toContain('Generated content');
    });

    it('should dispatch cards-updated event after skeleton creation', async () => {
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        if (keys === 'nabokov_connections') {
          return Promise.resolve({ nabokov_connections: [] });
        }
        return Promise.resolve({ cards: [] });
      });

      vi.doMock('@/utils/storage', () => ({
        generateId: vi.fn(() => 'test-id-123'),
        saveCard: vi.fn(),
      }));

      vi.doMock('@/utils/connectionStorage', () => ({
        addConnection: vi.fn(),
      }));

      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn(async () => 'Generated content'),
        },
      }));

      vi.doMock('@/services/apiConfig', () => ({
        apiConfigService: {
          hasAPIKey: vi.fn(async () => true),
        },
      }));

      const { cardGenerationService } = await import('@/services/cardGenerationService');

      const sourceCard: Card = {
        id: 'source-card',
        content: '<p>Source</p>',
        metadata: {
          title: 'Source',
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

      const button: CardButton = {
        id: 'test-button',
        label: 'Test',
        prompt: 'Test',
        icon: '🔘',
        connectionType: 'generated-from',
        enabled: true,
      };

      await cardGenerationService.generateCardFromButton(sourceCard, button);

      // Should dispatch event at least twice: after skeleton and after final
      expect(dispatchEventSpy.mock.calls.length).toBeGreaterThanOrEqual(2);

      // Check that cards-updated events were dispatched
      const cardsUpdatedEvents = dispatchEventSpy.mock.calls.filter(
        call => call[0]?.type === 'nabokov:cards-updated'
      );
      expect(cardsUpdatedEvents.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle API errors and update skeleton with error message', async () => {
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        if (keys === 'nabokov_connections') {
          return Promise.resolve({ nabokov_connections: [] });
        }
        return Promise.resolve({ cards: [] });
      });

      const saveCardCalls: Card[] = [];
      vi.doMock('@/utils/storage', () => ({
        generateId: vi.fn(() => 'test-id-error'),
        saveCard: vi.fn((card: Card) => {
          saveCardCalls.push({ ...card }); // Deep copy to avoid mutations
          return Promise.resolve();
        }),
      }));

      vi.doMock('@/utils/connectionStorage', () => ({
        addConnection: vi.fn(),
      }));

      // Mock API to fail
      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn().mockRejectedValue(new Error('API timeout')),
        },
      }));

      vi.doMock('@/services/apiConfig', () => ({
        apiConfigService: {
          hasAPIKey: vi.fn(async () => true),
        },
      }));

      const { cardGenerationService } = await import('@/services/cardGenerationService');

      const sourceCard: Card = {
        id: 'source-card',
        content: '<p>Source</p>',
        metadata: {
          title: 'Source',
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

      const button: CardButton = {
        id: 'test-button',
        label: 'Test',
        prompt: 'Test',
        icon: '🔘',
        connectionType: 'generated-from',
        enabled: true,
      };

      try {
        await cardGenerationService.generateCardFromButton(sourceCard, button);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Failed to generate card');
      }

      // Should have saved skeleton card, then error card
      expect(saveCardCalls.length).toBeGreaterThanOrEqual(2);

      // Find skeleton and error cards
      const skeletonCard = saveCardCalls.find(c => c.content?.includes('Generating'));
      const errorCard = saveCardCalls.find(c => c.content?.includes('Generation failed'));

      // Verify skeleton was created
      expect(skeletonCard).toBeDefined();
      if (skeletonCard) {
        expect(skeletonCard.isGenerating).toBe(true);
      }

      // Verify error card was created
      expect(errorCard).toBeDefined();
      if (errorCard) {
        expect(errorCard.isGenerating).toBe(false);
      }
    });

    it('should reuse same card ID for skeleton and final card', async () => {
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        if (keys === 'nabokov_connections') {
          return Promise.resolve({ nabokov_connections: [] });
        }
        return Promise.resolve({ cards: [] });
      });

      const saveCardCalls: Card[] = [];
      vi.doMock('@/utils/storage', () => ({
        generateId: vi.fn(() => 'consistent-id'),
        saveCard: vi.fn((card: Card) => {
          saveCardCalls.push(card);
          return Promise.resolve();
        }),
      }));

      vi.doMock('@/utils/connectionStorage', () => ({
        addConnection: vi.fn(),
      }));

      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn(async () => 'Generated content'),
        },
      }));

      vi.doMock('@/services/apiConfig', () => ({
        apiConfigService: {
          hasAPIKey: vi.fn(async () => true),
        },
      }));

      const { cardGenerationService } = await import('@/services/cardGenerationService');

      const sourceCard: Card = {
        id: 'source-card',
        content: '<p>Source</p>',
        metadata: {
          title: 'Source',
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

      const button: CardButton = {
        id: 'test-button',
        label: 'Test',
        prompt: 'Test',
        icon: '🔘',
        connectionType: 'generated-from',
        enabled: true,
      };

      await cardGenerationService.generateCardFromButton(sourceCard, button);

      // Both skeleton and final should have same ID
      expect(saveCardCalls[0].id).toBe('consistent-id');
      expect(saveCardCalls[1].id).toBe('consistent-id');
    });

    it('should preserve card metadata from skeleton to final', async () => {
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        if (keys === 'nabokov_connections') {
          return Promise.resolve({ nabokov_connections: [] });
        }
        return Promise.resolve({ cards: [] });
      });

      const saveCardCalls: Card[] = [];
      vi.doMock('@/utils/storage', () => ({
        generateId: vi.fn(() => 'test-id'),
        saveCard: vi.fn((card: Card) => {
          saveCardCalls.push(card);
          return Promise.resolve();
        }),
      }));

      vi.doMock('@/utils/connectionStorage', () => ({
        addConnection: vi.fn(),
      }));

      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn(async () => 'Generated content'),
        },
      }));

      vi.doMock('@/services/apiConfig', () => ({
        apiConfigService: {
          hasAPIKey: vi.fn(async () => true),
        },
      }));

      const { cardGenerationService } = await import('@/services/cardGenerationService');

      const sourceCard: Card = {
        id: 'source-card',
        content: '<p>Source</p>',
        metadata: {
          title: 'Source Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['original'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      };

      const button: CardButton = {
        id: 'test-button',
        label: 'Summary',
        prompt: 'Summarize',
        icon: '📋',
        connectionType: 'generated-from',
        enabled: true,
      };

      await cardGenerationService.generateCardFromButton(sourceCard, button);

      const skeleton = saveCardCalls[0];
      const final = saveCardCalls[1];

      // Metadata should be consistent
      expect(skeleton.metadata.title).toBe(final.metadata.title);
      expect(skeleton.metadata.title).toContain('Summary');
      expect(skeleton.metadata.favicon).toBe('📋');
      expect(final.metadata.favicon).toBe('📋');

      // Position and size should be preserved
      expect(skeleton.position).toEqual(final.position);
      expect(skeleton.size).toEqual(final.size);

      // Parent relationship should be preserved
      expect(skeleton.parentCardId).toBe('source-card');
      expect(final.parentCardId).toBe('source-card');
    });
  });
});
