/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v15 — SINGULARITY STATE TYPES
 * Mirrors exacts des types Rust backend
 * ═══════════════════════════════════════════════════════════════════
 */

import type { MoodType } from '../core/ARCHITECTURE_TYPES_v24-v∞';

export interface SingularityState {
  physical: PhysicalLayer;
  cognitive: CognitiveLayer;
  symbolic: SymbolicLayer;
  adaptive: AdaptiveLayer;
  meta: MetaLayer;
  autonomy?: AutonomyLayer; // ✨ v24.30 - Autonomous system state
  devops?: DevOpsLayer; // ✨ v26.0 - Visual DevOps + Local Agent state
  progression?: ProgressionState; // ✨ v∞.D6 - État XP (optionnel pour compatibilité backend)
  timestamp: number;
  signature: string;
}

// Aliases pour compatibilité backend (PhysicalState = PhysicalLayer, etc.)
export type PhysicalState = PhysicalLayer;
export type CognitiveState = CognitiveLayer;
export type SymbolicState = SymbolicLayer;
export type AdaptiveState = AdaptiveLayer;
export type MetaState = MetaLayer;

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
// AUTONOMY LAYER (v24.30)
// ═══════════════════════════════════════════════════════════════════

export interface AutonomyLayer {
  enabled: boolean;
  health_score: number; // 0-100
  stability_index: number; // 0-100
  pipeline_integrity: number; // 0-100
  auto_evolution_level: number; // 0-10
  last_scan: number | null; // timestamp ms
  last_fix: number | null; // timestamp ms
  last_optimization: number | null; // timestamp ms
  last_evolution: number | null; // timestamp ms
  errors_fixed: number;
  warnings_resolved: number;
  optimizations_applied: number;
  evolutions_completed: number;
  cycle_count: number; // Nombre de cycles autonomes exécutés
  last_cycle_duration_ms: number; // Durée dernier cycle
  average_cycle_duration_ms: number; // Moyenne des durées de cycle
  autonomous_actions: AutonomousAction[];
}

export interface AutonomousAction {
  id: string;
  action_type:
    | 'scan'
    | 'detect'
    | 'fix'
    | 'heal'
    | 'optimize'
    | 'evolve'
    | 'test'
    | 'shield'
    | 'analyse'
    | 'report';
  timestamp: number;
  duration_ms: number;
  success: boolean;
  details: string;
  impact_score: number; // 0-1
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
  last_error?: string | null; // ✨ v24.3 - Last error message for useEngineVitals
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
  ai_config?: AIConfigState; // ✨ v∞.LOCAL - Configuration IA locale
  coherence: number;
}

// ═══════════════════════════════════════════════════════════════════
// AI CONFIG STATE (v∞.LOCAL - Super Prompt #12)
// ═══════════════════════════════════════════════════════════════════

export interface AIConfigState {
  current_provider: 'gemini' | 'gpt' | 'titane-local' | 'anthropic';
  ollama_available: boolean;
  ollama_models: string[];
  dev_mode: boolean;
  fallback_enabled: boolean;
  auto_switch_on_error: boolean;
  last_ollama_check: number | null;
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
  mood: MoodType; // ✨ v21.5.5 - typed mood instead of string
  intensity: number;
  evolution_level: number;
  last_interaction: number | null;
  personality?: { temperament?: string; [key: string]: unknown };
  behavior?: { posture?: string; [key: string]: unknown };
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

// ═══════════════════════════════════════════════════════════════════
// DEVOPS LAYER (v26.0)
// ═══════════════════════════════════════════════════════════════════

export interface DevOpsLayer {
  enabled: boolean;
  visual_mode_active: boolean;
  local_agent_active: boolean;

  // Stats
  total_actions: number;
  successful_actions: number;
  failed_actions: number;
  pending_validations: number;

  // Sécurité
  security_level: 'strict' | 'moderate' | 'permissive';
  require_validation_for: string[]; // ActionType[]
  blocked_actions: string[]; // ActionType[]

  // Tracking
  last_screen_analysis: number | null; // timestamp ms
  last_devops_action: number | null; // timestamp ms
  last_build: number | null; // timestamp ms
  last_test: number | null; // timestamp ms
  last_deploy: number | null; // timestamp ms

  // Project health
  project_health_score: number; // 0-100
  active_workflows: number;

  // Session
  session_id: string | null;
  session_duration_ms: number;
}
