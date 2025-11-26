/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE SYSTEM MONITOR
 *   Hook: Monitoring système complet (vitals + engines)
 * ═══════════════════════════════════════════════════════════════
 */

import { useVitals } from './useVitals';
import { useEngineVitals } from './useEngineVitals';
import type { SystemVitals } from './useVitals';
import type { EngineVitals } from './useEngineVitals';

export interface UseSystemMonitorOptions {
  vitalsInterval?: number;
  enginesInterval?: number;
  enabled?: boolean;
}

export interface UseSystemMonitorReturn {
  systemVitals: SystemVitals | null;
  systemHistory: SystemVitals[];
  systemLoading: boolean;
  systemError: string | null;
  engineVitals: EngineVitals | null;
  engineLoading: boolean;
  engineError: string | null;
  globalHealth: number;
  isSystemOverloaded: boolean;
  criticalIssues: string[];
  refreshSystem: () => Promise<void>;
  refreshEngines: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useSystemMonitor(
  options: UseSystemMonitorOptions = {}
): UseSystemMonitorReturn {
  const {
    vitalsInterval = 5000,
    enginesInterval = 10000,
    enabled = true,
  } = options;

  const {
    vitals: systemVitals,
    history: systemHistory,
    isLoading: systemLoading,
    error: systemError,
    fetchVitals,
    isOverloaded,
  } = useVitals({ pollInterval: vitalsInterval, enabled });

  const {
    vitals: engineVitals,
    isLoading: engineLoading,
    error: engineError,
    refresh: refreshEnginesBase,
    getHealthScore,
    getCriticalIssues,
  } = useEngineVitals({ pollInterval: enginesInterval, enabled });

  const refreshSystem = async () => {
    await fetchVitals();
  };

  const refreshEngines = async () => {
    await refreshEnginesBase();
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchVitals().catch(e => console.error('System refresh error:', e)),
      refreshEnginesBase().catch(e => console.error('Engine refresh error:', e)),
    ]);
  };

  const globalHealth = (): number => {
    const engineHealth = getHealthScore();
    if (!systemVitals) return engineHealth;

    const systemScore = Math.round(
      (100 - systemVitals.cpu) * 0.4 +
      (100 - systemVitals.memory) * 0.4 +
      (100 - systemVitals.disk) * 0.2
    );

    return Math.round(engineHealth * 0.6 + systemScore * 0.4);
  };

  const criticalIssues = (): string[] => {
    const issues: string[] = [];

    if (systemVitals) {
      if (systemVitals.cpu > 90) issues.push(`System CPU critical: ${systemVitals.cpu}%`);
      if (systemVitals.memory > 95) issues.push(`System Memory critical: ${systemVitals.memory}%`);
      if (systemVitals.disk > 98) issues.push(`System Disk critical: ${systemVitals.disk}%`);
    }

    issues.push(...getCriticalIssues());
    return issues;
  };

  return {
    systemVitals,
    systemHistory,
    systemLoading,
    systemError,
    engineVitals,
    engineLoading,
    engineError,
    globalHealth: globalHealth(),
    isSystemOverloaded: isOverloaded(),
    criticalIssues: criticalIssues(),
    refreshSystem,
    refreshEngines,
    refreshAll,
  };
}
