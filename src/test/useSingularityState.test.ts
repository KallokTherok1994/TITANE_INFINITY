import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useSingularityState,
  type SingularityState,
  type EvolutionState,
} from '../hooks/useSingularityState';
import { secureInvoke } from '../lib/security';

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

const mockedSecureInvoke = vi.mocked(secureInvoke);

const singularitySnapshot: SingularityState = {
  nexus: {
    health: 'Healthy',
    coordination_count: 4,
    active_connections: 2,
    last_coordination_ms: 100,
    initialized: true,
  },
  harmonia: {
    health: 'Healthy',
    harmony_index: 92,
    balance_score: 88,
    last_check_ms: 110,
    initialized: true,
  },
  sentinel: {
    health: 'Healthy',
    alert_count: 0,
    active_monitors: 3,
    protection_level: 95,
    last_check_ms: 120,
    initialized: true,
  },
  cognition: {
    load: 30,
    active_thoughts: 5,
    depth: 7,
    last_update_ms: 130,
  },
  timeline_events: 42,
  init_timestamp_ms: 1000,
  last_sync_ms: 2000,
};

const evolutionSnapshot: EvolutionState = {
  is_running: true,
  evolution_count: 9,
  last_evolution_ms: 140,
  status: 'stable',
};

describe('useSingularityState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hydrates granular states from the unified snapshot without depending on redundant module IPC', async () => {
    mockedSecureInvoke.mockImplementation(async (command: string) => {
      if (command === 'engine_get_singularity_state') {
        return singularitySnapshot;
      }

      if (command === 'engine_get_evolution_state') {
        return evolutionSnapshot;
      }

      throw new Error(`unexpected redundant command: ${command}`);
    });

    const { result } = renderHook(() => useSingularityState(false));

    await waitFor(() => {
      expect(result.current.singularityState).toEqual(singularitySnapshot);
      expect(result.current.nexusState).toEqual(singularitySnapshot.nexus);
      expect(result.current.harmoniaState).toEqual(singularitySnapshot.harmonia);
      expect(result.current.sentinelState).toEqual(singularitySnapshot.sentinel);
      expect(result.current.cognitionState).toEqual(singularitySnapshot.cognition);
      expect(result.current.evolutionState).toEqual(evolutionSnapshot);
      expect(result.current.error).toBeNull();
    });
  });

  it('skips overlapping auto-refresh cycles while a previous refresh is still in flight', async () => {
    vi.useFakeTimers();

    let resolveState: ((value: SingularityState) => void) | null = null;
    mockedSecureInvoke.mockImplementation((command: string) => {
      if (command === 'engine_get_singularity_state') {
        return new Promise(resolve => {
          resolveState = resolve as (value: SingularityState) => void;
        });
      }

      if (command === 'engine_get_evolution_state') {
        return Promise.resolve(evolutionSnapshot);
      }

      throw new Error(`unexpected command: ${command}`);
    });

    renderHook(() => useSingularityState(true, 10));

    await act(async () => {
      vi.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(
      mockedSecureInvoke.mock.calls.filter(
        ([command]) => command === 'engine_get_singularity_state'
      )
    ).toHaveLength(1);

    await act(async () => {
      resolveState?.(singularitySnapshot);
      await Promise.resolve();
    });
  });
});
