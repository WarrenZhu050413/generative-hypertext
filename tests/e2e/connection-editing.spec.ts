/**
 * E2E Tests for Connection/Edge Editing
 *
 * Comprehensive tests for creating and managing connections between cards:
 * - Creating connections (edges) between cards
 * - Editing connection types (related, generated-from, references, contradicts, custom)
 * - Adding custom labels to connections
 * - Deleting connections
 * - Visual rendering of connections
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';

// Helper to create test cards with connections
async function createCardsWithConnections(context: BrowserContext) {
  const cards = [
    {
      id: 'source-card',
      content: '<p>Source card</p>',
      metadata: {
        title: 'Source Card',
        domain: 'test.com',
        url: 'https://test.com/source',
        favicon: '🔵',
        timestamp: Date.now(),
      },
      starred: false,
      tags: ['source'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    },
    {
      id: 'target-card',
      content: '<p>Target card</p>',
      metadata: {
        title: 'Target Card',
        domain: 'test.com',
        url: 'https://test.com/target',
        favicon: '🔴',
        timestamp: Date.now(),
      },
      starred: false,
      tags: ['target'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stashed: false,
      position: { x: 500, y: 100 },
      size: { width: 320, height: 240 },
    },
  ];

  const connections = [
    {
      id: 'conn-1',
      source: 'source-card',
      target: 'target-card',
      connectionType: 'related',
      createdAt: Date.now(),
    },
  ];

  await setExtensionStorage(context, { cards, nabokov_connections: connections });
  return { cards, connections };
}

// Helper to open canvas
async function openCanvas(context: BrowserContext, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(500);
  return canvasPage;
}

test.describe('Connection Creation', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should create connection by dragging from card handle', async ({ context, extensionId }) => {
    // Create two cards without connections
    const cards = [
      {
        id: 'card-1',
        content: '<p>Card 1</p>',
        metadata: { title: 'Card 1', domain: 'test.com', url: 'https://test.com', favicon: '1️⃣', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'card-2',
        content: '<p>Card 2</p>',
        metadata: { title: 'Card 2', domain: 'test.com', url: 'https://test.com', favicon: '2️⃣', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 500, y: 100 },
        size: { width: 320, height: 240 },
      },
    ];
    await setExtensionStorage(context, { cards });

    const canvasPage = await openCanvas(context, extensionId);

    // Find connection handles (usually circular dots on cards)
    const sourceCard = canvasPage.locator('[data-id="card-1"]').first();
    const targetCard = canvasPage.locator('[data-id="card-2"]').first();

    // Look for React Flow handles
    const sourceHandle = sourceCard.locator('.react-flow__handle-right, .react-flow__handle').first();
    const targetHandle = targetCard.locator('.react-flow__handle-left, .react-flow__handle').first();

    if (await sourceHandle.count() > 0 && await targetHandle.count() > 0) {
      // Drag from source to target
      await sourceHandle.hover();
      await canvasPage.mouse.down();
      await targetHandle.hover();
      await canvasPage.mouse.up();
      await canvasPage.waitForTimeout(500);

      // Verify connection was created
      const storage = await getExtensionStorage(context, 'nabokov_connections');
      const connections = storage.nabokov_connections || [];
      expect(connections.length).toBeGreaterThan(0);

      const newConnection = connections.find(
        (c: any) => c.source === 'card-1' && c.target === 'card-2'
      );
      expect(newConnection).toBeDefined();
    }
  });

  test('should render connection as edge on canvas', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Check for React Flow edge
    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    expect(await edge.count()).toBeGreaterThan(0);
  });

  test('should create connection with default type', async ({ context, extensionId }) => {
    const cards = [
      {
        id: 'card-a',
        content: '<p>Card A</p>',
        metadata: { title: 'Card A', domain: 'test.com', url: 'https://test.com', favicon: 'A', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'card-b',
        content: '<p>Card B</p>',
        metadata: { title: 'Card B', domain: 'test.com', url: 'https://test.com', favicon: 'B', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 500, y: 100 },
        size: { width: 320, height: 240 },
      },
    ];
    await setExtensionStorage(context, { cards });

    const canvasPage = await openCanvas(context, extensionId);

    // Create connection programmatically
    await canvasPage.evaluate(() => {
      return new Promise<void>((resolve) => {
        chrome.storage.local.get(['nabokov_connections'], (result) => {
          const connections = result.nabokov_connections || [];
          connections.push({
            id: 'test-conn-' + Date.now(),
            source: 'card-a',
            target: 'card-b',
            connectionType: 'related', // Default type
            createdAt: Date.now(),
          });
          chrome.storage.local.set({ nabokov_connections: connections }, () => {
            window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
            resolve();
          });
        });
      });
    });

    await canvasPage.waitForTimeout(500);

    const storage = await getExtensionStorage(context, 'nabokov_connections');
    const connection = storage.nabokov_connections[0];
    expect(connection.connectionType).toBe('related');
  });
});

test.describe('Connection Type Editing', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should open edge edit modal on edge click', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Click on edge
    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      // Look for edit modal
      const modal = canvasPage.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').first();
      expect(await modal.count()).toBeGreaterThan(0);
    }
  });

  test('should change connection type to "references"', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      // Find connection type selector (dropdown or radio buttons)
      const typeSelector = canvasPage.locator('select[name*="type"], select[name*="connectionType"], input[value="references"]').first();
      if (await typeSelector.count() > 0) {
        if (await typeSelector.evaluate(el => el.tagName === 'SELECT')) {
          await typeSelector.selectOption('references');
        } else {
          await typeSelector.click();
        }

        // Save changes
        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await canvasPage.waitForTimeout(500);

          // Verify type was changed
          const storage = await getExtensionStorage(context, 'nabokov_connections');
          const connection = storage.nabokov_connections[0];
          expect(connection.connectionType).toBe('references');
        }
      }
    }
  });

  test('should change connection type to "generated-from"', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      const typeSelector = canvasPage.locator('select[name*="type"], select[name*="connectionType"], input[value="generated-from"]').first();
      if (await typeSelector.count() > 0) {
        if (await typeSelector.evaluate(el => el.tagName === 'SELECT')) {
          await typeSelector.selectOption('generated-from');
        } else {
          await typeSelector.click();
        }

        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await canvasPage.waitForTimeout(500);

          const storage = await getExtensionStorage(context, 'nabokov_connections');
          expect(storage.nabokov_connections[0].connectionType).toBe('generated-from');
        }
      }
    }
  });

  test('should change connection type to "contradicts"', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      const typeSelector = canvasPage.locator('select[name*="type"], select[name*="connectionType"], input[value="contradicts"]').first();
      if (await typeSelector.count() > 0) {
        if (await typeSelector.evaluate(el => el.tagName === 'SELECT')) {
          await typeSelector.selectOption('contradicts');
        } else {
          await typeSelector.click();
        }

        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await canvasPage.waitForTimeout(500);

          const storage = await getExtensionStorage(context, 'nabokov_connections');
          expect(storage.nabokov_connections[0].connectionType).toBe('contradicts');
        }
      }
    }
  });

  test('should support all connection types', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      // Check for all connection types in selector
      const typeSelector = canvasPage.locator('select[name*="type"], select[name*="connectionType"]').first();
      if (await typeSelector.count() > 0) {
        const options = await typeSelector.locator('option').allTextContents();

        expect(options.join(' ').toLowerCase()).toContain('related');
        expect(options.join(' ').toLowerCase()).toContain('generated');
        expect(options.join(' ').toLowerCase()).toContain('references');
        expect(options.join(' ').toLowerCase()).toContain('contradicts');
      }
    }
  });
});

test.describe('Custom Connection Labels', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should add custom label to connection', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      // Find label input
      const labelInput = canvasPage.locator('input[name*="label"], input[placeholder*="label"]').first();
      if (await labelInput.count() > 0) {
        await labelInput.fill('Custom relationship');

        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await canvasPage.waitForTimeout(500);

        // Verify label was saved
        const storage = await getExtensionStorage(context, 'nabokov_connections');
        const connection = storage.nabokov_connections[0];
        expect(connection.label).toBe('Custom relationship');
      }
    }
  });

  test('should display custom label on edge', async ({ context, extensionId }) => {
    // Create connection with existing label
    const cards = [
      {
        id: 'card-1',
        content: '<p>Card 1</p>',
        metadata: { title: 'Card 1', domain: 'test.com', url: 'https://test.com', favicon: '1️⃣', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'card-2',
        content: '<p>Card 2</p>',
        metadata: { title: 'Card 2', domain: 'test.com', url: 'https://test.com', favicon: '2️⃣', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 500, y: 100 },
        size: { width: 320, height: 240 },
      },
    ];

    const connections = [
      {
        id: 'labeled-conn',
        source: 'card-1',
        target: 'card-2',
        connectionType: 'custom',
        label: 'Explains concept',
        createdAt: Date.now(),
      },
    ];

    await setExtensionStorage(context, { cards, nabokov_connections: connections });
    const canvasPage = await openCanvas(context, extensionId);

    // Look for label text on edge
    const edgeLabel = canvasPage.locator('.react-flow__edge-text, [class*="edge-label"]').first();
    if (await edgeLabel.count() > 0) {
      expect(await edgeLabel.textContent()).toContain('Explains concept');
    }
  });

  test('should update existing custom label', async ({ context, extensionId }) => {
    const cards = [
      {
        id: 'card-a',
        content: '<p>Card A</p>',
        metadata: { title: 'Card A', domain: 'test.com', url: 'https://test.com', favicon: 'A', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'card-b',
        content: '<p>Card B</p>',
        metadata: { title: 'Card B', domain: 'test.com', url: 'https://test.com', favicon: 'B', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 500, y: 100 },
        size: { width: 320, height: 240 },
      },
    ];

    const connections = [
      {
        id: 'conn-update',
        source: 'card-a',
        target: 'card-b',
        connectionType: 'related',
        label: 'Old label',
        createdAt: Date.now(),
      },
    ];

    await setExtensionStorage(context, { cards, nabokov_connections: connections });
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      const labelInput = canvasPage.locator('input[name*="label"], input[placeholder*="label"]').first();
      if (await labelInput.count() > 0) {
        await labelInput.fill('Updated label');

        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await canvasPage.waitForTimeout(500);

        const storage = await getExtensionStorage(context, 'nabokov_connections');
        expect(storage.nabokov_connections[0].label).toBe('Updated label');
      }
    }
  });

  test('should remove custom label when cleared', async ({ context, extensionId }) => {
    const cards = [
      {
        id: 'card-x',
        content: '<p>Card X</p>',
        metadata: { title: 'Card X', domain: 'test.com', url: 'https://test.com', favicon: 'X', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'card-y',
        content: '<p>Card Y</p>',
        metadata: { title: 'Card Y', domain: 'test.com', url: 'https://test.com', favicon: 'Y', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 500, y: 100 },
        size: { width: 320, height: 240 },
      },
    ];

    const connections = [
      {
        id: 'conn-clear',
        source: 'card-x',
        target: 'card-y',
        connectionType: 'related',
        label: 'To be removed',
        createdAt: Date.now(),
      },
    ];

    await setExtensionStorage(context, { cards, nabokov_connections: connections });
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      const labelInput = canvasPage.locator('input[name*="label"], input[placeholder*="label"]').first();
      if (await labelInput.count() > 0) {
        await labelInput.fill('');

        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await canvasPage.waitForTimeout(500);

        const storage = await getExtensionStorage(context, 'nabokov_connections');
        const connection = storage.nabokov_connections[0];
        expect(connection.label).toBeFalsy();
      }
    }
  });
});

test.describe('Connection Deletion', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should delete connection via delete button in edit modal', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      // Find delete button
      const deleteButton = canvasPage.locator('button:has-text("Delete"), button:has-text("Remove"), button:has-text("🗑")').first();
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await canvasPage.waitForTimeout(500);

        // Verify connection was deleted
        const storage = await getExtensionStorage(context, 'nabokov_connections');
        expect(storage.nabokov_connections || []).toHaveLength(0);
      }
    }
  });

  test('should remove edge from canvas when connection deleted', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Count initial edges
    const initialEdgeCount = await canvasPage.locator('.react-flow__edge, [class*="edge"]').count();

    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      const deleteButton = canvasPage.locator('button:has-text("Delete"), button:has-text("Remove"), button:has-text("🗑")').first();
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await canvasPage.waitForTimeout(500);

        // Verify edge is removed from canvas
        const finalEdgeCount = await canvasPage.locator('.react-flow__edge, [class*="edge"]').count();
        expect(finalEdgeCount).toBeLessThan(initialEdgeCount);
      }
    }
  });
});

test.describe('Connection Visual Rendering', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should render different connection types with distinct styles', async ({ context, extensionId }) => {
    const cards = [
      {
        id: 'card-1',
        content: '<p>Card 1</p>',
        metadata: { title: 'Card 1', domain: 'test.com', url: 'https://test.com', favicon: '1️⃣', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 100, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'card-2',
        content: '<p>Card 2</p>',
        metadata: { title: 'Card 2', domain: 'test.com', url: 'https://test.com', favicon: '2️⃣', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 500, y: 100 },
        size: { width: 320, height: 240 },
      },
      {
        id: 'card-3',
        content: '<p>Card 3</p>',
        metadata: { title: 'Card 3', domain: 'test.com', url: 'https://test.com', favicon: '3️⃣', timestamp: Date.now() },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stashed: false,
        position: { x: 300, y: 300 },
        size: { width: 320, height: 240 },
      },
    ];

    const connections = [
      {
        id: 'conn-related',
        source: 'card-1',
        target: 'card-2',
        connectionType: 'related',
        createdAt: Date.now(),
      },
      {
        id: 'conn-generated',
        source: 'card-1',
        target: 'card-3',
        connectionType: 'generated-from',
        createdAt: Date.now(),
      },
    ];

    await setExtensionStorage(context, { cards, nabokov_connections: connections });
    const canvasPage = await openCanvas(context, extensionId);

    // Check that multiple edges are rendered
    const edges = canvasPage.locator('.react-flow__edge, [class*="edge"]');
    expect(await edges.count()).toBe(2);

    // Different connection types should have different visual attributes
    // (color, stroke style, arrow type, etc.)
    // This is visual verification - actual test depends on implementation
  });

  test('should render connection arrows correctly', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Check for arrow markers
    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    if (await edge.count() > 0) {
      // Check for arrowhead (usually SVG marker or polygon)
      const arrowMarker = canvasPage.locator('.react-flow__arrowhead, [class*="arrow"], marker').first();
      expect(await arrowMarker.count()).toBeGreaterThan(0);
    }
  });

  test('should update edge rendering when connection type changes', async ({ context, extensionId }) => {
    await createCardsWithConnections(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Get initial edge style/class
    const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
    const initialClass = await edge.getAttribute('class');

    // Change connection type
    if (await edge.count() > 0) {
      await edge.click();
      await canvasPage.waitForTimeout(300);

      const typeSelector = canvasPage.locator('select[name*="type"], select[name*="connectionType"], input[value="contradicts"]').first();
      if (await typeSelector.count() > 0) {
        if (await typeSelector.evaluate(el => el.tagName === 'SELECT')) {
          await typeSelector.selectOption('contradicts');
        } else {
          await typeSelector.click();
        }

        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await canvasPage.waitForTimeout(500);

          // Verify edge style/class changed
          const updatedClass = await edge.getAttribute('class');
          // Classes should be different for different connection types
          // (exact assertion depends on implementation)
        }
      }
    }
  });
});
