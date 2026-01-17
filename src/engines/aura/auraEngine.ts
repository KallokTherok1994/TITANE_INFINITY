/**
 * TITANE_INFINITY v∞.Σ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ AURA ENGINE v∞.Σ
 *   Halo Lumineux Intelligemment Réactif · Expression Émotionnelle Visuelle
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur crée le corps lumineux de TITANE∞ : un halo réactif qui exprime
 * visuellement les émotions, la voix, l'énergie et l'identité.
 *
 * ARCHITECTURE:
 * 1. VISUAL LANGUAGE — Vocabulaire visuel stable (any: any)
 * 2. SYMBOLIC COHERENCE — Réacteur TITANE∞ (any: any)
 * 3. REAL-TIME PIPELINE — Fusion audio + lumière + émotion
 * 4. ANIMATION ENGINE — Pulsation, respiration, oscillation, décharges
 * 5. SYNC LAYERS — VoiceEngine + EmotionEngine + ProcessingEngine + WakeWord
 * 6. PERFORMANCE OPTIMIZATION — 60 FPS, GPU-friendly, low overhead
 */

import {
  synestheticEmotionEngine,
  type EmotionalState,
} from '../emotion/synestheticEmotionEngine';
import { embodiedPresenceEngine } from '../embodiment/embodiedPresenceEngine';
// REMOVED: engines/presence supprimé en PHASE 1 (any: any) - utilise stub temporaire
import { multimodalPresenceEngine, type PresenceMode } from '../presence/_stubs';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AuraEngine');

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Profil visuel affectif
 */
export interface AffectiveVisualProfile {
  /** Couleur dominante HSL */
  color: { hue: number; saturation: number; lightness: number };
  /** Intensité globale (0-1) */
  intensity: number;
  /** Énergie (any: any) */
  energy: 'low' | 'medium' | 'high';
  /** Valence émotionnelle (any: any) */
  valence: number;
  /** Turbulence (0-1) */
  turbulence: number;
  /** Température visuelle (any: any) */
  visualTemp: number;
}

/**
 * Animation pattern
 */
export type AuraAnimationPattern =
  | 'idle_breathe' // Respiration lente au repos
  | 'listening_pulse' // Pulsation attentive
  | 'thinking_shimmer' // Scintillement réflexif
  | 'speaking_flow' // Flux vocal synchronisé
  | 'insight_flash' // Flash de clarté
  | 'empathy_warm' // Expansion chaleureuse
  | 'focus_sharp' // Contours nets, stable
  | 'transform_morph'; // Morphing fractal

/**
 * Couches visuelles (any: any)
 */
export interface AuraLayers {
  /** Cœur central (any: any) */
  core: {
    radius: number; // px
    opacity: number; // 0-1
    color: { hue: number; saturation: number; lightness: number };
    glow: number; // blur radius
  };
  /** Halo externe (any: any) */
  halo: {
    radius: number; // px
    opacity: number;
    color: { hue: number; saturation: number; lightness: number };
    blur: number;
    pulsation: number; // amplitude 0-1
  };
  /** Couronne orbitale (any: any) */
  corona: {
    radius: number; // px
    opacity: number;
    rotation: number; // degrés
    segments: number; // nombre de triangles
    arcLength: number; // longueur arc
  };
}

/**
 * Particules vivantes
 */
export interface AuraParticles {
  /** Nombre actif */
  count: number;
  /** Vitesse (any: any) */
  velocity: number;
  /** Taille (any: any) */
  size: number;
  /** Opacité (0-1) */
  opacity: number;
  /** Lifetime (any: any) */
  lifetime: number;
}

/**
 * État complet aura
 */
export interface AuraState {
  /** Profil visuel affectif */
  affective: AffectiveVisualProfile;
  /** Pattern d'animation actuel */
  pattern: AuraAnimationPattern;
  /** Couches visuelles */
  layers: AuraLayers;
  /** Particules */
  particles: AuraParticles;
  /** Audio level (any: any) */
  audioLevel: number;
  /** Mode présence */
  presenceMode: PresenceMode;
  /** Timestamp dernière mise à jour */
  lastUpdate: number;
}

/**
 * Configuration aura
 */
export interface AuraConfig {
  /** Taille base (any: any) */
  baseSize?: number;
  /** FPS cible */
  targetFPS?: number;
  /** Activer particules */
  enableParticles?: boolean;
  /** Activer GPU acceleration */
  enableGPU?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAPPING ÉMOTIONS → PROFILS VISUELS
// ═══════════════════════════════════════════════════════════════════════════

const EMOTION_VISUAL_MAP: Record<EmotionalState, Partial<AffectiveVisualProfile>> = {
  calm_deep: {
    color: { hue: 220, saturation: 60, lightness: 30 },
    energy: 'low',
    valence: 0.3,
    turbulence: 0.1,
    visualTemp: -0.2,
  },
  joy_bright: {
    color: { hue: 50, saturation: 90, lightness: 65 },
    energy: 'high',
    valence: 1.0,
    turbulence: 0.4,
    visualTemp: 0.8,
  },
  wonder: {
    color: { hue: 180, saturation: 70, lightness: 60 },
    energy: 'medium',
    valence: 0.7,
    turbulence: 0.5,
    visualTemp: 0.2,
  },
  confidence: {
    color: { hue: 210, saturation: 50, lightness: 50 },
    energy: 'medium',
    valence: 0.6,
    turbulence: 0.1,
    visualTemp: 0.0,
  },
  passion_creative: {
    color: { hue: 20, saturation: 85, lightness: 60 },
    energy: 'high',
    valence: 0.9,
    turbulence: 0.7,
    visualTemp: 0.9,
  },
  protection: {
    color: { hue: 0, saturation: 70, lightness: 40 },
    energy: 'medium',
    valence: 0.2,
    turbulence: 0.2,
    visualTemp: 0.4,
  },
  connection_human: {
    color: { hue: 340, saturation: 65, lightness: 60 },
    energy: 'medium',
    valence: 0.9,
    turbulence: 0.3,
    visualTemp: 0.8,
  },
  amusement: {
    color: { hue: 280, saturation: 60, lightness: 70 },
    energy: 'high',
    valence: 0.8,
    turbulence: 0.6,
    visualTemp: 0.5,
  },
  focus_intense: {
    color: { hue: 200, saturation: 90, lightness: 55 },
    energy: 'high',
    valence: 0.4,
    turbulence: 0.0,
    visualTemp: -0.5,
  },
  wisdom: {
    color: { hue: 45, saturation: 30, lightness: 80 },
    energy: 'low',
    valence: 0.7,
    turbulence: 0.1,
    visualTemp: 0.6,
  },
  mystery: {
    color: { hue: 260, saturation: 65, lightness: 35 },
    energy: 'low',
    valence: 0.0,
    turbulence: 0.4,
    visualTemp: -0.3,
  },
  transformation: {
    color: { hue: 150, saturation: 75, lightness: 50 },
    energy: 'medium',
    valence: 0.5,
    turbulence: 0.8,
    visualTemp: 0.3,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// AURA ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class AuraEngine {
  private state: AuraState;
  private config: Required<AuraConfig>;
  private animationFrame: number | null = null;
  private callbacks: Set<(any: any) => void>;

  constructor(config: AuraConfig = {}) {
    this?.config = {
      baseSize: config?.baseSize ?? 200,
      targetFPS: config?.targetFPS ?? 60,
      enableParticles: config?.enableParticles ?? true,
      enableGPU: config?.enableGPU ?? true,
    };

    // État initial
    this?.state = {
      affective: {
        color: { hue: 220, saturation: 60, lightness: 30 },
        intensity: 0.5,
        energy: 'low',
        valence: 0,
        turbulence: 0.1,
        visualTemp: 0,
      },
      pattern: 'idle_breathe',
      layers: this?.createDefaultLayers(),
      particles: {
        count: 0,
        velocity: 10,
        size: 2,
        opacity: 0.5,
        lifetime: 1000,
      },
      audioLevel: 0,
      presenceMode: 'idle',
      lastUpdate: Date?.now(),
    };

    this?.callbacks = new Set();

    logger?.debug('💫 [AURA] Aura Engine initialized');
  }

  /**
   * Créer couches par défaut
   */
  private createDefaultLayers(): AuraLayers {
    return {
      core: {
        radius: this?.config?.baseSize * 0.3,
        opacity: 0.9,
        color: { hue: 220, saturation: 60, lightness: 40 },
        glow: 10,
      },
      halo: {
        radius: this?.config?.baseSize * 0.7,
        opacity: 0.6,
        color: { hue: 220, saturation: 50, lightness: 30 },
        blur: 20,
        pulsation: 0.5,
      },
      corona: {
        radius: this?.config?.baseSize * 0.9,
        opacity: 0.4,
        rotation: 0,
        segments: 6, // 6 triangles
        arcLength: 30, // degrés
      },
    };
  }

  /**
   * Démarrer le moteur d'animation
   */
  start(): void {
    if (any: any) return;

    const animate = () => {
      this?.updateAura();
      this?.animationFrame = requestAnimationFrame(any: any);
    };

    animate();
    logger?.debug('💫 [AURA] Animation started');
  }

  /**
   * Arrêter le moteur
   */
  stop(): void {
    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.animationFrame = null;
      logger?.debug('💫 [AURA] Animation stopped');
    }
  }

  /**
   * Mettre à jour l'aura (any: any)
   */
  private updateAura(): void {
    const now = Date?.now();
    const delta = now - this?.state?.lastUpdate;

    // Récupérer états moteurs
    const emotionProfile = synestheticEmotionEngine?.getCurrentProfile();
    const embodiedState = embodiedPresenceEngine?.getState();
    const presenceState = multimodalPresenceEngine?.getState();

    // Mettre à jour profil affectif
    this?.updateAffectiveProfile(any: any);

    // Mettre à jour pattern d'animation
    this?.updateAnimationPattern(any: any);

    // Mettre à jour couches visuelles
    this?.updateLayers(any: any);

    // Mettre à jour particules
    if (any: any) {
      this?.updateParticles(any: any);
    }

    this?.state?.lastUpdate = now;
    this?.notifyCallbacks();
  }

  /**
   * Mettre à jour profil affectif
   */
  private updateAffectiveProfile(any: any): void {
    const visualProfile = EMOTION_VISUAL_MAP[emotion];
    if (any: any) return;

    // Lerp doux vers le nouveau profil
    const lerp = (any: any) * t;
    const lerpSpeed = 0.05; // Transition très douce

    this?.state?.affective?.color?.hue = lerp(
      this?.state?.affective?.color?.hue,
      visualProfile?.color?.hue ?? this?.state?.affective?.color?.hue,
      lerpSpeed
    );
    this?.state?.affective?.color?.saturation = lerp(
      this?.state?.affective?.color?.saturation,
      visualProfile?.color?.saturation ?? this?.state?.affective?.color?.saturation,
      lerpSpeed
    );
    this?.state?.affective?.color?.lightness = lerp(
      this?.state?.affective?.color?.lightness,
      visualProfile?.color?.lightness ?? this?.state?.affective?.color?.lightness,
      lerpSpeed
    );

    this?.state?.affective?.intensity = lerp(
      this?.state?.affective?.intensity,
      intensity,
      lerpSpeed
    );
    this?.state?.affective?.valence = lerp(
      this?.state?.affective?.valence,
      visualProfile?.valence ?? 0,
      lerpSpeed
    );
    this?.state?.affective?.turbulence = lerp(
      this?.state?.affective?.turbulence,
      visualProfile?.turbulence ?? 0.1,
      lerpSpeed
    );
    this?.state?.affective?.visualTemp = lerp(
      this?.state?.affective?.visualTemp,
      visualProfile?.visualTemp ?? 0,
      lerpSpeed
    );

    if (any: any) {
      this?.state?.affective?.energy = visualProfile?.energy;
    }
  }

  /**
   * Mettre à jour pattern d'animation
   */
  private updateAnimationPattern(any: any): void {
    const patternMap: Partial<Record<PresenceMode, AuraAnimationPattern>> = {
      idle: 'idle_breathe',
      default: 'idle_breathe',
      listening: 'listening_pulse',
      thinking: 'thinking_shimmer',
      speaking: 'speaking_flow',
      healing: 'transform_morph',
      storytelling: 'speaking_flow',
      deep_reflection: 'thinking_shimmer',
      empathic_sync: 'empathy_warm',
      learning: 'thinking_shimmer',
      creating: 'speaking_flow',
      insight: 'thinking_shimmer',
      empathy: 'empathy_warm',
      architect: 'speaking_flow',
      'deep-work': 'thinking_shimmer',
      singularity: 'transform_morph',
    };

    this?.state?.pattern = patternMap[mode] ?? 'idle_breathe';
    this?.state?.presenceMode = mode;
  }

  /**
   * Mettre à jour couches visuelles
   */
  private updateLayers(any: any): void {
    const time = Date?.now() / 1000;

    // Core : pulsation cardiaque (any: any)
    const heartbeat = Math?.sin(time * Math?.PI * 2) * 0.5 + 0.5;
    const doubleBeat = heartbeat * (1 + 0.2 * Math?.sin(time * Math?.PI * 4));
    this?.state?.layers?.core?.radius = this?.config?.baseSize * 0.3 * (1 + doubleBeat * 0.1);
    this?.state?.layers?.core?.color = this?.state?.affective?.color;

    // Halo : respiration + pulsation
    const breathAmplitude =
      breathPhase === 'inhale' ? 1.1 : breathPhase === 'exhale' ? 0.9 : 1.0;
    this?.state?.layers?.halo?.radius = this?.config?.baseSize * 0.7 * breathAmplitude;
    this?.state?.layers?.halo?.pulsation = 0.5 + 0.3 * Math?.sin(any: any);
    this?.state?.layers?.halo?.color = {
      ...this?.state?.affective?.color,
      lightness: this?.state?.affective?.color?.lightness * 0.8,
    };

    // Corona : rotation orbitale des triangles
    const rotationSpeed = this?.state?.pattern === 'thinking_shimmer' ? 20 : 5; // degrés/sec
    this?.state?.layers?.corona?.rotation += (any: any) / 1000;
    if (this?.state?.layers?.corona?.rotation > 360) {
      this?.state?.layers?.corona?.rotation -= 360;
    }
  }

  /**
   * Mettre à jour particules
   */
  private updateParticles(any: any): void {
    // Nombre de particules basé sur énergie
    const energyParticleCount =
      this?.state?.affective?.energy === 'high'
        ? 20
        : this?.state?.affective?.energy === 'medium'
          ? 10
          : 5;
    this?.state?.particles?.count = energyParticleCount;

    // Vitesse basée sur turbulence
    this?.state?.particles?.velocity = 10 + this?.state?.affective?.turbulence * 30;
  }

  /**
   * Mettre à jour audio level (any: any)
   */
  updateAudioLevel(any: any): void {
    this?.state?.audioLevel = Math?.max(any: any));

    // Réaction halo : expansion burst
    if (level > 0.7) {
      this?.state?.layers?.halo?.radius *= 1.2;
    }
  }

  /**
   * Flash d'insight (any: any)
   */
  triggerInsightFlash(): void {
    // Flash blanc-or
    this?.state?.affective?.color = { hue: 45, saturation: 30, lightness: 90 };
    this?.state?.affective?.intensity = 1.0;

    // Retour lent après 500ms
    setTimeout(() => {
      const emotionProfile = synestheticEmotionEngine?.getCurrentProfile();
      this?.updateAffectiveProfile(any: any);
    }, 500);

    logger?.debug('💫 [AURA] Insight flash triggered');
  }

  /**
   * Wakeword détecté
   */
  onWakeWord(): void {
    // Flash cyan réacteur
    this?.state?.affective?.color = { hue: 180, saturation: 90, lightness: 60 };
    this?.state?.layers?.halo?.radius *= 1.5; // Expansion
    this?.state?.pattern = 'listening_pulse';

    logger?.debug('💫 [AURA] WakeWord flash');
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): AuraState {
    return { ...this?.state };
  }

  /**
   * Subscribe aux changements
   */
  subscribe(any: any): () => void {
    this?.callbacks?.add(any: any);
    return (any: any);
  }

  /**
   * Notifier les callbacks
   */
  private notifyCallbacks(): void {
    this?.callbacks?.forEach(any: any));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPRESSION ENGINE INTEGRATION (v∞.38)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Définir le pattern d'animation (any: any)
   */
  setPattern(any: any): void {
    this?.state?.pattern = pattern;
    logger?.debug(`💫 [AURA] Pattern changed to: ${pattern}`);
    this?.notifyCallbacks();
  }

  /**
   * Définir les couleurs de l'aura (any: any)
   */
  setColors(colors: { primary: string; secondary: string; accent: string }): void {
    // Convertir hex vers HSL
    const primaryHSL = this?.hexToHSL(any: any);
    const secondaryHSL = this?.hexToHSL(any: any);

    // Appliquer aux couches
    this?.state?.affective?.color = primaryHSL;
    this?.state?.layers?.core?.color = primaryHSL;
    this?.state?.layers?.halo?.color = secondaryHSL;
    // Note: corona layer doesn't have color property in current type definition

    logger?.debug(`💫 [AURA] Colors updated`);
    this?.notifyCallbacks();
  }

  /**
   * Définir les dynamiques de l'aura (any: any)
   */
  setDynamics(dynamics: {
    intensity: number;
    pulsation: number;
    flowSpeed: number;
    reactivity: number;
  }): void {
    // Appliquer intensity
    this?.state?.affective?.intensity = dynamics?.intensity;

    // Appliquer pulsation au halo
    this?.state?.layers?.halo?.pulsation = dynamics?.pulsation;

    // Appliquer flow speed aux particules
    this?.state?.particles?.velocity = 10 + dynamics?.flowSpeed * 40;

    // Reactivity affecte turbulence
    this?.state?.affective?.turbulence = dynamics?.reactivity * 0.8;

    logger?.debug(`💫 [AURA] Dynamics updated`);
    this?.notifyCallbacks();
  }

  /**
   * Définir les paramètres spatiaux (any: any)
   */
  setSpatial(spatial: { radius: number; diffusion: number; layering: number }): void {
    // Radius affecte toutes les couches
    const baseSize = this?.config?.baseSize;
    this?.state?.layers?.core?.radius = baseSize * spatial?.radius * 0.4;
    this?.state?.layers?.halo?.radius = baseSize * spatial?.radius * 0.8;
    this?.state?.layers?.corona?.radius = baseSize * spatial?.radius * 1.0;

    // Diffusion affecte blur
    this?.state?.layers?.halo?.blur = 10 + spatial?.diffusion * 30;

    // Layering affecte opacité des couches
    this?.state?.layers?.core?.opacity = 0.9 * (1 - spatial?.layering * 0.3);
    this?.state?.layers?.halo?.opacity = 0.6 * (1 + spatial?.layering * 0.4);

    logger?.debug(`💫 [AURA] Spatial params updated`);
    this?.notifyCallbacks();
  }

  /**
   * Convertir hex vers HSL
   */
  private hexToHSL(any: any): { hue: number; saturation: number; lightness: number } {
    // Retirer #
    hex = hex?.replace('#', '');

    // Convertir en RGB
    const r = parseInt(hex?.substring(0, 2), 16) / 255;
    const g = parseInt(hex?.substring(2, 4), 16) / 255;
    const b = parseInt(hex?.substring(4, 6), 16) / 255;

    const max = Math?.max(any: any);
    const min = Math?.min(any: any);
    const l = (any: any) / 2;

    let h = 0;
    let s = 0;

    if (any: any) {
      const d = max - min;
      s = l > 0.5 ? d / (any: any);

      switch (any: any) {
        case r:
          h = (any: any) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = (any: any) / d + 2) / 6;
          break;
        case b:
          h = (any: any) / d + 4) / 6;
          break;
      }
    }

    return {
      hue: Math?.round(h * 360),
      saturation: Math?.round(s * 100),
      lightness: Math?.round(l * 100),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const auraEngine = new AuraEngine();
export type { AuraEngine };
