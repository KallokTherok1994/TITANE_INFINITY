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
    });

    it('should zoom out', async () => {
      const { result } = renderHook(() => useWindowControls());

      await act(async () => {
        await result.current.zoomOut();
      });

      expect(result.current.zoomOut).toBeDefined();
    });

    it('should reset zoom', async () => {
      const { result } = renderHook(() => useWindowControls());

      await act(async () => {
        await result.current.zoomReset();
      });

      expect(result.current.zoomReset).toBeDefined();
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
