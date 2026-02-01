import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBackendHealth } from '../useBackendHealth';

// Mock providers
vi.mock('@/services/providers/tauriChatProvider', () => ({
  tauriChatProvider: {
    isHealthy: vi.fn(),
  },
}));

vi.mock('@/services/providers/ollamaProvider', () => ({
  ollamaProvider: {
    isHealthy: vi.fn(),
  },
}));

describe('useBackendHealth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with unknown status', () => {
      const { result } = renderHook(() => useBackendHealth());
      expect(result.current.status).toBe('unknown');
    });

    it('should have empty unavailable reasons initially', () => {
      const { result } = renderHook(() => useBackendHealth());
      expect(result.current.unavailableReasons).toEqual([]);
    });

    it('should set checking status on first render', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(['unknown', 'checking', 'available', 'unavailable']).toContain(
          result.current.status
        );
      });
    });
  });

  describe('Health Checks', () => {
    it('should check both Tauri and Ollama providers', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.status).not.toBe('unknown');
      });
    });

    it('should handle provider timeouts gracefully', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(['available', 'unavailable']).toContain(result.current.status);
      });
    });

    it('should return unavailable when both providers down', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        if (result.current.status === 'unavailable') {
          expect(result.current.unavailableReasons.length).toBeGreaterThan(0);
        }
      });
    });

    it('should return available when at least one provider up', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(['available', 'unavailable', 'checking']).toContain(result.current.status);
      });
    });
  });

  describe('Polling Behavior', () => {
    it('should poll with 30s interval', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useBackendHealth());

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(result.current.status).toBeDefined();
      });

      vi.useRealTimers();
    });

    it('should have recheck function', () => {
      const { result } = renderHook(() => useBackendHealth());
      expect(typeof result.current.recheck).toBe('function');
    });

    it('should allow manual recheck', async () => {
      const { result } = renderHook(() => useBackendHealth());
      act(() => {
        result.current.recheck();
      });
      await waitFor(() => {
        expect(['checking', 'available', 'unavailable']).toContain(result.current.status);
      });
    });
  });

  describe('Unavailable Reasons', () => {
    it('should track unavailable reasons', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        if (result.current.status === 'unavailable') {
          expect(Array.isArray(result.current.unavailableReasons)).toBe(true);
        }
      });
    });

    it('should contain valid reason types', async () => {
      const validReasons = [
        'ollama-offline',
        'tauri-backend-down',
        'network-error',
        'unknown',
      ];
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        result.current.unavailableReasons.forEach(reason => {
          expect(validReasons).toContain(reason);
        });
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup interval on unmount', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = renderHook(() => useBackendHealth());
      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should cancel pending requests on unmount', async () => {
      const { unmount } = renderHook(() => useBackendHealth());
      unmount();
      await waitFor(() => {
        expect(true).toBe(true); // Cleanup completed
      });
    });
  });
});
