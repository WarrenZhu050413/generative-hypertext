/**
 * Fill-In Service
 * Synthesizes card content from connected cards using LLM
 */

import type { Card, FillInStrategy } from '@/types/card';
import { getConnectedCards, buildFillInContext } from './connectionContextService';
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

  // Check if API key is configured
  if (!(await apiConfigService.hasAPIKey())) {
    throw new Error(
      'Claude API key not configured. Please add your API key in Settings (gear icon) to use fill-in.'
    );
  }

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

  console.log('[fillInService] Calling Claude API...');

  let fullContent = '';

  try {
    // Use real Claude API (non-streaming for now)
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

    console.log('[fillInService] ✓ Claude API success');

    // Yield the full content at once
    yield fullContent;

    return {
      content: fullContent,
      sourceCardIds: connectedCards.map((c) => c.id),
    };

  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Fill-in cancelled');
    }

    console.error('[fillInService] ✗ Claude API failed:', error);

    // Re-throw with user-friendly message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to fill in card: ${errorMessage}\n\nPlease check:\n- Your API key is valid\n- You have internet connection\n- Claude API service is available`
    );
  }
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
