# Nabokov Web Clipper

A Chrome extension for clipping web content and organizing it in a visual canvas.

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

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Type checking
npm run type-check
```

## Technology Stack

- React 18.3.1
- TypeScript 5.3
- Vite 5.0
- @xyflow/react 12.3.2 (for canvas visualization)
- IndexedDB via idb 8.0.0 (for local storage)
- Vitest (unit testing)
- Playwright (e2e testing)
- @crxjs/vite-plugin (Chrome extension support)

## Inspiration

This project name is inspired by [Nabokov's Cards](https://dl.acm.org/doi/abs/10.1145/3698061.3726916), a research project on organizing web content with LLM-powered visual canvas.

## License

MIT