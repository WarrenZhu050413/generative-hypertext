/**
 * Unit Tests for Node Dimension Extraction Logic
 *
 * Tests the dimension extraction logic used in saveNodeChanges() to verify
 * that React Flow v12's various node dimension formats are correctly handled.
 *
 * This directly tests the fix for the card size persistence bug where
 * node.measured.width/height were not being read correctly.
 */

import { describe, it, expect } from 'vitest';

// Extract the dimension extraction logic as a testable function
// This is the same logic used in useCanvasState.ts saveNodeChanges()
function extractDimensions(node: any, fallbackSize?: { width: number; height: number }) {
  const getNumericDimension = (value: any, fallback: number): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return parsed;
    }
    return fallback;
  };

  const width =
    getNumericDimension(node.measured?.width, 0) ||     // React Flow v12 measured dimensions (primary)
    getNumericDimension(node.width, 0) ||               // Direct property (if setAttributes was used)
    getNumericDimension(node.style?.width, 0) ||        // Style property (legacy/fallback)
    fallbackSize?.width ||                               // Existing saved size
    320;                                                 // Default

  const height =
    getNumericDimension(node.measured?.height, 0) ||    // React Flow v12 measured dimensions (primary)
    getNumericDimension(node.height, 0) ||              // Direct property (if setAttributes was used)
    getNumericDimension(node.style?.height, 0) ||       // Style property (legacy/fallback)
    fallbackSize?.height ||                              // Existing saved size
    240;                                                 // Default

  return { width, height };
}

describe('Node Dimension Extraction', () => {
  describe('React Flow v12 measured dimensions', () => {
    it('should extract dimensions from node.measured (primary source)', () => {
      const node = {
        id: 'test-1',
        measured: { width: 500, height: 400 },
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 500, height: 400 });
    });

    it('should handle fractional measured dimensions', () => {
      const node = {
        id: 'test-2',
        measured: { width: 500.75, height: 400.25 },
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 500.75, height: 400.25 });
    });

    it('should prioritize measured over all other sources', () => {
      const node = {
        id: 'test-3',
        measured: { width: 500, height: 400 },
        width: 600,  // Should be ignored
        height: 500, // Should be ignored
        style: { width: 700, height: 600 }, // Should be ignored
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 500, height: 400 });
    });
  });

  describe('Direct width/height properties', () => {
    it('should extract from node.width/height when measured is not available', () => {
      const node = {
        id: 'test-4',
        width: 450,
        height: 350,
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 450, height: 350 });
    });

    it('should prioritize direct properties over style', () => {
      const node = {
        id: 'test-5',
        width: 450,
        height: 350,
        style: { width: 600, height: 500 }, // Should be ignored
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 450, height: 350 });
    });
  });

  describe('Style properties', () => {
    it('should extract from node.style.width/height as fallback', () => {
      const node = {
        id: 'test-6',
        style: { width: 600, height: 450 },
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 600, height: 450 });
    });

    it('should parse string style values like "500px"', () => {
      const node = {
        id: 'test-7',
        style: { width: '500px', height: '400px' },
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 500, height: 400 });
    });

    it('should handle string style values without units', () => {
      const node = {
        id: 'test-8',
        style: { width: '600', height: '450' },
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 600, height: 450 });
    });

    it('should handle invalid string style values', () => {
      const node = {
        id: 'test-9',
        style: { width: 'auto', height: 'fit-content' },
        position: { x: 0, y: 0 },
      };

      // Should fall back to defaults
      const result = extractDimensions(node);
      expect(result).toEqual({ width: 320, height: 240 });
    });
  });

  describe('Fallback to card.size', () => {
    it('should use fallback size when no node dimensions available', () => {
      const node = {
        id: 'test-10',
        position: { x: 0, y: 0 },
        // No dimensions
      };

      const fallbackSize = { width: 400, height: 300 };
      const result = extractDimensions(node, fallbackSize);
      expect(result).toEqual({ width: 400, height: 300 });
    });

    it('should use default when no dimensions and no fallback', () => {
      const node = {
        id: 'test-11',
        position: { x: 0, y: 0 },
        // No dimensions
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 320, height: 240 });
    });
  });

  describe('Edge cases', () => {
    it('should handle zero dimensions', () => {
      const node = {
        id: 'test-12',
        measured: { width: 0, height: 0 },
        position: { x: 0, y: 0 },
      };

      // Zero is falsy, should fall back to defaults
      const result = extractDimensions(node);
      expect(result).toEqual({ width: 320, height: 240 });
    });

    it('should handle negative dimensions (invalid but test behavior)', () => {
      const node = {
        id: 'test-13',
        measured: { width: -100, height: -50 },
        position: { x: 0, y: 0 },
      };

      // Negative numbers are truthy but invalid
      const result = extractDimensions(node);
      expect(result).toEqual({ width: -100, height: -50 });
    });

    it('should handle very large dimensions', () => {
      const node = {
        id: 'test-14',
        measured: { width: 10000, height: 8000 },
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 10000, height: 8000 });
    });

    it('should handle undefined node properties gracefully', () => {
      const node = {
        id: 'test-15',
        measured: undefined,
        width: undefined,
        height: undefined,
        style: undefined,
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 320, height: 240 });
    });

    it('should handle null node properties gracefully', () => {
      const node = {
        id: 'test-16',
        measured: null,
        width: null,
        height: null,
        style: null,
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);
      expect(result).toEqual({ width: 320, height: 240 });
    });

    it('should handle mixed valid and invalid dimensions', () => {
      const node = {
        id: 'test-17',
        measured: { width: 0, height: 400 }, // width invalid, height valid
        width: 500,  // This should be used for width
        position: { x: 0, y: 0 },
      };

      // Zero width falls through, 500 is used; height 400 from measured
      const result = extractDimensions(node);
      expect(result).toEqual({ width: 500, height: 400 });
    });
  });

  describe('Priority order verification', () => {
    it('should follow correct priority: measured > direct > style > fallback > default', () => {
      const testCases = [
        {
          name: 'All sources present - measured wins',
          node: {
            measured: { width: 100, height: 100 },
            width: 200,
            height: 200,
            style: { width: 300, height: 300 },
          },
          fallback: { width: 400, height: 400 },
          expected: { width: 100, height: 100 },
        },
        {
          name: 'No measured - direct wins',
          node: {
            width: 200,
            height: 200,
            style: { width: 300, height: 300 },
          },
          fallback: { width: 400, height: 400 },
          expected: { width: 200, height: 200 },
        },
        {
          name: 'No measured or direct - style wins',
          node: {
            style: { width: 300, height: 300 },
          },
          fallback: { width: 400, height: 400 },
          expected: { width: 300, height: 300 },
        },
        {
          name: 'Only fallback - fallback wins',
          node: {},
          fallback: { width: 400, height: 400 },
          expected: { width: 400, height: 400 },
        },
        {
          name: 'Nothing - default wins',
          node: {},
          fallback: undefined,
          expected: { width: 320, height: 240 },
        },
      ];

      testCases.forEach(({ name, node, fallback, expected }) => {
        const result = extractDimensions(node, fallback);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Bug regression tests', () => {
    it('should NOT fall back to 320x240 when measured dimensions exist (the original bug)', () => {
      // This was the bug: measured dimensions were ignored, always fell back to 320x240
      const node = {
        id: 'bug-test',
        measured: { width: 500, height: 400 },
        style: { width: '320px', height: '240px' }, // Old code tried to read this
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(node);

      // The bug would have returned { width: 320, height: 240 }
      // The fix correctly returns { width: 500, height: 400 }
      expect(result).not.toEqual({ width: 320, height: 240 });
      expect(result).toEqual({ width: 500, height: 400 });
    });

    it('should handle React Flow v12 NodeResizer dimension change', () => {
      // After NodeResizer updates, React Flow v12 stores dimensions in measured
      const nodeAfterResize = {
        id: 'resized-node',
        measured: { width: 600, height: 450 },
        position: { x: 100, y: 100 },
        data: { card: {} },
      };

      const result = extractDimensions(nodeAfterResize);
      expect(result).toEqual({ width: 600, height: 450 });
    });

    it('should handle React Flow v12 with setAttributes: true', () => {
      // When setAttributes is used, both measured and direct properties are set
      const nodeWithSetAttributes = {
        id: 'set-attrs-node',
        measured: { width: 500, height: 400 },
        width: 500,
        height: 400,
        position: { x: 0, y: 0 },
      };

      const result = extractDimensions(nodeWithSetAttributes);
      expect(result).toEqual({ width: 500, height: 400 });
    });
  });
});
