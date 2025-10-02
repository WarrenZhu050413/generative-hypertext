/**
 * Detailed API integration test
 * Actually triggers API calls and monitors behavior
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', 'dist');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDetailed() {
  console.log('🔍 Detailed API Integration Test\n');

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  try {
    // Get extension ID
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    const extensionId = background.url().split('/')[2];
    console.log(`✓ Extension ID: ${extensionId}\n`);

    const page = await context.newPage();

    // Collect ALL console messages
    const allLogs = [];
    page.on('console', async msg => {
      const text = msg.text();
      const type = msg.type();
      allLogs.push({ type, text, timestamp: Date.now() });

      // Print everything in real-time
      const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📋';
      console.log(`${prefix} [${type}] ${text}`);
    });

    page.on('pageerror', error => {
      console.error(`💥 Page Error: ${error.message}`);
      allLogs.push({ type: 'pageerror', text: error.message, timestamp: Date.now() });
    });

    // Navigate to canvas
    const canvasUrl = `chrome-extension://${extensionId}/src/canvas/index.html`;
    console.log(`\n🌐 Navigating to: ${canvasUrl}\n`);
    await page.goto(canvasUrl);
    await sleep(3000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Checking API Key Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const apiKey = await page.evaluate(async () => {
      const result = await chrome.storage.local.get('nabokov_claude_api_key');
      return result.nabokov_claude_api_key || null;
    });

    if (apiKey) {
      console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);
    } else {
      console.log('❌ No API key configured\n');
    }

    // Create a simple test card
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Creating Test Card');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testCardId = await page.evaluate(() => {
      const id = 'test-' + Date.now();
      const card = {
        id,
        content: '<p>Artificial intelligence (AI) is transforming technology.</p>',
        metadata: {
          url: 'https://example.com',
          title: 'AI Article',
          domain: 'example.com',
          timestamp: Date.now()
        },
        position: { x: 100, y: 100 },
        size: { width: 350, height: 250 },
        starred: false,
        tags: ['ai', 'test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cardType: 'note'
      };

      return new Promise((resolve) => {
        chrome.storage.local.get('cards', (result) => {
          const cards = result.cards || [];
          cards.push(card);
          chrome.storage.local.set({ cards }, () => {
            window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
            resolve(id);
          });
        });
      });
    });

    console.log(`✓ Created test card: ${testCardId}\n`);
    await sleep(3000);

    // Test direct API call via page.evaluate
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Testing Direct API Call');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    allLogs.length = 0; // Clear logs

    const apiTestResult = await page.evaluate(async () => {
      try {
        // Import the services
        const { claudeAPIService } = await import('/src/services/claudeAPIService.ts');

        console.log('[Test] About to call Claude API...');

        const response = await claudeAPIService.sendMessage([
          { role: 'user', content: 'Say "API is working!" in exactly those words.' }
        ], {
          maxTokens: 50
        });

        console.log('[Test] API Response:', response);

        return {
          success: true,
          response: response.substring(0, 100)
        };
      } catch (error) {
        console.error('[Test] API call failed:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log('\n🔍 Direct API Call Result:');
    console.log(JSON.stringify(apiTestResult, null, 2));

    await sleep(2000);

    // Analyze logs
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Console Log Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const relevantLogs = allLogs.filter(log =>
      log.text.includes('[Test]') ||
      log.text.includes('[ClaudeAPI]') ||
      log.text.includes('API') ||
      log.text.includes('Claude')
    );

    console.log(`Found ${relevantLogs.length} relevant log entries:\n`);
    relevantLogs.forEach((log, i) => {
      console.log(`  ${i + 1}. [${log.type}] ${log.text}`);
    });

    // Check what actually happened
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Diagnostic Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const hasAPIKey = !!apiKey;
    const apiCalled = allLogs.some(l => l.text.includes('Sending request'));
    const apiSuccess = apiTestResult.success;
    const hasError = allLogs.some(l => l.type === 'error');

    console.log(`API Key Present: ${hasAPIKey ? '✅' : '❌'}`);
    console.log(`API Request Sent: ${apiCalled ? '✅' : '❌'}`);
    console.log(`API Call Succeeded: ${apiSuccess ? '✅' : '❌'}`);
    console.log(`Errors Detected: ${hasError ? '⚠️ YES' : '✅ NO'}\n`);

    if (!hasAPIKey) {
      console.log('💡 No API key configured. API calls will fail with 401 error.');
      console.log('   This is EXPECTED behavior - services should fall back to mock.\n');
    }

    if (apiTestResult.error) {
      console.log(`❌ API Error: ${apiTestResult.error}\n`);

      if (apiTestResult.error.includes('401')) {
        console.log('   → This is a 401 Unauthorized error');
        console.log('   → Expected when no API key is configured');
        console.log('   → Services should catch this and use mock fallback\n');
      } else if (apiTestResult.error.includes('fetch')) {
        console.log('   → Network/fetch error');
        console.log('   → Could be CORS, network issue, or invalid request\n');
      }
    }

    if (apiSuccess && apiTestResult.response) {
      console.log(`✅ API Response Preview: "${apiTestResult.response}"\n`);
      console.log('🎉 SUCCESS! Real Claude API is working!\n');
    }

    // Try to trigger a service
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Testing cardGenerationService');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    allLogs.length = 0; // Clear

    const serviceResult = await page.evaluate(async (cardId) => {
      try {
        const { cardGenerationService } = await import('/src/services/cardGenerationService.ts');

        // Get the test card
        const result = await chrome.storage.local.get('cards');
        const cards = result.cards || [];
        const sourceCard = cards.find(c => c.id === cardId);

        if (!sourceCard) {
          throw new Error('Test card not found');
        }

        const button = {
          id: 'test-button',
          label: 'Test',
          prompt: 'Briefly explain: {{content}}',
          icon: '🧪',
          connectionType: 'generated-from'
        };

        console.log('[Test] Calling cardGenerationService...');

        const newCard = await cardGenerationService.generateCardFromButton(
          sourceCard,
          button,
          'Testing API integration'
        );

        console.log('[Test] Card generated:', newCard.id);

        return {
          success: true,
          cardId: newCard.id,
          contentPreview: newCard.content?.substring(0, 100)
        };
      } catch (error) {
        console.error('[Test] Service failed:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }, testCardId);

    await sleep(5000); // Wait for generation

    console.log('\n🔍 Card Generation Result:');
    console.log(JSON.stringify(serviceResult, null, 2));

    // Check service logs
    const serviceLogs = allLogs.filter(log =>
      log.text.includes('[cardGenerationService]') ||
      log.text.includes('Trying Claude API') ||
      log.text.includes('Claude API success') ||
      log.text.includes('Claude API failed') ||
      log.text.includes('Falling back to mock')
    );

    console.log('\n📋 Service Logs:');
    serviceLogs.forEach(log => {
      console.log(`  ${log.text}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Browser staying open for inspection. Press Ctrl+C to exit.\n');

    // Keep browser open
    await new Promise(() => {});

  } catch (error) {
    console.error('\n❌ Test Error:', error);
    await context.close();
    process.exit(1);
  }
}

testDetailed();
