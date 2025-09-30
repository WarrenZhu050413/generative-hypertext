/**
 * Unit tests for keyboard shortcuts system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isMac,
  getModifierKey,
  formatModifier,
  formatShortcut,
  matchesShortcut,
  shouldPreventShortcut,
  KeyboardShortcutManager,
  DEFAULT_SHORTCUTS,
} from '../../src/utils/keyboardShortcuts';

describe('Keyboard Shortcuts Utilities', () => {
  describe('Platform Detection', () => {
    it('should detect Mac platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });
      expect(isMac()).toBe(true);
      expect(getModifierKey()).toBe('Cmd');
    });

    it('should detect non-Mac platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
      });
      expect(isMac()).toBe(false);
      expect(getModifierKey()).toBe('Ctrl');
    });
  });

  describe('Format Functions', () => {
    it('should format modifiers correctly', () => {
      expect(formatModifier('ctrl')).toBe('Ctrl');
      expect(formatModifier('alt')).toBe('Alt');
      expect(formatModifier('shift')).toBe('Shift');
      expect(formatModifier('meta')).toMatch(/Cmd|Ctrl/);
    });

    it('should format shortcuts correctly', () => {
      expect(formatShortcut('k', 'meta')).toMatch(/Cmd\+K|Ctrl\+K/);
      expect(formatShortcut('f')).toBe('F');
      expect(formatShortcut('Escape')).toBe('Escape');
    });
  });

  describe('Shortcut Matching', () => {
    it('should match key without modifier', () => {
      const event = new KeyboardEvent('keydown', { key: 's' });
      const shortcut = { key: 's' };
      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should match key with modifier', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      });
      const shortcut = { key: 'k', modifier: 'meta' as const };
      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should not match different keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'k' });
      const shortcut = { key: 'f' };
      expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should not match when modifier is missing', () => {
      const event = new KeyboardEvent('keydown', { key: 'k' });
      const shortcut = { key: 'k', modifier: 'meta' as const };
      expect(matchesShortcut(event, shortcut)).toBe(false);
    });
  });

  describe('Shortcut Prevention', () => {
    it('should prevent shortcuts in input elements', () => {
      const input = document.createElement('input');
      const result = shouldPreventShortcut(input);
      expect(result).toBe(true);
    });

    it('should prevent shortcuts in textarea', () => {
      const textarea = document.createElement('textarea');
      const result = shouldPreventShortcut(textarea);
      expect(result).toBe(true);
    });

    it('should prevent shortcuts in contenteditable', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      const result = shouldPreventShortcut(div);
      expect(result).toBe(true);
    });

    it('should not prevent shortcuts in regular elements', () => {
      const div = document.createElement('div');
      // In jsdom, contentEditable might not work as expected
      // Just check that it doesn't throw and returns a boolean
      const result = shouldPreventShortcut(div);
      expect(typeof result).toBe('boolean');
      if (result !== undefined) {
        expect(result).toBe(false);
      }
    });
  });

  describe('KeyboardShortcutManager', () => {
    let manager: KeyboardShortcutManager;

    beforeEach(() => {
      manager = new KeyboardShortcutManager();
    });

    it('should register shortcuts', () => {
      const handler = vi.fn();
      const shortcut = {
        id: 'test',
        key: 'k',
        modifier: 'meta' as const,
        description: 'Test shortcut',
        category: 'navigation' as const,
        handler,
      };

      manager.register(shortcut);
      expect(manager.get('test')).toEqual(shortcut);
    });

    it('should unregister shortcuts', () => {
      const handler = vi.fn();
      const shortcut = {
        id: 'test',
        key: 'k',
        modifier: 'meta' as const,
        description: 'Test shortcut',
        category: 'navigation' as const,
        handler,
      };

      manager.register(shortcut);
      manager.unregister('test');
      expect(manager.get('test')).toBeUndefined();
    });

    it('should get shortcuts by category', () => {
      const handler = vi.fn();
      const shortcut1 = {
        id: 'nav1',
        key: 'k',
        description: 'Navigation',
        category: 'navigation' as const,
        handler,
      };
      const shortcut2 = {
        id: 'filter1',
        key: 'f',
        description: 'Filter',
        category: 'filters' as const,
        handler,
      };

      manager.register(shortcut1);
      manager.register(shortcut2);

      const navShortcuts = manager.getByCategory('navigation');
      expect(navShortcuts).toHaveLength(1);
      expect(navShortcuts[0].id).toBe('nav1');
    });

    it('should enable/disable manager', () => {
      manager.setEnabled(false);
      expect(manager['enabled']).toBe(false);

      manager.setEnabled(true);
      expect(manager['enabled']).toBe(true);
    });
  });

  describe('Default Shortcuts', () => {
    it('should have all required shortcuts', () => {
      expect(DEFAULT_SHORTCUTS.focusSearch).toBeDefined();
      expect(DEFAULT_SHORTCUTS.toggleFilter).toBeDefined();
      expect(DEFAULT_SHORTCUTS.openNewTab).toBeDefined();
      expect(DEFAULT_SHORTCUTS.escape).toBeDefined();
      expect(DEFAULT_SHORTCUTS.showHelp).toBeDefined();
      expect(DEFAULT_SHORTCUTS.toggleStarred).toBeDefined();
    });

    it('should have tag shortcuts 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        expect(DEFAULT_SHORTCUTS[`tag${i}`]).toBeDefined();
        expect(DEFAULT_SHORTCUTS[`tag${i}`].key).toBe(String(i));
      }
    });

    it('should have correct categories', () => {
      expect(DEFAULT_SHORTCUTS.focusSearch.category).toBe('navigation');
      expect(DEFAULT_SHORTCUTS.toggleFilter.category).toBe('filters');
      expect(DEFAULT_SHORTCUTS.fitView.category).toBe('view');
    });
  });
});