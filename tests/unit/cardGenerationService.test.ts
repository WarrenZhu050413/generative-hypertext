/**
 * Unit tests for CardGenerationService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CardGenerationService } from '@/services/cardGenerationService';
import type { Card } from '@/types/card';
import type { CardButton } from '@/types/button';

// Mock dependencies
vi.mock('@/utils/storage', () => ({
  generateId: vi.fn(() => 'test-id-123'),
  saveCard: vi.fn(),
}));

vi.mock('@/utils/connectionStorage', () => ({
  addConnection: vi.fn(),
}));

vi.mock('@/services/claudeAPIService', () => ({
  claudeAPIService: {
    sendMessage: vi.fn(async () => 'Generated response content'),
  },
}));

vi.mock('@/services/apiConfig', () => ({
  apiConfigService: {
    hasAPIKey: vi.fn(async () => true),
    getAPIKey: vi.fn(async () => 'test-api-key'),
  },
}));

describe('CardGenerationService', () => {
  let service: CardGenerationService;
  let sourceCard: Card;
  let button: CardButton;

  beforeEach(() => {
    service = new CardGenerationService();

    sourceCard = {
      id: 'source-card-1',
      content: '<p>This is the source content</p>',
      metadata: {
        title: 'Source Card Title',
        domain: 'example.com',
        url: 'https://example.com',
        favicon: '📄',
        timestamp: Date.now(),
      },
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
      starred: false,
      tags: ['test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    button = {
      id: 'learn-more',
      label: 'Learn More',
      icon: '📚',
      prompt: 'Based on this content: "{{content}}", provide more information about {{customContext || "the main topic"}}.\n\nTitle: {{title}}',
      connectionType: 'references',
      enabled: true,
    };
  });

  it('generates card with correct structure', async () => {
    const newCard = await service.generateCardFromButton(sourceCard, button, 'historical context');

    expect(newCard).toMatchObject({
      id: expect.any(String),
      cardType: 'generated',
      parentCardId: 'source-card-1',
      metadata: {
        title: 'Learn More: Source Card Title',
        domain: 'ai-generated',
        favicon: '📚',
      },
      tags: expect.arrayContaining(['ai-generated', 'learn more']),
    });
  });

  it('extracts plain text from HTML content', async () => {
    const { claudeAPIService } = await import('@/services/claudeAPIService');

    await service.generateCardFromButton(sourceCard, button, '');

    expect(claudeAPIService.sendMessage).toHaveBeenCalled();
    const callArgs = (claudeAPIService.sendMessage as any).mock.calls[0];
    const messages = callArgs[0];
    const prompt = messages[0].content;

    // Should contain plain text, not HTML
    expect(prompt).toContain('This is the source content');
    expect(prompt).not.toContain('<p>');
  });

  it('substitutes template variables correctly', async () => {
    const { claudeAPIService } = await import('@/services/claudeAPIService');

    await service.generateCardFromButton(sourceCard, button, 'historical context');

    const callArgs = (claudeAPIService.sendMessage as any).mock.calls[0];
    const messages = callArgs[0];
    const prompt = messages[0].content;

    expect(prompt).toContain('Source Card Title');
    expect(prompt).toContain('This is the source content');
    expect(prompt).toContain('historical context');
  });

  it('uses default value when customContext is empty', async () => {
    const { claudeAPIService } = await import('@/services/claudeAPIService');

    await service.generateCardFromButton(sourceCard, button, '');

    const callArgs = (claudeAPIService.sendMessage as any).mock.calls[0];
    const messages = callArgs[0];
    const prompt = messages[0].content;

    expect(prompt).toContain('the main topic');
  });

  it('calculates position to the right of source card', async () => {
    const newCard = await service.generateCardFromButton(sourceCard, button, '');

    expect(newCard.position).toEqual({
      x: 100 + 320 + 60, // source x + source width + gap
      y: 100, // same y as source
    });
  });

  it('formats response content as HTML', async () => {
    const newCard = await service.generateCardFromButton(sourceCard, button, '');

    expect(newCard.content).toContain('<p>');
    expect(newCard.content).toContain('Generated response content');
  });

  it('saves card and creates connection', async () => {
    const { saveCard } = await import('@/utils/storage');
    const { addConnection } = await import('@/utils/connectionStorage');

    await service.generateCardFromButton(sourceCard, button, 'historical context');

    expect(saveCard).toHaveBeenCalled();
    expect(addConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'source-card-1',
        target: expect.any(String),
        type: 'references',
        label: 'Learn More: historical context',
      })
    );
  });

});
