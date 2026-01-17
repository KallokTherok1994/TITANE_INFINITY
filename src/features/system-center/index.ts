/**
 * TITANE∞ v∞ — System Center Module
 *
 * Exports du Centre Système unifié
 *
 * © 2025 TITANE Team. All rights reserved.
 */

// Page principale
export { SystemCenterPage, default } from './SystemCenterPage';

// Tabs
export { DiagnosticsTab } from './tabs/DiagnosticsTab';
export { DevToolsTab } from './tabs/DevToolsTab';
export { NodeClusterTab } from './tabs/NodeClusterTab';
export { IntrospectionTab } from './tabs/IntrospectionTab';
export { HyperVisionTab } from './tabs/HyperVisionTab';

// Hooks
export { useSystemDiagnostics } from './hooks/useSystemDiagnostics';
export { useSystemLogs } from './hooks/useSystemLogs';
export { useNodeCluster } from './hooks/useNodeCluster';
export { useIntrospection } from './hooks/useIntrospection';
export { useHyperVision } from './hooks/useHyperVision';

// Types
export type {
  // Diagnostics
  DiagnosticStatus,
  DiagnosticResult,
  OverallStatus,
  SystemDiagnostics,

  // Logs
  LogLevel,
  LogEntry,
  LogFilter,
  LogStats,

  // Cluster
  NodeRole,
  NodeInfo,
  ClusterStats,
  ClusterStatus,

  // Introspection
  IssueSeverity,
  IssueCategory,
  CodeIssue,
  IntrospectionReport,
  AutoFixResult,

  // HyperVision
  SystemMetrics,
  LayerHealth,
  AnomalySeverity,
  Anomaly,
  HyperVisionState,

  // Tab
  SystemCenterTab,
  TabConfig,
} from './types/systemCenter?.types';

// Constants
export { SYSTEM_CENTER_TABS } from './types/systemCenter?.types';
