# Development Guide

## Chrome Extension Development Workflow

When developing the Chrome extension, you have **two options** to avoid manually rebuilding after every change:

---

## Option 1: Symbolic Links (Recommended ⭐)

**Best for**: Fast iteration, instant changes, minimal overhead

### Setup (One-time):
```bash
npm run dev:symlinks
```

This creates symbolic links from `dist/unpacked/` to your source directories:
- `dist/unpacked/hypertext` → `hypertext/` (source)
- `dist/unpacked/extension` → `extension/` (source)

### Workflow:
1. Run `npm run dev:symlinks` once
2. Load extension in Chrome from `dist/unpacked/`
3. Edit source files in `hypertext/` or `extension/`
4. **Just reload the extension** in Chrome (🔄 button)
5. Your changes appear immediately - no rebuild needed!

### Advantages:
- ✅ Instant - no build step
- ✅ Simple - just reload extension
- ✅ No background process
- ✅ Same file edited in both demo and extension

### Revert to Normal Build:
If you want to go back to copied files instead of symlinks:
```bash
npm run build:unpacked
```

---

## Option 2: Watch Mode (Auto-Rebuild)

**Best for**: When you want to test the actual build process

### Start Watching:
```bash
npm run dev:watch
```

This will:
1. Build immediately
2. Watch for changes in `hypertext/`, `extension/`, and `manifest.json`
3. Automatically rebuild when files change (300ms debounce)
4. Print status messages

### Workflow:
1. Run `npm run dev:watch` in a terminal
2. Keep it running in the background
3. Edit source files
4. Watch rebuilds automatically
5. Reload extension in Chrome after each build

### Advantages:
- ✅ Tests actual build process
- ✅ Catches build errors early
- ✅ Good for debugging build issues

### Stop Watching:
Press `Ctrl+C` in the terminal

---

## Which Should I Use?

| Scenario | Use |
|----------|-----|
| **Daily development** | Option 1: Symlinks |
| **Testing build process** | Option 2: Watch mode |
| **Production release** | `npm run build:unpacked` (one-time) |
| **Demo page testing** | Just open `demo/*.html` - no build needed! |

---

## Quick Reference

```bash
# Development (choose one)
npm run dev:symlinks     # Symlink source to dist/unpacked (instant)
npm run dev:watch        # Watch and auto-rebuild

# Production build
npm run build:unpacked   # Build for release

# Testing
npx playwright test tests/hypertext-auto-pin.spec.mjs   # Test auto-pin
npx playwright test tests/hypertext-simple.spec.mjs     # Test basic features
```

---

## Troubleshooting

### "Extension loads old code after editing"

**If using symlinks:**
- Make sure you ran `npm run dev:symlinks`
- Check that `dist/unpacked/hypertext` is a symlink (shows `->` in `ls -la`)
- Hard refresh in Chrome (Cmd+Shift+R)

**If using watch mode:**
- Check the terminal - did the rebuild succeed?
- Wait for "Build complete!" message
- Then reload extension

### "Auto-pin still doesn't work"

1. Check which file Chrome is loading:
   ```bash
   ls -lh dist/unpacked/hypertext/hypertext-experience.js
   ```
   Should be 80KB and dated today (or a symlink)

2. In Chrome DevTools Console, verify:
   ```javascript
   // After generating a hypertext
   const sessions = window.hypertextExperience.getSessions();
   const session = Array.from(sessions.values())[0];
   console.log('isPinned:', session.isPinned);  // Should be true
   ```

### "Symlinks don't work on Windows"

Windows requires admin rights for symlinks. Instead:
- Use **Option 2: Watch Mode** (`npm run dev:watch`)
- Or manually run `npm run build:unpacked` after changes
