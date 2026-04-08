import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLivingEngines } from '../useLivingEngines';
import { personaTauriBridge } from '../../services/personaTauriBridge';

vi.mock('../../services/personaTauriBridge', () => ({
  personaTauriBridge: {
    isTauriEnvironment: vi.fn(() => true),
    initialize: vi.fn(async () => {}),
    getState: vi.fn(),
    getMultipliers: vi.fn(async () => ({
      glow: 1,
      motion: 1,
      depth: 1,
      sound: 1,
    })),
    update: vi.fn(async () => null),
    react: vi.fn(async () => null),
  },
}));

describe('useLivingEngines', () => {
  const mockedBridge = vi.mocked(personaTauriBridge);

  beforeEach(() => {
    vi.useFakeTimers();
    mockedBridge.initialize.mockClear();
    mockedBridge.getState.mockReset();
    mockedBridge.getMultipliers.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping persona polling while the previous update is still pending', async () => {
    let releaseState: ((value: any) => void) | null = null;

    mockedBridge.getState.mockImplementation(
      () =>
        new Promise(resolve => {
          releaseState = resolve;
        })
    );

    const { unmount } = renderHook(() => useLivingEngines(100));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockedBridge.initialize).toHaveBeenCalledTimes(1);
    expect(mockedBridge.getState).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(mockedBridge.getState).toHaveBeenCalledTimes(1);

    await act(async () => {
      if (releaseState) {
        releaseState({
          intensity: 0.5,
          presenceLevel: 0.5,
        });
      }
      await Promise.resolve();
    });

    unmount();
  });
});
