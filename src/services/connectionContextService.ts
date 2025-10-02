/**
 * Connection Context Service
 * Gathers content from connected cards for fill-in synthesis
 */

import type { Card } from '@/types/card';
import type { CardConnection } from '@/types/connection';
import { loadConnections } from '@/utils/connectionStorage';

export type ConnectionDirection = 'incoming' | 'outgoing' | 'both';

/**
 * Get all cards connected to a given card
 */
export async function getConnectedCards(
  cardId: string,
  allCards: Card[],
  direction: ConnectionDirection = 'both'
): Promise<Card[]> {
  const connections = await loadConnections();
  const connectedCardIds = new Set<string>();

  connections.forEach((conn: CardConnection) => {
    if (direction === 'incoming' || direction === 'both') {
      // Cards pointing TO this card
      if (conn.target === cardId) {
        connectedCardIds.add(conn.source);
      }
    }
    if (direction === 'outgoing' || direction === 'both') {
      // Cards this card points TO
      if (conn.source === cardId) {
        connectedCardIds.add(conn.target);
      }
    }
  });

  // Filter cards by IDs and remove any that don't have content
  return allCards.filter(
    (card) => connectedCardIds.has(card.id) && card.content && card.content.trim().length > 0
  );
}

/**
 * Build context string from connected cards for LLM prompting
 */
export function buildFillInContext(connectedCards: Card[]): string {
  if (connectedCards.length === 0) {
    return '';
  }

  const contextParts = connectedCards.map((card, index) => {
    const cardNumber = index + 1;
    const cardTitle = card.metadata.title || 'Untitled';
    const cardType = card.cardType || 'clipped';
    const cardUrl = card.metadata.url;
    const cardTags = card.tags && card.tags.length > 0 ? card.tags.join(', ') : 'none';

    // Extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = card.content || '';
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    return `
[Connected Card ${cardNumber}: "${cardTitle}"]
Type: ${cardType}
Source: ${cardUrl}
Tags: ${cardTags}

${textContent.trim()}

---
`.trim();
  });

  return contextParts.join('\n\n');
}

/**
 * Get connection count for a card (for UI badges)
 */
export async function getConnectionCount(cardId: string): Promise<number> {
  const connections = await loadConnections();
  return connections.filter(
    (conn: CardConnection) => conn.source === cardId || conn.target === cardId
  ).length;
}

/**
 * Validate that a card has sufficient connected content for fill-in
 */
export async function validateFillInReadiness(
  cardId: string,
  allCards: Card[]
): Promise<{ ready: boolean; message?: string; connectedCount: number }> {
  const connectedCards = await getConnectedCards(cardId, allCards, 'both');

  if (connectedCards.length === 0) {
    return {
      ready: false,
      message: 'Connect this card to other notes first',
      connectedCount: 0,
    };
  }

  const hasContent = connectedCards.some((card) => card.content && card.content.trim().length > 0);
  if (!hasContent) {
    return {
      ready: false,
      message: 'Connected cards have no content',
      connectedCount: connectedCards.length,
    };
  }

  return {
    ready: true,
    connectedCount: connectedCards.length,
  };
}
