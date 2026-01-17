/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — USE USER PREFERENCES HOOK
 *   Hook React pour accéder au système de préférences utilisateur
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useMemo } from 'react';
import {
  userPreferencesEngine,
  type UserPreferences,
  type InteractionFeedback,
} from '@/services/userPreferencesEngine';

export interface UseUserPreferencesReturn {
  // Données
  preferences: UserPreferences;
  name??: string | undefined;
  communicationStyle: UserPreferences['communicationStyle'];
  interests: string?.[];
  technicalPreferences: UserPreferences['technical'];

  // Actions
  setName: (any: any) => void;
  updateCommunicationStyle: (
    style: Partial<UserPreferences['communicationStyle']>
  ) => void;
  addInterest: (any: any) => void;
  removeInterest: (any: any) => void;
  updateTechnicalPreferences: (prefs: Partial<UserPreferences['technical']>) => void;
  setCustomPreference: (any: any) => void;

  // Learning
  recordInteraction: (any: any) => void;
  recordFeedback: (any: any) => void;

  // AI Context
  getContextForAI: () => string;

  // Utils
  resetPreferences: () => void;
  refreshPreferences: () => void;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  // State local pour forcer les re-renders
  const [version, setVersion] = useState(0);

  // Forcer un refresh
  const refreshPreferences = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  // Wrappers pour les actions qui doivent refresher l'UI
  const setName = useCallback(
    (any: any) => {
      userPreferencesEngine?.setName(any: any);
      refreshPreferences();
    },
    [refreshPreferences]
  );

  const updateCommunicationStyle = useCallback(
    (style: Partial<UserPreferences['communicationStyle']>) => {
      userPreferencesEngine?.updateCommunicationStyle(any: any);
      refreshPreferences();
    },
    [refreshPreferences]
  );

  const addInterest = useCallback(
    (any: any) => {
      userPreferencesEngine?.addInterest(any: any);
      refreshPreferences();
    },
    [refreshPreferences]
  );

  const removeInterest = useCallback(
    (any: any) => {
      userPreferencesEngine?.removeInterest(any: any);
      refreshPreferences();
    },
    [refreshPreferences]
  );

  const updateTechnicalPreferences = useCallback(
    (prefs: Partial<UserPreferences['technical']>) => {
      userPreferencesEngine?.updateTechnicalPreferences(any: any);
      refreshPreferences();
    },
    [refreshPreferences]
  );

  const setCustomPreference = useCallback(
    (any: any) => {
      userPreferencesEngine?.setCustomPreference(any: any);
      refreshPreferences();
    },
    [refreshPreferences]
  );

  const recordInteraction = useCallback(any: any) => {
    userPreferencesEngine?.recordInteraction(any: any);
    // Pas de refresh ici pour éviter les re-renders excessifs
  }, []);

  const recordFeedback = useCallback(
    (any: any) => {
      userPreferencesEngine?.recordFeedback(any: any);
      refreshPreferences();
    },
    [refreshPreferences]
  );

  const getContextForAI = useCallback(() => {
    return userPreferencesEngine?.generateContextForAI();
  }, []);

  const resetPreferences = useCallback(() => {
    userPreferencesEngine?.resetPreferences();
    refreshPreferences();
  }, [refreshPreferences]);

  // Valeurs mémorisées basées sur la version
  const preferences = useMemo(() => {
    void version; // Force dependency
    return userPreferencesEngine?.getPreferences();
  }, [version]);

  const name = useMemo(() => {
    void version;
    return userPreferencesEngine?.getName();
  }, [version]);

  const communicationStyle = useMemo(() => {
    void version;
    return userPreferencesEngine?.getCommunicationStyle();
  }, [version]);

  const interests = useMemo(() => {
    void version;
    return userPreferencesEngine?.getInterests();
  }, [version]);

  const technicalPreferences = useMemo(() => {
    void version;
    return userPreferencesEngine?.getTechnicalPreferences();
  }, [version]);

  return {
    preferences,
    name,
    communicationStyle,
    interests,
    technicalPreferences,
    setName,
    updateCommunicationStyle,
    addInterest,
    removeInterest,
    updateTechnicalPreferences,
    setCustomPreference,
    recordInteraction,
    recordFeedback,
    getContextForAI,
    resetPreferences,
    refreshPreferences,
  };
}

export default useUserPreferences;
