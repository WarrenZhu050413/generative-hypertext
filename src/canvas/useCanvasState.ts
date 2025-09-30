import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Node, Edge, NodeChange, applyNodeChanges } from '@xyflow/react';
import type { Card, CanvasState, StorageStats } from '@/types/card';

const STORAGE_KEY = 'nabokov_canvas_state';
const CARDS_KEY = 'cards'; // Must match the key used in src/utils/storage.ts
const FILTERS_KEY = 'nabokov_filters';
const DEBOUNCE_DELAY = 2000; // 2 seconds

export interface FilterState {
  searchQuery: string;
  starredOnly: boolean;
  selectedDomains: string[];
  selectedTags: string[];
  dateRange: 'all' | 'last7days' | 'last30days';
}

interface UseCanvasStateReturn {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  cards: Card[];
  filteredCards: Card[];
  isLoading: boolean;
  error: string | null;
  stats: StorageStats | null;
  refreshStats: () => Promise<void>;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  availableDomains: string[];
  availableTags: string[];
}

/**
 * Custom hook for managing canvas state
 * - Loads cards from chrome.storage.local on mount
 * - Converts cards to React Flow nodes
 * - Auto-saves position/size changes with debouncing
 * - Provides storage stats
 * - Handles search and filter functionality
 */
export function useCanvasState(): UseCanvasStateReturn {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges] = useState<Edge[]>([]); // No connections between cards
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [filters, setFiltersState] = useState<FilterState>({
    searchQuery: '',
    starredOnly: false,
    selectedDomains: [],
    selectedTags: [],
    dateRange: 'all',
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingChangesRef = useRef<Map<string, Node>>(new Map());

  // Load initial canvas state and cards
  useEffect(() => {
    loadCanvasState();
  }, []);

  const loadCanvasState = async () => {
    try {
      console.log('[Canvas] Starting to load canvas state...');
      setIsLoading(true);
      setError(null);

      // Load cards and filters from chrome.storage
      console.log('[Canvas] Loading from keys:', [CARDS_KEY, STORAGE_KEY, FILTERS_KEY]);
      const result = await chrome.storage.local.get([CARDS_KEY, STORAGE_KEY, FILTERS_KEY]);
      console.log('[Canvas] Raw storage result:', result);

      const loadedCards: Card[] = result[CARDS_KEY] || [];
      const canvasState: CanvasState | undefined = result[STORAGE_KEY];
      const savedFilters: FilterState | undefined = result[FILTERS_KEY];

      console.log('[Canvas] Loaded cards count:', loadedCards.length);
      console.log('[Canvas] Loaded cards:', loadedCards);
      console.log('[Canvas] Canvas state:', canvasState);
      console.log('[Canvas] Saved filters:', savedFilters);

      setCards(loadedCards);

      // Restore saved filters
      if (savedFilters) {
        setFiltersState(savedFilters);
      }

      // Convert cards to React Flow nodes
      const flowNodes = loadedCards.map((card, index) =>
        cardToNode(card, index, canvasState)
      );

      console.log('[Canvas] Created React Flow nodes count:', flowNodes.length);
      console.log('[Canvas] React Flow nodes:', flowNodes);

      setNodes(flowNodes);
      console.log('[Canvas] Nodes state set');

      // Load storage stats
      await refreshStats();
      console.log('[Canvas] Canvas state loaded successfully');
    } catch (err) {
      console.error('[Canvas] Error loading canvas state:', err);
      setError(err instanceof Error ? err.message : 'Failed to load canvas state');
    } finally {
      setIsLoading(false);
      console.log('[Canvas] Loading complete, isLoading set to false');
    }
  };

  const refreshStats = async () => {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const result = await chrome.storage.local.get(CARDS_KEY);
      const cards: Card[] = result[CARDS_KEY] || [];

      setStats({
        totalCards: cards.length,
        bytesUsed: bytesInUse,
        quotaBytes: chrome.storage.local.QUOTA_BYTES,
      });
    } catch (err) {
      console.error('Failed to get storage stats:', err);
    }
  };

  /**
   * Convert Card to React Flow Node
   */
  const cardToNode = (card: Card, index: number, _canvasState?: CanvasState): Node => {
    // Use saved position or calculate grid position
    const position = card.position || calculateGridPosition(index);
    const size = card.size || { width: 320, height: 240 };

    return {
      id: card.id,
      type: 'cardNode',
      position,
      data: {
        card,
      },
      style: {
        width: size.width,
        height: size.height,
      },
    };
  };

  /**
   * Calculate initial grid position for cards
   * Arrange in a grid with spacing
   */
  const calculateGridPosition = (index: number) => {
    const columns = 4;
    const cardWidth = 320;
    const cardHeight = 240;
    const spacing = 40;

    const row = Math.floor(index / columns);
    const col = index % columns;

    return {
      x: col * (cardWidth + spacing) + 100,
      y: row * (cardHeight + spacing) + 100,
    };
  };

  /**
   * Handle node changes (position, size, selection)
   */
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);

      // Track nodes that need to be saved
      changes.forEach((change) => {
        if (
          change.type === 'position' &&
          change.position &&
          change.dragging === false
        ) {
          const node = updatedNodes.find(n => n.id === change.id);
          if (node) {
            pendingChangesRef.current.set(node.id, node);
          }
        } else if (change.type === 'dimensions') {
          const node = updatedNodes.find(n => n.id === change.id);
          if (node) {
            pendingChangesRef.current.set(node.id, node);
          }
        }
      });

      // Debounced save
      if (pendingChangesRef.current.size > 0) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveNodeChanges();
        }, DEBOUNCE_DELAY);
      }

      return updatedNodes;
    });
  }, []);

  /**
   * Save node position/size changes to storage
   */
  const saveNodeChanges = async () => {
    try {
      const nodesToSave = Array.from(pendingChangesRef.current.values());

      if (nodesToSave.length === 0) return;

      // Load current cards
      const result = await chrome.storage.local.get(CARDS_KEY);
      const currentCards: Card[] = result[CARDS_KEY] || [];

      // Update cards with new positions/sizes
      const updatedCards = currentCards.map(card => {
        const node = nodesToSave.find(n => n.id === card.id);
        if (node) {
          return {
            ...card,
            position: node.position,
            size: node.style
              ? {
                  width: typeof node.style.width === 'number' ? node.style.width : 320,
                  height: typeof node.style.height === 'number' ? node.style.height : 240,
                }
              : card.size,
            updatedAt: Date.now(),
          };
        }
        return card;
      });

      // Save updated cards
      await chrome.storage.local.set({ [CARDS_KEY]: updatedCards });

      // Clear pending changes
      pendingChangesRef.current.clear();

      console.log(`Saved position/size changes for ${nodesToSave.length} cards`);
    } catch (err) {
      console.error('Failed to save node changes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveNodeChanges(); // Save any pending changes
      }
    };
  }, []);

  // Save filters to session storage when they change
  useEffect(() => {
    const saveFilters = async () => {
      try {
        await chrome.storage.session.set({ [FILTERS_KEY]: filters });
      } catch (err) {
        console.error('Failed to save filters:', err);
      }
    };
    saveFilters();
  }, [filters]);

  // Extract unique domains from cards
  const availableDomains = useMemo(() => {
    const domains = new Set(cards.map(card => card.metadata.domain));
    return Array.from(domains).sort();
  }, [cards]);

  // Extract unique tags from cards
  const availableTags = useMemo(() => {
    const tags = new Set(cards.flatMap(card => card.tags));
    return Array.from(tags).sort();
  }, [cards]);

  // Filter cards based on current filters
  const filteredCards = useMemo(() => {
    let result = [...cards];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(card => {
        const titleMatch = card.metadata.title.toLowerCase().includes(query);
        const domainMatch = card.metadata.domain.toLowerCase().includes(query);
        const contentMatch = card.content.toLowerCase().includes(query);
        const tagsMatch = card.tags.some(tag => tag.toLowerCase().includes(query));
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
        filters.selectedTags.some(tag => card.tags.includes(tag))
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
  }, [cards, filters]);

  // Update nodes when filtered cards change
  useEffect(() => {
    const flowNodes = filteredCards.map((card, index) => {
      // Find existing node to preserve position
      const existingNode = nodes.find(n => n.id === card.id);
      if (existingNode) {
        return {
          ...existingNode,
          data: { card },
        };
      }
      return cardToNode(card, index);
    });
    setNodes(flowNodes);
  }, [filteredCards]);

  // Update filters handler
  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    cards,
    filteredCards,
    isLoading,
    error,
    stats,
    refreshStats,
    filters,
    setFilters,
    availableDomains,
    availableTags,
  };
}