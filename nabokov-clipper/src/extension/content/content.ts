/**
 * Content script entry point for Nabokov Web Clipper
 * Injected into web pages to enable element selection and clipping
 */

import { ElementSelector } from './elementSelector';

// Global state
let elementSelector: ElementSelector | null = null;

/**
 * Initialize or activate the element selector
 */
function activateSelector(): void {
  try {
    if (!elementSelector) {
      // Create new instance if it doesn't exist
      elementSelector = new ElementSelector();
      console.log('Element selector initialized');
    }

    // Activate the selector (will handle its own state)
    elementSelector.activate();
  } catch (error) {
    console.error('Error activating element selector:', error);
  }
}

/**
 * Deactivate the element selector
 */
function deactivateSelector(): void {
  try {
    if (elementSelector) {
      elementSelector.deactivate();
    }
  } catch (error) {
    console.error('Error deactivating element selector:', error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'ACTIVATE_SELECTOR':
        activateSelector();
        sendResponse({ success: true });
        break;

      case 'DEACTIVATE_SELECTOR':
        deactivateSelector();
        sendResponse({ success: true });
        break;

      case 'GET_SELECTOR_STATE':
        sendResponse({
          success: true,
          active: elementSelector?.isActive() ?? false
        });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Return true to indicate we'll send response asynchronously
  return true;
});

// Initialize on load
console.log('Nabokov Web Clipper content script loaded');

// Optional: Listen for keyboard shortcuts directly in content script as backup
document.addEventListener('keydown', (event) => {
  // Check for Ctrl+Shift+E (Windows/Linux) or Cmd+Shift+E (Mac)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? event.metaKey : event.ctrlKey;

  if (modifierKey && event.shiftKey && event.key.toLowerCase() === 'e') {
    event.preventDefault();
    activateSelector();
  }

  // ESC key to deactivate selector
  if (event.key === 'Escape' && elementSelector?.isActive()) {
    event.preventDefault();
    deactivateSelector();
  }
});

export { activateSelector, deactivateSelector };