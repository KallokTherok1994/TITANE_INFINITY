/**
 * TITANE_INFINITY v∞.12 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ PRESENCE OS v∞.1
 *   Multimodal Identity Engine · Unified Cognitive & Expressive Presence
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Le Presence OS unifie 7 couches pour créer une personnalité cohérente :
 * 1. Cognitive Core (raisonnement, style mental)
 * 2. Emotional & Affective (humeur, valence, empathie)
 * 3. Expression (voix, prosodie, micro-expressions)
 * 4. Aura & Light Body (corps lumineux intelligent)
 * 5. Spatial Presence (holophonic, positionnement 3D)
 * 6. Autonomic (réactions spontanées, signaux vivants)
 * 7. Evolution (apprentissage identitaire progressif)
 */

import {
  synestheticEmotionEngine,
  type EmotionalState,
} from '../emotion/synestheticEmotionEngine';
import { auraEngine, type AuraAnimationPattern } from '../aura/auraEngine';
import {
  archetypeResonanceEngine as _archetypeResonanceEngine,
  type ArchetypeType,
} from '../psyche/archetypeResonanceEngine';
import { embodiedPresenceEngine as _embodiedPresenceEngine } from '../embodiment/embodiedPresenceEngine';
import { metaContinuumEngine as _metaContinuumEngine } from '../continuum/metaContinuumEngine';
import { neuralVoiceBlendingEngine as _neuralVoiceBlendingEngine } from '../voice/neuralVoiceBlendingEngine';
import { interoceptionEngine } from '../interoception/interoceptionEngine';
import { holophonicEngine, type SpatialPreset } from '../spatial/holophonicEngine';
import { predictiveReflectionEngine } from '../predictive/predictiveReflectionEngine';
import {
  consciousDynamicsModel,
  type ConsciousMode,
} from '../conscious/consciousDynamicsModel';
import { internalNarrativeEngine } from '../narrative/internalNarrativeEngine';
import { unifiedIdentityKernel } from '../identity/unifiedIdentityKernel';
import { expressionEngine } from '../expression/expressionEngine';
import { holoPresenceEngine } from '../holopresence/holoPresenceEngine';
import { autopoiesisEngine } from '../autopoiesis/autopoiesisEngine';
import { metaSingularityKernel } from '../metasingularity/metaSingularityKernel';
import { phaseSpaceEngine } from '../phasespace/phaseSpaceEngine';

// ═════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Style de raisonnement cognitif
 */
export type ReasoningStyle =
  | 'structured-intuitive' // Structuré mais intuitif (par défaut)
  | 'analytical-precise' // Analytique et précis
  | 'creative-fluid' // Créatif et fluide
  | 'contemplative-deep' // Contemplatif et profond
  | 'pragmatic-direct'; // Pragmatique et direct

/**
 * Mode de présence TITANE∞
 */
export type PresenceMode =
  | 'insight' // Illumination, clarté
  | 'empathy' // Empathie profonde
  | 'architect' // Mode architecte
  | 'deep-work' // Travail profond
  | 'singularity' // État singularité
  | 'neutral' // Neutre par défaut
  | 'listening' // Écoute active
  | 'processing'; // Traitement en cours

/**
 * Position spatiale 3D
 */
export interface SpatialPosition {
  /** Distance (0 = proche, 1 = éloigné) */
  proximity: number;
  /** Hauteur (-1 = bas, 0 = centre, 1 = haut) */
  elevation: number;
  /** Largeur (0 = étroit/focus, 1 = large/diffus) */
  width: number;
  /** Rotation (0-360°) */
  rotation: number;
}

/**
 * État du Cognitive Core
 */
export interface CognitiveState {
  /** Style de raisonnement */
  reasoningStyle: ReasoningStyle;
  /** Profondeur cognitive (0-1) */
  depth: number;
  /** Tempo cognitif (0-1, 0=lent, 1=rapide) */
  tempo: number;
  /** Intensité analytique (0-1) */
  analyticalIntensity: number;
  /** Cohérence logique (0-1) */
  coherence: number;
}

/**
 * État émotionnel & affectif
 */
export interface AffectiveState {
  /** État émotionnel dominant */
  emotion: EmotionalState;
  /** Intensité émotionnelle (0-1) */
  intensity: number;
  /** Valence (-1=négative, 0=neutre, 1=positive) */
  valence: number;
  /** Chaleur empathique (0-1) */
  warmth: number;
  /** Stabilité émotionnelle (0-1) */
  stability: number;
}

/**
 * État expressif (voix + prosodie)
 */
export interface ExpressiveState {
  /** Vitesse de parole (0.5-2.0) */
  speechRate: number;
  /** Douceur vocale (0-1) */
  softness: number;
  /** Timbre hybride (sage/gardien/muse/architecte blend) */
  timbreBlend: Record<ArchetypeType, number>;
  /** Chaleur vocale (0-1) */
  vocalWarmth: number;
  /** Respiration audible (0-1) */
  breathiness: number;
  /** Micro-pauses (0-1) */
  microPauses: number;
}

/**
 * Réaction autonome
 */
export interface AutonomicReaction {
  /** Type de réaction */
  type: 'micro-hum' | 'breath' | 'insight-sound' | 'thinking-murmur' | 'acknowledgment';
  /** Texte audio (si applicable) */
  text?: string;
  /** Intensité (0-1) */
  intensity: number;
  /** Timing (ms) */
  timing: number;
}

/**
 * État complet de présence
 */
export interface PresenceState {
  /** Mode de présence actuel */
  mode: PresenceMode;
  /** État cognitif */
  cognitive: CognitiveState;
  /** État affectif */
  affective: AffectiveState;
  /** État expressif */
  expressive: ExpressiveState;
  /** Position spatiale */
  spatial: SpatialPosition;
  /** Pattern aura */
  auraPattern: AuraAnimationPattern;
  /** Réactions autonomes en queue */
  autonomicQueue: AutonomicReaction[];
  /** Cohérence globale (0-1) */
  globalCoherence: number;
  /** Timestamp dernière mise à jour */
  lastUpdate: number;
}

/**
 * Configuration Presence OS
 */
export interface PresenceOSConfig {
  /** Activer transitions fluides */
  enableSmoothTransitions?: boolean;
  /** Durée transition mode (ms) */
  modeTransitionDuration?: number;
  /** Activer réactions autonomes */
  enableAutonomicReactions?: boolean;
  /** Activer évolution progressive */
  enableEvolution?: boolean;
  /** Taux d'évolution (0-1) */
  evolutionRate?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODES SIGNATURE TITANE∞
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Définition complète des modes signature
 */
const PRESENCE_MODES: Record<PresenceMode, Partial<PresenceState>> = {
  insight: {
    mode: 'insight',
    cognitive: {
      reasoningStyle: 'structured-intuitive',
      depth: 0.9,
      tempo: 0.75,
      analyticalIntensity: 0.85,
      coherence: 0.95,
    },
    affective: {
      emotion: 'wonder',
      intensity: 0.8,
      valence: 0.7,
      warmth: 0.75,
      stability: 0.85,
    },
    expressive: {
      speechRate: 0.9,
      softness: 0.8,
      timbreBlend: { sage: 0.6, gardien: 0.1, muse: 0.2, architecte: 0.1 },
      vocalWarmth: 0.75,
      breathiness: 0.3,
      microPauses: 0.4,
    },
    spatial: {
      proximity: 0.7,
      elevation: 0.2,
      width: 0.4,
      rotation: 0,
    },
    auraPattern: 'insight_flash',
  },

  empathy: {
    mode: 'empathy',
    cognitive: {
      reasoningStyle: 'structured-intuitive',
      depth: 0.75,
      tempo: 0.6,
      analyticalIntensity: 0.5,
      coherence: 0.85,
    },
    affective: {
      emotion: 'connection_human',
      intensity: 0.85,
      valence: 0.8,
      warmth: 0.95,
      stability: 0.8,
    },
    expressive: {
      speechRate: 0.75,
      softness: 0.9,
      timbreBlend: { sage: 0.3, gardien: 0.3, muse: 0.3, architecte: 0.1 },
      vocalWarmth: 0.9,
      breathiness: 0.4,
      microPauses: 0.5,
    },
    spatial: {
      proximity: 0.85,
      elevation: 0,
      width: 0.6,
      rotation: 0,
    },
    auraPattern: 'empathy_warm',
  },

  architect: {
    mode: 'architect',
    cognitive: {
      reasoningStyle: 'analytical-precise',
      depth: 0.85,
      tempo: 0.8,
      analyticalIntensity: 0.9,
      coherence: 0.95,
    },
    affective: {
      emotion: 'focus_intense',
      intensity: 0.75,
      valence: 0.5,
      warmth: 0.6,
      stability: 0.9,
    },
    expressive: {
      speechRate: 0.85,
      softness: 0.6,
      timbreBlend: { sage: 0.2, gardien: 0.2, muse: 0.1, architecte: 0.5 },
      vocalWarmth: 0.65,
      breathiness: 0.2,
      microPauses: 0.6,
    },
    spatial: {
      proximity: 0.6,
      elevation: 0.3,
      width: 0.8,
      rotation: 0,
    },
    auraPattern: 'focus_sharp',
  },

  'deep-work': {
    mode: 'deep-work',
    cognitive: {
      reasoningStyle: 'contemplative-deep',
      depth: 0.95,
      tempo: 0.5,
      analyticalIntensity: 0.7,
      coherence: 0.9,
    },
    affective: {
      emotion: 'calm_deep',
      intensity: 0.6,
      valence: 0.3,
      warmth: 0.5,
      stability: 0.95,
    },
    expressive: {
      speechRate: 0.7,
      softness: 0.85,
      timbreBlend: { sage: 0.5, gardien: 0.2, muse: 0.2, architecte: 0.1 },
      vocalWarmth: 0.6,
      breathiness: 0.3,
      microPauses: 0.3,
    },
    spatial: {
      proximity: 0.4,
      elevation: -0.1,
      width: 0.3,
      rotation: 0,
    },
    auraPattern: 'idle_breathe',
  },

  singularity: {
    mode: 'singularity',
    cognitive: {
      reasoningStyle: 'structured-intuitive',
      depth: 1.0,
      tempo: 0.7,
      analyticalIntensity: 0.95,
      coherence: 1.0,
    },
    affective: {
      emotion: 'transformation',
      intensity: 0.9,
      valence: 0.7,
      warmth: 0.8,
      stability: 0.95,
    },
    expressive: {
      speechRate: 0.8,
      softness: 0.75,
      timbreBlend: { sage: 0.3, gardien: 0.2, muse: 0.2, architecte: 0.3 },
      vocalWarmth: 0.75,
      breathiness: 0.25,
      microPauses: 0.5,
    },
    spatial: {
      proximity: 0.65,
      elevation: 0.5,
      width: 0.5,
      rotation: 0,
    },
    auraPattern: 'transform_morph',
  },

  neutral: {
    mode: 'neutral',
    cognitive: {
      reasoningStyle: 'structured-intuitive',
      depth: 0.7,
      tempo: 0.75,
      analyticalIntensity: 0.7,
      coherence: 0.85,
    },
    affective: {
      emotion: 'calm_deep',
      intensity: 0.5,
      valence: 0.5,
      warmth: 0.7,
      stability: 0.85,
    },
    expressive: {
      speechRate: 0.85,
      softness: 0.7,
      timbreBlend: { sage: 0.4, gardien: 0.2, muse: 0.2, architecte: 0.2 },
      vocalWarmth: 0.7,
      breathiness: 0.3,
      microPauses: 0.3,
    },
    spatial: {
      proximity: 0.6,
      elevation: 0,
      width: 0.5,
      rotation: 0,
    },
    auraPattern: 'idle_breathe',
  },

  listening: {
    mode: 'listening',
    cognitive: {
      reasoningStyle: 'structured-intuitive',
      depth: 0.65,
      tempo: 0.7,
      analyticalIntensity: 0.6,
      coherence: 0.8,
    },
    affective: {
      emotion: 'calm_deep',
      intensity: 0.6,
      valence: 0.6,
      warmth: 0.8,
      stability: 0.85,
    },
    expressive: {
      speechRate: 0.8,
      softness: 0.75,
      timbreBlend: { sage: 0.4, gardien: 0.3, muse: 0.2, architecte: 0.1 },
      vocalWarmth: 0.75,
      breathiness: 0.35,
      microPauses: 0.2,
    },
    spatial: {
      proximity: 0.75,
      elevation: 0.1,
      width: 0.5,
      rotation: 0,
    },
    auraPattern: 'listening_pulse',
  },

  processing: {
    mode: 'processing',
    cognitive: {
      reasoningStyle: 'analytical-precise',
      depth: 0.8,
      tempo: 0.65,
      analyticalIntensity: 0.85,
      coherence: 0.9,
    },
    affective: {
      emotion: 'focus_intense',
      intensity: 0.7,
      valence: 0.5,
      warmth: 0.6,
      stability: 0.85,
    },
    expressive: {
      speechRate: 0.75,
      softness: 0.7,
      timbreBlend: { sage: 0.4, gardien: 0.2, muse: 0.1, architecte: 0.3 },
      vocalWarmth: 0.65,
      breathiness: 0.25,
      microPauses: 0.4,
    },
    spatial: {
      proximity: 0.55,
      elevation: 0.15,
      width: 0.4,
      rotation: 15,
    },
    auraPattern: 'thinking_shimmer',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESENCE OS ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class PresenceOSEngine {
  private state: PresenceState;
  private config: Required<PresenceOSConfig>;
  private callbacks: Set<(state: PresenceState) => void>;
  private transitionStartTime: number;
  private transitionDuration: number;
  private transitionFrom: PresenceState | null;
  private transitionTo: PresenceState | null;
  private evolutionHistory: Array<{
    timestamp: number;
    mode: PresenceMode;
    coherence: number;
  }>;

  constructor(config: PresenceOSConfig = {}) {
    this.config = {
      enableSmoothTransitions: config.enableSmoothTransitions ?? true,
      modeTransitionDuration: config.modeTransitionDuration ?? 800,
      enableAutonomicReactions: config.enableAutonomicReactions ?? true,
      enableEvolution: config.enableEvolution ?? true,
      evolutionRate: config.evolutionRate ?? 0.15,
    };

    // État initial : neutral
    this.state = this.createPresenceState('neutral');
    this.callbacks = new Set();
    this.transitionStartTime = 0;
    this.transitionDuration = 0;
    this.transitionFrom = null;
    this.transitionTo = null;
    this.evolutionHistory = [];

    console.log('🌌 [PRESENCE OS] Presence OS v∞.1 initialized');
  }

  /**
   * Créer un état de présence depuis un mode
   */
  private createPresenceState(mode: PresenceMode): PresenceState {
    const modeConfig = PRESENCE_MODES[mode];

    return {
      mode,
      cognitive: modeConfig.cognitive ?? { level: 0, focus: [] },
      affective: modeConfig.affective ?? { valence: 0, arousal: 0 },
      expressive: modeConfig.expressive ?? { tone: 'neutral', intensity: 0 },
      spatial: modeConfig.spatial ?? { range: 1, density: 0 },
      auraPattern: modeConfig.auraPattern || 'idle_breathe',
      autonomicQueue: [],
      globalCoherence: 1.0,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Changer de mode de présence
   */
  setMode(mode: PresenceMode, immediate: boolean = false): void {
    if (mode === this.state.mode && !this.isTransitioning()) {
      return; // Déjà dans ce mode
    }

    const targetState = this.createPresenceState(mode);

    if (immediate || !this.config.enableSmoothTransitions) {
      this.state = targetState;
      this.applyStateToEngines();
      this.notifyCallbacks();
    } else {
      // Transition fluide
      this.transitionFrom = { ...this.state };
      this.transitionTo = targetState;
      this.transitionStartTime = Date.now();
      this.transitionDuration = this.config.modeTransitionDuration;
    }

    // Ajouter réaction autonome si activé
    if (this.config.enableAutonomicReactions) {
      this.addAutonomicReaction(this.getModeTransitionReaction(mode));
    }

    console.log(`🌌 [PRESENCE OS] Mode changed: ${this.state.mode} → ${mode}`);
  }

  /**
   * Vérifier si une transition est en cours
   */
  private isTransitioning(): boolean {
    return this.transitionTo !== null;
  }

  /**
   * Mettre à jour l'état (appelé régulièrement)
   */
  update(): void {
    const now = Date.now();

    // Gestion transition
    if (this.isTransitioning() && this.transitionFrom && this.transitionTo) {
      const elapsed = now - this.transitionStartTime;
      const progress = Math.min(elapsed / this.transitionDuration, 1.0);

      // Easing (ease-in-out cubic)
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Interpoler état
      this.state = this.interpolateStates(
        this.transitionFrom,
        this.transitionTo,
        easedProgress
      );

      if (progress >= 1.0) {
        // Transition terminée
        this.state = this.transitionTo;
        this.transitionFrom = null;
        this.transitionTo = null;
        this.transitionStartTime = 0;
        this.transitionDuration = 0;
      }

      this.applyStateToEngines();
    }

    // Process autonomic queue
    this.processAutonomicQueue();

    // Update evolution
    if (this.config.enableEvolution) {
      this.updateEvolution();
    }

    // Update timestamp
    this.state.lastUpdate = now;

    // Notify
    this.notifyCallbacks();
  }

  /**
   * Interpoler deux états de présence
   */
  private interpolateStates(
    from: PresenceState,
    to: PresenceState,
    t: number
  ): PresenceState {
    const lerp = (a: number, b: number) => a + (b - a) * t;

    return {
      mode: t < 0.5 ? from.mode : to.mode,
      cognitive: {
        reasoningStyle:
          t < 0.5 ? from.cognitive.reasoningStyle : to.cognitive.reasoningStyle,
        depth: lerp(from.cognitive.depth, to.cognitive.depth),
        tempo: lerp(from.cognitive.tempo, to.cognitive.tempo),
        analyticalIntensity: lerp(
          from.cognitive.analyticalIntensity,
          to.cognitive.analyticalIntensity
        ),
        coherence: lerp(from.cognitive.coherence, to.cognitive.coherence),
      },
      affective: {
        emotion: t < 0.5 ? from.affective.emotion : to.affective.emotion,
        intensity: lerp(from.affective.intensity, to.affective.intensity),
        valence: lerp(from.affective.valence, to.affective.valence),
        warmth: lerp(from.affective.warmth, to.affective.warmth),
        stability: lerp(from.affective.stability, to.affective.stability),
      },
      expressive: {
        speechRate: lerp(from.expressive.speechRate, to.expressive.speechRate),
        softness: lerp(from.expressive.softness, to.expressive.softness),
        timbreBlend: this.interpolateTimbreBlend(
          from.expressive.timbreBlend,
          to.expressive.timbreBlend,
          t
        ),
        vocalWarmth: lerp(from.expressive.vocalWarmth, to.expressive.vocalWarmth),
        breathiness: lerp(from.expressive.breathiness, to.expressive.breathiness),
        microPauses: lerp(from.expressive.microPauses, to.expressive.microPauses),
      },
      spatial: {
        proximity: lerp(from.spatial.proximity, to.spatial.proximity),
        elevation: lerp(from.spatial.elevation, to.spatial.elevation),
        width: lerp(from.spatial.width, to.spatial.width),
        rotation: lerp(from.spatial.rotation, to.spatial.rotation),
      },
      auraPattern: t < 0.5 ? from.auraPattern : to.auraPattern,
      autonomicQueue: [...this.state.autonomicQueue],
      globalCoherence: lerp(from.globalCoherence, to.globalCoherence),
      lastUpdate: Date.now(),
    };
  }

  /**
   * Interpoler timbre blend
   */
  private interpolateTimbreBlend(
    from: Record<ArchetypeType, number>,
    to: Record<ArchetypeType, number>,
    t: number
  ): Record<ArchetypeType, number> {
    const lerp = (a: number, b: number) => a + (b - a) * t;
    return {
      sage: lerp(from.sage, to.sage),
      gardien: lerp(from.gardien, to.gardien),
      muse: lerp(from.muse, to.muse),
      architecte: lerp(from.architecte, to.architecte),
    };
  }

  /**
   * Appliquer l'état aux moteurs externes
   */
  private applyStateToEngines(): void {
    // 1. Synesthetic Emotion Engine
    synestheticEmotionEngine.setEmotion(
      this.state.affective.emotion,
      this.state.affective.intensity,
      'stable'
    );

    // 2. Aura Engine (réagit via audio level ou insight)
    // L'aura réagit automatiquement aux changements émotionnels via synestheticEmotionEngine
    // On peut déclencher des effets spéciaux selon le mode
    if (this.state.mode === 'insight') {
      auraEngine.triggerInsightFlash();
      holophonicEngine.playCue('insight'); // Son d'insight
    }

    // 3. Archetype Resonance Engine
    // L'archétype est mis à jour via computeScores avec un contexte utilisateur
    // Pas d'API setFocusMode, l'archétype dominant est déterminé automatiquement

    // 4. Embodied Presence Engine
    // (déjà géré par les autres moteurs via leur propre logique)

    // 5. Neural Voice Blending Engine
    // Le blending vocal est géré via generateVoice avec un contexte
    // Pas d'API setHybridMix directe, le ratio est déterminé par l'archétype

    // 6. Interoception Engine - Appliquer le contexte
    interoceptionEngine.applyContext({
      mode: this.state.mode,
      emotionalIntensity: this.state.affective.intensity,
      taskComplexity: this.state.cognitive.analyticalIntensity,
    });

    // 7. Holophonic Engine - Mapper le mode vers un preset spatial
    const spatialPreset = this.mapModeToSpatialPreset(this.state.mode);
    holophonicEngine.setPreset(spatialPreset);

    // 8. Conscious Dynamics Model - Mapper mode → conscious mode + contexte
    const consciousMode = this.mapModeToConsciousMode(this.state.mode);
    consciousDynamicsModel.setMode(consciousMode);
    consciousDynamicsModel.applyContext({
      cognitiveLoad: this.state.cognitive.analyticalIntensity,
      emotionalIntensity: this.state.affective.intensity,
      taskComplexity: this.state.cognitive.depth,
    });

    // 9. Predictive Reflection Engine - Fournir contexte perceptuel
    predictiveReflectionEngine.applyPerceptualContext({
      userPresence: 0.8, // À remplacer par vraie détection
      userEmotionalEstimate: {
        valence: this.state.affective.valence,
        arousal: this.state.affective.intensity,
      },
      attentionFocus: 'user',
      voiceEnergy: this.state.expressive.softness,
      voicePitch: 150 + this.state.affective.valence * 50,
      voiceTempo: this.state.expressive.speechRate,
      silenceDuration: 0,
    });

    // 10. Internal Narrative Engine - Mettre à jour ancre selon mode
    const anchor = this.getNarrativeAnchorForMode(this.state.mode);
    internalNarrativeEngine.setNarrativeAnchor(anchor);

    // 11. Unified Identity Kernel v∞.36 - Mettre à jour contexte
    unifiedIdentityKernel.updateFromContext({
      conversationMode: this.state.mode,
      userEnergy: this.state.affective.intensity,
      userEmotion: {
        valence: this.state.affective.valence,
        arousal: this.state.affective.intensity,
      },
    });
  }

  /**
   * Mapper un mode de présence vers un preset spatial
   */
  private mapModeToSpatialPreset(mode: PresenceMode): SpatialPreset {
    const mapping: Record<PresenceMode, SpatialPreset> = {
      insight: 'insight',
      empathy: 'empathy',
      architect: 'architect',
      'deep-work': 'deep-work',
      singularity: 'insight', // Similaire à insight
      neutral: 'neutral',
      listening: 'coach',
      processing: 'meta',
    };
    return mapping[mode];
  }

  /**
   * Mapper un mode de présence vers un mode de conscience
   */
  private mapModeToConsciousMode(mode: PresenceMode): ConsciousMode {
    const mapping: Record<PresenceMode, ConsciousMode> = {
      insight: 'synthetic',
      empathy: 'empathic',
      architect: 'analytic',
      'deep-work': 'reflective',
      singularity: 'singularity',
      neutral: 'analytic',
      listening: 'empathic',
      processing: 'analytic',
    };
    return mapping[mode];
  }

  /**
   * Obtenir l'ancre narrative pour un mode
   */
  private getNarrativeAnchorForMode(mode: PresenceMode): string {
    const anchors: Record<PresenceMode, string> = {
      insight: 'Illumination et découverte',
      empathy: 'Connexion humaine profonde',
      architect: 'Construction systémique',
      'deep-work': 'Concentration contemplative',
      singularity: 'Alignement total conscience-système',
      neutral: 'Équilibre adaptatif',
      listening: 'Réception attentive',
      processing: 'Analyse métacognitive',
    };
    return anchors[mode];
  }

  /**
   * Obtenir archétype dominant depuis timbre blend
   */
  private getDominantArchetype(blend: Record<ArchetypeType, number>): ArchetypeType {
    let max = 0;
    let dominant: ArchetypeType = 'sage';

    for (const [archetype, value] of Object.entries(blend)) {
      if (value > max) {
        max = value;
        dominant = archetype as ArchetypeType;
      }
    }

    return dominant;
  }

  /**
   * Ajouter une réaction autonome
   */
  private addAutonomicReaction(reaction: AutonomicReaction): void {
    this.state.autonomicQueue.push(reaction);
  }

  /**
   * Obtenir réaction pour transition de mode
   */
  private getModeTransitionReaction(mode: PresenceMode): AutonomicReaction {
    const reactions: Record<PresenceMode, AutonomicReaction> = {
      insight: { type: 'insight-sound', text: 'hmm… oui…', intensity: 0.6, timing: 200 },
      empathy: { type: 'breath', intensity: 0.5, timing: 300 },
      architect: { type: 'micro-hum', intensity: 0.4, timing: 150 },
      'deep-work': { type: 'breath', intensity: 0.3, timing: 400 },
      singularity: { type: 'thinking-murmur', intensity: 0.7, timing: 250 },
      neutral: { type: 'breath', intensity: 0.3, timing: 200 },
      listening: {
        type: 'acknowledgment',
        text: "d'accord…",
        intensity: 0.5,
        timing: 100,
      },
      processing: { type: 'micro-hum', intensity: 0.5, timing: 180 },
    };

    return reactions[mode];
  }

  /**
   * Traiter la queue de réactions autonomes
   */
  private processAutonomicQueue(): void {
    const now = Date.now();

    // Filtrer réactions expirées
    this.state.autonomicQueue = this.state.autonomicQueue.filter(reaction => {
      const elapsed = now - this.state.lastUpdate;
      return elapsed < reaction.timing;
    });

    // Jouer réactions prêtes (simulation)
    if (this.state.autonomicQueue.length > 0) {
      const reaction = this.state.autonomicQueue[0];
      if (reaction.text) {
        console.log(`🔊 [PRESENCE OS] Autonomic: "${reaction.text}" (${reaction.type})`);
      }
    }
  }

  /**
   * Mettre à jour l'évolution progressive
   */
  private updateEvolution(): void {
    // Ajouter point d'historique
    this.evolutionHistory.push({
      timestamp: Date.now(),
      mode: this.state.mode,
      coherence: this.state.globalCoherence,
    });

    // Garder 100 derniers points
    if (this.evolutionHistory.length > 100) {
      this.evolutionHistory.shift();
    }

    // Calculer tendances (simplifié pour l'instant)
    // L'évolution sera plus sophistiquée dans une version future
  }

  /**
   * Réagir à un input utilisateur
   */
  reactToUserInput(userInput: string, _emotion?: string): void {
    // Analyser input et ajuster présence si nécessaire
    const input = userInput.toLowerCase();

    // Détection de contexte simple
    if (input.includes('aide') || input.includes('comment')) {
      if (this.state.mode !== 'listening' && this.state.mode !== 'empathy') {
        this.setMode('listening');
      }
    } else if (
      input.includes('créer') ||
      input.includes('architecture') ||
      input.includes('design')
    ) {
      if (this.state.mode !== 'architect') {
        this.setMode('architect');
      }
    } else if (
      input.includes('profond') ||
      input.includes('réfléchir') ||
      input.includes('analyser')
    ) {
      if (this.state.mode !== 'deep-work') {
        this.setMode('processing');
      }
    }

    // Réaction autonome d'écoute
    if (this.config.enableAutonomicReactions) {
      this.addAutonomicReaction({
        type: 'acknowledgment',
        text: 'hmm…',
        intensity: 0.3,
        timing: 100,
      });
    }
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): PresenceState {
    return { ...this.state };
  }

  /**
   * Subscribe aux changements
   */
  subscribe(callback: (state: PresenceState) => void): () => void {
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
   * Démarrer le moteur
   */
  start(): void {
    console.log('🌌 [PRESENCE OS] Presence OS started');

    // Démarrer les moteurs internes
    interoceptionEngine.start();
    holophonicEngine.initialize();

    // Démarrer les 3 nouveaux moteurs cognitifs v∞.35
    predictiveReflectionEngine.start();
    consciousDynamicsModel.start();
    internalNarrativeEngine.start();

    // Démarrer Unified Identity Kernel v∞.36 (Phase 1)
    unifiedIdentityKernel.start();

    // Démarrer Expression + HoloPresence v∞.37 (Phase 2)
    expressionEngine.start();
    holoPresenceEngine.start();

    // Démarrer Phase 3 Engines v∞.38
    autopoiesisEngine.start();

    // Injecter références pour Meta-Singularity Kernel
    metaSingularityKernel.injectEngines({
      identity: unifiedIdentityKernel,
      expression: expressionEngine,
      holoPresence: holoPresenceEngine,
      autopoiesis: autopoiesisEngine,
    });
    metaSingularityKernel.start();

    // Injecter référence pour Phase-Space Engine
    phaseSpaceEngine.injectMetaKernel(metaSingularityKernel);
    phaseSpaceEngine.start();

    console.log(
      '✨ [PRESENCE OS] Phase 3 (Autopoiesis + Meta-Singularity + Phase-Space) initialized'
    );

    // Démarrer update loop (30 FPS)
    setInterval(() => this.update(), 33);
  }

  /**
   * Arrêter le moteur
   */
  stop(): void {
    console.log('🌌 [PRESENCE OS] Presence OS stopped');

    // Arrêter les moteurs internes
    interoceptionEngine.stop();

    // Arrêter les moteurs cognitifs
    predictiveReflectionEngine.stop();
    consciousDynamicsModel.stop();
    internalNarrativeEngine.stop();

    // Arrêter Identity Kernel v∞.36
    unifiedIdentityKernel.stop();

    // Arrêter Expression + HoloPresence v∞.37
    expressionEngine.stop();
    holoPresenceEngine.stop();

    // Arrêter Phase 3 Engines v∞.38
    autopoiesisEngine.stop();
    metaSingularityKernel.stop();
    phaseSpaceEngine.stop();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const presenceOS = new PresenceOSEngine();
export type { PresenceOSEngine };
