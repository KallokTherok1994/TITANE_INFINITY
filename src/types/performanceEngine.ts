/**
 * TITANE∞ vΩ∞ — TYPES PERFORMANCE ENGINE
 * Super Prompt #8: Monitoring et optimisation performance
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// MÉTRIQUES
// ============================================================================

export type MetricType =
  | 'counter' // Compteur incrémental
  | 'gauge' // Valeur instantanée
  | 'histogram' // Distribution
  | 'timer'; // Durées

export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
}

export interface MetricSeries {
  metricId: string;
  dataPoints: DataPoint[];
  aggregation?: AggregationType;
  interval?: number;
}

export interface DataPoint {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'p50' | 'p95' | 'p99';

// ============================================================================
// PROFILING
// ============================================================================

export interface ProfileSession {
  id: string;
  name: string;
  startedAt: number;
  endedAt?: number;

  // Spans
  spans: ProfileSpan[];

  // Résumé
  summary?: ProfileSummary;
}

export interface ProfileSpan {
  id: string;
  name: string;
  parentId?: string;

  // Timing
  startTime: number;
  endTime: number;
  duration: number;

  // Contexte
  category: string;
  metadata: Record<string, unknown>;

  // État
  status: 'ok' | 'error';
  error?: string;
}

export interface ProfileSummary {
  totalDuration: number;
  spanCount: number;

  // Par catégorie
  byCategory: Record<
    string,
    {
      count: number;
      totalDuration: number;
      avgDuration: number;
    }
  >;

  // Hotspots
  hotspots: { name: string; duration: number; percentage: number }[];
}

// ============================================================================
// OPTIMISATIONS
// ============================================================================

export interface OptimizationSuggestion {
  id: string;
  type: OptimizationType;
  priority: 'low' | 'medium' | 'high';

  // Description
  title: string;
  description: string;

  // Impact
  estimatedImpact: string;
  affectedArea: string;

  // Action
  actionable: boolean;
  autoApplicable: boolean;
  action?: OptimizationAction;
}

export type OptimizationType =
  | 'caching'
  | 'lazy_loading'
  | 'batching'
  | 'compression'
  | 'parallelization'
  | 'resource_cleanup'
  | 'code_splitting';

export interface OptimizationAction {
  type: string;
  params: Record<string, unknown>;
}

// ============================================================================
// BUDGETS
// ============================================================================

export interface PerformanceBudget {
  id: string;
  name: string;
  metric: string;

  // Seuils
  warning: number;
  error: number;

  // État
  currentValue?: number;
  status: 'ok' | 'warning' | 'exceeded';
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface PerformanceEngineConfig {
  // Métriques
  metricsEnabled: boolean;
  metricsInterval: number;
  metricsRetention: number;

  // Profiling
  profilingEnabled: boolean;
  autoProfilingThreshold: number;

  // Optimisations
  autoOptimizeEnabled: boolean;
  optimizationInterval: number;

  // Budgets
  budgets: PerformanceBudget[];
}

export interface PerformanceEngineState {
  isInitialized: boolean;
  isMonitoring: boolean;

  // Métriques
  metrics: Map<string, MetricSeries>;

  // Profiling
  activeSession: ProfileSession | null;
  sessionHistory: ProfileSession[];

  // Optimisations
  suggestions: OptimizationSuggestion[];
  appliedOptimizations: string[];

  // Budgets
  budgetStatus: Record<string, PerformanceBudget>;

  // Résumé
  summary: {
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
  };
}
