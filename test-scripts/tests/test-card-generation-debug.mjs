// Debug test of card generation service
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, 'dist');

console.log('🧪 Testing card generation with debugging...\n');

const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});

const page = await context.newPage();

// Capture all console messages
const consoleMessages = [];
page.on('console', msg => {
  const text = `[${msg.type()}] ${msg.text()}`;
  consoleMessages.push(text);
  if (msg.type() === 'error') {
    console.log(`❌ Console error: ${msg.text()}`);
  }
});

// Capture uncaught exceptions
page.on('pageerror', error => {
  console.log(`❌ Page error: ${error.message}`);
  consoleMessages.push(`[pageerror] ${error.message}`);
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

// Test the card generation service directly
console.log('🔬 Testing card generation service directly...');
const testResult = await page.evaluate(async () => {
  try {
    // Import the services
    const { cardGenerationService } = await import('/src/services/cardGenerationService.js');
    const { DEFAULT_BUTTONS } = await import('/src/config/defaultButtons.js');

    // Get first card
    const cards = await chrome.storage.local.get('nabokov_cards');
    const firstCard = cards.nabokov_cards?.[0];

    if (!firstCard) {
      return { error: 'No cards found to test with' };
    }

    // Get Learn More button
    const learnMoreButton = DEFAULT_BUTTONS.find(btn => btn.id === 'learn-more');
    if (!learnMoreButton) {
      return { error: 'Learn More button not found' };
    }

    // Try to generate a card
    console.log('[Test] Generating card with service...');
    const newCard = await cardGenerationService.generateCardFromButton(
      firstCard,
      learnMoreButton,
      'test context'
    );

    return {
      success: true,
      newCardId: newCard.id,
      newCardTitle: newCard.metadata.title
    };
  } catch (error) {
    return {
      error: error.message,
      stack: error.stack
    };
  }
});

console.log('Service test result:', testResult);

// Now test via UI
console.log('\n🔘 Testing via UI - Clicking "Learn More" button...');
const learnMoreBtn = page.locator('[data-testid="action-btn-learn-more"]').first();
const btnVisible = await learnMoreBtn.isVisible();
console.log(`  Button visible: ${btnVisible}`);

if (btnVisible) {
  await learnMoreBtn.click();
  await page.waitForTimeout(500);

  // Check modal
  const modal = page.locator('[data-testid="context-input"]');
  const modalVisible = await modal.isVisible();
  console.log(`  Modal visible: ${modalVisible}`);

  if (modalVisible) {
    // Enter context and submit
    console.log('⌨️  Entering context and submitting...');
    await modal.fill('test context');
    await page.locator('[data-testid="submit-btn"]').click();

    console.log('⏳ Waiting for reload and card generation...');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
  }
}

console.log('\n📊 Final state:');
const finalCount = await page.locator('[data-testid="open-window-btn"]').count();
console.log(`  Cards on canvas: ${finalCount}`);
console.log(`  Expected: ${initialCount + 1}`);
console.log(`  ${finalCount === initialCount + 1 ? '✅ SUCCESS' : '❌ FAILED'}`);

// Print console messages
console.log('\n📝 Console messages:');
consoleMessages.forEach(msg => console.log(`  ${msg}`));

// Check chrome storage for cards
const storageState = await page.evaluate(async () => {
  const result = await chrome.storage.local.get(['nabokov_cards', 'nabokov_connections']);
  return {
    cardCount: result.nabokov_cards?.length || 0,
    connectionCount: result.nabokov_connections?.length || 0,
    lastCard: result.nabokov_cards?.[result.nabokov_cards.length - 1]
  };
});

console.log('\n💾 Storage state:');
console.log(`  Total cards: ${storageState.cardCount}`);
console.log(`  Total connections: ${storageState.connectionCount}`);
if (storageState.lastCard) {
  console.log(`  Last card ID: ${storageState.lastCard.id}`);
  console.log(`  Last card type: ${storageState.lastCard.cardType}`);
  console.log(`  Last card title: ${storageState.lastCard.metadata?.title}`);
}

await page.waitForTimeout(5000);
await context.close();