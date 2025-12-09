/**
 * TITANE_INFINITY v∞.19.2.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// TITANE∞ v∞.19.2.3Ω - Hooks Central Export
// ═══════════════════════════════════════════════════════════════

// Legacy hooks
export { useTitaneCore } from './useTitaneCore';
export { useMemoryCore } from './useMemoryCore';
export { useLivingEngines } from './useLivingEngines';
export { useEngineSubscription } from './useEngineSubscription';
export { useAIChatStreaming } from './useAIChatStreaming';
export { useBatchCommands } from './useBatchCommands';
export { useFileOperations } from './useFileOperations';
export { useRAG } from './useRAG';
export type { LivingEnginesState } from './useLivingEngines';

// Singularity hooks
export { useSingularity, useSingularityMetrics as useSingularityMetricsLegacy, useSingularityField } from './useSingularity';

// v∞ - Enhanced Singularity Metrics
export { useSingularityMetrics, default as useSingularityMetricsDefault } from './useSingularityMetrics';
export type {
  SystemMetrics,
  EngineMetrics,
  HealthScore,
  Alert as MetricsAlert,
  SingularityMetricsState,
  UseSingularityMetricsOptions
} from './useSingularityMetrics';

// ═══════════════════════════════════════════════════════════════
// v15 - Chat IA Architecture (Composition + Isolation)
// ═══════════════════════════════════════════════════════════════

// Hook principal (composition)
export { useChat } from './useChat';

// Hooks spécialisés (isolation)
export { useChatCore } from './useChatCore';
export { useChatUI } from './useChatUI';
export { useChatStreaming } from './useChatStreaming';
export { useChatMemory } from './useChatMemory';
export { useProviderStatus } from './useProviderStatus';

// Types
export type { UseChatCoreOptions, UseChatCoreReturn } from './useChatCore';
export type { UseChatUIOptions, UseChatUIReturn } from './useChatUI';
export type { UseChatStreamingOptions, UseChatStreamingReturn } from './useChatStreaming';
export type { UseChatMemoryOptions, UseChatMemoryReturn } from './useChatMemory';
export type { UseProviderStatusOptions, UseProviderStatusReturn } from './useProviderStatus';

// ═══════════════════════════════════════════════════════════════
// v15 - Refactored Hooks (TauriClient integration)
// ═══════════════════════════════════════════════════════════════

// Connection & Providers
export { useConnection } from './useConnection';
export type { ConnectionStatus } from './useConnection';

// System Vitals
export { useVitals } from './useVitals';
export type { SystemVitals, VitalsState } from './useVitals';

// Engine Vitals (NOUVEAU v15)
export { useEngineVitals } from './useEngineVitals';
export type { EngineVitals, UseEngineVitalsOptions, UseEngineVitalsReturn } from './useEngineVitals';

// System Monitor (NOUVEAU v15 - Combine vitals + engines)
export { useSystemMonitor } from './useSystemMonitor';
export type { UseSystemMonitorOptions, UseSystemMonitorReturn } from './useSystemMonitor';

// Performance Monitor (NOUVEAU v15 - FPS tracking)
export { usePerformanceMonitor } from './usePerformanceMonitor';
export type { PerformanceMetrics, UsePerformanceMonitorReturn } from './usePerformanceMonitor';

// Performance Profiler (v∞ - Advanced profiling)
export {
  usePerformanceProfiler,
  useComponentLifecycle,
  useTrackedEffect,
  useTrackedCallback,
  default as usePerformanceProfilerDefault
} from './usePerformanceProfiler';
export type { UsePerformanceProfilerOptions, UsePerformanceProfilerReturn } from './usePerformanceProfiler';

// Animation Context hook (re-export from contexts)
export { useAnimation } from '../contexts/AnimationContext';

// Voice Activity Detection (VAD) v∞
export { useVAD } from './useVAD';
export type { VADState, VADConfig, VADTestResult, UseVADReturn } from './useVAD';

// Engine State
export { useEngineState } from './useEngineState';
export type { EngineStateHook } from './useEngineState';
export type {
  SingularityState,
  PhysicalLayer as PhysicalState,
  CognitiveLayer as CognitiveStateLayer,
  SymbolicLayer as SymbolicState,
  AdaptiveLayer as AdaptiveState,
  MetaLayer as MetaState,
} from '@/types/singularityState';

// ═══════════════════════════════════════════════════════════════
// v19.3 - Audio & Voice Unified Hooks
// ═══════════════════════════════════════════════════════════════

// Voice Engine (100% Tauri backend - Central hook)
export { useVoiceEngine, default as useVoiceEngineDefault } from './useVoiceEngine';
export type {
  VoiceEngineState,
  VoiceEngineStatus,
  UseVoiceEngineOptions,
  UseVoiceEngineReturn
} from './useVoiceEngine';

// Audio Settings & Diagnostics
export { useAudioSettings, default as useAudioSettingsDefault } from './useAudioSettings';
export type {
  AudioDiagnosticStep,
  AudioHealthSummary,
  UseAudioSettingsReturn
} from './useAudioSettings';

// ═══════════════════════════════════════════════════════════════
// v∞.2 - Device Permissions & Self-Healing (OPUS DEVICE-SHE)
// ═══════════════════════════════════════════════════════════════

// Device Permissions Engine
export { useDevicePermissions, default as useDevicePermissionsDefault } from './useDevicePermissions';
export type {
  PermissionStatus,
  DeviceType,
  DevicePermission,
  DevicePermissionsState,
  DevicePermissionsResult
} from './useDevicePermissions';

// Device Health & Self-Healing
export { useDeviceHealth, default as useDeviceHealthDefault } from './useDeviceHealth';
export type {
  UseDeviceHealthReturn,
  UseDeviceHealthOptions
} from './useDeviceHealth';

// Legacy voice hooks (DEPRECATED - use useVoiceEngine instead)
// export { useVoice } from './useVoice';
// export { useVoiceMode } from './useVoiceMode';

// ═══════════════════════════════════════════════════════════════
// v19.3 - Cognitive Layout Engine (Adaptive UI/UX)
// ═══════════════════════════════════════════════════════════════

// Cognitive Layout & Adaptive Experience
export {
  useCognitiveLayout,
  useLayoutConfig,
  useUIMode,
  useModuleContext,
  useConditionalVisibility,
  useDensityLevel
} from './useCognitiveLayout';

export type {
  UIMode,
  UserRole,
  TaskType,
  CognitiveLayoutState,
  LayoutConfig,
  AdaptationDecision
} from './useCognitiveLayout';

// ═══════════════════════════════════════════════════════════════
// v27.0 - Unified Presence Engine (Experiential Identity)
// ═══════════════════════════════════════════════════════════════

// Unified Presence & Experiential Identity (Super Prompt #3)
export {
  useUnifiedPresence,
  useNarrativeArc,
  useVisualPresence,
  useCognitivePresence,
  useEmotionalPresence,
  useSymbolicPresence,
  useUserContextPresence,
  useTonicProfile,
  useTitaneIdentity
} from './useUnifiedPresence';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
/*
export type {
  PresenceState as UnifiedPresenceState,
  TonicProfile,
  UserContext,
  IdentityMatrix
} from '../engines/presence/unifiedPresenceEngine';

export type {
  NarrativeArc,
  SymbolicElement,
  TransitionProtocol
} from '../engines/presence/narrativeProtocol';
*/

// ═══════════════════════════════════════════════════════════════
// v28.0 - Multimodal Presence Engine (Super Prompt XXVIII)
// ═══════════════════════════════════════════════════════════════

// Multimodal Presence Engine - Synchronisation Voix + Halo + Avatar + Respiration
export {
  useMultimodalPresence,
  useBreathingCycle,
  useHaloExpression,
  useAvatarMimics,
  useInnerState,
  usePresenceEnergy,
  useUserMirroring,
  useExpressiveActions
} from './useMultimodalPresence';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
/*
export type {
  PresenceMode as MultimodalPresenceMode,
  BreathingCycle,
  HaloColorExpression,
  AvatarMicroMimics,
  ExpressiveIntention,
  MultimodalPresenceState,
  MultimodalPresenceConfig
} from '../engines/presence/multimodalPresenceEngine';
*/

// ═══════════════════════════════════════════════════════════════
// v29-32 - Deep Psyche Engines (Super Prompts XXIX-XXXII)
// ═══════════════════════════════════════════════════════════════

// Deep Psyche Hooks - Archetype Resonance + Meta-Continuum + Embodied Presence + Neural Voice
export {
  // Archetype Resonance
  useArchetypeResonance,
  useArchetypeScores,
  useDominantArchetype,

  // Meta-Continuum
  useMetaContinuum,
  useGlobalCoherence as useMetaGlobalCoherence,
  useTemporalAnchors,
  useFutureProjection,

  // Embodied Presence
  useEmbodiedPresence,
  useBreathState,
  usePostureState,
  useEnergyField,

  // Neural Voice Blending
  useNeuralVoiceBlend,
  useVoiceIdentity,
  useCognitiveTone,
  useVoiceBlendRatio,

  // Unified Hook
  useDeepPsyche
} from './useDeepPsyche';

export type {
  ArchetypeType,
  ArchetypeResonance,
  ArchetypeProfile
} from '../engines/psyche/archetypeResonanceEngine';

export type {
  MetaContinuumState,
  TemporalAnchor
} from '../engines/continuum/metaContinuumEngine';

export type {
  EmbodiedPresenceState,
  BreathCycle,
  PostureType,
  EnergyField
} from '../engines/embodiment/embodiedPresenceEngine';

export type {
  VoiceIdentityProfile,
  CognitiveTone,
  VoiceBlendRatio
} from '../engines/voice/neuralVoiceBlendingEngine';

// ═══════════════════════════════════════════════════════════════
// v31-33 - Expression Engines (Super Prompts XXXI-XXXIII + Aura)
// ═══════════════════════════════════════════════════════════════

// Expression Hooks - Synesthetic Emotion + Unified Output + Aura
export {
  // Synesthetic Emotion
  useSynestheticEmotion,
  useSynestheticProfile,
  useEmotionalColor,
  useEmotionalVoice,
  useNarrativeTexture,

  // Unified Output
  useUnifiedOutput,
  useCoherenceMetrics,
  useLastOutput,

  // Aura Engine
  useAura,
  useAuraLayers,
  useAffectiveVisual,
  useAuraColor,

  // Unified Expression
  useExpression
} from './useExpression';

// ✨ PHASE 4.2 - Temporairement commenté pour lazy loading (réduire bundle)
/*
export type {
  EmotionalState,
  SynestheticProfile,
  SynestheticEmotionState
} from '../engines/emotion/synestheticEmotionEngine';

export type {
  UnifiedMultimodalOutput,
  UnifiedOutputState,
  VoiceFrame,
  TextFrame,
  HaloFrame,
  AvatarFrame,
  AuraFrame
} from '../engines/output/unifiedMultimodalOutputEngine';

export type {
  AuraState,
  AffectiveVisualProfile,
  AuraAnimationPattern
} from '../engines/aura/auraEngine';
*/

// ═══════════════════════════════════════════════════════════════
// v∞.12 - Presence OS
// ═══════════════════════════════════════════════════════════════

export {
  usePresenceOS,
  usePresenceMode,
  useCognitiveState,
  useAffectiveState,
  useExpressiveState,
  useSpatialPosition,
  usePresenceCoherence,
  usePresenceModeControl
} from './usePresenceOS';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
/*
export type {
  PresenceState as PresenceOSState,
  PresenceMode as PresenceOSMode,
  CognitiveState as PresenceOSCognitiveState,
  AffectiveState,
  ExpressiveState,
  SpatialPosition,
  ReasoningStyle,
  AutonomicReaction
} from '../engines/presence/presenceOS';
*/

// ═══════════════════════════════════════════════════════════════
// v∞.13 - Physiological State (Interoception + Holophonic)
// ═══════════════════════════════════════════════════════════════

export {
  useInteroception,
  useInternalEnergy,
  useCognitiveLoad as useInteroceptionCognitiveLoad,
  useMentalClarity,
  useBreathingPhase,
  useHomeostasis,
  useHolophonic,
  useSpatialPosition as useHolophonicPosition,
  useCognitiveSounds,
  usePhysiologicalState
} from './usePhysiological';

export type {
  InteroceptionState,
  InteroceptionContext,
  InteroceptionExport
} from '../engines/interoception/interoceptionEngine';

export type {
  TitanSpatialState,
  SpatialPreset,
  CognitiveSound,
  SpatialOptions
} from '../engines/spatial/holophonicEngine';

// ═══════════════════════════════════════════════════════════════
// v∞.35 - Cognitive Dynamics (Predictive + Conscious + Narrative)
// ═══════════════════════════════════════════════════════════════

export {
  usePredictive,
  usePredictedIntent,
  usePredictedEmotion,
  usePredictedNeed,
  useRecommendedAdjustments,
  useTitaneSelfPrediction,
  useConsciousDynamics,
  useConsciousFocus,
  useConsciousClarity,
  useConsciousNoise,
  useConsciousDepth,
  useConsciousStability,
  useConsciousMode,
  useConsciousRepair,
  useInternalNarrative,
  useInnerMonologue,
  useNarrativeAnchor,
  useNarrativeCoherence,
  useNarrativeCuriosity,
  useActiveThought,
  useCognitiveDynamicsState
} from './useCognitive';

// REMOVED: engines/predictive supprimé en PHASE 1 (OPTION B)
// Types commentés car non disponibles après suppression
/*
export type {
  PredictiveFrame,
  PredictedNeed,
  PredictedIntent,
  PredictedEmotion,
  ConversationDirection,
  TitaneSelfPrediction,
  RecommendedAdjustments
} from '../engines/predictive/predictiveReflectionEngine';
*/

export type {
  ConsciousState,
  ConsciousMode,
  TransitionState,
  ModeConfig,
  RepairState
} from '../engines/conscious/consciousDynamicsModel';

export type {
  InternalNarrativeState,
  IntentDirection,
  ThoughtType,
  InnerThought,
  NarrativeContext,
  NarrativeExport
} from '../engines/narrative/internalNarrativeEngine';


// ═══════════════════════════════════════════════════════════════
// v∞.36 - Unified Identity Kernel (Phase 1)
// ═══════════════════════════════════════════════════════════════

// Hooks
export {
  useIdentityKernel,
  useIdentitySignature,
  useIdentityTone,
  useIdentityEnergy,
  useIdentityWarmth,
  useIdentityClarity,
  useNarrativeStyle,
  useCognitivePosture,
  useCognitiveProfile,
  useCognitiveSpeed,
  useCognitiveDepth,
  useCognitivePrecision,
  useEmotiveResonance,
  useEmotiveIntensity,
  useVocalWarmth,
  useHaloReactivity,
  useAttentionState,
  useAttentionFocus,
  useCognitiveLoad,
  useAttentionPriorities,
  useAdaptiveState,
  useContextSensitivity,
  useUserAlignment,
  useGlobalCoherence,
  useIdentityStability,
  useIdentityExpression,
  useIdentityActions
} from './useIdentity';

// Types
export type {
  IdentityKernelState,
  IdentitySignature,
  CognitiveProfile,
  EmotiveResonance,
  AttentionState,
  AdaptiveIdentityState,
  IdentityExpressionPackage,
  ContextFrame,
  NarrativeStyle,
  CognitivePosture,
  CoreValue,
  IdentityMemoryRoot,
  EvolutionSnapshot,
  StylePattern,
  IdentityTrajectory
} from '../engines/identity/unifiedIdentityKernel';


// ═══════════════════════════════════════════════════════════════
// v∞.37 - Expression Engine + HoloPresence Engine (Phase 2)
// ═══════════════════════════════════════════════════════════════

// Expression Orchestration Hooks
// ✨ PHASE 4.2 - Temporairement commenté pour lazy loading (réduire bundle)
/*
export {
  useExpressionEngineOrchestration,
  useUnifiedExpression,
  useOrchestratedVoice,
  useVoiceProsody,
  useVoiceTimbre,
  useVoiceMicroDynamics,
  useOrchestratedHalo,
  useHaloPattern,
  useHaloColorsOrchestrated,
  useHaloDynamics,
  useHaloSpatial,
  useOrchestratedNarrative,
  useNarrativeStyleOrchestrated,
  useNarrativeStructure,
  useNarrativeEmphasis,
  useExpressionSync,
  useExpressionSyncDetails,
  useExpressionActions
} from './useExpressionOrchestration';
*/

// HoloPresence Hooks
export {
  useHoloPresence,
  useHoloVisuals,
  useHoloShape,
  useHoloColorsVisuals,
  useHoloRotation,
  useHoloSize,
  useHoloOpacity,
  useHoloGlow,
  useAuraParticles,
  useParticleCount,
  useParticleBehavior,
  useHoloAnimation,
  useHoloBreathe,
  useHoloPulse,
  useHoloFlow,
  useHoloIntensity,
  useHoloEnergyLevel,
  useHoloFocusPoint,
  useHoloVisible,
  useHoloPresenceActions
} from './useHoloPresence';

// Types
// ✨ PHASE 4.2 - Temporairement commenté pour lazy loading
/*
export type {
  ExpressionEngineState,
  UnifiedExpression,
  OrchestratedVoice,
  OrchestratedHalo,
  OrchestratedNarrative
} from '../engines/expression/expressionEngine';
*/

export type {
  HoloPresenceState,
  HoloVisuals,
  AuraParticles,
  HoloAnimation,
  HoloEvent,
  HoloShape
} from '../engines/holopresence/holoPresenceEngine';

// ═══════════════════════════════════════════════════════════════
// v∞.38 - Phase 3 Hooks (Autopoiesis + Meta-Singularity + Phase-Space)
// ═══════════════════════════════════════════════════════════════

// Autopoiesis Hooks
export {
  useAutopoiesis,
  useAutopoiesisLearning,
  useAutopoiesisPerformance,
  useEffectivePatterns,
  useEvolutionRules,
  useOptimizationStrategies,
  useAutopoiesisMetrics,
  useTotalObservations,
  usePatternsLearned,
  useAverageEffectiveness,
  useTrendDirection,
  useAutopoiesisActions
} from './useAutopoiesis';

// Meta-Singularity Hooks
export {
  useMetaSingularity,
  useMetaCoherence,
  // useGlobalCoherence already exported as useMetaGlobalCoherence in Identity section
  useActiveEmergences,
  useRecentInsights,
  useUnresolvedConflicts,
  useOrchestrationQuality,
  useSystemStability,
  useEmergentComplexity,
  useCoherenceTrend,
  useHarmonics,
  useDissonance,
  useTotalEmergences,
  useTotalInsights,
  useAverageCoherence,
  useMetaSingularityActions
} from './useMetaSingularity';

// Phase-Space Hooks
export {
  usePhaseSpace,
  useCurrentPoint,
  usePhaseTrajectory,
  useAttractors,
  useCurrentAttractor,
  useLatestPrediction,
  useBifurcations,
  useRecentBifurcations,
  usePhaseSpaceStatistics,
  usePhaseSpaceMetrics,
  useCurrentVelocity,
  useDistanceToAttractor,
  useEntropyRate,
  usePredictabilityHorizon,
  useLyapunovExponent,
  useTotalPoints,
  usePhaseHistory,
  usePhaseSpaceActions
} from './usePhaseSpace';

// Types
export type {
  AutopoiesisState,
  EffectivePattern,
  EvolutionRule,
  OptimizationStrategy
} from '../engines/autopoiesis/autopoiesisEngine';

export type {
  MetaSingularityState,
  MetaCoherence,
  EmergentPhenomenon,
  EngineConflict,
  MetaInsight
} from '../engines/metasingularity/metaSingularityKernel';

export type {
  PhaseSpaceState,
  PhasePoint,
  PhaseTrajectory,
  Attractor,
  Bifurcation,
  StatePrediction
} from '../engines/phasespace/phaseSpaceEngine';


