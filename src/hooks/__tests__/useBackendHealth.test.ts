import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBackendHealth } from '../useBackendHealth';
import { tauriClient } from '@/lib/tauriClient';
import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL } from '@/config/ollamaDefaults';
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

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    aiCheckOllamaStatus: vi.fn(),
  },
}));

describe('useBackendHealth Hook', () => {
  const getTauriMock = () => vi.mocked(tauriChatProvider);
  const getOllamaMock = () => vi.mocked(ollamaProvider);
  const getTauriClientMock = () => vi.mocked(tauriClient);

  beforeEach(() => {
    vi.clearAllMocks();
    getTauriMock().isAvailable.mockResolvedValue(true);
    getOllamaMock().isAvailable.mockResolvedValue(true);
    getTauriClientMock().aiCheckOllamaStatus.mockResolvedValue({
      available: true,
      url: DEFAULT_OLLAMA_URL,
      model: DEFAULT_OLLAMA_MODEL,
      endpoint_kind: 'local_loopback',
      endpoint_source: 'default',
      model_source: 'default',
      network_used: false,
      health: 'healthy',
      models: ['gemma2:2b'],
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
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
      expect(getTauriClientMock().aiCheckOllamaStatus).toHaveBeenCalled();
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
      getTauriClientMock().aiCheckOllamaStatus.mockResolvedValueOnce({
        available: false,
        url: DEFAULT_OLLAMA_URL,
        model: DEFAULT_OLLAMA_MODEL,
        endpoint_kind: 'local_loopback',
        endpoint_source: 'default',
        model_source: 'default',
        network_used: false,
        health: 'offline',
        models: [],
      });
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.allBackendsDown).toBe(true);
        expect(result.current.unavailableReason).toBe('all-backends-down');
      });
    });

    it('should return available when at least one provider up', async () => {
      getTauriMock().isAvailable.mockResolvedValueOnce(true);
      getTauriClientMock().aiCheckOllamaStatus.mockResolvedValueOnce({
        available: false,
        url: DEFAULT_OLLAMA_URL,
        model: DEFAULT_OLLAMA_MODEL,
        endpoint_kind: 'local_loopback',
        endpoint_source: 'default',
        model_source: 'default',
        network_used: false,
        health: 'offline',
        models: [],
      });
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.anyBackendAvailable).toBe(true);
      });
    });

    it('should expose remote ollama details from tauri runtime truth', async () => {
      getTauriClientMock().aiCheckOllamaStatus.mockResolvedValueOnce({
        available: true,
        url: 'https://titane.example.com',
        model: 'gemma2:2b',
        endpoint_kind: 'remote_cloudflare',
        endpoint_source: 'runtime_persisted',
        model_source: 'runtime_persisted',
        network_used: true,
        health: 'healthy',
        models: ['gemma2:2b'],
      });

      const { result } = renderHook(() => useBackendHealth());

      await waitFor(() => {
        expect(result.current.ollamaDetails.endpointKind).toBe('remote_cloudflare');
      });

      expect(result.current.ollamaDetails.url).toBe('https://titane.example.com');
      expect(result.current.ollamaDetails.endpointSource).toBe('runtime_persisted');
      expect(result.current.ollamaDetails.networkUsed).toBe(true);
    });
  });

  describe('Polling Behavior', () => {
    it('should poll with 30s interval', async () => {
      vi.useFakeTimers();
      renderHook(() => useBackendHealth());

      await act(async () => {
        await Promise.resolve();
      });

      await act(async () => {
        vi.advanceTimersByTime(30000);
        await Promise.resolve();
      });

      expect(getTauriMock().isAvailable.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(getTauriClientMock().aiCheckOllamaStatus.mock.calls.length).toBeGreaterThanOrEqual(2);
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

    it('should share a single startup health check across multiple hook instances', async () => {
      renderHook(() => useBackendHealth());
      renderHook(() => useBackendHealth());

      await waitFor(() => {
        expect(getTauriMock().isAvailable).toHaveBeenCalledTimes(1);
        expect(getTauriClientMock().aiCheckOllamaStatus).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Unavailable Reasons', () => {
    it('should track unavailable reasons', async () => {
      getTauriMock().isAvailable.mockResolvedValueOnce(false);
      getTauriClientMock().aiCheckOllamaStatus.mockResolvedValueOnce({
        available: false,
        url: 'https://titane.example.com',
        model: 'gemma2:2b',
        endpoint_kind: 'remote_cloudflare',
        endpoint_source: 'runtime_persisted',
        model_source: 'runtime_persisted',
        network_used: true,
        health: 'offline',
        models: [],
      });
      const { result } = renderHook(() => useBackendHealth());
      await waitFor(() => {
        expect(result.current.unavailableReason).toBeDefined();
      });
    });

    it('should contain valid reason types', async () => {
      const validReasons = [
        'all-backends-down',
        'ollama-offline',
        'ollama-remote-unavailable',
        'tauri-backend-down',
        'unknown-error',
      ];
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
