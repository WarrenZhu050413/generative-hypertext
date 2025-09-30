# Keyboard Shortcuts System

A comprehensive keyboard shortcuts system for the Nabokov Web Clipper canvas interface.

## Features

### Core Functionality
- Global keyboard event listener with platform detection
- Customizable shortcuts configuration
- Help overlay with grouped shortcuts display
- Settings panel with full customization
- Visual feedback for shortcut actions
- Screen reader support and accessibility

### Default Keyboard Shortcuts

#### Navigation
- `Cmd/Ctrl + K` - Focus search input
- `Cmd/Ctrl + N` - Open canvas in new tab
- `Escape` - Clear search / Close modals
- `?` - Show keyboard shortcuts help

#### View Controls
- `Cmd/Ctrl + =` - Zoom in
- `Cmd/Ctrl + -` - Zoom out
- `F` - Fit all cards in view

#### Filters
- `Cmd/Ctrl + F` - Toggle filter panel
- `S` - Toggle starred filter
- `1-9` - Quick filter by tag position

## Architecture

### Files Structure

```
src/
├── utils/
│   └── keyboardShortcuts.ts     # Core shortcuts manager and utilities
├── components/
│   └── KeyboardHelp.tsx         # Help overlay modal
├── canvas/
│   ├── SettingsPanel.tsx        # Settings configuration UI
│   ├── Canvas.tsx               # Main integration
│   └── keyboardShortcuts.css    # Animations and styles
```

### Core Components

#### 1. Keyboard Shortcut Manager (`keyboardShortcuts.ts`)

The central manager for all keyboard shortcuts:

```typescript
import { globalShortcutManager, KeyboardShortcut } from '@/utils/keyboardShortcuts';

// Register a shortcut
globalShortcutManager.register({
  id: 'myShortcut',
  key: 'k',
  modifier: 'meta',
  description: 'Do something',
  category: 'navigation',
  handler: () => console.log('Shortcut triggered'),
  enabled: true,
});

// Start listening
globalShortcutManager.start();

// Stop listening
globalShortcutManager.stop();
```

**Key Features:**
- Platform-specific modifier keys (Cmd on Mac, Ctrl on Windows/Linux)
- Automatic conflict prevention with input fields
- Event matching and validation
- Storage persistence for user configurations

#### 2. Help Overlay (`KeyboardHelp.tsx`)

Modal displaying all available shortcuts, grouped by category:

```typescript
<KeyboardHelp
  shortcuts={shortcuts}
  isOpen={showHelp}
  onClose={() => setShowHelp(false)}
/>
```

**Features:**
- Chinese aesthetic styling
- Platform-specific key display
- Category grouping (Navigation, View, Filters, Canvas)
- Keyboard navigation support
- ESC to close

#### 3. Settings Panel (`SettingsPanel.tsx`)

Comprehensive settings interface with four tabs:

```typescript
<SettingsPanel
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  stats={storageStats}
  onRefreshStats={refreshStats}
/>
```

**Tabs:**
1. **Shortcuts** - Enable/disable and customize shortcuts
2. **Theme** - Color theme preferences (light/dark)
3. **Storage** - Storage usage monitoring and data export
4. **Advanced** - Import/export settings, about information

### Integration Example

```typescript
import { useEffect, useState } from 'react';
import { globalShortcutManager, loadShortcutsConfig } from '@/utils/keyboardShortcuts';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { SettingsPanel } from '@/canvas/SettingsPanel';

function MyComponent() {
  const [showHelp, setShowHelp] = useState(false);
  const [shortcuts, setShortcuts] = useState([]);

  useEffect(() => {
    // Initialize shortcuts
    const initShortcuts = async () => {
      const config = await loadShortcutsConfig();
      const shortcutList = [
        {
          id: 'help',
          key: '?',
          description: 'Show help',
          category: 'navigation',
          handler: () => setShowHelp(true),
        },
        // ... more shortcuts
      ];

      shortcutList.forEach(s => globalShortcutManager.register(s));
      setShortcuts(shortcutList);
    };

    initShortcuts();
    globalShortcutManager.start();

    return () => globalShortcutManager.stop();
  }, []);

  return (
    <>
      <KeyboardHelp
        shortcuts={shortcuts}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
      {/* Your component content */}
    </>
  );
}
```

## Configuration

### Storage Structure

Shortcuts configuration is stored in Chrome's local storage:

```typescript
{
  "nabokov_shortcuts_config": {
    "focusSearch": {
      "key": "k",
      "modifier": "meta",
      "enabled": true
    },
    // ... other shortcuts
  }
}
```

### Customization

Users can customize shortcuts through the Settings Panel:

1. Click the Settings icon in the toolbar
2. Navigate to "Shortcuts" tab
3. Toggle shortcuts on/off
4. Save changes

### Import/Export

Users can backup and restore their configuration:

```typescript
// Export all settings
const settings = await chrome.storage.local.get(null);
const json = JSON.stringify(settings);
// Download as JSON file

// Import settings
const imported = JSON.parse(fileContents);
await chrome.storage.local.set(imported);
```

## Accessibility

### Screen Reader Support

All interactive elements include proper ARIA labels:

```typescript
<button
  aria-label="Close help"
  role="button"
  onClick={onClose}
>
  ×
</button>
```

### Visual Feedback

Keyboard actions trigger toast notifications:

```typescript
const showFeedback = (message: string) => {
  setFeedbackMessage(message);
  setTimeout(() => setFeedbackMessage(null), 2000);
};
```

### Focus Management

- Search input receives focus with `Cmd/Ctrl + K`
- Modals trap focus within them
- ESC key closes modals and returns focus

## Platform Support

### macOS
- Uses `Cmd` (⌘) as primary modifier
- `Option` for alt
- Platform detection via `navigator.platform`

### Windows/Linux
- Uses `Ctrl` as primary modifier
- `Alt` for alternative actions
- Automatic fallback handling

### Modifier Key Mapping

```typescript
function getModifierKey(): 'Cmd' | 'Ctrl' {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
    ? 'Cmd'
    : 'Ctrl';
}
```

## Styling

### Chinese Aesthetic Theme

The UI follows a consistent Chinese-inspired aesthetic:

- **Colors**: Warm paper tones (#FAF7F2, #F5F0E8)
- **Accent**: Gold (#D4AF37)
- **Typography**: Clean, readable system fonts
- **Borders**: Subtle, organic (#B89C82)

### Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## API Reference

### KeyboardShortcut Interface

```typescript
interface KeyboardShortcut {
  id: string;                    // Unique identifier
  key: string;                   // Key to press (e.g., 'k', 'Escape')
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
  description: string;           // Human-readable description
  category: ShortcutCategory;    // Group for organization
  handler: () => void;           // Function to execute
  enabled?: boolean;             // Whether shortcut is active
}
```

### ShortcutCategory Type

```typescript
type ShortcutCategory = 'navigation' | 'canvas' | 'filters' | 'view';
```

### KeyboardShortcutManager Methods

```typescript
class KeyboardShortcutManager {
  register(shortcut: KeyboardShortcut): void;
  unregister(id: string): void;
  get(id: string): KeyboardShortcut | undefined;
  getAll(): KeyboardShortcut[];
  getByCategory(category: ShortcutCategory): KeyboardShortcut[];
  setEnabled(enabled: boolean): void;
  start(): void;
  stop(): void;
}
```

## Best Practices

### 1. Shortcut Design
- Use platform conventions (Cmd on Mac, Ctrl elsewhere)
- Avoid conflicts with browser shortcuts
- Group related actions together
- Provide visual feedback for all actions

### 2. Accessibility
- Include ARIA labels for all interactive elements
- Support keyboard navigation
- Provide alternative ways to access features
- Announce state changes to screen readers

### 3. User Experience
- Show help overlay with `?`
- Display current shortcuts in tooltips
- Allow customization in settings
- Save user preferences automatically

### 4. Performance
- Debounce rapid key presses
- Use event delegation
- Clean up listeners on unmount
- Cache shortcut configurations

## Testing

### Manual Testing Checklist

- [ ] All default shortcuts work as expected
- [ ] Platform detection works on Mac/Windows/Linux
- [ ] Help overlay displays correctly
- [ ] Settings panel allows customization
- [ ] Shortcuts persist after reload
- [ ] No conflicts with browser shortcuts
- [ ] Screen reader announces actions
- [ ] Keyboard navigation works in all modals
- [ ] Visual feedback appears for all actions
- [ ] Export/import functionality works

### Browser Compatibility

Tested on:
- Chrome 120+
- Edge 120+
- Firefox 121+ (via WebExtensions API)

## Future Enhancements

- [ ] Custom key binding editor
- [ ] Shortcut recording interface
- [ ] Conflict detection and warnings
- [ ] Shortcut chaining/sequences
- [ ] Context-sensitive shortcuts
- [ ] Shortcut usage analytics
- [ ] Multi-language support
- [ ] Dark theme support

## Troubleshooting

### Shortcuts Not Working

1. Check if shortcuts are enabled in settings
2. Verify no input field is focused
3. Check browser console for errors
4. Try resetting to default configuration

### Conflicts with Browser Shortcuts

Some browser shortcuts cannot be overridden:
- `Cmd/Ctrl + T` (new tab)
- `Cmd/Ctrl + W` (close tab)
- `Cmd/Ctrl + Tab` (switch tabs)

Choose alternative key combinations for these actions.

### Storage Issues

If settings aren't persisting:
1. Check Chrome storage quota
2. Verify extension permissions
3. Export settings as backup
4. Clear and reimport if corrupted

## License

This keyboard shortcuts system is part of the Nabokov Web Clipper extension.