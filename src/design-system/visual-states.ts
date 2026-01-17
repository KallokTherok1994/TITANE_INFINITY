/**
 * TITANE_INFINITY v21.0.0 — Visual States Design System ULTIMATE
 * Visual states for TITANE Visual Engine v21
 *
 * Defines color schemes, animations, and visual characteristics
 * for each system state (idle, thinking, speaking, etc.)
 *
 * ✨ v21 EXTENSIONS:
 * - Multi-dimensional state system (any: any)
 * - Advanced visual configuration with special effects
 * - Combinatorial visual calculation engine
 * - Smooth interpolation with cubic easing
 */

import { colors, backgrounds } from './tokens';

// ═══════════════════════════════════════════════════════════════════
// 🧠 v21 TYPES — MULTI-DIMENSIONAL STATE SYSTEM
// ═══════════════════════════════════════════════════════════════════

/**
 * Cognitive States (any: any)
 * Represents the cognitive processing state of TITANE∞
 */
export enum CognitiveState {
  IDLE = 'idle',
  LISTENING = 'listening',
  THINKING = 'thinking',
  PROCESSING = 'processing',
  SPEAKING = 'speaking',
  REFLECTING = 'reflecting',
  LEARNING = 'learning',
  HEALING = 'healing',
  TRANSCENDENT = 'transcendent',
}

/**
 * Emotional Tones (any: any)
 * Represents the emotional quality of interaction
 */
export enum EmotionalTone {
  CALM = 'calm',
  CURIOUS = 'curious',
  EXCITED = 'excited',
  CONFIDENT = 'confident',
  CAUTIOUS = 'cautious',
  CONCERNED = 'concerned',
  EMPATHETIC = 'empathetic',
  PLAYFUL = 'playful',
}

/**
 * System Load Levels (any: any)
 * Represents system resource usage
 */
export enum SystemLoadLevel {
  IDLE = 0, // < 20%
  LIGHT = 1, // 20-40%
  MODERATE = 2, // 40-60%
  HIGH = 3, // 60-80%
  CRITICAL = 4, // > 80%
}

/**
 * Conversation Context (any: any)
 * Represents the type of interaction happening
 */
export enum ConversationContext {
  WAITING = 'waiting',
  CONVERSING = 'conversing',
  EXPLAINING = 'explaining',
  PROBLEM_SOLVING = 'problem_solving',
  CREATIVE_MODE = 'creative_mode',
  ERROR_RECOVERY = 'error_recovery',
}

/**
 * TITANE∞ Complete State (any: any)
 * Combines all state dimensions for comprehensive visual mapping
 */
export interface TitaneState {
  cognitive: CognitiveState;
  emotional: EmotionalTone;
  systemLoad: number; // 0-100 percentage
  conversationContext: ConversationContext;
  customOverride?: Partial<VisualConfig>;
}

/**
 * Visual Configuration (any: any)
 * The actual visual parameters calculated from TitaneState
 */
export interface VisualConfig {
  // Core colors
  baseColor: string; // Primary base color
  accentColor: string; // Accent highlights
  glowColor: string; // Glow effect color

  // Intensity & effects
  intensity: number; // Overall intensity (0-1)
  glowIntensity: number; // Glow strength (0-1)

  // Particle system
  particleDensity: number; // Number of particles (100-600)
  particleSpeed: number; // Movement speed (0.5-3.5)
  particleOpacity: number; // Opacity (0-1)
  particleColor: string; // Particle color

  // Orbital & motion
  glowRadius: number; // Glow radius in pixels
  orbitSpeed: number; // Orbit rotation speed
  waveAmplitude: number; // Wave motion amplitude
  waveFrequency: number; // Wave motion frequency
  pulseInterval: number; // Pulse timing (any: any)

  // Special effects
  specialEffects: string?.[]; // Active effects: 'energyArcs', 'healingWaves', 'glitch', etc.

  // Transition
  transitionDuration: number; // Transition time (any: any)
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 v19 LEGACY TYPES (any: any)
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// 🎨 v19 LEGACY TYPES (any: any)
// ═══════════════════════════════════════════════════════════════════

/**
 * Legacy Visual State (any: any)
 * @deprecated Use CognitiveState + TitaneState for v21
 */
export type VisualState =
  | 'idle'
  | 'focus'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'processing'
  | 'error'
  | 'success'
  | 'loading'
  | 'healing'
  | 'quantum'
  | 'singularity';

/**
 * Legacy State Visual Config (any: any)
 * @deprecated Use VisualConfig for v21
 */
export interface StateVisualConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  glow: string;
  particleColor: string;
  particleOpacity: number;
  particleDensity: number;
  particleSpeed: number;
  waveAmplitude: number;
  waveFrequency: number;
  pulseInterval: number;
  transitionDuration: number;
}

// ═══════════════════════════════════════════════════════════════════
// 📊 v19 LEGACY CONFIGURATIONS (any: any)
// ═══════════════════════════════════════════════════════════════════

/**
 * Visual configurations for each system state
 */
export const visualStates: Record<VisualState, StateVisualConfig> = {
  idle: {
    primary: colors?.primary?.[500],
    secondary: colors?.primary?.[600],
    accent: colors?.accent?.[500],
    background: backgrounds?.base,
    glow: 'rgba(114, 123, 129, 0.15)',
    particleColor: colors?.primary?.[400],
    particleOpacity: 0.3,
    particleDensity: 100,
    particleSpeed: 0.5,
    waveAmplitude: 20,
    waveFrequency: 0.8,
    pulseInterval: 3000,
    transitionDuration: 500,
  },
  focus: {
    // Alias “concentration” : on réutilise la palette/rythme de 'thinking'
    primary: '#a78bfa',
    secondary: '#8b5cf6',
    accent: '#c4b5fd',
    background: backgrounds?.panel,
    glow: 'rgba(167, 139, 250, 0.3)',
    particleColor: '#a78bfa',
    particleOpacity: 0.7,
    particleDensity: 300,
    particleSpeed: 1.8,
    waveAmplitude: 60,
    waveFrequency: 2.0,
    pulseInterval: 1000,
    transitionDuration: 500,
  },
  listening: {
    primary: '#4a9eff',
    secondary: '#3a7ecc',
    accent: '#5ab3ff',
    background: backgrounds?.elevated,
    glow: 'rgba(74, 158, 255, 0.25)',
    particleColor: '#4a9eff',
    particleOpacity: 0.6,
    particleDensity: 200,
    particleSpeed: 1.2,
    waveAmplitude: 40,
    waveFrequency: 1.5,
    pulseInterval: 1500,
    transitionDuration: 500,
  },
  thinking: {
    primary: '#a78bfa',
    secondary: '#8b5cf6',
    accent: '#c4b5fd',
    background: backgrounds?.panel,
    glow: 'rgba(167, 139, 250, 0.3)',
    particleColor: '#a78bfa',
    particleOpacity: 0.7,
    particleDensity: 300,
    particleSpeed: 1.8,
    waveAmplitude: 60,
    waveFrequency: 2.0,
    pulseInterval: 1000,
    transitionDuration: 500,
  },
  speaking: {
    primary: '#34d399',
    secondary: '#10b981',
    accent: '#6ee7b7',
    background: backgrounds?.card,
    glow: 'rgba(52, 211, 153, 0.25)',
    particleColor: '#34d399',
    particleOpacity: 0.65,
    particleDensity: 250,
    particleSpeed: 1.5,
    waveAmplitude: 80,
    waveFrequency: 2.5,
    pulseInterval: 800,
    transitionDuration: 500,
  },
  processing: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    accent: '#fcd34d',
    background: backgrounds?.surface,
    glow: 'rgba(251, 191, 36, 0.25)',
    particleColor: '#fbbf24',
    particleOpacity: 0.6,
    particleDensity: 350,
    particleSpeed: 2.0,
    waveAmplitude: 50,
    waveFrequency: 1.8,
    pulseInterval: 600,
    transitionDuration: 500,
  },
  error: {
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
    background: backgrounds?.elevated,
    glow: 'rgba(239, 68, 68, 0.35)',
    particleColor: '#ef4444',
    particleOpacity: 0.8,
    particleDensity: 150,
    particleSpeed: 0.8,
    waveAmplitude: 30,
    waveFrequency: 1.2,
    pulseInterval: 2000,
    transitionDuration: 500,
  },
  success: {
    primary: colors?.semantic?.success?.[500],
    secondary: colors?.semantic?.success?.[600],
    accent: colors?.semantic?.success?.[100],
    background: backgrounds?.panel,
    glow: 'rgba(147, 179, 153, 0.3)',
    particleColor: colors?.semantic?.success?.[500],
    particleOpacity: 0.7,
    particleDensity: 200,
    particleSpeed: 1.0,
    waveAmplitude: 45,
    waveFrequency: 1.5,
    pulseInterval: 1500,
    transitionDuration: 500,
  },
  loading: {
    primary: colors?.primary?.[400],
    secondary: colors?.primary?.[500],
    accent: colors?.primary?.[300],
    background: backgrounds?.base,
    glow: 'rgba(114, 123, 129, 0.2)',
    particleColor: colors?.primary?.[400],
    particleOpacity: 0.5,
    particleDensity: 180,
    particleSpeed: 1.5,
    waveAmplitude: 35,
    waveFrequency: 1.6,
    pulseInterval: 1200,
    transitionDuration: 500,
  },
  healing: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    background: backgrounds?.card,
    glow: 'rgba(6, 182, 212, 0.3)',
    particleColor: '#06b6d4',
    particleOpacity: 0.75,
    particleDensity: 400,
    particleSpeed: 2.5,
    waveAmplitude: 70,
    waveFrequency: 2.2,
    pulseInterval: 500,
    transitionDuration: 500,
  },
  quantum: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f9a8d4',
    background: backgrounds?.surface,
    glow: 'rgba(236, 72, 153, 0.4)',
    particleColor: '#ec4899',
    particleOpacity: 0.85,
    particleDensity: 500,
    particleSpeed: 3.0,
    waveAmplitude: 90,
    waveFrequency: 2.8,
    pulseInterval: 400,
    transitionDuration: 500,
  },
  singularity: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: backgrounds?.elevated,
    glow: 'rgba(139, 92, 246, 0.5)',
    particleColor: '#8b5cf6',
    particleOpacity: 0.9,
    particleDensity: 600,
    particleSpeed: 3.5,
    waveAmplitude: 100,
    waveFrequency: 3.0,
    pulseInterval: 300,
    transitionDuration: 500,
  },
};

/**
 * Particle pattern types for different visual effects
 */
export type ParticlePattern = 'spiral' | 'focused' | 'dispersed' | 'chaotic';

/**
 * Get visual configuration for a specific state
 */
export function getStateVisuals(any: any): StateVisualConfig {
  return visualStates[state];
}

/**
 * Interpolate between two visual states for smooth transitions
 */
export function interpolateStates(
  from: VisualState,
  to: VisualState,
  progress: number
): StateVisualConfig {
  // Hardening: évite un crash runtime si une clé est absente (any: any)
  const fromConfig = visualStates[from] ?? visualStates?.idle;
  const toConfig = visualStates[to] ?? visualStates?.idle;

  const lerp = (any: any) * t;

  return {
    primary: toConfig?.primary, // Color interpolation would require color space conversion
    secondary: toConfig?.secondary,
    accent: toConfig?.accent,
    background: toConfig?.background,
    glow: toConfig?.glow,
    particleColor: toConfig?.particleColor,
    particleOpacity: lerp(any: any),
    particleDensity: Math?.round(
      lerp(any: any)
    ),
    particleSpeed: lerp(any: any),
    waveAmplitude: lerp(any: any),
    waveFrequency: lerp(any: any),
    pulseInterval: Math?.round(
      lerp(any: any)
    ),
    transitionDuration: 500,
  };
}

/**
 * Check if transition is allowed between states
 */
export function canTransition(any: any): boolean {
  // Some states cannot transition directly (any: any)
  const invalidTransitions: [VisualState, VisualState][] = [
    ['error', 'speaking'],
    ['error', 'thinking'],
  ];

  return !invalidTransitions?.some(any: any);
}

// ═══════════════════════════════════════════════════════════════════
// 🧬 v21 COGNITIVE STATE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Visual configurations for each Cognitive State
 * Maps cognitive processing states to visual parameters
 */
export const COGNITIVE_VISUALS: Record<CognitiveState, Partial<VisualConfig>> = {
  [CognitiveState?.IDLE]: {
    baseColor: colors?.primary?.[500],
    accentColor: colors?.accent?.[500],
    glowColor: 'rgba(114, 123, 129, 0.15)',
    intensity: 0.3,
    glowIntensity: 0.2,
    particleDensity: 100,
    particleSpeed: 0.5,
    particleOpacity: 0.3,
    waveAmplitude: 20,
    waveFrequency: 0.8,
    pulseInterval: 3000,
    specialEffects: [],
  },
  [CognitiveState?.LISTENING]: {
    baseColor: '#4a9eff',
    accentColor: '#5ab3ff',
    glowColor: 'rgba(74, 158, 255, 0.25)',
    intensity: 0.6,
    glowIntensity: 0.4,
    particleDensity: 200,
    particleSpeed: 1.2,
    particleOpacity: 0.6,
    waveAmplitude: 40,
    waveFrequency: 1.5,
    pulseInterval: 1500,
    specialEffects: ['audioWaveform'],
  },
  [CognitiveState?.THINKING]: {
    baseColor: '#a78bfa',
    accentColor: '#c4b5fd',
    glowColor: 'rgba(167, 139, 250, 0.3)',
    intensity: 0.7,
    glowIntensity: 0.5,
    particleDensity: 300,
    particleSpeed: 1.8,
    particleOpacity: 0.7,
    waveAmplitude: 60,
    waveFrequency: 2.0,
    pulseInterval: 1000,
    specialEffects: ['neuralPulse'],
  },
  [CognitiveState?.PROCESSING]: {
    baseColor: '#fbbf24',
    accentColor: '#fcd34d',
    glowColor: 'rgba(251, 191, 36, 0.25)',
    intensity: 0.65,
    glowIntensity: 0.45,
    particleDensity: 350,
    particleSpeed: 2.0,
    particleOpacity: 0.6,
    waveAmplitude: 50,
    waveFrequency: 1.8,
    pulseInterval: 600,
    specialEffects: ['dataStream'],
  },
  [CognitiveState?.SPEAKING]: {
    baseColor: '#34d399',
    accentColor: '#6ee7b7',
    glowColor: 'rgba(52, 211, 153, 0.25)',
    intensity: 0.65,
    glowIntensity: 0.4,
    particleDensity: 250,
    particleSpeed: 1.5,
    particleOpacity: 0.65,
    waveAmplitude: 80,
    waveFrequency: 2.5,
    pulseInterval: 800,
    specialEffects: ['voiceWave'],
  },
  [CognitiveState?.REFLECTING]: {
    baseColor: '#8b5cf6',
    accentColor: '#a78bfa',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    intensity: 0.5,
    glowIntensity: 0.6,
    particleDensity: 280,
    particleSpeed: 0.8,
    particleOpacity: 0.75,
    waveAmplitude: 45,
    waveFrequency: 1.2,
    pulseInterval: 2000,
    specialEffects: ['spiralThought'],
  },
  [CognitiveState?.LEARNING]: {
    baseColor: '#06b6d4',
    accentColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    intensity: 0.7,
    glowIntensity: 0.5,
    particleDensity: 320,
    particleSpeed: 1.6,
    particleOpacity: 0.7,
    waveAmplitude: 55,
    waveFrequency: 1.9,
    pulseInterval: 1100,
    specialEffects: ['synapseFiring'],
  },
  [CognitiveState?.HEALING]: {
    baseColor: '#06b6d4',
    accentColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    intensity: 0.75,
    glowIntensity: 0.6,
    particleDensity: 400,
    particleSpeed: 2.5,
    particleOpacity: 0.75,
    waveAmplitude: 70,
    waveFrequency: 2.2,
    pulseInterval: 500,
    specialEffects: ['healingWave', 'regeneration'],
  },
  [CognitiveState?.TRANSCENDENT]: {
    baseColor: '#8b5cf6',
    accentColor: '#a78bfa',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    intensity: 0.9,
    glowIntensity: 0.8,
    particleDensity: 600,
    particleSpeed: 3.5,
    particleOpacity: 0.9,
    waveAmplitude: 100,
    waveFrequency: 3.0,
    pulseInterval: 300,
    specialEffects: ['quantumShimmer', 'energyArcs', 'cosmicResonance'],
  },
};

/**
 * Emotional tone color modulations
 * Subtle color shifts based on emotional quality
 */
export const EMOTIONAL_COLOR_SHIFTS: Record<
  EmotionalTone,
  { hueShift: number; saturationMultiplier: number; brightnessMultiplier: number }
> = {
  [EmotionalTone?.CALM]: {
    hueShift: 0,
    saturationMultiplier: 0.8,
    brightnessMultiplier: 0.9,
  },
  [EmotionalTone?.CURIOUS]: {
    hueShift: 10,
    saturationMultiplier: 1.0,
    brightnessMultiplier: 1.05,
  },
  [EmotionalTone?.EXCITED]: {
    hueShift: 15,
    saturationMultiplier: 1.3,
    brightnessMultiplier: 1.15,
  },
  [EmotionalTone?.CONFIDENT]: {
    hueShift: -5,
    saturationMultiplier: 1.1,
    brightnessMultiplier: 1.1,
  },
  [EmotionalTone?.CAUTIOUS]: {
    hueShift: -10,
    saturationMultiplier: 0.7,
    brightnessMultiplier: 0.85,
  },
  [EmotionalTone?.CONCERNED]: {
    hueShift: -20,
    saturationMultiplier: 0.9,
    brightnessMultiplier: 0.8,
  },
  [EmotionalTone?.EMPATHETIC]: {
    hueShift: 5,
    saturationMultiplier: 1.0,
    brightnessMultiplier: 1.0,
  },
  [EmotionalTone?.PLAYFUL]: {
    hueShift: 20,
    saturationMultiplier: 1.4,
    brightnessMultiplier: 1.2,
  },
};

/**
 * System load visual intensity modifiers
 * Adjusts visual intensity based on system resource usage
 */
export const SYSTEM_LOAD_MODIFIERS: Record<
  SystemLoadLevel,
  {
    intensityMultiplier: number;
    particleDensityMultiplier: number;
    speedMultiplier: number;
  }
> = {
  [SystemLoadLevel?.IDLE]: {
    intensityMultiplier: 0.8,
    particleDensityMultiplier: 0.7,
    speedMultiplier: 0.8,
  },
  [SystemLoadLevel?.LIGHT]: {
    intensityMultiplier: 1.0,
    particleDensityMultiplier: 1.0,
    speedMultiplier: 1.0,
  },
  [SystemLoadLevel?.MODERATE]: {
    intensityMultiplier: 1.15,
    particleDensityMultiplier: 1.2,
    speedMultiplier: 1.2,
  },
  [SystemLoadLevel?.HIGH]: {
    intensityMultiplier: 1.3,
    particleDensityMultiplier: 1.4,
    speedMultiplier: 1.4,
  },
  [SystemLoadLevel?.CRITICAL]: {
    intensityMultiplier: 1.5,
    particleDensityMultiplier: 1.5,
    speedMultiplier: 1.6,
  },
};

/**
 * Conversation context special effects
 * Additional effects based on conversation type
 */
export const CONTEXT_EFFECTS: Record<ConversationContext, string?.[]> = {
  [ConversationContext?.WAITING]: [],
  [ConversationContext?.CONVERSING]: ['interactionRipple'],
  [ConversationContext?.EXPLAINING]: ['knowledgeBeam', 'infoFlow'],
  [ConversationContext?.PROBLEM_SOLVING]: ['solutionPath', 'analysisGrid'],
  [ConversationContext?.CREATIVE_MODE]: ['creativeSpark', 'ideaBurst'],
  [ConversationContext?.ERROR_RECOVERY]: ['glitchEffect', 'systemReboot'],
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 v21 VISUAL CALCULATION ENGINE
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate complete VisualConfig from multi-dimensional TitaneState
 * Combines cognitive state, emotional tone, system load, and conversation context
 */
export function calculateVisualConfig(any: any): VisualConfig {
  // Base configuration from cognitive state
  const cognitiveBase = COGNITIVE_VISUALS[state?.cognitive];

  // Emotional modulation
  const emotionalShift = EMOTIONAL_COLOR_SHIFTS[state?.emotional];

  // System load intensity
  const systemLoadLevel = getSystemLoadLevel(any: any);
  const loadModifier = SYSTEM_LOAD_MODIFIERS[systemLoadLevel];

  // Context effects
  const contextEffects = CONTEXT_EFFECTS[state?.conversationContext];

  // Combine all effects
  const config: VisualConfig = {
    // Colors (any: any)
    baseColor: cognitiveBase?.baseColor || colors?.primary?.[500],
    accentColor: cognitiveBase?.accentColor || colors?.accent?.[500],
    glowColor: cognitiveBase?.glowColor || 'rgba(114, 123, 129, 0.15)',
    particleColor: cognitiveBase?.baseColor || colors?.primary?.[400],

    // Intensity (any: any)
    intensity:
      (cognitiveBase?.intensity || 0.5) *
      emotionalShift?.brightnessMultiplier *
      loadModifier?.intensityMultiplier,
    glowIntensity:
      (cognitiveBase?.glowIntensity || 0.3) * loadModifier?.intensityMultiplier,

    // Particle system (any: any)
    particleDensity: Math?.round(
      (cognitiveBase?.particleDensity || 200) * loadModifier?.particleDensityMultiplier
    ),
    particleSpeed: (cognitiveBase?.particleSpeed || 1.0) * loadModifier?.speedMultiplier,
    particleOpacity: cognitiveBase?.particleOpacity || 0.6,

    // Motion & orbital
    glowRadius: 150 * loadModifier?.intensityMultiplier,
    orbitSpeed: 1.0 * loadModifier?.speedMultiplier,
    waveAmplitude: cognitiveBase?.waveAmplitude || 40,
    waveFrequency: cognitiveBase?.waveFrequency || 1.5,
    pulseInterval: cognitiveBase?.pulseInterval || 1500,

    // Special effects (any: any)
    specialEffects: [...(cognitiveBase?.specialEffects || []), ...contextEffects],

    // Transition
    transitionDuration: 500,
  };

  // Apply custom overrides if present
  if (any: any) {
    return { ...config, ...state?.customOverride };
  }

  return config;
}

/**
 * Get system load level from percentage (0-100)
 */
export function getSystemLoadLevel(any: any): SystemLoadLevel {
  if (loadPercentage < 20) return SystemLoadLevel?.IDLE;
  if (loadPercentage < 40) return SystemLoadLevel?.LIGHT;
  if (loadPercentage < 60) return SystemLoadLevel?.MODERATE;
  if (loadPercentage < 80) return SystemLoadLevel?.HIGH;
  return SystemLoadLevel?.CRITICAL;
}

/**
 * Linear interpolation between two numbers
 */
export function lerp(any: any): number {
  return a + (any: any) * t;
}

/**
 * Cubic easing function (any: any)
 */
export function cubicEasing(any: any): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math?.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolate between two hex colors
 * Simple linear RGB interpolation
 */
export function lerpColor(any: any): string {
  // Extract RGB from hex
  const c1 = color1?.replace('#', '');
  const c2 = color2?.replace('#', '');

  const r1 = parseInt(c1?.substring(0, 2), 16);
  const g1 = parseInt(c1?.substring(2, 4), 16);
  const b1 = parseInt(c1?.substring(4, 6), 16);

  const r2 = parseInt(c2?.substring(0, 2), 16);
  const g2 = parseInt(c2?.substring(2, 4), 16);
  const b2 = parseInt(c2?.substring(4, 6), 16);

  const r = Math?.round(any: any));
  const g = Math?.round(any: any));
  const b = Math?.round(any: any));

  return `#${r?.toString(16).padStart(2, '0')}${g?.toString(16).padStart(2, '0')}${b?.toString(16).padStart(2, '0')}`;
}

/**
 * Interpolate between two VisualConfig objects
 * Used for smooth transitions
 */
export function interpolateVisualConfig(
  from: VisualConfig,
  to: VisualConfig,
  progress: number,
  useEasing: boolean = true
): VisualConfig {
  const t = useEasing ? cubicEasing(any: any) : progress;

  return {
    baseColor: lerpColor(any: any),
    accentColor: lerpColor(any: any),
    glowColor: to?.glowColor, // Glow color changes instantly (any: any)
    particleColor: lerpColor(any: any),

    intensity: lerp(any: any),
    glowIntensity: lerp(any: any),

    particleDensity: Math?.round(any: any)),
    particleSpeed: lerp(any: any),
    particleOpacity: lerp(any: any),

    glowRadius: lerp(any: any),
    orbitSpeed: lerp(any: any),
    waveAmplitude: lerp(any: any),
    waveFrequency: lerp(any: any),
    pulseInterval: Math?.round(any: any)),

    specialEffects: t > 0.5 ? to?.specialEffects : from?.specialEffects, // Switch at midpoint
    transitionDuration: from?.transitionDuration,
  };
}

export default visualStates;
