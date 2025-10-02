/**
 * Stash service for managing stashed cards
 * Stashed cards are hidden from canvas but not deleted
 */

import type { Card } from '@/types/card';
import { saveCard } from '@/utils/storage';

const CARDS_KEY = 'cards';

/**
 * Get all cards from storage
 */
async function getAllCards(): Promise<Card[]> {
  try {
    const result = await chrome.storage.local.get(CARDS_KEY);
    return result[CARDS_KEY] || [];
  } catch (error) {
    console.error('[stashService] Error loading cards:', error);
    return [];
  }
}

/**
 * Save all cards to storage
 */
async function saveAllCards(cards: Card[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [CARDS_KEY]: cards });
    console.log('[stashService] Saved cards:', cards.length);
  } catch (error) {
    console.error('[stashService] Error saving cards:', error);
    throw error;
  }
}

/**
 * Get all stashed cards
 */
export async function getStashedCards(): Promise<Card[]> {
  const allCards = await getAllCards();
  return allCards.filter((card) => card.stashed === true);
}

/**
 * Stash a card (hide from canvas but don't delete)
 */
export async function stashCard(cardId: string): Promise<void> {
  try {
    const allCards = await getAllCards();
    const cardIndex = allCards.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) {
      throw new Error('Card not found');
    }

    // Mark as stashed
    allCards[cardIndex].stashed = true;
    allCards[cardIndex].updatedAt = Date.now();

    await saveAllCards(allCards);

    // Notify canvas and side panel
    window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    window.dispatchEvent(new CustomEvent('nabokov:stash-updated'));

    console.log('[stashService] Card stashed:', cardId);
  } catch (error) {
    console.error('[stashService] Error stashing card:', error);
    throw error;
  }
}

/**
 * Restore a stashed card back to canvas
 */
export async function restoreCard(cardId: string): Promise<void> {
  try {
    const allCards = await getAllCards();
    const cardIndex = allCards.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) {
      throw new Error('Card not found');
    }

    // Unmark as stashed
    allCards[cardIndex].stashed = false;
    allCards[cardIndex].updatedAt = Date.now();

    await saveAllCards(allCards);

    // Notify canvas and side panel
    window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    window.dispatchEvent(new CustomEvent('nabokov:stash-updated'));

    console.log('[stashService] Card restored:', cardId);
  } catch (error) {
    console.error('[stashService] Error restoring card:', error);
    throw error;
  }
}

/**
 * Permanently delete a stashed card
 */
export async function deleteCardPermanently(cardId: string): Promise<void> {
  try {
    const allCards = await getAllCards();
    const updatedCards = allCards.filter((c) => c.id !== cardId);

    await saveAllCards(updatedCards);

    // Notify canvas and side panel
    window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    window.dispatchEvent(new CustomEvent('nabokov:stash-updated'));

    console.log('[stashService] Card deleted permanently:', cardId);
  } catch (error) {
    console.error('[stashService] Error deleting card:', error);
    throw error;
  }
}

/**
 * Get count of stashed cards
 */
export async function getStashCount(): Promise<number> {
  const stashedCards = await getStashedCards();
  return stashedCards.length;
}
