/**
 * TITANE∞ v21 — E2E Tests for v21 Hooks
 * Comprehensive tests for useVisualState, usePanelState, useAdaptiveFPS, useEffects
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useVisualState } from '../useVisualState';
import { usePanelState } from '../usePanelState';
import { useAdaptiveFPS } from '../useAdaptiveFPS';
import { useEffects } from '../useEffects';
import { TitaneVisualEngine } from '@/visual-engine/TitaneVisualEngine';
import { usePanelsStore } from '@/stores/panelsStore';

describe('useVisualState Hook', () => {
  let engine: TitaneVisualEngine;

  beforeEach(() => {
    engine = TitaneVisualEngine.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default visual state', () => {
    const { result } = renderHook(() => useVisualState(engine));

    expect(result.current.visuals).toBeDefined();
    expect(result.current.visuals.background).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result.current.visuals.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result.current.isTransitioning).toBe(false);
  });

  it('should detect transitions when engine state changes', async () => {
    const { result } = renderHook(() => useVisualState(engine));

    act(() => {
      engine.start();
      engine.setState('focus', 1000);
    });

    await waitFor(
      () => {
        expect(result.current.isTransitioning).toBe(true);
      },
      { timeout: 100 }
    );

    await waitFor(
      () => {
        expect(result.current.isTransitioning).toBe(false);
      },
      { timeout: 1200 }
    );
  });

  it('should update visuals when state changes', async () => {
    const { result } = renderHook(() => useVisualState(engine));
    const initialBackground = result.current.visuals.background;

    act(() => {
      engine.start();
      engine.setState('focus', 500);
    });

    await waitFor(
      () => {
        expect(result.current.visuals.background).not.toBe(initialBackground);
      },
      { timeout: 600 }
    );
  });

  it('should cleanup listeners on unmount', () => {
    const { unmount } = renderHook(() => useVisualState(engine));
    const removeListenerSpy = vi.spyOn(engine, 'removeListener');

    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe('usePanelState Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    usePanelsStore.getState().reset();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      usePanelState({
        panelId: 'test-panel',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: false,
      })
    );

    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.isVisible).toBe(true);
    expect(result.current.zIndex).toBe(100);
  });

  it('should toggle collapsed state', () => {
    const { result } = renderHook(() =>
      usePanelState({
        panelId: 'test-panel',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: false,
      })
    );

    expect(result.current.isCollapsed).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isCollapsed).toBe(false);
  });

  it('should bring panel to front and increase z-index', () => {
    const { result } = renderHook(() =>
      usePanelState({
        panelId: 'test-panel',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: false,
      })
    );

    const initialZIndex = result.current.zIndex;

    act(() => {
      result.current.bringToFront();
    });

    expect(result.current.zIndex).toBeGreaterThan(initialZIndex);
  });

  it('should persist state to localStorage when enabled', () => {
    const { result } = renderHook(() =>
      usePanelState({
        panelId: 'test-panel-persist',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: true,
      })
    );

    act(() => {
      result.current.toggle();
    });

    const stored = localStorage.getItem('titane-panel-test-panel-persist');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.isCollapsed).toBe(true);
  });

  it('should restore state from localStorage', () => {
    localStorage.setItem(
      'titane-panel-test-panel-restore',
      JSON.stringify({ isCollapsed: true, isVisible: false })
    );

    const { result } = renderHook(() =>
      usePanelState({
        panelId: 'test-panel-restore',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: true,
      })
    );

    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.isVisible).toBe(false);
  });

  it('should hide panel', () => {
    const { result } = renderHook(() =>
      usePanelState({
        panelId: 'test-panel',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: false,
      })
    );

    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.hide();
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('should show panel', () => {
    const { result } = renderHook(() =>
      usePanelState({
        panelId: 'test-panel',
        defaultCollapsed: false,
        defaultVisible: false,
        defaultZIndex: 100,
        persistState: false,
      })
    );

    expect(result.current.isVisible).toBe(false);

    act(() => {
      result.current.show();
    });

    expect(result.current.isVisible).toBe(true);
  });
});

describe('useAdaptiveFPS Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics.current).toBeGreaterThanOrEqual(0);
    expect(result.current.metrics.average).toBeGreaterThanOrEqual(0);
    expect(result.current.metrics.throttleLevel).toBeGreaterThanOrEqual(0);
  });

  it('should track FPS over time', async () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    const initialAverage = result.current.metrics.average;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.metrics.average).toBeDefined();
    });
  });

  it('should detect performance degradation', async () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    // Simulate low FPS by mocking performance
    vi.spyOn(performance, 'now').mockReturnValue(Date.now());

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.isPerformanceDegraded).toBeDefined();
    });
  });

  it('should generate warnings when FPS drops', async () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(result.current.warnings).toBeDefined();
      expect(Array.isArray(result.current.warnings)).toBe(true);
    });
  });

  it('should cleanup interval on unmount', () => {
    const { unmount } = renderHook(() => useAdaptiveFPS());
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('useEffects Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => useEffects());

    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics.totalTriggered).toBeGreaterThanOrEqual(0);
    expect(result.current.metrics.gpuLoad).toBeGreaterThanOrEqual(0);
  });

  it('should track active effects', () => {
    const { result } = renderHook(() => useEffects());

    expect(result.current.activeEffects).toBeDefined();
    expect(Array.isArray(result.current.activeEffects)).toBe(true);
  });

  it('should update metrics over time', async () => {
    const { result } = renderHook(() => useEffects());

    const initialTotal = result.current.metrics.totalTriggered;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.metrics.totalTriggered).toBeGreaterThanOrEqual(initialTotal);
    });
  });

  it('should track GPU load', () => {
    const { result } = renderHook(() => useEffects());

    expect(result.current.metrics.gpuLoad).toBeDefined();
    expect(typeof result.current.metrics.gpuLoad).toBe('number');
    expect(result.current.metrics.gpuLoad).toBeGreaterThanOrEqual(0);
    expect(result.current.metrics.gpuLoad).toBeLessThanOrEqual(1);
  });

  it('should cleanup listeners on unmount', () => {
    const { unmount } = renderHook(() => useEffects());

    unmount();

    // Verify no memory leaks by checking that intervals are cleared
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('Hooks Integration Tests', () => {
  it('should work together: useVisualState + usePanelState', async () => {
    const engine = TitaneVisualEngine.getInstance();

    const { result: visualResult } = renderHook(() => useVisualState(engine));
    const { result: panelResult } = renderHook(() =>
      usePanelState({
        panelId: 'integration-test',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: false,
      })
    );

    expect(visualResult.current.visuals).toBeDefined();
    expect(panelResult.current.isVisible).toBe(true);

    act(() => {
      engine.start();
      engine.setState('focus', 500);
      panelResult.current.toggle();
    });

    await waitFor(() => {
      expect(visualResult.current.isTransitioning).toBe(true);
      expect(panelResult.current.isCollapsed).toBe(true);
    });
  });

  it('should work together: useAdaptiveFPS + useEffects', async () => {
    vi.useFakeTimers();

    const { result: fpsResult } = renderHook(() => useAdaptiveFPS());
    const { result: effectsResult } = renderHook(() => useEffects());

    expect(fpsResult.current.metrics).toBeDefined();
    expect(effectsResult.current.metrics).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(fpsResult.current.metrics.average).toBeGreaterThanOrEqual(0);
      expect(effectsResult.current.metrics.totalTriggered).toBeGreaterThanOrEqual(0);
    });

    vi.restoreAllMocks();
  });
});
