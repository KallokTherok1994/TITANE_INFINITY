/**
 * TITANE∞ Fusion Backend - TypeScript Type Definitions - Week 3
 * Commands: fusion_process_lipsync, fusion_animate_avatar
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 5: fusion_process_lipsync
// ═══════════════════════════════════════════════════════════════════════════

export interface LipSyncPhoneme {
  sound: string;
  viseme: string;
  intensity: number;
}

export interface LipSyncData {
  phonemes: LipSyncPhoneme[];
  durations: number[];
  timestamps: number[];
}

export interface LipSyncProcessRequest {
  /** Text used for lip-sync (1-5000 chars) */
  text: string;
  /** Optional duration estimate in ms */
  audio_duration_ms?: number;
  /** Language code (default: auto) */
  language?: string;
  /** Intensity (0.0-1.0, default: 0.8) */
  intensity?: number;
  /** Frames per second (15-120, default: 60) */
  fps?: number;
  /** Smooth intensity transitions (default: true) */
  enable_smoothing?: boolean;
}

export interface LipSyncProcessResponse {
  success: boolean;
  message: string;
  data: LipSyncData;
  duration_ms: number;
  phoneme_count: number;
  fps: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 6: fusion_animate_avatar
// ═══════════════════════════════════════════════════════════════════════════

export interface AnimationTransform {
  bone: string;
  position?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
}

export interface AnimationKeyframe {
  time: number;
  transforms: AnimationTransform[];
}

export interface AvatarAnimationData {
  keyframes: AnimationKeyframe[];
  duration: number;
  fps: number;
}

export interface AnimateAvatarRequest {
  lipsync: LipSyncData;
  expression?: string;
  animation_style?: string;
  intensity?: number;
  fps?: number;
  include_head_motion?: boolean;
}

export interface AnimateAvatarResponse {
  success: boolean;
  message: string;
  animation: AvatarAnimationData;
  keyframe_count: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export function isLipSyncProcessSuccess(
  response: unknown
): response is LipSyncProcessResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    (response as LipSyncProcessResponse).success === true &&
    'data' in (response as LipSyncProcessResponse)
  );
}

export function isAnimateAvatarSuccess(
  response: unknown
): response is AnimateAvatarResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    (response as AnimateAvatarResponse).success === true &&
    'animation' in (response as AnimateAvatarResponse)
  );
}

export function validateLipSyncIntensity(value: number): boolean {
  return value >= 0 && value <= 1.0;
}

export function validateAnimationFps(value: number): boolean {
  return value >= 15 && value <= 120;
}

export const DEFAULT_EXPRESSIONS = ['neutral', 'smile', 'focus', 'explain'] as const;
export const DEFAULT_ANIMATION_STYLES = ['fluid', 'snappy', 'calm', 'static'] as const;
