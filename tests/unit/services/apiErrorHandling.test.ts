/**
 * Unit Tests for API Error Handling (Issue #7)
 *
 * Tests that services properly handle API errors and throw user-friendly messages
 * instead of falling back to mock responses.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

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

describe('API Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.local.get.mockResolvedValue({ cards: [] });
    mockStorage.local.set.mockResolvedValue(undefined);

    // Reset all modules to clear any cached imports
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cardGenerationService', () => {
    it('should throw error when API key is not configured', async () => {
      // Mock no API key
      mockStorage.local.get.mockResolvedValue({ nabokov_claude_api_key: '' });

      const { cardGenerationService } = await import('@/services/cardGenerationService');
      const mockCard = {
        id: 'test-card',
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
      };

      const mockButton = {
        id: 'test-button',
        label: 'Test Button',
        prompt: 'Test prompt',
        icon: '🔘',
        connectionType: 'generated-from' as const,
        enabled: true,
      };

      await expect(
        cardGenerationService.generateCardFromButton(mockCard, mockButton)
      ).rejects.toThrow('Claude API key not configured');
    });

    it('should throw user-friendly error when API fails', async () => {
      // Mock API key exists
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        return Promise.resolve({ cards: [] });
      });

      // Mock claudeAPIService to throw error
      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn().mockRejectedValue(new Error('Network error')),
        },
      }));

      const { cardGenerationService } = await import('@/services/cardGenerationService');
      const mockCard = {
        id: 'test-card',
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
      };

      const mockButton = {
        id: 'test-button',
        label: 'Test Button',
        prompt: 'Test {{content}}',
        icon: '🔘',
        connectionType: 'generated-from' as const,
        enabled: true,
      };

      await expect(
        cardGenerationService.generateCardFromButton(mockCard, mockButton)
      ).rejects.toThrow(/Failed to generate card.*Network error/);
    });
  });

  describe('childCardGenerator', () => {
    it('should throw error when API key is not configured', async () => {
      // Mock no API key
      mockStorage.local.get.mockResolvedValue({ nabokov_claude_api_key: '' });

      const { generateChildCard } = await import('@/services/childCardGenerator');

      const mockRequest = {
        selection: {
          text: 'test text',
          range: {} as Range,
          startOffset: 0,
          endOffset: 9,
          contextBefore: 'before',
          contextAfter: 'after',
          cardId: 'parent-card',
          containerElement: document.createElement('div'),
        },
        parentCard: {
          id: 'parent-card',
          content: '<p>Parent content</p>',
          metadata: {
            title: 'Parent Card',
            domain: 'example.com',
            url: 'https://example.com',
            favicon: '📝',
            timestamp: Date.now(),
          },
          starred: false,
          tags: ['test'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        generationType: 'explanation' as const,
      };

      const generator = generateChildCard(mockRequest);

      await expect(generator.next()).rejects.toThrow('Claude API key not configured');
    });

    it('should throw user-friendly error when API fails', async () => {
      // Mock API key exists
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        return Promise.resolve({ cards: [] });
      });

      // Mock claudeAPIService to throw error
      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn().mockRejectedValue(new Error('API timeout')),
        },
      }));

      const { generateChildCard } = await import('@/services/childCardGenerator');

      const mockRequest = {
        selection: {
          text: 'test text',
          range: {} as Range,
          startOffset: 0,
          endOffset: 9,
          contextBefore: 'before',
          contextAfter: 'after',
          cardId: 'parent-card',
          containerElement: document.createElement('div'),
        },
        parentCard: {
          id: 'parent-card',
          content: '<p>Parent content</p>',
          metadata: {
            title: 'Parent Card',
            domain: 'example.com',
            url: 'https://example.com',
            favicon: '📝',
            timestamp: Date.now(),
          },
          starred: false,
          tags: ['test'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        generationType: 'definition' as const,
      };

      const generator = generateChildCard(mockRequest);

      await expect(generator.next()).rejects.toThrow(/Failed to generate child card.*API timeout/);
    });
  });

  describe('fillInService', () => {
    it('should throw error when API key is not configured', async () => {
      // Mock no API key
      mockStorage.local.get.mockResolvedValue({
        nabokov_claude_api_key: '',
        nabokov_connections: [],
      });

      const { fillInFromConnections } = await import('@/services/fillInService');

      const mockCard = {
        id: 'target-card',
        content: '<p>Original content</p>',
        metadata: {
          title: 'Target Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const generator = fillInFromConnections(mockCard, [mockCard], {
        strategy: 'replace',
      });

      await expect(generator.next()).rejects.toThrow('Claude API key not configured');
    });

    it('should throw error when no connected cards found', async () => {
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

      const { fillInFromConnections } = await import('@/services/fillInService');

      const mockCard = {
        id: 'target-card',
        content: '<p>Original content</p>',
        metadata: {
          title: 'Target Card',
          domain: 'example.com',
          url: 'https://example.com',
          favicon: '📝',
          timestamp: Date.now(),
        },
        starred: false,
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const generator = fillInFromConnections(mockCard, [mockCard], {
        strategy: 'append',
      });

      await expect(generator.next()).rejects.toThrow('No connected cards with content found');
    });
  });

  describe('chatService', () => {
    it('should throw error when API key is not configured', async () => {
      // Mock no API key
      mockStorage.local.get.mockResolvedValue({ nabokov_claude_api_key: '' });

      const { chatService } = await import('@/services/chatService');

      const generator = chatService.sendMessage(
        'test-card-id',
        'Hello',
        '<p>Card content</p>'
      );

      await expect(generator.next()).rejects.toThrow('Claude API key not configured');
    });

    it('should handle API errors gracefully and save error message', async () => {
      // Mock API key exists and card exists
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_claude_api_key') {
          return Promise.resolve({ nabokov_claude_api_key: 'test-key' });
        }
        if (keys === 'cards') {
          return Promise.resolve({
            cards: [{
              id: 'test-card-id',
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
              conversation: [],
            }],
          });
        }
        return Promise.resolve({});
      });

      // Mock claudeAPIService to throw error
      vi.doMock('@/services/claudeAPIService', () => ({
        claudeAPIService: {
          sendMessage: vi.fn().mockRejectedValue(new Error('Rate limit exceeded')),
        },
      }));

      const { chatService } = await import('@/services/chatService');

      const generator = chatService.sendMessage(
        'test-card-id',
        'Hello',
        '<p>Card content</p>'
      );

      // Should complete without throwing (error is saved to conversation)
      let lastValue;
      try {
        for await (const chunk of generator) {
          lastValue = chunk;
        }
      } catch (error) {
        // Should not throw
        throw new Error('Chat service should not throw, it should save error to conversation');
      }

      // Verify error was saved to card
      expect(mockStorage.local.set).toHaveBeenCalled();
    });
  });

  describe('apiConfigService', () => {
    it('should return false when no API key is configured', async () => {
      mockStorage.local.get.mockResolvedValue({ nabokov_claude_api_key: '' });

      const { apiConfigService } = await import('@/services/apiConfig');

      const hasKey = await apiConfigService.hasAPIKey();
      expect(hasKey).toBe(false);
    });

    it('should return true when API key is configured', async () => {
      mockStorage.local.get.mockResolvedValue({ nabokov_claude_api_key: 'sk-test-key' });

      const { apiConfigService } = await import('@/services/apiConfig');

      const hasKey = await apiConfigService.hasAPIKey();
      expect(hasKey).toBe(true);
    });
  });

  describe('Error message quality', () => {
    it('should provide actionable error messages', async () => {
      mockStorage.local.get.mockResolvedValue({ nabokov_claude_api_key: '' });

      const { cardGenerationService } = await import('@/services/cardGenerationService');

      const mockCard = {
        id: 'test-card',
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
      };

      const mockButton = {
        id: 'test-button',
        label: 'Test Button',
        prompt: 'Test prompt',
        icon: '🔘',
        connectionType: 'generated-from' as const,
        enabled: true,
      };

      try {
        await cardGenerationService.generateCardFromButton(mockCard, mockButton);
        throw new Error('Should have thrown');
      } catch (error) {
        const message = (error as Error).message;
        // Error message should mention:
        // 1. What went wrong
        expect(message).toContain('API key not configured');
        // 2. How to fix it
        expect(message).toContain('Settings');
      }
    });
  });
});
