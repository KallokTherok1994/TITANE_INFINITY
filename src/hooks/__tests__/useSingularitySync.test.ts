import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { secureInvoke } from '../../lib/security';
import { singularityEngine } from '../../core/engines/SINGULARITY_ENGINE';

import { useSingularitySync } from '../useSingularitySync';

vi.mock('../../lib/security', () => ({
  secureInvoke: vi.fn(),
}));

vi.mock('../../core/engines/SINGULARITY_ENGINE', () => ({
  singularityEngine: {
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

describe('useSingularitySync', () => {
  const syncedState = {
    timestamp: 42,
    consciousness: 0.91,
    autoCoherence: 0.82,
    formStability: 0.73,
    evolutionCapacity: 0.64,
    expressionQuality: 0.55,
    signature: 'sync-signature',
    essence: 'sync-essence',
    unity: { status: 'aligned' },
    quantum: { coherence: 0.88 },
    convergence: { convergenceLevel: 0.77 },
  } as any;

  const mockedSecureInvoke = vi.mocked(secureInvoke);
  const mockedSingularityEngine = vi.mocked(singularityEngine);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedSingularityEngine.getState.mockReturnValue(syncedState);
    mockedSingularityEngine.setState.mockImplementation(() => undefined);
  });

  it('reuses an in-flight backend sync when sync is triggered again before completion', async () => {
    let resolveFetch: ((value: typeof syncedState) => void) | null = null;

    mockedSecureInvoke.mockImplementation((command: string) => {
      if (command === 'singularity_get_full_state') {
        return new Promise(resolve => {
          resolveFetch = resolve as (value: typeof syncedState) => void;
        }) as never;
      }

      return Promise.resolve(undefined) as never;
    });

    const { result, unmount } = renderHook(() =>
      useSingularitySync({ autoSync: false, bidirectional: false })
    );

    let firstSync: Promise<void>;
    let secondSync: Promise<void>;

    await act(async () => {
      firstSync = result.current.sync();
      secondSync = result.current.sync();
      await Promise.resolve();
    });

    expect(mockedSecureInvoke).toHaveBeenCalledTimes(1);
    expect(mockedSecureInvoke).toHaveBeenCalledWith('singularity_get_full_state');

    await act(async () => {
      resolveFetch?.(syncedState);
      await Promise.all([firstSync!, secondSync!]);
    });

    unmount();
  });
});
