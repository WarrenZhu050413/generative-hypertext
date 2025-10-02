/**
 * Claude API Service
 * Real integration with Anthropic Claude API for Chrome extension
 */

import { apiConfigService } from './apiConfig';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; [key: string]: any }>;
}

export interface ClaudeAPIRequest {
  model?: string;
  messages: ClaudeMessage[];
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

export interface ClaudeAPIResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude API Service
 * Handles communication with Anthropic's Claude API
 */
export class ClaudeAPIService {
  private readonly API_VERSION = '2023-06-01';
  private readonly API_URL = 'https://api.anthropic.com/v1/messages';
  private readonly DEFAULT_MODEL = 'claude-sonnet-4-20250514';
  private readonly DEFAULT_MAX_TOKENS = 4096;

  /**
   * Send a message to Claude API
   */
  async sendMessage(
    messages: ClaudeMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ): Promise<string> {
    const apiKey = await apiConfigService.getAPIKey();
    // apiKey may be null - that's okay, SDK might use other auth methods

    const request: ClaudeAPIRequest = {
      model: options?.model || this.DEFAULT_MODEL,
      messages,
      max_tokens: options?.maxTokens || this.DEFAULT_MAX_TOKENS,
      temperature: options?.temperature ?? 1.0,
    };

    if (options?.system) {
      request.system = options.system;
    }

    console.log('[ClaudeAPI] Sending request:', {
      model: request.model,
      messageCount: messages.length,
      hasSystem: !!request.system,
      hasAPIKey: !!apiKey,
    });

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
          'anthropic-version': this.API_VERSION,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ClaudeAPI] API error:', errorData);
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText}${
            errorData.error?.message ? ` - ${errorData.error.message}` : ''
          }`
        );
      }

      const data: ClaudeAPIResponse = await response.json();
      console.log('[ClaudeAPI] Response received:', {
        id: data.id,
        stopReason: data.stop_reason,
        usage: data.usage,
      });

      // Extract text from response
      const textContent = data.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return textContent;
    } catch (error) {
      console.error('[ClaudeAPI] Error calling Claude API:', error);
      throw error;
    }
  }

  /**
   * Send a message with vision (screenshot analysis)
   * For beautification "recreate-design" mode
   */
  async sendMessageWithVision(
    messages: ClaudeMessage[],
    screenshotBase64: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ): Promise<string> {
    const apiKey = await apiConfigService.getAPIKey();
    // apiKey may be null - that's okay, SDK might use other auth methods

    // Use vision-capable model
    const model = 'claude-sonnet-4-20250514'; // Sonnet 4 supports vision

    // Add screenshot to the last user message
    const enhancedMessages = [...messages];
    const lastMessage = enhancedMessages[enhancedMessages.length - 1];

    if (lastMessage && lastMessage.role === 'user') {
      // Convert content to multimodal format
      const originalContent = typeof lastMessage.content === 'string'
        ? lastMessage.content
        : '';

      lastMessage.content = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: screenshotBase64,
          },
        },
        {
          type: 'text',
          text: originalContent,
        },
      ];
    }

    const request: ClaudeAPIRequest = {
      model,
      messages: enhancedMessages,
      max_tokens: options?.maxTokens || this.DEFAULT_MAX_TOKENS,
      temperature: options?.temperature ?? 1.0,
    };

    if (options?.system) {
      request.system = options.system;
    }

    console.log('[ClaudeAPI] Sending vision request:', {
      model: request.model,
      messageCount: enhancedMessages.length,
      hasScreenshot: true,
      hasAPIKey: !!apiKey,
    });

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
          'anthropic-version': this.API_VERSION,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ClaudeAPI] API error:', errorData);
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText}${
            errorData.error?.message ? ` - ${errorData.error.message}` : ''
          }`
        );
      }

      const data: ClaudeAPIResponse = await response.json();
      console.log('[ClaudeAPI] Vision response received:', {
        id: data.id,
        stopReason: data.stop_reason,
        usage: data.usage,
      });

      // Extract text from response
      const textContent = data.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return textContent;
    } catch (error) {
      console.error('[ClaudeAPI] Error calling Claude Vision API:', error);
      throw error;
    }
  }

  /**
   * Check if API is configured and accessible
   */
  async testConnection(): Promise<boolean> {
    try {
      const hasKey = await apiConfigService.hasAPIKey();
      if (!hasKey) {
        return false;
      }

      // Try a simple API call
      await this.sendMessage(
        [{ role: 'user', content: 'Hello' }],
        { maxTokens: 10 }
      );

      return true;
    } catch (error) {
      console.error('[ClaudeAPI] Connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const claudeAPIService = new ClaudeAPIService();
