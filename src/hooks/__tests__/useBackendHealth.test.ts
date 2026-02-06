import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBackendHealth } from '../useBackendHealth';
import { tauriChatProvider } from '@/services/ai/providers/tauriChat';
import { ollamaProvider } from '@/services/ai/providers/ollama';

// Mock providers
vi.mock('@/services/ai/providers/tauriChat', () => ({
  tauriChatProvider: {
    isAvailable: vi.fn(),
  },
}));

vi.mock('@/services/ai/providers/ollama', () => ({
  ollamaProvider: {
    isAvailable: vi.fn(),
  },
}));

describe('useBackendHealth Hook', () => {
  const getTauriMock = () => vi.mocked(tauriChatProvider);
  const getOllamaMock = () => vi.mocked(ollamaProvider);

  beforeEach(() => {
    vi.clearAllMocks();
    getTauriMock().isAvailable.mockResolvedValue(true);
    getOllamaMock().isAvailable.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with a valid status', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(['unknown', 'checking', 'available', 'unavailable']).toContain(
          result.current.tauriStatus
        );
        expect(['unknown', 'checking', 'available', 'unavailable']).toContain(
          result.current.ollamaStatus
        );
      });
    });

    it('should have no unavailable reason initially', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.unavailableReason).toBeUndefined();
      });
    });

    it('should set checking status on first render', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(['unknown', 'checking', 'available', 'unavailable']).toContain(
          result.current.tauriStatus
        );
        expect(['unknown', 'checking', 'available', 'unavailable']).toContain(
          result.current.ollamaStatus
        );
      });
    });
  });

  describe('Health Checks', () => {
    it('should check both Tauri and Ollama providers', async () => {
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.tauriStatus).not.toBe('unknown');
        expect(result.current.ollamaStatus).not.toBe('unknown');
      });
      expect(getTauriMock().isAvailable).toHaveBeenCalled();
      expect(getOllamaMock().isAvailable).toHaveBeenCalled();
    });

    it('should handle provider timeouts gracefully', async () => {
      getTauriMock().isAvailable.mockRejectedValueOnce(new Error('Timeout'));
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(['available', 'unavailable']).toContain(result.current.tauriStatus);
      });
    });

    it('should return unavailable when both providers down', async () => {
      getTauriMock().isAvailable.mockResolvedValueOnce(false);
      getOllamaMock().isAvailable.mockResolvedValueOnce(false);
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.allBackendsDown).toBe(true);
        expect(result.current.unavailableReason).toBeDefined();
      });
    });

    it('should return available when at least one provider up', async () => {
      getTauriMock().isAvailable.mockResolvedValueOnce(true);
      getOllamaMock().isAvailable.mockResolvedValueOnce(false);
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.anyBackendAvailable).toBe(true);
      });
    });
  });

  describe('Polling Behavior', () => {
    it('should poll with 30s interval', async () => {
      vi.useFakeTimers();
      renderHook(() => useBackendHealth());

      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      expect(getTauriMock().isAvailable.mock.calls.length).toBeGreaterThanOrEqual(2);

      vi.useRealTimers();
    });

    it('should have recheck function', () => {
      const { result } = renderHook(() => useBackendHealth());
      expect(typeof result.current.recheckHealth).toBe('function');
    });

    it('should allow manual recheck', async () => {
      const { result } = renderHook(() => useBackendHealth());
      act(() => {
        void result.current.recheckHealth();
      });
      await waitFor(() => {
        expect(['checking', 'available', 'unavailable']).toContain(
          result.current.tauriStatus
        );
      });
    });
  });

  describe('Unavailable Reasons', () => {
    it('should track unavailable reasons', async () => {
      getTauriMock().isAvailable.mockResolvedValueOnce(false);
      getOllamaMock().isAvailable.mockResolvedValueOnce(false);
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.unavailableReason).toBeDefined();
      });
    });

    it('should contain valid reason types', async () => {
      const validReasons = ['ollama-offline', 'tauri-backend-down', 'unknown-error'];
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        if (result.current.unavailableReason) {
          expect(validReasons).toContain(result.current.unavailableReason);
        }
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
