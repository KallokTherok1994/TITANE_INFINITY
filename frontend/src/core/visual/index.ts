// ⚡ TITANE∞ v21 — Visual Engines (Phase 6)
// Export centralisé des moteurs visuels

// 🎨 Design System
export { DS_COLORS, rgba, hexToRgb } from './DS_COLORS';
export type { ColorModule, ColorVariant } from './DS_COLORS';

export { DS_CONSTANTS } from './DS_CONSTANTS';
export type {
  TimingKey,
  GlowIntensity,
  BlurLevel,
  OpacityLevel,
  ZIndexLevel,
  ScaleLevel,
  AmplitudeLevel,
  AnimationSpeedLevel,
  AudioVolumeLevel,
} from './DS_CONSTANTS';

// 🎭 State Engine
export { stateEngine, STATE_CONFIGS, stateConfigs } from './STATE_ENGINE';
export type { SystemState, StateVisualConfig } from './STATE_ENGINE';

// 🌟 Glow Engine
export { glowEngine } from './GLOW_ENGINE';
export type { GlowConfig, ModuleGlowConfig } from './GLOW_ENGINE';

// 🌊 Motion Engine
export { motionEngine } from './MOTION_ENGINE';
export type { MotionType, MotionConfig, ModuleMotionConfig } from './MOTION_ENGINE';

// 🎣 Hooks React
export {
  useGlowEngine,
  useMotionEngine,
  useSystemState,
  useLiveGlow,
  useLivePulse,
  useModuleGlow,
  useStateGlow,
  useStateMotion,
  useDualToneGlow,
  useAdaptiveMotion,
  useCombinedVisuals,
  useSystemMetrics,
} from './hooks';
