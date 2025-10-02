/**
 * Image Upload Utility
 * Handles drag-and-drop image upload to create image cards
 */

import type { Card } from '@/types/card';
import { generateId, saveCard } from './storage';

/**
 * Validate that a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Convert image file to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as string'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from data URL
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUrl;
  });
}

/**
 * Calculate card size based on image dimensions
 * Scales image to fit within canvas while maintaining aspect ratio
 */
export function calculateCardSize(
  imageDimensions: { width: number; height: number },
  maxWidth: number = 400,
  maxHeight: number = 400
): { width: number; height: number } {
  const { width, height } = imageDimensions;

  // If image is small enough, use original size
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculate aspect ratio
  const aspectRatio = width / height;

  // Scale based on which dimension exceeds max
  if (width / maxWidth > height / maxHeight) {
    // Width is the limiting factor
    return {
      width: maxWidth,
      height: Math.round(maxWidth / aspectRatio),
    };
  } else {
    // Height is the limiting factor
    return {
      width: Math.round(maxHeight * aspectRatio),
      height: maxHeight,
    };
  }
}

/**
 * Create an image card from a dropped file
 */
export async function createImageCard(
  file: File,
  position: { x: number; y: number }
): Promise<Card> {
  // Validate file is an image
  if (!isImageFile(file)) {
    throw new Error('File is not an image');
  }

  // Convert to base64
  const imageData = await fileToBase64(file);

  // Get image dimensions
  const imageDimensions = await getImageDimensions(imageData);

  // Calculate card size
  const size = calculateCardSize(imageDimensions);

  // Create card
  const card: Card = {
    id: generateId(),
    cardType: 'image',
    metadata: {
      url: '',
      title: file.name,
      domain: 'image-upload',
      favicon: '🖼️',
      timestamp: Date.now(),
    },
    position,
    size,
    starred: false,
    tags: ['image'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    imageData,
    imageMimeType: file.type,
  };

  // Save card to storage
  await saveCard(card);

  return card;
}

/**
 * Process multiple dropped files
 */
export async function createImageCards(
  files: File[],
  startPosition: { x: number; y: number }
): Promise<Card[]> {
  const cards: Card[] = [];
  const spacing = 40; // Gap between cards

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!isImageFile(file)) {
      console.warn(`[imageUpload] Skipping non-image file: ${file.name}`);
      continue;
    }

    try {
      // Offset position for each card
      const position = {
        x: startPosition.x + (i * spacing),
        y: startPosition.y + (i * spacing),
      };

      const card = await createImageCard(file, position);
      cards.push(card);
    } catch (error) {
      console.error(`[imageUpload] Error processing ${file.name}:`, error);
    }
  }

  return cards;
}
