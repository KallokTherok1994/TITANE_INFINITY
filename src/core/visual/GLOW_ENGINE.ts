/**
 * TITANE∞ PHASE 1 (OPTION B) - Stub pour GLOW_ENGINE
 */

export interface GlowConfig {
  intensity: number;
  color: string;
  blur: number;
}

export interface ModuleGlow {
  color: string;
  intensity: number;
  blur: number;
  spread: number;
}

let config: GlowConfig = {
  intensity: 0.8,
  color: '#ffffff',
  blur: 10,
};

export const glowEngine = {
  getConfig: (): GlowConfig => config,
  setConfig: (newConfig: Partial<GlowConfig>) => {
    config = { ...config, ...newConfig };
  },
  applyGlow: (_element: unknown) => {},
  generateModuleGlow: (_moduleId: string, _value?: string | number): ModuleGlow => ({
    color: config.color,
    intensity: config.intensity,
    blur: config.blur,
    spread: 5,
  }),
  clearActiveGlows: () => {},
};

export default glowEngine;
