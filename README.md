# Nabokov Web Clipper

A Chrome extension for clipping web content and organizing it in a visual canvas.

## Project Structure

```
NabokovsWeb/
├── src/
│   ├── components/     # React components
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── background/     # Extension background scripts
│   ├── content/        # Content scripts
│   ├── canvas/         # Canvas application
│   └── manifest.json   # Chrome extension manifest
├── public/             # Static assets
├── tests/
│   ├── unit/          # Unit tests
│   ├── e2e/           # End-to-end tests
│   └── fixtures/      # Test fixtures
└── dist/              # Build output
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