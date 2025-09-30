/**
 * Mock Element Generation Utilities
 *
 * Provides helper functions to create mock DOM elements and cards for testing.
 */

import type { Card, ElementData, SourceMetadata, Message } from '@/types';

/**
 * Creates a mock HTML element with specified properties
 *
 * @param options - Element properties
 * @returns HTMLElement for testing
 *
 * @example
 * const element = createMockElement({
 *   tagName: 'div',
 *   innerHTML: '<p>Test content</p>',
 *   className: 'test-class',
 * });
 */
export function createMockElement(options: {
  tagName?: string;
  innerHTML?: string;
  textContent?: string;
  className?: string;
  id?: string;
  attributes?: Record<string, string>;
  styles?: Partial<CSSStyleDeclaration>;
}): HTMLElement {
  const {
    tagName = 'div',
    innerHTML = '',
    textContent = '',
    className = '',
    id = '',
    attributes = {},
    styles = {},
  } = options;

  const element = document.createElement(tagName);

  if (innerHTML) {
    element.innerHTML = innerHTML;
  } else if (textContent) {
    element.textContent = textContent;
  }

  if (className) {
    element.className = className;
  }

  if (id) {
    element.id = id;
  }

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  // Set styles
  Object.assign(element.style, styles);

  return element;
}

/**
 * Creates a mock article element with realistic content
 */
export function createMockArticleElement(): HTMLElement {
  return createMockElement({
    tagName: 'article',
    innerHTML: `
      <h1>Test Article Title</h1>
      <p class="author">By Test Author</p>
      <p>This is a test article with some content. It contains multiple paragraphs to simulate a real article.</p>
      <p>Here is the second paragraph with more interesting content.</p>
      <blockquote>An inspiring quote from the article</blockquote>
      <p>And a final paragraph to wrap things up.</p>
    `,
    className: 'article-content',
    styles: {
      padding: '20px',
      maxWidth: '800px',
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      lineHeight: '1.6',
    },
  });
}

/**
 * Creates a mock card element with conversation interface
 */
export function createMockCardElement(): HTMLElement {
  return createMockElement({
    tagName: 'div',
    innerHTML: `
      <div class="card-header">
        <h3>Test Card</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="card-content">
        <p>Card content goes here</p>
      </div>
      <div class="card-chat">
        <div class="messages"></div>
        <input type="text" placeholder="Ask about this..." />
        <button>Send</button>
      </div>
    `,
    className: 'nabokov-card',
    styles: {
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
    },
  });
}

/**
 * Creates a mock Card object with all required fields
 *
 * @param overrides - Partial card data to override defaults
 * @returns Complete Card object
 */
export function createMockCard(overrides?: Partial<Card>): Card {
  const id = overrides?.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();

  const defaultCard: Card = {
    id,
    content: '<div class="test-element"><h2>Test Heading</h2><p>Test content</p></div>',
    metadata: {
      url: 'https://example.com/test-page',
      title: 'Test Page Title',
      domain: 'example.com',
      timestamp,
      tagName: 'div',
      selector: 'div.test-element',
      textContent: 'Test Heading Test content',
      dimensions: {
        width: 400,
        height: 300,
      },
    },
    starred: false,
    tags: ['test'],
    createdAt: timestamp,
    updatedAt: timestamp,
    conversation: [],
    screenshotId: `screenshot-${id}`,
    styles: {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#333333',
      backgroundColor: '#ffffff',
      padding: '16px',
    },
    context: 'This is surrounding context text before and after the element.',
  };

  // Use deep merge for nested properties
  const result: Card = {
    ...defaultCard,
    ...overrides,
  };

  // Manually merge nested objects if overrides exist
  if (overrides?.metadata) {
    result.metadata = {
      ...defaultCard.metadata,
      ...overrides.metadata,
    };
  }
  if (overrides?.styles) {
    result.styles = {
      ...defaultCard.styles,
      ...overrides.styles,
    };
  }
  if (overrides?.conversation) {
    result.conversation = overrides.conversation;
  }
  if (overrides?.tags) {
    result.tags = overrides.tags;
  }

  return result;
}

/**
 * Creates a mock Message object
 *
 * @param role - Message role (user or assistant)
 * @param content - Message content
 * @param overrides - Additional message properties
 */
export function createMockMessage(
  role: 'user' | 'assistant',
  content: string,
  overrides?: Partial<Message>
): Message {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
    streaming: false,
    ...overrides,
  };
}

/**
 * Creates a conversation with multiple messages
 *
 * @param messageCount - Number of messages to generate
 * @returns Array of messages
 */
export function createMockConversation(messageCount: number = 4): Message[] {
  const messages: Message[] = [];

  for (let i = 0; i < messageCount; i++) {
    const role = i % 2 === 0 ? 'user' : 'assistant';
    const content = role === 'user'
      ? `User question ${Math.floor(i / 2) + 1}?`
      : `Assistant response ${Math.floor(i / 2) + 1}.`;

    messages.push(createMockMessage(role, content));
  }

  return messages;
}

/**
 * Creates element data from an actual DOM element
 *
 * @param element - DOM element to extract data from
 * @returns ElementData object
 */
export function createElementDataFromDOM(element: HTMLElement): ElementData {
  const html = element.outerHTML;
  const htmlPreview = html.length > 500 ? html.substring(0, 500) + '...' : html;

  // Generate a simple CSS selector
  const selector = element.id
    ? `#${element.id}`
    : element.className
    ? `.${element.className.split(' ')[0]}`
    : element.tagName.toLowerCase();

  const computedStyle = window.getComputedStyle(element);

  return {
    html,
    htmlPreview,
    selector,
    computedStyles: {
      fontSize: computedStyle.fontSize,
      fontFamily: computedStyle.fontFamily,
      fontWeight: computedStyle.fontWeight,
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      padding: computedStyle.padding,
      margin: computedStyle.margin,
      border: computedStyle.border,
      display: computedStyle.display,
      position: computedStyle.position,
      width: computedStyle.width,
      height: computedStyle.height,
    },
  };
}

/**
 * Creates mock source metadata
 *
 * @param overrides - Partial metadata to override defaults
 */
export function createMockSourceMetadata(overrides?: Partial<SourceMetadata>): SourceMetadata {
  return {
    url: 'https://example.com/article',
    title: 'Example Article',
    domain: 'example.com',
    timestamp: Date.now(),
    surrounding: 'Context text surrounding the clipped element.',
    favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    ...overrides,
  };
}