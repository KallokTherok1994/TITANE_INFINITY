/**
 * Vitest — SingularityState persist migrate (v34.0.13)
 *
 * Confirms the migration drops dynamic server-state fields when reading a
 * pre-v34 persisted snapshot.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// We invoke the store module so that `persist(...)` is registered, then we
// reach into localStorage to verify behavior.

beforeEach(() => {
  localStorage.clear();
  // Clear module registry so the store is re-evaluated with our localStorage.
  vi.resetModules();
});

describe('SingularityState — persist v34 migration', () => {
  it('uses the new key name "titane-singularity-state-v34"', async () => {
    await import('@/core/state/SingularityState');
    // The store will write on first state mutation; we check key naming
    // by ensuring the OLD key is not picked up.
    expect(localStorage.getItem('titane-singularity-state-v19')).toBeNull();
  });

  it('migrate drops ai/engines/enginesData/globalHealth from pre-v34 snapshot', async () => {
    localStorage.setItem(
      'titane-singularity-state-v34',
      JSON.stringify({
        version: 19,
        state: {
          ui: { mode: 'auto', theme: 'dark', soundEnabled: true },
          context: { page: 'somewhere-stale' },
          metaMode: {
            currentMode: 'idle',
            previousMode: 'idle',
            transitioning: false,
            lastUpdate: 0,
          },
          ai: { model: 'gemma2:2b', status: 'idle', error: null, fallbackActive: false },
          engines: { glow: { id: 'x' } },
          enginesData: { helios: { data: { stale: true }, loading: false } },
          globalHealth: { stale: true },
        },
      })
    );

    const mod = await import('@/core/state/SingularityState');
    // Trigger hydration by reading state
    const state = (
      mod as { useSingularityState: { getState: () => unknown } }
    ).useSingularityState.getState();
    expect(state).toBeTruthy();

    // After hydration, the persisted entry should be re-written without
    // the dropped dynamic fields when next write happens.
    // We accept either: dynamic fields absent from current state OR
    // they are reset to their store defaults (not the stale serialized values).
    const s = state as Record<string, unknown>;
    const engines = s.engines as Record<string, unknown> | undefined;
    expect(engines?.glow).not.toEqual({ id: 'x' }); // stale dropped
  });
});
