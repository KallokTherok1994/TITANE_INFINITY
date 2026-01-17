// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Audio & Holophonic Types
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

export type HolophonicPreset = 'coach' | 'meta' | 'deep-work' | 'insight' | 'empathy';

export interface HolophonicController {
  setPreset: (preset: HolophonicPreset) => void;
  getCurrentPreset?: () => HolophonicPreset;
  isEnabled?: () => boolean;
}

export interface AudioManager {
  sounds: SoundController;
  holophonic: HolophonicController;
  setVolume?: (volume: number) => void;
  mute?: () => void;
  unmute?: () => void;
}
