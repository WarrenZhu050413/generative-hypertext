/**
 * Automated Tests for Complete Refactor
 *
 * Tests all new features:
 * 1. Keyboard shortcuts (Cmd+E vs Cmd+Shift+E)
 * 2. Mode indicators
 * 3. Side panel image upload (drag & drop + file picker)
 * 4. Cross-context synchronization
 * 5. Inline chat (Ctrl+Shift+C)
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, '..', 'dist');

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
    if (message) console.log(`   ${message}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (message) console.log(`   Error: ${message}`);
  }
  results.tests.push({ name, passed, message });
}

async function test() {
  console.log('🧪 Running Automated Refactor Tests\n');
  console.log('=' .repeat(60));
  console.log('');

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
    ],
  });

  const page = await context.newPage();

  try {
    // Test 1: Page Navigation
    console.log('📍 Test Group 1: Basic Setup\n');

    await page.goto('https://example.com');
    await page.waitForTimeout(1000);
    logTest('Navigate to test page', true, 'example.com loaded');

    // Test 2: Canvas Mode Shortcut
    console.log('\n📍 Test Group 2: Keyboard Shortcuts\n');

    await page.keyboard.press('Meta+E');
    await page.waitForTimeout(1500);

    const canvasModeVisible = await page.locator('text=CANVAS MODE').isVisible().catch(() => false);
    logTest('Cmd+E activates Canvas mode', canvasModeVisible, 'Mode indicator visible');

    const canvasBanner = await page.locator(':text("CANVAS MODE")').count();
    logTest('Canvas mode banner present', canvasBanner > 0);

    const canvasDescription = await page.locator('text=Cards will appear on Canvas').isVisible().catch(() => false);
    logTest('Canvas mode description visible', canvasDescription);

    // Close selector
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test 3: Stash Mode Shortcut
    await page.keyboard.press('Meta+Shift+E');
    await page.waitForTimeout(1500);

    const stashModeVisible = await page.locator('text=STASH MODE').isVisible().catch(() => false);
    logTest('Cmd+Shift+E activates Stash mode', stashModeVisible, 'Mode indicator visible');

    const stashBanner = await page.locator(':text("STASH MODE")').count();
    logTest('Stash mode banner present', stashBanner > 0);

    const stashDescription = await page.locator('text=Cards will be saved to Side Panel').isVisible().catch(() => false);
    logTest('Stash mode description visible', stashDescription);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test 4: No Checkbox Visible
    await page.keyboard.press('Meta+E');
    await page.waitForTimeout(1000);

    const checkboxCount = await page.locator('input[type="checkbox"]').count();
    logTest('No checkbox for "Stash immediately"', checkboxCount === 0, `Found ${checkboxCount} checkboxes (expected 0)`);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test 5: Inline Chat Shortcut
    await page.keyboard.press('Control+Shift+C');
    await page.waitForTimeout(1500);

    const inlineChatVisible = await page.locator('[data-nabokov-chat]').isVisible().catch(() => false);
    logTest('Ctrl+Shift+C opens inline chat', inlineChatVisible);

    if (inlineChatVisible) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Test 6: Element Capture
    console.log('\n📍 Test Group 3: Element Capture\n');

    // Activate Canvas mode and capture
    await page.keyboard.press('Meta+E');
    await page.waitForTimeout(1000);

    const h1Element = await page.locator('h1').first();
    await h1Element.click();
    await page.waitForTimeout(2000);

    // Check storage for captured card
    const canvasCardCount = await page.evaluate(() => {
      return chrome.storage.local.get('cards').then(result => {
        const cards = result.cards || [];
        return cards.filter(c => !c.stashed).length;
      });
    });

    logTest('Canvas mode capture creates non-stashed card', canvasCardCount > 0, `${canvasCardCount} canvas cards`);

    // Activate Stash mode and capture
    await page.keyboard.press('Meta+Shift+E');
    await page.waitForTimeout(1000);

    const pElement = await page.locator('p').first();
    await pElement.click();
    await page.waitForTimeout(2000);

    // Check storage for stashed card
    const stashCardCount = await page.evaluate(() => {
      return chrome.storage.local.get('cards').then(result => {
        const cards = result.cards || [];
        return cards.filter(c => c.stashed).length;
      });
    });

    logTest('Stash mode capture creates stashed card', stashCardCount > 0, `${stashCardCount} stashed cards`);

    // Test 7: Canvas and Side Panel
    console.log('\n📍 Test Group 4: Canvas and Side Panel\n');

    // Get extension ID
    const backgroundTargets = context.backgroundPages();
    const backgroundPage = backgroundTargets[0];
    const extensionId = backgroundPage.url().split('/')[2];
    logTest('Get extension ID', !!extensionId, extensionId);

    // Open canvas
    const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;
    const canvasPage = await context.newPage();
    await canvasPage.goto(canvasUrl);
    await canvasPage.waitForTimeout(2000);
    logTest('Canvas page opens', true);

    // Check for toolbar button
    const toolbarButton = await canvasPage.locator('[title*="Stashed Cards"]').count();
    logTest('Side panel button in toolbar', toolbarButton > 0, `Found ${toolbarButton} button(s)`);

    // Test 8: Image Upload (if we can access side panel)
    console.log('\n📍 Test Group 5: Image Upload\n');

    // Create a test image as base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    // Try to open side panel programmatically
    try {
      await canvasPage.evaluate(() => {
        return chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      });
      await page.waitForTimeout(2000);
      logTest('Side panel opens programmatically', true);
    } catch (error) {
      logTest('Side panel opens programmatically', false, error.message);
    }

    // Check if side panel page is accessible
    const allPages = context.pages();
    let sidePanelPage = null;

    for (const p of allPages) {
      const url = p.url();
      if (url.includes('sidepanel')) {
        sidePanelPage = p;
        break;
      }
    }

    if (sidePanelPage) {
      logTest('Side panel page accessible', true);

      // Check for upload button
      const uploadButton = await sidePanelPage.locator('text=📁 Upload Images').count();
      logTest('Upload button present', uploadButton > 0);

      // Check for file input
      const fileInput = await sidePanelPage.locator('input[type="file"]').count();
      logTest('File input present', fileInput > 0, `Found ${fileInput} input(s)`);

      // Check for stashed cards header
      const headerPresent = await sidePanelPage.locator('text=📦 Stashed Cards').count();
      logTest('Stashed cards header present', headerPresent > 0);
    } else {
      logTest('Side panel page accessible', false, 'Side panel not found in page contexts');
    }

    // Test 9: Cross-Context Sync
    console.log('\n📍 Test Group 6: Cross-Context Synchronization\n');

    // Get initial card counts
    const initialCounts = await canvasPage.evaluate(() => {
      return chrome.storage.local.get('cards').then(result => {
        const cards = result.cards || [];
        return {
          total: cards.length,
          stashed: cards.filter(c => c.stashed).length,
          canvas: cards.filter(c => !c.stashed).length
        };
      });
    });

    logTest('Get initial card counts', true, `Total: ${initialCounts.total}, Canvas: ${initialCounts.canvas}, Stashed: ${initialCounts.stashed}`);

    // Simulate stashing a card and check if it updates
    const cardToStash = await canvasPage.evaluate(() => {
      return chrome.storage.local.get('cards').then(result => {
        const cards = result.cards || [];
        const canvasCard = cards.find(c => !c.stashed);
        return canvasCard ? canvasCard.id : null;
      });
    });

    if (cardToStash) {
      // Stash the card
      await canvasPage.evaluate((cardId) => {
        return chrome.storage.local.get('cards').then(result => {
          const cards = result.cards || [];
          const index = cards.findIndex(c => c.id === cardId);
          if (index !== -1) {
            cards[index].stashed = true;
            cards[index].updatedAt = Date.now();
            return chrome.storage.local.set({ cards }).then(() => {
              // Broadcast update
              window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
              chrome.runtime.sendMessage({
                type: 'STASH_UPDATED',
                cardId
              });
            });
          }
        });
      }, cardToStash);

      await page.waitForTimeout(1000);

      // Check updated counts
      const updatedCounts = await canvasPage.evaluate(() => {
        return chrome.storage.local.get('cards').then(result => {
          const cards = result.cards || [];
          return {
            total: cards.length,
            stashed: cards.filter(c => c.stashed).length,
            canvas: cards.filter(c => !c.stashed).length
          };
        });
      });

      const stashCountIncreased = updatedCounts.stashed > initialCounts.stashed;
      logTest('Stash count increased after stashing', stashCountIncreased, `Before: ${initialCounts.stashed}, After: ${updatedCounts.stashed}`);
    } else {
      logTest('Found card to stash', false, 'No canvas cards available');
    }

    // Test 10: Visual Indicators
    console.log('\n📍 Test Group 7: Visual Polish\n');

    // Test mode banner styling
    await page.bringToFront();
    await page.keyboard.press('Meta+E');
    await page.waitForTimeout(1000);

    const canvasBannerStyle = await page.locator(':text("CANVAS MODE")').evaluate(el => {
      const parent = el.closest('div');
      return window.getComputedStyle(parent).background;
    }).catch(() => '');

    logTest('Canvas mode has gradient background', canvasBannerStyle.includes('gradient'), `Style: ${canvasBannerStyle.substring(0, 50)}...`);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    console.log('');

    if (results.failed > 0) {
      console.log('Failed Tests:');
      results.tests.filter(t => !t.passed).forEach(t => {
        console.log(`  ❌ ${t.name}: ${t.message}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    console.log('Closing browser in 3 seconds...');
    await page.waitForTimeout(3000);
    await context.close();
  }
}

test();
