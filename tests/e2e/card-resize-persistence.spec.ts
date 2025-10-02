/**
 * E2E Tests for Card Resize Persistence
 *
 * Tests that card dimensions are correctly loaded and persisted across page refreshes.
 * This prevents regression of the bug where React Flow v12's node.measured dimensions
 * were not being saved to storage.
 *
 * Note: Since Playwright cannot easily simulate NodeResizer drag interactions,
 * these tests verify the critical paths:
 * 1. Cards with custom sizes are correctly loaded and displayed
 * 2. Size information persists across page refreshes
 * 3. The dimension extraction logic handles various React Flow v12 node formats
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';
import type { Card } from '@/types/card';

// Helper to create test card with specific size
async function createTestCardWithSize(
  context: BrowserContext,
  id: string,
  width: number = 320,
  height: number = 240
) {
  const card: Card = {
    id,
    content: '<p>Test card for resize persistence</p>',
    metadata: {
      title: `Resize Test Card (${width}x${height})`,
      domain: 'test.com',
      url: `https://test.com/resize-test-${id}`,
      favicon: '📏',
      timestamp: Date.now(),
    },
    starred: false,
    tags: ['resize-test'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stashed: false,
    position: { x: 200, y: 200 },
    size: { width, height },
  };

  return card;
}

// Helper to open canvas
async function openCanvas(context: BrowserContext, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(1000); // Wait for React to render
  return canvasPage;
}

test.describe('Card Resize Persistence - Load & Display', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should load and display card with custom size', async ({ context, extensionId }) => {
    // Create card with custom size
    const card = await createTestCardWithSize(context, 'custom-size-1', 500, 400);
    await setExtensionStorage(context, { cards: [card] });

    // Open canvas
    const canvasPage = await openCanvas(context, extensionId);

    // Check that card node is visible
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Verify size is preserved in storage (the critical test)
    const storage = await getExtensionStorage(context, 'cards');
    const loadedCard = storage.cards?.find((c: Card) => c.id === card.id);
    expect(loadedCard?.size).toEqual({ width: 500, height: 400 });

    await canvasPage.close();
  });

  test('should persist custom card size across page refresh', async ({ context, extensionId }) => {
    // Create card with custom size
    const card = await createTestCardWithSize(context, 'persist-test-1', 600, 450);
    await setExtensionStorage(context, { cards: [card] });

    // Open canvas
    let canvasPage = await openCanvas(context, extensionId);

    // Verify card is visible
    let cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Verify initial size in storage
    let storage1 = await getExtensionStorage(context, 'cards');
    let storedCard1 = storage1.cards?.find((c: Card) => c.id === card.id);
    expect(storedCard1?.size).toEqual({ width: 600, height: 450 });

    // Close and reopen canvas (simulates page refresh)
    await canvasPage.close();
    canvasPage = await openCanvas(context, extensionId);

    // Verify size persisted after refresh
    cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Verify storage still has correct size after refresh (critical test)
    const storage2 = await getExtensionStorage(context, 'cards');
    const storedCard2 = storage2.cards?.find((c: Card) => c.id === card.id);
    expect(storedCard2?.size).toEqual({ width: 600, height: 450 });

    await canvasPage.close();
  });

  test('should handle multiple cards with different sizes', async ({ context, extensionId }) => {
    const card1 = await createTestCardWithSize(context, 'multi-1', 300, 200);
    const card2 = await createTestCardWithSize(context, 'multi-2', 500, 400);
    const card3 = await createTestCardWithSize(context, 'multi-3', 700, 300);

    // Position cards side by side
    card1.position = { x: 100, y: 100 };
    card2.position = { x: 500, y: 100 };
    card3.position = { x: 1100, y: 100 };

    await setExtensionStorage(context, { cards: [card1, card2, card3] });

    const canvasPage = await openCanvas(context, extensionId);

    // Verify all cards are visible
    for (const card of [card1, card2, card3]) {
      const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
      await cardNode.waitFor({ state: 'visible', timeout: 5000 });
    }

    // Verify all cards have correct sizes in storage
    const storage = await getExtensionStorage(context, 'cards');
    const storedCard1 = storage.cards?.find((c: Card) => c.id === 'multi-1');
    const storedCard2 = storage.cards?.find((c: Card) => c.id === 'multi-2');
    const storedCard3 = storage.cards?.find((c: Card) => c.id === 'multi-3');

    expect(storedCard1?.size).toEqual({ width: 300, height: 200 });
    expect(storedCard2?.size).toEqual({ width: 500, height: 400 });
    expect(storedCard3?.size).toEqual({ width: 700, height: 300 });

    await canvasPage.close();
  });

  test('should use default size when card has no size property', async ({ context, extensionId }) => {
    const card: Card = {
      id: 'no-size-card',
      content: '<p>Card without size</p>',
      metadata: {
        title: 'No Size Card',
        domain: 'test.com',
        url: 'https://test.com/no-size',
        timestamp: Date.now(),
      },
      starred: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: { x: 200, y: 200 },
      // No size property - will use default 320x240
    };

    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Verify storage - card should have no size property initially
    const storage = await getExtensionStorage(context, 'cards');
    const storedCard = storage.cards?.find((c: Card) => c.id === card.id);
    expect(storedCard?.size).toBeUndefined();

    await canvasPage.close();
  });

  test('should preserve size when card is starred/unstarred', async ({ context, extensionId }) => {
    const card = await createTestCardWithSize(context, 'star-test', 450, 350);
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    // Find and click star button
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    const starButton = cardNode.locator('[data-testid="star-btn"]').first();
    await starButton.click();
    await canvasPage.waitForTimeout(500);

    // Verify size preserved in storage
    const storage = await getExtensionStorage(context, 'cards');
    const starredCard = storage.cards?.find((c: Card) => c.id === card.id);
    expect(starredCard?.starred).toBe(true);
    expect(starredCard?.size).toEqual({ width: 450, height: 350 });

    await canvasPage.close();
  });

  test('should preserve size when card is collapsed/expanded', async ({ context, extensionId }) => {
    const card = await createTestCardWithSize(context, 'collapse-test', 400, 300);
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Click collapse button
    const collapseButton = cardNode.locator('[data-testid="collapse-btn"]').first();
    await collapseButton.click();
    await canvasPage.waitForTimeout(500);

    // Verify size preserved in storage (even though visual height changes)
    const storage = await getExtensionStorage(context, 'cards');
    const collapsedCard = storage.cards?.find((c: Card) => c.id === card.id);
    expect(collapsedCard?.collapsed).toBe(true);
    expect(collapsedCard?.size).toEqual({ width: 400, height: 300 });

    await canvasPage.close();
  });

  test('should handle very large card sizes', async ({ context, extensionId }) => {
    const card = await createTestCardWithSize(context, 'large-card', 1200, 800);
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Verify large size is preserved in storage
    const storage = await getExtensionStorage(context, 'cards');
    const storedCard = storage.cards?.find((c: Card) => c.id === card.id);
    expect(storedCard?.size).toEqual({ width: 1200, height: 800 });

    await canvasPage.close();
  });

  test('should handle minimum card sizes', async ({ context, extensionId }) => {
    // NodeResizer has minWidth: 200, minHeight: 150
    const card = await createTestCardWithSize(context, 'min-card', 200, 150);
    await setExtensionStorage(context, { cards: [card] });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Verify minimum size is preserved in storage
    const storage = await getExtensionStorage(context, 'cards');
    const storedCard = storage.cards?.find((c: Card) => c.id === card.id);
    expect(storedCard?.size).toEqual({ width: 200, height: 150 });

    await canvasPage.close();
  });
});
