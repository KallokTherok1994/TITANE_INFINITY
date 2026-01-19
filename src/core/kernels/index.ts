/**
 * TITANE∞ v1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v1.0 — CORE KERNELS INDEX
 *   Export centralisé des 3 kernels cognitifs
 *
 *   NOTE: Fichiers dans core/kernels/ supprimés - réexports depuis
 *   services/ai/ pour éviter duplication
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// 🧠 v22Ω: Cognitive Kernel (depuis services/ai)
// ─────────────────────────────────────────────────────────────────
export { cognitiveKernel } from '../../services/ai/cognitiveKernel';
export type {
  CognitivePrinciples,
  EnvironmentState,
  IntentionState,
  EphemeralMemory,
  CognitiveProcess,
  CognitiveDecision,
} from '../../services/ai/cognitiveKernel';

// ─────────────────────────────────────────────────────────────────
// 🌌 v∞Ω: Meta-Kernel (Super-Conscience Système) (depuis services/ai)
// ─────────────────────────────────────────────────────────────────
export { metaKernel } from '../../services/ai/metaKernel';
export type {
  SystemMap,
  SystemNode,
  SystemEdge,
  SystemFlow,
  SystemLayer,
  SubKernelStates,
  TitanePrinciples,
  SystemObservation,
  FragilityZone,
  OrchestrationAction,
  SuperMemory,
  SuperConsciousnessReport,
} from '../../services/ai/metaKernel';

// ─────────────────────────────────────────────────────────────────
// 🜂 vΩ∞: Singularity Kernel (OS Cognitif Total)
// ─────────────────────────────────────────────────────────────────
// singularityKernel is now dynamically imported in App.tsx
// Types still available for TypeScript support
export type {
  HarmonyMatrix,
  FlowState,
  KernelState,
  SystemIntention,
  IntegrationField,
  SystemPerception,
  SystemInterpretation,
  SystemIntentionState,
  SystemExpression,
  SystemConsciousness,
  SingularityMemory,
  OperationalSingularity,
  SingularityReport,
} from '../../services/ai/singularityKernel';
