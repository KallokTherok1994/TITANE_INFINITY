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

export type InteroceptionState = {
  // Énergie interne (0 = épuisé, 1 = charge max)
  energy: number;

  // Charge cognitive (0 = repos, 1 = saturation)
  cognitiveLoad: number;

  // Clarté mentale (0 = confus, 1 = cristallin)
  clarity: number;

  // Stabilité interne (0 = agité, 1 = stable)
  stability: number;

  // Température émotionnelle (-1 = froid/analytique, 0 = neutre, 1 = chaud/empathique)
  emotionalTemperature: number;

  // Entropie interne (0 = ordre, 1 = chaos)
  entropy: number;

  // Phase de respiration (0..1, cycle sinusoïdal)
  breathingPhase: number;

  // Horloge interne (millisecondes)
  cycleTime: number;

  // Homeostasie (auto-régulation)
  homeostasis: number;

  // Profondeur (0 = surface, 1 = profond)
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

const BREATHING_RATE = 0.2; // Hz (12 respirations/min)
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
  private updateInterval: NodeJS.Timeout | null;
  private subscribers: Array<(state: InteroceptionState) => void>;

  constructor() {
    this.state = this.getInitialState();
    this.lastUpdateTime = Date.now();
    this.isRunning = false;
    this.updateInterval = null;
    this.subscribers = [];
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
    if (this.isRunning) return;

    console.log('🌬️ [INTEROCEPTION] Starting internal state engine...');
    this.isRunning = true;
    this.lastUpdateTime = Date.now();

    // Update à 10 Hz (100ms)
    this.updateInterval = setInterval(() => {
      this.update();
    }, 100);
  }

  public stop(): void {
    if (!this.isRunning) return;

    console.log('🌬️ [INTEROCEPTION] Stopping internal state engine...');
    this.isRunning = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  private update(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // en secondes
    this.lastUpdateTime = now;

    // 1. Mise à jour du cycle interne
    this.state.cycleTime += deltaTime * 1000;

    // 2. Respiration (cycle sinusoïdal)
    this.updateBreathing(deltaTime);

    // 3. Énergie (consommation + régénération)
    this.updateEnergy(deltaTime);

    // 4. Entropie (bruit naturel)
    this.updateEntropy();

    // 5. Homeostasie (auto-régulation)
    this.regulate();

    // 6. Notifier les subscribers
    this.notifySubscribers();
  }

  private updateBreathing(deltaTime: number): void {
    // Cycle de respiration sinusoïdal
    const breathingSpeed = BREATHING_RATE * (1 - this.state.cognitiveLoad * 0.3);
    this.state.breathingPhase = (Math.sin(this.state.cycleTime * 0.001 * breathingSpeed * 2 * Math.PI) + 1) / 2;
  }

  private updateEnergy(deltaTime: number): void {
    // Consommation d'énergie basée sur la charge cognitive
    const energyDecay = this.state.cognitiveLoad * ENERGY_DECAY_FACTOR * deltaTime;

    // Régénération basée sur la clarté
    const energyRegen = this.state.clarity * ENERGY_REGEN_FACTOR * deltaTime;

    this.state.energy = Math.max(0, Math.min(1, this.state.energy - energyDecay + energyRegen));
  }

  private updateEntropy(): void {
    // Bruit naturel modulé par la stabilité
    const noise = (Math.random() - 0.5) * 2 * ENTROPY_NOISE_AMPLITUDE;
    this.state.entropy = Math.max(0, Math.min(1, this.state.entropy + noise * (1 - this.state.stability)));
  }

  private regulate(): void {
    // Homeostasie : ramener les valeurs vers des états optimaux
    const targetEnergy = 0.7;
    const targetClarity = 0.8;
    const targetStability = 0.85;
    const targetEntropy = 0.15;
    const targetTemperature = 0.2;

    this.state.energy += (targetEnergy - this.state.energy) * HOMEOSTASIS_STRENGTH;
    this.state.clarity += (targetClarity - this.state.clarity) * HOMEOSTASIS_STRENGTH;
    this.state.stability += (targetStability - this.state.stability) * HOMEOSTASIS_STRENGTH;
    this.state.entropy += (targetEntropy - this.state.entropy) * HOMEOSTASIS_STRENGTH;
    this.state.emotionalTemperature += (targetTemperature - this.state.emotionalTemperature) * HOMEOSTASIS_STRENGTH;

    // Mise à jour de l'indicateur d'homeostasie
    const deviations = [
      Math.abs(this.state.energy - targetEnergy),
      Math.abs(this.state.clarity - targetClarity),
      Math.abs(this.state.stability - targetStability),
      Math.abs(this.state.entropy - targetEntropy),
    ];
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    this.state.homeostasis = 1 - avgDeviation;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL INFLUENCE
  // ═══════════════════════════════════════════════════════════════════════════

  public applyContext(context: InteroceptionContext): void {
    // Charge cognitive
    if (context.taskComplexity !== undefined) {
      this.state.cognitiveLoad = Math.max(0, Math.min(1,
        this.state.cognitiveLoad + context.taskComplexity * 0.3
      ));
    }

    // Température émotionnelle
    if (context.emotionalIntensity !== undefined) {
      this.state.emotionalTemperature = Math.max(-1, Math.min(1,
        this.state.emotionalTemperature + context.emotionalIntensity * 0.5
      ));
    }

    // Clarté (baisse si pas de présence utilisateur)
    if (context.userPresence === false) {
      this.state.clarity *= 0.95;
    }

    // Énergie (baisse avec la durée de session)
    if (context.sessionDuration !== undefined) {
      const fatigueFactor = Math.min(1, context.sessionDuration / (60 * 60 * 1000)); // 1h max
      this.state.energy = Math.max(0.3, this.state.energy - fatigueFactor * 0.1);
    }

    // Profondeur selon le mode
    if (context.mode) {
      switch (context.mode) {
        case 'insight':
        case 'singularity':
          this.state.depth = 0.9;
          break;
        case 'deep-work':
          this.state.depth = 0.7;
          break;
        case 'empathy':
          this.state.depth = 0.6;
          break;
        case 'architect':
          this.state.depth = 0.5;
          break;
        default:
          this.state.depth = 0.5;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORTS MULTIMODAUX
  // ═══════════════════════════════════════════════════════════════════════════

  public exportForAura(): InteroceptionExport['aura'] {
    return {
      intensity: this.state.energy * 0.8 + 0.2,
      turbulence: this.state.entropy,
      warmth: (this.state.emotionalTemperature + 1) / 2, // -1..1 → 0..1
      pulsation: this.state.breathingPhase,
      stability: this.state.stability,
    };
  }

  public exportForVoice(): InteroceptionExport['voice'] {
    return {
      warmth: (this.state.emotionalTemperature + 1) / 2,
      energy: this.state.energy,
      clarity: this.state.clarity,
      entropy: this.state.entropy,
    };
  }

  public exportForProsody(): InteroceptionExport['prosody'] {
    return {
      stability: this.state.stability,
      breathingPhase: this.state.breathingPhase,
      pauseDuration: 0.3 + (1 - this.state.energy) * 0.3, // 0.3-0.6s
    };
  }

  public exportForSpatial(): InteroceptionExport['spatial'] {
    return {
      stability: this.state.stability,
      energy: this.state.energy,
      clarity: this.state.clarity,
      diffusion: 1 - this.state.clarity, // plus flou si moins clair
    };
  }

  public exportForAutonomic(): InteroceptionExport['autonomic'] {
    return {
      entropy: this.state.entropy,
      warmth: (this.state.emotionalTemperature + 1) / 2,
      cognitiveLoad: this.state.cognitiveLoad,
    };
  }

  public exportAll(): InteroceptionExport {
    return {
      aura: this.exportForAura(),
      voice: this.exportForVoice(),
      prosody: this.exportForProsody(),
      spatial: this.exportForSpatial(),
      autonomic: this.exportForAutonomic(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS / SETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  public getState(): InteroceptionState {
    return { ...this.state };
  }

  public setEnergy(value: number): void {
    this.state.energy = Math.max(0, Math.min(1, value));
  }

  public setCognitiveLoad(value: number): void {
    this.state.cognitiveLoad = Math.max(0, Math.min(1, value));
  }

  public setClarity(value: number): void {
    this.state.clarity = Math.max(0, Math.min(1, value));
  }

  public setStability(value: number): void {
    this.state.stability = Math.max(0, Math.min(1, value));
  }

  public setEmotionalTemperature(value: number): void {
    this.state.emotionalTemperature = Math.max(-1, Math.min(1, value));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════

  public subscribe(callback: (state: InteroceptionState) => void): () => void {
    this.subscribers.push(callback);

    // Retourne la fonction de désabonnement
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('🌬️ [INTEROCEPTION] Error in subscriber:', error);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const interoceptionEngine = new InteroceptionEngine();
