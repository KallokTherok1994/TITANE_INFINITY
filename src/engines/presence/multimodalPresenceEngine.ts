/**
 * TITANE_INFINITY v∞.28 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ SUPER PROMPT XXVIII — MULTIMODAL PRESENCE ENGINE
 *   Synchronisation Voix + Halo + Avatar + Respiration + Micro-Mimics
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur unifie toutes les modalités d'expression de TITANE∞ dans une
 * présence cohérente, vivante et continue.
 *
 * ARCHITECTURE:
 * 1. CORE PRESENCE LOOP (20-60Hz) — Cycle multimodal continu
 * 2. VOCAL SYNCHRONIZATION — Voix ↔ Halo ↔ Avatar
 * 3. RESPIRATION ENGINE — Cycles respiratoires (2.5-6s)
 * 4. HALO EXPRESSION ENGINE — Couleurs, intensité, pulsations
 * 5. AVATAR MICRO-MIMICS — Blinks, mouvements microscopiques
 * 6. INTENTION-TO-BODY MAPPER — Intention → Expression physique
 * 7. INNER DIALOGUE → OUTER PRESENCE — État interne visible
 * 8. USER MIRRORING — Synchronisation empathique (<15%)
 * 9. MULTIMODAL HEALING MODE — Auto-réparation expressive
 * 10. STORY PRESENCE MODE — Mode narratif immersif
 * 11. ACTIVE LISTENING MODE — Éveil sur wakeword
 */

import { haloEngine, type HaloState } from '@/services/voice/haloEngine';
import type { ThinkingState, InnerDialogueState } from '@/services/voice/innerDialogueController';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * État de présence global de TITANE∞
 */
export type PresenceMode =
  | 'idle'              // Repos calme
  | 'listening'         // Écoute active (post-wakeword)
  | 'thinking'          // Réflexion interne
  | 'speaking'          // Parole active (TTS)
  | 'healing'           // Mode auto-réparation
  | 'storytelling'      // Mode narratif
  | 'deep_reflection'   // Méditation profonde
  | 'empathic_sync';    // Synchronisation empathique

/**
 * Configuration cycle respiratoire
 */
export interface BreathingCycle {
  /** Phase actuelle (inhale/hold/exhale/rest) */
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  /** Durée totale du cycle (ms) */
  cycleDuration: number;
  /** Amplitude (0-1) */
  amplitude: number;
  /** Ratio inspiratoire (défaut 0.4 = 40% inhale) */
  inhaleRatio: number;
  /** Ratio hold (défaut 0.1 = 10% hold) */
  holdRatio: number;
  /** Ratio expiratoire (défaut 0.4 = 40% exhale) */
  exhaleRatio: number;
  /** Ratio rest (défaut 0.1 = 10% rest) */
  restRatio: number;
}

/**
 * Couleur halo étendue (au-delà des 5 états de base)
 */
export interface HaloColorExpression {
  /** Hue HSL (0-360°) */
  hue: number;
  /** Saturation (0-100%) */
  saturation: number;
  /** Luminosité (0-100%) */
  lightness: number;
  /** Intention sémantique */
  intention: string;
}

/**
 * Configuration micro-mouvements avatar
 */
export interface AvatarMicroMimics {
  /** Fréquence blink (ms) */
  blinkInterval: number;
  /** Dernier blink (timestamp) */
  lastBlink: number;
  /** Mouvement oculaire en cours */
  eyeMovement: { x: number; y: number; speed: number };
  /** Inclinaison tête (degrés) */
  headTilt: { pitch: number; yaw: number; roll: number };
  /** Expression micro-faciale */
  microExpression: 'neutral' | 'smile' | 'focus' | 'concern' | 'empathy';
  /** Luminosité faciale (0-1) */
  facialGlow: number;
}

/**
 * Intention expressive (mapping intention → modalités)
 */
export interface ExpressiveIntention {
  /** Type d'intention */
  type:
    | 'guidance'
    | 'comfort'
    | 'analysis'
    | 'inspiration'
    | 'surprise'
    | 'storytelling'
    | 'listening';
  /** Intensité (0-1) */
  intensity: number;
  /** Durée cible (ms) */
  duration: number;
  /** Modalités impactées */
  modalities: {
    voice?: { tempo: number; warmth: number };
    halo?: HaloColorExpression;
    breath?: { amplitude: number; cycleDuration: number };
    avatar?: Partial<AvatarMicroMimics>;
  };
}

/**
 * État complet du moteur multimodal
 */
export interface MultimodalPresenceState {
  /** Mode de présence actuel */
  mode: PresenceMode;
  /** Cycle respiratoire */
  breathing: BreathingCycle;
  /** Expression halo */
  halo: {
    state: HaloState;
    color: HaloColorExpression;
    intensity: number; // 0-1
    pulsation: number; // 0-1
  };
  /** Micro-mimics avatar */
  avatar: AvatarMicroMimics;
  /** État interne (pensée) */
  innerState: {
    thinkingState: ThinkingState | null;
    mentalColor: string | null;
    coherence: number; // 0-1
  };
  /** Intention expressive courante */
  currentIntention: ExpressiveIntention | null;
  /** Énergie de présence globale (0-1) */
  presenceEnergy: number;
  /** User mirroring actif */
  userMirroring: {
    active: boolean;
    mirrorRatio: number; // 0-0.15 (max 15%)
    detectedUserState: 'calm' | 'stressed' | 'joyful' | 'neutral' | null;
  };
  /** Timestamp dernier cycle */
  lastCycleTimestamp: number;
}

/**
 * Configuration moteur multimodal
 */
export interface MultimodalPresenceConfig {
  /** Fréquence loop (Hz) — défaut 30Hz = 33ms/cycle */
  loopFrequency?: number;
  /** Activer respiration */
  enableBreathing?: boolean;
  /** Activer micro-mimics */
  enableMicroMimics?: boolean;
  /** Activer user mirroring */
  enableUserMirroring?: boolean;
  /** Ratio mirroring max (0-0.15) */
  maxMirrorRatio?: number;
  /** Respiration cycle par défaut (ms) */
  defaultBreathingCycle?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET INTENTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Presets d'intentions expressives
 */
export const EXPRESSIVE_INTENTIONS: Record<
  ExpressiveIntention['type'],
  Omit<ExpressiveIntention, 'intensity' | 'duration'>
> = {
  guidance: {
    type: 'guidance',
    modalities: {
      halo: { hue: 45, saturation: 80, lightness: 60, intention: 'warm guidance' },
      breath: { amplitude: 0.7, cycleDuration: 4000 },
      avatar: { microExpression: 'smile', facialGlow: 0.6 },
    },
  },
  comfort: {
    type: 'comfort',
    modalities: {
      halo: { hue: 330, saturation: 60, lightness: 70, intention: 'soft comfort' },
      voice: { tempo: 0.85, warmth: 0.9 },
      breath: { amplitude: 0.5, cycleDuration: 5000 },
      avatar: { microExpression: 'empathy', facialGlow: 0.5 },
    },
  },
  analysis: {
    type: 'analysis',
    modalities: {
      halo: { hue: 200, saturation: 70, lightness: 55, intention: 'focused analysis' },
      breath: { amplitude: 0.6, cycleDuration: 3500 },
      avatar: { microExpression: 'focus', facialGlow: 0.7, headTilt: { pitch: -5, yaw: 0, roll: 0 } },
    },
  },
  inspiration: {
    type: 'inspiration',
    modalities: {
      halo: { hue: 50, saturation: 90, lightness: 65, intention: 'bright inspiration' },
      voice: { tempo: 1.1, warmth: 0.8 },
      breath: { amplitude: 0.8, cycleDuration: 3000 },
      avatar: { microExpression: 'smile', facialGlow: 0.8 },
    },
  },
  surprise: {
    type: 'surprise',
    modalities: {
      halo: { hue: 180, saturation: 75, lightness: 70, intention: 'gentle surprise' },
      breath: { amplitude: 0.9, cycleDuration: 2500 },
      avatar: { blinkInterval: 1500, facialGlow: 0.7 },
    },
  },
  storytelling: {
    type: 'storytelling',
    modalities: {
      halo: { hue: 270, saturation: 65, lightness: 60, intention: 'narrative depth' },
      voice: { tempo: 0.95, warmth: 0.75 },
      breath: { amplitude: 0.65, cycleDuration: 4500 },
      avatar: { microExpression: 'neutral', facialGlow: 0.55 },
    },
  },
  listening: {
    type: 'listening',
    modalities: {
      halo: { hue: 45, saturation: 85, lightness: 70, intention: 'attentive presence' },
      breath: { amplitude: 0.6, cycleDuration: 3500 },
      avatar: {
        microExpression: 'focus',
        facialGlow: 0.65,
        headTilt: { pitch: 2, yaw: 0, roll: 0 },
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// RESPIRATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcule la phase respiratoire actuelle
 */
export function calculateBreathingPhase(
  cycle: BreathingCycle,
  elapsed: number
): { phase: BreathingCycle['phase']; progress: number } {
  const { cycleDuration, inhaleRatio, holdRatio, exhaleRatio, restRatio } = cycle;
  const cycleProgress = (elapsed % cycleDuration) / cycleDuration;

  const inhaleEnd = inhaleRatio;
  const holdEnd = inhaleEnd + holdRatio;
  const exhaleEnd = holdEnd + exhaleRatio;
  const restEnd = exhaleEnd + restRatio;

  if (cycleProgress < inhaleEnd) {
    return { phase: 'inhale', progress: cycleProgress / inhaleRatio };
  } else if (cycleProgress < holdEnd) {
    return { phase: 'hold', progress: (cycleProgress - inhaleEnd) / holdRatio };
  } else if (cycleProgress < exhaleEnd) {
    return { phase: 'exhale', progress: (cycleProgress - holdEnd) / exhaleRatio };
  } else {
    return { phase: 'rest', progress: (cycleProgress - exhaleEnd) / restRatio };
  }
}

/**
 * Génère la courbe respiratoire (0-1 pour amplitude)
 */
export function generateBreathingCurve(
  phase: BreathingCycle['phase'],
  progress: number,
  amplitude: number
): number {
  switch (phase) {
    case 'inhale':
      // Courbe ease-in-out
      return amplitude * (Math.sin((progress - 0.5) * Math.PI) * 0.5 + 0.5);
    case 'hold':
      return amplitude;
    case 'exhale':
      // Courbe ease-in-out inverse
      return amplitude * (1 - (Math.sin((progress - 0.5) * Math.PI) * 0.5 + 0.5));
    case 'rest':
      return 0;
    default:
      return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HALO EXPRESSION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convertit ThinkingState → HaloColorExpression
 */
export function mentalStateToHaloColor(thinkingState: ThinkingState | null): HaloColorExpression {
  switch (thinkingState) {
    case 'fast_thinking':
      return { hue: 210, saturation: 85, lightness: 60, intention: 'rapid thought' };
    case 'slow_thinking':
      return { hue: 270, saturation: 70, lightness: 55, intention: 'deep reflection' };
    case 'planning':
      return { hue: 180, saturation: 75, lightness: 58, intention: 'strategic planning' };
    case 'evaluating':
      return { hue: 200, saturation: 80, lightness: 60, intention: 'critical evaluation' };
    case 'emotional_sense':
      return { hue: 330, saturation: 65, lightness: 65, intention: 'emotional resonance' };
    case 'validating':
      return { hue: 120, saturation: 70, lightness: 55, intention: 'validation check' };
    case 'self_correcting':
      return { hue: 30, saturation: 80, lightness: 58, intention: 'self-correction' };
    case 'narrative_alignment':
      return { hue: 280, saturation: 75, lightness: 60, intention: 'identity alignment' };
    case 'deep_reflection':
      return { hue: 260, saturation: 65, lightness: 50, intention: 'profound meditation' };
    case 'silent':
    case 'perceiving':
    default:
      return { hue: 210, saturation: 50, lightness: 65, intention: 'calm presence' };
  }
}

/**
 * Transition fluide entre 2 couleurs (lerp HSL)
 */
export function lerpHaloColor(
  from: HaloColorExpression,
  to: HaloColorExpression,
  t: number
): HaloColorExpression {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return {
    hue: lerp(from.hue, to.hue, t),
    saturation: lerp(from.saturation, to.saturation, t),
    lightness: lerp(from.lightness, to.lightness, t),
    intention: t < 0.5 ? from.intention : to.intention,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR MICRO-MIMICS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Met à jour les micro-mimics de l'avatar
 */
export function updateAvatarMicroMimics(
  current: AvatarMicroMimics,
  mode: PresenceMode,
  delta: number
): AvatarMicroMimics {
  const now = Date.now();

  // Blink naturel (3-7s)
  let blinkInterval = current.blinkInterval;
  let lastBlink = current.lastBlink;
  if (now - lastBlink > blinkInterval) {
    lastBlink = now;
    blinkInterval = 3000 + Math.random() * 4000; // 3-7s
  }

  // Mouvement oculaire subtil (attention)
  const eyeMovement =
    mode === 'listening'
      ? { x: (Math.random() - 0.5) * 0.05, y: (Math.random() - 0.5) * 0.03, speed: 0.5 }
      : { x: 0, y: 0, speed: 0.2 };

  // Expression micro-faciale selon mode
  let microExpression = current.microExpression;
  switch (mode) {
    case 'listening':
      microExpression = 'focus';
      break;
    case 'speaking':
      microExpression = 'smile';
      break;
    case 'thinking':
      microExpression = 'focus';
      break;
    case 'healing':
      microExpression = 'concern';
      break;
    case 'storytelling':
      microExpression = 'neutral';
      break;
    case 'empathic_sync':
      microExpression = 'empathy';
      break;
    default:
      microExpression = 'neutral';
  }

  // Luminosité faciale (varie selon mode)
  const facialGlow = mode === 'speaking' ? 0.7 : mode === 'listening' ? 0.65 : 0.5;

  return {
    blinkInterval,
    lastBlink,
    eyeMovement,
    headTilt: current.headTilt,
    microExpression,
    facialGlow,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTIMODAL PRESENCE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class MultimodalPresenceEngine {
  private state: MultimodalPresenceState;
  private config: Required<MultimodalPresenceConfig>;
  private loopIntervalId: number | null = null;
  private isRunning: boolean = false;
  private callbacks: Set<(state: MultimodalPresenceState) => void> = new Set();

  // Transition couleur progressive
  private targetHaloColor: HaloColorExpression | null = null;
  private haloColorTransitionStart: number | null = null;
  private haloColorTransitionDuration: number = 800; // 800ms

  constructor(config: MultimodalPresenceConfig = {}) {
    this.config = {
      loopFrequency: config.loopFrequency ?? 30, // 30Hz = 33ms
      enableBreathing: config.enableBreathing ?? true,
      enableMicroMimics: config.enableMicroMimics ?? true,
      enableUserMirroring: config.enableUserMirroring ?? false,
      maxMirrorRatio: config.maxMirrorRatio ?? 0.15,
      defaultBreathingCycle: config.defaultBreathingCycle ?? 4000, // 4s
    };

    // État initial
    this.state = this.createInitialState();

    console.log('[MultimodalPresenceEngine] Initialized', this.config);
  }

  /**
   * Crée l'état initial
   */
  private createInitialState(): MultimodalPresenceState {
    return {
      mode: 'idle',
      breathing: {
        phase: 'rest',
        cycleDuration: this.config.defaultBreathingCycle,
        amplitude: 0.5,
        inhaleRatio: 0.4,
        holdRatio: 0.1,
        exhaleRatio: 0.4,
        restRatio: 0.1,
      },
      halo: {
        state: 'idle',
        color: { hue: 210, saturation: 50, lightness: 65, intention: 'calm presence' },
        intensity: 0.5,
        pulsation: 0,
      },
      avatar: {
        blinkInterval: 5000,
        lastBlink: Date.now(),
        eyeMovement: { x: 0, y: 0, speed: 0.2 },
        headTilt: { pitch: 0, yaw: 0, roll: 0 },
        microExpression: 'neutral',
        facialGlow: 0.5,
      },
      innerState: {
        thinkingState: null,
        mentalColor: null,
        coherence: 1.0,
      },
      currentIntention: null,
      presenceEnergy: 0.5,
      userMirroring: {
        active: false,
        mirrorRatio: 0,
        detectedUserState: null,
      },
      lastCycleTimestamp: Date.now(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Démarre la boucle de présence multimodale
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[MultimodalPresenceEngine] Already running');
      return;
    }

    this.isRunning = true;
    const intervalMs = 1000 / this.config.loopFrequency;

    this.loopIntervalId = window.setInterval(() => {
      this.updatePresenceLoop();
    }, intervalMs);

    console.log(`[MultimodalPresenceEngine] Started (${this.config.loopFrequency}Hz)`);
    this.notifyCallbacks();
  }

  /**
   * Arrête la boucle
   */
  stop(): void {
    if (!this.isRunning) return;

    if (this.loopIntervalId !== null) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }

    this.isRunning = false;
    console.log('[MultimodalPresenceEngine] Stopped');
  }

  /**
   * Change le mode de présence
   */
  setMode(mode: PresenceMode): void {
    if (this.state.mode === mode) return;

    console.log(`[MultimodalPresenceEngine] Mode: ${this.state.mode} → ${mode}`);
    this.state.mode = mode;

    // Ajuster respiration selon mode
    this.adjustBreathingForMode(mode);

    // Ajuster halo selon mode
    this.adjustHaloForMode(mode);

    this.notifyCallbacks();
  }

  /**
   * Applique une intention expressive
   */
  applyIntention(type: ExpressiveIntention['type'], intensity = 1.0, duration = 3000): void {
    const preset = EXPRESSIVE_INTENTIONS[type];
    if (!preset) {
      console.warn(`[MultimodalPresenceEngine] Unknown intention: ${type}`);
      return;
    }

    this.state.currentIntention = {
      ...preset,
      intensity,
      duration,
    };

    // Appliquer modalités
    if (preset.modalities.halo) {
      this.transitionHaloColor(preset.modalities.halo, 800);
    }
    if (preset.modalities.breath) {
      this.state.breathing.amplitude = preset.modalities.breath.amplitude;
      this.state.breathing.cycleDuration = preset.modalities.breath.cycleDuration;
    }
    if (preset.modalities.avatar) {
      Object.assign(this.state.avatar, preset.modalities.avatar);
    }

    console.log(`[MultimodalPresenceEngine] Applied intention: ${type} (intensity ${intensity})`);
    this.notifyCallbacks();
  }

  /**
   * Synchronise avec l'état interne (Inner Dialogue)
   */
  syncWithInnerDialogue(innerState: Partial<InnerDialogueState>): void {
    if (innerState.thinkingState) {
      this.state.innerState.thinkingState = innerState.thinkingState;

      // Convertir mental state → halo color
      const targetColor = mentalStateToHaloColor(innerState.thinkingState);
      this.transitionHaloColor(targetColor, 600);
    }

    this.notifyCallbacks();
  }

  /**
   * Active le mode Healing (auto-réparation)
   */
  activateHealingMode(): void {
    this.setMode('healing');

    // Séquence: rouge → violet → bleu
    this.transitionHaloColor({ hue: 0, saturation: 80, lightness: 55, intention: 'healing start' }, 500);

    setTimeout(() => {
      this.transitionHaloColor({ hue: 270, saturation: 70, lightness: 60, intention: 'healing process' }, 1000);
    }, 1500);

    setTimeout(() => {
      this.transitionHaloColor({ hue: 210, saturation: 60, lightness: 65, intention: 'healing complete' }, 1000);
      this.setMode('idle');
    }, 4000);

    console.log('[MultimodalPresenceEngine] Healing mode activated');
  }

  /**
   * Active le mode Story (narration)
   */
  activateStoryMode(): void {
    this.setMode('storytelling');
    this.applyIntention('storytelling', 0.8, 60000); // 1 minute
    console.log('[MultimodalPresenceEngine] Story mode activated');
  }

  /**
   * Active le mode Listening (wakeword détecté)
   */
  activateListeningMode(): void {
    this.setMode('listening');
    this.applyIntention('listening', 1.0, 10000); // 10s
    haloEngine.startBreathing(); // Synchroniser avec HaloEngine v∞.7
    console.log('[MultimodalPresenceEngine] Listening mode activated');
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): MultimodalPresenceState {
    return { ...this.state };
  }

  /**
   * Subscribe aux changements
   */
  subscribe(callback: (state: MultimodalPresenceState) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Boucle principale (20-60Hz)
   */
  private updatePresenceLoop(): void {
    const now = Date.now();
    const delta = now - this.state.lastCycleTimestamp;
    this.state.lastCycleTimestamp = now;

    // 1. Update breathing cycle
    if (this.config.enableBreathing) {
      this.updateBreathing(delta);
    }

    // 2. Update halo color transition
    this.updateHaloColorTransition();

    // 3. Update avatar micro-mimics
    if (this.config.enableMicroMimics) {
      this.state.avatar = updateAvatarMicroMimics(this.state.avatar, this.state.mode, delta);
    }

    // 4. User mirroring (si activé)
    if (this.config.enableUserMirroring && this.state.userMirroring.active) {
      this.updateUserMirroring();
    }

    // 5. Notifier callbacks
    this.notifyCallbacks();
  }

  /**
   * Met à jour le cycle respiratoire
   */
  private updateBreathing(delta: number): void {
    const elapsed = Date.now();
    const { phase, progress } = calculateBreathingPhase(this.state.breathing, elapsed);
    this.state.breathing.phase = phase;

    // Calculer amplitude respiratoire actuelle
    const breathingValue = generateBreathingCurve(phase, progress, this.state.breathing.amplitude);

    // Influence halo (expansion/contraction subtile)
    this.state.halo.pulsation = breathingValue * 0.2; // Max 20% variation
  }

  /**
   * Met à jour la transition de couleur halo
   */
  private updateHaloColorTransition(): void {
    if (!this.targetHaloColor || !this.haloColorTransitionStart) return;

    const elapsed = Date.now() - this.haloColorTransitionStart;
    const t = Math.min(elapsed / this.haloColorTransitionDuration, 1.0);

    this.state.halo.color = lerpHaloColor(this.state.halo.color, this.targetHaloColor, t);

    if (t >= 1.0) {
      this.targetHaloColor = null;
      this.haloColorTransitionStart = null;
    }
  }

  /**
   * User mirroring (synchronisation empathique)
   */
  private updateUserMirroring(): void {
    // TODO: Détecter état utilisateur (vocal analysis, typing speed, etc.)
    // Pour l'instant, stub
    const detectedState = this.state.userMirroring.detectedUserState;
    if (!detectedState) return;

    const mirrorRatio = Math.min(this.state.userMirroring.mirrorRatio, this.config.maxMirrorRatio);

    // Adapter respiration (exemple)
    if (detectedState === 'stressed') {
      // TITANE∞ ralentit sa respiration pour calmer
      this.state.breathing.cycleDuration = 5000; // Cycle plus lent
      this.state.breathing.amplitude = 0.4; // Amplitude plus douce
    }
  }

  /**
   * Ajuste respiration selon mode
   */
  private adjustBreathingForMode(mode: PresenceMode): void {
    switch (mode) {
      case 'idle':
        this.state.breathing.cycleDuration = 4000;
        this.state.breathing.amplitude = 0.5;
        break;
      case 'listening':
        this.state.breathing.cycleDuration = 3500;
        this.state.breathing.amplitude = 0.6;
        break;
      case 'thinking':
        this.state.breathing.cycleDuration = 5000;
        this.state.breathing.amplitude = 0.4;
        break;
      case 'speaking':
        this.state.breathing.cycleDuration = 3000;
        this.state.breathing.amplitude = 0.7;
        break;
      case 'healing':
        this.state.breathing.cycleDuration = 6000;
        this.state.breathing.amplitude = 0.3;
        break;
      case 'storytelling':
        this.state.breathing.cycleDuration = 4500;
        this.state.breathing.amplitude = 0.65;
        break;
      case 'deep_reflection':
        this.state.breathing.cycleDuration = 6000;
        this.state.breathing.amplitude = 0.3;
        break;
      case 'empathic_sync':
        this.state.breathing.cycleDuration = 4500;
        this.state.breathing.amplitude = 0.55;
        break;
    }
  }

  /**
   * Ajuste halo selon mode
   */
  private adjustHaloForMode(mode: PresenceMode): void {
    let targetColor: HaloColorExpression;

    switch (mode) {
      case 'idle':
        targetColor = { hue: 210, saturation: 50, lightness: 65, intention: 'calm idle' };
        haloEngine.reset();
        break;
      case 'listening':
        targetColor = { hue: 45, saturation: 85, lightness: 70, intention: 'active listening' };
        haloEngine.startBreathing();
        break;
      case 'thinking':
        targetColor = { hue: 270, saturation: 70, lightness: 55, intention: 'deep thought' };
        haloEngine.startPulsing();
        break;
      case 'speaking':
        targetColor = { hue: 50, saturation: 80, lightness: 65, intention: 'vocal expression' };
        haloEngine.startShimmer();
        break;
      case 'healing':
        targetColor = { hue: 0, saturation: 80, lightness: 55, intention: 'self-repair' };
        haloEngine.setError(); // Temporaire, puis transition
        break;
      case 'storytelling':
        targetColor = { hue: 280, saturation: 65, lightness: 60, intention: 'narrative mode' };
        break;
      case 'deep_reflection':
        targetColor = { hue: 260, saturation: 65, lightness: 50, intention: 'meditation' };
        break;
      case 'empathic_sync':
        targetColor = { hue: 330, saturation: 60, lightness: 70, intention: 'empathy' };
        break;
      default:
        targetColor = { hue: 210, saturation: 50, lightness: 65, intention: 'default' };
    }

    this.transitionHaloColor(targetColor, 600);
  }

  /**
   * Transition fluide vers une nouvelle couleur halo
   */
  private transitionHaloColor(target: HaloColorExpression, durationMs: number): void {
    this.targetHaloColor = target;
    this.haloColorTransitionStart = Date.now();
    this.haloColorTransitionDuration = durationMs;
  }

  /**
   * Notifie tous les callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(this.getState());
      } catch (error) {
        console.error('[MultimodalPresenceEngine] Callback error:', error);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const multimodalPresenceEngine = new MultimodalPresenceEngine({
  loopFrequency: 30, // 30Hz = expérience fluide
  enableBreathing: true,
  enableMicroMimics: true,
  enableUserMirroring: false, // Désactivé par défaut (phase future)
  maxMirrorRatio: 0.15,
  defaultBreathingCycle: 4000,
});

export default multimodalPresenceEngine;
