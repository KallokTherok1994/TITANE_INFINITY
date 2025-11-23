/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
  CRITICAL_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';

/**
 * État santé système complet
 */
export interface SystemStatus {
  timestamp: string;
  uptime: number;
  version: string;
  cores: {
    helios: CoreStatus; // Orchestration
    nexus: CoreStatus; // Routing
    harmonia: CoreStatus; // Intégration
    sentinel: CoreStatus; // Surveillance
  };
  resources: {
    cpu: number; // %
    memory: number; // MB
    disk: number; // MB
  };
  health: 'healthy' | 'degraded' | 'critical';
}

/**
 * État core individuel
 */
export interface CoreStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastActivity: string;
  metrics: {
    requests: number;
    errors: number;
    latency: number; // ms
  };
}

/**
 * Métriques performance
 */
export interface PerformanceMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    frequency: number; // MHz
  };
  memory: {
    total: number; // MB
    used: number;
    free: number;
    cached: number;
  };
  disk: {
    total: number; // GB
    used: number;
    free: number;
    readSpeed: number; // MB/s
    writeSpeed: number;
  };
  network: {
    sent: number; // MB
    received: number;
    latency: number; // ms
  };
}

/**
 * Configuration système
 */
export interface SystemConfig {
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  cacheSize: number; // MB
  maxConnections: number;
  timeout: number; // seconds
  features: {
    autoHeal: boolean;
    adaptiveLearning: boolean;
    voiceMode: boolean;
    metaMode: boolean;
  };
}

/**
 * Service centralisé System
 * Monitoring, santé, configuration globale
 */
class SystemService {
  private statusCache: SystemStatus | null = null;
  private lastStatusFetch = 0;
  private readonly CACHE_TTL = 5000; // 5s (plus court car santé critique)

  /**
   * Récupération état santé complet
   */
  async getStatus(): Promise<SystemStatus> {
    const now = Date.now();
    if (this.statusCache && now - this.lastStatusFetch < this.CACHE_TTL) {
      return this.statusCache;
    }

    try {
      this.statusCache = await invokeWithRetry<SystemStatus>(
        'system_get_status',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'System' }
      );
      this.lastStatusFetch = now;
      return this.statusCache;
    } catch (error) {
      console.error('[SystemService] Erreur getStatus:', error);
      throw new Error(`Récupération santé échouée: ${error}`);
    }
  }

  /**
   * Récupération métriques performance
   */
  async getMetrics(): Promise<PerformanceMetrics> {
    try {
      return await invokeWithRetry<PerformanceMetrics>(
        'system_get_metrics',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'System' }
      );
    } catch (error) {
      console.error('[SystemService] Erreur getMetrics:', error);
      throw new Error(`Récupération métriques échouée: ${error}`);
    }
  }

  /**
   * Récupération configuration
   */
  async getConfig(): Promise<SystemConfig> {
    try {
      return await invokeWithRetry<SystemConfig>(
        'system_get_config',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'System' }
      );
    } catch (error) {
      console.error('[SystemService] Erreur getConfig:', error);
      throw new Error(`Récupération config échouée: ${error}`);
    }
  }

  /**
   * Modification configuration
   */
  async updateConfig(config: Partial<SystemConfig>): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'system_update_config',
        { config },
        { ...STANDARD_COMMAND_OPTIONS, context: 'System' }
      );
    } catch (error) {
      console.error('[SystemService] Erreur updateConfig:', error);
      throw new Error(`Modification config échouée: ${error}`);
    }
  }

  /**
   * Redémarrage core spécifique
   */
  async restartCore(coreName: keyof SystemStatus['cores']): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'system_restart_core',
        { coreName },
        { ...CRITICAL_COMMAND_OPTIONS, context: 'System' }
      );
      // Invalider cache après redémarrage
      this.statusCache = null;
    } catch (error) {
      console.error('[SystemService] Erreur restartCore:', error);
      throw new Error(`Redémarrage ${coreName} échoué: ${error}`);
    }
  }

  /**
   * Redémarrage complet système
   */
  async restart(): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'system_restart',
        {},
        { ...CRITICAL_COMMAND_OPTIONS, context: 'System' }
      );
    } catch (error) {
      console.error('[SystemService] Erreur restart:', error);
      throw new Error(`Redémarrage système échoué: ${error}`);
    }
  }

  /**
   * Shutdown graceful
   */
  async shutdown(): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'system_shutdown',
        {},
        { ...CRITICAL_COMMAND_OPTIONS, context: 'System' }
      );
    } catch (error) {
      console.error('[SystemService] Erreur shutdown:', error);
      throw new Error(`Arrêt système échoué: ${error}`);
    }
  }

  /**
   * Effacement cache global
   */
  async clearCache(): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'system_clear_cache',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'System' }
      );
      this.statusCache = null;
    } catch (error) {
      console.error('[SystemService] Erreur clearCache:', error);
      throw new Error(`Effacement cache échoué: ${error}`);
    }
  }

  /**
   * Export logs système
   */
  async exportLogs(format: 'json' | 'txt'): Promise<string> {
    try {
      return await invokeWithRetry<string>(
        'system_export_logs',
        { format },
        { ...STANDARD_COMMAND_OPTIONS, context: 'System' }
      );
    } catch (error) {
      console.error('[SystemService] Erreur exportLogs:', error);
      throw new Error(`Export logs échoué: ${error}`);
    }
  }

  /**
   * Healthcheck simple (pour monitoring externe)
   */
  async healthcheck(): Promise<{ ok: boolean; message: string }> {
    try {
      const status = await this.getStatus();
      return {
        ok: status.health === 'healthy',
        message: status.health,
      };
    } catch (error) {
      return {
        ok: false,
        message: `Healthcheck échoué: ${error}`,
      };
    }
  }
}

/**
 * Instance singleton
 */
export const systemService = new SystemService();
