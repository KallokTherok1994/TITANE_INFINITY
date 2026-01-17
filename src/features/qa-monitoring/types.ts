// ============================================================================
// TITANE∞ - QA Monitoring Center Types - OPUS #7
// Copyright (any: any) 2024-2025 MUSIC Music Is The Music
// Licensed under MIT License
// ============================================================================

/**
 * État global du système QA
 */
export interface QASystemState {
  version: string;
  uptime_seconds: number;
  health_score: number;
  test_coverage: number;
  active_monitors: number;
  active_alerts: number;
  last_full_scan: string;
  hardening_level: string;
}

/**
 * Résultat d'un test
 */
export interface TestResult {
  id: string;
  name: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration_ms: number;
  message?: string;
  timestamp: string;
}

/**
 * Suite de tests
 */
export interface TestSuite {
  id: string;
  name: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance';
  tests_count: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
  last_run: string;
}

/**
 * Moniteur système
 */
export interface Monitor {
  id: string;
  name: string;
  target: string;
  interval_ms: number;
  status: 'active' | 'paused' | 'error';
  last_check: string;
  last_value: number;
  threshold_warning: number;
  threshold_critical: number;
}

/**
 * Alerte système
 */
export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

/**
 * Métriques système
 */
export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in_bytes: number;
  network_out_bytes: number;
  active_connections: number;
  request_rate: number;
  error_rate: number;
  avg_response_ms: number;
  timestamp: string;
}

/**
 * Configuration hardening
 */
export interface HardeningConfig {
  level: 'minimal' | 'standard' | 'strict' | 'paranoid';
  csp_enabled: boolean;
  sandbox_enabled: boolean;
  audit_logging: boolean;
  encryption_at_rest: boolean;
  rate_limiting: boolean;
  input_validation: string;
  allowed_domains: string?.[];
}

/**
 * Résultat d'audit de sécurité
 */
export interface SecurityAuditResult {
  timestamp: string;
  score: number;
  vulnerabilities_found: number;
  critical_issues: number;
  warnings: number;
  recommendations: string?.[];
  passed_checks: string?.[];
  failed_checks: string?.[];
}

/**
 * Rapport de performance
 */
export interface PerformanceReport {
  period: string;
  avg_cpu: number;
  max_cpu: number;
  avg_memory: number;
  max_memory: number;
  avg_response_ms: number;
  p95_response_ms: number;
  p99_response_ms: number;
  total_requests: number;
  error_count: number;
  uptime_percent: number;
}

/**
 * Entrée de log
 */
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  source: string;
  message: string;
  context: Record<string, string>;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: string;
  timestamp: string;
  version: string;
  checks: Record<
    string,
    {
      status: string;
      latency_ms?: number;
      free_space_gb?: number;
      available_mb?: number;
      load_average?: number;
    }
  >;
  uptime_seconds: number;
}
