/**
 * Storage Utilities
 *
 * Barrel export file for storage utilities.
 * Provides centralized access to both chrome.storage.local and IndexedDB utilities.
 *
 * Usage:
 * ```typescript
 * import { saveCard, getCard, saveScreenshot, getScreenshot } from './utils';
 * ```
 */

// Chrome Storage utilities
export {
  // Types
  type Card,
  // Core CRUD operations
  saveCard,
  getCard,
  getAllCards,
  deleteCard,
  updateCard,
  // Quota management
  getStorageQuota,
  // Bulk operations
  clearAllCards,
  exportCards,
  importCards,
} from './chromeStorage';

// IndexedDB utilities
export {
  // Types
  type Screenshot,
  // Core operations
  saveScreenshot,
  getScreenshot,
  deleteScreenshot,
  getAllScreenshots,
  // Statistics and management
  getStorageStats,
  clearAllScreenshots,
  deleteDatabase,
  isIndexedDBSupported,
} from './indexedDB';