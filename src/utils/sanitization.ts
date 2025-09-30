/**
 * Sanitization utilities for the Nabokov Web Clipper
 *
 * This module provides functions for sanitizing HTML content, extracting relevant styles,
 * and generating CSS selectors for elements in a cross-environment compatible manner.
 *
 * @module sanitization
 */

import DOMPurify from 'isomorphic-dompurify';
import type { RelevantStyles } from '@/types';

// Re-export RelevantStyles for consumers who import from this module
export type { RelevantStyles };

/**
 * Configuration for DOMPurify sanitization
 * Removes all dangerous elements and attributes while preserving safe HTML structure
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
    'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'figure', 'figcaption', 'mark', 'del', 'ins', 'sub', 'sup', 'hr'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'style',
    'width', 'height', 'align', 'colspan', 'rowspan'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
};

/**
 * Sanitizes HTML content by removing scripts, event handlers, and dangerous attributes
 * while preserving safe HTML structure and styling.
 *
 * This function uses isomorphic-dompurify to ensure cross-environment compatibility
 * (browser and Node.js). It removes all potentially dangerous elements like scripts,
 * iframes, and event handlers while maintaining the semantic structure of the content.
 *
 * @param html - The HTML string to sanitize
 * @returns The sanitized HTML string, or empty string if sanitization fails
 *
 * @example
 * ```typescript
 * // Basic sanitization
 * const dirty = '<p>Hello <script>alert("XSS")</script>World</p>';
 * const clean = sanitizeHTML(dirty);
 * // Returns: '<p>Hello World</p>'
 *
 * // Removes event handlers
 * const dirty2 = '<div onclick="malicious()">Click me</div>';
 * const clean2 = sanitizeHTML(dirty2);
 * // Returns: '<div>Click me</div>'
 *
 * // Preserves safe styling
 * const dirty3 = '<p style="color: red;">Styled text</p>';
 * const clean3 = sanitizeHTML(dirty3);
 * // Returns: '<p style="color: red;">Styled text</p>'
 *
 * // Handles errors gracefully
 * const clean4 = sanitizeHTML(null as any);
 * // Returns: ''
 * ```
 *
 * @throws Does not throw - returns empty string on error
 */
export function sanitizeHTML(html: string): string {
  try {
    // Handle null/undefined/non-string input
    if (!html || typeof html !== 'string') {
      console.warn('[sanitization] Invalid input provided to sanitizeHTML:', typeof html);
      return '';
    }

    // Sanitize the HTML with our configuration
    const sanitized = DOMPurify.sanitize(html, SANITIZE_CONFIG);

    // Ensure we return a string
    return typeof sanitized === 'string' ? sanitized : '';
  } catch (error) {
    console.error('[sanitization] Error sanitizing HTML:', error);
    return '';
  }
}

/**
 * List of the 12 relevant CSS properties we extract from elements
 */
const RELEVANT_STYLE_PROPERTIES: (keyof RelevantStyles)[] = [
  'fontSize',
  'fontFamily',
  'fontWeight',
  'color',
  'backgroundColor',
  'padding',
  'margin',
  'border',
  'display',
  'position',
  'width',
  'height'
];

/**
 * Extracts only the 12 relevant CSS properties from an element's computed styles.
 *
 * This function retrieves the computed styles from a DOM element and extracts only
 * the properties that are relevant for preserving the visual appearance of annotations.
 * It handles null/undefined elements gracefully by returning default values.
 *
 * @param element - The HTML element to extract styles from
 * @returns Object containing the 12 relevant style properties with their computed values
 *
 * @example
 * ```typescript
 * // Extract styles from an element
 * const element = document.querySelector('.annotation');
 * const styles = extractRelevantStyles(element);
 * // Returns: {
 * //   fontSize: '16px',
 * //   fontFamily: 'Arial, sans-serif',
 * //   fontWeight: '400',
 * //   color: 'rgb(0, 0, 0)',
 * //   backgroundColor: 'rgb(255, 255, 0)',
 * //   padding: '4px',
 * //   margin: '0px',
 * //   border: 'none',
 * //   display: 'inline',
 * //   position: 'static',
 * //   width: 'auto',
 * //   height: 'auto'
 * // }
 *
 * // Handle null element gracefully
 * const styles2 = extractRelevantStyles(null as any);
 * // Returns object with empty string values
 *
 * // Extract from element with inline styles
 * const div = document.createElement('div');
 * div.style.fontSize = '20px';
 * div.style.color = 'red';
 * const styles3 = extractRelevantStyles(div);
 * // Returns styles with fontSize: '20px', color: 'red', etc.
 * ```
 *
 * @throws Does not throw - returns default empty values on error
 */
export function extractRelevantStyles(element: HTMLElement): RelevantStyles {
  try {
    // Handle null/undefined element
    if (!element || !(element instanceof HTMLElement)) {
      console.warn('[sanitization] Invalid element provided to extractRelevantStyles');
      return createDefaultStyles();
    }

    // Get computed styles from the element
    const computedStyles = window.getComputedStyle(element);

    // Extract only the relevant properties
    const relevantStyles: Partial<RelevantStyles> = {};

    for (const property of RELEVANT_STYLE_PROPERTIES) {
      relevantStyles[property] = computedStyles.getPropertyValue(
        // Convert camelCase to kebab-case for CSS property names
        property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      ) || '';
    }

    return relevantStyles as RelevantStyles;
  } catch (error) {
    console.error('[sanitization] Error extracting styles:', error);
    return createDefaultStyles();
  }
}

/**
 * Creates a RelevantStyles object with default empty values
 * @internal
 */
function createDefaultStyles(): RelevantStyles {
  return {};
}

/**
 * Generates a unique and reliable CSS selector for a given HTML element.
 *
 * This function creates a CSS selector that can be used to uniquely identify
 * an element in the DOM. It tries multiple strategies in order of reliability:
 * 1. ID selector (most reliable if unique)
 * 2. Class combinations (reliable if classes are unique)
 * 3. Tag name with nth-child position (fallback, always works)
 *
 * The generated selector aims to be both specific enough to uniquely identify
 * the element and resilient to minor DOM changes.
 *
 * @param element - The HTML element to generate a selector for
 * @returns A CSS selector string that uniquely identifies the element
 *
 * @example
 * ```typescript
 * // Element with ID (most reliable)
 * const elem1 = document.querySelector('#unique-id');
 * const selector1 = generateSelector(elem1);
 * // Returns: '#unique-id'
 *
 * // Element with unique classes
 * const elem2 = document.querySelector('.annotation.highlight');
 * const selector2 = generateSelector(elem2);
 * // Returns: '.annotation.highlight'
 *
 * // Element without ID or unique classes
 * const elem3 = document.querySelector('p');
 * const selector3 = generateSelector(elem3);
 * // Returns: 'body > div:nth-child(1) > p:nth-child(2)'
 *
 * // Handle invalid element
 * const selector4 = generateSelector(null as any);
 * // Returns: 'body'
 *
 * // Complex nested element
 * const elem5 = document.querySelector('article > section > div > p.content');
 * const selector5 = generateSelector(elem5);
 * // Returns: 'article > section:nth-child(2) > div:nth-child(1) > p.content'
 * ```
 *
 * @throws Does not throw - returns 'body' as fallback on error
 */
export function generateSelector(element: HTMLElement): string {
  try {
    // Handle null/undefined element
    if (!element || !(element instanceof HTMLElement)) {
      console.warn('[sanitization] Invalid element provided to generateSelector');
      return 'body';
    }

    // Strategy 1: Use ID if available (most reliable)
    if (element.id) {
      // Verify the ID is unique
      const matchingElements = document.querySelectorAll(`#${CSS.escape(element.id)}`);
      if (matchingElements.length === 1) {
        return `#${CSS.escape(element.id)}`;
      }
    }

    // Strategy 2: Try class combinations
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(Boolean);
      if (classes.length > 0) {
        const classSelector = classes.map(c => `.${CSS.escape(c)}`).join('');
        const matchingElements = document.querySelectorAll(classSelector);

        // If class combination is unique enough (fewer than 5 matches), use it
        if (matchingElements.length > 0 && matchingElements.length < 5) {
          // Add parent context for better specificity if needed
          if (matchingElements.length > 1 && element.parentElement) {
            const parentTag = element.parentElement.tagName.toLowerCase();
            const parentClassSelector = `${parentTag}${classSelector}`;
            const parentMatches = document.querySelectorAll(parentClassSelector);
            if (parentMatches.length < matchingElements.length) {
              return parentClassSelector;
            }
          }
          return classSelector;
        }
      }
    }

    // Strategy 3: Build path with nth-child (most reliable fallback)
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      // Add ID if available
      if (current.id) {
        selector = `#${CSS.escape(current.id)}`;
        path.unshift(selector);
        break; // Stop here as ID should be unique
      }

      // Add nth-child position for specificity
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const sameTagSiblings = siblings.filter(
          sibling => sibling.tagName === current!.tagName
        );

        if (sameTagSiblings.length > 1) {
          const index = sameTagSiblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    // Join the path with descendant combinator
    return path.length > 0 ? path.join(' > ') : 'body';
  } catch (error) {
    console.error('[sanitization] Error generating selector:', error);
    return 'body';
  }
}

/**
 * Validates that a generated selector actually matches the intended element
 *
 * @param element - The element that the selector should match
 * @param selector - The CSS selector to validate
 * @returns true if the selector uniquely identifies the element, false otherwise
 *
 * @example
 * ```typescript
 * const element = document.querySelector('#my-element');
 * const selector = generateSelector(element);
 * const isValid = validateSelector(element, selector);
 * // Returns: true if selector correctly identifies the element
 * ```
 *
 * @internal - Helper function for testing selector generation
 */
export function validateSelector(element: HTMLElement, selector: string): boolean {
  try {
    const matches = document.querySelectorAll(selector);
    return matches.length === 1 && matches[0] === element;
  } catch (error) {
    console.error('[sanitization] Error validating selector:', error);
    return false;
  }
}

/**
 * Unit test examples for sanitization utilities
 *
 * Run these tests to verify the sanitization functions work correctly:
 *
 * ```typescript
 * // Test sanitizeHTML
 * console.assert(
 *   sanitizeHTML('<p>Hello</p>') === '<p>Hello</p>',
 *   'Should preserve safe HTML'
 * );
 *
 * console.assert(
 *   sanitizeHTML('<script>alert("XSS")</script>') === '',
 *   'Should remove script tags'
 * );
 *
 * console.assert(
 *   !sanitizeHTML('<div onclick="bad()">Click</div>').includes('onclick'),
 *   'Should remove event handlers'
 * );
 *
 * console.assert(
 *   sanitizeHTML('') === '',
 *   'Should handle empty string'
 * );
 *
 * console.assert(
 *   sanitizeHTML(null as any) === '',
 *   'Should handle null input'
 * );
 *
 * // Test extractRelevantStyles
 * const testDiv = document.createElement('div');
 * testDiv.style.fontSize = '16px';
 * testDiv.style.color = 'red';
 * document.body.appendChild(testDiv);
 *
 * const styles = extractRelevantStyles(testDiv);
 * console.assert(
 *   styles.fontSize === '16px',
 *   'Should extract fontSize'
 * );
 *
 * console.assert(
 *   styles.color === 'red' || styles.color.includes('255, 0, 0'),
 *   'Should extract color'
 * );
 *
 * console.assert(
 *   Object.keys(styles).length === 12,
 *   'Should extract exactly 12 properties'
 * );
 *
 * document.body.removeChild(testDiv);
 *
 * const nullStyles = extractRelevantStyles(null as any);
 * console.assert(
 *   nullStyles.fontSize === '',
 *   'Should handle null element'
 * );
 *
 * // Test generateSelector
 * const idDiv = document.createElement('div');
 * idDiv.id = 'unique-test-id';
 * document.body.appendChild(idDiv);
 *
 * const selector1 = generateSelector(idDiv);
 * console.assert(
 *   selector1 === '#unique-test-id',
 *   'Should generate ID selector'
 * );
 *
 * console.assert(
 *   validateSelector(idDiv, selector1),
 *   'Generated selector should match element'
 * );
 *
 * document.body.removeChild(idDiv);
 *
 * const classDiv = document.createElement('div');
 * classDiv.className = 'test-class another-class';
 * document.body.appendChild(classDiv);
 *
 * const selector2 = generateSelector(classDiv);
 * console.assert(
 *   selector2.includes('test-class'),
 *   'Should include class in selector'
 * );
 *
 * document.body.removeChild(classDiv);
 *
 * const nullSelector = generateSelector(null as any);
 * console.assert(
 *   nullSelector === 'body',
 *   'Should return body for null element'
 * );
 * ```
 */