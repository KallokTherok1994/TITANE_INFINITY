/**
 * TITANE_INFINITY v∞.33 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ SUPER PROMPT XXXIII — UNIFIED MULTIMODAL OUTPUT ENGINE
 *   Voix + Halo + Avatar + Lumière + Narration + Corps + Temporalité
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur est le chef d'orchestre final qui unifie TOUTES les modalités
 * d'expression de TITANE∞ en un seul pipeline cohérent et synchronisé.
 *
 * ARCHITECTURE:
 * 1. INPUT LAYER — Collecte états de tous les moteurs
 * 2. COHERENCE ENGINE — Garantit cohérence multimodale
 * 3. MODALITY SYNTHESIS — Génère frames pour chaque canal
 * 4. TEMPORAL SYNCHRONIZATION — Aligne tous les canaux temporellement
 * 5. OUTPUT PACKAGE — Package unifié pour frontend
 * 6. FRONTEND BROADCAST — Événements synchronisés
 * 7. SELF-EVOLUTION — Apprentissage style multimodal
 */

import {
  synestheticEmotionEngine,
  type SynestheticProfile,
} from '../emotion/synestheticEmotionEngine';
import {
  embodiedPresenceEngine,
  type EmbodiedPresenceState,
} from '../embodiment/embodiedPresenceEngine';
import { metaContinuumEngine } from '../continuum/metaContinuumEngine';
import {
  archetypeResonanceEngine,
  type ArchetypeResonance,
} from '../psyche/archetypeResonanceEngine';
// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import {
  multimodalPresenceEngine,
  type MultimodalPresenceState,
} from '../presence/_stubs';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Frame de sortie vocale
 */
export interface VoiceFrame {
  /** Timbre (0-1) */
  timbre: number;
  /** Vitesse (0.5-1.5) */
  speed: number;
  /** Intensité (0-1) */
  intensity: number;
  /** Chaleur (0-1) */
  warmth: number;
  /** Souffle (0-1) */
  breathiness: number;
  /** Prosodie */
  prosody: {
    pitch: number; // Hauteur relative
    emphasis: number; // Accentuation
  };
}

/**
 * Frame de texte narratif
 */
export interface TextFrame {
  /** Cadence (0.5-1.5) */
  cadence: number;
  /** Densité symbolique (0-1) */
  symbolDensity: number;
  /** Tension narrative (0-1) */
  tension: number;
  /** Ouverture émotionnelle (0-1) */
  emotionalOpenness: number;
  /** Style */
  style: 'poetic' | 'direct' | 'analytical' | 'warm' | 'inspiring' | 'mysterious';
}

/**
 * Frame de halo
 */
export interface HaloFrame {
  /** Couleur HSL */
  color: { hue: number; saturation: number; lightness: number };
  /** Intensité (0-1) */
  intensity: number;
  /** Pulsation (0-1, vitesse) */
  pulsation: number;
  /** Pattern */
  pattern:
    | 'soft_pulse'
    | 'shimmer'
    | 'stable'
    | 'rhythmic'
    | 'flowing'
    | 'geometric'
    | 'morphing';
  /** Géométrie (pour patterns avancés) */
  geometry?: {
    radius: number;
    segments: number;
    rotation: number;
  };
}

/**
 * Frame d'avatar
 */
export interface AvatarFrame {
  /** Posture */
  posture: 'open' | 'centered' | 'forward' | 'back' | 'wide';
  /** Mouvement */
  movement: 'still' | 'gentle' | 'flowing' | 'dynamic' | 'expansive';
  /** Regard (direction) */
  gaze: { x: number; y: number };
  /** Rythmes de mouvement (oscillations par seconde) */
  rhythm: number;
  /** Micro-oscillations (amplitude 0-1) */
  oscillation: number;
}

/**
 * Frame d'aura
 */
export interface AuraFrame {
  /** Densité (0-1) */
  density: number;
  /** Expansion (0-1) */
  expansion: number;
  /** Chaleur (-1 = froid, 0 = neutre, 1 = chaud) */
  warmth: number;
  /** Vibration (0-1) */
  vibration: number;
  /** Texture */
  texture: 'smooth' | 'granular' | 'flowing' | 'crystalline';
}

/**
 * Enveloppe temporelle (timing)
 */
export interface TemporalEnvelope {
  /** Timestamp début */
  start: number;
  /** Durée totale (ms) */
  duration: number;
  /** Phases (pour sync multi-étapes) */
  phases: Array<{
    name: string;
    startOffset: number; // ms depuis start
    duration: number;
  }>;
}

/**
 * Package de sortie unifié
 */
export interface UnifiedMultimodalOutput {
  /** Frames vocaux */
  voice: VoiceFrame[];
  /** Frame textuel */
  text: TextFrame;
  /** Frames halo */
  halo: HaloFrame[];
  /** Frames avatar */
  avatar: AvatarFrame[];
  /** Frames aura */
  aura: AuraFrame[];
  /** Enveloppe temporelle */
  timing: TemporalEnvelope;
  /** Métadonnées */
  metadata: {
    emotion: string;
    archetype: string;
    coherence: number;
  };
}

/**
 * État du moteur unifié
 */
export interface UnifiedOutputState {
  /** Dernier output généré */
  lastOutput: UnifiedMultimodalOutput | null;
  /** Output en cours (si streaming) */
  currentOutput: UnifiedMultimodalOutput | null;
  /** Timestamp dernière génération */
  lastGenerationTime: number;
  /** Compteur outputs */
  outputCount: number;
  /** Métriques de cohérence */
  coherenceMetrics: {
    voiceHaloSync: number; // 0-1
    avatarEmotionSync: number; // 0-1
    narrativeToneSync: number; // 0-1
    temporalCoherence: number; // 0-1
    globalCoherence: number; // 0-1
  };
}

/**
 * Configuration moteur
 */
export interface UnifiedOutputConfig {
  /** Durée frame halo (ms) */
  haloFrameDuration?: number;
  /** Durée frame avatar (ms) */
  avatarFrameDuration?: number;
  /** Activer auto-coherence check */
  enableCoherenceCheck?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED MULTIMODAL OUTPUT ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class UnifiedMultimodalOutputEngine {
  private state: UnifiedOutputState;
  private config: Required<UnifiedOutputConfig>;
  private callbacks: Set<(output: UnifiedMultimodalOutput) => void>;

  constructor(config: UnifiedOutputConfig = {}) {
    this.config = {
      haloFrameDuration: config.haloFrameDuration ?? 50, // 20 FPS
      avatarFrameDuration: config.avatarFrameDuration ?? 33, // 30 FPS
      enableCoherenceCheck: config.enableCoherenceCheck ?? true,
    };

    this.state = {
      lastOutput: null,
      currentOutput: null,
      lastGenerationTime: 0,
      outputCount: 0,
      coherenceMetrics: {
        voiceHaloSync: 1.0,
        avatarEmotionSync: 1.0,
        narrativeToneSync: 1.0,
        temporalCoherence: 1.0,
        globalCoherence: 1.0,
      },
    };

    this.callbacks = new Set();

    logger.debug('🎭 [UNIFIED OUTPUT] Unified Multimodal Output Engine initialized');
  }

  /**
   * Générer un output multimodal unifié
   */
  generateOutput(context: {
    text?: string;
    duration?: number;
    intent?: string;
  }): UnifiedMultimodalOutput {
    const now = Date.now();

    // 1. Collecter états de tous les moteurs
    const emotionProfile = synestheticEmotionEngine.getCurrentProfile();
    const embodiedState = embodiedPresenceEngine.getState();
    const _continuumState = metaContinuumEngine.getState();
    const archetypeState = archetypeResonanceEngine.getState();
    const presenceState = multimodalPresenceEngine.getState();

    // 2. Vérifier cohérence
    const coherenceScore = this.checkCoherence(
      emotionProfile,
      embodiedState,
      archetypeState
    );

    // 3. Générer frames pour chaque modalité
    const voiceFrames = this.generateVoiceFrames(emotionProfile, embodiedState);
    const textFrame = this.generateTextFrame(emotionProfile, archetypeState);
    const haloFrames = this.generateHaloFrames(emotionProfile, presenceState);
    const avatarFrames = this.generateAvatarFrames(embodiedState, emotionProfile);
    const auraFrames = this.generateAuraFrames(embodiedState, emotionProfile);

    // 4. Créer enveloppe temporelle
    const duration = context.duration ?? 2000; // Défaut 2s
    const timing = this.createTemporalEnvelope(duration);

    // 5. Assembler output unifié
    const output: UnifiedMultimodalOutput = {
      voice: voiceFrames,
      text: textFrame,
      halo: haloFrames,
      avatar: avatarFrames,
      aura: auraFrames,
      timing,
      metadata: {
        emotion: emotionProfile.emotion,
        archetype: archetypeState.dominant,
        coherence: coherenceScore,
      },
    };

    // 6. Mettre à jour état
    this.state.lastOutput = output;
    this.state.currentOutput = output;
    this.state.lastGenerationTime = now;
    this.state.outputCount++;

    // 7. Notifier callbacks
    this.notifyCallbacks(output);

    logger.debug(
      `🎭 [UNIFIED OUTPUT] Generated output #${this.state.outputCount} (coherence: ${coherenceScore.toFixed(2)})`
    );

    return output;
  }

  /**
   * Générer frames vocaux
   */
  private generateVoiceFrames(
    emotion: SynestheticProfile,
    embodied: EmbodiedPresenceState
  ): VoiceFrame[] {
    const baseFrame: VoiceFrame = {
      timbre: emotion.voice.depth,
      speed: emotion.voice.tempo,
      intensity: emotion.intensity,
      warmth: emotion.voice.warmth,
      breathiness: emotion.voice.breathiness,
      prosody: {
        pitch: 0.5, // Neutre
        emphasis: emotion.intensity * 0.7,
      },
    };

    // Ajuster selon respiration
    if (embodied.breath.phase === 'inhale') {
      baseFrame.prosody.pitch += 0.1;
    } else if (embodied.breath.phase === 'exhale') {
      baseFrame.prosody.pitch -= 0.05;
    }

    return [baseFrame]; // Pour l'instant, 1 frame unique
  }

  /**
   * Générer frame textuel
   */
  private generateTextFrame(
    emotion: SynestheticProfile,
    _archetype: ArchetypeResonance
  ): TextFrame {
    return {
      cadence: emotion.narrative.cadence,
      symbolDensity: emotion.narrative.symbolDensity,
      tension: 1 - emotion.cognitive.stability, // Moins stable = plus de tension
      emotionalOpenness: emotion.narrative.emotionalOpenness,
      style: emotion.narrative.style,
    };
  }

  /**
   * Générer frames halo (array pour animation)
   */
  private generateHaloFrames(
    emotion: SynestheticProfile,
    _presence: MultimodalPresenceState
  ): HaloFrame[] {
    const frameCount = 20; // 1 seconde à 20 FPS
    const frames: HaloFrame[] = [];

    for (let i = 0; i < frameCount; i++) {
      const t = i / frameCount;

      // Pulsation sinusoïdale
      const pulsation =
        emotion.haloPattern === 'soft_pulse'
          ? 0.5 + 0.3 * Math.sin(t * Math.PI * 2)
          : emotion.haloPattern === 'rhythmic'
            ? 0.6 + 0.4 * Math.sin(t * Math.PI * 4)
            : 0.7;

      frames.push({
        color: emotion.color,
        intensity: emotion.intensity * pulsation,
        pulsation,
        pattern: emotion.haloPattern,
      });
    }

    return frames;
  }

  /**
   * Générer frames avatar
   */
  private generateAvatarFrames(
    embodied: EmbodiedPresenceState,
    emotion: SynestheticProfile
  ): AvatarFrame[] {
    const frameCount = 30; // 1 seconde à 30 FPS
    const frames: AvatarFrame[] = [];

    // Mapper PostureType vers les valeurs AvatarFrame attendues
    const mapPosture = (
      postureType: string
    ): 'open' | 'centered' | 'forward' | 'back' | 'wide' => {
      if (postureType === 'recede') return 'back';
      if (postureType === 'expansive') return 'wide';
      if (['open', 'centered', 'forward'].includes(postureType)) {
        return postureType as 'open' | 'centered' | 'forward';
      }
      return 'centered'; // Défaut
    };

    for (let i = 0; i < frameCount; i++) {
      const t = i / frameCount;

      // Micro-oscillations
      const oscillation = 0.05 * Math.sin(t * Math.PI * 6); // 3 cycles/sec

      frames.push({
        posture: mapPosture(embodied.posture.type),
        movement: emotion.presence.movement,
        gaze: { x: 0, y: 0 }, // Centré par défaut
        rhythm: 3.0, // 3 oscillations/sec
        oscillation: oscillation + 0.05,
      });
    }

    return frames;
  }

  /**
   * Générer frames aura
   */
  private generateAuraFrames(
    embodied: EmbodiedPresenceState,
    emotion: SynestheticProfile
  ): AuraFrame[] {
    // Mapper temperature (-1 à 1) vers warmth
    const warmth = embodied.energyField.temperature;

    return [
      {
        density: embodied.energyField.density,
        expansion: emotion.presence.expansion,
        warmth,
        vibration: emotion.intensity * 0.5,
        texture: embodied.energyField.texture === 'fluid' ? 'flowing' : 'smooth',
      },
    ];
  }

  /**
   * Créer enveloppe temporelle
   */
  private createTemporalEnvelope(duration: number): TemporalEnvelope {
    return {
      start: Date.now(),
      duration,
      phases: [
        { name: 'intro', startOffset: 0, duration: duration * 0.2 },
        { name: 'main', startOffset: duration * 0.2, duration: duration * 0.6 },
        { name: 'outro', startOffset: duration * 0.8, duration: duration * 0.2 },
      ],
    };
  }

  /**
   * Vérifier cohérence multimodale
   */
  private checkCoherence(
    emotion: SynestheticProfile,
    embodied: EmbodiedPresenceState,
    _archetype: ArchetypeResonance
  ): number {
    // Cohérence voix-halo (warmth similaire)
    const voiceHaloSync =
      1 - Math.abs(emotion.voice.warmth - emotion.color.saturation / 100);

    // Cohérence avatar-émotion (movement correspond à intensity)
    const movementIntensity =
      emotion.presence.movement === 'still'
        ? 0.2
        : emotion.presence.movement === 'gentle'
          ? 0.4
          : emotion.presence.movement === 'flowing'
            ? 0.6
            : emotion.presence.movement === 'dynamic'
              ? 0.8
              : 1.0;
    const avatarEmotionSync = 1 - Math.abs(movementIntensity - emotion.intensity);

    // Cohérence narrative-tone
    const narrativeToneSync = emotion.cognitive.stability; // Plus stable = plus cohérent

    // Cohérence temporelle (respiration alignée)
    const temporalCoherence = embodied.breath.amplitude > 0 ? 1.0 : 0.7;

    // Moyenne globale
    const globalCoherence =
      (voiceHaloSync + avatarEmotionSync + narrativeToneSync + temporalCoherence) / 4;

    // Mettre à jour métriques
    this.state.coherenceMetrics = {
      voiceHaloSync,
      avatarEmotionSync,
      narrativeToneSync,
      temporalCoherence,
      globalCoherence,
    };

    return globalCoherence;
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): UnifiedOutputState {
    return { ...this.state };
  }

  /**
   * Subscribe aux outputs
   */
  subscribe(callback: (output: UnifiedMultimodalOutput) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notifier les callbacks
   */
  private notifyCallbacks(output: UnifiedMultimodalOutput): void {
    this.callbacks.forEach(callback => callback(output));
  }

  /**
   * Démarrer le moteur
   */
  start(): void {
    logger.debug('🎼 [OUTPUT] Unified Multimodal Output Engine started');
  }

  /**
   * Arrêter le moteur
   */
  stop(): void {
    logger.debug('🎼 [OUTPUT] Unified Multimodal Output Engine stopped');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const unifiedMultimodalOutputEngine = new UnifiedMultimodalOutputEngine();
export type { UnifiedMultimodalOutputEngine };
