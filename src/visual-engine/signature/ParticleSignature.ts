/**
 * TITANE∞ v21 — Particle Signature
 * Distribution et émission de particules signature
 *
 * Système de particules unique à TITANE∞ :
 * - Distribution Fibonacci (spirale dorée)
 * - Densité modulée par l'état cognitif
 * - Trail léger pour état "thinking"
 * - Synchronisation avec Identity Pulse
 *
 * Architecture:
 * CognitiveState → Distribution Pattern → Particle Emission → Visual Output
 */

import { CognitiveState, EmotionalTone } from '@/design-system/visual-states';

// ═════════════════════════════════════════════════════════════════
// TYPES — PARTICLE SIGNATURE
// ═════════════════════════════════════════════════════════════════

export interface ParticleDistribution {
  // Pattern type
  pattern: 'fibonacci' | 'spiral' | 'radial' | 'vortex' | 'burst';

  // Fibonacci spiral parameters
  goldenAngle: number; // radians (≈ 137.5°)
  spiralTightness: number; // 0-1 (how tight the spiral is)
  spiralRotation: number; // radians/second

  // Emission parameters
  emissionRate: number; // particles/second
  emissionVariation: number; // 0-1 (randomness)
  burstMode: boolean; // Emit in bursts vs continuous
  burstInterval: number; // ms between bursts

  // Particle properties
  baseSize: number; // px
  sizeVariation: number; // 0-1
  baseSpeed: number; // px/second
  speedVariation: number; // 0-1
  lifespan: number; // ms
  lifespanVariation: number; // 0-1

  // Trail effect
  trailEnabled: boolean;
  trailLength: number; // number of trail segments
  trailFade: number; // 0-1 (how quickly trail fades)

  // Color
  colors: string[]; // Array of colors to cycle through
  colorCycleSpeed: number; // Hz
  colorVariation: number; // 0-1 (hue/saturation variation)
}

export interface ParticleSignatureConfig {
  maxParticles: number;
  density: number; // 0-1 (overall particle density)
  distribution: ParticleDistribution;
}

export interface ParticleEmissionEvent {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: number;
  color: string;
  lifespan: number;
  trailEnabled: boolean;
  timestamp: number;
}

// ═════════════════════════════════════════════════════════════════
// PARTICLE SIGNATURE ENGINE
// ═════════════════════════════════════════════════════════════════

export class ParticleSignature {
  private config: ParticleSignatureConfig;
  private particleCount = 0;
  private emissionAccumulator = 0;
  private lastEmissionTime = 0;
  private fibonacciIndex = 0;
  private colorIndex = 0;
  private centerX = 0;
  private centerY = 0;

  // State
  private cognitiveState: CognitiveState = CognitiveState.IDLE;
  private emotionalTone: EmotionalTone = EmotionalTone.CALM;
  private intensity: number = 0.5;

  // Constants
  private static readonly GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.5°
  private static readonly PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

  constructor(centerX: number = 0, centerY: number = 0) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.config = this.createDefaultConfig();
  }

  /**
   * Update state and recalculate distribution
   */
  updateState(
    cognitive: CognitiveState,
    emotional: EmotionalTone,
    intensity: number
  ): void {
    this.cognitiveState = cognitive;
    this.emotionalTone = emotional;
    this.intensity = Math.max(0, Math.min(1, intensity));

    // Recalculate config
    this.config = this.calculateConfig();
  }

  /**
   * Update center position (when visual engine moves/resizes)
   */
  updateCenter(x: number, y: number): void {
    this.centerX = x;
    this.centerY = y;
  }

  /**
   * Emit particles for this frame
   * Returns array of emission events
   */
  emit(timestamp: number, deltaTime: number): ParticleEmissionEvent[] {
    const events: ParticleEmissionEvent[] = [];

    // Check if we should emit
    if (!this.shouldEmit(timestamp)) {
      return events;
    }

    // Calculate number of particles to emit this frame
    const particlesToEmit = this.calculateEmissionCount(deltaTime);

    for (let i = 0; i < particlesToEmit; i++) {
      if (this.particleCount >= this.config.maxParticles) {
        break;
      }

      const event = this.createEmissionEvent(timestamp);
      events.push(event);
      this.particleCount++;
      this.fibonacciIndex++;
    }

    this.lastEmissionTime = timestamp;
    return events;
  }

  /**
   * Notify that a particle has died (update count)
   */
  onParticleDeath(): void {
    this.particleCount = Math.max(0, this.particleCount - 1);
  }

  /**
   * Get current configuration
   */
  getConfig(): ParticleSignatureConfig {
    return { ...this.config };
  }

  // ═════════════════════════════════════════════════════════════════
  // PRIVATE — CONFIG
  // ═════════════════════════════════════════════════════════════════

  private createDefaultConfig(): ParticleSignatureConfig {
    return {
      maxParticles: 600,
      density: 0.5,
      distribution: {
        pattern: 'fibonacci',
        goldenAngle: ParticleSignature.GOLDEN_ANGLE,
        spiralTightness: 0.3,
        spiralRotation: 0.1,
        emissionRate: 10,
        emissionVariation: 0.2,
        burstMode: false,
        burstInterval: 500,
        baseSize: 2,
        sizeVariation: 0.5,
        baseSpeed: 50,
        speedVariation: 0.3,
        lifespan: 3000,
        lifespanVariation: 0.4,
        trailEnabled: false,
        trailLength: 5,
        trailFade: 0.2,
        colors: ['#4ECDC4', '#44A5FF', '#9B59D0'],
        colorCycleSpeed: 0.1,
        colorVariation: 0.1,
      },
    };
  }

  private calculateConfig(): ParticleSignatureConfig {
    const config = { ...this.createDefaultConfig() };
    const dist = config.distribution;

    // Cognitive state modulation
    switch (this.cognitiveState) {
      case CognitiveState.THINKING:
        dist.pattern = 'fibonacci';
        dist.emissionRate = 15;
        dist.trailEnabled = true;
        dist.trailLength = 8;
        dist.baseSpeed = 60;
        dist.spiralRotation = 0.2;
        break;

      case CognitiveState.PROCESSING:
        dist.pattern = 'vortex';
        dist.emissionRate = 25;
        dist.trailEnabled = true;
        dist.trailLength = 12;
        dist.baseSpeed = 100;
        dist.spiralRotation = 0.5;
        config.maxParticles = 800;
        break;

      case CognitiveState.SPEAKING:
        dist.pattern = 'radial';
        dist.emissionRate = 12;
        dist.burstMode = true;
        dist.burstInterval = 300;
        dist.baseSpeed = 70;
        break;

      case CognitiveState.LISTENING:
        dist.pattern = 'spiral';
        dist.emissionRate = 5;
        dist.baseSpeed = 30;
        dist.spiralTightness = 0.5;
        config.density = 0.3;
        break;

      case CognitiveState.IDLE:
      default:
        // Use defaults
        break;
    }

    // Emotional tone modulation
    switch (this.emotionalTone) {
      case EmotionalTone.EMPATHETIC:
        dist.colors = ['#FF6B9D', '#C44569', '#FFA07A'];
        dist.baseSize = 2.5;
        dist.sizeVariation = 0.6;
        break;

      case EmotionalTone.CONFIDENT:
        dist.colors = ['#4ECDC4', '#44A5FF', '#5DADE2'];
        dist.pattern = 'fibonacci';
        dist.spiralTightness = 0.2;
        break;

      case EmotionalTone.EXCITED:
        dist.colors = ['#9B59D0', '#FF6B9D', '#FFA07A', '#44A5FF'];
        dist.colorCycleSpeed = 0.3;
        dist.colorVariation = 0.3;
        dist.pattern = 'burst';
        break;

      case EmotionalTone.CAUTIOUS:
        dist.colors = ['#4ECDC4', '#44A5FF'];
        dist.pattern = 'radial';
        dist.emissionVariation = 0.1;
        break;

      case EmotionalTone.PLAYFUL:
        dist.colors = ['#FF6B9D', '#FFA07A', '#FFD93D', '#44A5FF'];
        dist.colorCycleSpeed = 0.5;
        dist.pattern = 'burst';
        dist.burstMode = true;
        break;

      case EmotionalTone.CALM:
      default:
        // Use defaults
        break;
    }

    // Intensity modulation
    config.density = config.density * (0.3 + 0.7 * this.intensity);
    dist.emissionRate = dist.emissionRate * (0.5 + 0.5 * this.intensity);

    return config;
  }

  // ═════════════════════════════════════════════════════════════════
  // PRIVATE — EMISSION
  // ═════════════════════════════════════════════════════════════════

  private shouldEmit(timestamp: number): boolean {
    const { burstMode, burstInterval } = this.config.distribution;

    if (burstMode) {
      const timeSinceLastBurst = timestamp - this.lastEmissionTime;
      return timeSinceLastBurst >= burstInterval;
    }

    return true; // Continuous emission
  }

  private calculateEmissionCount(deltaTime: number): number {
    const { emissionRate, emissionVariation, burstMode } = this.config.distribution;

    if (burstMode) {
      // Emit multiple particles in a burst
      const baseCount = emissionRate * 2;
      const variation = baseCount * emissionVariation * (Math.random() - 0.5);
      return Math.max(1, Math.round(baseCount + variation));
    }

    // Continuous emission
    const deltaSeconds = deltaTime / 1000;
    this.emissionAccumulator += emissionRate * deltaSeconds * this.config.density;

    const count = Math.floor(this.emissionAccumulator);
    this.emissionAccumulator -= count;

    return count;
  }

  private createEmissionEvent(timestamp: number): ParticleEmissionEvent {
    const { distribution } = this.config;

    // Calculate position based on pattern
    const position = this.calculatePosition();

    // Calculate velocity
    const velocity = this.calculateVelocity(position);

    // Calculate size
    const size = this.calculateSize();

    // Calculate color
    const color = this.calculateColor();

    // Calculate lifespan
    const lifespan = this.calculateLifespan();

    return {
      position,
      velocity,
      size,
      color,
      lifespan,
      trailEnabled: distribution.trailEnabled,
      timestamp,
    };
  }

  private calculatePosition(): { x: number; y: number } {
    const {
      pattern,
      spiralTightness: _spiralTightness,
      goldenAngle: _goldenAngle,
    } = this.config.distribution;

    switch (pattern) {
      case 'fibonacci':
        return this.calculateFibonacciPosition();

      case 'spiral':
        return this.calculateSpiralPosition();

      case 'radial':
        return this.calculateRadialPosition();

      case 'vortex':
        return this.calculateVortexPosition();

      case 'burst':
        return this.calculateBurstPosition();

      default:
        return { x: this.centerX, y: this.centerY };
    }
  }

  private calculateFibonacciPosition(): { x: number; y: number } {
    const { goldenAngle, spiralTightness } = this.config.distribution;
    const index = this.fibonacciIndex;

    // Fibonacci spiral: r = c * sqrt(n), θ = n * golden_angle
    const angle = index * goldenAngle;
    const radius = Math.sqrt(index) * spiralTightness * 10;

    return {
      x: this.centerX + radius * Math.cos(angle),
      y: this.centerY + radius * Math.sin(angle),
    };
  }

  private calculateSpiralPosition(): { x: number; y: number } {
    const angle = (this.fibonacciIndex * 0.5) % (2 * Math.PI);
    const radius = this.fibonacciIndex * 0.3;

    return {
      x: this.centerX + radius * Math.cos(angle),
      y: this.centerY + radius * Math.sin(angle),
    };
  }

  private calculateRadialPosition(): { x: number; y: number } {
    const angle = Math.random() * 2 * Math.PI;
    const radius = 5 + Math.random() * 10;

    return {
      x: this.centerX + radius * Math.cos(angle),
      y: this.centerY + radius * Math.sin(angle),
    };
  }

  private calculateVortexPosition(): { x: number; y: number } {
    const angle = this.fibonacciIndex * 0.2;
    const radius = Math.sin(this.fibonacciIndex * 0.1) * 20 + 10;

    return {
      x: this.centerX + radius * Math.cos(angle),
      y: this.centerY + radius * Math.sin(angle),
    };
  }

  private calculateBurstPosition(): { x: number; y: number } {
    return { x: this.centerX, y: this.centerY };
  }

  private calculateVelocity(position: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const { baseSpeed, speedVariation } = this.config.distribution;

    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.01) {
      // Random direction if at center
      const angle = Math.random() * 2 * Math.PI;
      return {
        x: baseSpeed * Math.cos(angle),
        y: baseSpeed * Math.sin(angle),
      };
    }

    // Radial velocity with variation
    const speed = baseSpeed * (1 + (Math.random() - 0.5) * speedVariation);
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    return { x: vx, y: vy };
  }

  private calculateSize(): number {
    const { baseSize, sizeVariation } = this.config.distribution;
    const variation = (Math.random() - 0.5) * sizeVariation;
    return Math.max(0.5, baseSize * (1 + variation));
  }

  private calculateColor(): string {
    const {
      colors,
      colorCycleSpeed,
      colorVariation: _colorVariation,
    } = this.config.distribution;

    if (colors.length === 0) return '#ffffff';

    // Cycle through colors
    const index = Math.floor(this.colorIndex) % colors.length;
    this.colorIndex += colorCycleSpeed;

    return colors[index] ?? '#ffffff';
  }

  private calculateLifespan(): number {
    const { lifespan, lifespanVariation } = this.config.distribution;
    const variation = (Math.random() - 0.5) * lifespanVariation;
    return Math.max(500, lifespan * (1 + variation));
  }
}

// ═════════════════════════════════════════════════════════════════
// FACTORY
// ═════════════════════════════════════════════════════════════════

/**
 * Create particle signature at given position
 */
export function createParticleSignature(
  centerX: number = 0,
  centerY: number = 0
): ParticleSignature {
  return new ParticleSignature(centerX, centerY);
}

export default ParticleSignature;
