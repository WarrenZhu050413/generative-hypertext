/**
 * Storage utilities for Nabokov Web Clipper
 *
 * Handles storage of clipped cards in chrome.storage.local
 */

import type { Card } from '@/types';

/**
 * Saves a card to chrome.storage.local
 *
 * @param card - The card to save
 * @returns Promise that resolves when saved
 *
 * @example
 * ```typescript
 * const card: Card = {
 *   id: generateId(),
 *   content: htmlContent,
 *   metadata: { url: window.location.href, ... },
 *   // ... other properties
 * };
 * await saveCard(card);
 * ```
 */
export async function saveCard(card: Card): Promise<void> {
  try {
    // Get existing cards
    const result = await chrome.storage.local.get('cards');
    const cards: Card[] = result.cards || [];

    // Check if card already exists (by id)
    const existingIndex = cards.findIndex(c => c.id === card.id);

    if (existingIndex >= 0) {
      // Update existing card
      cards[existingIndex] = card;
    } else {
      // Add new card
      cards.push(card);
    }

    // Save back to storage
    await chrome.storage.local.set({ cards });

    console.log('[storage] Card saved successfully:', card.id);
  } catch (error) {
    console.error('[storage] Error saving card:', error);
    throw error;
  }
}

/**
 * Retrieves all cards from chrome.storage.local
 *
 * @returns Promise resolving to array of cards
 *
 * @example
 * ```typescript
 * const cards = await getCards();
 * console.log(`Found ${cards.length} cards`);
 * ```
 */
export async function getCards(): Promise<Card[]> {
  try {
    const result = await chrome.storage.local.get('cards');
    return result.cards || [];
  } catch (error) {
    console.error('[storage] Error getting cards:', error);
    return [];
  }
}

/**
 * Gets a single card by ID from chrome.storage.local
 *
 * @param cardId - The ID of the card to get
 * @returns Promise that resolves with the card or undefined if not found
 */
export async function getCardById(cardId: string): Promise<Card | undefined> {
  const cards = await getCards();
  return cards.find(c => c.id === cardId);
}

/**
 * Deletes a card from chrome.storage.local
 *
 * @param cardId - The ID of the card to delete
 * @returns Promise that resolves when deleted
 */
export async function deleteCard(cardId: string): Promise<void> {
  try {
    const result = await chrome.storage.local.get('cards');
    const cards: Card[] = result.cards || [];

    const filteredCards = cards.filter(c => c.id !== cardId);

    await chrome.storage.local.set({ cards: filteredCards });

    console.log('[storage] Card deleted successfully:', cardId);
  } catch (error) {
    console.error('[storage] Error deleting card:', error);
    throw error;
  }
}

/**
 * Generates a unique ID for cards
 *
 * @returns A unique ID string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}