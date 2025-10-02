/**
 * Playwright Extension Testing Fixture
 *
 * Provides a custom fixture for testing Chrome extensions with Playwright.
 * Extensions require headed mode and special configuration for loading.
 *
 * Usage:
 * ```typescript
 * import { test, expect } from './fixtures/extension';
 *
 * test('should load extension', async ({ page, extensionId }) => {
 *   await page.goto('https://example.com');
 *   // Test extension functionality
 * });
 * ```
 */

import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ExtensionFixtures = {
  context: BrowserContext;
  extensionId: string;
};

/**
 * Get the path to the extension's build directory
 */
function getExtensionPath(): string {
  // Adjust this path based on where your extension builds to
  return path.join(__dirname, '../../dist');
}

/**
 * Extended Playwright test with extension support
 *
 * This fixture:
 * - Launches Chromium in headed mode (required for extensions)
 * - Loads the extension from the dist directory
 * - Provides the extension ID for testing
 * - Configures proper permissions and settings
 */
export const test = base.extend<ExtensionFixtures>({
  // Override context to load extension
  context: async ({}, use) => {
    const extensionPath = getExtensionPath();

    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions require headed mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      viewport: { width: 1280, height: 720 },
    });

    await use(context);
    await context.close();
  },

  // Provide extension ID for testing
  extensionId: async ({ context }, use) => {
    // Wait for background page to load (for MV3)
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper: Navigate to extension popup
 */
export async function openExtensionPopup(
  context: BrowserContext,
  extensionId: string
): Promise<void> {
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  const page = await context.newPage();
  await page.goto(popupUrl);
}

/**
 * Helper: Navigate to extension options page
 */
export async function openExtensionOptions(
  context: BrowserContext,
  extensionId: string
): Promise<void> {
  const optionsUrl = `chrome-extension://${extensionId}/options.html`;
  const page = await context.newPage();
  await page.goto(optionsUrl);
}

/**
 * Helper: Navigate to canvas page
 */
export async function openCanvasPage(
  context: BrowserContext,
  extensionId: string
): Promise<void> {
  const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;
  const page = await context.newPage();
  await page.goto(canvasUrl);
}

/**
 * Helper: Wait for extension content script to load
 */
export async function waitForContentScript(
  page: any,
  timeout = 5000
): Promise<void> {
  await page.waitForFunction(
    () => {
      // Check if content script has injected a specific element or variable
      return (window as any).__NABOKOV_EXTENSION_LOADED__ === true;
    },
    { timeout }
  );
}

/**
 * Helper: Simulate extension message passing
 */
export async function sendExtensionMessage(
  context: BrowserContext,
  extensionId: string,
  message: any
): Promise<any> {
  const page = await context.newPage();
  return await page.evaluate(
    async ({ id, msg }) => {
      return new Promise((resolve) => {
        (chrome as any).runtime.sendMessage(id, msg, (response: any) => {
          resolve(response);
        });
      });
    },
    { id: extensionId, msg: message }
  );
}

/**
 * Helper: Get extension storage data
 */
export async function getExtensionStorage(
  context: BrowserContext,
  keys?: string | string[] | null
): Promise<any> {
  const page = await context.newPage();

  // Navigate to extension page to get chrome API access
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  const extensionId = background?.url().split('/')[2];
  if (extensionId) {
    await page.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  }

  return await page.evaluate(
    async (storageKeys) => {
      return new Promise((resolve) => {
        chrome.storage.local.get(storageKeys || null, (items) => {
          resolve(items);
        });
      });
    },
    keys
  );
}

/**
 * Helper: Set extension storage data
 */
export async function setExtensionStorage(
  context: BrowserContext,
  items: Record<string, any>
): Promise<void> {
  const page = await context.newPage();

  // Navigate to extension page to get chrome API access
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  const extensionId = background?.url().split('/')[2];
  if (extensionId) {
    await page.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  }

  await page.evaluate(
    async (data) => {
      return new Promise<void>((resolve) => {
        chrome.storage.local.set(data, () => {
          resolve();
        });
      });
    },
    items
  );
}

/**
 * Helper: Clear extension storage
 */
export async function clearExtensionStorage(
  context: BrowserContext
): Promise<void> {
  const page = await context.newPage();

  // Navigate to extension page to get chrome API access
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  const extensionId = background?.url().split('/')[2];
  if (extensionId) {
    await page.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  }

  await page.evaluate(
    async () => {
      return new Promise<void>((resolve) => {
        chrome.storage.local.clear(() => {
          resolve();
        });
      });
    }
  );
}

/**
 * Helper: Create a test page with specific HTML content
 */
export async function createTestPage(
  context: BrowserContext,
  html: string
): Promise<any> {
  const page = await context.newPage();
  await page.setContent(html);
  return page;
}

/**
 * Helper: Wait for element to be selectable (visible and enabled)
 */
export async function waitForSelectableElement(
  page: any,
  selector: string,
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout,
  });
  await page.waitForFunction(
    (sel: string) => {
      const el = document.querySelector(sel);
      return el && !(el as HTMLElement).hasAttribute('disabled');
    },
    selector,
    { timeout }
  );
}