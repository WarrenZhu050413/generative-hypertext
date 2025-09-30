import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  console.log('🧪 Testing Element Capture\n');
  
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

  console.log('📋 Step 1: Trigger selector');
  page.on('console', m => {
    const t = m.text();
    if (t.includes('[content]') || t.includes('[ElementSelector]') || t.includes('[storage]')) {
      console.log('  ' + t);
    }
  });

  await page.keyboard.press('Meta+Shift+KeyE');
  await page.waitForTimeout(2000);

  console.log('\n📋 Step 2: Click on element');
  await page.click('h1');
  await page.waitForTimeout(5000);

  console.log('\n📋 Step 3: Check storage');
  const result = await page.evaluate(async () => {
    const data = await chrome.storage.local.get(['cards']);
    return {
      count: data.cards?.length || 0,
      cards: data.cards || []
    };
  });

  console.log('  Cards in storage:', result.count);
  if (result.count > 0) {
    console.log('  ✅ Card saved successfully!');
    console.log('  Sample:', JSON.stringify(result.cards[0], null, 2).substring(0, 200));
  } else {
    console.log('  ❌ No cards found');
  }

  console.log('\n✅ Test complete!');
  await page.waitForTimeout(5000);
  await ctx.close();
}

test().catch(console.error);
