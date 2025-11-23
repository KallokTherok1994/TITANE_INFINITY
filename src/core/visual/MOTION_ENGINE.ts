/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v21 — Motion Engine
// Moteur de mouvements organiques intelligents

import { DS_CONSTANTS } from './DS_CONSTANTS';
import { SystemState, stateEngine } from './STATE_ENGINE';

// 🎭 Types de mouvements
export type MotionType =
  | 'pulse' // Pulsation radiale
  | 'sway' // Balancement latéral
  | 'flow' // Flux horizontal
  | 'scan' // Scanline verticale
  | 'breathe' // Respiration (scale)
  | 'shimmer' // Scintillement
  | 'vibrate' // Micro-vibration
  | 'static'; // Aucun mouvement

// 🎨 Configuration d'un mouvement
export interface MotionConfig {
  type: MotionType;
  duration: number; // ms
  amplitude: number; // px ou scale factor
  easing: string;
  delay?: number; // ms
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

// 🧬 Configuration par module cognitif
export interface ModuleMotionConfig {
  module: string;
  baseMotion: MotionConfig;
  intensityMotion: MotionConfig; // Utilisé quand valeur > seuil
  threshold: number; // 0-100, seuil d'activation de intensityMotion
}

// 🌊 Motion Engine principal
export class MotionEngine {
  private moduleMotions: Map<string, ModuleMotionConfig> = new Map();
  private activeMotions: Map<string, MotionConfig> = new Map();

  constructor() {
    this.initializeModuleMotions();
  }

  /**
   * Initialiser les mouvements des modules cognitifs
   */
  private initializeModuleMotions(): void {
    // 🔥 HELIOS - Pulse organique
    this.moduleMotions.set('helios', {
      module: 'helios',
      threshold: 60,
      baseMotion: {
        type: 'pulse',
        duration: DS_CONSTANTS.animationSpeed.slow,
        amplitude: 0.02, // scale 1.0 → 1.02
        easing: 'ease-in-out',
        iterations: 'infinite',
        direction: 'alternate',
      },
      intensityMotion: {
        type: 'pulse',
        duration: DS_CONSTANTS.animationSpeed.fast,
        amplitude: 0.04,
        easing: 'ease-in-out',
        iterations: 'infinite',
        direction: 'alternate',
      },
    });

    // 🔗 NEXUS - Flow lines
    this.moduleMotions.set('nexus', {
      module: 'nexus',
      threshold: 50,
      baseMotion: {
        type: 'flow',
        duration: DS_CONSTANTS.animationSpeed.medium,
        amplitude: 100, // translateX 100%
        easing: 'linear',
        iterations: 'infinite',
        direction: 'normal',
      },
      intensityMotion: {
        type: 'flow',
        duration: DS_CONSTANTS.animationSpeed.fast,
        amplitude: 100,
        easing: 'linear',
        iterations: 'infinite',
        direction: 'normal',
      },
    });

    // ⚖️ HARMONIA - Sway balance
    this.moduleMotions.set('harmonia', {
      module: 'harmonia',
      threshold: 70,
      baseMotion: {
        type: 'sway',
        duration: DS_CONSTANTS.animationSpeed.verySlow,
        amplitude: DS_CONSTANTS.amplitude.subtle, // 2px
        easing: 'ease-in-out',
        iterations: 'infinite',
        direction: 'alternate',
      },
      intensityMotion: {
        type: 'sway',
        duration: DS_CONSTANTS.animationSpeed.slow,
        amplitude: DS_CONSTANTS.amplitude.base, // 4px
        easing: 'ease-in-out',
        iterations: 'infinite',
        direction: 'alternate',
      },
    });

    // 🧠 MEMORY - Scanline
    this.moduleMotions.set('memory', {
      module: 'memory',
      threshold: 50,
      baseMotion: {
        type: 'scan',
        duration: DS_CONSTANTS.animationSpeed.verySlow,
        amplitude: 100, // translateY 0 → 100%
        easing: 'ease-in-out',
        iterations: 'infinite',
        direction: 'normal',
      },
      intensityMotion: {
        type: 'scan',
        duration: DS_CONSTANTS.animationSpeed.slow,
        amplitude: 100,
        easing: 'ease-in-out',
        iterations: 'infinite',
        direction: 'normal',
      },
    });
  }

  /**
   * Obtenir la configuration de mouvement pour un module selon sa valeur
   */
  getModuleMotion(moduleName: string, value: number): MotionConfig | null {
    const config = this.moduleMotions.get(moduleName);
    if (!config) return null;

    const motion = value >= config.threshold ? config.intensityMotion : config.baseMotion;
    this.activeMotions.set(moduleName, motion);
    return motion;
  }

  /**
   * Générer CSS pour un mouvement
   */
  generateMotionCSS(config: MotionConfig): Record<string, string> {
    const keyframeName = `motion-${config.type}`;

    return {
      animationName: keyframeName,
      animationDuration: `${config.duration}ms`,
      animationTimingFunction: config.easing,
      animationDelay: config.delay ? `${config.delay}ms` : '0ms',
      animationIterationCount: config.iterations === 'infinite' ? 'infinite' : config.iterations?.toString() || '1',
      animationDirection: config.direction || 'normal',
      '--motion-amplitude': `${config.amplitude}${config.type === 'pulse' || config.type === 'breathe' ? '' : 'px'}`,
    };
  }

  /**
   * Générer les keyframes CSS pour un type de mouvement
   */
  generateKeyframes(type: MotionType): string {
    switch (type) {
      case 'pulse':
        return `
          @keyframes motion-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(calc(1 + var(--motion-amplitude, 0.02))); opacity: 0.85; }
          }
        `;

      case 'sway':
        return `
          @keyframes motion-sway {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(var(--motion-amplitude, 2px)); }
          }
        `;

      case 'flow':
        return `
          @keyframes motion-flow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `;

      case 'scan':
        return `
          @keyframes motion-scan {
            0% { transform: translateY(-100%); }
            50% { transform: translateY(50%); }
            100% { transform: translateY(100%); }
          }
        `;

      case 'breathe':
        return `
          @keyframes motion-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(calc(1 + var(--motion-amplitude, 0.02))); }
          }
        `;

      case 'shimmer':
        return `
          @keyframes motion-shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `;

      case 'vibrate':
        return `
          @keyframes motion-vibrate {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(var(--motion-amplitude, 2px), var(--motion-amplitude, 2px)); }
            50% { transform: translate(calc(-1 * var(--motion-amplitude, 2px)), 0); }
            75% { transform: translate(0, calc(-1 * var(--motion-amplitude, 2px))); }
          }
        `;

      case 'static':
      default:
        return '';
    }
  }

  /**
   * Générer un mouvement selon l'état système
   */
  generateStateMotion(state: SystemState): MotionConfig {
    const stateConfig = stateEngine.getStateConfig(state);

    // Mapping état → mouvement
    const motionType: MotionType = state === 'danger' || state === 'warning' ? 'vibrate' : 'breathe';

    return {
      type: motionType,
      duration: stateConfig.animationSpeed,
      amplitude: stateConfig.vibration,
      easing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
    };
  }

  /**
   * Créer un mouvement data-driven (amplitude variable selon valeur)
   */
  createDataDrivenMotion(type: MotionType, value: number, minAmplitude: number, maxAmplitude: number): MotionConfig {
    const normalized = Math.max(0, Math.min(100, value)) / 100;
    const amplitude = minAmplitude + normalized * (maxAmplitude - minAmplitude);

    return {
      type,
      duration: DS_CONSTANTS.animationSpeed.medium,
      amplitude,
      easing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
    };
  }

  /**
   * Ralentir tous les mouvements (mode fatigue)
   */
  slowDownMotions(factor: number = 1.5): void {
    this.activeMotions.forEach((motion) => {
      motion.duration = Math.round(motion.duration * factor);
    });
  }

  /**
   * Accélérer tous les mouvements (mode alerte)
   */
  speedUpMotions(factor: number = 0.7): void {
    this.activeMotions.forEach((motion) => {
      motion.duration = Math.round(motion.duration * factor);
    });
  }

  /**
   * Arrêter tous les mouvements
   */
  stopAllMotions(): void {
    this.activeMotions.clear();
  }

  /**
   * Obtenir un mouvement actif
   */
  getActiveMotion(identifier: string): MotionConfig | undefined {
    return this.activeMotions.get(identifier);
  }
}

// 🌟 Instance singleton
export const motionEngine = new MotionEngine();
