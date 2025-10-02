import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testExtension() {
  console.log('🧪 Testing Nabokov Extension Basic Functionality\n');

  const extensionPath = path.join(__dirname, 'dist');
  console.log('📁 Extension path:', extensionPath);

  // Launch browser with extension
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const page = await context.newPage();
  await page.goto('https://example.com');
  await page.waitForTimeout(2000);

  console.log('\n📋 Test 1: Check if extension loaded');
  const extensions = await context.backgroundPages();
  console.log(`   Background pages: ${extensions.length}`);
  
  if (extensions.length > 0) {
    console.log('   ✅ Extension background script loaded');
    
    // Listen to background console
    extensions[0].on('console', msg => {
      console.log(`   [Background] ${msg.text()}`);
    });
  } else {
    console.log('   ❌ Extension background script NOT loaded');
  }

  console.log('\n📋 Test 2: Check if content script loaded');
  await page.waitForTimeout(1000);
  
  const contentScriptLoaded = await page.evaluate(() => {
    // Check if content script injected anything
    return !!window.__nabokobClipper__;
  });
  
  console.log(`   Content script loaded: ${contentScriptLoaded ? '✅' : '❌'}`);

  console.log('\n📋 Test 3: Listen to page console logs');
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[content]') || text.includes('[ElementSelector]')) {
      console.log(`   [Page] ${text}`);
    }
  });

  console.log('\n📋 Test 4: Try keyboard shortcut (Cmd+Shift+E)');
  await page.keyboard.down('Meta');
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyE');
  await page.keyboard.up('Shift');
  await page.keyboard.up('Meta');
  
  console.log('   Keyboard shortcut sent, waiting for response...');
  await page.waitForTimeout(3000);

  console.log('\n📋 Test 5: Check for ElementSelector in DOM');
  const selectorFound = await page.evaluate(() => {
    // Look for nabokov container or shadow root
    const container = document.querySelector('[data-nabokov-container]');
    return !!container;
  });
  
  console.log(`   ElementSelector container found: ${selectorFound ? '✅' : '❌'}`);

  console.log('\n📋 Test 6: Check chrome.storage.local');
  const storageData = await page.evaluate(async () => {
    try {
      const result = await chrome.storage.local.get(['cards']);
      return {
        success: true,
        cardsCount: result.cards?.length || 0,
        hasCards: !!result.cards
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });
  
  console.log(`   Storage accessible: ${storageData.success ? '✅' : '❌'}`);
  if (storageData.success) {
    console.log(`   Cards in storage: ${storageData.cardsCount}`);
  }

  console.log('\n⏸️  Browser will stay open for 60 seconds for manual inspection...');
  console.log('   Press Ctrl+C to exit early\n');
  
  await page.waitForTimeout(60000);
  await context.close();
}

testExtension().catch(console.error);
