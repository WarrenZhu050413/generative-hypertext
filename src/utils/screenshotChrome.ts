/**
 * Chrome Extension Screenshot Utilities
 *
 * Uses chrome.tabs.captureVisibleTab() API to avoid canvas taint issues
 */

export class ScreenshotError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ScreenshotError';
  }
}

/**
 * Captures a screenshot of a specific element using Chrome's tab capture API
 *
 * This sends a message to the background script to capture the visible tab,
 * then crops it to the element's bounds.
 *
 * @param element - The element to screenshot
 * @returns Promise resolving to a data URL of the cropped screenshot
 */
export async function captureElementScreenshot(
  element: HTMLElement
): Promise<string> {
  // Validate element
  if (!element || !(element instanceof HTMLElement)) {
    throw new ScreenshotError('Invalid element provided', 'INVALID_ELEMENT');
  }

  // Get element bounds
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    throw new ScreenshotError('Element has no dimensions', 'ZERO_DIMENSIONS');
  }

  try {
    // Request screenshot from background script
    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_SCREENSHOT',
      payload: {
        bounds: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      }
    });

    if (!response.success) {
      throw new ScreenshotError(
        response.error || 'Failed to capture screenshot',
        'CAPTURE_FAILED'
      );
    }

    // Crop the screenshot to element bounds
    const croppedDataUrl = await cropScreenshot(
      response.dataUrl,
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );

    return croppedDataUrl;
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
 * Crops a screenshot data URL to specific bounds
 *
 * @param dataUrl - The full screenshot data URL
 * @param x - X coordinate to crop from
 * @param y - Y coordinate to crop from
 * @param width - Width of crop area
 * @param height - Height of crop area
 * @returns Promise resolving to cropped data URL
 */
async function cropScreenshot(
  dataUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Create canvas for cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new ScreenshotError('Failed to get canvas context', 'CANVAS_ERROR'));
          return;
        }

        // Account for device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Scale context
        ctx.scale(dpr, dpr);

        // Draw cropped portion
        ctx.drawImage(
          img,
          x * dpr, y * dpr, width * dpr, height * dpr,  // Source rectangle
          0, 0, width, height  // Destination rectangle
        );

        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(new ScreenshotError(
          `Failed to crop screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'CROP_FAILED'
        ));
      }
    };

    img.onerror = () => {
      reject(new ScreenshotError('Failed to load screenshot image', 'IMAGE_LOAD_ERROR'));
    };

    img.src = dataUrl;
  });
}