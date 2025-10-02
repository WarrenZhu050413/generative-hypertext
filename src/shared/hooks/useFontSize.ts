/**
 * Hook for managing font size preference
 * Provides current font size, CSS values, and setter function
 * Listens for storage changes to keep UI in sync across contexts
 */

import { useState, useEffect } from 'react';
import type { FontSize, FontSizeValues } from '@/types/settings';
import {
  getFontSize,
  setFontSize as setFontSizeInStorage,
  getFontSizeValues,
} from '@/services/fontSizeService';

interface UseFontSizeReturn {
  fontSize: FontSize;
  fontSizeValues: FontSizeValues;
  setFontSize: (size: FontSize) => Promise<void>;
}

/**
 * Custom hook for font size management
 * @returns Object with fontSize, fontSizeValues, and setFontSize function
 */
export function useFontSize(): UseFontSizeReturn {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [fontSizeValues, setFontSizeValues] = useState<FontSizeValues>(
    getFontSizeValues('medium')
  );

  useEffect(() => {
    // Load font size from storage on mount
    async function loadFontSize() {
      try {
        const size = await getFontSize();
        setFontSizeState(size);
        setFontSizeValues(getFontSizeValues(size));
      } catch (error) {
        console.error('[useFontSize] Error loading font size:', error);
      }
    }

    loadFontSize();

    // Listen for storage changes to keep UI in sync
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes.nabokov_font_size) {
        const newSize = changes.nabokov_font_size.newValue as FontSize;
        if (newSize) {
          setFontSizeState(newSize);
          setFontSizeValues(getFontSizeValues(newSize));
          console.log('[useFontSize] Font size updated from storage:', newSize);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const setFontSize = async (size: FontSize): Promise<void> => {
    try {
      await setFontSizeInStorage(size);
      setFontSizeState(size);
      setFontSizeValues(getFontSizeValues(size));
    } catch (error) {
      console.error('[useFontSize] Error setting font size:', error);
      throw error;
    }
  };

  return {
    fontSize,
    fontSizeValues,
    setFontSize,
  };
}
