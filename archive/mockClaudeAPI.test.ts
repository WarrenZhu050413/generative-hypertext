/**
 * Mock Claude API Tests
 *
 * Tests for the mock Claude API implementation used in testing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockClaudeAPI,
  MOCK_RESPONSES,
  createEchoAPI,
  createRandomResponseAPI,
  createErrorAPI,
  createRealisticAPI,
  createContextualResponse,
  installMockClaudeAPI,
  getMockClaudeAPI,
  resetMockClaudeAPI,
} from '../utils/mockClaudeAPI';
import type { Message } from '../../nabokov-clipper/src/shared/types';

describe('MockClaudeAPI', () => {
  let api: MockClaudeAPI;

  beforeEach(() => {
    api = new MockClaudeAPI();
  });

  describe('Basic Functionality', () => {
    it('should create API instance', () => {
      expect(api).toBeDefined();
      expect(api.sendMessage).toBeDefined();
      expect(api.streamMessage).toBeDefined();
    });

    it('should send message and get response', async () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
        },
      ];

      const response = await api.sendMessage(messages);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.role).toBe('assistant');
      expect(response.content).toBeDefined();
      expect(response.stopReason).toBe('end_turn');
    });

    it('should return default response', async () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const response = await api.sendMessage(messages);

      expect(response.content).toBe(MOCK_RESPONSES.default);
    });

    it('should support custom default response', async () => {
      const customAPI = new MockClaudeAPI({
        defaultResponse: 'Custom response',
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const response = await customAPI.sendMessage(messages);

      expect(response.content).toBe('Custom response');
    });
  });

  describe('Call History', () => {
    it('should track call history', async () => {
      const messages1: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'First message',
          timestamp: Date.now(),
        },
      ];

      const messages2: Message[] = [
        {
          id: 'msg-2',
          role: 'user',
          content: 'Second message',
          timestamp: Date.now(),
        },
      ];

      await api.sendMessage(messages1);
      await api.sendMessage(messages2);

      const history = api.getCallHistory();

      expect(history).toHaveLength(2);
      expect(history[0].messages).toEqual(messages1);
      expect(history[1].messages).toEqual(messages2);
    });

    it('should get last request', async () => {
      const messages1: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'First',
          timestamp: Date.now(),
        },
      ];

      const messages2: Message[] = [
        {
          id: 'msg-2',
          role: 'user',
          content: 'Second',
          timestamp: Date.now(),
        },
      ];

      await api.sendMessage(messages1);
      await api.sendMessage(messages2);

      const lastRequest = api.getLastRequest();

      expect(lastRequest).toBeDefined();
      expect(lastRequest?.messages).toEqual(messages2);
    });

    it('should clear history', async () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      await api.sendMessage(messages);
      expect(api.getCallHistory()).toHaveLength(1);

      api.clearHistory();
      expect(api.getCallHistory()).toHaveLength(0);
    });

    it('should reset API', async () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      await api.sendMessage(messages);

      api.reset();

      expect(api.getCallHistory()).toHaveLength(0);
    });
  });

  describe('Response Delay', () => {
    it('should simulate response delay', async () => {
      const delayAPI = new MockClaudeAPI({
        responseDelay: 100,
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const startTime = Date.now();
      await delayAPI.sendMessage(messages);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it('should work without delay', async () => {
      const fastAPI = new MockClaudeAPI({
        responseDelay: 0,
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const startTime = Date.now();
      await fastAPI.sendMessage(messages);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Error Simulation', () => {
    it('should simulate API errors', async () => {
      const errorAPI = new MockClaudeAPI({
        simulateError: true,
        errorMessage: 'Test error',
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      await expect(errorAPI.sendMessage(messages)).rejects.toThrow('Test error');
    });

    it('should use default error message', async () => {
      const errorAPI = new MockClaudeAPI({
        simulateError: true,
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      await expect(errorAPI.sendMessage(messages)).rejects.toThrow('API Error');
    });
  });

  describe('Streaming', () => {
    it('should stream responses', async () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const chunks: string[] = [];
      let messageComplete = false;

      for await (const chunk of api.streamMessage(messages)) {
        if (chunk.type === 'content_block_delta' && chunk.delta) {
          chunks.push(chunk.delta.text);
        } else if (chunk.type === 'message_stop') {
          messageComplete = true;
        }
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(messageComplete).toBe(true);

      // Reconstruct full message
      const fullMessage = chunks.join('');
      expect(fullMessage).toBeTruthy();
    });

    it('should handle streaming errors', async () => {
      const errorAPI = new MockClaudeAPI({
        simulateError: true,
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      await expect(async () => {
        for await (const _ of errorAPI.streamMessage(messages)) {
          // Should not reach here
        }
      }).rejects.toThrow();
    });
  });

  describe('Response Generator', () => {
    it('should use custom response generator', async () => {
      const generatorAPI = new MockClaudeAPI({
        responseGenerator: (request) => {
          const lastMessage = request.messages[request.messages.length - 1];
          return `You asked: ${lastMessage.content}`;
        },
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'What is this?',
          timestamp: Date.now(),
        },
      ];

      const response = await generatorAPI.sendMessage(messages);

      expect(response.content).toBe('You asked: What is this?');
    });

    it('should support contextual responses', () => {
      const request = {
        messages: [
          {
            id: 'msg-1',
            role: 'user' as const,
            content: 'What is this element?',
            timestamp: Date.now(),
          },
        ],
      };

      const response = createContextualResponse(request);

      expect(response).toContain('element');
    });
  });

  describe('Update Options', () => {
    it('should update options dynamically', async () => {
      api.setOptions({
        defaultResponse: 'Updated response',
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const response = await api.sendMessage(messages);

      expect(response.content).toBe('Updated response');
    });

    it('should partially update options', async () => {
      const initialAPI = new MockClaudeAPI({
        defaultResponse: 'Initial',
        responseDelay: 100,
      });

      initialAPI.setOptions({
        defaultResponse: 'Updated',
        // responseDelay should remain 100
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const response = await initialAPI.sendMessage(messages);

      expect(response.content).toBe('Updated');
    });
  });

  describe('Factory Functions', () => {
    it('should create echo API', async () => {
      const echoAPI = createEchoAPI();

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello world',
          timestamp: Date.now(),
        },
      ];

      const response = await echoAPI.sendMessage(messages);

      expect(response.content).toContain('Hello world');
      expect(response.content).toContain('You said:');
    });

    it('should create error API', async () => {
      const errorAPI = createErrorAPI('Custom error');

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      await expect(errorAPI.sendMessage(messages)).rejects.toThrow('Custom error');
    });

    it('should create realistic API', async () => {
      const realisticAPI = createRealisticAPI();

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'What is this code doing?',
          timestamp: Date.now(),
        },
      ];

      const response = await realisticAPI.sendMessage(messages);

      expect(response.content).toBeTruthy();
      expect(response.role).toBe('assistant');
    });
  });

  describe('Global Mock API', () => {
    it('should install global mock API', () => {
      const globalAPI = installMockClaudeAPI({
        defaultResponse: 'Global response',
      });

      expect(globalAPI).toBeDefined();
      expect(getMockClaudeAPI()).toBe(globalAPI);
    });

    it('should throw error if not installed', () => {
      resetMockClaudeAPI();

      expect(() => getMockClaudeAPI()).toThrow('not installed');
    });

    it('should reset global mock API', () => {
      installMockClaudeAPI();
      resetMockClaudeAPI();

      expect(() => getMockClaudeAPI()).toThrow();
    });
  });

  describe('Mock Response Patterns', () => {
    it('should use predefined response patterns', async () => {
      const patterns = Object.keys(MOCK_RESPONSES);

      for (const pattern of patterns) {
        const patternAPI = new MockClaudeAPI({
          defaultResponse: pattern,
        });

        const messages: Message[] = [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test',
            timestamp: Date.now(),
          },
        ];

        const response = await patternAPI.sendMessage(messages);

        expect(response.content).toBe(MOCK_RESPONSES[pattern]);
      }
    });

    it('should handle empty response', async () => {
      const emptyAPI = new MockClaudeAPI({
        defaultResponse: 'empty',
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const response = await emptyAPI.sendMessage(messages);

      expect(response.content).toBe('');
    });

    it('should handle long response', async () => {
      const longAPI = new MockClaudeAPI({
        defaultResponse: 'long',
      });

      const messages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      const response = await longAPI.sendMessage(messages);

      expect(response.content.length).toBeGreaterThan(100);
    });
  });
});