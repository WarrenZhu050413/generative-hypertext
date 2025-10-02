/**
 * Unit tests for Filter Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractDomains,
  extractTags,
  filterCards,
  saveFilters,
  loadFilters,
  DEFAULT_FILTERS,
  type FilterState,
} from '@/shared/services/filterService';
import type { Card } from '@/types/card';

// Mock chrome.storage.session
const mockStorageSession = {
  get: vi.fn(),
  set: vi.fn(),
};

global.chrome = {
  storage: {
    session: mockStorageSession,
  },
} as any;

describe('FilterService', () => {
  let sampleCards: Card[];

  beforeEach(() => {
    vi.clearAllMocks();

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    sampleCards = [
      {
        id: 'card-1',
        content: '<p>JavaScript tutorial content</p>',
        metadata: {
          title: 'JavaScript Basics',
          domain: 'example.com',
          url: 'https://example.com/js',
          favicon: '📄',
          timestamp: now,
        },
        starred: true,
        tags: ['javascript', 'tutorial'],
        createdAt: now - (5 * dayMs), // 5 days ago
        updatedAt: now,
      },
      {
        id: 'card-2',
        content: '<p>TypeScript advanced concepts</p>',
        metadata: {
          title: 'TypeScript Deep Dive',
          domain: 'example.org',
          url: 'https://example.org/ts',
          favicon: '📄',
          timestamp: now,
        },
        starred: false,
        tags: ['typescript', 'advanced'],
        createdAt: now - (10 * dayMs), // 10 days ago
        updatedAt: now,
      },
      {
        id: 'card-3',
        content: '<p>React hooks guide</p>',
        metadata: {
          title: 'React Hooks',
          domain: 'example.com',
          url: 'https://example.com/react',
          favicon: '📄',
          timestamp: now,
        },
        starred: true,
        tags: ['react', 'javascript'],
        createdAt: now - (40 * dayMs), // 40 days ago
        updatedAt: now,
      },
      {
        id: 'card-4',
        content: '<p>Python basics</p>',
        metadata: {
          title: 'Python Introduction',
          domain: 'python.org',
          url: 'https://python.org/intro',
          favicon: '📄',
          timestamp: now,
        },
        starred: false,
        tags: [], // No tags
        createdAt: now - (2 * dayMs), // 2 days ago
        updatedAt: now,
      },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('extractDomains', () => {
    it('should extract unique domains', () => {
      const domains = extractDomains(sampleCards);

      expect(domains).toEqual(['example.com', 'example.org', 'python.org']);
    });

    it('should return sorted domains', () => {
      const domains = extractDomains(sampleCards);

      expect(domains).toEqual([...domains].sort());
    });

    it('should return empty array for no cards', () => {
      const domains = extractDomains([]);

      expect(domains).toEqual([]);
    });

    it('should handle duplicate domains', () => {
      const cards = [sampleCards[0], sampleCards[2]]; // Both from example.com
      const domains = extractDomains(cards);

      expect(domains).toEqual(['example.com']);
    });
  });

  describe('extractTags', () => {
    it('should extract unique tags', () => {
      const tags = extractTags(sampleCards);

      expect(tags).toContain('javascript');
      expect(tags).toContain('typescript');
      expect(tags).toContain('react');
      expect(tags).toContain('tutorial');
      expect(tags).toContain('advanced');
    });

    it('should return sorted tags', () => {
      const tags = extractTags(sampleCards);

      expect(tags).toEqual([...tags].sort());
    });

    it('should handle cards with no tags', () => {
      const tags = extractTags(sampleCards);

      // Should not throw and should include tags from other cards
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should return empty array for no cards', () => {
      const tags = extractTags([]);

      expect(tags).toEqual([]);
    });

    it('should handle duplicate tags across cards', () => {
      const cards = [sampleCards[0], sampleCards[2]]; // Both have 'javascript'
      const tags = extractTags(cards);

      expect(tags.filter(t => t === 'javascript')).toHaveLength(1);
    });
  });

  describe('filterCards', () => {
    describe('Search filter', () => {
      it('should filter by title', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          searchQuery: 'JavaScript Basics',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('card-1');
      });

      it('should filter by domain', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          searchQuery: 'python.org',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('card-4');
      });

      it('should filter by content', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          searchQuery: 'hooks',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('card-3');
      });

      it('should filter by tags', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          searchQuery: 'tutorial',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('card-1');
      });

      it('should be case insensitive', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          searchQuery: 'TYPESCRIPT',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('card-2');
      });

      it('should handle empty search query', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          searchQuery: '',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(4); // All cards
      });

      it('should handle whitespace-only search query', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          searchQuery: '   ',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(4); // All cards
      });
    });

    describe('Starred filter', () => {
      it('should filter starred cards', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          starredOnly: true,
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(2);
        expect(filtered.every(c => c.starred)).toBe(true);
      });

      it('should not filter when starredOnly is false', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          starredOnly: false,
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(4); // All cards
      });
    });

    describe('Domain filter', () => {
      it('should filter by single domain', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          selectedDomains: ['example.com'],
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(2);
        expect(filtered.every(c => c.metadata.domain === 'example.com')).toBe(true);
      });

      it('should filter by multiple domains', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          selectedDomains: ['example.com', 'python.org'],
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(3);
      });

      it('should not filter when no domains selected', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          selectedDomains: [],
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(4); // All cards
      });
    });

    describe('Tags filter', () => {
      it('should filter by single tag', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          selectedTags: ['javascript'],
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(2); // card-1 and card-3
      });

      it('should filter by multiple tags (OR logic)', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          selectedTags: ['react', 'python'],
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(1); // card-3 (has react)
      });

      it('should handle cards with no tags', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          selectedTags: ['nonexistent'],
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(0);
      });

      it('should not filter when no tags selected', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          selectedTags: [],
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(4); // All cards
      });
    });

    describe('Date range filter', () => {
      it('should filter last 7 days', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          dateRange: 'last7days',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(2); // card-1 (5 days) and card-4 (2 days)
      });

      it('should filter last 30 days', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          dateRange: 'last30days',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(3); // All except card-3 (40 days)
      });

      it('should not filter when dateRange is all', () => {
        const filters: FilterState = {
          ...DEFAULT_FILTERS,
          dateRange: 'all',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(4); // All cards
      });
    });

    describe('Combined filters', () => {
      it('should apply multiple filters together', () => {
        const filters: FilterState = {
          searchQuery: 'Basics',
          starredOnly: true,
          selectedDomains: ['example.com'],
          selectedTags: [],
          dateRange: 'all',
        };

        const filtered = filterCards(sampleCards, filters);

        // Should match card-1: has "Basics" in title, is starred, from example.com
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('card-1');
      });

      it('should return empty when no cards match all filters', () => {
        const filters: FilterState = {
          searchQuery: 'JavaScript',
          starredOnly: true,
          selectedDomains: ['python.org'], // No JavaScript cards from python.org
          selectedTags: [],
          dateRange: 'all',
        };

        const filtered = filterCards(sampleCards, filters);

        expect(filtered).toHaveLength(0);
      });
    });
  });

  describe('saveFilters', () => {
    it('should save filters to session storage', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTERS,
        searchQuery: 'test',
        starredOnly: true,
      };

      await saveFilters(filters);

      expect(mockStorageSession.set).toHaveBeenCalledWith({
        nabokov_filters: filters,
      });
    });

    it('should use custom key', async () => {
      const filters: FilterState = DEFAULT_FILTERS;

      await saveFilters(filters, 'custom_key');

      expect(mockStorageSession.set).toHaveBeenCalledWith({
        custom_key: filters,
      });
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageSession.set.mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(saveFilters(DEFAULT_FILTERS)).resolves.not.toThrow();
    });
  });

  describe('loadFilters', () => {
    it('should load filters from session storage', async () => {
      const savedFilters: FilterState = {
        ...DEFAULT_FILTERS,
        searchQuery: 'test',
        starredOnly: true,
      };

      mockStorageSession.get.mockResolvedValueOnce({
        nabokov_filters: savedFilters,
      });

      const loaded = await loadFilters();

      expect(loaded).toEqual(savedFilters);
      expect(mockStorageSession.get).toHaveBeenCalledWith('nabokov_filters');
    });

    it('should return default filters when nothing saved', async () => {
      mockStorageSession.get.mockResolvedValueOnce({});

      const loaded = await loadFilters();

      expect(loaded).toEqual(DEFAULT_FILTERS);
    });

    it('should use custom key', async () => {
      mockStorageSession.get.mockResolvedValueOnce({
        custom_key: DEFAULT_FILTERS,
      });

      await loadFilters('custom_key');

      expect(mockStorageSession.get).toHaveBeenCalledWith('custom_key');
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageSession.get.mockRejectedValueOnce(new Error('Storage error'));

      const loaded = await loadFilters();

      expect(loaded).toEqual(DEFAULT_FILTERS);
    });
  });
});
