import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebuggerLiveOS } from '@/features/system-center/hooks/useDebuggerLiveOS';
import { tauriClient } from '@/lib/tauriClient';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    getSystemHealth: vi.fn(),
    getModuleHealth: vi.fn(),
    getHeliosMetrics: vi.fn(),
    getSingularityState: vi.fn(),
    enginesMonitoringGetHealth: vi.fn(),
    singularitySelfCheck: vi.fn(),
    getCognitiveState: vi.fn(),
    singularityGetFullState: vi.fn(),
    memoryGetState: vi.fn(),
    memoryPrune: vi.fn(),
  },
}));

describe('useDebuggerLiveOS', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(tauriClient.getSystemHealth).mockResolvedValue({
      healthy: true,
      status: 'healthy',
    });
    vi.mocked(tauriClient.getModuleHealth).mockResolvedValue({
      all_healthy: true,
      healthy_count: 5,
      total_count: 5,
    });
    vi.mocked(tauriClient.getHeliosMetrics).mockResolvedValue({
      cpu_usage: 0.2,
      memory_usage: 0.9,
    });
    vi.mocked(tauriClient.getSingularityState).mockResolvedValue({});
    vi.mocked(tauriClient.enginesMonitoringGetHealth).mockResolvedValue({
      overall_health: 1,
      engines: [],
    });
    vi.mocked(tauriClient.singularitySelfCheck).mockResolvedValue({});
    vi.mocked(tauriClient.getCognitiveState).mockResolvedValue({});
    vi.mocked(tauriClient.singularityGetFullState).mockResolvedValue({
      physical: {},
      cognitive: {},
      symbolic: {},
      adaptive: {},
      meta: {},
    });
    vi.mocked(tauriClient.memoryGetState).mockResolvedValue({
      snapshots_count: 4,
      log_entries_count: 12,
      timeline_events: 6,
      storage_size_mb: 2.5,
    });
    vi.mocked(tauriClient.memoryPrune).mockResolvedValue(0);
  });

  it('marks HighMemory as manual-only and does not call memoryPrune auto-fix', async () => {
    const { result } = renderHook(() => useDebuggerLiveOS());

    await act(async () => {
      await result.current.start('RiskAssessment');
    });

    await waitFor(() => {
      expect(result.current.state.riskAssessment).toBeDefined();
    });

    const highMemoryRisk = result.current.state.riskAssessment?.factors.find(
      risk => risk.id === 'high_memory'
    );

    expect(highMemoryRisk).toBeDefined();
    expect(highMemoryRisk?.auto_fixable).toBe(false);
    expect(highMemoryRisk?.mitigation).toMatch(/memory_prune|legacy/i);

    let autoFixResult;
    await act(async () => {
      autoFixResult = await result.current.autoFix('high_memory');
    });

    expect(tauriClient.memoryPrune).not.toHaveBeenCalled();
    expect(autoFixResult).toMatchObject({
      success: true,
      fixes_applied: 0,
      fixes_failed: 0,
      fixed_risks: [],
    });
    expect(autoFixResult?.recommendations.join(' ')).toMatch(/action manuelle|legacy/i);
  });
});
