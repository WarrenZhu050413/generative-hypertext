/**
 * Direct test for card generation functionality
 * Tests that card generation from action buttons actually works
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testCardGeneration() {
  console.log('[Test] Starting card generation test...');

  const extensionPath = path.join(__dirname, '..', 'dist');
  console.log('[Test] Extension path:', extensionPath);

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    viewport: { width: 1400, height: 900 },
  });

  // Get extension ID
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  const extensionId = background.url().split('/')[2];
  console.log('[Test] Extension ID:', extensionId);

  // Step 1: Capture an element first
  console.log('[Test] Capturing test element...');
  const page = await context.newPage();
  await page.goto('https://example.com');
  await page.waitForLoadState('networkidle');

  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+Shift+E`);
  await page.waitForTimeout(500);

  await page.click('h1');
  await page.waitForTimeout(2000);
  await page.close();

  // Step 2: Open canvas
  console.log('[Test] Opening canvas...');
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('networkidle');
  await canvasPage.waitForTimeout(2000);

  // Step 3: Count initial cards
  const initialCardCount = await canvasPage.locator('[data-testid="open-window-btn"]').count();
  console.log('[Test] Initial card count:', initialCardCount);

  // Step 4: Click action button
  console.log('[Test] Looking for action buttons...');
  const actionButtons = await canvasPage.locator('[data-testid^="action-btn-"]').all();
  console.log('[Test] Found action buttons:', actionButtons.length);

  if (actionButtons.length === 0) {
    console.error('[Test] ERROR: No action buttons found!');
    await canvasPage.screenshot({ path: 'test-no-buttons.png' });
    await context.close();
    return;
  }

  // Click the first action button (Summarize)
  console.log('[Test] Clicking Summarize button...');
  await canvasPage.locator('[data-testid="action-btn-summarize"]').first().click();
  await canvasPage.waitForTimeout(500);

  // Step 5: Check if modal appeared
  const modal = canvasPage.locator('[data-testid="context-modal"]');
  const isModalVisible = await modal.isVisible();
  console.log('[Test] Modal visible:', isModalVisible);

  if (!isModalVisible) {
    console.error('[Test] ERROR: Modal did not appear!');
    await canvasPage.screenshot({ path: 'test-no-modal.png' });
    await context.close();
    return;
  }

  // Step 6: Click skip button
  console.log('[Test] Clicking skip button...');
  const skipBtn = canvasPage.locator('[data-testid="skip-btn"]');
  await skipBtn.click();

  // Step 7: Wait for page to reload
  console.log('[Test] Waiting for page reload...');
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(2000);

  // Step 8: Count cards again
  const finalCardCount = await canvasPage.locator('[data-testid="open-window-btn"]').count();
  console.log('[Test] Final card count:', finalCardCount);

  // Step 9: Check results
  if (finalCardCount > initialCardCount) {
    console.log('[Test] ✅ SUCCESS: New card was created!');
    console.log('[Test] Cards created:', finalCardCount - initialCardCount);
  } else {
    console.error('[Test] ❌ FAILURE: No new card was created!');
    await canvasPage.screenshot({ path: 'test-failure.png' });

    // Check console for errors
    const consoleLogs = await canvasPage.evaluate(() => {
      return window.console.logs || [];
    });
    console.log('[Test] Console logs:', consoleLogs);
  }

  await context.close();
}

testCardGeneration().catch(console.error);