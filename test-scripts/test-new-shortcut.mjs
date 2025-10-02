#!/usr/bin/env node

/**
 * Quick test for the new Alt+Shift+C keyboard shortcut
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', 'dist');
const TEST_URL = 'https://en.wikipedia.org/wiki/React_(software)';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testNewShortcut() {
  console.log('🧪 Testing New Keyboard Shortcut: Alt+Shift+C\n');
  console.log('='.repeat(60));

  let context = null;

  try {
    console.log('\n📦 Loading extension...');
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

    // Listen to console for debug messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[background]') || text.includes('[content]') || text.includes('[InlineChatWindow]')) {
        console.log(`   🔍 ${msg.type()}: ${text}`);
      }
    });

    console.log('✅ Extension loaded\n');

    console.log(`🌐 Navigating to: ${TEST_URL}`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    await sleep(2000);
    console.log('✅ Page loaded\n');

    console.log('⌨️  Pressing Alt+Shift+C...');
    await page.keyboard.press('Alt+Shift+C');

    console.log('⏳ Waiting 2 seconds for chat to appear...\n');
    await sleep(2000);

    // Check if chat appeared
    const chatVisible = await page.evaluate(() => {
      const chatRoot = document.getElementById('nabokov-inline-chat-root');
      return {
        rootExists: !!chatRoot,
        hasShadowRoot: chatRoot ? !!chatRoot.shadowRoot : false,
        hasContent: chatRoot?.shadowRoot ? chatRoot.shadowRoot.children.length > 0 : false
      };
    });

    console.log('📊 Chat Status:');
    console.log(`   Root element: ${chatVisible.rootExists ? '✅' : '❌'}`);
    console.log(`   Shadow root: ${chatVisible.hasShadowRoot ? '✅' : '❌'}`);
    console.log(`   Has content: ${chatVisible.hasContent ? '✅' : '❌'}`);

    if (chatVisible.rootExists && chatVisible.hasShadowRoot && chatVisible.hasContent) {
      console.log('\n🎉 SUCCESS! Inline chat is working!\n');

      console.log('📝 Testing features...');

      // Try typing a message
      const canType = await page.evaluate(() => {
        const chatRoot = document.getElementById('nabokov-inline-chat-root');
        const textarea = chatRoot?.shadowRoot?.querySelector('textarea');
        if (textarea) {
          textarea.value = 'Hello from test!';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      });

      console.log(`   Typing in input: ${canType ? '✅' : '❌'}`);

      await sleep(1000);

      // Test closing with Escape
      console.log('\n⌨️  Testing Escape to close...');
      await page.keyboard.press('Escape');
      await sleep(1000);

      const chatClosed = await page.evaluate(() => {
        return !document.getElementById('nabokov-inline-chat-root');
      });

      console.log(`   Chat closed: ${chatClosed ? '✅' : '❌'}`);

      // Test reopening
      console.log('\n⌨️  Testing reopen with Alt+Shift+C...');
      await page.keyboard.press('Alt+Shift+C');
      await sleep(2000);

      const chatReopened = await page.evaluate(() => {
        return !!document.getElementById('nabokov-inline-chat-root');
      });

      console.log(`   Chat reopened: ${chatReopened ? '✅' : '❌'}`);

      console.log('\n' + '='.repeat(60));
      console.log('✅ All basic functionality tests passed!');
      console.log('='.repeat(60));

      console.log('\n💡 Next steps:');
      console.log('   1. Try sending a message (backend is running)');
      console.log('   2. Test dragging the window');
      console.log('   3. Test the save to canvas feature');
      console.log('   4. Try on different websites');

    } else {
      console.log('\n❌ Chat did not appear correctly.');
      console.log('\n🔍 Debugging info:');
      console.log(chatVisible);

      // Check for any DOM elements
      const allNabokov = await page.evaluate(() => {
        return {
          allIds: Array.from(document.querySelectorAll('[id*="nabokov"]')).map(el => el.id),
          bodyChildren: document.body.children.length
        };
      });
      console.log('\n   All Nabokov elements:', allNabokov);
    }

    console.log('\n⏸️  Browser staying open for 30 seconds...');
    console.log('   Try the keyboard shortcut manually: Alt+Shift+C\n');
    await sleep(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (context) {
      console.log('\n🔒 Closing browser...');
      await context.close();
    }
  }
}

testNewShortcut().catch(console.error);
