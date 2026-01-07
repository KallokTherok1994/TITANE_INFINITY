/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v24 - useExperience Hook
 * React hook for experience system with real-time updates
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import type { ExperienceState, ExperienceDomain, XPSource } from '../types/experience';
import {
  initExperienceService,
  getExperienceState,
  awardExperience,
  subscribeToExperience,
  getDomain,
  getAllDomains,
  getXpForNextLevel,
  getProgressToNextLevel,
} from '../services/experienceService';

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
  const [state, setState] = useState<ExperienceState>(getExperienceState());
  const [isLoading, setIsLoading] = useState(true);

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
        logger.error('Erreur initialisation:', err);
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
    xpForNextLevel: getXpForNextLevel(),
    progress: getProgressToNextLevel(),

    // Domaines
    domains: getAllDomains(),
    getDomainById: getDomain,

    // Actions
    award: awardExperience,
  };
};
