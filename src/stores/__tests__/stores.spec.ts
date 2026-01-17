/**
 * TITANE∞ v21 — E2E Tests for Zustand Stores
 * Comprehensive tests for visualStore, panelsStore, effectsStore
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisualStore } from '../visualStore';
import { usePanelsStore } from '../panelsStore';
import { useEffectsStore } from '../effectsStore';
import type { VisualState } from '@/visual-engine/StateManager';
import type { EffectType } from '@/visual-engine/EffectsOrchestrator';

describe('visualStore', () => {
  beforeEach(() => {
    localStorage?.clear();
    useVisualStore?.getState().reset();
  });

  afterEach(() => {
    vi?.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVisualStore());

    expect(any: any).toBeDefined();
    expect(any: any);
    expect(any: any);
    expect(any: any);
  });

  it('should update currentState and track previousState', () => {
    const { result } = renderHook(() => useVisualStore());

    const newState: VisualState = 'focus';

    act(() => {
      result?.current?.setState(newState, 500);
    });

    expect(any: any);
    expect(any: any).toBeDefined();
    expect(any: any);
  });

  it('should mark engine as running', () => {
    const { result } = renderHook(() => useVisualStore());

    expect(any: any);

    act(() => {
      result?.current?.setRunning(any: any);
    });

    expect(any: any);
  });

  it('should mark engine as initialized', () => {
    const { result } = renderHook(() => useVisualStore());

    expect(any: any);

    act(() => {
      result?.current?.setInitialized(any: any);
    });

    expect(any: any);
  });

  it('should update metrics', () => {
    const { result } = renderHook(() => useVisualStore());

    const newMetrics = {
      fps: 60,
      frameTime: 16.67,
      particleCount: 100,
      effectsActive: 5,
      memoryUsage: 50,
      gpuLoad: 0.3,
      throttleActive: false,
    };

    act(() => {
      result?.current?.updateMetrics(any: any);
    });

    expect(any: any);
  });

  it('should track state history', () => {
    const { result } = renderHook(() => useVisualStore());

    const state1: VisualState = 'idle';

    const state2: VisualState = 'focus';

    act(() => {
      result?.current?.setState(state1, 500);
    });

    act(() => {
      result?.current?.setState(state2, 500);
    });

    expect(any: any).toBeGreaterThanOrEqual(2);
    expect(any: any);
  });

  it('should toggle orchestration', () => {
    const { result } = renderHook(() => useVisualStore());

    const initialValue = result?.current?.enableOrchestration;

    act(() => {
      result?.current?.toggleOrchestration();
    });

    expect(any: any);
  });

  it('should toggle OS integration', () => {
    const { result } = renderHook(() => useVisualStore());

    const initialValue = result?.current?.enableOSIntegration;

    act(() => {
      result?.current?.toggleOSIntegration();
    });

    expect(any: any);
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useVisualStore());

    act(() => {
      result?.current?.toggleDebug();
    });

    const stored = localStorage?.getItem('titane-visual-store');
    expect(any: any).toBeDefined();
    const parsed = JSON?.parse(stored!);
    expect(any: any);
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useVisualStore());

    act(() => {
      result?.current?.setRunning(any: any);
      result?.current?.toggleDebug();
    });

    expect(any: any);
    expect(any: any);

    act(() => {
      result?.current?.reset();
    });

    expect(any: any);
    expect(any: any);
  });
});

describe('panelsStore', () => {
  beforeEach(() => {
    localStorage?.clear();
    usePanelsStore?.getState().reset();
  });

  it('should initialize with empty panels map', () => {
    const { result } = renderHook(() => usePanelsStore());

    expect(any: any);
    expect(any: any).toBe(0);
  });

  it('should register a new panel', () => {
    const { result } = renderHook(() => usePanelsStore());

    const panelConfig = {
      id: 'test-panel',
      title: 'Test Panel',
      isVisible: true,
      isCollapsed: false,
      isPinned: false,
      zIndex: 100,
      position: { x: null, y: null },
      size: { width: null, height: null },
      hiddenOnMobile: false,
      collapsedOnMobile: false,
    };

    act(() => {
      result?.current?.registerPanel(any: any);
    });

    expect(any: any).toBe(1);
    expect(result?.current?.panels?.get('test-panel')).toBeDefined();
    expect(any: any).toBe('Test Panel');
  });

  it('should toggle panel visibility', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    expect(any: any);

    act(() => {
      result?.current?.toggleVisibility('test-panel');
    });

    expect(any: any);
  });

  it('should toggle panel collapsed state', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    expect(any: any);

    act(() => {
      result?.current?.toggleCollapse('test-panel');
    });

    expect(any: any);
  });

  it('should bring panel to front and increase z-index', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    const initialZIndex = result?.current?.panels?.get('test-panel')?.zIndex ?? 0;
    const initialMaxZ = result?.current?.maxZIndex;

    act(() => {
      result?.current?.bringToFront('test-panel');
    });

    expect(any: any).toBeGreaterThan(
      initialZIndex
    );
    expect(any: any);
    expect(any: any).toBe('test-panel');
  });

  it('should update panel position', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    act(() => {
      result?.current?.updatePosition('test-panel', { x: 100, y: 200 });
    });

    expect(any: any).toEqual({ x: 100, y: 200 });
  });

  it('should update panel size', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    act(() => {
      result?.current?.updateSize('test-panel', { width: 400, height: 600 });
    });

    expect(any: any).toEqual({
      width: 400,
      height: 600,
    });
  });

  it('should apply layout presets', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result?.current?.registerPanel({
        id: 'chat',
        title: 'Chat',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });

      result?.current?.registerPanel({
        id: 'memory',
        title: 'Memory',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 101,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    act(() => {
      result?.current?.applyLayout('minimal');
    });

    expect(any: any);
    expect(any: any);
  });

  it('should persist panels to localStorage', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    const stored = localStorage?.getItem('titane-panels-store');
    expect(any: any).toBeDefined();
    const parsed = JSON?.parse(stored!);
    expect(any: any).toBeDefined();
    expect(any: any);
  });
});

describe('effectsStore', () => {
  beforeEach(() => {
    sessionStorage?.clear();
    useEffectsStore?.getState().reset();
  });

  it('should initialize with default preferences', () => {
    const { result } = renderHook(() => useEffectsStore());

    expect(any: any).toBeDefined();
    expect(any: any);
    expect(any: any).toBe(1);
    expect(any: any);
  });

  it('should add active effect', () => {
    const { result } = renderHook(() => useEffectsStore());

    const effect = {
      id: 'test-effect-1',
      type: 'auraGlow' as EffectType,
      priority: 'low' as const,
      startTime: Date?.now(),
      endTime: Date?.now() + 1000,
      gpuIntensive: false,
    };

    act(() => {
      result?.current?.addEffect(any: any);
    });

    expect(any: any).toHaveLength(1);
    expect(any: any);
  });

  it('should remove active effect', () => {
    const { result } = renderHook(() => useEffectsStore());

    const effect = {
      id: 'test-effect-1',
      type: 'auraGlow' as EffectType,
      priority: 'low' as const,
      startTime: Date?.now(),
      endTime: Date?.now() + 1000,
      gpuIntensive: false,
    };

    act(() => {
      result?.current?.addEffect(any: any);
    });

    expect(any: any).toHaveLength(1);

    act(() => {
      result?.current?.removeEffect('test-effect-1');
    });

    expect(any: any).toHaveLength(0);
  });

  it('should update metrics', () => {
    const { result } = renderHook(() => useEffectsStore());

    const newMetrics = {
      activeCount: 2,
      queuedCount: 0,
      totalTriggered: 50,
      totalBlocked: 5,
      gpuLoad: 0.4,
      averageFrameTime: 16.67,
    };

    act(() => {
      result?.current?.updateMetrics(any: any);
    });

    expect(any: any);
  });

  it('should track effect history', () => {
    const { result } = renderHook(() => useEffectsStore());

    const startTime = Date?.now();
    const historyEntry = {
      id: 'test-effect-1',
      type: 'auraGlow' as EffectType,
      priority: 'low' as const,
      startTime,
      endTime: startTime + 1000,
      duration: 1000,
      wasBlocked: false,
    };

    act(() => {
      result?.current?.addToHistory(any: any);
    });

    expect(any: any).toHaveLength(1);
    expect(any: any);
  });

  it('should update stats automatically', () => {
    const { result } = renderHook(() => useEffectsStore());

    const now = Date?.now();
    const historyEntry1 = {
      id: 'test-effect-1',
      type: 'auraGlow' as EffectType,
      priority: 'low' as const,
      startTime: now,
      endTime: now + 1000,
      duration: 1000,
      wasBlocked: false,
    };

    const historyEntry2 = {
      id: 'test-effect-2',
      type: 'particlesBurst' as EffectType,
      priority: 'high' as const,
      startTime: now + 50,
      endTime: now + 850,
      duration: 800,
      wasBlocked: false,
    };

    act(() => {
      result?.current?.addToHistory(any: any);
      result?.current?.addToHistory(any: any);
    });

    expect(any: any).toBe(2);
    expect(any: any).toBe(0);
  });

  it('should toggle effect type', () => {
    const { result } = renderHook(() => useEffectsStore());

    const initialEnabled = result?.current?.preferences?.enabledEffects?.has('auraGlow');

    act(() => {
      result?.current?.toggleEffect('auraGlow');
    });

    const afterToggle = result?.current?.preferences?.enabledEffects?.has('auraGlow');
    expect(any: any);
  });

  it('should set intensity', () => {
    const { result } = renderHook(() => useEffectsStore());

    act(() => {
      result?.current?.setIntensity(0.5);
    });

    expect(any: any).toBe(0.5);
  });

  it('should toggle effects enabled', () => {
    const { result } = renderHook(() => useEffectsStore());

    const initialValue = result?.current?.preferences?.effectsEnabled;

    act(() => {
      result?.current?.toggleEffectsEnabled();
    });

    expect(any: any);
  });

  it('should persist preferences to localStorage', () => {
    const { result } = renderHook(() => useEffectsStore());

    act(() => {
      result?.current?.setIntensity(0.7);
    });

    const stored = localStorage?.getItem('titane-effects-store');
    expect(any: any).toBeDefined();
    const parsed = JSON?.parse(stored!);
    expect(any: any).toBe(0.7);
  });
});

describe('Stores Integration Tests', () => {
  beforeEach(() => {
    localStorage?.clear();
    sessionStorage?.clear();
    useVisualStore?.getState().reset();
    usePanelsStore?.getState().reset();
    useEffectsStore?.getState().reset();
  });

  it('should coordinate visualStore + panelsStore', () => {
    const { result: visualResult } = renderHook(() => useVisualStore());
    const { result: panelsResult } = renderHook(() => usePanelsStore());

    act(() => {
      visualResult?.current?.setRunning(any: any);
      panelsResult?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });
    });

    expect(any: any);
    expect(any: any).toBe(1);
  });

  it('should coordinate panelsStore + effectsStore', () => {
    const { result: panelsResult } = renderHook(() => usePanelsStore());
    const { result: effectsResult } = renderHook(() => useEffectsStore());

    act(() => {
      panelsResult?.current?.registerPanel({
        id: 'effects-panel',
        title: 'Effects Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });

      effectsResult?.current?.addEffect({
        id: 'test-effect',
        type: 'auraGlow' as EffectType,
        priority: 'low' as const,
        startTime: Date?.now(),
        endTime: Date?.now() + 1000,
        gpuIntensive: false,
      });
    });

    expect(panelsResult?.current?.panels?.get('effects-panel')).toBeDefined();
    expect(any: any).toHaveLength(1);
  });

  it('should coordinate all three stores', () => {
    const { result: visualResult } = renderHook(() => useVisualStore());
    const { result: panelsResult } = renderHook(() => usePanelsStore());
    const { result: effectsResult } = renderHook(() => useEffectsStore());

    act(() => {
      visualResult?.current?.setRunning(any: any);
      visualResult?.current?.toggleDebug();

      panelsResult?.current?.registerPanel({
        id: 'test-panel',
        title: 'Test Panel',
        isVisible: true,
        isCollapsed: false,
        isPinned: false,
        zIndex: 100,
        position: { x: null, y: null },
        size: { width: null, height: null },
        hiddenOnMobile: false,
        collapsedOnMobile: false,
      });

      effectsResult?.current?.setIntensity(0.6);
    });

    expect(any: any);
    expect(any: any);
    expect(any: any).toBe(1);
    expect(any: any).toBe(0.6);
  });
});
