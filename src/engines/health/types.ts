/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * SystemHealth Types - Fusion Helios + Sentinel + Harmonia
 */

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM METRICS
// ═══════════════════════════════════════════════════════════════════════════

export interface SystemMetrics {
  cpu: number;
  memory: MemoryUsage;
  providers: Map<string, ProviderMetrics>;
  latency: LatencyStats;
  errors: ErrorStats;
  timestamp: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

export interface ProviderMetrics {
  id: string;
  health: number;
  latency: number;
  requestCount: number;
  errorCount: number;
  lastSuccess: number;
  lastError?: number;
  available: boolean;
}

export interface LatencyStats {
  p50: number;
  p95: number;
  p99: number;
  avg: number;
  samples: number;
}

export interface ErrorStats {
  rate: number;
  total: number;
  recent: ErrorEntry[];
}

export interface ErrorEntry {
  timestamp: number;
  source: string;
  message: string;
  code?: string;
  recovered: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER HEALTH
// ═══════════════════════════════════════════════════════════════════════════

export interface ProviderHealth {
  id: string;
  status: ProviderStatus;
  health: number;
  metrics: ProviderMetrics;
  issues: HealthIssue[];
}

export type ProviderStatus = 'healthy' | 'degraded' | 'unhealthy' | 'offline';

export interface HealthIssue {
  severity: 'critical' | 'warning' | 'info';
  code: string;
  message: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS & ANOMALIES
// ═══════════════════════════════════════════════════════════════════════════

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

export type AlertType =
  | 'provider_unhealthy'
  | 'high_latency'
  | 'high_error_rate'
  | 'memory_pressure'
  | 'cpu_pressure'
  | 'healing_triggered'
  | 'security_violation';

export interface Anomaly {
  type: AnomalyType;
  source: string;
  value: number;
  expected: number;
  deviation: number;
  timestamp: number;
}

export type AnomalyType =
  | 'latency_spike'
  | 'error_burst'
  | 'traffic_surge'
  | 'resource_spike';

export type AnomalyHandler = (anomaly: Anomaly) => void;

// ═══════════════════════════════════════════════════════════════════════════
// HEALING
// ═══════════════════════════════════════════════════════════════════════════

export interface HealingContext {
  trigger: HealingTrigger;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  error?: Error;
  metadata?: Record<string, unknown>;
}

export type HealingTrigger =
  | 'provider_failure'
  | 'timeout'
  | 'error_threshold'
  | 'health_degradation'
  | 'manual';

export interface HealingResult {
  success: boolean;
  action: HealingAction;
  duration: number;
  message: string;
  newState?: Record<string, unknown>;
}

export type HealingAction =
  | 'provider_restart'
  | 'provider_switch'
  | 'cache_clear'
  | 'connection_reset'
  | 'state_restore'
  | 'graceful_degradation'
  | 'no_action';

export interface HealingEvent {
  id: string;
  context: HealingContext;
  result: HealingResult;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY (ex-Sentinel)
// ═══════════════════════════════════════════════════════════════════════════

export interface SecurityResult {
  valid: boolean;
  violations: SecurityViolation[];
  sanitized?: unknown;
}

export interface SecurityViolation {
  type: ViolationType;
  field?: string;
  message: string;
  severity: 'block' | 'warn' | 'info';
}

export type ViolationType =
  | 'injection'
  | 'xss'
  | 'rate_limit'
  | 'size_limit'
  | 'forbidden_content'
  | 'malformed_input';

export interface Guardrail {
  id: string;
  name: string;
  enabled: boolean;
  action: 'block' | 'sanitize' | 'warn' | 'log';
  check: (input: unknown) => boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOAD BALANCE (ex-Harmonia)
// ═══════════════════════════════════════════════════════════════════════════

export interface LoadBalanceState {
  providers: Map<string, ProviderLoad>;
  totalLoad: number;
  avgLoad: number;
  balanced: boolean;
  recommendations: LoadRecommendation[];
}

export interface ProviderLoad {
  id: string;
  currentLoad: number;
  capacity: number;
  utilization: number;
}

export interface LoadRecommendation {
  providerId: string;
  action: 'increase' | 'decrease' | 'maintain';
  targetLoad: number;
  reason: string;
}
