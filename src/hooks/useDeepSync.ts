/**
 * TITANE∞ v18 — useDeepSync Hook
 *
 * React hook for Deep Sync Engine:
 * - Trigger deep synchronization
 * - Verify sync quality
 * - Compare engine states
 * - Detect desynchronization
 */

import { secureInvoke } from '@/lib/security';
import { useState, useCallback } from 'react';

export interface SyncedState {
  timestamp: number;
  quality: SyncQuality;
  engine_alignment: Record<string, EngineAlignment>;
  harmonized_values: Record<string, number>;
  issues: SyncIssue[];
  integrity_hash: string;
  success: boolean;
  corrections_applied: string[];
}

export type SyncQuality =
  | 'Perfect'
  | 'Excellent'
  | 'Good'
  | 'Acceptable'
  | 'Degraded'
  | 'Poor'
  | 'Failed';

export interface EngineAlignment {
  engine_name: string;
  is_aligned: boolean;
  alignment_score: number;
  deviation: number;
  last_update: number;
}

export interface SyncIssue {
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  category: string;
  description: string;
  affected_engines: string[];
  auto_correctable: boolean;
}

export interface DeepSyncState {
  last_sync: number;
  sync_count: number;
  sync_quality: number;
  engines_in_sync: string[];
  engines_out_of_sync: string[];
  global_hash: string;
  desync_detected: boolean;
  last_correction: number | null;
}

/**
 * useDeepSync Hook
 */
export function useDeepSync() {
  const [syncedState, setSyncedState] = useState<SyncedState | null>(null);
  const [deepSyncState, setDeepSyncState] = useState<DeepSyncState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Trigger deep sync now
   */
  const deepSyncNow = useCallback(async (engineStates: Record<string, number>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await secureInvoke<SyncedState>('meta_trigger_sync', {
        engineStates,
      });
      setSyncedState(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verify sync quality
   */
  const verifySync = useCallback(async () => {
    try {
      const isValid = await secureInvoke<boolean>('meta_verify_sync');
      return isValid;
    } catch (err) {
      console.error('Failed to verify sync:', err);
      throw err;
    }
  }, []);

  /**
   * Detect desync
   */
  const detectDesync = useCallback(async () => {
    try {
      const detected = await secureInvoke<boolean>('meta_detect_desync');
      return detected;
    } catch (err) {
      console.error('Failed to detect desync:', err);
      throw err;
    }
  }, []);

  /**
   * Get deep sync state
   */
  const getDeepSyncState = useCallback(async () => {
    try {
      const [_metaState, deepState] =
        await secureInvoke<[Record<string, unknown>, DeepSyncState]>('meta_get_state');
      setDeepSyncState(deepState);
      return deepState;
    } catch (err) {
      console.error('Failed to get deep sync state:', err);
      throw err;
    }
  }, []);

  /**
   * Compare previous and next states
   */
  const compareStates = useCallback(
    (prev: Record<string, number>, next: Record<string, number>) => {
      const deltas: Record<string, number> = {};

      for (const key in next) {
        if (key in prev) {
          deltas[key] = Math.abs(next[key] - prev[key]);
        }
      }

      return deltas;
    },
    []
  );

  /**
   * Get sync quality score
   */
  const getSyncQualityScore = useCallback(() => {
    if (!syncedState) return 0;

    const qualityScores: Record<SyncQuality, number> = {
      Perfect: 1.0,
      Excellent: 0.95,
      Good: 0.85,
      Acceptable: 0.75,
      Degraded: 0.6,
      Poor: 0.4,
      Failed: 0.2,
    };

    return qualityScores[syncedState.quality] ?? 0;
  }, [syncedState]);

  /**
   * Get misaligned engines
   */
  const getMisalignedEngines = useCallback(() => {
    if (!syncedState) return [];

    return Object.entries(syncedState.engine_alignment)
      .filter(([_, alignment]) => !alignment.is_aligned)
      .map(([name]) => name);
  }, [syncedState]);

  /**
   * Has critical issues
   */
  const hasCriticalIssues = useCallback(() => {
    if (!syncedState) return false;

    return syncedState.issues.some(
      issue => issue.severity === 'Critical' || issue.severity === 'Error'
    );
  }, [syncedState]);

  return {
    // State
    syncedState,
    deepSyncState,
    loading,
    error,

    // Actions
    deepSyncNow,
    verifySync,
    detectDesync,
    getDeepSyncState,

    // Helpers
    compareStates,
    getSyncQualityScore,
    getMisalignedEngines,
    hasCriticalIssues,
  };
}
