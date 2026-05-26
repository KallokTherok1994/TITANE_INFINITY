import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/remoteTransport', () => ({
  isRemoteGatewayAvailable: vi.fn(() => false),
}));

vi.mock('@/api/tauriClient', () => ({
  isTauriAvailable: vi.fn(() => false),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvoke: vi.fn(),
}));

import { isRemoteGatewayAvailable } from '@/api/remoteTransport';
import { isTauriAvailable } from '@/api/tauriClient';
import { safeInvoke } from '@/utils/invoke';
import {
  getProjectHealthMetrics,
  resetProjectHealthMetricsCacheForTests,
} from '@/services/monitoring';

describe('getProjectHealthMetrics transport guard', () => {
  beforeEach(() => {
    resetProjectHealthMetricsCacheForTests();
    vi.clearAllMocks();
    vi.mocked(isTauriAvailable).mockReturnValue(false);
    vi.mocked(isRemoteGatewayAvailable).mockReturnValue(false);
  });

  it('returns fallback metrics without invoking IPC when no transport exists', async () => {
    const metrics = await getProjectHealthMetrics();

    expect(metrics.mostImpactedRing).toBe('unavailable');
    expect(metrics.incidentRecurrenceRate).toBe(0);
    expect(metrics.evidenceNote).toContain('IPC unavailable');
    expect(safeInvoke).not.toHaveBeenCalled();
  });
});
