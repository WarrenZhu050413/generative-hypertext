import { test, expect } from '@playwright/test';
import path from 'node:path';

const DEMO_PATH = path.resolve('demo/hypertext_navigation_demo.html');
const DEMO_URL = `file://${DEMO_PATH}`;
const HOTKEY = process.platform === 'darwin' ? 'Meta+Shift+K' : 'Control+Shift+K';

test('Auto-pin: Tooltip should be pinned after initial generation', async ({ page }) => {
  const consoleLogs = [];

  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log('[Browser]', text);
  });

  // Mock the API response
  await page.route('**/api/stream', route => {
    const result = {
      pill: 'Gradient Descent',
      mode: 'explanation',
      text: 'Gradient descent is an optimization algorithm that iteratively moves toward the minimum of a function by following the steepest downward slope.'
    };
    const chunk = JSON.stringify({ delta: { text: JSON.stringify(result) } });
    const body = `data: ${chunk}\n\ndata: [DONE]\n\n`;
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body
    });
  });

  await page.goto(DEMO_URL);

  // Wait for hypertext experience to load
  await page.waitForFunction(() => window.hypertextExperience !== undefined, { timeout: 5000 });
  console.log('✓ Hypertext experience loaded');

  // Select "gradient descent" text
  await page.evaluate(() => {
    const article = document.getElementById('article');
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
    let target = null;
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent && node.textContent.toLowerCase().includes('gradient descent')) {
        target = node;
        break;
      }
    }
    if (!target) throw new Error('Target text not found');
    const range = document.createRange();
    const text = target.textContent;
    const start = text.toLowerCase().indexOf('gradient descent');
    range.setStart(target, start);
    range.setEnd(target, start + 'gradient descent'.length);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });
  console.log('✓ Text selected');

  // Open palette
  await page.keyboard.press(HOTKEY);
  const palette = page.locator('.hx-palette');
  await expect(palette).toBeVisible({ timeout: 2000 });
  console.log('✓ Palette visible');

  // Click generate directly (instructions are optional)
  const generateButton = page.locator('#hx-generate-button');
  await generateButton.click();
  console.log('✓ Generate clicked - waiting for response...');

  // Wait for highlight to be ready (meaning generation completed)
  const highlight = page.locator('.hx-highlight').first();
  await expect(highlight).toHaveAttribute('data-kind', /(explanation|reference|chat)/, {
    timeout: 5000
  });
  console.log('✓ Hypertext generation completed');

  // Hover to open tooltip
  await highlight.hover();
  const tooltip = page.locator('.hx-chat-tooltip');
  await expect(tooltip).toBeVisible({ timeout: 2000 });
  console.log('✓ Tooltip visible');

  // Check if tooltip is pinned
  const pinButton = tooltip.locator('[data-action="pin"]');
  const isPinned = await pinButton.getAttribute('aria-pressed');
  console.log('Pin button aria-pressed:', isPinned);

  const tooltipPinnedAttr = await tooltip.getAttribute('data-pinned');
  console.log('Tooltip data-pinned:', tooltipPinnedAttr);

  // Check session state via JavaScript
  const sessionState = await page.evaluate(() => {
    const exp = window.hypertextExperience;
    const sessions = exp.getSessions();
    const firstSession = Array.from(sessions.values())[0];
    return {
      sessionIsPinned: firstSession?.isPinned,
      sessionId: firstSession?.id
    };
  });
  console.log('Session state:', sessionState);

  // Print all console logs for debugging
  console.log('\n=== All Browser Console Logs ===');
  consoleLogs.forEach(log => console.log(log));
  console.log('=================================\n');

  // Assertions
  expect(isPinned).toBe('true');
  expect(tooltipPinnedAttr).toBe('true');
  expect(sessionState.sessionIsPinned).toBe(true);

  // Verify tooltip stays visible when mouse moves away
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);
  await expect(tooltip).toBeVisible();
  console.log('✓ Tooltip remains visible when mouse moves away (pinned behavior confirmed)');
});
