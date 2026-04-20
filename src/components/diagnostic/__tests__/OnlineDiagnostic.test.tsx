import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    checkOnlineCapabilities: vi.fn(),
  },
}));

vi.mock('@/utils/tauriProtector', async importOriginal => {
  const actual = await importOriginal<typeof import('@/utils/tauriProtector')>();
  return {
    ...actual,
    isTauriRuntimeAvailable: vi.fn(),
  };
});

import { OnlineDiagnostic } from '../OnlineDiagnostic';
import { tauriClient } from '@/lib/tauriClient';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';

const mockCheckOnlineCapabilities = vi.mocked(tauriClient.checkOnlineCapabilities);
const mockIsTauriRuntimeAvailable = vi.mocked(isTauriRuntimeAvailable);

describe('OnlineDiagnostic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows browser-only message when Tauri runtime is unavailable', async () => {
    mockIsTauriRuntimeAvailable.mockReturnValue(false);

    render(<OnlineDiagnostic />);

    await waitFor(() => {
      expect(
        screen.getByText(/Diagnostic disponible uniquement en runtime Tauri/i)
      ).toBeInTheDocument();
    });

    expect(mockCheckOnlineCapabilities).not.toHaveBeenCalled();
  });

  it('uses the canonical tauriClient wrapper to load capabilities', async () => {
    mockIsTauriRuntimeAvailable.mockReturnValue(true);
    mockCheckOnlineCapabilities.mockResolvedValueOnce({
      internet: {
        online: true,
        dns_resolvable: true,
        api_reachable: [],
      },
      providers: [],
      timestamp: '2026-04-20T00:00:00Z',
      summary: '0/0 providers online (Internet: ✅)',
    });

    render(<OnlineDiagnostic />);

    await waitFor(() => {
      expect(
        screen.getByText(/0\/0 providers online \(Internet: ✅\)/i)
      ).toBeInTheDocument();
    });

    expect(mockCheckOnlineCapabilities).toHaveBeenCalledTimes(1);
  });
});
