/**
 * TITANE∞ — useRemoteKeyAgent hook
 *
 * React hook that subscribes to RemoteKeyAgent state and exposes commands.
 * Auto-initialises the agent on first mount.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { remoteKeyAgent, type AgentKeyState } from './RemoteKeyAgent';

export interface UseRemoteKeyAgentReturn {
  state: AgentKeyState;
  createKey: (label: string, scopes?: string[]) => Promise<string | null>;
  revokeKey: (key_id: string) => Promise<boolean>;
  rotateKey: (key_id: string) => Promise<string | null>;
  refresh: () => Promise<void>;
  clearSecret: () => void;
}

export function useRemoteKeyAgent(): UseRemoteKeyAgentReturn {
  const [state, setState] = useState<AgentKeyState>(remoteKeyAgent.state);
  const initRef = useRef(false);

  useEffect(() => {
    const unsub = remoteKeyAgent.onStateChange(setState);
    if (!initRef.current) {
      initRef.current = true;
      void remoteKeyAgent.init();
    }
    return unsub;
  }, []);

  const createKey = useCallback(
    (label: string, scopes?: string[]) => remoteKeyAgent.createKey(label, scopes),
    [],
  );

  const revokeKey = useCallback(
    (key_id: string) => remoteKeyAgent.revokeKey(key_id),
    [],
  );

  const rotateKey = useCallback(
    (key_id: string) => remoteKeyAgent.rotateKey(key_id),
    [],
  );

  const refresh = useCallback(() => remoteKeyAgent.refresh(), []);

  const clearSecret = useCallback(() => remoteKeyAgent.clearSecret(), []);

  return { state, createKey, revokeKey, rotateKey, refresh, clearSecret };
}
