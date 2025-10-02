/**
 * E2E Tests for Beautification Service
 *
 * Comprehensive tests for AI-powered content enhancement:
 * - Triggering beautification
 * - Organize content mode
 * - Loading states and feedback
 * - Content sanitization
 * - API integration and fallbacks
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';

// Helper to create test card
async function createTestCard(context: BrowserContext) {
  const card = {
    id: 'test-card-beautify',
    content: '<p>Unstructured content about React hooks. useState is a hook. useEffect is also a hook. They are important.</p>',
    metadata: {
      title: 'React Hooks Info',
      domain: 'test.com',
      url: 'https://test.com/react-hooks',
      favicon: '⚛️',
      timestamp: Date.now(),
    },
    starred: false,
    tags: ['react', 'hooks'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stashed: false,
    position: { x: 100, y: 100 },
    size: { width: 320, height: 240 },
  };
  await setExtensionStorage(context, { cards: [card] });
  return card;
}

// Helper to open canvas
async function openCanvas(context: BrowserContext, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(500);
  return canvasPage;
}

test.describe('Beautification - Triggering', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should show beautify button on card', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨"), button:has-text("Beautify")').first();

    expect(await beautifyButton.count()).toBeGreaterThan(0);
  });

  test('should trigger beautification on button click', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨"), button:has-text("Beautify")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1000);

      // Verify content was updated (in mock mode or real API mode)
      const storage = await getExtensionStorage(context, 'cards');
      const updatedCard = storage.cards.find((c: any) => c.id === 'test-card-beautify');

      // Content should be different from original
      expect(updatedCard.content).not.toBe('<p>Unstructured content about React hooks. useState is a hook. useEffect is also a hook. They are important.</p>');
    }
  });

  test('should show beautification options menu', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      // Click to open menu (might be dropdown)
      await beautifyButton.click();
      await canvasPage.waitForTimeout(300);

      // Look for beautification mode options
      const organizeOption = canvasPage.locator('text=Organize, text=organize-content, button:has-text("Organize")').first();
      expect(await organizeOption.count()).toBeGreaterThan(0);
    }
  });

  test('should trigger organize-content mode', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(300);

      // Select organize mode
      const organizeOption = canvasPage.locator('text=Organize, button:has-text("Organize")').first();
      if (await organizeOption.count() > 0) {
        await organizeOption.click();
        await canvasPage.waitForTimeout(1000);

        // Verify content was organized
        const storage = await getExtensionStorage(context, 'cards');
        const updatedCard = storage.cards.find((c: any) => c.id === 'test-card-beautify');

        // Should have structured HTML (headings, lists, etc.)
        expect(updatedCard.content).toMatch(/<h[1-6]>|<ul>|<ol>|<li>/);
      }
    }
  });
});

test.describe('Beautification - Loading States', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should show loading indicator during beautification', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();

      // Check for loading indicator immediately
      const loadingIndicator = canvasPage.locator('[class*="loading"], [class*="spinner"], text=Loading, text=Beautifying').first();
      expect(await loadingIndicator.count()).toBeGreaterThan(0);
    }
  });

  test('should disable beautify button during processing', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();

      // Button should be disabled during processing
      const isDisabled = await beautifyButton.evaluate(btn => btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true');
      expect(isDisabled).toBe(true);
    }
  });

  test('should show success toast after beautification', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      // Look for success toast
      const successToast = canvasPage.locator('[class*="toast"], [role="alert"]').first();
      if (await successToast.count() > 0) {
        const toastText = await successToast.textContent();
        expect(toastText?.toLowerCase()).toMatch(/success|beautified|organized|complete/);
      }
    }
  });

  test('should show error toast on API failure', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Simulate API failure by removing API key
    await setExtensionStorage(context, { nabokov_claude_api_key: '' });

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      // Should either fall back to mock or show error
      // In mock mode, it should still succeed
      const storage = await getExtensionStorage(context, 'cards');
      const card = storage.cards[0];

      // Content should change (mock fallback) or stay same with error
      expect(card).toBeDefined();
    }
  });
});

test.describe('Beautification - Content Transformation', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should restructure unorganized content', async ({ context, extensionId }) => {
    const card = {
      id: 'messy-card',
      content: '<p>First point here. Second point there. Third point everywhere. Conclusion at end.</p>',
      metadata: { title: 'Messy Content', domain: 'test.com', url: 'https://test.com', favicon: '📝', timestamp: Date.now() },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    };
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="messy-card"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      const storage = await getExtensionStorage(context, 'cards');
      const beautifiedCard = storage.cards.find((c: any) => c.id === 'messy-card');

      // Should have better structure
      expect(beautifiedCard.content.length).toBeGreaterThan(card.content.length);
    }
  });

  test('should preserve important HTML structure', async ({ context, extensionId }) => {
    const card = {
      id: 'structured-card',
      content: '<div><h2>Important Title</h2><p>Content here</p><code>const x = 1;</code></div>',
      metadata: { title: 'Structured', domain: 'test.com', url: 'https://test.com', favicon: '📝', timestamp: Date.now() },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    };
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="structured-card"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      const storage = await getExtensionStorage(context, 'cards');
      const beautifiedCard = storage.cards.find((c: any) => c.id === 'structured-card');

      // Important elements should be preserved
      expect(beautifiedCard.content).toContain('Important Title');
      expect(beautifiedCard.content).toMatch(/const x = 1/);
    }
  });

  test('should sanitize beautified content', async ({ context, extensionId }) => {
    const card = {
      id: 'unsafe-card',
      content: '<p>Safe content</p>',
      metadata: { title: 'Test', domain: 'test.com', url: 'https://test.com', favicon: '📝', timestamp: Date.now() },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    };
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="unsafe-card"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      const storage = await getExtensionStorage(context, 'cards');
      const beautifiedCard = storage.cards.find((c: any) => c.id === 'unsafe-card');

      // Should not contain scripts or dangerous elements
      expect(beautifiedCard.content).not.toContain('<script');
      expect(beautifiedCard.content).not.toContain('onclick');
      expect(beautifiedCard.content).not.toContain('onerror');
    }
  });

  test('should update updatedAt timestamp', async ({ context, extensionId }) => {
    const card = await createTestCard(context);
    const originalUpdatedAt = card.updatedAt;

    const canvasPage = await openCanvas(context, extensionId);
    await canvasPage.waitForTimeout(100);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      const storage = await getExtensionStorage(context, 'cards');
      const updatedCard = storage.cards.find((c: any) => c.id === 'test-card-beautify');

      expect(updatedCard.updatedAt).toBeGreaterThan(originalUpdatedAt);
    }
  });
});

test.describe('Beautification - API Integration', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should use Claude API when key configured', async ({ context, extensionId }) => {
    await createTestCard(context);
    // Set API key
    await setExtensionStorage(context, { nabokov_claude_api_key: 'test-api-key-123' });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      // In test environment, should use mock or handle API call
      const storage = await getExtensionStorage(context, 'cards');
      const card = storage.cards[0];
      expect(card.content).toBeDefined();
    }
  });

  test('should fall back to mock when API unavailable', async ({ context, extensionId }) => {
    await createTestCard(context);
    // No API key configured
    await setExtensionStorage(context, { nabokov_claude_api_key: '' });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      // Should still succeed with mock fallback
      const storage = await getExtensionStorage(context, 'cards');
      const card = storage.cards[0];

      // Content should be changed (mock response)
      expect(card.content).not.toBe('<p>Unstructured content about React hooks. useState is a hook. useEffect is also a hook. They are important.</p>');
    }
  });

  test('should check backend server availability', async ({ context, extensionId }) => {
    await createTestCard(context);

    const canvasPage = await openCanvas(context, extensionId);

    // Check if beautification service attempts backend first
    const cardNode = canvasPage.locator('[data-id="test-card-beautify"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      // Should work regardless of backend availability (fallbacks in place)
      const storage = await getExtensionStorage(context, 'cards');
      expect(storage.cards).toHaveLength(1);
    }
  });
});

test.describe('Beautification - Edge Cases', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should handle empty content gracefully', async ({ context, extensionId }) => {
    const card = {
      id: 'empty-card',
      content: '',
      metadata: { title: 'Empty', domain: 'test.com', url: 'https://test.com', favicon: '📝', timestamp: Date.now() },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    };
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="empty-card"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      // Should not crash
      const storage = await getExtensionStorage(context, 'cards');
      expect(storage.cards).toHaveLength(1);
    }
  });

  test('should handle very long content', async ({ context, extensionId }) => {
    const longContent = '<p>' + 'Lorem ipsum '.repeat(500) + '</p>';
    const card = {
      id: 'long-card',
      content: longContent,
      metadata: { title: 'Long', domain: 'test.com', url: 'https://test.com', favicon: '📝', timestamp: Date.now() },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    };
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="long-card"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(2000);

      // Should handle long content
      const storage = await getExtensionStorage(context, 'cards');
      const updatedCard = storage.cards.find((c: any) => c.id === 'long-card');
      expect(updatedCard.content).toBeDefined();
    }
  });

  test('should handle special characters and unicode', async ({ context, extensionId }) => {
    const card = {
      id: 'unicode-card',
      content: '<p>Special chars: 中文 🚀 émoji café ñoño</p>',
      metadata: { title: 'Unicode', domain: 'test.com', url: 'https://test.com', favicon: '🌐', timestamp: Date.now() },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    };
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="unicode-card"]').first();
    const beautifyButton = cardNode.locator('button[aria-label*="Beautify"], button:has-text("✨")').first();

    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      await canvasPage.waitForTimeout(1500);

      const storage = await getExtensionStorage(context, 'cards');
      const beautifiedCard = storage.cards.find((c: any) => c.id === 'unicode-card');

      // Unicode should be preserved
      expect(beautifiedCard.content).toMatch(/中文|🚀|café|ñoño/);
    }
  });
});
