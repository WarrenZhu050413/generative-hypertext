/** @jsxImportSource @emotion/react */
/**
 * Example usage of ElementSelector component
 *
 * This file demonstrates how to integrate the ElementSelector component
 * into the Nabokov Web Clipper content script.
 */

import ReactDOM from 'react-dom/client';
import { ElementSelector } from './ElementSelector';
import type { Card } from '@/types';
import { createShadowRoot, mountReactInShadow } from '../utils/shadowDOM';

/**
 * Example 1: Basic usage - Mount ElementSelector in Shadow DOM
 *
 * This is the recommended way to inject the component into a web page
 * as it provides complete style isolation.
 */
export function activateElementSelector() {
  // Create container element
  const container = document.createElement('div');
  container.id = 'nabokov-element-selector';
  document.body.appendChild(container);

  // Create shadow root with Chinese aesthetic styles
  const { shadowRoot, styleCache } = createShadowRoot(container, {
    injectBaseStyles: true,
  });

  // Mount ElementSelector in shadow DOM
  const cleanup = mountReactInShadow(
    shadowRoot,
    <ElementSelector
      onCapture={(card: Card) => {
        console.log('Element captured!', card);
        // Send message to background script or handle capture
        chrome.runtime.sendMessage({
          type: 'ELEMENT_CAPTURED',
          card,
        });
      }}
      onClose={() => {
        console.log('ElementSelector closed');
        // Clean up and remove from DOM
        cleanup();
        container.remove();
      }}
    />,
    { styleCache }
  );

  return cleanup;
}

/**
 * Example 2: Listen for activation command from background script
 *
 * This would typically be in your content script (content.ts)
 */
export function setupElementSelectorListener() {
  let cleanupFn: (() => void) | null = null;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'ACTIVATE_ELEMENT_SELECTOR') {
      // Activate element selector
      if (!cleanupFn) {
        cleanupFn = activateElementSelector();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Already active' });
      }
    } else if (message.type === 'DEACTIVATE_ELEMENT_SELECTOR') {
      // Deactivate element selector
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = null;
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Not active' });
      }
    }
  });
}

/**
 * Example 3: Keyboard shortcut handler (in background script)
 *
 * background.ts would handle Cmd+Shift+E and send message to content script
 */
export function setupBackgroundKeyboardShortcut() {
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'activate-element-selector') {
      // Get active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          // Send message to content script to activate
          chrome.tabs.sendMessage(activeTab.id, {
            type: 'ACTIVATE_ELEMENT_SELECTOR',
          });
        }
      });
    }
  });
}

/**
 * Example 4: Simple integration without Shadow DOM (not recommended)
 *
 * This approach doesn't provide style isolation and may conflict with page styles.
 * Use only for testing or if Shadow DOM is not suitable.
 */
export function activateElementSelectorSimple() {
  const container = document.createElement('div');
  container.id = 'nabokov-element-selector-simple';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <ElementSelector
      onCapture={(card) => {
        console.log('Captured:', card);
      }}
      onClose={() => {
        root.unmount();
        container.remove();
      }}
    />
  );

  return () => {
    root.unmount();
    container.remove();
  };
}

/**
 * Example 5: Integration with custom callback handling
 */
export function activateElementSelectorWithCustomHandling() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const { shadowRoot, styleCache } = createShadowRoot(container);

  const cleanup = mountReactInShadow(
    shadowRoot,
    <ElementSelector
      onCapture={async (card) => {
        // Custom handling - send to API, show notification, etc.
        try {
          // Example: Send to backend API
          await fetch('https://api.example.com/clips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card),
          });

          // Show success notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Element Captured',
            message: `Saved ${card.metadata.tagName} element`,
          });

          // Open canvas view in new tab
          chrome.tabs.create({
            url: chrome.runtime.getURL('canvas.html'),
          });
        } catch (error) {
          console.error('Failed to process capture:', error);
        }
      }}
      onClose={() => {
        cleanup();
        container.remove();
      }}
    />,
    { styleCache }
  );
}

/**
 * Example 6: Integration in content script entry point
 *
 * content.ts (content script entry point)
 */
export function contentScriptMain() {
  console.log('[Nabokov] Content script loaded');

  // Set up message listener for element selector activation
  setupElementSelectorListener();

  // Optional: Add direct keyboard shortcut in content script
  // (Note: Chrome extension keyboard shortcuts should be in background script)
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + Shift + E
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      activateElementSelector();
    }
  });

  console.log('[Nabokov] Ready to capture elements (Cmd+Shift+E)');
}