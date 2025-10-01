/**
 * Window storage utilities for persisting floating window state
 */

import type { SerializedWindowState } from '@/types/window';

const STORAGE_KEY = 'nabokov_windows';

/**
 * Save all window states to chrome.storage.local
 */
export async function saveWindowStates(windows: SerializedWindowState[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: windows });
  } catch (error) {
    console.error('[windowStorage] Error saving window states:', error);
  }
}

/**
 * Load all window states from chrome.storage.local
 */
export async function loadWindowStates(): Promise<SerializedWindowState[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('[windowStorage] Error loading window states:', error);
    return [];
  }
}

/**
 * Clear all window states
 */
export async function clearWindowStates(): Promise<void> {
  try {
    await chrome.storage.local.remove(STORAGE_KEY);
  } catch (error) {
    console.error('[windowStorage] Error clearing window states:', error);
  }
}
