/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Unified Visual Store Selectors
 * Selectors Zustand optimisés pour le store visuel unifié
 * ═══════════════════════════════════════════════════════════════
 */

import { useVisualStore, type VisualStore } from './visualStore';
import {
  useVisualEngine,
  useCurrentState,
  useCurrentConfig,
  useIsTransitioning,
  usePerformanceMetrics,
} from './visualStateStoreV21';

// ─────────────────────────────────────────────────────────────────
// SELECTORS — visualStore (état orchestré)
// ─────────────────────────────────────────────────────────────────

/** État visuel courant (VisualState string) */
export const useVisualCurrentState = () =>
  useVisualStore((s: VisualStore) => s.currentState);

/** Indicateur de transition en cours */
export const useVisualIsTransitioning = () =>
  useVisualStore((s: VisualStore) => s.isTransitioning);

/** Durée de transition (ms) */
export const useVisualTransitionDuration = () =>
  useVisualStore((s: VisualStore) => s.transitionDuration);

/** Moteur visuel en cours d'exécution */
export const useVisualIsRunning = () =>
  useVisualStore((s: VisualStore) => s.isRunning);

/** Moteur visuel initialisé */
export const useVisualIsInitialized = () =>
  useVisualStore((s: VisualStore) => s.isInitialized);

/** Moteur visuel en pause */
export const useVisualIsPaused = () =>
  useVisualStore((s: VisualStore) => s.isPaused);

/** Métriques de performance complètes */
export const useVisualMetricsSelector = () =>
  useVisualStore((s: VisualStore) => s.metrics);

/** FPS courant */
export const useVisualFPSSelector = () =>
  useVisualStore((s: VisualStore) => s.metrics.fps);

/** Charge GPU */
export const useVisualGPULoadSelector = () =>
  useVisualStore((s: VisualStore) => s.metrics.gpuLoad);

/** Throttle actif */
export const useVisualThrottleActive = () =>
  useVisualStore((s: VisualStore) => s.metrics.throttleActive ?? false);

/** État précédent */
export const useVisualPreviousState = () =>
  useVisualStore((s: VisualStore) => s.previousState);

/** Historique des états */
export const useVisualStateHistory = () =>
  useVisualStore((s: VisualStore) => s.stateHistory);

/** Configuration (orchestration + OS integration + FPS adaptatif + debug) */
export const useVisualConfig = () =>
  useVisualStore((s: VisualStore) => ({
    enableOrchestration: s.enableOrchestration,
    enableOSIntegration: s.enableOSIntegration,
    adaptiveFPS: s.adaptiveFPS,
    debug: s.debug,
  }));

/** Actions du store (stable — ne provoque pas de re-render) */
export const useVisualActionsSelector = () =>
  useVisualStore((s: VisualStore) => ({
    setState: s.setState,
    setStateImmediate: s.setStateImmediate,
    revertToPreviousState: s.revertToPreviousState,
    start: s.start,
    stop: s.stop,
    pause: s.pause,
    resume: s.resume,
    reset: s.reset,
    updateMetrics: s.updateMetrics,
    setOrchestration: s.setOrchestration,
    setOSIntegration: s.setOSIntegration,
    setAdaptiveFPS: s.setAdaptiveFPS,
    setDebug: s.setDebug,
  }));

// ─────────────────────────────────────────────────────────────────
// SELECTORS — visualStateStoreV21 (état multi-dimensionnel)
// On réutilise les hooks déjà exportés de visualStateStoreV21.ts
// pour éviter d'accéder à l'interface non-exportée.
// ─────────────────────────────────────────────────────────────────

/** Instance moteur visuel v21 */
export const useVisualEngineV21 = useVisualEngine;

/** État TitaneState courant (cognitive + emotional + systemLoad + context) */
export const useVisualTitaneState = useCurrentState;

/** Configuration visuelle courante */
export const useVisualCurrentConfig = useCurrentConfig;

/** Transition en cours (v21) */
export const useVisualIsTransitioningV21 = useIsTransitioning;

/** Métriques performance v21 */
export const useVisualPerformanceMetrics = usePerformanceMetrics;

/**
 * État cognitif courant (dérivé de useCurrentState)
 */
export function useVisualCognitiveState() {
  return useCurrentState().cognitive;
}

/**
 * Ton émotionnel courant (dérivé de useCurrentState)
 */
export function useVisualEmotionalTone() {
  return useCurrentState().emotional;
}

/**
 * Charge système courante 0-100 (dérivé de useCurrentState)
 */
export function useVisualSystemLoad() {
  return useCurrentState().systemLoad;
}

/**
 * FPS v21 (dérivé de usePerformanceMetrics)
 */
export function useVisualFPSV21() {
  return usePerformanceMetrics().fps;
}
