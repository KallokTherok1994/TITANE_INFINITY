/**
 * TITANE∞ — Unit tests for TimeToTwinObserver (Phase 3).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTimeToTwinObserver } from '@/services/temporal/timeToTwinObserver';

describe('TimeToTwinObserver', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pulseOnce pousse une observation cognitive valide', async () => {
    const submit = vi.fn().mockResolvedValue({ ok: true });
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockResolvedValue({
        overall: 0.8,
        energy: 0.7,
        alignment: 0.6,
        consistency: 0.5,
        recovery: 0.4,
      }),
      fetchAlignment: vi.fn().mockResolvedValue({
        score: 0.5,
        active_goals: 3,
        completed_goals: 1,
      }),
      submit,
    });

    const res = await observer.pulseOnce();
    expect(res.pushed).toBe(true);
    expect(submit).toHaveBeenCalledTimes(1);
    const payload = submit.mock.calls[0][0];
    expect(payload.observation_type).toBe('cognitive');
    expect(payload.context).toBe('temporal_engine');
    expect(payload.confidence).toBeCloseTo(0.65, 2);
    expect(payload.content).toMatch(/temporal\.health\.overall=0\.80/);
    expect(payload.content).toMatch(/temporal\.alignment\.score=0\.50/);
  });

  it('pulseOnce remonte raison sur échec submit', async () => {
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockResolvedValue({
        overall: 0.5,
        energy: 0.5,
        alignment: 0.5,
        consistency: 0.5,
        recovery: 0.5,
      }),
      fetchAlignment: vi
        .fn()
        .mockResolvedValue({ score: 0.5, active_goals: 0, completed_goals: 0 }),
      submit: vi.fn().mockResolvedValue({ ok: false, error: 'IPC_DOWN' }),
    });

    const res = await observer.pulseOnce();
    expect(res.pushed).toBe(false);
    expect(res.reason).toBe('IPC_DOWN');
  });

  it('start déclenche un pulse + planifie un interval', async () => {
    const submit = vi.fn().mockResolvedValue({ ok: true });
    const observer = createTimeToTwinObserver({
      intervalMs: 5000,
      fetchHealth: vi.fn().mockResolvedValue({
        overall: 0.5,
        energy: 0.5,
        alignment: 0.5,
        consistency: 0.5,
        recovery: 0.5,
      }),
      fetchAlignment: vi
        .fn()
        .mockResolvedValue({ score: 0.5, active_goals: 0, completed_goals: 0 }),
      submit,
    });

    observer.start();
    expect(observer.isRunning()).toBe(true);

    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    expect(submit).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5000);
    await Promise.resolve();
    expect(submit.mock.calls.length).toBeGreaterThanOrEqual(2);

    observer.stop();
    expect(observer.isRunning()).toBe(false);
  });

  it('survit aux erreurs fetcher sans planter', async () => {
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockRejectedValue(new Error('engine_offline')),
      fetchAlignment: vi
        .fn()
        .mockResolvedValue({ score: 0.5, active_goals: 0, completed_goals: 0 }),
      submit: vi.fn().mockResolvedValue({ ok: true }),
    });

    const res = await observer.pulseOnce();
    expect(res.pushed).toBe(false);
    expect(res.reason).toMatch(/engine_offline/);
  });
});

describe('TimeToTwinObserver — Phase 7 hardening', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const healthOk = {
    overall: 0.8,
    energy: 0.7,
    alignment: 0.6,
    consistency: 0.5,
    recovery: 0.4,
  };
  const alignOk = { score: 0.5, active_goals: 2, completed_goals: 0 };

  it('déclenche backoff exponentiel après 3 échecs consécutifs', async () => {
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockResolvedValue(healthOk),
      fetchAlignment: vi.fn().mockResolvedValue(alignOk),
      submit: vi.fn().mockResolvedValue({ ok: false, error: 'NET_DOWN' }),
      pauseOnHidden: false,
    });

    await observer.pulseOnce();
    await observer.pulseOnce();
    let st = observer.getStatus();
    expect(st.consecutiveFailures).toBe(2);
    expect(st.currentBackoffMs).toBe(60_000); // base, pas encore backoff

    await observer.pulseOnce();
    st = observer.getStatus();
    expect(st.consecutiveFailures).toBe(3);
    expect(st.currentBackoffMs).toBe(60_000); // 1er palier ladder = 60s

    await observer.pulseOnce();
    st = observer.getStatus();
    expect(st.consecutiveFailures).toBe(4);
    expect(st.currentBackoffMs).toBe(120_000); // 2e palier

    await observer.pulseOnce();
    expect(observer.getStatus().currentBackoffMs).toBe(240_000);

    await observer.pulseOnce();
    expect(observer.getStatus().currentBackoffMs).toBe(300_000); // cap

    await observer.pulseOnce();
    expect(observer.getStatus().currentBackoffMs).toBe(300_000); // reste capé
  });

  it('reset backoff au premier succès', async () => {
    const submit = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, error: 'X' })
      .mockResolvedValueOnce({ ok: false, error: 'X' })
      .mockResolvedValueOnce({ ok: false, error: 'X' })
      .mockResolvedValueOnce({ ok: true });
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockResolvedValue(healthOk),
      fetchAlignment: vi.fn().mockResolvedValue(alignOk),
      submit,
      pauseOnHidden: false,
    });

    await observer.pulseOnce();
    await observer.pulseOnce();
    await observer.pulseOnce();
    expect(observer.getStatus().consecutiveFailures).toBe(3);

    await observer.pulseOnce();
    const st = observer.getStatus();
    expect(st.consecutiveFailures).toBe(0);
    expect(st.lastError).toBeNull();
    expect(st.currentBackoffMs).toBe(60_000);
    expect(st.totalPushed).toBe(1);
    expect(st.totalFailed).toBe(3);
  });

  it('expose un getStatus complet et stable', async () => {
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockResolvedValue(healthOk),
      fetchAlignment: vi.fn().mockResolvedValue(alignOk),
      submit: vi.fn().mockResolvedValue({ ok: true }),
      pauseOnHidden: false,
    });
    const initial = observer.getStatus();
    expect(initial.running).toBe(false);
    expect(initial.paused).toBe(false);
    expect(initial.lastPulseAt).toBeNull();
    expect(initial.totalPushed).toBe(0);
    expect(initial.totalFailed).toBe(0);
    expect(initial.intervalMs).toBe(60_000);

    await observer.pulseOnce();
    const after = observer.getStatus();
    expect(after.totalPushed).toBe(1);
    expect(after.lastPulseAt).not.toBeNull();
    // Immutabilité: muter la copie ne change pas l'interne
    after.totalPushed = 999;
    expect(observer.getStatus().totalPushed).toBe(1);
  });

  it('pause sur visibilitychange hidden et reprend visible', async () => {
    const originalDoc = globalThis.document;
    let state: 'visible' | 'hidden' = 'visible';
    const listeners: Array<() => void> = [];
    const docMock = {
      get visibilityState() {
        return state;
      },
      addEventListener: (_evt: string, cb: () => void) => listeners.push(cb),
      removeEventListener: (_evt: string, cb: () => void) => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      },
    };
    // @ts-expect-error inject mock
    globalThis.document = docMock;

    try {
      const observer = createTimeToTwinObserver({
        intervalMs: 1000,
        fetchHealth: vi.fn().mockResolvedValue(healthOk),
        fetchAlignment: vi.fn().mockResolvedValue(alignOk),
        submit: vi.fn().mockResolvedValue({ ok: true }),
        pauseOnHidden: true,
      });
      observer.start();
      expect(observer.getStatus().running).toBe(true);
      expect(observer.getStatus().paused).toBe(false);

      // simulate hidden
      state = 'hidden';
      listeners.forEach(cb => cb());
      expect(observer.getStatus().paused).toBe(true);

      // simulate visible
      state = 'visible';
      listeners.forEach(cb => cb());
      expect(observer.getStatus().paused).toBe(false);

      observer.stop();
      expect(listeners.length).toBe(0);
    } finally {
      // @ts-expect-error restore
      globalThis.document = originalDoc;
    }
  });

  it('singleton ignore et avertit en cas de dérive intervalMs', async () => {
    const mod = await import('@/services/temporal/timeToTwinObserver');
    mod.resetRuntimeTimeToTwinObserverForTests();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const a = mod.getRuntimeTimeToTwinObserver({ intervalMs: 5000 });
    const b = mod.getRuntimeTimeToTwinObserver({ intervalMs: 9999 });
    expect(a).toBe(b);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/intervalMs drift ignored/);

    mod.resetRuntimeTimeToTwinObserverForTests();
    warnSpy.mockRestore();
  });
});
