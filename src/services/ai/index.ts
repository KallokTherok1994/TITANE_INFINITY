/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — AI SERVICES INDEX
 *   Export centralisé des services IA
 * ═══════════════════════════════════════════════════════════════════
 */

export { aiOrchestrator, askTitan, streamTitan, getAIStatus } from './orchestrator';
export { geminiProvider } from './providers/gemini';
export { ollamaProvider } from './providers/ollama';
export { fallbackProvider } from './providers/fallback';
export type { AIMessage, AIResponse, AIProvider, AIConfig } from './types';
export { DEFAULT_AI_CONFIG } from './types';
