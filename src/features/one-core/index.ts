/**
 * TITANE∞ ONE CORE v∞ — Module Exports (OPUS #6)
 */

// Page principale
export { OneCorePage, default } from './OneCorePage';

// Hook
export { useOneCore } from './useOneCore';

// Types
export type {
  OneCoreState,
  EngineStatus,
  CenterStatus,
  OneCoreCommand,
  OneCoreActionResult,
  OneCoreDiagnostic,
  OneCoreMetrics,
  OneCoreTabs,
} from './types';

export { ONE_CORE_TABS, CONSCIOUSNESS_LEVELS, SYSTEM_MODES } from './types';
