import { test, expect } from '@playwright/test';
import path from 'node:path';

const DEMO_PATH = path.resolve('demo/hypertext_navigation_demo.html');
const DEMO_URL = `file://${DEMO_PATH}`;
const HOTKEY = process.platform === 'darwin' ? 'Meta+Shift+K' : 'Control+Shift+K';

async function highlightSample(page) {
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
}

async function mockHypertextStream(page, result) {
  const chunk = JSON.stringify({ delta: { text: JSON.stringify(result) } });
  const body = `data: ${chunk}\n\ndata: [DONE]\n\n`;
  await page.route('**/api/stream', route => {
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body
    });
  });
  return async () => {
    await page.unroute('**/api/stream');
  };
}

test('Cmd/Ctrl+Shift+K summons hypertext palette in demo', async ({ page }) => {
  await page.goto(DEMO_URL);
  await highlightSample(page);

  await page.keyboard.press(HOTKEY);

  const palette = page.locator('.hx-palette');
  await expect(palette).toBeVisible();
  await expect(page.locator('.hx-selected-text')).toContainText(/gradient descent/i);
});

test('Hypertext tooltip renders explanation and link from dual output', async ({ page }) => {
  const cleanup = await mockHypertextStream(page, {
    pillText: 'Gradient Reference',
    mode: 'reference',
    explanation: 'Provide a concise refresher on gradient descent and note common pitfalls.',
    url: 'https://example.com/gradient-descent'
  });

  try {
    await page.goto(DEMO_URL);
    await highlightSample(page);
    await page.keyboard.press(HOTKEY);

    const palette = page.locator('.hx-palette');
    await expect(palette).toBeVisible();
    await page.locator('#hx-generate-button').click();

    const highlight = page.locator('.hx-highlight').first();
    await expect(highlight).toHaveAttribute('data-state', 'ready-reference');

    await highlight.click();
    const tooltip = page.locator('.hx-chat-tooltip');
    await expect(tooltip).toBeVisible();

    const explanation = tooltip
      .locator('.hx-chat-entry__paragraph')
      .filter({ hasText: 'Provide a concise refresher on gradient descent and note common pitfalls.' });
    await expect(explanation).toHaveCount(1);

    const link = tooltip.locator('.hx-chat-entry__link').first();
    await expect(link).toHaveAttribute('href', 'https://example.com/gradient-descent');

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      link.click()
    ]);
    await popup.close();
  } finally {
    await cleanup();
  }
});

test('Tooltip can be dragged, resized, and preserves geometry', async ({ page }) => {
  const cleanup = await mockHypertextStream(page, {
    pillText: 'Gradient Reference',
    mode: 'reference',
    explanation: 'Short summary accompanies this external reference.',
    url: 'https://example.com/gradient-descent'
  });

  try {
    await page.goto(DEMO_URL);
    await highlightSample(page);
    await page.keyboard.press(HOTKEY);
    await page.locator('#hx-generate-button').click();

    const highlight = page.locator('.hx-highlight').first();
    await expect(highlight).toHaveAttribute('data-state', 'ready-reference');

    await highlight.click();
    const tooltip = page.locator('.hx-chat-tooltip');
    await expect(tooltip).toBeVisible();

    const dragHandle = tooltip.locator('[data-role="drag-handle"]');
    const dragBox = await dragHandle.boundingBox();
    const initialBox = await tooltip.boundingBox();
    expect(dragBox).not.toBeNull();
    expect(initialBox).not.toBeNull();

    if (!dragBox || !initialBox) {
      throw new Error('Tooltip geometry unavailable for drag test');
    }

    await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + dragBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(dragBox.x + dragBox.width / 2 + 80, dragBox.y + dragBox.height / 2 + 60, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(50);

    const afterDrag = await tooltip.boundingBox();
    expect(afterDrag).not.toBeNull();
    if (!afterDrag) {
      throw new Error('Tooltip geometry unavailable after drag');
    }

    expect(Math.abs(afterDrag.x - initialBox.x)).toBeGreaterThan(5);
    expect(Math.abs(afterDrag.y - initialBox.y)).toBeGreaterThan(5);

    const resizeHandle = tooltip.locator('[data-role="resize-handle"]');
    const resizeBox = await resizeHandle.boundingBox();
    expect(resizeBox).not.toBeNull();
    if (!resizeBox) {
      throw new Error('Resize handle geometry unavailable');
    }

    await page.mouse.move(resizeBox.x + resizeBox.width / 2, resizeBox.y + resizeBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(resizeBox.x + resizeBox.width / 2 + 90, resizeBox.y + resizeBox.height / 2 + 70, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(50);

    const afterResize = await tooltip.boundingBox();
    expect(afterResize).not.toBeNull();
    if (!afterResize) {
      throw new Error('Tooltip geometry unavailable after resize');
    }

    expect(afterResize.width).toBeGreaterThan(afterDrag.width + 20);
    expect(afterResize.height).toBeGreaterThan(afterDrag.height + 20);

    await tooltip.locator('[data-action="close"]').click();
    await expect(tooltip).toBeHidden();

    await highlight.click();
    await expect(tooltip).toBeVisible();
    const reopenedBox = await tooltip.boundingBox();
    expect(reopenedBox).not.toBeNull();
    if (!reopenedBox) {
      throw new Error('Tooltip geometry unavailable after reopen');
    }

    expect(Math.abs(reopenedBox.x - afterResize.x)).toBeLessThanOrEqual(4);
    expect(Math.abs(reopenedBox.y - afterResize.y)).toBeLessThanOrEqual(4);
    expect(Math.abs(reopenedBox.width - afterResize.width)).toBeLessThanOrEqual(4);
    expect(Math.abs(reopenedBox.height - afterResize.height)).toBeLessThanOrEqual(4);
  } finally {
    await cleanup();
  }
});
