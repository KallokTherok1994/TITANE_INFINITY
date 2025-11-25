/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY STATE TYPES
 * Mirrors exacts des types Rust backend
 * ═══════════════════════════════════════════════════════════════════
 */

export interface SingularityState {
  physical: PhysicalLayer;
  cognitive: CognitiveLayer;
  symbolic: SymbolicLayer;
  adaptive: AdaptiveLayer;
  meta: MetaLayer;
  progression?: ProgressionState; // ✨ v∞.D6 - État XP (optionnel pour compatibilité backend)
  timestamp: number;
  signature: string;
}

// ═══════════════════════════════════════════════════════════════════
// PROGRESSION STATE (v∞.D6)
// ═══════════════════════════════════════════════════════════════════

export interface ProgressionState {
  xp: number;
  level: number;
  events: Array<{
    source: string;
    amount: number;
    timestamp: number;
    description?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════
// PHYSICAL LAYER
// ═══════════════════════════════════════════════════════════════════

export interface PhysicalLayer {
  helios: HeliosState;
  system_health: SystemHealth;
  metrics: PerformanceMetrics;
}

export interface HeliosState {
  active: boolean;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  temperature: number;
  battery_level: number | null;
  last_update: number;
}

export interface SystemHealth {
  global_health: number;
  services_running: number;
  errors_count: number;
  warnings_count: number;
  uptime: number;
}

export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  fps: number;
  latency: number;
  performance_score: number;
}

// ═══════════════════════════════════════════════════════════════════
// COGNITIVE LAYER
// ═══════════════════════════════════════════════════════════════════

export interface CognitiveLayer {
  memory: MemoryState;
  conversation: ConversationState;
  knowledge: KnowledgeState;
  coherence: number;
}

export interface MemoryState {
  total_memories: number;
  active_memories: number;
  memory_usage: number;
  last_retrieval: number | null;
  compression_ratio: number;
}

export interface ConversationState {
  active_session: boolean;
  message_count: number;
  context_length: number;
  last_message: string | null;
  last_timestamp: number | null;
}

export interface KnowledgeState {
  total_entries: number;
  indexed_entries: number;
  knowledge_score: number;
  last_update: number | null;
}

// ═══════════════════════════════════════════════════════════════════
// SYMBOLIC LAYER
// ═══════════════════════════════════════════════════════════════════

export interface SymbolicLayer {
  persona: PersonaState;
  archetype: ArchetypeState;
  visual: VisualState;
  stability: number;
}

export interface PersonaState {
  name: string;
  mood: string;
  intensity: number;
  evolution_level: number;
  last_interaction: number | null;
}

export interface ArchetypeState {
  active_archetype: string;
  strength: number;
  transition: string | null;
}

export interface VisualState {
  theme: string;
  accent_color: string;
  glow_intensity: number;
  motion_enabled: boolean;
  depth_enabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// ADAPTIVE LAYER
// ═══════════════════════════════════════════════════════════════════

export interface AdaptiveLayer {
  evolution: EvolutionState;
  auto_heal: AutoHealState;
  evolution_capacity: number;
}

export interface EvolutionState {
  generation: number;
  mutation_rate: number;
  fitness_score: number;
  last_evolution: number | null;
}

export interface AutoHealState {
  active: boolean;
  healing_capacity: number;
  errors_healed: number;
  last_heal: number | null;
}

// ═══════════════════════════════════════════════════════════════════
// META LAYER
// ═══════════════════════════════════════════════════════════════════

export interface MetaLayer {
  ui: UIState;
  runtime: RuntimeState;
  runtime_health: number;
}

export interface UIState {
  active_page: string;
  sidebar_open: boolean;
  modal_open: boolean;
  theme: string;
  last_interaction: number | null;
}

export interface RuntimeState {
  version: string;
  build: string;
  environment: string;
  uptime: number;
  restart_count: number;
}
