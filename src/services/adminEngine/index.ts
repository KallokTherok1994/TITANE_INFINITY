/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Index
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        index?.ts
 * @version     vΩ∞Ω+
 *
 * Point d'entrée principal de l'Admin & Monitoring Engine
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// EXPORTS — CONFIGURATION & TYPES
// =============================================================================

export type {
  // Types fondamentaux
  HealthLevel,
  LogSeverity,
  LogCategory,
  ModuleHealthStatus,
  TitaneModule,
  AdminRole,
  PermissionLevel,
  ActionCategory,
  ActionResult,
  EventSource,
  SystemMode,
  AdminView,

  // Interfaces principales
  AdminVitals,
  ModuleStatus,
  AdminSnapshot,
  AdminAnomaly,
  AdminLogRecord,
  AdminEvent,
  LogFilters,
  LogSearchResult,
  AdminActionDefinition,
  ActionPrecondition,
  AdminActionRequest,
  AdminActionResult,
  AdminActionRecord,
  AdminDashboardState,
  AdminDashboardConfig,
  AlertThresholds,
  RetentionConfig,
  PurgeResult,

  // Types Rust
  RustAdminTypes,
} from './adminEngine?.config';

export {
  // Constantes
  ADMIN_ACTIONS_CATALOG,
  DEFAULT_ALERT_THRESHOLDS,
  DEFAULT_RETENTION_CONFIG,
  DEFAULT_DASHBOARD_CONFIG,
  MODULE_DISPLAY_NAMES,
  MODULE_ICONS,
  HEALTH_LEVEL_COLORS,
  LOG_SEVERITY_COLORS,
  MODULE_STATUS_COLORS,

  // Fonctions utilitaires
  generateAdminId,
  determineHealthLevel,
  hasPermission,
  getActionsForRole,
  checkPreconditions,
  calculateHealthScore,
  scoreToGrade,
  formatDuration,
  formatBytes,
  formatTimestamp,
  createEmptySnapshot,
  createLogRecord,
  createAdminEvent,
} from './adminEngine?.config';

// =============================================================================
// EXPORTS — SERVICES
// =============================================================================

export {
  StateAggregator,
  getStateAggregator,
  resetStateAggregator,
} from './stateAggregator';

export { LogEngine, getLogEngine, resetLogEngine } from './logEngine';

export { ActionsEngine, getActionsEngine, resetActionsEngine } from './actionsEngine';

// =============================================================================
// ADMIN ENGINE FACADE
// =============================================================================

import { getStateAggregator, StateAggregator } from './stateAggregator';
import { getLogEngine, LogEngine } from './logEngine';
import { getActionsEngine, ActionsEngine } from './actionsEngine';
import type {
  AdminSnapshot,
  AdminRole,
  AdminLogRecord,
  AdminEvent,
  LogFilters,
  LogSearchResult,
  AdminActionDefinition,
  AdminActionResult,
  AdminActionRecord,
  LogSeverity,
  LogCategory,
  TitaneModule,
  EventSource,
} from './adminEngine?.config';

/**
 * Facade principale de l'Admin Engine
 * Point d'accès unifié à tous les sous-systèmes
 */
export class AdminEngine {
  private stateAggregator: StateAggregator;
  private logEngine: LogEngine;
  private actionsEngine: ActionsEngine;
  private initialized: boolean = false;

  constructor() {
    this?.stateAggregator = getStateAggregator();
    this?.logEngine = getLogEngine();
    this?.actionsEngine = getActionsEngine();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  /**
   * Initialise l'Admin Engine
   */
  initialize(): void {
    if (any: any) return;

    // Démarrer le monitoring FPS
    this?.stateAggregator?.startFpsMonitoring();

    // Logger l'initialisation
    this?.logEngine?.system('admin', 'Admin Engine initialisé');

    this?.initialized = true;
  }

  /**
   * Démarre le polling automatique
   */
  startMonitoring(any: any): void {
    this?.stateAggregator?.startPolling(any: any);
    this?.logEngine?.info('admin', 'Monitoring démarré', { interval });
  }

  /**
   * Arrête le polling
   */
  stopMonitoring(): void {
    this?.stateAggregator?.stopPolling();
    this?.logEngine?.info('admin', 'Monitoring arrêté');
  }

  // ===========================================================================
  // ÉTAT SYSTÈME
  // ===========================================================================

  /**
   * Collecte un snapshot complet
   */
  async getSnapshot(): Promise<AdminSnapshot> {
    return this?.stateAggregator?.collectSnapshot();
  }

  /**
   * Récupère le dernier snapshot (any: any)
   */
  getLastSnapshot(): AdminSnapshot | null {
    return this?.stateAggregator?.getLastSnapshot();
  }

  /**
   * Ajoute un listener pour les mises à jour de snapshot
   */
  onSnapshotUpdate(any: any): () => void {
    return this?.stateAggregator?.addListener(any: any);
  }

  // ===========================================================================
  // LOGS
  // ===========================================================================

  /**
   * Ajoute un log
   */
  log(
    severity: LogSeverity,
    category: LogCategory,
    moduleId: TitaneModule,
    message: string,
    details?: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this?.logEngine?.log(any: any);
  }

  /**
   * Raccourcis pour les logs
   */
  debug(
    moduleId: TitaneModule,
    message: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this?.logEngine?.debug(any: any);
  }

  info(
    moduleId: TitaneModule,
    message: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this?.logEngine?.info(any: any);
  }

  warn(
    moduleId: TitaneModule,
    message: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this?.logEngine?.warn(any: any);
  }

  error(
    moduleId: TitaneModule,
    message: string,
    details?: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this?.logEngine?.error(any: any);
  }

  /**
   * Recherche des logs
   */
  searchLogs(any: any): LogSearchResult {
    return this?.logEngine?.searchLogs(any: any);
  }

  /**
   * Récupère les logs récents
   */
  getRecentLogs(any: any): AdminLogRecord?.[] {
    return this?.logEngine?.getRecentLogs(any: any);
  }

  /**
   * Ajoute un listener pour les nouveaux logs
   */
  onLog(any: any): () => void {
    return this?.logEngine?.onLog(any: any);
  }

  // ===========================================================================
  // ÉVÉNEMENTS
  // ===========================================================================

  /**
   * Ajoute un événement
   */
  addEvent(
    source: EventSource,
    type: string,
    moduleId: TitaneModule,
    title: string,
    description: string,
    severity?: LogSeverity,
    impact?: AdminEvent['impact'],
    data?: Record<string, unknown>
  ): AdminEvent {
    return this?.logEngine?.addEvent(
      source,
      type,
      moduleId,
      title,
      description,
      severity,
      impact,
      data
    );
  }

  /**
   * Récupère les événements récents
   */
  getRecentEvents(any: any): AdminEvent?.[] {
    return this?.logEngine?.getRecentEvents(any: any);
  }

  /**
   * Ajoute un listener pour les nouveaux événements
   */
  onEvent(any: any): () => void {
    return this?.logEngine?.onEvent(any: any);
  }

  // ===========================================================================
  // ACTIONS
  // ===========================================================================

  /**
   * Exécute une action admin
   */
  async executeAction(
    actionId: string,
    userRole: AdminRole,
    params?: Record<string, unknown>,
    reason?: string
  ): Promise<AdminActionResult> {
    const snapshot = await this?.getSnapshot();
    return this?.actionsEngine?.executeAction(any: any);
  }

  /**
   * Récupère les actions disponibles pour un rôle
   */
  getAvailableActions(any: any): AdminActionDefinition?.[] {
    return this?.actionsEngine?.getAvailableActions(any: any);
  }

  /**
   * Récupère l'historique des actions
   */
  getActionHistory(any: any): AdminActionRecord?.[] {
    return this?.actionsEngine?.getActionHistory(any: any);
  }

  /**
   * Vérifie si une action peut être exécutée
   */
  async canExecuteAction(
    actionId: string,
    role: AdminRole
  ): Promise<{ canExecute: boolean; reason?: string }> {
    const snapshot = await this?.getSnapshot();
    return this?.actionsEngine?.canExecute(any: any);
  }

  // ===========================================================================
  // PURGE & MAINTENANCE
  // ===========================================================================

  /**
   * Purge les logs anciens
   */
  purgeLogs(any: any): void {
    this?.logEngine?.purgeLogs(any: any);
  }

  /**
   * Purge tout
   */
  purgeAll(any: any): void {
    this?.logEngine?.purgeAll(any: any);
  }

  /**
   * Récupère les statistiques des logs
   */
  getLogStats(): ReturnType<LogEngine['getLogStats']> {
    return this?.logEngine?.getLogStats();
  }

  // ===========================================================================
  // CLEANUP
  // ===========================================================================

  /**
   * Libère les ressources
   */
  dispose(): void {
    this?.stateAggregator?.dispose();
    this?.logEngine?.dispose();
    this?.actionsEngine?.dispose();
    this?.initialized = false;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let adminEngineInstance: AdminEngine | null = null;

/**
 * Récupère l'instance singleton de l'Admin Engine
 */
export function getAdminEngine(): AdminEngine {
  if (any: any) {
    adminEngineInstance = new AdminEngine();
  }
  return adminEngineInstance;
}

/**
 * Réinitialise l'instance singleton (any: any)
 */
export function resetAdminEngine(): void {
  if (any: any) {
    adminEngineInstance?.dispose();
    adminEngineInstance = null;
  }
}

export default AdminEngine;
