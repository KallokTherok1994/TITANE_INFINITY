/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — USE LIVING ENGINES HOOK (Tauri-Ready)
 *   Hook React pour synchroniser Persona Engine (Rust ou TypeScript)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import type { PersonaState } from '@/types/singularityState';
import type { MoodType } from '../core/ARCHITECTURE_TYPES_v24-v∞';

// REMOVED: core/persona supprimé en PHASE 1 (OPTION B)
// Stubs temporaires pour compatibilité
type SystemState = 'stable' | 'warning' | 'danger' | 'critical';

interface VisualMultipliers {
  glow: number;
  motion: number;
  depth: number;
  sound: number;
}

const personaEngine = {
  getState: (): PersonaState => ({
    name: 'TITANE',
    mood: 'neutre' as MoodType,
    intensity: 0.5,
    evolution_level: 1,
    last_interaction: Date.now(),
    personality: {},
    behavior: {},
  }),
  start: () => {},
  stop: () => {},
  initialize: async () => {},
  destroy: () => {},
  getVisualMultipliers: (): VisualMultipliers => ({
    glow: 1.0,
    motion: 1.0,
    depth: 1.0,
    sound: 1.0,
  }),
  update: (_state: Partial<PersonaState>, _options?: Record<string, unknown>) => {},
  react: (_reaction: string) => {},
};

/*
import {
  // Phase 10 - Persona
  personaEngine,
  
  // Types
  type SystemState,
  type PersonaState,
} from '../core';
*/

import { personaTauriBridge } from '../services/personaTauriBridge';

export interface LivingEnginesState {
  // System State
  systemState: SystemState;

  // Visual Multipliers (from persona)
  glow: number;
  motion: number;
  depth: number;
  sound: number;

  // Persona
  persona: PersonaState | null;
  presenceLevel: number;

  // Cognitive (simulated from persona)
  cognitiveLoad: number;
  rhythmScore: number;

  // Holography (simulated)
  holoActive: boolean;
  particleCount: number;

  // Ready State
  initialized: boolean;
}

/**
 * Hook pour synchroniser Persona Engine avec UI
 */
export const useLivingEngines = (updateInterval = 100) => {
  const [enginesState, setEnginesState] = useState<LivingEnginesState>({
    systemState: 'stable',
    glow: 1.0,
    motion: 1.0,
    depth: 0.5,
    sound: 0.5,
    persona: null,
    presenceLevel: 0.0,
    cognitiveLoad: 0.0,
    rhythmScore: 0.0,
    holoActive: false,
    particleCount: 0,
    initialized: false,
  });

  // Initialize Persona Engine (Tauri or TypeScript fallback)
  useEffect(() => {
    const init = async () => {
      try {
        // Try Tauri bridge first
        if (personaTauriBridge.isTauriEnvironment()) {
          await personaTauriBridge.initialize();
          console.log('🌟 TITANE∞ v24 - Persona Engine (Rust/Tauri) Initialized');
        } else {
          // Fallback to TypeScript engine
          await personaEngine.initialize();
          console.log('🌟 TITANE∞ v24 - Persona Engine (TypeScript) Initialized');
        }

        setEnginesState(prev => ({ ...prev, initialized: true }));
      } catch (error) {
        logger.error(
          'Error initializing Persona Engine',
          { component: 'PersonaEngine' },
          error as Error
        );
      }
    };

    init();

    // Cleanup
    return () => {
      if (!personaTauriBridge.isTauriEnvironment()) {
        personaEngine.destroy();
      }
    };
  }, []);

  // Update loop
  useEffect(() => {
    if (!enginesState.initialized) return;

    const interval = setInterval(async () => {
      try {
        let personaState: PersonaState | null = null;
        let visualMults = { glow: 1.0, motion: 1.0, depth: 0.5, sound: 0.5 };

        // Try Tauri bridge first
        if (personaTauriBridge.isTauriEnvironment()) {
          personaState = await personaTauriBridge.getState();
          const mults = await personaTauriBridge.getMultipliers();
          if (mults) visualMults = mults;
        } else {
          // Fallback to TypeScript engine
          personaState = personaEngine.getState();
          visualMults = personaEngine.getVisualMultipliers();
        }

        if (!personaState) return;

        // Simulate cognitive load from mood intensity
        const cogLoad = personaState.intensity || 0.5;

        // Simulate rhythm from presence (fallback to intensity)
        const presenceLevel =
          (personaState as unknown as { presenceLevel?: number }).presenceLevel ??
          personaState.intensity ??
          0.5;
        const rhythm = presenceLevel * 0.8 + 0.2;

        setEnginesState({
          systemState: 'stable',
          glow: visualMults.glow,
          motion: visualMults.motion,
          depth: visualMults.depth,
          sound: visualMults.sound,
          persona: personaState,
          presenceLevel: presenceLevel,
          cognitiveLoad: cogLoad,
          rhythmScore: rhythm,
          holoActive: true,
          particleCount: Math.floor(Math.random() * 1000 + 500),
          initialized: true,
        });
      } catch (error) {
        logger.error(
          'Error updating engines state',
          { component: 'LivingEngines' },
          error as Error
        );
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [enginesState.initialized, updateInterval]);

  // Actions
  const updateSystemState = useCallback(async (newState: SystemState) => {
    const partialUpdate: Partial<PersonaState> = { last_interaction: Date.now() };
    if (personaTauriBridge.isTauriEnvironment()) {
      await personaTauriBridge.update(partialUpdate, {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        errors: 0,
      });
    } else {
      personaEngine.update(partialUpdate, {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        errors: 0,
      });
    }
    setEnginesState(prev => ({ ...prev, systemState: newState }));
  }, []);

  const triggerPersonaReaction = useCallback(
    async (reaction: 'error' | 'success' | 'warning' | 'overload' | 'idle') => {
      if (personaTauriBridge.isTauriEnvironment()) {
        await personaTauriBridge.react(reaction);
      } else {
        personaEngine.react(reaction);
      }
    },
    []
  );

  const updateCognitiveLoad = useCallback(async (load: number) => {
    const state: SystemState = load > 0.8 ? 'danger' : load > 0.6 ? 'warning' : 'stable';
    const partialUpdate: Partial<PersonaState> = {
      intensity: load,
      last_interaction: Date.now(),
    };

    if (personaTauriBridge.isTauriEnvironment()) {
      await personaTauriBridge.update(partialUpdate, {
        cpu: load * 100,
        memory: 60,
        errors: 0,
      });
    } else {
      personaEngine.update(partialUpdate, {
        cpu: load * 100,
        memory: 60,
        errors: 0,
      });
    }
    setEnginesState(prev => ({ ...prev, systemState: state, cognitiveLoad: load }));
  }, []);

  return {
    state: enginesState,
    actions: {
      updateSystemState,
      triggerPersonaReaction,
      updateCognitiveLoad,
    },
  };
};
