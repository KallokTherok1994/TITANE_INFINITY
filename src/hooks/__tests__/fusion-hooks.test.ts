/**
 * TITANE∞ v25.4.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.4.2 — FUSION HOOKS TESTS
 *   Tests unitaires complets pour useSingularitySync, useMemoryEngine,
 *   et useSystemHealth avec mocks appropriés
 * ═══════════════════════════════════════════════════════════════════
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useSingularitySync } from '../useSingularitySync';
import { useMemoryEngine } from '../useMemoryEngine';
import { useSystemHealth } from '../useSystemHealth';

// Mock @tauri-apps/api avec invoke simplifié
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock lib/security
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

// Mock singularityEngine
vi.mock('@/core/engines/SINGULARITY_ENGINE', () => ({
  singularityEngine: {
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    unsubscribe: vi.fn(),
  },
}));

// Mock external dependencies that don't exist yet
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/core/engines/SINGULARITY_ENGINE', () => ({
  singularityEngine: {
    getState: vi.fn().mockReturnValue({}),
    setState: vi.fn(),
    sync: vi.fn().mockResolvedValue(undefined),
  },
}));

// Import après mocks
import { invoke } from '@tauri-apps/api/core';
import { secureInvoke } from '@/lib/security';
import { singularityEngine } from '@/core/engines/SINGULARITY_ENGINE';
import type { SingularityState } from '@/core/ARCHITECTURE_TYPES_v24-v∞';

describe('useSingularitySync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useSingularitySync({ autoSync: false }));

    expect(result.current.state).toBeNull();
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.lastError).toBeNull();
  });

  test('should fetch backend state on mount when autoSync is true', async () => {
    const mockState = {
      consciousness: 2,
      autoCoherence: 0.8,
      unity: {},
      quantum: { coherence: 0.9 },
      convergence: { convergenceLevel: 0.7 },
      overmind: {},
      omnipresence: {},
      selfReference: true,
      autoStabilization: true,
      expressionQuality: 0.85,
      singularityField: {
        energy: 0.8,
        motion: 0.7,
        symbolism: 0.9,
        depth: 0.85,
        presence: 0.9,
      },
      formStability: 0.88,
      evolutionCapacity: 0.92,
      signature: 'TITANE-TEST',
      essence: 'Test essence',
      timestamp: Date.now(),
    };

    vi.mocked(secureInvoke).mockResolvedValue(mockState as unknown as SingularityState);
    vi.mocked(singularityEngine.getState).mockReturnValue(
      mockState as unknown as SingularityState
    );

    const { result } = renderHook(() =>
      useSingularitySync({ autoSync: true, syncInterval: 100 })
    );

    await waitFor(() => {
      expect(result.current.state).not.toBeNull();
    });

    expect(result.current.state?.consciousness).toBe(2);
    expect(result.current.state?.autoCoherence).toBe(0.8);
  });

  test('should track metrics on successful sync', async () => {
    const mockState = {
      consciousness: 1,
      autoCoherence: 0.7,
      unity: {},
      quantum: { coherence: 0.85 },
      convergence: { convergenceLevel: 0.7 },
      overmind: {},
      omnipresence: {},
      selfReference: true,
      autoStabilization: true,
      expressionQuality: 0.8,
      singularityField: {
        energy: 0.75,
        motion: 0.7,
        symbolism: 0.85,
        depth: 0.8,
        presence: 0.85,
      },
      formStability: 0.82,
      evolutionCapacity: 0.88,
      signature: 'TITANE-TEST',
      essence: 'Test essence',
      timestamp: Date.now(),
    };

    vi.mocked(secureInvoke).mockResolvedValue(mockState as unknown as SingularityState);
    vi.mocked(singularityEngine.getState).mockReturnValue(
      mockState as unknown as SingularityState
    );

    const { result } = renderHook(() => useSingularitySync());

    await result.current.sync();

    await waitFor(() => {
      expect(result.current.metrics.syncCount).toBeGreaterThan(0);
    });

    expect(result.current.metrics.errorCount).toBe(0);
    expect(result.current.metrics.isHealthy).toBe(true);
  });

  test('should handle sync errors gracefully', async () => {
    const mockError = new Error('Backend unavailable');
    vi.mocked(secureInvoke).mockRejectedValue(mockError);
    vi.mocked(singularityEngine.getState).mockReturnValue({
      consciousness: 1,
      autoCoherence: 0.5,
      unity: {},
      quantum: { coherence: 0.5 },
      convergence: { convergenceLevel: 0.5 },
      timestamp: Date.now(),
    } as any);

    const { result } = renderHook(() => useSingularitySync({ autoSync: false }));

    // Déclencher le sync et attendre qu'il se termine
    await act(async () => {
      await result.current.sync();
    });

    // Vérifier que l'erreur a été capturée immédiatement après le sync
    expect(result.current.lastError).not.toBeNull();
    expect(result.current.lastError?.message).toBe('Backend unavailable');
    expect(result.current.metrics.errorCount).toBeGreaterThan(0);
  });
});

describe('useMemoryEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize with null stats', () => {
    const { result } = renderHook(() => useMemoryEngine());

    expect(result.current.stats).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should fetch stats on mount', async () => {
    const mockStats = {
      total_entries: 150,
      short_term: 50,
      medium_term: 70,
      long_term: 30,
      total_size_bytes: 10240,
      last_compression: null,
      health_score: 0.85,
    };

    vi.mocked(secureInvoke).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useMemoryEngine());

    await waitFor(() => {
      expect(result.current.stats).not.toBeNull();
    });

    expect(result.current.stats?.total_entries).toBe(150);
    expect(result.current.stats?.health_score).toBe(0.85);
  });

  test('should save memory with auto-extraction', async () => {
    vi.mocked(secureInvoke).mockResolvedValue(undefined);

    const { result } = renderHook(() => useMemoryEngine());

    const testContent = 'Test message for memory save';
    const id = await result.current.saveToMemory(testContent, 'short', {
      source: 'test',
    });

    expect(id).toMatch(/^memory_short_\d+$/);
    expect(secureInvoke).toHaveBeenCalledWith(
      'memory_save_entry',
      expect.objectContaining({
        key: id,
      }),
      undefined
    );
  });

  test('should extract tags from content', async () => {
    vi.mocked(secureInvoke).mockResolvedValue(undefined);

    const { result } = renderHook(() => useMemoryEngine());

    const content = 'développer implémenter créer ajouter système architecture';
    await result.current.saveToMemory(content, 'short');

    // Tags should be extracted from content
    const saveCall = vi
      .mocked(secureInvoke)
      .mock.calls.find((call: unknown[]) => call[0] === 'memory_save_entry');

    expect(saveCall).toBeDefined();

    const rawValue = (saveCall?.[1] as { value?: unknown } | undefined)?.value;
    expect(typeof rawValue).toBe('string');
    const savedEntry = JSON.parse(rawValue as string);

    expect(savedEntry.tags).toBeDefined();
    expect(savedEntry.tags.length).toBeGreaterThan(0);
  });

  test('should search memory context', async () => {
    const mockResults = {
      entries: [
        {
          id: 'memory_short_1',
          content: 'Test memory entry',
          type: 'short',
          timestamp: Date.now(),
          tags: ['test'],
          intentions: ['Meta'],
          emotions: { valence: 0, intensity: 0, energy: 0 },
        },
      ],
      relevance_scores: [0.95],
      total_found: 1,
    };

    vi.mocked(secureInvoke).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useMemoryEngine());

    const results = await result.current.getMemoryContext('test', 5);

    expect(results.length).toBe(1);
    expect(results[0].content).toBe('Test memory entry');
  });
});

describe('useSystemHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize with null health', () => {
    const { result } = renderHook(() => useSystemHealth());

    expect(result.current.health).toBeNull();
    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should fetch health metrics on refresh', async () => {
    const mockConvHealth = {
      status: 'healthy',
      active_conversations: 5,
      total_messages: 120,
      avg_response_time_ms: 250,
      error_rate: 0.02,
    };

    const mockMemStats = {
      total_entries: 100,
      total_size_bytes: 5120,
      health_score: 0.9,
    };

    const mockSingState = {
      engines: Array(18).fill({ name: 'test', status: 'active' }),
    };

    const mockSysHealth = {
      uptime_ms: 3600000,
      cpu_usage: 45,
      memory_usage_mb: 280,
    };

    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(mockConvHealth)
      .mockResolvedValueOnce(mockMemStats)
      .mockResolvedValueOnce(mockSingState)
      .mockResolvedValueOnce(mockSysHealth);

    const { result } = renderHook(() => useSystemHealth());

    await result.current.refreshHealth();

    await waitFor(() => {
      expect(result.current.health).not.toBeNull();
    });

    expect(result.current.health?.global_status).toBe('healthy');
    expect(result.current.health?.conversation.total_messages).toBe(120);
    expect(result.current.health?.memory.total_entries).toBe(100);
  });

  test('should generate alerts for high error rate', async () => {
    const mockConvHealth = {
      status: 'degraded',
      active_conversations: 2,
      total_messages: 50,
      avg_response_time_ms: 1500,
      error_rate: 0.15, // 15% - should trigger alert
    };
    const mockMemStats = {
      total_entries: 80,
      total_size_bytes: 4096,
      health_score: 0.75,
    };
    const mockSingState = {
      engines: Array(18).fill({ name: 'test', status: 'active' }),
    };
    const mockSysHealth = {
      uptime_ms: 3600000,
      cpu_usage: 50,
      memory_usage_mb: 300,
    };

    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(mockConvHealth)
      .mockResolvedValueOnce(mockMemStats)
      .mockResolvedValueOnce(mockSingState)
      .mockResolvedValueOnce(mockSysHealth);

    const { result } = renderHook(() => useSystemHealth());

    await result.current.refreshHealth();

    await waitFor(() => {
      expect(result.current.health).not.toBeNull();
      expect(result.current.health?.alerts.length).toBeGreaterThan(0);
    });

    const errorAlert = result.current.health?.alerts.find(
      a =>
        a.message.toLowerCase().includes('error') ||
        a.message.toLowerCase().includes('taux')
    );
    expect(errorAlert).toBeDefined();
    expect(errorAlert?.severity).toMatch(/warning|critical/);
  });

  test('should start and stop monitoring', async () => {
    // Mock les 4 appels secureInvoke pour refreshHealth
    const mockConvHealth = {
      status: 'healthy',
      active_conversations: 3,
      total_messages: 50,
      avg_response_time_ms: 200,
      error_rate: 0.01,
    };
    const mockMemStats = {
      total_entries: 100,
      total_size_bytes: 5120,
      health_score: 0.9,
    };
    const mockSingState = {
      engines: Array(18).fill({ name: 'test', status: 'active' }),
    };
    const mockSysHealth = {
      uptime_ms: 3600000,
      cpu_usage: 30,
      memory_usage_mb: 200,
    };

    vi.mocked(secureInvoke).mockImplementation(async () => mockConvHealth);
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(mockConvHealth)
      .mockResolvedValueOnce(mockMemStats)
      .mockResolvedValueOnce(mockSingState)
      .mockResolvedValueOnce(mockSysHealth);

    const { result } = renderHook(() => useSystemHealth());

    result.current.startMonitoring(100); // 100ms interval

    await waitFor(() => {
      expect(result.current.isMonitoring).toBe(true);
    });

    result.current.stopMonitoring();

    await waitFor(() => {
      expect(result.current.isMonitoring).toBe(false);
    });
  });

  test('should resolve alerts', async () => {
    const mockConvHealth = {
      status: 'degraded',
      active_conversations: 1,
      total_messages: 10,
      avg_response_time_ms: 2000,
      error_rate: 0.2, // High error rate triggers alerts
    };
    const mockMemStats = {
      total_entries: 50,
      total_size_bytes: 2048,
      health_score: 0.4, // Low health score triggers alerts
    };
    const mockSingState = {
      engines: Array(18).fill({ name: 'test', status: 'active' }),
    };
    const mockSysHealth = {
      uptime_ms: 1800000,
      cpu_usage: 85, // High CPU triggers alerts
      memory_usage_mb: 450,
    };

    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(mockConvHealth)
      .mockResolvedValueOnce(mockMemStats)
      .mockResolvedValueOnce(mockSingState)
      .mockResolvedValueOnce(mockSysHealth);

    const { result } = renderHook(() => useSystemHealth());

    await result.current.refreshHealth();

    await waitFor(() => {
      expect(result.current.health).not.toBeNull();
      expect(result.current.health?.alerts.length).toBeGreaterThan(0);
    });

    const initialAlertCount = result.current.health!.alerts.length;
    const alertId = result.current.health!.alerts[0].id;

    await result.current.resolveAlert(alertId);

    // Wait for state update after resolveAlert
    await waitFor(() => {
      expect(result.current.health!.alerts.length).toBe(initialAlertCount - 1);
    });
  });

  test('should calculate global status correctly', async () => {
    const mockConvHealth = {
      status: 'healthy',
      active_conversations: 3,
      total_messages: 80,
      avg_response_time_ms: 300,
      error_rate: 0.03,
    };

    const mockMemStats = {
      total_entries: 200,
      total_size_bytes: 10240,
      health_score: 0.5, // Degraded memory
    };

    const mockSingState = {
      engines: Array(18).fill({ name: 'test', status: 'active' }),
    };

    const mockSysHealth = {
      uptime_ms: 7200000,
      cpu_usage: 50,
      memory_usage_mb: 300,
    };

    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(mockConvHealth)
      .mockResolvedValueOnce(mockMemStats)
      .mockResolvedValueOnce(mockSingState)
      .mockResolvedValueOnce(mockSysHealth);

    const { result } = renderHook(() => useSystemHealth());

    await result.current.refreshHealth();

    await waitFor(() => {
      expect(result.current.health).not.toBeNull();
    });

    // Global status should be degraded because memory health_score is low (0.5)
    expect(result.current.health?.global_status).toMatch(/degraded|critical/);
  });
});

describe('Integration Tests', () => {
  test('should work together: save to memory + monitor health', async () => {
    // Mock pour useMemoryEngine (stats fetch on mount + save)
    const mockMemStats = {
      total_entries: 100,
      short_term: 40,
      medium_term: 40,
      long_term: 20,
      total_size_bytes: 5120,
      last_compression: null,
      health_score: 0.85,
    };

    // Mock pour useSystemHealth (4 appels)
    const mockConvHealth = {
      status: 'healthy',
      active_conversations: 5,
      total_messages: 100,
      avg_response_time_ms: 200,
      error_rate: 0.02,
    };
    const mockSingState = {
      engines: Array(18).fill({ name: 'test', status: 'active' }),
    };
    const mockSysHealth = {
      uptime_ms: 3600000,
      cpu_usage: 35,
      memory_usage_mb: 250,
      network_status: 'online',
    };

    // Use mockImplementation to handle dynamic calls
    let callCount = 0;
    vi.mocked(secureInvoke).mockImplementation(async (cmd: string) => {
      callCount++;
      if (cmd === 'memory_get_stats') return mockMemStats;
      if (cmd === 'memory_save_entry') return undefined;
      if (cmd === 'conversation_health_check') return mockConvHealth;
      if (cmd === 'engine_get_singularity_state') return mockSingState;
      if (cmd === 'get_system_health') return mockSysHealth;
      return undefined;
    });

    const memoryHook = renderHook(() => useMemoryEngine());
    const healthHook = renderHook(() => useSystemHealth());

    // Wait for memory stats to load
    await waitFor(() => {
      expect(memoryHook.result.current.stats).not.toBeNull();
    });

    // Save memory
    await memoryHook.result.current.saveToMemory('Integration test', 'short');

    // Refresh health
    await healthHook.result.current.refreshHealth();

    await waitFor(() => {
      expect(healthHook.result.current.health).not.toBeNull();
    });

    expect(memoryHook.result.current.stats?.total_entries).toBe(100);
    expect(healthHook.result.current.health?.global_status).toBe('healthy');
  });
});
