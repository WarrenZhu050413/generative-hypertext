/**
 * User settings types for Nabokov Web Clipper
 */

/**
 * Font size options for card text
 */
export type FontSize = 'small' | 'medium' | 'large';

/**
 * Font size values in CSS units for different text elements
 */
export interface FontSizeValues {
  content: string;      // Main content font size
  title: string;        // Card title font size
  h1: string;          // Markdown h1 heading
  h2: string;          // Markdown h2 heading
  h3: string;          // Markdown h3 heading
  p: string;           // Paragraph text
  li: string;          // List items
  code: string;        // Code blocks
  contentHTML: string; // HTML content (for non-markdown)
}
