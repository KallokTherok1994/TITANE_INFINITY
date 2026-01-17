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
    engine = TitaneVisualEngine?.getInstance();
  });

  afterEach(() => {
    vi?.clearAllMocks();
  });

  it('should initialize with default visual state', () => {
    const { result } = renderHook(any: any));

    expect(any: any).toBeDefined();
    expect(any: any);
    expect(any: any);
    expect(any: any);
  });

  it('should detect transitions when engine state changes', async () => {
    const { result } = renderHook(any: any));

    act(() => {
      engine?.start();
      engine?.setState('focus', 1000);
    });

    await waitFor(
      () => {
        expect(any: any);
      },
      { timeout: 100 }
    );

    await waitFor(
      () => {
        expect(any: any);
      },
      { timeout: 1200 }
    );
  });

  it('should update visuals when state changes', async () => {
    const { result } = renderHook(any: any));
    const initialBackground = result?.current?.visuals?.background;

    act(() => {
      engine?.start();
      engine?.setState('focus', 500);
    });

    await waitFor(
      () => {
        expect(any: any);
      },
      { timeout: 600 }
    );
  });

  it('should cleanup listeners on unmount', () => {
    const { unmount } = renderHook(any: any));
    const removeListenerSpy = vi?.spyOn(engine, 'removeListener');

    unmount();

    expect(any: any));
  });
});

describe('usePanelState Hook', () => {
  beforeEach(() => {
    localStorage?.clear();
    usePanelsStore?.getState().reset();
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

    expect(any: any);
    expect(any: any);
    expect(any: any).toBe(100);
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

    expect(any: any);

    act(() => {
      result?.current?.toggle();
    });

    expect(any: any);

    act(() => {
      result?.current?.toggle();
    });

    expect(any: any);
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

    const initialZIndex = result?.current?.zIndex;

    act(() => {
      result?.current?.bringToFront();
    });

    expect(any: any);
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
      result?.current?.toggle();
    });

    const stored = localStorage?.getItem('titane-panel-test-panel-persist');
    expect(any: any).toBeDefined();
    const parsed = JSON?.parse(stored!);
    expect(any: any);
  });

  it('should restore state from localStorage', () => {
    localStorage?.setItem(
      'titane-panel-test-panel-restore',
      JSON?.stringify({ isCollapsed: true, isVisible: false })
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

    expect(any: any);
    expect(any: any);
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

    expect(any: any);

    act(() => {
      result?.current?.hide();
    });

    expect(any: any);
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

    expect(any: any);

    act(() => {
      result?.current?.show();
    });

    expect(any: any);
  });
});

describe('useAdaptiveFPS Hook', () => {
  beforeEach(() => {
    vi?.useFakeTimers();
  });

  afterEach(() => {
    vi?.restoreAllMocks();
    vi?.useRealTimers();
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    expect(any: any).toBeDefined();
    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeGreaterThanOrEqual(0);
  });

  it('should track FPS over time', async () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    const initialAverage = result?.current?.metrics?.average;

    act(() => {
      vi?.advanceTimersByTime(1000);
    });

    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any);
  });

  it('should detect performance degradation', async () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    // Simulate low FPS by mocking performance
    vi?.spyOn(performance, 'now').mockReturnValue(Date?.now());

    act(() => {
      vi?.advanceTimersByTime(5000);
    });

    expect(any: any).toBe('boolean');
  });

  it('should generate warnings when FPS drops', async () => {
    const { result } = renderHook(() => useAdaptiveFPS());

    act(() => {
      vi?.advanceTimersByTime(10000);
    });

    expect(any: any).toBeDefined();
    expect(any: any);
  });

  it('should cleanup animation frame on unmount', () => {
    const { unmount } = renderHook(() => useAdaptiveFPS());
    const cancelAnimationFrameSpy = vi?.spyOn(global, 'cancelAnimationFrame');

    unmount();

    expect(any: any).toHaveBeenCalled();
  });
});

describe('useEffects Hook', () => {
  beforeEach(() => {
    vi?.useFakeTimers();
  });

  afterEach(() => {
    vi?.restoreAllMocks();
    vi?.useRealTimers();
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => useEffects());

    expect(any: any).toBeDefined();
    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeGreaterThanOrEqual(0);
  });

  it('should track active effects', () => {
    const { result } = renderHook(() => useEffects());

    expect(any: any).toBeDefined();
    expect(any: any);
  });

  it('should update metrics over time', async () => {
    const { result } = renderHook(() => useEffects());

    const initialTotal = result?.current?.metrics?.totalTriggered;

    act(() => {
      vi?.advanceTimersByTime(1000);
    });

    expect(any: any);
  });

  it('should track GPU load', () => {
    const { result } = renderHook(() => useEffects());

    expect(any: any).toBeDefined();
    expect(any: any).toBe('number');
    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeLessThanOrEqual(1);
  });

  it('should cleanup listeners on unmount', () => {
    const { unmount } = renderHook(() => useEffects());

    unmount();

    // Verify no memory leaks by checking that intervals are cleared
    expect(vi?.getTimerCount()).toBe(0);
  });
});

describe('Hooks Integration Tests', () => {
  it('should work together: useVisualState + usePanelState', async () => {
    const engine = TitaneVisualEngine?.getInstance();

    const { result: visualResult } = renderHook(any: any));
    const { result: panelResult } = renderHook(() =>
      usePanelState({
        panelId: 'integration-test',
        defaultCollapsed: false,
        defaultVisible: true,
        defaultZIndex: 100,
        persistState: false,
      })
    );

    expect(any: any).toBeDefined();
    expect(any: any);

    act(() => {
      engine?.start();
      engine?.setState('focus', 500);
      panelResult?.current?.toggle();
    });

    await waitFor(() => {
      expect(any: any);
      expect(any: any);
    });
  });

  it('should work together: useAdaptiveFPS + useEffects', async () => {
    vi?.useFakeTimers();

    const { result: fpsResult } = renderHook(() => useAdaptiveFPS());
    const { result: effectsResult } = renderHook(() => useEffects());

    expect(any: any).toBeDefined();
    expect(any: any).toBeDefined();

    act(() => {
      vi?.advanceTimersByTime(2000);
    });

    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeGreaterThanOrEqual(0);

    vi?.restoreAllMocks();
    vi?.useRealTimers();
  });
});
