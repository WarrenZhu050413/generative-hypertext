# Nabokov Web Clipper

A Chrome extension for capturing web content and organizing it on an interactive visual canvas. Built with React, TypeScript, and React Flow, Nabokov combines powerful web clipping with LLM-powered features to help you curate and explore knowledge.

## ✨ Key Features

- **🎯 Smart Element Selection** - Click-to-capture any element from web pages with visual highlighting
- **🎨 Interactive Canvas** - Organize captured content on an infinite canvas with drag-and-drop
- **🤖 AI-Powered Chat** - Built-in Claude integration for conversations with your captured content
- **🔗 Visual Connections** - Create relationships between cards with typed connections (references, generated-from, contradicts, etc.)
- **📥 Stash System** - Chrome Side Panel for temporarily stashing cards before adding to canvas
- **🖼️ Image Support** - Drag-and-drop image uploads with inline display and proper aspect ratio
- **✨ Content Beautification** - AI-powered content enhancement and restructuring
- **🎛️ Custom Actions** - Configurable action buttons with template-based prompts (Summarize, Learn More, Critique, etc.)
- **🔍 Advanced Filtering** - Search, filter by domain/tags/dates, with persistent filter state
- **⌨️ Keyboard Shortcuts** - Cmd+Shift+E (stash), Ctrl+Shift+E (canvas), Ctrl+Shift+C (inline chat)
- **💬 Floating Chat Windows** - Resizable, draggable chat windows with canvas/stash save options
- **📝 Inline Editing** - Double-click to edit card content directly on canvas

## Quick Links

- **📚 [Documentation](./docs/README.md)** - Complete documentation index
- **🚀 [Quick Start](./docs/QUICK_START.md)** - Get started in 5 minutes
- **🏗️ [Architecture](./docs/architecture/DESIGN.md)** - System design and technical details
- **🧪 [Testing Guide](./docs/testing/MANUAL_TEST_GUIDE.md)** - Manual testing procedures
- **📋 [Project Status](./docs/project/PROJECT_STATUS.md)** - Current status and roadmap

## Project Structure

```
NabokovsWeb/
├── src/                      # Source code
│   ├── background/           # Service worker (Manifest V3)
│   ├── content/              # Content scripts for element selection
│   ├── canvas/               # Canvas React app (React Flow)
│   ├── sidepanel/            # Chrome Side Panel for stashed cards
│   ├── components/           # Shared React components
│   ├── services/             # API services (Claude, card generation, etc.)
│   ├── utils/                # Utility functions (storage, sanitization, etc.)
│   ├── types/                # TypeScript type definitions
│   ├── config/               # Configuration (default buttons, etc.)
│   └── manifest.json         # Chrome extension manifest
├── docs/                     # Documentation (organized by category)
│   ├── architecture/         # System design and technical architecture
│   ├── implementation/       # Development guides and feature docs
│   ├── research/             # User research and competitive analysis
│   ├── testing/              # Test guides and reports
│   └── project/              # Project status, roadmaps, and TODOs
├── test-scripts/             # Manual Playwright test scripts
│   ├── tests/                # Test scripts (.mjs)
│   └── debug/                # Debug assets (.html, .png)
├── tests/                    # Automated tests (Vitest + Playwright)
│   ├── unit/                 # Unit tests
│   ├── e2e/                  # End-to-end tests
│   ├── fixtures/             # Test fixtures
│   └── utils/                # Test utilities
├── scripts/                  # Build and utility scripts
├── public/                   # Static assets (icons, etc.)
├── archive/                  # Deprecated/old code
├── dist/                     # Build output (gitignored)
└── coverage/                 # Test coverage reports (gitignored)
```

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NabokovsWeb.git
   cd NabokovsWeb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Development Commands

```bash
# Build extension
npm run build              # Production build
npm run watch:extension    # Watch mode for development

# Backend server (for Claude API via subscription)
npm run backend            # Start backend server
npm run backend:dev        # With auto-reload

# Testing
npm test                   # Unit tests (Vitest)
npm run test:watch         # Unit tests in watch mode
npm run test:coverage      # With coverage report
npm run test:e2e           # E2E tests (Playwright, headless)
npm run test:e2e:headed    # E2E tests with browser UI
npm run test:e2e:debug     # E2E tests in debug mode

# Type checking
npm run type-check         # TypeScript type checking
```

### Configuration

**Claude API Setup** (optional, for AI features):

1. **Option 1: Local Backend** (Recommended - uses Claude.ai subscription)
   - Start backend: `npm run backend`
   - No separate API key needed if you have Claude subscription

2. **Option 2: Direct API** (requires separate API billing)
   - Get API key from https://console.anthropic.com
   - Open Canvas → Click settings icon
   - Enter API key in "API Settings"

See `backend/README.md` for detailed backend setup instructions.

## 🏗️ Architecture

### Core Components

- **Background Service Worker** - Handles keyboard shortcuts and extension lifecycle (Manifest V3)
- **Content Scripts** - Injected element selector and inline chat window (Shadow DOM isolation)
- **Canvas Page** - React Flow-based infinite canvas for visual organization
- **Side Panel** - Chrome Side Panel for stashed cards with search/filter

### Data Flow

```
User Action (Cmd+Shift+E or Ctrl+Shift+E)
  ↓
Background Worker sends message
  ↓
Content Script mounts ElementSelector
  ↓
User clicks element → Capture HTML + sanitize
  ↓
Save to chrome.storage.local
  ↓
Canvas auto-refreshes via storage event listener
```

### Cross-Context Synchronization

All card operations broadcast updates via **dual event system**:
- **Local events** (`window.dispatchEvent`) for same-context listeners
- **Runtime messages** (`chrome.runtime.sendMessage`) for cross-context sync

This ensures Canvas and Side Panel stay synchronized in real-time.

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1, TypeScript 5.3, Vite 5.0
- **Canvas**: @xyflow/react 12.3.2 (React Flow)
- **Storage**: chrome.storage.local (~5MB limit)
- **Styling**: @emotion/react (CSS-in-JS)
- **LLM**: Claude API via Anthropic SDK / local backend
- **Testing**: Vitest (unit), Playwright (E2E)
- **Build**: @crxjs/vite-plugin (Chrome extension bundling)

## 🧪 Testing

This project has comprehensive test coverage:

- **215+ E2E tests** across 16 test suites covering all major features
- **100+ unit tests** with 100% coverage for shared services
- **Automated regression testing** to prevent feature breakage

Key test suites:
- Card operations (CRUD, editing, tagging, starring)
- Connection editing (relationships, types, labels)
- Stash operations (save/restore/delete, sync)
- Filtering (search, domains, tags, dates)
- Beautification (AI content enhancement)
- Custom buttons (action creation, generation)
- Font size controls (Canvas/Side Panel sync)

Run `npm run test:e2e:headed` to see tests in action.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture Design](./docs/architecture/DESIGN.md)** - System design and technical details
- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in 5 minutes
- **[Testing Guide](./docs/testing/MANUAL_TEST_GUIDE.md)** - Manual testing procedures
- **[Project Status](./docs/project/PROJECT_STATUS.md)** - Current status and roadmap
- **[Implementation Guides](./docs/implementation/)** - Feature-specific development docs

## 🎓 Research Citation

This project is inspired by [Nabokov's Cards](https://dl.acm.org/doi/abs/10.1145/3698061.3726916). I kindly thank the authors for their correspondence. 

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

For development guidelines, see [CLAUDE.md](./CLAUDE.md) for project instructions and architecture details.
