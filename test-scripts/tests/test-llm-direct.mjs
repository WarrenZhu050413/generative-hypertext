#!/usr/bin/env node

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', 'dist');

async function testLLMHyperlinksDirect() {
  console.log('\n🧪 LLM Hyperlinks Direct Test\n');

  let context;
  let page;

  try {
    // Launch browser with extension
    console.log('🚀 Launching browser with extension...');
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
      viewport: { width: 1280, height: 720 }
    });

    // Get extension ID
    await context.waitForEvent('serviceworker');
    const serviceWorker = context.serviceWorkers()[0];
    const serviceWorkerUrl = serviceWorker.url();
    const extensionId = serviceWorkerUrl.split('/')[2];
    console.log(`✅ Extension ID: ${extensionId}`);

    // Navigate to canvas
    const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;
    page = await context.newPage();

    // Add console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Canvas]') || text.includes('[LLMHyperlinks]') || text.includes('Error')) {
        console.log(`  Console: ${text}`);
      }
    });

    page.on('pageerror', err => {
      console.error(`  Page Error: ${err.message}`);
    });

    console.log(`\n📄 Opening canvas: ${canvasUrl}`);
    await page.goto(canvasUrl, { waitUntil: 'networkidle' });

    // Wait a bit for React to initialize
    await page.waitForTimeout(2000);

    // Check if React Flow is present
    console.log('\n🔍 Checking page structure...');

    const rootDiv = await page.$('#root');
    console.log(`  Root div: ${rootDiv ? '✅ Found' : '❌ Not found'}`);

    const reactFlowViewport = await page.$('.react-flow__viewport');
    const reactFlow = await page.$('.react-flow');
    console.log(`  React Flow: ${reactFlow ? '✅ Found' : '❌ Not found'}`);
    console.log(`  React Flow Viewport: ${reactFlowViewport ? '✅ Found' : '❌ Not found'}`);

    // Check for any cards
    const cards = await page.$$('.react-flow__node');
    console.log(`  Cards on canvas: ${cards.length}`);

    // Try creating a card with Cmd+N
    console.log('\n📝 Attempting to create a test card...');
    await page.keyboard.press('Meta+n');
    await page.waitForTimeout(1000);

    // Check for inline editor
    const editor = await page.$('[contenteditable="true"]');
    if (editor) {
      console.log('  ✅ Inline editor opened');

      // Type test content
      await editor.type('Test card for LLM hyperlinks feature. Select this text and press Cmd+L.');

      // Save with Cmd+Enter
      await page.keyboard.press('Meta+Enter');
      await page.waitForTimeout(1000);
      console.log('  ✅ Card content saved');

      // Now test the selection and Cmd+L
      console.log('\n🖱️ Testing text selection and Cmd+L...');

      // Find the card we just created
      const newCard = await page.$('.react-flow__node:last-child');
      if (newCard) {
        // Check for data-card-id
        const cardId = await newCard.getAttribute('data-card-id');
        console.log(`  Card ID: ${cardId ? cardId : 'Not found'}`);

        // Try to select text in the card
        const cardContent = await newCard.$('div[contenteditable], div.card-content, div');
        if (cardContent) {
          // Triple-click to select all
          await cardContent.click({ clickCount: 3 });
          await page.waitForTimeout(500);

          // Check selection
          const selectedText = await page.evaluate(() => window.getSelection().toString());
          console.log(`  Selected text: "${selectedText ? selectedText.substring(0, 30) + '...' : 'None'}"`)

          // Press Cmd+L
          console.log('\n⌨️ Pressing Cmd+L...');
          await page.keyboard.press('Meta+l');
          await page.waitForTimeout(1500);

          // Check for modal
          const modal = await page.$('[role="dialog"], .modal, [class*="Modal"], [class*="modal"]');
          const overlay = await page.$('[class*="overlay"], [class*="Overlay"], .overlay');

          if (modal || overlay) {
            console.log('  ✅ Modal opened!');

            // Check modal contents
            const modalTitle = await page.$('h2, h3, [class*="title"]');
            if (modalTitle) {
              const title = await modalTitle.textContent();
              console.log(`  Modal title: "${title}"`);
            }

            // Check for type buttons
            const typeButtons = await page.$$('button[class*="type"], button[data-type]');
            console.log(`  Type buttons found: ${typeButtons.length}`);

            // Close modal
            await page.keyboard.press('Escape');
            console.log('  ✅ Modal closed with Escape');
          } else {
            console.log('  ❌ Modal did not open');

            // Take a screenshot for debugging
            await page.screenshot({ path: 'test-llm-debug.png' });
            console.log('  📸 Screenshot saved as test-llm-debug.png');
          }
        }
      }
    } else {
      console.log('  ❌ Could not create card - inline editor not found');
    }

    // Final check: Look for LLM-related components in the DOM
    console.log('\n🔍 Checking for LLM components in DOM...');

    const hasUseLLMHyperlinks = await page.evaluate(() => {
      // Check if any React components have LLM-related props
      const reactNodes = document.querySelectorAll('[data-card-id]');
      return reactNodes.length > 0;
    });
    console.log(`  Cards with data-card-id: ${hasUseLLMHyperlinks ? '✅ Yes' : '❌ No'}`);

    // Check page source for LLM-related code
    const pageContent = await page.content();
    const hasLLMCode = pageContent.includes('LLMHyperlinks') ||
                       pageContent.includes('GenerateChildModal') ||
                       pageContent.includes('childCardGenerator');
    console.log(`  LLM code in bundle: ${hasLLMCode ? '✅ Present' : '❌ Not found'}`);

    console.log('\n✨ Test complete - check results above');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n📌 Browser will stay open for manual inspection.');
    console.log('   Press Ctrl+C to close.\n');

    // Wait indefinitely
    await new Promise(() => {});
  }
}

// Run test
testLLMHyperlinksDirect().catch(console.error);