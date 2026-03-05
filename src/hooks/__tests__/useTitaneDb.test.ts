import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

import { useTitaneDb } from '../useTitaneDb';

const secureInvokeMock = vi.fn();

vi.mock('@/lib/security', () => ({
  secureInvoke: (...args: unknown[]) => secureInvokeMock(...args),
}));

describe('useTitaneDb', () => {
  beforeEach(() => {
    secureInvokeMock.mockReset();
  });

  test('returns data on success', async () => {
    secureInvokeMock.mockResolvedValue({
      ok: true,
      content: { id: 'evt-1' },
      error: null,
    });

    const { result } = renderHook(() => useTitaneDb());
    const payload = (await result.current.putEvent('stream-a', 'created', '{}', 'device-a')) as {
      id: string;
    };

    expect(payload.id).toBe('evt-1');
    expect(secureInvokeMock).toHaveBeenCalledWith('db_put_event', {
      request: {
        stream: 'stream-a',
        eventType: 'created',
        payloadJson: '{}',
        deviceId: 'device-a',
      },
    });
  });

  test('throws on canonical error payload', async () => {
    secureInvokeMock.mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'DB_BUSY', message: 'busy' },
    });

    const { result } = renderHook(() => useTitaneDb());
    await expect(result.current.getStream('stream-a')).rejects.toThrow('DB_BUSY: busy');
  });
});
