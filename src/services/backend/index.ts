/**
 * TITANE_INFINITY v19.5.3 - Backend Service Index
 *
 * Point d'entrée unifié pour tous les services backend
 */

export { BackendClient, default } from './BackendClient';

// Re-export individual functions for tree-shaking
export {
  // System
  checkSqliteAvailable,
  getSystemStatus,
  getHeliosMetrics,
  isBackendAvailable,

  // Vector Store
  vectorStoreInit,
  vectorStoreInsert,
  vectorSearch,
  vectorStoreGet,
  vectorStoreUpdate,
  vectorStoreDelete,
  vectorStoreGetStats,

  // Heal Engine
  runSelfHeal,
  getSelfHealData,

  // AI Engine
  iaQuery,
  iaCheckProvider,
  iaListModels,

  // Orchestrator
  orchestrate,
  setOrchestratorMode,

  // File System
  readTextFile,
  writeTextFile,
  fileExists,
  listDirectory,

  // Settings
  getSettings,
  updateSettings,
  resetSettings,

  // Diagnostics
  runDiagnostics,
  getWatchdogLogs,

  // Memory
  memorySaveEntry,
  memoryLoadEntries,
  memoryClear,
  memoryCompact,

  // Cognitive
  getNexusGraph,
  getSentinelAlerts,
  getHarmoniaFlows,

  // Utilities
  invokeWithRetry,
} from './BackendClient';

// Re-export types
export type {
  VectorStoreConfig,
  VectorEntry,
  SearchResult,
  SearchOptions,
  VectorStoreStats,
  HealReport,
  HealIssue,
  IARequest,
  IAResponse,
  IAProvider,
  OrchestratorRequest,
  OrchestratorResponse,
  OrchestratorMode,
  OrchestratorAction,
  SystemStatus,
  SystemHealth,
  HeliosMetrics,
  CognitiveState,
  NexusGraph,
  NexusNode,
  NexusEdge,
  AppSettings,
  IASettings,
  DiagnosticReport,
  DiagnosticCheck,
  FileReadResult,
  FileWriteResult,
  AuditEvent,
  AuditEventType,
  ValidationResult,
  ValidationError,
  MemoryTier,
  MemoryType,
  CommandResult,
} from '@/types/backend.d';
