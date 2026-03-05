import { useCallback } from 'react';
import { secureInvoke } from '@/lib/security';

type IpcError = {
  code: string;
  message: string;
  details?: string;
};

type IpcResponse<T> = {
  ok: boolean;
  content: T | null;
  error: IpcError | null;
};

function assertOk<T>(response: IpcResponse<T>): T {
  if (!response.ok || !response.content) {
    const code = response.error?.code ?? 'IPC_UNKNOWN';
    const message = response.error?.message ?? 'Unknown IPC error';
    throw new Error(`${code}: ${message}`);
  }
  return response.content;
}

export function useTitaneDb() {
  const putEvent = useCallback(
    async (stream: string, eventType: string, payloadJson: string, deviceId: string) => {
      const response = await secureInvoke<IpcResponse<{ id: string }>>('db_put_event', {
        request: { stream, eventType, payloadJson, deviceId },
      });
      return assertOk(response);
    },
    []
  );

  const getStream = useCallback(async (stream: string, limit = 100) => {
    const response = await secureInvoke<IpcResponse<{ items: unknown[] }>>('db_get_stream', {
      request: { stream, limit },
    });
    return assertOk(response);
  }, []);

  const putSnapshot = useCallback(async (stream: string, version: number, stateJson: string) => {
    const response = await secureInvoke<IpcResponse<{ saved: boolean }>>('db_put_snapshot', {
      request: { stream, version, stateJson },
    });
    return assertOk(response);
  }, []);

  const getSnapshot = useCallback(async (stream: string) => {
    const response = await secureInvoke<IpcResponse<{ snapshot: unknown | null }>>(
      'db_get_snapshot',
      { request: { stream } }
    );
    return assertOk(response);
  }, []);

  const kvSet = useCallback(async (key: string, valueJson: string) => {
    const response = await secureInvoke<IpcResponse<{ saved: boolean }>>('db_kv_set', {
      request: { key, valueJson },
    });
    return assertOk(response);
  }, []);

  const kvGet = useCallback(async (key: string) => {
    const response = await secureInvoke<IpcResponse<{ value_json: string | null }>>('db_kv_get', {
      request: { key },
    });
    return assertOk(response);
  }, []);

  const syncNow = useCallback(async (reason = 'manual') => {
    const response = await secureInvoke<IpcResponse<{ status: unknown }>>('db_sync_now', {
      reason,
    });
    return assertOk(response);
  }, []);

  const syncStatus = useCallback(async () => {
    const response = await secureInvoke<IpcResponse<{ status: unknown }>>('db_sync_status');
    return assertOk(response);
  }, []);

  return {
    putEvent,
    getStream,
    putSnapshot,
    getSnapshot,
    kvSet,
    kvGet,
    syncNow,
    syncStatus,
  };
}
