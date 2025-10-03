/**
 * E2E Tests for Skip Delete Confirmation Checkbox
 *
 * Tests the "Skip confirm" checkbox feature in Side Panel that allows users
 * to bypass the delete confirmation dialog. Tests cover:
 * - Checkbox UI rendering and positioning
 * - Default unchecked state behavior
 * - Checked state behavior (skip dialog)
 * - localStorage persistence
 * - Toast notifications
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
} from '../fixtures/extension';

// Helper to create test cards in stash
async function createStashedCards(context: BrowserContext, extensionId: string, count: number = 1) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push({
      id: `skip-test-card-${i}`,
      content: `<p>Stashed card content ${i}</p>`,
      metadata: {
        title: `Stashed Card ${i}`,
        domain: 'test.com',
        url: `https://test.com/page${i}`,
        favicon: '🧪',
        timestamp: Date.now(),
      },
      starred: false,
      tags: ['test', 'stashed'],
      createdAt: Date.now() - i * 1000,
      updatedAt: Date.now() - i * 1000,
      stashed: true, // Mark as stashed
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    });
  }
  await setExtensionStorage(context, extensionId, { cards });
  return cards;
}

// Helper to open side panel
async function openSidePanel(context: BrowserContext, extensionId: string): Promise<Page> {
  const sidePanelPage = await context.newPage();
  await sidePanelPage.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html`);
  await sidePanelPage.waitForLoadState('domcontentloaded');
  await sidePanelPage.waitForTimeout(500); // Wait for React to render
  return sidePanelPage;
}

test.describe('Skip Delete Confirmation - UI Rendering', () => {
  // No beforeEach - tests will create their own clean state

  test('should render checkbox next to delete button', async ({ context, extensionId }) => {
    const [card] = await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Wait for card to render
    const cardElement = sidePanelPage.locator(`[data-id="${card.id}"]`);
    await expect(cardElement).toBeVisible({ timeout: 10000 });

    // Find checkbox (should be a label with checkbox input)
    const checkbox = cardElement.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    // Verify checkbox is positioned before delete button
    const deleteButton = cardElement.locator('button[title="Delete permanently"]');
    await expect(deleteButton).toBeVisible();

    await sidePanelPage.close();
  });

  test('should display "Skip" label next to checkbox', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });

    const checkboxLabel = card.locator('label[title="Skip delete confirmation"] span:has-text("Skip")');
    await expect(checkboxLabel).toBeVisible();

    await sidePanelPage.close();
  });

  test('should be unchecked by default', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });

    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();

    await sidePanelPage.close();
  });
});

test.describe('Skip Delete Confirmation - Checkbox State', () => {
  // No beforeEach - tests will create their own clean state

  test('should toggle checkbox when clicked', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });

    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');

    // Initially unchecked
    await expect(checkbox).not.toBeChecked();

    // Click to check
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Click to uncheck
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    await sidePanelPage.close();
  });

  test('should save state to localStorage when checked', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });

    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await checkbox.click();

    // Verify localStorage
    const stored = await sidePanelPage.evaluate(() =>
      localStorage.getItem('nabokov_skip_delete_confirm')
    );
    expect(stored).toBe('true');

    await sidePanelPage.close();
  });

  test('should save state to localStorage when unchecked', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });

    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');

    // Check then uncheck
    await checkbox.click();
    await checkbox.click();

    // Verify localStorage
    const stored = await sidePanelPage.evaluate(() =>
      localStorage.getItem('nabokov_skip_delete_confirm')
    );
    expect(stored).toBe('false');

    await sidePanelPage.close();
  });
});

test.describe('Skip Delete Confirmation - Persistence', () => {
  // No beforeEach - tests will create their own clean state

  test('should persist checked state across page reloads', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Check the checkbox
    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });
    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Reload the page
    await sidePanelPage.reload();
    await sidePanelPage.waitForTimeout(500);

    // Verify checkbox is still checked
    const cardAfterReload = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(cardAfterReload).toBeVisible({ timeout: 10000 });
    const checkboxAfterReload = cardAfterReload.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await expect(checkboxAfterReload).toBeChecked();

    await sidePanelPage.close();
  });

  test('should load checked state from localStorage on mount', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);

    // Pre-set localStorage by navigating to side panel first
    const setupPage = await context.newPage();
    await setupPage.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html`);
    await setupPage.evaluate(() => {
      localStorage.setItem('nabokov_skip_delete_confirm', 'true');
    });
    await setupPage.close();

    // Open side panel
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Verify checkbox is checked on mount
    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });
    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await expect(checkbox).toBeChecked();

    await sidePanelPage.close();
  });
});

test.describe('Skip Delete Confirmation - Delete Behavior', () => {
  // No beforeEach - tests will create their own clean state

  test('should show confirm dialog when checkbox is unchecked', async ({ context, extensionId }) => {
    const [card] = await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-id="${card.id}"]`);
    await expect(cardElement).toBeVisible({ timeout: 10000 });

    // Ensure checkbox is unchecked
    const checkbox = cardElement.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();

    // Set up dialog handler to cancel
    sidePanelPage.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Permanently delete');
      expect(dialog.message()).toContain(card.metadata.title);
      await dialog.dismiss(); // Click Cancel
    });

    // Click delete button
    const deleteButton = cardElement.locator('button[title="Delete permanently"]');
    await deleteButton.click();

    // Wait a bit for dialog handling
    await sidePanelPage.waitForTimeout(500);

    // Verify card still exists (deletion was cancelled)
    const storage = await getExtensionStorage(context, extensionId, 'cards');
    const cardStillExists = storage.cards.some((c: any) => c.id === card.id);
    expect(cardStillExists).toBe(true);

    await sidePanelPage.close();
  });

  test('should skip confirm dialog when checkbox is checked', async ({ context, extensionId }) => {
    const [card] = await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-id="${card.id}"]`);
    await expect(cardElement).toBeVisible({ timeout: 10000 });

    // Check the checkbox
    const checkbox = cardElement.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Set up dialog handler (should NOT be called)
    let dialogShown = false;
    sidePanelPage.on('dialog', async dialog => {
      dialogShown = true;
      await dialog.dismiss();
    });

    // Click delete button
    const deleteButton = cardElement.locator('button[title="Delete permanently"]');
    await deleteButton.click();

    // Wait for deletion to process
    await sidePanelPage.waitForTimeout(1000);

    // Verify no dialog was shown
    expect(dialogShown).toBe(false);

    // Verify card was deleted
    const storage = await getExtensionStorage(context, extensionId, 'cards');
    const cardExists = storage.cards.some((c: any) => c.id === card.id);
    expect(cardExists).toBe(false);

    await sidePanelPage.close();
  });

  test('should show Toast notification after successful delete', async ({ context, extensionId }) => {
    const [card] = await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const cardElement = sidePanelPage.locator(`[data-id="${card.id}"]`);
    await expect(cardElement).toBeVisible({ timeout: 10000 });

    // Check the checkbox to skip confirmation
    const checkbox = cardElement.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await checkbox.click();

    // Click delete button
    const deleteButton = cardElement.locator('button[title="Delete permanently"]');
    await deleteButton.click();

    // Wait for Toast to appear
    const toast = sidePanelPage.locator('text=Card deleted successfully');
    await expect(toast).toBeVisible({ timeout: 2000 });

    await sidePanelPage.close();
  });
});

test.describe('Skip Delete Confirmation - Multiple Cards', () => {
  // No beforeEach - tests will create their own clean state

  test('should apply skip preference to all cards', async ({ context, extensionId }) => {
    const cards = await createStashedCards(context, extensionId, 3);
    const sidePanelPage = await openSidePanel(context, extensionId);

    // Wait for cards to render
    const firstCard = sidePanelPage.locator(`[data-id="${cards[0].id}"]`);
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Check the checkbox on first card
    const checkbox = firstCard.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Verify all checkboxes are checked (global preference)
    const allCheckboxes = sidePanelPage.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    const checkboxCount = await allCheckboxes.count();
    expect(checkboxCount).toBe(3);

    for (let i = 0; i < checkboxCount; i++) {
      await expect(allCheckboxes.nth(i)).toBeChecked();
    }

    await sidePanelPage.close();
  });

  test('should delete multiple cards without confirmation when checked', async ({ context, extensionId }) => {
    const cards = await createStashedCards(context, extensionId, 3);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const firstCard = sidePanelPage.locator(`[data-id="${cards[0].id}"]`);
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Check the checkbox
    const checkbox = firstCard.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await checkbox.click();

    // Delete all three cards
    for (const card of cards) {
      const cardElement = sidePanelPage.locator(`[data-id="${card.id}"]`);
      if (await cardElement.isVisible()) {
        const deleteButton = cardElement.locator('button[title="Delete permanently"]');
        await deleteButton.click();
        await sidePanelPage.waitForTimeout(300); // Wait for deletion
      }
    }

    // Verify all cards deleted
    await sidePanelPage.waitForTimeout(500);
    const storage = await getExtensionStorage(context, extensionId, 'cards');
    expect(storage.cards.length).toBe(0);

    await sidePanelPage.close();
  });
});

test.describe('Skip Delete Confirmation - Edge Cases', () => {
  // No beforeEach - tests will create their own clean state

  test('should handle localStorage being cleared', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);
    const sidePanelPage = await openSidePanel(context, extensionId);

    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });

    // Check checkbox
    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Clear localStorage
    await sidePanelPage.evaluate(() => localStorage.clear());

    // Reload page
    await sidePanelPage.reload();
    await sidePanelPage.waitForTimeout(500);

    // Verify checkbox is unchecked (default state)
    const cardAfterReload = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(cardAfterReload).toBeVisible({ timeout: 10000 });
    const checkboxAfterReload = cardAfterReload.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await expect(checkboxAfterReload).not.toBeChecked();

    await sidePanelPage.close();
  });

  test('should handle invalid localStorage value gracefully', async ({ context, extensionId }) => {
    await createStashedCards(context, extensionId, 1);

    // Set invalid localStorage value by navigating to side panel first
    const setupPage = await context.newPage();
    await setupPage.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html`);
    await setupPage.evaluate(() => {
      localStorage.setItem('nabokov_skip_delete_confirm', 'invalid');
    });
    await setupPage.close();

    const sidePanelPage = await openSidePanel(context, extensionId);

    const card = sidePanelPage.locator('[data-id="skip-test-card-0"]');
    await expect(card).toBeVisible({ timeout: 10000 });

    // Checkbox should be unchecked (treats invalid as false)
    const checkbox = card.locator('label[title="Skip delete confirmation"] input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();

    await sidePanelPage.close();
  });
});
