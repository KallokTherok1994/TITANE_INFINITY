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

// 🔧 P1_BUILD_CHUNKS_FIX: Chat Engine Backend exports removed from static index
// Reason: chatEngine.commands.ts is dynamically imported by chatEngine.ts
// Strategy: Consumers should import directly from './chatEngine.commands' if needed,
//           or use dynamic imports to avoid static/dynamic conflict
// REMOVED:
// export { chatEngineCommands, ... } from './chatEngine.commands';
// export type { ProviderPreference, ... } from './chatEngine.commands';
