# Architecture Diagrams: Current vs. Proposed

## Current Architecture (Direct API Key)

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend Components                                  │   │
│  │  - Canvas                                             │   │
│  │  - CardNode                                           │   │
│  │  - ChatModal                                          │   │
│  │  - FloatingWindow                                     │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ calls                                      │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │  Service Layer                                        │   │
│  │  - chatService                                        │   │
│  │  - cardGenerationService                              │   │
│  │  - beautificationService                              │   │
│  │  - fillInService                                      │   │
│  │  - childCardGenerator                                 │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ all call                                   │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │  claudeAPIService.ts                                  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ sendMessage(messages, options)                 │  │   │
│  │  │                                                 │  │   │
│  │  │ const apiKey = await getAPIKey()               │  │   │
│  │  │                                                 │  │   │
│  │  │ fetch('https://api.anthropic.com/v1/messages', │  │   │
│  │  │   headers: {                                    │  │   │
│  │  │     'x-api-key': apiKey,  // ❌ Required!      │  │   │
│  │  │     'Content-Type': 'application/json'         │  │   │
│  │  │   }                                             │  │   │
│  │  │ )                                               │  │   │
│  │  └────────────────┬───────────────────────────────┘  │   │
│  └───────────────────┼───────────────────────────────────┘   │
└────────────────────┼─────────────────────────────────────────┘
                     │ HTTPS
                     │ (browser fetch)
                     ▼
          ┌──────────────────────┐
          │ api.anthropic.com    │
          │ /v1/messages         │
          │                      │
          │ ❌ Requires API key  │
          │ ✅ Returns response  │
          └──────────────────────┘

Problem:
- User must provide separate API key
- Subscription authentication NOT available in browser
- No way to use claude.ai login credentials
```

---

## Proposed Architecture (Backend Proxy with Agent SDK)

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend Components                                  │   │
│  │  - Canvas                                             │   │
│  │  - CardNode                                           │   │
│  │  - ChatModal                                          │   │
│  │  - FloatingWindow                                     │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ calls                                      │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │  Service Layer                                        │   │
│  │  - chatService                                        │   │
│  │  - cardGenerationService                              │   │
│  │  - beautificationService                              │   │
│  │  - fillInService                                      │   │
│  │  - childCardGenerator                                 │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ all call                                   │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │  claudeAPIService.ts (UPDATED)                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ 1. Try Backend (localhost:3100)                │  │   │
│  │  │    ✅ No API key needed                        │  │   │
│  │  │    ✅ Uses subscription auth                   │  │   │
│  │  │                                                 │  │   │
│  │  │ 2. Fallback: Direct API (with key)             │  │   │
│  │  │    fetch('https://api.anthropic.com...')       │  │   │
│  │  │                                                 │  │   │
│  │  │ 3. Fallback: Mock responses                    │  │   │
│  │  └────────────────┬───────────────────────────────┘  │   │
│  └───────────────────┼───────────────────────────────────┘   │
└────────────────────┼─────────────────────────────────────────┘
                     │ HTTP
                     │ (fetch to localhost)
                     ▼
          ┌──────────────────────────────────┐
          │  Local Backend Server             │
          │  (Node.js + Express)              │
          │  Port: 3100                       │
          │                                   │
          │  ┌──────────────────────────────┐ │
          │  │ POST /api/message            │ │
          │  │ POST /api/message/vision     │ │
          │  │                              │ │
          │  │ Uses Agent SDK:              │ │
          │  │ import { query } from        │ │
          │  │   '@anthropic-ai/            │ │
          │  │    claude-agent-sdk'         │ │
          │  │                              │ │
          │  │ ✅ Subscription auth         │ │
          │  │ ✅ OR API key auth           │ │
          │  │ ✅ Automatically handles     │ │
          │  └────────────┬─────────────────┘ │
          └───────────────┼───────────────────┘
                          │ Agent SDK protocol
                          │ (automatic auth)
                          ▼
               ┌──────────────────────┐
               │ Claude API            │
               │ (via Agent SDK)       │
               │                       │
               │ ✅ Uses subscription  │
               │ ✅ OR API key         │
               │ ✅ Returns response   │
               └───────────────────────┘

Benefits:
- ✅ Works with Claude.ai subscription (no separate API key)
- ✅ Falls back to direct API if backend is down
- ✅ Falls back to mock if everything fails
- ✅ Backend can be started/stopped independently
- ✅ Multiple fallback layers for reliability
```

---

## Authentication Flow Comparison

### Current (Direct API)
```
Extension → [x-api-key required] → api.anthropic.com
                ❌ Must provide separate API key
                ❌ Cannot use subscription
```

### Proposed (Backend Proxy)
```
Extension → localhost:3100 → [Agent SDK] → Claude API
                                ✅ Uses subscription automatically
                                ✅ OR uses API key if configured
                                ✅ No changes needed in extension
```

---

## Fallback Strategy

```
┌─────────────────────────────────────────────────────┐
│ 1️⃣  Try: Backend (localhost:3100)                   │
│     ✅ Best option - uses subscription              │
│     ✅ No API key needed                            │
│                                                     │
│     If fails (backend not running):                │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 2️⃣  Try: Direct API (api.anthropic.com)            │
│     ⚠️  Requires API key                            │
│     ✅ Works if user has separate API access        │
│                                                     │
│     If fails (no API key or 401):                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 3️⃣  Fallback: Mock Responses                       │
│     ✅ Always works                                 │
│     ⚠️  Not real AI responses                       │
└─────────────────────────────────────────────────────┘
```

---

## Backend Server Details

### Endpoints

**POST /api/message**
- Input: `{ messages: ClaudeMessage[], options?: {...} }`
- Output: `{ content: string }`
- Uses: Agent SDK `query()` function
- Authentication: Automatic (subscription or API key)

**POST /api/message/vision**
- Input: `{ messages: ClaudeMessage[], imageBase64: string, options?: {...} }`
- Output: `{ content: string }`
- Uses: Agent SDK with image support
- Authentication: Automatic (subscription or API key)

**GET /health**
- Output: `{ status: 'ok', timestamp: number }`
- Quick check if backend is running

### File Structure
```
backend/
├── server.mjs              # Express server
├── package.json            # Dependencies
├── .gitignore             # Ignore node_modules
└── README.md              # Setup instructions
```

### Running
```bash
# Start backend
cd backend
npm install
npm start

# Backend runs on http://localhost:3100
# Extension automatically uses it when available
```
