/**
 * TITANE∞ v18 — useMetaCognition Hook
 *
 * React hook for Meta-Cognition Engine:
 * - Fetch meta-cognitive reports
 * - Monitor cognitive health
 * - Get engine alignment status
 * - Establish cognitive baselines
 */

import { secureInvoke } from '@/lib/security';
import { useState, useCallback } from 'react';

export interface MetaCognitiveReport {
  timestamp: number;
  coherence_score: number;
  confidence: number;
  anomaly_detected: boolean;
  required_adjustment: string | null;
  delta_map: Record<string, number>;
  engine_alignment: Record<string, boolean>;
  recommended_next_state: DeepSyncAction | null;
  detected_issues: CognitiveIssue[];
  health_indicators: CognitiveHealthIndicators;
}

export interface CognitiveIssue {
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  description: string;
  affected_engines: string[];
  suggested_fix: string | null;
}

export interface CognitiveHealthIndicators {
  stability: number;
  consistency: number;
  logic_integrity: number;
  temporal_coherence: number;
  memory_alignment: number;
  overall_health: number;
}

export type DeepSyncAction =
  | 'None'
  | 'StabilizeCognitive'
  | 'ReanchorMemory'
  | { RealignEngines: string[] }
  | 'CorrectTimeline'
  | 'RecalibrateAI'
  | 'FullDeepSync'
  | 'EmergencyReset';

export interface MetaCognitionState {
  last_evaluation: MetaCognitiveReport | null;
  evaluation_count: number;
  anomaly_count: number;
  correction_count: number;
  average_coherence: number;
  baseline_established: boolean;
}

/**
 * useMetaCognition Hook
 */
export function useMetaCognition() {
  const [report, setReport] = useState<MetaCognitiveReport | null>(null);
  const [state, setState] = useState<MetaCognitionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch meta-cognitive report
   */
  const fetchMetaReport = useCallback(
    async (params: {
      cognitive_integrity?: number;
      timeline_coherence?: number;
      memory_alignment?: number;
      ai_stability?: number;
      singularity_coherence?: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await secureInvoke<MetaCognitiveReport>('meta_get_report', params);
        setReport(result);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get engine alignment status
   */
  const getAlignment = useCallback(async () => {
    try {
      const alignment = await secureInvoke<Record<string, boolean>>('meta_get_alignment');
      return alignment;
    } catch (err) {
      console.error('Failed to get alignment:', err);
      throw err;
    }
  }, []);

  /**
   * Get meta state
   */
  const getMetaState = useCallback(async () => {
    try {
      const [metaState, _deepSyncState] =
        await secureInvoke<[MetaCognitionState, Record<string, unknown>]>(
          'meta_get_state'
        );
      setState(metaState);
      return metaState;
    } catch (err) {
      console.error('Failed to get meta state:', err);
      throw err;
    }
  }, []);

  /**
   * Monitor cognitive health
   * @returns Health score (0.0 = critical, 1.0 = optimal)
   */
  const monitorCognitiveHealth = useCallback(async () => {
    if (!report) {
      return null;
    }

    return report.health_indicators.overall_health;
  }, [report]);

  /**
   * Check if anomaly detected
   */
  const hasAnomaly = useCallback(() => {
    return report?.anomaly_detected ?? false;
  }, [report]);

  /**
   * Get critical issues
   */
  const getCriticalIssues = useCallback(() => {
    if (!report) return [];

    return report.detected_issues.filter(
      issue => issue.severity === 'Critical' || issue.severity === 'High'
    );
  }, [report]);

  /**
   * Get recommended action
   */
  const getRecommendedAction = useCallback(() => {
    return report?.recommended_next_state ?? null;
  }, [report]);

  return {
    // State
    report,
    state,
    loading,
    error,

    // Actions
    fetchMetaReport,
    getAlignment,
    getMetaState,
    monitorCognitiveHealth,

    // Helpers
    hasAnomaly,
    getCriticalIssues,
    getRecommendedAction,
  };
}
