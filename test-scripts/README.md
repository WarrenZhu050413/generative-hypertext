# Test Scripts

Manual test scripts for Nabokov Web Clipper using Playwright.

## Directory Structure

### `tests/` - Test Scripts

Playwright-based test scripts for manual testing and verification. These scripts bypass `chrome://extensions` limitations by using persistent contexts.

**Feature Tests:**
- `test-all-features.mjs` - Comprehensive feature test suite
- `test-canvas-direct.mjs` - Direct canvas testing (recommended)
- `test-canvas-load.mjs` - Canvas loading and rendering
- `test-capture.mjs` - Element capture functionality
- `test-card-generation.mjs` - Card generation from buttons
- `test-card-generation-console.mjs` - Card generation with console output
- `test-card-generation-debug.mjs` - Card generation debugging
- `test-llm-hyperlinks.mjs` - LLM hyperlinks and instant expansion
- `test-llm-direct.mjs` - Direct LLM API testing
- `test-floating-windows.mjs` - Floating window functionality

**Extension Tests:**
- `test-extension.mjs` - Basic extension loading
- `test-extension-basic.mjs` - Minimal extension test
- `test-ext.mjs` - Extension functionality

**API Tests:**
- `test-api-integration.mjs` - Claude API integration
- `test-api-detailed.mjs` - Detailed API testing
- `test-sdk-auth.mjs` - SDK authentication testing
- `test-agent-subscriptions.mjs` - Agent subscription testing

**Utility Tests:**
- `test-storage-debug.mjs` - Storage debugging and inspection

### `debug/` - Debug Assets

HTML pages, screenshots, and other debug assets for manual testing.

**Debug Pages:**
- `debug-storage.html` - Storage inspection interface
- `canvas-standalone.html` - Standalone canvas for testing
- `manual-test.html` - Manual test interface
- `test-page.html` - Generic test page

**Screenshots:**
- `canvas-debug.png` - Canvas debugging screenshot
- `floating-window-*.png` - Floating window states
- `test-*.png` - Test result screenshots

## Usage

### Running Tests

All test scripts use Playwright with persistent context to load the Chrome extension:

```bash
# Most common - direct canvas testing
node test-scripts/tests/test-canvas-direct.mjs

# Test specific features
node test-scripts/tests/test-card-generation.mjs
node test-scripts/tests/test-llm-hyperlinks.mjs

# Run comprehensive test suite
node test-scripts/tests/test-all-features.mjs
```

### Prerequisites

1. Build the extension first:
   ```bash
   npm run build
   ```

2. Extension will be loaded from `dist/` directory

### Debug Mode

Most tests support a `DEBUG` environment variable:

```bash
DEBUG=1 node test-scripts/tests/test-canvas-direct.mjs
```

## Test Pattern

All test scripts follow this pattern:

```javascript
import { chromium } from 'playwright';
import path from 'path';

const extensionPath = path.join(process.cwd(), 'dist');

const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});

const page = await context.newPage();
// ... test code ...
```

This bypasses `chrome://extensions` page restrictions and allows direct testing of the extension.

## Common Issues

**Extension not loading:**
- Ensure `npm run build` completed successfully
- Check that `dist/` directory exists and contains manifest.json

**Tests timing out:**
- Increase timeout in individual tests
- Check Chrome console for errors
- Use debug mode for detailed output

**Storage not persisting:**
- Tests use empty persistent context (ephemeral)
- Each test run starts with clean state
- Use `test-storage-debug.mjs` to inspect storage

## Related Documentation

- [MANUAL_TEST_GUIDE.md](../docs/testing/MANUAL_TEST_GUIDE.md) - Manual testing procedures
- [TESTING_GUIDE.html](../docs/TESTING_GUIDE.html) - Comprehensive testing guide
- [QUICK_DEBUG_GUIDE.md](../docs/QUICK_DEBUG_GUIDE.md) - Debugging tips
