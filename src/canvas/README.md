# Canvas Module

The Canvas module provides a visual interface for organizing and viewing clipped web content using React Flow.

## Files

### Core Components

- **Canvas.tsx** - Main canvas application with React Flow setup
- **index.tsx** - React entry point
- **index.html** - HTML entry point for the canvas page

### Components

- **CardNode.tsx** - Custom React Flow node component for displaying cards
- **Toolbar.tsx** - Toolbar with search, zoom controls, and stats

### Hooks

- **useCanvasState.ts** - Custom hook for managing canvas state, loading cards, and auto-saving

## Features

### Canvas Features
- Drag and drop cards to organize them
- Auto-save positions after 2 seconds of inactivity
- Zoom in/out and fit view controls
- MiniMap for navigation
- Chinese aesthetic design with paper texture

### Card Node Features
- Display card content with truncation
- Show metadata (domain, title, timestamp)
- Star indicator for favorited cards
- Tags display
- Favicon display

### Toolbar Features
- Search/filter cards (placeholder)
- Zoom controls
- Sort options (date, starred, domain)
- Storage stats display
- Settings button (placeholder)

## Usage

The canvas is accessible via `chrome-extension://[extension-id]/canvas.html`

## Chinese Aesthetic

The canvas uses a Chinese-inspired design:
- Paper texture background (#FAF7F2)
- Ink wash color palette
- Gold accents (#D4AF37)
- Subtle shadows for depth
- Dot grid pattern

## Data Flow

1. **Load**: Cards are loaded from `chrome.storage.local` on mount
2. **Display**: Cards are converted to React Flow nodes
3. **Interact**: User can drag, zoom, and arrange cards
4. **Save**: Position/size changes are debounced and auto-saved to storage

## Types

See `/src/types/card.ts` for complete type definitions:
- `Card` - Core card data structure
- `CanvasState` - Canvas viewport and cards
- `StorageStats` - Storage usage statistics