/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.2 - Tauri Service Index
 * Export centralisé du service Tauri
 * ═══════════════════════════════════════════════════════════════
 */

// Legacy API (v17.1)
export { tauri, metaMode, exp, memory, voice, system } from './commands';
export * from './types';
export * from './validation';

// New Backend API (v17.2)
export { backendV17, helios, memory as memoryV17, engine, system as systemV17, composite } from './backend-v17.2.commands';
export * from './backend-v17.2.types';
