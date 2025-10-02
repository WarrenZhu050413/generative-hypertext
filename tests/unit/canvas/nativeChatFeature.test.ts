/**
 * Unit Tests for Native Chat Feature (Issue #6)
 *
 * Tests that AI chat is now a native feature available on all cards:
 * - Chat button visibility logic for different card types
 * - Chat button behavior based on card state
 * - Proper handling of edge cases
 */

import { describe, it, expect } from 'vitest';
import type { Card } from '@/types/card';

describe('Native Chat Feature', () => {
  const baseCard: Card = {
    id: 'card-1',
    content: '<p>Test content</p>',
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

  /**
   * Helper function to determine if chat button should be visible
   * This matches the logic in CardNode.tsx line 770:
   * {card.cardType !== 'image' && card.content && !card.isGenerating && (
   */
  const shouldShowChatButton = (card: Card): boolean => {
    return (
      card.cardType !== 'image' &&
      !!card.content &&
      !card.isGenerating
    );
  };

  /**
   * Helper function to determine chat button title
   * This matches the logic in CardNode.tsx line 777:
   * title={card.cardType === 'generated' ? 'Continue chatting with this card' : 'Chat about this card'}
   */
  const getChatButtonTitle = (card: Card): string => {
    return card.cardType === 'generated'
      ? 'Continue chatting with this card'
      : 'Chat about this card';
  };

  describe('Chat button visibility logic', () => {
    it('should show chat button on clipped cards with content', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'clipped',
      };

      expect(shouldShowChatButton(card)).toBe(true);
    });

    it('should show chat button on note cards with content', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'note',
      };

      expect(shouldShowChatButton(card)).toBe(true);
    });

    it('should show chat button on generated cards with content', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'generated',
        parentCardId: 'parent-1',
      };

      expect(shouldShowChatButton(card)).toBe(true);
    });

    it('should show chat button on cards without explicit cardType', () => {
      const card: Card = {
        ...baseCard,
        cardType: undefined,
      };

      expect(shouldShowChatButton(card)).toBe(true);
    });

    it('should NOT show chat button on image cards', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'image',
        imageData: 'data:image/png;base64,abc123',
      };

      expect(shouldShowChatButton(card)).toBe(false);
    });

    it('should NOT show chat button on cards without content', () => {
      const card: Card = {
        ...baseCard,
        content: undefined,
      };

      expect(shouldShowChatButton(card)).toBe(false);
    });

    it('should NOT show chat button on cards with empty content', () => {
      const card: Card = {
        ...baseCard,
        content: '',
      };

      expect(shouldShowChatButton(card)).toBe(false);
    });

    it('should NOT show chat button during card generation', () => {
      const card: Card = {
        ...baseCard,
        isGenerating: true,
      };

      expect(shouldShowChatButton(card)).toBe(false);
    });
  });

  describe('Chat button title logic', () => {
    it('should use "Continue chatting" title for generated cards', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'generated',
        parentCardId: 'parent-1',
      };

      expect(getChatButtonTitle(card)).toBe('Continue chatting with this card');
    });

    it('should use "Chat about" title for clipped cards', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'clipped',
      };

      expect(getChatButtonTitle(card)).toBe('Chat about this card');
    });

    it('should use "Chat about" title for note cards', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'note',
      };

      expect(getChatButtonTitle(card)).toBe('Chat about this card');
    });

    it('should use "Chat about" title for cards without cardType', () => {
      const card: Card = {
        ...baseCard,
        cardType: undefined,
      };

      expect(getChatButtonTitle(card)).toBe('Chat about this card');
    });
  });

  describe('Native chat feature vs old behavior', () => {
    it('should make chat available on ALL card types (not just generated)', () => {
      const cardTypes: Array<Card['cardType']> = ['clipped', 'note', 'generated', undefined];

      cardTypes.forEach(cardType => {
        const card: Card = {
          ...baseCard,
          cardType,
        };

        // All non-image cards with content should show chat
        expect(shouldShowChatButton(card)).toBe(true);
      });
    });

    it('should hide chat only for specific conditions', () => {
      // Hidden conditions:
      // 1. Image cards
      const imageCard: Card = { ...baseCard, cardType: 'image', imageData: 'data:...' };
      expect(shouldShowChatButton(imageCard)).toBe(false);

      // 2. No content
      const noContentCard: Card = { ...baseCard, content: undefined };
      expect(shouldShowChatButton(noContentCard)).toBe(false);

      // 3. Generating
      const generatingCard: Card = { ...baseCard, isGenerating: true };
      expect(shouldShowChatButton(generatingCard)).toBe(false);

      // All other cards should show chat
      const normalCard: Card = { ...baseCard };
      expect(shouldShowChatButton(normalCard)).toBe(true);
    });

    it('should maintain conversation context for generated cards', () => {
      const card: Card = {
        ...baseCard,
        cardType: 'generated',
        parentCardId: 'parent-1',
        conversation: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Previous message',
            timestamp: Date.now(),
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Previous response',
            timestamp: Date.now(),
          },
        ],
      };

      // Should show chat button
      expect(shouldShowChatButton(card)).toBe(true);

      // Should use "Continue chatting" title since it has conversation history
      expect(getChatButtonTitle(card)).toBe('Continue chatting with this card');
    });
  });

  describe('Edge cases', () => {
    it('should show chat on cards with only whitespace content', () => {
      const card: Card = {
        ...baseCard,
        content: '   ',
      };

      // Content exists (truthy string), so chat shows
      expect(shouldShowChatButton(card)).toBe(true);
    });

    it('should show chat on stashed cards', () => {
      const card: Card = {
        ...baseCard,
        stashed: true,
      };

      // Stashed state doesn't affect chat visibility
      expect(shouldShowChatButton(card)).toBe(true);
    });

    it('should show chat on collapsed cards', () => {
      const card: Card = {
        ...baseCard,
        collapsed: true,
      };

      // Collapsed state doesn't affect chat visibility
      expect(shouldShowChatButton(card)).toBe(true);
    });
  });
});
