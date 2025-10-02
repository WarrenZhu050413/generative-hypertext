import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  console.log('Testing extension...\n');
  const ext = path.join(__dirname, 'dist');
  const ctx = await chromium.launchPersistentContext('', {
    headless: false,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`]
  });

  const page = await ctx.newPage();
  await page.goto('https://example.com');
  await page.waitForTimeout(2000);

  console.log('Test 1: Background script');
  const bg = await ctx.backgroundPages();
  console.log(`  Background pages: ${bg.length} ${bg.length > 0 ? '✅' : '❌'}`);

  console.log('\nTest 2: Content script');
  const cs = await page.evaluate(() => !!window.__nabokobClipper__);
  console.log(`  Content script: ${cs ? '✅' : '❌'}`);

  console.log('\nTest 3: Keyboard shortcut');
  page.on('console', m => console.log(`  [Page] ${m.text()}`));
  await page.keyboard.down('Meta');
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyE');
  await page.keyboard.up('Shift');
  await page.keyboard.up('Meta');
  await page.waitForTimeout(3000);

  console.log('\nTest 4: ElementSelector in DOM');
  const sel = await page.evaluate(() => !!document.querySelector('[data-nabokov-container]'));
  console.log(`  Selector found: ${sel ? '✅' : '❌'}`);

  console.log('\nBrowser open for 60s...');
  await page.waitForTimeout(60000);
  await ctx.close();
}

test().catch(console.error);
