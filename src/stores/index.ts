/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Stores Index
 * Export centralisé de tous les stores Zustand
 * Super Prompts #1-8 - Unified Store Layer
 * ═══════════════════════════════════════════════════════════════
 */

// Core System Stores
export { useSystemStore } from './systemStore';
export { useMemoryStore } from './memoryStore';
export { useEvolutionStore } from './evolutionStore';
export { useUIStore, type Toast } from './uiStore';
export { useSelfHealingStore as useSelfHealingCoreStore } from './selfHealingStore';

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

// Super Prompt #6 - Search & Tools Engine
export { useSearchToolsStore } from './useSearchToolsStore';

// Super Prompt #7 - Prompt Engine
export {
  usePromptEngineStore,
  selectPrompts,
  selectChains,
} from './usePromptEngineStore';

// Super Prompt #8 - Performance Engine
export {
  usePerformanceStore,
  selectMetrics,
  selectSuggestions,
  selectIsMonitoring,
} from './usePerformanceStore';
