/**
 * TITANE∞ vΩ∞ — PERFORMANCE ENGINE CONFIG
 * Super Prompt #8: Configuration pour Performance Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type { MetricType, OptimizationType } from '@/types/performanceEngine';

// ============================================================================
// METRIC CONFIGURATION
// ============================================================================

export const METRIC_CONFIG: Record<MetricType, {
  name: string;
  description: string;
  unit: string;
  icon: string;
  color: string;
}> = {
  counter: {
    name: 'Compteur',
    description: 'Valeur incrémentale',
    unit: 'count',
    icon: '📊',
    color: '#727b81', // TITANE primary
  },
  gauge: {
    name: 'Jauge',
    description: 'Valeur instantanée',
    unit: 'value',
    icon: '📈',
    color: '#93b399', // TITANE success
  },
  histogram: {
    name: 'Histogramme',
    description: 'Distribution de valeurs',
    unit: 'ms',
    icon: '📉',
    color: '#a89f91', // TITANE warning
  },
  timer: {
    name: 'Timer',
    description: 'Durée en millisecondes',
    unit: 'ms',
    icon: '⏱️',
    color: '#9a8a8a', // TITANE rose
  },
};

// ============================================================================
// THRESHOLDS CONFIGURATION
// ============================================================================

export interface ThresholdConfig {
  metric: string;
  warning: number;
  error: number;
  critical: number;
  unit: string;
}

export const DEFAULT_THRESHOLDS: ThresholdConfig[] = [
  {
    metric: 'cpu_usage',
    warning: 70,
    error: 85,
    critical: 95,
    unit: '%',
  },
  {
    metric: 'memory_usage',
    warning: 75,
    error: 85,
    critical: 95,
    unit: '%',
  },
  {
    metric: 'response_time',
    warning: 200,
    error: 500,
    critical: 1000,
    unit: 'ms',
  },
  {
    metric: 'error_rate',
    warning: 1,
    error: 5,
    critical: 10,
    unit: '%',
  },
  {
    metric: 'disk_usage',
    warning: 80,
    error: 90,
    critical: 95,
    unit: '%',
  },
];

// ============================================================================
// OPTIMIZATION CONFIGURATION
// ============================================================================

export const OPTIMIZATION_CONFIG: Record<OptimizationType, {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
}> = {
  caching: {
    name: 'Cache',
    description: 'Activer ou optimiser le cache',
    priority: 'high',
    autoApplicable: true,
  },
  lazy_loading: {
    name: 'Lazy Loading',
    description: 'Charger les ressources à la demande',
    priority: 'medium',
    autoApplicable: true,
  },
  batching: {
    name: 'Batching',
    description: 'Regrouper les opérations',
    priority: 'medium',
    autoApplicable: true,
  },
  compression: {
    name: 'Compression',
    description: 'Compresser les données',
    priority: 'low',
    autoApplicable: true,
  },
  parallelization: {
    name: 'Parallélisation',
    description: 'Exécuter en parallèle',
    priority: 'high',
    autoApplicable: false,
  },
  resource_cleanup: {
    name: 'Nettoyage ressources',
    description: 'Libérer les ressources inutilisées',
    priority: 'medium',
    autoApplicable: true,
  },
  code_splitting: {
    name: 'Code Splitting',
    description: 'Diviser le code en chunks',
    priority: 'low',
    autoApplicable: false,
  },
};

// ============================================================================
// MONITORING CONFIGURATION
// ============================================================================

export const MONITORING_CONFIG = {
  // Intervalles de collecte
  intervals: {
    metrics: 5000, // 5s
    healthCheck: 30000, // 30s
    cleanup: 60000, // 1 min
    reporting: 300000, // 5 min
  },

  // Rétention des données
  retention: {
    metricsMaxAge: 24 * 60 * 60 * 1000, // 24h
    metricsMaxCount: 10000,
    alertsMaxCount: 1000,
    suggestionsMaxCount: 100,
  },

  // Alertes
  alerts: {
    enabled: true,
    cooldownMs: 60000, // 1 min entre alertes similaires
    maxActive: 50,
    autoAcknowledgeAfterMs: 3600000, // 1h
  },

  // Profiling
  profiling: {
    enabled: true,
    sampleRate: 0.1, // 10% des requêtes
    maxSpans: 1000,
    maxSessionDurationMs: 300000, // 5 min
  },
} as const;

// ============================================================================
// BUDGET CONFIGURATION
// ============================================================================

export const BUDGET_CONFIG = {
  // Limites par défaut
  defaults: {
    maxLatencyMs: 500,
    maxMemoryMB: 512,
    maxCpuPercent: 80,
  },

  // Alertes de budget
  alerts: {
    warningThreshold: 0.8, // 80% du budget
    errorThreshold: 0.95, // 95% du budget
  },

  // Fenêtres de calcul
  windows: {
    shortTermMs: 60000, // 1 min
    mediumTermMs: 300000, // 5 min
    longTermMs: 3600000, // 1h
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export const performanceEngineConfig = {
  metrics: METRIC_CONFIG,
  thresholds: DEFAULT_THRESHOLDS,
  optimizations: OPTIMIZATION_CONFIG,
  monitoring: MONITORING_CONFIG,
  budgets: BUDGET_CONFIG,
};

export default performanceEngineConfig;
