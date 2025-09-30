# Nabokov Web Clipper - Build & Configuration Summary

## Overview
A Chrome extension for clipping web content and organizing it in a visual canvas using React Flow.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
# Start dev server (for canvas page development)
npm run dev

# Build extension for loading in Chrome
npm run build:extension

# Watch mode for continuous building
npm run watch:extension
```

### Load Extension in Chrome
1. Run `npm run build:extension`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

### Package for Distribution
```bash
npm run package:extension
```
Creates `nabokov-web-clipper-vX.X.X.zip` in project root.

---

## Project Structure

```
NabokovsWeb/
├── src/
│   ├── manifest.json           # Chrome extension manifest
│   ├── background/
│   │   └── index.ts           # Background service worker
│   ├── content/
│   │   ├── index.ts           # Content script entry
│   │   ├── mount.tsx          # React mounting with Shadow DOM
│   │   └── styles.css         # Minimal global styles
│   ├── canvas/
│   │   ├── index.html         # Canvas page HTML
│   │   ├── index.tsx          # Canvas entry point
│   │   ├── Canvas.tsx         # Main canvas component (React Flow)
│   │   ├── CardNode.tsx       # Card node component
│   │   └── Toolbar.tsx        # Canvas toolbar
│   ├── components/
│   │   ├── ElementSelector.tsx # Element selection UI
│   │   └── FloatingChat.tsx    # Chat interface
│   └── utils/
│       ├── storage.ts          # IndexedDB utilities
│       ├── shadowDOM.ts        # Shadow DOM + Emotion setup
│       ├── screenshot.ts       # Screenshot capture
│       └── ...
├── public/
│   └── icons/                  # Extension icons (SVG placeholders)
├── scripts/
│   ├── build-extension.sh      # Build script
│   ├── package-extension.sh    # Packaging script
│   └── create-icons.js         # Icon generation
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

---

## Key Configuration Files

### 1. manifest.json
Location: `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/src/manifest.json`

**Key Features:**
- **Manifest V3** compliance
- **Permissions**: `activeTab`, `storage`, `contextMenus`, `scripting`, `tabs`
- **Background**: Service worker with ES modules
- **Content Scripts**: Auto-injected on all URLs
- **Web Accessible Resources**: Canvas HTML/JS/CSS
- **CSP**: Allows inline styles for Emotion, WASM for potential future use
- **Icons**: SVG placeholders (convert to PNG for production)

**Important Settings:**
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; style-src 'self' 'unsafe-inline';"
  },
  "web_accessible_resources": [
    {
      "resources": ["src/canvas/index.html", "src/canvas/*.js", "src/canvas/*.css"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 2. vite.config.ts
Location: `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/vite.config.ts`

**Key Features:**
- **@crxjs/vite-plugin**: Handles extension bundling
- **React with Emotion**: Configured for CSS-in-JS
- **Path Aliases**: `@/`, `@components/`, `@utils/`, `@types/`
- **Build Output**: Organized asset structure

**Important Settings:**
```typescript
{
  react({
    jsxImportSource: '@emotion/react',
    babel: {
      plugins: ['@emotion/babel-plugin'],
    },
  }),
  crx({ manifest }),
}
```

### 3. package.json Scripts
Location: `/Users/wz/Desktop/zPersonalProjects/NabokovsWeb/package.json`

**Build Scripts:**
- `dev`: Vite dev server (port 5173)
- `build`: TypeScript check + Vite build
- `build:extension`: Full extension build with assets
- `watch:extension`: Watch mode for development
- `package:extension`: Build + create ZIP package
- `type-check`: TypeScript validation only

**Test Scripts:**
- `test`: Run unit tests (Vitest)
- `test:watch`: Watch mode for tests
- `test:e2e`: Playwright end-to-end tests

---

## Architecture

### Extension Components

#### 1. Background Script
**File**: `src/background/index.ts`

**Responsibilities:**
- Creates context menu items
- Handles extension icon clicks
- Opens canvas in new tab
- Routes messages between content scripts and canvas

**Key Code:**
```typescript
chrome.contextMenus.create({
  id: 'clip-to-canvas',
  title: 'Clip to Canvas',
  contexts: ['selection', 'image', 'link', 'page']
});
```

#### 2. Content Script
**Files**:
- `src/content/index.ts` - Entry point
- `src/content/mount.tsx` - React mounting logic

**Responsibilities:**
- Listens for messages from background script
- Mounts element selector UI in Shadow DOM
- Isolates styles from host page

**Key Features:**
- Shadow DOM isolation
- Emotion CSS-in-JS with cache
- Clean mount/unmount lifecycle

#### 3. Canvas Page
**Files**:
- `src/canvas/index.html` - HTML entry
- `src/canvas/index.tsx` - React entry
- `src/canvas/Canvas.tsx` - Main component

**Responsibilities:**
- Displays clipped content as cards
- Uses React Flow for node management
- Stores data in IndexedDB
- Provides card editing/organizing tools

**Key Technologies:**
- React Flow (@xyflow/react)
- IndexedDB (idb)
- Emotion styled components

### Style Architecture

#### Shadow DOM + Emotion
**File**: `src/utils/shadowDOM.ts`

**Why Shadow DOM?**
- Isolates extension UI from host page styles
- Prevents CSS conflicts
- Allows Emotion to work in content scripts

**Key Utilities:**
```typescript
createShadowRoot('element-id')
  // Creates shadow root + Emotion cache
  // Returns: { shadowRoot, styleCache, container }

mountReactInShadow(shadowRoot, <Component />)
  // Mounts React with Emotion provider
```

**Chinese Aesthetic Theme:**
- Pre-configured color palette
- Traditional design principles
- CSS custom properties
- Responsive spacing system

---

## Build Process

### Build Flow
1. **Type Check**: `tsc --noEmit`
2. **Vite Build**: Bundles all entry points
3. **Asset Copy**: Icons from public/ to dist/
4. **Manifest**: Copied to dist/

### Entry Points
The `@crxjs/vite-plugin` automatically handles:
- `src/background/index.ts` → background service worker
- `src/content/index.ts` → content script
- `src/canvas/index.html` → canvas page

### Output Structure
```
dist/
├── manifest.json
├── icons/
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
├── src/
│   ├── background/
│   ├── content/
│   └── canvas/
└── assets/
    └── [hashed chunks]
```

---

## Development Workflow

### Testing Content Script
1. Make changes to `src/content/`
2. Run `npm run build:extension`
3. Reload extension in `chrome://extensions/`
4. Test on any webpage

### Testing Canvas
1. Make changes to `src/canvas/`
2. Run `npm run dev` for hot reload
3. Or use `npm run watch:extension` + manual reload

### Debugging
- **Background**: Inspect service worker from extensions page
- **Content**: DevTools on any page (check for Shadow DOM)
- **Canvas**: Regular DevTools on canvas tab

---

## Production Checklist

### Before Publishing

#### 1. Icons
- [ ] Convert SVG to PNG (16px, 48px, 128px)
- [ ] Update manifest.json to reference .png files
- [ ] Test icons on light/dark Chrome themes

#### 2. Manifest
- [ ] Update version number
- [ ] Verify all permissions are necessary
- [ ] Add detailed description
- [ ] Review CSP policy

#### 3. Testing
- [ ] Test on major websites (Wikipedia, GitHub, YouTube, etc.)
- [ ] Test all context menu actions
- [ ] Test canvas CRUD operations
- [ ] Test data persistence (reload extension)
- [ ] Test error handling

#### 4. Performance
- [ ] Check bundle size
- [ ] Optimize images/assets
- [ ] Test on slow connections
- [ ] Profile memory usage

#### 5. Documentation
- [ ] Update extension description
- [ ] Create user guide
- [ ] Prepare store screenshots
- [ ] Write privacy policy if needed

#### 6. Security
- [ ] Review all permissions
- [ ] Sanitize user inputs
- [ ] Check for XSS vulnerabilities
- [ ] Validate CSP compliance

---

## Troubleshooting

### Extension Won't Load
**Symptoms**: Error on `chrome://extensions/`

**Solutions:**
- Check `dist/manifest.json` exists and is valid
- Run `npm run type-check` for TypeScript errors
- Clear `dist/` and rebuild
- Check Chrome console for specific errors

### Content Script Not Injecting
**Symptoms**: Context menu works but no UI appears

**Solutions:**
- Check CSP of target page (some pages block extensions)
- Verify Shadow DOM is created (inspect page DOM)
- Check content script console for errors
- Ensure `matches` pattern in manifest is correct

### Styles Not Working
**Symptoms**: UI appears but unstyled

**Solutions:**
- Verify Emotion cache is created in Shadow DOM
- Check `CacheProvider` wraps components
- Inspect Shadow DOM styles
- Check CSP allows inline styles

### Canvas Not Opening
**Symptoms**: Clicking icon does nothing

**Solutions:**
- Check background script console
- Verify `web_accessible_resources` in manifest
- Check browser popup blocker
- Ensure canvas HTML path is correct

### Build Errors
**Common Issues:**

1. **TypeScript errors**:
   ```bash
   npm run type-check
   ```

2. **Missing dependencies**:
   ```bash
   npm install
   ```

3. **Vite plugin issues**:
   - Update `@crxjs/vite-plugin` to latest
   - Check manifest.json syntax

4. **Path resolution**:
   - Verify path aliases in `vite.config.ts`
   - Check `tsconfig.json` paths match

---

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin/)
- [React Flow](https://reactflow.dev/)
- [Emotion Documentation](https://emotion.sh/docs/introduction)
- [Shadow DOM Guide](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

---

## Support & Contributing

### Reporting Issues
1. Check existing issues
2. Provide browser version
3. Include console errors
4. Describe steps to reproduce

### Local Development
```bash
# Clone repo
git clone <repo-url>
cd NabokovsWeb

# Install
npm install

# Build
npm run build:extension

# Test
npm run test
npm run test:e2e
```

---

## License
[Add license information]

## Author
Fucheng Warren Zhu

---

**Last Updated**: 2025-09-29