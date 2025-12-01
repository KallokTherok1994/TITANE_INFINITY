/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// TITANE∞ v15 - Hooks Central Export
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
export { useSingularity, useSingularityMetrics, useSingularityField } from './useSingularity';

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
  CognitiveLayer as CognitiveState,
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
