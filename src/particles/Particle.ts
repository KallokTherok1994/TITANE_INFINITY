/**
 * TITANE_INFINITY v19.3.0 — Particle Class
 * Individual particle with physics simulation
 *
 * Features:
 * - Position, velocity, acceleration
 * - Life cycle management (age, lifespan)
 * - Color and opacity
 * - Size variation
 * - Forces (gravity, wind, attraction)
 */

export interface ParticleConfig {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  size?: number;
  color?: string;
  opacity?: number;
  lifespan?: number;
  mass?: number;
}

export class Particle {
  // Position
  x: number;
  y: number;

  // Velocity
  vx: number;
  vy: number;

  // Acceleration
  ax: number;
  ay: number;

  // Visual properties
  size: number;
  color: string;
  opacity: number;
  initialOpacity: number;

  // Life cycle
  age: number;
  lifespan: number;
  isDead: boolean;

  // Physics
  mass: number;

  constructor(config: ParticleConfig) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx ?? 0;
    this.vy = config.vy ?? 0;
    this.ax = 0;
    this.ay = 0;

    this.size = config.size ?? 2;
    this.color = config.color ?? '#ffffff';
    this.opacity = config.opacity ?? 1;
    this.initialOpacity = this.opacity;

    this.age = 0;
    this.lifespan = config.lifespan ?? 3000; // 3 seconds default
    this.isDead = false;

    this.mass = config.mass ?? 1;
  }

  /**
   * Update particle state
   * @param deltaTime - Time elapsed since last update (ms)
   */
  update(deltaTime: number): void {
    if (this.isDead) {
      return;
    }

    // Convert deltaTime to seconds for physics calculations
    const dt = deltaTime / 1000;

    // Update velocity with acceleration
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

    // Update position with velocity
    this.x += this.vx * dt * 60; // Scale for 60fps reference
    this.y += this.vy * dt * 60;

    // Reset acceleration (forces must be reapplied each frame)
    this.ax = 0;
    this.ay = 0;

    // Update age
    this.age += deltaTime;

    // Fade out near end of life
    const lifeRatio = this.age / this.lifespan;
    if (lifeRatio > 0.7) {
      // Fade out in last 30% of life
      const fadeProgress = (lifeRatio - 0.7) / 0.3;
      this.opacity = this.initialOpacity * (1 - fadeProgress);
    }

    // Check if particle should die
    if (this.age >= this.lifespan) {
      this.isDead = true;
    }
  }

  /**
   * Apply a force to the particle
   */
  applyForce(fx: number, fy: number): void {
    this.ax += fx / this.mass;
    this.ay += fy / this.mass;
  }

  /**
   * Apply gravity force
   */
  applyGravity(strength: number): void {
    this.applyForce(0, strength * this.mass);
  }

  /**
   * Apply attraction to a point
   */
  applyAttraction(targetX: number, targetY: number, strength: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist < 1) return; // Avoid division by zero

    const force = strength / distSq;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    this.applyForce(fx, fy);
  }

  /**
   * Apply repulsion from a point
   */
  applyRepulsion(targetX: number, targetY: number, strength: number): void {
    this.applyAttraction(targetX, targetY, -strength);
  }

  /**
   * Apply drag/friction
   */
  applyDrag(coefficient: number): void {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed < 0.01) return;

    const dragMagnitude = coefficient * speed * speed;
    const fx = -(this.vx / speed) * dragMagnitude;
    const fy = -(this.vy / speed) * dragMagnitude;

    this.applyForce(fx, fy);
  }

  /**
   * Check if particle is inside bounds
   */
  isInBounds(width: number, height: number, margin = 50): boolean {
    return (
      this.x >= -margin &&
      this.x <= width + margin &&
      this.y >= -margin &&
      this.y <= height + margin
    );
  }

  /**
   * Bounce off boundaries
   */
  bounceOffBounds(width: number, height: number, damping = 0.8): void {
    if (this.x < 0 || this.x > width) {
      this.vx *= -damping;
      this.x = Math.max(0, Math.min(width, this.x));
    }
    if (this.y < 0 || this.y > height) {
      this.vy *= -damping;
      this.y = Math.max(0, Math.min(height, this.y));
    }
  }

  /**
   * Get current life ratio (0-1)
   */
  getLifeRatio(): number {
    return Math.min(this.age / this.lifespan, 1);
  }

  /**
   * Reset particle to initial state
   */
  reset(config: ParticleConfig): void {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx ?? 0;
    this.vy = config.vy ?? 0;
    this.ax = 0;
    this.ay = 0;

    this.size = config.size ?? this.size;
    this.color = config.color ?? this.color;
    this.opacity = config.opacity ?? 1;
    this.initialOpacity = this.opacity;

    this.age = 0;
    this.lifespan = config.lifespan ?? this.lifespan;
    this.isDead = false;
  }
}

export default Particle;
