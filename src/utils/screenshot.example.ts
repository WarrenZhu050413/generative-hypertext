/**
 * Example usage of screenshot utilities
 *
 * This file demonstrates how to use the screenshot capture and compression
 * utilities in the Nabokov Web Clipper extension.
 */

import {
  captureElementScreenshot,
  compressScreenshot,
  getScreenshotDimensions,
  batchCompressScreenshots,
  estimateStorageSize,
  dataUrlToBlob,
  isValidDataUrl,
  type CompressionOptions,
  type CompressionResult,
} from './screenshot';

/**
 * Example 1: Basic screenshot capture and compression
 */
async function basicScreenshotExample() {
  // Get element to capture
  const element = document.getElementById('content');
  if (!element) return;

  try {
    // Capture screenshot
    console.log('Capturing screenshot...');
    const screenshot = await captureElementScreenshot(element);

    // Check dimensions
    const dimensions = await getScreenshotDimensions(screenshot);
    console.log(`Original dimensions: ${dimensions.width}x${dimensions.height}`);

    // Estimate storage size
    const estimate = estimateStorageSize(screenshot);
    console.log(`Original size: ${estimate.humanReadable}`);

    // Compress screenshot
    console.log('Compressing screenshot...');
    const result = await compressScreenshot(screenshot);

    console.log('Compression results:');
    console.log(`- Original: ${result.metadata.originalSize} bytes`);
    console.log(`- Compressed: ${result.metadata.compressedSize} bytes`);
    console.log(`- Saved: ${(result.metadata.compressionRatio * 100).toFixed(1)}%`);
    console.log(`- New dimensions: ${result.metadata.compressedDimensions.width}x${result.metadata.compressedDimensions.height}`);

    // Use compressed screenshot
    return result.dataUrl;
  } catch (error) {
    console.error('Screenshot failed:', error);
    throw error;
  }
}

/**
 * Example 2: Custom compression settings
 */
async function customCompressionExample() {
  const element = document.querySelector('.article-content') as HTMLElement;
  if (!element) return;

  const screenshot = await captureElementScreenshot(element);

  // High quality compression (less size reduction)
  const highQuality = await compressScreenshot(screenshot, {
    quality: 0.95,
    maxWidth: 1200,
    format: 'image/jpeg',
  });

  // Low quality compression (more size reduction)
  const lowQuality = await compressScreenshot(screenshot, {
    quality: 0.6,
    maxWidth: 600,
    format: 'image/jpeg',
  });

  console.log('High quality:', estimateStorageSize(highQuality.dataUrl).humanReadable);
  console.log('Low quality:', estimateStorageSize(lowQuality.dataUrl).humanReadable);

  return { highQuality, lowQuality };
}

/**
 * Example 3: Batch processing multiple elements
 */
async function batchScreenshotExample() {
  const elements = document.querySelectorAll('.card');
  const screenshots: string[] = [];

  // Capture all screenshots
  for (const element of elements) {
    try {
      const screenshot = await captureElementScreenshot(element as HTMLElement);
      screenshots.push(screenshot);
    } catch (error) {
      console.warn('Failed to capture element:', error);
    }
  }

  // Batch compress with progress tracking
  console.log(`Compressing ${screenshots.length} screenshots...`);

  const results = await batchCompressScreenshots(
    screenshots,
    {
      quality: 0.8,
      maxWidth: 800,
    },
    (progress) => {
      console.log(`Progress: ${(progress * 100).toFixed(0)}%`);
    }
  );

  // Calculate total savings
  const totalOriginal = results.reduce((sum, r) => sum + r.metadata.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.metadata.compressedSize, 0);
  const totalSavings = ((totalOriginal - totalCompressed) / totalOriginal) * 100;

  console.log(`Total savings: ${totalSavings.toFixed(1)}% (${totalOriginal} → ${totalCompressed} bytes)`);

  return results;
}

/**
 * Example 4: Screenshot for web clipper clip creation
 */
async function createClipWithScreenshot() {
  const element = document.querySelector('article') as HTMLElement;
  if (!element) throw new Error('No article found');

  // Capture and compress
  const screenshot = await captureElementScreenshot(element);
  const compressed = await compressScreenshot(screenshot, {
    quality: 0.85,
    maxWidth: 800,
  });

  // Create clip data structure
  const clip = {
    id: crypto.randomUUID(),
    title: document.title,
    url: window.location.href,
    timestamp: Date.now(),
    screenshot: compressed.dataUrl,
    screenshotMetadata: {
      dimensions: compressed.metadata.compressedDimensions,
      size: compressed.metadata.compressedSize,
      compressionRatio: compressed.metadata.compressionRatio,
    },
    content: {
      text: element.textContent || '',
      html: element.innerHTML,
    },
  };

  console.log('Clip created:', clip.id);
  console.log(`Screenshot: ${estimateStorageSize(clip.screenshot).humanReadable}`);

  return clip;
}

/**
 * Example 5: Error handling
 */
async function robustScreenshotCapture(element: HTMLElement) {
  try {
    // Validate data URL before using
    const screenshot = await captureElementScreenshot(element);

    if (!isValidDataUrl(screenshot)) {
      throw new Error('Invalid screenshot data URL');
    }

    // Try compression
    try {
      const compressed = await compressScreenshot(screenshot, {
        quality: 0.8,
        maxWidth: 800,
      });
      return compressed.dataUrl;
    } catch (compressionError) {
      console.warn('Compression failed, using original:', compressionError);
      return screenshot; // Fallback to original
    }
  } catch (error) {
    console.error('Screenshot capture failed:', error);

    // Could implement fallback strategies here:
    // 1. Try capturing a smaller region
    // 2. Use a placeholder image
    // 3. Skip screenshot entirely

    return null;
  }
}

/**
 * Example 6: Converting to Blob for storage or upload
 */
async function uploadScreenshot(element: HTMLElement) {
  const screenshot = await captureElementScreenshot(element);
  const compressed = await compressScreenshot(screenshot);

  // Convert to Blob for upload
  const blob = dataUrlToBlob(compressed.dataUrl);

  // Upload using FormData
  const formData = new FormData();
  formData.append('screenshot', blob, 'screenshot.jpg');
  formData.append('metadata', JSON.stringify(compressed.metadata));

  // Example upload (would need actual endpoint)
  /*
  const response = await fetch('/api/screenshots', {
    method: 'POST',
    body: formData,
  });
  */

  console.log('Screenshot blob created:', {
    size: blob.size,
    type: blob.type,
  });

  return blob;
}

/**
 * Example 7: Progressive quality compression
 * Tries different quality settings to achieve target size
 */
async function compressToTargetSize(
  dataUrl: string,
  targetSizeKB: number
): Promise<CompressionResult> {
  const targetBytes = targetSizeKB * 1024;
  const qualities = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];

  for (const quality of qualities) {
    const result = await compressScreenshot(dataUrl, {
      quality,
      maxWidth: 800,
    });

    console.log(`Quality ${quality}: ${(result.metadata.compressedSize / 1024).toFixed(1)} KB`);

    if (result.metadata.compressedSize <= targetBytes) {
      console.log(`Target size achieved at quality ${quality}`);
      return result;
    }
  }

  // If we still haven't reached target, return the most compressed version
  return compressScreenshot(dataUrl, {
    quality: 0.3,
    maxWidth: 600,
  });
}

/**
 * Example 8: Handling specific elements with special requirements
 */
async function captureSpecialElements() {
  // Capture element with CSS transforms
  const transformedElement = document.querySelector('.rotated') as HTMLElement;
  if (transformedElement) {
    const screenshot = await captureElementScreenshot(transformedElement);
    console.log('Captured transformed element');
  }

  // Capture element with shadow DOM
  const customElement = document.querySelector('custom-element') as HTMLElement;
  if (customElement?.shadowRoot) {
    // Note: Shadow DOM content may need special handling
    const screenshot = await captureElementScreenshot(customElement);
    console.log('Captured custom element with shadow DOM');
  }

  // Capture large scrollable element
  const scrollableElement = document.querySelector('.scrollable') as HTMLElement;
  if (scrollableElement) {
    const screenshot = await captureElementScreenshot(scrollableElement);
    const compressed = await compressScreenshot(screenshot, {
      quality: 0.7, // Lower quality for large images
      maxWidth: 1000,
    });
    console.log('Captured scrollable element:', estimateStorageSize(compressed.dataUrl).humanReadable);
  }
}

/**
 * Example 9: Chrome extension content script integration
 */
async function contentScriptScreenshot() {
  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureScreenshot') {
      const element = document.querySelector(message.selector) as HTMLElement;

      if (!element) {
        sendResponse({ error: 'Element not found' });
        return;
      }

      captureElementScreenshot(element)
        .then(screenshot => compressScreenshot(screenshot))
        .then(result => {
          sendResponse({
            success: true,
            dataUrl: result.dataUrl,
            metadata: result.metadata,
          });
        })
        .catch(error => {
          sendResponse({
            success: false,
            error: error.message,
          });
        });

      return true; // Keep channel open for async response
    }
  });
}

/**
 * Example 10: Performance monitoring
 */
async function monitoredScreenshotCapture(element: HTMLElement) {
  const startTime = performance.now();

  try {
    const captureStart = performance.now();
    const screenshot = await captureElementScreenshot(element);
    const captureTime = performance.now() - captureStart;

    const compressStart = performance.now();
    const result = await compressScreenshot(screenshot);
    const compressTime = performance.now() - compressStart;

    const totalTime = performance.now() - startTime;

    console.log('Performance metrics:');
    console.log(`- Capture: ${captureTime.toFixed(2)}ms`);
    console.log(`- Compression: ${compressTime.toFixed(2)}ms`);
    console.log(`- Total: ${totalTime.toFixed(2)}ms`);
    console.log(`- Size reduction: ${(result.metadata.compressionRatio * 100).toFixed(1)}%`);

    return { result, metrics: { captureTime, compressTime, totalTime } };
  } catch (error) {
    console.error('Screenshot failed after', performance.now() - startTime, 'ms');
    throw error;
  }
}

// Export examples for use in other modules
export {
  basicScreenshotExample,
  customCompressionExample,
  batchScreenshotExample,
  createClipWithScreenshot,
  robustScreenshotCapture,
  uploadScreenshot,
  compressToTargetSize,
  captureSpecialElements,
  contentScriptScreenshot,
  monitoredScreenshotCapture,
};