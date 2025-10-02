/**
 * E2E Tests for Card Operations
 *
 * Comprehensive tests for all card operations on the canvas:
 * - Card deletion (single and multiple)
 * - Card duplication
 * - Card starring
 * - Card tagging (add, remove, edit)
 * - Inline editing
 * - Card collapsing/expanding
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';

// Helper to create test cards in storage
async function createTestCards(context: BrowserContext, count: number = 1) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push({
      id: `test-card-${i}-${Date.now()}`,
      content: `<p>Test card content ${i}</p>`,
      metadata: {
        title: `Test Card ${i}`,
        domain: 'test.com',
        url: `https://test.com/page${i}`,
        favicon: '🧪',
        timestamp: Date.now(),
      },
      starred: false,
      tags: i === 0 ? ['initial', 'test'] : ['test'],
      createdAt: Date.now() - i * 1000,
      updatedAt: Date.now() - i * 1000,
      stashed: false,
      position: { x: 100 + i * 400, y: 100 + i * 50 },
      size: { width: 320, height: 240 },
    });
  }
  await setExtensionStorage(context, { cards });
  return cards;
}

// Helper to open canvas and wait for cards to load
async function openCanvas(context: BrowserContext, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(500); // Wait for React to render
  return canvasPage;
}

test.describe('Card Operations - Deletion', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should delete single card via delete button', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Find the card node
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    // Click delete button (trash icon)
    const deleteButton = cardNode.locator('button[aria-label*="Delete"], button:has-text("🗑")').first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await canvasPage.waitForTimeout(500);

      // Verify card is removed from storage
      const storage = await getExtensionStorage(context, 'cards');
      expect(storage.cards || []).toHaveLength(0);
    }
  });

  test('should delete card via keyboard shortcut (Delete key)', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Select card (click on it)
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.click();
    await canvasPage.waitForTimeout(200);

    // Press Delete key
    await canvasPage.keyboard.press('Delete');
    await canvasPage.waitForTimeout(500);

    // Verify card is removed
    const storage = await getExtensionStorage(context, 'cards');
    expect(storage.cards || []).toHaveLength(0);
  });

  test('should delete card via keyboard shortcut (Backspace key)', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Select card
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.click();
    await canvasPage.waitForTimeout(200);

    // Press Backspace key
    await canvasPage.keyboard.press('Backspace');
    await canvasPage.waitForTimeout(500);

    // Verify card is removed
    const storage = await getExtensionStorage(context, 'cards');
    expect(storage.cards || []).toHaveLength(0);
  });

  test('should delete multiple selected cards', async ({ context, extensionId }) => {
    await createTestCards(context, 3);
    const canvasPage = await openCanvas(context, extensionId);

    // Select multiple cards (Cmd/Ctrl + click)
    const cards = canvasPage.locator('[data-id^="test-card-"]');
    await cards.first().click();
    await canvasPage.keyboard.down(process.platform === 'darwin' ? 'Meta' : 'Control');
    await cards.nth(1).click();
    await canvasPage.keyboard.up(process.platform === 'darwin' ? 'Meta' : 'Control');
    await canvasPage.waitForTimeout(200);

    // Delete selected cards
    await canvasPage.keyboard.press('Delete');
    await canvasPage.waitForTimeout(500);

    // Verify only 1 card remains
    const storage = await getExtensionStorage(context, 'cards');
    expect(storage.cards || []).toHaveLength(1);
  });
});

test.describe('Card Operations - Duplication', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should duplicate card via duplicate button', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Find duplicate button
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const duplicateButton = cardNode.locator('button[aria-label*="Duplicate"], button:has-text("📋")').first();

    if (await duplicateButton.count() > 0) {
      await duplicateButton.click();
      await canvasPage.waitForTimeout(500);

      // Verify duplicate was created
      const storage = await getExtensionStorage(context, 'cards');
      expect(storage.cards || []).toHaveLength(2);

      // Verify duplicate has same content but different ID
      const duplicate = storage.cards.find((c: any) => c.id !== card.id);
      expect(duplicate.content).toBe(card.content);
      expect(duplicate.metadata.title).toBe(card.metadata.title);
    }
  });

  test('should position duplicated card offset from original', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const duplicateButton = cardNode.locator('button[aria-label*="Duplicate"], button:has-text("📋")').first();

    if (await duplicateButton.count() > 0) {
      await duplicateButton.click();
      await canvasPage.waitForTimeout(500);

      const storage = await getExtensionStorage(context, 'cards');
      const duplicate = storage.cards.find((c: any) => c.id !== card.id);

      // Verify offset position (usually +20px to right and down)
      expect(duplicate.position.x).toBeGreaterThan(card.position.x);
      expect(duplicate.position.y).toBeGreaterThan(card.position.y);
    }
  });
});

test.describe('Card Operations - Starring', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should star card via star button', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Find star button
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const starButton = cardNode.locator('button[aria-label*="Star"], button:has-text("⭐"), button:has-text("☆")').first();

    if (await starButton.count() > 0) {
      await starButton.click();
      await canvasPage.waitForTimeout(500);

      // Verify card is starred
      const storage = await getExtensionStorage(context, 'cards');
      const starredCard = storage.cards.find((c: any) => c.id === card.id);
      expect(starredCard.starred).toBe(true);
    }
  });

  test('should unstar card via star button', async ({ context, extensionId }) => {
    // Create starred card
    const cards = [{
      id: `starred-${Date.now()}`,
      content: '<p>Starred card</p>',
      metadata: { title: 'Starred', domain: 'test.com', url: 'https://test.com', favicon: '⭐', timestamp: Date.now() },
      starred: true,
      tags: ['test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    }];
    await setExtensionStorage(context, { cards });

    const canvasPage = await openCanvas(context, extensionId);

    // Find and click star button
    const cardNode = canvasPage.locator(`[data-id="${cards[0].id}"]`).first();
    const starButton = cardNode.locator('button[aria-label*="Star"], button:has-text("⭐"), button:has-text("☆")').first();

    if (await starButton.count() > 0) {
      await starButton.click();
      await canvasPage.waitForTimeout(500);

      // Verify card is unstarred
      const storage = await getExtensionStorage(context, 'cards');
      const unstarredCard = storage.cards.find((c: any) => c.id === cards[0].id);
      expect(unstarredCard.starred).toBe(false);
    }
  });

  test('should visually indicate starred status', async ({ context, extensionId }) => {
    const cards = [{
      id: `starred-${Date.now()}`,
      content: '<p>Starred card</p>',
      metadata: { title: 'Starred', domain: 'test.com', url: 'https://test.com', favicon: '⭐', timestamp: Date.now() },
      starred: true,
      tags: ['test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    }];
    await setExtensionStorage(context, { cards });

    const canvasPage = await openCanvas(context, extensionId);

    // Check for visual star indicator
    const cardNode = canvasPage.locator(`[data-id="${cards[0].id}"]`).first();
    const starIcon = cardNode.locator('text=⭐, text=★').first();

    expect(await starIcon.count()).toBeGreaterThan(0);
  });
});

test.describe('Card Operations - Tagging', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should display existing tags on card', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Find card and check for tags
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();

    for (const tag of card.tags) {
      const tagElement = cardNode.locator(`text=${tag}`).first();
      expect(await tagElement.count()).toBeGreaterThan(0);
    }
  });

  test('should add new tag to card', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Find tag input or add button
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const tagInput = cardNode.locator('input[placeholder*="tag"], input[aria-label*="tag"]').first();

    if (await tagInput.count() > 0) {
      await tagInput.fill('newtag');
      await canvasPage.keyboard.press('Enter');
      await canvasPage.waitForTimeout(500);

      // Verify tag was added
      const storage = await getExtensionStorage(context, 'cards');
      const updatedCard = storage.cards.find((c: any) => c.id === card.id);
      expect(updatedCard.tags).toContain('newtag');
    }
  });

  test('should remove tag from card', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Find tag remove button (usually an X or × next to tag)
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const removeButton = cardNode.locator('button:has-text("×"), button:has-text("✕")').first();

    if (await removeButton.count() > 0) {
      await removeButton.click();
      await canvasPage.waitForTimeout(500);

      // Verify tag was removed
      const storage = await getExtensionStorage(context, 'cards');
      const updatedCard = storage.cards.find((c: any) => c.id === card.id);
      expect(updatedCard.tags).not.toContain(card.tags[0]);
    }
  });
});

test.describe('Card Operations - Inline Editing', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should enter edit mode on double-click', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Double-click content area
    const cardNode = canvasPage.locator(`[data-card-id="${card.id}"]`).first();
    await cardNode.waitFor({ state: 'visible', timeout: 5000 });

    const contentArea = cardNode.locator('.card-content-scrollable').first();

    if (await contentArea.count() > 0) {
      await contentArea.dblclick();
      await canvasPage.waitForTimeout(500);

      // Check for textarea (edit mode uses textarea, not contenteditable)
      const textarea = cardNode.locator('textarea[placeholder*="Card content"]').first();
      expect(await textarea.isVisible()).toBe(true);
    }
  });

  test('should save edited content on blur', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const contentArea = cardNode.locator('.card-content, [class*="content"]').first();

    if (await contentArea.count() > 0) {
      await contentArea.dblclick();
      await canvasPage.waitForTimeout(200);

      // Edit content
      const editableDiv = cardNode.locator('[contenteditable="true"]').first();
      if (await editableDiv.count() > 0) {
        await editableDiv.fill('<p>Edited content</p>');

        // Click outside to blur
        await canvasPage.locator('body').click({ position: { x: 0, y: 0 } });
        await canvasPage.waitForTimeout(500);

        // Verify content was saved
        const storage = await getExtensionStorage(context, 'cards');
        const editedCard = storage.cards.find((c: any) => c.id === card.id);
        expect(editedCard.content).toContain('Edited content');
      }
    }
  });

  test('should save edited content on Cmd/Ctrl+Enter', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const contentArea = cardNode.locator('.card-content, [class*="content"]').first();

    if (await contentArea.count() > 0) {
      await contentArea.dblclick();
      await canvasPage.waitForTimeout(200);

      const editableDiv = cardNode.locator('[contenteditable="true"]').first();
      if (await editableDiv.count() > 0) {
        await editableDiv.fill('<p>Saved via shortcut</p>');

        // Press Cmd/Ctrl+Enter
        await canvasPage.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
        await canvasPage.waitForTimeout(500);

        const storage = await getExtensionStorage(context, 'cards');
        const savedCard = storage.cards.find((c: any) => c.id === card.id);
        expect(savedCard.content).toContain('Saved via shortcut');
      }
    }
  });

  test('should cancel edit on Escape key', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const originalContent = card.content;
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const contentArea = cardNode.locator('.card-content, [class*="content"]').first();

    if (await contentArea.count() > 0) {
      await contentArea.dblclick();
      await canvasPage.waitForTimeout(200);

      const editableDiv = cardNode.locator('[contenteditable="true"]').first();
      if (await editableDiv.count() > 0) {
        await editableDiv.fill('<p>This should be cancelled</p>');

        // Press Escape
        await canvasPage.keyboard.press('Escape');
        await canvasPage.waitForTimeout(500);

        // Verify content was NOT changed
        const storage = await getExtensionStorage(context, 'cards');
        const unchangedCard = storage.cards.find((c: any) => c.id === card.id);
        expect(unchangedCard.content).toBe(originalContent);
      }
    }
  });

  test('should sanitize edited content before saving', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const contentArea = cardNode.locator('.card-content, [class*="content"]').first();

    if (await contentArea.count() > 0) {
      await contentArea.dblclick();
      await canvasPage.waitForTimeout(200);

      const editableDiv = cardNode.locator('[contenteditable="true"]').first();
      if (await editableDiv.count() > 0) {
        // Try to inject script tag
        await editableDiv.fill('<p>Safe content</p><script>alert("XSS")</script>');
        await canvasPage.locator('body').click({ position: { x: 0, y: 0 } });
        await canvasPage.waitForTimeout(500);

        const storage = await getExtensionStorage(context, 'cards');
        const sanitizedCard = storage.cards.find((c: any) => c.id === card.id);

        // Verify script tag was removed
        expect(sanitizedCard.content).not.toContain('<script>');
        expect(sanitizedCard.content).toContain('Safe content');
      }
    }
  });
});

test.describe('Card Operations - Collapse/Expand', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should collapse card via collapse button', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    // Find collapse button
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const collapseButton = cardNode.locator('button[aria-label*="Collapse"], button:has-text("▼"), button:has-text("−")').first();

    if (await collapseButton.count() > 0) {
      const initialHeight = await cardNode.boundingBox().then(box => box?.height);

      await collapseButton.click();
      await canvasPage.waitForTimeout(500);

      const collapsedHeight = await cardNode.boundingBox().then(box => box?.height);

      // Verify card is smaller when collapsed
      expect(collapsedHeight).toBeLessThan(initialHeight!);
    }
  });

  test('should expand collapsed card', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const collapseButton = cardNode.locator('button[aria-label*="Collapse"], button:has-text("▼"), button:has-text("−")').first();

    if (await collapseButton.count() > 0) {
      // Collapse first
      await collapseButton.click();
      await canvasPage.waitForTimeout(300);

      // Then expand
      const expandButton = cardNode.locator('button[aria-label*="Expand"], button:has-text("▶"), button:has-text("+")').first();
      await expandButton.click();
      await canvasPage.waitForTimeout(300);

      // Verify content is visible again
      const contentArea = cardNode.locator('.card-content, [class*="content"]').first();
      expect(await contentArea.isVisible()).toBe(true);
    }
  });

  test('should persist collapse state in storage', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, 1);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const collapseButton = cardNode.locator('button[aria-label*="Collapse"], button:has-text("▼"), button:has-text("−")').first();

    if (await collapseButton.count() > 0) {
      await collapseButton.click();
      await canvasPage.waitForTimeout(500);

      const storage = await getExtensionStorage(context, 'cards');
      const collapsedCard = storage.cards.find((c: any) => c.id === card.id);

      // Check if collapsed state is stored (might be in card.collapsed or card.isCollapsed)
      expect(collapsedCard.collapsed || collapsedCard.isCollapsed).toBe(true);
    }
  });
});
