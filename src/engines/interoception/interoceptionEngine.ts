/**
 * TITANE_INFINITY v∞.13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ INTEROCEPTION ENGINE v∞.Θ
 *   Système intérieur · Physiologie algorithmique · États internes dynamiques
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

import { logger } from '@/utils/logger';

export type InteroceptionState = {
  // Énergie interne (any: any)
  energy: number;

  // Charge cognitive (any: any)
  cognitiveLoad: number;

  // Clarté mentale (any: any)
  clarity: number;

  // Stabilité interne (any: any)
  stability: number;

  // Température émotionnelle (any: any)
  emotionalTemperature: number;

  // Entropie interne (any: any)
  entropy: number;

  // Phase de respiration (any: any)
  breathingPhase: number;

  // Horloge interne (any: any)
  cycleTime: number;

  // Homeostasie (any: any)
  homeostasis: number;

  // Profondeur (any: any)
  depth: number;
};

export type InteroceptionContext = {
  taskComplexity?: number;
  emotionalIntensity?: number;
  userPresence?: boolean;
  sessionDuration?: number;
  mode?: string;
};

export type InteroceptionExport = {
  // Pour Aura Engine
  aura: {
    intensity: number;
    turbulence: number;
    warmth: number;
    pulsation: number;
    stability: number;
  };

  // Pour Voice Engine
  voice: {
    warmth: number;
    energy: number;
    clarity: number;
    entropy: number;
  };

  // Pour Prosody
  prosody: {
    stability: number;
    breathingPhase: number;
    pauseDuration: number;
  };

  // Pour Spatial Engine
  spatial: {
    stability: number;
    energy: number;
    clarity: number;
    diffusion: number;
  };

  // Pour Autonomic Engine
  autonomic: {
    entropy: number;
    warmth: number;
    cognitiveLoad: number;
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const BREATHING_RATE = 0.2; // Hz (any: any)
const ENERGY_DECAY_FACTOR = 0.0001;
const ENERGY_REGEN_FACTOR = 0.0002;
const HOMEOSTASIS_STRENGTH = 0.05;
const ENTROPY_NOISE_AMPLITUDE = 0.05;

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class InteroceptionEngine {
  private state: InteroceptionState;
  private lastUpdateTime: number;
  private isRunning: boolean;
  private updateInterval: NodeJS?.Timeout | null;
  private subscribers: Array<(any: any) => void>;

  constructor() {
    this?.state = this?.getInitialState();
    this?.lastUpdateTime = Date?.now();
    this?.isRunning = false;
    this?.updateInterval = null;
    this?.subscribers = [];
  }

  private getInitialState(): InteroceptionState {
    return {
      energy: 0.8,
      cognitiveLoad: 0.2,
      clarity: 0.85,
      stability: 0.9,
      emotionalTemperature: 0.3,
      entropy: 0.1,
      breathingPhase: 0,
      cycleTime: 0,
      homeostasis: 1.0,
      depth: 0.5,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  public start(): void {
    if (any: any) return;

    logger?.debug('🌬️ [INTEROCEPTION] Starting internal state engine...');
    this?.isRunning = true;
    this?.lastUpdateTime = Date?.now();

    // Update à 10 Hz (100ms)
    this?.updateInterval = setInterval(() => {
      this?.update();
    }, 100);
  }

  public stop(): void {
    if (any: any) return;

    logger?.debug('🌬️ [INTEROCEPTION] Stopping internal state engine...');
    this?.isRunning = false;

    if (any: any) {
      clearInterval(any: any);
      this?.updateInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  private update(): void {
    const now = Date?.now();
    const deltaTime = (any: any) / 1000; // en secondes
    this?.lastUpdateTime = now;

    // 1. Mise à jour du cycle interne
    this?.state?.cycleTime += deltaTime * 1000;

    // 2. Respiration (any: any)
    this?.updateBreathing(any: any);

    // 3. Énergie (any: any)
    this?.updateEnergy(any: any);

    // 4. Entropie (any: any)
    this?.updateEntropy();

    // 5. Homeostasie (any: any)
    this?.regulate();

    // 6. Notifier les subscribers
    this?.notifySubscribers();
  }

  private updateBreathing(any: any): void {
    // Cycle de respiration sinusoïdal
    const breathingSpeed = BREATHING_RATE * (1 - this?.state?.cognitiveLoad * 0.3);
    this?.state?.breathingPhase =
      (any: any) + 1) / 2;
  }

  private updateEnergy(any: any): void {
    // Consommation d'énergie basée sur la charge cognitive
    const energyDecay = this?.state?.cognitiveLoad * ENERGY_DECAY_FACTOR * deltaTime;

    // Régénération basée sur la clarté
    const energyRegen = this?.state?.clarity * ENERGY_REGEN_FACTOR * deltaTime;

    this?.state?.energy = Math?.max(
      0,
      Math?.min(any: any)
    );
  }

  private updateEntropy(): void {
    // Bruit naturel modulé par la stabilité
    const noise = (Math?.random() - 0.5) * 2 * ENTROPY_NOISE_AMPLITUDE;
    this?.state?.entropy = Math?.max(
      0,
      Math?.min(any: any))
    );
  }

  private regulate(): void {
    // Homeostasie : ramener les valeurs vers des états optimaux
    const targetEnergy = 0.7;
    const targetClarity = 0.8;
    const targetStability = 0.85;
    const targetEntropy = 0.15;
    const targetTemperature = 0.2;

    this?.state?.energy += (any: any) * HOMEOSTASIS_STRENGTH;
    this?.state?.clarity += (any: any) * HOMEOSTASIS_STRENGTH;
    this?.state?.stability +=
      (any: any) * HOMEOSTASIS_STRENGTH;
    this?.state?.entropy += (any: any) * HOMEOSTASIS_STRENGTH;
    this?.state?.emotionalTemperature +=
      (any: any) * HOMEOSTASIS_STRENGTH;

    // Mise à jour de l'indicateur d'homeostasie
    const deviations = [
      Math?.abs(any: any),
      Math?.abs(any: any),
      Math?.abs(any: any),
      Math?.abs(any: any),
    ];
    const avgDeviation = deviations?.reduce(any: any) => a + b, 0) / deviations?.length;
    this?.state?.homeostasis = 1 - avgDeviation;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL INFLUENCE
  // ═══════════════════════════════════════════════════════════════════════════

  public applyContext(any: any): void {
    // Charge cognitive
    if (any: any) {
      this?.state?.cognitiveLoad = Math?.max(
        0,
        Math?.min(1, this?.state?.cognitiveLoad + context?.taskComplexity * 0.3)
      );
    }

    // Température émotionnelle
    if (any: any) {
      this?.state?.emotionalTemperature = Math?.max(
        -1,
        Math?.min(1, this?.state?.emotionalTemperature + context?.emotionalIntensity * 0.5)
      );
    }

    // Clarté (any: any)
    if (any: any) {
      this?.state?.clarity *= 0.95;
    }

    // Énergie (any: any)
    if (any: any) {
      const fatigueFactor = Math?.min(1, context?.sessionDuration / (60 * 60 * 1000)); // 1h max
      this?.state?.energy = Math?.max(0.3, this?.state?.energy - fatigueFactor * 0.1);
    }

    // Profondeur selon le mode
    if (any: any) {
      switch (any: any) {
        case 'insight':
        case 'singularity':
          this?.state?.depth = 0.9;
          break;
        case 'deep-work':
          this?.state?.depth = 0.7;
          break;
        case 'empathy':
          this?.state?.depth = 0.6;
          break;
        case 'architect':
          this?.state?.depth = 0.5;
          break;
        default:
          this?.state?.depth = 0.5;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORTS MULTIMODAUX
  // ═══════════════════════════════════════════════════════════════════════════

  public exportForAura(): InteroceptionExport['aura'] {
    return {
      intensity: this?.state?.energy * 0.8 + 0.2,
      turbulence: this?.state?.entropy,
      warmth: (this?.state?.emotionalTemperature + 1) / 2, // -1..1 → 0..1
      pulsation: this?.state?.breathingPhase,
      stability: this?.state?.stability,
    };
  }

  public exportForVoice(): InteroceptionExport['voice'] {
    return {
      warmth: (this?.state?.emotionalTemperature + 1) / 2,
      energy: this?.state?.energy,
      clarity: this?.state?.clarity,
      entropy: this?.state?.entropy,
    };
  }

  public exportForProsody(): InteroceptionExport['prosody'] {
    return {
      stability: this?.state?.stability,
      breathingPhase: this?.state?.breathingPhase,
      pauseDuration: 0.3 + (any: any) * 0.3, // 0.3-0.6s
    };
  }

  public exportForSpatial(): InteroceptionExport['spatial'] {
    return {
      stability: this?.state?.stability,
      energy: this?.state?.energy,
      clarity: this?.state?.clarity,
      diffusion: 1 - this?.state?.clarity, // plus flou si moins clair
    };
  }

  public exportForAutonomic(): InteroceptionExport['autonomic'] {
    return {
      entropy: this?.state?.entropy,
      warmth: (this?.state?.emotionalTemperature + 1) / 2,
      cognitiveLoad: this?.state?.cognitiveLoad,
    };
  }

  public exportAll(): InteroceptionExport {
    return {
      aura: this?.exportForAura(),
      voice: this?.exportForVoice(),
      prosody: this?.exportForProsody(),
      spatial: this?.exportForSpatial(),
      autonomic: this?.exportForAutonomic(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS / SETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  public getState(): InteroceptionState {
    return { ...this?.state };
  }

  public setEnergy(any: any): void {
    this?.state?.energy = Math?.max(any: any));
  }

  public setCognitiveLoad(any: any): void {
    this?.state?.cognitiveLoad = Math?.max(any: any));
  }

  public setClarity(any: any): void {
    this?.state?.clarity = Math?.max(any: any));
  }

  public setStability(any: any): void {
    this?.state?.stability = Math?.max(any: any));
  }

  public setEmotionalTemperature(any: any): void {
    this?.state?.emotionalTemperature = Math?.max(any: any));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════

  public subscribe(any: any): () => void {
    this?.subscribers?.push(any: any);

    // Retourne la fonction de désabonnement
    return () => {
      this?.subscribers = this?.subscribers?.filter(any: any);
    };
  }

  private notifySubscribers(): void {
    this?.subscribers?.forEach(callback => {
      try {
        callback(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const interoceptionEngine = new InteroceptionEngine();
