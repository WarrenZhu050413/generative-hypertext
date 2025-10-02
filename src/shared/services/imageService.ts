/**
 * Image Service - Image upload and processing
 *
 * Wraps imageUpload.ts utility with card creation logic
 */

import type { Card } from '@/types/card';
import { createImageCard } from '@/utils/imageUpload';
import { generateId } from '@/utils/storage';

/**
 * Options for image upload
 */
export interface ImageUploadOptions {
  /** Whether to stash the card immediately */
  stashImmediately?: boolean;
  /** Default position for the card */
  position?: { x: number; y: number };
  /** Custom tags to add */
  tags?: string[];
}

/**
 * Process image file and create a card
 *
 * @param file - Image file to upload
 * @param options - Upload options
 * @returns Promise resolving to the created card
 */
export async function uploadImageAsCard(
  file: File,
  options: ImageUploadOptions = {}
): Promise<Card> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Only images are supported.');
  }

  // Validate file size (10MB limit)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  // Determine position (use provided or default)
  const position = options.position || { x: 100, y: 100 };

  // Use existing imageUpload utility to process and save
  const card = await createImageCard(file, position);

  // Apply stash option
  if (options.stashImmediately) {
    card.stashed = true;
  }

  if (options.tags && options.tags.length > 0) {
    card.tags = [...(card.tags || []), ...options.tags];
  }

  console.log('[imageService] Image uploaded as card:', card.id);

  return card;
}

/**
 * Convert base64 data URL to File object
 *
 * @param dataUrl - Base64 data URL
 * @param filename - Filename for the file
 * @returns File object
 */
export function dataUrlToFile(dataUrl: string, filename: string = 'image.png'): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Read image dimensions from file
 *
 * @param file - Image file
 * @returns Promise resolving to {width, height}
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate image file
 *
 * @param file - File to validate
 * @returns Object with {valid, error}
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Invalid file type. Only images are supported.' };
  }

  // Check size
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  // Check supported formats
  const supported = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!supported.includes(file.type)) {
    return { valid: false, error: `Unsupported format: ${file.type}` };
  }

  return { valid: true };
}

// Re-export for convenience
export { createImageCard, createImageCards, isImageFile } from '@/utils/imageUpload';
