/**
 * TITANE∞ v21 — Living UI System
 * Système UI vivant, auto-adaptatif, auto-cohérent
 *
 * Export centralisé de tous les composants du système UI organique
 */

// ═════════════════════════════════════════════════════════════════
// SEMANTIC GRAMMAR — Le langage visuel
// ═════════════════════════════════════════════════════════════════
export {
  VisualSemanticGrammar,
  EngineState,
  OmegaPipelineStage,
  MemoryState,
  PhenomenonType,
  type VisualPhenomenon,
  type PhenomenonConfig,
} from './semantic/VisualSemanticGrammar';

// ═════════════════════════════════════════════════════════════════
// VISUAL CONDUCTOR — L'orchestrateur événementiel
// ═════════════════════════════════════════════════════════════════
export {
  VisualConductor,
  type EngineEvent,
  type PipelineEvent,
  type MemoryEvent,
  type SystemEvent,
  type OSEvent,
  type VisualConductorConfig,
  type ConductorMetrics,
} from './orchestrators/VisualConductor';

// ═════════════════════════════════════════════════════════════════
// UI MODE SYSTEM — Modes adaptatifs
// ═════════════════════════════════════════════════════════════════
export {
  UIModeManager,
  UIMode,
  MODE_CONFIGS,
  type UIModeConfig,
  type PerformanceMetrics,
  type AutoModeState,
} from './modes/UIModeManager';

// ═════════════════════════════════════════════════════════════════
// UI LAYER HIERARCHY — Architecture en couches
// ═════════════════════════════════════════════════════════════════
export {
  UILayerManager,
  UILayer,
  PanelType,
  LAYER_CONFIGS,
  PANEL_HIERARCHIES,
  type LayerConfig,
  type PanelHierarchy,
  type PanelState,
} from './hierarchy/UILayerManager';

// ═════════════════════════════════════════════════════════════════
// VISUAL ENGINE V21 — Moteur principal
// ═════════════════════════════════════════════════════════════════
export {
  TitaneVisualEngineV21,
  type VisualEngineV21Config,
  type PerformanceMetrics as VisualEngineMetrics,
  type StateChangeCallback,
  type ConfigChangeCallback,
} from './TitaneVisualEngineV21';

// ═════════════════════════════════════════════════════════════════
// OS INTEGRATION BRIDGE
// ═════════════════════════════════════════════════════════════════
export {
  type CognitiveState,
  type EmotionalState,
  type MemoryMetrics,
  type PipelineStatus,
  type SystemHealth,
  type OSState,
  type BridgeConfig,
  type BridgeMetrics,
} from './OSIntegrationBridge';
