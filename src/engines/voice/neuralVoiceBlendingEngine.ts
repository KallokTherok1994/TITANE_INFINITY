/**
 * TITANE_INFINITY v∞.10.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ SUPER PROMPT X (Revisited) — NEURAL VOICE BLENDING ENGINE
 *   Hybrid Timbre Modeling · Voice Identity Kernel · Style Transfer · Evolution
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur crée une identité vocale unique pour TITANE∞, un timbre hybride
 * qui mélange style prosodique, caractéristiques spectrales et expressivité
 * adaptative.
 *
 * ARCHITECTURE:
 * 1. VOICE IDENTITY KERNEL (VIK) — Profil non-biométrique
 * 2. HYBRID VOICE MIXING ENGINE (HVME) — Mélange adaptatif
 * 3. PROSODY STYLE TRANSFER — Transfert de style prosodique
 * 4. TIMBRE SYNTHESIS LAYER (TSL) — Synthèse neuronale
 * 5. ADAPTIVE VOICE EVOLUTION LOOP (AVEL) — Apprentissage continu
 * 6. COGNITIVE TONE ALIGNMENT — Tonalité cognitive contextuelle
 * 7. MICRO-EXPRESSION OVERLAY — Relief sonore subtil
 * 8. VOICE SIGNATURE STABILIZATION — Cohérence identitaire
 */

import {
  archetypeResonanceEngine,
  type ArchetypeType,
} from '../psyche/archetypeResonanceEngine';
import { logger } from '@/utils/logger';
import type { EmotionalState } from '@/types/voice';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Profil d'identité vocale (Voice Identity Kernel)
 */
export interface VoiceIdentityProfile {
  /** Vecteur timbre spectral (abstrait, non-biométrique) */
  timbreVector: number[];
  /** Brillance (0-1, 0 = sombre, 1 = brillant) */
  brightness: number;
  /** Chaleur (0-1, 0 = froide, 1 = chaleureuse) */
  warmth: number;
  /** Rugosité (0-1, 0 = lisse, 1 = texturé) */
  roughness: number;
  /** Forme d'intonation */
  intonationShape: 'flat' | 'ascending' | 'descending' | 'curved' | 'wave';
  /** Tempo (0.5-1.5) */
  pace: number;
  /** Articulation */
  articulation: 'sharp' | 'smooth' | 'soft';
  /** Pattern respiratoire */
  breathingPattern: 'shallow' | 'natural' | 'deep';
}

/**
 * Ratio de mélange voix
 */
export interface VoiceBlendRatio {
  /** Ratio voix synthétique pure (0-1) */
  synthetic: number;
  /** Ratio style inspiration (0-1) */
  inspired: number;
  /** Contexte justifiant ce ratio */
  context: string;
}

/**
 * Profil prosodique
 */
export interface ProsodyProfile {
  /** Pauses naturelles (ms) */
  pauseDurations: number[];
  /** Micro-hésitations */
  microHesitations: boolean;
  /** Montée tonale phrases affirmatives */
  affirmativeRise: boolean;
  /** Chute douce fin de phrase */
  sentenceDropSoft: boolean;
  /** Accent tonique */
  tonicAccent: 'sharp' | 'rounded' | 'neutral';
  /** Rythme */
  rhythm: 'slow' | 'moderate' | 'fast';
}

/**
 * Tonalité cognitive
 */
export type CognitiveTone =
  | 'empathetic' // Empathique
  | 'soothing' // Apaisante
  | 'directive' // Directive
  | 'inspiring' // Inspirante
  | 'analytical' // Analytique
  | 'warm' // Chaleureuse
  | 'dynamic' // Dynamique
  | 'professional'; // Professionnelle/neutre

/**
 * Micro-expression vocale
 */
export interface VoicalMicroExpression {
  type: 'breath' | 'pause' | 'intonation_shift' | 'volume_dip' | 'speed_shift';
  position: number; // Position dans le texte (0-1)
  intensity: number; // 0-1
  duration: number; // ms
}

/**
 * Contexte voix
 */
export interface VoiceContext {
  /** Archétype actif */
  archetype: ArchetypeType;
  /** État émotionnel */
  emotionState: EmotionalState;
  /** Intention message */
  intention: string;
  /** Mode de présence */
  presenceMode: string;
  /** Intensité (0-1) */
  intensity: number;
}

/**
 * État complet du moteur
 */
export interface NeuralVoiceBlendState {
  /** Profil identité vocale actuel */
  currentProfile: VoiceIdentityProfile;
  /** Ratio de mélange actuel */
  blendRatio: VoiceBlendRatio;
  /** Profil prosodique actif */
  prosody: ProsodyProfile;
  /** Tonalité cognitive active */
  cognitiveTone: CognitiveTone;
  /** Micro-expressions en cours */
  microExpressions: VoicalMicroExpression[];
  /** Signature vocale stable */
  voiceSignature: string;
  /** Nombre de sessions d'apprentissage */
  learningSessionCount: number;
  /** Cohérence identitaire (0-1) */
  identityCoherence: number;
  /** Timestamp dernière mise à jour */
  lastUpdate: number;
}

/**
 * Configuration du moteur
 */
export interface NeuralVoiceBlendConfig {
  /** Activer apprentissage adaptatif */
  enableAdaptiveLearning: boolean;
  /** Learning rate (0-1) */
  learningRate: number;
  /** Stabilité minimale (0-1) */
  minStability: number;
  /** Activer micro-expressions */
  enableMicroExpressions: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESETS (Profils de base selon archétype)
// ═══════════════════════════════════════════════════════════════════════════

export const BASE_VOICE_PROFILES: Record<ArchetypeType, VoiceIdentityProfile> = {
  sage: {
    timbreVector: [0.2, 0.5, -0.3, 0.8],
    brightness: 0.4,
    warmth: 0.65,
    roughness: 0.02,
    intonationShape: 'descending',
    pace: 0.75,
    articulation: 'smooth',
    breathingPattern: 'deep',
  },
  gardien: {
    timbreVector: [0.3, 0.6, 0.1, 0.7],
    brightness: 0.6,
    warmth: 0.85,
    roughness: 0.05,
    intonationShape: 'flat',
    pace: 0.9,
    articulation: 'smooth',
    breathingPattern: 'natural',
  },
  muse: {
    timbreVector: [0.5, 0.4, 0.3, 0.9],
    brightness: 0.8,
    warmth: 0.9,
    roughness: 0.15,
    intonationShape: 'wave',
    pace: 1.1,
    articulation: 'soft',
    breathingPattern: 'shallow',
  },
  architecte: {
    timbreVector: [0.1, 0.7, -0.2, 0.6],
    brightness: 0.7,
    warmth: 0.4,
    roughness: 0.01,
    intonationShape: 'ascending',
    pace: 1.0,
    articulation: 'sharp',
    breathingPattern: 'natural',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NEURAL VOICE BLENDING ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class NeuralVoiceBlendingEngine {
  private state: NeuralVoiceBlendState;
  private config: NeuralVoiceBlendConfig;
  private callbacks: Set<(state: NeuralVoiceBlendState) => void> = new Set();
  private observedPreferences: Map<string, number> = new Map();

  constructor(config: Partial<NeuralVoiceBlendConfig> = {}) {
    this.config = {
      enableAdaptiveLearning: true,
      learningRate: 0.05,
      minStability: 0.8,
      enableMicroExpressions: true,
      ...config,
    };

    this.state = this.initializeState();
  }

  /**
   * Initialiser l'état
   */
  private initializeState(): NeuralVoiceBlendState {
    return {
      currentProfile: BASE_VOICE_PROFILES.sage, // Default
      blendRatio: {
        synthetic: 0.6,
        inspired: 0.4,
        context: 'default',
      },
      prosody: {
        pauseDurations: [200, 400, 600],
        microHesitations: true,
        affirmativeRise: false,
        sentenceDropSoft: true,
        tonicAccent: 'rounded',
        rhythm: 'moderate',
      },
      cognitiveTone: 'warm',
      microExpressions: [],
      voiceSignature: 'TITANE∞-Voice-v1.0',
      learningSessionCount: 0,
      identityCoherence: 1.0,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Générer profil voix hybride basé sur contexte
   */
  generateHybridProfile(context: VoiceContext): VoiceIdentityProfile {
    const baseProfile = BASE_VOICE_PROFILES[context.archetype];
    const blendRatio = this.calculateBlendRatio(context);

    // Interpolate with learned preferences
    const learnedAdjustments = this.getLearnedAdjustments(context);

    const hybrid: VoiceIdentityProfile = {
      timbreVector: baseProfile.timbreVector.map((v, i) =>
        this.lerp(v, learnedAdjustments.timbreVector?.[i] ?? v, this.config.learningRate)
      ),
      brightness: this.lerp(
        baseProfile.brightness,
        learnedAdjustments.brightness || baseProfile.brightness,
        blendRatio.inspired * 0.3
      ),
      warmth: this.lerp(
        baseProfile.warmth,
        learnedAdjustments.warmth || baseProfile.warmth,
        blendRatio.inspired * 0.5
      ),
      roughness: baseProfile.roughness,
      intonationShape: baseProfile.intonationShape,
      pace: this.lerp(
        baseProfile.pace,
        learnedAdjustments.pace || baseProfile.pace,
        blendRatio.inspired * 0.2
      ),
      articulation: baseProfile.articulation,
      breathingPattern: baseProfile.breathingPattern,
    };

    this.state.currentProfile = hybrid;
    this.state.blendRatio = blendRatio;
    this.state.lastUpdate = Date.now();

    return hybrid;
  }

  /**
   * Calculer ratio de mélange selon contexte
   */
  private calculateBlendRatio(context: VoiceContext): VoiceBlendRatio {
    let synthetic = 0.6;
    let inspired = 0.4;
    let ctxt = 'default';

    // Adapter selon émotion
    switch (context.emotionState) {
      case 'concerned':
        synthetic = 0.2;
        inspired = 0.8;
        ctxt = 'empathetic-comfort';
        break;
      case 'calm':
        synthetic = 0.5;
        inspired = 0.5;
        ctxt = 'balanced-presence';
        break;
      case 'focused':
        synthetic = 0.8;
        inspired = 0.2;
        ctxt = 'analytical-precise';
        break;
      case 'playful':
      case 'enthusiastic':
        synthetic = 0.3;
        inspired = 0.7;
        ctxt = 'warm-inspiring';
        break;
    }

    // Adapter selon archétype
    switch (context.archetype) {
      case 'sage':
        synthetic += 0.1;
        inspired -= 0.1;
        break;
      case 'muse':
        synthetic -= 0.15;
        inspired += 0.15;
        break;
      case 'gardien':
        synthetic -= 0.1;
        inspired += 0.1;
        break;
      case 'architecte':
        synthetic += 0.2;
        inspired -= 0.2;
        break;
    }

    // Clamp
    synthetic = Math.max(0.1, Math.min(0.9, synthetic));
    inspired = 1 - synthetic;

    return { synthetic, inspired, context: ctxt };
  }

  /**
   * Obtenir ajustements appris
   */
  private getLearnedAdjustments(context: VoiceContext): Partial<VoiceIdentityProfile> {
    const key = `${context.archetype}-${context.emotionState}`;
    const preference = this.observedPreferences.get(key) || 0.5;

    return {
      timbreVector: [0, 0, 0, 0],
      brightness: preference > 0.6 ? 0.7 : 0.5,
      warmth: preference > 0.5 ? 0.8 : 0.6,
      pace: preference > 0.7 ? 1.1 : 0.9,
    };
  }

  /**
   * Générer profil prosodique selon contexte
   */
  generateProsody(context: VoiceContext): ProsodyProfile {
    const prosody: ProsodyProfile = { ...this.state.prosody };

    // Adapter selon archétype
    switch (context.archetype) {
      case 'sage':
        prosody.pauseDurations = [300, 500, 800];
        prosody.rhythm = 'slow';
        prosody.tonicAccent = 'rounded';
        break;
      case 'gardien':
        prosody.pauseDurations = [200, 400, 600];
        prosody.rhythm = 'moderate';
        prosody.tonicAccent = 'neutral';
        break;
      case 'muse':
        prosody.pauseDurations = [150, 300, 450];
        prosody.rhythm = 'fast';
        prosody.tonicAccent = 'sharp';
        prosody.microHesitations = true;
        break;
      case 'architecte':
        prosody.pauseDurations = [200, 350, 500];
        prosody.rhythm = 'moderate';
        prosody.tonicAccent = 'sharp';
        prosody.microHesitations = false;
        break;
    }

    this.state.prosody = prosody;
    return prosody;
  }

  /**
   * Déterminer tonalité cognitive
   */
  determineCognitiveTone(context: VoiceContext): CognitiveTone {
    // Mapping archétype → tonalité
    const archetypeToneMap: Record<ArchetypeType, CognitiveTone> = {
      sage: 'soothing',
      gardien: 'directive',
      muse: 'inspiring',
      architecte: 'analytical',
    };

    let tone = archetypeToneMap[context.archetype];

    // Override selon émotion
    if (context.emotionState === 'concerned') {
      tone = 'empathetic';
    } else if (context.emotionState === 'playful') {
      tone = 'warm';
    } else if (context.emotionState === 'focused') {
      tone = 'professional';
    }

    this.state.cognitiveTone = tone;
    return tone;
  }

  /**
   * Injecter micro-expressions vocales
   */
  injectMicroExpressions(text: string, context: VoiceContext): VoicalMicroExpression[] {
    if (!this.config.enableMicroExpressions) return [];

    const expressions: VoicalMicroExpression[] = [];
    const words = text.split(' ');
    const wordCount = words.length;

    // Breath au début si phrase longue
    if (wordCount > 15) {
      expressions.push({
        type: 'breath',
        position: 0.05,
        intensity: 0.3,
        duration: 150,
      });
    }

    // Pause mi-phrase
    if (wordCount > 8) {
      expressions.push({
        type: 'pause',
        position: 0.5,
        intensity: 0.4,
        duration: 200,
      });
    }

    // Intonation shift selon tonalité
    if (
      this.state.cognitiveTone === 'empathetic' ||
      this.state.cognitiveTone === 'warm'
    ) {
      expressions.push({
        type: 'intonation_shift',
        position: 0.7,
        intensity: 0.5,
        duration: 300,
      });
    }

    // Volume dip pour emphasis
    if (context.intensity > 0.7) {
      expressions.push({
        type: 'volume_dip',
        position: 0.3,
        intensity: 0.3,
        duration: 100,
      });
    }

    this.state.microExpressions = expressions;
    return expressions;
  }

  /**
   * Apprendre de session (évolution adaptative)
   */
  learnFromSession(context: VoiceContext, userFeedback?: { satisfaction: number }): void {
    if (!this.config.enableAdaptiveLearning) return;

    const key = `${context.archetype}-${context.emotionState}`;
    const currentPref = this.observedPreferences.get(key) || 0.5;

    // Update preference
    const feedbackScore = userFeedback?.satisfaction || 0.7; // Default neutral
    const newPref =
      currentPref + (feedbackScore - currentPref) * this.config.learningRate;

    this.observedPreferences.set(key, newPref);
    this.state.learningSessionCount++;

    // Update identity coherence (slow increase)
    this.state.identityCoherence = Math.min(1, this.state.identityCoherence + 0.001);

    logger.debug(
      `🎤 [VOICE-BLEND] Learning session ${this.state.learningSessionCount} — ${key} → ${Math.round(newPref * 100)}%`
    );
  }

  /**
   * Stabiliser signature vocale
   */
  stabilizeSignature(): void {
    if (this.state.identityCoherence < this.config.minStability) {
      logger.debug('⚠️ [VOICE-BLEND] Signature instable, stabilisation...');

      // Force convergence vers profil dominant
      const dominant = archetypeResonanceEngine.getDominantProfile();
      this.state.currentProfile = BASE_VOICE_PROFILES[dominant.type];
      this.state.identityCoherence = this.config.minStability;
    }

    // Update signature version
    const version = `v${Math.floor(this.state.learningSessionCount / 10)}.${this.state.learningSessionCount % 10}`;
    this.state.voiceSignature = `TITANE∞-Voice-${version}`;

    logger.debug(
      `🎙️ [VOICE-BLEND] Voice signature stabilized: ${this.state.voiceSignature}`
    );
  }

  /**
   * Générer voix complète pour un texte
   */
  generateVoiceOutput(
    text: string,
    context: VoiceContext
  ): {
    profile: VoiceIdentityProfile;
    prosody: ProsodyProfile;
    tone: CognitiveTone;
    microExpressions: VoicalMicroExpression[];
  } {
    const profile = this.generateHybridProfile(context);
    const prosody = this.generateProsody(context);
    const tone = this.determineCognitiveTone(context);
    const microExpressions = this.injectMicroExpressions(text, context);

    logger.debug(
      `🎤 [VOICE-BLEND] Voice generated: ${tone} ${context.archetype} (blend: ${Math.round(this.state.blendRatio.inspired * 100)}% inspired)`
    );

    this.notifyCallbacks();

    return {
      profile,
      prosody,
      tone,
      microExpressions,
    };
  }

  /**
   * Obtenir état actuel
   */
  getState(): NeuralVoiceBlendState {
    return { ...this.state };
  }

  /**
   * Subscribe aux changements
   */
  subscribe(callback: (state: NeuralVoiceBlendState) => void): () => void {
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
        logger.error('Callback error:', error);
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

export const neuralVoiceBlendingEngine = new NeuralVoiceBlendingEngine({
  enableAdaptiveLearning: true,
  learningRate: 0.05,
  minStability: 0.8,
  enableMicroExpressions: true,
});
