/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE ENGINE VITALS
 *   Hook: Vitals moteurs cognitifs temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { tauriClient } from '../services/tauriClient';

export interface EngineVitals {
  // Harmonia (CPU Cognitif)
  harmonia: {
    load: number; // 0-100
    tasksActive: number;
    throttled: boolean;
  };

  // Helios (Santé Système)
  helios: {
    health: number; // 0-100
    lastCheck: number;
    issues: number;
  };

  // Nexus (Cohérence)
  nexus: {
    coherence: number; // 0-100
    validations: number;
    score: number;
  };

  // Sentinel (Erreurs)
  sentinel: {
    errors: number;
    anomalies: number;
    lastError: number | null;
  };

  // SelfHeal++
  selfheal: {
    interventions: number;
    autoResets: number;
    lastHeal: number | null;
  };

  timestamp: number;
}

export interface UseEngineVitalsOptions {
  pollInterval?: number; // ms (défaut: 10000 = 10s)
  enabled?: boolean;
}

export interface UseEngineVitalsReturn {
  vitals: EngineVitals | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getHealthScore: () => number; // Score santé global 0-100
  getCriticalIssues: () => string[]; // Issues critiques
}

const DEFAULT_VITALS: EngineVitals = {
  harmonia: { load: 0, tasksActive: 0, throttled: false },
  helios: { health: 100, lastCheck: Date.now(), issues: 0 },
  nexus: { coherence: 100, validations: 0, score: 100 },
  sentinel: { errors: 0, anomalies: 0, lastError: null },
  selfheal: { interventions: 0, autoResets: 0, lastHeal: null },
  timestamp: Date.now(),
};

/**
 * Hook engine vitals v15
 * - Vitals moteurs cognitifs temps réel
 * - Health score global
 * - Detection issues critiques
 * - Auto-refresh optionnel
 */
export function useEngineVitals(
  options: UseEngineVitalsOptions = {}
): UseEngineVitalsReturn {
  const { pollInterval = 10000, enabled = true } = options;

  const [vitals, setVitals] = useState<EngineVitals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh engine vitals
   */
  const refresh = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get Singularity state (contient les vitals moteurs)
      const singularityState = await tauriClient.getSingularityState({
        timeout: 5000,
        retries: 0, // Temps réel, pas de retry
      });

      // Parse engine vitals depuis Singularity state (nouveau format v15+)
      // Mapping: ancien format (harmonia/helios/nexus) → nouveau format (physical/cognitive/symbolic)
      const engineVitals: EngineVitals = {
        harmonia: {
          load: singularityState.physical?.helios?.cpu_usage || 0,
          tasksActive: singularityState.physical?.system_health?.services_running || 0,
          throttled: (singularityState.physical?.helios?.cpu_usage || 0) > 80,
        },
        helios: {
          health: singularityState.physical?.system_health?.global_health || 100,
          lastCheck: singularityState.physical?.helios?.last_update || Date.now(),
          issues: singularityState.physical?.system_health?.errors_count || 0,
        },
        nexus: {
          coherence: singularityState.cognitive?.coherence || 100,
          validations: singularityState.cognitive?.memory?.total_memories || 0,
          score: singularityState.physical?.metrics?.performance_score || 100,
        },
        sentinel: {
          errors: singularityState.physical?.system_health?.errors_count || 0,
          anomalies: singularityState.physical?.system_health?.warnings_count || 0,
          lastError: singularityState.physical?.system_health?.last_error || null, // INTEGRATION: Add last_error to SystemHealth backend type { message, timestamp, severity }
        },
        selfheal: {
          interventions: singularityState.adaptive?.auto_heal?.errors_healed || 0,
          autoResets: singularityState.adaptive?.evolution?.generation || 0,
          lastHeal: singularityState.adaptive?.auto_heal?.last_heal || null,
        },
        timestamp: Date.now(),
      };

      setVitals(engineVitals);

      console.log('✅ Engine vitals refreshed:', {
        harmonia: `${engineVitals.harmonia.load}%`,
        helios: `${engineVitals.helios.health}%`,
        nexus: `${engineVitals.nexus.coherence}%`,
        sentinel: `${engineVitals.sentinel.errors} errors`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Engine vitals error';
      setError(errorMsg);
      console.error('❌ Engine vitals refresh failed:', err);

      // Fallback: vitals par défaut
      setVitals(DEFAULT_VITALS);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  /**
   * Calcule health score global (0-100)
   */
  const getHealthScore = useCallback((): number => {
    if (!vitals) return 100;

    // Score pondéré:
    // - Helios: 40%
    // - Nexus: 30%
    // - Harmonia: 20%
    // - Sentinel: 10%
    const heliosWeight = 0.4;
    const nexusWeight = 0.3;
    const harmoniaWeight = 0.2;
    const sentinelWeight = 0.1;

    const heliosScore = vitals.helios.health;
    const nexusScore = vitals.nexus.coherence;
    const harmoniaScore = 100 - vitals.harmonia.load; // Inversé (moins de load = meilleur)
    const sentinelScore = Math.max(0, 100 - vitals.sentinel.errors * 10); // -10 par erreur

    const globalScore =
      heliosScore * heliosWeight +
      nexusScore * nexusWeight +
      harmoniaScore * harmoniaWeight +
      sentinelScore * sentinelWeight;

    return Math.round(Math.max(0, Math.min(100, globalScore)));
  }, [vitals]);

  /**
   * Détecte issues critiques
   */
  const getCriticalIssues = useCallback((): string[] => {
    if (!vitals) return [];

    const issues: string[] = [];

    // Harmonia overload
    if (vitals.harmonia.load > 80) {
      issues.push(`Harmonia overload: ${vitals.harmonia.load}% CPU`);
    }

    // Helios health low
    if (vitals.helios.health < 50) {
      issues.push(`Helios health critical: ${vitals.helios.health}%`);
    }

    // Nexus coherence low
    if (vitals.nexus.coherence < 60) {
      issues.push(`Nexus coherence low: ${vitals.nexus.coherence}%`);
    }

    // Sentinel errors
    if (vitals.sentinel.errors > 5) {
      issues.push(`Sentinel errors high: ${vitals.sentinel.errors}`);
    }

    // SelfHeal++ interventions excessives
    if (vitals.selfheal.interventions > 10) {
      issues.push(`SelfHeal++ interventions: ${vitals.selfheal.interventions}`);
    }

    return issues;
  }, [vitals]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    refresh();

    // Poll interval
    const interval = setInterval(refresh, pollInterval);

    return () => {
      clearInterval(interval);
      console.log('🛑 Engine vitals polling stopped');
    };
  }, [refresh, pollInterval, enabled]);

  return {
    vitals,
    isLoading,
    error,
    refresh,
    getHealthScore,
    getCriticalIssues,
  };
}
