/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — VOICE & EXPRESSION SHARED TYPES
 *   Break circular dependencies between expressionEngine and voiceProsodyEngine
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Configuration voix orchestrée
 */
export interface OrchestratedVoice {
  prosody: {
    rate: number; // 0.5-2.0 - Speech rate
    pitch: number; // 0.5-2.0 - Pitch multiplier
    volume: number; // 0-1 - Volume
    emphasis: number; // 0-1 - Emphasis strength
  };
  timbre: {
    warmth: number; // 0-1 - Vocal warmth
    breathiness: number; // 0-1 - Breathiness
    resonance: number; // 0-1 - Resonance depth
    clarity: number; // 0-1 - Articulation clarity
  };
  microDynamics: {
    intonationVariation: number; // 0-1 - Pitch variation
    rhythmicFlow: number; // 0-1 - Rhythm naturalness
    pausePlacement: number; // 0-1 - Strategic pauses
    emotionalColoring: number; // 0-1 - Emotional expressiveness
  };
  emotionalState: {
    valence: number; // -1 to 1 - Positive/negative
    activation: number; // 0-1 - Energy level
    dominance: number; // 0-1 - Confidence level
  };
}

export interface VoiceProsodyConfig {
  minRate: number;
  maxRate: number;
  minPitch: number;
  maxPitch: number;
  minVolume: number;
  maxVolume: number;
  smoothingFactor: number;
}
