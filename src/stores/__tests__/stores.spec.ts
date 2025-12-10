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
import type { EffectType } from '@/visual-engine/effects/EffectsOrchestrator';

describe('visualStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useVisualStore.getState().reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVisualStore());

    expect(result.current.currentState).toBeDefined();
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isInitialized).toBe(false);
  });

  it('should update currentState and track previousState', () => {
    const { result } = renderHook(() => useVisualStore());

    const newState: VisualState = {
      id: 'focus',
      name: 'Focus',
      description: 'Focus mode',
      background: '#1a1a2e',
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      text: '#ffffff',
      glow: '0 0 20px rgba(59, 130, 246, 0.5)',
    };

    act(() => {
      result.current.setState(newState, 500);
    });

    expect(result.current.currentState).toEqual(newState);
    expect(result.current.previousState).toBeDefined();
    expect(result.current.isTransitioning).toBe(true);
  });

  it('should mark engine as running', () => {
    const { result } = renderHook(() => useVisualStore());

    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.setRunning(true);
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('should mark engine as initialized', () => {
    const { result } = renderHook(() => useVisualStore());

    expect(result.current.isInitialized).toBe(false);

    act(() => {
      result.current.setInitialized(true);
    });

    expect(result.current.isInitialized).toBe(true);
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
      result.current.updateMetrics(newMetrics);
    });

    expect(result.current.metrics).toEqual(newMetrics);
  });

  it('should track state history', () => {
    const { result } = renderHook(() => useVisualStore());

    const state1: VisualState = {
      id: 'idle',
      name: 'Idle',
      description: 'Idle state',
      background: '#0f172a',
      primary: '#64748b',
      secondary: '#475569',
      accent: '#94a3b8',
      text: '#e2e8f0',
      glow: '0 0 10px rgba(148, 163, 184, 0.3)',
    };

    const state2: VisualState = {
      id: 'focus',
      name: 'Focus',
      description: 'Focus mode',
      background: '#1a1a2e',
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      text: '#ffffff',
      glow: '0 0 20px rgba(59, 130, 246, 0.5)',
    };

    act(() => {
      result.current.setState(state1, 500);
    });

    act(() => {
      result.current.setState(state2, 500);
    });

    expect(result.current.stateHistory.length).toBeGreaterThanOrEqual(2);
    expect(result.current.stateHistory[0].state).toEqual(state1);
  });

  it('should toggle orchestration', () => {
    const { result } = renderHook(() => useVisualStore());

    const initialValue = result.current.enableOrchestration;

    act(() => {
      result.current.toggleOrchestration();
    });

    expect(result.current.enableOrchestration).toBe(!initialValue);
  });

  it('should toggle OS integration', () => {
    const { result } = renderHook(() => useVisualStore());

    const initialValue = result.current.enableOSIntegration;

    act(() => {
      result.current.toggleOSIntegration();
    });

    expect(result.current.enableOSIntegration).toBe(!initialValue);
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useVisualStore());

    act(() => {
      result.current.toggleDebug();
    });

    const stored = localStorage.getItem('titane-visual-store');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.debug).toBe(true);
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useVisualStore());

    act(() => {
      result.current.setRunning(true);
      result.current.toggleDebug();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.debug).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.debug).toBe(false);
  });
});

describe('panelsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    usePanelsStore.getState().reset();
  });

  it('should initialize with empty panels map', () => {
    const { result } = renderHook(() => usePanelsStore());

    expect(result.current.panels).toBeInstanceOf(Map);
    expect(result.current.panels.size).toBe(0);
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
      result.current.registerPanel(panelConfig);
    });

    expect(result.current.panels.size).toBe(1);
    expect(result.current.panels.get('test-panel')).toBeDefined();
    expect(result.current.panels.get('test-panel')?.title).toBe('Test Panel');
  });

  it('should toggle panel visibility', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result.current.registerPanel({
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

    expect(result.current.panels.get('test-panel')?.isVisible).toBe(true);

    act(() => {
      result.current.toggleVisibility('test-panel');
    });

    expect(result.current.panels.get('test-panel')?.isVisible).toBe(false);
  });

  it('should toggle panel collapsed state', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result.current.registerPanel({
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

    expect(result.current.panels.get('test-panel')?.isCollapsed).toBe(false);

    act(() => {
      result.current.toggleCollapse('test-panel');
    });

    expect(result.current.panels.get('test-panel')?.isCollapsed).toBe(true);
  });

  it('should bring panel to front and increase z-index', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result.current.registerPanel({
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

    const initialZIndex = result.current.panels.get('test-panel')?.zIndex ?? 0;
    const initialMaxZ = result.current.maxZIndex;

    act(() => {
      result.current.bringToFront('test-panel');
    });

    expect(result.current.panels.get('test-panel')?.zIndex).toBeGreaterThan(
      initialZIndex
    );
    expect(result.current.maxZIndex).toBeGreaterThan(initialMaxZ);
    expect(result.current.focusedPanelId).toBe('test-panel');
  });

  it('should update panel position', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result.current.registerPanel({
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
      result.current.updatePosition('test-panel', { x: 100, y: 200 });
    });

    expect(result.current.panels.get('test-panel')?.position).toEqual({ x: 100, y: 200 });
  });

  it('should update panel size', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result.current.registerPanel({
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
      result.current.updateSize('test-panel', { width: 400, height: 600 });
    });

    expect(result.current.panels.get('test-panel')?.size).toEqual({
      width: 400,
      height: 600,
    });
  });

  it('should apply layout presets', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result.current.registerPanel({
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

      result.current.registerPanel({
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
      result.current.applyLayout('minimal');
    });

    expect(result.current.panels.get('chat')?.isVisible).toBe(true);
    expect(result.current.panels.get('memory')?.isVisible).toBe(false);
  });

  it('should persist panels to localStorage', () => {
    const { result } = renderHook(() => usePanelsStore());

    act(() => {
      result.current.registerPanel({
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

    const stored = localStorage.getItem('titane-panels-store');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.panels).toBeDefined();
    expect(Array.isArray(parsed.state.panels)).toBe(true);
  });
});

describe('effectsStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useEffectsStore.getState().reset();
  });

  it('should initialize with default preferences', () => {
    const { result } = renderHook(() => useEffectsStore());

    expect(result.current.preferences).toBeDefined();
    expect(result.current.preferences.effectsEnabled).toBe(true);
    expect(result.current.preferences.intensity).toBe(1);
    expect(result.current.preferences.autoAdapt).toBe(true);
  });

  it('should add active effect', () => {
    const { result } = renderHook(() => useEffectsStore());

    const effect = {
      id: 'test-effect-1',
      type: 'glow' as EffectType,
      startTime: Date.now(),
      duration: 1000,
      intensity: 0.8,
    };

    act(() => {
      result.current.addEffect(effect);
    });

    expect(result.current.activeEffects).toHaveLength(1);
    expect(result.current.activeEffects[0]).toEqual(effect);
  });

  it('should remove active effect', () => {
    const { result } = renderHook(() => useEffectsStore());

    const effect = {
      id: 'test-effect-1',
      type: 'glow' as EffectType,
      startTime: Date.now(),
      duration: 1000,
      intensity: 0.8,
    };

    act(() => {
      result.current.addEffect(effect);
    });

    expect(result.current.activeEffects).toHaveLength(1);

    act(() => {
      result.current.removeEffect('test-effect-1');
    });

    expect(result.current.activeEffects).toHaveLength(0);
  });

  it('should update metrics', () => {
    const { result } = renderHook(() => useEffectsStore());

    const newMetrics = {
      totalTriggered: 50,
      totalBlocked: 5,
      averageIntensity: 0.75,
      gpuLoad: 0.4,
    };

    act(() => {
      result.current.updateMetrics(newMetrics);
    });

    expect(result.current.metrics).toEqual(newMetrics);
  });

  it('should track effect history', () => {
    const { result } = renderHook(() => useEffectsStore());

    const historyEntry = {
      id: 'test-effect-1',
      type: 'glow' as EffectType,
      timestamp: Date.now(),
      duration: 1000,
      intensity: 0.8,
      wasBlocked: false,
      trigger: 'user-interaction',
    };

    act(() => {
      result.current.addToHistory(historyEntry);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toEqual(historyEntry);
  });

  it('should update stats automatically', () => {
    const { result } = renderHook(() => useEffectsStore());

    const historyEntry1 = {
      id: 'test-effect-1',
      type: 'glow' as EffectType,
      timestamp: Date.now(),
      duration: 1000,
      intensity: 0.8,
      wasBlocked: false,
      trigger: 'user-interaction',
    };

    const historyEntry2 = {
      id: 'test-effect-2',
      type: 'pulse' as EffectType,
      timestamp: Date.now(),
      duration: 800,
      intensity: 0.6,
      wasBlocked: false,
      trigger: 'state-change',
    };

    act(() => {
      result.current.addToHistory(historyEntry1);
      result.current.addToHistory(historyEntry2);
    });

    expect(result.current.stats.totalTriggered).toBe(2);
    expect(result.current.stats.totalBlocked).toBe(0);
  });

  it('should toggle effect type', () => {
    const { result } = renderHook(() => useEffectsStore());

    const initialEnabled = result.current.preferences.enabledEffects.has('glow');

    act(() => {
      result.current.toggleEffect('glow');
    });

    const afterToggle = result.current.preferences.enabledEffects.has('glow');
    expect(afterToggle).toBe(!initialEnabled);
  });

  it('should set intensity', () => {
    const { result } = renderHook(() => useEffectsStore());

    act(() => {
      result.current.setIntensity(0.5);
    });

    expect(result.current.preferences.intensity).toBe(0.5);
  });

  it('should toggle effects enabled', () => {
    const { result } = renderHook(() => useEffectsStore());

    const initialValue = result.current.preferences.effectsEnabled;

    act(() => {
      result.current.toggleEffectsEnabled();
    });

    expect(result.current.preferences.effectsEnabled).toBe(!initialValue);
  });

  it('should persist preferences to sessionStorage', () => {
    const { result } = renderHook(() => useEffectsStore());

    act(() => {
      result.current.setIntensity(0.7);
    });

    const stored = sessionStorage.getItem('titane-effects-store');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.preferences.intensity).toBe(0.7);
  });
});

describe('Stores Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useVisualStore.getState().reset();
    usePanelsStore.getState().reset();
    useEffectsStore.getState().reset();
  });

  it('should coordinate visualStore + panelsStore', () => {
    const { result: visualResult } = renderHook(() => useVisualStore());
    const { result: panelsResult } = renderHook(() => usePanelsStore());

    act(() => {
      visualResult.current.setRunning(true);
      panelsResult.current.registerPanel({
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

    expect(visualResult.current.isRunning).toBe(true);
    expect(panelsResult.current.panels.size).toBe(1);
  });

  it('should coordinate panelsStore + effectsStore', () => {
    const { result: panelsResult } = renderHook(() => usePanelsStore());
    const { result: effectsResult } = renderHook(() => useEffectsStore());

    act(() => {
      panelsResult.current.registerPanel({
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

      effectsResult.current.addEffect({
        id: 'test-effect',
        type: 'glow' as EffectType,
        startTime: Date.now(),
        duration: 1000,
        intensity: 0.8,
      });
    });

    expect(panelsResult.current.panels.get('effects-panel')).toBeDefined();
    expect(effectsResult.current.activeEffects).toHaveLength(1);
  });

  it('should coordinate all three stores', () => {
    const { result: visualResult } = renderHook(() => useVisualStore());
    const { result: panelsResult } = renderHook(() => usePanelsStore());
    const { result: effectsResult } = renderHook(() => useEffectsStore());

    act(() => {
      visualResult.current.setRunning(true);
      visualResult.current.toggleDebug();

      panelsResult.current.registerPanel({
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

      effectsResult.current.setIntensity(0.6);
    });

    expect(visualResult.current.isRunning).toBe(true);
    expect(visualResult.current.debug).toBe(true);
    expect(panelsResult.current.panels.size).toBe(1);
    expect(effectsResult.current.preferences.intensity).toBe(0.6);
  });
});
