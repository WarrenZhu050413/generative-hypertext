/**
 * Shared chat types
 * Used across all chat contexts (Floating Windows, Inline Chat, Side Panel)
 */

/**
 * Image attachment in a message
 */
export interface ImageAttachment {
  /** Data URL (data:image/png;base64,...) */
  dataURL: string;
  /** Original image width */
  width: number;
  /** Original image height */
  height: number;
}

/**
 * Chat message
 */
export interface Message {
  /** Unique message ID */
  id: string;
  /** Message role */
  role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** Message timestamp */
  timestamp: number;
  /** Whether message is currently streaming */
  streaming?: boolean;
  /** Attached images (optional) */
  images?: ImageAttachment[];
}
