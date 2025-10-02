/**
 * Test Data Fixtures
 *
 * Pre-configured test data for common testing scenarios.
 * Includes sample HTML elements, cards, conversations, and screenshots.
 */

import type { Card, Message } from '@/types';

// ============================================================================
// Sample HTML Elements
// ============================================================================

/**
 * Simple paragraph element
 */
export const SAMPLE_PARAGRAPH_HTML = `
<p class="article-paragraph" style="font-size: 16px; line-height: 1.6; color: #333;">
  This is a sample paragraph with some interesting content that a user might want to clip and discuss.
</p>
`;

/**
 * Article with heading and multiple paragraphs
 */
export const SAMPLE_ARTICLE_HTML = `
<article class="blog-post">
  <h1>Understanding Web Clipping</h1>
  <p class="meta">Published on January 15, 2025 by Test Author</p>
  <p>Web clipping is an essential tool for researchers, students, and professionals who need to capture and organize information from the web.</p>
  <p>By clipping specific elements rather than entire pages, users can focus on exactly what matters to them.</p>
  <blockquote>
    "The power of web clipping lies in its ability to preserve context while reducing noise." - Anonymous
  </blockquote>
  <p>Modern web clippers can also facilitate conversations about clipped content, making research more interactive.</p>
</article>
`;

/**
 * Code snippet element
 */
export const SAMPLE_CODE_HTML = `
<div class="code-block">
  <pre><code class="language-javascript">
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
  </code></pre>
</div>
`;

/**
 * Table element
 */
export const SAMPLE_TABLE_HTML = `
<table class="data-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Status</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Element Selection</td>
      <td>Complete</td>
      <td>High</td>
    </tr>
    <tr>
      <td>Chat Interface</td>
      <td>In Progress</td>
      <td>High</td>
    </tr>
    <tr>
      <td>Export Feature</td>
      <td>Planned</td>
      <td>Medium</td>
    </tr>
  </tbody>
</table>
`;

/**
 * Complex nested structure
 */
export const SAMPLE_COMPLEX_HTML = `
<div class="product-card">
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Product" class="product-image">
  <div class="product-info">
    <h3 class="product-title">Amazing Product</h3>
    <p class="product-description">This is an incredible product that you definitely need in your life.</p>
    <div class="product-meta">
      <span class="price">$99.99</span>
      <span class="rating">⭐⭐⭐⭐⭐ (4.8/5)</span>
    </div>
    <button class="add-to-cart">Add to Cart</button>
  </div>
</div>
`;

// ============================================================================
// Sample Clipped Cards
// ============================================================================

/**
 * Basic card with minimal data
 */
export const SAMPLE_BASIC_CARD: Card = {
  id: 'card-basic-001',
  content: SAMPLE_PARAGRAPH_HTML,
  metadata: {
    url: 'https://example.com/article',
    title: 'Example Article',
    domain: 'example.com',
    timestamp: 1706140800000, // 2025-01-25
    tagName: 'p',
    selector: 'p.article-paragraph',
    textContent: 'This is a sample paragraph with some interesting content that a user might want to clip and discuss.',
    dimensions: {
      width: 400,
      height: 100,
    },
  },
  starred: false,
  tags: ['article', 'web'],
  createdAt: 1706140800000,
  updatedAt: 1706140800000,
  conversation: [],
  styles: {
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    color: '#333333',
    backgroundColor: '#ffffff',
    padding: '10px',
  },
  context: 'This paragraph appears in the middle of a longer article about web technologies.',
};

/**
 * Card with conversation history
 */
export const SAMPLE_CARD_WITH_CONVERSATION: Card = {
  id: 'card-conversation-001',
  content: SAMPLE_ARTICLE_HTML,
  metadata: {
    url: 'https://blog.example.com/web-clipping',
    title: 'Understanding Web Clipping - Tech Blog',
    domain: 'blog.example.com',
    timestamp: 1706140800000,
    tagName: 'article',
    selector: 'article.blog-post',
    textContent: 'Understanding Web Clipping...',
    dimensions: {
      width: 500,
      height: 400,
    },
  },
  starred: false,
  tags: ['research', 'productivity', 'tools'],
  createdAt: 1706140800000,
  updatedAt: 1706140800000,
  styles: {
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  context: 'This article is part of a series on productivity tools.',
  conversation: [
    {
      id: 'msg-001',
      role: 'user',
      content: 'What is the main point of this article?',
      timestamp: 1706141000000,
    },
    {
      id: 'msg-002',
      role: 'assistant',
      content: 'The main point is that web clipping helps users focus on specific content rather than entire pages, making research more efficient.',
      timestamp: 1706141100000,
    },
    {
      id: 'msg-003',
      role: 'user',
      content: 'Can you explain the quote in the blockquote?',
      timestamp: 1706141200000,
    },
    {
      id: 'msg-004',
      role: 'assistant',
      content: 'The quote emphasizes that web clipping preserves important context while eliminating irrelevant information (noise), making it a powerful tool for focused research.',
      timestamp: 1706141300000,
    },
  ],
};

/**
 * Code snippet card
 */
export const SAMPLE_CODE_CARD: Card = {
  id: 'card-code-001',
  content: SAMPLE_CODE_HTML,
  metadata: {
    url: 'https://docs.example.com/javascript/functions',
    title: 'JavaScript Functions - Documentation',
    domain: 'docs.example.com',
    timestamp: 1706227200000, // 2025-01-26
    tagName: 'div',
    selector: 'div.code-block',
    textContent: 'function greet(name) { return `Hello, ${name}!`; }',
    dimensions: {
      width: 450,
      height: 200,
    },
  },
  starred: false,
  tags: ['code', 'javascript', 'tutorial'],
  createdAt: 1706227200000,
  updatedAt: 1706227200000,
  styles: {
    fontFamily: 'monospace',
    fontSize: '14px',
    backgroundColor: '#f5f5f5',
    padding: '16px',
    border: '1px solid #ddd',
  },
  context: 'This code example demonstrates basic function syntax in JavaScript.',
  conversation: [
    {
      id: 'msg-code-001',
      role: 'user',
      content: 'Can you explain this code?',
      timestamp: 1706227300000,
    },
    {
      id: 'msg-code-002',
      role: 'assistant',
      content: 'This code defines a function called `greet` that takes a name parameter and returns a greeting string using template literals. It then calls the function with "World" and logs the result to the console.',
      timestamp: 1706227400000,
    },
  ],
};

// ============================================================================
// Sample Messages
// ============================================================================

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'msg-sample-001',
    role: 'user',
    content: 'What is this about?',
    timestamp: 1706140000000,
  },
  {
    id: 'msg-sample-002',
    role: 'assistant',
    content: 'This appears to be about web clipping and content organization.',
    timestamp: 1706140100000,
  },
  {
    id: 'msg-sample-003',
    role: 'user',
    content: 'Can you summarize the key points?',
    timestamp: 1706140200000,
  },
  {
    id: 'msg-sample-004',
    role: 'assistant',
    content: 'Key points: 1) Focus on specific content, 2) Reduce information overload, 3) Enable interactive research.',
    timestamp: 1706140300000,
  },
];

// ============================================================================
// Collection of Sample Cards
// ============================================================================

/**
 * Array of all sample cards for bulk testing
 */
export const ALL_SAMPLE_CARDS: Card[] = [
  SAMPLE_BASIC_CARD,
  SAMPLE_CARD_WITH_CONVERSATION,
  SAMPLE_CODE_CARD,
];

/**
 * Map of sample cards by ID for easy lookup
 */
export const SAMPLE_CARDS_BY_ID: Record<string, Card> = {
  [SAMPLE_BASIC_CARD.id]: SAMPLE_BASIC_CARD,
  [SAMPLE_CARD_WITH_CONVERSATION.id]: SAMPLE_CARD_WITH_CONVERSATION,
  [SAMPLE_CODE_CARD.id]: SAMPLE_CODE_CARD,
};

// ============================================================================
// Test Page HTML
// ============================================================================

/**
 * Complete HTML page for E2E testing
 */
export const SAMPLE_TEST_PAGE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Page for Nabokov Clipper</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .clippable {
      border: 2px dashed #ccc;
      padding: 15px;
      margin: 20px 0;
    }
    .clippable:hover {
      border-color: #007bff;
      background-color: #f0f8ff;
    }
  </style>
</head>
<body>
  <h1>Test Page for Web Clipper</h1>

  <div class="clippable" id="test-paragraph">
    <p>This is a test paragraph that can be clipped. It contains some interesting information about testing.</p>
  </div>

  <div class="clippable" id="test-article">
    ${SAMPLE_ARTICLE_HTML}
  </div>

  <div class="clippable" id="test-code">
    ${SAMPLE_CODE_HTML}
  </div>

  <div class="clippable" id="test-table">
    ${SAMPLE_TABLE_HTML}
  </div>
</body>
</html>
`;