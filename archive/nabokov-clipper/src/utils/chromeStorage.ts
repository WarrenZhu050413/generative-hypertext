/**
 * Chrome Storage Utilities
 *
 * Type-safe wrapper for chrome.storage.local with quota monitoring and error handling.
 * Provides CRUD operations for card data stored in the extension's local storage.
 *
 * Storage Structure:
 * - cards: { [cardId: string]: Card }
 * - Each card contains metadata, content, and references to screenshots in IndexedDB
 *
 * Quota Management:
 * - chrome.storage.local has a quota of 10MB (configurable via manifest)
 * - Warns when storage reaches 80% capacity
 * - Screenshots are stored separately in IndexedDB to avoid quota issues
 */

import type { Card } from '../../../src/types/card';

// Re-export Card type for consumers of this module
export type { Card };

/**
 * Storage quota information
 */
interface StorageQuota {
  bytesInUse: number;
  bytesAvailable: number;
  percentUsed: number;
}

/**
 * Result type for storage operations
 */
type StorageResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Storage key constants
 */
const STORAGE_KEYS = {
  CARDS: 'cards',
  SETTINGS: 'settings',
} as const;

/**
 * Storage quota threshold for warnings (80%)
 */
const QUOTA_WARNING_THRESHOLD = 0.8;

/**
 * Saves a new card to chrome.storage.local
 *
 * @param card - The card object to save
 * @returns Promise resolving to success/error result
 *
 * @example
 * const card: Card = {
 *   id: 'card-123',
 *   title: 'Important Article',
 *   content: 'Article text...',
 *   url: 'https://example.com',
 *   tags: ['research', 'ai'],
 *   createdAt: Date.now(),
 *   updatedAt: Date.now(),
 * };
 * const result = await saveCard(card);
 * if (result.success) {
 *   console.log('Card saved successfully');
 * }
 */
export async function saveCard(card: Card): Promise<StorageResult<Card>> {
  try {
    // Get existing cards
    const existingCards = await getAllCards();
    if (!existingCards.success) {
      return existingCards;
    }

    // Check if card already exists
    if (existingCards.data[card.id]) {
      return {
        success: false,
        error: `Card with id ${card.id} already exists. Use updateCard() instead.`,
      };
    }

    // Add new card
    const updatedCards = {
      ...existingCards.data,
      [card.id]: card,
    };

    // Save to storage
    await chrome.storage.local.set({
      [STORAGE_KEYS.CARDS]: updatedCards,
    });

    // Check quota after save
    await checkQuotaWarning();

    return {
      success: true,
      data: card,
    };
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof Error && error.message.includes('QUOTA_BYTES')) {
      return {
        success: false,
        error: 'Storage quota exceeded. Please delete some cards to free up space.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error saving card',
    };
  }
}

/**
 * Retrieves a single card by ID from chrome.storage.local
 *
 * @param cardId - The ID of the card to retrieve
 * @returns Promise resolving to the card or error
 *
 * @example
 * const result = await getCard('card-123');
 * if (result.success) {
 *   console.log('Card title:', result.data.title);
 * }
 */
export async function getCard(cardId: string): Promise<StorageResult<Card>> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CARDS);
    const cards: Record<string, Card> = result[STORAGE_KEYS.CARDS] || {};

    if (!cards[cardId]) {
      return {
        success: false,
        error: `Card with id ${cardId} not found`,
      };
    }

    return {
      success: true,
      data: cards[cardId],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error retrieving card',
    };
  }
}

/**
 * Retrieves all cards from chrome.storage.local
 *
 * @returns Promise resolving to all cards as a record (object with card IDs as keys)
 *
 * @example
 * const result = await getAllCards();
 * if (result.success) {
 *   const cardCount = Object.keys(result.data).length;
 *   console.log(`Found ${cardCount} cards`);
 * }
 */
export async function getAllCards(): Promise<StorageResult<Record<string, Card>>> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CARDS);
    const cards: Record<string, Card> = result[STORAGE_KEYS.CARDS] || {};

    return {
      success: true,
      data: cards,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error retrieving cards',
    };
  }
}

/**
 * Deletes a card from chrome.storage.local
 *
 * Note: This does NOT delete the associated screenshot from IndexedDB.
 * Use deleteScreenshot() from indexedDB.ts separately if needed.
 *
 * @param cardId - The ID of the card to delete
 * @returns Promise resolving to success/error result
 *
 * @example
 * const result = await deleteCard('card-123');
 * if (result.success) {
 *   console.log('Card deleted successfully');
 * }
 */
export async function deleteCard(cardId: string): Promise<StorageResult<void>> {
  try {
    // Get existing cards
    const existingCards = await getAllCards();
    if (!existingCards.success) {
      return existingCards;
    }

    // Check if card exists
    if (!existingCards.data[cardId]) {
      return {
        success: false,
        error: `Card with id ${cardId} not found`,
      };
    }

    // Remove card
    const { [cardId]: _, ...remainingCards } = existingCards.data;

    // Save updated cards
    await chrome.storage.local.set({
      [STORAGE_KEYS.CARDS]: remainingCards,
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting card',
    };
  }
}

/**
 * Updates an existing card in chrome.storage.local
 *
 * @param cardId - The ID of the card to update
 * @param updates - Partial card object with fields to update
 * @returns Promise resolving to the updated card or error
 *
 * @example
 * const result = await updateCard('card-123', {
 *   title: 'Updated Title',
 *   tags: ['research', 'ai', 'new-tag'],
 *   updatedAt: Date.now(),
 * });
 * if (result.success) {
 *   console.log('Card updated:', result.data.title);
 * }
 */
export async function updateCard(
  cardId: string,
  updates: Partial<Omit<Card, 'id'>>
): Promise<StorageResult<Card>> {
  try {
    // Get existing cards
    const existingCards = await getAllCards();
    if (!existingCards.success) {
      return existingCards;
    }

    // Check if card exists
    if (!existingCards.data[cardId]) {
      return {
        success: false,
        error: `Card with id ${cardId} not found`,
      };
    }

    // Merge updates with existing card
    const updatedCard: Card = {
      ...existingCards.data[cardId],
      ...updates,
      id: cardId, // Ensure ID is not changed
      updatedAt: Date.now(), // Always update timestamp
    };

    // Update cards
    const updatedCards = {
      ...existingCards.data,
      [cardId]: updatedCard,
    };

    // Save to storage
    await chrome.storage.local.set({
      [STORAGE_KEYS.CARDS]: updatedCards,
    });

    // Check quota after update
    await checkQuotaWarning();

    return {
      success: true,
      data: updatedCard,
    };
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof Error && error.message.includes('QUOTA_BYTES')) {
      return {
        success: false,
        error: 'Storage quota exceeded. Please delete some cards to free up space.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating card',
    };
  }
}

/**
 * Gets current storage quota information
 *
 * @returns Promise resolving to quota information
 *
 * @example
 * const quota = await getStorageQuota();
 * console.log(`Storage used: ${quota.percentUsed.toFixed(1)}%`);
 */
export async function getStorageQuota(): Promise<StorageQuota> {
  return new Promise((resolve) => {
    chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
      // chrome.storage.local quota is typically 10MB (10485760 bytes)
      // This can be increased via manifest.json "storage" permissions
      const QUOTA_BYTES = chrome.storage.local.QUOTA_BYTES || 10485760;
      const bytesAvailable = QUOTA_BYTES - bytesInUse;
      const percentUsed = bytesInUse / QUOTA_BYTES;

      resolve({
        bytesInUse,
        bytesAvailable,
        percentUsed,
      });
    });
  });
}

/**
 * Checks storage quota and logs a warning if threshold is exceeded
 *
 * @internal
 * Called automatically after save/update operations
 */
async function checkQuotaWarning(): Promise<void> {
  const quota = await getStorageQuota();

  if (quota.percentUsed >= QUOTA_WARNING_THRESHOLD) {
    console.warn(
      `[Chrome Storage] Quota warning: ${(quota.percentUsed * 100).toFixed(1)}% used ` +
      `(${quota.bytesInUse} / ${quota.bytesInUse + quota.bytesAvailable} bytes). ` +
      `Consider deleting old cards or screenshots.`
    );
  }
}

/**
 * Clears all cards from storage (use with caution)
 *
 * @returns Promise resolving to success/error result
 *
 * @example
 * const result = await clearAllCards();
 * if (result.success) {
 *   console.log('All cards cleared');
 * }
 */
export async function clearAllCards(): Promise<StorageResult<void>> {
  try {
    await chrome.storage.local.remove(STORAGE_KEYS.CARDS);
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error clearing cards',
    };
  }
}

/**
 * Exports all cards as JSON string (for backup/export functionality)
 *
 * @returns Promise resolving to JSON string of all cards
 *
 * @example
 * const result = await exportCards();
 * if (result.success) {
 *   const blob = new Blob([result.data], { type: 'application/json' });
 *   // Download or save blob
 * }
 */
export async function exportCards(): Promise<StorageResult<string>> {
  try {
    const result = await getAllCards();
    if (!result.success) {
      return result;
    }

    const json = JSON.stringify(result.data, null, 2);
    return {
      success: true,
      data: json,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error exporting cards',
    };
  }
}

/**
 * Imports cards from JSON string (for restore/import functionality)
 *
 * @param jsonData - JSON string containing cards data
 * @param merge - If true, merges with existing cards; if false, replaces all cards
 * @returns Promise resolving to number of cards imported
 *
 * @example
 * const json = '{"card-1": {...}, "card-2": {...}}';
 * const result = await importCards(json, false);
 * if (result.success) {
 *   console.log(`Imported ${result.data} cards`);
 * }
 */
export async function importCards(
  jsonData: string,
  merge: boolean = false
): Promise<StorageResult<number>> {
  try {
    // Parse JSON
    const importedCards: Record<string, Card> = JSON.parse(jsonData);

    // Validate data structure
    if (typeof importedCards !== 'object' || importedCards === null) {
      return {
        success: false,
        error: 'Invalid JSON format: expected object with card data',
      };
    }

    // Validate each card
    for (const [id, card] of Object.entries(importedCards)) {
      if (!card.id || !card.content) {
        return {
          success: false,
          error: `Invalid card data for id ${id}: missing required fields (id, content)`,
        };
      }
    }

    // Get existing cards if merging
    let finalCards = importedCards;
    if (merge) {
      const existing = await getAllCards();
      if (existing.success) {
        finalCards = {
          ...existing.data,
          ...importedCards,
        };
      }
    }

    // Save cards
    await chrome.storage.local.set({
      [STORAGE_KEYS.CARDS]: finalCards,
    });

    // Check quota
    await checkQuotaWarning();

    return {
      success: true,
      data: Object.keys(importedCards).length,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Invalid JSON format',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error importing cards',
    };
  }
}