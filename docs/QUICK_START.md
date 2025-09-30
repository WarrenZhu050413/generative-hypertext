# ElementSelector Quick Start Guide

## Installation

The ElementSelector component is already created. Follow these steps to integrate it into your Chrome extension.

## 5-Minute Integration

### Step 1: Update Manifest (manifest.json)

Add the keyboard command:

```json
{
  "commands": {
    "activate-element-selector": {
      "suggested_key": {
        "default": "Ctrl+Shift+E",
        "mac": "Command+Shift+E"
      },
      "description": "Activate element selector"
    }
  }
}
```

### Step 2: Create Content Script (src/content/content.ts)

```typescript
import { createShadowRoot, mountReactInShadow } from '../utils/shadowDOM';
import { ElementSelector } from '../components';

// Track cleanup function
let cleanupFn: (() => void) | null = null;

// Activate element selector
function activateElementSelector() {
  // Don't activate if already active
  if (cleanupFn) return;

  // Create container
  const container = document.createElement('div');
  container.id = 'nabokov-element-selector';
  document.body.appendChild(container);

  // Create shadow root
  const { shadowRoot, styleCache } = createShadowRoot(container, {
    injectBaseStyles: true,
  });

  // Mount component
  cleanupFn = mountReactInShadow(
    shadowRoot,
    <ElementSelector
      onCapture={(card) => {
        console.log('Element captured:', card);
        // Send to background script if needed
        chrome.runtime.sendMessage({
          type: 'ELEMENT_CAPTURED',
          card,
        });
      }}
      onClose={() => {
        // Cleanup
        if (cleanupFn) {
          cleanupFn();
          cleanupFn = null;
        }
        container.remove();
      }}
    />,
    { styleCache }
  );
}

// Listen for activation message
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ACTIVATE_ELEMENT_SELECTOR') {
    activateElementSelector();
  }
});

console.log('[Nabokov] Content script loaded');
```

### Step 3: Create Background Script (src/background/background.ts)

```typescript
// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'activate-element-selector') {
    // Get active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        // Send message to content script
        chrome.tabs.sendMessage(activeTab.id, {
          type: 'ACTIVATE_ELEMENT_SELECTOR',
        });
      }
    });
  }
});

// Optional: Listen for capture events
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ELEMENT_CAPTURED') {
    console.log('Element captured in background:', message.card);
    // Handle captured card (e.g., show notification)
  }
});

console.log('[Nabokov] Background script loaded');
```

### Step 4: Test It!

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

3. Test on any webpage:
   - Press **Cmd+Shift+E** (Mac) or **Ctrl+Shift+E** (Windows/Linux)
   - Hover over elements to see highlight
   - Click to capture
   - Press **ESC** to close

## What You Get

### Visual Feedback
- Red/gold border overlay on hover
- Tooltip showing element info
- Loading animation during capture
- Success dialog after capture

### Captured Data
Each capture includes:
- Sanitized HTML content
- 12 relevant CSS properties
- Unique CSS selector
- Compressed screenshot (JPEG, 800px max)
- Element metadata (tag, classes, dimensions)
- Parent context HTML

### Storage
- **chrome.storage.local**: Card metadata
- **IndexedDB**: Compressed screenshots

## Accessing Captured Data

### Retrieve All Cards

```typescript
import { getCards } from './utils/storage';

const cards = await getCards();
console.log(`Found ${cards.length} cards`);
```

### Retrieve Screenshot

```typescript
import { getScreenshot } from './utils/storage';

const card = cards[0];
if (card.screenshotId) {
  const screenshot = await getScreenshot(card.screenshotId);
  console.log('Screenshot data URL:', screenshot?.dataUrl);
}
```

## Customization

### Change Colors

Edit `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/src/utils/shadowDOM.ts`:

```typescript
export const CHINESE_AESTHETIC_COLORS = {
  cinnabar: '#C23B22',  // Change highlight color
  gold: '#D4AF37',      // Change accent color
  // ... other colors
};
```

### Change Screenshot Quality

Edit capture settings in ElementSelector.tsx:

```typescript
const compressionResult = await compressScreenshot(screenshotDataUrl, {
  quality: 0.9,    // 0-1 (higher = better quality, larger file)
  maxWidth: 1200,  // pixels
});
```

### Change Keyboard Shortcut

Edit manifest.json:

```json
{
  "commands": {
    "activate-element-selector": {
      "suggested_key": {
        "default": "Ctrl+Shift+C",  // Your preferred shortcut
        "mac": "Command+Shift+C"
      }
    }
  }
}
```

## Troubleshooting

### Issue: Component doesn't appear
**Solution**: Check browser console for errors. Ensure content script is loaded.

### Issue: Styles not applying
**Solution**: Verify JSX pragma `/** @jsxImportSource @emotion/react */` is at top of file.

### Issue: Screenshot capture fails
**Solution**: Cross-origin images may fail due to CORS. This is expected.

### Issue: Storage quota exceeded
**Solution**: Screenshots are compressed, but large pages can still exceed quota. Consider:
- Lower screenshot quality (0.6-0.7)
- Reduce maxWidth (400-600px)
- Implement cleanup for old cards

### Issue: Type errors
**Solution**: Run `npm run type-check` to verify TypeScript compilation.

## Performance Tips

1. **Screenshot Size**: Default 800px is balanced. Adjust based on needs.
2. **Storage**: Periodically clean old cards to prevent quota issues.
3. **Large Pages**: Consider capturing smaller elements on complex pages.

## Next Steps

### Basic
- Test on various websites (news, blogs, social media)
- Customize colors to match your brand
- Add error notifications

### Intermediate
- Integrate with canvas visualization
- Add search/filter for captured cards
- Implement card organization (folders, tags)

### Advanced
- Replace FloatingChatPlaceholder with actual FloatingChat
- Add annotation tools (text, arrows, highlights)
- Implement AI-powered element suggestions
- Add export to PDF/HTML features

## API Reference

### Component Props

```typescript
interface ElementSelectorProps {
  onCapture?: (card: ClippedCard) => void;
  onClose?: () => void;
}
```

### Storage Functions

```typescript
// Cards
saveCard(card: ClippedCard): Promise<void>
getCards(): Promise<ClippedCard[]>
deleteCard(id: string): Promise<void>

// Screenshots
saveScreenshot(screenshot: ScreenshotData): Promise<void>
getScreenshot(id: string): Promise<ScreenshotData | undefined>
deleteScreenshot(id: string): Promise<void>

// Utilities
generateId(): string
```

### Utility Functions

```typescript
// Sanitization
sanitizeHTML(html: string): string
extractRelevantStyles(element: HTMLElement): RelevantStyles
generateSelector(element: HTMLElement): string

// Screenshot
captureElementScreenshot(element: HTMLElement): Promise<string>
compressScreenshot(dataUrl: string, options?: CompressionOptions): Promise<CompressionResult>

// Shadow DOM
createShadowRoot(hostElement: HTMLElement, options?): ShadowRootResult
mountReactInShadow(shadowRoot: ShadowRoot, component: ReactElement, options?): () => void
```

## Resources

- **Component Source**: `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/src/components/ElementSelector.tsx`
- **Full Documentation**: `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/src/components/ElementSelector.README.md`
- **Architecture Diagrams**: `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/src/components/ARCHITECTURE.md`
- **Examples**: `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/src/components/ElementSelector.example.tsx`

## Support

For issues or questions:
1. Check the README and documentation
2. Review example files
3. Check browser console for errors
4. Verify TypeScript compilation: `npm run type-check`

## License

Part of Nabokov Web Clipper project.