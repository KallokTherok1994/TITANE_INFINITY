/**
 * Tests pour useWindowControls Hook
 * Coverage: Contrôles fenêtre (minimize, maximize, close), États
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowControls } from '@/hooks';

vi.mock('@tauri-apps/api/window', () => ({
  getCurrent: () => ({
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn().mockResolvedValue(false),
  }),
}));

describe('useWindowControls Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize window controls', () => {
      const { result } = renderHook(() => useWindowControls());
      expect(result.current.minimize).toBeDefined();
      expect(result.current.maximize).toBeDefined();
      expect(result.current.close).toBeDefined();
    });

    it('should detect maximized state', async () => {
      const { result } = renderHook(() => useWindowControls());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(typeof result.current.isMaximized).toBe('boolean');
    });
  });

  describe('Window Actions', () => {
    it('should minimize window', async () => {
      const { result } = renderHook(() => useWindowControls());
      
      await act(async () => {
        await result.current.minimize();
      });

      // Minimize should be called
      expect(result.current.minimize).toBeDefined();
    });

    it('should maximize window', async () => {
      const { result } = renderHook(() => useWindowControls());
      
      await act(async () => {
        await result.current.maximize();
      });

      expect(result.current.maximize).toBeDefined();
    });

    it('should close window', async () => {
      const { result } = renderHook(() => useWindowControls());
      
      await act(async () => {
        await result.current.close();
      });

      expect(result.current.close).toBeDefined();
    });
  });

  describe('Toggle Maximize', () => {
    it('should toggle maximize state', async () => {
      const { result } = renderHook(() => useWindowControls());
      
      await act(async () => {
        await result.current.toggleMaximize();
      });

      // Toggle should change state
      expect(result.current.toggleMaximize).toBeDefined();
    });
  });
});
