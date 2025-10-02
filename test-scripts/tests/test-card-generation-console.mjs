// Test card generation with full console monitoring
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, 'dist');

console.log('🧪 Testing card generation with console monitoring...\n');

const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});

const page = await context.newPage();

// Capture ALL console messages with full detail
page.on('console', async msg => {
  const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => 'Non-serializable')));
  const type = msg.type();
  const text = msg.text();

  if (type === 'error') {
    console.log(`\n❌ ERROR: ${text}`);
    if (args.length > 0) {
      console.log('   Details:', JSON.stringify(args, null, 2));
    }
  } else if (text.includes('CardNode') || text.includes('generating') || text.includes('card')) {
    console.log(`📝 [${type}] ${text}`);
    if (args.length > 0 && type === 'error') {
      console.log('   Details:', JSON.stringify(args, null, 2));
    }
  }
});

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

// Store initial card count in storage
const initialStorage = await page.evaluate(async () => {
  const result = await chrome.storage.local.get('nabokov_cards');
  return result.nabokov_cards?.length || 0;
});
console.log(`  Cards in storage: ${initialStorage}\n`);

// Click Learn More button
console.log('🔘 Clicking "Learn More" button...');
const learnMoreBtn = page.locator('[data-testid="action-btn-learn-more"]').first();
await learnMoreBtn.click();
await page.waitForTimeout(500);

// Enter context and submit
const modal = page.locator('[data-testid="context-input"]');
if (await modal.isVisible()) {
  console.log('✓ Modal opened\n');
  console.log('⌨️  Entering context...');
  await modal.fill('test context for debugging');

  console.log('📤 Submitting...\n');
  await page.locator('[data-testid="submit-btn"]').click();

  // Wait for potential errors or processing
  await page.waitForTimeout(2000);

  // Check if page reloaded
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: 3000 });
    console.log('✓ Page reloaded\n');
  } catch {
    console.log('⚠️  Page did not reload\n');
  }

  await page.waitForTimeout(2000);
}

// Check final state
console.log('\n📊 Final state:');
const finalCount = await page.locator('[data-testid="open-window-btn"]').count();
console.log(`  Cards on canvas: ${finalCount}`);

const finalStorage = await page.evaluate(async () => {
  const result = await chrome.storage.local.get(['nabokov_cards', 'nabokov_connections']);
  return {
    cardCount: result.nabokov_cards?.length || 0,
    connectionCount: result.nabokov_connections?.length || 0,
    lastCard: result.nabokov_cards?.[result.nabokov_cards.length - 1]
  };
});

console.log(`  Cards in storage: ${finalStorage.cardCount}`);
console.log(`  Connections: ${finalStorage.connectionCount}`);

if (finalStorage.lastCard) {
  console.log(`\n📦 Last card details:`);
  console.log(`  ID: ${finalStorage.lastCard.id}`);
  console.log(`  Type: ${finalStorage.lastCard.cardType || 'web'}`);
  console.log(`  Title: ${finalStorage.lastCard.metadata?.title || 'N/A'}`);
  console.log(`  Parent: ${finalStorage.lastCard.parentCardId || 'None'}`);
}

console.log(`\n🎯 Result: ${finalStorage.cardCount > initialStorage ? '✅ Card generated!' : '❌ No new card'}`);

await page.waitForTimeout(10000); // Keep open for manual inspection
await context.close();