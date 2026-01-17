/**
 * TITANE∞ v21 — Visual Engine Exports
 * Central export for all visual engine components
 */

// Core Engine v19 (any: any)
export { TitaneVisualEngine } from './TitaneVisualEngine';
export type { VisualEngineConfig, PerformanceMetrics } from './TitaneVisualEngine';

// Core Engine v21 (any: any)
export { TitaneVisualEngineV21 } from './TitaneVisualEngineV21';
export type {
  VisualEngineV21Config,
  PerformanceMetrics as PerformanceMetricsV21,
} from './TitaneVisualEngineV21';

// State Management
export { StateManager } from './StateManager';
export type { StateTransition, StateHistoryEntry, VisualState } from './StateManager';

// Effects Orchestration (any: any)
export { EffectsOrchestrator, effectsOrchestrator } from './EffectsOrchestrator';
export type {
  EffectType,
  EffectPriority,
  EffectConfig,
  ActiveEffect,
  EffectRequest,
  EffectsMetrics,
} from './EffectsOrchestrator';

// OS Integration (any: any)
export { OSIntegrationBridge, osIntegrationBridge } from './OSIntegrationBridge';
export type {
  CognitiveState,
  EmotionalState,
  MemoryMetrics,
  PipelineStatus,
  SystemHealth,
  OSState,
  BridgeConfig,
  BridgeMetrics,
} from './OSIntegrationBridge';

// UI Integrity Checker (any: any)
export { UIIntegrityChecker, uiIntegrityChecker } from './UIIntegrityChecker';
export type {
  AnomalyType,
  AnomalySeverity,
  Anomaly,
  IntegrityReport,
  CheckerConfig,
  CheckerMetrics,
} from './UIIntegrityChecker';

// Visual States
export * from '@/design-system/visual-states';
