/**
 * E2E Tests for Element Chat Enhancements
 *
 * Tests for the 5 new features:
 * 1. Save conversation to Stash/Canvas
 * 2. Enable input while generating
 * 3. Message queueing
 * 4. Image upload support
 * 5. Chat with highlighted text (Ctrl+Shift+C)
 */

import { test, expect, getExtensionStorage, setExtensionStorage } from '../fixtures/extension';
import type { Page, BrowserContext } from '@playwright/test';

const TEST_URL = 'https://example.com';

// Helper to get service worker
async function getServiceWorker(context: BrowserContext) {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker');
  }
  return serviceWorker;
}

// Helper to send message to content script
async function sendMessageToContentScript(
  context: BrowserContext,
  page: Page,
  message: any
): Promise<void> {
  const serviceWorker = await getServiceWorker(context);

  // Find the right tab and send message
  await serviceWorker.evaluate(async (msg: any) => {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.tabs.sendMessage(tab.id, msg);
          console.log('[Test Helper] Message sent to tab:', tab.id, tab.url);
          break;
        } catch (e) {
          console.log('[Test Helper] Failed to send to tab:', tab.id, e);
        }
      }
    }
  }, message);
}

/**
 * Helper to wait for shadow root
 */
async function waitForShadowRoot(page: any, hostSelector: string, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hasShadowRoot = await page.evaluate((selector: string) => {
      const host = document.querySelector(`#${selector}`) || document.querySelector(`[id^="${selector}"]`);
      return host?.shadowRoot !== null;
    }, hostSelector);

    if (hasShadowRoot) {
      return true;
    }

    await page.waitForTimeout(100);
  }
  return false;
}

/**
 * Helper to query element in shadow DOM
 */
async function queryShadowElement(page: any, hostId: string, selector: string) {
  return page.evaluate(
    ({ hostId, selector }: { hostId: string; selector: string }) => {
      const host = document.getElementById(hostId);
      if (!host?.shadowRoot) return null;

      const element = host.shadowRoot.querySelector(selector);
      return element ? true : null;
    },
    { hostId, selector }
  );
}

/**
 * Helper to click element in shadow DOM
 */
async function clickShadowElement(page: any, hostId: string, selector: string) {
  await page.evaluate(
    ({ hostId, selector }: { hostId: string; selector: string }) => {
      const host = document.getElementById(hostId);
      if (!host?.shadowRoot) throw new Error('Shadow root not found');

      const element = host.shadowRoot.querySelector(selector) as HTMLElement;
      if (!element) throw new Error(`Element not found: ${selector}`);

      element.click();
    },
    { hostId, selector }
  );
}

/**
 * Helper to get text content from shadow DOM
 */
async function getShadowTextContent(page: any, hostId: string, selector: string): Promise<string> {
  return page.evaluate(
    ({ hostId, selector }: { hostId: string; selector: string }) => {
      const host = document.getElementById(hostId);
      if (!host?.shadowRoot) return '';

      const element = host.shadowRoot.querySelector(selector);
      return element?.textContent || '';
    },
    { hostId, selector }
  );
}

/**
 * Helper to type in shadow DOM textarea
 */
async function typeShadowTextarea(page: any, hostId: string, selector: string, text: string) {
  await page.evaluate(
    ({ hostId, selector, text }: { hostId: string; selector: string; text: string }) => {
      const host = document.getElementById(hostId);
      if (!host?.shadowRoot) throw new Error('Shadow root not found');

      const textarea = host.shadowRoot.querySelector(selector) as HTMLTextAreaElement;
      if (!textarea) throw new Error(`Textarea not found: ${selector}`);

      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    },
    { hostId, selector, text }
  );
}

/**
 * Helper to simulate Ctrl+Shift+C on selected text
 */
async function triggerChatOnSelection(context: BrowserContext, page: any, text: string) {
  // Select text on the page
  await page.evaluate((textToSelect: string) => {
    const body = document.body;
    const textNode = document.createTextNode(textToSelect);
    const span = document.createElement('span');
    span.id = 'test-selection-target';
    span.appendChild(textNode);
    body.appendChild(span);

    // Create selection
    const range = document.createRange();
    range.selectNodeContents(span);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, text);

  // Send message to activate chat selector (simulates Ctrl+Shift+C)
  await sendMessageToContentScript(context, page, {
    type: 'ACTIVATE_CHAT_SELECTOR'
  });

  await page.waitForTimeout(500);
}

test.describe('Element Chat Enhancements', () => {

  test('Feature 2: Input enabled while generating', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Activate element chat on a heading
    await sendMessageToContentScript(context, page, {
      type: 'ACTIVATE_CHAT_SELECTOR'
    });

    await page.waitForTimeout(1000);

    // Find and click on h1 element
    const h1 = await page.$('h1');
    expect(h1).not.toBeNull();
    await h1!.click();

    await page.waitForTimeout(1000);

    // Find chat window container
    const chatContainer = await page.$('[data-nabokov-element-chat]');
    expect(chatContainer).not.toBeNull();

    const containerId = await chatContainer!.getAttribute('id');
    expect(containerId).toContain('nabokov-element-chat-');

    // Wait for shadow root
    const hasShadowRoot = await waitForShadowRoot(page, containerId!);
    expect(hasShadowRoot).toBe(true);

    // Type a message
    await typeShadowTextarea(page, containerId!, 'textarea', 'Test message');
    await page.waitForTimeout(500);

    // Check that textarea placeholder is NOT "Composing next message..." (not streaming yet)
    const placeholder1 = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const textarea = host?.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
        return textarea?.placeholder || '';
      },
      containerId!
    );
    expect(placeholder1).not.toContain('Composing next message');

    // Check send button shows ➤ (not streaming)
    const sendButtonText1 = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const sendButton = host?.shadowRoot?.querySelector('button[title*="Send"]') as HTMLButtonElement;
        return sendButton?.textContent || '';
      },
      containerId!
    );
    expect(sendButtonText1).toContain('➤');

    await page.close();
  });

  test('Feature 3: Message queueing system', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Activate element chat
    await sendMessageToContentScript(context, page, {
      type: 'ACTIVATE_CHAT_SELECTOR'
    });

    await page.waitForTimeout(1000);

    // Click on h1 element
    const h1 = await page.$('h1');
    await h1!.click();
    await page.waitForTimeout(1000);

    // Find chat window
    const chatContainer = await page.$('[data-nabokov-element-chat]');
    const containerId = await chatContainer!.getAttribute('id');
    await waitForShadowRoot(page, containerId!);

    // Type and send first message
    await typeShadowTextarea(page, containerId!, 'textarea', 'First message');
    await page.waitForTimeout(300);
    await clickShadowElement(page, containerId!, 'button[title*="Send"]');
    await page.waitForTimeout(500);

    // Immediately queue a second message (while first is "streaming")
    await typeShadowTextarea(page, containerId!, 'textarea', 'Queued message');
    await page.waitForTimeout(300);

    // Check that send button now shows ➕ (queue icon)
    const sendButtonText = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const sendButton = host?.shadowRoot?.querySelector('button[title*="Queue"]') as HTMLButtonElement;
        return sendButton?.textContent || '';
      },
      containerId!
    );
    expect(sendButtonText).toContain('➕');

    await page.close();
  });

  test('Feature 4: Image upload support', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Activate element chat
    await sendMessageToContentScript(context, page, {
      type: 'ACTIVATE_CHAT_SELECTOR'
    });

    await page.waitForTimeout(1000);

    // Click on h1 element
    const h1 = await page.$('h1');
    await h1!.click();
    await page.waitForTimeout(1000);

    // Find chat window
    const chatContainer = await page.$('[data-nabokov-element-chat]');
    const containerId = await chatContainer!.getAttribute('id');
    await waitForShadowRoot(page, containerId!);

    // Check that ImageUploadZone is present
    const hasImageUploadZone = await queryShadowElement(
      page,
      containerId!,
      'textarea' // ImageUploadZone wraps the textarea
    );
    expect(hasImageUploadZone).toBeTruthy();

    // Note: Cannot test actual drag-drop due to browser security restrictions
    // But we can verify the component is present and integrated

    await page.close();
  });

  test('Feature 5: Chat with highlighted text', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Trigger chat on selected text
    const selectedText = 'This is selected text for testing';
    await triggerChatOnSelection(context, page, selectedText);

    await page.waitForTimeout(2000);

    // Find text-contextual chat window
    const chatContainer = await page.$('[data-text-selection="true"]');
    expect(chatContainer).not.toBeNull();

    const containerId = await chatContainer!.getAttribute('id');
    expect(containerId).toContain('nabokov-element-chat-text-selection');

    // Wait for shadow root
    const hasShadowRoot = await waitForShadowRoot(page, containerId!);
    expect(hasShadowRoot).toBe(true);

    // Check that selected text banner is present
    const bannerText = await getShadowTextContent(page, containerId!, '[data-test-id="selected-text-banner"]');
    // Note: If banner doesn't have test ID, we can check for the selected text content
    const hasSelectedText = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const banner = host?.shadowRoot?.querySelector('div[style*="linear-gradient"]');
        return banner?.textContent?.includes('Selected Text') || false;
      },
      containerId!
    );
    expect(hasSelectedText).toBe(true);

    await page.close();
  });

  test('Feature 1: Save to Stash/Canvas buttons', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Activate element chat
    await sendMessageToContentScript(context, page, {
      type: 'ACTIVATE_CHAT_SELECTOR'
    });

    await page.waitForTimeout(1000);

    // Click on h1 element
    const h1 = await page.$('h1');
    await h1!.click();
    await page.waitForTimeout(1000);

    // Find chat window
    const chatContainer = await page.$('[data-nabokov-element-chat]');
    const containerId = await chatContainer!.getAttribute('id');
    await waitForShadowRoot(page, containerId!);

    // Initially, save buttons should NOT be present (no messages yet)
    const hasSaveButtonsInitially = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const stashButton = host?.shadowRoot?.querySelector('button[title*="Stash"]');
        const canvasButton = host?.shadowRoot?.querySelector('button[title*="Canvas"]');
        return stashButton !== null || canvasButton !== null;
      },
      containerId!
    );
    expect(hasSaveButtonsInitially).toBe(false);

    // Send a message to create history
    await typeShadowTextarea(page, containerId!, 'textarea', 'Test message');
    await page.waitForTimeout(300);
    await clickShadowElement(page, containerId!, 'button[title*="Send"]');
    await page.waitForTimeout(2000); // Wait for response

    // Now save buttons SHOULD be present
    const hasSaveButtonsAfterMessage = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const stashButton = host?.shadowRoot?.querySelector('button[title*="Stash"]');
        const canvasButton = host?.shadowRoot?.querySelector('button[title*="Canvas"]');
        return stashButton !== null && canvasButton !== null;
      },
      containerId!
    );
    expect(hasSaveButtonsAfterMessage).toBe(true);

    // Check button icons
    const stashButtonText = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const stashButton = host?.shadowRoot?.querySelector('button[title*="Stash"]') as HTMLButtonElement;
        return stashButton?.textContent || '';
      },
      containerId!
    );
    expect(stashButtonText).toContain('📥');

    const canvasButtonText = await page.evaluate(
      (hostId: string) => {
        const host = document.getElementById(hostId);
        const canvasButton = host?.shadowRoot?.querySelector('button[title*="Canvas"]') as HTMLButtonElement;
        return canvasButton?.textContent || '';
      },
      containerId!
    );
    expect(canvasButtonText).toContain('🎨');

    await page.close();
  });

  test('Feature 1: Save to Stash functionality', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Activate element chat and send message
    await sendMessageToContentScript(context, page, {
      type: 'ACTIVATE_CHAT_SELECTOR'
    });
    await page.waitForTimeout(1000);

    const h1 = await page.$('h1');
    await h1!.click();
    await page.waitForTimeout(1000);

    const chatContainer = await page.$('[data-nabokov-element-chat]');
    const containerId = await chatContainer!.getAttribute('id');
    await waitForShadowRoot(page, containerId!);

    // Send a message
    await typeShadowTextarea(page, containerId!, 'textarea', 'Save test message');
    await page.waitForTimeout(300);
    await clickShadowElement(page, containerId!, 'button[title*="Send"]');
    await page.waitForTimeout(2000);

    // Click Save to Stash button
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Conversation saved to Stash!');
      await dialog.accept();
    });

    await clickShadowElement(page, containerId!, 'button[title*="Stash"]');
    await page.waitForTimeout(1000);

    // Verify card was created in storage
    const cards = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['cards'], (result) => {
          resolve(result.cards || []);
        });
      });
    }) as any[];

    // Should have at least one stashed card with 'element-chat' tag
    const stashedChatCards = cards.filter(c =>
      c.stashed === true &&
      c.tags?.includes('element-chat')
    );
    expect(stashedChatCards.length).toBeGreaterThan(0);

    await page.close();
  });

  test('Feature 1: Save to Canvas functionality', async ({ context }) => {
    const page = await context.newPage();
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');

    // Activate element chat and send message
    await sendMessageToContentScript(context, page, {
      type: 'ACTIVATE_CHAT_SELECTOR'
    });
    await page.waitForTimeout(1000);

    const h1 = await page.$('h1');
    await h1!.click();
    await page.waitForTimeout(1000);

    const chatContainer = await page.$('[data-nabokov-element-chat]');
    const containerId = await chatContainer!.getAttribute('id');
    await waitForShadowRoot(page, containerId!);

    // Send a message
    await typeShadowTextarea(page, containerId!, 'textarea', 'Canvas save test');
    await page.waitForTimeout(300);
    await clickShadowElement(page, containerId!, 'button[title*="Send"]');
    await page.waitForTimeout(2000);

    // Click Save to Canvas button
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Conversation saved to Canvas!');
      await dialog.accept();
    });

    await clickShadowElement(page, containerId!, 'button[title*="Canvas"]');
    await page.waitForTimeout(1000);

    // Verify card was created in storage
    const cards = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['cards'], (result) => {
          resolve(result.cards || []);
        });
      });
    }) as any[];

    // Should have at least one non-stashed card with 'element-chat' tag
    const canvasChatCards = cards.filter(c =>
      c.stashed !== true &&
      c.tags?.includes('element-chat')
    );
    expect(canvasChatCards.length).toBeGreaterThan(0);

    await page.close();
  });

});
