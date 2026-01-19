/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — VOICE PROSODY ENGINE (Expression Integration)
 *   Voice Parameter Control · Real-time Prosody · Expression Mapping
 * ═══════════════════════════════════════════════════════════════════════════
 *   © 2025 Humain Total / Kevin Thibault / TITANE Team
 *
 *   Concept: Moteur de contrôle prosodique compatible avec Expression Engine.
 *            Permet de modifier rate, pitch, volume, timbre en temps réel
 *            basé sur les paramètres d'expression orchestrés.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { OrchestratedVoice } from './types';

// ═══════════════════════════════════════════════════════════════════════════
//   TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * État du Voice Prosody Engine
 */
export interface VoiceProsodyState {
  isActive: boolean;

  // Paramètres prosodiques actuels
  prosody: {
    rate: number; // 0.5-2.0 - Speech rate multiplier
    pitch: number; // 0.5-2.0 - Pitch multiplier
    volume: number; // 0-1 - Volume level
    emphasis: number; // 0-1 - Emphasis strength
  };

  // Timbre vocal
  timbre: {
    warmth: number; // 0-1 - Vocal warmth
    breathiness: number; // 0-1 - Breathiness
    resonance: number; // 0-1 - Resonance depth
    clarity: number; // 0-1 - Articulation clarity
  };

  // Micro-dynamiques
  microDynamics: {
    intonationVariation: number; // 0-1 - Pitch variation
    rhythmicFlow: number; // 0-1 - Rhythm naturalness
    pausePlacement: number; // 0-1 - Strategic pauses
    emotionalColoring: number; // 0-1 - Emotional expressiveness
  };

  // Métriques
  metrics: {
    lastUpdate: number;
    updateCount: number;
    averageRate: number;
    averagePitch: number;
  };
}

/**
 * Configuration vocale complète
 */
export interface VoiceConfig {
  prosody: VoiceProsodyState['prosody'];
  timbre: VoiceProsodyState['timbre'];
  microDynamics: VoiceProsodyState['microDynamics'];
}

// ═══════════════════════════════════════════════════════════════════════════
//   VOICE PROSODY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class VoiceProsodyEngine {
  private state: VoiceProsodyState;
  private subscribers: Set<(state: VoiceProsodyState) => void> = new Set();

  constructor() {
    this.state = {
      isActive: false,
      prosody: {
        rate: 1.0,
        pitch: 1.0,
        volume: 0.7,
        emphasis: 0.5,
      },
      timbre: {
        warmth: 0.5,
        breathiness: 0.3,
        resonance: 0.5,
        clarity: 0.7,
      },
      microDynamics: {
        intonationVariation: 0.5,
        rhythmicFlow: 0.6,
        pausePlacement: 0.5,
        emotionalColoring: 0.5,
      },
      metrics: {
        lastUpdate: 0,
        updateCount: 0,
        averageRate: 1.0,
        averagePitch: 1.0,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  activate(): void {
    this.state.isActive = true;
    console.log('[VoiceProsodyEngine] Activated');
    this.notifySubscribers();
  }

  deactivate(): void {
    this.state.isActive = false;
    console.log('[VoiceProsodyEngine] Deactivated');
    this.notifySubscribers();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   UPDATE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mettre à jour l'état depuis Expression Engine
   */
  updateState(orchestratedVoice: OrchestratedVoice): void {
    if (!this.state.isActive) return;

    // Appliquer les paramètres
    this.state.prosody = { ...orchestratedVoice.prosody };
    this.state.timbre = { ...orchestratedVoice.timbre };
    this.state.microDynamics = { ...orchestratedVoice.microDynamics };

    // Mettre à jour métriques
    this.state.metrics.lastUpdate = Date.now();
    this.state.metrics.updateCount++;

    // Moyennes mobiles
    const alpha = 0.1; // Facteur de lissage
    this.state.metrics.averageRate =
      alpha * orchestratedVoice.prosody.rate +
      (1 - alpha) * this.state.metrics.averageRate;

    this.state.metrics.averagePitch =
      alpha * orchestratedVoice.prosody.pitch +
      (1 - alpha) * this.state.metrics.averagePitch;

    this.notifySubscribers();
  }

  /**
   * Mettre à jour un paramètre prosodique individuel
   */
  updateProsody(param: keyof VoiceProsodyState['prosody'], value: number): void {
    if (!this.state.isActive) return;

    this.state.prosody[param] = value;
    this.state.metrics.lastUpdate = Date.now();
    this.notifySubscribers();
  }

  /**
   * Mettre à jour un paramètre de timbre
   */
  updateTimbre(param: keyof VoiceProsodyState['timbre'], value: number): void {
    if (!this.state.isActive) return;

    this.state.timbre[param] = value;
    this.state.metrics.lastUpdate = Date.now();
    this.notifySubscribers();
  }

  /**
   * Mettre à jour une micro-dynamique
   */
  updateMicroDynamics(
    param: keyof VoiceProsodyState['microDynamics'],
    value: number
  ): void {
    if (!this.state.isActive) return;

    this.state.microDynamics[param] = value;
    this.state.metrics.lastUpdate = Date.now();
    this.notifySubscribers();
  }

  /**
   * Appliquer une configuration complète
   */
  applyConfig(config: Partial<VoiceConfig>): void {
    if (!this.state.isActive) return;

    if (config.prosody) {
      this.state.prosody = { ...this.state.prosody, ...config.prosody };
    }

    if (config.timbre) {
      this.state.timbre = { ...this.state.timbre, ...config.timbre };
    }

    if (config.microDynamics) {
      this.state.microDynamics = { ...this.state.microDynamics, ...config.microDynamics };
    }

    this.state.metrics.lastUpdate = Date.now();
    this.notifySubscribers();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   GETTERS
  // ─────────────────────────────────────────────────────────────────────────

  getState(): VoiceProsodyState {
    return this.state;
  }

  getProsody(): VoiceProsodyState['prosody'] {
    return this.state.prosody;
  }

  getTimbre(): VoiceProsodyState['timbre'] {
    return this.state.timbre;
  }

  getMicroDynamics(): VoiceProsodyState['microDynamics'] {
    return this.state.microDynamics;
  }

  getConfig(): VoiceConfig {
    return {
      prosody: this.state.prosody,
      timbre: this.state.timbre,
      microDynamics: this.state.microDynamics,
    };
  }

  /**
   * Générer SSML pour TTS (compatible avec prosodyEngine legacy)
   */
  generateSSML(text: string): string {
    const { rate, pitch, volume } = this.state.prosody;

    // Convertir valeurs numériques en SSML
    const rateSSML = this.mapRateToSSML(rate);
    const pitchSSML = this.mapPitchToSSML(pitch);
    const volumeSSML = this.mapVolumeToSSML(volume);

    return `<speak>
  <prosody rate="${rateSSML}" pitch="${pitchSSML}" volume="${volumeSSML}">
    ${text}
  </prosody>
</speak>`;
  }

  private mapRateToSSML(rate: number): string {
    if (rate < 0.7) return 'x-slow';
    if (rate < 0.85) return 'slow';
    if (rate < 1.15) return 'medium';
    if (rate < 1.3) return 'fast';
    return 'x-fast';
  }

  private mapPitchToSSML(pitch: number): string {
    if (pitch < 0.7) return 'x-low';
    if (pitch < 0.85) return 'low';
    if (pitch < 1.15) return 'medium';
    if (pitch < 1.3) return 'high';
    return 'x-high';
  }

  private mapVolumeToSSML(volume: number): string {
    if (volume < 0.2) return 'x-soft';
    if (volume < 0.4) return 'soft';
    if (volume < 0.8) return 'medium';
    if (volume < 0.95) return 'loud';
    return 'x-loud';
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   SUBSCRIPTION
  // ─────────────────────────────────────────────────────────────────────────

  subscribe(callback: (state: VoiceProsodyState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   RESET
  // ─────────────────────────────────────────────────────────────────────────

  reset(): void {
    this.state = {
      isActive: this.state.isActive,
      prosody: {
        rate: 1.0,
        pitch: 1.0,
        volume: 0.7,
        emphasis: 0.5,
      },
      timbre: {
        warmth: 0.5,
        breathiness: 0.3,
        resonance: 0.5,
        clarity: 0.7,
      },
      microDynamics: {
        intonationVariation: 0.5,
        rhythmicFlow: 0.6,
        pausePlacement: 0.5,
        emotionalColoring: 0.5,
      },
      metrics: {
        lastUpdate: Date.now(),
        updateCount: 0,
        averageRate: 1.0,
        averagePitch: 1.0,
      },
    };

    this.notifySubscribers();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const voiceProsodyEngine = new VoiceProsodyEngine();
export default voiceProsodyEngine;
