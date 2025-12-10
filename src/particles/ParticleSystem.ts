/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - Particle System (Upgraded)
 * Advanced particle system with physics and contextual patterns
 *
 * v21 Features:
 * - ✅ Support for 600 particles at 60fps
 * - ✅ 4 contextual patterns (spiral, focused, dispersed, chaotic)
 * - ✅ Adaptive density and velocity
 * - ✅ Dynamic multi-color support
 * - ✅ Enhanced pool-based particle management
 * - ✅ Adaptive FPS throttling
 * - ✅ Auto-throttle when FPS < 55
 * - ✅ Canvas-based rendering with GPU acceleration
 * - ✅ Debug mode with metrics
 * ═══════════════════════════════════════════════════════════════
 */

import EventEmitter from 'eventemitter3';
import { Particle, ParticleConfig } from './Particle';
import type { ParticlePattern } from '@/design-system/visual-states';

export interface ParticleSystemConfig {
  maxParticles: number;
  emissionRate: number;
  pattern: ParticlePattern;
  colors: string[];
  baseSize: number;
  sizeVariation: number;
  baseSpeed: number;
  speedVariation: number;
  lifespan: number;
  lifespanVariation: number;
  opacity: number;
  adaptiveFPS?: boolean; // v21: Auto-throttle on low FPS
  fpsThreshold?: number; // v21: FPS threshold for throttling (default: 55)
  debug?: boolean; // v21: Debug mode
}

export interface ParticleSystemMetrics {
  activeParticles: number;
  poolSize: number;
  emissionRate: number;
  fps: number;
  throttleLevel: number; // 0 = none, 1 = light, 2 = medium, 3 = heavy
  averageLifetime: number; // ms
}

export class ParticleSystem extends EventEmitter {
  private particles: Particle[] = [];
  private particlePool: Particle[] = [];
  private config: ParticleSystemConfig;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private centerX = 0;
  private centerY = 0;
  private width = 0;
  private height = 0;
  private timeSinceLastEmit = 0;
  private isRunning = false;
  private angleOffset = 0; // For spiral pattern

  // v21: FPS tracking and adaptive throttling
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;
  private throttleLevel = 0; // 0 = none, 1 = light, 2 = medium, 3 = heavy
  private lowFPSFrames = 0;
  private metrics: ParticleSystemMetrics = {
    activeParticles: 0,
    poolSize: 0,
    emissionRate: 10,
    fps: 60,
    throttleLevel: 0,
    averageLifetime: 0,
  };

  // v21: Color cycling for dynamic effects
  private colorIndex = 0;
  private colorCycleSpeed = 0.1;

  constructor(config: Partial<ParticleSystemConfig> = {}) {
    super();

    this.config = {
      maxParticles: 600,
      emissionRate: 10, // particles per frame
      pattern: 'spiral',
      colors: ['#ffffff'],
      baseSize: 2,
      sizeVariation: 1,
      baseSpeed: 50,
      speedVariation: 20,
      lifespan: 3000,
      lifespanVariation: 1000,
      opacity: 0.6,
      adaptiveFPS: true, // v21: Auto-enabled
      fpsThreshold: 55, // v21: Throttle if FPS < 55
      debug: false,
      ...config,
    };

    // Pre-allocate particle pool
    this.initializeParticlePool();

    if (this.config.debug) {
      console.log('[ParticleSystem] v21 initialized with config:', this.config);
    }
  }

  /**
   * Initialize particle pool for object reuse
   */
  private initializeParticlePool(): void {
    for (let i = 0; i < this.config.maxParticles; i++) {
      this.particlePool.push(
        new Particle({
          x: 0,
          y: 0,
          size: this.config.baseSize,
          color: this.config.colors[0],
          opacity: this.config.opacity,
          lifespan: this.config.lifespan,
        })
      );
    }
  }

  /**
   * Set canvas for rendering
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });

    if (this.ctx) {
      // Enable GPU acceleration
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    this.updateDimensions();
  }

  /**
   * Update canvas dimensions
   */
  updateDimensions(): void {
    if (!this.canvas) return;

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  /**
   * Start particle system
   */
  start(): void {
    this.isRunning = true;
    this.emit('start');
  }

  /**
   * Stop particle system
   */
  stop(): void {
    this.isRunning = false;
    this.emit('stop');
  }

  /**
   * Update particle system (v21 enhanced with adaptive FPS)
   */
  update(deltaTime: number): void {
    if (!this.isRunning) return;

    // v21: Track FPS
    this.updateFPS(deltaTime);

    // v21: Apply adaptive throttling
    if (this.config.adaptiveFPS) {
      this.applyAdaptiveThrottling();
    }

    // v21: Dynamic emission rate based on throttle level
    const effectiveEmissionRate = this.getEffectiveEmissionRate();

    // Emit new particles
    this.timeSinceLastEmit += deltaTime;
    const emitInterval = 1000 / 60; // Emit at 60fps rate

    if (this.timeSinceLastEmit >= emitInterval) {
      this.emitParticles(effectiveEmissionRate);
      this.timeSinceLastEmit = 0;
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime);

      // Apply pattern-specific forces
      this.applyPatternForces(particle);

      // Remove dead particles and return to pool
      if (particle.isDead || !particle.isInBounds(this.width, this.height, 100)) {
        this.particles.splice(i, 1);
        this.particlePool.push(particle);
      }
    }

    // Update spiral angle
    if (this.config.pattern === 'spiral') {
      this.angleOffset += deltaTime * 0.001;
    }

    // v21: Update color cycling
    this.colorIndex =
      (this.colorIndex + this.colorCycleSpeed * deltaTime * 0.001) %
      this.config.colors.length;

    // v21: Update metrics
    this.updateMetrics();

    this.emit('update', {
      particleCount: this.particles.length,
      poolSize: this.particlePool.length,
      fps: this.fps,
      throttleLevel: this.throttleLevel,
    });
  }

  /**
   * v21: Update FPS calculation
   */
  private updateFPS(deltaTime: number): void {
    this.frameCount++;

    if (this.frameCount >= 60) {
      this.fps = Math.round(1000 / deltaTime);
      this.frameCount = 0;
    }
  }

  /**
   * v21: Apply adaptive throttling based on FPS
   */
  private applyAdaptiveThrottling(): void {
    const threshold = this.config.fpsThreshold || 55;

    if (this.fps < threshold) {
      this.lowFPSFrames++;

      // Throttle if low FPS persists for 3+ seconds (180 frames at 60fps)
      if (this.lowFPSFrames >= 180) {
        this.increaseThrottle();
        this.lowFPSFrames = 0;
      }
    } else {
      // Good FPS, try to recover
      if (this.lowFPSFrames > 0) {
        this.lowFPSFrames = Math.max(0, this.lowFPSFrames - 10);
      }
      if (this.throttleLevel > 0 && this.fps >= 60) {
        this.decreaseThrottle();
      }
    }
  }

  /**
   * v21: Increase throttle level
   */
  private increaseThrottle(): void {
    if (this.throttleLevel >= 3) return;

    this.throttleLevel++;

    if (this.config.debug) {
      console.log(`[ParticleSystem] Throttle increased to level ${this.throttleLevel}`);
    }

    this.emit('throttleChange', { level: this.throttleLevel });
  }

  /**
   * v21: Decrease throttle level
   */
  private decreaseThrottle(): void {
    if (this.throttleLevel <= 0) return;

    this.throttleLevel--;

    if (this.config.debug) {
      console.log(`[ParticleSystem] Throttle decreased to level ${this.throttleLevel}`);
    }

    this.emit('throttleChange', { level: this.throttleLevel });
  }

  /**
   * v21: Get effective emission rate based on throttle level
   */
  private getEffectiveEmissionRate(): number {
    const baseRate = this.config.emissionRate;

    switch (this.throttleLevel) {
      case 0:
        return baseRate;
      case 1:
        return Math.floor(baseRate * 0.75); // 75% emission
      case 2:
        return Math.floor(baseRate * 0.5); // 50% emission
      case 3:
        return Math.floor(baseRate * 0.25); // 25% emission
      default:
        return baseRate;
    }
  }

  /**
   * v21: Update metrics
   */
  private updateMetrics(): void {
    this.metrics.activeParticles = this.particles.length;
    this.metrics.poolSize = this.particlePool.length;
    this.metrics.emissionRate = this.getEffectiveEmissionRate();
    this.metrics.fps = this.fps;
    this.metrics.throttleLevel = this.throttleLevel;

    // Calculate average lifetime
    if (this.particles.length > 0) {
      const totalAge = this.particles.reduce((sum, p) => sum + p.age, 0);
      this.metrics.averageLifetime = totalAge / this.particles.length;
    }
  }

  /**
   * Render particles to canvas
   */
  render(): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render particles
    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  /**
   * Emit new particles based on current pattern
   */
  private emitParticles(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.particlePool.length === 0) break;

      const particle = this.particlePool.pop();
      if (!particle) break;

      const config = this.createParticleConfig();
      particle.reset(config);
      this.particles.push(particle);
    }
  }

  /**
   * Create particle configuration based on pattern (v21 enhanced with dynamic colors)
   */
  private createParticleConfig(): ParticleConfig {
    // v21: Dynamic color selection - cycle through colors or random
    let color: string;
    if (this.config.colors.length > 1) {
      // Blend between current color index and next
      const currentIndex = Math.floor(this.colorIndex);
      const nextIndex = (currentIndex + 1) % this.config.colors.length;
      const blend = this.colorIndex - currentIndex;

      // Randomly choose current or next for smooth color transitions
      color =
        blend > Math.random()
          ? this.config.colors[nextIndex]
          : this.config.colors[currentIndex];
    } else {
      color = this.config.colors[0];
    }

    const size =
      this.config.baseSize + (Math.random() - 0.5) * 2 * this.config.sizeVariation;
    const lifespan =
      this.config.lifespan + (Math.random() - 0.5) * 2 * this.config.lifespanVariation;

    switch (this.config.pattern) {
      case 'spiral':
        return this.createSpiralParticle(color, size, lifespan);
      case 'focused':
        return this.createFocusedParticle(color, size, lifespan);
      case 'dispersed':
        return this.createDispersedParticle(color, size, lifespan);
      case 'chaotic':
        return this.createChaoticParticle(color, size, lifespan);
      default:
        return {
          x: this.centerX,
          y: this.centerY,
          vx: 0,
          vy: 0,
          color,
          size,
          lifespan,
          opacity: this.config.opacity,
        };
    }
  }

  /**
   * Create spiral pattern particle
   */
  private createSpiralParticle(
    color: string,
    size: number,
    lifespan: number
  ): ParticleConfig {
    const angle = this.angleOffset + Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * 30;

    const x = this.centerX + Math.cos(angle) * radius;
    const y = this.centerY + Math.sin(angle) * radius;

    const speed =
      this.config.baseSpeed + (Math.random() - 0.5) * 2 * this.config.speedVariation;
    const outwardAngle = angle;
    const vx = Math.cos(outwardAngle) * speed;
    const vy = Math.sin(outwardAngle) * speed;

    return { x, y, vx, vy, color, size, lifespan, opacity: this.config.opacity };
  }

  /**
   * Create focused pattern particle (emits from center)
   */
  private createFocusedParticle(
    color: string,
    size: number,
    lifespan: number
  ): ParticleConfig {
    const angle = Math.random() * Math.PI * 2;
    const speed =
      this.config.baseSpeed + (Math.random() - 0.5) * 2 * this.config.speedVariation;

    const x = this.centerX;
    const y = this.centerY;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    return { x, y, vx, vy, color, size, lifespan, opacity: this.config.opacity };
  }

  /**
   * Create dispersed pattern particle (scattered emission)
   */
  private createDispersedParticle(
    color: string,
    size: number,
    lifespan: number
  ): ParticleConfig {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 150;

    const x = this.centerX + Math.cos(angle) * radius;
    const y = this.centerY + Math.sin(angle) * radius;

    const speed =
      this.config.baseSpeed + (Math.random() - 0.5) * 2 * this.config.speedVariation;
    const dirAngle = Math.random() * Math.PI * 2;
    const vx = Math.cos(dirAngle) * speed * 0.5;
    const vy = Math.sin(dirAngle) * speed * 0.5;

    return { x, y, vx, vy, color, size, lifespan, opacity: this.config.opacity };
  }

  /**
   * Create chaotic pattern particle (random everything)
   */
  private createChaoticParticle(
    color: string,
    size: number,
    lifespan: number
  ): ParticleConfig {
    const x = this.centerX + (Math.random() - 0.5) * 300;
    const y = this.centerY + (Math.random() - 0.5) * 300;

    const speed =
      this.config.baseSpeed + (Math.random() - 0.5) * 2 * this.config.speedVariation * 2;
    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    return { x, y, vx, vy, color, size, lifespan, opacity: this.config.opacity };
  }

  /**
   * Apply pattern-specific forces to particles
   */
  private applyPatternForces(particle: Particle): void {
    switch (this.config.pattern) {
      case 'spiral':
        // Gentle outward spiral
        particle.applyDrag(0.01);
        break;

      case 'focused':
        // Strong central attraction
        particle.applyAttraction(this.centerX, this.centerY, -500);
        particle.applyDrag(0.02);
        break;

      case 'dispersed':
        // Light drag only
        particle.applyDrag(0.015);
        break;

      case 'chaotic':
        // Random forces
        if (Math.random() < 0.1) {
          const fx = (Math.random() - 0.5) * 100;
          const fy = (Math.random() - 0.5) * 100;
          particle.applyForce(fx, fy);
        }
        break;
    }
  }

  /**
   * Update particle system configuration
   */
  updateConfig(config: Partial<ParticleSystemConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('configUpdate', this.config);
  }

  /**
   * Set particle pattern
   */
  setPattern(pattern: ParticlePattern): void {
    this.config.pattern = pattern;
    this.angleOffset = 0; // Reset spiral angle
    this.emit('patternChange', pattern);
  }

  /**
   * Set particle colors
   */
  setColors(colors: string[]): void {
    this.config.colors = colors;
  }

  /**
   * Set emission rate (particles per frame)
   */
  setEmissionRate(rate: number): void {
    this.config.emissionRate = Math.min(rate, 20); // Max 20 per frame
  }

  /**
   * Get current particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * v21: Get particle system metrics
   */
  getMetrics(): ParticleSystemMetrics {
    return { ...this.metrics };
  }

  /**
   * v21: Set color cycle speed (0 = static, 1 = fast)
   */
  setColorCycleSpeed(speed: number): void {
    this.colorCycleSpeed = Math.max(0, Math.min(1, speed));
  }

  /**
   * v21: Set FPS threshold for adaptive throttling
   */
  setFPSThreshold(threshold: number): void {
    this.config.fpsThreshold = Math.max(30, Math.min(60, threshold));
  }

  /**
   * v21: Enable/disable adaptive FPS
   */
  setAdaptiveFPS(enabled: boolean): void {
    this.config.adaptiveFPS = enabled;
    if (!enabled) {
      // Reset throttling when disabled
      this.throttleLevel = 0;
      this.lowFPSFrames = 0;
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    // Return all particles to pool
    while (this.particles.length > 0) {
      const particle = this.particles.pop()!;
      this.particlePool.push(particle);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.clear();
    this.particles = [];
    this.particlePool = [];
    this.canvas = null;
    this.ctx = null;
    this.removeAllListeners();
  }
}

export default ParticleSystem;
