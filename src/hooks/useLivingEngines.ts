/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — USE LIVING ENGINES HOOK (Tauri-Ready)
 *   Hook React pour synchroniser Persona Engine (Rust ou TypeScript)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react';
import {
  // Phase 10 - Persona
  personaEngine,
  
  // Types
  type SystemState,
  type PersonaState,
} from '../core';
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
        console.error('❌ Error initializing Persona Engine:', error);
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
        const cogLoad = personaState.mood.intensity || 0.5;
        
        // Simulate rhythm from presence
        const rhythm = personaState.presenceLevel * 0.8 + 0.2;
        
        setEnginesState({
          systemState: 'stable',
          glow: visualMults.glow,
          motion: visualMults.motion,
          depth: visualMults.depth,
          sound: visualMults.sound,
          persona: personaState,
          presenceLevel: personaState.presenceLevel,
          cognitiveLoad: cogLoad,
          rhythmScore: rhythm,
          holoActive: true,
          particleCount: Math.floor(Math.random() * 1000 + 500),
          initialized: true,
        });
      } catch (error) {
        console.error('Error updating engines state:', error);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [enginesState.initialized, updateInterval]);

  // Actions
  const updateSystemState = useCallback(async (newState: SystemState) => {
    if (personaTauriBridge.isTauriEnvironment()) {
      await personaTauriBridge.update(newState, {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        errors: 0,
      });
    } else {
      personaEngine.update(newState, {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        errors: 0,
      });
    }
  }, []);

  const triggerPersonaReaction = useCallback(async (reaction: 'error' | 'success' | 'warning' | 'overload' | 'idle') => {
    if (personaTauriBridge.isTauriEnvironment()) {
      await personaTauriBridge.react(reaction);
    } else {
      personaEngine.react(reaction);
    }
  }, []);

  const updateCognitiveLoad = useCallback(async (load: number) => {
    // Update persona based on cognitive load
    const state: SystemState = load > 0.8 ? 'danger' : load > 0.6 ? 'warning' : 'stable';
    
    if (personaTauriBridge.isTauriEnvironment()) {
      await personaTauriBridge.update(state, {
        cpu: load * 100,
        memory: 60,
        errors: 0,
      });
    } else {
      personaEngine.update(state, {
        cpu: load * 100,
        memory: 60,
        errors: 0,
      });
    }
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

