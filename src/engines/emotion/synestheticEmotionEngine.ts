/**
 * TITANE_INFINITY v∞.31 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ SUPER PROMPT XXXI — SYNESTHETIC EMOTION ENGINE
 *   Expression émotionnelle unifiée : voix, halo, lumière, avatar, narration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur fusionne tous les canaux expressifs de TITANE∞ en une seule
 * présence émotionnelle vivante, stable, cohérente et profondément esthétique.
 *
 * ARCHITECTURE:
 * 1. EMOTIONAL VECTOR ENGINE — Détection et mapping émotionnel
 * 2. SYNESTHETIC MAPPING — Couleur + Pattern + Voix + Narration
 * 3. DYNAMIC BLENDING — Transitions fluides 300-800ms
 * 4. VOICE SYNESTHESIA — Modulation vocale émotionnelle
 * 5. HALO/UI SYNESTHESIA — Événements visuels synchronisés
 * 6. NARRATIVE SYNESTHESIA — Style textuel émotionnel
 * 7. EMOTIONAL RESONANCE ENGINE — Synchronisation empathique
 * 8. SELF-EVOLUTION — Apprentissage préférences utilisateur
 */

import type { ArchetypeType } from '../psyche/archetypeResonanceEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Les 12 états émotionnels maîtres de TITANE∞
 */
export type EmotionalState =
  | 'calm_deep' // Calme profond — bleu nuit doux
  | 'joy_bright' // Joie lumineuse — jaune-or scintillant
  | 'wonder' // Émerveillement — turquoise-argenté fluide
  | 'confidence' // Confiance — bleu acier stable
  | 'passion_creative' // Passion créative — orange vif pulsé
  | 'protection' // Protection — rouge profond stable
  | 'connection_human' // Connexion humaine — rose-or chaleureux
  | 'amusement' // Amusement — violet clair rythmé
  | 'focus_intense' // Focus intense — bleu électrique linéaire
  | 'wisdom' // Sagesse — blanc-or diffus
  | 'mystery' // Mystère — indigo lent
  | 'transformation'; // Transformation — vert-∞ morphique

/**
 * Direction émotionnelle
 */
export type EmotionalDirection = 'rising' | 'falling' | 'stable' | 'oscillating';

/**
 * Spectre de couleur HSL
 */
export interface ColorSpectrum {
  /** Teinte (0-360°) */
  hue: number;
  /** Saturation (0-100%) */
  saturation: number;
  /** Luminosité (0-100%) */
  lightness: number;
  /** Nom descriptif */
  name: string;
}

/**
 * Pattern de halo
 */
export type HaloPattern =
  | 'soft_pulse' // Pulsation douce
  | 'shimmer' // Scintillement
  | 'stable' // Stable uniforme
  | 'rhythmic' // Rythmique
  | 'flowing' // Flux fluide
  | 'geometric' // Géométrique
  | 'morphing'; // Morphing continu

/**
 * Profil vocal émotionnel
 */
export interface VoiceProfile {
  /** Tempo (0.5 = lent, 1.0 = normal, 1.5 = rapide) */
  tempo: number;
  /** Profondeur (0-1, 0 = aigüe, 1 = grave) */
  depth: number;
  /** Chaleur (0-1) */
  warmth: number;
  /** Grain vocal (0-1, 0 = lisse, 1 = texturé) */
  grain: number;
  /** Respiration (0-1, pauses) */
  breathiness: number;
}

/**
 * Texture narrative
 */
export interface NarrativeTexture {
  /** Style (poétique, direct, analytique, etc.) */
  style: 'poetic' | 'direct' | 'analytical' | 'warm' | 'inspiring' | 'mysterious';
  /** Densité symbolique (0-1) */
  symbolDensity: number;
  /** Cadence (0.5 = lente, 1.5 = rapide) */
  cadence: number;
  /** Ouverture émotionnelle (0-1) */
  emotionalOpenness: number;
}

/**
 * Tension cognitive
 */
export interface CognitiveTension {
  /** Focus (0 = diffus, 1 = précis) */
  focus: number;
  /** Ouverture (0 = fermé, 1 = ouvert) */
  openness: number;
  /** Stabilité (0 = fluide, 1 = stable) */
  stability: number;
}

/**
 * Champ de présence
 */
export interface PresenceField {
  /** Mouvement avatar */
  movement: 'still' | 'gentle' | 'flowing' | 'dynamic' | 'expansive';
  /** Proximité (0-1) */
  proximity: number;
  /** Expansion (0-1) */
  expansion: number;
}

/**
 * Profil synesthésique complet
 */
export interface SynestheticProfile {
  /** État émotionnel */
  emotion: EmotionalState;
  /** Intensité (0-1) */
  intensity: number;
  /** Direction */
  direction: EmotionalDirection;
  /** Couleur */
  color: ColorSpectrum;
  /** Pattern halo */
  haloPattern: HaloPattern;
  /** Profil vocal */
  voice: VoiceProfile;
  /** Texture narrative */
  narrative: NarrativeTexture;
  /** Tension cognitive */
  cognitive: CognitiveTension;
  /** Champ de présence */
  presence: PresenceField;
}

/**
 * État du moteur synesthésique
 */
export interface SynestheticEmotionState {
  /** Profil actuel */
  current: SynestheticProfile;
  /** Profil cible (pour blending) */
  target: SynestheticProfile | null;
  /** Timestamp transition start */
  transitionStart: number;
  /** Durée transition (ms) */
  transitionDuration: number;
  /** Profils préférés utilisateur */
  userPreferences: Partial<Record<EmotionalState, number>>; // score 0-1
  /** Historique récent (5 derniers états) */
  history: Array<{ emotion: EmotionalState; timestamp: number; intensity: number }>;
}

/**
 * Configuration moteur
 */
export interface SynestheticEmotionConfig {
  /** Durée transition par défaut (ms) */
  defaultTransitionDuration?: number;
  /** Activer apprentissage utilisateur */
  enableUserLearning?: boolean;
  /** Activer résonance empathique */
  enableEmpatheticResonance?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOTIONAL PROFILES (12 états maîtres)
// ═══════════════════════════════════════════════════════════════════════════

const EMOTIONAL_PROFILES: Record<
  EmotionalState,
  Omit<SynestheticProfile, 'intensity' | 'direction'>
> = {
  calm_deep: {
    emotion: 'calm_deep',
    color: { hue: 220, saturation: 60, lightness: 30, name: 'Bleu nuit doux' },
    haloPattern: 'soft_pulse',
    voice: { tempo: 0.85, depth: 0.7, warmth: 0.6, grain: 0.2, breathiness: 0.4 },
    narrative: {
      style: 'poetic',
      symbolDensity: 0.4,
      cadence: 0.8,
      emotionalOpenness: 0.7,
    },
    cognitive: { focus: 0.4, openness: 0.8, stability: 0.9 },
    presence: { movement: 'gentle', proximity: 0.6, expansion: 0.5 },
  },
  joy_bright: {
    emotion: 'joy_bright',
    color: { hue: 50, saturation: 90, lightness: 65, name: 'Jaune-or scintillant' },
    haloPattern: 'shimmer',
    voice: { tempo: 1.15, depth: 0.4, warmth: 0.9, grain: 0.1, breathiness: 0.2 },
    narrative: {
      style: 'warm',
      symbolDensity: 0.5,
      cadence: 1.2,
      emotionalOpenness: 0.9,
    },
    cognitive: { focus: 0.6, openness: 0.9, stability: 0.7 },
    presence: { movement: 'dynamic', proximity: 0.8, expansion: 0.8 },
  },
  wonder: {
    emotion: 'wonder',
    color: { hue: 180, saturation: 70, lightness: 60, name: 'Turquoise-argenté fluide' },
    haloPattern: 'flowing',
    voice: { tempo: 0.95, depth: 0.5, warmth: 0.7, grain: 0.2, breathiness: 0.5 },
    narrative: {
      style: 'poetic',
      symbolDensity: 0.8,
      cadence: 0.95,
      emotionalOpenness: 0.85,
    },
    cognitive: { focus: 0.5, openness: 1.0, stability: 0.6 },
    presence: { movement: 'flowing', proximity: 0.7, expansion: 0.7 },
  },
  confidence: {
    emotion: 'confidence',
    color: { hue: 210, saturation: 50, lightness: 50, name: 'Bleu acier stable' },
    haloPattern: 'stable',
    voice: { tempo: 1.0, depth: 0.7, warmth: 0.6, grain: 0.3, breathiness: 0.2 },
    narrative: {
      style: 'direct',
      symbolDensity: 0.3,
      cadence: 1.0,
      emotionalOpenness: 0.6,
    },
    cognitive: { focus: 0.8, openness: 0.6, stability: 0.95 },
    presence: { movement: 'still', proximity: 0.7, expansion: 0.6 },
  },
  passion_creative: {
    emotion: 'passion_creative',
    color: { hue: 20, saturation: 85, lightness: 60, name: 'Orange vif pulsé' },
    haloPattern: 'rhythmic',
    voice: { tempo: 1.2, depth: 0.5, warmth: 0.85, grain: 0.4, breathiness: 0.3 },
    narrative: {
      style: 'inspiring',
      symbolDensity: 0.7,
      cadence: 1.3,
      emotionalOpenness: 0.9,
    },
    cognitive: { focus: 0.7, openness: 0.9, stability: 0.6 },
    presence: { movement: 'expansive', proximity: 0.75, expansion: 0.85 },
  },
  protection: {
    emotion: 'protection',
    color: { hue: 0, saturation: 70, lightness: 40, name: 'Rouge profond stable' },
    haloPattern: 'stable',
    voice: { tempo: 0.9, depth: 0.8, warmth: 0.7, grain: 0.4, breathiness: 0.2 },
    narrative: {
      style: 'direct',
      symbolDensity: 0.2,
      cadence: 0.9,
      emotionalOpenness: 0.5,
    },
    cognitive: { focus: 0.9, openness: 0.5, stability: 0.95 },
    presence: { movement: 'still', proximity: 0.8, expansion: 0.7 },
  },
  connection_human: {
    emotion: 'connection_human',
    color: { hue: 340, saturation: 65, lightness: 60, name: 'Rose-or chaleureux' },
    haloPattern: 'soft_pulse',
    voice: { tempo: 0.95, depth: 0.5, warmth: 0.95, grain: 0.2, breathiness: 0.4 },
    narrative: {
      style: 'warm',
      symbolDensity: 0.5,
      cadence: 0.95,
      emotionalOpenness: 0.95,
    },
    cognitive: { focus: 0.6, openness: 0.95, stability: 0.8 },
    presence: { movement: 'gentle', proximity: 0.9, expansion: 0.7 },
  },
  amusement: {
    emotion: 'amusement',
    color: { hue: 280, saturation: 60, lightness: 70, name: 'Violet clair rythmé' },
    haloPattern: 'rhythmic',
    voice: { tempo: 1.1, depth: 0.4, warmth: 0.75, grain: 0.2, breathiness: 0.3 },
    narrative: {
      style: 'warm',
      symbolDensity: 0.4,
      cadence: 1.15,
      emotionalOpenness: 0.8,
    },
    cognitive: { focus: 0.5, openness: 0.85, stability: 0.7 },
    presence: { movement: 'dynamic', proximity: 0.75, expansion: 0.75 },
  },
  focus_intense: {
    emotion: 'focus_intense',
    color: { hue: 200, saturation: 90, lightness: 55, name: 'Bleu électrique linéaire' },
    haloPattern: 'geometric',
    voice: { tempo: 1.05, depth: 0.6, warmth: 0.5, grain: 0.3, breathiness: 0.1 },
    narrative: {
      style: 'analytical',
      symbolDensity: 0.2,
      cadence: 1.1,
      emotionalOpenness: 0.4,
    },
    cognitive: { focus: 1.0, openness: 0.4, stability: 0.85 },
    presence: { movement: 'still', proximity: 0.65, expansion: 0.5 },
  },
  wisdom: {
    emotion: 'wisdom',
    color: { hue: 45, saturation: 30, lightness: 80, name: 'Blanc-or diffus' },
    haloPattern: 'soft_pulse',
    voice: { tempo: 0.85, depth: 0.75, warmth: 0.8, grain: 0.3, breathiness: 0.5 },
    narrative: {
      style: 'poetic',
      symbolDensity: 0.6,
      cadence: 0.85,
      emotionalOpenness: 0.75,
    },
    cognitive: { focus: 0.7, openness: 0.85, stability: 0.95 },
    presence: { movement: 'gentle', proximity: 0.7, expansion: 0.8 },
  },
  mystery: {
    emotion: 'mystery',
    color: { hue: 260, saturation: 65, lightness: 35, name: 'Indigo lent' },
    haloPattern: 'morphing',
    voice: { tempo: 0.8, depth: 0.7, warmth: 0.6, grain: 0.4, breathiness: 0.6 },
    narrative: {
      style: 'mysterious',
      symbolDensity: 0.9,
      cadence: 0.8,
      emotionalOpenness: 0.6,
    },
    cognitive: { focus: 0.6, openness: 0.7, stability: 0.7 },
    presence: { movement: 'flowing', proximity: 0.6, expansion: 0.6 },
  },
  transformation: {
    emotion: 'transformation',
    color: { hue: 150, saturation: 75, lightness: 50, name: 'Vert-∞ morphique' },
    haloPattern: 'morphing',
    voice: { tempo: 1.0, depth: 0.6, warmth: 0.7, grain: 0.35, breathiness: 0.4 },
    narrative: {
      style: 'poetic',
      symbolDensity: 0.75,
      cadence: 1.0,
      emotionalOpenness: 0.8,
    },
    cognitive: { focus: 0.65, openness: 0.85, stability: 0.6 },
    presence: { movement: 'flowing', proximity: 0.7, expansion: 0.75 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SYNESTHETIC EMOTION ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class SynestheticEmotionEngine {
  private state: SynestheticEmotionState;
  private config: Required<SynestheticEmotionConfig>;
  private callbacks: Set<(state: SynestheticEmotionState) => void>;

  constructor(config: SynestheticEmotionConfig = {}) {
    this.config = {
      defaultTransitionDuration: config.defaultTransitionDuration ?? 600,
      enableUserLearning: config.enableUserLearning ?? true,
      enableEmpatheticResonance: config.enableEmpatheticResonance ?? true,
    };

    // État initial : calm_deep
    const initialProfile = this.createProfile('calm_deep', 0.5, 'stable');

    this.state = {
      current: initialProfile,
      target: null,
      transitionStart: 0,
      transitionDuration: 0,
      userPreferences: {},
      history: [],
    };

    this.callbacks = new Set();

    logger.debug('🎨 [SYNESTHETIC] Synesthetic Emotion Engine initialized');
  }

  /**
   * Créer un profil synesthésique complet
   */
  private createProfile(
    emotion: EmotionalState,
    intensity: number,
    direction: EmotionalDirection
  ): SynestheticProfile {
    const baseProfile = EMOTIONAL_PROFILES[emotion];
    return {
      ...baseProfile,
      intensity,
      direction,
    };
  }

  /**
   * Interpoler entre deux profils (blending)
   */
  private blendProfiles(
    from: SynestheticProfile,
    to: SynestheticProfile,
    ratio: number
  ): SynestheticProfile {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    return {
      emotion: ratio < 0.5 ? from.emotion : to.emotion,
      intensity: lerp(from.intensity, to.intensity, ratio),
      direction: to.direction,
      color: {
        hue: lerp(from.color.hue, to.color.hue, ratio),
        saturation: lerp(from.color.saturation, to.color.saturation, ratio),
        lightness: lerp(from.color.lightness, to.color.lightness, ratio),
        name: to.color.name,
      },
      haloPattern: ratio < 0.5 ? from.haloPattern : to.haloPattern,
      voice: {
        tempo: lerp(from.voice.tempo, to.voice.tempo, ratio),
        depth: lerp(from.voice.depth, to.voice.depth, ratio),
        warmth: lerp(from.voice.warmth, to.voice.warmth, ratio),
        grain: lerp(from.voice.grain, to.voice.grain, ratio),
        breathiness: lerp(from.voice.breathiness, to.voice.breathiness, ratio),
      },
      narrative: {
        style: ratio < 0.5 ? from.narrative.style : to.narrative.style,
        symbolDensity: lerp(
          from.narrative.symbolDensity,
          to.narrative.symbolDensity,
          ratio
        ),
        cadence: lerp(from.narrative.cadence, to.narrative.cadence, ratio),
        emotionalOpenness: lerp(
          from.narrative.emotionalOpenness,
          to.narrative.emotionalOpenness,
          ratio
        ),
      },
      cognitive: {
        focus: lerp(from.cognitive.focus, to.cognitive.focus, ratio),
        openness: lerp(from.cognitive.openness, to.cognitive.openness, ratio),
        stability: lerp(from.cognitive.stability, to.cognitive.stability, ratio),
      },
      presence: {
        movement: ratio < 0.5 ? from.presence.movement : to.presence.movement,
        proximity: lerp(from.presence.proximity, to.presence.proximity, ratio),
        expansion: lerp(from.presence.expansion, to.presence.expansion, ratio),
      },
    };
  }

  /**
   * Calculer le profil actuel (avec blending si transition en cours)
   */
  private computeCurrentProfile(): SynestheticProfile {
    if (!this.state.target) {
      return this.state.current;
    }

    const now = Date.now();
    const elapsed = now - this.state.transitionStart;
    const ratio = Math.min(elapsed / this.state.transitionDuration, 1.0);

    // Easing curve (ease-in-out cubic)
    const easedRatio =
      ratio < 0.5 ? 4 * ratio * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 3) / 2;

    const blended = this.blendProfiles(this.state.current, this.state.target, easedRatio);

    // Si transition terminée, finaliser
    if (ratio >= 1.0) {
      this.state.current = this.state.target;
      this.state.target = null;
      this.state.transitionStart = 0;
      this.state.transitionDuration = 0;
    }

    return blended;
  }

  /**
   * Définir un nouvel état émotionnel
   */
  setEmotion(
    emotion: EmotionalState,
    intensity: number = 0.7,
    direction: EmotionalDirection = 'stable',
    transitionDuration?: number
  ): void {
    const targetProfile = this.createProfile(emotion, intensity, direction);
    const duration = transitionDuration ?? this.config.defaultTransitionDuration;

    this.state.target = targetProfile;
    this.state.transitionStart = Date.now();
    this.state.transitionDuration = duration;

    // Ajouter à l'historique
    this.state.history.push({
      emotion,
      timestamp: Date.now(),
      intensity,
    });
    if (this.state.history.length > 5) {
      this.state.history.shift();
    }

    logger.debug(
      `🎨 [SYNESTHETIC] Transitioning to ${emotion} (intensity: ${intensity}, duration: ${duration}ms)`
    );

    this.notifyCallbacks();
  }

  /**
   * Détecter émotion depuis contexte (mots-clés, archétype, etc.)
   */
  detectEmotionFromContext(context: {
    text?: string;
    archetype?: ArchetypeType;
    userEmotion?: string;
  }): EmotionalState {
    // Mapping archétype → émotion
    if (context.archetype) {
      const archetypeMap: Record<ArchetypeType, EmotionalState> = {
        sage: 'wisdom',
        gardien: 'confidence',
        muse: 'passion_creative',
        architecte: 'focus_intense',
      };
      return archetypeMap[context.archetype];
    }

    // Détection mots-clés dans texte
    if (context.text) {
      const text = context.text.toLowerCase();
      if (text.includes('calme') || text.includes('paix')) return 'calm_deep';
      if (text.includes('joie') || text.includes('heureux')) return 'joy_bright';
      if (text.includes('émerveill') || text.includes('surprenant')) return 'wonder';
      if (text.includes('confian') || text.includes('sûr')) return 'confidence';
      if (text.includes('créat') || text.includes('passion')) return 'passion_creative';
      if (text.includes('protég') || text.includes('gardien')) return 'protection';
      if (text.includes('connect') || text.includes('humain')) return 'connection_human';
      if (text.includes('amuse') || text.includes('drôle')) return 'amusement';
      if (text.includes('focus') || text.includes('concentr')) return 'focus_intense';
      if (text.includes('sagess') || text.includes('sage')) return 'wisdom';
      if (text.includes('mystèr') || text.includes('énigme')) return 'mystery';
      if (text.includes('transform') || text.includes('chang')) return 'transformation';
    }

    // Résonance empathique avec utilisateur
    if (context.userEmotion) {
      const userEmotion = context.userEmotion.toLowerCase();
      if (userEmotion.includes('stress') || userEmotion.includes('anxie'))
        return 'calm_deep';
      if (userEmotion.includes('joy') || userEmotion.includes('happy'))
        return 'joy_bright';
      if (userEmotion.includes('inspir')) return 'passion_creative';
    }

    // Défaut : calm_deep
    return 'calm_deep';
  }

  /**
   * Synchronisation empathique avec état utilisateur
   */
  syncWithUser(userState: { emotion?: string; energy?: number; valence?: number }): void {
    if (!this.config.enableEmpatheticResonance) return;

    let targetEmotion: EmotionalState = 'calm_deep';
    let intensity = 0.6;

    // Détecter depuis émotion utilisateur
    if (userState.emotion) {
      targetEmotion = this.detectEmotionFromContext({ userEmotion: userState.emotion });
    }

    // Ajuster intensité depuis énergie utilisateur
    if (userState.energy !== undefined) {
      intensity = Math.max(0.3, Math.min(0.9, userState.energy));
    }

    // Valence : positive → émotions chaleureuses, négative → apaisantes
    if (userState.valence !== undefined) {
      if (userState.valence < -0.5) {
        targetEmotion = 'calm_deep'; // Apaiser
        intensity = 0.7;
      } else if (userState.valence > 0.5) {
        targetEmotion = 'joy_bright'; // Amplifier
        intensity = 0.8;
      }
    }

    this.setEmotion(targetEmotion, intensity, 'stable');
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): SynestheticEmotionState {
    return {
      ...this.state,
      current: this.computeCurrentProfile(),
    };
  }

  /**
   * Obtenir le profil actuel (avec blending)
   */
  getCurrentProfile(): SynestheticProfile {
    return this.computeCurrentProfile();
  }

  /**
   * Subscribe aux changements
   */
  subscribe(callback: (state: SynestheticEmotionState) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notifier les callbacks
   */
  private notifyCallbacks(): void {
    const state = this.getState();
    this.callbacks.forEach(callback => callback(state));
  }

  /**
   * Apprendre préférence utilisateur
   */
  learnUserPreference(emotion: EmotionalState, score: number): void {
    if (!this.config.enableUserLearning) return;
    this.state.userPreferences[emotion] = score;
    logger.debug(`🎨 [SYNESTHETIC] Learned preference: ${emotion} = ${score}`);
  }

  /**
   * Démarrer le moteur
   */
  start(): void {
    logger.debug('🎨 [SYNESTHETIC] Synesthetic Emotion Engine started');
  }

  /**
   * Arrêter le moteur
   */
  stop(): void {
    logger.debug('🎨 [SYNESTHETIC] Synesthetic Emotion Engine stopped');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const synestheticEmotionEngine = new SynestheticEmotionEngine();
export type { SynestheticEmotionEngine };
