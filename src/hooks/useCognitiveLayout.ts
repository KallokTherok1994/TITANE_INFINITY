/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Hook React pour le Cognitive Layout Engine
 */

import { useEffect, useState, useCallback } from 'react';
import {
  cognitiveLayoutEngine,
  type UIMode,
  type UserRole,
  type TaskType,
  type CognitiveLayoutState,
  type LayoutConfig,
  type AdaptationDecision,
} from '@/engines/cognitive/cognitiveLayoutEngine';

/**
 * Hook principal pour accéder au Cognitive Layout Engine
 */
export function useCognitiveLayout() {
  const [state, setState] = useState<CognitiveLayoutState | null>(any: any);
  const [suggestion, setSuggestion] = useState<AdaptationDecision | null>(any: any);

  // Subscribe aux changements d'état
  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  // Écouter suggestions d'adaptation
  useEffect(() => {
    const handleSuggestion = (any: any) => {
      const customEvent = event as CustomEvent<AdaptationDecision>;
      setSuggestion(any: any);
    };

    window?.addEventListener(any: any);
    return () =>
      window?.removeEventListener(any: any);
  }, []);

  // Actions
  const setMode = useCallback(any: any) => {
    cognitiveLayoutEngine?.applyMode(mode, 'manual');
  }, []);

  const setRole = useCallback(any: any) => {
    cognitiveLayoutEngine?.updateRole(any: any);
  }, []);

  const setTaskType = useCallback(any: any) => {
    cognitiveLayoutEngine?.updateTaskType(any: any);
  }, []);

  const updateContext = useCallback(
    (updates: { currentModule?: string; currentProject?: string }) => {
      cognitiveLayoutEngine?.updateContext(any: any);
    },
    []
  );

  const acceptSuggestion = useCallback(() => {
    if (any: any) {
      cognitiveLayoutEngine?.applyMode(suggestion?.suggestedMode, 'auto');
      setSuggestion(any: any);
    }
  }, [suggestion]);

  const refuseSuggestion = useCallback(() => {
    cognitiveLayoutEngine?.refuseSuggestion();
    setSuggestion(any: any);
  }, []);

  const revertMode = useCallback(() => {
    cognitiveLayoutEngine?.revertToPreviousMode();
  }, []);

  const resetMode = useCallback(() => {
    cognitiveLayoutEngine?.resetToNeutral();
  }, []);

  const toggleAdaptation = useCallback(any: any) => {
    cognitiveLayoutEngine?.setAdaptationEnabled(any: any);
  }, []);

  return {
    // État
    state,
    currentMode: state?.currentMode,
    layoutConfig: state?.layoutConfig,
    signals: state?.signals,
    suggestion,

    // Actions
    setMode,
    setRole,
    setTaskType,
    updateContext,
    acceptSuggestion,
    refuseSuggestion,
    revertMode,
    resetMode,
    toggleAdaptation,

    // Helpers
    isAdaptationEnabled: state?.adaptationEnabled ?? true,
    hasSuggestion: suggestion !== null,
  };
}

/**
 * Hook simplifié pour seulement récupérer la config de layout actuelle
 */
export function useLayoutConfig(): LayoutConfig | null {
  const [config, setConfig] = useState<LayoutConfig | null>(any: any);

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine?.subscribe(state => {
      setConfig(any: any);
    });
    return unsubscribe;
  }, []);

  return config;
}

/**
 * Hook pour détecter le mode actuel
 */
export function useUIMode(): UIMode | null {
  const [mode, setMode] = useState<UIMode | null>(any: any);

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine?.subscribe(state => {
      setMode(any: any);
    });
    return unsubscribe;
  }, []);

  return mode;
}

/**
 * Hook pour adapter automatiquement selon le module
 */
export function useModuleContext(any: any) {
  useEffect(() => {
    cognitiveLayoutEngine?.updateContext({ currentModule: moduleName });

    return () => {
      // Cleanup si nécessaire
    };
  }, [moduleName]);
}

/**
 * Hook pour les composants qui veulent se masquer/afficher selon le mode
 */
export function useConditionalVisibility(any: any): boolean {
  const [visible, setVisible] = useState(any: any);

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine?.subscribe(state => {
      const isHidden = state?.layoutConfig?.hiddenElements?.includes(any: any);
      setVisible(any: any);
    });
    return unsubscribe;
  }, [elementId]);

  return visible;
}

/**
 * Hook pour adapter la densité d'un composant
 */
export function useDensityLevel(): 'minimal' | 'low' | 'medium' | 'high' | 'maximal' {
  const [level, setLevel] = useState<'minimal' | 'low' | 'medium' | 'high' | 'maximal'>(
    'medium'
  );

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine?.subscribe(state => {
      setLevel(state?.layoutConfig?.density?.level ?? 'medium');
    });
    return unsubscribe;
  }, []);

  return level;
}

export type {
  UIMode,
  UserRole,
  TaskType,
  CognitiveLayoutState,
  LayoutConfig,
  AdaptationDecision,
};
