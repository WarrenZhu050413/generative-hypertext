#!/usr/bin/env node

/**
 * Nabokov Backend Server
 *
 * Local Node.js server that uses Claude Agent SDK to proxy requests
 * from the Chrome extension. This allows the extension to use
 * subscription authentication instead of requiring a separate API key.
 *
 * The Agent SDK automatically handles authentication using:
 * - Claude.ai subscription (browser session)
 * - API key (if configured in environment)
 * - Other auth methods (Bedrock, Vertex AI)
 */

import express from 'express';
import cors from 'cors';
import { query } from '@anthropic-ai/claude-agent-sdk';

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors()); // Allow requests from Chrome extension
app.use(express.json({ limit: '50mb' })); // Support large payloads (screenshots)

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    message: 'Nabokov backend server is running'
  });
});

/**
 * Text-based message endpoint
 *
 * POST /api/message
 * Body: {
 *   messages: [{ role: 'user' | 'assistant', content: string }],
 *   options?: {
 *     system?: string,
 *     maxTokens?: number,
 *     temperature?: number,
 *     model?: string
 *   }
 * }
 */
app.post('/api/message', async (req, res) => {
  try {
    console.log('[Backend] Received /api/message request');

    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required'
      });
    }

    // Check if any message has multimodal content (array format)
    const hasMultimodal = messages.some(m => Array.isArray(m.content));

    if (hasMultimodal) {
      console.log('[Backend] Multimodal message detected - using direct API');
      // For multimodal messages, the Agent SDK query() doesn't support them yet
      // Return a specific error so the frontend can fallback to direct API
      return res.status(501).json({
        error: 'Multimodal messages not supported by Agent SDK query()',
        fallbackToDirect: true
      });
    }

    // Build prompt from messages (text-only)
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const systemPrompt = options.system || '';
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${conversationText}`
      : conversationText;

    console.log('[Backend] Creating Agent SDK query (text-only)...');

    // Create Agent SDK query
    const agentQuery = query({
      prompt: fullPrompt,
      options: {
        permissionMode: 'bypassPermissions', // Auto-approve all tool uses
        settingSources: [], // Don't load filesystem settings
        allowedTools: [], // No tools needed for simple text generation
      }
    });

    console.log('[Backend] Waiting for Agent SDK response...');

    let responseText = '';
    let isComplete = false;

    // Iterate through Agent SDK messages
    for await (const message of agentQuery) {
      console.log(`[Backend] Agent message: ${message.type}`);

      if (message.type === 'assistant') {
        // Extract text from assistant message
        const textBlocks = message.message.content.filter(
          block => block.type === 'text'
        );
        for (const block of textBlocks) {
          responseText += block.text;
        }
      }

      if (message.type === 'result') {
        isComplete = true;
        if (message.subtype === 'success') {
          console.log('[Backend] ✓ Agent SDK success');
          responseText = message.result;
        } else if (message.subtype === 'error') {
          console.error('[Backend] ✗ Agent SDK error:', message.error);
          return res.status(500).json({
            error: message.error || 'Agent SDK returned an error'
          });
        }
        break;
      }
    }

    if (!isComplete) {
      throw new Error('Agent SDK query did not complete');
    }

    console.log('[Backend] Response length:', responseText.length);

    res.json({
      content: responseText,
      metadata: {
        timestamp: Date.now(),
        source: 'agent-sdk'
      }
    });

  } catch (error) {
    console.error('[Backend] Error processing request:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
});

/**
 * Streaming message endpoint (for inline chat)
 *
 * POST /api/stream
 * Body: {
 *   messages: [{ role: 'user' | 'assistant', content: string }],
 *   options?: {
 *     system?: string,
 *     maxTokens?: number,
 *     temperature?: number,
 *     model?: string
 *   }
 * }
 * Response: Server-Sent Events (SSE) stream
 */
app.post('/api/stream', async (req, res) => {
  try {
    console.log('[Backend] Received /api/stream request');

    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required'
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Build prompt from messages
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const systemPrompt = options.system || '';
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${conversationText}`
      : conversationText;

    console.log('[Backend] Creating streaming Agent SDK query...');

    // Create Agent SDK query
    const agentQuery = query({
      prompt: fullPrompt,
      options: {
        permissionMode: 'bypassPermissions',
        settingSources: [],
        allowedTools: [],
      }
    });

    // Stream responses
    for await (const message of agentQuery) {
      if (message.type === 'assistant') {
        // Extract text from assistant message
        const textBlocks = message.message.content.filter(
          block => block.type === 'text'
        );
        for (const block of textBlocks) {
          // Send SSE event
          res.write(`data: ${JSON.stringify({ delta: { text: block.text } })}\n\n`);
        }
      }

      if (message.type === 'result') {
        if (message.subtype === 'success') {
          console.log('[Backend] ✓ Streaming complete');
          res.write('data: [DONE]\n\n');
          res.end();
        } else if (message.subtype === 'error') {
          console.error('[Backend] ✗ Streaming error:', message.error);
          res.write(`data: ${JSON.stringify({ error: message.error })}\n\n`);
          res.end();
        }
        break;
      }
    }

  } catch (error) {
    console.error('[Backend] Error processing stream:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🚀 Nabokov Backend Server');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Status: Running`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log('');
  console.log('  Endpoints:');
  console.log(`    POST http://localhost:${PORT}/api/message`);
  console.log('');
  console.log('  Authentication: Using Claude Agent SDK');
  console.log('    ✅ Subscription (if logged into claude.ai)');
  console.log('    ✅ API Key (if ANTHROPIC_API_KEY set)');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down Nabokov backend server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down Nabokov backend server...');
  process.exit(0);
});
