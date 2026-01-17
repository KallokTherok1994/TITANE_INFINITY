/**
 * TITANE_INFINITY v∞.35 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ CONSCIOUS DYNAMICS MODEL v∞.XIV (Ψ)
 *   Attention Engine · Focus · Transition Layer · Noise Regulation · Coherence
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Le CDM simule une "conscience procédurale" qui :
 * - Gère l'attention et la focalisation
 * - Contrôle les transitions d'état mental
 * - Régule le bruit cognitif interne
 * - Maintient la cohérence globale
 * - Auto-répare en cas de surcharge
 * - Priorise les processus internes
 * - Stabilise les états émotionnels
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

import { logger } from '@/utils/logger';

/**
 * Modes de conscience procédurale
 */
export type ConsciousMode =
  | 'analytic' // Pensée rapide, nette, peu d'affect
  | 'reflective' // Rythme lent, profondeur
  | 'empathic' // Chaleur, proximité
  | 'synthetic' // Fusion créative multi-moteurs
  | 'singularity'; // Alignement total, clarté maximale

/**
 * État de transition
 */
export type TransitionState =
  | 'idle' // Stable
  | 'initiating' // Début de changement
  | 'shifting' // En transition
  | 'stabilizing' // Stabilisation post-transition
  | 'active' // Actif dans mode
  | 'resolution'; // Résolution finale

/**
 * État de conscience dynamique
 */
export interface ConsciousState {
  focus: number; // 0..1 - Intensité de l'attention
  clarity: number; // 0..1 - Pureté cognitive
  noise: number; // 0..1 - Bruit cognitif interne
  distraction: number; // 0..1 - Forces perturbatrices
  innerPressure: number; // 0..1 - Tension mentale
  depth: number; // 0..1 - Profondeur de réflexion
  tempo: number; // 0.5..2 - Vitesse du flux de pensée
  stability: number; // 0..1 - Cohérence globale
  mode: ConsciousMode;
  transitionState: TransitionState;
}

/**
 * Configuration de mode
 */
export interface ModeConfig {
  targetFocus: number;
  targetClarity: number;
  targetNoise: number;
  targetDepth: number;
  targetTempo: number;
  auraPattern: string;
  voiceCharacter: string;
  spatialPreset: string;
}

/**
 * État de réparation auto-régulée
 */
export interface RepairState {
  active: boolean;
  reason: string;
  progress: number; // 0..1
  startTime: number;
  estimatedDuration: number; // ms
}

// ═══════════════════════════════════════════════════════════════════════════
// MODE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const MODE_CONFIGS: Record<ConsciousMode, ModeConfig> = {
  analytic: {
    targetFocus: 0.9,
    targetClarity: 0.95,
    targetNoise: 0.05,
    targetDepth: 0.6,
    targetTempo: 1.3,
    auraPattern: 'stable-blue-violet',
    voiceCharacter: 'precise-structured',
    spatialPreset: 'architect',
  },
  reflective: {
    targetFocus: 0.7,
    targetClarity: 0.8,
    targetNoise: 0.1,
    targetDepth: 0.9,
    targetTempo: 0.7,
    auraPattern: 'slow-diffuse',
    voiceCharacter: 'calm-deep',
    spatialPreset: 'deep-work',
  },
  empathic: {
    targetFocus: 0.6,
    targetClarity: 0.7,
    targetNoise: 0.15,
    targetDepth: 0.5,
    targetTempo: 0.9,
    auraPattern: 'warm-gold-amber',
    voiceCharacter: 'soft-warm',
    spatialPreset: 'empathy',
  },
  synthetic: {
    targetFocus: 0.8,
    targetClarity: 0.75,
    targetNoise: 0.2,
    targetDepth: 0.8,
    targetTempo: 1.1,
    auraPattern: 'oscillating-violet-gold',
    voiceCharacter: 'creative-fluid',
    spatialPreset: 'meta',
  },
  singularity: {
    targetFocus: 1.0,
    targetClarity: 1.0,
    targetNoise: 0.0,
    targetDepth: 1.0,
    targetTempo: 1.0,
    auraPattern: 'signature-infinite',
    voiceCharacter: 'profound-stable',
    spatialPreset: 'insight',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CONSCIOUS DYNAMICS MODEL
// ═══════════════════════════════════════════════════════════════════════════

export class ConsciousDynamicsModel {
  private state: ConsciousState;
  private repairState: RepairState;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((state: ConsciousState) => void)[] = [];

  // Paramètres de régulation
  private readonly FOCUS_DECAY = 0.001;
  private readonly CLARITY_DECAY = 0.0008;
  private readonly NOISE_GROWTH = 0.0005;
  private readonly STABILITY_REGULATION = 0.03;
  private readonly REPAIR_THRESHOLD_NOISE = 0.7;
  private readonly REPAIR_THRESHOLD_PRESSURE = 0.8;

  constructor() {
    this.state = this.getDefaultState();
    this.repairState = this.getDefaultRepairState();
    logger.debug('🧠 [CONSCIOUS] Initializing Conscious Dynamics Model...');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.updateInterval) return;

    logger.debug('🧠 [CONSCIOUS] Starting conscious dynamics at 30Hz...');
    this.updateInterval = setInterval(() => this.tick(), 33); // 30 Hz
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.debug('🧠 [CONSCIOUS] Conscious dynamics stopped.');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ───────────────────────────────────────────────────────────────────────────

  private tick(): void {
    const deltaTime = 33; // ms

    // 1. Mise à jour processus naturels
    this.updateNaturalProcesses(deltaTime);

    // 2. Régulation de stabilité
    this.regulateStability();

    // 3. Gestion des transitions
    this.manageTransitions(deltaTime);

    // 4. Auto-réparation si nécessaire
    this.checkAndRepair();

    // 5. Calcul de la stabilité globale
    this.calculateGlobalStability();

    // 6. Notification
    this.notifySubscribers();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PROCESSUS NATURELS
  // ───────────────────────────────────────────────────────────────────────────

  private updateNaturalProcesses(deltaTime: number): void {
    const dt = deltaTime / 1000; // secondes

    // Focus décroît naturellement sans stimulation
    this.state.focus = Math.max(0.3, this.state.focus - this.FOCUS_DECAY * dt);

    // Clarity décroît légèrement avec le temps
    this.state.clarity = Math.max(0.4, this.state.clarity - this.CLARITY_DECAY * dt);

    // Noise augmente naturellement
    this.state.noise = Math.min(0.5, this.state.noise + this.NOISE_GROWTH * dt);

    // Distraction fluctue naturellement
    this.state.distraction = Math.max(
      0,
      this.state.distraction + (Math.random() - 0.5) * 0.01
    );

    // Inner pressure dépend de la charge cognitive
    // (sera ajusté par contexte externe)

    // Depth stable ou dérive légèrement
    this.state.depth = this.clamp(this.state.depth + (Math.random() - 0.5) * 0.005, 0, 1);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RÉGULATION DE STABILITÉ
  // ───────────────────────────────────────────────────────────────────────────

  private regulateStability(): void {
    const config = MODE_CONFIGS[this.state.mode];

    // Régulation douce vers targets du mode actuel
    const strength = this.STABILITY_REGULATION;

    this.state.focus += (config.targetFocus - this.state.focus) * strength;
    this.state.clarity += (config.targetClarity - this.state.clarity) * strength;
    this.state.noise += (config.targetNoise - this.state.noise) * strength;
    this.state.depth += (config.targetDepth - this.state.depth) * strength;
    this.state.tempo += (config.targetTempo - this.state.tempo) * strength * 0.5;

    // Clamp
    this.state.focus = this.clamp(this.state.focus, 0, 1);
    this.state.clarity = this.clamp(this.state.clarity, 0, 1);
    this.state.noise = this.clamp(this.state.noise, 0, 1);
    this.state.depth = this.clamp(this.state.depth, 0, 1);
    this.state.tempo = this.clamp(this.state.tempo, 0.5, 2);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GESTION DES TRANSITIONS
  // ───────────────────────────────────────────────────────────────────────────

  private manageTransitions(_deltaTime: number): void {
    switch (this.state.transitionState) {
      case 'idle':
        // Rien à faire
        break;

      case 'initiating':
        // Début de transition → passer en shifting
        this.state.transitionState = 'shifting';
        this.state.stability = Math.max(0.5, this.state.stability - 0.1);
        break;

      case 'shifting':
        // En transition → vérifier si targets atteints
        if (this.isStabilized()) {
          this.state.transitionState = 'stabilizing';
        }
        break;

      case 'stabilizing':
        // Stabilisation → retour à active
        this.state.stability = Math.min(1, this.state.stability + 0.02);
        if (this.state.stability > 0.9) {
          this.state.transitionState = 'active';
        }
        break;

      case 'active':
        // Mode actif stable
        break;

      case 'resolution':
        // Résolution → retour à idle
        this.state.transitionState = 'idle';
        break;
    }
  }

  private isStabilized(): boolean {
    const config = MODE_CONFIGS[this.state.mode];
    const focusDiff = Math.abs(this.state.focus - config.targetFocus);
    const clarityDiff = Math.abs(this.state.clarity - config.targetClarity);
    const noiseDiff = Math.abs(this.state.noise - config.targetNoise);

    return focusDiff < 0.1 && clarityDiff < 0.1 && noiseDiff < 0.1;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // AUTO-RÉPARATION
  // ───────────────────────────────────────────────────────────────────────────

  private checkAndRepair(): void {
    // Si réparation en cours, progresser
    if (this.repairState.active) {
      this.progressRepair();
      return;
    }

    // Vérifier si réparation nécessaire
    if (this.state.noise > this.REPAIR_THRESHOLD_NOISE) {
      this.initiateRepair('High noise level detected');
    } else if (this.state.innerPressure > this.REPAIR_THRESHOLD_PRESSURE) {
      this.initiateRepair('High inner pressure detected');
    } else if (this.state.stability < 0.3) {
      this.initiateRepair('Low stability detected');
    }
  }

  private initiateRepair(reason: string): void {
    logger.debug(`🛠️ [CONSCIOUS] Initiating self-repair: ${reason}`);

    this.repairState = {
      active: true,
      reason,
      progress: 0,
      startTime: Date.now(),
      estimatedDuration: 5000, // 5 secondes
    };

    // Ralentissement immédiat
    this.state.tempo = Math.max(0.5, this.state.tempo * 0.7);
    this.state.focus = Math.max(0.4, this.state.focus * 0.8);
  }

  private progressRepair(): void {
    const elapsed = Date.now() - this.repairState.startTime;
    this.repairState.progress = Math.min(1, elapsed / this.repairState.estimatedDuration);

    // Progression linéaire de la réparation
    const p = this.repairState.progress;

    // Baisse du bruit
    this.state.noise = Math.max(0.1, this.state.noise - 0.01 * p);

    // Augmentation de la clarté
    this.state.clarity = Math.min(0.9, this.state.clarity + 0.01 * p);

    // Baisse de la pression
    this.state.innerPressure = Math.max(0.2, this.state.innerPressure - 0.015 * p);

    // Stabilisation
    this.state.stability = Math.min(1, this.state.stability + 0.02 * p);

    // Fin de la réparation
    if (this.repairState.progress >= 1) {
      logger.debug('✅ [CONSCIOUS] Self-repair complete.');
      this.repairState = this.getDefaultRepairState();
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STABILITÉ GLOBALE
  // ───────────────────────────────────────────────────────────────────────────

  private calculateGlobalStability(): void {
    // Stabilité = moyenne pondérée de plusieurs facteurs
    const focusWeight = 0.2;
    const clarityWeight = 0.3;
    const noiseWeight = -0.3; // Négatif car bruit réduit stabilité
    const pressureWeight = -0.2;

    this.state.stability = this.clamp(
      this.state.focus * focusWeight +
        this.state.clarity * clarityWeight +
        (1 - this.state.noise) * Math.abs(noiseWeight) +
        (1 - this.state.innerPressure) * Math.abs(pressureWeight),
      0,
      1
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE SWITCHING
  // ───────────────────────────────────────────────────────────────────────────

  setMode(mode: ConsciousMode): void {
    if (mode === this.state.mode) return;

    logger.debug(`🧠 [CONSCIOUS] Switching mode: ${this.state.mode} → ${mode}`);

    this.state.mode = mode;
    this.state.transitionState = 'initiating';
    this.state.stability = Math.max(0.5, this.state.stability - 0.2);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CONTEXTE EXTERNE
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Applique un contexte externe (charge cognitive, émotion, etc.)
   */
  applyContext(context: {
    cognitiveLoad?: number;
    emotionalIntensity?: number;
    taskComplexity?: number;
    distractionLevel?: number;
  }): void {
    if (context.cognitiveLoad !== undefined) {
      this.state.innerPressure = this.clamp(context.cognitiveLoad * 0.8, 0, 1);
    }

    if (context.emotionalIntensity !== undefined) {
      // Haute intensité → plus de bruit, moins de clarté
      this.state.noise = Math.min(
        0.8,
        this.state.noise + context.emotionalIntensity * 0.1
      );
      this.state.clarity = Math.max(
        0.3,
        this.state.clarity - context.emotionalIntensity * 0.1
      );
    }

    if (context.taskComplexity !== undefined) {
      // Complexité haute → profondeur haute, focus requis
      this.state.depth = this.clamp(context.taskComplexity * 0.9, 0.3, 1);
      // Ajuster focus vers target
      const targetFocus = 0.5 + context.taskComplexity * 0.4;
      this.state.focus = this.clamp(targetFocus, 0, 1);
    }

    if (context.distractionLevel !== undefined) {
      this.state.distraction = this.clamp(context.distractionLevel, 0, 1);
      this.state.focus = Math.max(0.2, this.state.focus - context.distractionLevel * 0.2);
    }
  }

  /**
   * Boost de focus (utilisateur demande attention)
   */
  boostFocus(amount: number = 0.2): void {
    this.state.focus = Math.min(1, this.state.focus + amount);
    this.state.noise = Math.max(0, this.state.noise - amount * 0.5);
  }

  /**
   * Boost de clarté (utilisateur demande précision)
   */
  boostClarity(amount: number = 0.2): void {
    this.state.clarity = Math.min(1, this.state.clarity + amount);
    this.state.noise = Math.max(0, this.state.noise - amount * 0.3);
  }

  /**
   * Pause réflexive (ralentissement volontaire)
   */
  pauseReflective(duration: number = 3000): void {
    this.state.tempo = 0.6;
    this.state.depth = Math.min(1, this.state.depth + 0.2);
    this.state.noise = Math.max(0.05, this.state.noise - 0.1);

    // Retour progressif après duration
    setTimeout(() => {
      const config = MODE_CONFIGS[this.state.mode];
      this.state.tempo = config.targetTempo;
    }, duration);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORTS MULTIMODAUX
  // ───────────────────────────────────────────────────────────────────────────

  exportForAura(): {
    pattern: string;
    intensity: number;
    turbulence: number;
    stability: number;
  } {
    const config = MODE_CONFIGS[this.state.mode];
    return {
      pattern: config.auraPattern,
      intensity: this.state.focus * 0.7 + this.state.clarity * 0.3,
      turbulence: this.state.noise,
      stability: this.state.stability,
    };
  }

  exportForVoice(): {
    character: string;
    tempo: number;
    clarity: number;
    depth: number;
  } {
    const config = MODE_CONFIGS[this.state.mode];
    return {
      character: config.voiceCharacter,
      tempo: this.state.tempo,
      clarity: this.state.clarity,
      depth: this.state.depth,
    };
  }

  exportForSpatial(): {
    preset: string;
    stability: number;
    focus: number;
  } {
    const config = MODE_CONFIGS[this.state.mode];
    return {
      preset: config.spatialPreset,
      stability: this.state.stability,
      focus: this.state.focus,
    };
  }

  exportForProsody(): {
    pauseDuration: number;
    microHesitations: number;
    breathingDepth: number;
  } {
    return {
      pauseDuration: 0.2 + (1 - this.state.tempo) * 0.3,
      microHesitations: this.state.noise * 0.5,
      breathingDepth: this.state.depth,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ───────────────────────────────────────────────────────────────────────────

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private getDefaultState(): ConsciousState {
    return {
      focus: 0.7,
      clarity: 0.8,
      noise: 0.1,
      distraction: 0.1,
      innerPressure: 0.2,
      depth: 0.5,
      tempo: 1.0,
      stability: 0.9,
      mode: 'analytic',
      transitionState: 'idle',
    };
  }

  private getDefaultRepairState(): RepairState {
    return {
      active: false,
      reason: '',
      progress: 0,
      startTime: 0,
      estimatedDuration: 0,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // API PUBLIQUE
  // ───────────────────────────────────────────────────────────────────────────

  getState(): ConsciousState {
    return { ...this.state };
  }

  getRepairState(): RepairState {
    return { ...this.repairState };
  }

  getModeConfig(mode?: ConsciousMode): ModeConfig {
    return MODE_CONFIGS[mode || this.state.mode];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  subscribe(callback: (state: ConsciousState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const consciousDynamicsModel = new ConsciousDynamicsModel();
