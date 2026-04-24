/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - useExperience Hook
 * React hook for experience system with real-time updates
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { createLogger } from '../utils/logger';
import type { ExperienceState, ExperienceDomain, XPSource } from '../types/experience';
import {
  initExperienceService,
  getExperienceState,
  awardExperience,
  subscribeToExperience,
  getDomain,
} from '../services/experienceService';
import {
  calculateProgress,
  xpForNextLevel as calculateXpForNextLevel,
} from '../types/experience';

export interface UseExperienceReturn {
  // État
  state: ExperienceState;
  isLoading: boolean;

  // Métriques globales
  totalXp: number;
  level: number;
  xpForNextLevel: number;
  progress: number;

  // Domaines
  domains: ExperienceDomain[];
  getDomainById: (id: string) => ExperienceDomain | null;

  // Actions
  award: (
    domainId: string,
    amount: number,
    source: XPSource | string,
    metadata?: Record<string, unknown>
  ) => Promise<ExperienceDomain | null>;
}

/**
 * Hook React pour le système d'expérience
 * Auto-initialise au premier mount, s'abonne aux updates
 */
export const useExperience = (): UseExperienceReturn => {
  const hookLogger = createLogger('useExperience');
  const [state, setState] = useState<ExperienceState>(getExperienceState());
  const [isLoading, setIsLoading] = useState(true);
  const nextLevelXp = calculateXpForNextLevel(state.level);

  // Initialisation au mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initExperienceService();
        if (mounted) {
          setState(getExperienceState());
          setIsLoading(false);
        }
      } catch (err) {
        hookLogger.error('Erreur initialisation:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // S'abonner aux changements d'état
  useEffect(() => {
    const unsubscribe = subscribeToExperience(newState => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  return {
    // État complet
    state,
    isLoading,

    // Métriques globales
    totalXp: state.totalXp,
    level: state.level,
    xpForNextLevel: nextLevelXp,
    progress: calculateProgress(state.totalXp, state.level),

    // Domaines
    domains: Object.values(state.domains),
    getDomainById: getDomain,

    // Actions
    award: awardExperience,
  };
};
