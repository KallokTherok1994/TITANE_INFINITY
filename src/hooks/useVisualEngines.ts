/**
 * TITANE∞ v24.2.1 — useVisualEngines Hook
 *
 * Applique automatiquement Glow/Motion/Depth/Mesh selon système state
 * Active les engines visuels qui étaient créés mais invisibles
 */

import { useEffect } from 'react';
import {
  glowEngine,
  motionEngine,
  hyperDepthEngine,
  type SystemState,
} from '../core';

/**
 * Hook pour synchroniser engines visuels avec état système
 *
 * @param systemState - État système actuel
 * @param moduleId - ID module optionnel (pour glow/motion spécifique)
 */
export const useVisualEngines = (
  systemState: SystemState,
  moduleId?: string
) => {
  useEffect(() => {
    // 1. Récupération configs selon SystemState
    // (Les engines existants n'ont pas de méthodes getStateXXX, on utilise valeur fixe)
    const stateIntensityMap: Record<SystemState, number> = {
      'stable': 50,
      'processing': 75,
      'warning': 85,
      'danger': 95,
      'null': 10,
      'offline': 5,
    };

    const intensity = stateIntensityMap[systemState] || 50;

    // 2. Application CSS Variables globales
    // Pour compatibilité avec engines existants
    document.documentElement.style.setProperty(
      '--system-state-intensity',
      `${intensity}`
    );
    document.documentElement.style.setProperty(
      '--system-state',
      systemState
    );

    // 3. Application module-spécifique si moduleId fourni
    if (moduleId) {
      const moduleGlow = glowEngine.getGlow(moduleId, intensity);
      const moduleMotion = motionEngine.getModuleMotion(moduleId, intensity);

      if (moduleGlow) {
        document.documentElement.style.setProperty(
          `--module-${moduleId}-glow-intensity`,
          `${moduleGlow.intensity}`
        );
        document.documentElement.style.setProperty(
          `--module-${moduleId}-glow-color`,
          moduleGlow.color
        );
        document.documentElement.style.setProperty(
          `--module-${moduleId}-glow-blur`,
          `${moduleGlow.blur}px`
        );
      }

      if (moduleMotion) {
        document.documentElement.style.setProperty(
          `--module-${moduleId}-motion-type`,
          moduleMotion.type
        );
        document.documentElement.style.setProperty(
          `--module-${moduleId}-motion-duration`,
          `${moduleMotion.duration}ms`
        );
      }
    }

    // 4. Application depth layers
    hyperDepthEngine.updateLayer('far', { opacity: 0.6, parallaxFactor: 0.3 });
    hyperDepthEngine.updateLayer('mid', { opacity: 0.8, parallaxFactor: 0.6 });
    hyperDepthEngine.updateLayer('near', { opacity: 1.0, parallaxFactor: 1.0 });

  }, [systemState, moduleId]);

  // Définir stateIntensityMap en dehors pour return
  const stateIntensityMap: Record<SystemState, number> = {
    'stable': 50,
    'processing': 75,
    'warning': 85,
    'danger': 95,
    'null': 10,
    'offline': 5,
  };

  return {
    intensity: stateIntensityMap[systemState] || 50,
    systemState,
  };
};

/**
 * Hook simplifié pour appliquer effets visuels automatiques
 * Utilise le state depuis useLivingEngines
 */
export const useAutoVisualEffects = () => {
  // Import dynamique pour éviter circular dependency
  const { state } = require('../hooks/useLivingEngines').useLivingEngines(100);

  return useVisualEngines(state.systemState);
};
