/**
 * Chat service for managing conversations in floating windows
 */

import type { Message } from '@/types/card';
import { generateId } from '@/utils/storage';
import { mockContentGenerator } from './mockContentGenerator';
import { claudeAPIService } from './claudeAPIService';
import { getCardById, saveCard } from '@/utils/storage';

/**
 * ChatService interface
 */
export interface IChatService {
  sendMessage(
    cardId: string,
    userMessage: string,
    cardContent: string
  ): AsyncGenerator<string, void, unknown>;

  stopStreaming(cardId: string): void;
  getConversation(cardId: string): Message[];
  clearConversation(cardId: string): void;
}

/**
 * Chat service implementation
 * Manages conversations and streaming responses
 */
export class ChatService implements IChatService {
  private conversations = new Map<string, Message[]>();
  private abortControllers = new Map<string, AbortController>();

  /**
   * Send a message and stream the response
   * @param cardId Card ID
   * @param userMessage User's message
   * @param cardContent Card content for context
   * @returns AsyncGenerator yielding response chunks
   */
  async *sendMessage(
    cardId: string,
    userMessage: string,
    cardContent: string
  ): AsyncGenerator<string, void, unknown> {
    // Add user message
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    this.addMessage(cardId, userMsg);

    // Create assistant message (streaming)
    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
      parentId: userMsg.id
    };
    this.addMessage(cardId, assistantMsg);

    // Stream response
    const controller = new AbortController();
    this.abortControllers.set(cardId, controller);

    try {
      // TRY REAL API FIRST
      console.log('[ChatService] Trying Claude API...');
      const prompt = `Context: ${cardContent}\n\nUser: ${userMessage}`;

      try {
        const response = await claudeAPIService.sendMessage([
          { role: 'user', content: prompt }
        ], {
          system: 'You are a helpful assistant analyzing web content.',
          maxTokens: 2048
        });

        console.log('[ChatService] ✓ Claude API success');

        // Simulate streaming by yielding chunks
        const chunkSize = 10;
        for (let i = 0; i < response.length; i += chunkSize) {
          if (controller.signal.aborted) break;
          const chunk = response.slice(i, i + chunkSize);
          assistantMsg.content += chunk;
          yield chunk;
          await new Promise(resolve => setTimeout(resolve, 20));
        }

      } catch (apiError) {
        // API FAILED - show error and fall back to mock
        console.error('[ChatService] ✗ Claude API failed:', apiError);
        console.warn('[ChatService] Falling back to mock');

        // Fall back to mock
        const stream = mockContentGenerator.generate(
          userMessage,
          cardContent,
          controller.signal
        );

        for await (const chunk of stream) {
          assistantMsg.content += chunk;
          yield chunk;
        }
      }

      assistantMsg.streaming = false;
      await this.saveConversation(cardId);
    } catch (error) {
      if (controller.signal.aborted) {
        assistantMsg.content += '\n\n[Response stopped by user]';
        assistantMsg.streaming = false;
      } else {
        console.error('[ChatService] Error streaming response:', error);
        assistantMsg.content += '\n\n[Error generating response]';
        assistantMsg.streaming = false;
      }
      await this.saveConversation(cardId);
    } finally {
      this.abortControllers.delete(cardId);
    }
  }

  /**
   * Stop streaming response for a card
   * @param cardId Card ID
   */
  stopStreaming(cardId: string): void {
    const controller = this.abortControllers.get(cardId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(cardId);
    }
  }

  /**
   * Get conversation for a card
   * @param cardId Card ID
   * @returns Array of messages
   */
  getConversation(cardId: string): Message[] {
    return this.conversations.get(cardId) || [];
  }

  /**
   * Clear conversation for a card
   * @param cardId Card ID
   */
  async clearConversation(cardId: string): Promise<void> {
    this.conversations.delete(cardId);
    await this.saveConversation(cardId);
  }

  /**
   * Load conversation from card
   * @param cardId Card ID
   */
  async loadConversation(cardId: string): Promise<void> {
    const card = await getCardById(cardId);
    if (card && card.conversation) {
      this.conversations.set(cardId, card.conversation);
    }
  }

  /**
   * Add message to conversation
   * @param cardId Card ID
   * @param message Message to add
   */
  private addMessage(cardId: string, message: Message): void {
    const conversation = this.conversations.get(cardId) || [];
    conversation.push(message);
    this.conversations.set(cardId, conversation);
  }

  /**
   * Save conversation to card
   * @param cardId Card ID
   */
  private async saveConversation(cardId: string): Promise<void> {
    try {
      const card = await getCardById(cardId);
      if (card) {
        card.conversation = this.getConversation(cardId);
        card.updatedAt = Date.now();
        await saveCard(card);
      }
    } catch (error) {
      console.error('[ChatService] Error saving conversation:', error);
    }
  }
}

// Singleton instance
export const chatService = new ChatService();
