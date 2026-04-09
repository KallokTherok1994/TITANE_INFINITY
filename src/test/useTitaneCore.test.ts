import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTitaneCore } from '../hooks/useTitaneCore';
import { tauri } from '../api/tauriClient';

vi.mock('../api/tauriClient', () => ({
  tauri: vi.fn(),
}));

describe('useTitaneCore', () => {
  const mockedTauri = vi.mocked(tauri);

  beforeEach(() => {
    vi.useFakeTimers();
    mockedTauri.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('avoids overlapping auto-refresh calls while a system status request is still in flight', async () => {
    let resolveModules:
      | ((value: Array<{ name: string; status: string }>) => void)
      | null = null;

    mockedTauri.mockImplementation(async command => {
      if (command !== 'get_system_health') {
        return [];
      }

      return await new Promise(resolve => {
        resolveModules = resolve as (
          value: Array<{ name: string; status: string }>
        ) => void;
      });
    });

    const { unmount } = renderHook(() => useTitaneCore(true));

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(mockedTauri).toHaveBeenCalledTimes(1);
    expect(mockedTauri).toHaveBeenLastCalledWith('get_system_health');

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(mockedTauri).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveModules?.([{ name: 'helios', status: 'healthy' }]);
      await Promise.resolve();
    });

    unmount();
  });
});
