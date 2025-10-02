/**
 * Card Service - Unified card operations
 *
 * Provides CRUD operations for cards with cross-context synchronization
 * via runtime messages and local events.
 */

import type { Card } from '@/types/card';
import { getCards, saveCard as storageSaveCard, deleteCard as storageDeleteCard, generateId } from '@/utils/storage';

const CARDS_KEY = 'cards';

/**
 * Broadcast card update across all extension contexts
 */
function broadcastCardUpdate(type: string, cardId: string) {
  // Local event for same-context listeners
  window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));

  // Runtime message for cross-context listeners
  chrome.runtime.sendMessage({
    type,
    cardId
  }).catch((error) => {
    // Ignore errors if no listeners
    console.debug('[cardService] No runtime listeners:', error);
  });
}

/**
 * Load all cards from storage
 */
export async function loadAllCards(includeStashed: boolean = false): Promise<Card[]> {
  const cards = await getCards();
  if (includeStashed) {
    return cards;
  }
  return cards.filter(card => !card.stashed);
}

/**
 * Get a single card by ID
 */
export async function getCard(cardId: string): Promise<Card | undefined> {
  const cards = await getCards();
  return cards.find(c => c.id === cardId);
}

/**
 * Save or update a card
 */
export async function upsertCard(card: Card): Promise<void> {
  await storageSaveCard(card);
  broadcastCardUpdate('CARD_UPDATED', card.id);
}

/**
 * Update a card with partial changes
 */
export async function updateCard(cardId: string, updates: Partial<Card>): Promise<void> {
  const cards = await getCards();
  const index = cards.findIndex(c => c.id === cardId);

  if (index === -1) {
    throw new Error(`Card not found: ${cardId}`);
  }

  cards[index] = {
    ...cards[index],
    ...updates,
    updatedAt: Date.now()
  };

  await chrome.storage.local.set({ [CARDS_KEY]: cards });
  broadcastCardUpdate('CARD_UPDATED', cardId);

  console.log('[cardService] Card updated:', cardId);
}

/**
 * Stash a card (hide from canvas)
 */
export async function stashCard(cardId: string): Promise<void> {
  await updateCard(cardId, { stashed: true });
  broadcastCardUpdate('CARD_STASHED', cardId);

  // Also send stash-specific event
  window.dispatchEvent(new CustomEvent('nabokov:stash-updated'));
  chrome.runtime.sendMessage({
    type: 'STASH_UPDATED',
    cardId
  }).catch(() => {});

  console.log('[cardService] Card stashed:', cardId);
}

/**
 * Restore a stashed card to canvas
 */
export async function restoreCard(cardId: string): Promise<void> {
  await updateCard(cardId, { stashed: false });
  broadcastCardUpdate('CARD_RESTORED', cardId);

  // Also send stash-specific event
  window.dispatchEvent(new CustomEvent('nabokov:stash-updated'));
  chrome.runtime.sendMessage({
    type: 'STASH_UPDATED',
    cardId
  }).catch(() => {});

  console.log('[cardService] Card restored:', cardId);
}

/**
 * Permanently delete a card
 */
export async function deleteCardPermanently(cardId: string): Promise<void> {
  await storageDeleteCard(cardId);
  broadcastCardUpdate('CARD_DELETED', cardId);

  console.log('[cardService] Card deleted permanently:', cardId);
}

/**
 * Duplicate a card (creates a new card with copied content)
 */
export async function duplicateCard(cardId: string): Promise<Card> {
  const original = await getCard(cardId);

  if (!original) {
    throw new Error(`Card not found: ${cardId}`);
  }

  const duplicate: Card = {
    ...original,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    position: original.position ? {
      x: original.position.x + 20,
      y: original.position.y + 20
    } : undefined
  };

  await storageSaveCard(duplicate);
  broadcastCardUpdate('CARD_CREATED', duplicate.id);

  console.log('[cardService] Card duplicated:', cardId, '→', duplicate.id);

  return duplicate;
}

/**
 * Get all stashed cards
 */
export async function getStashedCards(): Promise<Card[]> {
  const cards = await getCards();
  return cards.filter(card => card.stashed === true);
}

/**
 * Get storage stats
 */
export async function getStorageStats() {
  const bytesInUse = await chrome.storage.local.getBytesInUse();
  const cards = await getCards();

  return {
    totalCards: cards.length,
    stashedCards: cards.filter(c => c.stashed).length,
    bytesUsed: bytesInUse,
    quotaBytes: chrome.storage.local.QUOTA_BYTES
  };
}

// Re-export generateId for convenience
export { generateId } from '@/utils/storage';
