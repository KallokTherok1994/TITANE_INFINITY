/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v1.0 — AI SERVICES INDEX
 *   Export centralisé - NOUVELLE ARCHITECTURE OPTION B
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// 🎯 NOUVELLE ARCHITECTURE v1.0 — CORE EXPORTS
// ─────────────────────────────────────────────────────────────────

// Re-export from new core structure
export * from '@/core/kernels';
export * from '@/core/services';

// ─────────────────────────────────────────────────────────────────
// 🔄 LEGACY EXPORTS (backward compatibility)
// ─────────────────────────────────────────────────────────────────
export * from './system';

// Kernels (kept in services/ai for backward compatibility)
export { cognitiveKernel } from './cognitiveKernel';
export { metaKernel } from './metaKernel';
export { singularityKernel } from './singularityKernel';

// Services (kept in services/ai for backward compatibility)
export { aiOrchestrator, askTitan, streamTitan, getAIStatus } from './orchestrator';
export {
  chatEngine,
  type ChatMode,
  type ChatEngineConfig,
  type ChatEngineResponse,
} from './chatEngine';
export { autoHealEngine } from './autoHealEngine';
export { metricsEngine } from './metricsEngine';

// Providers
export { geminiProvider } from './providers/gemini';
export { ollamaProvider } from './providers/ollama';
export { fallbackProvider } from './providers/fallback';

// Types
export type { AIMessage, AIResponse, AIProvider, AIConfig } from './types';
export { DEFAULT_AI_CONFIG } from './types';

// Modes & Memory
export { chatModes, type ChatModeConfig } from './chatModes';
export { memoryIntegration, type MemoryLoadConfig } from './memoryIntegration';
export type { MemoryContext } from './memoryIntegration';
export { inputValidator, InputValidator } from './inputValidator';
