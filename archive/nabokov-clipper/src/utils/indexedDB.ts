/**
 * IndexedDB Utilities
 *
 * Manages screenshot storage in IndexedDB with automatic compression and error handling.
 * Screenshots are stored separately from card metadata to avoid chrome.storage.local quota limits.
 *
 * Database Structure:
 * - Database name: 'nabokov-screenshots'
 * - Version: 1
 * - Store: 'screenshots' with keyPath 'id'
 *
 * Compression:
 * - Format: JPEG at 80% quality
 * - Max width: 800px (maintains aspect ratio)
 * - Reduces storage requirements significantly
 */

/**
 * Screenshot data structure stored in IndexedDB
 */
export interface Screenshot {
  id: string; // Unique identifier (matches Card.screenshotId)
  dataUrl: string; // Compressed JPEG data URL
  originalWidth: number; // Original image width before compression
  originalHeight: number; // Original image height before compression
  compressedWidth: number; // Final image width after compression
  compressedHeight: number; // Final image height after compression
  originalSize: number; // Original size in bytes
  compressedSize: number; // Compressed size in bytes
  createdAt: number; // Unix timestamp
}

/**
 * Result type for IndexedDB operations
 */
type DBResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Database configuration constants
 */
const DB_NAME = 'nabokov-screenshots';
const DB_VERSION = 1;
const STORE_NAME = 'screenshots';

/**
 * Compression settings
 */
const COMPRESSION_CONFIG = {
  FORMAT: 'image/jpeg' as const,
  QUALITY: 0.8, // 80% quality
  MAX_WIDTH: 800, // Maximum width in pixels
};

/**
 * Opens or creates the IndexedDB database
 *
 * @returns Promise resolving to IDBDatabase instance
 * @throws Error if database cannot be opened
 *
 * @internal
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (first time or version change)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create screenshots object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

        // Create indexes for efficient querying
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        objectStore.createIndex('compressedSize', 'compressedSize', { unique: false });

        console.log(`[IndexedDB] Created object store: ${STORE_NAME}`);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onblocked = () => {
      reject(new Error('Database open blocked. Please close other tabs using this extension.'));
    };
  });
}

/**
 * Compresses an image data URL to JPEG format with specified quality and max width
 *
 * @param dataUrl - Original image data URL (can be PNG, JPEG, etc.)
 * @returns Promise resolving to compressed image data URL and dimensions
 *
 * @internal
 */
async function compressImage(dataUrl: string): Promise<{
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
  originalSize: number;
  compressedSize: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > COMPRESSION_CONFIG.MAX_WIDTH) {
        height = (height * COMPRESSION_CONFIG.MAX_WIDTH) / width;
        width = COMPRESSION_CONFIG.MAX_WIDTH;
      }

      // Create canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL(
        COMPRESSION_CONFIG.FORMAT,
        COMPRESSION_CONFIG.QUALITY
      );

      // Calculate sizes (approximate from base64)
      const originalSize = Math.ceil((dataUrl.length * 3) / 4);
      const compressedSize = Math.ceil((compressedDataUrl.length * 3) / 4);

      resolve({
        dataUrl: compressedDataUrl,
        originalWidth: img.width,
        originalHeight: img.height,
        compressedWidth: Math.round(width),
        compressedHeight: Math.round(height),
        originalSize,
        compressedSize,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = dataUrl;
  });
}

/**
 * Saves a screenshot to IndexedDB with automatic compression
 *
 * @param id - Unique identifier for the screenshot (should match Card.screenshotId)
 * @param dataUrl - Original screenshot data URL
 * @returns Promise resolving to saved screenshot metadata
 *
 * @example
 * const result = await saveScreenshot('screenshot-123', screenshotDataUrl);
 * if (result.success) {
 *   console.log(`Saved screenshot: ${result.data.compressedWidth}x${result.data.compressedHeight}`);
 *   console.log(`Compression: ${result.data.originalSize} -> ${result.data.compressedSize} bytes`);
 * }
 */
export async function saveScreenshot(
  id: string,
  dataUrl: string
): Promise<DBResult<Screenshot>> {
  try {
    // Compress image
    const compressed = await compressImage(dataUrl);

    // Prepare screenshot object
    const screenshot: Screenshot = {
      id,
      dataUrl: compressed.dataUrl,
      originalWidth: compressed.originalWidth,
      originalHeight: compressed.originalHeight,
      compressedWidth: compressed.compressedWidth,
      compressedHeight: compressed.compressedHeight,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      createdAt: Date.now(),
    };

    // Open database
    const db = await openDatabase();

    // Save to database
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(screenshot);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to save screenshot: ${request.error?.message}`));
    });

    db.close();

    console.log(
      `[IndexedDB] Saved screenshot ${id}: ` +
      `${compressed.compressedWidth}x${compressed.compressedHeight}, ` +
      `${(compressed.compressedSize / 1024).toFixed(1)}KB ` +
      `(${((1 - compressed.compressedSize / compressed.originalSize) * 100).toFixed(0)}% reduction)`
    );

    return {
      success: true,
      data: screenshot,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error saving screenshot',
    };
  }
}

/**
 * Retrieves a screenshot from IndexedDB by ID
 *
 * @param id - The ID of the screenshot to retrieve
 * @returns Promise resolving to the screenshot or error
 *
 * @example
 * const result = await getScreenshot('screenshot-123');
 * if (result.success) {
 *   const img = document.createElement('img');
 *   img.src = result.data.dataUrl;
 *   document.body.appendChild(img);
 * }
 */
export async function getScreenshot(id: string): Promise<DBResult<Screenshot>> {
  try {
    const db = await openDatabase();

    const screenshot = await new Promise<Screenshot | undefined>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get screenshot: ${request.error?.message}`));
    });

    db.close();

    if (!screenshot) {
      return {
        success: false,
        error: `Screenshot with id ${id} not found`,
      };
    }

    return {
      success: true,
      data: screenshot,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error retrieving screenshot',
    };
  }
}

/**
 * Deletes a screenshot from IndexedDB
 *
 * @param id - The ID of the screenshot to delete
 * @returns Promise resolving to success/error result
 *
 * @example
 * const result = await deleteScreenshot('screenshot-123');
 * if (result.success) {
 *   console.log('Screenshot deleted successfully');
 * }
 */
export async function deleteScreenshot(id: string): Promise<DBResult<void>> {
  try {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete screenshot: ${request.error?.message}`));
    });

    db.close();

    console.log(`[IndexedDB] Deleted screenshot ${id}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting screenshot',
    };
  }
}

/**
 * Retrieves all screenshots from IndexedDB
 *
 * @returns Promise resolving to array of all screenshots
 *
 * @example
 * const result = await getAllScreenshots();
 * if (result.success) {
 *   console.log(`Found ${result.data.length} screenshots`);
 *   const totalSize = result.data.reduce((sum, s) => sum + s.compressedSize, 0);
 *   console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
 * }
 */
export async function getAllScreenshots(): Promise<DBResult<Screenshot[]>> {
  try {
    const db = await openDatabase();

    const screenshots = await new Promise<Screenshot[]>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error(`Failed to get screenshots: ${request.error?.message}`));
    });

    db.close();

    return {
      success: true,
      data: screenshots,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error retrieving screenshots',
    };
  }
}

/**
 * Gets storage statistics for IndexedDB
 *
 * @returns Promise resolving to storage statistics
 *
 * @example
 * const result = await getStorageStats();
 * if (result.success) {
 *   console.log(`Screenshots: ${result.data.count}`);
 *   console.log(`Total size: ${(result.data.totalSize / 1024 / 1024).toFixed(2)}MB`);
 *   console.log(`Average size: ${(result.data.averageSize / 1024).toFixed(1)}KB`);
 * }
 */
export async function getStorageStats(): Promise<DBResult<{
  count: number;
  totalSize: number;
  averageSize: number;
  totalOriginalSize: number;
  compressionRatio: number;
}>> {
  try {
    const result = await getAllScreenshots();
    if (!result.success) {
      return result;
    }

    const screenshots = result.data;
    const count = screenshots.length;

    if (count === 0) {
      return {
        success: true,
        data: {
          count: 0,
          totalSize: 0,
          averageSize: 0,
          totalOriginalSize: 0,
          compressionRatio: 0,
        },
      };
    }

    const totalSize = screenshots.reduce((sum, s) => sum + s.compressedSize, 0);
    const totalOriginalSize = screenshots.reduce((sum, s) => sum + s.originalSize, 0);
    const averageSize = totalSize / count;
    const compressionRatio = totalOriginalSize > 0 ? totalSize / totalOriginalSize : 0;

    return {
      success: true,
      data: {
        count,
        totalSize,
        averageSize,
        totalOriginalSize,
        compressionRatio,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting storage stats',
    };
  }
}

/**
 * Clears all screenshots from IndexedDB (use with caution)
 *
 * @returns Promise resolving to number of screenshots deleted
 *
 * @example
 * const result = await clearAllScreenshots();
 * if (result.success) {
 *   console.log(`Deleted ${result.data} screenshots`);
 * }
 */
export async function clearAllScreenshots(): Promise<DBResult<number>> {
  try {
    const db = await openDatabase();

    // Get count before clearing
    const countRequest = await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to count screenshots: ${request.error?.message}`));
    });

    // Clear all screenshots
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to clear screenshots: ${request.error?.message}`));
    });

    db.close();

    console.log(`[IndexedDB] Cleared all screenshots (${countRequest} deleted)`);

    return {
      success: true,
      data: countRequest,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error clearing screenshots',
    };
  }
}

/**
 * Deletes the entire IndexedDB database (use with extreme caution)
 *
 * This will remove all screenshots permanently. Typically used for:
 * - Extension uninstallation cleanup
 * - Complete data reset
 * - Troubleshooting database corruption
 *
 * @returns Promise resolving to success/error result
 *
 * @example
 * const result = await deleteDatabase();
 * if (result.success) {
 *   console.log('Database deleted successfully');
 * }
 */
export async function deleteDatabase(): Promise<DBResult<void>> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      console.log(`[IndexedDB] Database ${DB_NAME} deleted`);
      resolve({
        success: true,
        data: undefined,
      });
    };

    request.onerror = () => {
      resolve({
        success: false,
        error: `Failed to delete database: ${request.error?.message}`,
      });
    };

    request.onblocked = () => {
      resolve({
        success: false,
        error: 'Database deletion blocked. Please close all tabs using this extension.',
      });
    };
  });
}

/**
 * Checks if IndexedDB is supported in the current environment
 *
 * @returns true if IndexedDB is supported, false otherwise
 *
 * @example
 * if (!isIndexedDBSupported()) {
 *   console.error('IndexedDB not supported in this browser');
 * }
 */
export function isIndexedDBSupported(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}