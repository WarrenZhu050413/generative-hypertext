/**
 * Card types for Nabokov Web Clipper
 * This is the single source of truth for all Card-related types.
 */

/**
 * Message in a conversation thread
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  streaming?: boolean;
  parentId?: string;
}

/**
 * Chat context for maintaining conversation state
 */
export interface ChatContext {
  cardId: string;
  messages: Message[];
  isStreaming: boolean;
  currentInput: string;
  parentMessageId?: string;
}

/**
 * Metadata about the source page where content was clipped
 */
export interface ClipMetadata {
  url: string;
  title: string;
  domain: string;
  favicon?: string;
  timestamp: number;
  selectedText?: string;
  // Element capture fields (optional for backward compatibility)
  tagName?: string;
  selector?: string;
  textContent?: string;
  dimensions?: { width: number; height: number };
}

/**
 * Position of a card on the canvas
 */
export interface CardPosition {
  x: number;
  y: number;
}

/**
 * Size of a card on the canvas
 */
export interface CardSize {
  width: number;
  height: number;
}

/**
 * AI Beautification mode for card content
 */
export type BeautificationMode = 'recreate-design' | 'organize-content';

/**
 * Main card data structure for the canvas view
 * This is the primary Card type used throughout the application
 */
export interface Card {
  id: string;
  content?: string; // HTML content (sanitized) - optional for image-only cards
  metadata: ClipMetadata;
  position?: CardPosition;
  size?: CardSize;
  starred: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  conversation?: Message[]; // Conversation history with Claude
  // Additional fields for element rendering
  screenshotId?: string; // Reference to screenshot in IndexedDB
  styles?: import('../types').RelevantStyles; // Computed styles for rendering
  context?: string; // Parent element context (HTML snippet)
  // Card type and relationships
  cardType?: 'clipped' | 'generated' | 'note' | 'image'; // Type of card
  parentCardId?: string; // Reference to parent card (for generated cards)
  generationContext?: {
    sourceMessageId: string;
    userPrompt: string;
    timestamp: number;
  };
  // Image upload fields
  imageData?: string; // Base64-encoded image data for drag-dropped images
  imageMimeType?: string; // MIME type of image (e.g., 'image/png', 'image/jpeg')
  // UI state
  collapsed?: boolean; // Whether card is collapsed to minimal height
  // AI Beautification fields
  originalHTML?: string; // Original HTML before beautification
  beautifiedContent?: string; // LLM-beautified HTML content
  beautificationMode?: BeautificationMode; // Which beautification mode was used
  beautificationTimestamp?: number; // When beautification was applied
}

/**
 * State of the canvas including all cards and viewport position
 */
export interface CanvasState {
  cards: Card[];
  viewportPosition: { x: number; y: number; zoom: number };
}

/**
 * Storage statistics for monitoring storage usage
 */
export interface StorageStats {
  totalCards: number;
  bytesUsed: number;
  quotaBytes: number;
}