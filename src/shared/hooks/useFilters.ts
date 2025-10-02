/**
 * useFilters Hook - Unified filtering logic
 *
 * Provides filtering state and filtered cards with optional persistence
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Card } from '@/types/card';
import {
  type FilterState,
  DEFAULT_FILTERS,
  filterCards,
  extractDomains,
  extractTags,
  saveFilters,
  loadFilters
} from '../services/filterService';

export interface UseFiltersReturn {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  filteredCards: Card[];
  availableDomains: string[];
  availableTags: string[];
  resetFilters: () => void;
}

/**
 * Hook for filtering cards
 *
 * @param cards - Cards to filter
 * @param persistKey - Optional key for session storage persistence
 * @returns Filter state and filtered cards
 */
export function useFilters(
  cards: Card[],
  persistKey?: string
): UseFiltersReturn {
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);

  // Load persisted filters on mount
  useEffect(() => {
    if (persistKey) {
      loadFilters(persistKey).then(loaded => {
        setFiltersState(loaded);
      });
    }
  }, [persistKey]);

  // Save filters when they change
  useEffect(() => {
    if (persistKey) {
      saveFilters(filters, persistKey);
    }
  }, [filters, persistKey]);

  // Extract available domains and tags
  const availableDomains = useMemo(() => extractDomains(cards), [cards]);
  const availableTags = useMemo(() => extractTags(cards), [cards]);

  // Apply filters
  const filteredCards = useMemo(
    () => filterCards(cards, filters),
    [cards, filters]
  );

  // Setter with callback support
  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
  }, []);

  // Reset to default
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    setFilters,
    filteredCards,
    availableDomains,
    availableTags,
    resetFilters
  };
}
