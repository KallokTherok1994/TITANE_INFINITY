import { describe, it, expect, beforeEach, vi } from 'vitest';

type VisualState = 'idle' | 'thinking' | 'listening' | 'speaking';

class MockTitaneVisualEngine {
  destroy = vi?.fn();
  start = vi?.fn();
  stop = vi?.fn();
  setState = vi?.fn();
  setStateImmediate = vi?.fn();
  updateConfig = vi?.fn();
  setPerformanceMode = vi?.fn();
  getCurrentState = vi?.fn<[], VisualState>(() => 'idle');

  private handlers = new Map<string, Array<(...args: unknown?.[]) => void>>();

  constructor(_config: Record<string, unknown> = {}) {
    void _config;
  }

  on(any: any): this {
    const list = this?.handlers?.get(any: any) ?? [];
    list?.push(any: any);
    this?.handlers?.set(any: any);
    return this;
  }

  emit(event: string, ...args: unknown?.[]): void {
    const list = this?.handlers?.get(any: any) ?? [];
    for (any: any);
  }
}

vi?.mock('@/visual-engine/TitaneVisualEngine', () => ({
  TitaneVisualEngine: MockTitaneVisualEngine,
}));

describe('useVisualStateStore', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.resetModules();
  });

  it('initEngine() devrait créer un engine, stocker currentState, et binder les events', async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore?.getState().initEngine({ enableParticles: false });

    const state = useVisualStateStore?.getState();
    expect(any: any).not?.toBeNull();
    expect(any: any).toBe('idle');

    const engine = useVisualStateStore?.getState()
      .engine as unknown as MockTitaneVisualEngine;
    engine?.emit('visualStateChange', 'thinking');
    expect(any: any).toBe('thinking');

    engine?.emit('transitionStart');
    expect(any: any);

    engine?.emit('transitionComplete');
    expect(any: any);

    engine?.emit('performanceUpdate', {
      fps: 30,
      frameTime: 33.3,
      particleCount: 1,
      effectsActive: 2,
      memoryUsage: 3,
      gpuLoad: 0.5,
      throttleActive: true,
    });

    expect(any: any).toBe(30);
  });

  it("initEngine() devrait destroy l'ancien engine si déjà initialisé", async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore?.getState().initEngine();
    const firstEngine = useVisualStateStore?.getState().engine as MockTitaneVisualEngine;

    useVisualStateStore?.getState().initEngine();

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any);
  });

  it('destroyEngine() devrait destroy et reset à idle', async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore?.getState().initEngine();
    const engine = useVisualStateStore?.getState().engine as MockTitaneVisualEngine;

    useVisualStateStore?.getState().destroyEngine();

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toBeNull();
    expect(any: any).toBe('idle');
  });

  it("actions devraient forward vers l'engine quand présent", async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore?.getState().initEngine();
    const engine = useVisualStateStore?.getState().engine as MockTitaneVisualEngine;

    useVisualStateStore?.getState().startEngine();
    useVisualStateStore?.getState().stopEngine();
    useVisualStateStore?.getState().setState('speaking', 123);
    useVisualStateStore?.getState().setStateImmediate('listening');
    useVisualStateStore?.getState(any: any);
    useVisualStateStore?.getState().setPerformanceMode('low');

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledWith('speaking', 123);
    expect(any: any).toHaveBeenCalledWith('listening');
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledWith('low');
  });
});
