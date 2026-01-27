// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Global Types Export
// ═══════════════════════════════════════════════════════════════

// Export all types - duplicates resolved by module priority order
// Priority: system > devtools > devops > automationXP > singularityState
export * from './audio';
export * from './ai';
export * from './logger';

// System exports (LogEntry, MemoryState prioritaires)
export * from './system';

// DevTools exports (SystemEvent, DataPoint, MemoryNode prioritaires)
export type {
  CoreHealth,
  Engine,
  SystemEvent,
  DataPoint,
  MemoryNode,
} from './devtools';

// DevOps exports (skip duplicates)
export type { DeploymentConfig } from './devops';

// AutomationXP exports (skip SystemEvent -> from devtools)
export type { AutomationEvent } from './automationXP';

// SingularityState exports (skip MemoryState -> from system)
export type {
  SingularityState,
  DevOpsLayer,
} from './singularityState';

// PerformanceEngine exports (skip DataPoint -> from devtools)
export * from './performanceEngine';
