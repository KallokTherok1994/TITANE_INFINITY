// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                     TITANE∞ v13 - TypeScript Types                           ║
// ║                  Types pour modules avancés v13                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════════
// INTERRUPTIBILITY 2.0
// ═══════════════════════════════════════════════════════════════════════════════

export type InterruptionCause =
  | "Confusion"
  | "Correction"
  | "Impatience"
  | "TopicChange"
  | "EmotionalReaction"
  | "Clarification"
  | "NaturalFlow"
  | "Unknown";

export type ConversationStyle =
  | "Brief"
  | "Casual"
  | "Detailed"
  | "Technical"
  | "Creative";

export interface ConversationState {
  interruption_rate: number;
  optimal_length: number;
  preferred_speed: number;
  depth_level: number;
  style: ConversationStyle;
}

export interface InterruptionAnalysis {
  cause: InterruptionCause;
  confidence: number;
  timing_ms: number;
  content_keywords: string[];
  suggested_action: string;
}

export interface ResponseConfig {
  style: "Concise" | "Balanced" | "Detailed" | "Technical";
  target_length: number;
  depth: number;
  speed_words_per_sec: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMOTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export type Emotion =
  | "Neutral"
  | "Happy"
  | "Sad"
  | "Angry"
  | "Frustrated"
  | "Excited"
  | "Calm"
  | "Anxious"
  | "Confused"
  | "Motivated"
  | "Tired";

export interface EmotionalState {
  valence: number; // -1.0 (négatif) à 1.0 (positif)
  intensity: number; // 0.0 (calme) à 1.0 (intense)
  primary_emotion: Emotion;
  confidence: number;
}

export interface AudioFeatures {
  pitch: number;
  pitch_variance: number;
  energy: number;
  speech_rate: number;
  pause_count: number;
}

export type ResponseTone =
  | "Empathetic"
  | "Calm"
  | "Encouraging"
  | "Direct"
  | "Gentle"
  | "Energetic";

export interface EmotionAdaptationConfig {
  tone: ResponseTone;
  tts_speed: number;
  depth: number;
  style: string;
  opening_phrase?: string;
}

export interface TTSParams {
  speed: number;
  pitch: number;
  volume: number;
  pause_duration_ms: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPRESSION COGNITIVE
// ═══════════════════════════════════════════════════════════════════════════════

export type MemoryLevel =
  | "ShortTerm"
  | "MediumTerm"
  | "LongTerm"
  | "MetaSummary";

export interface MemoryEntry {
  id: string;
  original_content?: string;
  compressed_content: string;
  summary: string;
  recall_indices: string[];
  level: MemoryLevel;
  importance: number;
  access_count: number;
  created_at: string;
  last_accessed: string;
  links: string[];
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE ADAPTIVE
// ═══════════════════════════════════════════════════════════════════════════════

export type EnvironmentProfile =
  | "Silent"
  | "Moderate"
  | "Noisy"
  | "VeryNoisy"
  | "Industrial";

export type AudioBandwidth = "Narrowband" | "Wideband" | "Fullband";

export interface AdaptiveAudioConfig {
  mic_gain: number;
  vad_threshold: number;
  noise_reduction: number;
  bandwidth: AudioBandwidth;
  is_calibrated: boolean;
  environment?: EnvironmentProfile;
}

export interface CalibrationResult {
  noise_floor: number;
  voice_level: number;
  snr: number;
  optimal_gain: number;
  detected_environment: EnvironmentProfile;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELFHEAL++
// ═══════════════════════════════════════════════════════════════════════════════

export type HealthStatus = "Healthy" | "Degraded" | "Critical" | "Recovering";

export type IssueType =
  | "ASRCrash"
  | "TTSFailure"
  | "OllamaFrozen"
  | "GeminiTimeout"
  | "MemoryCorruption"
  | "DuplexDesync"
  | "NetworkLoss"
  | "CPUOverload"
  | "HighLatency";

export interface SystemIncident {
  id: string;
  issue_type: IssueType;
  detected_at: string;
  resolved_at?: string;
  auto_recovered: boolean;
  recovery_duration_ms?: number;
}

export interface ModuleHealthStatus {
  name: string;
  status: HealthStatus;
  error_count: number;
  last_error?: string;
  last_check: string;
}

export interface SystemHealth {
  global_status: HealthStatus;
  modules: Record<string, ModuleHealthStatus>;
  active_incidents: SystemIncident[];
  total_incidents: number;
  uptime_ms: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API REQUESTS/RESPONSES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnalyzeInterruptionRequest {
  text: string;
  timing_ms: number;
  conversation_context?: string;
}

export interface DetectEmotionRequest {
  audio_features?: AudioFeatures;
  text?: string;
}

export interface CalibrateAudioRequest {
  duration_ms?: number;
}

export interface CompressConversationRequest {
  messages: ConversationMessage[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type Result<T> = { Ok: T } | { Err: string };

export interface V13ModuleStatus {
  interruptibility: boolean;
  emotion: boolean;
  compression: boolean;
  noise_adaptive: boolean;
  selfheal_plus: boolean;
}
