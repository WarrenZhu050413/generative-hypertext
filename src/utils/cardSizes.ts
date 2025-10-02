/**
 * Card size presets and utilities
 */

export type SizePreset = 'S' | 'M' | 'L' | 'XL';

export interface CardDimensions {
  width: number;
  height: number;
}

/**
 * Size preset dimensions
 */
export const SIZE_PRESETS: Record<SizePreset, CardDimensions> = {
  S: { width: 280, height: 200 },
  M: { width: 320, height: 240 }, // Default size
  L: { width: 400, height: 300 },
  XL: { width: 500, height: 380 },
};

/**
 * Get dimensions for a size preset
 */
export function getSizeForPreset(preset: SizePreset | undefined): CardDimensions {
  return SIZE_PRESETS[preset || 'M'];
}

/**
 * Size preset labels
 */
export const SIZE_LABELS: Record<SizePreset, string> = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  XL: 'Extra Large',
};
