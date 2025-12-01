/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — AUDIO CENTER TYPES
 *   Types pour configuration audio, TTS et microphone
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
//  TTS Engine Types
// ─────────────────────────────────────────────────────────────────

export type TTSEngine = 'piper' | 'espeak' | 'elevenlabs' | 'webspeech';

export interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  gender: 'female' | 'male' | 'neutral';
  engine: TTSEngine;
  description: string;
  isRealistic: boolean;
  sampleUrl?: string;
}

export interface TTSSettings {
  engine: TTSEngine;
  voiceId: string;
  rate: number;      // 0.5 - 2.0
  pitch: number;     // 0.5 - 2.0
  volume: number;    // 0.0 - 1.0
  language: string;  // 'fr-FR', 'en-US'
  emotionEnabled: boolean;
  autoFallback: boolean;
}

export const DEFAULT_TTS_SETTINGS: TTSSettings = {
  engine: 'piper',
  voiceId: 'fr_FR-siwis-medium',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  language: 'fr-FR',
  emotionEnabled: true,
  autoFallback: true,
};

// ─────────────────────────────────────────────────────────────────
//  Audio Device Types
// ─────────────────────────────────────────────────────────────────

export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  isDefault: boolean;
  isActive: boolean;
  driver: string;  // 'pipewire', 'alsa', 'pulseaudio'
}

export interface AudioOutputSettings {
  deviceId: string;
  volume: number;       // 0.0 - 1.0
  balance: number;      // -1.0 (left) to 1.0 (right)
  enhancementsEnabled: boolean;
}

export interface AudioInputSettings {
  deviceId: string;
  gain: number;         // 0.0 - 2.0
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

export const DEFAULT_OUTPUT_SETTINGS: AudioOutputSettings = {
  deviceId: 'default',
  volume: 1.0,
  balance: 0.0,
  enhancementsEnabled: true,
};

export const DEFAULT_INPUT_SETTINGS: AudioInputSettings = {
  deviceId: 'default',
  gain: 1.0,
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
};

// ─────────────────────────────────────────────────────────────────
//  Available Voice Profiles
// ─────────────────────────────────────────────────────────────────

export const AVAILABLE_VOICES: VoiceProfile[] = [
  // Piper Voices (Local - Realistic)
  {
    id: 'fr_FR-siwis-medium',
    name: 'Siwis (Femme)',
    language: 'fr-FR',
    gender: 'female',
    engine: 'piper',
    description: 'Voix féminine française naturelle et inspirante',
    isRealistic: true,
  },
  {
    id: 'fr_FR-upmc-medium',
    name: 'UPMC (Femme)',
    language: 'fr-FR',
    gender: 'female',
    engine: 'piper',
    description: 'Voix féminine académique française',
    isRealistic: true,
  },
  {
    id: 'en_US-amy-medium',
    name: 'Amy (Female)',
    language: 'en-US',
    gender: 'female',
    engine: 'piper',
    description: 'Natural American female voice',
    isRealistic: true,
  },

  // ElevenLabs Voices (Cloud - Premium)
  {
    id: 'FvmvwvObRqIHojkEGh5N',
    name: 'Charlotte (ElevenLabs)',
    language: 'fr-FR',
    gender: 'female',
    engine: 'elevenlabs',
    description: 'Voix premium ultra-réaliste avec émotions',
    isRealistic: true,
  },

  // eSpeak Voices (Local - Robotic)
  {
    id: 'fr',
    name: 'eSpeak Français',
    language: 'fr-FR',
    gender: 'neutral',
    engine: 'espeak',
    description: 'Voix synthétique basique (fallback)',
    isRealistic: false,
  },
];

// ─────────────────────────────────────────────────────────────────
//  Audio Test Types
// ─────────────────────────────────────────────────────────────────

export interface AudioTestResult {
  success: boolean;
  latencyMs: number;
  qualityScore: number;  // 0-100
  errorMessage?: string;
}

export interface MicrophoneTestResult {
  success: boolean;
  peakLevel: number;     // 0.0 - 1.0
  noiseFloor: number;    // 0.0 - 1.0
  signalToNoise: number; // dB
  errorMessage?: string;
}

// ─────────────────────────────────────────────────────────────────
//  Complete Audio Configuration
// ─────────────────────────────────────────────────────────────────

export interface AudioConfiguration {
  tts: TTSSettings;
  output: AudioOutputSettings;
  input: AudioInputSettings;
  lastUpdated: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfiguration = {
  tts: DEFAULT_TTS_SETTINGS,
  output: DEFAULT_OUTPUT_SETTINGS,
  input: DEFAULT_INPUT_SETTINGS,
  lastUpdated: Date.now(),
};
