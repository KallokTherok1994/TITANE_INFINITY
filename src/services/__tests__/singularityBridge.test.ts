import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/remoteTransport', () => ({
  isRemoteGatewayAvailable: vi.fn(() => false),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvoke: vi.fn(),
  getResultOrDefault: <T>(result: T | null, defaultValue: T) => result ?? defaultValue,
}));

vi.mock('@/utils/tauriProtector', async () => {
  const actual = await vi.importActual<typeof import('@/utils/tauriProtector')>(
    '@/utils/tauriProtector'
  );

  return {
    ...actual,
    isTauriRuntimeAvailable: vi.fn(() => false),
  };
});

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
}));

import { isRemoteGatewayAvailable } from '@/api/remoteTransport';
import { safeInvoke } from '@/utils/invoke';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';

describe('SingularityBridge transport guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isRemoteGatewayAvailable).mockReturnValue(false);
    vi.mocked(isTauriRuntimeAvailable).mockReturnValue(false);
  });

  it('initialize uses browser fallback without IPC when no transport exists', async () => {
    vi.resetModules();
    const { SingularityBridge } = await import('@/services/singularityBridge');

    await expect(SingularityBridge.initialize()).resolves.not.toThrow();
    expect(safeInvoke).not.toHaveBeenCalled();
  });

  it('returns fallback coherence and critical flag without IPC when transport is unavailable', async () => {
    vi.resetModules();
    const { SingularityBridge } = await import('@/services/singularityBridge');

    await expect(SingularityBridge.getGlobalCoherence()).resolves.toBe(0.5);
    await expect(SingularityBridge.isCritical()).resolves.toBe(false);
    expect(safeInvoke).not.toHaveBeenCalled();
  });

  it('keeps symbolic and meta updates local when no transport exists', async () => {
    vi.resetModules();
    const { SingularityBridge } = await import('@/services/singularityBridge');

    await expect(
      SingularityBridge.updateSymbolic({
        archetypes: [],
        patterns: [],
        narratives: [],
        beliefs: [],
        values: [],
        identity: {
          core_traits: [],
          development_stage: 'emergent',
          consistency_score: 0.5,
        },
      } as never)
    ).resolves.toBeUndefined();

    await expect(
      SingularityBridge.updateMeta({
        total_syncs: 0,
        failed_syncs: 0,
        last_error: null,
        runtime_health: 'healthy',
        data_integrity: 1,
        sync_latency_ms: 0,
        subsystem_status: {},
      } as never)
    ).resolves.toBeUndefined();

    expect(safeInvoke).not.toHaveBeenCalled();
  });
});