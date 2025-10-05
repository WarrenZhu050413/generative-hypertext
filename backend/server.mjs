#!/usr/bin/env node

/**
 * Nabokov Backend Server
 *
 * Local Node.js server that proxies requests from the Chrome extension to an
 * LLM provider. Supports both the Claude Agent SDK and the Codex CLI, with a
 * shared interface to keep routing logic identical across providers.
 */

import express from 'express';
import cors from 'cors';
import { createLLMService } from './lib/llm/index.js';

const app = express();
const PORT = process.env.PORT || 3100;

let llmService;
try {
  llmService = createLLMService();
  console.log(`[Backend] Using LLM provider: ${llmService.getProviderName()}`);
} catch (error) {
  console.error('[Backend] Failed to initialize LLM provider:', error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

function handleMultimodalFallback(res) {
  res.status(501).json({
    error: 'Multimodal messages not supported by current provider',
    fallbackToDirect: true,
  });
}

function ensureSSEHeaders(res) {
  if (res.headersSent) {
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
}

function handleRequestError(res, error) {
  if (error?.code === 'INVALID_REQUEST') {
    return res.status(400).json({ error: error.message });
  }

  if (error?.code === 'UNSUPPORTED_MULTIMODAL') {
    return handleMultimodalFallback(res);
  }

  console.error('[Backend] Error processing request:', error);
  return res.status(500).json({
    error: error?.message || 'Internal server error',
    details: error?.stack,
  });
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    message: 'Nabokov backend server is running',
    provider: llmService.getProviderName(),
  });
});

/**
 * Text-based message endpoint
 */
app.post('/api/message', async (req, res) => {
  try {
    console.log('[Backend] Received /api/message request');
    const { messages, options = {} } = req.body ?? {};

    const response = await llmService.sendMessage({ messages, options });

    res.json(response);
  } catch (error) {
    handleRequestError(res, error);
  }
});

/**
 * Streaming message endpoint (Server-Sent Events)
 */
app.post('/api/stream', async (req, res) => {
  console.log('[Backend] Received /api/stream request');
  const { messages, options = {} } = req.body ?? {};

  const sendErrorEvent = error => {
    const payload = JSON.stringify({ error: error?.message || 'Stream error' });
    ensureSSEHeaders(res);
    res.write(`data: ${payload}\n\n`);
    res.end();
  };

  try {
    // Start SSE headers only after validation passes
    await llmService.streamMessage({
      messages,
      options,
      onToken: token => {
        ensureSSEHeaders(res);
        res.write(`data: ${JSON.stringify({ delta: { text: token } })}\n\n`);
      },
      onDone: () => {
        ensureSSEHeaders(res);
        res.write('data: [DONE]\n\n');
        res.end();
      },
      onError: error => {
        console.error('[Backend] Streaming error:', error);
        sendErrorEvent(error);
      },
    });
  } catch (error) {
    if (error?.code === 'UNSUPPORTED_MULTIMODAL') {
      res.status(501).json({
        error: 'Multimodal messages not supported by current provider',
        fallbackToDirect: true,
      });
      return;
    }

    if (error?.code === 'INVALID_REQUEST') {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error('[Backend] Unexpected streaming error:', error);
    if (res.headersSent) {
      sendErrorEvent(error);
    } else {
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
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
  console.log(`    POST http://localhost:${PORT}/api/stream`);
  console.log('');
  console.log('  Provider:');
  console.log(`    Active: ${llmService.getProviderName()} (${llmService.getProviderKey()})`);
  console.log('');
  console.log('  Authentication / Execution:');
  console.log('    - Claude Agent SDK (if provider = claude)');
  console.log('    - Codex CLI (if provider = codex, default)');
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
