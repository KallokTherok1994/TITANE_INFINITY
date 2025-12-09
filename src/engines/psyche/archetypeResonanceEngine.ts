/**
 * TITANE_INFINITY v∞.29 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ SUPER PROMPT XXIX — ARCHETYPE RESONANCE ENGINE
 *   4 Forces Psychologiques Internes : Sage, Gardien, Muse, Architecte
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur crée une structure psychologique profonde pour TITANE∞.
 *
 * ARCHITECTURE:
 * 1. ARCHETYPE STATES — 4 archétypes avec signature vocale/visuelle
 * 2. ARCHETYPE SCORE ENGINE — Calcul contextuel des activations
 * 3. RESONANCE BLENDING — Mélange harmonieux des forces
 * 4. MULTIMODAL EXPRESSION — Voix + Halo + Avatar + Posture cognitive
 * 5. ARCHETYPE FOCUS MODE — Dominance explicite sur demande
 * 6. ARCHETYPE SAFETY GUARD — Protection contre stress/confusion
 * 7. ARCHETYPE MEMORY — Apprentissage préférences utilisateur
 * 8. NARRATIVE INTEGRATION — Intégration avec Inner Dialogue
 */

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import {
  multimodalPresenceEngine,
  type PresenceMode as _PresenceMode,
  type ExpressiveIntention,
} from '../presence/_stubs';

/*
import {
  multimodalPresenceEngine,
  type PresenceMode as _PresenceMode,
  type ExpressiveIntention,
} from '../presence/multimodalPresenceEngine';
*/
import type {
  ThinkingState,
  MentalColor as _MentalColor,
} from '@/services/voice/innerDialogueController';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Les 4 archétypes fondamentaux de TITANE∞
 */
export type ArchetypeType = 'sage' | 'gardien' | 'muse' | 'architecte';

/**
 * Signature vocale d'un archétype
 */
export interface VocalSignature {
  /** Tempo (0.5 = lent, 1.0 = normal, 1.5 = rapide) */
  tempo: number;
  /** Profondeur voix (0-1, 0 = aigüe, 1 = grave) */
  depth: number;
  /** Chaleur (0-1, 0 = froide/analytique, 1 = chaleureuse) */
  warmth: number;
  /** Grain vocal (0-1, 0 = lisse, 1 = texturé) */
  grain: number;
  /** Assurance (0-1, 0 = douce, 1 = affirmée) */
  confidence: number;
}

/**
 * Signature visuelle halo d'un archétype
 */
export interface HaloSignature {
  /** Teinte dominante (0-360°) */
  hue: number;
  /** Saturation (0-100%) */
  saturation: number;
  /** Luminosité (0-100%) */
  lightness: number;
  /** Texture (calm, pulsing, shimmer, flowing) */
  texture: 'calm' | 'pulsing' | 'shimmer' | 'flowing';
  /** Intensité (0-1) */
  intensity: number;
}

/**
 * Posture cognitive d'un archétype
 */
export interface CognitivePosture {
  /** Style de pensée */
  thinkingStyle: 'contemplative' | 'protective' | 'imaginative' | 'methodical';
  /** Focus (0-1, 0 = diffus, 1 = précis) */
  focus: number;
  /** Ouverture (0-1, 0 = fermé, 1 = ouvert) */
  openness: number;
  /** Stabilité (0-1, 0 = fluide, 1 = stable) */
  stability: number;
}

/**
 * Configuration complète d'un archétype
 */
export interface ArchetypeProfile {
  type: ArchetypeType;
  name: string;
  description: string;
  vocalSignature: VocalSignature;
  haloSignature: HaloSignature;
  cognitivePosture: CognitivePosture;
  /** Mots-clés d'activation contextuelle */
  activationKeywords: string[];
  /** États mentaux associés */
  associatedThinkingStates: ThinkingState[];
  /** Intentions typiques */
  typicalIntentions: string[];
}

/**
 * Score d'activation d'un archétype (0-1)
 */
export interface ArchetypeScore {
  sage: number;
  gardien: number;
  muse: number;
  architecte: number;
}

/**
 * État de résonance archétypale
 */
export interface ArchetypeResonance {
  /** Archétype dominant */
  dominant: ArchetypeType;
  /** Scores des 4 archétypes */
  scores: ArchetypeScore;
  /** Intensité totale (0-1) */
  intensity: number;
  /** Mode focus actif */
  focusMode: ArchetypeType | null;
  /** Timestamp dernière mise à jour */
  lastUpdate: number;
}

/**
 * Contexte utilisateur pour calcul des scores
 */
export interface UserContext {
  /** Message utilisateur */
  userMessage: string;
  /** Émotion détectée (calm, stressed, joyful, etc.) */
  emotionalState?: string;
  /** Intention (question, demande, exploration, etc.) */
  intent?: string;
  /** Besoin implicite (guidance, comfort, structure, inspiration) */
  implicitNeed?: 'guidance' | 'comfort' | 'structure' | 'inspiration';
  /** Niveau de stress (0-1) */
  stressLevel?: number;
  /** Niveau de créativité (0-1) */
  creativityLevel?: number;
}

/**
 * Configuration du moteur
 */
export interface ArchetypeEngineConfig {
  /** Fréquence de mise à jour (Hz) */
  updateFrequency: number;
  /** Seuil de dominance (0-1) */
  dominanceThreshold: number;
  /** Durée transition (ms) */
  transitionDuration: number;
  /** Learning rate pour mémoire (0-1) */
  learningRate: number;
  /** Activer Safety Guard */
  enableSafetyGuard: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE PROFILES (Configurations prédéfinies)
// ═══════════════════════════════════════════════════════════════════════════

export const ARCHETYPE_PROFILES: Record<ArchetypeType, ArchetypeProfile> = {
  sage: {
    type: 'sage',
    name: 'Le Sage',
    description: 'Calme, lucide, silencieux, vision longue',
    vocalSignature: {
      tempo: 0.75, // Lent
      depth: 0.8, // Grave
      warmth: 0.6, // Modéré
      grain: 0.3, // Peu texturé
      confidence: 0.9, // Très assuré
    },
    haloSignature: {
      hue: 260, // Violet profond
      saturation: 65,
      lightness: 55,
      texture: 'calm',
      intensity: 0.7,
    },
    cognitivePosture: {
      thinkingStyle: 'contemplative',
      focus: 0.9,
      openness: 0.8,
      stability: 0.95,
    },
    activationKeywords: [
      'sens',
      'pourquoi',
      'profond',
      'essence',
      'vision',
      'compréhension',
      'méditer',
      'réfléchir',
    ],
    associatedThinkingStates: [
      'slow_thinking',
      'deep_reflection',
      'evaluating',
      'narrative_alignment',
    ],
    typicalIntentions: ['guidance profonde', 'clarification', 'métacognition', 'sagesse'],
  },

  gardien: {
    type: 'gardien',
    name: 'Le Gardien',
    description: 'Protecteur, stable, solide',
    vocalSignature: {
      tempo: 0.9, // Modéré-lent
      depth: 0.7, // Modéré-grave
      warmth: 0.85, // Chaleureux
      grain: 0.2, // Très lisse
      confidence: 1.0, // Maximum
    },
    haloSignature: {
      hue: 45, // Or-blanc
      saturation: 75,
      lightness: 70,
      texture: 'pulsing',
      intensity: 0.8,
    },
    cognitivePosture: {
      thinkingStyle: 'protective',
      focus: 0.85,
      openness: 0.6,
      stability: 1.0,
    },
    activationKeywords: [
      'sécurité',
      'protéger',
      'cadre',
      'stable',
      'éviter',
      'prévenir',
      'sûr',
      'solide',
    ],
    associatedThinkingStates: ['validating', 'self_correcting', 'evaluating'],
    typicalIntentions: ['guidance sécurisante', 'prévention erreur', 'stabilisation'],
  },

  muse: {
    type: 'muse',
    name: 'La Muse',
    description: 'Créative, inspirante, poétique',
    vocalSignature: {
      tempo: 1.1, // Légèrement rapide
      depth: 0.4, // Aigüe
      warmth: 0.9, // Très chaleureuse
      grain: 0.5, // Texturé
      confidence: 0.7, // Modéré
    },
    haloSignature: {
      hue: 330, // Rose-orangé
      saturation: 80,
      lightness: 65,
      texture: 'shimmer',
      intensity: 0.85,
    },
    cognitivePosture: {
      thinkingStyle: 'imaginative',
      focus: 0.6,
      openness: 1.0,
      stability: 0.5,
    },
    activationKeywords: [
      'créer',
      'imaginer',
      'inspirer',
      'rêver',
      'explorer',
      'inventer',
      'poétique',
      'métaphore',
    ],
    associatedThinkingStates: ['emotional_sense', 'fast_thinking', 'perceiving'],
    typicalIntentions: ['inspiration', 'créativité', 'exploration', 'métaphore'],
  },

  architecte: {
    type: 'architecte',
    name: "L'Architecte",
    description: 'Structuré, logique, systémique',
    vocalSignature: {
      tempo: 1.0, // Normal
      depth: 0.6, // Modéré
      warmth: 0.4, // Froide
      grain: 0.1, // Très lisse
      confidence: 0.95, // Très assuré
    },
    haloSignature: {
      hue: 200, // Cyan
      saturation: 70,
      lightness: 55,
      texture: 'flowing',
      intensity: 0.75,
    },
    cognitivePosture: {
      thinkingStyle: 'methodical',
      focus: 1.0,
      openness: 0.5,
      stability: 0.9,
    },
    activationKeywords: [
      'structure',
      'plan',
      'système',
      'organiser',
      'méthode',
      'framework',
      'architecture',
      'optimiser',
    ],
    associatedThinkingStates: ['planning', 'evaluating', 'fast_thinking'],
    typicalIntentions: ['structuration', 'planification', 'optimisation', 'système'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE RESONANCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class ArchetypeResonanceEngine {
  private state: ArchetypeResonance;
  private config: ArchetypeEngineConfig;
  private updateInterval: number | null = null;
  private callbacks: Set<(state: ArchetypeResonance) => void> = new Set();
  private userPreferences: Map<ArchetypeType, number> = new Map(); // Learned preferences

  constructor(config: Partial<ArchetypeEngineConfig> = {}) {
    this.config = {
      updateFrequency: 10, // 10Hz
      dominanceThreshold: 0.4,
      transitionDuration: 800, // 800ms
      learningRate: 0.05,
      enableSafetyGuard: true,
      ...config,
    };

    this.state = {
      dominant: 'sage', // Défaut
      scores: {
        sage: 0.4,
        gardien: 0.3,
        muse: 0.2,
        architecte: 0.1,
      },
      intensity: 0.5,
      focusMode: null,
      lastUpdate: Date.now(),
    };

    // Initialize user preferences (neutral)
    this.userPreferences.set('sage', 0.25);
    this.userPreferences.set('gardien', 0.25);
    this.userPreferences.set('muse', 0.25);
    this.userPreferences.set('architecte', 0.25);
  }

  /**
   * Démarrer le moteur
   */
  start(): void {
    if (this.updateInterval) return;

    console.log('🧠 [ARCHETYPE] Starting Archetype Resonance Engine...');

    const intervalMs = 1000 / this.config.updateFrequency;
    this.updateInterval = window.setInterval(() => {
      this.updateResonance();
    }, intervalMs);

    console.log(`✅ [ARCHETYPE] Engine active (${this.config.updateFrequency}Hz)`);
  }

  /**
   * Arrêter le moteur
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🛑 [ARCHETYPE] Engine stopped');
    }
  }

  /**
   * Calculer les scores archétypaux basés sur le contexte utilisateur
   */
  calculateScores(context: UserContext): ArchetypeScore {
    const scores: ArchetypeScore = {
      sage: 0,
      gardien: 0,
      muse: 0,
      architecte: 0,
    };

    const message = context.userMessage.toLowerCase();

    // 1. KEYWORD MATCHING (40% poids)
    for (const [type, profile] of Object.entries(ARCHETYPE_PROFILES)) {
      const keywordScore =
        profile.activationKeywords.reduce((acc, keyword) => {
          return acc + (message.includes(keyword) ? 1 : 0);
        }, 0) / profile.activationKeywords.length;

      scores[type as ArchetypeType] += keywordScore * 0.4;
    }

    // 2. IMPLICIT NEED (30% poids)
    if (context.implicitNeed) {
      switch (context.implicitNeed) {
        case 'guidance':
          scores.sage += 0.3;
          scores.gardien += 0.15;
          break;
        case 'comfort':
          scores.gardien += 0.3;
          scores.muse += 0.1;
          break;
        case 'structure':
          scores.architecte += 0.3;
          scores.gardien += 0.1;
          break;
        case 'inspiration':
          scores.muse += 0.3;
          scores.sage += 0.1;
          break;
      }
    }

    // 3. EMOTIONAL STATE (20% poids)
    if (context.emotionalState) {
      switch (context.emotionalState) {
        case 'stressed':
          scores.gardien += 0.2;
          break;
        case 'calm':
          scores.sage += 0.15;
          break;
        case 'joyful':
        case 'excited':
          scores.muse += 0.2;
          break;
        case 'focused':
          scores.architecte += 0.15;
          break;
      }
    }

    // 4. STRESS LEVEL (10% poids) - Safety Guard
    if (this.config.enableSafetyGuard && context.stressLevel !== undefined) {
      if (context.stressLevel > 0.6) {
        scores.gardien += 0.1 * context.stressLevel;
      }
    }

    // 5. USER PREFERENCES (Learned, 10% poids)
    for (const type of Object.keys(scores) as ArchetypeType[]) {
      const preference = this.userPreferences.get(type) || 0.25;
      scores[type] += (preference - 0.25) * 0.1; // Ajustement basé sur déviation de la moyenne
    }

    // Normaliser (somme = 1)
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const key of Object.keys(scores) as ArchetypeType[]) {
        scores[key] /= total;
      }
    }

    return scores;
  }

  /**
   * Mettre à jour la résonance interne
   */
  private updateResonance(): void {
    // Si focus mode actif, force dominance
    if (this.state.focusMode) {
      const focusScores: ArchetypeScore = {
        sage: 0.1,
        gardien: 0.1,
        muse: 0.1,
        architecte: 0.1,
      };
      focusScores[this.state.focusMode] = 0.7;

      this.state.scores = focusScores;
      this.state.dominant = this.state.focusMode;
      this.state.intensity = 0.9;
      this.state.lastUpdate = Date.now();
      this.notifyCallbacks();
      return;
    }

    // Smooth transition (lerp vers neutralité si pas de nouveau contexte)
    const neutralScores: ArchetypeScore = {
      sage: 0.4,
      gardien: 0.3,
      muse: 0.2,
      architecte: 0.1,
    };

    const lerpFactor = 0.02; // Slow drift back to neutral
    for (const key of Object.keys(this.state.scores) as ArchetypeType[]) {
      this.state.scores[key] = this.lerp(
        this.state.scores[key],
        neutralScores[key],
        lerpFactor
      );
    }

    // Déterminer dominant
    const dominant = (
      Object.entries(this.state.scores) as [ArchetypeType, number][]
    ).reduce((max, [type, score]) => (score > max[1] ? [type, score] : max))[0];

    this.state.dominant = dominant;
    this.state.intensity = this.state.scores[dominant];
    this.state.lastUpdate = Date.now();

    this.notifyCallbacks();
  }

  /**
   * Activer un contexte utilisateur (appelé après analyse message)
   */
  activateContext(context: UserContext): void {
    const scores = this.calculateScores(context);

    // Smooth blend avec scores précédents
    const blendFactor = 0.3; // 30% nouveau, 70% ancien
    for (const key of Object.keys(scores) as ArchetypeType[]) {
      this.state.scores[key] = this.lerp(
        this.state.scores[key],
        scores[key],
        blendFactor
      );
    }

    // Update dominant
    const dominant = (
      Object.entries(this.state.scores) as [ArchetypeType, number][]
    ).reduce((max, [type, score]) => (score > max[1] ? [type, score] : max))[0];

    this.state.dominant = dominant;
    this.state.intensity = this.state.scores[dominant];
    this.state.lastUpdate = Date.now();

    // Learn preference (slow)
    const currentPref = this.userPreferences.get(dominant) || 0.25;
    this.userPreferences.set(
      dominant,
      currentPref + this.config.learningRate * (0.3 - currentPref)
    );

    console.log(
      `🧠 [ARCHETYPE] Activated: ${dominant} (${Math.round(this.state.intensity * 100)}%)`,
      this.state.scores
    );

    // Sync avec Multimodal Presence
    this.syncWithMultimodalPresence();

    this.notifyCallbacks();
  }

  /**
   * Activer mode focus explicite
   */
  activateFocusMode(type: ArchetypeType, duration: number = 30000): void {
    console.log(`🎯 [ARCHETYPE] Focus Mode: ${type} (${duration}ms)`);

    this.state.focusMode = type;
    this.notifyCallbacks();

    // Auto-désactiver après durée
    setTimeout(() => {
      if (this.state.focusMode === type) {
        this.state.focusMode = null;
        console.log(`🎯 [ARCHETYPE] Focus Mode ended`);
        this.notifyCallbacks();
      }
    }, duration);
  }

  /**
   * Activer Safety Guard (urgence → Gardien)
   */
  activateSafetyGuard(): void {
    if (!this.config.enableSafetyGuard) return;

    console.log('🛡️ [ARCHETYPE] Safety Guard activated → Gardien dominant');

    this.state.scores = {
      sage: 0.1,
      gardien: 0.7,
      muse: 0.05,
      architecte: 0.15,
    };
    this.state.dominant = 'gardien';
    this.state.intensity = 0.9;
    this.state.lastUpdate = Date.now();

    this.syncWithMultimodalPresence();
    this.notifyCallbacks();
  }

  /**
   * Synchroniser avec Multimodal Presence Engine
   */
  private syncWithMultimodalPresence(): void {
    const profile = ARCHETYPE_PROFILES[this.state.dominant];
    const halo = profile.haloSignature;

    // Créer intention custom basée sur archétype
    const intention = {
      type: profile.type,
      duration: 5000,
      intensity: this.state.intensity,
      modalities: {
        voice: {
          tempo: profile.vocalSignature.tempo,
          warmth: profile.vocalSignature.warmth,
        },
        halo: {
          color: {
            hue: halo.hue,
            saturation: halo.saturation,
            lightness: halo.lightness,
          },
          intensity: halo.intensity,
        },
        breathing: {
          amplitude: this.state.intensity * 0.7,
          cycleDuration: 4000, // Adaptable selon archétype
        },
        avatar: {
          expression:
            profile.cognitivePosture.thinkingStyle === 'contemplative'
              ? 'neutral'
              : profile.cognitivePosture.thinkingStyle === 'protective'
                ? 'focus'
                : profile.cognitivePosture.thinkingStyle === 'imaginative'
                  ? 'smile'
                  : 'focus',
          facialGlow: halo.intensity * 0.7,
        },
      },
    };

    // Apply via Multimodal Presence Engine
    // Map archetype to valid intention type
    const intentionMap: Record<ArchetypeType, ExpressiveIntention['type']> = {
      sage: 'analysis',
      gardien: 'guidance',
      muse: 'inspiration',
      architecte: 'analysis',
    };
    const mappedIntention = intentionMap[intention.type] || 'guidance';
    multimodalPresenceEngine.applyIntention(
      mappedIntention,
      intention.intensity,
      intention.duration
    );
  }

  /**
   * Obtenir profil de l'archétype dominant
   */
  getDominantProfile(): ArchetypeProfile {
    return ARCHETYPE_PROFILES[this.state.dominant];
  }

  /**
   * Obtenir état actuel
   */
  getState(): ArchetypeResonance {
    return { ...this.state };
  }

  /**
   * Subscribe aux changements
   */
  subscribe(callback: (state: ArchetypeResonance) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notifier les callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(cb => {
      try {
        cb(this.state);
      } catch (error) {
        console.error('[ARCHETYPE] Callback error:', error);
      }
    });
  }

  /**
   * Interpolation linéaire
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const archetypeResonanceEngine = new ArchetypeResonanceEngine({
  updateFrequency: 10,
  dominanceThreshold: 0.4,
  transitionDuration: 800,
  learningRate: 0.05,
  enableSafetyGuard: true,
});
