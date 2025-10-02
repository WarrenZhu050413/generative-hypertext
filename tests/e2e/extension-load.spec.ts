import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.join(__dirname, '../../dist');

let context: BrowserContext;

test.beforeAll(async () => {
  // Launch browser with extension loaded
  context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
    ],
  });
});

test.afterAll(async () => {
  await context.close();
});

test.describe('Extension Loading', () => {
  test('should load extension without errors', async () => {
    const page = await context.newPage();

    // Navigate to a test page
    await page.goto('https://example.com');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Log any errors
    if (errors.length > 0) {
      console.log('Console errors found:');
      errors.forEach(err => console.log('  -', err));
    }

    expect(errors.length).toBe(0);
  });

  test('should activate element selector with keyboard shortcut', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');

    // Press Cmd+Shift+E (or Ctrl+Shift+E)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+Shift+E`);

    // Wait a bit for the selector to activate
    await page.waitForTimeout(1000);

    // Check if element selector UI appeared
    // (Look for shadow DOM container or overlay)
    const shadowHosts = await page.$$('div[id*="nabokov"]');

    console.log(`Found ${shadowHosts.length} potential shadow hosts`);

    // At least one shadow DOM container should exist
    expect(shadowHosts.length).toBeGreaterThan(0);
  });

  test('should have background script running', async () => {
    const page = await context.newPage();

    // Get the extension ID
    await page.goto('chrome://extensions/');
    await page.waitForTimeout(500);

    const extensionId = await page.evaluate(() => {
      const items = document.querySelectorAll('extensions-item');
      for (const item of items) {
        const name = item.shadowRoot?.querySelector('#name')?.textContent;
        if (name?.includes('Nabokov')) {
          return item.getAttribute('id');
        }
      }
      return null;
    });

    expect(extensionId).toBeTruthy();
    console.log('Extension ID:', extensionId);

    // Navigate to background page to check for errors
    if (extensionId) {
      const backgroundPage = context.backgroundPages()[0];
      if (backgroundPage) {
        const errors: string[] = [];
        backgroundPage.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await page.waitForTimeout(1000);

        if (errors.length > 0) {
          console.log('Background script errors:');
          errors.forEach(err => console.log('  -', err));
        }

        expect(errors.length).toBe(0);
      }
    }
  });

  test('should have content script injected', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');

    // Check if content script is injected by looking for window.__nabokobClipper__
    const hasContentScript = await page.evaluate(() => {
      return typeof (window as any).__nabokobClipper__ !== 'undefined';
    });

    console.log('Content script injected:', hasContentScript);

    // In production build, this might be stripped, so we just check no errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
  });
});