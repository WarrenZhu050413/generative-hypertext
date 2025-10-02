/**
 * Element Context Capture Service
 * Extracts context from a specific HTML element for AI conversation
 */

export interface ElementContext {
  url: string;
  pageTitle: string;
  element: {
    tagName: string;
    id?: string;
    classes: string[];
    text: string;
    innerHTML: string;
    attributes: Record<string, string>;
    rect: DOMRect;
  };
  context: {
    parentChain: string[]; // Array of parent tag names
    siblings: number; // Number of siblings
    nearbyText: string; // Text from surrounding elements
  };
  metadata: {
    xpath: string;
    selector: string;
  };
}

/**
 * Captures context for a specific element
 */
export function captureElementContext(element: HTMLElement): ElementContext {
  console.log('[elementContextCapture] Capturing element context:', element.tagName);

  return {
    url: window.location.href,
    pageTitle: document.title,
    element: {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      classes: Array.from(element.classList),
      text: extractElementText(element),
      innerHTML: sanitizeHTML(element.innerHTML),
      attributes: extractAttributes(element),
      rect: element.getBoundingClientRect()
    },
    context: {
      parentChain: buildParentChain(element),
      siblings: element.parentElement?.children.length || 0,
      nearbyText: extractNearbyText(element)
    },
    metadata: {
      xpath: getXPath(element),
      selector: generateSelector(element)
    }
  };
}

/**
 * Extract visible text from element
 */
function extractElementText(element: HTMLElement): string {
  const MAX_CHARS = 5000;
  let text = element.innerText || element.textContent || '';
  text = text.trim();

  if (text.length > MAX_CHARS) {
    console.log(`[elementContextCapture] Truncating text from ${text.length} to ${MAX_CHARS} chars`);
    text = text.substring(0, MAX_CHARS) + '...[truncated]';
  }

  return text;
}

/**
 * Sanitize HTML to prevent issues with very large content
 */
function sanitizeHTML(html: string): string {
  const MAX_CHARS = 10000;

  if (html.length > MAX_CHARS) {
    console.log(`[elementContextCapture] Truncating HTML from ${html.length} to ${MAX_CHARS} chars`);
    return html.substring(0, MAX_CHARS) + '...[truncated]';
  }

  return html;
}

/**
 * Extract all attributes from element
 */
function extractAttributes(element: HTMLElement): Record<string, string> {
  const attributes: Record<string, string> = {};

  Array.from(element.attributes).forEach(attr => {
    // Skip some noisy attributes
    if (attr.name.startsWith('data-react') || attr.name.startsWith('data-emotion')) {
      return;
    }
    attributes[attr.name] = attr.value;
  });

  return attributes;
}

/**
 * Build parent chain (e.g., ["body", "div", "main", "article"])
 */
function buildParentChain(element: HTMLElement): string[] {
  const chain: string[] = [];
  let current: HTMLElement | null = element.parentElement;

  while (current && current !== document.body && chain.length < 10) {
    let label = current.tagName.toLowerCase();
    if (current.id) label += `#${current.id}`;
    if (current.className) label += `.${Array.from(current.classList).slice(0, 2).join('.')}`;
    chain.push(label);
    current = current.parentElement;
  }

  return chain.reverse();
}

/**
 * Extract text from nearby elements for context
 */
function extractNearbyText(element: HTMLElement): string {
  const MAX_CHARS = 2000;
  const texts: string[] = [];

  // Get parent's text (excluding the target element's text)
  const parent = element.parentElement;
  if (parent) {
    const parentText = Array.from(parent.childNodes)
      .filter(node => node !== element && node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent?.trim())
      .filter(text => text && text.length > 0)
      .join(' ');

    if (parentText) texts.push(`Parent context: ${parentText}`);
  }

  // Get previous sibling text
  const prevSibling = element.previousElementSibling;
  if (prevSibling) {
    const prevText = (prevSibling as HTMLElement).innerText?.trim();
    if (prevText && prevText.length < 500) {
      texts.push(`Previous element: ${prevText}`);
    }
  }

  // Get next sibling text
  const nextSibling = element.nextElementSibling;
  if (nextSibling) {
    const nextText = (nextSibling as HTMLElement).innerText?.trim();
    if (nextText && nextText.length < 500) {
      texts.push(`Next element: ${nextText}`);
    }
  }

  let result = texts.join('\n');
  if (result.length > MAX_CHARS) {
    result = result.substring(0, MAX_CHARS) + '...[truncated]';
  }

  return result;
}

/**
 * Generate XPath for element
 */
function getXPath(element: HTMLElement): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body && parts.length < 10) {
    let index = 0;
    let sibling: Element | null = current;

    while (sibling = sibling.previousElementSibling) {
      if (sibling.tagName === current.tagName) index++;
    }

    const tagName = current.tagName.toLowerCase();
    parts.unshift(`${tagName}[${index + 1}]`);
    current = current.parentElement;
  }

  return '/' + parts.join('/');
}

/**
 * Generate CSS selector for element
 */
function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const tag = element.tagName.toLowerCase();
  const classes = Array.from(element.classList).slice(0, 3);

  if (classes.length > 0) {
    return `${tag}.${classes.join('.')}`;
  }

  return tag;
}

/**
 * Format element context into a system prompt for Claude
 */
export function formatElementContextAsPrompt(context: ElementContext): string {
  const parts = [
    'You are helping the user understand and interact with a specific HTML element on a web page.',
    '',
    '## Page Details',
    `- **URL**: ${context.url}`,
    `- **Page Title**: ${context.pageTitle}`,
    '',
    '## Selected Element',
    `- **Tag**: \`<${context.element.tagName}>\``,
  ];

  if (context.element.id) {
    parts.push(`- **ID**: \`${context.element.id}\``);
  }

  if (context.element.classes.length > 0) {
    parts.push(`- **Classes**: \`${context.element.classes.join(' ')}\``);
  }

  if (Object.keys(context.element.attributes).length > 0) {
    parts.push('- **Attributes**:');
    Object.entries(context.element.attributes).slice(0, 5).forEach(([key, value]) => {
      parts.push(`  - \`${key}\`: "${value}"`);
    });
  }

  parts.push(
    `- **Dimensions**: ${Math.round(context.element.rect.width)}×${Math.round(context.element.rect.height)}px`,
    `- **Position**: (${Math.round(context.element.rect.left)}, ${Math.round(context.element.rect.top)})`,
    '',
    '## Element Content'
  );

  if (context.element.text) {
    parts.push('### Text:', context.element.text, '');
  }

  if (context.element.innerHTML && context.element.innerHTML.length < 1000) {
    parts.push('### HTML:', '```html', context.element.innerHTML, '```', '');
  }

  if (context.context.parentChain.length > 0) {
    parts.push('## Context', `- **Parent Chain**: ${context.context.parentChain.join(' > ')}`, `- **Siblings**: ${context.context.siblings}`, '');
  }

  if (context.context.nearbyText) {
    parts.push('## Nearby Content', context.context.nearbyText, '');
  }

  parts.push(
    '## Instructions',
    'Answer questions about this specific element, explain its purpose, analyze its content, or help the user understand how it works. Be concise and helpful.'
  );

  return parts.join('\n');
}
