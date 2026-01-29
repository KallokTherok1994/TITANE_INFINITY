/**
 * TITANE∞ Fusion Backend - TypeScript Type Definitions - Week 2
 * Commands: fusion_generate_ia_response, fusion_prepare_tts
 *
 * © 2026 Kevin Thibault / TITANE Team
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 3: fusion_generate_ia_response
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request to generate IA response
 * All fields except 'prompt' are optional
 */
export interface IAGenerationRequest {
  /** User input prompt (1-10000 chars) */
  prompt: string;
  /** Model to use (default: "claude-haiku") */
  model?: string;
  /** Temperature for creativity (0.0-2.0, default: 0.7) */
  temperature?: number;
  /** Maximum response tokens (1-4096, default: 256) */
  max_tokens?: number;
  /** System instruction override */
  system_prompt?: string;
  /** Use cache system (default: true) */
  enable_cache?: boolean;
  /** Cache key override */
  cache_key?: string;
}

/**
 * Response from IA generation
 */
export interface IAGenerationResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Human-readable status message */
  message: string;
  /** Generated response text */
  response: string;
  /** Number of tokens used */
  tokens_used: number;
  /** Whether response came from cache */
  cached: boolean;
  /** Generation time in milliseconds */
  generation_time_ms: number;
  /** Model that generated response */
  model: string;
  /** ISO 8601 timestamp */
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 4: fusion_prepare_tts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request to prepare TTS audio buffer
 * All fields except 'text' are optional
 */
export interface TTSPrepareRequest {
  /** Text to synthesize (1-5000 chars) */
  text: string;
  /** Voice ID (default: "nova") */
  voice?: string;
  /** Speech speed (0.5-2.0, default: 1.0) */
  speed?: number;
  /** Pitch adjustment (0.5-2.0, default: 1.0) */
  pitch?: number;
  /** Audio format: "mp3" | "wav" | "aac" (default: "mp3") */
  format?: string;
  /** Language code (default: "en") */
  language?: string;
  /** Prepare for streaming (default: false) */
  enable_streaming?: boolean;
}

/**
 * Response from TTS buffer preparation
 */
export interface TTSPrepareResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Human-readable status message */
  message: string;
  /** Audio buffer size in bytes */
  buffer_size: number;
  /** Estimated audio duration in milliseconds */
  duration_ms: number;
  /** Audio format (mp3, wav, aac) */
  format: string;
  /** Voice name used */
  voice: string;
  /** Sample rate in Hz */
  sample_rate: number;
  /** Number of audio channels (1=mono, 2=stereo) */
  channels: number;
  /** Number of chunks prepared (for streaming) */
  chunks_prepared: number;
  /** ISO 8601 timestamp */
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// VOICE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Voice configuration for TTS
 */
export interface VoiceConfig {
  id: string;
  name: string;
  language: string;
  default_speed: number;
  default_pitch: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHED RESPONSE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cached IA response with expiration info
 */
export interface CachedIAResponse {
  response: string;
  tokens_used: number;
  created_at: number;
  expires_at: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type guard for successful IA response
 */
export function isIAGenerationSuccess(
  response: IAGenerationResponse | unknown
): response is IAGenerationResponse {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const candidate = response as Record<string, unknown>;

  return candidate.success === true && 'response' in candidate && 'model' in candidate;
}

/**
 * Type guard for successful TTS response
 */
export function isTTSPrepareSuccess(
  response: TTSPrepareResponse | unknown
): response is TTSPrepareResponse {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const candidate = response as Record<string, unknown>;

  return candidate.success === true && 'buffer_size' in candidate && 'voice' in candidate;
}

/**
 * Validate hex color format for future use
 */
export function validateTemperature(temp: number): boolean {
  return temp >= 0 && temp <= 2.0;
}

/**
 * Validate speech speed
 */
export function validateSpeed(speed: number): boolean {
  return speed >= 0.5 && speed <= 2.0;
}

/**
 * Validate pitch
 */
export function validatePitch(pitch: number): boolean {
  return pitch >= 0.5 && pitch <= 2.0;
}

/**
 * Validate audio format
 */
export function validateAudioFormat(format: string): boolean {
  return ['mp3', 'wav', 'aac'].includes(format.toLowerCase());
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Available voices for TTS */
export const AVAILABLE_VOICES = {
  nova: {
    id: 'nova',
    name: 'Nova',
    language: 'en',
    description: 'Professional female voice (default)',
  },
  echo: {
    id: 'echo',
    name: 'Echo',
    language: 'en',
    description: 'Natural male voice',
  },
  fable: {
    id: 'fable',
    name: 'Fable',
    language: 'en',
    description: 'Engaging storytelling voice',
  },
} as const;

/** Available models for IA */
export const AVAILABLE_MODELS = {
  'claude-haiku': {
    name: 'Claude Haiku',
    max_tokens: 4096,
    avg_latency_ms: 500,
    cost_per_mtok: 0.8,
  },
  'claude-sonnet': {
    name: 'Claude Sonnet',
    max_tokens: 4096,
    avg_latency_ms: 800,
    cost_per_mtok: 3.0,
  },
  'local-llama': {
    name: 'Local LLaMA',
    max_tokens: 2048,
    avg_latency_ms: 1000,
    cost_per_mtok: 0,
  },
} as const;

/** Audio formats and their properties */
export const AUDIO_FORMATS = {
  mp3: {
    bitrate_kbps: 128,
    bytes_per_second: 16000,
    extension: '.mp3',
    mime: 'audio/mpeg',
  },
  wav: {
    bitrate_kbps: 1411, // 16-bit, 44.1kHz stereo
    bytes_per_second: 172800,
    extension: '.wav',
    mime: 'audio/wav',
  },
  aac: {
    bitrate_kbps: 102.4,
    bytes_per_second: 12800,
    extension: '.aac',
    mime: 'audio/aac',
  },
} as const;

/** Temperature presets for IA generation */
export const TEMPERATURE_PRESETS = {
  precise: 0.0, // Most deterministic
  balanced: 0.7, // Default
  creative: 1.5, // Very creative
  chaotic: 2.0, // Maximum randomness
} as const;

/** Speech speed presets */
export const SPEED_PRESETS = {
  slow: 0.5,
  normal: 1.0,
  fast: 1.5,
  veryFast: 2.0,
} as const;

/** Pitch presets */
export const PITCH_PRESETS = {
  low: 0.7,
  normal: 1.0,
  high: 1.3,
  veryHigh: 2.0,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Error response from Fusion commands
 */
export interface FusionErrorResponse {
  success: false;
  message: string;
  code?: string;
  timestamp?: number;
}
