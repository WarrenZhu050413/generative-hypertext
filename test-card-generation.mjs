// Quick test of card generation service
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, 'dist');

console.log('🧪 Testing card generation...\n');

const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});

const page = await context.newPage();

// Get extension ID
const serviceWorker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
const extensionId = serviceWorker.url().split('/')[2];
console.log(`✓ Extension ID: ${extensionId}\n`);

// Navigate to example.com and capture element
await page.goto('https://example.com');
await page.waitForLoadState('networkidle');

await page.keyboard.press('Meta+Shift+E');
await page.waitForTimeout(500);
await page.click('h1');
await page.waitForTimeout(2000);

// Open canvas
const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;
await page.goto(canvasUrl);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

console.log('📊 Initial state:');
const initialCount = await page.locator('[data-testid="open-window-btn"]').count();
console.log(`  Cards on canvas: ${initialCount}\n`);

// Click Learn More button
console.log('🔘 Clicking "Learn More" button...');
const learnMoreBtn = page.locator('[data-testid="action-btn-learn-more"]').first();
const btnVisible = await learnMoreBtn.isVisible();
console.log(`  Button visible: ${btnVisible}`);

if (!btnVisible) {
  console.log('❌ Action buttons not found!');
  await context.close();
  process.exit(1);
}

await learnMoreBtn.click();
await page.waitForTimeout(500);

// Check modal
const modal = page.locator('[data-testid="context-input"]');
const modalVisible = await modal.isVisible();
console.log(`  Modal visible: ${modalVisible}\n`);

// Enter context and submit
console.log('⌨️  Entering context and submitting...');
await modal.fill('test context');
await page.locator('[data-testid="submit-btn"]').click();

// Listen for console errors
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log(`❌ Console error: ${msg.text()}`);
  }
});

console.log('⏳ Waiting for reload and card generation...');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(3000);

console.log('\n📊 Final state:');
const finalCount = await page.locator('[data-testid="open-window-btn"]').count();
console.log(`  Cards on canvas: ${finalCount}`);
console.log(`  Expected: ${initialCount + 1}`);
console.log(`  ${finalCount === initialCount + 1 ? '✅ SUCCESS' : '❌ FAILED'}\n`);

// Check for new card title
const newCardTitle = page.locator('text=/Learn More:/').first();
const titleVisible = await newCardTitle.isVisible().catch(() => false);
console.log(`  New card title visible: ${titleVisible ? '✅ YES' : '❌ NO'}`);

await page.waitForTimeout(5000);
await context.close();
