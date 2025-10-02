# Manual API Integration Test Guide

## ✅ Implementation Status

All services updated to use **try-API-first** pattern:
- claudeAPIService.ts
- chatService.ts
- cardGenerationService.ts
- beautificationService.ts
- fillInService.ts
- childCardGenerator.ts

## 🧪 How to Test

### Step 1: Load Extension

```bash
# 1. Build the extension
npm run build

# 2. In Chrome, go to: chrome://extensions
# 3. Click the reload icon (🔄) on "Nabokov Web Clipper"
```

### Step 2: Open Canvas & DevTools

1. Click the Nabokov extension icon in Chrome toolbar
2. Canvas page opens
3. Press **F12** to open DevTools
4. Go to **Console** tab

### Step 3: Test WITHOUT API Key (Mock Fallback)

**Expected Behavior:** API attempts, fails with 401, falls back to mock

1. Create a test card (click anywhere on canvas, type some text)
2. Click any action button ("Summarize", "Learn More", etc.)
3. **Check Console:**
   ```
   [cardGenerationService] Trying Claude API...
   [ClaudeAPI] Sending request: {hasAPIKey: false}
   [ClaudeAPI] API error: {...}
   [cardGenerationService] ✗ Claude API failed: Claude API error: 401 Unauthorized
   [cardGenerationService] Falling back to mock
   ```
4. **Result:** Card still generated using mock! ✅

### Step 4: Configure API Key

1. On canvas page, look for Settings/API Settings button
2. Enter your Claude API key: `sk-ant-...`
3. Click Save

### Step 5: Test WITH API Key (Real API)

**Expected Behavior:** API succeeds, no fallback needed

1. Click any action button again
2. **Check Console:**
   ```
   [cardGenerationService] Trying Claude API...
   [ClaudeAPI] Sending request: {hasAPIKey: true}
   [ClaudeAPI] Response received: {id: "...", stopReason: "end_turn"}
   [cardGenerationService] ✓ Claude API success
   ```
3. **Result:** Real Claude response (higher quality than mock)! ✅

### Step 6: Test All Features

Test each LLM feature to verify they all use real API:

| Feature | How to Trigger | Service |
|---------|---------------|---------|
| **Chat** | Click chat icon on card | chatService |
| **Summarize** | Click "Summarize" button | cardGenerationService |
| **Learn More** | Click "Learn More" button | cardGenerationService |
| **Fill-In** | Right-click card → Fill-In | fillInService |
| **Beautify** | Right-click card → Beautify | beautificationService |
| **Expand Link** | Click underlined expandable text | childCardGenerator |

Each should show:
- `[Service] Trying Claude API...`
- `[Service] ✓ Claude API success` (with API key)
- OR `[Service] ✗ Claude API failed` + `Falling back to mock` (without API key)

## 🎯 Success Criteria

✅ **WITHOUT API Key:**
- API attempts are made
- 401 errors logged (expected)
- Falls back to mock
- Features still work

✅ **WITH API Key:**
- API attempts are made
- API succeeds
- Real Claude responses received
- No fallback needed

## 🐛 Troubleshooting

### "No console logs at all"
- Make sure you reloaded the extension after `npm run build`
- Refresh the canvas page (F5)

### "API key not working"
- Check the key format: `sk-ant-...`
- Verify key is valid in Claude Console
- Check Console for actual error message

### "Still using mock even with API key"
- Open DevTools Console
- Look for the actual error message
- It will tell you why the API failed

## 📊 What Changed

**Before:** Services checked for API key, used mock if missing
**After:** Services ALWAYS try real API first, catch errors, fall back to mock

**Benefits:**
- Works with any auth method (API key, env vars, Bedrock, Vertex AI)
- Users see actual error messages (not silent failures)
- Graceful degradation (extension never breaks)
- Clear logging (easy to debug)
