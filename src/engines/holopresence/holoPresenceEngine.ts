/**
 * TITANE_INFINITY v∞.37 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ HOLOPRESENCE ENGINE v∞.XVIII (Ω)
 *   Présence Holographique · Avatar Visuel · Canvas 2D/3D · Réactivité
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * HoloPresence Engine visualise l'identité de TITANE∞ sous forme d'avatar
 * holographique réactif. Il traduit les états cognitifs, émotifs et expressifs
 * en forme visuelle animée en temps réel.
 */

import { expressionEngine, type UnifiedExpression } from '../expression/expressionEngine';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Forme holographique
 */
export type HoloShape =
  | 'sphere' // Sphère (empathie, écoute)
  | 'torus' // Tore (flux, cycle)
  | 'helix' // Hélice (évolution, dynamique)
  | 'crystal' // Crystal (clarté, précision)
  | 'nebula' // Nébuleuse (créativité, vision)
  | 'mandala' // Mandala (profondeur, complexité)
  | 'wave'; // Onde (fluidité, adaptation)

/**
 * Configuration visuelle holographique
 */
export interface HoloVisuals {
  shape: HoloShape;
  size: number; // 0-1 - Relative size
  rotation: {
    x: number; // Degrees/s
    y: number;
    z: number;
  };
  colors: {
    primary: string; // Hex color
    secondary: string;
    accent: string;
    glow: string;
  };
  opacity: number; // 0-1
  blur: number; // 0-1 - Gaussian blur
  glow: number; // 0-1 - Glow intensity
}

/**
 * Particules d'aura
 */
export interface AuraParticles {
  count: number; // Number of particles
  size: number; // 0-1 - Particle size
  speed: number; // 0-1 - Movement speed
  spread: number; // 0-1 - Distribution radius
  lifetime: number; // Seconds
  color: string; // Hex color
  behavior: 'orbit' | 'flow' | 'pulse' | 'scatter';
}

/**
 * Animation holographique
 */
export interface HoloAnimation {
  breathe: {
    enabled: boolean;
    rate: number; // Breaths per minute
    depth: number; // 0-1 - Intensity
  };
  pulse: {
    enabled: boolean;
    rate: number; // Pulses per minute
    intensity: number; // 0-1
  };
  flow: {
    enabled: boolean;
    direction: number; // Degrees
    speed: number; // 0-1
  };
  react: {
    sensitivity: number; // 0-1 - Reactivity to events
    decay: number; // Seconds to return to baseline
  };
}

/**
 * État de présence holographique
 */
export interface HoloPresenceState {
  visuals: HoloVisuals;
  particles: AuraParticles;
  animation: HoloAnimation;

  // Reactive state
  currentIntensity: number; // 0-1 - Current visual intensity
  focusPoint: { x: number; y: number };
  energyLevel: number; // 0-1 - Energy visualization

  // Source data
  identityExpression: UnifiedExpression | null;

  // Meta
  isVisible: boolean;
  lastUpdate: number;
}

/**
 * Événement holographique
 */
export interface HoloEvent {
  type: 'pulse' | 'flash' | 'ripple' | 'burst' | 'shimmer';
  intensity: number; // 0-1
  duration: number; // Milliseconds
  color?: string; // Optional color override
}

// ═══════════════════════════════════════════════════════════════════════════
// HOLOPRESENCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class HoloPresenceEngine {
  private state: HoloPresenceState;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((state: HoloPresenceState) => void)[] = [];
  private eventQueue: HoloEvent[] = [];

  // Configuration
  private readonly UPDATE_RATE = 30; // 30 Hz (33ms) - Smooth visual updates
  private readonly PARTICLE_UPDATE_RATE = 15; // 15 Hz for particles
  private particleCounter = 0;

  constructor() {
    this.state = this.getDefaultState();
    logger.debug('🌀 [HOLOPRESENCE] Initializing HoloPresence Engine...');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.updateInterval) return;

    logger.debug('🌀 [HOLOPRESENCE] Starting holopresence at 30Hz...');

    // Subscribe to Expression Engine
    this.subscribeToExpressionEngine();

    // Start update loop
    this.updateInterval = setInterval(() => this.tick(), 1000 / this.UPDATE_RATE);

    this.state.isVisible = true;
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.state.isVisible = false;
      logger.debug('🌀 [HOLOPRESENCE] HoloPresence stopped.');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  private subscribeToExpressionEngine(): void {
    expressionEngine.subscribe(expressionState => {
      this.state.identityExpression = expressionState.currentExpression;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ───────────────────────────────────────────────────────────────────────────

  private tick(): void {
    if (!this.state.identityExpression) return;

    // 1. Map expression to visuals
    this.mapExpressionToVisuals();

    // 2. Update animations
    this.updateAnimations();

    // 3. Update particles (less frequent)
    this.particleCounter++;
    if (this.particleCounter >= 2) {
      // Every 2 ticks = 15Hz
      this.updateParticles();
      this.particleCounter = 0;
    }

    // 4. Process event queue
    this.processEvents();

    // 5. Notify subscribers
    this.state.lastUpdate = Date.now();
    this.notifySubscribers();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EXPRESSION → VISUALS MAPPING
  // ───────────────────────────────────────────────────────────────────────────

  private mapExpressionToVisuals(): void {
    if (!this.state.identityExpression) return;

    const { voice, halo, narrative } = this.state.identityExpression;

    // Map shape based on narrative style
    this.state.visuals.shape = this.mapToShape(narrative.style.primary);

    // Map size based on energy and focus
    this.state.visuals.size = this.mapToSize(
      halo.dynamics.intensity,
      halo.spatial.radius
    );

    // Map rotation based on cognitive speed and flow
    this.state.visuals.rotation = {
      x: this.mapToRotation(voice.prosody.rate, 0.5),
      y: this.mapToRotation(halo.dynamics.flowSpeed, 1.0),
      z: this.mapToRotation(voice.microDynamics.rhythmicFlow, 0.3),
    };

    // Map colors directly from halo
    this.state.visuals.colors = {
      primary: halo.colors.primary,
      secondary: halo.colors.secondary,
      accent: halo.colors.accent,
      glow: this.adjustColorBrightness(halo.colors.primary, 1.3),
    };

    // Map opacity based on clarity
    this.state.visuals.opacity = this.mapToOpacity(
      voice.timbre.clarity,
      halo.spatial.diffusion
    );

    // Map blur based on diffusion
    this.state.visuals.blur = halo.spatial.diffusion;

    // Map glow based on intensity
    this.state.visuals.glow = halo.dynamics.intensity;

    // Update current intensity
    this.state.currentIntensity = halo.dynamics.intensity;

    // Update energy level
    this.state.energyLevel = (voice.prosody.volume + halo.dynamics.intensity) / 2;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MAPPING HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  private mapToShape(narrativeStyle: string): HoloShape {
    const shapeMap: Record<string, HoloShape> = {
      fluid: 'wave',
      architectural: 'crystal',
      empathic: 'sphere',
      visionary: 'nebula',
      technical: 'crystal',
    };
    return shapeMap[narrativeStyle] || 'sphere';
  }

  private mapToSize(intensity: number, radius: number): number {
    return (intensity + radius) / 2;
  }

  private mapToRotation(factor: number, multiplier: number): number {
    // Convert 0-1 to degrees/s (0-360)
    return factor * 360 * multiplier;
  }

  private adjustColorBrightness(hex: string, factor: number): string {
    // Simple brightness adjustment
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  private mapToOpacity(clarity: number, diffusion: number): number {
    // High clarity + low diffusion = high opacity
    return clarity * 0.7 + (1 - diffusion) * 0.3;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ANIMATIONS
  // ───────────────────────────────────────────────────────────────────────────

  private updateAnimations(): void {
    if (!this.state.identityExpression) return;

    const { voice, halo } = this.state.identityExpression;

    // Breathe animation synced with voice breathiness
    this.state.animation.breathe.enabled = voice.timbre.breathiness > 0.3;
    this.state.animation.breathe.rate = 12 + voice.prosody.rate * 6; // 12-18 BPM
    this.state.animation.breathe.depth = voice.timbre.breathiness;

    // Pulse animation synced with halo pulsation
    this.state.animation.pulse.enabled = halo.dynamics.pulsation > 0.4;
    this.state.animation.pulse.rate = 60 + halo.dynamics.pulsation * 60; // 60-120 BPM
    this.state.animation.pulse.intensity = halo.dynamics.pulsation;

    // Flow animation synced with halo flow speed
    this.state.animation.flow.enabled = halo.dynamics.flowSpeed > 0.3;
    this.state.animation.flow.speed = halo.dynamics.flowSpeed;
    // Direction follows rotation
    this.state.animation.flow.direction = this.state.visuals.rotation.y;

    // React animation sensitivity
    this.state.animation.react.sensitivity = halo.dynamics.reactivity;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PARTICLES
  // ───────────────────────────────────────────────────────────────────────────

  private updateParticles(): void {
    if (!this.state.identityExpression) return;

    const { halo } = this.state.identityExpression;

    // Particle count based on intensity and layering
    this.state.particles.count = Math.floor(
      50 + halo.dynamics.intensity * 100 + halo.spatial.layering * 50
    ); // 50-200 particles

    // Particle size based on energy
    this.state.particles.size = 0.3 + this.state.energyLevel * 0.4; // 0.3-0.7

    // Speed based on flow
    this.state.particles.speed = halo.dynamics.flowSpeed;

    // Spread based on radius
    this.state.particles.spread = halo.spatial.radius;

    // Lifetime based on stability (inverse of reactivity)
    this.state.particles.lifetime = 2 + (1 - halo.dynamics.reactivity) * 3; // 2-5s

    // Color follows halo accent
    this.state.particles.color = halo.colors.accent;

    // Behavior based on shape
    this.state.particles.behavior = this.mapParticleBehavior(this.state.visuals.shape);
  }

  private mapParticleBehavior(shape: HoloShape): 'orbit' | 'flow' | 'pulse' | 'scatter' {
    const behaviorMap: Record<HoloShape, 'orbit' | 'flow' | 'pulse' | 'scatter'> = {
      sphere: 'orbit',
      torus: 'flow',
      helix: 'flow',
      crystal: 'pulse',
      nebula: 'scatter',
      mandala: 'orbit',
      wave: 'flow',
    };
    return behaviorMap[shape];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT PROCESSING
  // ───────────────────────────────────────────────────────────────────────────

  private processEvents(): void {
    // Process and remove expired events (placeholder implementation)
    this.eventQueue = this.eventQueue.filter(() => true);
  }

  /**
   * Trigger a holographic event
   */
  triggerEvent(event: HoloEvent): void {
    this.eventQueue.push(event);
    logger.debug(`🌀 [HOLOPRESENCE] Event triggered: ${event.type} (${event.intensity})`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ───────────────────────────────────────────────────────────────────────────

  getState(): HoloPresenceState {
    return { ...this.state };
  }

  getVisuals(): HoloVisuals {
    return { ...this.state.visuals };
  }

  getParticles(): AuraParticles {
    return { ...this.state.particles };
  }

  getAnimation(): HoloAnimation {
    return { ...this.state.animation };
  }

  /**
   * Override visuals (for manual control)
   */
  setShape(shape: HoloShape): void {
    this.state.visuals.shape = shape;
  }

  setColors(colors: Partial<HoloVisuals['colors']>): void {
    this.state.visuals.colors = {
      ...this.state.visuals.colors,
      ...colors,
    };
  }

  /**
   * Trigger preset events
   */
  flash(intensity: number = 1.0): void {
    this.triggerEvent({ type: 'flash', intensity, duration: 200 });
  }

  pulse(intensity: number = 0.8, duration: number = 500): void {
    this.triggerEvent({ type: 'pulse', intensity, duration });
  }

  burst(intensity: number = 1.0, color?: string): void {
    this.triggerEvent({ type: 'burst', intensity, duration: 1000, color });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DEFAULT STATE
  // ───────────────────────────────────────────────────────────────────────────

  private getDefaultState(): HoloPresenceState {
    return {
      visuals: {
        shape: 'sphere',
        size: 0.7,
        rotation: {
          x: 5,
          y: 10,
          z: 2,
        },
        colors: {
          primary: '#9b59b6',
          secondary: '#bb8fce',
          accent: '#d7bde2',
          glow: '#c39bd3',
        },
        opacity: 0.85,
        blur: 0.3,
        glow: 0.6,
      },
      particles: {
        count: 100,
        size: 0.5,
        speed: 0.5,
        spread: 0.7,
        lifetime: 3,
        color: '#d7bde2',
        behavior: 'orbit',
      },
      animation: {
        breathe: {
          enabled: true,
          rate: 14,
          depth: 0.3,
        },
        pulse: {
          enabled: false,
          rate: 60,
          intensity: 0.5,
        },
        flow: {
          enabled: true,
          direction: 0,
          speed: 0.5,
        },
        react: {
          sensitivity: 0.7,
          decay: 2,
        },
      },
      currentIntensity: 0.6,
      focusPoint: { x: 0, y: 0 },
      energyLevel: 0.6,
      identityExpression: null,
      isVisible: false,
      lastUpdate: Date.now(),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  subscribe(callback: (state: HoloPresenceState) => void): () => void {
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

export const holoPresenceEngine = new HoloPresenceEngine();
