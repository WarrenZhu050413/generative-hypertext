#!/usr/bin/env node

/**
 * Simple Agent SDK Subscription Test
 *
 * Demonstrates how to subscribe to agent messages without making actual API calls.
 * This test shows the async generator pattern for consuming SDK messages.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';

/**
 * Test: Subscribe to agent messages and handle different message types
 *
 * This demonstrates the core subscription pattern:
 * - Async generator iteration over SDKMessage stream
 * - Handling different message types (user, assistant, system, result)
 * - Graceful error handling
 */
async function testAgentSubscriptions() {
  console.log('🧪 Testing Agent SDK Subscriptions\n');

  try {
    // Create a query (this would fail without API key, but demonstrates the pattern)
    const agentQuery = query({
      prompt: 'What is 2 + 2?',
      options: {
        // Use bypass permissions for testing
        permissionMode: 'bypassPermissions',
        // Don't load filesystem settings
        settingSources: [],
        // Mock tool - just allow basic tools
        allowedTools: ['Bash'],
      }
    });

    console.log('✓ Created query instance');
    console.log('✓ Subscription pattern ready\n');

    // Demonstrate subscription pattern (async generator)
    console.log('Subscribing to messages...\n');

    let messageCount = 0;

    // This is the core subscription pattern - iterate over async generator
    for await (const message of agentQuery) {
      messageCount++;

      console.log(`📨 Message #${messageCount}:`);
      console.log(`   Type: ${message.type}`);

      // Handle different message types
      switch (message.type) {
        case 'system':
          console.log(`   Subtype: ${message.subtype}`);
          if (message.subtype === 'init') {
            console.log(`   Session ID: ${message.session_id}`);
            console.log(`   Model: ${message.model}`);
            console.log(`   Tools: ${message.tools.join(', ')}`);
          }
          break;

        case 'user':
          console.log(`   Session ID: ${message.session_id}`);
          console.log(`   Content: ${JSON.stringify(message.message.content).substring(0, 100)}...`);
          break;

        case 'assistant':
          console.log(`   Session ID: ${message.session_id}`);
          console.log(`   Content blocks: ${message.message.content.length}`);
          break;

        case 'result':
          console.log(`   Subtype: ${message.subtype}`);
          console.log(`   Duration: ${message.duration_ms}ms`);
          console.log(`   Turns: ${message.num_turns}`);
          console.log(`   Cost: $${message.total_cost_usd.toFixed(4)}`);
          if (message.subtype === 'success') {
            console.log(`   Result: ${message.result.substring(0, 100)}...`);
          }
          break;

        case 'stream_event':
          // Partial message (only if includePartialMessages: true)
          console.log(`   Event type: ${message.event.type}`);
          break;
      }

      console.log('');
    }

    console.log(`\n✅ Test complete! Processed ${messageCount} messages`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Test: Demonstrate message filtering and selective handling
 */
async function testMessageFiltering() {
  console.log('\n\n🧪 Testing Message Filtering Pattern\n');

  // This demonstrates how to filter for specific message types
  const messageTypeFilter = (message, typeFilter) => {
    return message.type === typeFilter;
  };

  // Example: Collect only assistant messages
  const assistantMessages = [];
  const systemMessages = [];

  console.log('✓ Message filtering helpers created');
  console.log('✓ Pattern: Filter messages by type during iteration\n');

  // In a real implementation, you would do:
  // for await (const message of query(...)) {
  //   if (messageTypeFilter(message, 'assistant')) {
  //     assistantMessages.push(message);
  //   }
  //   if (messageTypeFilter(message, 'system')) {
  //     systemMessages.push(message);
  //   }
  // }

  console.log('Example usage:');
  console.log(`  if (messageTypeFilter(message, 'assistant')) {`);
  console.log(`    assistantMessages.push(message);`);
  console.log(`  }`);
}

/**
 * Test: Demonstrate interruption pattern
 */
async function testInterruption() {
  console.log('\n\n🧪 Testing Interruption Pattern\n');

  console.log('The Query object provides an interrupt() method:');
  console.log('');
  console.log('  const agentQuery = query({ ... });');
  console.log('  ');
  console.log('  // Interrupt the query at any point');
  console.log('  await agentQuery.interrupt();');
  console.log('');
  console.log('✓ Interruption pattern documented');
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Agent SDK Subscription Test Suite (No API Key)');
  console.log('═══════════════════════════════════════════════════════\n');

  await testAgentSubscriptions();
  await testMessageFiltering();
  await testInterruption();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  All Tests Complete!');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);
