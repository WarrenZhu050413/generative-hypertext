# Quick Debug Guide for Nabokov Extension

## Step 1: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Nabokov Web Clipper"
3. Click the **reload button** (circular arrow icon)
4. Verify no errors show up

## Step 2: Open a Test Page
1. Open the `test-page.html` file in Chrome
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to the **Console** tab

## Step 3: Test the Keyboard Shortcut
Press **Cmd+Shift+E** (Mac) or **Ctrl+Shift+E** (Windows)

### Expected Behavior:
- You should see console logs from the content script
- A shadow DOM container should be added to the page
- Elements should highlight when you hover over them

### If Nothing Happens:

#### Check #1: Is the Content Script Injected?
In the console, type:
```javascript
chrome.runtime.id
```
- If you get an extension ID → Content script is loaded ✅
- If you get `undefined` → Content script failed to inject ❌

#### Check #2: Manual Activation
In the console, try manually activating:
```javascript
chrome.runtime.sendMessage({type: 'ACTIVATE_SELECTOR'})
```

#### Check #3: Check Background Script
1. Go to `chrome://extensions/`
2. Find "Nabokov Web Clipper"
3. Click "service worker" link (or "Inspect views: service worker")
4. Look for any errors in the background script console

#### Check #4: Check Permissions
In `chrome://extensions/`, click "Details" on Nabokov Web Clipper
- Verify "Site access" is set to "On all sites"

## Step 4: Common Issues & Fixes

### Issue: "Failed to load extension"
**Fix:** Make sure you're loading from the `dist/` folder, not the `src/` folder

### Issue: Keyboard shortcut doesn't work
**Fix:** Check if another extension is using Cmd+Shift+E
1. Go to `chrome://extensions/shortcuts`
2. Look for conflicts
3. Try changing the shortcut

### Issue: Content script not injecting
**Fix:**
1. Check the Console for errors
2. Try refreshing the page after loading the extension
3. Make sure the page isn't a restricted page (chrome://, chrome-extension://)

### Issue: Elements don't highlight
**Fix:** Check the Console for React errors or missing dependencies

## Step 5: Manual Testing Script

Paste this into the console on test-page.html:

```javascript
// Check extension status
console.log('Extension ID:', chrome?.runtime?.id);
console.log('Content script loaded:', typeof window.__nabokobClipper__);

// Try to send a test message
if (chrome?.runtime) {
  chrome.runtime.sendMessage({type: 'TEST'}, (response) => {
    console.log('Response:', response);
    console.log('Error:', chrome.runtime.lastError);
  });
}

// Check for shadow DOM
const shadows = document.querySelectorAll('*');
let found = false;
shadows.forEach(el => {
  if (el.shadowRoot) {
    console.log('Found shadow root on:', el);
    found = true;
  }
});
if (!found) {
  console.log('No shadow roots found');
}
```

## Step 6: Get Detailed Logs

1. Make sure the extension is reloaded
2. Go to a simple page like `example.com`
3. Press Cmd+Shift+E
4. Copy ALL console output and share it

## Expected Console Output

When working correctly, you should see:
```
[content] Received message: {type: "ACTIVATE_SELECTOR"}
[content] Activating element selector...
[content] Element selector activated successfully
```

## Still Not Working?

Share these details:
1. Chrome version: Go to `chrome://version/`
2. Extension errors: Any errors in `chrome://extensions/`
3. Console output: Full console log from test page
4. Background script console: Any errors from the service worker