/**
 * Instant expansion and emanation animation for child cards
 * Creates child cards with golden glow animation
 */

import type { Card } from '@/types/card';
import type { GenerationResult } from '@/services/childCardGenerator';
import type { TextSelection } from './textSelection';
import { generateId, saveCard } from './storage';
import { addConnection } from './connectionStorage';

export interface InstantExpansionOptions {
  parentCard: Card;
  generationResult: GenerationResult;
  selection: TextSelection;
  generationType: string;
}

/**
 * Calculate position for child card
 * Places 400px to the right of parent, same Y-coordinate
 */
function calculateChildPosition(parentCard: Card): { x: number; y: number } {
  const parentPos = parentCard.position || { x: 0, y: 0 };

  return {
    x: parentPos.x + 400, // 400px to the right
    y: parentPos.y, // Same Y-coordinate (horizontally aligned)
  };
}

/**
 * Create child card from generation result
 */
async function createChildCard(options: InstantExpansionOptions): Promise<Card> {
  const { parentCard, generationResult, selection, generationType } = options;

  const childCard: Card = {
    id: generateId(),
    content: generationResult.content,
    metadata: {
      url: parentCard.metadata.url, // Inherit parent's URL
      title: generationResult.title,
      domain: parentCard.metadata.domain, // Inherit domain
      favicon: parentCard.metadata.favicon, // Inherit favicon
      timestamp: Date.now(),
    },
    position: calculateChildPosition(parentCard),
    size: { width: 360, height: 280 }, // Default child size
    starred: false,
    tags: generationResult.tags,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cardType: 'generated',
    parentCardId: parentCard.id,
    generationContext: {
      sourceMessageId: selection.text,
      userPrompt: `Generate ${generationType} for: ${selection.text}`,
      timestamp: Date.now(),
    },
  };

  // Save card to storage
  await saveCard(childCard);

  return childCard;
}

/**
 * Create connection from parent to child
 */
async function createParentChildConnection(parentId: string, childId: string): Promise<void> {
  await addConnection({
    id: generateId(),
    source: parentId,
    target: childId,
    type: 'generated-from',
    label: 'Generated',
    metadata: {
      createdAt: Date.now(),
      createdBy: 'ai',
    },
  });
}

/**
 * Trigger emanation animation
 * Uses CSS classes and transitions
 */
function animateEmanation(cardId: string): void {
  // Animation will be handled by React Flow and Canvas
  // This is a placeholder for triggering the animation

  // The animation CSS is defined in the canvas styles:
  // 1. Card starts at parent position, scale(0.1), opacity 0, blur(10px)
  // 2. Golden glow effect: box-shadow with rgba(255, 215, 0, 0.8)
  // 3. Animate to final position with cubic-bezier(0.34, 1.56, 0.64, 1)
  // 4. Scale to 1, opacity to 1, blur to 0 (800ms)
  // 5. Fade out glow over 500ms

  // Dispatch custom event for canvas to animate
  window.dispatchEvent(
    new CustomEvent('nabokov:card-emanate', {
      detail: { cardId },
    })
  );
}

/**
 * Flash the expandable link in parent card
 */
function flashExpandLink(linkId: string): void {
  // Find link element and add flash animation
  const linkElement = document.querySelector(`[data-link-id="${linkId}"]`);

  if (linkElement) {
    linkElement.classList.add('nabokov-link-flash');

    // Remove flash class after animation
    setTimeout(() => {
      linkElement.classList.remove('nabokov-link-flash');
    }, 2000);
  }
}

/**
 * Main orchestrator for instant expansion
 * Creates child card, connection, and triggers animations
 */
export async function instantExpandChild(options: InstantExpansionOptions): Promise<Card> {
  try {
    // Create child card
    const childCard = await createChildCard(options);

    // Create connection from parent to child
    await createParentChildConnection(options.parentCard.id, childCard.id);

    // Trigger emanation animation
    animateEmanation(childCard.id);

    // Refresh canvas to show new card
    window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));

    return childCard;
  } catch (error) {
    console.error('[instantExpansion] Error creating child card:', error);
    throw error;
  }
}

/**
 * Check if a position is occupied by another card
 * Used for collision detection
 */
export function isPositionOccupied(
  position: { x: number; y: number },
  allCards: Card[],
  excludeCardId?: string
): boolean {
  const margin = 50; // Minimum distance between cards

  return allCards.some((card) => {
    if (card.id === excludeCardId) return false;
    if (!card.position) return false;

    const dx = Math.abs(card.position.x - position.x);
    const dy = Math.abs(card.position.y - position.y);

    return dx < margin && dy < margin;
  });
}

/**
 * Find next available position near parent
 * Searches in spiral pattern if default position is occupied
 */
export function findAvailablePosition(
  parentCard: Card,
  allCards: Card[]
): { x: number; y: number } {
  const basePosition = calculateChildPosition(parentCard);

  // Check if base position is available
  if (!isPositionOccupied(basePosition, allCards)) {
    return basePosition;
  }

  // Spiral search for available position
  const spiralOffsets = [
    { x: 0, y: 100 },    // Below
    { x: 0, y: -100 },   // Above
    { x: 400, y: 100 },  // Below-right
    { x: 400, y: -100 }, // Above-right
    { x: 800, y: 0 },    // Far right
    { x: 800, y: 100 },  // Far below-right
    { x: 800, y: -100 }, // Far above-right
  ];

  for (const offset of spiralOffsets) {
    const candidatePosition = {
      x: basePosition.x + offset.x,
      y: basePosition.y + offset.y,
    };

    if (!isPositionOccupied(candidatePosition, allCards)) {
      return candidatePosition;
    }
  }

  // Fallback: random offset
  return {
    x: basePosition.x + Math.random() * 200,
    y: basePosition.y + Math.random() * 200 - 100,
  };
}
