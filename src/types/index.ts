// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Global Types Export
// ═══════════════════════════════════════════════════════════════

// Export all types - duplicates resolved by module priority order
// Priority: system > devtools > devops > automationXP > singularityState
export * from './audio';
export * from './ai';
export * from './logger';
export * from './conversation'; // 🆕 P1: Multi-conversations types
export * from './providerMeta';
export * from './research'; // P1: WebResearch Engine types (EXPERIMENTAL)

// Conversation OS v1 types (Ring 1) — explicit export to avoid collisions
export type {
  NetState,
  FailureClass,
  PolicyVerdict,
  RouterDecision,
  ToolDecisionMeta,
  TraceFrame,
} from './conversation_os';
export type {
  ProviderDecisionMeta as ConversationOsProviderDecisionMeta,
  Citation as ConversationOsCitation,
} from './conversation_os';
export { isOnlineCapable, isPolicyBlock, isRetriableFailure } from './conversation_os';

// System exports (LogEntry, MemoryState prioritaires)
export * from './system';

// DevTools exports (SystemEvent, DataPoint, MemoryNode prioritaires)
export type { CoreHealth, Engine, SystemEvent, DataPoint, MemoryNode } from './devtools';

// DevOps exports (skip duplicates)
export type { DeploymentConfig } from './devops';

// AutomationXP exports (skip SystemEvent -> from devtools)
export type { AutomationEvent } from './automationXP';

// SingularityState exports (skip MemoryState -> from system)
export type { SingularityState, DevOpsLayer } from './singularityState';

// PerformanceEngine exports (skip DataPoint -> from devtools)
export * from './performanceEngine';
