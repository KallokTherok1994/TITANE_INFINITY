/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Tauri Service Index
 * Export centralisé du service Tauri
 * ═══════════════════════════════════════════════════════════════
 */

// Legacy API (v15.1)
export { tauri, metaMode, exp, memory, voice, system } from './commands';
export * from './types';
export * from './validation';

// New Backend API (v15.2)
export {
  backendV17,
  helios,
  memory as memoryV17,
  engine,
  system as systemV17,
  composite,
} from './backend-v17.2.commands';
export * from './backend-v17.2.types';

// Chat Engine Backend (v19.2Ω)
export {
  chatEngineCommands,
  generateResponse as chatEngineGenerateResponse,
  streamResponse as chatEngineStreamResponse,
  speakText as chatEngineSpeakText,
  saveMemory as chatEngineSaveMemory,
  loadMemory as chatEngineLoadMemory,
  resetMemory as chatEngineResetMemory,
  healthCheck as chatEngineHealthCheck,
  onStreamChunk as chatEngineOnStreamChunk,
  onStreamDone as chatEngineOnStreamDone,
} from './chatEngine.commands';
export type {
  ProviderPreference as ChatEngineProviderPreference,
  SpeechMode as ChatEngineSpeechMode,
  ChatRequestArgs as ChatEngineRequestArgs,
  ChatCompletionPayload as ChatEngineCompletion,
  StreamChunkPayload as ChatEngineStreamChunk,
  StreamHandle as ChatEngineStreamHandle,
  EngineHealthReport as ChatEngineHealthReport,
} from './chatEngine.commands';
