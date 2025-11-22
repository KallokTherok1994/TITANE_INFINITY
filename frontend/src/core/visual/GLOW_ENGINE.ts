// ⚡ TITANE∞ v21 — Glow Engine
// Moteur de gestion des lumières intelligentes data-driven

import { DS_COLORS, rgba, ColorModule } from './DS_COLORS';
import { DS_CONSTANTS } from './DS_CONSTANTS';
import { SystemState, stateEngine } from './STATE_ENGINE';

// 🎨 Configuration d'un glow
export interface GlowConfig {
  color: string;
  colorRgb: string;
  intensity: number; // 0-1
  blur: number; // px
  innerGlow: boolean;
  outerGlow: boolean;
  pulseSpeed?: number; // ms, 0 = pas de pulse
}

// 🌟 Configuration par module cognitif
export interface ModuleGlowConfig extends GlowConfig {
  module: ColorModule;
  baseIntensity: number;
  maxIntensity: number;
}

// 🧬 Glow Engine principal
export class GlowEngine {
  private moduleConfigs: Map<string, ModuleGlowConfig> = new Map();
  private activeGlows: Map<string, GlowConfig> = new Map();

  constructor() {
    this.initializeModuleConfigs();
  }

  /**
   * Initialiser les configurations des modules cognitifs
   */
  private initializeModuleConfigs(): void {
    // 🔥 HELIOS - Énergie
    this.moduleConfigs.set('helios', {
      module: 'helios',
      color: DS_COLORS.helios.hex,
      colorRgb: DS_COLORS.helios.rgb,
      intensity: 0.25,
      baseIntensity: 0.15,
      maxIntensity: 0.60,
      blur: DS_CONSTANTS.blur.base,
      innerGlow: true,
      outerGlow: true,
      pulseSpeed: DS_CONSTANTS.timing.breath,
    });

    // 🔗 NEXUS - Connexions
    this.moduleConfigs.set('nexus', {
      module: 'nexus',
      color: DS_COLORS.nexus.hex,
      colorRgb: DS_COLORS.nexus.rgb,
      intensity: 0.25,
      baseIntensity: 0.15,
      maxIntensity: 0.50,
      blur: DS_CONSTANTS.blur.base,
      innerGlow: true,
      outerGlow: true,
      pulseSpeed: DS_CONSTANTS.animationSpeed.medium,
    });

    // ⚖️ HARMONIA - Équilibre
    this.moduleConfigs.set('harmonia', {
      module: 'harmonia',
      color: DS_COLORS.harmonia.hex,
      colorRgb: DS_COLORS.harmonia.rgb,
      intensity: 0.25,
      baseIntensity: 0.15,
      maxIntensity: 0.45,
      blur: DS_CONSTANTS.blur.base,
      innerGlow: true,
      outerGlow: true,
      pulseSpeed: DS_CONSTANTS.animationSpeed.slow,
    });

    // 🧠 MEMORY - Profondeur
    this.moduleConfigs.set('memory', {
      module: 'memory',
      color: DS_COLORS.memory.hex,
      colorRgb: DS_COLORS.memory.rgb,
      intensity: 0.25,
      baseIntensity: 0.15,
      maxIntensity: 0.55,
      blur: DS_CONSTANTS.blur.medium,
      innerGlow: true,
      outerGlow: true,
      pulseSpeed: DS_CONSTANTS.animationSpeed.verySlow,
    });
  }

  /**
   * Calculer l'intensité du glow selon une valeur système (0-100)
   */
  calculateIntensity(value: number, baseIntensity: number, maxIntensity: number): number {
    const normalized = Math.max(0, Math.min(100, value)) / 100;
    return baseIntensity + normalized * (maxIntensity - baseIntensity);
  }

  /**
   * Calculer le blur selon l'intensité
   */
  calculateBlur(intensity: number): number {
    return DS_CONSTANTS.blur.min + intensity * (DS_CONSTANTS.blur.max - DS_CONSTANTS.blur.min);
  }

  /**
   * Générer un glow data-driven pour un module
   */
  generateModuleGlow(moduleName: string, value: number): GlowConfig | null {
    const config = this.moduleConfigs.get(moduleName);
    if (!config) return null;

    const intensity = this.calculateIntensity(value, config.baseIntensity, config.maxIntensity);
    const blur = this.calculateBlur(intensity);

    const glowConfig: GlowConfig = {
      color: config.color,
      colorRgb: config.colorRgb,
      intensity,
      blur,
      innerGlow: config.innerGlow,
      outerGlow: config.outerGlow,
      pulseSpeed: config.pulseSpeed,
    };

    this.activeGlows.set(moduleName, glowConfig);
    return glowConfig;
  }

  /**
   * Générer un glow selon l'état système
   */
  generateStateGlow(state: SystemState): GlowConfig {
    const stateConfig = stateEngine.getStateConfig(state);

    return {
      color: stateConfig.color,
      colorRgb: stateConfig.colorRgb,
      intensity: stateConfig.glow,
      blur: stateConfig.blur,
      innerGlow: true,
      outerGlow: true,
      pulseSpeed: stateConfig.pulseSpeed,
    };
  }

  /**
   * Générer CSS pour un glow
   */
  generateGlowCSS(config: GlowConfig): Record<string, string> {
    const innerShadow = config.innerGlow
      ? `inset 0 0 ${config.blur}px ${rgba(config.colorRgb, config.intensity * 0.6)}`
      : '';

    const outerShadow = config.outerGlow
      ? `0 0 ${config.blur}px ${rgba(config.colorRgb, config.intensity)}`
      : '';

    const boxShadow = [innerShadow, outerShadow].filter(Boolean).join(', ');

    const filter = `drop-shadow(0 0 ${config.blur}px ${rgba(config.colorRgb, config.intensity * 0.8)})`;

    return {
      boxShadow,
      filter,
      '--glow-color': config.color,
      '--glow-color-rgb': config.colorRgb,
      '--glow-intensity': config.intensity.toString(),
      '--glow-blur': `${config.blur}px`,
    };
  }

  /**
   * Générer CSS variables pour un module data-driven
   */
  generateModuleGlowVariables(moduleName: string, value: number): Record<string, string> {
    const glowConfig = this.generateModuleGlow(moduleName, value);
    if (!glowConfig) return {};

    return {
      '--module-intensity': (value / 100).toString(),
      '--module-glow-color': glowConfig.color,
      '--module-glow-rgb': glowConfig.colorRgb,
      '--module-glow-intensity': glowConfig.intensity.toString(),
      '--module-glow-blur': `${glowConfig.blur}px`,
      '--module-pulse-speed': glowConfig.pulseSpeed ? `${glowConfig.pulseSpeed}ms` : '0ms',
    };
  }

  /**
   * Obtenir un glow actif
   */
  getActiveGlow(identifier: string): GlowConfig | undefined {
    return this.activeGlows.get(identifier);
  }

  /**
   * Nettoyer tous les glows actifs
   */
  clearActiveGlows(): void {
    this.activeGlows.clear();
  }

  /**
   * Générer un glow dual-tone (signature TITANE∞)
   */
  generateDualToneGlow(primaryRgb: string, secondaryRgb: string, intensity: number): string {
    const blur1 = DS_CONSTANTS.blur.base;
    const blur2 = DS_CONSTANTS.blur.large;

    return [
      `0 0 ${blur1}px ${rgba(primaryRgb, intensity)}`,
      `0 0 ${blur2}px ${rgba(secondaryRgb, intensity * 0.5)}`,
    ].join(', ');
  }

  /**
   * Créer un glow pulsant avec animation CSS
   */
  generatePulseGlowAnimation(config: GlowConfig): string {
    if (!config.pulseSpeed) return '';

    const keyframeName = `glow-pulse-${Math.random().toString(36).substr(2, 9)}`;

    return `
      @keyframes ${keyframeName} {
        0%, 100% {
          filter: drop-shadow(0 0 ${config.blur}px ${rgba(config.colorRgb, config.intensity * 0.6)});
        }
        50% {
          filter: drop-shadow(0 0 ${config.blur * 1.5}px ${rgba(config.colorRgb, config.intensity)});
        }
      }

      animation: ${keyframeName} ${config.pulseSpeed}ms ease-in-out infinite;
    `;
  }
}

// 🌟 Instance singleton
export const glowEngine = new GlowEngine();

// 🎨 Export des fonctions utilitaires
export { rgba } from './DS_COLORS';
