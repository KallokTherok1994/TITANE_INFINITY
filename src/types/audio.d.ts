// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Audio & Spatial Types
// ═══════════════════════════════════════════════════════════════

export interface SoundController {
  playThinking: () => void;
  playInsight: () => void;
  playModeSwitch: () => void;
  playErrorSoft: () => void;
  playHealComplete: () => void;
  playWakeWord: () => void;
  playListening: () => void;
  playProcessing: () => void;
  playSuccess?: () => void;
  playError?: () => void;
}

export type SpatialAudioPreset = 'coach' | 'meta' | 'deep-work' | 'insight' | 'empathy';

export interface SpatialAudioController {
  setPreset: (preset: SpatialAudioPreset) => void;
  getCurrentPreset?: () => SpatialAudioPreset;
  isEnabled?: () => boolean;
}

export interface AudioManager {
  sounds: SoundController;
  spatialAudio: SpatialAudioController;
  setVolume?: (volume: number) => void;
  mute?: () => void;
  unmute?: () => void;
}
