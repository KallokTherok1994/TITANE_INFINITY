/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Unified Singularity Bridge
 * Consolidation de singularityBridge + singularityBridgeVInfinity
 *
 * Architecture:
 * - Re-exports de SingularityBridge (pont bidirectionnel v∞.Ω)
 * - Re-exports de SingularityBridgeVInfinity (pont v∞ 20 moteurs)
 * - Re-exports de toutes les interfaces et helpers
 * - Pas de breaking change sur les imports existants
 *
 * Consumers existants (singularityBridge.ts) :
 *   - src/services/singularityConnections.ts
 *   - src/services/ai/metaKernel.ts
 *   - src/services/ai/chatEngine.ts
 *   - src/main.tsx
 *   - src/hooks/useSingularityStore.ts
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// RE-EXPORTS : singularityBridge (pont bidirectionnel principal)
// ─────────────────────────────────────────────────────────────────
export {
  SingularityBridge,
  mergeFileKnowledge,
  useSingularityState,
} from './singularityBridge';

// ─────────────────────────────────────────────────────────────────
// RE-EXPORTS : singularityBridgeVInfinity (pont v∞ 20 moteurs)
// ─────────────────────────────────────────────────────────────────
export {
  SingularityBridgeVInfinity,

  // Interfaces d'état v∞
  type CognitiveStateV2,
  type MemoryStateV2,
  type TimelineStateV2,
  type MetaCognitiveState,
  type DeepSyncState,
  type WatchdogState,
  type AnalysisState,
  type DocumentEngineState,
  type WebSearchState,
  type EvolutionStateV30,
  type UIEngineState,
  type AudioState,
  type SystemVitalsState,
  type IntegrityState,
  type ConfigState,
  type ConnectionState,
  type SandboxState,
  type AIRouterState,
  type BackendState,
  type CoreStateVInfinity,
  type SingularityStateVInfinity,
  type DiffResult,
  type MetaCognitiveReport,
  type IntegrityCheckResult,
} from './singularityBridgeVInfinity';

// ─────────────────────────────────────────────────────────────────
// CONVENIENCE ALIASES
// ─────────────────────────────────────────────────────────────────

/**
 * Alias canonique pour le pont principal.
 * Préférer `SingularityBridge` pour les usages existants.
 */
export { SingularityBridge as UnifiedSingularityBridge } from './singularityBridge';

/**
 * Alias canonique pour le pont v∞.
 */
export { SingularityBridgeVInfinity as SingularityBridgeV } from './singularityBridgeVInfinity';
