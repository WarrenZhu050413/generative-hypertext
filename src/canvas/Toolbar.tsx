import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { StorageStats } from '@/types/card';
import type { FilterState } from './useCanvasState';

interface ToolbarProps {
  stats: StorageStats | null;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  availableDomains: string[];
  availableTags: string[];
  resultCount: number;
  totalCount: number;
  onSettingsClick?: () => void;
  onCreateNote?: () => void;
  onToggleConnectionMode?: () => void;
  connectionMode?: boolean;
}

export interface ToolbarRef {
  focusSearch: () => void;
  toggleFilters: () => void;
}

export const Toolbar = forwardRef<ToolbarRef, ToolbarProps>(({
  stats,
  filters,
  setFilters,
  availableDomains,
  availableTags,
  resultCount,
  totalCount,
  onSettingsClick,
  onCreateNote,
  onToggleConnectionMode,
  connectionMode,
}, ref) => {
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    },
    toggleFilters: () => {
      setShowFilters((prev) => !prev);
    },
  }));

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters({ ...filters, searchQuery: searchInput });
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

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters({ ...filters, searchQuery: '' });
  };

  const toggleStarredFilter = () => {
    setFilters({ ...filters, starredOnly: !filters.starredOnly });
  };

  const toggleDomain = (domain: string) => {
    const newDomains = filters.selectedDomains.includes(domain)
      ? filters.selectedDomains.filter(d => d !== domain)
      : [...filters.selectedDomains, domain];
    setFilters({ ...filters, selectedDomains: newDomains });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    setFilters({ ...filters, selectedTags: newTags });
  };

  const setDateRange = (range: 'all' | 'last7days' | 'last30days') => {
    setFilters({ ...filters, dateRange: range });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setFilters({
      searchQuery: '',
      starredOnly: false,
      selectedDomains: [],
      selectedTags: [],
      dateRange: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.starredOnly ||
    filters.selectedDomains.length > 0 ||
    filters.selectedTags.length > 0 ||
    filters.dateRange !== 'all';

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <>
      <div style={styles.toolbar}>
        {/* Left section: Search and Filters */}
        <div style={styles.section}>
          <div style={styles.searchContainer}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={styles.searchIcon}
            >
              <path
                d="M7 12C9.7614 12 12 9.7614 12 7C12 4.2386 9.7614 2 7 2C4.2386 2 2 4.2386 2 7C2 9.7614 4.2386 12 7 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M11 11L14 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search cards..."
              value={searchInput}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                style={styles.clearButton}
                title="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 2L10 10M10 2L2 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...styles.button,
              ...(showFilters || hasActiveFilters ? styles.buttonActive : {}),
            }}
            title="Filters"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 6H17M6 10H14M8 14H12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {hasActiveFilters && <div style={styles.filterBadge} />}
          </button>

          <button
            onClick={onCreateNote}
            style={styles.newNoteButton}
            title="Create new note (Cmd+N)"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2H10L16 8V16H2V2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M10 2V8H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M5 11H13M5 14H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span style={styles.newNoteText}>New Note</span>
          </button>

          <button
            onClick={onToggleConnectionMode}
            style={{
              ...styles.connectionButton,
              ...(connectionMode ? styles.connectionButtonActive : {}),
            }}
            title="Connect cards (Press C)"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path
                d="M6 5L12 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
              />
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="currentColor" />
                </marker>
              </defs>
            </svg>
            <span style={styles.connectionButtonText}>Connect</span>
          </button>

          {/* Result count */}
          {hasActiveFilters && (
            <div style={styles.resultCount}>
              {resultCount} of {totalCount}
            </div>
          )}
        </div>

        {/* Center section: View controls */}
        <div style={styles.section}>
          <button
            onClick={() => zoomOut()}
            style={styles.button}
            title="Zoom Out"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 10H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={() => zoomIn()}
            style={styles.button}
            title="Zoom In"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 5V15M5 10H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
            style={styles.button}
            title="Fit View"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect
                x="3"
                y="3"
                width="14"
                height="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M7 7L10 10M13 7L10 10M10 10L7 13M10 10L13 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Right section: Stats */}
        <div style={styles.section}>
          {stats && (
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Cards:</span>
                <span style={styles.statValue}>{stats.totalCards}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Storage:</span>
                <span style={styles.statValue}>
                  {formatBytes(stats.bytesUsed)} / {formatBytes(stats.quotaBytes)}
                </span>
              </div>
            </div>
          )}
          <button style={styles.button} title="Settings" onClick={onSettingsClick}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.6193 11.3807 7.5 10 7.5C8.6193 7.5 7.5 8.6193 7.5 10C7.5 11.3807 8.6193 12.5 10 12.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M16.5 10C16.5 9.4 16.5 9.1 16.4 8.8L17.8 7.9C18 7.8 18.1 7.5 18 7.3L16.5 4.7C16.4 4.5 16.2 4.4 16 4.5L14.3 5.2C14 5 13.7 4.8 13.4 4.7L13.1 2.9C13.1 2.7 12.9 2.5 12.7 2.5H9.7C9.5 2.5 9.3 2.7 9.3 2.9L9 4.7C8.7 4.8 8.4 5 8.1 5.2L6.4 4.5C6.2 4.4 6 4.5 5.9 4.7L4.4 7.3C4.3 7.5 4.4 7.8 4.6 7.9L6 8.8C6 9.1 5.9 9.4 5.9 10C5.9 10.3 5.9 10.6 6 10.9L4.6 11.8C4.4 11.9 4.3 12.2 4.4 12.4L5.9 15C6 15.2 6.2 15.3 6.4 15.2L8.1 14.5C8.4 14.7 8.7 14.9 9 15L9.3 16.8C9.3 17 9.5 17.2 9.7 17.2H12.7C12.9 17.2 13.1 17 13.1 16.8L13.4 15C13.7 14.9 14 14.7 14.3 14.5L16 15.2C16.2 15.3 16.4 15.2 16.5 15L18 12.4C18.1 12.2 18 11.9 17.8 11.8L16.4 10.9C16.5 10.6 16.5 10.3 16.5 10Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterHeader}>
            <div style={styles.filterTitle}>Filters</div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={styles.clearAllButton}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div style={styles.filterChips}>
              {filters.starredOnly && (
                <div style={styles.filterChip}>
                  <span>Starred</span>
                  <button
                    onClick={toggleStarredFilter}
                    style={styles.chipRemove}
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.selectedDomains.map(domain => (
                <div key={domain} style={styles.filterChip}>
                  <span>{domain}</span>
                  <button
                    onClick={() => toggleDomain(domain)}
                    style={styles.chipRemove}
                  >
                    ×
                  </button>
                </div>
              ))}
              {filters.selectedTags.map(tag => (
                <div key={tag} style={styles.filterChip}>
                  <span>#{tag}</span>
                  <button
                    onClick={() => toggleTag(tag)}
                    style={styles.chipRemove}
                  >
                    ×
                  </button>
                </div>
              ))}
              {filters.dateRange !== 'all' && (
                <div style={styles.filterChip}>
                  <span>
                    {filters.dateRange === 'last7days' ? 'Last 7 days' : 'Last 30 days'}
                  </span>
                  <button
                    onClick={() => setDateRange('all')}
                    style={styles.chipRemove}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={styles.filterSections}>
            {/* Quick Filters */}
            <div style={styles.filterSection}>
              <div style={styles.filterSectionTitle}>Quick Filters</div>
              <button
                onClick={toggleStarredFilter}
                style={{
                  ...styles.filterOption,
                  ...(filters.starredOnly ? styles.filterOptionActive : {}),
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill={filters.starredOnly ? '#D4AF37' : 'none'}>
                  <path
                    d="M8 1L10.163 5.382L15 6.089L11.5 9.494L12.326 14.305L8 12.032L3.674 14.305L4.5 9.494L1 6.089L5.837 5.382L8 1Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span>Starred only</span>
              </button>
            </div>

            {/* Date Range */}
            <div style={styles.filterSection}>
              <div style={styles.filterSectionTitle}>Date Range</div>
              <div style={styles.filterOptions}>
                <button
                  onClick={() => setDateRange('all')}
                  style={{
                    ...styles.filterOption,
                    ...(filters.dateRange === 'all' ? styles.filterOptionActive : {}),
                  }}
                >
                  All time
                </button>
                <button
                  onClick={() => setDateRange('last7days')}
                  style={{
                    ...styles.filterOption,
                    ...(filters.dateRange === 'last7days' ? styles.filterOptionActive : {}),
                  }}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => setDateRange('last30days')}
                  style={{
                    ...styles.filterOption,
                    ...(filters.dateRange === 'last30days' ? styles.filterOptionActive : {}),
                  }}
                >
                  Last 30 days
                </button>
              </div>
            </div>

            {/* Domains */}
            {availableDomains.length > 0 && (
              <div style={styles.filterSection}>
                <div style={styles.filterSectionTitle}>
                  Domains ({availableDomains.length})
                </div>
                <div style={styles.filterOptions}>
                  {availableDomains.slice(0, 10).map(domain => (
                    <button
                      key={domain}
                      onClick={() => toggleDomain(domain)}
                      style={{
                        ...styles.filterOption,
                        ...(filters.selectedDomains.includes(domain)
                          ? styles.filterOptionActive
                          : {}),
                      }}
                    >
                      {domain}
                    </button>
                  ))}
                  {availableDomains.length > 10 && (
                    <div style={styles.filterMore}>
                      +{availableDomains.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {availableTags.length > 0 && (
              <div style={styles.filterSection}>
                <div style={styles.filterSectionTitle}>
                  Tags ({availableTags.length})
                </div>
                <div style={styles.filterOptions}>
                  {availableTags.slice(0, 15).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        ...styles.filterOption,
                        ...(filters.selectedTags.includes(tag)
                          ? styles.filterOptionActive
                          : {}),
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                  {availableTags.length > 15 && (
                    <div style={styles.filterMore}>
                      +{availableTags.length - 15} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '12px 24px',
    background: 'rgba(250, 247, 242, 0.95)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(92, 77, 66, 0.15)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#8B7355',
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '8px 36px 8px 36px',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    width: '280px',
    background: 'rgba(255, 255, 255, 0.7)',
    color: '#3E3226',
    outline: 'none',
    transition: 'all 0.2s',
  },
  clearButton: {
    position: 'absolute',
    right: '8px',
    padding: '4px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#8B7355',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  button: {
    padding: '8px',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.7)',
    color: '#8B7355',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    position: 'relative',
  },
  buttonActive: {
    background: '#D4AF37',
    color: 'white',
    borderColor: '#D4AF37',
  },
  filterBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#D4AF37',
    border: '2px solid rgba(250, 247, 242, 0.95)',
  },
  resultCount: {
    fontSize: '13px',
    color: '#8B7355',
    fontWeight: 600,
    padding: '0 8px',
  },
  stats: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
  },
  statItem: {
    display: 'flex',
    gap: '6px',
  },
  statLabel: {
    color: '#8B7355',
    fontWeight: 500,
  },
  statValue: {
    color: '#3E3226',
    fontWeight: 600,
  },
  filterPanel: {
    position: 'absolute',
    top: 80,
    left: 20,
    width: '360px',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
    background: 'rgba(250, 247, 242, 0.98)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(92, 77, 66, 0.2)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    backdropFilter: 'blur(10px)',
    zIndex: 999,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(184, 156, 130, 0.2)',
  },
  filterTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#3E3226',
  },
  clearAllButton: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#8B7355',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  filterChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(184, 156, 130, 0.2)',
  },
  filterChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    background: 'rgba(212, 175, 55, 0.15)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#8B7355',
    fontWeight: 500,
  },
  chipRemove: {
    background: 'transparent',
    border: 'none',
    color: '#8B7355',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
    padding: '0 2px',
    transition: 'all 0.2s',
  },
  filterSections: {
    padding: '8px',
  },
  filterSection: {
    padding: '12px',
  },
  filterSectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#8B7355',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  filterOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(184, 156, 130, 0.2)',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#5C4D42',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontWeight: 500,
  },
  filterOptionActive: {
    background: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.5)',
    color: '#3E3226',
    fontWeight: 600,
  },
  filterMore: {
    fontSize: '12px',
    color: '#A89684',
    padding: '6px 12px',
    fontStyle: 'italic',
  },
  newNoteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    border: '1px solid rgba(139, 0, 0, 0.3)',
    borderRadius: '8px',
    background: 'rgba(139, 0, 0, 0.05)',
    color: '#8B0000',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: 600,
    fontSize: '14px',
  },
  newNoteText: {
    color: '#8B0000',
  },
  connectionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    borderRadius: '8px',
    background: 'rgba(212, 175, 55, 0.1)',
    color: '#8B7355',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: 600,
    fontSize: '14px',
  },
  connectionButtonActive: {
    background: '#D4AF37',
    color: 'white',
    borderColor: '#D4AF37',
  },
  connectionButtonText: {
    color: 'inherit',
  },
};