/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — PERSONA ENGINE TAURI BRIDGE
 *   TypeScript bridge to Rust Persona Engine via Tauri
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import type { PersonaState, SystemState } from '../core';

// ═══════════════════════════════════════════════════════════════
// RUST RESPONSE TYPES (matching Rust structs)
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
  active_reactions: string[];
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
// TYPE CONVERTERS (Rust → TypeScript)
// ═══════════════════════════════════════════════════════════════

function convertRustToTS(rustState: RustPersonaState): PersonaState {
  return {
    personality: {
      traits: {
        calm: rustState.personality.traits.calm,
        precise: rustState.personality.traits.precise,
        analytical: rustState.personality.traits.analytical,
        stable: rustState.personality.traits.stable,
        responsive: rustState.personality.traits.responsive,
      },
      temperament: rustState.personality.temperament.toLowerCase() as any,
      evolution: rustState.personality.evolution,
    },
    mood: {
      current: rustState.mood.current.toLowerCase() as any,
      intensity: rustState.mood.intensity,
      duration: rustState.mood.duration,
      trigger: 'internal' as const,
      visualEffect: {
        glowShift: 0,
        motionSpeed: 1.0,
        depthIntensity: rustState.mood.intensity,
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
      posture: rustState.behavior.posture.toLowerCase() as any,
      adaptationSpeed: 0.5,
    },
    memory: {
      userPreferences: {
        typicalRhythm: 'normal' as any,
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
    presenceLevel: rustState.presence_level,
    lastUpdate: rustState.timestamp,
  };
}

// ═══════════════════════════════════════════════════════════════
// TAURI BRIDGE API
// ═══════════════════════════════════════════════════════════════

export class PersonaTauriBridge {
  private static instance: PersonaTauriBridge;

  private constructor() {}

  static getInstance(): PersonaTauriBridge {
    if (!PersonaTauriBridge.instance) {
      PersonaTauriBridge.instance = new PersonaTauriBridge();
    }
    return PersonaTauriBridge.instance;
  }

  /**
   * Check if running in Tauri environment
   */
  isTauriEnvironment(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }

  /**
   * Initialize Persona Engine (Rust backend)
   */
  async initialize(): Promise<void> {
    if (!this.isTauriEnvironment()) {
      console.warn('[PersonaTauriBridge] Not in Tauri environment, using fallback');
      return;
    }

    try {
      await invoke('persona_initialize');
      console.log('🌟 Persona Engine (Rust/Tauri) Initialized');
    } catch (error) {
      console.error('[PersonaTauriBridge] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get current Persona state from Rust
   */
  async getState(): Promise<PersonaState | null> {
    if (!this.isTauriEnvironment()) {
      return null; // Fallback to TypeScript engine
    }

    try {
      const rustState = await invoke<RustPersonaState>('persona_get_state');
      return convertRustToTS(rustState);
    } catch (error) {
      console.error('[PersonaTauriBridge] Failed to get state:', error);
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
    if (!this.isTauriEnvironment()) {
      return null;
    }

    try {
      const rustState = await invoke<RustPersonaState>('persona_update', {
        systemState,
        cpu: metrics.cpu,
        memory: metrics.memory,
        errors: metrics.errors,
      });
      return convertRustToTS(rustState);
    } catch (error) {
      console.error('[PersonaTauriBridge] Failed to update:', error);
      return null;
    }
  }

  /**
   * Trigger a reaction
   */
  async react(reactionType: string): Promise<PersonaState | null> {
    if (!this.isTauriEnvironment()) {
      return null;
    }

    try {
      const rustState = await invoke<RustPersonaState>('persona_react', {
        reactionType,
      });
      return convertRustToTS(rustState);
    } catch (error) {
      console.error('[PersonaTauriBridge] Failed to react:', error);
      return null;
    }
  }

  /**
   * Reset Persona state
   */
  async reset(): Promise<PersonaState | null> {
    if (!this.isTauriEnvironment()) {
      return null;
    }

    try {
      const rustState = await invoke<RustPersonaState>('persona_reset');
      return convertRustToTS(rustState);
    } catch (error) {
      console.error('[PersonaTauriBridge] Failed to reset:', error);
      return null;
    }
  }

  /**
   * Get visual multipliers
   */
  async getMultipliers(): Promise<{ glow: number; motion: number; sound: number; depth: number } | null> {
    if (!this.isTauriEnvironment()) {
      return null;
    }

    try {
      return await invoke('persona_get_multipliers');
    } catch (error) {
      console.error('[PersonaTauriBridge] Failed to get multipliers:', error);
      return null;
    }
  }
}

// Export singleton
export const personaTauriBridge = PersonaTauriBridge.getInstance();
