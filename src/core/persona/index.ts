/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * TITANE∞ — PERSONA MODULE INDEX
 *
 * Export centralisé de tous les composants Persona Engine v24
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINES & MANAGERS
// ═══════════════════════════════════════════════════════════════════════════════

export { PersonaEngine, personaEngine } from './PERSONA_ENGINE';
export { PersonalityCoreManager, personalityCoreManager } from './PERSONALITY_CORE';
export { MoodEngine, moodEngine } from './MOOD_ENGINE';
export { BehavioralLayerManager, behavioralLayerManager } from './BEHAVIORAL_LAYER';
export { PersonaMemoryManager, personaMemoryManager } from './PERSONA_MEMORY';
export { PersonaBridge, personaBridge } from './PERSONA_BRIDGE';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 10 — NEW MODULES (TypeScript Pure Functions)
// ═══════════════════════════════════════════════════════════════════════════════

export { PersonaEngine as PersonaEngineClass } from './PersonaEngine';
export * from './PersonalityCore';
export * from './BehavioralLayer';
export * from './MoodEngine';
export * from './PersonaMemory';
export * from './PersonaBridge';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════

export { DEFAULT_PERSONALITY, TEMPERAMENTS } from './PERSONALITY_CORE';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export { getPersonalitySignature } from './PERSONALITY_CORE';
export { getCurrentMood, applyMoodToElement } from './MOOD_ENGINE';
export { triggerBehaviorReaction, getCurrentPosture } from './BEHAVIORAL_LAYER';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES (re-export depuis ARCHITECTURE_TYPES)
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  PersonaState,
  PersonalityCore,
  MoodState,
  MoodType,
  BehavioralLayer,
  BehaviorResponse,
  PersonaMemory,
} from '../ARCHITECTURE_TYPES_v24-v∞';
