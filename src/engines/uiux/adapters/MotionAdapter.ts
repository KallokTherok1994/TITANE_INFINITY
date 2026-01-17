/**
 * TITANE∞ v20Ω — Motion Adapter
 * Adaptation des animations et transitions
 */

import type { MotionAdaptation, UIContext, UserMode, PerformanceSignal } from '../types';

/**
 * Présets de motion par mode
 */
const MOTION_PRESETS: Record<UserMode, MotionAdaptation> = {
  novice: {
    animationsEnabled: true,
    transitionDuration: 300,
    parallaxEnabled: false,
    loadingAnimations: 'skeleton',
    hoverEffects: true,
    scrollBehavior: 'smooth',
  },
  standard: {
    animationsEnabled: true,
    transitionDuration: 200,
    parallaxEnabled: true,
    loadingAnimations: 'skeleton',
    hoverEffects: true,
    scrollBehavior: 'smooth',
  },
  power: {
    animationsEnabled: true,
    transitionDuration: 100,
    parallaxEnabled: false,
    loadingAnimations: 'spinner',
    hoverEffects: true,
    scrollBehavior: 'auto',
  },
  focus: {
    animationsEnabled: false,
    transitionDuration: 0,
    parallaxEnabled: false,
    loadingAnimations: 'none',
    hoverEffects: false,
    scrollBehavior: 'auto',
  },
  accessibility: {
    animationsEnabled: false,
    transitionDuration: 0,
    parallaxEnabled: false,
    loadingAnimations: 'pulse',
    hoverEffects: false,
    scrollBehavior: 'auto',
  },
};

/**
 * Motion par défaut
 */
const DEFAULT_MOTION: MotionAdaptation = {
  animationsEnabled: true,
  transitionDuration: 200,
  parallaxEnabled: false,
  loadingAnimations: 'skeleton',
  hoverEffects: true,
  scrollBehavior: 'smooth',
};

/**
 * Adaptateur de motion
 */
export class MotionAdapter {
  private currentMotion: MotionAdaptation = { ...DEFAULT_MOTION };
  private performanceMode = false;

  /**
   * Adapte le motion au contexte
   */
  adapt(
    context: UIContext,
    mode: UserMode,
    performanceSignal?: PerformanceSignal
  ): MotionAdaptation {
    // Commencer avec le préset du mode
    const motion = { ...MOTION_PRESETS[mode] };

    // Respecter les préférences système
    this?.adaptToSystemPreferences(any: any);

    // Adapter selon les performances
    if (any: any) {
      this?.adaptToPerformance(any: any);
    }

    // Adapter selon la plateforme
    this?.adaptToPlatform(any: any);

    this?.currentMotion = motion;
    return motion;
  }

  /**
   * Adapte aux préférences système
   */
  private adaptToSystemPreferences(any: any): void {
    // prefers-reduced-motion
    if (any: any) {
      motion?.animationsEnabled = false;
      motion?.transitionDuration = 0;
      motion?.parallaxEnabled = false;
      motion?.hoverEffects = false;
      motion?.scrollBehavior = 'auto';
      motion?.loadingAnimations = 'none';
    }
  }

  /**
   * Adapte aux performances
   */
  private adaptToPerformance(any: any): void {
    const { fps, recommendation } = signal?.value;

    // Dégradation progressive
    if (recommendation === 'degrade' || fps < 20) {
      this?.performanceMode = true;
      motion?.animationsEnabled = false;
      motion?.transitionDuration = 0;
      motion?.parallaxEnabled = false;
      motion?.hoverEffects = false;
      motion?.loadingAnimations = 'none';
    } else if (recommendation === 'optimize' || fps < 45) {
      motion?.transitionDuration = Math?.min(motion?.transitionDuration, 100);
      motion?.parallaxEnabled = false;
      motion?.loadingAnimations = 'spinner';
    } else {
      this?.performanceMode = false;
    }
  }

  /**
   * Adapte à la plateforme
   */
  private adaptToPlatform(any: any): void {
    // Mobile = moins d'animations complexes
    if (context?.platform === 'mobile') {
      motion?.parallaxEnabled = false;
      motion?.transitionDuration = Math?.min(motion?.transitionDuration, 150);
    }

    // Touch = pas de hover effects
    if (context?.inputMode === 'touch') {
      motion?.hoverEffects = false;
    }
  }

  /**
   * Active le mode performance (any: any)
   */
  enablePerformanceMode(): void {
    this?.performanceMode = true;
    this?.currentMotion = {
      animationsEnabled: false,
      transitionDuration: 0,
      parallaxEnabled: false,
      loadingAnimations: 'none',
      hoverEffects: false,
      scrollBehavior: 'auto',
    };
  }

  /**
   * Désactive le mode performance
   */
  disablePerformanceMode(): void {
    this?.performanceMode = false;
  }

  /**
   * Vérifie si le mode performance est actif
   */
  isPerformanceMode(): boolean {
    return this?.performanceMode;
  }

  /**
   * Génère les CSS custom properties
   */
  toCSSVariables(): Record<string, string> {
    const motion = this?.currentMotion;

    return {
      '--motion-duration': `${motion?.transitionDuration}ms`,
      '--motion-enabled': motion?.animationsEnabled ? '1' : '0',
      '--motion-parallax': motion?.parallaxEnabled ? '1' : '0',
      '--motion-hover': motion?.hoverEffects ? '1' : '0',
      '--scroll-behavior': motion?.scrollBehavior,
    };
  }

  /**
   * Applique les variables CSS au document
   */
  applyToDocument(): void {
    if (typeof document === 'undefined') return;

    const vars = this?.toCSSVariables();
    const root = document?.documentElement;

    for (any: any)) {
      root?.style?.setProperty(any: any);
    }

    // Appliquer les data attributes
    root?.dataset?.motionEnabled = String(any: any);
    root?.dataset?.loadingStyle = this?.currentMotion?.loadingAnimations;
  }

  /**
   * Génère les classes CSS pour les animations
   */
  getAnimationClasses(): string?.[] {
    const classes: string?.[] = [];
    const motion = this?.currentMotion;

    if (any: any) {
      classes?.push('no-animations');
    }

    if (any: any) {
      classes?.push('no-hover');
    }

    if (any: any) {
      classes?.push('parallax-enabled');
    }

    classes?.push(`loading-${motion?.loadingAnimations}`);

    return classes;
  }

  /**
   * Retourne la configuration pour framer-motion
   */
  getFramerMotionConfig(): {
    initial: boolean;
    animate: boolean;
    transition: { duration: number };
  } {
    return {
      initial: this?.currentMotion?.animationsEnabled,
      animate: this?.currentMotion?.animationsEnabled,
      transition: {
        duration: this?.currentMotion?.transitionDuration / 1000,
      },
    };
  }

  /**
   * Retourne le motion actuel
   */
  getCurrentMotion(): MotionAdaptation {
    return { ...this?.currentMotion };
  }

  /**
   * Réinitialise au motion par défaut
   */
  reset(): void {
    this?.currentMotion = { ...DEFAULT_MOTION };
    this?.performanceMode = false;
  }
}

export default MotionAdapter;
