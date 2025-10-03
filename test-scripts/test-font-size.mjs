#!/usr/bin/env node

/**
 * Manual test script for font size controls
 * Tests that FontSizeSelector appears and works in Canvas
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFontSizeControls() {
  console.log('🔍 Testing Font Size Controls...\n');

  const extensionPath = path.join(__dirname, '..', 'dist');
  console.log(`Loading extension from: ${extensionPath}`);

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  // Get extension ID
  const backgroundPages = context.backgroundPages();
  let backgroundPage;

  if (backgroundPages.length === 0) {
    console.log('⏳ Waiting for background page...');
    backgroundPage = await context.waitForEvent('backgroundpage');
  } else {
    backgroundPage = backgroundPages[0];
  }

  const extensionId = backgroundPage.url().split('/')[2];
  console.log(`✅ Extension loaded: ${extensionId}\n`);

  // Test 1: Open Canvas
  console.log('Test 1: Opening Canvas...');
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  console.log('✅ Canvas loaded\n');

  // Test 2: Check for FontSizeSelector
  console.log('Test 2: Checking for FontSizeSelector...');
  try {
    const selector = await canvasPage.locator('[data-testid="font-size-selector"]');
    const isVisible = await selector.isVisible({ timeout: 5000 });

    if (isVisible) {
      console.log('✅ FontSizeSelector is visible in Canvas toolbar');
    } else {
      console.log('❌ FontSizeSelector NOT visible - checking alternative selectors...');

      // Check for buttons directly
      const smallBtn = await canvasPage.locator('button:has-text("A⁻")').first();
      const mediumBtn = await canvasPage.locator('button:has-text("A"):not(:has-text("⁻")):not(:has-text("⁺"))').first();
      const largeBtn = await canvasPage.locator('button:has-text("A⁺")').first();

      const smallVisible = await smallBtn.isVisible({ timeout: 1000 }).catch(() => false);
      const mediumVisible = await mediumBtn.isVisible({ timeout: 1000 }).catch(() => false);
      const largeVisible = await largeBtn.isVisible({ timeout: 1000 }).catch(() => false);

      console.log(`  Small button (A⁻): ${smallVisible ? '✅' : '❌'}`);
      console.log(`  Medium button (A): ${mediumVisible ? '✅' : '❌'}`);
      console.log(`  Large button (A⁺): ${largeVisible ? '✅' : '❌'}`);
    }
  } catch (error) {
    console.log('❌ Error finding FontSizeSelector:', error.message);
  }
  console.log();

  // Test 3: Create a test card
  console.log('Test 3: Creating test card for font size verification...');
  await canvasPage.evaluate(() => {
    const testCard = {
      id: 'test-font-size-' + Date.now(),
      content: '<h1>Heading 1</h1><h2>Heading 2</h2><p>This is test content for font size verification.</p>',
      metadata: {
        url: 'http://test.com',
        title: 'Font Size Test Card',
        domain: 'test.com',
        favicon: '',
        createdAt: Date.now()
      },
      starred: false,
      tags: ['test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cardType: 'note'
    };

    return new Promise((resolve) => {
      chrome.storage.local.get('cards', (result) => {
        const cards = result.cards || [];
        cards.push(testCard);
        chrome.storage.local.set({ cards }, () => {
          window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
          resolve();
        });
      });
    });
  });

  await canvasPage.waitForTimeout(2000); // Wait for card to render
  console.log('✅ Test card created\n');

  // Test 4: Check font sizes
  console.log('Test 4: Verifying font size changes...');

  // Get initial font size
  const cardTitle = await canvasPage.locator('.react-flow__node').first().locator('text="Font Size Test Card"');
  const initialSize = await cardTitle.evaluate(el => window.getComputedStyle(el).fontSize);
  console.log(`Initial title font size: ${initialSize}`);

  // Try to click large button
  try {
    const largeBtn = await canvasPage.locator('button:has-text("A⁺")').first();
    if (await largeBtn.isVisible()) {
      await largeBtn.click();
      await canvasPage.waitForTimeout(1000);

      const newSize = await cardTitle.evaluate(el => window.getComputedStyle(el).fontSize);
      console.log(`After clicking Large: ${newSize}`);

      if (newSize !== initialSize) {
        console.log('✅ Font size changed successfully!');
      } else {
        console.log('⚠️ Font size did not change');
      }
    } else {
      console.log('⚠️ Large button not found');
    }
  } catch (error) {
    console.log('❌ Error changing font size:', error.message);
  }
  console.log();

  // Test 5: Check Side Panel
  console.log('Test 5: Checking Side Panel font size selector...');
  const sidePanelPage = await context.newPage();
  await sidePanelPage.goto(`chrome-extension://${extensionId}/src/sidepanel/index.html`);
  await sidePanelPage.waitForLoadState('domcontentloaded');

  try {
    const sidePanelSelector = await sidePanelPage.locator('[data-testid="font-size-selector"]');
    const isVisible = await sidePanelSelector.isVisible({ timeout: 5000 });

    if (isVisible) {
      console.log('✅ FontSizeSelector is visible in Side Panel');
    } else {
      console.log('❌ FontSizeSelector NOT visible in Side Panel');
    }
  } catch (error) {
    console.log('❌ Error in Side Panel:', error.message);
  }

  console.log('\n📊 Test Summary:');
  console.log('- Extension loads: ✅');
  console.log('- Canvas opens: ✅');
  console.log('- Font size controls present: Check above results');
  console.log('- Feature functionality: Check above results');

  console.log('\n⏸️  Browser will remain open for manual inspection.');
  console.log('Press Ctrl+C to exit...');

  // Keep browser open for manual inspection
  await new Promise(() => {});
}

testFontSizeControls().catch(console.error);