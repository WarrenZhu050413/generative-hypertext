/**
 * Hook for loading and managing card action buttons
 */

import { useState, useEffect } from 'react';
import type { CardButton } from '@/types/button';
import { DEFAULT_BUTTONS } from '@/config/defaultButtons';

const CUSTOM_BUTTONS_KEY = 'nabokov_custom_buttons';

export function useButtons() {
  const [buttons, setButtons] = useState<CardButton[]>(DEFAULT_BUTTONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadButtons();

    // Listen for button updates
    const handleButtonUpdate = () => {
      loadButtons();
    };
    window.addEventListener('nabokov:buttons-updated', handleButtonUpdate);
    return () => {
      window.removeEventListener('nabokov:buttons-updated', handleButtonUpdate);
    };
  }, []);

  const loadButtons = async () => {
    try {
      setIsLoading(true);
      const result = await chrome.storage.local.get(CUSTOM_BUTTONS_KEY);
      const customButtons: CardButton[] = result[CUSTOM_BUTTONS_KEY] || [];

      // Merge default and custom buttons
      // Default buttons can be disabled but not deleted
      const allButtons = [
        ...DEFAULT_BUTTONS,
        ...customButtons
      ];

      setButtons(allButtons);
    } catch (error) {
      console.error('[useButtons] Error loading buttons:', error);
      setButtons(DEFAULT_BUTTONS);
    } finally {
      setIsLoading(false);
    }
  };

  // Get only enabled buttons
  const enabledButtons = buttons.filter(btn => btn.enabled);

  return {
    buttons,
    enabledButtons,
    isLoading,
  };
}
