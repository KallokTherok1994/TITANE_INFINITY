import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.hoisted(() => vi.fn());

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

import { safeInvokeTauri, tauriProtector } from '@/utils/tauriProtector';

describe('TauriProtector memory truth', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    (
      window as Window & { __TITANE_TAURI_INITIALIZED?: boolean }
    ).__TITANE_TAURI_INITIALIZED = true;
    tauriProtector.reset();
  });

  it('does not cache persistent memory stats reads across immediate rechecks', async () => {
    invokeMock
      .mockResolvedValueOnce({
        count_by_level: { session: 0, intermediate: 0, long_term: 0 },
      })
      .mockResolvedValueOnce({
        count_by_level: { session: 0, intermediate: 2, long_term: 0 },
      });

    const first = await safeInvokeTauri('persistent_memory_get_stats');
    const second = await safeInvokeTauri('persistent_memory_get_stats');

    expect(first).toMatchObject({
      count_by_level: { session: 0, intermediate: 0, long_term: 0 },
    });
    expect(second).toMatchObject({
      count_by_level: { session: 0, intermediate: 2, long_term: 0 },
    });
    expect(invokeMock).toHaveBeenCalledTimes(2);
  });

  it('keeps short result caching for stable non-memory commands', async () => {
    invokeMock.mockResolvedValue({ ok: true });

    await safeInvokeTauri('ai_status');
    await safeInvokeTauri('ai_status');

    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it('keeps TOTAL_DEV browser fallback locked even when a browser token is provided', () => {
    const result = (
      tauriProtector as unknown as {
        createFallbackResponse: (
          command: string,
          error: unknown,
          args?: Record<string, unknown>
        ) => {
          ok: boolean;
          lock_state: string;
          fallback: boolean;
          session_token?: string;
        };
      }
    ).createFallbackResponse('total_dev_unlock', new Error('invoke unavailable'), {
      token: 'lock-check-input',
    });

    expect(result).toMatchObject({
      ok: false,
      lock_state: 'LOCKED',
      fallback: true,
    });
    expect(result).not.toHaveProperty('session_token');
  });
});
