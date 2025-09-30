import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  console.log('🧪 Testing Canvas Load\n');
  
  const ext = path.join(__dirname, 'dist');
  const ctx = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      '--disable-extensions-except=' + ext,
      '--load-extension=' + ext
    ]
  });

  const page = await ctx.newPage();
  await page.goto('https://example.com');
  await page.waitForTimeout(2000);

  console.log('📋 Step 1: Capture an element');
  page.on('console', m => {
    const t = m.text();
    if (t.includes('[') && !t.includes('playwright')) {
      console.log('  ' + t);
    }
  });

  await page.keyboard.press('Meta+Shift+KeyE');
  await page.waitForTimeout(1000);
  await page.click('h1');
  await page.waitForTimeout(3000);

  console.log('\n📋 Step 2: Open Canvas page');
  
  // Get extension ID
  const bg = await ctx.backgroundPages();
  const extId = bg[0]?.url().match(/chrome-extension:\/\/([a-z]+)\//)?.[1];
  console.log('  Extension ID:', extId);
  
  if (!extId) {
    console.log('  ❌ Could not find extension ID');
    await ctx.close();
    return;
  }

  const canvasPage = await ctx.newPage();
  const canvasUrl = 'chrome-extension://' + extId + '/src/canvas/index.html';
  console.log('  Opening:', canvasUrl);
  
  canvasPage.on('console', m => {
    const t = m.text();
    console.log('  [Canvas] ' + t);
  });

  await canvasPage.goto(canvasUrl);
  await canvasPage.waitForTimeout(5000);

  console.log('\n✅ Canvas loaded - check browser window!');
  console.log('⏸️  Keeping browser open for 30 seconds...\n');
  await page.waitForTimeout(30000);
  await ctx.close();
}

test().catch(console.error);
