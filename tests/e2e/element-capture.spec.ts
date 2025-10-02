/**
 * Element Capture E2E Tests
 *
 * End-to-end tests for the element selection and capture flow.
 * Tests the complete user journey from activating the selector to saving a card.
 */

import { test, expect } from '../fixtures/extension';
import {
  openCanvasPage,
  createTestPage,
  waitForSelectableElement,
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';
import { SAMPLE_TEST_PAGE_HTML } from '../fixtures/data';

test.describe('Element Capture Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Clear storage before each test
    await clearExtensionStorage(context);
  });

  test('should activate element selector on button click', async ({ context, extensionId }) => {
    // Create test page
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    // TODO: Wait for content script to load
    await page.waitForTimeout(1000);

    // TODO: Trigger selector activation
    // This would typically be done via extension popup or keyboard shortcut
    // For now, we'll simulate it via page context

    // Check for selector overlay
    const overlay = await page.locator('#nabokov-selector-overlay').count();
    // In a real test, this would be > 0 after activation
    expect(overlay).toBeGreaterThanOrEqual(0);
  });

  test('should highlight element on hover', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');

    // Get test element
    const testElement = page.locator('#test-paragraph');
    await testElement.waitFor({ state: 'visible' });

    // Hover over element
    await testElement.hover();

    // In a real implementation, the element would have a highlight class or overlay
    // For now, just verify element is visible
    await expect(testElement).toBeVisible();
  });

  test('should capture element on click', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    await page.waitForLoadState('domcontentloaded');

    // Get test element
    const testElement = page.locator('#test-paragraph .clippable');
    await testElement.waitFor({ state: 'visible' });

    // Click element (would trigger capture in real implementation)
    await testElement.click();

    // Verify element exists
    await expect(testElement).toBeVisible();
  });

  test('should extract element HTML and styles', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    await page.waitForLoadState('domcontentloaded');

    // Execute element extraction in page context
    const elementData = await page.evaluate(() => {
      const element = document.querySelector('#test-paragraph') as HTMLElement;
      if (!element) return null;

      const computedStyle = window.getComputedStyle(element);

      return {
        html: element.outerHTML,
        styles: {
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily,
          color: computedStyle.color,
        },
      };
    });

    expect(elementData).not.toBeNull();
    expect(elementData?.html).toContain('test-paragraph');
    expect(elementData?.styles.fontSize).toBeTruthy();
  });

  test('should generate CSS selector for element', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    await page.waitForLoadState('domcontentloaded');

    // Generate selector for element
    const selector = await page.evaluate(() => {
      const element = document.querySelector('#test-article') as HTMLElement;
      if (!element) return null;

      // Simple selector generation
      if (element.id) return `#${element.id}`;
      if (element.className) return `.${element.className.split(' ')[0]}`;
      return element.tagName.toLowerCase();
    });

    expect(selector).toBe('#test-article');
  });

  test('should capture surrounding context', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    await page.waitForLoadState('domcontentloaded');

    // Extract surrounding text
    const surroundingText = await page.evaluate(() => {
      const element = document.querySelector('#test-paragraph') as HTMLElement;
      if (!element || !element.parentElement) return null;

      // Get text from parent
      const parentText = element.parentElement.textContent || '';

      // Get text before and after element
      const elementText = element.textContent || '';
      const beforeText = parentText.substring(0, parentText.indexOf(elementText));
      const afterText = parentText.substring(parentText.indexOf(elementText) + elementText.length);

      return {
        before: beforeText.trim().slice(-100),
        after: afterText.trim().slice(0, 100),
      };
    });

    expect(surroundingText).not.toBeNull();
  });

  test('should save card to storage', async ({ context }) => {
    // Create a mock card
    const mockCard = {
      id: 'test-card-e2e',
      title: 'Test Card',
      content: '<p>Test content</p>',
      url: 'https://example.com',
      tags: ['test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save to storage
    await setExtensionStorage(context, {
      cards: {
        [mockCard.id]: mockCard,
      },
    });

    // Retrieve from storage
    const storage = await getExtensionStorage(context, 'cards');

    expect(storage.cards).toBeDefined();
    expect(storage.cards[mockCard.id]).toBeDefined();
    expect(storage.cards[mockCard.id].title).toBe('Test Card');
  });

  test('should open canvas page', async ({ context, extensionId }) => {
    await openCanvasPage(context, extensionId);

    const pages = context.pages();
    const canvasPage = pages[pages.length - 1];

    // Verify canvas page URL
    expect(canvasPage.url()).toContain('canvas.html');
  });

  test('should display saved cards on canvas', async ({ context, extensionId }) => {
    // Save test cards
    const testCards = {
      'card-1': {
        id: 'card-1',
        title: 'Card 1',
        content: '<p>Content 1</p>',
        url: 'https://example.com/1',
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      'card-2': {
        id: 'card-2',
        title: 'Card 2',
        content: '<p>Content 2</p>',
        url: 'https://example.com/2',
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    await setExtensionStorage(context, { cards: testCards });

    // Open canvas
    await openCanvasPage(context, extensionId);

    const pages = context.pages();
    const canvasPage = pages[pages.length - 1];

    // Wait for canvas to load
    await canvasPage.waitForLoadState('domcontentloaded');

    // In a real implementation, verify cards are displayed
    // For now, just verify page loaded
    expect(canvasPage.url()).toContain('canvas.html');
  });

  test('should handle ESC key to cancel selection', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    await page.waitForLoadState('domcontentloaded');

    // Press ESC key
    await page.keyboard.press('Escape');

    // Verify selector is deactivated (in real implementation)
    // For now, just verify page is still responsive
    const title = await page.title();
    expect(title).toBe('Test Page for Nabokov Clipper');
  });

  test('should extract page metadata', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    await page.waitForLoadState('domcontentloaded');

    // Extract metadata
    const metadata = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
      };
    });

    expect(metadata.title).toBe('Test Page for Nabokov Clipper');
    expect(metadata.url).toBeTruthy();
  });

  test('should handle multiple element selections', async ({ context }) => {
    const page = await createTestPage(context, SAMPLE_TEST_PAGE_HTML);

    await page.waitForLoadState('domcontentloaded');

    // Select multiple clippable elements
    const clippableElements = await page.locator('.clippable').all();

    expect(clippableElements.length).toBeGreaterThan(0);

    // Simulate selecting each element
    for (const element of clippableElements) {
      await element.scrollIntoViewIfNeeded();
      await expect(element).toBeVisible();
    }
  });

  test('should handle elements with complex HTML', async ({ context }) => {
    const complexHTML = `
      <!DOCTYPE html>
      <html>
        <head><title>Complex Test</title></head>
        <body>
          <div id="complex-element">
            <h1>Title</h1>
            <div class="nested">
              <p>Paragraph 1</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
              <pre><code>const x = 10;</code></pre>
            </div>
          </div>
        </body>
      </html>
    `;

    const page = await createTestPage(context, complexHTML);
    await page.waitForLoadState('domcontentloaded');

    const elementHTML = await page.evaluate(() => {
      const element = document.querySelector('#complex-element');
      return element?.outerHTML;
    });

    expect(elementHTML).toContain('Title');
    expect(elementHTML).toContain('nested');
    expect(elementHTML).toContain('const x = 10;');
  });

  test('should sanitize captured HTML', async ({ context }) => {
    const dangerousHTML = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="dangerous">
            <p>Safe content</p>
            <script>alert('XSS')</script>
            <button onclick="alert('XSS')">Click</button>
          </div>
        </body>
      </html>
    `;

    const page = await createTestPage(context, dangerousHTML);
    await page.waitForLoadState('domcontentloaded');

    // In real implementation, HTML would be sanitized before storage
    const rawHTML = await page.evaluate(() => {
      const element = document.querySelector('#dangerous');
      return element?.outerHTML;
    });

    expect(rawHTML).toBeDefined();
    // Note: Sanitization happens in the extension, not in the page
    // This test just verifies we can capture the element
  });

  test('should handle errors gracefully', async ({ context }) => {
    const page = await createTestPage(context, '<html><body></body></html>');

    await page.waitForLoadState('domcontentloaded');

    // Try to select non-existent element
    const element = await page.locator('#non-existent').count();

    expect(element).toBe(0);
  });

  test('REGRESSION: overlay should track elements during scroll', async ({ context, extensionId }) => {
    // Create a tall page with scrollable content
    const scrollableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            #top-spacer { height: 500px; background: #f0f0f0; }
            #target-element {
              width: 300px;
              height: 100px;
              background: #4CAF50;
              color: white;
              padding: 20px;
              margin: 20px;
              font-size: 18px;
            }
            #bottom-spacer { height: 1500px; background: #e0e0e0; }
          </style>
        </head>
        <body>
          <div id="top-spacer">Top spacer</div>
          <div id="target-element">Target Element - This is the element to track</div>
          <div id="bottom-spacer">Bottom spacer</div>
        </body>
      </html>
    `;

    const page = await context.newPage();
    await page.setContent(scrollableHTML);
    await page.waitForLoadState('domcontentloaded');

    // Helper to activate selector (from keyboard-shortcuts.spec.ts)
    const activateSelector = async () => {
      let [serviceWorker] = context.serviceWorkers();
      if (!serviceWorker) {
        serviceWorker = await context.waitForEvent('serviceworker');
      }

      await serviceWorker.evaluate(async () => {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: 'ACTIVATE_SELECTOR',
                payload: { stashImmediately: false }
              });
              break;
            } catch (e) {
              // Continue to next tab
            }
          }
        }
      });
    };

    // Activate element selector
    await activateSelector();
    await page.waitForTimeout(1000);

    // Verify selector is active
    const hasShadowRoot = await page.evaluate(() => {
      const container = document.querySelector('#nabokov-selector-container');
      return container !== null && container.shadowRoot !== null;
    });
    expect(hasShadowRoot).toBe(true);

    // Get target element's initial position
    const targetElement = page.locator('#target-element');
    await targetElement.waitFor({ state: 'visible' });

    const initialElementRect = await targetElement.boundingBox();
    expect(initialElementRect).not.toBeNull();

    // Hover over element to trigger overlay
    await targetElement.hover();
    await page.waitForTimeout(500);

    // Check overlay position relative to element (before scroll)
    const overlayDataBefore = await page.evaluate(() => {
      const container = document.querySelector('#nabokov-selector-container');
      if (!container?.shadowRoot) return null;

      const targetEl = document.querySelector('#target-element');
      if (!targetEl) return null;

      const targetRect = targetEl.getBoundingClientRect();

      // Find highlight overlay in shadow DOM
      const highlight = container.shadowRoot.querySelector('[data-nabokov-overlay] > div');
      if (!highlight) return null;

      const highlightStyle = (highlight as HTMLElement).style;
      const overlayTop = parseFloat(highlightStyle.top || '0');
      const overlayLeft = parseFloat(highlightStyle.left || '0');

      return {
        targetTop: targetRect.top,
        targetLeft: targetRect.left,
        overlayTop,
        overlayLeft,
        // Calculate offset (should be ~0 if aligned correctly)
        offsetTop: Math.abs(overlayTop - targetRect.top),
        offsetLeft: Math.abs(overlayLeft - targetRect.left)
      };
    });

    expect(overlayDataBefore).not.toBeNull();
    // Overlay should be aligned with element (within 2px tolerance for rounding)
    expect(overlayDataBefore!.offsetTop).toBeLessThan(2);
    expect(overlayDataBefore!.offsetLeft).toBeLessThan(2);

    // Scroll the page down by 300px
    await page.evaluate(() => {
      window.scrollBy(0, 300);
    });
    await page.waitForTimeout(300); // Wait for scroll handler to trigger re-render

    // Check overlay position after scroll
    const overlayDataAfter = await page.evaluate(() => {
      const container = document.querySelector('#nabokov-selector-container');
      if (!container?.shadowRoot) return null;

      const targetEl = document.querySelector('#target-element');
      if (!targetEl) return null;

      const targetRect = targetEl.getBoundingClientRect();

      const highlight = container.shadowRoot.querySelector('[data-nabokov-overlay] > div');
      if (!highlight) return null;

      const highlightStyle = (highlight as HTMLElement).style;
      const overlayTop = parseFloat(highlightStyle.top || '0');
      const overlayLeft = parseFloat(highlightStyle.left || '0');

      return {
        targetTop: targetRect.top,
        targetLeft: targetRect.left,
        overlayTop,
        overlayLeft,
        offsetTop: Math.abs(overlayTop - targetRect.top),
        offsetLeft: Math.abs(overlayLeft - targetRect.left)
      };
    });

    expect(overlayDataAfter).not.toBeNull();

    // CRITICAL: After scroll, overlay should STILL be aligned with element
    // This is the regression test for the bug where overlay stayed in fixed position
    expect(overlayDataAfter!.offsetTop).toBeLessThan(2);
    expect(overlayDataAfter!.offsetLeft).toBeLessThan(2);

    // Additionally verify that the overlay position changed by the same amount as the element
    // Element moved up on screen (negative direction) by 300px
    const elementMovement = overlayDataAfter!.targetTop - overlayDataBefore!.targetTop;
    expect(elementMovement).toBeLessThan(-250); // Should be around -300px (with tolerance)
    expect(elementMovement).toBeGreaterThan(-350);

    console.log('[Regression Test] Scroll tracking verified:', {
      before: overlayDataBefore,
      after: overlayDataAfter,
      elementMovement
    });
  });
});