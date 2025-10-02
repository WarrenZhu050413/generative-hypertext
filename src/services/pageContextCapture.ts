/**
 * Page Context Capture Service
 * Extracts content from the current web page for AI conversation context
 */

export interface PageContext {
  url: string;
  title: string;
  description?: string;
  content: string; // Extracted visible text
  headings: string[];
  metadata: Record<string, string>;
}

/**
 * Captures the current page's context for chat
 */
export function capturePageContext(): PageContext {
  console.log('[pageContextCapture] Capturing page context from:', window.location.href);

  return {
    url: window.location.href,
    title: document.title,
    description: extractMetaDescription(),
    content: extractVisibleText(),
    headings: extractHeadings(),
    metadata: extractMetaTags()
  };
}

/**
 * Extract meta description tag
 */
function extractMetaDescription(): string | undefined {
  const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  return metaDesc?.content;
}

/**
 * Extract visible text from the page
 * Prioritizes main content areas and limits to ~4000 tokens (~16000 chars)
 */
function extractVisibleText(): string {
  const MAX_CHARS = 16000;

  // Priority selectors for main content
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.content',
    '#content'
  ];

  // Try to find main content area first
  let mainContent: HTMLElement | null = null;
  for (const selector of contentSelectors) {
    mainContent = document.querySelector(selector);
    if (mainContent) {
      console.log('[pageContextCapture] Found main content with selector:', selector);
      break;
    }
  }

  // If no main content found, use body
  const rootElement = mainContent || document.body;

  // Extract text from relevant elements
  const textNodes: string[] = [];
  const elementsToExtract = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'blockquote', 'pre', 'code'];

  for (const tag of elementsToExtract) {
    const elements = rootElement.querySelectorAll(tag);
    elements.forEach(el => {
      // Skip hidden elements
      if (!(el as HTMLElement).offsetParent && (el as HTMLElement).offsetHeight === 0) {
        return;
      }

      // Skip navigation, footer, ads
      const parent = el.closest('nav, footer, aside, .ad, .advertisement, [role="navigation"]');
      if (parent) return;

      const text = el.textContent?.trim();
      if (text && text.length > 10) { // Filter out very short snippets
        textNodes.push(text);
      }
    });
  }

  // Join and truncate
  let fullText = textNodes.join('\n\n');

  if (fullText.length > MAX_CHARS) {
    console.log(`[pageContextCapture] Truncating content from ${fullText.length} to ${MAX_CHARS} chars`);
    fullText = fullText.substring(0, MAX_CHARS) + '\n\n[Content truncated...]';
  }

  console.log(`[pageContextCapture] Extracted ${fullText.length} characters of text`);
  return fullText;
}

/**
 * Extract all heading text from the page
 */
function extractHeadings(): string[] {
  const headings: string[] = [];
  const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headingElements.forEach(heading => {
    // Skip hidden headings
    if (!(heading as HTMLElement).offsetParent && (heading as HTMLElement).offsetHeight === 0) {
      return;
    }

    const text = heading.textContent?.trim();
    if (text) {
      headings.push(text);
    }
  });

  console.log(`[pageContextCapture] Extracted ${headings.length} headings`);
  return headings;
}

/**
 * Extract meta tags for additional context
 */
function extractMetaTags(): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Common meta tags to extract
  const metaNames = [
    'keywords',
    'author',
    'og:title',
    'og:description',
    'og:type',
    'twitter:title',
    'twitter:description'
  ];

  metaNames.forEach(name => {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;
    if (meta?.content) {
      metadata[name] = meta.content;
    }
  });

  console.log('[pageContextCapture] Extracted metadata:', Object.keys(metadata));
  return metadata;
}

/**
 * Format page context into a system prompt for Claude
 */
export function formatPageContextAsPrompt(context: PageContext): string {
  const parts = [
    'You are helping the user understand and interact with a web page.',
    '',
    '## Page Details',
    `- **URL**: ${context.url}`,
    `- **Title**: ${context.title}`
  ];

  if (context.description) {
    parts.push(`- **Description**: ${context.description}`);
  }

  if (context.headings.length > 0) {
    parts.push('', '## Main Headings');
    context.headings.slice(0, 10).forEach(heading => {
      parts.push(`- ${heading}`);
    });
  }

  if (Object.keys(context.metadata).length > 0) {
    parts.push('', '## Metadata');
    Object.entries(context.metadata).forEach(([key, value]) => {
      parts.push(`- **${key}**: ${value}`);
    });
  }

  parts.push(
    '',
    '## Page Content',
    context.content,
    '',
    'Answer questions about this page, provide explanations, summaries, or analysis as requested. Be concise and helpful.'
  );

  return parts.join('\n');
}
