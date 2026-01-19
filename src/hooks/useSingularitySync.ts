/**
 * TITANE∞ v25.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.2 — USE SINGULARITY SYNC (Fusion Hook)
 *   Sync bidirectionnelle Frontend ↔ Backend Singularity State
 *   Auto-merge, conflict resolution, performance optimized
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { secureInvoke } from '@/lib/security';
import { singularityEngine } from '@/core/engines/SINGULARITY_ENGINE';
import type { SingularityState } from '@/core/ARCHITECTURE_TYPES_v24-v∞';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface SingularitySyncOptions {
  autoSync?: boolean; // Auto-sync activé (défaut: true)
  syncInterval?: number; // Intervalle sync en ms (défaut: 1000)
  bidirectional?: boolean; // Sync bidirectionnelle (défaut: true)
  conflictResolution?: 'frontend' | 'backend' | 'merge'; // Stratégie conflits
  onSyncError?: (error: Error) => void;
  onSyncSuccess?: (state: SingularityState) => void;
}

export interface SingularitySyncMetrics {
  lastSync: number; // Timestamp dernière sync
  syncCount: number; // Nombre total syncs
  errorCount: number; // Nombre erreurs
  avgSyncTime: number; // Temps moyen sync (ms)
  isHealthy: boolean; // Santé globale
}

export interface SingularitySyncReturn {
  // État
  state: SingularityState | null;
  isSyncing: boolean;
  lastError: Error | null;
  metrics: SingularitySyncMetrics;

  // Actions
  sync: () => Promise<void>; // Force sync manuelle
  pauseSync: () => void; // Pause auto-sync
  resumeSync: () => void; // Reprendre auto-sync
  resetMetrics: () => void; // Reset métriques
}

// ═══════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export function useSingularitySync(
  options: SingularitySyncOptions = {}
): SingularitySyncReturn {
  const {
    autoSync = true,
    syncInterval = 1000,
    bidirectional = true,
    conflictResolution = 'merge',
    onSyncError,
    onSyncSuccess,
  } = options;

  // ═══ STATE ═══
  const [state, setState] = useState<SingularityState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [metrics, setMetrics] = useState<SingularitySyncMetrics>({
    lastSync: 0,
    syncCount: 0,
    errorCount: 0,
    avgSyncTime: 0,
    isHealthy: true,
  });

  // Refs
  const syncIntervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const syncTimesRef = useRef<number[]>([]);

  // ═══ SYNC FUNCTION ═══
  const sync = useCallback(async () => {
    if (isPausedRef.current || isSyncing) return;

    const startTime = Date.now();
    setIsSyncing(true);
    setLastError(null);

    try {
      // 1. Fetch backend state
      const backendState = await secureInvoke<SingularityState>(
        'singularity_get_full_state'
      );

      // 2. Get frontend state
      const frontendState = singularityEngine.getState();

      // 3. Resolve conflicts based on strategy
      let mergedState: SingularityState;

      switch (conflictResolution) {
        case 'frontend':
          mergedState = frontendState;
          break;

        case 'backend':
          mergedState = backendState;
          break;

        case 'merge':
        default:
          // Intelligent merge: prefer newest timestamp
          mergedState = {
            ...backendState,
            ...frontendState,
            // Unity: prefer backend (critical)
            unity: backendState.unity,
            // Quantum: merge fields
            quantum: {
              ...backendState.quantum,
              ...frontendState.quantum,
              coherence:
                (backendState.quantum.coherence + frontendState.quantum.coherence) / 2,
            },
            // Convergence: average values
            convergence: {
              ...backendState.convergence,
              ...frontendState.convergence,
              convergenceLevel:
                (backendState.convergence.convergenceLevel +
                  frontendState.convergence.convergenceLevel) /
                2,
            },
            // Timestamp: newest
            timestamp: Math.max(backendState.timestamp, frontendState.timestamp),
          };
          break;
      }

      // 4. Update frontend engine
      singularityEngine.setState(mergedState);
      setState(mergedState);

      // 5. Push to backend (if bidirectional)
      if (bidirectional) {
        await secureInvoke('singularity_update_full_state', {
          state: mergedState,
        });
      }

      // 6. Update metrics
      const syncTime = Date.now() - startTime;
      syncTimesRef.current.push(syncTime);
      if (syncTimesRef.current.length > 100) {
        syncTimesRef.current.shift(); // Keep last 100 syncs
      }

      const avgTime =
        syncTimesRef.current.reduce((a, b) => a + b, 0) / syncTimesRef.current.length;

      setMetrics(prev => ({
        lastSync: Date.now(),
        syncCount: prev.syncCount + 1,
        errorCount: prev.errorCount,
        avgSyncTime: avgTime,
        isHealthy: avgTime < 100 && prev.errorCount / (prev.syncCount + 1) < 0.05, // <5% error rate
      }));

      // 7. Success callback
      onSyncSuccess?.(mergedState);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sync failed');
      setLastError(err);

      setMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        isHealthy: false,
      }));

      onSyncError?.(err);
      console.error('[useSingularitySync] Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [bidirectional, conflictResolution, isSyncing, onSyncError, onSyncSuccess]);

  // ═══ AUTO-SYNC SETUP ═══
  useEffect(() => {
    if (!autoSync) return;

    // Initial sync
    sync();

    // Setup interval
    syncIntervalRef.current = window.setInterval(sync, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, sync, syncInterval]);

  // ═══ PAUSE/RESUME ═══
  const pauseSync = useCallback(() => {
    isPausedRef.current = true;
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  const resumeSync = useCallback(() => {
    isPausedRef.current = false;
    if (autoSync && !syncIntervalRef.current) {
      syncIntervalRef.current = window.setInterval(sync, syncInterval);
    }
  }, [autoSync, sync, syncInterval]);

  // ═══ RESET METRICS ═══
  const resetMetrics = useCallback(() => {
    setMetrics({
      lastSync: 0,
      syncCount: 0,
      errorCount: 0,
      avgSyncTime: 0,
      isHealthy: true,
    });
    syncTimesRef.current = [];
  }, []);

  // ═══ RETURN ═══
  return {
    state,
    isSyncing,
    lastError,
    metrics,
    sync,
    pauseSync,
    resumeSync,
    resetMetrics,
  };
}

export default useSingularitySync;
