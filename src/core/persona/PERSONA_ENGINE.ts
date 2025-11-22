/**
 * TITANE∞ — PERSONA ENGINE v24
 * 
 * Moteur central de personnalité UI
 * Intègre : Personality + Mood + Behavior + Memory
 * 
 * Le Persona Engine donne au système :
 * - Un caractère stable et reconnaissable
 * - Des réactions comportementales cohérentes
 * - Une mémoire adaptative
 * - Une présence identifiable
 */

import type { PersonaState, SystemState } from '../ARCHITECTURE_TYPES_v24-v∞';
import { personalityCoreManager } from './PERSONALITY_CORE';
import { moodEngine } from './MOOD_ENGINE';
import { behavioralLayerManager } from './BEHAVIORAL_LAYER';
import { personaMemoryManager } from './PERSONA_MEMORY';
import { personaBridge } from './PERSONA_BRIDGE';

export class PersonaEngine {
  private initialized: boolean = false;
  private updateInterval: number = 5000; // 5s
  private intervalId?: number;

  /**
   * Initialise le Persona Engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[PersonaEngine] Initialisation...');

    // Charge mémoire depuis storage
    personaMemoryManager.getMemory();

    // Démarre boucle de synchronisation
    this.startSyncLoop();

    this.initialized = true;
    console.log('[PersonaEngine] ✓ Initialisé');
  }

  /**
   * Démarre la boucle de synchronisation automatique
   */
  private startSyncLoop(): void {
    if (typeof window === 'undefined') return;

    this.intervalId = window.setInterval(() => {
      this.update();
    }, this.updateInterval);
  }

  /**
   * Met à jour le persona selon contexte système
   */
  update(systemState?: SystemState, metrics?: {
    cpu: number;
    memory: number;
    errors: number;
  }): void {
    // 1. Met à jour mood selon état système
    if (systemState) {
      moodEngine.updateFromSystemState(systemState);
    }

    // 2. Ajuste personality selon stress
    if (metrics) {
      const stress = (metrics.cpu * 0.4) + (metrics.memory * 0.3) + (metrics.errors * 0.3);
      personalityCoreManager.adaptToSystemStress(stress / 100);
    }

    // 3. Ajuste behavior selon contexte
    if (systemState && metrics) {
      const posture = behavioralLayerManager.determineOptimalPosture(
        systemState,
        metrics.errors,
        metrics.cpu / 100
      );
      behavioralLayerManager.getLayer().posture = posture;
    }

    // 4. Synchronise avec autres moteurs
    personaBridge.synchronize();
  }

  /**
   * Obtient l'état persona complet
   */
  getState(): PersonaState {
    return personaBridge.getPersonaState();
  }

  /**
   * Trigger une réaction comportementale
   */
  react(context: 'error' | 'success' | 'warning' | 'overload' | 'idle'): void {
    const reactionMap = {
      error: 'onError',
      success: 'onSuccess',
      warning: 'onWarning',
      overload: 'onOverload',
      idle: 'onIdle',
    } as const;

    behavioralLayerManager.triggerReaction(reactionMap[context]);
    
    // Synchronise immédiatement après réaction
    personaBridge.synchronize();
  }

  /**
   * Adapte le persona au rythme utilisateur
   */
  adaptToUserRhythm(speed: 'slow' | 'medium' | 'fast' | 'static'): void {
    personaMemoryManager.adaptToUserSpeed(speed);
    
    // Ajuste tempérament selon vitesse
    if (speed === 'fast') {
      personalityCoreManager.setTemperament('alert');
    } else if (speed === 'slow') {
      personalityCoreManager.setTemperament('serene');
    } else {
      personalityCoreManager.setTemperament('focused');
    }
  }

  /**
   * Obtient une description textuelle du persona actuel
   */
  getPersonaDescription(): string {
    const personality = personalityCoreManager.getPersonalityDescription();
    const mood = moodEngine.getMoodDescription();
    const behavior = behavioralLayerManager.getLayer().posture;

    return `${personality} | ${mood} | posture: ${behavior}`;
  }

  /**
   * Obtient les multiplicateurs visuels actuels
   */
  getVisualMultipliers(): {
    glow: number;
    motion: number;
    sound: number;
    depth: number;
  } {
    const personalityMult = personalityCoreManager.getVisualMultipliers();
    const moodMult = moodEngine.getComputedVisualEffect();
    const behaviorMult = behavioralLayerManager.getPostureVisualEffects();

    return {
      glow: personalityMult.glow * moodMult.glowMultiplier * behaviorMult.glowMultiplier,
      motion: personalityMult.motion * moodMult.motionMultiplier * behaviorMult.motionSpeed,
      sound: personalityMult.sound,
      depth: moodMult.depthMultiplier * behaviorMult.focusLevel,
    };
  }

  /**
   * Reset complet du persona
   */
  reset(): void {
    personalityCoreManager.reset();
    moodEngine.reset();
    behavioralLayerManager.reset();
    personaMemoryManager.reset();
    
    console.log('[PersonaEngine] Reset effectué');
  }

  /**
   * Arrête le moteur
   */
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Enregistre session
    personaMemoryManager.recordSession();
    
    this.initialized = false;
    console.log('[PersonaEngine] Arrêté');
  }
}

/**
 * Instance singleton globale
 */
export const personaEngine = new PersonaEngine();

/**
 * Auto-initialisation
 */
if (typeof window !== 'undefined') {
  personaEngine.initialize().catch(console.error);
}

/**
 * Export types pour utilisation externe
 */
export type { PersonaState } from '../ARCHITECTURE_TYPES_v24-v∞';
export { personalityCoreManager } from './PERSONALITY_CORE';
export { moodEngine } from './MOOD_ENGINE';
export { behavioralLayerManager } from './BEHAVIORAL_LAYER';
export { personaMemoryManager } from './PERSONA_MEMORY';
export { personaBridge } from './PERSONA_BRIDGE';
