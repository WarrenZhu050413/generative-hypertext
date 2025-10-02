import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testStorage() {
  console.log('🔍 Testing Nabokov Storage...\n');

  const extensionPath = path.join(__dirname, 'dist');
  console.log('📁 Extension path:', extensionPath);

  const browser = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.waitForTimeout(2000);

  console.log('\n📊 Reading chrome.storage.local...\n');

  const storageData = await page.evaluate(async () => {
    // Read all storage keys
    const allKeys = await new Promise((resolve) => {
      chrome.storage.local.get(null, resolve);
    });

    // Get specific data
    const cardsData = allKeys['cards'] || [];
    const nabokobCardsData = allKeys['nabokov_cards'] || [];

    return {
      allKeys: Object.keys(allKeys),
      cards: cardsData,
      cardsCount: Array.isArray(cardsData) ? cardsData.length : 0,
      nabokobCards: nabokobCardsData,
      nabokobCardsCount: Array.isArray(nabokobCardsData) ? nabokobCardsData.length : 0,
      sampleCard: Array.isArray(cardsData) && cardsData.length > 0 ? cardsData[0] : null,
    };
  });

  console.log('📦 Storage Keys Found:', storageData.allKeys);
  console.log(`\n📋 cards array: ${storageData.cardsCount} items`);
  console.log(`📋 nabokov_cards array: ${storageData.nabokobCardsCount} items`);

  if (storageData.sampleCard) {
    console.log('\n🔎 Sample Card Structure:');
    console.log(JSON.stringify(storageData.sampleCard, null, 2));

    console.log('\n🏷️  Card Fields Present:');
    Object.keys(storageData.sampleCard).forEach(key => {
      const value = storageData.sampleCard[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`  - ${key}: ${type}`);
    });

    console.log('\n⚠️  Data Structure Analysis:');
    console.log('   Expected by Canvas (Card type):');
    console.log('     - id: string');
    console.log('     - content: string');
    console.log('     - metadata: { url, title, domain, ... }');
    console.log('     - createdAt: number');
    console.log('     - updatedAt: number');
    console.log('     - starred: boolean');
    console.log('     - tags: string[]');

    console.log('\n   Actually Saved (ClippedCard type):');
    console.log('     - id:', typeof storageData.sampleCard.id);
    console.log('     - url:', typeof storageData.sampleCard.url);
    console.log('     - title:', typeof storageData.sampleCard.title);
    console.log('     - tagName:', typeof storageData.sampleCard.tagName);
    console.log('     - textContent:', typeof storageData.sampleCard.textContent);
    console.log('     - timestamp:', typeof storageData.sampleCard.timestamp);

    const hasMetadata = 'metadata' in storageData.sampleCard;
    const hasContent = 'content' in storageData.sampleCard;
    const hasCreatedAt = 'createdAt' in storageData.sampleCard;

    console.log('\n   ❌ STRUCTURE MISMATCH DETECTED:');
    console.log(`     - Has "metadata" field: ${hasMetadata}`);
    console.log(`     - Has "content" field: ${hasContent}`);
    console.log(`     - Has "createdAt" field: ${hasCreatedAt}`);
    console.log('     - Canvas expects one structure, ElementSelector saves another!');
  } else {
    console.log('\n⚠️  No cards found in storage');
    console.log('   Either:');
    console.log('   1. No elements have been captured yet');
    console.log('   2. Extension was reloaded and storage cleared');
    console.log('   3. Data is stored under a different key');
  }

  console.log('\n💡 Recommendations:');
  console.log('   1. ElementSelector should save data in Card format (not ClippedCard)');
  console.log('   2. Or add a converter function to transform ClippedCard → Card');
  console.log('   3. Or update Canvas to accept ClippedCard format');

  console.log('\n✅ Storage inspection complete!');
  console.log('Press Ctrl+C to exit...\n');

  await page.waitForTimeout(60000); // Keep open for manual inspection
  await browser.close();
}

testStorage().catch(console.error);