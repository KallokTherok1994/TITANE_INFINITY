/**
 * TITANE∞ — PERSONA MEMORY v24
 * 
 * Mémoire adaptative légère du système
 * Stocke préférences implicites et patterns utilisateur
 */

import type { PersonaMemory, UserSpeed, ArchetypeType } from '../ARCHITECTURE_TYPES_v24-v∞';

const DEFAULT_MEMORY: PersonaMemory = {
  userPreferences: {
    typicalRhythm: 'medium',
    preferredDensity: 0.7,
    visualSensitivity: 0.5,
    soundTolerance: 0.7,
  },
  interactionHistory: {
    totalSessions: 0,
    avgSessionDuration: 0,
    mostUsedArchetype: 'helios',
    errorTolerance: 0.5,
  },
  adaptiveProfile: {
    needsSimplification: false,
    prefersSpeed: false,
    sensitiveToMotion: false,
  },
};

export class PersonaMemoryManager {
  private memory: PersonaMemory;
  private sessionStart: number = Date.now();

  constructor() {
    this.memory = { ...DEFAULT_MEMORY };
    this.loadFromStorage();
  }

  getMemory(): PersonaMemory {
    return { ...this.memory };
  }

  recordSession(): void {
    const duration = Date.now() - this.sessionStart;
    const { totalSessions, avgSessionDuration } = this.memory.interactionHistory;
    
    this.memory.interactionHistory.totalSessions++;
    this.memory.interactionHistory.avgSessionDuration =
      (avgSessionDuration * totalSessions + duration) / (totalSessions + 1);
    
    this.saveToStorage();
  }

  updateArchetypeUsage(archetype: ArchetypeType): void {
    this.memory.interactionHistory.mostUsedArchetype = archetype;
  }

  adaptToUserSpeed(speed: UserSpeed): void {
    this.memory.userPreferences.typicalRhythm = speed;
    this.memory.adaptiveProfile.prefersSpeed = speed === 'fast';
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('titane-persona-memory');
      if (stored) {
        this.memory = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load persona memory', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('titane-persona-memory', JSON.stringify(this.memory));
    } catch (e) {
      console.warn('Failed to save persona memory', e);
    }
  }

  reset(): void {
    this.memory = { ...DEFAULT_MEMORY };
    this.saveToStorage();
  }
}

export const personaMemoryManager = new PersonaMemoryManager();
