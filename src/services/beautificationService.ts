/**
 * Beautification service for AI-powered card content enhancement
 * Phase 2.1: AI Beautification
 */

import type { Card, BeautificationMode } from '@/types/card';
import { getCardById, saveCard, getScreenshot } from '@/utils/storage';
import DOMPurify from 'dompurify';
import { claudeAPIService, type ClaudeMessage } from './claudeAPIService';
import { apiConfigService } from './apiConfig';

/**
 * DOMPurify-safe prompt templates
 * These prompts instruct the LLM to return ONLY sanitizable HTML
 */
const PROMPT_TEMPLATES = {
  'recreate-design': `
You are a design expert helping to recreate a web element's design.

INPUT:
- Original HTML content (may be messy)
- Screenshot of the original element (if available)

TASK:
Recreate the visual design with clean, semantic HTML. Focus on:
1. Visual hierarchy and typography
2. Spacing and layout
3. Color scheme from the screenshot
4. Semantic HTML structure

CRITICAL RULES:
- Return ONLY valid HTML (no scripts, no event handlers)
- Use inline styles for all styling (no external CSS)
- Do NOT include <html>, <head>, or <body> tags
- Do NOT include any JavaScript or event handlers
- Use semantic tags: <article>, <section>, <header>, <nav>, etc.
- Keep the content but improve the presentation

Return the beautified HTML directly, with no explanations or markdown code blocks.
  `,

  'organize-content': `
You are a content organization expert helping to structure information.

INPUT:
- Raw HTML content (possibly unstructured)

TASK:
Organize the content into a clean, readable structure:
1. Extract key information
2. Create logical sections with headings
3. Use lists for enumerated items
4. Highlight important points
5. Add visual hierarchy with typography

CRITICAL RULES:
- Return ONLY valid HTML (no scripts, no event handlers)
- Use inline styles for all styling (no external CSS)
- Do NOT include <html>, <head>, or <body> tags
- Do NOT include any JavaScript or event handlers
- Use semantic tags: <article>, <section>, <header>, <p>, <ul>, <ol>, etc.
- Preserve all original information, just reorganize it

Return the beautified HTML directly, with no explanations or markdown code blocks.
  `
};

/**
 * Mock beautification responses for development
 * In production, these will be replaced with actual Claude API calls
 */
const MOCK_BEAUTIFIED_CONTENT: Record<BeautificationMode, string> = {
  'recreate-design': `
    <article style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);">
      <header style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid rgba(212, 175, 55, 0.3);">
        <h2 style="color: #2c3e50; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">Recreated Design</h2>
        <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Beautifully styled content</p>
      </header>
      <section style="line-height: 1.8; color: #34495e;">
        <p style="margin: 0 0 16px 0; font-size: 16px;">This content has been recreated with attention to visual hierarchy, typography, and spacing. The design follows modern web aesthetics while maintaining readability.</p>
        <ul style="list-style: none; padding: 0; margin: 16px 0;">
          <li style="padding: 12px; margin: 8px 0; background: white; border-left: 4px solid #D4AF37; border-radius: 4px;">
            <strong style="color: #2c3e50;">Visual hierarchy</strong> — Clear distinction between elements
          </li>
          <li style="padding: 12px; margin: 8px 0; background: white; border-left: 4px solid #D4AF37; border-radius: 4px;">
            <strong style="color: #2c3e50;">Typography</strong> — Readable font choices and sizes
          </li>
          <li style="padding: 12px; margin: 8px 0; background: white; border-left: 4px solid #D4AF37; border-radius: 4px;">
            <strong style="color: #2c3e50;">Spacing</strong> — Comfortable white space
          </li>
        </ul>
      </section>
    </article>
  `,

  'organize-content': `
    <article style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; padding: 24px; background: #ffffff; border: 1px solid #e1e8ed; border-radius: 8px;">
      <header style="margin-bottom: 20px;">
        <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">Organized Content</h2>
      </header>

      <section style="margin-bottom: 24px;">
        <h3 style="color: #5C4D42; font-size: 18px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid rgba(184, 156, 130, 0.3);">Overview</h3>
        <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 12px 0;">
          The content has been reorganized into logical sections with clear headings, making it easier to scan and understand.
        </p>
      </section>

      <section style="margin-bottom: 24px;">
        <h3 style="color: #5C4D42; font-size: 18px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid rgba(184, 156, 130, 0.3);">Key Points</h3>
        <ol style="color: #4a4a4a; line-height: 1.7; margin: 0; padding-left: 24px;">
          <li style="margin: 0 0 8px 0;"><strong>Structured hierarchy</strong> — Information flows logically from general to specific</li>
          <li style="margin: 0 0 8px 0;"><strong>Visual separation</strong> — Clear sections help with comprehension</li>
          <li style="margin: 0 0 8px 0;"><strong>Emphasized content</strong> — Important points stand out</li>
        </ol>
      </section>

      <section>
        <h3 style="color: #5C4D42; font-size: 18px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid rgba(184, 156, 130, 0.3);">Additional Details</h3>
        <p style="color: #4a4a4a; line-height: 1.7; margin: 0;">
          All original information is preserved while the presentation is enhanced for better readability and visual appeal.
        </p>
      </section>
    </article>
  `
};

/**
 * Beautification service interface
 */
export interface IBeautificationService {
  beautifyCard(cardId: string, mode: BeautificationMode): Promise<void>;
  revertBeautification(cardId: string): Promise<void>;
  isBeautified(card: Card): boolean;
}

/**
 * Beautification service implementation
 * Manages AI-powered content beautification
 */
export class BeautificationService implements IBeautificationService {
  /**
   * Beautify a card's content using AI
   * @param cardId Card ID to beautify
   * @param mode Beautification mode ('recreate-design' or 'organize-content')
   */
  async beautifyCard(cardId: string, mode: BeautificationMode): Promise<void> {
    try {
      console.log(`[BeautificationService] Starting beautification for card ${cardId} with mode: ${mode}`);

      const card = await getCardById(cardId);
      if (!card) {
        throw new Error(`Card not found: ${cardId}`);
      }

      // Don't beautify if already beautified
      if (card.beautifiedContent) {
        console.log('[BeautificationService] Card already beautified, reverting first');
        await this.revertBeautification(cardId);
        // Reload card after revert
        const reloadedCard = await getCardById(cardId);
        if (!reloadedCard) throw new Error(`Card not found after revert: ${cardId}`);
        Object.assign(card, reloadedCard);
      }

      // Save original content before beautification
      const originalHTML = card.content || '';

      // TODO: Replace with actual Claude API call
      // For now, use mock responses
      const beautifiedHTML = await this.generateBeautifiedContent(
        originalHTML,
        mode,
        card.screenshotId
      );

      // Sanitize the beautified content
      const sanitizedHTML = DOMPurify.sanitize(beautifiedHTML, {
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'br', 'strong', 'em', 'u', 'a', 'img',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'table', 'thead', 'tbody', 'tr', 'td', 'th',
          'article', 'section', 'header', 'footer', 'nav', 'aside',
          'blockquote', 'pre', 'code'
        ],
        ALLOWED_ATTR: ['style', 'href', 'src', 'alt', 'title', 'class', 'id'],
        ALLOW_DATA_ATTR: false,
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      });

      // Update card with beautified content
      const updatedCard: Card = {
        ...card,
        originalHTML,
        beautifiedContent: sanitizedHTML,
        beautificationMode: mode,
        beautificationTimestamp: Date.now(),
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));

      console.log('[BeautificationService] Beautification complete');
    } catch (error) {
      console.error('[BeautificationService] Error beautifying card:', error);
      throw error;
    }
  }

  /**
   * Revert beautification and restore original content
   * @param cardId Card ID to revert
   */
  async revertBeautification(cardId: string): Promise<void> {
    try {
      console.log(`[BeautificationService] Reverting beautification for card ${cardId}`);

      const card = await getCardById(cardId);
      if (!card) {
        throw new Error(`Card not found: ${cardId}`);
      }

      if (!card.beautifiedContent) {
        console.log('[BeautificationService] Card is not beautified, nothing to revert');
        return;
      }

      // Restore original content
      const updatedCard: Card = {
        ...card,
        content: card.originalHTML || card.content,
        originalHTML: undefined,
        beautifiedContent: undefined,
        beautificationMode: undefined,
        beautificationTimestamp: undefined,
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));

      console.log('[BeautificationService] Revert complete');
    } catch (error) {
      console.error('[BeautificationService] Error reverting beautification:', error);
      throw error;
    }
  }

  /**
   * Check if a card is beautified
   * @param card Card to check
   * @returns True if card has beautified content
   */
  isBeautified(card: Card): boolean {
    return !!card.beautifiedContent;
  }

  /**
   * Generate beautified content using AI
   * @param originalHTML Original HTML content
   * @param mode Beautification mode
   * @param screenshotId Screenshot ID for visual reference (optional)
   * @returns Beautified HTML content
   * @private
   */
  private async generateBeautifiedContent(
    originalHTML: string,
    mode: BeautificationMode,
    screenshotId?: string
  ): Promise<string> {
    console.log('[BeautificationService] Generating beautified content...');
    console.log('[BeautificationService] Mode:', mode);
    console.log('[BeautificationService] Has screenshot:', !!screenshotId);

    // Check if API key is configured
    const hasAPIKey = await apiConfigService.hasAPIKey();

    if (!hasAPIKey) {
      console.warn('[BeautificationService] No API key configured, using mock response');
      // Fallback to mock response
      await new Promise(resolve => setTimeout(resolve, 1500));
      return MOCK_BEAUTIFIED_CONTENT[mode];
    }

    try {
      const systemPrompt = PROMPT_TEMPLATES[mode];
      const userMessage = `Please beautify the following HTML content:\n\n${originalHTML}`;

      let beautifiedHTML: string;

      // For recreate-design mode with screenshot, use vision API
      if (mode === 'recreate-design' && screenshotId) {
        console.log('[BeautificationService] Loading screenshot for vision API...');
        const screenshot = await getScreenshot(screenshotId);

        if (screenshot?.dataUrl) {
          // Extract base64 data from data URL
          const base64Data = screenshot.dataUrl.split(',')[1];

          const messages: ClaudeMessage[] = [
            { role: 'user', content: userMessage }
          ];

          beautifiedHTML = await claudeAPIService.sendMessageWithVision(
            messages,
            base64Data,
            {
              system: systemPrompt,
              temperature: 0.7,
              maxTokens: 4096,
            }
          );
        } else {
          console.warn('[BeautificationService] Screenshot not found, falling back to text-only');
          const messages: ClaudeMessage[] = [
            { role: 'user', content: userMessage }
          ];

          beautifiedHTML = await claudeAPIService.sendMessage(messages, {
            system: systemPrompt,
            temperature: 0.7,
            maxTokens: 4096,
          });
        }
      } else {
        // Text-only mode (organize-content or recreate-design without screenshot)
        console.log('[BeautificationService] Using text-only API...');
        const messages: ClaudeMessage[] = [
          { role: 'user', content: userMessage }
        ];

        beautifiedHTML = await claudeAPIService.sendMessage(messages, {
          system: systemPrompt,
          temperature: 0.7,
          maxTokens: 4096,
        });
      }

      console.log('[BeautificationService] Beautification complete via Claude API');
      return beautifiedHTML;

    } catch (error) {
      console.error('[BeautificationService] Error calling Claude API:', error);

      // Fallback to mock response on error
      console.warn('[BeautificationService] Falling back to mock response due to API error');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return MOCK_BEAUTIFIED_CONTENT[mode];
    }
  }
}

// Singleton instance
export const beautificationService = new BeautificationService();
