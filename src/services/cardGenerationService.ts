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

    // Calculate position for new card (to the right of source)
    const position = this.calculatePosition(sourceCard);
    const cardId = generateId();
    const now = Date.now();

    // Create skeleton card immediately
    const skeletonCard: Card = {
      id: cardId,
      content: '<p class="skeleton-placeholder">Generating content...</p>',
      cardType: 'generated',
      parentCardId: sourceCard.id,
      metadata: {
        title: `${button.label}: ${sourceCard.metadata.title}`,
        domain: 'ai-generated',
        favicon: button.icon,
        url: '',
        timestamp: now,
      },
      position,
      size: { width: 400, height: 300 },
      starred: false,
      tags: ['ai-generated', button.label.toLowerCase()],
      createdAt: now,
      updatedAt: now,
      isGenerating: true, // Mark as generating for skeleton UI
      generationContext: {
        sourceMessageId: generateId(),
        userPrompt: prompt,
        timestamp: now,
      },
    };

    // Save skeleton card and show it immediately
    console.log('[cardGenerationService] Creating skeleton card:', cardId);
    await saveCard(skeletonCard);

    // Create connection immediately
    const connectionId = generateId();
    await addConnection({
      id: connectionId,
      source: sourceCard.id,
      target: cardId,
      type: button.connectionType,
      label: customContext ? `${button.label}: ${customContext}` : button.label,
      metadata: {
        createdAt: now,
        createdBy: 'user',
      },
    });

    // Dispatch event to refresh canvas and show skeleton
    window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    console.log('[cardGenerationService] Skeleton card displayed');

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

      // Update skeleton card with error message
      skeletonCard.content = '<p style="color: #e53e3e;">⚠️ Generation failed. Click to retry.</p>';
      skeletonCard.isGenerating = false;
      await saveCard(skeletonCard);
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));

      // Re-throw with user-friendly message
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      throw new Error(
        `Failed to generate card: ${errorMessage}\n\nPlease check:\n- Your API key is valid\n- You have internet connection\n- Claude API service is available`
      );
    }

    console.log('[cardGenerationService] Response length:', responseContent.length);

    // Create conversation
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

    // Update card with final content
    const finalCard: Card = {
      ...skeletonCard,
      content: this.formatAsHTML(responseContent),
      conversation,
      isGenerating: false, // Clear generating flag
      updatedAt: Date.now(),
    };

    // Save final card
    console.log('[cardGenerationService] Updating with final content');
    await saveCard(finalCard);

    // Dispatch event to refresh canvas with final content
    window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    console.log('[cardGenerationService] Generation complete');

    return finalCard;
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
