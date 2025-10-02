/**
 * Filter Service - Card filtering utilities
 *
 * Provides filtering logic for cards extracted from useCanvasState
 */

import type { Card } from '@/types/card';

export interface FilterState {
  searchQuery: string;
  starredOnly: boolean;
  selectedDomains: string[];
  selectedTags: string[];
  dateRange: 'all' | 'last7days' | 'last30days';
}

export const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  starredOnly: false,
  selectedDomains: [],
  selectedTags: [],
  dateRange: 'all'
};

/**
 * Extract unique domains from cards
 */
export function extractDomains(cards: Card[]): string[] {
  const domains = new Set(cards.map(card => card.metadata.domain));
  return Array.from(domains).sort();
}

/**
 * Extract unique tags from cards
 */
export function extractTags(cards: Card[]): string[] {
  const tags = new Set(cards.flatMap(card => card.tags || []));
  return Array.from(tags).sort();
}

/**
 * Filter cards based on filter state
 */
export function filterCards(cards: Card[], filters: FilterState): Card[] {
  let result = [...cards];

  // Search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(card => {
      const titleMatch = card.metadata.title.toLowerCase().includes(query);
      const domainMatch = card.metadata.domain.toLowerCase().includes(query);
      const contentMatch = card.content?.toLowerCase().includes(query) || false;
      const tagsMatch = (card.tags || []).some(tag => tag.toLowerCase().includes(query));
      return titleMatch || domainMatch || contentMatch || tagsMatch;
    });
  }

  // Starred filter
  if (filters.starredOnly) {
    result = result.filter(card => card.starred);
  }

  // Domain filter
  if (filters.selectedDomains.length > 0) {
    result = result.filter(card =>
      filters.selectedDomains.includes(card.metadata.domain)
    );
  }

  // Tags filter
  if (filters.selectedTags.length > 0) {
    result = result.filter(card =>
      filters.selectedTags.some(tag => (card.tags || []).includes(tag))
    );
  }

  // Date range filter
  if (filters.dateRange !== 'all') {
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const cutoff = filters.dateRange === 'last7days'
      ? now - (7 * msPerDay)
      : now - (30 * msPerDay);

    result = result.filter(card => card.createdAt >= cutoff);
  }

  return result;
}

/**
 * Save filters to session storage
 */
export async function saveFilters(filters: FilterState, key: string = 'nabokov_filters'): Promise<void> {
  try {
    await chrome.storage.session.set({ [key]: filters });
  } catch (error) {
    console.error('[filterService] Error saving filters:', error);
  }
}

/**
 * Load filters from session storage
 */
export async function loadFilters(key: string = 'nabokov_filters'): Promise<FilterState> {
  try {
    const result = await chrome.storage.session.get(key);
    return result[key] || DEFAULT_FILTERS;
  } catch (error) {
    console.error('[filterService] Error loading filters:', error);
    return DEFAULT_FILTERS;
  }
}
