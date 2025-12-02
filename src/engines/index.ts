/**
 * TITANE∞ v∞ — Engines Index
 * Export centralisé de tous les moteurs frontend
 * Architecture: 14 engines modulaires
 *
 * Note: Certains exports sont sélectifs pour éviter les conflits de noms
 */

// Core Engines
export * from './selfHealing';
export * from './flow';

// Time/Agenda System (sélectif - évite conflit avec rhythm)
export {
  TimeEngine,
  timeEngine,
  TimeEngineUtils,
  AgendaEngine,
  agendaEngine,
  AgendaEngineUtils,
  EnergyEngine,
  energyEngine,
  EnergyEngineUtils,
  PriorityEngine,
  priorityEngine,
  PriorityEngineUtils,
  ChatScheduler,
  chatScheduler,
  ChatSchedulerUtils,
  initTimeAgendaSystem,
} from './time';

export type { CommandExecutionResult } from './time';

// Knowledge Engine
export * from './knowledge';

// Multimodal Fusion Engine
export * from './multimodal';

// Presence Engine
export * from './presence';

// Reflection Engine
export * from './reflection';

// Resonance Engine
export * from './resonance';

// Human Rhythm Engine (contient Chronotype, EnergyHistoryEntry)
export * from './rhythm';

// Stress Engine
export * from './stress';

// Training Engine
export * from './training';

// Vision Engine
export * from './vision';

// Predictive Engine
export * from './predictive';
