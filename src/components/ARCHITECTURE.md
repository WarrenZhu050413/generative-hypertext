# ElementSelector Architecture

## Component Hierarchy

```
ElementSelector (Main Component)
├── ElementHighlight (Border Overlay)
│   └── CSS: Cinnabar red border with gold shadow
├── ElementTooltip (Info Display)
│   ├── Tag name
│   ├── Classes
│   └── Dimensions
├── Loading Overlay (Capture State)
│   ├── Spinner (3 bouncing gold dots)
│   └── Status text
├── FloatingChatPlaceholder (Success Dialog)
│   ├── Header (with close button)
│   └── Content (capture details)
└── Instructions Bar (Bottom Overlay)
    └── Keyboard shortcuts guide
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIALIZATION                           │
│  Component Mounts → isActive: true → Setup Event Listeners │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    HOVER PHASE                              │
│  Mouse Move → Get Element → Update hoveredElement          │
│            → Calculate Position → Show Highlight + Tooltip │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ (User Clicks)
┌─────────────────────────────────────────────────────────────┐
│                    CAPTURE PHASE                            │
│  Click → Prevent Default → Set selectedElement             │
│       → isCapturing: true → Hide Highlight/Tooltip         │
│       → Show Loading Overlay                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              PARALLEL DATA CAPTURE                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Sanitize   │  │   Extract    │  │   Generate   │    │
│  │     HTML     │  │    Styles    │  │   Selector   │    │
│  │  (DOMPurify) │  │  (12 props)  │  │  (CSS path)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Capture    │  │   Compress   │  │   Get Parent │    │
│  │ Screenshot   │  │  Screenshot  │  │   Context    │    │
│  │ (Canvas API) │  │  (80% JPEG)  │  │   (HTML)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────┐       │
│  │          Collect Metadata                      │       │
│  │  - Tag name, classes                           │       │
│  │  - Dimensions (width × height)                 │       │
│  │  - Text content length                         │       │
│  └────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE PHASE                            │
│                                                             │
│  Create ClippedCard Object                                 │
│         │                                                   │
│         ├──→ chrome.storage.local.set({ cards: [...] })   │
│         │    (Card metadata + HTML)                        │
│         │                                                   │
│         └──→ IndexedDB.put({ id, dataUrl, ... })          │
│              (Compressed screenshot)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETION PHASE                         │
│                                                             │
│  isCapturing: false → Hide Loading Overlay                 │
│  setCapturedCard(card) → showFloatingChat: true            │
│  Fire onCapture(card) callback                             │
│  User clicks close → onClose() → Cleanup                   │
└─────────────────────────────────────────────────────────────┘
```

## Event Flow

```
┌─────────────┐
│   Window    │
│   Events    │
└──────┬──────┘
       │
       ├──→ keydown (ESC) ──→ deactivate()
       │                      └─→ onClose()
       │
       ├──→ mousemove ──→ handleMouseMove()
       │                 ├─→ Get element at cursor
       │                 ├─→ Ignore overlay/script/style
       │                 ├─→ setHoveredElement(target)
       │                 └─→ setElementInfo({ tag, classes, dims })
       │
       └──→ click ──→ handleClick()
                      ├─→ preventDefault()
                      ├─→ stopPropagation()
                      ├─→ setSelectedElement(target)
                      ├─→ setIsCapturing(true)
                      ├─→ captureElementData()
                      ├─→ saveToStorage()
                      ├─→ setShowFloatingChat(true)
                      └─→ onCapture(card)
```

## Storage Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CHROME STORAGE                           │
│                  (chrome.storage.local)                     │
│                                                             │
│  {                                                          │
│    cards: [                                                 │
│      {                                                      │
│        id: "1234567890-abc123",                            │
│        url: "https://example.com/page",                    │
│        pageTitle: "Example Page",                          │
│        timestamp: 1234567890000,                           │
│        htmlContent: "<div>Sanitized HTML</div>",          │
│        selector: "body > div:nth-child(2) > article",     │
│        styles: { fontSize: "16px", ... },                 │
│        screenshotId: "1234567890-xyz789",  ←─────┐        │
│        context: "<main>...</main>",                 │      │
│        metadata: { ... }                            │      │
│      }                                                │      │
│    ]                                                  │      │
│  }                                                    │      │
└───────────────────────────────────────────────────────┼──────┘
                                                        │
                                              Reference │
                                                        │
┌───────────────────────────────────────────────────────┼──────┐
│                    INDEXED DB                         │      │
│                  (nabokov-clipper)                    │      │
│                                                       │      │
│  screenshots: {                                       │      │
│    "1234567890-xyz789": {  ←──────────────────────────┘      │
│      id: "1234567890-xyz789",                               │
│      dataUrl: "data:image/jpeg;base64,...",                 │
│      compressionMetadata: {                                 │
│        originalSize: 500000,                                │
│        compressedSize: 150000,                              │
│        compressionRatio: 0.7                                │
│      },                                                     │
│      timestamp: 1234567890000                               │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Shadow DOM Structure

```
┌───────────────────────────────────────────────────────┐
│                   Host Page (DOM)                     │
│                                                       │
│  <body>                                               │
│    ...existing page content...                       │
│    <div id="nabokov-element-selector"> ←─┐          │
│    </div>                                 │          │
│  </body>                                  │          │
└───────────────────────────────────────────┼───────────┘
                                            │
                              Shadow Root   │
                                            ↓
┌───────────────────────────────────────────────────────┐
│                Shadow DOM (Isolated)                  │
│                                                       │
│  #shadow-root (open)                                 │
│  ├── <style id="shadow-global-styles">              │
│  │   /* Chinese aesthetic CSS variables */          │
│  │   /* Base styles for content */                  │
│  │   </style>                                        │
│  │                                                   │
│  ├── <style data-emotion="shadow">                  │
│  │   /* Emotion generated styles */                 │
│  │   </style>                                        │
│  │                                                   │
│  └── <div id="react-root">                          │
│      <CacheProvider value={styleCache}>             │
│        <ElementSelector>                            │
│          <div data-nabokov-overlay>                 │
│            {/* Component content */}                │
│          </div>                                     │
│        </ElementSelector>                           │
│      </CacheProvider>                               │
│      </div>                                         │
└───────────────────────────────────────────────────────┘
```

## Dependency Graph

```
ElementSelector.tsx
├── React Hooks
│   ├── useState (state management)
│   ├── useEffect (lifecycle + events)
│   └── useCallback (memoized handlers)
│
├── Emotion
│   └── css (CSS-in-JS styling)
│
├── Utils
│   ├── shadowDOM.ts
│   │   ├── CHINESE_AESTHETIC_COLORS
│   │   ├── createShadowRoot()
│   │   └── mountReactInShadow()
│   │
│   ├── sanitization.ts
│   │   ├── sanitizeHTML() → isomorphic-dompurify
│   │   ├── extractRelevantStyles()
│   │   └── generateSelector()
│   │
│   ├── screenshot.ts
│   │   ├── captureElementScreenshot()
│   │   └── compressScreenshot()
│   │
│   └── storage.ts
│       ├── saveCard() → chrome.storage.local
│       ├── saveScreenshot() → idb
│       └── generateId()
│
└── Types
    ├── ClippedCard
    ├── ScreenshotData
    └── ElementMetadata
```

## Styling Layers

```
┌─────────────────────────────────────────────────────┐
│              Layer 5: Inline Styles                 │
│  Dynamic positioning (top, left, width, height)    │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│          Layer 4: Emotion CSS-in-JS                 │
│  Component-specific styles via css`` tagged         │
│  template literals                                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│      Layer 3: Shadow DOM Global Styles              │
│  Chinese aesthetic theme (CHINESE_AESTHETIC_STYLES) │
│  CSS custom properties (--color-*, --spacing-*)     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│          Layer 2: Browser Defaults                  │
│  Reset via * { box-sizing, margin, padding }       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│            Layer 1: Host Page Styles                │
│  ISOLATED - Cannot affect shadow DOM content        │
└─────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────┐
│                  User Action                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│              Try Capture Element                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ├─→ Success → Continue to storage
                     │
                     └─→ Error (catch block)
                         │
                         ├─→ console.error()
                         │
                         ├─→ alert('Failed to capture')
                         │
                         └─→ setIsCapturing(false)
                             (Reset state)
```

## Performance Characteristics

```
Operation               Time Complexity    Space Complexity
─────────────────────────────────────────────────────────
Mouse Move Handler      O(1)               O(1)
Element Selection       O(1)               O(1)
HTML Sanitization       O(n)               O(n)  [n = HTML length]
Style Extraction        O(1)               O(1)  [12 properties]
Selector Generation     O(d)               O(d)  [d = DOM depth]
Screenshot Capture      O(w*h)             O(w*h) [w,h = dimensions]
Screenshot Compression  O(w*h)             O(w*h)
Storage Write           O(n)               O(n)  [n = data size]

Total Capture Time: ~500-1500ms (depends on image size)
Memory Overhead: ~2-10MB per capture (screenshot dominates)
```

## Browser Extension Context

```
┌─────────────────────────────────────────────────────┐
│                Background Script                    │
│  (Service Worker / Persistent Background Page)     │
│                                                     │
│  • Listen for keyboard command (Cmd+Shift+E)       │
│  • Send message to active tab                      │
│  • Manage extension state                          │
└────────────────────┬────────────────────────────────┘
                     │ chrome.runtime.sendMessage()
                     ↓
┌─────────────────────────────────────────────────────┐
│                Content Script                       │
│  (Injected into web page)                          │
│                                                     │
│  • Listen for activation message                   │
│  • Create shadow DOM container                     │
│  • Mount ElementSelector component                 │
│  • Handle capture events                           │
│  • Clean up on close                               │
└────────────────────┬────────────────────────────────┘
                     │ Direct DOM manipulation
                     ↓
┌─────────────────────────────────────────────────────┐
│                Web Page (DOM)                       │
│  • Host page content (isolated)                    │
│  • ElementSelector overlay (shadow DOM)            │
└─────────────────────────────────────────────────────┘
```

## Component Lifecycle

```
Mount
  ↓
Setup Event Listeners (mousemove, click, keydown)
  ↓
Active State (isActive: true)
  ↓
  ├─→ Hover Phase (continuous)
  │   └─→ Update highlight + tooltip
  │
  ├─→ Capture Phase (on click)
  │   ├─→ Show loading
  │   ├─→ Capture data
  │   ├─→ Save to storage
  │   └─→ Show success dialog
  │
  └─→ Deactivate (ESC or close)
      └─→ Cleanup Event Listeners
          └─→ Unmount Component
```