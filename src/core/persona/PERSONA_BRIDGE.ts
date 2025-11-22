/**
 * TITANE∞ — PERSONA BRIDGE v24
 * 
 * Pont de synchronisation entre Persona Engine et autres moteurs
 * Propage l'état persona vers Glow, Motion, Sound, etc.
 */

import type { PersonaState } from '../ARCHITECTURE_TYPES_v24-v∞';
import { personalityCoreManager } from './PERSONALITY_CORE';
import { moodEngine } from './MOOD_ENGINE';
import { behavioralLayerManager } from './BEHAVIORAL_LAYER';
import { personaMemoryManager } from './PERSONA_MEMORY';

export class PersonaBridge {
  /**
   * Synchronise tous les moteurs avec l'état persona
   */
  synchronize(): void {
    const personality = personalityCoreManager.getPersonality();
    const mood = moodEngine.getMoodState();
    const behavior = behavioralLayerManager.getLayer();
    
    // Obtient multiplicateurs visuels
    const personalityMult = personalityCoreManager.getVisualMultipliers();
    const moodMult = moodEngine.getComputedVisualEffect();
    const behaviorMult = behavioralLayerManager.getPostureVisualEffects();

    // Combine multiplicateurs (produit pondéré)
    const combinedMultipliers = {
      glow: personalityMult.glow * moodMult.glowMultiplier * behaviorMult.glowMultiplier,
      motion: personalityMult.motion * moodMult.motionMultiplier * behaviorMult.motionSpeed,
      sound: personalityMult.sound,
      depth: moodMult.depthMultiplier,
    };

    // Applique aux CSS variables globales
    this.applyToDOM(combinedMultipliers);
  }

  /**
   * Applique l'état persona au DOM (CSS variables)
   */
  private applyToDOM(multipliers: Record<string, number>): void {
    const root = document.documentElement;
    
    root.style.setProperty('--persona-glow', multipliers.glow.toFixed(3));
    root.style.setProperty('--persona-motion', multipliers.motion.toFixed(3));
    root.style.setProperty('--persona-sound', multipliers.sound.toFixed(3));
    root.style.setProperty('--persona-depth', multipliers.depth.toFixed(3));
  }

  /**
   * Obtient l'état persona complet
   */
  getPersonaState(): PersonaState {
    return {
      personality: personalityCoreManager.getPersonality(),
      mood: moodEngine.getMoodState(),
      behavior: behavioralLayerManager.getLayer(),
      memory: personaMemoryManager.getMemory(),
      presenceLevel: this.calculatePresenceLevel(),
      lastUpdate: Date.now(),
    };
  }

  /**
   * Calcule le niveau de présence (0-1)
   */
  private calculatePresenceLevel(): number {
    const mood = moodEngine.getMoodState();
    const personality = personalityCoreManager.getPersonality();
    
    // Présence = intensité mood * responsive personality
    return mood.intensity * personality.traits.responsive;
  }
}

export const personaBridge = new PersonaBridge();

// Auto-sync toutes les 5 secondes
if (typeof window !== 'undefined') {
  setInterval(() => {
    personaBridge.synchronize();
  }, 5000);
}
