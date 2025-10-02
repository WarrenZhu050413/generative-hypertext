/**
 * useCards Hook - Centralized card loading and management
 *
 * Provides card state with automatic refresh on storage changes
 */

import { useState, useEffect, useCallback } from 'react';
import type { Card } from '@/types/card';
import { loadAllCards, getStorageStats } from '../services/cardService';

export interface StorageStats {
  totalCards: number;
  stashedCards: number;
  bytesUsed: number;
  quotaBytes: number;
}

export interface UseCardsReturn {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  refreshCards: () => Promise<void>;
  stats: StorageStats | null;
}

/**
 * Hook for loading and managing cards
 *
 * @param includeStashed - Whether to include stashed cards
 * @returns Card state and control functions
 */
export function useCards(includeStashed: boolean = false): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StorageStats | null>(null);

  const refreshCards = useCallback(async () => {
    try {
      console.log('[useCards] Refreshing cards...');
      setIsLoading(true);
      setError(null);

      const loadedCards = await loadAllCards(includeStashed);
      setCards(loadedCards);

      // Load stats
      const loadedStats = await getStorageStats();
      setStats(loadedStats);

      console.log('[useCards] Cards loaded:', loadedCards.length);
    } catch (err) {
      console.error('[useCards] Error loading cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setIsLoading(false);
    }
  }, [includeStashed]);

  // Initial load
  useEffect(() => {
    refreshCards();
  }, [refreshCards]);

  // Listen for card updates (local events)
  useEffect(() => {
    const handleCardUpdate = () => {
      console.log('[useCards] Received card update event');
      refreshCards();
    };

    window.addEventListener('nabokov:cards-updated', handleCardUpdate);
    window.addEventListener('nabokov:stash-updated', handleCardUpdate);

    return () => {
      window.removeEventListener('nabokov:cards-updated', handleCardUpdate);
      window.removeEventListener('nabokov:stash-updated', handleCardUpdate);
    };
  }, [refreshCards]);

  // Listen for runtime messages (cross-context)
  useEffect(() => {
    const handleRuntimeMessage = (message: any) => {
      if (
        message.type === 'CARD_UPDATED' ||
        message.type === 'CARD_CREATED' ||
        message.type === 'CARD_DELETED' ||
        message.type === 'CARD_STASHED' ||
        message.type === 'CARD_RESTORED' ||
        message.type === 'STASH_UPDATED'
      ) {
        console.log('[useCards] Received runtime message:', message.type);
        refreshCards();
      }
    };

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    };
  }, [refreshCards]);

  return {
    cards,
    isLoading,
    error,
    refreshCards,
    stats
  };
}
