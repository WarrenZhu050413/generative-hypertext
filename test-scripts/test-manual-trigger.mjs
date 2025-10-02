#!/usr/bin/env node

/**
 * Test by manually triggering the function instead of keyboard shortcut
 * This will help us determine if the issue is the keyboard binding or the functionality
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

async function testManualTrigger() {
  console.log('🧪 Testing Inline Chat - Manual Trigger\n');
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

    // Listen to all console messages
    page.on('console', msg => {
      console.log(`   [${msg.type()}] ${msg.text()}`);
    });

    console.log('✅ Extension loaded\n');

    console.log(`🌐 Navigating to: ${TEST_URL}`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    await sleep(3000);
    console.log('✅ Page loaded\n');

    console.log('🔧 Manually triggering inline chat via message...');

    // Get extension ID first
    const serviceWorker = context.serviceWorkers()[0];
    let extensionId = null;
    if (serviceWorker) {
      const swUrl = serviceWorker.url();
      extensionId = swUrl.split('/')[2];
      console.log(`   Extension ID: ${extensionId}`);
    }

    // Try to manually dispatch the event to content script
    const result = await page.evaluate(async () => {
      // Simulate the message that background worker would send
      window.dispatchEvent(new CustomEvent('message', {
        detail: { type: 'OPEN_INLINE_CHAT' }
      }));

      // Also try to call the function directly if it exists in dev mode
      if (window.__nabokovClipper__) {
        return { method: 'direct', success: true };
      }

      return { method: 'event', success: true };
    });

    console.log('   Trigger result:', result);
    await sleep(2000);

    // Check if chat appeared
    let chatVisible = await page.evaluate(() => {
      const chatRoot = document.getElementById('nabokov-inline-chat-root');
      return {
        rootExists: !!chatRoot,
        hasShadowRoot: chatRoot ? !!chatRoot.shadowRoot : false,
      };
    });

    console.log('\n📊 Status after manual trigger:', chatVisible);

    if (!chatVisible.rootExists) {
      console.log('\n❌ Manual trigger did not work either.');
      console.log('   This suggests the core functionality has an issue, not just the keyboard binding.');

      // Let's check if the content script is even loaded
      const scriptCheck = await page.evaluate(() => {
        return {
          hasWindow: typeof window !== 'undefined',
          hasDocument: typeof document !== 'undefined',
          bodyChildren: document.body.children.length,
          scripts: Array.from(document.querySelectorAll('script')).length,
        };
      });

      console.log('\n🔍 Page state:', scriptCheck);

      // Try to trigger via chrome.runtime.sendMessage
      console.log('\n🔧 Trying via chrome.runtime.sendMessage...');
      try {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
              chrome.runtime.sendMessage(
                { type: 'OPEN_INLINE_CHAT' },
                (response) => {
                  resolve(response);
                }
              );
            } else {
              resolve({ error: 'chrome.runtime not available' });
            }
          });
        });

        await sleep(2000);

        chatVisible = await page.evaluate(() => {
          const chatRoot = document.getElementById('nabokov-inline-chat-root');
          return {
            rootExists: !!chatRoot,
            hasShadowRoot: chatRoot ? !!chatRoot.shadowRoot : false,
          };
        });

        console.log('   Status after runtime.sendMessage:', chatVisible);

      } catch (err) {
        console.log('   Error:', err.message);
      }
    }

    console.log('\n⏸️  Browser will stay open for 60 seconds...');
    console.log('   Check the page and console for any errors');
    await sleep(60000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    if (context) {
      console.log('\n🔒 Closing browser...');
      await context.close();
    }
  }
}

testManualTrigger().catch(console.error);
