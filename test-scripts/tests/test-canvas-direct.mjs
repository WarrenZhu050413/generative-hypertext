import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  console.log('🧪 Testing Canvas Page Directly\n');

  const ext = path.join(__dirname, '..', 'dist');
  const ctx = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      '--disable-extensions-except=' + ext,
      '--load-extension=' + ext
    ]
  });

  // First, capture an element to ensure we have data
  const page = await ctx.newPage();
  await page.goto('https://example.com');
  await page.waitForTimeout(1000);

  console.log('📋 Step 1: Capture a test element');
  await page.keyboard.press('Meta+Shift+KeyE');
  await page.waitForTimeout(500);
  await page.click('h1');
  await page.waitForTimeout(2000);
  console.log('  ✅ Element captured\n');

  // Get extension ID from service worker
  await page.waitForTimeout(2000);
  const serviceWorkers = ctx.serviceWorkers();
  const bgPages = ctx.backgroundPages();

  console.log('  Service workers:', serviceWorkers.length);
  console.log('  Background pages:', bgPages.length);

  let extId = null;

  // Try service worker first (Manifest V3)
  if (serviceWorkers.length > 0) {
    extId = serviceWorkers[0].url().match(/chrome-extension:\/\/([a-z]+)\//)?.[1];
  }

  // Fallback to background page
  if (!extId && bgPages.length > 0) {
    extId = bgPages[0].url().match(/chrome-extension:\/\/([a-z]+)\//)?.[1];
  }

  // Fallback: Get from any page context
  if (!extId) {
    try {
      extId = await page.evaluate(() => chrome.runtime.id);
    } catch (e) {
      console.log('  Could not get extension ID from chrome.runtime.id');
    }
  }

  if (!extId) {
    console.log('❌ Could not find extension ID');
    await ctx.close();
    return;
  }

  console.log('📋 Step 2: Opening Canvas page');
  console.log('  Extension ID:', extId);

  const canvasPage = await ctx.newPage();
  const canvasUrl = `chrome-extension://${extId}/src/canvas/index.html`;

  // Capture all console messages
  const consoleMessages = [];
  canvasPage.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log('  [Console]', text);
  });

  // Capture page errors
  canvasPage.on('pageerror', error => {
    console.error('  [Page Error]', error.message);
  });

  try {
    await canvasPage.goto(canvasUrl, { waitUntil: 'networkidle' });
    await canvasPage.waitForTimeout(3000);

    console.log('\n📋 Step 3: Checking Canvas DOM');

    // Check if React root is mounted
    const rootContent = await canvasPage.evaluate(() => {
      const root = document.getElementById('root');
      return {
        exists: !!root,
        hasChildren: root?.children.length > 0,
        innerHTML: root?.innerHTML.substring(0, 200)
      };
    });

    console.log('  Root element:', rootContent.exists ? '✅' : '❌');
    console.log('  Has content:', rootContent.hasChildren ? '✅' : '❌');
    if (rootContent.innerHTML) {
      console.log('  Preview:', rootContent.innerHTML);
    }

    // Check for React Flow canvas
    const reactFlowExists = await canvasPage.evaluate(() => {
      return !!document.querySelector('.react-flow');
    });
    console.log('  React Flow canvas:', reactFlowExists ? '✅' : '❌');

    // Check for card nodes
    const nodeCount = await canvasPage.evaluate(() => {
      return document.querySelectorAll('[data-id]').length;
    });
    console.log('  Card nodes rendered:', nodeCount);

    // Take a screenshot for debugging
    await canvasPage.screenshot({ path: 'canvas-debug.png', fullPage: true });
    console.log('\n📸 Screenshot saved to canvas-debug.png');

    console.log('\n✅ Test complete!');
    console.log('⏸️  Keeping browser open for 30 seconds...\n');
    await canvasPage.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
  } finally {
    await ctx.close();
  }
}

test().catch(console.error);