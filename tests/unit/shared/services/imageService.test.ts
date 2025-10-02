/**
 * Unit tests for Image Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  uploadImageAsCard,
  dataUrlToFile,
  validateImageFile,
  type ImageUploadOptions,
} from '@/shared/services/imageService';

// Mock imageUpload utilities
vi.mock('@/utils/imageUpload', () => ({
  createImageCard: vi.fn(async (file: File, position: { x: number; y: number }) => ({
    id: 'test-image-card-id',
    cardType: 'image' as const,
    imageData: 'data:image/png;base64,mock-image-data',
    imageDimensions: { width: 800, height: 600 },
    content: '',
    metadata: {
      title: file.name,
      domain: 'local',
      url: '',
      favicon: '📷',
      timestamp: Date.now(),
    },
    position,
    starred: false,
    tags: ['image'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })),
}));

vi.mock('@/utils/storage', () => ({
  generateId: vi.fn(() => 'test-id-123'),
}));

import { createImageCard } from '@/utils/imageUpload';

describe('ImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImageAsCard', () => {
    it('should upload image and create card', async () => {
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const card = await uploadImageAsCard(file);

      expect(createImageCard).toHaveBeenCalledWith(file, { x: 100, y: 100 });
      expect(card.id).toBe('test-image-card-id');
      expect(card.cardType).toBe('image');
    });

    it('should use custom position when provided', async () => {
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const options: ImageUploadOptions = {
        position: { x: 500, y: 300 },
      };

      await uploadImageAsCard(file, options);

      expect(createImageCard).toHaveBeenCalledWith(file, { x: 500, y: 300 });
    });

    it('should stash card when stashImmediately is true', async () => {
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const options: ImageUploadOptions = {
        stashImmediately: true,
      };

      const card = await uploadImageAsCard(file, options);

      expect(card.stashed).toBe(true);
    });

    it('should add custom tags', async () => {
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const options: ImageUploadOptions = {
        tags: ['custom', 'test'],
      };

      const card = await uploadImageAsCard(file, options);

      expect(card.tags).toContain('image'); // Default tag
      expect(card.tags).toContain('custom');
      expect(card.tags).toContain('test');
    });

    it('should reject non-image files', async () => {
      const file = new File(['text content'], 'test.txt', { type: 'text/plain' });

      await expect(uploadImageAsCard(file)).rejects.toThrow(
        'Invalid file type. Only images are supported.'
      );
    });

    it('should reject files larger than 10MB', async () => {
      const largeContent = new ArrayBuffer(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.png', { type: 'image/png' });

      await expect(uploadImageAsCard(file)).rejects.toThrow(
        'File too large. Maximum size is 10MB.'
      );
    });

    it('should accept files at the 10MB limit', async () => {
      const content = new ArrayBuffer(10 * 1024 * 1024); // Exactly 10MB
      const file = new File([content], 'large.png', { type: 'image/png' });

      await expect(uploadImageAsCard(file)).resolves.toBeDefined();
    });
  });

  describe('dataUrlToFile', () => {
    it('should convert PNG data URL to File', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const file = dataUrlToFile(dataUrl, 'test.png');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.png');
      expect(file.type).toBe('image/png');
    });

    it('should convert JPEG data URL to File', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

      const file = dataUrlToFile(dataUrl, 'test.jpg');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.jpg');
      expect(file.type).toBe('image/jpeg');
    });

    it('should use default filename when not provided', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const file = dataUrlToFile(dataUrl);

      expect(file.name).toBe('image.png');
    });

    it('should handle data URLs without explicit MIME type', () => {
      // Malformed data URL should still create a file
      const dataUrl = 'data:;base64,abc123';

      const file = dataUrlToFile(dataUrl);

      expect(file).toBeInstanceOf(File);
      // Empty MIME type for malformed data URLs
      expect(file.type).toBe('');
    });
  });

  describe('validateImageFile', () => {
    it('should validate valid PNG file', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate valid JPEG file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate valid GIF file', () => {
      const file = new File(['content'], 'test.gif', { type: 'image/gif' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate valid WebP file', () => {
      const file = new File(['content'], 'test.webp', { type: 'image/webp' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate valid SVG file', () => {
      const file = new File(['content'], 'test.svg', { type: 'image/svg+xml' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-image file', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file type. Only images are supported.');
    });

    it('should reject unsupported image format', () => {
      const file = new File(['content'], 'test.bmp', { type: 'image/bmp' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unsupported format: image/bmp');
    });

    it('should reject files larger than 10MB', () => {
      const largeContent = new ArrayBuffer(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.png', { type: 'image/png' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File too large. Maximum size is 10MB.');
    });

    it('should accept files at exactly 10MB', () => {
      const content = new ArrayBuffer(10 * 1024 * 1024); // Exactly 10MB
      const file = new File([content], 'large.png', { type: 'image/png' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept small files', () => {
      const file = new File(['small content'], 'small.png', { type: 'image/png' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
    });
  });
});
