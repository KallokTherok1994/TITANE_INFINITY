/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — PERSONA ENGINE
 *   Phase 10: Moteur unifié de personnalité système
 * ═══════════════════════════════════════════════════════════════
 */

import type { PersonaState, SystemState } from '../ARCHITECTURE_TYPES_v24-v∞';
import { createDefaultPersonalityCore, determineTemperament, evolvePersonality } from './PersonalityCore';
import { createDefaultBehavioralLayer, determinePosture } from './BehavioralLayer';
import { createDefaultMoodState, determineMood, calculateMoodIntensity, calculateVisualEffect, updateMoodState } from './MoodEngine';
import { createDefaultPersonaMemory, updateUserPreferences, getPersonaRecommendations } from './PersonaMemory';

/**
 * Configuration du Persona Engine
 */
export interface PersonaEngineConfig {
  updateInterval: number;
  enableAdaptation: boolean;
  enableMemory: boolean;
  adaptationSpeed: number;
}

/**
 * État interne du Persona Engine
 */
interface PersonaEngineState {
  persona: PersonaState;
  lastUpdate: number;
  sessionData: {
    startTime: number;
    clickCount: number;
    scrollCount: number;
    errorCount: number;
  };
}

/**
 * Classe Persona Engine - Moteur unifié
 */
export class PersonaEngine {
  private config: PersonaEngineConfig;
  private state: PersonaEngineState;
  private updateTimer: number | null = null;

  constructor(config: Partial<PersonaEngineConfig> = {}) {
    this.config = {
      updateInterval: 100,
      enableAdaptation: true,
      enableMemory: true,
      adaptationSpeed: 0.5,
      ...config,
    };

    this.state = {
      persona: this.createInitialPersonaState(),
      lastUpdate: Date.now(),
      sessionData: {
        startTime: Date.now(),
        clickCount: 0,
        scrollCount: 0,
        errorCount: 0,
      },
    };
  }

  /**
   * Créer l'état persona initial
   */
  private createInitialPersonaState(): PersonaState {
    return {
      personality: createDefaultPersonalityCore(),
      mood: createDefaultMoodState(),
      behavior: createDefaultBehavioralLayer(),
      memory: createDefaultPersonaMemory(),
      presenceLevel: 0.75,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Obtenir l'état persona actuel
   */
  public getState(): PersonaState {
    return { ...this.state.persona };
  }

  /**
   * Mettre à jour le persona basé sur l'état système
   */
  public update(systemState: SystemState, cognitiveLoad: number, errorRate: number): PersonaState {
    const now = Date.now();
    const deltaTime = now - this.state.lastUpdate;

    // Mettre à jour le tempérament
    const newTemperament = determineTemperament(cognitiveLoad, 1 - errorRate);

    // Mettre à jour le mood
    const newMoodType = determineMood(systemState, cognitiveLoad, errorRate);
    const newMoodIntensity = calculateMoodIntensity(newMoodType, cognitiveLoad);
    const newMood = updateMoodState(
      this.state.persona.mood,
      newMoodType,
      'internal',
      deltaTime
    );
    newMood.intensity = newMoodIntensity;
    newMood.visualEffect = calculateVisualEffect(newMoodType, newMoodIntensity);

    // Mettre à jour la posture comportementale
    const newPosture = determinePosture(systemState, cognitiveLoad);

    // Mettre à jour la personnalité (évolution)
    const newPersonality = this.config.enableAdaptation
      ? evolvePersonality(this.state.persona.personality, {
          successRate: 1 - errorRate,
          errorRate,
          userSpeed: cognitiveLoad,
        })
      : this.state.persona.personality;

    // Calculer le niveau de présence
    const presenceLevel = this.calculatePresenceLevel(systemState, cognitiveLoad);

    // Construire le nouvel état
    this.state.persona = {
      personality: {
        ...newPersonality,
        temperament: newTemperament,
      },
      mood: newMood,
      behavior: {
        ...this.state.persona.behavior,
        posture: newPosture,
      },
      memory: this.state.persona.memory,
      presenceLevel,
      lastUpdate: now,
    };

    this.state.lastUpdate = now;

    return this.getState();
  }

  /**
   * Calculer le niveau de présence (0-1)
   */
  private calculatePresenceLevel(systemState: SystemState, cognitiveLoad: number): number {
    const basePresence: Record<SystemState, number> = {
      stable: 0.75,
      processing: 0.85,
      warning: 0.90,
      danger: 1.0,
      null: 0.3,
      offline: 0.1,
    };

    const base = basePresence[systemState];
    const loadFactor = cognitiveLoad * 0.2;

    return Math.max(0, Math.min(1, base + loadFactor));
  }

  /**
   * Enregistrer une interaction utilisateur (pour la mémoire)
   */
  public recordInteraction(type: 'click' | 'scroll' | 'error'): void {
    if (!this.config.enableMemory) return;

    switch (type) {
      case 'click':
        this.state.sessionData.clickCount++;
        break;
      case 'scroll':
        this.state.sessionData.scrollCount++;
        break;
      case 'error':
        this.state.sessionData.errorCount++;
        break;
    }
  }

  /**
   * Finaliser la session et mettre à jour la mémoire
   */
  public endSession(): void {
    if (!this.config.enableMemory) return;

    const sessionDuration = Date.now() - this.state.sessionData.startTime;
    const totalInteractions = this.state.sessionData.clickCount + this.state.sessionData.scrollCount;

    const clickSpeed = totalInteractions > 0
      ? this.state.sessionData.clickCount / (sessionDuration / 1000)
      : 0;

    const scrollSpeed = totalInteractions > 0
      ? this.state.sessionData.scrollCount / (sessionDuration / 1000)
      : 0;

    this.state.persona.memory = updateUserPreferences(this.state.persona.memory, {
      duration: sessionDuration,
      clickSpeed: Math.min(1, clickSpeed / 2),
      scrollSpeed: Math.min(1, scrollSpeed / 5),
      errors: this.state.sessionData.errorCount,
    });

    // Reset session data
    this.state.sessionData = {
      startTime: Date.now(),
      clickCount: 0,
      scrollCount: 0,
      errorCount: 0,
    };
  }

  /**
   * Obtenir les recommandations basées sur la mémoire
   */
  public getRecommendations() {
    return getPersonaRecommendations(this.state.persona.memory);
  }

  /**
   * Démarrer le moteur (update loop automatique)
   */
  public start(): void {
    if (this.updateTimer !== null) return;

    // Note: Dans un vrai système, ceci serait géré par un hook React
    // ou un système d'événements
    console.log('[PersonaEngine] Started with interval:', this.config.updateInterval);
  }

  /**
   * Arrêter le moteur
   */
  public stop(): void {
    if (this.updateTimer !== null) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    console.log('[PersonaEngine] Stopped');
  }

  /**
   * Réinitialiser le persona à l'état par défaut
   */
  public reset(): void {
    this.state.persona = this.createInitialPersonaState();
    this.state.sessionData = {
      startTime: Date.now(),
      clickCount: 0,
      scrollCount: 0,
      errorCount: 0,
    };
    console.log('[PersonaEngine] Reset to initial state');
  }
}

/**
 * Instance singleton du Persona Engine (optionnel)
 */
let personaEngineInstance: PersonaEngine | null = null;

export function getPersonaEngine(config?: Partial<PersonaEngineConfig>): PersonaEngine {
  if (!personaEngineInstance) {
    personaEngineInstance = new PersonaEngine(config);
  }
  return personaEngineInstance;
}
