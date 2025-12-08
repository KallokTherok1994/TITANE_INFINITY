/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20Ω+ — AI SERVICES INDEX
 *   Export centralisé des services IA avec Health Monitoring
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// 🎯 SYSTÈME COMPLET v20Ω+ / v22Ω COGNITIVE KERNEL
// ─────────────────────────────────────────────────────────────────
export * from './system';

// 🧠 NOUVEAU v22Ω: Cognitive Kernel
export { cognitiveKernel } from './cognitiveKernel';
export type {
  CognitivePrinciples,
  EnvironmentState,
  IntentionState,
  EphemeralMemory,
  CognitiveProcess,
  CognitiveDecision,
} from './cognitiveKernel';

// 🌌 NOUVEAU v∞Ω: Meta-Kernel (Super-Conscience Système)
export { metaKernel } from './metaKernel';
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
} from './metaKernel';

// Legacy orchestrator (à migrer vers chatEngine)
export { aiOrchestrator, askTitan, streamTitan, getAIStatus } from './orchestrator';
export { geminiProvider } from './providers/gemini';
export { ollamaProvider } from './providers/ollama';
export { fallbackProvider } from './providers/fallback';
export type { AIMessage, AIResponse, AIProvider, AIConfig } from './types';
export { DEFAULT_AI_CONFIG } from './types';

// New unified ChatEngine architecture
export { chatEngine, type ChatMode, type ChatEngineConfig, type ChatEngineResponse } from './chatEngine';
export { chatModes, type ChatModeConfig } from './chatModes';
export { memoryIntegration, type MemoryLoadConfig } from './memoryIntegration';
export type { MemoryContext } from './memoryIntegration';
export { inputValidator, InputValidator } from './inputValidator';
