# Manual Testing Instructions for Inline Chat

## Issue Found

The automated tests can't properly simulate Chrome's extension message passing because:
- Messages sent from `page.evaluate()` don't reach content scripts
- Chrome's extension messaging only works between background<->content script contexts
- Playwright can't directly invoke keyboard commands registered in the extension

## Manual Testing Steps

### 1. Load the Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Reload" button on the Nabokov Web Clipper extension
5. You should see the extension is active

### 2. Test the Inline Chat

1. Navigate to any website (e.g., https://en.wikipedia.org/wiki/React_(software))
2. Press **`Alt+Shift+C`** on your keyboard
3. The inline chat window should appear in the bottom-right

### 3. If It Doesn't Work

#### Option A: Check Keyboard Shortcut Registration

1. Go to `chrome://extensions/shortcuts`
2. Look for "Nabokov Web Clipper"
3. Check if "Toggle inline chat with page" has `Alt+Shift+C` assigned
4. If not, manually set it to `Alt+Shift+C`

#### Option B: Use Extension DevTools

1. Go to `chrome://extensions`
2. Find Nabokov Web Clipper
3. Click "service worker" link (under "Inspect views")
4. In the DevTools console that opens, type:
   ```javascript
   chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
     chrome.tabs.sendMessage(tabs[0].id, {type: 'OPEN_INLINE_CHAT'});
   });
   ```
5. This will manually trigger the inline chat

#### Option C: Check Console for Errors

1. On any webpage, press `F12` to open DevTools
2. Go to the Console tab
3. Try pressing `Alt+Shift+C`
4. Look for messages starting with `[content]` or `[background]`
5. Report any errors you see

### 4. Test Backend Integration

If the chat opens but shows API errors:

1. Make sure backend is running: `npm run backend`
2. Check backend is accessible: visit http://localhost:3100/health
3. Try sending a message in the chat
4. You should see streaming responses

### Expected Behavior

✅ **When working correctly:**
- Chat window appears with red/gold Chinese aesthetic
- Can drag the window around
- Can type in the input field
- Messages send and responses stream in
- Escape key closes the chat
- Alt+Shift+C reopens it

❌ **Common issues:**
- Chat doesn't appear → keyboard shortcut not registered or conflict
- API errors → backend not running
- Blank window → build issue, try `npm run build` again

## Debug Commands

### Check if content script is loaded:
Open DevTools console and type:
```javascript
document.getElementById('nabokov-clipper-root')
```
Should return `null` (content script loads on demand)

### Manually open chat:
```javascript
// This won't work from page context, needs to be from extension context
chrome.runtime.sendMessage({type: 'OPEN_INLINE_CHAT'});
```

### Check background worker logs:
1. Go to `chrome://extensions`
2. Click "service worker" under Nabokov Web Clipper
3. Console shows all background messages

## What to Report

If it's not working, please provide:
1. Did the keyboard shortcut appear in `chrome://extensions/shortcuts`?
2. Any console errors (from F12 DevTools)?
3. Any errors in the service worker console?
4. Which OS and Chrome version?
5. Did manually triggering via service worker console work (Option B above)?
