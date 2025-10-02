/**
 * FilterBar Component - Unified filtering UI
 *
 * Provides search and filter controls for cards
 */

import React, { useState, useEffect, useRef } from 'react';
import type { FilterState } from '../../services/filterService';

export interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableDomains: string[];
  availableTags: string[];
  compact?: boolean;
  resultCount?: number;
  totalCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  availableDomains,
  availableTags,
  compact = false,
  resultCount,
  totalCount,
}) => {
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, searchQuery: searchInput });
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const toggleStarred = () => {
    onFiltersChange({ ...filters, starredOnly: !filters.starredOnly });
  };

  const toggleDomain = (domain: string) => {
    const newDomains = filters.selectedDomains.includes(domain)
      ? filters.selectedDomains.filter(d => d !== domain)
      : [...filters.selectedDomains, domain];
    onFiltersChange({ ...filters, selectedDomains: newDomains });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    onFiltersChange({ ...filters, selectedTags: newTags });
  };

  const setDateRange = (range: FilterState['dateRange']) => {
    onFiltersChange({ ...filters, dateRange: range });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    onFiltersChange({
      searchQuery: '',
      starredOnly: false,
      selectedDomains: [],
      selectedTags: [],
      dateRange: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.starredOnly ||
    filters.selectedDomains.length > 0 ||
    filters.selectedTags.length > 0 ||
    filters.dateRange !== 'all';

  return (
    <div style={compact ? styles.containerCompact : styles.container}>
      {/* Search Bar */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search cards..."
          value={searchInput}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} style={styles.clearButton}>
            ✕
          </button>
        )}
      </div>

      {/* Result Count */}
      {resultCount !== undefined && totalCount !== undefined && (
        <div style={styles.resultCount}>
          {resultCount} / {totalCount} cards
        </div>
      )}

      {/* Quick Filters */}
      <div style={styles.quickFilters}>
        <button
          onClick={toggleStarred}
          style={{
            ...styles.filterButton,
            ...(filters.starredOnly ? styles.filterButtonActive : {}),
          }}
        >
          ⭐ Starred
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={styles.filterButton}
        >
          {showAdvanced ? '▼' : '▶'} Advanced
        </button>

        {hasActiveFilters && (
          <button onClick={clearAllFilters} style={styles.clearAllButton}>
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={styles.advancedFilters}>
          {/* Domains */}
          {availableDomains.length > 0 && (
            <div style={styles.filterSection}>
              <div style={styles.filterLabel}>Domains:</div>
              <div style={styles.filterOptions}>
                {availableDomains.map(domain => (
                  <button
                    key={domain}
                    onClick={() => toggleDomain(domain)}
                    style={{
                      ...styles.tagButton,
                      ...(filters.selectedDomains.includes(domain) ? styles.tagButtonActive : {}),
                    }}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div style={styles.filterSection}>
              <div style={styles.filterLabel}>Tags:</div>
              <div style={styles.filterOptions}>
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      ...styles.tagButton,
                      ...(filters.selectedTags.includes(tag) ? styles.tagButtonActive : {}),
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Date Range:</div>
            <select
              value={filters.dateRange}
              onChange={(e) => setDateRange(e.target.value as FilterState['dateRange'])}
              style={styles.select}
            >
              <option value="all">All Time</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  containerCompact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
  },
  searchBar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  clearButton: {
    position: 'absolute',
    right: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#999',
  },
  resultCount: {
    fontSize: '13px',
    color: '#666',
  },
  quickFilters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    background: '#FFD700',
    borderColor: '#D4AF37',
    fontWeight: 600,
  },
  clearAllButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    background: '#f44336',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
  },
  advancedFilters: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '6px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
  },
  filterOptions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  tagButton: {
    padding: '4px 10px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  },
  tagButtonActive: {
    background: '#4CAF50',
    color: 'white',
    borderColor: '#4CAF50',
  },
  select: {
    padding: '6px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
  },
};
