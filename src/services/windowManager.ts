/**
 * WindowManager - Manages all floating windows
 * Handles window lifecycle, z-index management, and state persistence
 */

import type { WindowState } from '@/types/window';
import type { Card } from '@/types/card';

type WindowChangeListener = () => void;

class WindowManager {
  private windows = new Map<string, WindowState>();
  private maxZIndex = 1000; // Start at 1000 (above React Flow)
  private listeners = new Set<WindowChangeListener>();

  /**
   * Open a new window for the given card
   * Auto-positions with cascade offset from existing windows
   */
  openWindow(cardId: string, card: Card): WindowState {
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Calculate cascade position
    const existingWindows = Array.from(this.windows.values());
    const offset = existingWindows.length * 30;

    const windowState: WindowState = {
      id: windowId,
      cardId,
      position: { x: 100 + offset, y: 100 + offset },
      size: { width: 500, height: 600 },
      isMinimized: false,
      zIndex: ++this.maxZIndex,
      chatInput: '',
      scrollPosition: 0,
      conversationMessages: card.conversation || [],
      isStreaming: false,
      formData: {},
      createdAt: Date.now(),
      lastInteractedAt: Date.now(),
    };

    this.windows.set(windowId, windowState);
    this.notifyListeners();
    this.debouncedSave();

    return windowState;
  }

  /**
   * Close window and remove from state
   */
  closeWindow(windowId: string): void {
    this.windows.delete(windowId);
    this.notifyListeners();
    this.debouncedSave();
  }

  /**
   * Minimize window (collapse to title bar)
   */
  minimizeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (!window) return;

    window.isMinimized = true;
    window.lastInteractedAt = Date.now();
    this.notifyListeners();
    this.debouncedSave();
  }

  /**
   * Maximize window (expand from title bar)
   */
  maximizeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (!window) return;

    window.isMinimized = false;
    window.lastInteractedAt = Date.now();
    this.notifyListeners();
    // No save needed - state change is instant
  }

  /**
   * Update window state (position, input, scroll, etc.)
   */
  updateWindowState(windowId: string, updates: Partial<WindowState>): void {
    const window = this.windows.get(windowId);
    if (!window) return;

    Object.assign(window, updates);
    window.lastInteractedAt = Date.now();
    this.notifyListeners();
    this.debouncedSave();
  }

  /**
   * Bring window to front (highest z-index)
   */
  bringToFront(windowId: string): void {
    const window = this.windows.get(windowId);
    if (!window) return;

    // Only update if not already on top
    if (window.zIndex < this.maxZIndex) {
      window.zIndex = ++this.maxZIndex;
      this.notifyListeners();
    }
  }

  /**
   * Get a specific window by ID
   */
  getWindow(windowId: string): WindowState | undefined {
    return this.windows.get(windowId);
  }

  /**
   * Get all windows sorted by z-index (lowest to highest)
   */
  getAllWindows(): WindowState[] {
    return Array.from(this.windows.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Get window count
   */
  getWindowCount(): number {
    return this.windows.size;
  }

  /**
   * Check if a card has an open window
   */
  hasWindowForCard(cardId: string): boolean {
    return Array.from(this.windows.values()).some((w) => w.cardId === cardId);
  }

  /**
   * Subscribe to window changes
   * Returns unsubscribe function
   */
  subscribe(callback: WindowChangeListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Debounced save to storage (500ms)
   */
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, 500);
  }

  /**
   * Save window states to chrome.storage.local
   */
  async saveToStorage(): Promise<void> {
    try {
      const windowsArray = Array.from(this.windows.values());
      await chrome.storage.local.set({
        nabokov_windows: windowsArray,
      });
      console.log('[WindowManager] Saved', windowsArray.length, 'windows to storage');
    } catch (error) {
      console.error('[WindowManager] Failed to save windows:', error);
    }
  }

  /**
   * Load window states from chrome.storage.local
   */
  async loadFromStorage(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['nabokov_windows']);
      const windowsArray: WindowState[] = result.nabokov_windows || [];

      this.windows.clear();
      windowsArray.forEach((w: WindowState) => {
        this.windows.set(w.id, w);
        this.maxZIndex = Math.max(this.maxZIndex, w.zIndex);
      });

      console.log('[WindowManager] Loaded', windowsArray.length, 'windows from storage');
      this.notifyListeners();
    } catch (error) {
      console.error('[WindowManager] Failed to load windows:', error);
    }
  }

  /**
   * Close all minimized windows (cleanup)
   */
  closeAllMinimized(): void {
    const minimized = Array.from(this.windows.values()).filter((w) => w.isMinimized);
    minimized.forEach((w) => this.windows.delete(w.id));

    if (minimized.length > 0) {
      console.log('[WindowManager] Closed', minimized.length, 'minimized windows');
      this.notifyListeners();
      this.debouncedSave();
    }
  }
}

// Singleton instance
export const windowManager = new WindowManager();
