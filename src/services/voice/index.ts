/**
 * TITANE∞ v27 — Voice Services Barrel Export
 * 
 * Central export point for voice services lazy loading.
 * Modules in this directory have conflicting type names, so we export instances only.
 */

// Main engine instances (singleton exports from each module)
export { emotionalAnalyzer, analyzeEmotionalIntent } from './emotionalAnalyzer';
export { antiEchoShield } from './antiEchoShield';
export { wakeWordEngine, detectWakeWord } from './wakeWordEngine';
export { wakeWordEngineV2 } from './wakeWordEngineV2';
export { fullDuplexOrchestrator } from './fullDuplexOrchestrator';
export { voiceRouter } from './voiceRouter';
export { unifiedVocalEngine } from './unifiedVocalEngine';
export { haloEngine } from './haloEngine';

// Re-export types that don't conflict
export type { WakeWordEvent, WakeWordConfig } from './wakeWordEngineV2';
export type { FullDuplexState, FullDuplexConfig } from './fullDuplexOrchestrator';
