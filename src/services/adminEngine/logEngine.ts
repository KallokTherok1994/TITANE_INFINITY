/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Log Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        logEngine.ts
 * @version     vΩ∞Ω+
 *
 * Timeline unifiée, filtrage performant, recherche textuelle
 * Gestion des logs structurés multi-niveaux
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type {
  AdminLogRecord,
  AdminEvent,
  LogFilters,
  LogSearchResult,
  LogSeverity,
  LogCategory,
  TitaneModule,
  EventSource,
  RetentionConfig,
  PurgeResult,
} from './adminEngine.config';
import {
  createLogRecord,
  createAdminEvent,
  DEFAULT_RETENTION_CONFIG,
} from './adminEngine.config';

// =============================================================================
// LOG ENGINE CLASS
// =============================================================================

/**
 * Moteur de gestion des logs et événements
 * Timeline unifiée avec filtrage et recherche
 */
export class LogEngine {
  private logs: AdminLogRecord[] = [];
  private events: AdminEvent[] = [];
  private config: RetentionConfig;
  private listeners: Set<(log: AdminLogRecord) => void> = new Set();
  private eventListeners: Set<(event: AdminEvent) => void> = new Set();
  private purgeIntervalId: NodeJS.Timeout | null = null;

  constructor(config?: Partial<RetentionConfig>) {
    this.config = { ...DEFAULT_RETENTION_CONFIG, ...config };

    // Démarrer la purge automatique si activée
    if (this.config.autoPurgeEnabled) {
      this.startAutoPurge();
    }
  }

  // ===========================================================================
  // GESTION DES LOGS
  // ===========================================================================

  /**
   * Ajoute un nouveau log
   */
  log(
    severity: LogSeverity,
    category: LogCategory,
    moduleId: TitaneModule,
    message: string,
    details?: string,
    context: Record<string, unknown> = {},
    tags: string[] = []
  ): AdminLogRecord {
    const record = createLogRecord(severity, category, moduleId, message, details, context, tags);
    this.addLog(record);
    return record;
  }

  /**
   * Ajoute un log existant au buffer
   */
  addLog(record: AdminLogRecord): void {
    this.logs.push(record);

    // Vérifier la taille du buffer
    if (this.logs.length > this.config.maxLogBufferSize) {
      this.logs = this.logs.slice(-Math.floor(this.config.maxLogBufferSize * 0.9));
    }

    // Notifier les listeners
    this.notifyLogListeners(record);
  }

  /**
   * Raccourcis pour les niveaux de log courants
   */
  debug(moduleId: TitaneModule, message: string, context?: Record<string, unknown>): AdminLogRecord {
    return this.log('DEBUG', 'INFO', moduleId, message, undefined, context);
  }

  info(moduleId: TitaneModule, message: string, context?: Record<string, unknown>): AdminLogRecord {
    return this.log('INFO', 'INFO', moduleId, message, undefined, context);
  }

  warn(moduleId: TitaneModule, message: string, context?: Record<string, unknown>): AdminLogRecord {
    return this.log('WARN', 'WARN', moduleId, message, undefined, context);
  }

  error(
    moduleId: TitaneModule,
    message: string,
    details?: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this.log('ERROR', 'ERROR', moduleId, message, details, context);
  }

  critical(
    moduleId: TitaneModule,
    message: string,
    details?: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this.log('CRITICAL', 'ERROR', moduleId, message, details, context);
  }

  action(
    moduleId: TitaneModule,
    message: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this.log('INFO', 'ACTION', moduleId, message, undefined, context, ['action']);
  }

  system(
    moduleId: TitaneModule,
    message: string,
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this.log('INFO', 'SYSTEM', moduleId, message, undefined, context, ['system']);
  }

  security(
    moduleId: TitaneModule,
    message: string,
    severity: LogSeverity = 'WARN',
    context?: Record<string, unknown>
  ): AdminLogRecord {
    return this.log(severity, 'SECURITY', moduleId, message, undefined, context, ['security']);
  }

  // ===========================================================================
  // GESTION DES ÉVÉNEMENTS
  // ===========================================================================

  /**
   * Ajoute un nouvel événement
   */
  addEvent(
    source: EventSource,
    type: string,
    moduleId: TitaneModule,
    title: string,
    description: string,
    severity: LogSeverity = 'INFO',
    impact: AdminEvent['impact'] = 'NONE',
    data: Record<string, unknown> = {}
  ): AdminEvent {
    const event = createAdminEvent(source, type, moduleId, title, description, severity, impact, data);
    this.events.push(event);

    // Vérifier la taille du buffer
    if (this.events.length > this.config.maxEventBufferSize) {
      this.events = this.events.slice(-Math.floor(this.config.maxEventBufferSize * 0.9));
    }

    // Notifier les listeners
    this.notifyEventListeners(event);

    return event;
  }

  /**
   * Marque un événement comme résolu
   */
  resolveEvent(eventId: string): boolean {
    const event = this.events.find((e) => e.id === eventId);
    if (event) {
      event.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Lie des événements entre eux
   */
  linkEvents(eventId: string, relatedIds: string[]): void {
    const event = this.events.find((e) => e.id === eventId);
    if (event) {
      event.relatedEvents = [...new Set([...event.relatedEvents, ...relatedIds])];
    }
  }

  // ===========================================================================
  // RECHERCHE ET FILTRAGE
  // ===========================================================================

  /**
   * Recherche des logs avec filtres
   */
  searchLogs(filters: LogFilters): LogSearchResult {
    const startTime = performance.now();
    let results = [...this.logs];

    // Filtrer par période
    if (filters.startTime !== undefined) {
      const startTime = filters.startTime;
      results = results.filter((log) => log.timestamp >= startTime);
    }
    if (filters.endTime !== undefined) {
      const endTime = filters.endTime;
      results = results.filter((log) => log.timestamp <= endTime);
    }

    // Filtrer par modules
    if (filters.modules && filters.modules.length > 0) {
      const modules = filters.modules;
      results = results.filter((log) => modules.includes(log.moduleId));
    }

    // Filtrer par sévérités
    if (filters.severities && filters.severities.length > 0) {
      const severities = filters.severities;
      results = results.filter((log) => severities.includes(log.severity));
    }

    // Filtrer par catégories
    if (filters.categories && filters.categories.length > 0) {
      const categories = filters.categories;
      results = results.filter((log) => categories.includes(log.category));
    }

    // Filtrer par tags
    if (filters.tags && filters.tags.length > 0) {
      const tags = filters.tags;
      results = results.filter((log) => tags.some((tag) => log.tags.includes(tag)));
    }

    // Recherche textuelle
    if (filters.searchText && filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      results = results.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower) ||
          log.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Tri
    const sortOrder = filters.sortOrder || 'desc';
    results.sort((a, b) =>
      sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );

    // Total avant pagination
    const totalCount = results.length;

    // Pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    results = results.slice(offset, offset + limit);

    return {
      logs: results,
      totalCount,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      searchTimeMs: performance.now() - startTime,
    };
  }

  /**
   * Récupère les événements avec filtres basiques
   */
  getEvents(options: {
    limit?: number;
    moduleId?: TitaneModule;
    source?: EventSource;
    resolved?: boolean;
    since?: number;
  } = {}): AdminEvent[] {
    let results = [...this.events];

    if (options.moduleId) {
      results = results.filter((e) => e.moduleId === options.moduleId);
    }

    if (options.source) {
      results = results.filter((e) => e.source === options.source);
    }

    if (options.resolved !== undefined) {
      results = results.filter((e) => e.resolved === options.resolved);
    }

    if (options.since !== undefined) {
      const since = options.since;
      results = results.filter((e) => e.timestamp >= since);
    }

    // Trier par timestamp décroissant
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Limiter
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Récupère les logs récents
   */
  getRecentLogs(count: number = 100): AdminLogRecord[] {
    return this.logs.slice(-count).reverse();
  }

  /**
   * Récupère les événements récents
   */
  getRecentEvents(count: number = 50): AdminEvent[] {
    return this.events.slice(-count).reverse();
  }

  /**
   * Récupère les logs par corrélation ID
   */
  getLogsByCorrelation(correlationId: string): AdminLogRecord[] {
    return this.logs.filter((log) => log.correlationId === correlationId);
  }

  // ===========================================================================
  // STATISTIQUES
  // ===========================================================================

  /**
   * Récupère les statistiques des logs
   */
  getLogStats(): {
    total: number;
    bySeverity: Record<LogSeverity, number>;
    byCategory: Record<LogCategory, number>;
    byModule: Record<string, number>;
    last24h: number;
    lastHour: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const bySeverity: Record<LogSeverity, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      CRITICAL: 0,
    };

    const byCategory: Record<LogCategory, number> = {
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      ACTION: 0,
      SYSTEM: 0,
      SECURITY: 0,
      PERFORMANCE: 0,
    };

    const byModule: Record<string, number> = {};
    let last24h = 0;
    let lastHour = 0;

    for (const log of this.logs) {
      bySeverity[log.severity]++;
      byCategory[log.category]++;
      byModule[log.moduleId] = (byModule[log.moduleId] || 0) + 1;

      if (log.timestamp >= oneDayAgo) last24h++;
      if (log.timestamp >= oneHourAgo) lastHour++;
    }

    return {
      total: this.logs.length,
      bySeverity,
      byCategory,
      byModule,
      last24h,
      lastHour,
    };
  }

  // ===========================================================================
  // PURGE ET RÉTENTION
  // ===========================================================================

  /**
   * Purge les logs anciens
   */
  purgeLogs(olderThanDays?: number): PurgeResult {
    const days = olderThanDays ?? this.config.logsRetentionDays;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const originalCount = this.logs.length;
    const logsToKeep = this.logs.filter((log) => log.timestamp >= cutoffTime);
    const deletedCount = originalCount - logsToKeep.length;

    this.logs = logsToKeep;

    const result: PurgeResult = {
      timestamp: Date.now(),
      dataType: 'LOGS',
      deletedCount,
      freedBytes: deletedCount * 200, // Estimation ~200 bytes par log
      backupCreated: false,
      success: true,
      message: `${deletedCount} logs supprimés (plus anciens que ${days} jours)`,
    };

    // Logger la purge
    if (deletedCount > 0) {
      this.system('admin', `Purge logs: ${deletedCount} entrées supprimées`, {
        olderThanDays: days,
        deletedCount,
      });
    }

    return result;
  }

  /**
   * Purge les événements anciens
   */
  purgeEvents(olderThanDays?: number): PurgeResult {
    const days = olderThanDays ?? this.config.eventsRetentionDays;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const originalCount = this.events.length;
    const eventsToKeep = this.events.filter((event) => event.timestamp >= cutoffTime);
    const deletedCount = originalCount - eventsToKeep.length;

    this.events = eventsToKeep;

    return {
      timestamp: Date.now(),
      dataType: 'EVENTS',
      deletedCount,
      freedBytes: deletedCount * 500,
      backupCreated: false,
      success: true,
      message: `${deletedCount} événements supprimés`,
    };
  }

  /**
   * Purge tout (logs + événements)
   */
  purgeAll(olderThanDays?: number): PurgeResult {
    const logsResult = this.purgeLogs(olderThanDays);
    const eventsResult = this.purgeEvents(olderThanDays);

    return {
      timestamp: Date.now(),
      dataType: 'ALL',
      deletedCount: logsResult.deletedCount + eventsResult.deletedCount,
      freedBytes: logsResult.freedBytes + eventsResult.freedBytes,
      backupCreated: false,
      success: logsResult.success && eventsResult.success,
      message: `${logsResult.deletedCount} logs et ${eventsResult.deletedCount} événements supprimés`,
    };
  }

  /**
   * Démarre la purge automatique
   */
  private startAutoPurge(): void {
    if (this.purgeIntervalId !== null) return;

    const intervalMs = this.config.autoPurgeIntervalHours * 60 * 60 * 1000;

    this.purgeIntervalId = setInterval(() => {
      this.purgeAll();
    }, intervalMs);
  }

  /**
   * Arrête la purge automatique
   */
  stopAutoPurge(): void {
    if (this.purgeIntervalId !== null) {
      clearInterval(this.purgeIntervalId);
      this.purgeIntervalId = null;
    }
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  /**
   * Ajoute un listener pour les nouveaux logs
   */
  onLog(callback: (log: AdminLogRecord) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Ajoute un listener pour les nouveaux événements
   */
  onEvent(callback: (event: AdminEvent) => void): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  private notifyLogListeners(log: AdminLogRecord): void {
    for (const listener of this.listeners) {
      try {
        listener(log);
      } catch (error) {
        console.error('[LogEngine] Erreur listener log:', error);
      }
    }
  }

  private notifyEventListeners(event: AdminEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[LogEngine] Erreur listener event:', error);
      }
    }
  }

  // ===========================================================================
  // EXPORT / IMPORT
  // ===========================================================================

  /**
   * Exporte les logs en JSON
   */
  exportLogs(filters?: LogFilters): string {
    const logs = filters ? this.searchLogs(filters).logs : this.logs;
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Exporte les événements en JSON
   */
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Importe des logs depuis JSON
   */
  importLogs(json: string): number {
    try {
      const logs = JSON.parse(json) as AdminLogRecord[];
      let imported = 0;

      for (const log of logs) {
        // Vérifier que le log a un ID unique
        if (!this.logs.some((l) => l.id === log.id)) {
          this.logs.push(log);
          imported++;
        }
      }

      // Trier par timestamp
      this.logs.sort((a, b) => a.timestamp - b.timestamp);

      return imported;
    } catch {
      return 0;
    }
  }

  // ===========================================================================
  // UTILITAIRES
  // ===========================================================================

  /**
   * Vide tous les logs (pour tests)
   */
  clear(): void {
    this.logs = [];
    this.events = [];
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<RetentionConfig>): void {
    this.config = { ...this.config, ...config };

    // Redémarrer l'auto-purge si nécessaire
    if (config.autoPurgeEnabled !== undefined || config.autoPurgeIntervalHours !== undefined) {
      this.stopAutoPurge();
      if (this.config.autoPurgeEnabled) {
        this.startAutoPurge();
      }
    }
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this.stopAutoPurge();
    this.listeners.clear();
    this.eventListeners.clear();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let logEngineInstance: LogEngine | null = null;

/**
 * Récupère l'instance singleton du LogEngine
 */
export function getLogEngine(): LogEngine {
  if (!logEngineInstance) {
    logEngineInstance = new LogEngine();
  }
  return logEngineInstance;
}

/**
 * Réinitialise l'instance singleton (pour tests)
 */
export function resetLogEngine(): void {
  if (logEngineInstance) {
    logEngineInstance.dispose();
    logEngineInstance = null;
  }
}

export default LogEngine;
