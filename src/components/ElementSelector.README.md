# ElementSelector Component

The `ElementSelector` component provides visual element selection functionality for the Nabokov Web Clipper. It injects into web pages as a Shadow DOM overlay, allowing users to hover over and capture page elements with their content, styles, and screenshots.

## Features

- **Visual Overlay**: Highlights hoverable elements with Chinese aesthetic styling (cinnabar red and gold borders)
- **Element Info Tooltip**: Displays tag name, classes, and dimensions near cursor
- **Full Element Capture**: Captures HTML content (sanitized), relevant styles, CSS selector, screenshot, and context
- **Screenshot Compression**: Automatically captures and compresses element screenshots
- **Storage Integration**: Saves cards to chrome.storage.local and screenshots to IndexedDB
- **Keyboard Shortcuts**: ESC to deactivate selector
- **Loading States**: Visual feedback during capture process
- **FloatingChat Integration**: Shows success confirmation after capture (placeholder)

## Architecture

### Shadow DOM Isolation

The component is designed to be rendered inside a Shadow DOM for complete style isolation from the host page. This prevents conflicts with page styles and ensures consistent appearance.

```typescript
import { createShadowRoot, mountReactInShadow } from '../utils/shadowDOM';
import { ElementSelector } from './ElementSelector';

const container = document.createElement('div');
document.body.appendChild(container);

const { shadowRoot, styleCache } = createShadowRoot(container);
const cleanup = mountReactInShadow(shadowRoot, <ElementSelector />, { styleCache });
```

### Data Flow

1. **Hover Phase**:
   - Mouse move events track hovered element
   - ElementHighlight component draws border overlay
   - ElementTooltip shows element information

2. **Capture Phase**:
   - User clicks on element
   - Component enters loading state
   - Parallel data capture:
     - HTML content (sanitized via DOMPurify)
     - Relevant CSS styles (12 properties)
     - CSS selector (generated)
     - Screenshot (captured and compressed)
     - Parent context (for reference)

3. **Storage Phase**:
   - ClippedCard saved to chrome.storage.local
   - Screenshot saved to IndexedDB
   - Callback fired with captured card

4. **Completion Phase**:
   - FloatingChat component shows success
   - User can close to deactivate selector

## Component API

### Props

```typescript
interface ElementSelectorProps {
  /** Callback fired when an element is successfully captured */
  onCapture?: (card: ClippedCard) => void;

  /** Callback fired when selector is closed/deactivated */
  onClose?: () => void;
}
```

### State

```typescript
{
  isActive: boolean;              // Whether selector is currently active
  hoveredElement: HTMLElement | null;  // Currently hovered element
  selectedElement: HTMLElement | null; // Element that was clicked
  elementInfo: ElementInfo | null;     // Info for tooltip
  isCapturing: boolean;                // Loading state during capture
  showFloatingChat: boolean;           // Whether to show success dialog
  capturedCard: ClippedCard | null;    // The captured card data
}
```

## Usage Examples

### Basic Usage

```typescript
import { ElementSelector } from './components';
import { ClippedCard } from './types';

function activateSelector() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const { shadowRoot, styleCache } = createShadowRoot(container);

  const cleanup = mountReactInShadow(
    shadowRoot,
    <ElementSelector
      onCapture={(card: ClippedCard) => {
        console.log('Captured element:', card);
      }}
      onClose={() => {
        cleanup();
        container.remove();
      }}
    />,
    { styleCache }
  );
}
```

### Integration with Chrome Extension

In your content script:

```typescript
// content.ts
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ACTIVATE_ELEMENT_SELECTOR') {
    activateSelector();
  }
});
```

In your background script:

```typescript
// background.ts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'activate-element-selector') {
    chrome.tabs.query({ active: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'ACTIVATE_ELEMENT_SELECTOR'
      });
    });
  }
});
```

### With Custom Capture Handling

```typescript
<ElementSelector
  onCapture={async (card) => {
    // Custom handling
    await sendToAPI(card);
    showNotification('Element saved!');
    openCanvasView();
  }}
  onClose={() => {
    console.log('Selector closed');
  }}
/>
```

## Captured Data Structure

```typescript
interface ClippedCard {
  id: string;                    // Unique identifier
  url: string;                   // Page URL
  pageTitle: string;             // Page title
  timestamp: number;             // Capture time
  htmlContent: string;           // Sanitized HTML
  selector: string;              // CSS selector
  styles: RelevantStyles;        // 12 relevant CSS properties
  screenshotId?: string;         // Reference to IndexedDB screenshot
  context?: string;              // Parent element HTML
  metadata: {
    tagName: string;
    classNames: string[];
    dimensions: { width: number; height: number };
    textLength: number;
  };
  notes?: string;
  tags?: string[];
}
```

## Styling

The component uses Emotion CSS-in-JS with Chinese aesthetic design principles:

### Color Palette

- **Cinnabar Red** (#C23B22): Primary highlight color
- **Gold** (#D4AF37): Accent borders and interactive elements
- **Ink** (#2C3E50): Dark text and gradients
- **Rice Paper** (#FDF6E3): Light backgrounds
- **Indigo** (#2E4057): Secondary gradients

### Key Styles

- Highlight border: 3px cinnabar with gold shadow
- Tooltip: Ink/indigo gradient with gold border
- Instructions: Rounded pill at bottom center
- Loading overlay: Blurred backdrop with bouncing gold dots
- FloatingChat: Card-style with gradient header

## Keyboard Shortcuts

- **ESC**: Deactivate selector and close overlay

## Performance Considerations

### Screenshot Capture

Screenshots are captured using the native Canvas API and compressed:

- Default quality: 0.8 (80%)
- Max width: 800px
- Format: JPEG (smaller file size)
- Maintains aspect ratio

Typical compression achieves 50-70% size reduction.

### Storage

- **chrome.storage.local**: Card metadata and HTML content
- **IndexedDB**: Compressed screenshots (can handle larger data)

### Event Handling

All event listeners use `capture: true` to intercept before page handlers:

```typescript
window.addEventListener('click', handleClick, true);
```

## Browser Compatibility

- Chrome 88+ (Shadow DOM, Emotion, Chrome Extension APIs)
- Edge 88+ (Chromium-based)

## Dependencies

- React 18.3.1
- @emotion/react 11.11.0
- isomorphic-dompurify 2.14.0
- idb 8.0.0

## Known Limitations

1. **Cross-origin images**: May fail to capture in screenshots due to CORS
2. **Dynamic content**: Captured HTML is static snapshot
3. **Canvas elements**: May not render properly in screenshots
4. **Shadow DOM elements**: Cannot select elements inside other shadow roots
5. **Fixed positioning**: Tooltip/overlay may not work correctly in scrolled iframes

## Future Enhancements

- [ ] Replace FloatingChatPlaceholder with actual FloatingChat component
- [ ] Add annotation tools (text, arrows, highlights)
- [ ] Support for selecting multiple elements at once
- [ ] Export captured elements as standalone HTML
- [ ] OCR for text extraction from images
- [ ] Smart element detection (articles, navigation, etc.)

## Testing

See `ElementSelector.test.tsx` for unit tests.

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import { ElementSelector } from './ElementSelector';

test('renders instructions overlay', () => {
  render(<ElementSelector />);
  expect(screen.getByText(/Hover over elements/i)).toBeInTheDocument();
});
```

## Contributing

When modifying ElementSelector:

1. Maintain Chinese aesthetic styling principles
2. Ensure Shadow DOM compatibility
3. Test across different page layouts
4. Update this README with new features
5. Add JSDoc comments for new functions
6. Run type checking: `npm run type-check`

## License

Part of Nabokov Web Clipper project.