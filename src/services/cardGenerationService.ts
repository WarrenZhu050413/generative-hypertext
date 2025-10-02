/**
 * Card Generation Service
 * Generates new cards from button actions using LLM
 */

import type { Card } from '@/types/card';
import type { CardButton } from '@/types/button';
import { generateId, saveCard } from '@/utils/storage';
import { addConnection } from '@/utils/connectionStorage';
import { claudeAPIService } from './claudeAPIService';
import { apiConfigService } from './apiConfig';

export class CardGenerationService {
  /**
   * Generate a new card from a button action
   * @param sourceCard - The card the action was triggered from
   * @param button - The button configuration
   * @param customContext - Optional user-provided context
   * @returns The newly created card
   */
  async generateCardFromButton(
    sourceCard: Card,
    button: CardButton,
    customContext?: string
  ): Promise<Card> {
    console.log('[cardGenerationService] Starting generation', { sourceCard: sourceCard.id, button: button.id, customContext });

    // Build prompt from template
    const prompt = this.buildPrompt(button.prompt, {
      content: this.extractTextContent(sourceCard.content || ''),
      title: sourceCard.metadata.title,
      customContext: customContext || '',
    });

    console.log('[cardGenerationService] Built prompt:', prompt.substring(0, 100) + '...');

    // Check if API key is configured
    if (!(await apiConfigService.hasAPIKey())) {
      throw new Error(
        'Claude API key not configured. Please add your API key in Settings (gear icon) to generate cards.'
      );
    }

    // Generate content from LLM
    console.log('[cardGenerationService] Calling Claude API...');
    let responseContent = '';

    try {
      responseContent = await claudeAPIService.sendMessage([
        { role: 'user', content: prompt }
      ], {
        system: 'You are a helpful assistant generating new content based on existing cards.',
        maxTokens: 3072
      });

      console.log('[cardGenerationService] ✓ Claude API success');

    } catch (apiError) {
      console.error('[cardGenerationService] ✗ Claude API failed:', apiError);

      // Re-throw with user-friendly message
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      throw new Error(
        `Failed to generate card: ${errorMessage}\n\nPlease check:\n- Your API key is valid\n- You have internet connection\n- Claude API service is available`
      );
    }

    console.log('[cardGenerationService] Response length:', responseContent.length);

    // Create conversation manually (no need for chatService)
    const conversation = [
      {
        id: generateId(),
        role: 'user' as const,
        content: prompt,
        timestamp: Date.now()
      },
      {
        id: generateId(),
        role: 'assistant' as const,
        content: responseContent,
        timestamp: Date.now()
      }
    ];

    // Calculate position for new card (to the right of source)
    const position = this.calculatePosition(sourceCard);

    // Create new card
    const newCard: Card = {
      id: generateId(),
      content: this.formatAsHTML(responseContent),
      cardType: 'generated',
      parentCardId: sourceCard.id,
      metadata: {
        title: `${button.label}: ${sourceCard.metadata.title}`,
        domain: 'ai-generated',
        favicon: button.icon,
        url: '',
        timestamp: Date.now(),
      },
      position,
      size: { width: 400, height: 300 },
      starred: false,
      tags: ['ai-generated', button.label.toLowerCase()],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      conversation,
      generationContext: {
        sourceMessageId: conversation[0]?.id || generateId(),
        userPrompt: prompt,
        timestamp: Date.now(),
      },
    };

    // Save card
    console.log('[cardGenerationService] Saving new card:', newCard.id);
    await saveCard(newCard);
    console.log('[cardGenerationService] Card saved successfully');

    // Create connection
    console.log('[cardGenerationService] Creating connection from', sourceCard.id, 'to', newCard.id);
    await addConnection({
      id: generateId(),
      source: sourceCard.id,
      target: newCard.id,
      type: button.connectionType,
      label: customContext ? `${button.label}: ${customContext}` : button.label,
      metadata: {
        createdAt: Date.now(),
        createdBy: 'user',
      },
    });
    console.log('[cardGenerationService] Connection created successfully');

    console.log('[cardGenerationService] Generation complete, returning new card');
    return newCard;
  }

  /**
   * Build prompt from template with variable substitution
   * @param template - Prompt template with {{variables}}
   * @param context - Context object with variable values
   * @returns Processed prompt string
   */
  private buildPrompt(template: string, context: Record<string, string>): string {
    let result = template;

    // Handle conditional expressions first (before simple replacements)
    // Handles both single and double quotes: {{customContext || 'default'}} or {{customContext || "default"}}
    result = result.replace(/\{\{(\w+)\s*\|\|\s*["']([^"']*)["']\}\}/g, (match, varName, defaultValue) => {
      return context[varName] || defaultValue;
    });

    // Replace remaining simple template variables
    Object.entries(context).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || '');
    });

    return result;
  }

  /**
   * Extract plain text from HTML content
   * @param html - HTML content
   * @returns Plain text
   */
  private extractTextContent(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Format response content as HTML
   * @param content - Plain text content
   * @returns HTML formatted content
   */
  private formatAsHTML(content: string): string {
    // Convert plain text to HTML with paragraphs
    return content
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  /**
   * Calculate position for new card relative to source
   * @param sourceCard - Source card
   * @returns Position for new card
   */
  private calculatePosition(sourceCard: Card): { x: number; y: number } {
    const baseX = sourceCard.position?.x || 0;
    const baseY = sourceCard.position?.y || 0;
    const cardWidth = sourceCard.size?.width || 320;

    return {
      x: baseX + cardWidth + 60, // 60px gap
      y: baseY,
    };
  }
}

// Singleton instance
export const cardGenerationService = new CardGenerationService();
