/**
 * useCardOperations Hook - Unified CRUD operations on cards
 *
 * Provides card manipulation functions with error handling
 */

import { useState, useCallback } from 'react';
import type { Card } from '@/types/card';
import {
  stashCard as serviceStashCard,
  restoreCard as serviceRestoreCard,
  deleteCardPermanently as serviceDeleteCard,
  updateCard as serviceUpdateCard,
  duplicateCard as serviceDuplicateCard
} from '../services/cardService';

export interface UseCardOperationsReturn {
  stashCard: (cardId: string) => Promise<void>;
  restoreCard: (cardId: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  duplicateCard: (cardId: string) => Promise<Card>;
  isOperating: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for card operations (CRUD)
 *
 * @param onUpdate - Optional callback when any operation completes
 * @returns Card operation functions and state
 */
export function useCardOperations(
  onUpdate?: () => void
): UseCardOperationsReturn {
  const [isOperating, setIsOperating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stashCard = useCallback(async (cardId: string) => {
    setIsOperating(true);
    setError(null);

    try {
      await serviceStashCard(cardId);
      if (onUpdate) onUpdate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stash card';
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, [onUpdate]);

  const restoreCard = useCallback(async (cardId: string) => {
    setIsOperating(true);
    setError(null);

    try {
      await serviceRestoreCard(cardId);
      if (onUpdate) onUpdate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore card';
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, [onUpdate]);

  const deleteCard = useCallback(async (cardId: string) => {
    setIsOperating(true);
    setError(null);

    try {
      await serviceDeleteCard(cardId);
      if (onUpdate) onUpdate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete card';
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, [onUpdate]);

  const updateCard = useCallback(async (cardId: string, updates: Partial<Card>) => {
    setIsOperating(true);
    setError(null);

    try {
      await serviceUpdateCard(cardId, updates);
      if (onUpdate) onUpdate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update card';
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, [onUpdate]);

  const duplicateCard = useCallback(async (cardId: string): Promise<Card> => {
    setIsOperating(true);
    setError(null);

    try {
      const duplicate = await serviceDuplicateCard(cardId);
      if (onUpdate) onUpdate();
      return duplicate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate card';
      setError(errorMessage);
      throw err;
    } finally {
      setIsOperating(false);
    }
  }, [onUpdate]);

  return {
    stashCard,
    restoreCard,
    deleteCard,
    updateCard,
    duplicateCard,
    isOperating,
    error,
    clearError
  };
}
