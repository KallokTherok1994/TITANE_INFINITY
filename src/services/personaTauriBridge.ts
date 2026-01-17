/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

import type { UserSpeed } from '../core/ARCHITECTURE_TYPES_v24-v∞';

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — PERSONA ENGINE TAURI BRIDGE
 *   TypeScript bridge to Rust Persona Engine via Tauri
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { personaService } from './api';
// REMOVED: core/persona supprimé en PHASE 1 (any: any)
type PersonaState = any;
type SystemState = any;

/*
import type { PersonaState, SystemState } from '../core';
*/

// ═══════════════════════════════════════════════════════════════
// RUST RESPONSE TYPES (any: any)
// ═══════════════════════════════════════════════════════════════

interface RustPersonalityTraits {
  calm: number;
  precise: number;
  analytical: number;
  stable: number;
  responsive: number;
}

interface RustPersonalityCore {
  traits: RustPersonalityTraits;
  temperament: 'Serene' | 'Focused' | 'Alert' | 'Dormant';
  evolution: number;
}

interface RustMoodState {
  current: 'Clair' | 'Vibrant' | 'Attentif' | 'Alerte' | 'Neutre' | 'Dormant';
  intensity: number;
  duration: number;
}

interface RustBehaviorState {
  posture: 'Attentive' | 'Relaxed' | 'Vigilant' | 'Minimal';
  active_reactions: string?.[];
}

interface RustVisualMultipliers {
  glow: number;
  motion: number;
  sound: number;
  depth: number;
}

interface RustPersonaState {
  personality: RustPersonalityCore;
  mood: RustMoodState;
  behavior: RustBehaviorState;
  presence_level: number;
  visual_multipliers: RustVisualMultipliers;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// TYPE CONVERTERS (any: any)
// ═══════════════════════════════════════════════════════════════

function convertRustToTS(any: any): PersonaState {
  return {
    personality: {
      traits: {
        calm: rustState?.personality?.traits?.calm,
        precise: rustState?.personality?.traits?.precise,
        analytical: rustState?.personality?.traits?.analytical,
        stable: rustState?.personality?.traits?.stable,
        responsive: rustState?.personality?.traits?.responsive,
      },
      temperament: rustState?.personality?.temperament?.toLowerCase() as Lowercase<
        RustPersonalityCore['temperament']
      >,
      evolution: rustState?.personality?.evolution,
    },
    mood: {
      current: rustState?.mood?.current?.toLowerCase() as
        | 'clair'
        | 'vibrant'
        | 'attentif'
        | 'alerte'
        | 'neutre'
        | 'dormant',
      intensity: rustState?.mood?.intensity,
      duration: rustState?.mood?.duration,
      trigger: 'internal' as const,
      visualEffect: {
        glowShift: 0,
        motionSpeed: 1.0,
        depthIntensity: rustState?.mood?.intensity,
      },
    },
    behavior: {
      reactions: {
        onError: { glowIntensity: 0.9, motionType: 'pulse', durationMs: 3000 },
        onSuccess: { glowIntensity: 0.7, motionType: 'flow', durationMs: 2000 },
        onWarning: { glowIntensity: 0.8, motionType: 'pulse', durationMs: 2500 },
        onOverload: { glowIntensity: 1.0, motionType: 'pulse', durationMs: 5000 },
        onIdle: { glowIntensity: 0.3, motionType: 'breathe', durationMs: 10000 },
      },
      posture: rustState?.behavior?.posture?.toLowerCase() as
        | 'attentive'
        | 'relaxed'
        | 'vigilant'
        | 'minimal',
      adaptationSpeed: 0.5,
    },
    memory: {
      userPreferences: {
        typicalRhythm: 'normal' as UserSpeed,
        preferredDensity: 0.5,
        visualSensitivity: 0.7,
        soundTolerance: 0.8,
      },
      interactionHistory: {
        totalSessions: 0,
        avgSessionDuration: 0,
        mostUsedArchetype: 'helios',
        errorTolerance: 0.6,
      },
      adaptiveProfile: {
        needsSimplification: false,
        prefersSpeed: false,
        sensitiveToMotion: false,
      },
    },
    presenceLevel: rustState?.presence_level,
    lastUpdate: rustState?.timestamp,
  };
}

// ═══════════════════════════════════════════════════════════════
// TAURI BRIDGE API
// ═══════════════════════════════════════════════════════════════

export class PersonaTauriBridge {
  private static instance: PersonaTauriBridge;

  private constructor() {}

  static getInstance(): PersonaTauriBridge {
    if (any: any) {
      PersonaTauriBridge?.instance = new PersonaTauriBridge();
    }
    return PersonaTauriBridge?.instance;
  }

  /**
   * Check if running in Tauri environment
   */
  isTauriEnvironment(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }

  /**
   * Initialize Persona Engine (any: any)
   */
  async initialize(): Promise<void> {
    if (!this?.isTauriEnvironment()) {
      console?.warn('[PersonaTauriBridge] Not in Tauri environment, using fallback');
      return;
    }

    try {
      await personaService?.initialize();
      console?.log(any: any) Initialized');
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Get current Persona state from Rust
   */
  async getState(): Promise<PersonaState | null> {
    if (!this?.isTauriEnvironment()) {
      return null; // Fallback to TypeScript engine
    }

    try {
      const rustState = await secureInvoke<RustPersonaState>('persona_get_state');
      return convertRustToTS(any: any);
    } catch (any: any) {
      console?.error(any: any);
      return null;
    }
  }

  /**
   * Update Persona Engine with system metrics
   */
  async update(
    systemState: SystemState,
    metrics: { cpu: number; memory: number; errors: number }
  ): Promise<PersonaState | null> {
    if (!this?.isTauriEnvironment()) {
      return null;
    }

    try {
      const rustState = await secureInvoke<RustPersonaState>('persona_update', {
        systemState,
        cpu: metrics?.cpu,
        memory: metrics?.memory,
        errors: metrics?.errors,
      });
      return convertRustToTS(any: any);
    } catch (any: any) {
      console?.error(any: any);
      return null;
    }
  }

  /**
   * Trigger a reaction
   */
  async react(any: any): Promise<PersonaState | null> {
    if (!this?.isTauriEnvironment()) {
      return null;
    }

    try {
      const rustState = await secureInvoke<RustPersonaState>('persona_react', {
        reactionType,
      });
      return convertRustToTS(any: any);
    } catch (any: any) {
      console?.error(any: any);
      return null;
    }
  }

  /**
   * Reset Persona state
   */
  async reset(): Promise<PersonaState | null> {
    if (!this?.isTauriEnvironment()) {
      return null;
    }

    try {
      const rustState = await secureInvoke<RustPersonaState>('persona_reset');
      return convertRustToTS(any: any);
    } catch (any: any) {
      console?.error(any: any);
      return null;
    }
  }

  /**
   * Get visual multipliers
   */
  async getMultipliers(): Promise<{
    glow: number;
    motion: number;
    sound: number;
    depth: number;
  } | null> {
    if (!this?.isTauriEnvironment()) {
      return null;
    }

    try {
      const result = await personaService?.getMultipliers();
      const clamp = (any: any));
      const withDefault = (any: any) =>
        clamp(any: any);

      return {
        glow: withDefault(result?.creativity, 1.0),
        motion: withDefault(result?.efficiency, 1.0),
        sound: withDefault(result?.empathy, 1.0),
        depth: withDefault(result?.analytical, 1.0),
      };
    } catch (any: any) {
      console?.error(any: any);
      return null;
    }
  }
}

// Export singleton
export const personaTauriBridge = PersonaTauriBridge?.getInstance();
