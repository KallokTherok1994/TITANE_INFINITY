/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * SystemHealth - Public API
 * FUSION: Helios (Monitoring) + Sentinel (Security) + Harmonia (Balance)
 */

// Main engine export
export { systemHealth } from './SystemHealthEngine';
export type { SystemHealth } from './SystemHealthEngine';

// Types
export type {
  // Metrics
  SystemMetrics,
  MemoryUsage,
  ProviderMetrics,
  LatencyStats,
  ErrorStats,
  ErrorEntry,

  // Provider Health
  ProviderHealth,
  ProviderStatus,
  HealthIssue,

  // Alerts
  Alert,
  AlertType,
  Anomaly,
  AnomalyType,
  AnomalyHandler,

  // Healing
  HealingContext,
  HealingTrigger,
  HealingResult,
  HealingAction,
  HealingEvent,

  // Security
  SecurityResult,
  SecurityViolation,
  ViolationType,
  Guardrail,

  // Load Balance
  LoadBalanceState,
  ProviderLoad,
  LoadRecommendation,
} from './types';

// Sub-components (for advanced usage)
export { MetricsCollector } from './monitoring/metricsCollector';
export { LatencyTracker } from './monitoring/latencyTracker';
export { AutoHealer } from './healing/autoHealer';
export { GuardrailsEngine } from './security/guardrails';
export { LoadBalancer } from './balance/loadBalancer';
