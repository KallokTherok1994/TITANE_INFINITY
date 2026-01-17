/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — MOTION FRAME ENGINE
 * Contrôle précis des animations et mouvements
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface MotionState {
  activeAnimations: number;
  completedAnimations: number;
  fluidityScore: number;
  avgDuration: number;
  currentEasing: string;
}

interface ActiveAnimation {
  id: string;
  startTime: number;
  duration: number;
  easing: string;
  progress: number;
  element?: HTMLElement;
}

// Courbes d'easing standard TITANE∞
export const TITANE_EASINGS = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const;

// Durées standard TITANE∞
export const TITANE_DURATIONS = {
  instant: 100,
  fast: 150,
  normal: 200,
  emphasized: 300,
  complex: 400,
  dramatic: 500,
} as const;

export class MotionFrameEngine {
  private animations: Map<string, ActiveAnimation> = new Map();
  private completedCount = 0;
  private defaultEasing: string = TITANE_EASINGS.standard;
  private defaultDuration: number = TITANE_DURATIONS.normal;
  private rafId: number | null = null;
  private isRunning = false;

  constructor() {
    this.injectMotionStyles();
  }

  /**
   * Injecte les styles CSS pour les animations
   */
  private injectMotionStyles(): void {
    const styleId = 'titane-motion-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* TITANE∞ Motion Frame Engine */
      :root {
        --titane-easing-standard: ${TITANE_EASINGS.standard};
        --titane-easing-decelerate: ${TITANE_EASINGS.decelerate};
        --titane-easing-accelerate: ${TITANE_EASINGS.accelerate};
        --titane-easing-sharp: ${TITANE_EASINGS.sharp};
        --titane-easing-smooth: ${TITANE_EASINGS.smooth};

        --titane-duration-instant: ${TITANE_DURATIONS.instant}ms;
        --titane-duration-fast: ${TITANE_DURATIONS.fast}ms;
        --titane-duration-normal: ${TITANE_DURATIONS.normal}ms;
        --titane-duration-emphasized: ${TITANE_DURATIONS.emphasized}ms;
        --titane-duration-complex: ${TITANE_DURATIONS.complex}ms;
      }

      .titane-motion {
        transition-timing-function: var(--titane-easing-standard);
        transition-duration: var(--titane-duration-normal);
      }

      .titane-motion-enter {
        animation: titane-fade-in var(--titane-duration-normal) var(--titane-easing-decelerate);
      }

      .titane-motion-exit {
        animation: titane-fade-out var(--titane-duration-fast) var(--titane-easing-accelerate);
      }

      @keyframes titane-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes titane-fade-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-8px); }
      }

      @keyframes titane-scale-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes titane-slide-in-right {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Démarre le moteur
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  /**
   * Arrête le moteur
   */
  stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Boucle principale
   */
  private tick(): void {
    if (!this.isRunning) return;

    const now = performance.now();

    // Mettre à jour les animations actives
    for (const [id, anim] of this.animations.entries()) {
      const elapsed = now - anim.startTime;
      anim.progress = Math.min(1, elapsed / anim.duration);

      if (anim.progress >= 1) {
        this.animations.delete(id);
        this.completedCount++;
      }
    }

    this.rafId = requestAnimationFrame(() => this.tick());
  }

  /**
   * Crée une animation
   */
  animate(
    element: HTMLElement,
    keyframes: Keyframe[],
    options: {
      duration?: number;
      easing?: keyof typeof TITANE_EASINGS;
      delay?: number;
      fill?: FillMode;
    } = {}
  ): string {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.duration ?? this.defaultDuration;
    const easingKey = options.easing ?? 'standard';
    const easing = TITANE_EASINGS[easingKey] ?? TITANE_EASINGS.standard;

    // Créer l'animation Web Animations API
    const animation = element.animate(keyframes, {
      duration,
      easing,
      delay: options.delay ?? 0,
      fill: options.fill ?? 'forwards',
    });

    // Enregistrer l'animation
    this.animations.set(id, {
      id,
      startTime: performance.now() + (options.delay ?? 0),
      duration,
      easing,
      progress: 0,
      element: element,
    });

    // Nettoyer à la fin
    animation.onfinish = () => {
      this.animations.delete(id);
      this.completedCount++;
    };

    return id;
  }

  /**
   * Animation de fade in
   */
  fadeIn(element: HTMLElement, duration?: number): string {
    return this.animate(
      element,
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration, easing: 'decelerate' }
    );
  }

  /**
   * Animation de fade out
   */
  fadeOut(element: HTMLElement, duration?: number): string {
    return this.animate(
      element,
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-8px)' },
      ],
      { duration: duration ?? TITANE_DURATIONS.fast, easing: 'accelerate' }
    );
  }

  /**
   * Animation de scale
   */
  scaleIn(element: HTMLElement, duration?: number): string {
    return this.animate(
      element,
      [
        { opacity: 0, transform: 'scale(0.95)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration, easing: 'decelerate' }
    );
  }

  /**
   * Animation de slide
   */
  slideIn(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down',
    duration?: number
  ): string {
    const transforms: Record<string, { from: string; to: string }> = {
      left: { from: 'translateX(-20px)', to: 'translateX(0)' },
      right: { from: 'translateX(20px)', to: 'translateX(0)' },
      up: { from: 'translateY(-20px)', to: 'translateY(0)' },
      down: { from: 'translateY(20px)', to: 'translateY(0)' },
    };

    const transform = transforms[direction];
    if (!transform) {
      throw new Error(`Invalid direction: ${direction}`);
    }
    const { from, to } = transform;
    return this.animate(
      element,
      [
        { opacity: 0, transform: from },
        { opacity: 1, transform: to },
      ],
      { duration, easing: 'decelerate' }
    );
  }

  /**
   * Annule une animation
   */
  cancel(animationId: string): void {
    const anim = this.animations.get(animationId);
    if (anim) {
      const element = anim.element;
      if (element) {
        element.getAnimations().forEach((a: Animation) => a.cancel());
      }
      this.animations.delete(animationId);
    }
  }

  /**
   * Annule toutes les animations
   */
  cancelAll(): void {
    for (const [id] of this.animations) {
      this.cancel(id);
    }
  }

  /**
   * Calcule le score de fluidité
   */
  getFluidityScore(): number {
    // Score basé sur le ratio d'animations complétées vs actives
    const total = this.completedCount + this.animations.size;
    if (total === 0) return 1.0;

    // Pénaliser s'il y a trop d'animations simultanées
    const simultaneousPenalty = Math.max(0, this.animations.size - 5) * 0.05;

    return Math.max(0, 1 - simultaneousPenalty);
  }

  /**
   * Récupère l'état du moteur
   */
  getState(): MotionState {
    const durations: number[] = [];
    for (const anim of this.animations.values()) {
      durations.push(anim.duration);
    }

    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : this.defaultDuration;

    return {
      activeAnimations: this.animations.size,
      completedAnimations: this.completedCount,
      fluidityScore: this.getFluidityScore(),
      avgDuration,
      currentEasing: this.defaultEasing,
    };
  }

  /**
   * Configure l'easing par défaut
   */
  setDefaultEasing(easing: keyof typeof TITANE_EASINGS): void {
    this.defaultEasing = TITANE_EASINGS[easing];
  }

  /**
   * Configure la durée par défaut
   */
  setDefaultDuration(duration: keyof typeof TITANE_DURATIONS): void {
    this.defaultDuration = TITANE_DURATIONS[duration];
  }
}

export default MotionFrameEngine;
