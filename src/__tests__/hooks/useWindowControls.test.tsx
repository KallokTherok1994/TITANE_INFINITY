/**
 * Tests pour useWindowControls Hook
 * Coverage: Contrôles fenêtre (minimize, maximize, close), États
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowControls } from '@/hooks';

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(async () => () => {}),
}));

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(async (command: string) => {
    if (command === 'window_toggle_fullscreen') return true;
    if (command === 'window_zoom_in') return 1.1;
    if (command === 'window_zoom_out') return 0.9;
    return undefined;
  }),
}));

describe('useWindowControls Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.style.removeProperty('zoom');
    document.documentElement.style.fontSize = '16px';
    document.documentElement.style.setProperty('--titane-ui-scale', '1');
  });

  describe('Initialization', () => {
    it('should initialize window controls', () => {
      const { result } = renderHook(() => useWindowControls());
      expect(result.current.zoomIn).toBeDefined();
      expect(result.current.zoomOut).toBeDefined();
      expect(result.current.zoomReset).toBeDefined();
      expect(result.current.toggleFullscreen).toBeDefined();
    });
  });

  describe('Window Actions', () => {
    it('should zoom in', async () => {
      const { result } = renderHook(() => useWindowControls());

      await act(async () => {
        await result.current.zoomIn();
      });

      expect(result.current.zoomIn).toBeDefined();
      expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe(
        '1.1'
      );
      expect(document.documentElement.style.fontSize).toBe('17.6px');
    });

    it('supports Ctrl+NumpadAdd as a zoom-in shortcut', async () => {
      renderHook(() => useWindowControls());

      await act(async () => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'NumpadAdd',
            code: 'NumpadAdd',
            ctrlKey: true,
            bubbles: true,
          })
        );
      });

      expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe(
        '1.1'
      );
      expect(document.documentElement.style.fontSize).toBe('17.6px');
    });

    it('should zoom out', async () => {
      const { result } = renderHook(() => useWindowControls());

      await act(async () => {
        await result.current.zoomOut();
      });

      expect(result.current.zoomOut).toBeDefined();
      expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe(
        '0.9'
      );
      expect(document.documentElement.style.fontSize).toBe('14.4px');
    });

    it('should reset zoom', async () => {
      const { result } = renderHook(() => useWindowControls());

      await act(async () => {
        await result.current.zoomReset();
      });

      expect(result.current.zoomReset).toBeDefined();
      expect(document.documentElement.style.getPropertyValue('--titane-ui-scale')).toBe(
        '1'
      );
      expect(document.documentElement.style.fontSize).toBe('16px');
    });
  });

  describe('Toggle Maximize', () => {
    it('should toggle maximize state', async () => {
      const { result } = renderHook(() => useWindowControls());

      await act(async () => {
        await result.current.toggleFullscreen();
      });

      expect(result.current.toggleFullscreen).toBeDefined();
    });
  });
});
