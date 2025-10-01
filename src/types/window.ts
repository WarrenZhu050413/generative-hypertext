/**
 * Window types for floating window system
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
 * Persists across minimize/maximize and page reloads
 */
export interface WindowState {
  id: string;
  cardId: string;
  position: WindowPosition;
  size: WindowSize;
  isMinimized: boolean;
  zIndex: number;

  // Chat state
  chatInput: string;
  conversationMessages: Message[];
  scrollPosition: number;
  isStreaming: boolean;

  // Form data for any inputs within window content
  formData?: Record<string, string>;

  // Metadata
  createdAt: number;
  lastInteractedAt: number;
}

/**
 * Props for the FloatingWindow component
 */
export interface FloatingWindowProps {
  windowState: WindowState;
  onMinimize: (windowId: string) => void;
  onMaximize: (windowId: string) => void;
  onClose: (windowId: string) => void;
  onBringToFront: (windowId: string) => void;
  onUpdateState: (windowId: string, updates: Partial<WindowState>) => void;
}

/**
 * Props for the FloatingWindowChat component
 */
export interface FloatingWindowChatProps {
  cardId: string;
  cardContent: string;
  messages: Message[];
  currentInput: string;
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
  onInputChange: (value: string) => void;
  onStopStreaming: () => void;
  onClearChat: () => void;
}
