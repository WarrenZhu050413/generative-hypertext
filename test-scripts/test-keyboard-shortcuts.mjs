/**
 * Test Keyboard Shortcuts and Mode Indicators
 *
 * Simpler test focusing on visual elements that can be detected
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, '..', 'dist');

async function test() {
  console.log('🧪 Testing Keyboard Shortcuts and Mode Indicators\n');

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
    console.log('📍 Step 1: Navigate to test page');
    await page.goto('https://example.com');
    await page.waitForTimeout(1500);
    console.log('✅ Loaded example.com\n');

    console.log('📍 Step 2: Test Cmd+E (Canvas Mode)');
    console.log('   Pressing Cmd+E...');
    await page.keyboard.press('Meta+E');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results-canvas-mode.png', fullPage: true });
    console.log('   📸 Screenshot saved: test-results-canvas-mode.png');

    // Look for any text containing "CANVAS" or "MODE"
    const pageText = await page.textContent('body');
    const hasCanvasText = pageText.includes('CANVAS MODE') || pageText.includes('Canvas');
    console.log(`   ${hasCanvasText ? '✅' : '❌'} Canvas mode text found: ${hasCanvasText}`);

    // Check for shadow DOM containers
    const shadowContainers = await page.$$('[data-nabokov-container]');
    console.log(`   Found ${shadowContainers.length} Nabokov containers`);

    console.log('\n📍 Step 3: Close and test Cmd+Shift+E (Stash Mode)');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('   Pressing Cmd+Shift+E...');
    await page.keyboard.press('Meta+Shift+E');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results-stash-mode.png', fullPage: true });
    console.log('   📸 Screenshot saved: test-results-stash-mode.png');

    const pageTextStash = await page.textContent('body');
    const hasStashText = pageTextStash.includes('STASH MODE') || pageTextStash.includes('Stash');
    console.log(`   ${hasStashText ? '✅' : '❌'} Stash mode text found: ${hasStashText}`);

    console.log('\n📍 Step 4: Test Ctrl+Shift+C (Inline Chat)');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('   Pressing Ctrl+Shift+C...');
    await page.keyboard.press('Control+Shift+C');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results-inline-chat.png', fullPage: true });
    console.log('   📸 Screenshot saved: test-results-inline-chat.png');

    const chatContainers = await page.$$('[data-nabokov-chat]');
    console.log(`   ${chatContainers.length > 0 ? '✅' : '❌'} Found ${chatContainers.length} chat containers`);

    console.log('\n📍 Step 5: Open Canvas and Side Panel');

    // Get extension ID
    const backgroundTargets = context.backgroundPages();
    const backgroundPage = backgroundTargets[0];
    const extensionId = backgroundPage.url().split('/')[2];
    console.log(`   Extension ID: ${extensionId}`);

    // Open canvas
    const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;
    console.log(`   Opening Canvas: ${canvasUrl}`);
    const canvasPage = await context.newPage();
    await canvasPage.goto(canvasUrl);
    await canvasPage.waitForTimeout(2000);

    await canvasPage.screenshot({ path: 'test-results-canvas.png', fullPage: true });
    console.log('   📸 Canvas screenshot: test-results-canvas.png');

    // Check for side panel button
    const sidePanelButtons = await canvasPage.$$('[title*="Stash"], button:has-text("Stashed")');
    console.log(`   ${sidePanelButtons.length > 0 ? '✅' : '❌'} Found ${sidePanelButtons.length} side panel button(s)`);

    // Open side panel
    const sidePanelUrl = `chrome-extension://${extensionId}/src/sidepanel/index.html`;
    console.log(`   Opening Side Panel: ${sidePanelUrl}`);
    const sidePanelPage = await context.newPage();
    await sidePanelPage.goto(sidePanelUrl);
    await sidePanelPage.waitForTimeout(2000);

    await sidePanelPage.screenshot({ path: 'test-results-sidepanel.png', fullPage: true });
    console.log('   📸 Side Panel screenshot: test-results-sidepanel.png');

    // Check for upload button
    const uploadButtons = await sidePanelPage.$$('button:has-text("Upload")');
    console.log(`   ${uploadButtons.length > 0 ? '✅' : '❌'} Found ${uploadButtons.length} upload button(s)`);

    // Check for file input
    const fileInputs = await sidePanelPage.$$('input[type="file"]');
    console.log(`   ${fileInputs.length > 0 ? '✅' : '❌'} Found ${fileInputs.length} file input(s)`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Complete!');
    console.log('');
    console.log('📸 Screenshots saved:');
    console.log('   - test-results-canvas-mode.png');
    console.log('   - test-results-stash-mode.png');
    console.log('   - test-results-inline-chat.png');
    console.log('   - test-results-canvas.png');
    console.log('   - test-results-sidepanel.png');
    console.log('');
    console.log('👀 Please review screenshots manually to verify:');
    console.log('   1. Mode indicators appear at top of page');
    console.log('   2. Canvas mode shows red/gold gradient');
    console.log('   3. Stash mode shows blue gradient');
    console.log('   4. Inline chat window appears');
    console.log('   5. Side panel has upload button');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('\nKeeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await context.close();
  }
}

test();
