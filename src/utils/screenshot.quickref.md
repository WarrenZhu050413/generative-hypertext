# Screenshot Utilities Quick Reference

## Import

```typescript
import {
  captureElementScreenshot,
  compressScreenshot,
  getScreenshotDimensions,
  isValidDataUrl,
  dataUrlToBlob,
  blobToDataUrl,
  estimateStorageSize,
  batchCompressScreenshots,
  ScreenshotError,
  type CompressionOptions,
  type CompressionResult,
  type ImageDimensions,
} from '@/utils/screenshot';
```

## Core Functions

### captureElementScreenshot
```typescript
captureElementScreenshot(element: HTMLElement): Promise<string>
```
**Returns:** PNG data URL
**Throws:** ScreenshotError

### compressScreenshot
```typescript
compressScreenshot(
  dataUrl: string,
  options?: CompressionOptions
): Promise<CompressionResult>
```
**Options:**
- `quality?: number` (0-1, default: 0.8)
- `maxWidth?: number` (default: 800)
- `format?: 'image/jpeg' | 'image/png'` (default: 'image/jpeg')
- `maintainAspectRatio?: boolean` (default: true)

**Returns:**
```typescript
{
  dataUrl: string;
  metadata: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    originalDimensions: { width, height };
    compressedDimensions: { width, height };
    format: string;
    quality: number;
  }
}
```

### getScreenshotDimensions
```typescript
getScreenshotDimensions(dataUrl: string): Promise<ImageDimensions>
```
**Returns:** `{ width: number, height: number }`

## Utility Functions

### isValidDataUrl
```typescript
isValidDataUrl(dataUrl: string): boolean
```
Validates image data URL format.

### dataUrlToBlob
```typescript
dataUrlToBlob(dataUrl: string): Blob
```
Converts data URL to Blob for uploads.

### blobToDataUrl
```typescript
blobToDataUrl(blob: Blob): Promise<string>
```
Converts Blob to data URL.

### estimateStorageSize
```typescript
estimateStorageSize(dataUrl: string): { bytes: number, humanReadable: string }
```
Example: `{ bytes: 262553, humanReadable: "256.4 KB" }`

### batchCompressScreenshots
```typescript
batchCompressScreenshots(
  dataUrls: string[],
  options?: CompressionOptions,
  onProgress?: (progress: number) => void
): Promise<CompressionResult[]>
```
Progress callback receives values 0-1.

## Common Patterns

### Basic Usage
```typescript
const element = document.getElementById('content');
const screenshot = await captureElementScreenshot(element);
const compressed = await compressScreenshot(screenshot);
console.log(estimateStorageSize(compressed.dataUrl).humanReadable);
```

### High Quality
```typescript
const result = await compressScreenshot(screenshot, {
  quality: 0.95,
  maxWidth: 1200,
  format: 'image/jpeg'
});
```

### Small Thumbnails
```typescript
const result = await compressScreenshot(screenshot, {
  quality: 0.6,
  maxWidth: 400
});
```

### PNG with Transparency
```typescript
const result = await compressScreenshot(screenshot, {
  format: 'image/png',
  quality: 0.9
});
```

### Upload as Blob
```typescript
const screenshot = await captureElementScreenshot(element);
const compressed = await compressScreenshot(screenshot);
const blob = dataUrlToBlob(compressed.dataUrl);

const formData = new FormData();
formData.append('file', blob, 'screenshot.jpg');
```

### Batch Processing
```typescript
const screenshots = await Promise.all(
  elements.map(el => captureElementScreenshot(el))
);

const compressed = await batchCompressScreenshots(
  screenshots,
  { quality: 0.8 },
  (progress) => console.log(`${Math.round(progress * 100)}%`)
);
```

### Error Handling
```typescript
try {
  const screenshot = await captureElementScreenshot(element);
  const compressed = await compressScreenshot(screenshot);
  return compressed.dataUrl;
} catch (error) {
  if (error instanceof ScreenshotError) {
    console.error(`Screenshot failed: ${error.code}`, error.message);
  }
  return null; // or fallback
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_ELEMENT` | Element is null or not HTMLElement |
| `ZERO_DIMENSIONS` | Element has no dimensions |
| `CANVAS_CONTEXT_ERROR` | Failed to get canvas context |
| `CAPTURE_FAILED` | General capture failure |
| `INVALID_DATA_URL` | Invalid data URL format |
| `INVALID_QUALITY` | Quality not in range 0-1 |
| `INVALID_MAX_WIDTH` | Max width is zero or negative |
| `COMPRESSION_FAILED` | Compression operation failed |
| `DIMENSIONS_ERROR` | Failed to get dimensions |
| `IMAGE_LOAD_ERROR` | Failed to load image |
| `BLOB_CONVERSION_ERROR` | Blob conversion failed |

## Performance

| Operation | Small Element | Large Element |
|-----------|---------------|---------------|
| Capture | 50-100ms | 300-1000ms |
| Compress | 10-50ms | 50-200ms |
| Typical Reduction | 50-70% | 60-80% |

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅ (iOS 11+)

## Dependencies

None - uses native Canvas API only.

## Files

- **Core:** `/src/utils/screenshot.ts` (668 lines)
- **Examples:** `/src/utils/screenshot.example.ts` (372 lines)
- **Tests:** `/tests/screenshot.test.ts` (182 lines)
- **Docs:** `/src/utils/SCREENSHOT_README.md`