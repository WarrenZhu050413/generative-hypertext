# Current Chrome Extension Architecture

## How It Works Now (Direct API)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Chrome Extension (Browser)                   │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ User Interface Layer                                       │  │
│  │                                                             │  │
│  │  • Canvas (React Flow)                                     │  │
│  │  • CardNode (individual cards)                             │  │
│  │  • ChatModal (conversations)                               │  │
│  │  • FloatingWindow (chat interface)                         │  │
│  │  • FillInModal (synthesis)                                 │  │
│  │  • CustomButtons (Learn More, Summarize, etc.)            │  │
│  └────────────────────────┬────────────────────────────────────┘  │
│                           │ user actions                          │
│                           ↓                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Service Layer (6 services)                                │  │
│  │                                                             │  │
│  │  1. chatService.ts        → Conversations                 │  │
│  │  2. cardGenerationService.ts → Button actions             │  │
│  │  3. beautificationService.ts → AI beautify                │  │
│  │  4. fillInService.ts      → Connection synthesis          │  │
│  │  5. childCardGenerator.ts → Instant expansion             │  │
│  │  6. claudeAPIService.ts   → Core API wrapper              │  │
│  │                                                             │  │
│  │  All 6 services call ↓                                     │  │
│  └────────────────────────┬────────────────────────────────────┘  │
│                           │                                       │
│                           ↓                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ claudeAPIService.ts                                        │  │
│  │                                                             │  │
│  │  async sendMessage(messages, options) {                   │  │
│  │    // Get API key from chrome.storage.local               │  │
│  │    const apiKey = await apiConfigService.getAPIKey()      │  │
│  │                                                             │  │
│  │    // Make direct fetch to Anthropic API                  │  │
│  │    const response = await fetch(                          │  │
│  │      'https://api.anthropic.com/v1/messages',             │  │
│  │      {                                                     │  │
│  │        method: 'POST',                                    │  │
│  │        headers: {                                         │  │
│  │          'x-api-key': apiKey,  // ❌ REQUIRED            │  │
│  │          'Content-Type': 'application/json',             │  │
│  │          'anthropic-version': '2023-06-01'               │  │
│  │        },                                                 │  │
│  │        body: JSON.stringify({ model, messages, ... })    │  │
│  │      }                                                    │  │
│  │    )                                                      │  │
│  │                                                             │  │
│  │    return extractTextFromResponse(response)               │  │
│  │  }                                                         │  │
│  └────────────────────────┬────────────────────────────────────┘  │
│                           │ HTTPS (browser fetch)                 │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ↓
                 ┌──────────────────────────┐
                 │  api.anthropic.com       │
                 │  /v1/messages            │
                 │                          │
                 │  ❌ Requires API key     │
                 │     (separate billing)   │
                 │                          │
                 │  ✅ Returns AI response  │
                 └──────────────────────────┘

PROBLEM:
- User must get separate Claude API key (different from claude.ai subscription)
- Requires separate API billing ($$$)
- Cannot use existing claude.ai subscription login
```

---

## Data Flow Example: User Clicks "Learn More" Button

```
Step 1: User Action
┌──────────────────────────────────┐
│  User clicks "Learn More" on     │
│  a card about "React hooks"      │
└─────────────┬────────────────────┘
              │
              ↓
Step 2: Button Handler
┌──────────────────────────────────┐
│  CardNode.tsx                     │
│  handleButtonClick()              │
│    ↓                              │
│  calls cardGenerationService     │
└─────────────┬────────────────────┘
              │
              ↓
Step 3: Service Layer
┌──────────────────────────────────┐
│  cardGenerationService.ts         │
│                                   │
│  generateCardFromButton() {       │
│    const prompt = buildPrompt()  │
│    const response =               │
│      await claudeAPIService       │
│        .sendMessage(...)          │
│  }                                │
└─────────────┬────────────────────┘
              │
              ↓
Step 4: API Service
┌──────────────────────────────────┐
│  claudeAPIService.ts              │
│                                   │
│  sendMessage() {                  │
│    fetch(                         │
│      'api.anthropic.com',         │
│      { 'x-api-key': apiKey }      │
│    )                              │
│  }                                │
└─────────────┬────────────────────┘
              │ HTTPS
              ↓
Step 5: External API
┌──────────────────────────────────┐
│  Anthropic Claude API             │
│                                   │
│  ❌ Checks API key                │
│  ❌ Bills to API account          │
│     (not claude.ai subscription)  │
│                                   │
│  ✅ Returns AI response:          │
│     "React hooks are..."          │
└─────────────┬────────────────────┘
              │
              ↓
Step 6: Create New Card
┌──────────────────────────────────┐
│  cardGenerationService            │
│                                   │
│  - Creates new Card with content │
│  - Saves to chrome.storage.local │
│  - Creates connection arrow      │
│  - Triggers UI refresh           │
└──────────────────────────────────┘
```

---

## Current Authentication Model

```
┌────────────────────────────────────────────────────────┐
│  User's Accounts (Separate!)                           │
├────────────────────────────────────────────────────────┤
│                                                         │
│  1. Claude.ai Subscription                             │
│     • $20/month (Pro) or $100-200/month (Max)          │
│     • Access to claude.ai web interface                │
│     • Access to Claude mobile app                      │
│     • Access to Claude desktop app                     │
│     • ❌ NOT usable by Chrome extension                │
│                                                         │
│  2. Claude API Key (Separate Billing!)                │
│     • Pay-per-token pricing                            │
│     • ~$3 per million input tokens                     │
│     • ~$15 per million output tokens                   │
│     • ✅ Required for Chrome extension                 │
│     • ❌ Cannot use subscription auth                  │
│                                                         │
└────────────────────────────────────────────────────────┘

WHY SEPARATE?
- Browser security: Cannot access claude.ai session cookies
- CORS: Browser blocks cross-origin cookie sharing
- API architecture: Different auth systems
```

---

## Storage Architecture

```
┌──────────────────────────────────────────────────────────┐
│  chrome.storage.local (5MB limit)                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Key: 'cards'                                            │
│  Value: Card[] (all card metadata)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [                                                   │  │
│  │   { id, content, metadata, position, tags, ... },  │  │
│  │   { id, content, metadata, position, tags, ... },  │  │
│  │   ...                                               │  │
│  │ ]                                                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Key: 'nabokov_claude_api_key'                          │
│  Value: string (encrypted API key)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  "sk-ant-..."                                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Key: 'nabokov_connections'                             │
│  Value: Connection[] (arrows between cards)              │
│                                                           │
│  Key: 'nabokov_canvas_state'                            │
│  Value: { viewport, zoom, etc. }                         │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  IndexedDB (Much larger, ~50MB+)                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Database: 'nabokov-clipper'                             │
│  Store: 'screenshots'                                    │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  {                                                  │  │
│  │    key: "screenshot-12345",                        │  │
│  │    value: {                                         │  │
│  │      dataUrl: "data:image/png;base64,...",        │  │
│  │      width: 800,                                   │  │
│  │      height: 600,                                  │  │
│  │      timestamp: 1234567890                         │  │
│  │    }                                                │  │
│  │  }                                                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Extension Contexts (3 separate JavaScript environments)

```
┌──────────────────────────────────────────────────────────────┐
│  Context 1: Background Service Worker                         │
│  File: src/background/index.ts                               │
├──────────────────────────────────────────────────────────────┤
│  • Handles keyboard shortcuts (Cmd+Shift+E)                  │
│  • Registers context menus                                   │
│  • Captures screenshots (chrome.tabs.captureVisibleTab)      │
│  • Opens canvas page                                         │
│  • ❌ No access to page DOM                                  │
│  • ❌ No access to React components                          │
│  • ✅ Access to chrome.* APIs                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Context 2: Content Script (Injected into every page)        │
│  File: src/content/index.tsx                                 │
├──────────────────────────────────────────────────────────────┤
│  • Runs on every webpage user visits                         │
│  • Mounts ElementSelector in Shadow DOM                      │
│  • Listens for messages from background worker              │
│  • ✅ Full access to page DOM                                │
│  • ✅ Can inject React components                            │
│  • ⚠️ Limited chrome.* API access                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Context 3: Canvas Page (Extension page)                     │
│  File: src/canvas/index.html                                 │
├──────────────────────────────────────────────────────────────┤
│  • Full React application                                    │
│  • React Flow for visual canvas                              │
│  • All card management, chat, LLM features                   │
│  • ✅ Full chrome.* API access                                │
│  • ✅ Access to chrome.storage                                │
│  • ❌ Cannot access webpage DOM                               │
│  • 🔥 This is where ALL LLM services run                     │
└──────────────────────────────────────────────────────────────┘

Communication between contexts:
  Background ←→ Content Script:  chrome.runtime.sendMessage()
  Background ←→ Canvas:          chrome.runtime.sendMessage()
  Content ←→ Canvas:             Via background as relay
  All contexts ←→ Storage:       chrome.storage.local
```

This is the current architecture. The extension works, but requires a separate Claude API key that's billed separately from your claude.ai subscription.