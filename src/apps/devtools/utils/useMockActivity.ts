/**
 * TITANE∞ v20.0 — useMockActivity Hook
 * Super Prompt #3: DevTools UI Advanced Suite — Phase 4
 * @license MIT
 */

import { useEffect } from 'react';
import { startMockActivity } from './mockEvents';

/**
 * Hook React pour démarrer/arrêter automatiquement la simulation d'activité
 *
 * @param enabled - Active/désactive la simulation
 * @param intervalMs - Intervalle entre chaque événement (défaut: 2000ms)
 *
 * @example
 * ```tsx
 * import { useMockActivity } from './utils/useMockActivity';
 *
 * function DevToolsApp() {
 *   // Activer en mode dev uniquement
 *   useMockActivity(import.meta.env.DEV, 2000);
 *   return <div>...</div>;
 * }
 * ```
 */
export function useMockActivity(enabled: boolean, intervalMs = 2000) {
  useEffect(() => {
    if (!enabled) return undefined;
    const stop = startMockActivity(intervalMs);
    return stop;
  }, [enabled, intervalMs]);
}
