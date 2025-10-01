/**
 * Window types for floating windows system
 */

import type { Message } from './card';

/**
 * Position of a floating window on the canvas
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * Size of a floating window
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Complete state for a floating window
 * Persisted to storage to survive minimize/maximize and page reloads
 */
export interface WindowState {
  cardId: string;
  position: WindowPosition;
  size: WindowSize;
  minimized: boolean;
  zIndex: number;

  // Chat-specific state
  chatInput: string;            // Current input value (preserved on minimize)
  conversationMessages: Message[]; // Full conversation history
  scrollPosition: number;       // Content scroll position
  isStreaming: boolean;         // Whether Claude is currently responding
}

/**
 * Minimal state saved to chrome.storage.local
 * Full conversation is saved in Card, not duplicated here
 */
export interface SerializedWindowState {
  cardId: string;
  position: WindowPosition;
  size: WindowSize;
  minimized: boolean;
  chatInput: string;
  scrollPosition: number;
}
