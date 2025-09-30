/**
 * Mock Claude API Utilities
 *
 * Provides mock implementations of the Claude API for testing chat functionality.
 * Supports streaming responses, error scenarios, and custom response patterns.
 */

import type { ClaudeAPIRequest, ClaudeAPIResponse, ClaudeAPIStreamChunk, Message } from '@/types';

/**
 * Mock Claude API response patterns
 */
export const MOCK_RESPONSES: Record<string, string> = {
  default: 'This is a mock response from Claude.',
  empty: '',
  long: 'This is a longer mock response that simulates a more detailed answer from Claude. '.repeat(10),
  error: 'I apologize, but I encountered an error processing your request.',
  contextual: 'Based on the element you selected, here is my analysis...',
  clarification: 'Could you please clarify what you mean by that?',
  code: 'Here is some example code:\n```javascript\nconst example = "test";\n```',
};

/**
 * Configuration for mock Claude API
 */
export interface MockClaudeAPIOptions {
  /**
   * Default response to return (or key from MOCK_RESPONSES)
   */
  defaultResponse?: string;

  /**
   * Simulate streaming responses
   */
  enableStreaming?: boolean;

  /**
   * Delay before response (in ms)
   */
  responseDelay?: number;

  /**
   * Simulate API errors
   */
  simulateError?: boolean;

  /**
   * Error message to return
   */
  errorMessage?: string;

  /**
   * Custom response generator function
   */
  responseGenerator?: (request: ClaudeAPIRequest) => string;
}

/**
 * Mock Claude API class
 *
 * @example
 * const api = new MockClaudeAPI({
 *   defaultResponse: 'Hello! How can I help?',
 *   responseDelay: 100,
 * });
 *
 * const response = await api.sendMessage([
 *   { role: 'user', content: 'What is this?' }
 * ]);
 */
export class MockClaudeAPI {
  private options: Required<Omit<MockClaudeAPIOptions, 'responseGenerator'>> & { responseGenerator?: (request: ClaudeAPIRequest) => string };
  private callHistory: ClaudeAPIRequest[] = [];

  constructor(options: MockClaudeAPIOptions = {}) {
    this.options = {
      defaultResponse: options.defaultResponse || MOCK_RESPONSES.default,
      enableStreaming: options.enableStreaming ?? false,
      responseDelay: options.responseDelay ?? 100,
      simulateError: options.simulateError ?? false,
      errorMessage: options.errorMessage || 'API Error',
      responseGenerator: options.responseGenerator,
    };
  }

  /**
   * Send a message to the mock API
   */
  async sendMessage(
    messages: Message[],
    options?: { stream?: boolean }
  ): Promise<ClaudeAPIResponse> {
    const request: ClaudeAPIRequest = {
      messages,
      stream: options?.stream ?? this.options.enableStreaming,
    };

    this.callHistory.push(request);

    // Simulate delay
    if (this.options.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.options.responseDelay));
    }

    // Simulate error
    if (this.options.simulateError) {
      throw new Error(this.options.errorMessage);
    }

    // Generate response
    let content: string;
    if (this.options.responseGenerator) {
      content = this.options.responseGenerator(request);
    } else if (this.options.defaultResponse in MOCK_RESPONSES) {
      content = MOCK_RESPONSES[this.options.defaultResponse];
    } else {
      content = this.options.defaultResponse;
    }

    return {
      id: `mock-response-${Date.now()}`,
      content,
      role: 'assistant',
      stopReason: 'end_turn',
    };
  }

  /**
   * Send a streaming message to the mock API
   */
  async *streamMessage(messages: Message[]): AsyncGenerator<ClaudeAPIStreamChunk> {
    const request: ClaudeAPIRequest = {
      messages,
      stream: true,
    };

    this.callHistory.push(request);

    // Simulate error
    if (this.options.simulateError) {
      throw new Error(this.options.errorMessage);
    }

    // Generate response
    let content: string;
    if (this.options.responseGenerator) {
      content = this.options.responseGenerator(request);
    } else if (this.options.defaultResponse in MOCK_RESPONSES) {
      content = MOCK_RESPONSES[this.options.defaultResponse];
    } else {
      content = this.options.defaultResponse;
    }

    // Stream response word by word
    const words = content.split(' ');
    for (const word of words) {
      if (this.options.responseDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.responseDelay));
      }

      yield {
        type: 'content_block_delta',
        delta: {
          text: word + ' ',
        },
      };
    }

    // Send completion
    yield {
      type: 'message_stop',
    };
  }

  /**
   * Get call history for assertions
   */
  getCallHistory(): ClaudeAPIRequest[] {
    return [...this.callHistory];
  }

  /**
   * Get the last request made
   */
  getLastRequest(): ClaudeAPIRequest | undefined {
    return this.callHistory[this.callHistory.length - 1];
  }

  /**
   * Clear call history
   */
  clearHistory(): void {
    this.callHistory = [];
  }

  /**
   * Reset the mock to initial state
   */
  reset(): void {
    this.callHistory = [];
  }

  /**
   * Update options
   */
  setOptions(options: Partial<MockClaudeAPIOptions>): void {
    Object.assign(this.options, options);
  }
}

/**
 * Creates a contextual response based on the conversation history
 */
export function createContextualResponse(request: ClaudeAPIRequest): string {
  const lastMessage = request.messages[request.messages.length - 1];

  if (!lastMessage || lastMessage.role !== 'user') {
    return MOCK_RESPONSES.default;
  }

  const userMessage = lastMessage.content.toLowerCase();

  // Pattern matching for common queries
  if (userMessage.includes('what') || userMessage.includes('explain')) {
    return 'Based on the context provided, this element appears to be significant because...';
  }

  if (userMessage.includes('why')) {
    return 'The reason for this is that...';
  }

  if (userMessage.includes('how')) {
    return 'Here is how you can approach this...';
  }

  if (userMessage.includes('code') || userMessage.includes('example')) {
    return MOCK_RESPONSES.code;
  }

  return MOCK_RESPONSES.default;
}

/**
 * Creates a mock API that echoes user input
 */
export function createEchoAPI(): MockClaudeAPI {
  return new MockClaudeAPI({
    responseGenerator: (request) => {
      const lastMessage = request.messages[request.messages.length - 1];
      return `You said: "${lastMessage?.content}"`;
    },
  });
}

/**
 * Creates a mock API that returns random responses
 */
export function createRandomResponseAPI(): MockClaudeAPI {
  const responses = Object.values(MOCK_RESPONSES);
  return new MockClaudeAPI({
    responseGenerator: () => {
      return responses[Math.floor(Math.random() * responses.length)];
    },
  });
}

/**
 * Creates a mock API that simulates errors
 */
export function createErrorAPI(errorMessage?: string): MockClaudeAPI {
  return new MockClaudeAPI({
    simulateError: true,
    errorMessage: errorMessage || 'Mock API Error',
  });
}

/**
 * Creates a mock API with realistic conversation patterns
 */
export function createRealisticAPI(): MockClaudeAPI {
  return new MockClaudeAPI({
    responseGenerator: createContextualResponse,
    responseDelay: 300,
  });
}

/**
 * Global mock API instance for testing
 */
export let globalMockAPI: MockClaudeAPI | null = null;

/**
 * Install global mock API
 */
export function installMockClaudeAPI(options?: MockClaudeAPIOptions): MockClaudeAPI {
  globalMockAPI = new MockClaudeAPI(options);
  return globalMockAPI;
}

/**
 * Get the global mock API instance
 */
export function getMockClaudeAPI(): MockClaudeAPI {
  if (!globalMockAPI) {
    throw new Error('Mock Claude API not installed. Call installMockClaudeAPI() first.');
  }
  return globalMockAPI;
}

/**
 * Reset the global mock API
 */
export function resetMockClaudeAPI(): void {
  if (globalMockAPI) {
    globalMockAPI.reset();
  }
  globalMockAPI = null;
}