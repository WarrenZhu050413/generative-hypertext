/**
 * Simple manual test - Opens browser with extension loaded
 * You can manually test the keyboard shortcuts
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runManualTest() {
  console.log('🧪 Starting manual test...');
  console.log('');
  console.log('✨ KEYBOARD SHORTCUTS TO TEST:');
  console.log('  • Alt+E              → Canvas mode (cards go to canvas)');
  console.log('  • Alt+Shift+E        → Stash mode (cards go to side panel)');
  console.log('  • Alt+Shift+C        → Inline chat');
  console.log('');

  const extensionPath = path.join(__dirname, '..', 'dist');
  console.log('📦 Extension path:', extensionPath);

  // Launch browser with extension
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--auto-open-devtools-for-tabs' // Open DevTools automatically
    ],
  });

  console.log('🌐 Browser launched with extension and DevTools');

  // Wait for service worker
  let background = context.serviceWorkers()[0];
  if (!background) {
    console.log('⏳ Waiting for service worker...');
    background = await context.waitForEvent('serviceworker');
  }

  const extensionId = background.url().split('/')[2];
  console.log('✅ Extension ID:', extensionId);

  // Create test page
  const page = await context.newPage();
  await page.goto('https://example.com');
  console.log('\n📄 Test page loaded: https://example.com');
  console.log('\n⏳ Browser will stay open for manual testing...');
  console.log('🔍 Check the Console tab in DevTools for logs');
  console.log('\n📝 Test procedure:');
  console.log('  1. Press Alt+E → Should see "🎨 CANVAS MODE" banner');
  console.log('  2. Click any element → Check console for "stashed: false"');
  console.log('  3. Press Alt+Shift+E → Should see "📥 STASH MODE" banner');
  console.log('  4. Click any element → Check console for "stashed: true"');
  console.log('  5. Press Alt+Shift+C → Should open inline chat');
  console.log('');
  console.log('Press Ctrl+C to exit when done');

  // Keep browser open indefinitely
  await new Promise(() => {});
}

runManualTest().catch(console.error);
