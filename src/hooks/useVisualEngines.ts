/**
 * TITANE∞ v24.3.0 — useVisualEngines Hook
 *
 * Applique automatiquement CSS variables selon système state
 * Active les engines visuels via variables CSS globales
 * 
 * SIMPLIFIÉ : Utilise CSS variables seulement (engines activés ailleurs)
 */

import { useEffect } from 'react';
import type { SystemState } from '../core';

/**
 * Hook pour synchroniser variables CSS avec état système
 *
 * @param systemState - État système actuel
 * @param moduleId - ID module optionnel (pour styling spécifique)
 */
export const useVisualEngines = (
  systemState: SystemState,
  moduleId?: string
) => {
  useEffect(() => {
    // Mapping SystemState → intensité visuelle
    const stateIntensityMap: Record<SystemState, number> = {
      'stable': 50,
      'processing': 75,
      'warning': 85,
      'danger': 95,
      'null': 10,
      'offline': 5,
    };

    const intensity = stateIntensityMap[systemState] || 50;

    // Application CSS Variables globales
    document.documentElement.style.setProperty(
      '--system-state-intensity',
      `${intensity}`
    );
    document.documentElement.style.setProperty(
      '--system-state',
      systemState
    );
    
    if (moduleId) {
      document.documentElement.style.setProperty(
        '--active-module-id',
        moduleId
      );
    }

  }, [systemState, moduleId]);

  return {
    active: true,
    systemState,
    moduleId,
  };
};
