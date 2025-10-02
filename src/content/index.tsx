/**
 * Content Script for Nabokov Web Clipper
 *
 * Entry point for the Chrome extension content script that integrates
 * ElementSelector and FloatingChat components into web pages via Shadow DOM.
 *
 * Flow:
 * 1. Background script sends ACTIVATE_SELECTOR message (triggered by Cmd+Shift+E)
 * 2. Content script mounts ElementSelector in Shadow DOM
 * 3. User selects an element
 * 4. ElementSelector captures element data
 * 5. FloatingChat appears for conversation
 * 6. Data saved to chrome.storage.local and IndexedDB
 * 7. User closes chat or presses ESC to deactivate
 */

import React from 'react';
import { createShadowRoot, mountReactInShadow, CHINESE_AESTHETIC_STYLES } from '../utils/shadowDOM';
import { ElementSelector } from '../components/ElementSelector';
import { FloatingChat } from '../components/FloatingChat';
import { InlineChatWindow } from '../components/InlineChatWindow';
import { capturePageContext } from '../services/pageContextCapture';
import { Card } from '../types';
import { saveCard, generateId } from '../utils/storage';

// ============================================================================
// State Management
// ============================================================================

/**
 * Content script state
 */
interface ContentScriptState {
  /** Whether element selector is currently active */
  isActive: boolean;
  /** Currently selected element (if any) */
  selectedElement: HTMLElement | null;
  /** Captured card data */
  capturedCard: Card | null;
  /** Whether floating chat is visible */
  showFloatingChat: boolean;
  /** Shadow root container element */
  containerElement: HTMLElement | null;
  /** Cleanup function for React unmounting */
  cleanup: (() => void) | null;
}

/**
 * Global state for content script
 */
let state: ContentScriptState = {
  isActive: false,
  selectedElement: null,
  capturedCard: null,
  showFloatingChat: false,
  containerElement: null,
  cleanup: null,
};

/**
 * Inline chat state (separate from element selector)
 */
interface InlineChatState {
  isOpen: boolean;
  containerElement: HTMLElement | null;
  cleanup: (() => void) | null;
}

let inlineChatState: InlineChatState = {
  isOpen: false,
  containerElement: null,
  cleanup: null,
};

// ============================================================================
// Shadow DOM Setup
// ============================================================================

/**
 * Creates and mounts the shadow DOM container
 *
 * @returns The container element with shadow root attached
 */
function createContainer(): HTMLElement {
  // Create container element
  const container = document.createElement('div');
  container.id = 'nabokov-clipper-root';
  container.setAttribute('data-nabokov-container', 'true');

  // Position absolutely to avoid interfering with page layout
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    pointer-events: none;
  `;

  // Append to body
  document.body.appendChild(container);

  console.log('[content] Container created and mounted');
  return container;
}

/**
 * Removes the container element from the DOM
 *
 * @param container - The container element to remove
 */
function removeContainer(container: HTMLElement): void {
  if (container.parentNode) {
    container.parentNode.removeChild(container);
    console.log('[content] Container removed');
  }
}

// ============================================================================
// Component Integration
// ============================================================================

/**
 * Activates the element selector by mounting it in Shadow DOM
 */
function activateSelector(initialStashState: boolean = false): void {
  // Prevent multiple activations
  if (state.isActive) {
    console.warn('[content] Selector already active');
    return;
  }

  console.log('[content] Activating element selector...', { initialStashState });

  try {
    // Create container
    const container = createContainer();
    state.containerElement = container;

    // Create shadow root with Chinese aesthetic styles
    const { shadowRoot, styleCache } = createShadowRoot(container, {
      injectBaseStyles: true,
    });

    // Handle element capture
    const handleCapture = (card: Card) => {
      console.log('[content] Element captured:', card.id);

      // Update state
      state.capturedCard = card;
      state.showFloatingChat = true;

      // Remount with FloatingChat visible
      if (state.selectedElement) {
        remountWithChat(shadowRoot, styleCache);
      }
    };

    // Handle selector close
    const handleClose = () => {
      console.log('[content] Selector closed');
      deactivateSelector();
    };

    // Mount ElementSelector with initial stash state
    const cleanup = mountReactInShadow(
      shadowRoot,
      <ElementSelector
        onCapture={handleCapture}
        onClose={handleClose}
        initialStashState={initialStashState}
      />,
      { styleCache }
    );

    // Update state
    state.isActive = true;
    state.cleanup = cleanup;

    console.log('[content] Element selector activated successfully');

  } catch (error) {
    console.error('[content] Error activating selector:', error);

    // Cleanup on error
    if (state.containerElement) {
      removeContainer(state.containerElement);
      state.containerElement = null;
    }

    // Send error message to background
    chrome.runtime.sendMessage({
      type: 'SELECTOR_ERROR',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

/**
 * Remounts the component tree with FloatingChat visible
 *
 * This is called after an element is captured to show the chat interface.
 *
 * @param shadowRoot - The shadow root to mount into
 * @param styleCache - The Emotion style cache
 */
function remountWithChat(shadowRoot: ShadowRoot, styleCache: any): void {
  // Unmount current component
  if (state.cleanup) {
    state.cleanup();
    state.cleanup = null;
  }

  // Handle chat close
  const handleChatClose = () => {
    console.log('[content] Chat closed');
    deactivateSelector();
  };

  // Mount ElementSelector with FloatingChat
  // Note: ElementSelector internally handles showing FloatingChat when
  // showFloatingChat state is true, so we just need to remount it
  // Actually, looking at ElementSelector, it already handles this internally
  // So we don't need to remount - it will show the chat automatically
  // This function is kept for future extensibility

  console.log('[content] Chat mounted');
}

/**
 * Deactivates the element selector and cleans up
 */
function deactivateSelector(): void {
  if (!state.isActive) {
    console.warn('[content] Selector not active');
    return;
  }

  console.log('[content] Deactivating element selector...');

  try {
    // Unmount React components
    if (state.cleanup) {
      state.cleanup();
      state.cleanup = null;
    }

    // Remove container
    if (state.containerElement) {
      removeContainer(state.containerElement);
      state.containerElement = null;
    }

    // Reset state
    state = {
      isActive: false,
      selectedElement: null,
      capturedCard: null,
      showFloatingChat: false,
      containerElement: null,
      cleanup: null,
    };

    console.log('[content] Element selector deactivated successfully');

  } catch (error) {
    console.error('[content] Error deactivating selector:', error);

    // Force cleanup
    state = {
      isActive: false,
      selectedElement: null,
      capturedCard: null,
      showFloatingChat: false,
      containerElement: null,
      cleanup: null,
    };
  }
}

// ============================================================================
// Inline Chat Functions
// ============================================================================

/**
 * Opens the inline chat window
 */
function openInlineChat(): void {
  // Toggle if already open
  if (inlineChatState.isOpen) {
    console.log('[content] Inline chat already open, toggling closed');
    closeInlineChat();
    return;
  }

  console.log('[content] Opening inline chat...');

  try {
    // Capture page context
    const pageContext = capturePageContext();
    console.log('[content] Page context captured:', pageContext.title);

    // Create container
    const container = document.createElement('div');
    container.id = 'nabokov-inline-chat-root';
    container.setAttribute('data-nabokov-chat', 'true');

    // Position for fixed elements (inline chat uses its own positioning)
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483646;
      pointer-events: none;
    `;

    document.body.appendChild(container);
    inlineChatState.containerElement = container;

    // Create shadow root
    const { shadowRoot, styleCache } = createShadowRoot(container, {
      injectBaseStyles: true,
    });

    // Handle save to canvas
    const handleSaveToCanvas = async (messages: Array<{ role: 'user' | 'assistant'; content: string }>) => {
      console.log('[content] Saving conversation to canvas...');

      try {
        // Format conversation as HTML
        const conversationHTML = messages.map((msg, i) => {
          const role = msg.role === 'user' ? 'You' : 'Assistant';
          return `<div style="margin: 12px 0;">
            <strong style="color: ${msg.role === 'user' ? '#8B0000' : '#FFD700'};">${role}:</strong>
            <p style="margin: 4px 0 0 0; white-space: pre-wrap;">${msg.content}</p>
          </div>`;
        }).join('\n');

        const card: Card = {
          id: generateId(),
          content: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            <h3 style="color: #8B0000; margin-bottom: 12px;">💬 Chat with ${pageContext.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 16px;">
              <strong>URL:</strong> ${pageContext.url}
            </p>
            ${conversationHTML}
          </div>`,
          metadata: {
            url: pageContext.url,
            title: `Chat: ${pageContext.title}`,
            domain: new URL(pageContext.url).hostname,
            clipDate: new Date().toISOString(),
            favicon: '',
          },
          starred: false,
          tags: ['chat', 'conversation'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          cardType: 'note',
        };

        await saveCard(card);
        console.log('[content] Conversation saved to canvas:', card.id);

        // Dispatch event to notify canvas
        window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));

        // Show success message (if you have a toast system)
        alert('Conversation saved to canvas!');
      } catch (error) {
        console.error('[content] Error saving conversation:', error);
        alert('Error saving conversation. Please try again.');
      }
    };

    // Handle close
    const handleClose = () => {
      console.log('[content] Inline chat closed');
      closeInlineChat();
    };

    // Mount InlineChatWindow
    const cleanup = mountReactInShadow(
      shadowRoot,
      <InlineChatWindow
        onClose={handleClose}
        initialContext={pageContext}
        onSaveToCanvas={handleSaveToCanvas}
      />,
      { styleCache }
    );

    // Update state
    inlineChatState.isOpen = true;
    inlineChatState.cleanup = cleanup;

    console.log('[content] Inline chat opened successfully');

  } catch (error) {
    console.error('[content] Error opening inline chat:', error);

    // Cleanup on error
    if (inlineChatState.containerElement) {
      if (inlineChatState.containerElement.parentNode) {
        inlineChatState.containerElement.parentNode.removeChild(inlineChatState.containerElement);
      }
      inlineChatState.containerElement = null;
    }
  }
}

/**
 * Closes the inline chat window
 */
function closeInlineChat(): void {
  if (!inlineChatState.isOpen) {
    console.warn('[content] Inline chat not open');
    return;
  }

  console.log('[content] Closing inline chat...');

  try {
    // Unmount React component
    if (inlineChatState.cleanup) {
      inlineChatState.cleanup();
      inlineChatState.cleanup = null;
    }

    // Remove container
    if (inlineChatState.containerElement && inlineChatState.containerElement.parentNode) {
      inlineChatState.containerElement.parentNode.removeChild(inlineChatState.containerElement);
      inlineChatState.containerElement = null;
    }

    // Reset state
    inlineChatState = {
      isOpen: false,
      containerElement: null,
      cleanup: null,
    };

    console.log('[content] Inline chat closed successfully');

  } catch (error) {
    console.error('[content] Error closing inline chat:', error);

    // Force cleanup
    inlineChatState = {
      isOpen: false,
      containerElement: null,
      cleanup: null,
    };
  }
}

// ============================================================================
// Message Handling
// ============================================================================

/**
 * Message types for extension communication
 */
type MessageType =
  | 'ACTIVATE_SELECTOR'
  | 'DEACTIVATE_SELECTOR'
  | 'GET_STATE'
  | 'PING'
  | 'OPEN_INLINE_CHAT'
  | 'CLOSE_INLINE_CHAT';

/**
 * Message structure
 */
interface Message {
  type: MessageType;
  payload?: any;
}

/**
 * Handles messages from background script
 *
 * @param message - The message object
 * @param sender - Message sender info
 * @param sendResponse - Function to send response
 * @returns True if response is async
 */
function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): boolean {
  console.log('[content] Received message:', message.type, 'Full message:', message);

  try {
    switch (message.type) {
      case 'ACTIVATE_SELECTOR':
        activateSelector(message.payload?.stashImmediately || (message as any).stashImmediately || false);
        sendResponse({ success: true });
        break;

      case 'DEACTIVATE_SELECTOR':
        deactivateSelector();
        sendResponse({ success: true });
        break;

      case 'OPEN_INLINE_CHAT':
        openInlineChat();
        sendResponse({ success: true });
        break;

      case 'CLOSE_INLINE_CHAT':
        closeInlineChat();
        sendResponse({ success: true });
        break;

      case 'GET_STATE':
        sendResponse({
          success: true,
          state: {
            isActive: state.isActive,
            hasCapture: state.capturedCard !== null,
            showingChat: state.showFloatingChat,
            inlineChatOpen: inlineChatState.isOpen,
          },
        });
        break;

      case 'PING':
        // Health check from background script
        sendResponse({ success: true, timestamp: Date.now() });
        break;

      default:
        console.warn('[content] Unknown message type:', (message as any).type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[content] Error handling message:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Return false for synchronous response
  return false;
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

/**
 * Handles keyboard shortcuts for the content script
 *
 * @param event - The keyboard event
 */
function handleKeyboardShortcut(event: KeyboardEvent): void {
  // ESC key - deactivate selector
  if (event.key === 'Escape' && state.isActive) {
    // Don't handle if ElementSelector is handling it
    // (ElementSelector has its own ESC handler)
    // This is a backup in case something goes wrong
    if (!state.showFloatingChat) {
      event.preventDefault();
      deactivateSelector();
    }
  }

  // Cmd+Shift+E (Mac) or Ctrl+Shift+E (Windows/Linux) - toggle selector
  // Note: This is also handled by background script via commands API
  // This is a backup handler
  const modifierKey = event.metaKey || event.ctrlKey;
  if (modifierKey && event.shiftKey && event.key === 'E') {
    event.preventDefault();

    if (state.isActive) {
      deactivateSelector();
    } else {
      activateSelector();
    }
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes the content script
 *
 * Sets up message listeners and keyboard shortcuts.
 */
function initialize(): void {
  console.log('[content] Initializing Nabokov Web Clipper content script...');
  console.log('[content] Adding message listener...');

  // Add message listener
  chrome.runtime.onMessage.addListener(handleMessage);

  console.log('[content] Message listener added');
  console.log('[content] Testing inline chat function exists:', typeof openInlineChat);

  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeyboardShortcut, true);

  // Send ready message to background
  chrome.runtime.sendMessage({
    type: 'CONTENT_SCRIPT_READY',
    payload: {
      url: window.location.href,
      timestamp: Date.now(),
    },
  }).catch((error) => {
    // Ignore errors if background script isn't ready yet
    console.debug('[content] Could not send ready message:', error);
  });

  console.log('[content] Content script initialized successfully');
}

// ============================================================================
// Cleanup on unload
// ============================================================================

/**
 * Cleanup function called when page unloads
 */
function cleanup(): void {
  console.log('[content] Cleaning up content script...');

  // Deactivate selector if active
  if (state.isActive) {
    deactivateSelector();
  }

  // Remove event listeners
  document.removeEventListener('keydown', handleKeyboardShortcut, true);

  console.log('[content] Content script cleaned up');
}

// Add cleanup listener
window.addEventListener('beforeunload', cleanup);

// ============================================================================
// Entry Point
// ============================================================================

// Initialize immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// ============================================================================
// Exports for testing
// ============================================================================

// Export functions for testing (these won't be available in production build)
if (process.env.NODE_ENV === 'development') {
  (window as any).__nabokobClipper__ = {
    activateSelector,
    deactivateSelector,
    getState: () => state,
    handleMessage,
  };
}

export { activateSelector, deactivateSelector };