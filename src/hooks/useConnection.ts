/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v12 - useConnection Hook
// React hook for connection status monitoring

import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface ConnectionStatus {
  online: boolean;
  lastCheck: number;
  provider: 'Gemini' | 'Ollama' | 'Offline';
}

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    online: false,
    lastCheck: 0,
    provider: 'Offline',
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);

    try {
      const online = await invoke<boolean>('check_connection');

      setStatus({
        online,
        lastCheck: Date.now(),
        provider: online ? 'Gemini' : 'Ollama',
      });

      return online;
    } catch (err) {
      console.error('Connection check error:', err);
      setStatus({
        online: false,
        lastCheck: Date.now(),
        provider: 'Offline',
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Auto-check every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    status,
    isChecking,
    checkConnection,
  };
}
