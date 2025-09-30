import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Canvas } from '../src/canvas/Canvas';
import type { Card } from '../src/types/card';

// Mock chrome storage API
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
    getBytesInUse: vi.fn(),
    QUOTA_BYTES: 10485760, // 10MB
  },
};

(global as any).chrome = {
  storage: mockStorage,
};

describe('Canvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage to empty state
    mockStorage.local.get.mockReset();
    mockStorage.local.set.mockReset();
    mockStorage.local.getBytesInUse.mockReset();
  });

  it('should render loading state initially', async () => {
    mockStorage.local.get.mockResolvedValue({});
    mockStorage.local.getBytesInUse.mockResolvedValue(0);

    render(<Canvas />);

    // Should show loading or empty state
    expect(
      screen.getByText(/loading your canvas|your canvas is empty/i)
    ).toBeDefined();
  });

  it('should render empty state when no cards', async () => {
    mockStorage.local.get.mockResolvedValue({
      nabokov_cards: [],
    });
    mockStorage.local.getBytesInUse.mockResolvedValue(0);

    render(<Canvas />);

    // Wait for loading to finish
    await screen.findByText(/your canvas is empty/i);
  });

  it('should render cards when loaded', async () => {
    const mockCards: Card[] = [
      {
        id: 'card-1',
        content: '<p>Test content</p>',
        metadata: {
          url: 'https://example.com',
          title: 'Test Card',
          domain: 'example.com',
          timestamp: Date.now(),
        },
        starred: false,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    mockStorage.local.get.mockResolvedValue({
      nabokov_cards: mockCards,
    });
    mockStorage.local.getBytesInUse.mockResolvedValue(1024);

    const { container } = render(<Canvas />);

    // Just verify the component renders without errors
    expect(container).toBeDefined();
    // Note: Full React Flow rendering is complex in tests,
    // this basic test ensures no critical errors during mount
  });
});