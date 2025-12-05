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
  const [state, setState] = useState<CognitiveLayoutState | null>(null);
  const [suggestion, setSuggestion] = useState<AdaptationDecision | null>(null);

  // Subscribe aux changements d'état
  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine.subscribe(setState);
    return unsubscribe;
  }, []);

  // Écouter suggestions d'adaptation
  useEffect(() => {
    const handleSuggestion = (event: Event) => {
      const customEvent = event as CustomEvent<AdaptationDecision>;
      setSuggestion(customEvent.detail);
    };

    window.addEventListener('cognitive-layout-suggestion', handleSuggestion);
    return () => window.removeEventListener('cognitive-layout-suggestion', handleSuggestion);
  }, []);

  // Actions
  const setMode = useCallback((mode: UIMode) => {
    cognitiveLayoutEngine.applyMode(mode, 'manual');
  }, []);

  const setRole = useCallback((role: UserRole) => {
    cognitiveLayoutEngine.updateRole(role);
  }, []);

  const setTaskType = useCallback((taskType: TaskType) => {
    cognitiveLayoutEngine.updateTaskType(taskType);
  }, []);

  const updateContext = useCallback((updates: { currentModule?: string; currentProject?: string }) => {
    cognitiveLayoutEngine.updateContext(updates);
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
      cognitiveLayoutEngine.applyMode(suggestion.suggestedMode, 'auto');
      setSuggestion(null);
    }
  }, [suggestion]);

  const refuseSuggestion = useCallback(() => {
    cognitiveLayoutEngine.refuseSuggestion();
    setSuggestion(null);
  }, []);

  const revertMode = useCallback(() => {
    cognitiveLayoutEngine.revertToPreviousMode();
  }, []);

  const resetMode = useCallback(() => {
    cognitiveLayoutEngine.resetToNeutral();
  }, []);

  const toggleAdaptation = useCallback((enabled: boolean) => {
    cognitiveLayoutEngine.setAdaptationEnabled(enabled);
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
  const [config, setConfig] = useState<LayoutConfig | null>(null);

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine.subscribe((state) => {
      setConfig(state.layoutConfig);
    });
    return unsubscribe;
  }, []);

  return config;
}

/**
 * Hook pour détecter le mode actuel
 */
export function useUIMode(): UIMode | null {
  const [mode, setMode] = useState<UIMode | null>(null);

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine.subscribe((state) => {
      setMode(state.currentMode);
    });
    return unsubscribe;
  }, []);

  return mode;
}

/**
 * Hook pour adapter automatiquement selon le module
 */
export function useModuleContext(moduleName: string) {
  useEffect(() => {
    cognitiveLayoutEngine.updateContext({ currentModule: moduleName });

    return () => {
      // Cleanup si nécessaire
    };
  }, [moduleName]);
}

/**
 * Hook pour les composants qui veulent se masquer/afficher selon le mode
 */
export function useConditionalVisibility(elementId: string): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine.subscribe((state) => {
      const isHidden = state.layoutConfig.hiddenElements?.includes(elementId);
      setVisible(!isHidden);
    });
    return unsubscribe;
  }, [elementId]);

  return visible;
}

/**
 * Hook pour adapter la densité d'un composant
 */
export function useDensityLevel(): 'minimal' | 'low' | 'medium' | 'high' | 'maximal' {
  const [level, setLevel] = useState<'minimal' | 'low' | 'medium' | 'high' | 'maximal'>('medium');

  useEffect(() => {
    const unsubscribe = cognitiveLayoutEngine.subscribe((state) => {
      setLevel(state.layoutConfig.density?.level ?? 'medium');
    });
    return unsubscribe;
  }, []);

  return level;
}

export type { UIMode, UserRole, TaskType, CognitiveLayoutState, LayoutConfig, AdaptationDecision };
