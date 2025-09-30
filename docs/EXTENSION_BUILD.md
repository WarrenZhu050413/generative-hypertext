# Extension Build Guide

This guide covers building and developing the Nabokov Web Clipper Chrome extension.

## Quick Start

### Development Mode
```bash
# Start development server with hot reload
npm run dev

# Or watch mode for extension building
npm run watch:extension
```

### Building the Extension
```bash
# Build the extension (type check + vite build)
npm run build:extension

# Package as ZIP for distribution
npm run package:extension
```

### Loading in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Project Structure

```
src/
├── background/
│   └── index.ts          # Service worker (background script)
├── content/
│   ├── index.ts          # Content script entry
│   ├── mount.tsx         # React mounting logic
│   └── styles.css        # Global content styles
├── canvas/
│   ├── index.html        # Canvas page HTML
│   ├── index.tsx         # Canvas page entry
│   ├── Canvas.tsx        # Main canvas component
│   ├── CardNode.tsx      # Card node component
│   └── Toolbar.tsx       # Canvas toolbar
├── components/
│   ├── ElementSelector.tsx  # Element selection UI
│   └── FloatingChat.tsx     # Chat interface
├── utils/
│   ├── storage.ts        # IndexedDB utilities
│   ├── shadowDOM.ts      # Shadow DOM creation
│   ├── screenshot.ts     # Screenshot capture
│   └── ...
└── manifest.json         # Extension manifest

public/
└── icons/               # Extension icons
```

## Build Configuration

### vite.config.ts
- Uses `@crxjs/vite-plugin` for Chrome extension support
- Configured for Emotion CSS-in-JS
- Path aliases: `@/`, `@components/`, `@utils/`, `@types/`
- React with JSX transform

### manifest.json
Key configurations:
- **Permissions**: `activeTab`, `storage`, `contextMenus`, `scripting`, `tabs`
- **Host Permissions**: `<all_urls>` (for content script injection)
- **Background**: Service worker with ES modules
- **Content Scripts**: Injected on all URLs with styles
- **Web Accessible Resources**: Canvas page accessible from content scripts
- **CSP**: Allows inline styles for Emotion

## Development Tips

### Testing Content Script
The content script is automatically injected on all pages. To test:
1. Right-click on any page
2. Select "Clip to Canvas" from context menu
3. Element selector UI should appear

### Testing Canvas
1. Click the extension icon in toolbar
2. Canvas opens in new tab
3. Test card creation and arrangement

### Debugging
- **Background Script**: `chrome://extensions/` → Click "service worker" link
- **Content Script**: Regular browser DevTools on any page
- **Canvas Page**: Regular browser DevTools on canvas tab

### Hot Reload
When using `npm run dev`:
- Canvas page changes reload automatically
- Content/background scripts require extension reload
- Click reload button in `chrome://extensions/`

## Scripts

### build-extension.sh
1. Cleans `dist/` directory
2. Runs TypeScript type checking
3. Builds with Vite
4. Copies icon assets

### package-extension.sh
1. Validates `dist/` exists
2. Reads version from manifest
3. Creates ZIP package: `nabokov-web-clipper-vX.X.X.zip`

## Common Issues

### Extension Not Loading
- Check manifest.json is in dist/
- Verify all paths in manifest are correct
- Check console for errors

### Content Script Not Working
- Verify injection in manifest content_scripts
- Check for CSP conflicts on target page
- Use Shadow DOM for style isolation

### Build Errors
- Run `npm run type-check` first
- Check for missing dependencies
- Clear `dist/` and rebuild

### Icon Issues
- SVG icons may not work in all Chrome versions
- Convert to PNG for production (see public/icons/README.md)

## Production Checklist

Before publishing:
- [ ] Convert icons to PNG format
- [ ] Update version in manifest.json
- [ ] Test on multiple websites
- [ ] Test all permissions are used/needed
- [ ] Review CSP policy
- [ ] Add proper error handling
- [ ] Test offline functionality
- [ ] Optimize bundle size
- [ ] Update extension description
- [ ] Prepare store screenshots
- [ ] Write privacy policy (if using external APIs)

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [@crxjs/vite-plugin Docs](https://crxjs.dev/vite-plugin/)
- [React Flow Docs](https://reactflow.dev/)