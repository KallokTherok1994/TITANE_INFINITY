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
export { useSelfHealingStore as useSelfHealingCoreStore } from './selfHealingStore';

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
