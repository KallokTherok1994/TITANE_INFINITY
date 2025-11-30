/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Index
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        index.ts
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
} from './adminEngine.config';

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
} from './adminEngine.config';

// =============================================================================
// EXPORTS — SERVICES
// =============================================================================

export {
  StateAggregator,
  getStateAggregator,
  resetStateAggregator,
} from './stateAggregator';

export {
  LogEngine,
  getLogEngine,
  resetLogEngine,
} from './logEngine';

export {
  ActionsEngine,
  getActionsEngine,
  resetActionsEngine,
} from './actionsEngine';

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
} from './adminEngine.config';

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
    this.stateAggregator = getStateAggregator();
    this.logEngine = getLogEngine();
    this.actionsEngine = getActionsEngine();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  /**
   * Initialise l'Admin Engine
   */
  initialize(): void {
    if (this.initialized) return;

    // Démarrer le monitoring FPS
    this.stateAggregator.startFpsMonitoring();

    // Logger l'initialisation
    this.logEngine.system('admin', 'Admin Engine initialisé');

    this.initialized = true;
  }

  /**
   * Démarre le polling automatique
   */
  startMonitoring(interval?: number): void {
    this.stateAggregator.startPolling(interval);
    this.logEngine.info('admin', 'Monitoring démarré', { interval });
  }

  /**
   * Arrête le polling
   */
  stopMonitoring(): void {
    this.stateAggregator.stopPolling();
    this.logEngine.info('admin', 'Monitoring arrêté');
  }

  // ===========================================================================
  // ÉTAT SYSTÈME
  // ===========================================================================

  /**
   * Collecte un snapshot complet
   */
  async getSnapshot(): Promise<AdminSnapshot> {
    return this.stateAggregator.collectSnapshot();
  }

  /**
   * Récupère le dernier snapshot (depuis cache)
   */
  getLastSnapshot(): AdminSnapshot | null {
    return this.stateAggregator.getLastSnapshot();
  }

  /**
   * Ajoute un listener pour les mises à jour de snapshot
   */
  onSnapshotUpdate(callback: (snapshot: AdminSnapshot) => void): () => void {
    return this.stateAggregator.addListener(callback);
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
    return this.logEngine.log(severity, category, moduleId, message, details, context);
  }

  /**
   * Raccourcis pour les logs
   */
  debug(moduleId: TitaneModule, message: string, context?: Record<string, unknown>): AdminLogRecord {
    return this.logEngine.debug(moduleId, message, context);
  }

  info(moduleId: TitaneModule, message: string, context?: Record<string, unknown>): AdminLogRecord {
    return this.logEngine.info(moduleId, message, context);
  }

  warn(moduleId: TitaneModule, message: string, context?: Record<string, unknown>): AdminLogRecord {
    return this.logEngine.warn(moduleId, message, context);
  }

  error(
    moduleId: TitaneModule,
    message: string,
    details?: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this.logEngine.error(moduleId, message, details, context);
  }

  /**
   * Recherche des logs
   */
  searchLogs(filters: LogFilters): LogSearchResult {
    return this.logEngine.searchLogs(filters);
  }

  /**
   * Récupère les logs récents
   */
  getRecentLogs(count?: number): AdminLogRecord[] {
    return this.logEngine.getRecentLogs(count);
  }

  /**
   * Ajoute un listener pour les nouveaux logs
   */
  onLog(callback: (log: AdminLogRecord) => void): () => void {
    return this.logEngine.onLog(callback);
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
    return this.logEngine.addEvent(source, type, moduleId, title, description, severity, impact, data);
  }

  /**
   * Récupère les événements récents
   */
  getRecentEvents(count?: number): AdminEvent[] {
    return this.logEngine.getRecentEvents(count);
  }

  /**
   * Ajoute un listener pour les nouveaux événements
   */
  onEvent(callback: (event: AdminEvent) => void): () => void {
    return this.logEngine.onEvent(callback);
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
    const snapshot = await this.getSnapshot();
    return this.actionsEngine.executeAction(actionId, userRole, snapshot, params, reason);
  }

  /**
   * Récupère les actions disponibles pour un rôle
   */
  getAvailableActions(role: AdminRole): AdminActionDefinition[] {
    return this.actionsEngine.getAvailableActions(role);
  }

  /**
   * Récupère l'historique des actions
   */
  getActionHistory(limit?: number): AdminActionRecord[] {
    return this.actionsEngine.getActionHistory(limit);
  }

  /**
   * Vérifie si une action peut être exécutée
   */
  async canExecuteAction(
    actionId: string,
    role: AdminRole
  ): Promise<{ canExecute: boolean; reason?: string }> {
    const snapshot = await this.getSnapshot();
    return this.actionsEngine.canExecute(actionId, role, snapshot);
  }

  // ===========================================================================
  // PURGE & MAINTENANCE
  // ===========================================================================

  /**
   * Purge les logs anciens
   */
  purgeLogs(olderThanDays?: number): void {
    this.logEngine.purgeLogs(olderThanDays);
  }

  /**
   * Purge tout
   */
  purgeAll(olderThanDays?: number): void {
    this.logEngine.purgeAll(olderThanDays);
  }

  /**
   * Récupère les statistiques des logs
   */
  getLogStats(): ReturnType<LogEngine['getLogStats']> {
    return this.logEngine.getLogStats();
  }

  // ===========================================================================
  // CLEANUP
  // ===========================================================================

  /**
   * Libère les ressources
   */
  dispose(): void {
    this.stateAggregator.dispose();
    this.logEngine.dispose();
    this.actionsEngine.dispose();
    this.initialized = false;
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
  if (!adminEngineInstance) {
    adminEngineInstance = new AdminEngine();
  }
  return adminEngineInstance;
}

/**
 * Réinitialise l'instance singleton (pour tests)
 */
export function resetAdminEngine(): void {
  if (adminEngineInstance) {
    adminEngineInstance.dispose();
    adminEngineInstance = null;
  }
}

export default AdminEngine;
