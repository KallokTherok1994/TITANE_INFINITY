/**
 * TITANE∞ v21 — Orbital Signature
 * Mouvement orbital unique et signature de TITANE∞
 *
 * Les anneaux orbitaux suivent une chorégraphie unique :
 * - Ratios orbitaux basés sur la suite de Fibonacci
 * - Phase shift synchronisé aux transitions cognitives
 * - Variation subtile selon le ton émotionnel
 * - Résonance harmonique entre les anneaux
 *
 * Architecture:
 * OrbitalState → OrbitalPhysics → Ring Positions → Visual Output
 */

import type { CognitiveState, EmotionalTone } from '@/design-system/visual-states';

// ═════════════════════════════════════════════════════════════════
// TYPES — ORBITAL
// ═════════════════════════════════════════════════════════════════

export interface OrbitalRing {
  index: number; // 0-2 (3 rings)
  radius: number; // px
  thickness: number; // px
  opacity: number; // 0-1
  angle: number; // radians (current position)
  velocity: number; // radians/second
  phaseOffset: number; // radians (initial offset)
}

export interface OrbitalParameters {
  // Ring configuration
  ringCount: number; // Number of rings (typically 3)
  baseRadius: number; // px (innermost ring)
  radiusMultiplier: number; // Golden ratio or Fibonacci-based

  // Velocity
  baseVelocity: number; // radians/second
  velocityVariation: number; // 0-1 (velocity spread between rings)

  // Phase relationships
  phaseMode: 'aligned' | 'fibonacci' | 'golden' | 'chaotic';
  phaseShiftSpeed: number; // How fast phases shift during transitions

  // Visual properties
  thicknessMin: number; // px
  thicknessMax: number; // px
  opacityMin: number; // 0-1
  opacityMax: number; // 0-1

  // Resonance
  resonanceStrength: number; // 0-1 (coupling between rings)
  resonanceFrequency: number; // Hz (oscillation frequency)
}

export interface OrbitalSnapshot {
  rings: OrbitalRing[];
  timestamp: number;
  deltaTime: number;
  coherence: number; // 0-1 (how aligned the rings are)
  energy: number; // 0-1 (total kinetic energy)
}

// ═════════════════════════════════════════════════════════════════
// ORBITAL SIGNATURE ENGINE
// ═════════════════════════════════════════════════════════════════

export class OrbitalSignature {
  private parameters: OrbitalParameters;
  private rings: OrbitalRing[] = [];
  private startTime: number;
  private lastUpdateTime: number;
  private isTransitioning = false;
  private transitionProgress = 0;
  private transitionDuration = 1000; // ms

  // State
  private cognitiveState: CognitiveState = 'idle';
  private emotionalTone: EmotionalTone = 'neutral';
  private intensity: number = 0.5;

  // Fibonacci sequence for phase offsets
  private static readonly FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34];
  private static readonly GOLDEN_RATIO = 1.618033988749;

  constructor(ringCount: number = 3, baseRadius: number = 120) {
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;

    // Initialize parameters
    this.parameters = this.createDefaultParameters(ringCount, baseRadius);

    // Initialize rings
    this.initializeRings();
  }

  /**
   * Update cognitive state and trigger transition
   */
  updateState(
    cognitive: CognitiveState,
    emotional: EmotionalTone,
    intensity: number
  ): void {
    const stateChanged =
      this.cognitiveState !== cognitive || this.emotionalTone !== emotional;

    this.cognitiveState = cognitive;
    this.emotionalTone = emotional;
    this.intensity = Math.max(0, Math.min(1, intensity));

    if (stateChanged) {
      this.startTransition();
    }

    // Recalculate parameters
    this.parameters = this.calculateParameters();
  }

  /**
   * Update orbital simulation
   */
  update(timestamp: number): OrbitalSnapshot {
    const deltaTime = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp;

    // Update transition
    if (this.isTransitioning) {
      this.transitionProgress += deltaTime / this.transitionDuration;
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
      }
    }

    // Update each ring
    this.updateRings(deltaTime / 1000); // Convert to seconds

    // Calculate coherence and energy
    const coherence = this.calculateCoherence();
    const energy = this.calculateEnergy();

    return {
      rings: this.rings.map(ring => ({ ...ring })),
      timestamp,
      deltaTime,
      coherence,
      energy,
    };
  }

  /**
   * Get current snapshot without updating
   */
  getSnapshot(): OrbitalSnapshot {
    return {
      rings: this.rings.map(ring => ({ ...ring })),
      timestamp: this.lastUpdateTime,
      deltaTime: 0,
      coherence: this.calculateCoherence(),
      energy: this.calculateEnergy(),
    };
  }

  // ═════════════════════════════════════════════════════════════════
  // PRIVATE — INITIALIZATION
  // ═════════════════════════════════════════════════════════════════

  private createDefaultParameters(
    ringCount: number,
    baseRadius: number
  ): OrbitalParameters {
    return {
      ringCount,
      baseRadius,
      radiusMultiplier: OrbitalSignature.GOLDEN_RATIO,
      baseVelocity: 0.5, // radians/second
      velocityVariation: 0.3,
      phaseMode: 'fibonacci',
      phaseShiftSpeed: 1.0,
      thicknessMin: 2,
      thicknessMax: 4,
      opacityMin: 0.3,
      opacityMax: 0.8,
      resonanceStrength: 0.1,
      resonanceFrequency: 0.5,
    };
  }

  private initializeRings(): void {
    this.rings = [];

    for (let i = 0; i < this.parameters.ringCount; i++) {
      const ring = this.createRing(i);
      this.rings.push(ring);
    }
  }

  private createRing(index: number): OrbitalRing {
    const { baseRadius, radiusMultiplier, baseVelocity, velocityVariation } =
      this.parameters;

    // Calculate radius using golden ratio or Fibonacci
    const radius = baseRadius * Math.pow(radiusMultiplier, index);

    // Calculate velocity with variation
    const velocityFactor = 1 - (index * velocityVariation) / this.parameters.ringCount;
    const velocity = baseVelocity * velocityFactor;

    // Calculate phase offset based on mode
    const phaseOffset = this.calculatePhaseOffset(index);

    return {
      index,
      radius,
      thickness: this.parameters.thicknessMin,
      opacity: this.parameters.opacityMax,
      angle: phaseOffset,
      velocity,
      phaseOffset,
    };
  }

  private calculatePhaseOffset(index: number): number {
    const { phaseMode } = this.parameters;

    switch (phaseMode) {
      case 'aligned':
        return 0;

      case 'fibonacci': {
        const fib = OrbitalSignature.FIBONACCI[index % OrbitalSignature.FIBONACCI.length];
        return (fib / 21) * 2 * Math.PI; // Normalize to 0-2π
      }

      case 'golden':
        return (index * OrbitalSignature.GOLDEN_RATIO * 2 * Math.PI) % (2 * Math.PI);

      case 'chaotic':
        return Math.random() * 2 * Math.PI;

      default:
        return 0;
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // PRIVATE — UPDATE
  // ═════════════════════════════════════════════════════════════════

  private updateRings(deltaSeconds: number): void {
    const { resonanceStrength, resonanceFrequency: _resonanceFrequency } =
      this.parameters;
    const time = (this.lastUpdateTime - this.startTime) / 1000;

    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i];

      // Base rotation
      ring.angle += ring.velocity * deltaSeconds;
      ring.angle = ring.angle % (2 * Math.PI);

      // Resonance coupling (rings influence each other)
      if (resonanceStrength > 0) {
        const resonance = this.calculateResonance(i, time);
        ring.angle += resonance * deltaSeconds * resonanceStrength;
      }

      // Update visual properties based on state
      this.updateRingVisuals(ring);
    }
  }

  private calculateResonance(ringIndex: number, time: number): number {
    const { resonanceFrequency } = this.parameters;

    // Calculate average angle of neighboring rings
    let sum = 0;
    let count = 0;

    for (let i = 0; i < this.rings.length; i++) {
      if (i !== ringIndex) {
        sum += this.rings[i].angle;
        count++;
      }
    }

    if (count === 0) return 0;

    const averageAngle = sum / count;
    const currentAngle = this.rings[ringIndex].angle;

    // Calculate angular difference
    let diff = averageAngle - currentAngle;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    // Apply resonance frequency modulation
    const modulation = Math.sin(2 * Math.PI * resonanceFrequency * time);

    return diff * modulation;
  }

  private updateRingVisuals(ring: OrbitalRing): void {
    const { thicknessMin, thicknessMax, opacityMin, opacityMax } = this.parameters;

    // Thickness based on intensity
    const thicknessRange = thicknessMax - thicknessMin;
    ring.thickness = thicknessMin + thicknessRange * this.intensity;

    // Opacity based on position in orbital cycle
    const opacityRange = opacityMax - opacityMin;
    const cycle = (Math.sin(ring.angle) + 1) / 2;
    ring.opacity = opacityMin + opacityRange * cycle;

    // Smooth transition
    if (this.isTransitioning) {
      const easing = this.easeInOutCubic(this.transitionProgress);
      ring.opacity *= easing;
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // PRIVATE — STATE CALCULATION
  // ═════════════════════════════════════════════════════════════════

  private calculateParameters(): OrbitalParameters {
    const params = { ...this.parameters };

    // Cognitive state modulation
    switch (this.cognitiveState) {
      case 'thinking':
        params.baseVelocity = 0.7;
        params.velocityVariation = 0.4;
        params.resonanceStrength = 0.15;
        break;

      case 'processing':
        params.baseVelocity = 1.2;
        params.velocityVariation = 0.6;
        params.resonanceStrength = 0.3;
        params.phaseMode = 'chaotic';
        break;

      case 'responding':
        params.baseVelocity = 0.6;
        params.velocityVariation = 0.2;
        params.resonanceStrength = 0.1;
        break;

      case 'listening':
        params.baseVelocity = 0.3;
        params.velocityVariation = 0.1;
        params.resonanceStrength = 0.05;
        params.phaseMode = 'aligned';
        break;

      case 'idle':
      default:
        // Use defaults
        break;
    }

    // Emotional tone modulation
    switch (this.emotionalTone) {
      case 'empathetic':
        params.resonanceStrength *= 1.5;
        params.opacityMax = 0.9;
        break;

      case 'analytical':
        params.phaseMode = 'golden';
        params.resonanceStrength *= 0.5;
        break;

      case 'creative':
        params.phaseMode = 'chaotic';
        params.velocityVariation = 0.8;
        params.resonanceFrequency = 1.0;
        break;

      case 'focused':
        params.phaseMode = 'aligned';
        params.velocityVariation = 0.1;
        break;

      case 'playful':
        params.baseVelocity *= 1.5;
        params.resonanceFrequency = 2.0;
        break;

      case 'neutral':
      default:
        // Use defaults
        break;
    }

    return params;
  }

  private calculateCoherence(): number {
    if (this.rings.length < 2) return 1;

    // Calculate angular variance
    let sumCos = 0;
    let sumSin = 0;

    for (const ring of this.rings) {
      sumCos += Math.cos(ring.angle);
      sumSin += Math.sin(ring.angle);
    }

    const avgCos = sumCos / this.rings.length;
    const avgSin = sumSin / this.rings.length;

    // Coherence is the magnitude of the average vector
    const coherence = Math.sqrt(avgCos * avgCos + avgSin * avgSin);
    return coherence;
  }

  private calculateEnergy(): number {
    let totalEnergy = 0;

    for (const ring of this.rings) {
      // Kinetic energy proportional to velocity squared
      totalEnergy += ring.velocity * ring.velocity * ring.radius;
    }

    // Normalize
    const maxEnergy =
      this.rings.length *
      this.parameters.baseVelocity *
      this.parameters.baseVelocity *
      this.parameters.baseRadius;
    return Math.min(1, totalEnergy / maxEnergy);
  }

  // ═════════════════════════════════════════════════════════════════
  // PRIVATE — TRANSITIONS
  // ═════════════════════════════════════════════════════════════════

  private startTransition(): void {
    this.isTransitioning = true;
    this.transitionProgress = 0;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// ═════════════════════════════════════════════════════════════════
// FACTORY
// ═════════════════════════════════════════════════════════════════

/**
 * Create orbital signature with default configuration
 */
export function createOrbitalSignature(
  ringCount: number = 3,
  baseRadius: number = 120
): OrbitalSignature {
  return new OrbitalSignature(ringCount, baseRadius);
}

export default OrbitalSignature;
