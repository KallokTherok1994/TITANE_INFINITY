/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 — OMEGA TYPES
 * TypeScript bindings for OMEGA Pipeline Rust structs
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────
// IPC Standard Response (mirrors IPC contract {ok, content, error, meta})
// ─────────────────────────────────────────────────────────────────────

export interface IpcError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface IpcMeta {
  correlationId: string;
  provider: string;
  latencyMs: number;
}

export interface IpcResponse<T> {
  ok: boolean;
  content?: T;
  error?: IpcError;
  meta: IpcMeta;
}

// ─────────────────────────────────────────────────────────────────────
// OMEGA Pipeline Types (mirrors omega/mod.rs + context_v2.rs)
// ─────────────────────────────────────────────────────────────────────

export interface OmegaPipelineResult {
  processedText: string;
  latencyMs: number;
  intent: string;
  confidence: number;
  safetyScore: number;
  sources: string[];
  model: string;
  tokens: number;
  timings: Record<string, number>;
}

export interface OmegaHealthReport {
  enabled: boolean;
  healthy: boolean;
  latencyAvgMs: number;
  requestsProcessed: number;
}

// ─────────────────────────────────────────────────────────────────────
// Conversation Health (mirrors conversation_engine/types.rs)
// ─────────────────────────────────────────────────────────────────────

export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';

export interface ConversationHealthReport {
  status: HealthStatus;
  anomaliesDetected: ConversationAnomaly[];
  repairsApplied: ConversationRepair[];
  coherenceScore: number;
}

export interface ConversationAnomaly {
  anomalyType: string;
  severity: number;
  description: string;
}

export interface ConversationRepair {
  repairType: string;
  success: boolean;
  details: string;
}

// ─────────────────────────────────────────────────────────────────────
// OMEGA Config (mirrors omega/mod.rs OmegaConfig)
// ─────────────────────────────────────────────────────────────────────

export interface OmegaConfig {
  maxContextTokens: number;
  timeoutMs: number;
  enableAdaptiveRouting: boolean;
  enableMemoryBridge: boolean;
  enableSelfHealing: boolean;
  maxParallelExecutors: number;
}
