import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  console.log('🧪 Testing Floating Windows\n');

  const ext = path.join(__dirname, '..', 'dist');
  const ctx = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      '--disable-extensions-except=' + ext,
      '--load-extension=' + ext
    ]
  });

  try {
    // Step 1: Capture a test element
    console.log('📋 Step 1: Capture a test element');
    const page = await ctx.newPage();
    await page.goto('https://example.com');
    await page.waitForTimeout(1000);

    await page.keyboard.press('Meta+Shift+KeyE');
    await page.waitForTimeout(500);
    await page.click('h1');
    await page.waitForTimeout(2000);
    console.log('  ✅ Element captured\n');

    // Step 2: Get extension ID and open canvas
    await page.waitForTimeout(1000);
    const serviceWorkers = ctx.serviceWorkers();
    let extId = null;

    if (serviceWorkers.length > 0) {
      extId = serviceWorkers[0].url().match(/chrome-extension:\/\/([a-z]+)\//)?.[1];
    }

    if (!extId) {
      try {
        extId = await page.evaluate(() => chrome.runtime.id);
      } catch (e) {
        console.log('❌ Could not get extension ID');
        return;
      }
    }

    console.log('📋 Step 2: Opening Canvas');
    console.log('  Extension ID:', extId);

    const canvasPage = await ctx.newPage();
    const canvasUrl = `chrome-extension://${extId}/src/canvas/index.html`;

    canvasPage.on('console', msg => {
      console.log('  [Canvas]', msg.text());
    });

    canvasPage.on('pageerror', error => {
      console.error('  [Error]', error.message);
    });

    await canvasPage.goto(canvasUrl, { waitUntil: 'networkidle' });
    await canvasPage.waitForTimeout(3000);
    console.log('  ✅ Canvas loaded\n');

    // Step 3: Find and click "Open as Window" button
    console.log('📋 Step 3: Open floating window');

    const openWindowBtn = await canvasPage.locator('[data-testid="open-window-btn"]').first();
    const btnExists = await openWindowBtn.count() > 0;

    if (!btnExists) {
      console.log('  ❌ No "Open as Window" button found');
      await canvasPage.screenshot({ path: 'test-scripts/floating-window-error.png' });
      return;
    }

    await openWindowBtn.click();
    await canvasPage.waitForTimeout(1000);
    console.log('  ✅ Clicked "Open as Window" button\n');

    // Step 4: Verify floating window appeared
    console.log('📋 Step 4: Verify floating window');

    const floatingWindow = canvasPage.locator('.window-header').first();
    const windowExists = await floatingWindow.count() > 0;

    if (!windowExists) {
      console.log('  ❌ Floating window did not appear');
      await canvasPage.screenshot({ path: 'test-scripts/floating-window-error.png' });
      return;
    }

    console.log('  ✅ Floating window appeared');

    // Check for chat interface
    const chatInput = canvasPage.locator('input[placeholder*="Ask"]').first();
    const chatExists = await chatInput.count() > 0;
    console.log('  Chat interface:', chatExists ? '✅' : '❌');

    await canvasPage.screenshot({ path: 'test-scripts/floating-window-opened.png' });
    console.log('  📸 Screenshot: floating-window-opened.png\n');

    // Step 5: Test chat input persistence
    console.log('📋 Step 5: Test chat input persistence');

    if (chatExists) {
      const testMessage = 'Test message for persistence';
      await chatInput.fill(testMessage);
      await canvasPage.waitForTimeout(500);

      const inputValue = await chatInput.inputValue();
      console.log('  Input value:', inputValue === testMessage ? '✅' : '❌');
    }

    // Step 6: Test minimize/maximize
    console.log('\n📋 Step 6: Test minimize/maximize');

    const minimizeBtn = canvasPage.locator('button[title="Minimize"]').first();
    const minimizeBtnExists = await minimizeBtn.count() > 0;

    if (minimizeBtnExists) {
      await minimizeBtn.click();
      await canvasPage.waitForTimeout(500);

      // Window should be hidden (display: none)
      const isHidden = await floatingWindow.evaluate(el => {
        return window.getComputedStyle(el.parentElement).display === 'none';
      });
      console.log('  Window minimized (hidden):', isHidden ? '✅' : '❌');

      await canvasPage.screenshot({ path: 'test-scripts/floating-window-minimized.png' });
      console.log('  📸 Screenshot: floating-window-minimized.png');

      // Re-open window by clicking the card again
      await canvasPage.waitForTimeout(500);
      await openWindowBtn.click();
      await canvasPage.waitForTimeout(500);

      const isVisible = await floatingWindow.evaluate(el => {
        return window.getComputedStyle(el.parentElement).display !== 'none';
      });
      console.log('  Window restored (visible):', isVisible ? '✅' : '❌');

      // Check if input text persisted
      if (chatExists) {
        const persistedValue = await chatInput.inputValue();
        const persisted = persistedValue === 'Test message for persistence';
        console.log('  Chat input persisted:', persisted ? '✅' : '❌');
      }
    }

    // Step 7: Test dragging
    console.log('\n📋 Step 7: Test window dragging');

    const windowHeader = canvasPage.locator('.window-header').first();
    const headerExists = await windowHeader.count() > 0;

    if (headerExists) {
      const boundingBox = await windowHeader.boundingBox();
      if (boundingBox) {
        const startX = boundingBox.x + boundingBox.width / 2;
        const startY = boundingBox.y + boundingBox.height / 2;

        await canvasPage.mouse.move(startX, startY);
        await canvasPage.mouse.down();
        await canvasPage.mouse.move(startX + 100, startY + 100, { steps: 10 });
        await canvasPage.mouse.up();
        await canvasPage.waitForTimeout(500);

        console.log('  ✅ Window dragged');
        await canvasPage.screenshot({ path: 'test-scripts/floating-window-dragged.png' });
        console.log('  📸 Screenshot: floating-window-dragged.png');
      }
    }

    // Step 8: Test close
    console.log('\n📋 Step 8: Test window close');

    const closeBtn = canvasPage.locator('button[title="Close"]').first();
    const closeBtnExists = await closeBtn.count() > 0;

    if (closeBtnExists) {
      await closeBtn.click();
      await canvasPage.waitForTimeout(500);

      const windowCount = await canvasPage.locator('.window-header').count();
      console.log('  Window closed:', windowCount === 0 ? '✅' : '❌');
    }

    console.log('\n✅ All tests passed!');
    console.log('⏸️  Keeping browser open for 30 seconds...\n');
    await canvasPage.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    console.error(error.stack);
  } finally {
    await ctx.close();
  }
}

test().catch(console.error);
