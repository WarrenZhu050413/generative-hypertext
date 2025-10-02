/**
 * Element ID Service
 *
 * Manages stable identification of DOM elements for attaching chat sessions.
 * Uses multiple strategies to ensure elements can be reliably re-located:
 * - data-nabokov-chat-id attribute
 * - CSS selector path
 * - XPath
 * - Text content preview
 */

/**
 * Element descriptor for relocating elements
 */
export interface ElementDescriptor {
  /** Element's data-nabokov-chat-id attribute */
  chatId: string;
  /** HTML tag name (e.g., 'div', 'button') */
  tagName: string;
  /** Element's id attribute if present */
  id?: string;
  /** Element's CSS classes */
  classes: string[];
  /** CSS selector path from document root */
  cssSelector: string;
  /** XPath to element */
  xpath: string;
  /** Preview of element's text content (first 100 chars) */
  textPreview: string;
  /** Bounding rectangle for positioning */
  boundingRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

/**
 * Generate a stable, unique ID for an element
 * Based on element's position in DOM and content
 */
function generateElementId(element: HTMLElement): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const selector = generateCSSSelector(element).replace(/[^a-zA-Z0-9-_]/g, '');
  const truncatedSelector = selector.substring(0, 20);

  return `nabokov-chat-${truncatedSelector}-${timestamp}-${random}`;
}

/**
 * Generate CSS selector path for an element
 */
function generateCSSSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className) {
      const classes = current.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

/**
 * Generate XPath for an element
 */
function generateXPath(element: HTMLElement): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let index = 1;
    let sibling = current.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.tagName.toLowerCase();
    path.unshift(`${tagName}[${index}]`);
    current = current.parentElement;
  }

  return '/' + path.join('/');
}

/**
 * Get text preview from element (first 100 chars)
 */
function getTextPreview(element: HTMLElement): string {
  const text = element.textContent?.trim() || '';
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
}

/**
 * Assign a chat ID to an element
 * Adds data-nabokov-chat-id attribute and returns the ID
 */
export function assignElementChatId(element: HTMLElement): string {
  const existingId = element.getAttribute('data-nabokov-chat-id');
  if (existingId) {
    return existingId;
  }

  const chatId = generateElementId(element);
  element.setAttribute('data-nabokov-chat-id', chatId);
  console.log('[elementIdService] Assigned chat ID to element:', chatId);

  return chatId;
}

/**
 * Find element by chat ID
 * Returns null if element not found
 */
export function findElementByChatId(chatId: string): HTMLElement | null {
  const element = document.querySelector(`[data-nabokov-chat-id="${chatId}"]`);

  if (element instanceof HTMLElement) {
    return element;
  }

  return null;
}

/**
 * Generate complete element descriptor
 * Used for persistence and element relocation
 */
export function generateElementDescriptor(element: HTMLElement): ElementDescriptor {
  const chatId = assignElementChatId(element);
  const rect = element.getBoundingClientRect();

  return {
    chatId,
    tagName: element.tagName.toLowerCase(),
    id: element.id || undefined,
    classes: Array.from(element.classList),
    cssSelector: generateCSSSelector(element),
    xpath: generateXPath(element),
    textPreview: getTextPreview(element),
    boundingRect: {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    },
  };
}

/**
 * Find element using descriptor
 * Tries multiple strategies to locate the element
 */
export function findElementByDescriptor(descriptor: ElementDescriptor): HTMLElement | null {
  // Strategy 1: Try chat ID (most reliable)
  let element = findElementByChatId(descriptor.chatId);
  if (element) {
    console.log('[elementIdService] Found element by chat ID');
    return element;
  }

  // Strategy 2: Try element ID
  if (descriptor.id) {
    element = document.getElementById(descriptor.id);
    if (element instanceof HTMLElement) {
      console.log('[elementIdService] Found element by HTML ID');
      assignElementChatId(element); // Re-assign chat ID
      return element;
    }
  }

  // Strategy 3: Try CSS selector
  try {
    element = document.querySelector(descriptor.cssSelector) as HTMLElement;
    if (element) {
      console.log('[elementIdService] Found element by CSS selector');
      assignElementChatId(element); // Re-assign chat ID
      return element;
    }
  } catch (error) {
    console.warn('[elementIdService] CSS selector failed:', error);
  }

  // Strategy 4: Try XPath
  try {
    const result = document.evaluate(
      descriptor.xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );

    if (result.singleNodeValue instanceof HTMLElement) {
      element = result.singleNodeValue;
      console.log('[elementIdService] Found element by XPath');
      assignElementChatId(element); // Re-assign chat ID
      return element;
    }
  } catch (error) {
    console.warn('[elementIdService] XPath lookup failed:', error);
  }

  console.warn('[elementIdService] Could not find element with descriptor:', descriptor);
  return null;
}

/**
 * Check if an element has an assigned chat ID
 */
export function hasElementChatId(element: HTMLElement): boolean {
  return element.hasAttribute('data-nabokov-chat-id');
}

/**
 * Get element's chat ID without assigning one
 * Returns null if no ID exists
 */
export function getElementChatId(element: HTMLElement): string | null {
  return element.getAttribute('data-nabokov-chat-id');
}

/**
 * Remove chat ID from element
 */
export function removeElementChatId(element: HTMLElement): void {
  element.removeAttribute('data-nabokov-chat-id');
}
