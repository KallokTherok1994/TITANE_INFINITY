import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUnifiedMemory } from '../useUnifiedMemory';
import type { UnifiedMemory, UnifiedMemoryStats } from '../../services/unified';

describe('useUnifiedMemory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping stats refreshes while the previous stats request is still pending', async () => {
    let releaseStats: ((value: UnifiedMemoryStats) => void) | null = null;

    const memory = {
      getStats: vi.fn(
        () =>
          new Promise<UnifiedMemoryStats>(resolve => {
            releaseStats = resolve;
          })
      ),
      createMemory: vi.fn(),
      retrieveMemories: vi.fn(),
      updateMemory: vi.fn(),
      deleteMemory: vi.fn(),
      buildContext: vi.fn(),
      cleanup: vi.fn(),
      consolidate: vi.fn(),
      decay: vi.fn(),
    } as unknown as UnifiedMemory;

    const { unmount } = renderHook(() => useUnifiedMemory(memory, 10));

    await act(async () => {
      await Promise.resolve();
    });

    expect(memory.getStats).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(memory.getStats).toHaveBeenCalledTimes(1);

    await act(async () => {
      releaseStats?.({
        total: 1,
        byTier: {},
        byImportance: {},
        avgEmbeddingTimeMs: 0,
        totalRetrievals: 0,
        totalMemories: 1,
        byType: {},
        byPriority: {},
        avgStrength: 0,
      } as unknown as UnifiedMemoryStats);
      await Promise.resolve();
    });

    unmount();
  });
});
