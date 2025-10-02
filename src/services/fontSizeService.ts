/**
 * Font size service for managing user text size preferences
 * Stores font size setting in chrome.storage.local
 */

import type { FontSize, FontSizeValues } from '@/types/settings';

const STORAGE_KEY = 'nabokov_font_size';
const DEFAULT_FONT_SIZE: FontSize = 'medium';

/**
 * Font size value mappings for different text elements
 */
const FONT_SIZE_MAP: Record<FontSize, FontSizeValues> = {
  small: {
    content: '11px',
    title: '12px',
    h1: '12px',
    h2: '11px',
    h3: '10px',
    p: '11px',
    li: '11px',
    code: '10px',
    contentHTML: '11px',
  },
  medium: {
    content: '13px',
    title: '14px',
    h1: '14px',
    h2: '13px',
    h3: '12px',
    p: '13px',
    li: '13px',
    code: '12px',
    contentHTML: '13px',
  },
  large: {
    content: '15px',
    title: '16px',
    h1: '16px',
    h2: '15px',
    h3: '14px',
    p: '15px',
    li: '15px',
    code: '14px',
    contentHTML: '15px',
  },
};

/**
 * Get the current font size setting from storage
 * @returns Promise<FontSize> Current font size (defaults to 'medium')
 */
export async function getFontSize(): Promise<FontSize> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const fontSize = result[STORAGE_KEY] as FontSize | undefined;

    // Validate the retrieved value
    if (fontSize && (fontSize === 'small' || fontSize === 'medium' || fontSize === 'large')) {
      return fontSize;
    }

    return DEFAULT_FONT_SIZE;
  } catch (error) {
    console.error('[fontSizeService] Error getting font size:', error);
    return DEFAULT_FONT_SIZE;
  }
}

/**
 * Set the font size setting in storage
 * @param fontSize Font size to set ('small' | 'medium' | 'large')
 */
export async function setFontSize(fontSize: FontSize): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: fontSize });
    console.log('[fontSizeService] Font size set to:', fontSize);
  } catch (error) {
    console.error('[fontSizeService] Error setting font size:', error);
    throw error;
  }
}

/**
 * Get the CSS font size values for a given font size setting
 * @param fontSize Font size setting
 * @returns FontSizeValues CSS values for all text elements
 */
export function getFontSizeValues(fontSize: FontSize): FontSizeValues {
  return FONT_SIZE_MAP[fontSize];
}

/**
 * Get all available font size options
 * @returns Array of available font sizes
 */
export function getAvailableFontSizes(): FontSize[] {
  return ['small', 'medium', 'large'];
}
