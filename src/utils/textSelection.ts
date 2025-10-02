/**
 * Text selection utilities for LLM-generated hyperlinks
 * Handles text selection within cards for generating child cards
 */

export interface TextSelection {
  text: string;
  range: Range;
  startOffset: number;
  endOffset: number;
  contextBefore: string;
  contextAfter: string;
  cardId: string;
  containerElement: Element;
}

/**
 * Get current text selection within a card
 * @param cardId - The card ID to check selection within
 * @returns TextSelection object or null if no valid selection
 */
export function getCardTextSelection(cardId: string): TextSelection | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString().trim();

  // Minimum selection length: 2 characters
  if (selectedText.length < 2) {
    return null;
  }

  // Find the card element
  const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
  if (!cardElement) {
    return null;
  }

  // Verify selection is within card boundaries
  const container = range.commonAncestorContainer;
  const containerElement = container.nodeType === Node.TEXT_NODE
    ? container.parentElement
    : container as Element;

  if (!containerElement || !cardElement.contains(containerElement)) {
    return null;
  }

  // Extract surrounding context (100 chars before/after)
  const fullText = cardElement.textContent || '';
  const selectionStart = range.startOffset;
  const selectionEnd = range.endOffset;

  // Get text content of the container
  const containerText = containerElement.textContent || '';
  const textBeforeSelection = containerText.substring(0, selectionStart);
  const textAfterSelection = containerText.substring(selectionEnd);

  const contextBefore = textBeforeSelection.slice(-100);
  const contextAfter = textAfterSelection.slice(0, 100);

  return {
    text: selectedText,
    range,
    startOffset: selectionStart,
    endOffset: selectionEnd,
    contextBefore,
    contextAfter,
    cardId,
    containerElement,
  };
}

/**
 * Highlight selected text with visual feedback
 * @param selection - The text selection to highlight
 * @returns Cleanup function to remove highlight
 */
export function highlightSelection(selection: TextSelection): () => void {
  const { containerElement } = selection;

  // Add highlight class
  const highlightClass = 'nabokov-text-selection-highlight';
  containerElement.classList.add(highlightClass);

  // Create style element if it doesn't exist
  if (!document.getElementById('nabokov-selection-styles')) {
    const style = document.createElement('style');
    style.id = 'nabokov-selection-styles';
    style.textContent = `
      .nabokov-text-selection-highlight {
        background: rgba(255, 215, 0, 0.3) !important;
        border-radius: 2px;
        transition: background 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // Return cleanup function
  return () => {
    containerElement.classList.remove(highlightClass);
  };
}

/**
 * Clear current text selection
 */
export function clearSelection(): void {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}

/**
 * Listen for selection changes within a card
 * @param cardId - The card ID to monitor
 * @param callback - Function to call when selection changes
 * @returns Cleanup function to stop listening
 */
export function onSelectionChange(
  cardId: string,
  callback: (selection: TextSelection | null) => void
): () => void {
  const handleSelectionChange = () => {
    const selection = getCardTextSelection(cardId);
    callback(selection);
  };

  document.addEventListener('selectionchange', handleSelectionChange);

  return () => {
    document.removeEventListener('selectionchange', handleSelectionChange);
  };
}
