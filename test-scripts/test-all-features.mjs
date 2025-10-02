/**
 * Comprehensive test for Nabokov Web Clipper features
 * Tests: Element capture, Stash mode, Inline chat
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🧪 Starting comprehensive feature tests...\n');

  const extensionPath = path.join(__dirname, '..', 'dist');
  console.log('📦 Extension path:', extensionPath);

  // Launch browser with extension
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  console.log('🌐 Browser launched with extension');

  // Wait for service worker
  let background = context.serviceWorkers()[0];
  if (!background) {
    console.log('⏳ Waiting for service worker...');
    background = await context.waitForEvent('serviceworker');
  }

  const extensionId = background.url().split('/')[2];
  console.log('✅ Extension ID:', extensionId);

  // Monitor background service worker console
  context.on('console', msg => {
    const text = msg.text();
    if (text.includes('[background]')) {
      console.log(`  🔧 ${text}`);
    }
  });

  // Create test page
  const page = await context.newPage();

  // Monitor console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[ElementSelector]') || text.includes('[content]') || text.includes('[background]')) {
      console.log(`  📝 ${text}`);
    }
  });

  page.on('pageerror', error => {
    console.error(`  ❌ Page error: ${error.message}`);
  });

  // Create a helper to access storage from canvas page
  const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;

  // Helper function to get cards from storage
  async function getCardsFromStorage() {
    const canvasPage = await context.newPage();
    await canvasPage.goto(canvasUrl);
    const cards = await canvasPage.evaluate(async () => {
      const result = await chrome.storage.local.get('cards');
      return result.cards || [];
    });
    await canvasPage.close();
    return cards;
  }

  // Helper function to clear storage
  async function clearStorage() {
    const canvasPage = await context.newPage();
    await canvasPage.goto(canvasUrl);
    await canvasPage.evaluate(() => chrome.storage.local.clear());
    await canvasPage.close();
  }

  // Navigate to test page
  await page.goto('https://example.com');
  await page.waitForLoadState('domcontentloaded');
  console.log('\n📄 Test page loaded: https://example.com');

  // Wait for content script to initialize
  await page.waitForTimeout(1000);

  try {
    // ========================================================================
    // TEST 1: Canvas Mode (Alt+E)
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('TEST 1: Canvas Mode Element Capture (Alt+E)');
    console.log('='.repeat(70));

    // Clear storage first
    await clearStorage();
    console.log('🗑️  Storage cleared');

    // Trigger Canvas mode programmatically (keyboard shortcuts don't work in automated tests)
    console.log('⌨️  Triggering Canvas mode programmatically...');
    await page.evaluate(() => {
      chrome.runtime.sendMessage({
        type: 'ACTIVATE_SELECTOR',
        payload: { stashImmediately: false },
        stashImmediately: false
      });
    });
    await page.waitForTimeout(500);

    // Check if selector appeared
    const canvasModeIndicator = await page.locator('text=CANVAS MODE').count();
    if (canvasModeIndicator > 0) {
      console.log('✅ Canvas mode indicator appeared');
    } else {
      console.log('❌ Canvas mode indicator NOT found');
    }

    // Click on an element
    console.log('🖱️  Clicking on <h1> element...');
    await page.locator('h1').first().click({ force: true });
    await page.waitForTimeout(3000); // Wait for capture and auto-close

    // Check storage
    const canvasCards = await getCardsFromStorage();

    console.log(`📊 Cards in storage: ${canvasCards.length}`);
    if (canvasCards.length > 0) {
      const card = canvasCards[0];
      console.log(`✅ Card captured: ${card.id}`);
      console.log(`   - Stashed: ${card.stashed}`);
      console.log(`   - Tag: ${card.metadata.tagName}`);
      console.log(`   - Content length: ${card.content?.length || 0} chars`);

      if (card.stashed === false) {
        console.log('✅ TEST 1 PASSED: Card saved to canvas (stashed=false)');
      } else {
        console.log('❌ TEST 1 FAILED: Card should NOT be stashed in Canvas mode');
      }
    } else {
      console.log('❌ TEST 1 FAILED: No cards captured');
    }

    // ========================================================================
    // TEST 2: Stash Mode (Alt+Shift+E)
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('TEST 2: Stash Mode Element Capture (Alt+Shift+E)');
    console.log('='.repeat(70));

    // Clear storage
    await clearStorage();
    console.log('🗑️  Storage cleared');

    // Trigger Stash mode programmatically
    console.log('⌨️  Triggering Stash mode programmatically...');
    await page.evaluate(() => {
      chrome.runtime.sendMessage({
        type: 'ACTIVATE_SELECTOR',
        payload: { stashImmediately: true },
        stashImmediately: true
      });
    });
    await page.waitForTimeout(500);

    // Check if selector appeared with stash mode
    const stashModeIndicator = await page.locator('text=STASH MODE').count();
    if (stashModeIndicator > 0) {
      console.log('✅ Stash mode indicator appeared');
    } else {
      console.log('❌ Stash mode indicator NOT found');
    }

    // Click on an element
    console.log('🖱️  Clicking on <p> element...');
    await page.locator('p').first().click({ force: true });
    await page.waitForTimeout(3000);

    // Check storage
    const stashCards = await getCardsFromStorage();

    console.log(`📊 Cards in storage: ${stashCards.length}`);
    if (stashCards.length > 0) {
      const card = stashCards[0];
      console.log(`✅ Card captured: ${card.id}`);
      console.log(`   - Stashed: ${card.stashed}`);
      console.log(`   - Tag: ${card.metadata.tagName}`);
      console.log(`   - Content length: ${card.content?.length || 0} chars`);

      if (card.stashed === true) {
        console.log('✅ TEST 2 PASSED: Card saved to stash (stashed=true)');
      } else {
        console.log('❌ TEST 2 FAILED: Card should be stashed in Stash mode');
      }
    } else {
      console.log('❌ TEST 2 FAILED: No cards captured');
    }

    // ========================================================================
    // TEST 3: Inline Chat (Alt+Shift+C)
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('TEST 3: Inline Chat Keyboard Shortcut (Alt+Shift+C)');
    console.log('='.repeat(70));

    console.log('⌨️  Triggering inline chat programmatically...');
    await page.evaluate(() => {
      chrome.runtime.sendMessage({ type: 'OPEN_INLINE_CHAT' });
    });
    await page.waitForTimeout(1000);

    // Check if inline chat appeared (look for chat container in shadow DOM or main DOM)
    const chatWindowVisible = await page.evaluate(() => {
      // Check for chat container
      const chatContainer = document.querySelector('[data-nabokov-chat]');
      return chatContainer !== null;
    });

    if (chatWindowVisible) {
      console.log('✅ TEST 3 PASSED: Inline chat window opened');
    } else {
      console.log('❌ TEST 3 FAILED: Inline chat window did NOT open');
      console.log('   Note: This might be expected if the feature is still in development');
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));

    const test1Pass = canvasCards.length > 0 && canvasCards[0].stashed === false;
    const test2Pass = stashCards.length > 0 && stashCards[0].stashed === true;
    const test3Pass = chatWindowVisible;

    console.log(`Test 1 (Canvas Mode):  ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2 (Stash Mode):   ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 3 (Inline Chat):  ${test3Pass ? '✅ PASS' : '⚠️  FAIL (might be OK)'}`);

    const allCriticalPass = test1Pass && test2Pass;
    console.log('\n' + (allCriticalPass ? '🎉 ALL CRITICAL TESTS PASSED!' : '⚠️  Some tests failed'));

  } catch (error) {
    console.error('\n❌ Test error:', error);
  } finally {
    console.log('\n⏸️  Keeping browser open for 5 seconds for inspection...');
    await page.waitForTimeout(5000);
    await context.close();
    console.log('✅ Test complete');
  }
}

runTests().catch(console.error);
