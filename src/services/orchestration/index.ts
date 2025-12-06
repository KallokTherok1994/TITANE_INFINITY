/**
 * TITANE∞ vΩ — Orchestration Module Index
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

// Core orchestrator
export { UnifiedOrchestrator, unifiedOrchestrator } from './UnifiedOrchestrator';

// Strategies
export { MCPStrategy } from './strategies/MCPStrategy';
export { CognitiveStrategy } from './strategies/CognitiveStrategy';
export { AIStrategy } from './strategies/AIStrategy';
export { QuantumStrategy } from './strategies/QuantumStrategy';

// Shared infrastructure
export { HealthMonitor } from './shared/HealthMonitor';
export { MetricsCollector } from './shared/MetricsCollector';
export { RecoveryEngine } from './shared/RecoveryEngine';
export { ValidationEngine } from './shared/ValidationEngine';

// Types
export type {
  // Core types
  OrchestrationStrategyType,
  OrchestrationResult,
  IOrchestrationStrategy,
  UnifiedOrchestratorConfig,
  OrchestratorState,
  StrategyConfig,
  
  // Health monitoring
  HealthStatus,
  HealthCheckResult,
  IHealthMonitor,
  
  // Metrics
  MetricType,
  Metric,
  MetricsSummary,
  IMetricsProvider,
  
  // Recovery
  RecoveryAction,
  RecoveryPolicy,
  RecoveryResult,
  IRecoveryHandler,
  
  // Validation
  ValidationSeverity,
  ValidationIssue,
  ValidationResult,
  IValidator,
  
  // Strategy-specific operations
  MCPJobOperation,
  MCPHealthOperation,
  CognitiveMemoryOperation,
  CognitiveGoalOperation,
  AIProviderOperation,
  AIProviderInfo,
  QuantumOperation,
  QuantumSignal
} from './types';
