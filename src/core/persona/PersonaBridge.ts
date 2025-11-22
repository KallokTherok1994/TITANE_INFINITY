/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — PERSONA BRIDGE
 *   Phase 10: Pont d'intégration Persona → Glow/Motion/Sound
 * ═══════════════════════════════════════════════════════════════
 */

import type { PersonaState, MoodType } from '../ARCHITECTURE_TYPES_v24-v∞';

/**
 * Configuration Glow influencée par le Persona
 */
export interface PersonaGlowEffect {
  intensity: number;
  hueShift: number;
  speed: number;
  pulseIntensity: number;
}

/**
 * Configuration Motion influencée par le Persona
 */
export interface PersonaMotionEffect {
  amplitude: number;
  frequency: number;
  damping: number;
  flowSpeed: number;
}

/**
 * Configuration Sound influencée par le Persona (placeholder)
 */
export interface PersonaSoundEffect {
  volume: number;
  pitch: number;
  timbre: string;
}

/**
 * Mapper le mood vers un effet Glow
 */
export function personaToGlowEffect(persona: PersonaState): PersonaGlowEffect {
  const { mood } = persona;

  const moodToGlow: Record<MoodType, PersonaGlowEffect> = {
    clair: {
      intensity: 0.9,
      hueShift: 0.0,
      speed: 1.2,
      pulseIntensity: 0.3,
    },
    vibrant: {
      intensity: 1.0,
      hueShift: 15,
      speed: 1.5,
      pulseIntensity: 0.6,
    },
    attentif: {
      intensity: 0.85,
      hueShift: -10,
      speed: 1.0,
      pulseIntensity: 0.4,
    },
    alerte: {
      intensity: 1.0,
      hueShift: 30,
      speed: 1.8,
      pulseIntensity: 0.8,
    },
    neutre: {
      intensity: 0.75,
      hueShift: 0,
      speed: 1.0,
      pulseIntensity: 0.2,
    },
    dormant: {
      intensity: 0.4,
      hueShift: -20,
      speed: 0.6,
      pulseIntensity: 0.1,
    },
  };

  const baseEffect = moodToGlow[mood.current];

  // Ajuster selon l'intensité du mood
  return {
    intensity: baseEffect.intensity * mood.intensity,
    hueShift: baseEffect.hueShift * mood.intensity,
    speed: baseEffect.speed * (0.8 + mood.intensity * 0.4),
    pulseIntensity: baseEffect.pulseIntensity * mood.intensity,
  };
}

/**
 * Mapper le persona vers un effet Motion
 */
export function personaToMotionEffect(persona: PersonaState): PersonaMotionEffect {
  const { behavior, mood } = persona;

  const postureBase = {
    vigilant: { amplitude: 1.2, frequency: 1.5, damping: 0.6, flowSpeed: 1.3 },
    attentive: { amplitude: 1.0, frequency: 1.2, damping: 0.7, flowSpeed: 1.1 },
    relaxed: { amplitude: 0.8, frequency: 0.9, damping: 0.8, flowSpeed: 0.9 },
    minimal: { amplitude: 0.5, frequency: 0.6, damping: 0.9, flowSpeed: 0.7 },
  };

  const base = postureBase[behavior.posture];

  // Moduler selon le mood
  const moodFactor = mood.intensity * 0.3 + 0.7;

  return {
    amplitude: base.amplitude * moodFactor,
    frequency: base.frequency * moodFactor,
    damping: base.damping,
    flowSpeed: base.flowSpeed * moodFactor,
  };
}

/**
 * Mapper le persona vers un effet Sound (placeholder Phase 7)
 */
export function personaToSoundEffect(persona: PersonaState): PersonaSoundEffect {
  const { mood } = persona;

  return {
    volume: mood.intensity * 0.5,
    pitch: mood.current === 'vibrant' ? 1.2 : mood.current === 'dormant' ? 0.8 : 1.0,
    timbre: mood.current === 'alerte' ? 'sharp' : mood.current === 'neutre' ? 'soft' : 'warm',
  };
}

/**
 * Calculer un multiplicateur global basé sur le niveau de présence
 */
export function calculatePresenceMultiplier(persona: PersonaState): number {
  return persona.presenceLevel;
}

/**
 * Obtenir une description textuelle du persona actuel (pour UI/Debug)
 */
export function getPersonaDescription(persona: PersonaState): string {
  const { personality, mood, behavior } = persona;

  const traits = `Calm:${(personality.traits.calm * 100).toFixed(0)}% Precise:${(personality.traits.precise * 100).toFixed(0)}% Analytical:${(personality.traits.analytical * 100).toFixed(0)}%`;
  const state = `Mood:${mood.current} (${(mood.intensity * 100).toFixed(0)}%) | Posture:${behavior.posture} | Temperament:${personality.temperament}`;

  return `${state} | ${traits}`;
}

/**
 * Obtenir un résumé compact du persona (1 ligne)
 */
export function getPersonaSummary(persona: PersonaState): string {
  return `${persona.personality.temperament} · ${persona.mood.current} (${(persona.mood.intensity * 100).toFixed(0)}%) · ${persona.behavior.posture}`;
}
