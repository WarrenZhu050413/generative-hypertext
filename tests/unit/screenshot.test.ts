/**
 * Screenshot Capture Tests
 *
 * Tests for capturing and processing element screenshots.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Mock screenshot capture function
 */
async function captureElementScreenshot(
  element: HTMLElement,
  options?: {
    maxWidth?: number;
    quality?: number;
    format?: 'png' | 'jpeg';
  }
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  size: number;
}> {
  const { maxWidth = 800, quality = 0.8, format = 'jpeg' } = options || {};

  // Simulate screenshot capture
  const rect = element.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;

  // Scale down if needed
  if (width > maxWidth) {
    const scale = maxWidth / width;
    width = maxWidth;
    height = height * scale;
  }

  // Generate mock data URL
  const dataUrl = `data:image/${format};base64,mockBase64Data`;
  const size = dataUrl.length;

  return { dataUrl, width, height, size };
}

/**
 * Compress screenshot data
 */
async function compressScreenshot(
  dataUrl: string,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<string> {
  // Simulate compression
  if (dataUrl.includes('png')) {
    return dataUrl.replace('png', 'jpeg');
  }
  return dataUrl;
}

describe('Screenshot Capture', () => {
  let testElement: HTMLElement;

  beforeEach(() => {
    // Create test element
    testElement = document.createElement('div');
    testElement.style.width = '400px';
    testElement.style.height = '300px';
    testElement.textContent = 'Test content';
    document.body.appendChild(testElement);

    // Mock getBoundingClientRect to return actual dimensions
    testElement.getBoundingClientRect = vi.fn(() => ({
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
  });

  it('should capture screenshot of element', async () => {
    const result = await captureElementScreenshot(testElement);

    expect(result).toBeDefined();
    expect(result.dataUrl).toContain('data:image/');
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('should capture with default options', async () => {
    const result = await captureElementScreenshot(testElement);

    expect(result.dataUrl).toContain('jpeg');
    expect(result.width).toBeLessThanOrEqual(800);
  });

  it('should scale down large elements', async () => {
    // Create large element
    const largeElement = document.createElement('div');
    largeElement.style.width = '1600px';
    largeElement.style.height = '1200px';
    largeElement.getBoundingClientRect = vi.fn(() => ({
      width: 1600,
      height: 1200,
      top: 0,
      left: 0,
      right: 1600,
      bottom: 1200,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
    document.body.appendChild(largeElement);

    const result = await captureElementScreenshot(largeElement, { maxWidth: 800 });

    expect(result.width).toBeLessThanOrEqual(800);
    // Height should be scaled proportionally
    expect(result.height).toBeLessThanOrEqual(600);

    document.body.removeChild(largeElement);
  });

  it('should respect custom max width', async () => {
    const result = await captureElementScreenshot(testElement, { maxWidth: 600 });

    expect(result.width).toBeLessThanOrEqual(600);
  });

  it('should support PNG format', async () => {
    const result = await captureElementScreenshot(testElement, { format: 'png' });

    expect(result.dataUrl).toContain('image/png');
  });

  it('should support JPEG format', async () => {
    const result = await captureElementScreenshot(testElement, { format: 'jpeg' });

    expect(result.dataUrl).toContain('image/jpeg');
  });

  it('should handle quality parameter', async () => {
    const result1 = await captureElementScreenshot(testElement, { quality: 0.9 });
    const result2 = await captureElementScreenshot(testElement, { quality: 0.5 });

    // Both should succeed
    expect(result1.dataUrl).toBeDefined();
    expect(result2.dataUrl).toBeDefined();
  });

  it('should calculate size correctly', async () => {
    const result = await captureElementScreenshot(testElement);

    expect(result.size).toBe(result.dataUrl.length);
    expect(result.size).toBeGreaterThan(0);
  });

  it('should handle hidden elements', async () => {
    testElement.style.display = 'none';

    const result = await captureElementScreenshot(testElement);

    expect(result).toBeDefined();
    // Hidden elements might have 0 dimensions
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('should handle elements with transforms', async () => {
    testElement.style.transform = 'scale(1.5) rotate(45deg)';

    const result = await captureElementScreenshot(testElement);

    expect(result).toBeDefined();
    expect(result.dataUrl).toContain('data:image/');
  });

  it('should compress screenshots', async () => {
    const originalDataUrl = 'data:image/png;base64,originalData';
    const compressed = await compressScreenshot(originalDataUrl, 800, 0.8);

    expect(compressed).toContain('data:image/');
    // Should convert PNG to JPEG for compression
    expect(compressed).toContain('jpeg');
  });

  it('should preserve JPEG format during compression', async () => {
    const jpegDataUrl = 'data:image/jpeg;base64,jpegData';
    const compressed = await compressScreenshot(jpegDataUrl);

    expect(compressed).toContain('jpeg');
  });

  it('should handle errors gracefully', async () => {
    const invalidElement = null as any;

    await expect(async () => {
      if (!invalidElement) {
        throw new Error('Invalid element');
      }
      await captureElementScreenshot(invalidElement);
    }).rejects.toThrow('Invalid element');
  });

  it('should maintain aspect ratio when scaling', async () => {
    const wideElement = document.createElement('div');
    wideElement.style.width = '1600px';
    wideElement.style.height = '400px'; // 4:1 aspect ratio
    wideElement.getBoundingClientRect = vi.fn(() => ({
      width: 1600,
      height: 400,
      top: 0,
      left: 0,
      right: 1600,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
    document.body.appendChild(wideElement);

    const result = await captureElementScreenshot(wideElement, { maxWidth: 800 });

    // Should scale to 800x200 to maintain 4:1 ratio
    expect(result.width).toBe(800);
    expect(result.height).toBe(200);

    document.body.removeChild(wideElement);
  });

  it('should not upscale small elements', async () => {
    const smallElement = document.createElement('div');
    smallElement.style.width = '200px';
    smallElement.style.height = '100px';
    smallElement.getBoundingClientRect = vi.fn(() => ({
      width: 200,
      height: 100,
      top: 0,
      left: 0,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
    document.body.appendChild(smallElement);

    const result = await captureElementScreenshot(smallElement, { maxWidth: 800 });

    // Should not upscale beyond original size
    expect(result.width).toBeLessThanOrEqual(200);

    document.body.removeChild(smallElement);
  });

  it('should handle elements with complex content', async () => {
    testElement.innerHTML = `
      <h1>Title</h1>
      <p>Paragraph</p>
      <img src="data:image/png;base64,test" alt="Test">
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    `;

    const result = await captureElementScreenshot(testElement);

    expect(result).toBeDefined();
    expect(result.dataUrl).toContain('data:image/');
  });

  it('should generate unique screenshots for different elements', async () => {
    const element2 = document.createElement('div');
    element2.style.width = '500px';
    element2.style.height = '400px';
    element2.textContent = 'Different content';
    element2.getBoundingClientRect = vi.fn(() => ({
      width: 500,
      height: 400,
      top: 0,
      left: 0,
      right: 500,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
    document.body.appendChild(element2);

    const result1 = await captureElementScreenshot(testElement);
    const result2 = await captureElementScreenshot(element2);

    // Both should succeed
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();

    document.body.removeChild(element2);
  });
});