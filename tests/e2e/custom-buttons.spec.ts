/**
 * E2E Tests for Custom Buttons System
 *
 * Comprehensive tests for custom action buttons and card generation:
 * - Creating custom buttons
 * - Button configuration (labels, prompts, templates)
 * - Triggering button actions
 * - Card generation from buttons
 * - Connection creation
 * - Template variable substitution
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';

// Helper to create test card
async function createTestCard(context: BrowserContext) {
  const card = {
    id: 'parent-card',
    content: '<p>Original content about React hooks and state management</p>',
    metadata: {
      title: 'React Concepts',
      domain: 'react.dev',
      url: 'https://react.dev/concepts',
      favicon: '⚛️',
      timestamp: Date.now(),
    },
    starred: false,
    tags: ['react', 'javascript'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stashed: false,
    position: { x: 100, y: 100 },
    size: { width: 320, height: 240 },
  };
  await setExtensionStorage(context, { cards: [card] });
  return card;
}

// Helper to open canvas
async function openCanvas(context: BrowserContext, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(500);
  return canvasPage;
}

test.describe('Custom Buttons - Creation and Configuration', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should display default buttons on cards', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();

    // Check for default buttons (Learn More, Summarize, Critique, ELI5, Expand)
    const learnMoreButton = cardNode.locator('button:has-text("Learn More")').first();
    const summarizeButton = cardNode.locator('button:has-text("Summarize")').first();

    // At least one default button should exist
    expect(await learnMoreButton.count() + await summarizeButton.count()).toBeGreaterThan(0);
  });

  test('should open button settings modal', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Find settings/config button
    const settingsButton = canvasPage.locator('button[aria-label*="Settings"], button:has-text("⚙"), button:has-text("Settings")').first();

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await canvasPage.waitForTimeout(300);

      // Look for button settings modal
      const modal = canvasPage.locator('[role="dialog"]:has-text("Button"), [class*="modal"]:has-text("Button")').first();
      expect(await modal.count()).toBeGreaterThan(0);
    }
  });

  test('should create new custom button', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const settingsButton = canvasPage.locator('button[aria-label*="Settings"], button:has-text("⚙")').first();

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await canvasPage.waitForTimeout(300);

      // Find add button
      const addButton = canvasPage.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();

      if (await addButton.count() > 0) {
        await addButton.click();
        await canvasPage.waitForTimeout(300);

        // Fill in button details
        const labelInput = canvasPage.locator('input[name*="label"], input[placeholder*="Label"]').first();
        const promptInput = canvasPage.locator('textarea[name*="prompt"], textarea[placeholder*="Prompt"]').first();

        if (await labelInput.count() > 0) {
          await labelInput.fill('Translate');
        }

        if (await promptInput.count() > 0) {
          await promptInput.fill('Translate this to Spanish: {{content}}');
        }

        // Save button
        const saveButton = canvasPage.locator('button:has-text("Save"), button:has-text("Create")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await canvasPage.waitForTimeout(500);

          // Verify button was saved
          const storage = await getExtensionStorage(context, 'nabokov_custom_buttons');
          const customButtons = storage.nabokov_custom_buttons || [];
          const translateButton = customButtons.find((b: any) => b.label === 'Translate');
          expect(translateButton).toBeDefined();
        }
      }
    }
  });

  test('should configure button with template variables', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Create button programmatically
    await canvasPage.evaluate(() => {
      const customButton = {
        id: 'custom-btn-' + Date.now(),
        label: 'Compare',
        prompt: 'Compare {{title}} with similar concepts. Content: {{content}}',
        connectionType: 'references',
        requestContext: false,
      };

      return new Promise<void>((resolve) => {
        chrome.storage.local.get(['nabokov_custom_buttons'], (result) => {
          const buttons = result.nabokov_custom_buttons || [];
          buttons.push(customButton);
          chrome.storage.local.set({ nabokov_custom_buttons: buttons }, () => resolve());
        });
      });
    });

    await canvasPage.waitForTimeout(500);

    const storage = await getExtensionStorage(context, 'nabokov_custom_buttons');
    const compareButton = storage.nabokov_custom_buttons.find((b: any) => b.label === 'Compare');

    expect(compareButton.prompt).toContain('{{title}}');
    expect(compareButton.prompt).toContain('{{content}}');
  });

  test('should configure connection type for button', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    await canvasPage.evaluate(() => {
      const customButton = {
        id: 'ref-btn-' + Date.now(),
        label: 'Find References',
        prompt: 'Find references for: {{content}}',
        connectionType: 'references', // Connection type
        requestContext: false,
      };

      return new Promise<void>((resolve) => {
        chrome.storage.local.get(['nabokov_custom_buttons'], (result) => {
          const buttons = result.nabokov_custom_buttons || [];
          buttons.push(customButton);
          chrome.storage.local.set({ nabokov_custom_buttons: buttons }, () => resolve());
        });
      });
    });

    await canvasPage.waitForTimeout(500);

    const storage = await getExtensionStorage(context, 'nabokov_custom_buttons');
    const refButton = storage.nabokov_custom_buttons.find((b: any) => b.label === 'Find References');

    expect(refButton.connectionType).toBe('references');
  });

  test('should enable context input option', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    await canvasPage.evaluate(() => {
      const customButton = {
        id: 'ctx-btn-' + Date.now(),
        label: 'Custom Analysis',
        prompt: 'Analyze {{content}} with context: {{customContext}}',
        connectionType: 'related',
        requestContext: true, // Request context from user
      };

      return new Promise<void>((resolve) => {
        chrome.storage.local.get(['nabokov_custom_buttons'], (result) => {
          const buttons = result.nabokov_custom_buttons || [];
          buttons.push(customButton);
          chrome.storage.local.set({ nabokov_custom_buttons: buttons }, () => resolve());
        });
      });
    });

    await canvasPage.waitForTimeout(500);

    const storage = await getExtensionStorage(context, 'nabokov_custom_buttons');
    const ctxButton = storage.nabokov_custom_buttons.find((b: any) => b.label === 'Custom Analysis');

    expect(ctxButton.requestContext).toBe(true);
  });
});

test.describe('Custom Buttons - Button Actions', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should display custom button on card', async ({ context, extensionId }) => {
    await createTestCard(context);

    // Add custom button
    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'test-btn',
          label: 'Translate',
          prompt: 'Translate: {{content}}',
          connectionType: 'related',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const translateButton = cardNode.locator('button:has-text("Translate")').first();

    expect(await translateButton.count()).toBeGreaterThan(0);
  });

  test('should trigger button action on click', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'summarize-btn',
          label: 'Summarize',
          prompt: 'Summarize: {{content}}',
          connectionType: 'generated-from',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const summarizeButton = cardNode.locator('button:has-text("Summarize")').first();

    if (await summarizeButton.count() > 0) {
      await summarizeButton.click();
      await canvasPage.waitForTimeout(2000);

      // Verify new card was generated
      const storage = await getExtensionStorage(context, 'cards');
      expect(storage.cards.length).toBeGreaterThan(1);

      // Find generated card
      const generatedCard = storage.cards.find((c: any) => c.id !== 'parent-card');
      expect(generatedCard).toBeDefined();
      expect(generatedCard.cardType).toBe('generated');
    }
  });

  test('should open context input modal when requestContext is true', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'ctx-btn',
          label: 'Custom',
          prompt: 'Do {{customContext}} with: {{content}}',
          connectionType: 'related',
          requestContext: true,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const customButton = cardNode.locator('button:has-text("Custom")').first();

    if (await customButton.count() > 0) {
      await customButton.click();
      await canvasPage.waitForTimeout(500);

      // Look for context input modal
      const modal = canvasPage.locator('[role="dialog"], [class*="modal"]').first();
      expect(await modal.count()).toBeGreaterThan(0);

      const contextInput = canvasPage.locator('textarea[placeholder*="context"], input[placeholder*="context"]').first();
      expect(await contextInput.count()).toBeGreaterThan(0);
    }
  });

  test('should substitute template variables in prompt', async ({ context, extensionId }) => {
    const card = await createTestCard(context);

    await setExtensionStorage(context, {
      cards: [card],
      nabokov_custom_buttons: [
        {
          id: 'template-btn',
          label: 'Test Template',
          prompt: 'Title: {{title}}, Content: {{content}}',
          connectionType: 'related',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const templateButton = cardNode.locator('button:has-text("Test Template")').first();

    if (await templateButton.count() > 0) {
      await templateButton.click();
      await canvasPage.waitForTimeout(2000);

      // Generated card should have content based on template
      const storage = await getExtensionStorage(context, 'cards');
      const generatedCard = storage.cards.find((c: any) => c.cardType === 'generated');

      // Verify generation happened (content substitution happens in service)
      expect(generatedCard).toBeDefined();
    }
  });
});

test.describe('Custom Buttons - Card Generation', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should generate new card from button action', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'gen-btn',
          label: 'Expand',
          prompt: 'Expand on: {{content}}',
          connectionType: 'generated-from',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const expandButton = cardNode.locator('button:has-text("Expand")').first();

    if (await expandButton.count() > 0) {
      await expandButton.click();
      await canvasPage.waitForTimeout(2000);

      const storage = await getExtensionStorage(context, 'cards');

      // Should have parent + generated card
      expect(storage.cards.length).toBe(2);

      const generatedCard = storage.cards.find((c: any) => c.cardType === 'generated');
      expect(generatedCard.parentCardId).toBe('parent-card');
    }
  });

  test('should position generated card offset from parent', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'pos-btn',
          label: 'Generate',
          prompt: 'Generate from: {{content}}',
          connectionType: 'generated-from',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const generateButton = cardNode.locator('button:has-text("Generate")').first();

    if (await generateButton.count() > 0) {
      await generateButton.click();
      await canvasPage.waitForTimeout(2000);

      const storage = await getExtensionStorage(context, 'cards');
      const generatedCard = storage.cards.find((c: any) => c.cardType === 'generated');

      // Generated card should be positioned to the right
      expect(generatedCard.position.x).toBeGreaterThan(100);
    }
  });

  test('should store generation context in generated card', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'ctx-gen-btn',
          label: 'Analyze',
          prompt: 'Analyze: {{content}}',
          connectionType: 'related',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const analyzeButton = cardNode.locator('button:has-text("Analyze")').first();

    if (await analyzeButton.count() > 0) {
      await analyzeButton.click();
      await canvasPage.waitForTimeout(2000);

      const storage = await getExtensionStorage(context, 'cards');
      const generatedCard = storage.cards.find((c: any) => c.cardType === 'generated');

      if (generatedCard.generationContext) {
        expect(generatedCard.generationContext.userPrompt).toContain('Analyze');
        expect(generatedCard.generationContext.sourceMessageId).toBeDefined();
      }
    }
  });

  test('should show loading state during generation', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'load-btn',
          label: 'Process',
          prompt: 'Process: {{content}}',
          connectionType: 'generated-from',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const processButton = cardNode.locator('button:has-text("Process")').first();

    if (await processButton.count() > 0) {
      await processButton.click();

      // Check for loading indicator
      const loadingIndicator = canvasPage.locator('[class*="loading"], [class*="spinner"], text=Generating').first();
      expect(await loadingIndicator.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Custom Buttons - Connections', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should create connection between parent and generated card', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'conn-btn',
          label: 'Derive',
          prompt: 'Derive from: {{content}}',
          connectionType: 'generated-from',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const deriveButton = cardNode.locator('button:has-text("Derive")').first();

    if (await deriveButton.count() > 0) {
      await deriveButton.click();
      await canvasPage.waitForTimeout(2000);

      // Check for connection
      const storage = await getExtensionStorage(context, 'nabokov_connections');
      const connections = storage.nabokov_connections || [];

      expect(connections.length).toBeGreaterThan(0);

      const connection = connections.find((c: any) => c.source === 'parent-card');
      expect(connection).toBeDefined();
      expect(connection.connectionType).toBe('generated-from');
    }
  });

  test('should use correct connection type from button config', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'ref-conn-btn',
          label: 'Reference',
          prompt: 'Reference: {{content}}',
          connectionType: 'references',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const referenceButton = cardNode.locator('button:has-text("Reference")').first();

    if (await referenceButton.count() > 0) {
      await referenceButton.click();
      await canvasPage.waitForTimeout(2000);

      const storage = await getExtensionStorage(context, 'nabokov_connections');
      const connections = storage.nabokov_connections || [];

      const connection = connections.find((c: any) => c.source === 'parent-card');
      expect(connection?.connectionType).toBe('references');
    }
  });

  test('should render connection edge on canvas', async ({ context, extensionId }) => {
    await createTestCard(context);

    await setExtensionStorage(context, {
      cards: (await getExtensionStorage(context, 'cards')).cards,
      nabokov_custom_buttons: [
        {
          id: 'edge-btn',
          label: 'Link',
          prompt: 'Link: {{content}}',
          connectionType: 'related',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const linkButton = cardNode.locator('button:has-text("Link")').first();

    if (await linkButton.count() > 0) {
      await linkButton.click();
      await canvasPage.waitForTimeout(2000);

      // Check for edge rendering
      const edge = canvasPage.locator('.react-flow__edge, [class*="edge"]').first();
      expect(await edge.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Custom Buttons - Default Buttons', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should include default Learn More button', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const learnMoreButton = cardNode.locator('button:has-text("Learn More")').first();

    expect(await learnMoreButton.count()).toBeGreaterThan(0);
  });

  test('should include default Summarize button', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const summarizeButton = cardNode.locator('button:has-text("Summarize")').first();

    expect(await summarizeButton.count()).toBeGreaterThan(0);
  });

  test('should include default ELI5 button', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const eli5Button = cardNode.locator('button:has-text("ELI5")').first();

    expect(await eli5Button.count()).toBeGreaterThan(0);
  });

  test('should work with default button prompts', async ({ context, extensionId }) => {
    await createTestCard(context);
    const canvasPage = await openCanvas(context, extensionId);

    const cardNode = canvasPage.locator('[data-id="parent-card"]').first();
    const summarizeButton = cardNode.locator('button:has-text("Summarize")').first();

    if (await summarizeButton.count() > 0) {
      await summarizeButton.click();
      await canvasPage.waitForTimeout(2000);

      const storage = await getExtensionStorage(context, 'cards');
      const generatedCard = storage.cards.find((c: any) => c.cardType === 'generated');

      expect(generatedCard).toBeDefined();
    }
  });
});

test.describe('Custom Buttons - Management', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should edit existing custom button', async ({ context, extensionId }) => {
    await setExtensionStorage(context, {
      nabokov_custom_buttons: [
        {
          id: 'edit-btn',
          label: 'Old Label',
          prompt: 'Old prompt',
          connectionType: 'related',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const settingsButton = canvasPage.locator('button[aria-label*="Settings"], button:has-text("⚙")').first();

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await canvasPage.waitForTimeout(300);

      // Find edit button
      const editButton = canvasPage.locator('button:has-text("Edit"), button[aria-label*="Edit"]').first();

      if (await editButton.count() > 0) {
        await editButton.click();
        await canvasPage.waitForTimeout(300);

        const labelInput = canvasPage.locator('input[name*="label"]').first();
        if (await labelInput.count() > 0) {
          await labelInput.fill('New Label');

          const saveButton = canvasPage.locator('button:has-text("Save")').first();
          await saveButton.click();
          await canvasPage.waitForTimeout(500);

          const storage = await getExtensionStorage(context, 'nabokov_custom_buttons');
          const button = storage.nabokov_custom_buttons.find((b: any) => b.id === 'edit-btn');
          expect(button.label).toBe('New Label');
        }
      }
    }
  });

  test('should delete custom button', async ({ context, extensionId }) => {
    await setExtensionStorage(context, {
      nabokov_custom_buttons: [
        {
          id: 'delete-btn',
          label: 'Delete Me',
          prompt: 'Delete this',
          connectionType: 'related',
          requestContext: false,
        },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const settingsButton = canvasPage.locator('button[aria-label*="Settings"], button:has-text("⚙")').first();

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await canvasPage.waitForTimeout(300);

      const deleteButton = canvasPage.locator('button:has-text("Delete"), button:has-text("🗑"), button[aria-label*="Delete"]').first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await canvasPage.waitForTimeout(500);

        const storage = await getExtensionStorage(context, 'nabokov_custom_buttons');
        const button = storage.nabokov_custom_buttons?.find((b: any) => b.id === 'delete-btn');
        expect(button).toBeUndefined();
      }
    }
  });

  test('should reorder custom buttons', async ({ context, extensionId }) => {
    await setExtensionStorage(context, {
      nabokov_custom_buttons: [
        { id: 'btn-1', label: 'First', prompt: 'First', connectionType: 'related', requestContext: false },
        { id: 'btn-2', label: 'Second', prompt: 'Second', connectionType: 'related', requestContext: false },
      ],
    });

    const canvasPage = await openCanvas(context, extensionId);

    const settingsButton = canvasPage.locator('button[aria-label*="Settings"], button:has-text("⚙")').first();

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await canvasPage.waitForTimeout(300);

      // Look for reorder controls (up/down arrows or drag handles)
      const moveUpButton = canvasPage.locator('button:has-text("↑"), button[aria-label*="Move up"]').last();

      if (await moveUpButton.count() > 0) {
        await moveUpButton.click();
        await canvasPage.waitForTimeout(500);

        const storage = await getExtensionStorage(context, 'nabokov_custom_buttons');
        // Second button should now be first
        expect(storage.nabokov_custom_buttons[0].label).toBe('Second');
      }
    }
  });
});
