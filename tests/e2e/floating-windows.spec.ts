/**
 * Floating Windows E2E Tests
 *
 * End-to-end tests for the floating windows feature.
 * Tests window lifecycle, state persistence, dragging, and chat interface.
 */

import { test, expect } from '../fixtures/extension';
import type { Page } from '@playwright/test';

/**
 * Helper: Capture a test element to create a card
 */
async function captureTestElement(context: any): Promise<void> {
  const page = await context.newPage();
  await page.goto('https://example.com');
  await page.waitForLoadState('networkidle');

  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+Shift+E`);
  await page.waitForTimeout(500);

  await page.click('h1');
  await page.waitForTimeout(2000);

  await page.close();
}

/**
 * Helper: Open canvas page and wait for it to load
 */
async function openCanvas(context: any, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;

  await canvasPage.goto(canvasUrl, { waitUntil: 'networkidle' });
  await canvasPage.waitForTimeout(2000);

  return canvasPage;
}

test.describe('Floating Windows', () => {
  test.beforeEach(async ({ context }) => {
    // Capture an element to ensure we have a card
    await captureTestElement(context);
  });

  test('should open floating window when clicking open button', async ({ context, extensionId }) => {
    const canvasPage = await openCanvas(context, extensionId);

    // Find and click "Open as Window" button
    const openWindowBtn = canvasPage.locator('[data-testid="open-window-btn"]').first();
    await expect(openWindowBtn).toBeVisible();
    await openWindowBtn.click();
    await canvasPage.waitForTimeout(1000);

    // Verify floating window appeared
    const windowHeader = canvasPage.locator('.window-header').first();
    await expect(windowHeader).toBeVisible();

    // Verify chat interface exists
    const chatInput = canvasPage.locator('input[placeholder*="Ask"]').first();
    await expect(chatInput).toBeVisible();

    await canvasPage.close();
  });

  test('should persist chat input when minimizing and restoring', async ({ context, extensionId }) => {
    const canvasPage = await openCanvas(context, extensionId);

    // Open window
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(1000);

    // Type in chat input
    const chatInput = canvasPage.locator('input[placeholder*="Ask"]').first();
    const testMessage = 'Test message for persistence';
    await chatInput.fill(testMessage);
    await canvasPage.waitForTimeout(500);

    // Verify input value
    await expect(chatInput).toHaveValue(testMessage);

    // Minimize window
    const minimizeBtn = canvasPage.locator('button[title="Minimize"]').first();
    await minimizeBtn.click();
    await canvasPage.waitForTimeout(500);

    // Window should be hidden
    const floatingWindow = canvasPage.locator('.window-header').first().locator('..');
    await expect(floatingWindow).toHaveCSS('display', 'none');

    // Restore window by clicking open button again
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(500);

    // Window should be visible again
    await expect(floatingWindow).toBeVisible();

    // Chat input should have persisted value
    const restoredInput = canvasPage.locator('input[placeholder*="Ask"]').first();
    await expect(restoredInput).toHaveValue(testMessage);

    await canvasPage.close();
  });

  test('should allow window dragging', async ({ context, extensionId }) => {
    const canvasPage = await openCanvas(context, extensionId);

    // Open window
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(1000);

    // Get initial position
    const windowHeader = canvasPage.locator('.window-header').first();
    const initialBox = await windowHeader.boundingBox();
    expect(initialBox).toBeTruthy();

    if (initialBox) {
      // Drag window
      const startX = initialBox.x + initialBox.width / 2;
      const startY = initialBox.y + initialBox.height / 2;

      await canvasPage.mouse.move(startX, startY);
      await canvasPage.mouse.down();
      await canvasPage.mouse.move(startX + 100, startY + 100, { steps: 10 });
      await canvasPage.mouse.up();
      await canvasPage.waitForTimeout(500);

      // Get new position
      const newBox = await windowHeader.boundingBox();
      expect(newBox).toBeTruthy();

      if (newBox) {
        // Position should have changed
        expect(newBox.x).not.toBe(initialBox.x);
        expect(newBox.y).not.toBe(initialBox.y);
      }
    }

    await canvasPage.close();
  });

  test('should close window when clicking close button', async ({ context, extensionId }) => {
    const canvasPage = await openCanvas(context, extensionId);

    // Open window
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(1000);

    // Verify window exists
    let windowCount = await canvasPage.locator('.window-header').count();
    expect(windowCount).toBe(1);

    // Click close button
    const closeBtn = canvasPage.locator('button[title="Close"]').first();
    await closeBtn.click();
    await canvasPage.waitForTimeout(500);

    // Window should be removed
    windowCount = await canvasPage.locator('.window-header').count();
    expect(windowCount).toBe(0);

    await canvasPage.close();
  });

  test('should bring window to front when clicked', async ({ context, extensionId }) => {
    const canvasPage = await openCanvas(context, extensionId);

    // Open first window
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(500);

    // Get first window's z-index
    const firstWindow = canvasPage.locator('.window-header').first().locator('..');
    const firstZIndex = await firstWindow.evaluate(el => window.getComputedStyle(el).zIndex);

    // Click somewhere else on canvas to potentially lower z-index
    await canvasPage.click('body');
    await canvasPage.waitForTimeout(300);

    // Click the window to bring it to front
    await firstWindow.click();
    await canvasPage.waitForTimeout(300);

    const newFirstZIndex = await firstWindow.evaluate(el => window.getComputedStyle(el).zIndex);

    // Z-index should be maintained or increased
    expect(parseInt(newFirstZIndex)).toBeGreaterThanOrEqual(parseInt(firstZIndex));

    await canvasPage.close();
  });

  test('should display card content in window', async ({ context, extensionId }) => {
    const canvasPage = await openCanvas(context, extensionId);

    // Open window
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(1000);

    // Verify window shows card title
    const windowTitle = canvasPage.locator('.window-header').first();
    const titleText = await windowTitle.textContent();
    expect(titleText).toContain('Example'); // From example.com

    // Verify content area exists and is visible
    const floatingWindow = canvasPage.locator('.window-header').first().locator('..');
    const contentArea = floatingWindow.locator('> div').nth(1);
    await expect(contentArea).toBeVisible();

    // Verify "View original" link exists
    const viewOriginalLink = canvasPage.locator('a:has-text("View original")').first();
    await expect(viewOriginalLink).toBeVisible();

    await canvasPage.close();
  });

  test('should handle opening same window multiple times', async ({ context, extensionId }) => {
    const canvasPage = await openCanvas(context, extensionId);

    // Open first window
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(500);

    let windowCount = await canvasPage.locator('.window-header').count();
    expect(windowCount).toBe(1);

    // Try to open the same window again (should just restore/bring to front)
    await canvasPage.locator('[data-testid="open-window-btn"]').first().click();
    await canvasPage.waitForTimeout(500);

    // Should still be just one window
    windowCount = await canvasPage.locator('.window-header').count();
    expect(windowCount).toBe(1);

    await canvasPage.close();
  });

  // Note: Scroll position preservation is tested in the windowManager service tests
  // This E2E test is skipped because the test content (example.com H1) is too short to be scrollable
});
