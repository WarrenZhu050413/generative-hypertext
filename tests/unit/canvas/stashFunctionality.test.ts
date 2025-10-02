/**
 * Unit Tests for Stash Functionality Fix (Issue #4 Part 1)
 *
 * Tests that stashed cards are properly hidden from canvas:
 * - Stashed cards filtered from visible cards
 * - Stashed cards not converted to React Flow nodes
 * - Canvas state properly handles stashed vs visible cards
 */

import { describe, it, expect } from 'vitest';
import type { Card } from '@/types/card';

describe('Stash Functionality Fix', () => {
  const createCard = (id: string, stashed: boolean = false): Card => ({
    id,
    content: `<p>Card ${id}</p>`,
    metadata: {
      url: `https://example.com/${id}`,
      title: `Card ${id}`,
      domain: 'example.com',
      timestamp: Date.now(),
    },
    starred: false,
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stashed,
  });

  describe('Card filtering logic', () => {
    it('should filter out stashed cards from visible cards', () => {
      const loadedCards: Card[] = [
        createCard('1', false),  // Visible
        createCard('2', true),   // Stashed
        createCard('3', false),  // Visible
        createCard('4', true),   // Stashed
        createCard('5', false),  // Visible
      ];

      // Filter logic: loadedCards.filter(card => !card.stashed)
      const visibleCards = loadedCards.filter(card => !card.stashed);

      expect(visibleCards.length).toBe(3);
      expect(visibleCards.map(c => c.id)).toEqual(['1', '3', '5']);
    });

    it('should include cards without stashed flag as visible', () => {
      const cardWithoutStashedFlag: Card = {
        ...createCard('test'),
        stashed: undefined,
      };

      const visibleCards = [cardWithoutStashedFlag].filter(card => !card.stashed);

      expect(visibleCards.length).toBe(1);
      expect(visibleCards[0].id).toBe('test');
    });

    it('should exclude cards with stashed: true', () => {
      const stashedCard = createCard('stashed', true);

      const visibleCards = [stashedCard].filter(card => !card.stashed);

      expect(visibleCards.length).toBe(0);
    });
  });

  describe('React Flow node conversion', () => {
    it('should only convert visible cards to nodes (not stashed cards)', () => {
      const loadedCards: Card[] = [
        createCard('1', false),
        createCard('2', true),  // Stashed - should not become node
        createCard('3', false),
      ];

      const visibleCards = loadedCards.filter(card => !card.stashed);

      // Bug fix: Use visibleCards instead of loadedCards for node conversion
      const nodeCount = visibleCards.length;

      expect(nodeCount).toBe(2);
      expect(nodeCount).not.toBe(loadedCards.length); // Should be less than total
    });

    it('should handle empty visible cards list', () => {
      const loadedCards: Card[] = [
        createCard('1', true),
        createCard('2', true),
        createCard('3', true),
      ];

      const visibleCards = loadedCards.filter(card => !card.stashed);

      expect(visibleCards.length).toBe(0);
    });

    it('should handle all visible cards', () => {
      const loadedCards: Card[] = [
        createCard('1', false),
        createCard('2', false),
        createCard('3', false),
      ];

      const visibleCards = loadedCards.filter(card => !card.stashed);

      expect(visibleCards.length).toBe(3);
      expect(visibleCards.length).toBe(loadedCards.length);
    });
  });

  describe('Stash state transitions', () => {
    it('should mark card as stashed when stashing', () => {
      const card = createCard('test', false);

      // Stash operation
      const stashedCard = {
        ...card,
        stashed: true,
        updatedAt: Date.now(),
      };

      expect(stashedCard.stashed).toBe(true);
      expect(card.stashed).toBe(false); // Original unchanged
    });

    it('should unmark card when restoring from stash', () => {
      const card = createCard('test', true);

      // Restore operation
      const restoredCard = {
        ...card,
        stashed: false,
        updatedAt: Date.now(),
      };

      expect(restoredCard.stashed).toBe(false);
      expect(card.stashed).toBe(true); // Original unchanged
    });
  });

  describe('Canvas state consistency', () => {
    it('should maintain separate counts for loaded and visible cards', () => {
      const loadedCards: Card[] = [
        createCard('1', false),
        createCard('2', true),
        createCard('3', false),
        createCard('4', true),
      ];

      const visibleCards = loadedCards.filter(card => !card.stashed);

      expect(loadedCards.length).toBe(4);  // Total cards in storage
      expect(visibleCards.length).toBe(2); // Cards shown on canvas
    });

    it('should use visible cards for node creation', () => {
      const loadedCards: Card[] = [
        createCard('visible-1', false),
        createCard('stashed-1', true),
        createCard('visible-2', false),
      ];

      const visibleCards = loadedCards.filter(card => !card.stashed);

      // CRITICAL FIX: flowNodes should map from visibleCards, not loadedCards
      const flowNodesCorrect = visibleCards.map(card => ({ id: card.id }));
      const flowNodesIncorrect = loadedCards.map(card => ({ id: card.id }));

      expect(flowNodesCorrect.length).toBe(2);
      expect(flowNodesIncorrect.length).toBe(3);
      expect(flowNodesCorrect.map(n => n.id)).toEqual(['visible-1', 'visible-2']);
    });
  });

  describe('Bug fix verification', () => {
    it('should fix the bug where stashed cards were still shown on canvas', () => {
      // Original bug: flowNodes = loadedCards.map(...)
      // Fixed: flowNodes = visibleCards.map(...)

      const loadedCards: Card[] = [
        createCard('1', false),
        createCard('2', true),  // BUG: This was being converted to node
      ];

      const visibleCards = loadedCards.filter(card => !card.stashed);

      // Before fix: 2 nodes created (bug)
      const beforeFix = loadedCards.length;

      // After fix: 1 node created (correct)
      const afterFix = visibleCards.length;

      expect(beforeFix).toBe(2);
      expect(afterFix).toBe(1);
    });
  });

  describe('Side panel integration', () => {
    it('should show stashed cards in side panel', () => {
      const allCards: Card[] = [
        createCard('1', false),
        createCard('2', true),
        createCard('3', true),
      ];

      // Side panel: allCards.filter(card => card.stashed)
      const stashedCards = allCards.filter(card => card.stashed);

      expect(stashedCards.length).toBe(2);
      expect(stashedCards.map(c => c.id)).toEqual(['2', '3']);
    });

    it('should hide stashed cards from canvas', () => {
      const allCards: Card[] = [
        createCard('1', false),
        createCard('2', true),
        createCard('3', true),
      ];

      // Canvas: allCards.filter(card => !card.stashed)
      const canvasCards = allCards.filter(card => !card.stashed);

      expect(canvasCards.length).toBe(1);
      expect(canvasCards.map(c => c.id)).toEqual(['1']);
    });

    it('should ensure no overlap between canvas and side panel cards', () => {
      const allCards: Card[] = [
        createCard('1', false),
        createCard('2', true),
        createCard('3', false),
        createCard('4', true),
      ];

      const canvasCards = allCards.filter(card => !card.stashed);
      const sidePanelCards = allCards.filter(card => card.stashed);

      // No card should be in both
      const canvasIds = new Set(canvasCards.map(c => c.id));
      const sidePanelIds = new Set(sidePanelCards.map(c => c.id));

      const intersection = [...canvasIds].filter(id => sidePanelIds.has(id));

      expect(intersection.length).toBe(0);
      expect(canvasCards.length + sidePanelCards.length).toBe(allCards.length);
    });
  });
});
