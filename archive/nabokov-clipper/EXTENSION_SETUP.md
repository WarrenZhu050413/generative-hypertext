# Nabokov Web Clipper - Extension Setup

## Overview

Chrome extension for intelligent web clipping with canvas-based knowledge organization.

## Project Structure

```
nabokov-clipper/
├── src/
│   └── extension/
│       ├── background/
│       │   └── background.ts      # Service worker for keyboard shortcuts
│       └── content/
│           ├── content.ts          # Content script entry point
│           └── elementSelector.ts  # Element selection functionality
├── public/
│   ├── manifest.json              # Chrome extension manifest v3
│   ├── popup.html                 # Extension popup UI
│   └── icons/                     # Extension icons (16, 48, 128px)
└── dist/
    └── extension/                 # Built extension (ready to load)
```

## Build Instructions

### Install Dependencies

```bash
npm install
```

### Build Extension

```bash
npm run build:extension
```

This will create the built extension in `dist/extension/` directory.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist/extension` directory
5. The extension should now appear in your extensions list

## Usage

### Keyboard Shortcut

- **Windows/Linux**: `Ctrl+Shift+E`
- **macOS**: `Command+Shift+E`

Press the keyboard shortcut on any web page to activate the element selector.

### Extension Popup

Click the extension icon in the toolbar to view:
- Current keyboard shortcut
- Extension status
- Quick help

## Features

### Manifest v3 Configuration

The extension uses Chrome Extension Manifest v3 with:

- **Permissions**:
  - `activeTab`: Access to current tab content
  - `storage`: Local data storage
  - `unlimitedStorage`: Large data storage for clips
  - `scripting`: Dynamic script injection
  - `tabs`: Tab management

- **Background Service Worker**:
  - Type: ES module
  - Handles keyboard commands
  - Manages cross-extension messaging

- **Content Scripts**:
  - Injected on `<all_urls>`
  - Runs at `document_idle`
  - Single frame only (`all_frames: false`)

- **Content Security Policy**:
  - Allows `'unsafe-inline'` for styles (required for dynamic UI)
  - Restricts scripts to extension only

### Background Service Worker

Located in `src/extension/background/background.ts`:

- Listens for `activate-selector` keyboard command
- Sends messages to content script to activate element selector
- Handles content script injection if not already loaded
- Error handling for restricted pages (chrome://, chrome-extension://)

### Content Script

Located in `src/extension/content/content.ts`:

- Listens for activation messages from background script
- Initializes ElementSelector when activated
- Provides keyboard shortcut fallback
- ESC key to deactivate selector

### Element Selector

Located in `src/extension/content/elementSelector.ts`:

Current stub implementation provides:
- Activation/deactivation state management
- Visual overlay indicator
- Event listener setup
- Mouse hover and click handlers (to be implemented)

## Development

### File Watching

For development with auto-rebuild:

```bash
npm run dev:extension
```

### Type Checking

```bash
npm run type-check
```

## Testing

1. Build the extension: `npm run build:extension`
2. Load in Chrome: `chrome://extensions/` → Load unpacked
3. Navigate to any website
4. Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
5. Verify overlay appears: "Element Selector Active - Press ESC to cancel"
6. Open DevTools Console to see debug messages
7. Press ESC to deactivate

## Next Steps

### Immediate Implementation Tasks

1. **Element Selector Enhancement**:
   - Implement visual element highlighting on hover
   - Add click handler to capture selected element
   - Extract element HTML, CSS, and metadata
   - Show selection preview/confirmation UI

2. **Data Storage**:
   - Create IndexedDB schema for clips
   - Implement clip storage and retrieval
   - Add metadata (URL, timestamp, tags)

3. **Canvas Integration**:
   - Create canvas view interface
   - Implement clip-to-node conversion
   - Add node positioning and connections

4. **UI Enhancement**:
   - Improve popup with recent clips
   - Add settings panel
   - Create clip preview cards

## Troubleshooting

### Extension Not Loading

- Check that all files exist in `dist/extension/`
- Verify manifest.json is valid JSON
- Check Chrome DevTools for extension errors

### Keyboard Shortcut Not Working

- Verify shortcut isn't already used by another extension
- Try triggering from extension popup instead
- Check browser console for error messages

### Content Script Not Injecting

- Some pages block content scripts (chrome://, chrome-extension://)
- Check page permissions in extension details
- Verify content script is included in manifest.json

## File Reference

### manifest.json
- Manifest version: 3
- Permissions: activeTab, storage, unlimitedStorage, scripting, tabs
- Background service worker: background.js (ES module)
- Content scripts: content.js (all URLs, document_idle)
- Keyboard command: Ctrl+Shift+E / Command+Shift+E
- CSP: Allows unsafe-inline for styles

### background.ts
- Chrome commands listener
- Tab message sending
- Content script injection fallback
- Installation event handler

### content.ts
- Message listener for activation
- ElementSelector initialization
- Keyboard event handling
- Activation/deactivation management

### elementSelector.ts
- Selector state management
- Visual overlay creation
- Event listener attachment
- Mouse hover/click handlers (stub)

## References

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Commands API](https://developer.chrome.com/docs/extensions/reference/commands/)