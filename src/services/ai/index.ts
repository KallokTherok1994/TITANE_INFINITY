/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v17.3.0 — AI SERVICES INDEX
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
export { memoryIntegration, type MemoryContext, type MemoryLoadConfig } from './memoryIntegration';
export { inputValidator, InputValidator } from './inputValidator';
