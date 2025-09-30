#!/usr/bin/env node

/**
 * Standalone Playwright script to test the Nabokov extension
 * This launches Chromium with the extension loaded
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensionPath = path.join(__dirname, 'dist');

console.log('🚀 Starting extension test...');
console.log('📁 Extension path:', extensionPath);

async function testExtension() {
  // Launch Chromium with the extension loaded
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
    ],
    devtools: true, // Open DevTools automatically
  });

  const page = await context.newPage();

  // Navigate to the test page
  const testPagePath = path.join(__dirname, 'test-page.html');
  console.log('📄 Opening test page:', testPagePath);
  await page.goto(`file://${testPagePath}`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  console.log('\n✅ Test page loaded!');
  console.log('\n📋 Instructions:');
  console.log('1. The browser window is now open with DevTools');
  console.log('2. Press Cmd+Shift+E (Mac) or Ctrl+Shift+E (Windows/Linux)');
  console.log('3. Watch the console for errors');
  console.log('4. Hover over elements to see if they highlight');
  console.log('\n⏸️  The browser will stay open. Press Ctrl+C here to close it.\n');

  // Collect console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${type}] ${text}`);
  });

  // Check if extension is loaded
  await page.waitForTimeout(2000);

  const extensionCheck = await page.evaluate(() => {
    return {
      hasRuntime: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
      extensionId: chrome?.runtime?.id,
      hasContentScript: typeof window.__nabokobClipper__ !== 'undefined',
    };
  });

  console.log('\n🔍 Extension Status:');
  console.log('   Chrome Runtime Available:', extensionCheck.hasRuntime ? '✅' : '❌');
  console.log('   Extension ID:', extensionCheck.extensionId || 'Not found');
  console.log('   Content Script Marker:', extensionCheck.hasContentScript ? '✅' : '⚠️ (May be stripped in prod)');

  // Try to trigger the keyboard shortcut programmatically
  console.log('\n⌨️  Attempting to trigger Cmd+Shift+E...');
  await page.keyboard.press('Meta+Shift+KeyE');

  await page.waitForTimeout(1000);

  // Check for shadow DOM elements
  const shadowRoots = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const found = [];
    elements.forEach(el => {
      if (el.shadowRoot) {
        found.push({
          tag: el.tagName,
          id: el.id,
          classes: el.className,
        });
      }
    });
    return found;
  });

  if (shadowRoots.length > 0) {
    console.log('\n✅ Shadow DOM detected!');
    shadowRoots.forEach(root => {
      console.log(`   - ${root.tag}${root.id ? '#' + root.id : ''}${root.classes ? '.' + root.classes : ''}`);
    });
  } else {
    console.log('\n⚠️  No shadow DOM elements found yet');
    console.log('   Try pressing Cmd+Shift+E manually in the browser window');
  }

  // Keep the browser open
  await new Promise(() => {}); // Never resolves - keeps browser open
}

// Run the test
testExtension().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});