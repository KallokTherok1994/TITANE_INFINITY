/**
 * TITANE∞ — Module Context Registry Types
 * Canonical snapshot contract for chat ↔ module context binding.
 *
 * Every major page/module must expose a governed context snapshot
 * the chat can consume. No DOM scraping. No secrets. Bounded size.
 */

export type ModuleStatus =
  | 'live'
  | 'partial'
  | 'degraded'
  | 'display_only'
  | 'simulated'
  | 'curated'
  | 'unknown';

export type ModuleDataSource =
  | 'tauri_ipc'
  | 'tauri_invoke'
  | 'remote'
  | 'local_cache'
  | 'static_curated'
  | 'unknown';

export type ModuleActionStatus = 'wired' | 'disabled' | 'blocked' | 'unknown';

export interface ModuleAction {
  id: string;
  label: string;
  status: ModuleActionStatus;
  /** Tauri command or service method */
  command?: string;
  /** Why disabled/blocked if not wired */
  reason?: string;
}

export interface ModuleContextSnapshot {
  /** Unique module identifier (e.g. "titane.chat", "time.cognitive") */
  moduleId: string;
  /** Current app route */
  route: string;
  /** Human-readable title */
  title: string;
  /** Truth status of this module's data */
  status: ModuleStatus;
  /** ISO timestamp of last snapshot update */
  lastUpdated: string;
  /** Age in ms of this snapshot */
  freshnessMs: number;
  /** Primary data source */
  source: ModuleDataSource;
  /** What this module can do */
  capabilities: string[];
  /** Current visible metrics — prompt-safe, no secrets */
  visibleMetrics: Record<string, string | number | boolean | null>;
  /** Actions available from this module */
  actions: ModuleAction[];
  /** Memory keys this module reads/writes */
  memoryRefs?: string[];
  /** Curated-data sections present (if any) */
  curatedSections?: string[];
  /** Active warnings or degradation reasons */
  warnings: string[];
}

export type ModuleId =
  | 'titane.dashboard'
  | 'titane.chat'
  | 'titane.memory'
  | 'titane.progression'
  | 'titane.evolution'
  | 'time.now'
  | 'time.agenda'
  | 'time.temporal_memory'
  | 'time.timeline'
  | 'time.cognitive_engine'
  | 'time.snapshots'
  | 'time.twin_health'
  | 'twin.main'
  | 'providers'
  | 'internet.research'
  | 'memory.stm'
  | 'memory.mtm'
  | 'memory.ltm';
