/**
 * TITANE_INFINITY v17.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - TAURI API TYPES
 * Types TypeScript stricts pour toutes les commandes Tauri
 * ═══════════════════════════════════════════════════════════════
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGULARITY STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SingularityState {
  consciousness: number;
  coherence: number;
  autoCoherence: number;
  critical: boolean;
  timestamp: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELIOS MODULE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HeliosModule {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  health: number;
  lastUpdate: number;
}

export type HeliosHealth = 'healthy' | 'degraded' | 'failing';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY CORE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ActiveProject {
  id: string;
  name: string;
  lastAccess: number;
  status: 'active' | 'archived';
  tasksCount: number;
}

export interface RecentMemory {
  id: string;
  content: string;
  timestamp: number;
  type: 'conversation' | 'note' | 'task' | 'event';
  tags: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEXUS STATUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface NexusStatus {
  health: 'healthy' | 'degraded' | 'failing';
  modules: number;
  uptime: number;
  connections: number;
  lastSync: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERSONA ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PersonaMultipliers {
  creativity: number;
  precision: number;
  empathy: number;
  speed: number;
  depth: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHAT & AI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  role: 'assistant';
  timestamp: number;
  tokensUsed: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VoiceRecordingResult {
  text: string;
  duration: number;
  language?: string;
  confidence: number;
}

export type VoiceType = 'default' | 'calm' | 'energetic' | 'neutral';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENGINE METRICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EngineMetrics {
  ticks: number;
  stability: number;
  latency_ms: number;
  last_update_ms: number;
  error_count: number;
  success_rate: number;
}

export type EngineHealth = 'healthy' | 'degraded' | 'failing';

export interface ModuleHealth {
  status: EngineHealth;
  last_check: number;
}

export interface ModuleInfo {
  name: string;
  version: string;
  initialized: boolean;
  health: ModuleHealth;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM STATUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SystemStatus {
  uptime: number;
  cpu: number;
  memory: number;
  health: EngineHealth;
  activeModules: number;
  timestamp: number;
}

export interface SystemInfo {
  version: string;
  platform: string;
  arch: string;
  cores: number;
  totalMemory: number;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  uptime?: number;
  singularity_active?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE RESPONSE TYPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CoreResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}
