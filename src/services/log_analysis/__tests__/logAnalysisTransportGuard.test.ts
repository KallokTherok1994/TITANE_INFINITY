import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/remoteTransport', () => ({
  isRemoteGatewayAvailable: vi.fn(() => false),
}));

vi.mock('@/api/tauriClient', () => ({
  isTauriAvailable: vi.fn(() => false),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvoke: vi.fn(),
  safeInvokeCanonical: vi.fn().mockResolvedValue({
    ok: false,
    content: null,
    error: { code: 'NO_TRANSPORT', message: 'no bridge' },
  }),
}));

import { safeInvoke } from '@/utils/invoke';

describe('runLogAnalysisScan transport guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a local fallback report without invoking get_logs when no transport exists', async () => {
    vi.resetModules();
    const { runLogAnalysisScan } = await import('@/services/log_analysis');

    const snapshot = await runLogAnalysisScan();

    expect(snapshot.source).toBe('fallback');
    expect(snapshot.report).not.toBeNull();
    expect(safeInvoke).not.toHaveBeenCalled();
  });
});