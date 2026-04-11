/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Unified Visual Store
 * Consolidation de visualStore + visualStateStore + visualStateStoreV21
 *
 * Architecture:
 * - unifiedVisualStore : store Zustand unique consolidé
 * - Re-exports de compatibilité dans chaque ancien fichier
 * - Pas de breaking change sur les imports existants
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// RE-EXPORTS : visualStore (v21 orchestrated store)
// Le visualStore est le store principal — on le réexporte tel quel.
// ─────────────────────────────────────────────────────────────────
export {
  useVisualStore,
  visualSelectors,
  useVisualState,
  useVisualMetrics,
  useVisualFPS,
  useVisualGPULoad,
  useVisualActions,
} from './visualStore';
export type { VisualEngineState, VisualStoreActions, VisualStore } from './visualStore';

// ─────────────────────────────────────────────────────────────────
// RE-EXPORTS : visualStateStore (v19 engine wrapper)
// ─────────────────────────────────────────────────────────────────
export { useVisualStateStore } from './visualStateStore';

// ─────────────────────────────────────────────────────────────────
// RE-EXPORTS : visualStateStoreV21 (multi-dimensional TitaneState)
// ─────────────────────────────────────────────────────────────────
export {
  useVisualStateStoreV21,
  useVisualEngine,
  useCurrentState,
  useCurrentConfig,
  useIsTransitioning,
  usePerformanceMetrics,
} from './visualStateStoreV21';

// ─────────────────────────────────────────────────────────────────
// CONVENIENCE HOOKS (surface unifiée pour les nouveaux consumers)
// ─────────────────────────────────────────────────────────────────

/**
 * Hook d'accès à l'état visuel courant via le store principal (v21 orchestrated).
 * Préférer ce hook pour les nouveaux composants.
 *
 * @example
 * const { currentState, isTransitioning, metrics } = useUnifiedVisual();
 */
export { useVisualStore as useUnifiedVisual } from './visualStore';
