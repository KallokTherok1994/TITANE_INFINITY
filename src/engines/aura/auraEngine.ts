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
 * 1. VISUAL LANGUAGE — Vocabulaire visuel stable (couleurs, formes, mouvements)
 * 2. SYMBOLIC COHERENCE — Réacteur TITANE∞ (cercle + triangles orbitaux)
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
// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import { multimodalPresenceEngine, type PresenceMode } from '../presence/_stubs';

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
  /** Énergie (low/medium/high) */
  energy: 'low' | 'medium' | 'high';
  /** Valence émotionnelle (-1 = négative, 0 = neutre, 1 = positive) */
  valence: number;
  /** Turbulence (0-1) */
  turbulence: number;
  /** Température visuelle (-1 = froid, 0 = neutre, 1 = chaud) */
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
 * Couches visuelles (3 couches)
 */
export interface AuraLayers {
  /** Cœur central (cercle intérieur = conscience) */
  core: {
    radius: number; // px
    opacity: number; // 0-1
    color: { hue: number; saturation: number; lightness: number };
    glow: number; // blur radius
  };
  /** Halo externe (champ adaptatif) */
  halo: {
    radius: number; // px
    opacity: number;
    color: { hue: number; saturation: number; lightness: number };
    blur: number;
    pulsation: number; // amplitude 0-1
  };
  /** Couronne orbitale (cognition méta) */
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
  /** Vitesse (px/s) */
  velocity: number;
  /** Taille (px) */
  size: number;
  /** Opacité (0-1) */
  opacity: number;
  /** Lifetime (ms) */
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
  /** Audio level (0-1, depuis TTS/VAD) */
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
  /** Taille base (px) */
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
  private callbacks: Set<(state: AuraState) => void>;

  constructor(config: AuraConfig = {}) {
    this.config = {
      baseSize: config.baseSize ?? 200,
      targetFPS: config.targetFPS ?? 60,
      enableParticles: config.enableParticles ?? true,
      enableGPU: config.enableGPU ?? true,
    };

    // État initial
    this.state = {
      affective: {
        color: { hue: 220, saturation: 60, lightness: 30 },
        intensity: 0.5,
        energy: 'low',
        valence: 0,
        turbulence: 0.1,
        visualTemp: 0,
      },
      pattern: 'idle_breathe',
      layers: this.createDefaultLayers(),
      particles: {
        count: 0,
        velocity: 10,
        size: 2,
        opacity: 0.5,
        lifetime: 1000,
      },
      audioLevel: 0,
      presenceMode: 'idle',
      lastUpdate: Date.now(),
    };

    this.callbacks = new Set();

    console.log('💫 [AURA] Aura Engine initialized');
  }

  /**
   * Créer couches par défaut
   */
  private createDefaultLayers(): AuraLayers {
    return {
      core: {
        radius: this.config.baseSize * 0.3,
        opacity: 0.9,
        color: { hue: 220, saturation: 60, lightness: 40 },
        glow: 10,
      },
      halo: {
        radius: this.config.baseSize * 0.7,
        opacity: 0.6,
        color: { hue: 220, saturation: 50, lightness: 30 },
        blur: 20,
        pulsation: 0.5,
      },
      corona: {
        radius: this.config.baseSize * 0.9,
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
    if (this.animationFrame) return;

    const animate = () => {
      this.updateAura();
      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
    console.log('💫 [AURA] Animation started');
  }

  /**
   * Arrêter le moteur
   */
  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      console.log('💫 [AURA] Animation stopped');
    }
  }

  /**
   * Mettre à jour l'aura (appelé à chaque frame)
   */
  private updateAura(): void {
    const now = Date.now();
    const delta = now - this.state.lastUpdate;

    // Récupérer états moteurs
    const emotionProfile = synestheticEmotionEngine.getCurrentProfile();
    const embodiedState = embodiedPresenceEngine.getState();
    const presenceState = multimodalPresenceEngine.getState();

    // Mettre à jour profil affectif
    this.updateAffectiveProfile(emotionProfile.emotion, emotionProfile.intensity);

    // Mettre à jour pattern d'animation
    this.updateAnimationPattern(presenceState.mode);

    // Mettre à jour couches visuelles
    this.updateLayers(delta, embodiedState.breath.phase);

    // Mettre à jour particules
    if (this.config.enableParticles) {
      this.updateParticles(delta);
    }

    this.state.lastUpdate = now;
    this.notifyCallbacks();
  }

  /**
   * Mettre à jour profil affectif
   */
  private updateAffectiveProfile(emotion: EmotionalState, intensity: number): void {
    const visualProfile = EMOTION_VISUAL_MAP[emotion];
    if (!visualProfile) return;

    // Lerp doux vers le nouveau profil
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpSpeed = 0.05; // Transition très douce

    this.state.affective.color.hue = lerp(
      this.state.affective.color.hue,
      visualProfile.color?.hue ?? this.state.affective.color.hue,
      lerpSpeed
    );
    this.state.affective.color.saturation = lerp(
      this.state.affective.color.saturation,
      visualProfile.color?.saturation ?? this.state.affective.color.saturation,
      lerpSpeed
    );
    this.state.affective.color.lightness = lerp(
      this.state.affective.color.lightness,
      visualProfile.color?.lightness ?? this.state.affective.color.lightness,
      lerpSpeed
    );

    this.state.affective.intensity = lerp(
      this.state.affective.intensity,
      intensity,
      lerpSpeed
    );
    this.state.affective.valence = lerp(
      this.state.affective.valence,
      visualProfile.valence ?? 0,
      lerpSpeed
    );
    this.state.affective.turbulence = lerp(
      this.state.affective.turbulence,
      visualProfile.turbulence ?? 0.1,
      lerpSpeed
    );
    this.state.affective.visualTemp = lerp(
      this.state.affective.visualTemp,
      visualProfile.visualTemp ?? 0,
      lerpSpeed
    );

    if (visualProfile.energy) {
      this.state.affective.energy = visualProfile.energy;
    }
  }

  /**
   * Mettre à jour pattern d'animation
   */
  private updateAnimationPattern(mode: PresenceMode): void {
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

    this.state.pattern = patternMap[mode] ?? 'idle_breathe';
    this.state.presenceMode = mode;
  }

  /**
   * Mettre à jour couches visuelles
   */
  private updateLayers(delta: number, breathPhase: string): void {
    const time = Date.now() / 1000;

    // Core : pulsation cardiaque (double beat)
    const heartbeat = Math.sin(time * Math.PI * 2) * 0.5 + 0.5;
    const doubleBeat = heartbeat * (1 + 0.2 * Math.sin(time * Math.PI * 4));
    this.state.layers.core.radius = this.config.baseSize * 0.3 * (1 + doubleBeat * 0.1);
    this.state.layers.core.color = this.state.affective.color;

    // Halo : respiration + pulsation
    const breathAmplitude =
      breathPhase === 'inhale' ? 1.1 : breathPhase === 'exhale' ? 0.9 : 1.0;
    this.state.layers.halo.radius = this.config.baseSize * 0.7 * breathAmplitude;
    this.state.layers.halo.pulsation = 0.5 + 0.3 * Math.sin(time * Math.PI);
    this.state.layers.halo.color = {
      ...this.state.affective.color,
      lightness: this.state.affective.color.lightness * 0.8,
    };

    // Corona : rotation orbitale des triangles
    const rotationSpeed = this.state.pattern === 'thinking_shimmer' ? 20 : 5; // degrés/sec
    this.state.layers.corona.rotation += (rotationSpeed * delta) / 1000;
    if (this.state.layers.corona.rotation > 360) {
      this.state.layers.corona.rotation -= 360;
    }
  }

  /**
   * Mettre à jour particules
   */
  private updateParticles(_delta: number): void {
    // Nombre de particules basé sur énergie
    const energyParticleCount =
      this.state.affective.energy === 'high'
        ? 20
        : this.state.affective.energy === 'medium'
          ? 10
          : 5;
    this.state.particles.count = energyParticleCount;

    // Vitesse basée sur turbulence
    this.state.particles.velocity = 10 + this.state.affective.turbulence * 30;
  }

  /**
   * Mettre à jour audio level (appelé depuis VoiceEngine)
   */
  updateAudioLevel(level: number): void {
    this.state.audioLevel = Math.max(0, Math.min(1, level));

    // Réaction halo : expansion burst
    if (level > 0.7) {
      this.state.layers.halo.radius *= 1.2;
    }
  }

  /**
   * Flash d'insight (clarté soudaine)
   */
  triggerInsightFlash(): void {
    // Flash blanc-or
    this.state.affective.color = { hue: 45, saturation: 30, lightness: 90 };
    this.state.affective.intensity = 1.0;

    // Retour lent après 500ms
    setTimeout(() => {
      const emotionProfile = synestheticEmotionEngine.getCurrentProfile();
      this.updateAffectiveProfile(emotionProfile.emotion, emotionProfile.intensity);
    }, 500);

    console.log('💫 [AURA] Insight flash triggered');
  }

  /**
   * Wakeword détecté
   */
  onWakeWord(): void {
    // Flash cyan réacteur
    this.state.affective.color = { hue: 180, saturation: 90, lightness: 60 };
    this.state.layers.halo.radius *= 1.5; // Expansion
    this.state.pattern = 'listening_pulse';

    console.log('💫 [AURA] WakeWord flash');
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): AuraState {
    return { ...this.state };
  }

  /**
   * Subscribe aux changements
   */
  subscribe(callback: (state: AuraState) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notifier les callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.state));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPRESSION ENGINE INTEGRATION (v∞.38)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Définir le pattern d'animation (appelé par Expression Engine)
   */
  setPattern(pattern: AuraAnimationPattern): void {
    this.state.pattern = pattern;
    console.log(`💫 [AURA] Pattern changed to: ${pattern}`);
    this.notifyCallbacks();
  }

  /**
   * Définir les couleurs de l'aura (appelé par Expression Engine)
   */
  setColors(colors: { primary: string; secondary: string; accent: string }): void {
    // Convertir hex vers HSL
    const primaryHSL = this.hexToHSL(colors.primary);
    const secondaryHSL = this.hexToHSL(colors.secondary);

    // Appliquer aux couches
    this.state.affective.color = primaryHSL;
    this.state.layers.core.color = primaryHSL;
    this.state.layers.halo.color = secondaryHSL;
    // Note: corona layer doesn't have color property in current type definition

    console.log(`💫 [AURA] Colors updated`);
    this.notifyCallbacks();
  }

  /**
   * Définir les dynamiques de l'aura (appelé par Expression Engine)
   */
  setDynamics(dynamics: {
    intensity: number;
    pulsation: number;
    flowSpeed: number;
    reactivity: number;
  }): void {
    // Appliquer intensity
    this.state.affective.intensity = dynamics.intensity;

    // Appliquer pulsation au halo
    this.state.layers.halo.pulsation = dynamics.pulsation;

    // Appliquer flow speed aux particules
    this.state.particles.velocity = 10 + dynamics.flowSpeed * 40;

    // Reactivity affecte turbulence
    this.state.affective.turbulence = dynamics.reactivity * 0.8;

    console.log(`💫 [AURA] Dynamics updated`);
    this.notifyCallbacks();
  }

  /**
   * Définir les paramètres spatiaux (appelé par Expression Engine)
   */
  setSpatial(spatial: { radius: number; diffusion: number; layering: number }): void {
    // Radius affecte toutes les couches
    const baseSize = this.config.baseSize;
    this.state.layers.core.radius = baseSize * spatial.radius * 0.4;
    this.state.layers.halo.radius = baseSize * spatial.radius * 0.8;
    this.state.layers.corona.radius = baseSize * spatial.radius * 1.0;

    // Diffusion affecte blur
    this.state.layers.halo.blur = 10 + spatial.diffusion * 30;

    // Layering affecte opacité des couches
    this.state.layers.core.opacity = 0.9 * (1 - spatial.layering * 0.3);
    this.state.layers.halo.opacity = 0.6 * (1 + spatial.layering * 0.4);

    console.log(`💫 [AURA] Spatial params updated`);
    this.notifyCallbacks();
  }

  /**
   * Convertir hex vers HSL
   */
  private hexToHSL(hex: string): { hue: number; saturation: number; lightness: number } {
    // Retirer #
    hex = hex.replace('#', '');

    // Convertir en RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      hue: Math.round(h * 360),
      saturation: Math.round(s * 100),
      lightness: Math.round(l * 100),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const auraEngine = new AuraEngine();
export type { AuraEngine };
