#!/usr/bin/env node

/**
 * Interactive Agent SDK CLI
 *
 * Demonstrates streaming input mode for interactive conversations.
 * Type messages and get responses. Type 'exit' to quit.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import * as readline from 'readline';

/**
 * Create async generator for user input from stdin
 */
async function* getUserInputGenerator() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('🤖 Interactive Agent Chat');
  console.log('Type your messages and press Enter. Type "exit" to quit.\n');

  try {
    while (true) {
      const userInput = await new Promise((resolve) => {
        rl.question('You: ', resolve);
      });

      if (userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        break;
      }

      // Yield user message in SDK format
      yield {
        type: 'user',
        session_id: '', // Will be set by SDK
        message: {
          role: 'user',
          content: userInput,
        },
        parent_tool_use_id: null,
      };
    }
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * Run interactive agent session
 */
async function runInteractiveAgent() {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('❌ No API key found!');
      console.log('\nSet your API key:');
      console.log('  export ANTHROPIC_API_KEY=your-key-here\n');
      process.exit(1);
    }

    // Create query with streaming input
    const agentQuery = query({
      prompt: getUserInputGenerator(),
      options: {
        permissionMode: 'bypassPermissions',
        settingSources: [],
        allowedTools: ['Bash', 'Read', 'Write', 'Edit'],
      },
    });

    console.log('✓ Starting interactive session...\n');

    // Subscribe to messages
    for await (const message of agentQuery) {
      if (message.type === 'assistant') {
        // Extract text from assistant response
        const textContent = message.message.content
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('\n');

        if (textContent) {
          console.log(`\nAssistant: ${textContent}\n`);
        }
      } else if (message.type === 'result') {
        console.log(`\n💰 Cost: $${message.total_cost_usd.toFixed(4)}`);
        console.log(`⏱️  Duration: ${message.duration_ms}ms`);
        console.log(`🔄 Turns: ${message.num_turns}\n`);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run interactive agent
runInteractiveAgent();
