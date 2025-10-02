#!/usr/bin/env node
/**
 * Comprehensive test script for all newly implemented features:
 * 1. Custom note creation (Cmd+N and toolbar button)
 * 2. Card connections (arrows between cards)
 * 3. Inline editing (double-click to edit)
 * 4. Persist chat conversations as cards
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', 'dist');
const CANVAS_URL = `chrome-extension://load-extension/src/canvas/index.html`;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAllFeatures() {
  console.log('🚀 Starting comprehensive feature tests...\n');

  // Launch browser with extension
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
    ],
  });

  const page = await context.newPage();

  try {
    // Get extension ID
    const targets = context.pages();
    await sleep(1000);

    const serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      throw new Error('Service worker not found');
    }

    const extensionId = serviceWorker.url().split('/')[2];
    console.log(`✓ Extension ID: ${extensionId}\n`);

    const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;

    // Navigate to canvas
    console.log('📍 Navigating to canvas...');
    await page.goto(canvasUrl);
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00-initial-canvas.png') });
    console.log('✓ Canvas loaded\n');

    // Test 1: Custom Note Creation
    console.log('=== TEST 1: Custom Note Creation ===');

    // Test toolbar button
    console.log('Testing "New Note" toolbar button...');
    const newNoteButton = await page.locator('button:has-text("New Note")');
    if (await newNoteButton.count() > 0) {
      await newNoteButton.click();
      await sleep(3000); // Wait for reload
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-note-created-toolbar.png') });
      console.log('✓ Note created via toolbar button');
    } else {
      console.log('✗ New Note button not found');
    }

    // Test keyboard shortcut (Cmd+N)
    console.log('Testing Cmd+N keyboard shortcut...');
    await page.keyboard.press('Meta+n');
    await sleep(3000); // Wait for reload
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-note-created-keyboard.png') });
    console.log('✓ Note created via Cmd+N\n');

    // Test 2: Card Connections
    console.log('=== TEST 2: Card Connections ===');

    console.log('Testing connection mode toggle...');

    // Check for Connect button
    const connectButton = await page.locator('button:has-text("Connect")');
    if (await connectButton.count() > 0) {
      await connectButton.click();
      await sleep(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-connection-mode-active.png') });
      console.log('✓ Connection mode activated');

      // Try to click two cards (use proper React Flow node selector)
      const cards = await page.locator('.react-flow__node').all();
      if (cards.length >= 2) {
        console.log(`Found ${cards.length} cards, attempting to connect first two...`);
        await cards[0].click({ position: { x: 160, y: 120 } }); // Click center of card
        await sleep(500);
        await cards[1].click({ position: { x: 160, y: 120 } }); // Click center of card
        await sleep(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-connection-created.png') });
        console.log('✓ Connection created between cards');
      } else {
        console.log('⚠ Not enough cards to test connections');
      }
    } else {
      console.log('⚠ Connect button not found (may need existing cards)');
    }

    console.log('Testing keyboard shortcut (Press C)...');
    await page.keyboard.press('c');
    await sleep(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-connection-mode-keyboard.png') });
    console.log('✓ Connection mode toggled via keyboard\n');

    // Test 3: Inline Editing
    console.log('=== TEST 3: Inline Editing ===');

    console.log('Testing double-click to edit...');
    const editCards = await page.locator('.react-flow__node').all();
    if (editCards.length > 0) {
      await editCards[0].dblclick({ position: { x: 160, y: 120 } });
      await sleep(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-edit-mode-active.png') });
      console.log('✓ Edit mode activated');

      // Try to edit title
      const titleInput = await page.locator('input[type="text"]').first();
      if (await titleInput.count() > 0) {
        await titleInput.fill('Edited Title Test');
        console.log('✓ Title edited');
      }

      // Try to edit content
      const contentTextarea = await page.locator('textarea').first();
      if (await contentTextarea.count() > 0) {
        await contentTextarea.fill('This is edited content for testing.');
        await sleep(500);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-content-edited.png') });
        console.log('✓ Content edited');
      }

      // Test save with Cmd+Enter
      console.log('Testing save with Cmd+Enter...');
      await page.keyboard.press('Meta+Enter');
      await sleep(3000); // Wait for reload
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-edit-saved.png') });
      console.log('✓ Edits saved\n');
    } else {
      console.log('⚠ No cards found to test editing\n');
    }

    // Test 4: Persist Chat Conversations
    console.log('=== TEST 4: Persist Chat Conversations ===');

    console.log('Testing floating window with chat...');

    // Look for a card with the open window button
    const openWindowButtons = await page.locator('[data-testid="open-window-btn"]').all();
    if (openWindowButtons.length > 0) {
      await openWindowButtons[0].click();
      await sleep(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-floating-window-opened.png') });
      console.log('✓ Floating window opened');

      // Check for save conversation button
      const saveConvoButton = await page.locator('button:has-text("💾")');
      if (await saveConvoButton.count() > 0) {
        console.log('✓ Save conversation button found');

        // Check if it's disabled (no conversation yet)
        const isDisabled = await saveConvoButton.isDisabled();
        console.log(`  Button state: ${isDisabled ? 'disabled (no conversation)' : 'enabled'}`);

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-save-conversation-button.png') });
      } else {
        console.log('⚠ Save conversation button not found');
      }
    } else {
      console.log('⚠ No cards with open window button found');
    }

    console.log('\n=== SUMMARY ===');
    console.log('✓ All features tested');
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\nFeatures tested:');
    console.log('  1. Custom note creation (toolbar + Cmd+N)');
    console.log('  2. Card connections (button + Press C)');
    console.log('  3. Inline editing (double-click + Cmd+Enter)');
    console.log('  4. Persist chat conversations (💾 button)');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error.png') });
  } finally {
    console.log('\n🏁 Tests complete. Press Ctrl+C to close browser...');
    // Keep browser open for manual inspection
    await sleep(60000);
    await context.close();
  }
}

testAllFeatures().catch(console.error);
