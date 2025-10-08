# Generative Hypertext

**Transform any text on the web into interactive, AI-powered hyperlinks.**

Generative Hypertext is a Chrome extension and JavaScript library that lets you select any text and instantly generate contextual explanations, references, or continue conversations—all inline without leaving the page.

## Features

✨ **Inline AI Tooltips** - Hover over generated hyperlinks to see explanations
💬 **Contextual Chat** - Continue conversations right in the tooltip
📍 **Auto-Pin on Generation** - Tooltips automatically pin when created
🔗 **Multi-Tooltip Support** - Have multiple conversations open simultaneously
📝 **Markdown Support** - Rich text formatting with proper newline handling
🎨 **Click-to-Front** - Click any tooltip to bring it to the front
⌨️ **Keyboard Shortcuts** - Quick access with Cmd/Ctrl+Shift+K

## Quick Start

### As a Chrome Extension

1. **Clone and setup**:
   ```bash
   git clone https://github.com/WarrenZhu050413/generative-hypertext.git
   cd generative-hypertext

   # Install extension dependencies
   npm install
   npm run dev:symlinks  # For development
   # OR: npm run build:unpacked  # For production

   # Setup backend
   cd backend
   npm install
   npm start  # Runs on http://localhost:3100
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/unpacked/` folder

3. **Use it**:
   - On any webpage, select text
   - Press `Cmd+Shift+K` (Mac) or `Ctrl+Shift+K` (Windows/Linux)
   - Click "Generate Hypertext"
   - Hover the red highlight to see the tooltip

### As a Standalone Demo

No build needed! Just open the demo:

```bash
open demo/hypertext_navigation_demo.html
```

Select "gradient descent" and press `Cmd+Shift+K` to try it out.

## Development

### Quick Setup (Recommended)

Use symbolic links for instant development workflow:

```bash
npm run dev:symlinks
```

Now edit source files and just reload the extension - no rebuild needed!

### Watch Mode

Automatically rebuild on file changes:

```bash
npm run dev:watch
```

### Testing

```bash
# Run all tests
npx playwright test

# Run specific test suites
npx playwright test tests/hypertext-simple.spec.mjs
npx playwright test tests/hypertext-auto-pin.spec.mjs
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development instructions.

## Architecture

```
generative-hypertext/
├── hypertext/
│   └── hypertext-experience.js    # Core hypertext runtime (80KB)
├── extension/
│   └── hypertext-loader.js        # Chrome extension loader
├── backend/
│   ├── server.mjs                 # API server for AI-powered tooltips
│   ├── lib/                       # Server utilities
│   └── tests/                     # Backend tests
├── demo/
│   └── hypertext_navigation_demo.html  # Standalone demo
├── dist/unpacked/                 # Built extension (symlinks in dev mode)
├── scripts/
│   ├── build-unpacked.js          # Production build
│   ├── setup-dev-symlinks.sh      # Development setup
│   └── watch-and-build.js         # Watch mode
└── tests/                         # Playwright tests
```

### Key Components

- **`hypertext-experience.js`**: The shared runtime used by both the extension and demo
- **Multi-tooltip architecture**: Each hypertext gets its own controller with isolated state
- **Auto-pin system**: Tooltips automatically pin after initial generation
- **Session management**: Tracks conversations, positions, and pinned state

## Configuration

### Backend Setup

The extension requires a backend API server to generate AI-powered tooltips.

**Start the backend:**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3100
```

See [backend/README.md](backend/README.md) for detailed backend setup and deployment instructions.

**Configure backend URL:**

**In demo pages:**
```javascript
window.HYPERTEXT_BACKEND_URL = 'https://your-api.com';
```

**In extension:**
Edit `extension/hypertext-loader.js` to change the default backend URL.

### API Format

The backend should accept POST requests to `/api/stream` and return Server-Sent Events:

```javascript
data: {"delta": {"text": "{\"pill\":\"Term\",\"mode\":\"explanation\",\"text\":\"Explanation here...\"}"}}

data: [DONE]
```

## Browser Support

- Chrome/Chromium 88+
- Edge 88+
- Other Chromium-based browsers

## Project History

This project evolved from an experiment in augmented reading experiences. Key milestones:

- **Initial prototype**: Single-tooltip inline chat
- **Multi-tooltip refactor**: Support for multiple simultaneous conversations
- **Auto-pin feature**: Tooltips persist after generation
- **Markdown support**: Rich text with proper formatting
- **Development tooling**: Symlink-based dev mode for instant iteration

See [docs/archive/](docs/archive/) for detailed implementation notes.

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details

## Credits

Created by Warren Zhu
Inspired by concepts from hypertext research and modern note-taking tools

## Links

- [Development Guide](DEVELOPMENT.md)
- [Claude.md Guidelines](CLAUDE.md)
- [Issue Tracker](https://github.com/WarrenZhu050413/generative-hypertext/issues)
