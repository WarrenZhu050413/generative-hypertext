/**
 * Child card generator service
 * Generates new cards from selected text using LLM
 */

import type { Card } from '@/types/card';
import type { TextSelection } from '@/utils/textSelection';
import { mockContentGenerator } from './mockContentGenerator';

export type GenerationType = 'explanation' | 'definition' | 'deep-dive' | 'examples';

export interface GenerateChildCardRequest {
  selection: TextSelection;
  parentCard: Card;
  generationType: GenerationType;
  signal?: AbortSignal;
}

export interface GenerationResult {
  title: string;
  content: string;
  tags: string[];
}

/**
 * Build context-aware prompt for LLM
 */
function buildPrompt(request: GenerateChildCardRequest): string {
  const { selection, parentCard, generationType } = request;

  const typePrompts = {
    explanation: 'Provide a general overview and explanation',
    definition: 'Give a precise, technical definition',
    'deep-dive': 'Provide a comprehensive analysis with examples',
    examples: 'Give practical use cases and applications',
  };

  const instruction = typePrompts[generationType];

  return `${instruction} of "${selection.text}".

Context from parent card:
- Title: ${parentCard.metadata.title}
- Domain: ${parentCard.metadata.domain}
- URL: ${parentCard.metadata.url}
- Tags: ${parentCard.tags?.join(', ') || 'none'}

Surrounding context:
...${selection.contextBefore} [${selection.text}] ${selection.contextAfter}...

Please respond with a JSON object in this exact format:
{
  "title": "Brief title for the concept",
  "content": "Detailed explanation in HTML format with proper paragraphs and formatting",
  "tags": ["tag1", "tag2", "tag3"]
}

Make the content informative and well-structured with proper HTML tags (p, h3, ul, li, strong, etc.).`;
}

/**
 * Parse LLM response to extract JSON
 */
function parseResponse(responseText: string): GenerationResult {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      return {
        title: parsed.title || 'Generated Content',
        content: parsed.content || responseText,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      };
    }

    // Fallback if no JSON found
    return {
      title: 'Generated Content',
      content: `<p>${responseText}</p>`,
      tags: [],
    };
  } catch (error) {
    console.error('[childCardGenerator] Error parsing response:', error);
    return {
      title: 'Generated Content',
      content: `<p>${responseText}</p>`,
      tags: [],
    };
  }
}

/**
 * Generate child card from selected text
 * Yields streaming chunks and returns final result
 */
export async function* generateChildCard(
  request: GenerateChildCardRequest
): AsyncGenerator<string, GenerationResult, unknown> {
  const prompt = buildPrompt(request);
  let fullResponse = '';

  try {
    // Use mock generator for now (will use real Claude API when configured)
    const stream = mockContentGenerator.generate(
      prompt,
      request.parentCard.content || '',
      request.signal
    );

    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }

    // Parse final response
    const result = parseResponse(fullResponse);
    return result;
  } catch (error) {
    if (request.signal?.aborted) {
      throw new Error('Generation cancelled');
    }
    throw error;
  }
}

/**
 * Get suggested title for selected text
 * Quick helper for generating card title
 */
export function getSuggestedTitle(selectedText: string, generationType: GenerationType): string {
  const prefixes = {
    explanation: 'Explaining',
    definition: 'Definition of',
    'deep-dive': 'Deep Dive into',
    examples: 'Examples of',
  };

  const prefix = prefixes[generationType];
  const truncated = selectedText.length > 50
    ? selectedText.substring(0, 50) + '...'
    : selectedText;

  return `${prefix}: ${truncated}`;
}
