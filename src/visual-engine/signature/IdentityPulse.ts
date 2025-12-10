/**
 * TITANE∞ v21 — Identity Pulse
 * Pulsation identitaire unique du noyau TITANE∞
 *
 * Cette pulsation "vivante" est la signature visuelle de TITANE∞ :
 * - Glow respirant synchronisé au rythme cognitif
 * - Color shift subtil basé sur l'émotion
 * - Micro-déformation harmonique du noyau
 * - Phase alignment avec les anneaux orbitaux
 *
 * Architecture:
 * CognitiveState → PulseParameters → Waveform → Visual Output
 */

import type { CognitiveState, EmotionalTone } from '@/design-system/visual-states';

// ═════════════════════════════════════════════════════════════════
// TYPES — PULSE
// ═════════════════════════════════════════════════════════════════

export interface PulseParameters {
  // Timing
  frequency: number; // Hz (respirations par seconde)
  phase: number; // 0-1 (position dans le cycle)
  tempo: number; // 0-2 (vitesse relative, 1 = normal)

  // Intensity
  glowMin: number; // 0-1 (intensité minimale du glow)
  glowMax: number; // 0-1 (intensité maximale du glow)
  pulseAmplitude: number; // 0-1 (amplitude de la pulsation)

  // Color shift
  colorShiftAmount: number; // 0-1 (quantité de shift chromatique)
  colorShiftSpeed: number; // Hz (vitesse du cycle de couleur)
  hueOffset: number; // 0-360 (décalage de teinte)

  // Deformation
  deformationAmount: number; // 0-1 (quantité de déformation)
  deformationFrequency: number; // Hz (fréquence des vagues)
  deformationPhase: number; // 0-1 (phase de déformation)

  // Harmonics
  harmonicCount: number; // Nombre d'harmoniques (1-5)
  harmonicDecay: number; // 0-1 (atténuation des harmoniques)
}

export interface PulseWaveform {
  // Current values
  glowIntensity: number; // 0-1
  scale: number; // 0.95-1.05 (scaling du noyau)
  hue: number; // 0-360
  saturation: number; // 0-100
  deformation: number; // 0-1

  // Phase info
  phase: number; // 0-1 (position dans le cycle)
  velocity: number; // -1 to 1 (vitesse instantanée)

  // Timing
  timestamp: number; // ms
  deltaTime: number; // ms depuis dernière frame
}

// ═════════════════════════════════════════════════════════════════
// IDENTITY PULSE ENGINE
// ═════════════════════════════════════════════════════════════════

export class IdentityPulse {
  private parameters: PulseParameters;
  private startTime: number;
  private lastUpdateTime: number;
  private currentWaveform: PulseWaveform;

  // State
  private cognitiveState: CognitiveState = 'idle';
  private emotionalTone: EmotionalTone = 'neutral';
  private intensity: number = 0.5;

  constructor() {
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;

    // Default parameters (neutral state)
    this.parameters = this.createDefaultParameters();
    this.currentWaveform = this.createDefaultWaveform();
  }

  /**
   * Update cognitive state and recalculate parameters
   */
  updateState(
    cognitive: CognitiveState,
    emotional: EmotionalTone,
    intensity: number
  ): void {
    this.cognitiveState = cognitive;
    this.emotionalTone = emotional;
    this.intensity = Math.max(0, Math.min(1, intensity));

    // Recalculate parameters based on new state
    this.parameters = this.calculateParameters();
  }

  /**
   * Compute next frame of the pulse waveform
   */
  update(timestamp: number): PulseWaveform {
    const deltaTime = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp;

    const elapsed = timestamp - this.startTime;
    const phase = this.calculatePhase(elapsed);

    // Calculate base wave (sine with harmonics)
    const baseWave = this.calculateHarmonicWave(phase);

    // Calculate glow intensity
    const glowIntensity = this.calculateGlow(baseWave);

    // Calculate scale (breathing effect)
    const scale = this.calculateScale(baseWave);

    // Calculate color shift
    const { hue, saturation } = this.calculateColorShift(phase);

    // Calculate deformation
    const deformation = this.calculateDeformation(phase, elapsed);

    // Calculate velocity (derivative)
    const velocity = this.calculateVelocity(phase);

    this.currentWaveform = {
      glowIntensity,
      scale,
      hue,
      saturation,
      deformation,
      phase,
      velocity,
      timestamp,
      deltaTime,
    };

    return this.currentWaveform;
  }

  /**
   * Get current waveform without updating
   */
  getCurrentWaveform(): PulseWaveform {
    return { ...this.currentWaveform };
  }

  /**
   * Get current parameters
   */
  getParameters(): PulseParameters {
    return { ...this.parameters };
  }

  // ═════════════════════════════════════════════════════════════════
  // PRIVATE — CALCULATION METHODS
  // ═════════════════════════════════════════════════════════════════

  private createDefaultParameters(): PulseParameters {
    return {
      frequency: 0.5, // 0.5 Hz = 1 respiration toutes les 2 secondes
      phase: 0,
      tempo: 1,
      glowMin: 0.3,
      glowMax: 0.8,
      pulseAmplitude: 0.15,
      colorShiftAmount: 0.1,
      colorShiftSpeed: 0.1,
      hueOffset: 0,
      deformationAmount: 0.05,
      deformationFrequency: 0.25,
      deformationPhase: 0,
      harmonicCount: 2,
      harmonicDecay: 0.5,
    };
  }

  private createDefaultWaveform(): PulseWaveform {
    return {
      glowIntensity: 0.5,
      scale: 1,
      hue: 180,
      saturation: 50,
      deformation: 0,
      phase: 0,
      velocity: 0,
      timestamp: Date.now(),
      deltaTime: 0,
    };
  }

  /**
   * Calculate parameters based on cognitive/emotional state
   */
  private calculateParameters(): PulseParameters {
    const params = { ...this.createDefaultParameters() };

    // Cognitive state modulation
    switch (this.cognitiveState) {
      case 'thinking':
        params.frequency = 0.8; // Plus rapide
        params.tempo = 1.3;
        params.pulseAmplitude = 0.25;
        params.harmonicCount = 3;
        break;

      case 'processing':
        params.frequency = 1.2; // Très rapide
        params.tempo = 1.6;
        params.pulseAmplitude = 0.3;
        params.deformationAmount = 0.1;
        params.harmonicCount = 4;
        break;

      case 'responding':
        params.frequency = 0.6;
        params.tempo = 1.1;
        params.pulseAmplitude = 0.2;
        break;

      case 'listening':
        params.frequency = 0.4; // Lent, calme
        params.tempo = 0.8;
        params.pulseAmplitude = 0.12;
        params.glowMax = 0.6;
        break;

      case 'idle':
      default:
        // Use defaults
        break;
    }

    // Emotional tone modulation
    switch (this.emotionalTone) {
      case 'empathetic':
        params.hueOffset = 30; // Warm hues
        params.colorShiftAmount = 0.15;
        params.glowMax = 0.9;
        break;

      case 'analytical':
        params.hueOffset = -30; // Cool hues
        params.colorShiftAmount = 0.05;
        params.deformationAmount = 0.02; // Plus rigide
        break;

      case 'creative':
        params.colorShiftAmount = 0.25;
        params.colorShiftSpeed = 0.2;
        params.deformationAmount = 0.15;
        params.harmonicCount = 5;
        break;

      case 'focused':
        params.frequency = 0.3;
        params.pulseAmplitude = 0.08;
        params.harmonicCount = 1; // Onde pure
        break;

      case 'playful':
        params.frequency = 1.0;
        params.tempo = 1.4;
        params.colorShiftSpeed = 0.3;
        params.deformationAmount = 0.12;
        break;

      case 'neutral':
      default:
        // Use defaults
        break;
    }

    // Intensity modulation (0-1)
    params.glowMax = params.glowMax * (0.5 + 0.5 * this.intensity);
    params.pulseAmplitude = params.pulseAmplitude * (0.5 + 0.5 * this.intensity);

    return params;
  }

  /**
   * Calculate phase (0-1) based on elapsed time and frequency
   */
  private calculatePhase(elapsed: number): number {
    const { frequency, tempo } = this.parameters;
    const adjustedFrequency = frequency * tempo;
    return ((elapsed / 1000) * adjustedFrequency) % 1;
  }

  /**
   * Calculate harmonic wave (sum of sine waves)
   */
  private calculateHarmonicWave(phase: number): number {
    const { harmonicCount, harmonicDecay } = this.parameters;
    let sum = 0;
    let weight = 1;

    for (let i = 1; i <= harmonicCount; i++) {
      sum += weight * Math.sin(2 * Math.PI * i * phase);
      weight *= harmonicDecay;
    }

    // Normalize to 0-1
    const maxSum = (1 - Math.pow(harmonicDecay, harmonicCount)) / (1 - harmonicDecay);
    return (sum / maxSum + 1) / 2;
  }

  /**
   * Calculate glow intensity
   */
  private calculateGlow(baseWave: number): number {
    const { glowMin, glowMax, pulseAmplitude: _pulseAmplitude } = this.parameters;
    const range = glowMax - glowMin;
    return glowMin + range * (0.5 + 0.5 * Math.sin(2 * Math.PI * baseWave));
  }

  /**
   * Calculate scale (breathing effect)
   */
  private calculateScale(baseWave: number): number {
    const { pulseAmplitude } = this.parameters;
    return 1 + pulseAmplitude * (baseWave - 0.5);
  }

  /**
   * Calculate color shift
   */
  private calculateColorShift(phase: number): { hue: number; saturation: number } {
    const { colorShiftAmount, colorShiftSpeed, hueOffset } = this.parameters;

    const colorPhase = (phase * colorShiftSpeed) % 1;
    const shift = colorShiftAmount * Math.sin(2 * Math.PI * colorPhase);

    const baseHue = 180; // Cyan
    const hue = (baseHue + hueOffset + shift * 60 + 360) % 360;
    const saturation = 50 + shift * 20;

    return { hue, saturation };
  }

  /**
   * Calculate deformation (wave distortion)
   */
  private calculateDeformation(phase: number, elapsed: number): number {
    const { deformationAmount, deformationFrequency, deformationPhase } = this.parameters;

    if (deformationAmount === 0) return 0;

    const deformPhase = ((elapsed / 1000) * deformationFrequency + deformationPhase) % 1;
    return deformationAmount * Math.sin(2 * Math.PI * deformPhase);
  }

  /**
   * Calculate velocity (rate of change)
   */
  private calculateVelocity(phase: number): number {
    const { frequency, tempo } = this.parameters;
    const adjustedFrequency = frequency * tempo;
    return Math.cos(2 * Math.PI * phase) * adjustedFrequency;
  }
}

// ═════════════════════════════════════════════════════════════════
// FACTORY
// ═════════════════════════════════════════════════════════════════

/**
 * Create a new Identity Pulse instance
 */
export function createIdentityPulse(): IdentityPulse {
  return new IdentityPulse();
}

export default IdentityPulse;
