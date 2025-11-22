/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Tauri Commands Types
 * Types TypeScript miroirs des structures Rust
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// META-MODE ENGINE
// ─────────────────────────────────────────────────────────────────

export interface InteractionRequest {
  input: string;
  context: string;
}

export interface InteractionResponse {
  active_mode: string;
  mode_justification: string;
  content: string;
  adapted_tone: string;
  adapted_depth: string;
  adapted_speed: string;
  next_suggested_modes: string[];
  timestamp: string;
}

export interface KevinStateResponse {
  emotional_tone: string;
  stress_level: number;
  emotional_stability: number;
  cognitive_load: number;
  clarity_level: number;
  focus_level: number;
  energy_level: number;
  saturation_level: number;
  need_structure: boolean;
  need_validation: boolean;
  need_guidance: boolean;
  need_autonomy: boolean;
  need_creativity: boolean;
  need_rest: boolean;
  task_type: string;
  implicit_signals: string[];
}

export interface MetaModeStats {
  total_interactions: number;
  current_mode: string;
  mode_transitions_count: number;
  average_stress: number;
  average_clarity: number;
  average_energy: number;
}

// ─────────────────────────────────────────────────────────────────
// EXP ENGINE
// ─────────────────────────────────────────────────────────────────

export interface ExpProfile {
  total_exp: number;
  level: number;
  exp_to_next_level: number;
  categories: Record<string, CategoryExp>;
  talents: string[];
  talent_points: number;
}

export interface CategoryExp {
  category: string;
  exp: number;
  level: number;
  contributions: number;
}

export interface ExpGain {
  amount: number;
  category: string;
  source: string;
  description: string;
  timestamp: number;
  multiplier: number;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  cost: number;
  requirements: string[];
  unlocked: boolean;
}

export interface LevelUpEvent {
  old_level: number;
  new_level: number;
  talent_points_earned: number;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────
// MEMORY ENGINE
// ─────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  content: string;
  embedding: number[];
  metadata: MemoryMetadata;
  timestamp: number;
  importance: number;
  access_count: number;
}

export interface MemoryMetadata {
  entry_type: string;
  tags: string[];
  related_ids: string[];
  source: string;
}

export interface MemoryQuery {
  query: string;
  limit: number;
  min_similarity: number;
  filters?: string[];
}

export interface MemoryResult {
  entry: MemoryEntry;
  similarity: number;
}

export interface MemoryStats {
  total_entries: number;
  total_tokens: number;
  vector_dimensions: number;
  index_size_mb: number;
  conversations_stored: number;
  facts_stored: number;
}

// ─────────────────────────────────────────────────────────────────
// VOICE MODE
// ─────────────────────────────────────────────────────────────────

export interface VoiceConfig {
  language: string;
  use_online: boolean;
  voice_id?: string;
}

export interface RecordingState {
  is_recording: boolean;
  duration_ms: number;
  audio_level: number;
}

// ─────────────────────────────────────────────────────────────────
// SYSTEM TYPES
// ─────────────────────────────────────────────────────────────────

export interface SystemStatus {
  uptime_seconds: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  active_modules: string[];
}
