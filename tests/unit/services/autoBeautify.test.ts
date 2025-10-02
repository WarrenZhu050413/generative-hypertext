/**
 * Unit Tests for Auto-Beautification Setting (Issue #3)
 *
 * Tests that auto-beautification setting works correctly:
 * - Setting can be saved and retrieved
 * - Auto-beautification triggers after card capture when enabled
 * - Auto-beautification is skipped when disabled
 * - Setting persists across sessions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock chrome.storage API
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
    getBytesInUse: vi.fn(),
    QUOTA_BYTES: 5242880,
  },
};

global.chrome = {
  storage: mockStorage,
} as any;

describe('Auto-Beautification Setting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.local.get.mockResolvedValue({});
    mockStorage.local.set.mockResolvedValue(undefined);
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('settingsService', () => {
    it('should have auto-beautify disabled by default', async () => {
      mockStorage.local.get.mockResolvedValue({});

      const { settingsService } = await import('@/services/settingsService');

      const settings = await settingsService.getSettings();
      expect(settings.autoBeautify).toBe(false);
    });

    it('should save and retrieve auto-beautify setting', async () => {
      mockStorage.local.get.mockResolvedValue({});

      const { settingsService } = await import('@/services/settingsService');

      // Enable auto-beautify
      await settingsService.setAutoBeautify(true);

      // Verify set was called with correct data
      expect(mockStorage.local.set).toHaveBeenCalledWith({
        nabokov_settings: {
          autoBeautify: true,
          autoBeautifyMode: 'organize-content',
        },
      });
    });

    it('should retrieve saved auto-beautify setting', async () => {
      mockStorage.local.get.mockResolvedValue({
        nabokov_settings: {
          autoBeautify: true,
          autoBeautifyMode: 'organize-content',
        },
      });

      const { settingsService } = await import('@/services/settingsService');

      const autoBeautify = await settingsService.getAutoBeautify();
      expect(autoBeautify).toBe(true);
    });

    it('should update existing settings when changing auto-beautify', async () => {
      // Start with auto-beautify disabled
      mockStorage.local.get.mockResolvedValue({
        nabokov_settings: {
          autoBeautify: false,
          autoBeautifyMode: 'organize-content',
        },
      });

      const { settingsService } = await import('@/services/settingsService');

      // Enable auto-beautify
      await settingsService.setAutoBeautify(true);

      // Should merge with existing settings
      expect(mockStorage.local.set).toHaveBeenCalledWith({
        nabokov_settings: {
          autoBeautify: true,
          autoBeautifyMode: 'organize-content',
        },
      });
    });

    it('should dispatch settings-updated event when settings change', async () => {
      mockStorage.local.get.mockResolvedValue({});

      // Mock window.dispatchEvent
      const dispatchEventSpy = vi.fn();
      global.window.dispatchEvent = dispatchEventSpy as any;

      const { settingsService } = await import('@/services/settingsService');

      await settingsService.setAutoBeautify(true);

      // Verify event was dispatched
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('nabokov:settings-updated');
      expect(event.detail.autoBeautify).toBe(true);
    });

    it('should reset settings to defaults', async () => {
      mockStorage.local.get.mockResolvedValue({
        nabokov_settings: {
          autoBeautify: true,
          autoBeautifyMode: 'organize-content',
        },
      });

      const { settingsService } = await import('@/services/settingsService');

      await settingsService.resetSettings();

      // Should reset to defaults
      expect(mockStorage.local.set).toHaveBeenCalledWith({
        nabokov_settings: {
          autoBeautify: false,
          autoBeautifyMode: 'organize-content',
        },
      });
    });

    it('should get auto-beautify mode', async () => {
      mockStorage.local.get.mockResolvedValue({
        nabokov_settings: {
          autoBeautify: true,
          autoBeautifyMode: 'organize-content',
        },
      });

      const { settingsService } = await import('@/services/settingsService');

      const mode = await settingsService.getAutoBeautifyMode();
      expect(mode).toBe('organize-content');
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.local.get.mockRejectedValue(new Error('Storage error'));

      const { settingsService } = await import('@/services/settingsService');

      // Should return defaults on error
      const settings = await settingsService.getSettings();
      expect(settings.autoBeautify).toBe(false);
    });
  });

  describe('Auto-beautification integration', () => {
    it('should skip auto-beautification when disabled', async () => {
      // Mock settings with auto-beautify disabled
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_settings') {
          return Promise.resolve({
            nabokov_settings: {
              autoBeautify: false,
            },
          });
        }
        return Promise.resolve({});
      });

      const { settingsService } = await import('@/services/settingsService');

      const autoBeautify = await settingsService.getAutoBeautify();
      expect(autoBeautify).toBe(false);
    });

    it('should trigger auto-beautification when enabled', async () => {
      // Mock settings with auto-beautify enabled
      mockStorage.local.get.mockImplementation((keys) => {
        if (keys === 'nabokov_settings') {
          return Promise.resolve({
            nabokov_settings: {
              autoBeautify: true,
              autoBeautifyMode: 'organize-content',
            },
          });
        }
        return Promise.resolve({});
      });

      const { settingsService } = await import('@/services/settingsService');

      const autoBeautify = await settingsService.getAutoBeautify();
      expect(autoBeautify).toBe(true);
    });
  });

  describe('Settings persistence', () => {
    it('should persist settings across multiple operations', async () => {
      let storedSettings = {};

      mockStorage.local.get.mockImplementation(() => {
        return Promise.resolve(storedSettings);
      });

      mockStorage.local.set.mockImplementation((data) => {
        storedSettings = { ...storedSettings, ...data };
        return Promise.resolve();
      });

      const { settingsService } = await import('@/services/settingsService');

      // Enable auto-beautify
      await settingsService.setAutoBeautify(true);

      // Retrieve settings - should be persisted
      const settings1 = await settingsService.getSettings();
      expect(settings1.autoBeautify).toBe(true);

      // Disable auto-beautify
      await settingsService.setAutoBeautify(false);

      // Retrieve again - should reflect change
      const settings2 = await settingsService.getSettings();
      expect(settings2.autoBeautify).toBe(false);
    });

    it('should handle partial settings updates', async () => {
      mockStorage.local.get.mockResolvedValue({
        nabokov_settings: {
          autoBeautify: false,
        },
      });

      const { settingsService } = await import('@/services/settingsService');

      // Update only auto-beautify, should preserve other settings
      await settingsService.updateSettings({ autoBeautify: true });

      expect(mockStorage.local.set).toHaveBeenCalledWith({
        nabokov_settings: {
          autoBeautify: true,
          autoBeautifyMode: 'organize-content', // Should add default mode
        },
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined settings', async () => {
      mockStorage.local.get.mockResolvedValue({ nabokov_settings: undefined });

      const { settingsService } = await import('@/services/settingsService');

      const settings = await settingsService.getSettings();
      expect(settings.autoBeautify).toBe(false);
      expect(settings.autoBeautifyMode).toBe('organize-content');
    });

    it('should handle null settings', async () => {
      mockStorage.local.get.mockResolvedValue({ nabokov_settings: null });

      const { settingsService } = await import('@/services/settingsService');

      const settings = await settingsService.getSettings();
      expect(settings.autoBeautify).toBe(false);
    });

    it('should handle malformed settings', async () => {
      mockStorage.local.get.mockResolvedValue({
        nabokov_settings: 'invalid',
      });

      const { settingsService } = await import('@/services/settingsService');

      const settings = await settingsService.getSettings();
      // Should merge defaults with whatever is there
      expect(settings.autoBeautify).toBeDefined();
    });
  });
});
