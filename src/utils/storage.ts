/**
 * Storage utilities for Nabokov Web Clipper
 *
 * Handles storage of clipped cards in chrome.storage.local
 * and screenshots in IndexedDB.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Card, ScreenshotData } from '@/types';

/**
 * IndexedDB schema for screenshots
 */
interface ScreenshotDB extends DBSchema {
  screenshots: {
    key: string;
    value: ScreenshotData;
  };
}

const DB_NAME = 'nabokov-clipper';
const DB_VERSION = 1;
const SCREENSHOT_STORE = 'screenshots';

/**
 * Opens or creates the IndexedDB database
 */
async function getDB(): Promise<IDBPDatabase<ScreenshotDB>> {
  return openDB<ScreenshotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create screenshot store if it doesn't exist
      if (!db.objectStoreNames.contains(SCREENSHOT_STORE)) {
        db.createObjectStore(SCREENSHOT_STORE, { keyPath: 'id' });
      }
    },
  });
}

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
 * Saves a screenshot to IndexedDB
 *
 * @param screenshot - The screenshot data to save
 * @returns Promise that resolves when saved
 *
 * @example
 * ```typescript
 * const screenshot: ScreenshotData = {
 *   id: card.screenshotId,
 *   dataUrl: compressedDataUrl,
 *   timestamp: Date.now()
 * };
 * await saveScreenshot(screenshot);
 * ```
 */
export async function saveScreenshot(screenshot: ScreenshotData): Promise<void> {
  try {
    const db = await getDB();
    await db.put(SCREENSHOT_STORE, screenshot);
    console.log('[storage] Screenshot saved successfully:', screenshot.id);
  } catch (error) {
    console.error('[storage] Error saving screenshot:', error);
    throw error;
  }
}

/**
 * Retrieves a screenshot from IndexedDB
 *
 * @param id - The screenshot ID
 * @returns Promise resolving to screenshot data, or undefined if not found
 */
export async function getScreenshot(id: string): Promise<ScreenshotData | undefined> {
  try {
    const db = await getDB();
    return await db.get(SCREENSHOT_STORE, id);
  } catch (error) {
    console.error('[storage] Error getting screenshot:', error);
    return undefined;
  }
}

/**
 * Deletes a screenshot from IndexedDB
 *
 * @param id - The screenshot ID to delete
 * @returns Promise that resolves when deleted
 */
export async function deleteScreenshot(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(SCREENSHOT_STORE, id);
    console.log('[storage] Screenshot deleted successfully:', id);
  } catch (error) {
    console.error('[storage] Error deleting screenshot:', error);
    throw error;
  }
}

/**
 * Generates a unique ID for cards and screenshots
 *
 * @returns A unique ID string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}