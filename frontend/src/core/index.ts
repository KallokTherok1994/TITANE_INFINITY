// ⚡ TITANE∞ v21-v24 — CORE ENGINES MASTER INDEX
// Export centralisé de tous les moteurs (Phase 6-10)

// ══════════════════════════════════════════════════════════════
// PHASE 6 — VISUAL ENGINES (v21)
// ══════════════════════════════════════════════════════════════

export * from './visual/DS_COLORS';
export * from './visual/DS_CONSTANTS';
export * from './visual/STATE_ENGINE';
export * from './visual/GLOW_ENGINE';
export * from './visual/MOTION_ENGINE';
export * from './visual/hooks';
export * from './visual/index';

// ══════════════════════════════════════════════════════════════
// PHASE 7 — SENSORIAL ENGINES (v22)
// ══════════════════════════════════════════════════════════════

export * from './sound/SOUND_ENGINE';
export * from './holography/HOLOMESH_ENGINE';
export * from './hyperdepth/HYPERDEPTH_ENGINE';
export * from './engines/ENGINE_BRIDGE';

// ══════════════════════════════════════════════════════════════
// PHASE 8 — ARCHETYPE & IDENTITY ENGINES (v22)
// ══════════════════════════════════════════════════════════════

export * from './archetypes/ARCHETYPES';
export * from './archetypes/ARCHETYPE_ENGINE';
export * from './archetypes/IDENTITY_ENGINE';
export * from './archetypes/ICONOGRAPHY_ENGINE';

// ══════════════════════════════════════════════════════════════
// PHASE 9 — COGNITIVE ENGINES (v23)
// ══════════════════════════════════════════════════════════════

export * from './cognitive/USER_RHYTHM_ANALYZER';
export * from './cognitive/ADAPTIVE_UI';
export * from './cognitive/COGNITIVE_ENGINE';
export * from './cognitive/INTERFACE_MIRROR';

// ══════════════════════════════════════════════════════════════
// INSTANCES SINGLETONS (READY TO USE)
// ══════════════════════════════════════════════════════════════

export { glowEngine } from './visual/GLOW_ENGINE';
export { motionEngine } from './visual/MOTION_ENGINE';
export { stateEngine } from './visual/STATE_ENGINE';
export { soundEngine } from './sound/SOUND_ENGINE';
export { holoMeshEngine } from './holography/HOLOMESH_ENGINE';
export { hyperDepthEngine } from './hyperdepth/HYPERDEPTH_ENGINE';
export { engineBridge } from './engines/ENGINE_BRIDGE';
export { archetypeEngine } from './archetypes/ARCHETYPE_ENGINE';
export { identityEngine } from './archetypes/IDENTITY_ENGINE';
export { iconographyEngine } from './archetypes/ICONOGRAPHY_ENGINE';
export { userRhythmAnalyzer } from './cognitive/USER_RHYTHM_ANALYZER';
export { adaptiveUI } from './cognitive/ADAPTIVE_UI';
export { cognitiveEngine } from './cognitive/COGNITIVE_ENGINE';
export { interfaceMirror } from './cognitive/INTERFACE_MIRROR';

// ══════════════════════════════════════════════════════════════
// PHASE 10 — PERSONA ENGINE (v24)
// ══════════════════════════════════════════════════════════════

export * from './persona';
export { personaEngine } from './persona/PERSONA_ENGINE';
export { personalityCoreManager } from './persona/PERSONALITY_CORE';
export { moodEngine } from './persona/MOOD_ENGINE';
export { behavioralLayerManager } from './persona/BEHAVIORAL_LAYER';
export { personaMemoryManager } from './persona/PERSONA_MEMORY';
export { personaBridge } from './persona/PERSONA_BRIDGE';

