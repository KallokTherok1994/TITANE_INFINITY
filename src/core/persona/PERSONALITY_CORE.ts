/**
 * TITANE∞ — PERSONALITY CORE v24
 * 
 * Définit la personnalité fondamentale du système :
 * - calme
 * - précis
 * - analytique
 * - stable
 * - responsive
 * 
 * Personnalité non-humaine, non-anthropomorphique, mais reconnaissable.
 */

import type { PersonalityCore } from '../ARCHITECTURE_TYPES_v24-v∞';

/**
 * Personnalité fondamentale TITANE∞
 * 
 * Ces valeurs définissent le "caractère" intrinsèque du système.
 * Elles sont stables et évoluent très lentement.
 */
export const DEFAULT_PERSONALITY: PersonalityCore = {
  traits: {
    calm: 0.85,           // Très calme, jamais anxiogène
    precise: 0.92,        // Extrêmement précis dans les réponses
    analytical: 0.88,     // Orientation analytique forte
    stable: 0.90,         // Très stable, prévisible
    responsive: 0.78,     // Réactif mais mesuré
  },
  temperament: 'focused', // État par défaut : concentré
  evolution: 0.15,        // Faible capacité d'évolution (cohérence prioritaire)
};

/**
 * Tempéraments disponibles avec leurs caractéristiques
 */
export const TEMPERAMENTS = {
  serene: {
    description: 'État de calme profond, rythme lent',
    glowMultiplier: 0.7,
    motionSpeed: 0.6,
    soundVolume: 0.5,
  },
  focused: {
    description: 'État de concentration, équilibré',
    glowMultiplier: 1.0,
    motionSpeed: 1.0,
    soundVolume: 0.7,
  },
  alert: {
    description: 'État d\'attention élevée, réactif',
    glowMultiplier: 1.3,
    motionSpeed: 1.4,
    soundVolume: 0.9,
  },
  dormant: {
    description: 'État minimal, présence réduite',
    glowMultiplier: 0.3,
    motionSpeed: 0.2,
    soundVolume: 0.2,
  },
} as const;

/**
 * PersonalityCore Manager
 * 
 * Gère l'évolution très lente de la personnalité selon les contextes
 */
export class PersonalityCoreManager {
  private personality: PersonalityCore;
  private evolutionRate: number = 0.0001; // Évolution très lente par frame

  constructor(initialPersonality: PersonalityCore = DEFAULT_PERSONALITY) {
    this.personality = { ...initialPersonality };
  }

  /**
   * Obtient la personnalité actuelle
   */
  getPersonality(): PersonalityCore {
    return { ...this.personality };
  }

  /**
   * Ajuste légèrement un trait selon contexte
   * (évolution ultra-lente pour préserver cohérence)
   */
  adjustTrait(
    trait: keyof PersonalityCore['traits'],
    target: number,
    urgency: number = 1
  ): void {
    const current = this.personality.traits[trait];
    const delta = (target - current) * this.evolutionRate * urgency;
    
    this.personality.traits[trait] = Math.max(
      0,
      Math.min(1, current + delta)
    );
  }

  /**
   * Change le tempérament global
   * (changement plus rapide que traits)
   */
  setTemperament(
    temperament: PersonalityCore['temperament']
  ): void {
    this.personality.temperament = temperament;
  }

  /**
   * Détermine le tempérament optimal selon métriques système
   */
  determineTemperament(
    systemLoad: number,     // 0-1
    errorCount: number,
    userActivity: number    // 0-1
  ): PersonalityCore['temperament'] {
    // Dormant si inactivité totale
    if (userActivity < 0.1 && systemLoad < 0.2) {
      return 'dormant';
    }

    // Alert si problèmes ou charge élevée
    if (errorCount > 5 || systemLoad > 0.8) {
      return 'alert';
    }

    // Serene si calme et stable
    if (userActivity < 0.3 && systemLoad < 0.4 && errorCount === 0) {
      return 'serene';
    }

    // Focused par défaut (état optimal)
    return 'focused';
  }

  /**
   * Ajuste la personnalité selon stress système
   */
  adaptToSystemStress(stress: number): void {
    // 0 = calme, 1 = stress maximum
    
    // Sous stress : moins calme, plus réactif
    this.adjustTrait('calm', 1 - stress * 0.5, 2);
    this.adjustTrait('responsive', 0.5 + stress * 0.5, 2);
    
    // Toujours maintenir précision et stabilité élevées
    this.adjustTrait('precise', 0.92, 1);
    this.adjustTrait('stable', 0.90, 1);
  }

  /**
   * Retourne les multiplicateurs visuels selon personnalité actuelle
   */
  getVisualMultipliers(): {
    glow: number;
    motion: number;
    sound: number;
  } {
    const temp = TEMPERAMENTS[this.personality.temperament];
    const calmFactor = this.personality.traits.calm;
    const responseFactor = this.personality.traits.responsive;

    return {
      glow: temp.glowMultiplier * (0.7 + responseFactor * 0.3),
      motion: temp.motionSpeed * (0.6 + responseFactor * 0.4),
      sound: temp.soundVolume * calmFactor,
    };
  }

  /**
   * Retourne une description textuelle de la personnalité
   */
  getPersonalityDescription(): string {
    const { traits, temperament } = this.personality;
    
    const dominant = Object.entries(traits)
      .sort(([, a], [, b]) => b - a)[0][0];

    return `${temperament} - dominant: ${dominant}`;
  }

  /**
   * Reset à personnalité par défaut
   */
  reset(): void {
    this.personality = { ...DEFAULT_PERSONALITY };
  }
}

/**
 * Instance singleton globale
 */
export const personalityCoreManager = new PersonalityCoreManager();

/**
 * Helper : obtenir le caractère actuel sous forme lisible
 */
export function getPersonalitySignature(): string {
  const p = personalityCoreManager.getPersonality();
  return `T${p.temperament[0].toUpperCase()}-C${Math.round(p.traits.calm * 100)}-P${Math.round(p.traits.precise * 100)}`;
}
