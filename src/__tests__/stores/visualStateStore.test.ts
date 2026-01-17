import { describe, it, expect, beforeEach, vi } from 'vitest';

type VisualState = 'idle' | 'thinking' | 'listening' | 'speaking';

class MockTitaneVisualEngine {
  destroy = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  setState = vi.fn();
  setStateImmediate = vi.fn();
  updateConfig = vi.fn();
  setPerformanceMode = vi.fn();
  getCurrentState = vi.fn<[], VisualState>(() => 'idle');

  private handlers = new Map<string, Array<(...args: unknown[]) => void>>();

  constructor(_config: Record<string, unknown> = {}) {
    void _config;
  }

  on(event: string, cb: (...args: unknown[]) => void): this {
    const list = this.handlers.get(event) ?? [];
    list.push(cb);
    this.handlers.set(event, list);
    return this;
  }

  emit(event: string, ...args: unknown[]): void {
    const list = this.handlers.get(event) ?? [];
    for (const cb of list) cb(...args);
  }
}

vi.mock('@/visual-engine/TitaneVisualEngine', () => ({
  TitaneVisualEngine: MockTitaneVisualEngine,
}));

describe('useVisualStateStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('initEngine() devrait créer un engine, stocker currentState, et binder les events', async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore.getState().initEngine({ enableParticles: false });

    const state = useVisualStateStore.getState();
    expect(state.engine).not.toBeNull();
    expect(state.currentState).toBe('idle');

    const engine = useVisualStateStore.getState()
      .engine as unknown as MockTitaneVisualEngine;
    engine.emit('visualStateChange', 'thinking');
    expect(useVisualStateStore.getState().currentState).toBe('thinking');

    engine.emit('transitionStart');
    expect(useVisualStateStore.getState().isTransitioning).toBe(true);

    engine.emit('transitionComplete');
    expect(useVisualStateStore.getState().isTransitioning).toBe(false);

    engine.emit('performanceUpdate', {
      fps: 30,
      frameTime: 33.3,
      particleCount: 1,
      effectsActive: 2,
      memoryUsage: 3,
      gpuLoad: 0.5,
      throttleActive: true,
    });

    expect(useVisualStateStore.getState().performanceMetrics.fps).toBe(30);
  });

  it("initEngine() devrait destroy l'ancien engine si déjà initialisé", async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore.getState().initEngine();
    const firstEngine = useVisualStateStore.getState().engine as MockTitaneVisualEngine;

    useVisualStateStore.getState().initEngine();

    expect(firstEngine.destroy).toHaveBeenCalledTimes(1);
    expect(useVisualStateStore.getState().engine).not.toBe(firstEngine);
  });

  it('destroyEngine() devrait destroy et reset à idle', async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore.getState().initEngine();
    const engine = useVisualStateStore.getState().engine as MockTitaneVisualEngine;

    useVisualStateStore.getState().destroyEngine();

    expect(engine.destroy).toHaveBeenCalledTimes(1);
    expect(useVisualStateStore.getState().engine).toBeNull();
    expect(useVisualStateStore.getState().currentState).toBe('idle');
  });

  it("actions devraient forward vers l'engine quand présent", async () => {
    const { useVisualStateStore } = await import('../../stores/visualStateStore');

    useVisualStateStore.getState().initEngine();
    const engine = useVisualStateStore.getState().engine as MockTitaneVisualEngine;

    useVisualStateStore.getState().startEngine();
    useVisualStateStore.getState().stopEngine();
    useVisualStateStore.getState().setState('speaking', 123);
    useVisualStateStore.getState().setStateImmediate('listening');
    useVisualStateStore.getState().updateConfig({ enableEffects: false } as never);
    useVisualStateStore.getState().setPerformanceMode('low');

    expect(engine.start).toHaveBeenCalledTimes(1);
    expect(engine.stop).toHaveBeenCalledTimes(1);
    expect(engine.setState).toHaveBeenCalledWith('speaking', 123);
    expect(engine.setStateImmediate).toHaveBeenCalledWith('listening');
    expect(engine.updateConfig).toHaveBeenCalledTimes(1);
    expect(engine.setPerformanceMode).toHaveBeenCalledWith('low');
  });
});
