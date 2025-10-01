# File Artifacts Implementation Guide

## Overview

This document provides implementation guidance for adding file and screenshot uploads to Nabokov's Web, treating them as first-class artifacts alongside web clippings and notes.

**Inspiration**: tldraw computer's component model, where images, text, and audio are treated equally as canvas components with full interaction capabilities.

## Design Principles

1. **Universal Artifact Substrate**: Files use the same `Card` data structure as web clippings
2. **Conversational**: Files can have conversation threads, just like webpage artifacts
3. **Manipulable**: Files can be annotated, edited (for text), and linked to other artifacts
4. **Storage Strategy**: Leverage existing IndexedDB infrastructure (already used for screenshots)

## Architecture

### 1. Card Type Extension

Extend the existing `Card` interface to support file data:

```typescript
// src/types/card.ts

export interface FileData {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string; // Reference to IndexedDB blob or object URL
  extractedText?: string; // For PDFs, documents
  thumbnailUrl?: string; // For non-image files
  lastModified: number;
}

export interface Card {
  id: string;
  content: string; // For files: extracted text or description
  metadata: ClipMetadata;
  position?: CardPosition;
  size?: CardSize;
  starred: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  conversation?: Message[];
  screenshotId?: string;
  styles?: RelevantStyles;
  context?: string;

  // NEW: File data
  fileData?: FileData;
  artifactType: 'webpage' | 'note' | 'file' | 'generated'; // NEW: Distinguish artifact types
}
```

### 2. File Storage in IndexedDB

Extend the existing IndexedDB setup to store file blobs:

```typescript
// src/utils/fileStorage.ts

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'nabokov-clipper';
const FILE_STORE = 'files'; // New store alongside 'screenshots'

export async function initFileStorage(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 2, { // Increment version
    upgrade(db, oldVersion) {
      // Existing screenshot store
      if (!db.objectStoreNames.contains('screenshots')) {
        db.createObjectStore('screenshots');
      }

      // NEW: File store
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        const fileStore = db.createObjectStore(FILE_STORE);
        fileStore.createIndex('by-card-id', 'cardId');
      }
    },
  });
}

export async function saveFile(
  fileId: string,
  cardId: string,
  file: Blob
): Promise<void> {
  const db = await initFileStorage();
  await db.put(FILE_STORE, { blob: file, cardId }, fileId);
}

export async function getFile(fileId: string): Promise<Blob | undefined> {
  const db = await initFileStorage();
  const record = await db.get(FILE_STORE, fileId);
  return record?.blob;
}

export async function deleteFile(fileId: string): Promise<void> {
  const db = await initFileStorage();
  await db.delete(FILE_STORE, fileId);
}
```

### 3. Canvas Drag-and-Drop Integration

Add drag-and-drop to the Canvas component:

```typescript
// src/canvas/Canvas.tsx

import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { createFileArtifact } from '@/utils/fileArtifacts';

export const Canvas = () => {
  const reactFlowInstance = useReactFlow();

  // Handle file drops on canvas
  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return;

      // Get drop position in canvas coordinates
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create artifact for each file
      for (const file of files) {
        await createFileArtifact(file, position);
        position.y += 320; // Stack vertically
      }
    },
    [reactFlowInstance]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Existing ReactFlow setup */}
    </div>
  );
};
```

### 4. File Artifact Creation Utility

Create a utility to convert File objects to Card artifacts:

```typescript
// src/utils/fileArtifacts.ts

import { Card, FileData } from '@/types/card';
import { generateId } from '@/utils/storage';
import { saveFile } from '@/utils/fileStorage';
import { extractTextFromPDF } from '@/utils/pdfExtractor';
import { getCards, saveCards } from '@/utils/storage';

export async function createFileArtifact(
  file: File,
  position: { x: number; y: number }
): Promise<Card> {
  const fileId = generateId();
  const cardId = generateId();

  // Save file to IndexedDB
  await saveFile(fileId, cardId, file);

  // Extract text content for searchable files
  let extractedText: string | undefined;
  if (file.type === 'application/pdf') {
    extractedText = await extractTextFromPDF(file);
  } else if (file.type.startsWith('text/')) {
    extractedText = await file.text();
  }

  // Create file data
  const fileData: FileData = {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileUrl: fileId, // Reference to IndexedDB
    extractedText,
    lastModified: file.lastModified,
  };

  // Create card
  const card: Card = {
    id: cardId,
    content: extractedText || `File: ${file.name}`,
    metadata: {
      url: `file://${file.name}`,
      title: file.name,
      domain: 'local-file',
      timestamp: Date.now(),
    },
    position,
    size: { width: 300, height: 400 },
    starred: false,
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    fileData,
    artifactType: 'file',
  };

  // Save to storage
  const cards = await getCards();
  await saveCards([...cards, card]);

  return card;
}
```

### 5. File Card Node Renderer

Create a specialized renderer for file artifacts:

```typescript
// src/canvas/FileCardNode.tsx

import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Card } from '@/types/card';
import { getFile } from '@/utils/fileStorage';

interface FileCardNodeProps {
  data: {
    card: Card;
  };
}

export const FileCardNode = memo(({ data }: FileCardNodeProps) => {
  const { card } = data;
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Load file from IndexedDB
  useEffect(() => {
    if (card.fileData?.fileUrl) {
      getFile(card.fileData.fileUrl).then((blob) => {
        if (blob) {
          setFileUrl(URL.createObjectURL(blob));
        }
      });
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [card.fileData?.fileUrl]);

  const renderFilePreview = () => {
    const fileType = card.fileData?.fileType;

    if (fileType?.startsWith('image/')) {
      return (
        <img
          src={fileUrl || ''}
          alt={card.fileData?.fileName}
          style={styles.imagePreview}
        />
      );
    }

    if (fileType === 'application/pdf') {
      return (
        <div style={styles.pdfPreview}>
          <div style={styles.pdfIcon}>📄</div>
          <div style={styles.fileName}>{card.fileData?.fileName}</div>
          <div style={styles.fileInfo}>
            PDF • {formatFileSize(card.fileData?.fileSize || 0)}
          </div>
        </div>
      );
    }

    // Generic file
    return (
      <div style={styles.genericFile}>
        <div style={styles.fileIcon}>📎</div>
        <div style={styles.fileName}>{card.fileData?.fileName}</div>
        <div style={styles.fileInfo}>
          {card.fileData?.fileType} • {formatFileSize(card.fileData?.fileSize || 0)}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.card}>
      {/* File preview */}
      <div style={styles.previewArea}>
        {renderFilePreview()}
      </div>

      {/* Metadata footer */}
      <div style={styles.footer}>
        <div style={styles.timestamp}>
          {new Date(card.createdAt).toLocaleDateString()}
        </div>
        {card.tags && card.tags.length > 0 && (
          <div style={styles.tags}>
            {card.tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* React Flow handles */}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = {
  card: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(250, 247, 242, 0.98) 0%, rgba(242, 235, 225, 0.98) 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(184, 156, 130, 0.2)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    overflow: 'hidden',
  },
  previewArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
    borderRadius: '8px',
  },
  pdfPreview: {
    textAlign: 'center' as const,
  },
  genericFile: {
    textAlign: 'center' as const,
  },
  pdfIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  fileIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  fileName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#3E3226',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  fileInfo: {
    fontSize: '12px',
    color: '#8B7355',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid rgba(184, 156, 130, 0.15)',
  },
  timestamp: {
    fontSize: '11px',
    color: '#A89684',
  },
  tags: {
    display: 'flex',
    gap: '4px',
  },
  tag: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    background: 'rgba(212, 175, 55, 0.15)',
    color: '#8B7355',
    border: '1px solid rgba(212, 175, 55, 0.3)',
  },
};
```

### 6. Screenshot Capture Integration

For screenshot artifacts from the clipboard or screenshot tools:

```typescript
// src/utils/screenshotArtifacts.ts

export async function createScreenshotArtifact(
  imageBlob: Blob,
  position: { x: number; y: number }
): Promise<Card> {
  // Create a File object from the blob
  const file = new File([imageBlob], `screenshot-${Date.now()}.png`, {
    type: 'image/png',
  });

  // Use the same file artifact creation flow
  return createFileArtifact(file, position);
}

// Canvas paste handler
export function setupScreenshotPaste(canvasElement: HTMLElement) {
  canvasElement.addEventListener('paste', async (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          // Get center of viewport as drop position
          const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
          await createScreenshotArtifact(blob, position);
        }
      }
    }
  });
}
```

## Implementation Checklist

### Phase 1: Basic File Upload
- [ ] Extend `Card` interface with `fileData` and `artifactType` fields
- [ ] Create IndexedDB `files` store
- [ ] Implement `fileStorage.ts` utilities
- [ ] Add drag-and-drop to Canvas component
- [ ] Implement `createFileArtifact` utility
- [ ] Create `FileCardNode` component
- [ ] Register `FileCardNode` as custom node type in ReactFlow

### Phase 2: File Type Support
- [ ] Images: Direct blob rendering (already supported)
- [ ] PDFs: Add PDF.js for text extraction and preview
- [ ] Text files: Extract and display content
- [ ] Documents (.docx, .txt): Text extraction

### Phase 3: Advanced Features
- [ ] Clipboard paste for screenshots (Cmd+V)
- [ ] File picker button (alongside existing capture button)
- [ ] Thumbnail generation for non-image files
- [ ] File type icons and preview improvements
- [ ] Full-text search across file contents

### Phase 4: Conversation Integration
- [ ] Enable conversation threads on file artifacts (already supported by `Card.conversation`)
- [ ] Context-aware prompts for files (e.g., "Summarize this PDF")
- [ ] Multi-file conversations (query multiple files together)

## Testing Strategy

### Unit Tests
- File storage CRUD operations
- Card creation with various file types
- File size validation and limits

### Integration Tests
- Drag-and-drop file upload flow
- File artifact rendering on canvas
- Conversation with file artifacts
- Cross-artifact linking (file ↔ webpage ↔ note)

### Manual Testing
1. Drag image onto canvas → verify renders correctly
2. Drag PDF → verify metadata extraction
3. Have conversation with file artifact
4. Link file to webpage artifact
5. Search for text within uploaded files
6. Paste screenshot from clipboard

## Storage Considerations

### IndexedDB Quotas
- **Chrome**: ~60% of available disk space (typically several GB)
- **Firefox**: ~50% of available disk space
- **Safari**: 1GB (user can grant more)

### File Size Limits
Recommended limits:
- Images: 10MB max
- PDFs: 50MB max
- Documents: 25MB max
- Total storage: Monitor and warn at 80% quota usage

### Cleanup Strategy
- Delete file blobs when cards are deleted
- Implement storage quota monitoring
- Add "Clear old files" feature for storage management

## Related Files

**Existing files to modify:**
- `src/types/card.ts` - Extend Card interface
- `src/canvas/Canvas.tsx` - Add drag-and-drop handlers
- `src/canvas/CardNode.tsx` - Add conditional rendering for file types
- `src/utils/storage.ts` - Add file cleanup on card deletion

**New files to create:**
- `src/utils/fileStorage.ts` - IndexedDB file operations
- `src/utils/fileArtifacts.ts` - File-to-Card conversion
- `src/utils/pdfExtractor.ts` - PDF text extraction (PDF.js wrapper)
- `src/canvas/FileCardNode.tsx` - File-specific card renderer
- `docs/file-artifacts-implementation.md` - This document

## References

- **tldraw computer**: Inspiration for treating all content types equally as canvas components
- **React Flow drag-drop docs**: https://reactflow.dev/examples/interaction/drag-and-drop
- **IndexedDB API**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **PDF.js**: https://mozilla.github.io/pdf.js/ (for PDF text extraction)
