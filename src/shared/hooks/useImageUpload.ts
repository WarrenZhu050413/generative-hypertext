/**
 * useImageUpload Hook - Handle image uploads with validation
 *
 * Provides image upload functionality with processing and card creation
 */

import { useState, useCallback } from 'react';
import type { Card } from '@/types/card';
import { uploadImageAsCard, validateImageFile, type ImageUploadOptions } from '../services/imageService';
import { upsertCard } from '../services/cardService';

export interface UseImageUploadReturn {
  handleImageUpload: (file: File, options?: ImageUploadOptions) => Promise<Card>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for handling image uploads
 *
 * @param onSuccess - Optional callback when upload succeeds
 * @param defaultOptions - Default options for all uploads
 * @returns Upload function and state
 */
export function useImageUpload(
  onSuccess?: (card: Card) => void,
  defaultOptions?: ImageUploadOptions
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (
    file: File,
    options?: ImageUploadOptions
  ): Promise<Card> => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      console.log('[useImageUpload] Uploading image:', file.name);

      // Merge options with defaults
      const mergedOptions = { ...defaultOptions, ...options };

      // Process and create card
      const card = await uploadImageAsCard(file, mergedOptions);

      // Save to storage
      await upsertCard(card);

      console.log('[useImageUpload] Image uploaded successfully:', card.id);

      // Call success callback
      if (onSuccess) {
        onSuccess(card);
      }

      return card;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('[useImageUpload] Upload error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [onSuccess, defaultOptions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleImageUpload,
    isUploading,
    error,
    clearError
  };
}
