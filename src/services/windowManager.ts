/**
 * WindowManager service for managing floating windows
 */

import type { Card } from '@/types/card';
import type { WindowState, SerializedWindowState } from '@/types/window';
import { saveWindowStates, loadWindowStates } from '@/utils/windowStorage';
import { chatService } from './chatService';

/**
 * WindowManager service
 * Manages all floating windows, their state, and z-index ordering
 */
export class WindowManager {
  private windows = new Map<string, WindowState>();
  private maxZIndex = 1000;
  private saveDebounceTimer: number | null = null;
  private listeners = new Set<() => void>();

  /**
   * Initialize the window manager
   * Load saved window states from storage
   */
  async initialize(): Promise<void> {
    const saved = await loadWindowStates();

    // Restore windows (but don't auto-open them)
    // Windows are opened on demand when user clicks "Open as Window"
    console.log('[WindowManager] Loaded', saved.length, 'saved window states');
  }

  /**
   * Open a window for a card
   * If window already exists, bring it to front
   */
  async openWindow(card: Card): Promise<void> {
    const existingWindow = this.windows.get(card.id);

    if (existingWindow) {
      // Window already exists
      if (existingWindow.minimized) {
        // Restore minimized window
        this.maximizeWindow(card.id);
      } else {
        // Just bring to front
        this.bringToFront(card.id);
      }
      return;
    }

    // Load conversation for this card
    await chatService.loadConversation(card.id);

    // Create new window state
    const windowState: WindowState = {
      cardId: card.id,
      position: this.calculateCascadePosition(),
      size: { width: 600, height: 500 },
      minimized: false,
      zIndex: ++this.maxZIndex,
      chatInput: '',
      conversationMessages: card.conversation || [],
      scrollPosition: 0,
      isStreaming: false
    };

    this.windows.set(card.id, windowState);
    this.notifyListeners();
    this.debouncedSave();
  }

  /**
   * Close a window
   */
  closeWindow(cardId: string): void {
    this.windows.delete(cardId);
    this.notifyListeners();
    this.debouncedSave();
  }

  /**
   * Minimize a window (sets minimized flag, doesn't unmount)
   */
  minimizeWindow(cardId: string): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.minimized = true;
      this.notifyListeners();
      this.debouncedSave();
    }
  }

  /**
   * Maximize a window (unsets minimized flag)
   */
  maximizeWindow(cardId: string): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.minimized = false;
      this.bringToFront(cardId);
      this.notifyListeners();
      this.debouncedSave();
    }
  }

  /**
   * Bring window to front
   */
  bringToFront(cardId: string): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.zIndex = ++this.maxZIndex;
      this.notifyListeners();
    }
  }

  /**
   * Update window position
   */
  updatePosition(cardId: string, x: number, y: number): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.position = { x, y };
      this.notifyListeners();
      this.debouncedSave();
    }
  }

  /**
   * Update window size
   */
  updateSize(cardId: string, width: number, height: number): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.size = { width, height };
      this.notifyListeners();
      this.debouncedSave();
    }
  }

  /**
   * Update chat input
   */
  updateChatInput(cardId: string, input: string): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.chatInput = input;
      this.notifyListeners();
      this.debouncedSave();
    }
  }

  /**
   * Update conversation messages
   */
  updateConversationMessages(cardId: string, messages: any[]): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.conversationMessages = messages;
      this.notifyListeners();
    }
  }

  /**
   * Update streaming state
   */
  updateStreamingState(cardId: string, isStreaming: boolean): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.isStreaming = isStreaming;
      this.notifyListeners();
    }
  }

  /**
   * Update scroll position
   */
  updateScrollPosition(cardId: string, position: number): void {
    const window = this.windows.get(cardId);
    if (window) {
      window.scrollPosition = position;
      this.debouncedSave();
    }
  }

  /**
   * Get all windows
   */
  getWindows(): WindowState[] {
    return Array.from(this.windows.values());
  }

  /**
   * Get window by card ID
   */
  getWindow(cardId: string): WindowState | undefined {
    return this.windows.get(cardId);
  }

  /**
   * Check if window is open
   */
  isWindowOpen(cardId: string): boolean {
    return this.windows.has(cardId);
  }

  /**
   * Subscribe to window state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Calculate cascade position for new window
   */
  private calculateCascadePosition(): { x: number; y: number } {
    const openWindows = this.getWindows().filter(w => !w.minimized);
    const offset = openWindows.length * 30;

    return {
      x: 100 + offset,
      y: 100 + offset
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Debounced save to storage
   */
  private debouncedSave(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = window.setTimeout(() => {
      this.save();
    }, 500);
  }

  /**
   * Save window states to storage
   */
  private async save(): Promise<void> {
    const serialized: SerializedWindowState[] = Array.from(this.windows.values()).map(w => ({
      cardId: w.cardId,
      position: w.position,
      size: w.size,
      minimized: w.minimized,
      chatInput: w.chatInput,
      scrollPosition: w.scrollPosition
    }));

    await saveWindowStates(serialized);
  }
}

// Singleton instance
export const windowManager = new WindowManager();
