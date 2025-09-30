/**
 * Screenshot Utilities for Nabokov Web Clipper
 *
 * Provides functionality for capturing, compressing, and managing screenshots
 * of DOM elements for the web clipper extension.
 */

/**
 * Options for screenshot compression
 */
export interface CompressionOptions {
  /** Image quality (0-1), defaults to 0.8 */
  quality?: number;
  /** Maximum width in pixels, defaults to 800 */
  maxWidth?: number;
  /** Image format ('image/jpeg' or 'image/png'), defaults to 'image/jpeg' */
  format?: 'image/jpeg' | 'image/png';
  /** Whether to maintain aspect ratio, defaults to true */
  maintainAspectRatio?: boolean;
}

/**
 * Metadata about screenshot compression
 */
export interface CompressionMetadata {
  /** Original size in bytes */
  originalSize: number;
  /** Compressed size in bytes */
  compressedSize: number;
  /** Compression ratio (0-1, where 0.5 means 50% reduction) */
  compressionRatio: number;
  /** Original dimensions */
  originalDimensions: { width: number; height: number };
  /** Compressed dimensions */
  compressedDimensions: { width: number; height: number };
  /** Format used for compression */
  format: string;
  /** Quality setting used */
  quality: number;
}

/**
 * Result of screenshot compression
 */
export interface CompressionResult {
  /** Compressed image as data URL */
  dataUrl: string;
  /** Metadata about the compression */
  metadata: CompressionMetadata;
}

/**
 * Dimensions of an image
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Error types for screenshot operations
 */
export class ScreenshotError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ScreenshotError';
  }
}

/**
 * Captures a screenshot of a specific DOM element using native Canvas API.
 *
 * This function clones the element and renders it to a canvas, handling
 * various edge cases like CSS transforms, viewport positioning, and styling.
 *
 * @param element - The HTML element to capture
 * @returns Promise resolving to a data URL of the screenshot
 * @throws {ScreenshotError} If element is invalid or capture fails
 *
 * @example
 * ```typescript
 * const element = document.getElementById('content');
 * const screenshot = await captureElementScreenshot(element);
 * console.log(screenshot); // "data:image/png;base64,..."
 * ```
 */
export async function captureElementScreenshot(
  element: HTMLElement
): Promise<string> {
  // Validate element
  if (!element || !(element instanceof HTMLElement)) {
    throw new ScreenshotError(
      'Invalid element provided',
      'INVALID_ELEMENT'
    );
  }

  // Check if element is in viewport or can be accessed
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    throw new ScreenshotError(
      'Element has no dimensions',
      'ZERO_DIMENSIONS'
    );
  }

  try {
    // Get computed styles to preserve appearance
    const computedStyle = window.getComputedStyle(element);

    // Create canvas with appropriate dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      throw new ScreenshotError(
        'Failed to get canvas context',
        'CANVAS_CONTEXT_ERROR'
      );
    }

    // Handle device pixel ratio for sharp images
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);

    // Set background color if element has one
    const bgColor = computedStyle.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Use foreignObject approach for better rendering
    const data = await renderElementToCanvas(element, canvas, ctx, width, height);

    return data;
  } catch (error) {
    if (error instanceof ScreenshotError) {
      throw error;
    }
    throw new ScreenshotError(
      `Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CAPTURE_FAILED'
    );
  }
}

/**
 * Renders an element to canvas using SVG foreignObject technique
 * This handles CSS transforms, shadow DOM, and complex layouts better than direct rendering
 *
 * @internal
 */
async function renderElementToCanvas(
  element: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<string> {
  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Get all computed styles and apply them inline to preserve appearance
  const styles = window.getComputedStyle(element);
  const styleText = Array.from(styles)
    .map(key => `${key}:${styles.getPropertyValue(key)}`)
    .join(';');

  clonedElement.setAttribute('style', styleText);

  // Handle cross-origin images by converting them to data URLs
  await handleCrossOriginImages(clonedElement);

  // Create SVG with foreignObject containing the cloned element
  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${clonedElement.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  // Create blob and load as image
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        } catch (err) {
          reject(new ScreenshotError(
            'Failed to draw image to canvas',
            'DRAW_ERROR'
          ));
        }
      };

      img.onerror = () => {
        reject(new ScreenshotError(
          'Failed to load element as image',
          'IMAGE_LOAD_ERROR'
        ));
      };

      img.src = url;
    });

    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Handles cross-origin images by attempting to convert them to data URLs
 * Falls back to keeping original src if conversion fails
 *
 * @internal
 */
async function handleCrossOriginImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img');

  const promises = Array.from(images).map(async (img) => {
    if (img.src && !img.src.startsWith('data:')) {
      try {
        const dataUrl = await convertImageToDataUrl(img.src);
        img.src = dataUrl;
      } catch {
        // Silently fail and keep original src
        // This will work for same-origin images
      }
    }
  });

  await Promise.allSettled(promises);
}

/**
 * Converts an image URL to a data URL
 *
 * @internal
 */
async function convertImageToDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * Compresses a screenshot by converting to JPEG and resizing.
 *
 * Reduces file size while maintaining acceptable quality for web clipping.
 * Useful for storing screenshots efficiently in IndexedDB or transmitting over network.
 *
 * @param dataUrl - The data URL of the screenshot to compress
 * @param options - Compression options (quality, maxWidth, format)
 * @returns Promise resolving to compressed data URL and metadata
 * @throws {ScreenshotError} If compression fails or data URL is invalid
 *
 * @example
 * ```typescript
 * const screenshot = await captureElementScreenshot(element);
 * const result = await compressScreenshot(screenshot, {
 *   quality: 0.8,
 *   maxWidth: 800
 * });
 *
 * console.log(`Reduced size by ${result.metadata.compressionRatio * 100}%`);
 * console.log(`New dimensions: ${result.metadata.compressedDimensions.width}x${result.metadata.compressedDimensions.height}`);
 * ```
 */
export async function compressScreenshot(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  // Set defaults
  const {
    quality = 0.8,
    maxWidth = 800,
    format = 'image/jpeg',
    maintainAspectRatio = true,
  } = options;

  // Validate inputs
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    throw new ScreenshotError(
      'Invalid data URL provided',
      'INVALID_DATA_URL'
    );
  }

  if (quality < 0 || quality > 1) {
    throw new ScreenshotError(
      'Quality must be between 0 and 1',
      'INVALID_QUALITY'
    );
  }

  if (maxWidth <= 0) {
    throw new ScreenshotError(
      'Max width must be positive',
      'INVALID_MAX_WIDTH'
    );
  }

  try {
    // Calculate original size
    const originalSize = getDataUrlSize(dataUrl);
    const originalDimensions = await getScreenshotDimensions(dataUrl);

    // Create image from data URL
    const img = await loadImage(dataUrl);

    // Calculate new dimensions
    let newWidth = originalDimensions.width;
    let newHeight = originalDimensions.height;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      if (maintainAspectRatio) {
        newHeight = Math.round((originalDimensions.height * maxWidth) / originalDimensions.width);
      }
    }

    // Create canvas for compression
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new ScreenshotError(
        'Failed to get canvas context',
        'CANVAS_CONTEXT_ERROR'
      );
    }

    // For JPEG, fill white background (JPEG doesn't support transparency)
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, newWidth, newHeight);
    }

    // Draw image with new dimensions
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Convert to compressed format
    const compressedDataUrl = canvas.toDataURL(format, quality);
    const compressedSize = getDataUrlSize(compressedDataUrl);

    // Calculate compression ratio
    const compressionRatio = originalSize > 0
      ? (originalSize - compressedSize) / originalSize
      : 0;

    return {
      dataUrl: compressedDataUrl,
      metadata: {
        originalSize,
        compressedSize,
        compressionRatio,
        originalDimensions,
        compressedDimensions: { width: newWidth, height: newHeight },
        format,
        quality,
      },
    };
  } catch (error) {
    if (error instanceof ScreenshotError) {
      throw error;
    }
    throw new ScreenshotError(
      `Failed to compress screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'COMPRESSION_FAILED'
    );
  }
}

/**
 * Extracts dimensions from a data URL by loading it as an image.
 *
 * @param dataUrl - The data URL to extract dimensions from
 * @returns Promise resolving to width and height
 * @throws {ScreenshotError} If data URL is invalid or image fails to load
 *
 * @example
 * ```typescript
 * const dimensions = await getScreenshotDimensions(screenshot);
 * console.log(`Image is ${dimensions.width}x${dimensions.height}`);
 * ```
 */
export async function getScreenshotDimensions(
  dataUrl: string
): Promise<ImageDimensions> {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    throw new ScreenshotError(
      'Invalid data URL provided',
      'INVALID_DATA_URL'
    );
  }

  try {
    const img = await loadImage(dataUrl);
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    };
  } catch (error) {
    throw new ScreenshotError(
      `Failed to get dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DIMENSIONS_ERROR'
    );
  }
}

/**
 * Loads an image from a data URL
 *
 * @internal
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new ScreenshotError(
      'Failed to load image from data URL',
      'IMAGE_LOAD_ERROR'
    ));

    img.src = dataUrl;
  });
}

/**
 * Calculates the size of a data URL in bytes
 *
 * Data URLs are base64 encoded, so we need to account for the encoding overhead.
 * Base64 encoding increases size by ~33%, so we calculate the actual byte size.
 *
 * @internal
 */
function getDataUrlSize(dataUrl: string): number {
  // Remove data URL prefix to get just the base64 data
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;

  // Calculate size accounting for base64 encoding
  // Each base64 character represents 6 bits
  // Padding characters (=) don't count toward data
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Validates if a string is a valid data URL
 *
 * @param dataUrl - The string to validate
 * @returns True if valid data URL, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidDataUrl(screenshot)) {
 *   await compressScreenshot(screenshot);
 * }
 * ```
 */
export function isValidDataUrl(dataUrl: string): boolean {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return false;
  }

  const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  return dataUrlPattern.test(dataUrl);
}

/**
 * Converts a data URL to a Blob
 * Useful for uploading or storing screenshots
 *
 * @param dataUrl - The data URL to convert
 * @returns Blob object
 * @throws {ScreenshotError} If conversion fails
 *
 * @example
 * ```typescript
 * const blob = dataUrlToBlob(screenshot);
 * const formData = new FormData();
 * formData.append('screenshot', blob, 'screenshot.jpg');
 * ```
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  if (!isValidDataUrl(dataUrl)) {
    throw new ScreenshotError(
      'Invalid data URL provided',
      'INVALID_DATA_URL'
    );
  }

  try {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = header?.match(/:(.*?);/);
    const mime = mimeMatch?.[1] || 'image/png';

    const binary = atob(data || '');
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
  } catch (error) {
    throw new ScreenshotError(
      'Failed to convert data URL to Blob',
      'BLOB_CONVERSION_ERROR'
    );
  }
}

/**
 * Converts a Blob to a data URL
 *
 * @param blob - The Blob to convert
 * @returns Promise resolving to data URL
 *
 * @example
 * ```typescript
 * const blob = await fetch(imageUrl).then(r => r.blob());
 * const dataUrl = await blobToDataUrl(blob);
 * ```
 */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new ScreenshotError(
          'Failed to read blob as data URL',
          'BLOB_READ_ERROR'
        ));
      }
    };
    reader.onerror = () => reject(new ScreenshotError(
      'Failed to read blob',
      'BLOB_READ_ERROR'
    ));
    reader.readAsDataURL(blob);
  });
}

/**
 * Batch compress multiple screenshots with progress tracking
 *
 * @param dataUrls - Array of data URLs to compress
 * @param options - Compression options
 * @param onProgress - Optional callback for progress updates (0-1)
 * @returns Promise resolving to array of compression results
 *
 * @example
 * ```typescript
 * const screenshots = [screenshot1, screenshot2, screenshot3];
 * const results = await batchCompressScreenshots(
 *   screenshots,
 *   { quality: 0.8 },
 *   (progress) => console.log(`${progress * 100}% complete`)
 * );
 * ```
 */
export async function batchCompressScreenshots(
  dataUrls: string[],
  options: CompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const total = dataUrls.length;

  for (let i = 0; i < total; i++) {
    const result = await compressScreenshot(dataUrls[i]!, options);
    results.push(result);

    if (onProgress) {
      onProgress((i + 1) / total);
    }
  }

  return results;
}

/**
 * Estimates the storage space required for a screenshot
 *
 * @param dataUrl - The data URL to estimate
 * @returns Object with size in bytes and human-readable format
 *
 * @example
 * ```typescript
 * const estimate = estimateStorageSize(screenshot);
 * console.log(`Screenshot will use ${estimate.humanReadable}`);
 * ```
 */
export function estimateStorageSize(dataUrl: string): {
  bytes: number;
  humanReadable: string;
} {
  const bytes = getDataUrlSize(dataUrl);
  const humanReadable = formatBytes(bytes);

  return { bytes, humanReadable };
}

/**
 * Formats bytes to human-readable string
 *
 * @internal
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}