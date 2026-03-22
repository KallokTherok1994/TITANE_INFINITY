/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Stores Index
 * Export centralisé de tous les stores Zustand
 * Super Prompts #1-8 - Unified Store Layer
 * v21: Visual Engine v21 Multi-dimensional State
 * ═══════════════════════════════════════════════════════════════
 */

// Core System Stores
export { useSystemStore } from './systemStore';
export { useMemoryStore } from './memoryStore';
export { useEvolutionStore } from './evolutionStore';
export { useUIStore, type Toast } from './uiStore';

// Visual Engine v19 (Legacy)
export { useVisualStateStore } from './visualStateStore';

// Visual Engine v21 (New Multi-dimensional)
export {
  useVisualStateStoreV21,
  useVisualEngine,
  useCurrentState,
  useCurrentConfig,
  useIsTransitioning,
  usePerformanceMetrics,
} from './visualStateStoreV21';

// Super Prompt #1 - Chat Modes
export { useChatModeStore } from './useChatModeStore';

// Super Prompt #2 - Automations + XP
export { useAutomationXPStore } from './useAutomationXPStore';

// Super Prompt #3 - Memory Engine
export {
  useMemoryEngineStore,
  selectMemories,
  selectContext,
  selectStats as selectMemoryStats,
} from './useMemoryEngineStore';

// Super Prompt #4 - TTS Engine
export {
  useTTSEngineStore,
  selectQueue,
  selectIsPlaying,
  selectIsSpeaking,
} from './useTTSEngineStore';

// Super Prompt #5 - Self-Healing Engine
export {
  useSelfHealingStore,
  selectIssues,
  selectHealthStatus,
  selectHealthByCategory,
} from './useSelfHealingStore';

// Super Prompt #8 - Performance Engine
export {
  usePerformanceStore,
  selectMetrics,
  selectSuggestions,
  selectIsMonitoring,
} from './usePerformanceStore';

// ═══════════════════════════════════════════════════════════════
// v21 STORES - Session 4.5 (Zustand Stores)
// ═══════════════════════════════════════════════════════════════

// Visual Store v21 (Global Visual Engine State)
export { useVisualStore, visualSelectors } from './visualStore';
export {
  useVisualState,
  useVisualMetrics,
  useVisualFPS,
  useVisualGPULoad,
  useVisualActions,
} from './visualStore';
export type { VisualEngineState, VisualStoreActions, VisualStore } from './visualStore';

// Panels Store v21 (Global Panels State Management)
export { usePanelsStore, panelsSelectors } from './panelsStore';
export { usePanel, useVisiblePanels, useFocusedPanel } from './panelsStore';
export type {
  PanelConfig,
  PanelId,
  PanelsState,
  PanelsStoreActions,
  PanelsStore,
} from './panelsStore';

// Effects Store v21 (Global Effects State Management)
export { useEffectsStore, effectsSelectors } from './effectsStore';
export {
  useActiveEffects,
  useEffectsMetrics,
  useEffectsPreferences,
  useEffectsStats,
  useIsEffectActive,
} from './effectsStore';
export type {
  EffectHistoryEntry,
  EffectsPreferences,
  EffectsState,
  EffectsStoreActions,
  EffectsStore,
} from './effectsStore';

// ═══════════════════════════════════════════════════════════════
// UTILITY STORES
// ═══════════════════════════════════════════════════════════════

// Request In-Flight Throttle Store
export { useRequestInFlightStore } from './useRequestInFlightStore';

// Vision & Affect Engine Store (Super Prompt #9)
export {
  useVisionStore,
  selectIsObservationActive,
  selectIsCameraActive,
  selectHasCameraPermission,
  selectEnergyLevel,
  selectTensionLevel,
  selectEngagementLevel,
  selectConfidence,
  selectAvailableCameras,
  selectPendingSuggestions,
} from './useVisionStore';

// ═══════════════════════════════════════════════════════════════
// STORE SELECTORS (optimized shallow-equality hooks)
// ═══════════════════════════════════════════════════════════════

// Evolution Store Selectors
export {
  useEvolutionState,
  useEvolutionLastReport,
  useEvolutionHealth,
  useEvolutionRunning,
  useEvolutionLoading,
  useEvolutionSnapshot,
  useEvolutionActions,
} from './evolutionStore.selectors';

// Memory Store Selectors
export {
  useMemoryState,
  useSnapshots,
  useLogs,
  useTimeline,
  useTelemetry,
  useMemoryLoading,
  useMemoryError,
  useMemoryLoadingState,
  useSnapshotsState,
  useLogsState,
  useTimelineState,
  useMemoryActions,
  useSnapshotActions,
  useLogActions,
  useTimelineActions,
  useHasSnapshots,
  useSnapshotCount,
  useHasLogs,
  useLogCount,
  useHasTimelineEvents,
  useTimelineEventCount,
  useIsMemoryLoaded,
  useHasMemoryError,
  useLatestSnapshot,
  useLatestLog,
  useLatestTimelineEvent,
} from './memoryStore.selectors';

// System Store Selectors
export {
  useHeliosState,
  useNexusState,
  useHarmoniaState,
  useSentinelState,
  useSystemHealth,
  useSystemLoading,
  useSystemError,
  useSystemLastUpdate,
  useHeliosSnapshot,
  useNexusSnapshot,
  useHarmoniaSnapshot,
  useSentinelSnapshot,
  useFetchHelios,
  useFetchNexus,
  useFetchHarmonia,
  useFetchSentinel,
  useFetchHealth,
  useFetchAllSystem,
  useResetSystem,
} from './systemStore.selectors';

// UI Store Selectors
export {
  useSidebarCollapsed,
  useSidebarWidth,
  useExpPanelOpen,
  useModalOpen,
  useModalContent,
  useToasts,
  useLoading,
  useSidebarState,
  useModalState,
  useLoadingState,
  useSidebarActions,
  useModalActions,
  useToastActions,
  useExpPanelActions,
  useHasToasts,
  useToastCount,
  useSidebarExpanded,
  useHasOverlay,
} from './uiStore.selectors';

// Vision Store Selectors
export {
  useVisionObservationActive,
  useEnableVision,
  useDisableVision,
} from './useVisionStore.selectors';
