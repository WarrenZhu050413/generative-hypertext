/**
 * Unit tests for screenshot utilities
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getScreenshotDimensions,
  compressScreenshot,
  isValidDataUrl,
  dataUrlToBlob,
  blobToDataUrl,
  estimateStorageSize,
  ScreenshotError,
  type CompressionOptions,
} from '../src/utils/screenshot';

// Sample 1x1 transparent PNG data URL for testing
const SAMPLE_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Sample 1x1 white PNG data URL
const SAMPLE_WHITE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

describe('Screenshot Utilities', () => {
  beforeEach(() => {
    // Mock Image constructor to load immediately
    global.Image = class MockImage {
      private _onload: (() => void) | null = null;
      private _onerror: (() => void) | null = null;
      private _src = '';
      public naturalWidth = 1;
      public naturalHeight = 1;
      public width = 1;
      public height = 1;

      set onload(fn: (() => void) | null) {
        this._onload = fn;
      }

      get onload() {
        return this._onload;
      }

      set onerror(fn: (() => void) | null) {
        this._onerror = fn;
      }

      get onerror() {
        return this._onerror;
      }

      get src() {
        return this._src;
      }

      set src(value: string) {
        this._src = value;
        // Trigger onload asynchronously to simulate image loading
        setTimeout(() => {
          if (this._onload) {
            this._onload();
          }
        }, 0);
      }
    } as any;
  });

  describe('isValidDataUrl', () => {
    it('should validate correct PNG data URLs', () => {
      expect(isValidDataUrl(SAMPLE_PNG_DATA_URL)).toBe(true);
    });

    it('should validate correct JPEG data URLs', () => {
      const jpegUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      expect(isValidDataUrl(jpegUrl)).toBe(true);
    });

    it('should reject invalid data URLs', () => {
      expect(isValidDataUrl('not a data url')).toBe(false);
      expect(isValidDataUrl('')).toBe(false);
      expect(isValidDataUrl('data:text/plain;base64,test')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isValidDataUrl(null as any)).toBe(false);
      expect(isValidDataUrl(undefined as any)).toBe(false);
    });
  });

  describe('getScreenshotDimensions', () => {
    it('should extract dimensions from data URL', async () => {
      const dimensions = await getScreenshotDimensions(SAMPLE_PNG_DATA_URL);
      expect(dimensions).toEqual({ width: 1, height: 1 });
    });

    it('should throw error for invalid data URL', async () => {
      await expect(getScreenshotDimensions('invalid')).rejects.toThrow(ScreenshotError);
    });
  });

  describe('compressScreenshot', () => {
    it('should compress a screenshot with default options', async () => {
      const result = await compressScreenshot(SAMPLE_PNG_DATA_URL);

      expect(result.dataUrl).toMatch(/^data:image\/jpeg;base64,/);
      expect(result.metadata.originalSize).toBeGreaterThan(0);
      expect(result.metadata.compressedSize).toBeGreaterThan(0);
      expect(result.metadata.quality).toBe(0.8);
      expect(result.metadata.format).toBe('image/jpeg');
    });

    it('should compress with custom quality', async () => {
      const result = await compressScreenshot(SAMPLE_PNG_DATA_URL, {
        quality: 0.5,
      });

      expect(result.metadata.quality).toBe(0.5);
    });

    it('should respect maxWidth constraint', async () => {
      // For a 1x1 image, maxWidth won't change dimensions
      const result = await compressScreenshot(SAMPLE_PNG_DATA_URL, {
        maxWidth: 400,
      });

      expect(result.metadata.compressedDimensions.width).toBeLessThanOrEqual(400);
    });

    it('should maintain aspect ratio by default', async () => {
      const result = await compressScreenshot(SAMPLE_PNG_DATA_URL, {
        maxWidth: 100,
      });

      const { originalDimensions, compressedDimensions } = result.metadata;
      const originalRatio = originalDimensions.width / originalDimensions.height;
      const compressedRatio = compressedDimensions.width / compressedDimensions.height;

      expect(compressedRatio).toBeCloseTo(originalRatio);
    });

    it('should throw error for invalid quality', async () => {
      await expect(
        compressScreenshot(SAMPLE_PNG_DATA_URL, { quality: 1.5 })
      ).rejects.toThrow(ScreenshotError);

      await expect(
        compressScreenshot(SAMPLE_PNG_DATA_URL, { quality: -0.1 })
      ).rejects.toThrow(ScreenshotError);
    });

    it('should throw error for invalid maxWidth', async () => {
      await expect(
        compressScreenshot(SAMPLE_PNG_DATA_URL, { maxWidth: 0 })
      ).rejects.toThrow(ScreenshotError);

      await expect(
        compressScreenshot(SAMPLE_PNG_DATA_URL, { maxWidth: -100 })
      ).rejects.toThrow(ScreenshotError);
    });

    it('should support PNG format', async () => {
      const result = await compressScreenshot(SAMPLE_PNG_DATA_URL, {
        format: 'image/png',
      });

      expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.metadata.format).toBe('image/png');
    });

    it('should calculate compression ratio', async () => {
      const result = await compressScreenshot(SAMPLE_PNG_DATA_URL);

      // Compression ratio can be negative if the compressed version is larger
      // This happens in our mock since JPEG base64 is longer than PNG base64
      expect(result.metadata.compressionRatio).toBeDefined();
      expect(typeof result.metadata.compressionRatio).toBe('number');
    });
  });

  describe('dataUrlToBlob', () => {
    it('should convert data URL to Blob', () => {
      const blob = dataUrlToBlob(SAMPLE_PNG_DATA_URL);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should throw error for invalid data URL', () => {
      expect(() => dataUrlToBlob('invalid')).toThrow(ScreenshotError);
    });
  });

  describe('blobToDataUrl', () => {
    it('should convert Blob to data URL', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const dataUrl = await blobToDataUrl(blob);

      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('estimateStorageSize', () => {
    it('should estimate storage size in bytes', () => {
      const estimate = estimateStorageSize(SAMPLE_PNG_DATA_URL);

      expect(estimate.bytes).toBeGreaterThan(0);
      expect(estimate.humanReadable).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB|GB)/);
    });

    it('should format bytes correctly', () => {
      // Test with a larger data URL to get KB range
      const largeDataUrl = 'data:image/png;base64,' + 'A'.repeat(2000);
      const estimate = estimateStorageSize(largeDataUrl);

      expect(estimate.humanReadable).toContain('KB');
    });
  });

  describe('ScreenshotError', () => {
    it('should create error with code', () => {
      const error = new ScreenshotError('Test error', 'TEST_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('ScreenshotError');
    });
  });
});