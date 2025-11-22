// ⚡ TITANE∞ v21 — Design System Constants
// Constantes centralisées du système visuel

export const DS_CONSTANTS = {
  // 🎨 Timings du Motion Engine
  timing: {
    instant: 0,
    micro: 120,
    fast: 150,
    base: 180,
    medium: 220,
    slow: 260,
    organic: 300,
    breath: 3000,
  },

  // 🌟 Glow intensités
  glow: {
    none: 0,
    subtle: 0.15,
    base: 0.25,
    medium: 0.35,
    strong: 0.50,
    intense: 0.70,
    maximum: 1.0,
  },

  // 📐 Blur radius (px)
  blur: {
    min: 8,
    base: 12,
    medium: 16,
    large: 20,
    max: 24,
  },

  // 🎚️ Opacités
  opacity: {
    invisible: 0,
    ghost: 0.1,
    subtle: 0.3,
    medium: 0.5,
    visible: 0.7,
    strong: 0.85,
    solid: 1.0,
  },

  // 📏 Z-index layers
  zIndex: {
    background: 0,
    base: 1,
    card: 10,
    cardHover: 20,
    overlay: 100,
    modal: 1000,
    tooltip: 2000,
  },

  // 🔢 Échelles
  scale: {
    min: 0.95,
    base: 1.0,
    hover: 1.02,
    active: 1.05,
    max: 1.1,
  },

  // 🌊 Amplitudes de mouvement (px)
  amplitude: {
    none: 0,
    micro: 1,
    subtle: 2,
    base: 4,
    medium: 8,
    large: 12,
  },

  // ⚡ Vitesses d'animation
  animationSpeed: {
    static: 0,
    verySlow: 4000,
    slow: 3000,
    medium: 2000,
    fast: 1000,
    veryFast: 500,
  },

  // 🎵 Audio volumes (0-1)
  audio: {
    muted: 0,
    whisper: 0.1,
    soft: 0.2,
    medium: 0.4,
    loud: 0.6,
    max: 1.0,
  },

  // 📊 Seuils système
  thresholds: {
    cpu: {
      stable: 50,
      warning: 70,
      critical: 90,
    },
    memory: {
      stable: 60,
      warning: 80,
      critical: 95,
    },
    connections: {
      stable: 100,
      warning: 500,
      critical: 1000,
    },
  },
} as const;

// 🎭 Types TypeScript
export type TimingKey = keyof typeof DS_CONSTANTS.timing;
export type GlowIntensity = keyof typeof DS_CONSTANTS.glow;
export type BlurLevel = keyof typeof DS_CONSTANTS.blur;
export type OpacityLevel = keyof typeof DS_CONSTANTS.opacity;
export type ZIndexLevel = keyof typeof DS_CONSTANTS.zIndex;
export type ScaleLevel = keyof typeof DS_CONSTANTS.scale;
export type AmplitudeLevel = keyof typeof DS_CONSTANTS.amplitude;
export type AnimationSpeedLevel = keyof typeof DS_CONSTANTS.animationSpeed;
export type AudioVolumeLevel = keyof typeof DS_CONSTANTS.audio;
