/**
 * TITANE∞ v1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v1.0 — CORE SERVICES INDEX
 *   Export centralisé des 6 services essentiels
 *   
 *   NOTE: Fichiers dans core/services/ supprimés - réexports depuis
 *   services/ai/ pour éviter duplication
 * ═══════════════════════════════════════════════════════════════════
 */

// 1. ORCHESTRATOR CORE (depuis services/ai)
export { aiOrchestrator, askTitan, streamTitan, getAIStatus } from '../../services/ai/orchestrator';

// 2. CONVERSATION OS (OMEGA Pipeline) (depuis services/ai/chatEngine)
export { chatEngine } from '../../services/ai/chatEngine';
export type { 
  ChatMode,
  ChatEngineConfig, 
  ChatEngineResponse 
} from '../../services/ai/chatEngine';

// 3. UNIFIED MEMORY SYSTEM (STM/MTM/LTM) - NOUVEAU (core/services/unifiedMemory)
export { unifiedMemory } from './unifiedMemory';
export type {
  MemoryEntry,
  MemoryStats,
  RecallOptions
} from './unifiedMemory';

// 4. SYSTEM HEALTH CORE (Self-Healing) (depuis services/ai/autoHealEngine)
export { autoHealEngine } from '../../services/ai/autoHealEngine';
export type {
  AutoHealError,
  AutoHealAction,
  AutoHealStats,
  AutoHealConfig
} from '../../services/ai/autoHealEngine';

// 5. METRICS ENGINE (depuis services/ai)
export { metricsEngine } from '../../services/ai/metricsEngine';
export type {
  ProviderMetrics
} from '../../services/ai/metricsEngine';

// 6. PROVIDER LAYER (Re-export from services/ai/providers)
export { geminiProvider } from '../../services/ai/providers/gemini';
export { ollamaProvider } from '../../services/ai/providers/ollama';
export { fallbackProvider } from '../../services/ai/providers/fallback';
export type { AIMessage, AIResponse, AIProvider, AIConfig } from '../../services/ai/types';
