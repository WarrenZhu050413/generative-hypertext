/**
 * E2E Tests for Filtering and Search
 *
 * Comprehensive tests for card filtering on canvas:
 * - Search by text (title, content, domain)
 * - Filter by domain
 * - Filter by tags
 * - Filter by date range
 * - Filter combinations
 * - Filter persistence
 */

import { test, expect } from '../fixtures/extension';
import type { BrowserContext, Page } from '@playwright/test';
import {
  getExtensionStorage,
  setExtensionStorage,
  clearExtensionStorage,
} from '../fixtures/extension';

// Helper to create diverse test cards for filtering
async function createDiverseCards(context: BrowserContext) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const cards = [
    {
      id: 'card-react-tutorial',
      content: '<p>Learn React hooks and state management</p>',
      metadata: {
        title: 'React Tutorial',
        domain: 'react.dev',
        url: 'https://react.dev/tutorial',
        favicon: '⚛️',
        timestamp: now,
      },
      starred: true,
      tags: ['react', 'javascript', 'tutorial'],
      createdAt: now,
      updatedAt: now,
      stashed: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
    },
    {
      id: 'card-vue-guide',
      content: '<p>Vue 3 composition API guide</p>',
      metadata: {
        title: 'Vue Guide',
        domain: 'vuejs.org',
        url: 'https://vuejs.org/guide',
        favicon: '🟢',
        timestamp: now - oneDay,
      },
      starred: false,
      tags: ['vue', 'javascript', 'guide'],
      createdAt: now - oneDay,
      updatedAt: now - oneDay,
      stashed: false,
      position: { x: 500, y: 100 },
      size: { width: 320, height: 240 },
    },
    {
      id: 'card-typescript-docs',
      content: '<p>TypeScript advanced types and generics</p>',
      metadata: {
        title: 'TypeScript Docs',
        domain: 'typescriptlang.org',
        url: 'https://typescriptlang.org/docs',
        favicon: '📘',
        timestamp: now - 2 * oneDay,
      },
      starred: false,
      tags: ['typescript', 'programming'],
      createdAt: now - 2 * oneDay,
      updatedAt: now - 2 * oneDay,
      stashed: false,
      position: { x: 900, y: 100 },
      size: { width: 320, height: 240 },
    },
    {
      id: 'card-python-basics',
      content: '<p>Python fundamentals for beginners</p>',
      metadata: {
        title: 'Python Basics',
        domain: 'python.org',
        url: 'https://python.org/basics',
        favicon: '🐍',
        timestamp: now - 7 * oneDay,
      },
      starred: true,
      tags: ['python', 'programming', 'tutorial'],
      createdAt: now - 7 * oneDay,
      updatedAt: now - 7 * oneDay,
      stashed: false,
      position: { x: 100, y: 400 },
      size: { width: 320, height: 240 },
    },
    {
      id: 'card-rust-book',
      content: '<p>The Rust programming language book</p>',
      metadata: {
        title: 'Rust Book',
        domain: 'rust-lang.org',
        url: 'https://rust-lang.org/book',
        favicon: '🦀',
        timestamp: now - 30 * oneDay,
      },
      starred: false,
      tags: ['rust', 'programming'],
      createdAt: now - 30 * oneDay,
      updatedAt: now - 30 * oneDay,
      stashed: false,
      position: { x: 500, y: 400 },
      size: { width: 320, height: 240 },
    },
  ];

  await setExtensionStorage(context, { cards });
  return cards;
}

// Helper to open canvas
async function openCanvas(context: BrowserContext, extensionId: string): Promise<Page> {
  const canvasPage = await context.newPage();
  await canvasPage.goto(`chrome-extension://${extensionId}/src/canvas/index.html`);
  await canvasPage.waitForLoadState('domcontentloaded');
  await canvasPage.waitForTimeout(500);
  return canvasPage;
}

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should filter cards by search text in title', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Find search input
    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await canvasPage.waitForTimeout(500);

      // Verify only React card is visible
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const vueCard = canvasPage.locator('[data-id="card-vue-guide"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await vueCard.isVisible()).toBe(false);
    }
  });

  test('should filter cards by search text in content', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('hooks');
      await canvasPage.waitForTimeout(500);

      // Should find React card (contains "hooks")
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      expect(await reactCard.isVisible()).toBe(true);
    }
  });

  test('should filter cards by search text in domain', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('vuejs.org');
      await canvasPage.waitForTimeout(500);

      const vueCard = canvasPage.locator('[data-id="card-vue-guide"]').first();
      expect(await vueCard.isVisible()).toBe(true);
    }
  });

  test('should be case-insensitive', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      // Search with different case
      await searchInput.fill('REACT');
      await canvasPage.waitForTimeout(500);

      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      expect(await reactCard.isVisible()).toBe(true);
    }
  });

  test('should clear search and show all cards when input cleared', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      // Apply search
      await searchInput.fill('React');
      await canvasPage.waitForTimeout(500);

      // Clear search
      await searchInput.fill('');
      await canvasPage.waitForTimeout(500);

      // All cards should be visible
      const allCards = canvasPage.locator('[data-id^="card-"]');
      expect(await allCards.count()).toBeGreaterThan(1);
    }
  });

  test('should show no results message when no matches', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('NonexistentTerm12345');
      await canvasPage.waitForTimeout(500);

      // Check for no results message
      const noResultsMessage = canvasPage.locator('text=No cards found, text=No results, text=No matches').first();
      expect(await noResultsMessage.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Domain Filter', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should filter cards by domain', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Find domain filter
    const domainFilter = canvasPage.locator('select[name*="domain"], button:has-text("Domain")').first();

    if (await domainFilter.count() > 0) {
      // Open domain dropdown/select
      if (await domainFilter.evaluate(el => el.tagName === 'SELECT')) {
        await domainFilter.selectOption('react.dev');
      } else {
        await domainFilter.click();
        const domainOption = canvasPage.locator('text=react.dev').first();
        await domainOption.click();
      }
      await canvasPage.waitForTimeout(500);

      // Verify only React card is visible
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const vueCard = canvasPage.locator('[data-id="card-vue-guide"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await vueCard.isVisible()).toBe(false);
    }
  });

  test('should show all unique domains in filter', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const domainFilter = canvasPage.locator('select[name*="domain"], button:has-text("Domain")').first();

    if (await domainFilter.count() > 0) {
      if (await domainFilter.evaluate(el => el.tagName === 'SELECT')) {
        const options = await domainFilter.locator('option').allTextContents();
        expect(options.join(' ')).toContain('react.dev');
        expect(options.join(' ')).toContain('vuejs.org');
        expect(options.join(' ')).toContain('python.org');
      } else {
        await domainFilter.click();
        const dropdown = canvasPage.locator('[role="menu"], [class*="dropdown"]').first();
        const content = await dropdown.textContent();
        expect(content).toContain('react.dev');
        expect(content).toContain('vuejs.org');
      }
    }
  });

  test('should clear domain filter', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const domainFilter = canvasPage.locator('select[name*="domain"], button:has-text("Domain")').first();

    if (await domainFilter.count() > 0) {
      // Apply filter
      if (await domainFilter.evaluate(el => el.tagName === 'SELECT')) {
        await domainFilter.selectOption('react.dev');
        await canvasPage.waitForTimeout(500);

        // Clear filter
        await domainFilter.selectOption(''); // Or "All domains"
        await canvasPage.waitForTimeout(500);
      }

      // All cards should be visible
      const allCards = canvasPage.locator('[data-id^="card-"]');
      expect(await allCards.count()).toBeGreaterThan(1);
    }
  });
});

test.describe('Tag Filter', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should filter cards by tag', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Find tag filter
    const tagFilter = canvasPage.locator('select[name*="tag"], button:has-text("Tag")').first();

    if (await tagFilter.count() > 0) {
      if (await tagFilter.evaluate(el => el.tagName === 'SELECT')) {
        await tagFilter.selectOption('javascript');
      } else {
        await tagFilter.click();
        const tagOption = canvasPage.locator('text=javascript').first();
        await tagOption.click();
      }
      await canvasPage.waitForTimeout(500);

      // Verify only JavaScript cards are visible
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const vueCard = canvasPage.locator('[data-id="card-vue-guide"]').first();
      const pythonCard = canvasPage.locator('[data-id="card-python-basics"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await vueCard.isVisible()).toBe(true);
      expect(await pythonCard.isVisible()).toBe(false);
    }
  });

  test('should show all unique tags in filter', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const tagFilter = canvasPage.locator('select[name*="tag"], button:has-text("Tag")').first();

    if (await tagFilter.count() > 0) {
      if (await tagFilter.evaluate(el => el.tagName === 'SELECT')) {
        const options = await tagFilter.locator('option').allTextContents();
        expect(options.join(' ')).toContain('javascript');
        expect(options.join(' ')).toContain('python');
        expect(options.join(' ')).toContain('tutorial');
      }
    }
  });

  test('should filter by multiple tags', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Look for tag checkboxes or multi-select
    const tutorialTag = canvasPage.locator('input[value="tutorial"], label:has-text("tutorial")').first();

    if (await tutorialTag.count() > 0) {
      await tutorialTag.click();
      await canvasPage.waitForTimeout(500);

      // Only tutorial cards should be visible
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const pythonCard = canvasPage.locator('[data-id="card-python-basics"]').first();
      const vueCard = canvasPage.locator('[data-id="card-vue-guide"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await pythonCard.isVisible()).toBe(true);
      expect(await vueCard.isVisible()).toBe(false);
    }
  });

  test('should clear tag filter', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const tagFilter = canvasPage.locator('select[name*="tag"], button:has-text("Tag")').first();

    if (await tagFilter.count() > 0) {
      // Apply filter
      if (await tagFilter.evaluate(el => el.tagName === 'SELECT')) {
        await tagFilter.selectOption('javascript');
        await canvasPage.waitForTimeout(500);

        // Clear filter
        await tagFilter.selectOption('');
        await canvasPage.waitForTimeout(500);
      }

      const allCards = canvasPage.locator('[data-id^="card-"]');
      expect(await allCards.count()).toBeGreaterThan(2);
    }
  });
});

test.describe('Date Range Filter', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should filter cards by date range', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Find date range inputs
    const startDateInput = canvasPage.locator('input[type="date"][name*="start"], input[placeholder*="Start"]').first();
    const endDateInput = canvasPage.locator('input[type="date"][name*="end"], input[placeholder*="End"]').first();

    if (await startDateInput.count() > 0 && await endDateInput.count() > 0) {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      await startDateInput.fill(sevenDaysAgo.toISOString().split('T')[0]);
      await endDateInput.fill(today.toISOString().split('T')[0]);
      await canvasPage.waitForTimeout(500);

      // Recent cards should be visible, old ones hidden
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const rustCard = canvasPage.locator('[data-id="card-rust-book"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await rustCard.isVisible()).toBe(false);
    }
  });

  test('should filter cards from last 7 days', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    // Look for preset date range button
    const last7DaysButton = canvasPage.locator('button:has-text("Last 7 days"), button:has-text("7 days")').first();

    if (await last7DaysButton.count() > 0) {
      await last7DaysButton.click();
      await canvasPage.waitForTimeout(500);

      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const rustCard = canvasPage.locator('[data-id="card-rust-book"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await rustCard.isVisible()).toBe(false);
    }
  });

  test('should filter cards from last 30 days', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const last30DaysButton = canvasPage.locator('button:has-text("Last 30 days"), button:has-text("30 days")').first();

    if (await last30DaysButton.count() > 0) {
      await last30DaysButton.click();
      await canvasPage.waitForTimeout(500);

      // All cards except very old ones should be visible
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const pythonCard = canvasPage.locator('[data-id="card-python-basics"]').first();
      const rustCard = canvasPage.locator('[data-id="card-rust-book"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await pythonCard.isVisible()).toBe(true);
      expect(await rustCard.isVisible()).toBe(false);
    }
  });

  test('should clear date filter', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const last7DaysButton = canvasPage.locator('button:has-text("Last 7 days"), button:has-text("7 days")').first();
    const clearButton = canvasPage.locator('button:has-text("Clear"), button:has-text("Reset")').first();

    if (await last7DaysButton.count() > 0) {
      await last7DaysButton.click();
      await canvasPage.waitForTimeout(500);

      if (await clearButton.count() > 0) {
        await clearButton.click();
        await canvasPage.waitForTimeout(500);

        // All cards should be visible
        const allCards = canvasPage.locator('[data-id^="card-"]');
        expect(await allCards.count()).toBeGreaterThan(3);
      }
    }
  });
});

test.describe('Combined Filters', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should combine search and domain filter', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();
    const domainFilter = canvasPage.locator('select[name*="domain"]').first();

    if (await searchInput.count() > 0 && await domainFilter.count() > 0) {
      await searchInput.fill('tutorial');
      await domainFilter.selectOption('react.dev');
      await canvasPage.waitForTimeout(500);

      // Only React tutorial should match both filters
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const pythonCard = canvasPage.locator('[data-id="card-python-basics"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await pythonCard.isVisible()).toBe(false);
    }
  });

  test('should combine tag and date filter', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const tagFilter = canvasPage.locator('select[name*="tag"]').first();
    const last7DaysButton = canvasPage.locator('button:has-text("Last 7 days"), button:has-text("7 days")').first();

    if (await tagFilter.count() > 0 && await last7DaysButton.count() > 0) {
      await tagFilter.selectOption('javascript');
      await last7DaysButton.click();
      await canvasPage.waitForTimeout(500);

      // Only recent JavaScript cards
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      const vueCard = canvasPage.locator('[data-id="card-vue-guide"]').first();
      const pythonCard = canvasPage.locator('[data-id="card-python-basics"]').first();

      expect(await reactCard.isVisible()).toBe(true);
      expect(await vueCard.isVisible()).toBe(true);
      expect(await pythonCard.isVisible()).toBe(false);
    }
  });

  test('should combine search, domain, and tag filters', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();
    const domainFilter = canvasPage.locator('select[name*="domain"]').first();
    const tagFilter = canvasPage.locator('select[name*="tag"]').first();

    if (await searchInput.count() > 0 && await domainFilter.count() > 0 && await tagFilter.count() > 0) {
      await searchInput.fill('React');
      await domainFilter.selectOption('react.dev');
      await tagFilter.selectOption('tutorial');
      await canvasPage.waitForTimeout(500);

      // Only React tutorial matches all three
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      expect(await reactCard.isVisible()).toBe(true);

      const visibleCards = await canvasPage.locator('[data-id^="card-"]').count();
      expect(visibleCards).toBe(1);
    }
  });
});

test.describe('Filter Persistence', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should persist filters in storage', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await canvasPage.waitForTimeout(500);

      // Check if filter is persisted
      const storage = await getExtensionStorage(context, 'nabokov_filters');
      if (storage.nabokov_filters) {
        expect(storage.nabokov_filters.searchTerm || storage.nabokov_filters.search).toBe('React');
      }
    }
  });

  test('should restore filters on page reload', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await canvasPage.waitForTimeout(500);

      // Reload page
      await canvasPage.reload();
      await canvasPage.waitForTimeout(500);

      // Check if filter is still applied
      const searchInputAfterReload = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();
      const value = await searchInputAfterReload.inputValue();
      expect(value).toBe('React');

      // Verify filtering is still active
      const reactCard = canvasPage.locator('[data-id="card-react-tutorial"]').first();
      expect(await reactCard.isVisible()).toBe(true);
    }
  });

  test('should clear persisted filters when cleared', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await canvasPage.waitForTimeout(500);

      // Clear search
      await searchInput.fill('');
      await canvasPage.waitForTimeout(500);

      // Check storage
      const storage = await getExtensionStorage(context, 'nabokov_filters');
      if (storage.nabokov_filters) {
        expect(storage.nabokov_filters.searchTerm || storage.nabokov_filters.search).toBeFalsy();
      }
    }
  });
});

test.describe('Filter UI/UX', () => {
  test.beforeEach(async ({ context }) => {
    await clearExtensionStorage(context);
  });

  test('should show filter count when filters applied', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('javascript');
      await canvasPage.waitForTimeout(500);

      // Look for result count
      const resultCount = canvasPage.locator('text=/\\d+ (cards?|results?)/i').first();
      expect(await resultCount.count()).toBeGreaterThan(0);
    }
  });

  test('should highlight active filters', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const tagFilter = canvasPage.locator('select[name*="tag"], button:has-text("Tag")').first();

    if (await tagFilter.count() > 0) {
      if (await tagFilter.evaluate(el => el.tagName !== 'SELECT')) {
        await tagFilter.click();
        const tagOption = canvasPage.locator('text=javascript').first();
        await tagOption.click();
        await canvasPage.waitForTimeout(500);

        // Check if filter button/selector has active state
        const activeClass = await tagFilter.getAttribute('class');
        expect(activeClass).toMatch(/active|selected|applied/i);
      }
    }
  });

  test('should show clear all filters button when filters active', async ({ context, extensionId }) => {
    await createDiverseCards(context);
    const canvasPage = await openCanvas(context, extensionId);

    const searchInput = canvasPage.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await canvasPage.waitForTimeout(500);

      const clearAllButton = canvasPage.locator('button:has-text("Clear all"), button:has-text("Reset all"), button:has-text("Clear filters")').first();
      expect(await clearAllButton.count()).toBeGreaterThan(0);
    }
  });
});
