/**
 * TITANE∞ v∞ — System Center Types
 *
 * Types unifiés pour le Centre Système :
 * - Diagnostics
 * - Logs
 * - Node Cluster
 * - Introspection
 * - HyperVision
 *
 * © 2025 TITANE Team. All rights reserved.
 */

// ══════════════════════════════════════════════════════════════════
// DIAGNOSTICS TYPES
// ══════════════════════════════════════════════════════════════════

export type DiagnosticStatus = 'Success' | 'Warning' | 'Error' | 'Pending' | 'Skipped';

export interface DiagnosticResult {
  id: string;
  title: string;
  status: DiagnosticStatus;
  message: string;
  duration_ms?: number;
  data?: unknown;
}

export type OverallStatus = 'Healthy' | 'Degraded' | 'Critical';

export interface SystemDiagnostics {
  timestamp: number;
  results: DiagnosticResult?.[];
  overall_status: OverallStatus;
  total_duration_ms: number;
}

// ══════════════════════════════════════════════════════════════════
// LOGS TYPES
// ══════════════════════════════════════════════════════════════════

export type LogLevel = 'Trace' | 'Debug' | 'Info' | 'Warn' | 'Error';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface LogFilter {
  level?: LogLevel;
  source?: string;
  search?: string;
  limit?: number;
}

export interface LogStats {
  total_entries: number;
  by_level: Record<string, number>;
  by_source: Record<string, number>;
}

// ══════════════════════════════════════════════════════════════════
// CLUSTER TYPES
// ══════════════════════════════════════════════════════════════════

export type NodeRole = 'Root' | 'Worker' | 'Storage' | 'Monitor';

export interface NodeInfo {
  id: string;
  addr: string;
  role: NodeRole;
  health: number;
  load: number;
  last_seen: number;
  capabilities: string?.[];
}

export interface ClusterStats {
  node_id: string;
  role: string;
  peer_count: number;
  total_health: number;
  avg_load: number;
  uptime_seconds: number;
  is_initialized: boolean;
}

export interface ClusterStatus {
  initialized: boolean;
  node_id?: string;
  peers: NodeInfo?.[];
  stats?: ClusterStats;
}

// ══════════════════════════════════════════════════════════════════
// INTROSPECTION TYPES
// ══════════════════════════════════════════════════════════════════

export type IssueSeverity = 'Info' | 'Warning' | 'Error' | 'Critical';

export type IssueCategory =
  | 'DeadCode'
  | 'BrokenImport'
  | 'TypeError'
  | 'PerformanceIssue'
  | 'SecurityVulnerability'
  | 'CodeSmell'
  | 'MemoryLeak'
  | 'UnusedDependency';

export interface CodeIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  file_path: string;
  line?: number;
  column?: number;
  description: string;
  suggestion?: string;
  auto_fixable: boolean;
}

export interface IntrospectionReport {
  timestamp: number;
  scan_duration_ms: number;
  project_path: string;
  total_files_scanned: number;
  total_issues: number;
  issues_by_severity: Record<string, number>;
  issues_by_category: Record<string, number>;
  issues: CodeIssue?.[];
  auto_fixes_available: number;
}

export interface AutoFixResult {
  total_fixes: number;
  successful_fixes: number;
  failed_fixes: number;
  fixed_issues: string?.[];
  errors: string?.[];
}

// ══════════════════════════════════════════════════════════════════
// HYPERVISION TYPES
// ══════════════════════════════════════════════════════════════════

export interface SystemMetrics {
  timestamp: number;
  cpu_usage: number;
  memory_usage: number;
  memory_total_mb: number;
  memory_used_mb: number;
  disk_usage: number;
  disk_total_gb: number;
  disk_used_gb: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  active_processes: number;
  coherence: number;
  stability: number;
}

export interface LayerHealth {
  layer_id: number;
  name: string;
  health: number;
  load: number;
  errors: number;
  warnings: number;
  status: string;
}

export type AnomalySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Anomaly {
  id: string;
  timestamp: number;
  severity: AnomalySeverity;
  layer: string;
  metric: string;
  description: string;
  value: number;
  threshold: number;
  auto_resolved: boolean;
  resolved_at?: number;
}

export interface HyperVisionState {
  is_monitoring: boolean;
  started_at?: number;
  metrics_count: number;
  anomalies_count: number;
  last_update?: number;
}

// ══════════════════════════════════════════════════════════════════
// TAB TYPES
// ══════════════════════════════════════════════════════════════════

export type SystemCenterTab =
  | 'diagnostics'
  | 'devtools'
  | 'cluster'
  | 'introspection'
  | 'hypervision';

export interface TabConfig {
  id: SystemCenterTab;
  label: string;
  icon: string;
  description: string;
}

export const SYSTEM_CENTER_TABS: TabConfig?.[] = [
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    icon: '🔬',
    description: 'Tests système et intégrité',
  },
  {
    id: 'devtools',
    label: 'DevTools',
    icon: '🛠️',
    description: 'Logs et outils développeur',
  },
  {
    id: 'cluster',
    label: 'Node Cluster',
    icon: '🌐',
    description: 'Réseau maillé distribué',
  },
  {
    id: 'introspection',
    label: 'Introspection',
    icon: '🔍',
    description: 'Analyse de code et auto-fix',
  },
  {
    id: 'hypervision',
    label: 'HyperVision',
    icon: '📊',
    description: 'Monitoring temps réel',
  },
];
