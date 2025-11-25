/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// TITANE∞ v14 - Hooks Central Export
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
// v14 - Chat IA Architecture (Composition + Isolation)
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
// v14 - Refactored Hooks (TauriClient integration)
// ═══════════════════════════════════════════════════════════════

// Connection & Providers
export { useConnection } from './useConnection';
export type { ConnectionStatus } from './useConnection';

// System Vitals
export { useVitals } from './useVitals';
export type { SystemVitals, VitalsState } from './useVitals';

// Engine Vitals (NOUVEAU v14)
export { useEngineVitals } from './useEngineVitals';
export type { EngineVitals, UseEngineVitalsOptions, UseEngineVitalsReturn } from './useEngineVitals';

// System Monitor (NOUVEAU v14 - Combine vitals + engines)
export { useSystemMonitor } from './useSystemMonitor';
export type { UseSystemMonitorOptions, UseSystemMonitorReturn } from './useSystemMonitor';

// Engine State
export { useEngineState } from './useEngineState';
export type {
  EngineStateHook,
  SingularityState,
  PhysicalState,
  CognitiveState,
  SymbolicState,
  AdaptiveState,
  MetaState,
} from './useEngineState';
