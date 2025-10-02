#!/usr/bin/env node

/**
 * Debug script for inline chat feature
 * Includes detailed console logging and error reporting
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', 'dist');
const TEST_URL = 'https://example.com';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDebug() {
  console.log('🔍 Debug Inline Chat Feature\n');
  console.log('='.repeat(60));

  let context = null;

  try {
    // Launch browser with extension
    console.log('\n📦 Loading extension from:', EXTENSION_PATH);
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
      ],
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // Listen to console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      // Only show messages related to our extension
      if (text.includes('[content]') || text.includes('[background]') || text.includes('[InlineChatWindow]') || text.includes('[pageContextCapture]')) {
        const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📝';
        console.log(`${emoji} [${type}] ${text}`);
      }
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.error('❌ Page error:', error.message);
    });

    console.log('✅ Browser launched with extension loaded');

    // Navigate to test URL
    console.log(`\n🌐 Navigating to: ${TEST_URL}`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    await sleep(2000);
    console.log('✅ Page loaded\n');

    // Check if content script injected
    console.log('📝 Checking content script injection...');
    const scriptCheck = await page.evaluate(() => {
      return {
        hasNabokovContainer: !!document.getElementById('nabokov-clipper-root'),
        hasChatContainer: !!document.getElementById('nabokov-inline-chat-root'),
      };
    });
    console.log('   Container check:', scriptCheck);

    // Try to trigger inline chat
    console.log('\n📝 Attempting to open inline chat with Ctrl+Shift+C...');
    await page.keyboard.press('Control+Shift+C');

    console.log('⏳ Waiting 3 seconds for response...\n');
    await sleep(3000);

    // Check state after keyboard press
    const stateAfterKey = await page.evaluate(() => {
      return {
        chatRoot: !!document.getElementById('nabokov-inline-chat-root'),
        clipperRoot: !!document.getElementById('nabokov-clipper-root'),
        allDivs: document.querySelectorAll('[id*="nabokov"]').length,
      };
    });
    console.log('📊 DOM state after keyboard press:', stateAfterKey);

    // Check shadow roots
    const shadowInfo = await page.evaluate(() => {
      const chatRoot = document.getElementById('nabokov-inline-chat-root');
      if (!chatRoot) return { error: 'No chat root' };

      return {
        hasShadowRoot: !!chatRoot.shadowRoot,
        childElementCount: chatRoot.childElementCount,
        innerHTML: chatRoot.innerHTML.substring(0, 100),
      };
    });
    console.log('📊 Shadow root info:', shadowInfo);

    // Try manual message sending
    console.log('\n📝 Trying to manually send message to content script...');
    const manualTrigger = await page.evaluate(async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'OPEN_INLINE_CHAT'
        });
        return { success: true, response };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    console.log('   Manual trigger result:', manualTrigger);

    await sleep(3000);

    // Check state again
    const finalState = await page.evaluate(() => {
      return {
        chatRoot: !!document.getElementById('nabokov-inline-chat-root'),
        clipperRoot: !!document.getElementById('nabokov-clipper-root'),
      };
    });
    console.log('📊 Final DOM state:', finalState);

    // Check if we can access the functions
    console.log('\n📝 Checking if functions exist in content script...');
    const functionsExist = await page.evaluate(() => {
      return {
        hasDev: typeof window.__nabokovClipper__ !== 'undefined',
        devFunctions: window.__nabokovClipper__ ? Object.keys(window.__nabokovClipper__) : [],
      };
    });
    console.log('   Functions available:', functionsExist);

    console.log('\n⏸️  Browser will stay open for 60 seconds for manual inspection...');
    console.log('   Try manually pressing Ctrl+Shift+C and check the console');
    await sleep(60000);

  } catch (error) {
    console.error('\n❌ Debug failed with error:', error);
    console.error(error.stack);
  } finally {
    if (context) {
      console.log('\n🔒 Closing browser...');
      await context.close();
    }
  }
}

// Run debug
runDebug().catch(console.error);
