/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — AI SERVICES INDEX
 *   Export centralisé des services IA
 * ═══════════════════════════════════════════════════════════════════
 */

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
