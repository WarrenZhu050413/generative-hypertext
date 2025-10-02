/**
 * Test Claude Agent SDK authentication
 * Verifies whether SDK can work without explicit API key
 */

import { query } from '@anthropic-ai/claude-agent-sdk';

async function testSDKAuth() {
  console.log('🔍 Testing Claude Agent SDK Authentication\n');

  // Check environment variables
  console.log('📌 Checking Environment Variables:');
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`  CLAUDE_CODE_USE_BEDROCK: ${process.env.CLAUDE_CODE_USE_BEDROCK ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`  CLAUDE_CODE_USE_VERTEX: ${process.env.CLAUDE_CODE_USE_VERTEX ? '✅ SET' : '❌ NOT SET'}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test 1: Try SDK without API key');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Temporarily remove API key
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    console.log('Calling query() with simple prompt...\n');

    const result = query({
      prompt: 'Say "Hello" in one word',
      options: {
        permissionMode: 'bypassPermissions',
        maxTurns: 1
      }
    });

    let gotResponse = false;
    for await (const message of result) {
      if (message.type === 'assistant') {
        console.log('✅ Got assistant response:', message.message.content[0].text);
        gotResponse = true;
      } else if (message.type === 'result') {
        console.log('\n📊 Result:', message.subtype);
        if (message.subtype === 'success') {
          console.log('   Result text:', message.result);
        }
      } else if (message.type === 'system') {
        console.log('📋 System message:', message.subtype);
        console.log('   API Key Source:', message.apiKeySource);
      }
    }

    if (gotResponse) {
      console.log('\n🎉 SUCCESS: SDK works without explicit API key!');
    } else {
      console.log('\n⚠️  No response received');
    }

    // Restore API key
    if (originalKey) {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.message.includes('API key') || error.message.includes('401')) {
      console.log('\n💡 This confirms: SDK REQUIRES an API key');
      console.log('   Options:');
      console.log('   1. Set ANTHROPIC_API_KEY environment variable');
      console.log('   2. Configure AWS Bedrock credentials + CLAUDE_CODE_USE_BEDROCK=1');
      console.log('   3. Configure Google Vertex AI credentials + CLAUDE_CODE_USE_VERTEX=1\n');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test 2: Try with API key (if available)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️  No API key found. Skipping this test.');
    console.log('   To test with API key: export ANTHROPIC_API_KEY=sk-ant-...\n');
    return;
  }

  try {
    console.log('Calling query() with API key set...\n');

    const result = query({
      prompt: 'Say "API works" in exactly those words',
      options: {
        permissionMode: 'bypassPermissions',
        maxTurns: 1
      }
    });

    for await (const message of result) {
      if (message.type === 'assistant') {
        console.log('✅ Got assistant response:', message.message.content[0].text);
      } else if (message.type === 'system') {
        console.log('📋 API Key Source:', message.apiKeySource);
      } else if (message.type === 'result') {
        console.log('\n📊 Result:', message.subtype);
      }
    }

    console.log('\n🎉 SUCCESS: SDK works with API key!');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Check if SDK is installed
console.log('Checking if Claude Agent SDK is installed...\n');

try {
  await import('@anthropic-ai/claude-agent-sdk');
  console.log('✅ Claude Agent SDK is installed\n');
  testSDKAuth();
} catch (error) {
  console.error('❌ Claude Agent SDK is NOT installed');
  console.log('\nTo install: npm install @anthropic-ai/claude-agent-sdk\n');
  console.log('However, based on the documentation:');
  console.log('  ⚠️  The SDK REQUIRES an API key via ANTHROPIC_API_KEY');
  console.log('  ⚠️  Claude.ai subscription does NOT provide API access');
  console.log('  ⚠️  You need a separate API billing plan from console.anthropic.com\n');
}
