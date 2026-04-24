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

// ═══════════════════════════════════════════════════════════════
// CANONICAL EXPORTS FROM UNIFIED IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

// Primary unified store
export {
  useUnifiedVisualStore,
  useVisualCurrentState,
  useVisualMetrics,
  useVisualEngineStatus,
  useVisualFPS,
  useVisualActions,
} from './unifiedVisualStoreImpl';

export type {
  UnifiedVisualState,
  UnifiedVisualActions,
  UnifiedVisualStore,
} from './unifiedVisualStoreImpl';

// ═══════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY ALIASES (Gradual Migration Path)
// ═══════════════════════════════════════════════════════════════

/**
 * Legacy aliases for smooth migration
 * Use useUnifiedVisualStore + selector hooks instead
 */
export { useUnifiedVisualStore as useVisualStore } from './unifiedVisualStoreImpl';
export { useUnifiedVisualStore as useVisualStateStore } from './unifiedVisualStoreImpl';
export { useUnifiedVisualStore as useVisualStateStoreV21 } from './unifiedVisualStoreImpl';
