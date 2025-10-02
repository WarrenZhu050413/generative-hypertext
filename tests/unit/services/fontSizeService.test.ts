/**
 * Unit tests for fontSizeService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFontSize,
  setFontSize,
  getFontSizeValues,
  getAvailableFontSizes,
} from '@/services/fontSizeService';
import type { FontSize } from '@/types/settings';

// Mock chrome.storage.local
const mockStorage: { [key: string]: any } = {};
global.chrome = {
  storage: {
    local: {
      get: vi.fn((key: string | string[]) => {
        if (typeof key === 'string') {
          return Promise.resolve({ [key]: mockStorage[key] });
        }
        const result: any = {};
        key.forEach(k => {
          if (mockStorage[k] !== undefined) {
            result[k] = mockStorage[k];
          }
        });
        return Promise.resolve(result);
      }),
      set: vi.fn((items: { [key: string]: any }) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  },
} as any;

describe('fontSizeService', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  describe('getFontSize', () => {
    it('should return default font size (medium) when no setting exists', async () => {
      const fontSize = await getFontSize();
      expect(fontSize).toBe('medium');
    });

    it('should return stored font size when it exists', async () => {
      mockStorage['nabokov_font_size'] = 'small';
      const fontSize = await getFontSize();
      expect(fontSize).toBe('small');
    });

    it('should return medium for each valid font size value', async () => {
      const validSizes: FontSize[] = ['small', 'medium', 'large'];

      for (const size of validSizes) {
        mockStorage['nabokov_font_size'] = size;
        const fontSize = await getFontSize();
        expect(fontSize).toBe(size);
      }
    });

    it('should return default (medium) for invalid font size value', async () => {
      mockStorage['nabokov_font_size'] = 'invalid-size';
      const fontSize = await getFontSize();
      expect(fontSize).toBe('medium');
    });

    it('should handle storage errors gracefully', async () => {
      vi.spyOn(chrome.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'));
      const fontSize = await getFontSize();
      expect(fontSize).toBe('medium');
    });
  });

  describe('setFontSize', () => {
    it('should save font size to storage', async () => {
      await setFontSize('large');
      expect(mockStorage['nabokov_font_size']).toBe('large');
    });

    it('should save each valid font size', async () => {
      const validSizes: FontSize[] = ['small', 'medium', 'large'];

      for (const size of validSizes) {
        await setFontSize(size);
        expect(mockStorage['nabokov_font_size']).toBe(size);
      }
    });

    it('should call chrome.storage.local.set with correct key', async () => {
      await setFontSize('small');
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        nabokov_font_size: 'small',
      });
    });

    it('should throw error when storage fails', async () => {
      const storageError = new Error('Storage error');
      vi.spyOn(chrome.storage.local, 'set').mockRejectedValueOnce(storageError);
      await expect(setFontSize('large')).rejects.toThrow('Storage error');
    });
  });

  describe('getFontSizeValues', () => {
    it('should return correct values for small font size', () => {
      const values = getFontSizeValues('small');
      expect(values.content).toBe('11px');
      expect(values.title).toBe('12px');
      expect(values.h1).toBe('12px');
      expect(values.h2).toBe('11px');
      expect(values.h3).toBe('10px');
      expect(values.p).toBe('11px');
      expect(values.li).toBe('11px');
      expect(values.code).toBe('10px');
      expect(values.contentHTML).toBe('11px');
    });

    it('should return correct values for medium font size', () => {
      const values = getFontSizeValues('medium');
      expect(values.content).toBe('13px');
      expect(values.title).toBe('14px');
      expect(values.h1).toBe('14px');
      expect(values.h2).toBe('13px');
      expect(values.h3).toBe('12px');
      expect(values.p).toBe('13px');
      expect(values.li).toBe('13px');
      expect(values.code).toBe('12px');
      expect(values.contentHTML).toBe('13px');
    });

    it('should return correct values for large font size', () => {
      const values = getFontSizeValues('large');
      expect(values.content).toBe('15px');
      expect(values.title).toBe('16px');
      expect(values.h1).toBe('16px');
      expect(values.h2).toBe('15px');
      expect(values.h3).toBe('14px');
      expect(values.p).toBe('15px');
      expect(values.li).toBe('15px');
      expect(values.code).toBe('14px');
      expect(values.contentHTML).toBe('15px');
    });

    it('should return all required properties', () => {
      const values = getFontSizeValues('medium');
      expect(values).toHaveProperty('content');
      expect(values).toHaveProperty('title');
      expect(values).toHaveProperty('h1');
      expect(values).toHaveProperty('h2');
      expect(values).toHaveProperty('h3');
      expect(values).toHaveProperty('p');
      expect(values).toHaveProperty('li');
      expect(values).toHaveProperty('code');
      expect(values).toHaveProperty('contentHTML');
    });
  });

  describe('getAvailableFontSizes', () => {
    it('should return array of available font sizes', () => {
      const sizes = getAvailableFontSizes();
      expect(sizes).toEqual(['small', 'medium', 'large']);
    });

    it('should return array with 3 elements', () => {
      const sizes = getAvailableFontSizes();
      expect(sizes.length).toBe(3);
    });

    it('should include all valid font sizes', () => {
      const sizes = getAvailableFontSizes();
      expect(sizes).toContain('small');
      expect(sizes).toContain('medium');
      expect(sizes).toContain('large');
    });
  });

  describe('Integration: getFontSize and setFontSize', () => {
    it('should retrieve the same value that was set', async () => {
      await setFontSize('small');
      const retrieved = await getFontSize();
      expect(retrieved).toBe('small');
    });

    it('should update value when set multiple times', async () => {
      await setFontSize('small');
      expect(await getFontSize()).toBe('small');

      await setFontSize('large');
      expect(await getFontSize()).toBe('large');

      await setFontSize('medium');
      expect(await getFontSize()).toBe('medium');
    });
  });
});
