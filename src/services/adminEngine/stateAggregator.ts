/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — State Aggregator
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        stateAggregator.ts
 * @version     vΩ∞Ω+
 *
 * Collecte et agrège les états/métriques/logs de tous les moteurs TITANE∞
 * Produit un snapshot cohérent et compact pour le dashboard admin
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type {
  AdminSnapshot,
  AdminVitals,
  ModuleStatus,
  TitaneModule,
  HealthLevel,
  ModuleHealthStatus,
  AdminAnomaly,
  AlertThresholds,
  SystemMode,
} from './adminEngine.config';
import {
  generateAdminId,
  determineHealthLevel,
  calculateHealthScore,
  scoreToGrade,
  MODULE_DISPLAY_NAMES,
  DEFAULT_ALERT_THRESHOLDS,
  createEmptySnapshot,
} from './adminEngine.config';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface RustVitalsResponse {
  cpu_process: number;
  cpu_global: number;
  ram_process: number;
  ram_process_percent: number;
  ram_system_used: number;
  ram_system_total: number;
  io_read_rate: number;
  io_write_rate: number;
  tauri_latency: number;
  threads_active: number;
  uptime: number;
}

interface RustModuleStatusResponse {
  module_id: string;
  status: string;
  last_check: number;
  last_error: string | null;
  error_count: number;
  heal_attempts: number;
  avg_latency: number;
  pending_ops: number;
  metrics: Record<string, number>;
  active_anomalies: number;
}

interface AggregatorConfig {
  pollingInterval: number;
  alertThresholds: AlertThresholds;
  enabledModules: TitaneModule[];
  cacheEnabled: boolean;
  cacheTtl: number;
}

// =============================================================================
// STATE AGGREGATOR CLASS
// =============================================================================

/**
 * Service d'agrégation d'état pour l'Admin Engine
 * Collecte les métriques de tous les sous-systèmes TITANE∞
 */
export class StateAggregator {
  private config: AggregatorConfig;
  private lastSnapshot: AdminSnapshot | null = null;
  private lastFetchTime: number = 0;
  private isCollecting: boolean = false;
  private listeners: Set<(snapshot: AdminSnapshot) => void> = new Set();

  // Métriques frontend collectées localement
  private fpsHistory: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private rafId: number | null = null;

  // Cache des latences IA
  private iaLatencyCache: {
    ollama: number;
    gemini: number;
    lastUpdate: number;
  } = {
    ollama: 0,
    gemini: 0,
    lastUpdate: 0,
  };

  constructor(config?: Partial<AggregatorConfig>) {
    this.config = {
      pollingInterval: 5000,
      alertThresholds: DEFAULT_ALERT_THRESHOLDS,
      enabledModules: Object.keys(MODULE_DISPLAY_NAMES) as TitaneModule[],
      cacheEnabled: true,
      cacheTtl: 2000,
      ...config,
    };
  }

  // ===========================================================================
  // COLLECTE PRINCIPALE
  // ===========================================================================

  /**
   * Collecte un snapshot complet de l'état du système
   */
  async collectSnapshot(): Promise<AdminSnapshot> {
    // Vérifier le cache
    if (this.config.cacheEnabled && this.lastSnapshot) {
      const age = Date.now() - this.lastFetchTime;
      if (age < this.config.cacheTtl) {
        return this.lastSnapshot;
      }
    }

    // Éviter les collectes parallèles
    if (this.isCollecting) {
      return this.lastSnapshot || createEmptySnapshot();
    }

    this.isCollecting = true;

    try {
      const startTime = Date.now();

      // Collecter en parallèle
      const [vitals, moduleStatuses, anomalies, systemMode] = await Promise.all([
        this.collectVitals(),
        this.collectModuleStatuses(),
        this.collectAnomalies(),
        this.getSystemMode(),
      ]);

      // Construire le snapshot
      const healthLevel = determineHealthLevel(vitals, this.config.alertThresholds);
      const healthScore = calculateHealthScore(vitals, moduleStatuses, this.config.alertThresholds);

      const snapshot: AdminSnapshot = {
        id: generateAdminId('snap'),
        timestamp: startTime,
        healthLevel,
        statusMessage: this.generateStatusMessage(healthLevel, moduleStatuses),
        vitals,
        modules: moduleStatuses,
        activeAnomalies: anomalies,
        recentActions: this.lastSnapshot?.recentActions || [],
        healthScore,
        performanceGrade: scoreToGrade(healthScore),
        systemMode,
      };

      this.lastSnapshot = snapshot;
      this.lastFetchTime = Date.now();

      // Notifier les listeners
      this.notifyListeners(snapshot);

      return snapshot;
    } catch (error) {
      console.error('[StateAggregator] Erreur collecte snapshot:', error);
      return this.lastSnapshot || createEmptySnapshot();
    } finally {
      this.isCollecting = false;
    }
  }

  // ===========================================================================
  // COLLECTE VITALS
  // ===========================================================================

  /**
   * Collecte les métriques vitales du système
   */
  private async collectVitals(): Promise<AdminVitals> {
    const now = Date.now();

    // Collecter depuis Rust (Tauri)
    let rustVitals: RustVitalsResponse | null = null;
    try {
      rustVitals = await secureInvoke<RustVitalsResponse>('get_admin_vitals');
    } catch (error) {
      console.warn('[StateAggregator] Impossible de collecter vitals Rust:', error);
    }

    // Collecter FPS frontend
    const fps = this.getCurrentFps();

    // Collecter latences IA
    const iaLatencies = await this.collectIALatencies();

    return {
      timestamp: now,
      cpuProcess: rustVitals?.cpu_process ?? 0,
      cpuGlobal: rustVitals?.cpu_global ?? 0,
      ramProcess: rustVitals?.ram_process ?? 0,
      ramProcessPercent: rustVitals?.ram_process_percent ?? 0,
      ramSystemUsed: rustVitals?.ram_system_used ?? 0,
      ramSystemTotal: rustVitals?.ram_system_total ?? 0,
      ioReadRate: rustVitals?.io_read_rate ?? 0,
      ioWriteRate: rustVitals?.io_write_rate ?? 0,
      tauriLatency: rustVitals?.tauri_latency ?? 0,
      ollamaLatency: iaLatencies.ollama,
      geminiLatency: iaLatencies.gemini,
      fps,
      threadsActive: rustVitals?.threads_active ?? 0,
      uptime: rustVitals?.uptime ?? 0,
    };
  }

  /**
   * Collecte les latences des providers IA
   */
  private async collectIALatencies(): Promise<{ ollama: number; gemini: number }> {
    // Utiliser le cache si récent
    if (Date.now() - this.iaLatencyCache.lastUpdate < 10000) {
      return {
        ollama: this.iaLatencyCache.ollama,
        gemini: this.iaLatencyCache.gemini,
      };
    }

    try {
      const [ollamaLatency, geminiLatency] = await Promise.all([
        this.pingOllama(),
        this.pingGemini(),
      ]);

      this.iaLatencyCache = {
        ollama: ollamaLatency,
        gemini: geminiLatency,
        lastUpdate: Date.now(),
      };

      return { ollama: ollamaLatency, gemini: geminiLatency };
    } catch {
      return { ollama: this.iaLatencyCache.ollama, gemini: this.iaLatencyCache.gemini };
    }
  }

  /**
   * Ping Ollama pour mesurer la latence
   */
  private async pingOllama(): Promise<number> {
    try {
      const start = performance.now();
      await secureInvoke('ping_ollama');
      return performance.now() - start;
    } catch {
      return -1; // -1 = offline
    }
  }

  /**
   * Ping Gemini pour mesurer la latence
   */
  private async pingGemini(): Promise<number> {
    try {
      const start = performance.now();
      await secureInvoke('ping_gemini');
      return performance.now() - start;
    } catch {
      return -1;
    }
  }

  // ===========================================================================
  // COLLECTE MODULES
  // ===========================================================================

  /**
   * Collecte le statut de tous les modules
   */
  private async collectModuleStatuses(): Promise<Record<TitaneModule, ModuleStatus>> {
    const modules: Record<TitaneModule, ModuleStatus> = {} as Record<TitaneModule, ModuleStatus>;

    // Essayer de récupérer depuis Rust
    try {
      const rustStatuses = await secureInvoke<RustModuleStatusResponse[]>('get_module_statuses');

      for (const rs of rustStatuses) {
        const moduleId = rs.module_id as TitaneModule;
        modules[moduleId] = {
          moduleId,
          displayName: MODULE_DISPLAY_NAMES[moduleId] || moduleId,
          status: this.mapRustStatus(rs.status),
          lastCheck: rs.last_check,
          lastError: rs.last_error,
          errorCount: rs.error_count,
          healAttempts: rs.heal_attempts,
          avgLatency: rs.avg_latency,
          pendingOps: rs.pending_ops,
          metrics: rs.metrics,
          activeAnomalies: rs.active_anomalies,
        };
      }
    } catch (error) {
      console.warn('[StateAggregator] Impossible de collecter statuts modules:', error);
    }

    // Remplir les modules manquants avec des valeurs par défaut
    for (const moduleId of this.config.enabledModules) {
      if (!modules[moduleId]) {
        modules[moduleId] = this.createDefaultModuleStatus(moduleId);
      }
    }

    return modules;
  }

  /**
   * Mappe le statut Rust vers le type TypeScript
   */
  private mapRustStatus(status: string): ModuleHealthStatus {
    const mapping: Record<string, ModuleHealthStatus> = {
      healthy: 'HEALTHY',
      degraded: 'DEGRADED',
      critical: 'CRITICAL',
      offline: 'OFFLINE',
      recovering: 'RECOVERING',
    };
    return mapping[status.toLowerCase()] || 'UNKNOWN';
  }

  /**
   * Crée un statut de module par défaut
   */
  private createDefaultModuleStatus(moduleId: TitaneModule): ModuleStatus {
    return {
      moduleId,
      displayName: MODULE_DISPLAY_NAMES[moduleId],
      status: 'UNKNOWN',
      lastCheck: Date.now(),
      lastError: null,
      errorCount: 0,
      healAttempts: 0,
      avgLatency: 0,
      pendingOps: 0,
      metrics: {},
      activeAnomalies: 0,
    };
  }

  // ===========================================================================
  // COLLECTE ANOMALIES
  // ===========================================================================

  /**
   * Collecte les anomalies actives depuis Performance et Self-Healing
   */
  private async collectAnomalies(): Promise<AdminAnomaly[]> {
    const anomalies: AdminAnomaly[] = [];

    try {
      // Récupérer depuis Performance Engine
      const perfAnomalies = await secureInvoke<AdminAnomaly[]>('get_performance_anomalies');
      anomalies.push(...perfAnomalies);
    } catch {
      // Performance Engine non disponible
    }

    try {
      // Récupérer depuis Self-Healing Engine
      const healingAnomalies = await secureInvoke<AdminAnomaly[]>('get_healing_anomalies');
      anomalies.push(...healingAnomalies);
    } catch {
      // Self-Healing Engine non disponible
    }

    // Trier par timestamp décroissant
    return anomalies.sort((a, b) => b.detectedAt - a.detectedAt);
  }

  // ===========================================================================
  // MODE SYSTÈME
  // ===========================================================================

  /**
   * Récupère le mode système actuel
   */
  private async getSystemMode(): Promise<SystemMode> {
    try {
      const mode = await secureInvoke<string>('get_system_mode');
      return mode as SystemMode;
    } catch {
      return 'NORMAL';
    }
  }

  // ===========================================================================
  // FPS MONITORING
  // ===========================================================================

  /**
   * Démarre le monitoring FPS
   */
  startFpsMonitoring(): void {
    if (this.rafId !== null) return;

    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsHistory = [];

    const measureFps = (now: number) => {
      this.frameCount++;
      const elapsed = now - this.lastFrameTime;

      if (elapsed >= 1000) {
        const fps = Math.round((this.frameCount / elapsed) * 1000);
        this.fpsHistory.push(fps);

        // Garder les 60 dernières mesures
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }

        this.frameCount = 0;
        this.lastFrameTime = now;
      }

      this.rafId = requestAnimationFrame(measureFps);
    };

    this.rafId = requestAnimationFrame(measureFps);
  }

  /**
   * Arrête le monitoring FPS
   */
  stopFpsMonitoring(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Récupère le FPS actuel
   */
  private getCurrentFps(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory[this.fpsHistory.length - 1];
  }

  // ===========================================================================
  // POLLING
  // ===========================================================================

  private pollingIntervalId: NodeJS.Timeout | null = null;

  /**
   * Démarre le polling automatique
   */
  startPolling(interval?: number): void {
    if (this.pollingIntervalId !== null) return;

    const pollInterval = interval ?? this.config.pollingInterval;

    this.pollingIntervalId = setInterval(async () => {
      await this.collectSnapshot();
    }, pollInterval);

    // Collecter immédiatement
    this.collectSnapshot();
  }

  /**
   * Arrête le polling
   */
  stopPolling(): void {
    if (this.pollingIntervalId !== null) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  /**
   * Ajoute un listener pour les mises à jour de snapshot
   */
  addListener(callback: (snapshot: AdminSnapshot) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(snapshot: AdminSnapshot): void {
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('[StateAggregator] Erreur listener:', error);
      }
    }
  }

  // ===========================================================================
  // UTILITAIRES
  // ===========================================================================

  /**
   * Génère un message de statut basé sur le niveau de santé
   */
  private generateStatusMessage(
    healthLevel: HealthLevel,
    modules: Record<TitaneModule, ModuleStatus>
  ): string {
    const criticalModules = Object.values(modules).filter((m) => m.status === 'CRITICAL');
    const degradedModules = Object.values(modules).filter((m) => m.status === 'DEGRADED');
    const offlineModules = Object.values(modules).filter((m) => m.status === 'OFFLINE');

    switch (healthLevel) {
      case 'CRITICAL':
        if (criticalModules.length > 0) {
          return `${criticalModules.length} module(s) en état critique`;
        }
        return 'Ressources système critiques';

      case 'ALERT':
        if (offlineModules.length > 0) {
          return `${offlineModules.length} module(s) hors ligne`;
        }
        return 'Anomalies détectées nécessitant attention';

      case 'WARNING':
        if (degradedModules.length > 0) {
          return `${degradedModules.length} module(s) dégradé(s)`;
        }
        return 'Performance sous-optimale détectée';

      case 'OK':
      default:
        return 'Tous les systèmes opérationnels';
    }
  }

  /**
   * Récupère le dernier snapshot (depuis cache)
   */
  getLastSnapshot(): AdminSnapshot | null {
    return this.lastSnapshot;
  }

  /**
   * Force un rafraîchissement du cache
   */
  invalidateCache(): void {
    this.lastFetchTime = 0;
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<AggregatorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this.stopPolling();
    this.stopFpsMonitoring();
    this.listeners.clear();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let stateAggregatorInstance: StateAggregator | null = null;

/**
 * Récupère l'instance singleton du StateAggregator
 */
export function getStateAggregator(): StateAggregator {
  if (!stateAggregatorInstance) {
    stateAggregatorInstance = new StateAggregator();
  }
  return stateAggregatorInstance;
}

/**
 * Réinitialise l'instance singleton (pour tests)
 */
export function resetStateAggregator(): void {
  if (stateAggregatorInstance) {
    stateAggregatorInstance.dispose();
    stateAggregatorInstance = null;
  }
}

export default StateAggregator;
