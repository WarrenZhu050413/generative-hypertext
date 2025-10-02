/**
 * Expandable links for LLM-generated hyperlinks
 * Manages clickable links in card content that focus child cards
 */

export interface ExpandableLink {
  id: string;
  parentCardId: string;
  childCardId: string;
  anchorText: string;
  startOffset: number;
  endOffset: number;
  createdAt: number;
}

const STORAGE_KEY = 'expandable_links';

/**
 * Get all expandable links
 */
export async function getAllLinks(): Promise<ExpandableLink[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('[expandableLinks] Error loading links:', error);
    return [];
  }
}

/**
 * Get links for a specific parent card
 */
export async function getLinksForCard(parentCardId: string): Promise<ExpandableLink[]> {
  const allLinks = await getAllLinks();
  return allLinks.filter((link) => link.parentCardId === parentCardId);
}

/**
 * Create a new expandable link
 */
export async function createExpandableLink(link: ExpandableLink): Promise<void> {
  try {
    const allLinks = await getAllLinks();
    allLinks.push(link);
    await chrome.storage.local.set({ [STORAGE_KEY]: allLinks });
    console.log('[expandableLinks] Created link:', link);
  } catch (error) {
    console.error('[expandableLinks] Error creating link:', error);
    throw error;
  }
}

/**
 * Delete a link by ID
 */
export async function deleteLink(linkId: string): Promise<void> {
  try {
    const allLinks = await getAllLinks();
    const updatedLinks = allLinks.filter((link) => link.id !== linkId);
    await chrome.storage.local.set({ [STORAGE_KEY]: updatedLinks });
    console.log('[expandableLinks] Deleted link:', linkId);
  } catch (error) {
    console.error('[expandableLinks] Error deleting link:', error);
    throw error;
  }
}

/**
 * Delete all links for a card (when card is deleted)
 */
export async function deleteLinksForCard(cardId: string): Promise<void> {
  try {
    const allLinks = await getAllLinks();
    const updatedLinks = allLinks.filter(
      (link) => link.parentCardId !== cardId && link.childCardId !== cardId
    );
    await chrome.storage.local.set({ [STORAGE_KEY]: updatedLinks });
    console.log('[expandableLinks] Deleted links for card:', cardId);
  } catch (error) {
    console.error('[expandableLinks] Error deleting links for card:', error);
    throw error;
  }
}

/**
 * Inject expandable links into card content HTML
 * Wraps linked text with <a> tags
 */
export function injectLinksIntoContent(
  content: string,
  links: ExpandableLink[]
): string {
  if (!content || links.length === 0) {
    return content;
  }

  // Sort links by startOffset (descending) to inject from end to start
  // This prevents offset shifts during injection
  const sortedLinks = [...links].sort((a, b) => b.startOffset - a.startOffset);

  let modifiedContent = content;

  for (const link of sortedLinks) {
    // Create link HTML
    const linkHtml = `<a
      href="#"
      class="nabokov-expandable-link"
      data-link-id="${link.id}"
      data-child-card-id="${link.childCardId}"
      title="Click to focus child card"
    >${link.anchorText}</a>`;

    // Replace text at offset with link
    // Note: This is a simplified approach
    // In practice, you'd need to handle HTML structure more carefully
    modifiedContent = modifiedContent.replace(link.anchorText, linkHtml);
  }

  return modifiedContent;
}

/**
 * Handle click on expandable link
 * Focuses the child card on canvas
 */
export function handleLinkClick(childCardId: string): void {
  // Dispatch event to canvas to focus the card
  window.dispatchEvent(
    new CustomEvent('nabokov:focus-card', {
      detail: { cardId: childCardId },
    })
  );
}

/**
 * Add flash effect to link
 * Called when child card is created
 */
export function flashLink(linkId: string): void {
  const linkElement = document.querySelector(`[data-link-id="${linkId}"]`);

  if (linkElement) {
    linkElement.classList.add('nabokov-link-flash');

    // Remove flash after 2 seconds
    setTimeout(() => {
      linkElement.classList.remove('nabokov-link-flash');
    }, 2000);
  }
}

/**
 * Install global click handler for expandable links
 * Should be called once on app initialization
 */
export function installLinkClickHandler(): void {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('nabokov-expandable-link')) {
      e.preventDefault();
      const childCardId = target.getAttribute('data-child-card-id');

      if (childCardId) {
        handleLinkClick(childCardId);
      }
    }
  });
}

/**
 * Install global styles for expandable links
 * Should be called once on app initialization
 */
export function installLinkStyles(): void {
  if (document.getElementById('nabokov-expandable-link-styles')) {
    return; // Already installed
  }

  const style = document.createElement('style');
  style.id = 'nabokov-expandable-link-styles';
  style.textContent = `
    /* Expandable link base styles */
    .nabokov-expandable-link {
      color: #8B0000;
      text-decoration: underline;
      text-decoration-color: rgba(139, 0, 0, 0.5);
      text-decoration-thickness: 1.5px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 2px;
      padding: 0 2px;
    }

    .nabokov-expandable-link:hover {
      background: rgba(255, 215, 0, 0.2);
      text-decoration-color: #8B0000;
    }

    /* Flash animation on creation */
    .nabokov-link-flash {
      animation: nabokov-link-flash-animation 2s ease-in-out;
    }

    @keyframes nabokov-link-flash-animation {
      0%, 100% {
        background: transparent;
      }
      25%, 75% {
        background: rgba(255, 215, 0, 0.5);
        box-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
      }
      50% {
        background: rgba(255, 215, 0, 0.7);
        box-shadow: 0 0 12px rgba(255, 215, 0, 1);
      }
    }

    /* Tooltip on hover (future enhancement) */
    .nabokov-expandable-link::after {
      content: attr(title);
      position: absolute;
      display: none;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10000;
    }

    .nabokov-expandable-link:hover::after {
      display: block;
      margin-top: 20px;
    }
  `;

  document.head.appendChild(style);
}
