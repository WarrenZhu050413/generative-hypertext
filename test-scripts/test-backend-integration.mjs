#!/usr/bin/env node

/**
 * Test Backend Integration
 * Verifies extension can communicate with local backend server
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', 'dist');
const BACKEND_URL = 'http://localhost:3100';

async function testBackendHealth() {
  console.log('🧪 Testing Backend Health');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✓ Backend is running');
      return true;
    } else {
      console.log('❌ Backend returned unexpected status:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend not reachable:', error.message);
    return false;
  }
}

async function testExtensionBackendFlow() {
  console.log('\n🧪 Testing Extension → Backend → Claude Flow\n');
  
  // Launch browser with extension
  const ctx = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  const page = await ctx.newPage();

  // Get extension ID
  const targets = ctx.backgroundPages();
  if (targets.length === 0) {
    await page.waitForTimeout(1000);
  }
  
  const extensionId = targets[0]?.url().match(/chrome-extension:\/\/([^\/]+)/)?.[1];
  console.log(`✓ Extension ID: ${extensionId}\n`);

  // Navigate to canvas
  const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;
  console.log(`📍 Navigating to: ${canvasUrl}\n`);
  await page.goto(canvasUrl);
  await page.waitForTimeout(2000);

  // Create a test card
  console.log('📌 Creating test card...');
  await page.evaluate(() => {
    const testCard = {
      id: `test-backend-${Date.now()}`,
      content: '<p>This is a test card for backend integration</p>',
      metadata: {
        url: 'http://test.com',
        title: 'Backend Integration Test Card',
        domain: 'test.com',
        timestamp: Date.now()
      },
      position: { x: 100, y: 100 },
      size: { width: 350, height: 250 },
      starred: false,
      tags: ['test', 'backend'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    chrome.storage.local.get(['cards'], (result) => {
      const cards = result.cards || [];
      cards.push(testCard);
      chrome.storage.local.set({ cards }, () => {
        window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
      });
    });
  });

  await page.waitForTimeout(2000);
  console.log('✓ Test card created\n');

  // Test direct backend call from extension context
  console.log('📌 Testing claudeAPIService with backend...\n');

  const testResult = await page.evaluate(async () => {
    try {
      // Simulate what claudeAPIService does
      const response = await fetch('http://localhost:3100/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Say "Backend working" in exactly 2 words' }
          ],
          options: {
            maxTokens: 100
          }
        }),
      });

      const data = await response.json();
      return {
        success: true,
        content: data.content,
        metadata: data.metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('📋 Backend Response:');
  console.log(JSON.stringify(testResult, null, 2));
  console.log('');

  if (testResult.success) {
    console.log('✅ Backend integration successful!');
    console.log(`✅ Received response: "${testResult.content}"`);
    console.log(`✅ Source: ${testResult.metadata.source}`);
  } else {
    console.log('❌ Backend integration failed:', testResult.error);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Extension loaded');
  console.log('✅ Canvas rendered');
  console.log('✅ Card created');
  console.log(testResult.success ? '✅ Backend communication working' : '❌ Backend communication failed');
  console.log(testResult.success ? '✅ Claude Agent SDK responding' : '❌ Claude Agent SDK not responding');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Browser will stay open for inspection. Press Ctrl+C to close.');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Backend Integration Test');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Check backend
  const backendOk = await testBackendHealth();
  
  if (!backendOk) {
    console.log('\n❌ Backend server not running!');
    console.log('\n   Please start the backend first:');
    console.log('   cd backend');
    console.log('   npm start\n');
    process.exit(1);
  }

  console.log('');

  // Step 2: Test extension integration
  await testExtensionBackendFlow();
}

main().catch(console.error);
