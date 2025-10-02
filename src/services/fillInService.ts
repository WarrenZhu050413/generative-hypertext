/**
 * Fill-In Service
 * Synthesizes card content from connected cards using LLM
 */

import type { Card, FillInStrategy } from '@/types/card';
import { getConnectedCards, buildFillInContext } from './connectionContextService';
import { mockContentGenerator } from './mockContentGenerator';
import { apiConfigService } from './apiConfig';
import { claudeAPIService } from './claudeAPIService';

export interface FillInOptions {
  strategy: FillInStrategy;
  userGuidance?: string;
  signal?: AbortSignal;
}

export interface FillInResult {
  content: string;
  sourceCardIds: string[];
}

/**
 * Build system prompt based on fill-in strategy
 */
function buildSystemPrompt(strategy: FillInStrategy): string {
  const baseInstructions = `You are an expert knowledge synthesizer. Your task is to create coherent, well-structured content by integrating information from multiple connected notes.`;

  const strategyInstructions = {
    replace: `Generate completely new content that synthesizes all the connected cards. Create a comprehensive, cohesive explanation that integrates insights from all sources.`,
    append: `Generate new content to ADD to the existing note. Build upon what's already there, adding new perspectives and information from the connected cards. Your output will be appended to the existing content.`,
    merge: `Generate content that intelligently MERGES with the existing note. Preserve the key insights from the original while weaving in new information from the connected cards. Aim for seamless integration.`,
  };

  return `${baseInstructions}

${strategyInstructions[strategy]}

Guidelines:
- Be concise but comprehensive
- Maintain a clear, logical structure
- Integrate information naturally (don't just list sources)
- Preserve important details and nuances
- Use markdown formatting for readability
- If sources conflict, note the different perspectives`;
}

/**
 * Build user prompt with card context and connected content
 */
function buildUserPrompt(
  card: Card,
  connectedContext: string,
  userGuidance?: string
): string {
  const cardTitle = card.metadata.title || 'Untitled';
  const existingContent = card.content || '[Empty - needs filling]';
  const cardTags = card.tags && card.tags.length > 0 ? card.tags.join(', ') : 'none';

  let prompt = `# Target Card
Title: "${cardTitle}"
Tags: ${cardTags}

Current Content:
${existingContent}

---

# Connected Cards (Sources)

${connectedContext}

---

# Task
Synthesize the information from the connected cards above`;

  if (userGuidance && userGuidance.trim()) {
    prompt += ` with the following guidance: "${userGuidance.trim()}"`;
  }

  prompt += `\n\nGenerate well-structured content in markdown format.`;

  return prompt;
}

/**
 * Fill in card content from connected cards (streaming)
 */
export async function* fillInFromConnections(
  card: Card,
  allCards: Card[],
  options: FillInOptions
): AsyncGenerator<string, FillInResult, unknown> {
  const { strategy, userGuidance, signal } = options;

  // Get connected cards and build context
  const connectedCards = await getConnectedCards(card.id, allCards, 'both');
  const connectedContext = buildFillInContext(connectedCards);

  if (!connectedContext) {
    throw new Error('No connected cards with content found');
  }

  const systemPrompt = buildSystemPrompt(strategy);
  const userPrompt = buildUserPrompt(card, connectedContext, userGuidance);

  console.log('[fillInService] System prompt:', systemPrompt);
  console.log('[fillInService] User prompt:', userPrompt);

  // Check if we have Claude API configured
  const hasAPIKey = await apiConfigService.hasAPIKey();

  let fullContent = '';

  if (hasAPIKey) {
    try {
      // Use real Claude API (non-streaming for now)
      console.log('[fillInService] Using real Claude API');

      fullContent = await claudeAPIService.sendMessage(
        [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        {
          system: systemPrompt,
        }
      );

      // Yield the full content at once
      yield fullContent;
    } catch (error) {
      console.error('[fillInService] Claude API error, falling back to mock:', error);
      // Fallback to mock on error
      const mockStream = mockContentGenerator.generate(
        userPrompt,
        connectedContext,
        signal
      );
      fullContent = '';
      for await (const chunk of mockStream) {
        fullContent += chunk;
        yield chunk;
      }
    }
  } else {
    // Use mock content generator
    console.log('[fillInService] Using mock content generator (no API key)');

    const mockStream = mockContentGenerator.generate(
      userPrompt,
      connectedContext,
      signal
    );

    for await (const chunk of mockStream) {
      fullContent += chunk;
      yield chunk;
    }
  }

  return {
    content: fullContent,
    sourceCardIds: connectedCards.map((c) => c.id),
  };
}

/**
 * Preview what will be generated (for UI)
 */
export function previewFillIn(
  card: Card,
  connectedCards: Card[],
  strategy: FillInStrategy
): string {
  const count = connectedCards.length;
  const strategyLabels = {
    replace: 'Replace content with synthesis',
    append: 'Add synthesis to existing content',
    merge: 'Merge synthesis with existing content',
  };

  return `Will ${strategyLabels[strategy]} using ${count} connected card${count !== 1 ? 's' : ''}.`;
}
