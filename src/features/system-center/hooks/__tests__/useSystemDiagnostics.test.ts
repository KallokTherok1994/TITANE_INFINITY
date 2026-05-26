import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tauriClient } from '@/lib/tauriClient';

import { useSystemDiagnostics } from '../useSystemDiagnostics';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    scRunQuickDiagnostics: vi.fn(),
    scRunFullDiagnostics: vi.fn(),
    scGetDiagnosticStatus: vi.fn(),
  },
}));

describe('useSystemDiagnostics', () => {
  const mockedTauriClient = vi.mocked(tauriClient);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedTauriClient.scRunQuickDiagnostics.mockResolvedValue({
      timestamp: 1715700000,
      overall_status: 'Healthy',
      total_duration_ms: 42,
      results: [],
    } as never);
    mockedTauriClient.scRunFullDiagnostics.mockResolvedValue({
      timestamp: 1715700000,
      overall_status: 'Healthy',
      total_duration_ms: 42,
      results: [],
    } as never);
    mockedTauriClient.scGetDiagnosticStatus.mockResolvedValue('Healthy' as never);
  });

  it('normalizes tauri fallback quick diagnostics into a degraded diagnostic state', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedTauriClient.scRunQuickDiagnostics.mockResolvedValue({
      success: false,
      fallback: true,
      error: 'No Tauri transport available',
      timestamp: 1715700100,
    } as never);

    const { result } = renderHook(() => useSystemDiagnostics());

    await act(async () => {
      await result.current.runQuickDiagnostics();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('Degraded');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.diagnostics).toMatchObject({
      timestamp: 1715700100,
      overall_status: 'Degraded',
      total_duration_ms: 0,
    });
    expect(result.current.diagnostics?.results).toHaveLength(1);
    expect(result.current.diagnostics?.results[0]).toMatchObject({
      id: 'tauri-transport-fallback',
      title: 'Transport Tauri indisponible',
      status: 'Warning',
      message: 'No Tauri transport available',
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('marks diagnostic status as degraded when the status endpoint returns the tauri fallback shape', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedTauriClient.scGetDiagnosticStatus.mockResolvedValue({
      success: false,
      fallback: true,
      error: 'Browser mode fallback',
      timestamp: 1715700200,
    } as never);

    const { result } = renderHook(() => useSystemDiagnostics());

    await act(async () => {
      await result.current.refreshStatus();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('Degraded');
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('keeps malformed diagnostics as visible errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedTauriClient.scRunQuickDiagnostics.mockResolvedValue({
      invalid: true,
    } as never);

    const { result } = renderHook(() => useSystemDiagnostics());

    await act(async () => {
      await result.current.runQuickDiagnostics();
    });

    await waitFor(() => {
      expect(result.current.error).toContain('Diagnostic rapide échoué');
    });

    expect(result.current.diagnostics).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledOnce();

    consoleErrorSpy.mockRestore();
  });
});
