/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * CoherenceEngine - Public API
 * FUSION: Moteur #2 (Cohérence) + Nexus Engine (Coordination)
 */

// Main engine export
export { coherenceEngine } from './CoherenceEngine';
export type { CoherenceEngine } from './CoherenceEngine';

// Types
export type {
  // System State
  SystemState,
  EngineState,
  ProviderState,
  MemoryState,
  EngineMetrics,

  // Validation
  ValidationResult,
  ValidationIssue,
  CoherenceContext,
  CoherenceConstraint,

  // Tasks
  Task,
  TaskType,
  PrioritizedTasks,
  CoordinationResult,
  Conflict,

  // Registry
  Engine,
  Service,

  // Events
  EventType,
  SystemEvent,
  EventHandler,

  // Messages
  Message,
  MessageHandler,
} from './types';

// Sub-components (for advanced usage)
export { EventBus } from './bus/EventBus';
export { MessageBus } from './bus/MessageBus';
export { EngineRegistry } from './registry/EngineRegistry';
export { ServiceRegistry } from './registry/ServiceRegistry';
export { CoherenceValidator } from './validation/coherenceValidator';
export { TaskPrioritizer } from './coordination/taskPrioritizer';
export { EngineCoordinator } from './coordination/engineCoordinator';
