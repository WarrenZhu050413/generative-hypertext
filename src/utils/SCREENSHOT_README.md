# Screenshot Utilities Documentation

Comprehensive screenshot capture and compression utilities for the Nabokov Web Clipper.

## Overview

The screenshot utilities provide a robust, dependency-free solution for capturing and compressing screenshots of DOM elements in a Chrome extension environment. Built entirely on native browser Canvas API, these utilities handle edge cases like cross-origin images, CSS transforms, shadow DOM, and large elements.

## Features

- **Zero Dependencies**: Uses native Canvas API (no html2canvas or external libraries)
- **Comprehensive Error Handling**: Custom error types with specific error codes
- **Flexible Compression**: Configurable quality, size, and format options
- **Rich Metadata**: Detailed compression statistics and metrics
- **TypeScript Support**: Full type definitions and JSDoc documentation
- **Edge Case Handling**: CSS transforms, shadow DOM, cross-origin images
- **Batch Processing**: Process multiple screenshots with progress tracking
- **Performance Optimized**: Device pixel ratio support for sharp images

## Installation

The utilities are located at `src/utils/screenshot.ts` and can be imported directly:

```typescript
import {
  captureElementScreenshot,
  compressScreenshot,
  getScreenshotDimensions,
  // ... other exports
} from '@/utils/screenshot';
```

## Core Functions

### captureElementScreenshot(element)

Captures a screenshot of a specific DOM element.

**Parameters:**
- `element: HTMLElement` - The element to capture

**Returns:**
- `Promise<string>` - Data URL of the captured screenshot (PNG format)

**Throws:**
- `ScreenshotError` with codes:
  - `INVALID_ELEMENT` - Element is null or not an HTMLElement
  - `ZERO_DIMENSIONS` - Element has no dimensions
  - `CANVAS_CONTEXT_ERROR` - Failed to get canvas context
  - `CAPTURE_FAILED` - General capture failure

**Example:**
```typescript
const element = document.getElementById('content');
const screenshot = await captureElementScreenshot(element);
// screenshot: "data:image/png;base64,..."
```

### compressScreenshot(dataUrl, options?)

Compresses a screenshot to reduce file size.

**Parameters:**
- `dataUrl: string` - Data URL of the screenshot to compress
- `options?: CompressionOptions` - Optional compression settings

**Options:**
```typescript
interface CompressionOptions {
  quality?: number;              // 0-1, default: 0.8
  maxWidth?: number;              // pixels, default: 800
  format?: 'image/jpeg' | 'image/png'; // default: 'image/jpeg'
  maintainAspectRatio?: boolean;  // default: true
}
```

**Returns:**
- `Promise<CompressionResult>` - Compressed data URL and metadata

**Result Structure:**
```typescript
interface CompressionResult {
  dataUrl: string;
  metadata: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;  // 0-1 (e.g., 0.5 = 50% reduction)
    originalDimensions: { width: number; height: number };
    compressedDimensions: { width: number; height: number };
    format: string;
    quality: number;
  };
}
```

**Example:**
```typescript
const result = await compressScreenshot(screenshot, {
  quality: 0.8,
  maxWidth: 800,
  format: 'image/jpeg'
});

console.log(`Saved ${result.metadata.compressionRatio * 100}%`);
// Output: "Saved 65.3%"
```

### getScreenshotDimensions(dataUrl)

Extracts dimensions from a data URL.

**Parameters:**
- `dataUrl: string` - Data URL to extract dimensions from

**Returns:**
- `Promise<ImageDimensions>` - Width and height

**Example:**
```typescript
const dimensions = await getScreenshotDimensions(screenshot);
console.log(`${dimensions.width}x${dimensions.height}`);
// Output: "1024x768"
```

## Utility Functions

### isValidDataUrl(dataUrl)

Validates if a string is a valid image data URL.

```typescript
if (isValidDataUrl(screenshot)) {
  // Safe to use
}
```

### dataUrlToBlob(dataUrl)

Converts a data URL to a Blob for uploads or storage.

```typescript
const blob = dataUrlToBlob(screenshot);
const formData = new FormData();
formData.append('screenshot', blob, 'screenshot.jpg');
```

### blobToDataUrl(blob)

Converts a Blob to a data URL.

```typescript
const dataUrl = await blobToDataUrl(blob);
```

### estimateStorageSize(dataUrl)

Calculates storage size required for a screenshot.

```typescript
const estimate = estimateStorageSize(screenshot);
console.log(estimate.humanReadable); // "256.4 KB"
console.log(estimate.bytes);         // 262553
```

### batchCompressScreenshots(dataUrls, options?, onProgress?)

Compress multiple screenshots with progress tracking.

```typescript
const screenshots = [screenshot1, screenshot2, screenshot3];
const results = await batchCompressScreenshots(
  screenshots,
  { quality: 0.8 },
  (progress) => console.log(`${Math.round(progress * 100)}%`)
);
```

## Common Use Cases

### 1. Basic Clip Creation

```typescript
async function createClip(element: HTMLElement) {
  // Capture screenshot
  const screenshot = await captureElementScreenshot(element);

  // Compress for storage
  const compressed = await compressScreenshot(screenshot);

  return {
    id: crypto.randomUUID(),
    title: document.title,
    url: window.location.href,
    timestamp: Date.now(),
    screenshot: compressed.dataUrl,
    screenshotSize: compressed.metadata.compressedSize,
  };
}
```

### 2. Content Script Integration

```typescript
// In content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureScreenshot') {
    const element = document.querySelector(message.selector);

    captureElementScreenshot(element)
      .then(screenshot => compressScreenshot(screenshot))
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Keep channel open
  }
});
```

### 3. Progressive Quality Compression

```typescript
async function compressToTargetSize(dataUrl: string, targetKB: number) {
  const qualities = [0.9, 0.8, 0.7, 0.6, 0.5];

  for (const quality of qualities) {
    const result = await compressScreenshot(dataUrl, { quality });

    if (result.metadata.compressedSize <= targetKB * 1024) {
      return result;
    }
  }

  // Return most compressed version
  return compressScreenshot(dataUrl, { quality: 0.4, maxWidth: 600 });
}
```

### 4. Error Handling

```typescript
async function robustCapture(element: HTMLElement) {
  try {
    const screenshot = await captureElementScreenshot(element);

    if (!isValidDataUrl(screenshot)) {
      throw new Error('Invalid screenshot');
    }

    try {
      const compressed = await compressScreenshot(screenshot);
      return compressed.dataUrl;
    } catch (compressionError) {
      console.warn('Using uncompressed:', compressionError);
      return screenshot; // Fallback
    }
  } catch (error) {
    console.error('Capture failed:', error);
    return null; // or placeholder image
  }
}
```

## Edge Cases Handled

### 1. Cross-Origin Images (CORS)

The utility attempts to convert cross-origin images to data URLs. If CORS prevents this, the original image source is retained (works for same-origin).

```typescript
// Automatically handled internally
const screenshot = await captureElementScreenshot(elementWithImages);
```

### 2. CSS Transforms

Elements with CSS transforms (rotate, scale, etc.) are captured with their transformed appearance preserved.

### 3. Elements Outside Viewport

Elements outside the viewport are captured using their bounding rectangle dimensions.

### 4. Shadow DOM

Elements containing shadow DOM are captured, though shadow DOM content may have limitations depending on encapsulation.

### 5. Very Large Elements

Large elements are captured at device pixel ratio for quality. Use compression to reduce size:

```typescript
const screenshot = await captureElementScreenshot(largeElement);
const compressed = await compressScreenshot(screenshot, {
  quality: 0.7,
  maxWidth: 1000
});
```

## Error Handling

All errors thrown by the utilities are instances of `ScreenshotError` with specific error codes:

```typescript
try {
  const screenshot = await captureElementScreenshot(element);
} catch (error) {
  if (error instanceof ScreenshotError) {
    switch (error.code) {
      case 'INVALID_ELEMENT':
        console.error('Element is invalid');
        break;
      case 'ZERO_DIMENSIONS':
        console.error('Element has no dimensions');
        break;
      case 'CANVAS_CONTEXT_ERROR':
        console.error('Canvas context unavailable');
        break;
      case 'CAPTURE_FAILED':
        console.error('Capture failed:', error.message);
        break;
    }
  }
}
```

**Error Codes:**
- `INVALID_ELEMENT` - Element parameter is null or invalid
- `ZERO_DIMENSIONS` - Element has zero width or height
- `CANVAS_CONTEXT_ERROR` - Failed to get 2D canvas context
- `CAPTURE_FAILED` - General capture failure
- `INVALID_DATA_URL` - Data URL format is invalid
- `INVALID_QUALITY` - Quality parameter out of range (0-1)
- `INVALID_MAX_WIDTH` - Max width is zero or negative
- `COMPRESSION_FAILED` - Compression operation failed
- `DIMENSIONS_ERROR` - Failed to extract dimensions
- `IMAGE_LOAD_ERROR` - Failed to load image from data URL
- `BLOB_CONVERSION_ERROR` - Failed to convert between Blob and data URL
- `DRAW_ERROR` - Failed to draw image to canvas

## Performance Considerations

### Capture Time

- Small elements (< 500px): ~50-100ms
- Medium elements (500-1500px): ~100-300ms
- Large elements (> 1500px): ~300-1000ms

### Compression Time

- Minimal for small images: ~10-50ms
- Increases with image size and quality settings

### Memory Usage

- Each screenshot creates a canvas in memory
- Compress immediately to reduce memory footprint
- Avoid capturing many large elements simultaneously

### Optimization Tips

1. **Compress immediately after capture:**
```typescript
const screenshot = await captureElementScreenshot(element);
const compressed = await compressScreenshot(screenshot);
// Discard original screenshot
```

2. **Use appropriate quality settings:**
```typescript
// For thumbnails
compressScreenshot(screenshot, { quality: 0.6, maxWidth: 400 });

// For full quality
compressScreenshot(screenshot, { quality: 0.9, maxWidth: 1200 });
```

3. **Batch process with throttling:**
```typescript
async function captureMultiple(elements: HTMLElement[]) {
  const results = [];

  for (const element of elements) {
    const screenshot = await captureElementScreenshot(element);
    const compressed = await compressScreenshot(screenshot);
    results.push(compressed);

    // Throttle to avoid memory issues
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
```

## Testing

Unit tests are available in `tests/screenshot.test.ts`:

```bash
npm test
```

Tests cover:
- Valid and invalid data URL handling
- Dimension extraction
- Compression with various options
- Error conditions
- Blob conversions
- Storage size estimation

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 11+)

**Requirements:**
- Canvas API (all modern browsers)
- HTML5 features (foreignObject, data URLs)
- FileReader API for Blob conversions

## Technical Details

### Implementation Approach

The utilities use native Canvas API instead of html2canvas for several reasons:

1. **Zero dependencies** - No external library needed
2. **Better performance** - Direct canvas operations
3. **Smaller bundle size** - No additional library weight
4. **More control** - Fine-tuned edge case handling

### SVG foreignObject Technique

Elements are rendered using SVG `foreignObject` which provides:
- Better CSS transform support
- Preserved styling and layout
- Cross-browser compatibility

### Compression Strategy

1. Original capture in PNG (lossless)
2. Resize to max width (maintaining aspect ratio)
3. Convert to JPEG at specified quality (lossy)
4. Track compression metadata

JPEG is used by default because:
- Better compression ratios (50-70% typical)
- Acceptable quality loss for screenshots
- Widely supported format
- Smaller storage footprint

PNG can be used when transparency is needed:
```typescript
compressScreenshot(screenshot, { format: 'image/png' });
```

## License

Part of the Nabokov Web Clipper project.

## Support

For issues or questions, refer to the main project documentation or create an issue in the project repository.