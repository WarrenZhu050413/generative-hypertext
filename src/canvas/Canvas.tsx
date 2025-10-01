import React, { useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './keyboardShortcuts.css';
import { CardNode } from './CardNode';
import { Toolbar } from './Toolbar';
import { useCanvasState } from './useCanvasState';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { SettingsPanel } from './SettingsPanel';
import { FloatingWindow } from '@/components/FloatingWindow';
import { windowManager } from '@/services/windowManager';
import {
  globalShortcutManager,
  KeyboardShortcut,
  loadShortcutsConfig,
  mergeShortcutsConfig,
} from '@/utils/keyboardShortcuts';
import type { WindowState } from '@/types/window';

// Register custom node types
const nodeTypes = {
  cardNode: CardNode,
};

function CanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    cards,
    filteredCards,
    isLoading,
    error,
    stats,
    filters,
    setFilters,
    availableDomains,
    availableTags,
    refreshStats,
  } = useCanvasState();

  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const toolbarRef = useRef<{ focusSearch: () => void; toggleFilters: () => void }>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [windows, setWindows] = useState(windowManager.getWindows());

  // Initialize keyboard shortcuts
  useEffect(() => {
    initializeShortcuts();
    globalShortcutManager.start();

    return () => {
      globalShortcutManager.stop();
    };
  }, []);

  // Initialize window manager and subscribe to changes
  useEffect(() => {
    windowManager.initialize();

    const unsubscribe = windowManager.subscribe(() => {
      setWindows(windowManager.getWindows());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const initializeShortcuts = async () => {
    try {
      const userConfig = await loadShortcutsConfig();
      const mergedShortcuts = mergeShortcutsConfig(userConfig);

      // Create shortcut handlers
      const shortcutList: KeyboardShortcut[] = Object.entries(mergedShortcuts).map(
        ([id, shortcut]) => ({
          ...shortcut,
          handler: createShortcutHandler(id),
        })
      );

      setShortcuts(shortcutList);

      // Register all shortcuts with the manager
      shortcutList.forEach((shortcut) => {
        globalShortcutManager.register(shortcut);
      });
    } catch (error) {
      console.error('Failed to initialize shortcuts:', error);
    }
  };

  const createShortcutHandler = (id: string) => {
    const handlers: Record<string, () => void> = {
      focusSearch: () => {
        toolbarRef.current?.focusSearch();
        showFeedback('Search focused');
      },
      toggleFilter: () => {
        toolbarRef.current?.toggleFilters();
        showFeedback('Filters toggled');
      },
      openNewTab: () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('canvas.html') });
        showFeedback('Opened in new tab');
      },
      escape: () => {
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
        } else if (showSettings) {
          setShowSettings(false);
        } else if (filters.searchQuery) {
          setFilters({ ...filters, searchQuery: '' });
          showFeedback('Search cleared');
        }
      },
      showHelp: () => {
        setShowKeyboardHelp(!showKeyboardHelp);
      },
      toggleStarred: () => {
        setFilters({ ...filters, starredOnly: !filters.starredOnly });
        showFeedback(filters.starredOnly ? 'Showing all cards' : 'Showing starred cards');
      },
      fitView: () => {
        fitView({ padding: 0.2, duration: 400 });
        showFeedback('View fitted');
      },
      zoomIn: () => {
        zoomIn();
        showFeedback('Zoomed in');
      },
      zoomOut: () => {
        zoomOut();
        showFeedback('Zoomed out');
      },
      // Tag filters 1-9
      tag1: () => handleTagFilter(0),
      tag2: () => handleTagFilter(1),
      tag3: () => handleTagFilter(2),
      tag4: () => handleTagFilter(3),
      tag5: () => handleTagFilter(4),
      tag6: () => handleTagFilter(5),
      tag7: () => handleTagFilter(6),
      tag8: () => handleTagFilter(7),
      tag9: () => handleTagFilter(8),
    };

    return handlers[id] || (() => console.log(`Unhandled shortcut: ${id}`));
  };

  const handleTagFilter = (index: number) => {
    const tag = availableTags[index];
    if (!tag) {
      showFeedback(`No tag at position ${index + 1}`);
      return;
    }

    const isSelected = filters.selectedTags.includes(tag);
    const newTags = isSelected
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];

    setFilters({ ...filters, selectedTags: newTags });
    showFeedback(`${isSelected ? 'Removed' : 'Added'} filter: #${tag}`);
  };

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 2000);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <div style={styles.loadingText}>Loading your canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠</div>
        <div style={styles.errorText}>{error}</div>
        <button
          style={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          style={styles.emptyIcon}
        >
          <rect
            x="20"
            y="30"
            width="80"
            height="60"
            rx="8"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M35 50H85M35 60H85M35 70H65"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div style={styles.emptyTitle}>Your canvas is empty</div>
        <div style={styles.emptyText}>
          Start clipping web content to see your cards appear here
        </div>
      </div>
    );
  }

  // Show "no results" state when filters are active but no cards match
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.starredOnly ||
    filters.selectedDomains.length > 0 ||
    filters.selectedTags.length > 0 ||
    filters.dateRange !== 'all';

  return (
    <>
      <Toolbar
        ref={toolbarRef}
        stats={stats}
        filters={filters}
        setFilters={setFilters}
        availableDomains={availableDomains}
        availableTags={availableTags}
        resultCount={filteredCards.length}
        totalCount={cards.length}
        onSettingsClick={handleOpenSettings}
      />

      {/* Keyboard shortcuts feedback */}
      {feedbackMessage && (
        <div style={styles.feedbackToast} role="alert" aria-live="polite">
          {feedbackMessage}
        </div>
      )}

      {/* Keyboard help overlay */}
      <KeyboardHelp
        shortcuts={shortcuts}
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      {/* Settings panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        stats={stats}
        onRefreshStats={refreshStats}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 1.5,
        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        {/* Chinese aesthetic background with paper texture */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1.5}
          color="rgba(184, 156, 130, 0.15)"
          style={{
            background: `
              linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 50%, #FAF7F2 100%),
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(184, 156, 130, 0.02) 10px, rgba(184, 156, 130, 0.02) 20px)
            `,
          }}
        />

        {/* MiniMap in bottom right corner */}
        <MiniMap
          nodeStrokeColor={() => '#8B7355'}
          nodeColor={() => '#F2EBE1'}
          nodeBorderRadius={8}
          style={{
            background: 'rgba(250, 247, 242, 0.9)',
            border: '1px solid rgba(184, 156, 130, 0.3)',
            borderRadius: '8px',
          }}
        />

        {/* Zoom and fit view controls */}
        <Controls
          style={{
            background: 'rgba(250, 247, 242, 0.95)',
            border: '1px solid rgba(184, 156, 130, 0.3)',
            borderRadius: '8px',
          }}
          showInteractive={false}
        />

        {/* No results overlay when filters are active */}
        {hasActiveFilters && filteredCards.length === 0 && (
          <div style={styles.noResultsOverlay}>
            <div style={styles.noResultsContent}>
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                style={styles.noResultsIcon}
              >
                <circle
                  cx="35"
                  cy="35"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M50 50L65 65"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M25 35L45 35M35 25L35 45"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </svg>
              <div style={styles.noResultsTitle}>No cards found</div>
              <div style={styles.noResultsText}>
                Try adjusting your search or filters
              </div>
            </div>
          </div>
        )}
      </ReactFlow>

      {/* Floating windows container */}
      <div id="floating-windows-container" style={styles.floatingWindowsContainer}>
        {windows.map((windowState: WindowState) => {
          const card = cards.find(c => c.id === windowState.cardId);
          if (!card) return null;

          return (
            <FloatingWindow
              key={windowState.cardId}
              card={card}
              windowState={windowState}
            />
          );
        })}
      </div>
    </>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <div style={styles.container}>
        <CanvasInner />
      </div>
    </ReactFlowProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#FAF7F2',
    position: 'relative',
  },
  floatingWindowsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 10,
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 50%, #FAF7F2 100%)',
    color: '#5C4D42',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(184, 156, 130, 0.2)',
    borderTop: '4px solid #D4AF37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '24px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#8B7355',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 50%, #FAF7F2 100%)',
    color: '#5C4D42',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorText: {
    fontSize: '16px',
    color: '#8B7355',
    marginBottom: '24px',
  },
  retryButton: {
    padding: '10px 24px',
    background: '#D4AF37',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 50%, #FAF7F2 100%)',
    color: '#5C4D42',
  },
  emptyIcon: {
    color: '#B89C82',
    marginBottom: '24px',
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#3E3226',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#8B7355',
    textAlign: 'center',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
  noResultsOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  noResultsContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    background: 'rgba(250, 247, 242, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(92, 77, 66, 0.15)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
  },
  noResultsIcon: {
    color: '#B89C82',
    marginBottom: '16px',
    opacity: 0.7,
  },
  noResultsTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#3E3226',
    marginBottom: '8px',
  },
  noResultsText: {
    fontSize: '14px',
    color: '#8B7355',
  },
  feedbackToast: {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    background: 'rgba(92, 77, 66, 0.95)',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: '0 4px 20px rgba(92, 77, 66, 0.3)',
    zIndex: 10001,
    animation: 'slideUpFade 0.3s ease-out',
    backdropFilter: 'blur(10px)',
  },
};