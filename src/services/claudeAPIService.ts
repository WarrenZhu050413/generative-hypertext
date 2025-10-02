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
 *
 * Priority order:
 * 1. Local backend (Agent SDK with subscription auth)
 * 2. Direct API (requires API key)
 * 3. Caller falls back to mock
 */
export class ClaudeAPIService {
  private readonly API_VERSION = '2023-06-01';
  private readonly API_URL = 'https://api.anthropic.com/v1/messages';
  private readonly BACKEND_URL = 'http://localhost:3100';
  private readonly DEFAULT_MODEL = 'claude-sonnet-4-20250514';
  private readonly DEFAULT_MAX_TOKENS = 4096;

  /**
   * Send a message to Claude API
   * Tries local backend first, then falls back to direct API
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
    // STEP 1: Try local backend (Agent SDK with subscription auth)
    try {
      console.log('[ClaudeAPI] Trying local backend first...');
      const backendResponse = await fetch(`${this.BACKEND_URL}/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          options: {
            system: options?.system,
            maxTokens: options?.maxTokens || this.DEFAULT_MAX_TOKENS,
            temperature: options?.temperature,
            model: options?.model || this.DEFAULT_MODEL,
          },
        }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        if (data.content) {
          console.log('[ClaudeAPI] ✓ Backend success (subscription auth)');
          return data.content;
        }
      }

      console.log('[ClaudeAPI] Backend unavailable, trying direct API...');
    } catch (backendError) {
      console.log('[ClaudeAPI] Backend not running, trying direct API...');
    }

    // STEP 2: Try direct API with API key
    const apiKey = await apiConfigService.getAPIKey();

    const request: ClaudeAPIRequest = {
      model: options?.model || this.DEFAULT_MODEL,
      messages,
      max_tokens: options?.maxTokens || this.DEFAULT_MAX_TOKENS,
      temperature: options?.temperature ?? 1.0,
    };

    if (options?.system) {
      request.system = options.system;
    }

    console.log('[ClaudeAPI] Trying direct API:', {
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
        console.error('[ClaudeAPI] Direct API error:', errorData);
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText}${
            errorData.error?.message ? ` - ${errorData.error.message}` : ''
          }`
        );
      }

      const data: ClaudeAPIResponse = await response.json();
      console.log('[ClaudeAPI] ✓ Direct API success:', {
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
   *
   * Note: Vision API requires direct API with API key
   * Backend doesn't support vision yet
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
    // Vision API requires direct API (backend doesn't support vision yet)
    console.log('[ClaudeAPI] Vision requires direct API');

    const apiKey = await apiConfigService.getAPIKey();

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

    console.log('[ClaudeAPI] Sending vision request to direct API:', {
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
        console.error('[ClaudeAPI] Vision API error:', errorData);
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText}${
            errorData.error?.message ? ` - ${errorData.error.message}` : ''
          }`
        );
      }

      const data: ClaudeAPIResponse = await response.json();
      console.log('[ClaudeAPI] ✓ Vision API success:', {
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
