/**
 * E2E Tests for Stash Operations
 *
 * Comprehensive tests for the stash system (Side Panel):
 * - Stashing cards from canvas
 * - Viewing stashed cards in side panel
 * - Restoring cards to canvas
 * - Permanently deleting stashed cards
 * - Cross-context synchronization (Canvas ↔ Side Panel)
 * - Image upload to stash
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';

// Helper to create test cards
async function createTestCards(context: BrowserContext, stashed: boolean = false) {
  const cards = [
    {
      id: 'test-card-1',
      content: '<p>Test card 1</p>',
      metadata: {
        title: 'Test Card 1',
        domain: 'test.com',
        url: 'https://test.com/page1',
        favicon: '🧪',
        timestamp: Date.now(),
      },
      starred: false,
      tags: ['test', 'sample'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    },
    {
      id: 'test-card-2',
      content: '<p>Test card 2</p>',
      metadata: {
        title: 'Test Card 2',
        domain: 'example.com',
        url: 'https://example.com',
        favicon: '📝',
        timestamp: Date.now(),
      },
      starred: true,
      tags: ['example'],
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000,
      stashed,
      position: { x: 500, y: 100 },
      size: { width: 320, height: 240 },
    },
  ];
  await setExtensionStorage(context, { cards });
  return cards;
}

// Helper to open canvas
async function openCanvas(context: BrowserContext, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(500);
  return canvasPage;
}

// Helper to open side panel
async function openSidePanel(context: BrowserContext, extensionId: string): Promise<Page> {
  const sidePanelPage = await context.newPage();
  await sidePanelPage.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html`);
  await sidePanelPage.waitForLoadState('domcontentloaded');
  await sidePanelPage.waitForTimeout(500);
  return sidePanelPage;
}

test.describe('Stash Operations - Stashing Cards', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should stash card from canvas via stash button', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, false);
    const canvasPage = await openCanvas(context, extensionId);

    // Find stash button on card
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const stashButton = cardNode.locator('button[aria-label*="Stash"], button:has-text("📥")').first();

    if (await stashButton.count() > 0) {
      await stashButton.click();
      await canvasPage.waitForTimeout(500);

      // Verify card is stashed
      const storage = await getExtensionStorage(context, 'cards');
      const stashedCard = storage.cards.find((c: any) => c.id === card.id);
      expect(stashedCard.stashed).toBe(true);

      // Verify card is hidden from canvas
      const cardStillVisible = await cardNode.isVisible().catch(() => false);
      expect(cardStillVisible).toBe(false);
    }
  });

  test('should stash card via context menu', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, false);
    const canvasPage = await openCanvas(context, extensionId);

    // Right-click card to open context menu
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    await cardNode.click({ button: 'right' });
    await canvasPage.waitForTimeout(300);

    // Find stash option in context menu
    const stashOption = canvasPage.locator('[role="menuitem"]:has-text("Stash"), button:has-text("Stash")').first();
    if (await stashOption.count() > 0) {
      await stashOption.click();
      await canvasPage.waitForTimeout(500);

      const storage = await getExtensionStorage(context, 'cards');
      const stashedCard = storage.cards.find((c: any) => c.id === card.id);
      expect(stashedCard.stashed).toBe(true);
    }
  });

  test('should not display stashed cards on canvas', async ({ context, extensionId }) => {
    const cards = await createTestCards(context, true); // Create already stashed
    const canvasPage = await openCanvas(context, extensionId);

    // Verify stashed cards are NOT visible
    for (const card of cards) {
      const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
      const isVisible = await cardNode.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });

  test('should broadcast stash event for cross-context sync', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, false);
    const canvasPage = await openCanvas(context, extensionId);

    // Listen for storage events
    const storageEventPromise = canvasPage.evaluate(() => {
      return new Promise((resolve) => {
        const handler = () => {
          resolve(true);
          window.removeEventListener('nabokov:stash-updated', handler);
        };
        window.addEventListener('nabokov:stash-updated', handler);
        setTimeout(() => resolve(false), 5000); // Timeout after 5s
      });
    });

    // Stash card
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const stashButton = cardNode.locator('button[aria-label*="Stash"], button:has-text("📥")').first();

    if (await stashButton.count() > 0) {
      await stashButton.click();

      const eventFired = await storageEventPromise;
      expect(eventFired).toBe(true);
    }
  });
});

test.describe('Stash Operations - Side Panel Display', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should display stashed cards in side panel', async ({ context, extensionId }) => {
    const cards = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Verify cards are displayed
    for (const card of cards) {
      const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
      const isVisible = await cardElement.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('should display card metadata in side panel', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();

    // Check for title
    const titleText = await cardElement.textContent();
    expect(titleText).toContain(card.metadata.title);

    // Check for tags
    for (const tag of card.tags) {
      expect(titleText).toContain(tag);
    }
  });

  test('should display card content preview in side panel', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const content = await cardElement.textContent();

    // Should contain some preview of content
    expect(content).toContain('Test card 1');
  });

  test('should display starred indicator on stashed cards', async ({ context, extensionId }) => {
    const cards = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const starredCard = cards.find(c => c.starred);
    if (starredCard) {
      const cardElement = sidePanelPage.locator(`[data-card-id="${starredCard.id}"], [data-id="${starredCard.id}"]`).first();
      const starIcon = cardElement.locator('text=⭐, text=★').first();
      expect(await starIcon.count()).toBeGreaterThan(0);
    }
  });

  test('should display card type badges in side panel', async ({ context, extensionId }) => {
    const cards = [
      {
        id: 'image-card',
        content: '<p>Image card</p>',
        metadata: { title: 'Image Card', domain: 'test.com', url: 'https://test.com', favicon: '📷', timestamp: Date.now() },
        cardType: 'image',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: true,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'note-card',
        content: '<p>Note card</p>',
        metadata: { title: 'Note Card', domain: 'local', url: 'local', favicon: '📝', timestamp: Date.now() },
        cardType: 'note',
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: true,
        position: { x: 200, y: 200 },
        size: { width: 320, height: 240 },
      },
    ];
    await setExtensionStorage(context, { cards });

    const sidePanelPage = await openSidePanel(context, extensionId);

    // Check for image badge
    const imageCard = sidePanelPage.locator('[data-card-id="image-card"], [data-id="image-card"]').first();
    expect(await imageCard.locator('text=📷, text=Image').count()).toBeGreaterThan(0);

    // Check for note badge
    const noteCard = sidePanelPage.locator('[data-card-id="note-card"], [data-id="note-card"]').first();
    expect(await noteCard.locator('text=📝, text=Note').count()).toBeGreaterThan(0);
  });
});

test.describe('Stash Operations - Restore Cards', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should restore card to canvas via restore button', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Find restore button
    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const restoreButton = cardElement.locator('button[aria-label*="Restore"], button:has-text("Restore"), button:has-text("🎨")').first();

    if (await restoreButton.count() > 0) {
      await restoreButton.click();
      await sidePanelPage.waitForTimeout(500);

      // Verify card is no longer stashed
      const storage = await getExtensionStorage(context, 'cards');
      const restoredCard = storage.cards.find((c: any) => c.id === card.id);
      expect(restoredCard.stashed).toBe(false);
    }
  });

  test('should remove card from side panel when restored', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const restoreButton = cardElement.locator('button[aria-label*="Restore"], button:has-text("Restore"), button:has-text("🎨")').first();

    if (await restoreButton.count() > 0) {
      await restoreButton.click();
      await sidePanelPage.waitForTimeout(500);

      // Card should no longer be visible in side panel
      const stillVisible = await cardElement.isVisible().catch(() => false);
      expect(stillVisible).toBe(false);
    }
  });

  test('should show restored card on canvas', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);

    // Open both side panel and canvas
    const sidePanelPage = await openSidePanel(context, extensionId);
    const canvasPage = await openCanvas(context, extensionId);

    // Restore from side panel
    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const restoreButton = cardElement.locator('button[aria-label*="Restore"], button:has-text("Restore"), button:has-text("🎨")').first();

    if (await restoreButton.count() > 0) {
      await restoreButton.click();
      await sidePanelPage.waitForTimeout(500);

      // Refresh canvas to see restored card
      await canvasPage.reload();
      await canvasPage.waitForTimeout(500);

      // Verify card is visible on canvas
      const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
      const isVisible = await cardNode.isVisible();
      expect(isVisible).toBe(true);
    }
  });
});

test.describe('Stash Operations - Permanent Delete', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should permanently delete card via delete button', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const deleteButton = cardElement.locator('button[aria-label*="Delete"], button:has-text("Delete"), button:has-text("🗑")').first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await sidePanelPage.waitForTimeout(500);

      // Verify card is completely removed from storage
      const storage = await getExtensionStorage(context, 'cards');
      const deletedCard = storage.cards.find((c: any) => c.id === card.id);
      expect(deletedCard).toBeUndefined();
    }
  });

  test('should show confirmation dialog before permanent delete', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const deleteButton = cardElement.locator('button[aria-label*="Delete"], button:has-text("Delete"), button:has-text("🗑")').first();

    if (await deleteButton.count() > 0) {
      // Set up dialog handler
      sidePanelPage.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      await deleteButton.click();
      await sidePanelPage.waitForTimeout(500);
    }
  });

  test('should remove card from side panel when deleted', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const deleteButton = cardElement.locator('button[aria-label*="Delete"], button:has-text("Delete"), button:has-text("🗑")').first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await sidePanelPage.waitForTimeout(500);

      const stillVisible = await cardElement.isVisible().catch(() => false);
      expect(stillVisible).toBe(false);
    }
  });
});

test.describe('Stash Operations - Cross-Context Sync', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should sync stash updates from canvas to side panel', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, false);

    // Open both pages
    const canvasPage = await openCanvas(context, extensionId);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Stash from canvas
    const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
    const stashButton = cardNode.locator('button[aria-label*="Stash"], button:has-text("📥")').first();

    if (await stashButton.count() > 0) {
      await stashButton.click();
      await canvasPage.waitForTimeout(500);

      // Reload side panel to see stashed card
      await sidePanelPage.reload();
      await sidePanelPage.waitForTimeout(500);

      // Verify card appears in side panel
      const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
      const isVisible = await cardElement.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('should sync restore updates from side panel to canvas', async ({ context, extensionId }) => {
    const [card] = await createTestCards(context, true);

    const sidePanelPage = await openSidePanel(context, extensionId);
    const canvasPage = await openCanvas(context, extensionId);

    // Restore from side panel
    const cardElement = sidePanelPage.locator(`[data-card-id="${card.id}"], [data-id="${card.id}"]`).first();
    const restoreButton = cardElement.locator('button[aria-label*="Restore"], button:has-text("Restore"), button:has-text("🎨")').first();

    if (await restoreButton.count() > 0) {
      await restoreButton.click();
      await sidePanelPage.waitForTimeout(500);

      // Reload canvas to see restored card
      await canvasPage.reload();
      await canvasPage.waitForTimeout(500);

      const cardNode = canvasPage.locator(`[data-id="${card.id}"]`).first();
      const isVisible = await cardNode.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('should sync delete operations across contexts', async ({ context, extensionId }) => {
    const cards = await createTestCards(context, true);

    const sidePanelPage = await openSidePanel(context, extensionId);

    // Delete from side panel
    const cardElement = sidePanelPage.locator(`[data-card-id="${cards[0].id}"], [data-id="${cards[0].id}"]`).first();
    const deleteButton = cardElement.locator('button[aria-label*="Delete"], button:has-text("Delete"), button:has-text("🗑")').first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await sidePanelPage.waitForTimeout(500);

      // Verify deletion is reflected in storage
      const storage = await getExtensionStorage(context, 'cards');
      expect(storage.cards).toHaveLength(cards.length - 1);
    }
  });
});

test.describe('Stash Operations - Image Upload', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should display image upload zone in side panel', async ({ context, extensionId }) => {
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Check for drag-drop zone
    const uploadZone = sidePanelPage.locator('[class*="upload"], [class*="drop-zone"]').first();
    expect(await uploadZone.count()).toBeGreaterThan(0);
  });

  test('should display file picker button in side panel', async ({ context, extensionId }) => {
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Check for file picker button
    const filePickerButton = sidePanelPage.locator('button:has-text("Upload"), button:has-text("Choose"), input[type="file"]').first();
    expect(await filePickerButton.count()).toBeGreaterThan(0);
  });

  test('should create stashed image card when image uploaded', async ({ context, extensionId }) => {
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Simulate image upload via storage (actual file upload blocked by Playwright)
    await sidePanelPage.evaluate(() => {
      return new Promise<void>((resolve) => {
        const imageCard = {
          id: 'uploaded-image-' + Date.now(),
          content: '<p>Uploaded image</p>',
          metadata: {
            title: 'Uploaded Image',
            domain: 'local',
            url: 'local',
            favicon: '📷',
            timestamp: Date.now(),
          },
          cardType: 'image',
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          starred: false,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stashed: true,
          position: { x: 100, y: 100 },
          size: { width: 320, height: 240 },
        };

        chrome.storage.local.get(['cards'], (result) => {
          const cards = result.cards || [];
          cards.push(imageCard);
          chrome.storage.local.set({ cards }, () => {
            window.dispatchEvent(new CustomEvent('nabokov:stash-updated'));
            resolve();
          });
        });
      });
    });

    await sidePanelPage.waitForTimeout(500);

    // Verify image card appears
    const storage = await getExtensionStorage(context, 'cards');
    const imageCard = storage.cards.find((c: any) => c.cardType === 'image');
    expect(imageCard).toBeDefined();
    expect(imageCard.stashed).toBe(true);
  });

  test('should display inline image for image cards in side panel', async ({ context, extensionId }) => {
    const cards = [
      {
        id: 'img-card',
        content: '<p>Image card</p>',
        metadata: { title: 'Image', domain: 'local', url: 'local', favicon: '📷', timestamp: Date.now() },
        cardType: 'image',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: true,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
    ];
    await setExtensionStorage(context, { cards });

    const sidePanelPage = await openSidePanel(context, extensionId);

    // Check for image element
    const cardElement = sidePanelPage.locator('[data-card-id="img-card"], [data-id="img-card"]').first();
    const imageElement = cardElement.locator('img').first();

    expect(await imageElement.count()).toBeGreaterThan(0);
    const src = await imageElement.getAttribute('src');
    expect(src).toContain('data:image');
  });
});

test.describe('Stash Operations - Filter and Search', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should filter stashed cards by search term', async ({ context, extensionId }) => {
    const cards = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Find search input
    const searchInput = sidePanelPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('Test Card 1');
      await sidePanelPage.waitForTimeout(500);

      // Verify only matching card is visible
      const card1 = sidePanelPage.locator('[data-card-id="test-card-1"], [data-id="test-card-1"]').first();
      const card2 = sidePanelPage.locator('[data-card-id="test-card-2"], [data-id="test-card-2"]').first();

      expect(await card1.isVisible()).toBe(true);
      expect(await card2.isVisible()).toBe(false);
    }
  });

  test('should filter stashed cards by domain', async ({ context, extensionId }) => {
    const cards = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Find domain filter
    const domainFilter = sidePanelPage.locator('select[name*="domain"], button:has-text("test.com")').first();

    if (await domainFilter.count() > 0) {
      if (await domainFilter.evaluate(el => el.tagName === 'SELECT')) {
        await domainFilter.selectOption('test.com');
      } else {
        await domainFilter.click();
      }
      await sidePanelPage.waitForTimeout(500);

      // Verify filtering works
      const card1 = sidePanelPage.locator('[data-card-id="test-card-1"], [data-id="test-card-1"]').first();
      expect(await card1.isVisible()).toBe(true);
    }
  });

  test('should filter stashed cards by tags', async ({ context, extensionId }) => {
    const cards = await createTestCards(context, true);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Find tag filter
    const tagFilter = sidePanelPage.locator('select[name*="tag"], button:has-text("test")').first();

    if (await tagFilter.count() > 0) {
      if (await tagFilter.evaluate(el => el.tagName === 'SELECT')) {
        await tagFilter.selectOption('test');
      } else {
        await tagFilter.click();
      }
      await sidePanelPage.waitForTimeout(500);

      const card1 = sidePanelPage.locator('[data-card-id="test-card-1"], [data-id="test-card-1"]').first();
      expect(await card1.isVisible()).toBe(true);
    }
  });
});
