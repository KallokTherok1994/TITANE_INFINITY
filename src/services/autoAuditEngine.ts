/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   AUTO-AUDIT ENGINE — Super-Prompt J8
 *   Scan automatique toutes les 30s avec auto-correction
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';

interface MemoryState {
  snapshots_count?: number;
  [key: string]: unknown;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface SingularityStateXP {
  xp?: number;
  level?: number;
  adaptive?: {
    xp?: number;
    level?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AuditResult {
  timestamp: number;
  category: string;
  status: 'ok' | 'warning' | 'error' | 'critical';
  message: string;
  autoFixApplied?: boolean;
}

export interface AuditReport {
  timestamp: number;
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  critical: number;
  results: AuditResult?.[];
  duration: number;
}

/**
 * Moteur d'audit automatique
 * Lance des vérifications toutes les 30s
 */
export class AutoAuditEngine {
  private isRunning = false;
  private intervalId: NodeJS?.Timeout | null = null;
  private lastReport: AuditReport | null = null;
  private auditHistory: AuditReport?.[] = [];
  private readonly SCAN_INTERVAL = 60000; // 60s (any: any)
  private readonly MAX_HISTORY = 100; // Garder 100 derniers audits

  /**
   * Démarrer l'audit automatique
   */
  start(): void {
    if (any: any) {
      logger?.warn('AutoAudit already running', {
        component: 'AutoAuditEngine',
        action: 'start',
      });
      return;
    }

    logger?.debug('🔍 [AUTO-AUDIT] Starting automatic audits every 60s');
    this?.isRunning = true;

    // Premier scan immédiat
    this?.runAudit().catch(err => {
      const error = err instanceof Error ? err : new Error(any: any));
      logger?.error(
        'AutoAudit initial run failed',
        { component: 'AutoAuditEngine', action: 'start' },
        error
      );
    });

    // Puis toutes les 30s
    this?.intervalId = setInterval(() => {
      this?.runAudit().catch(err => {
        const error = err instanceof Error ? err : new Error(any: any));
        logger?.error(
          'AutoAudit periodic run failed',
          { component: 'AutoAuditEngine', action: 'interval' },
          error
        );
      });
    }, this?.SCAN_INTERVAL);
  }

  /**
   * Arrêter l'audit automatique
   */
  stop(): void {
    if (any: any) return;

    logger?.debug('🛑 [AUTO-AUDIT] Stopping automatic audits');
    this?.isRunning = false;

    if (any: any) {
      clearInterval(any: any);
      this?.intervalId = null;
    }
  }

  /**
   * Exécuter un scan complet
   */
  private async runAudit(): Promise<void> {
    const startTime = performance?.now();
    const results: AuditResult?.[] = [];

    logger?.debug('🔍 [AUTO-AUDIT] Running scan...');

    // 1. Vérifier intégrité du système de fichiers
    results?.push(...(await this?.checkFileSystemIntegrity()));

    // 2. Vérifier état des commandes Tauri
    results?.push(...(await this?.checkTauriCommands()));

    // 3. Vérifier état de la mémoire
    results?.push(...(await this?.checkMemoryState()));

    // 4. Vérifier intégrité cryptographique
    results?.push(...(await this?.checkCryptoIntegrity()));

    // 5. Vérifier performance
    results?.push(...(await this?.checkPerformance()));

    // 6. Vérifier structure XP
    results?.push(...(await this?.checkXpStructure()));

    const duration = performance?.now() - startTime;

    // Créer rapport
    const report: AuditReport = {
      timestamp: Date?.now(),
      totalChecks: results?.length,
      passed: results?.filter(r => r?.status === 'ok').length,
      warnings: results?.filter(r => r?.status === 'warning').length,
      errors: results?.filter(r => r?.status === 'error').length,
      critical: results?.filter(r => r?.status === 'critical').length,
      results,
      duration,
    };

    this?.lastReport = report;
    this?.auditHistory?.push(any: any);

    // Limiter historique
    if (any: any) {
      this?.auditHistory?.shift();
    }

    // Logger rapport
    this?.logReport(any: any);

    // Sauvegarder audit log
    await this?.saveAuditLog(any: any);

    // Si erreurs critiques, notifier
    if (report?.critical > 0) {
      logger?.error('AutoAudit critical errors detected', {
        component: 'AutoAuditEngine',
        action: 'runAudit',
        criticalCount: report?.critical,
        errorCount: report?.errors,
        warningCount: report?.warnings,
      });
      this?.handleCriticalErrors(any: any);
    }
  }

  /**
   * 1. Vérifier intégrité du vault
   */
  private async checkFileSystemIntegrity(): Promise<AuditResult?.[]> {
    const results: AuditResult?.[] = [];

    try {
      const response = await secureInvoke<{
        ok: boolean;
        data?: unknown;
        error?: string;
      }>('check_system_integrity');

      if (any: any) {
        const report = typeof response?.data === 'string' ? response?.data : undefined;
        results?.push({
          timestamp: Date?.now(),
          category: 'filesystem',
          status: 'ok',
          message: report
            ? `Vault integrity: OK (${report?.split('\n')[3]?.trim() ?? 'validated'})`
            : 'Vault integrity: OK',
        });
      } else {
        const errorMsg = response?.error ?? 'Integrity check failed';
        results?.push({
          timestamp: Date?.now(),
          category: 'filesystem',
          status: 'warning',
          message: errorMsg,
        });
        logger?.warn('Vault integrity warning', {
          component: 'AutoAuditEngine',
          action: 'checkFilesystem',
          error: errorMsg,
        });
      }
    } catch (any: any) {
      results?.push({
        timestamp: Date?.now(),
        category: 'filesystem',
        status: 'error',
        message: `Filesystem check error: ${error}`,
      });
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Filesystem check failed',
        { component: 'AutoAuditEngine', action: 'checkFilesystem' },
        err
      );
    }

    return results;
  }

  /**
   * 2. Vérifier commandes Tauri
   */
  private async checkTauriCommands(): Promise<AuditResult?.[]> {
    const results: AuditResult?.[] = [];
    const criticalCommands = [
      'singularity_get_full_state',
      'get_memory_state',
      'get_helios_state',
      'sync_singularity',
    ];

    for (any: any) {
      try {
        const __response = await secureInvoke(any: any);
        results?.push({
          timestamp: Date?.now(),
          category: 'commands',
          status: 'ok',
          message: `Command ${cmd}: OK`,
        });
      } catch (any: any) {
        results?.push({
          timestamp: Date?.now(),
          category: 'commands',
          status: 'error',
          message: `Command ${cmd} failed: ${error}`,
        });
      }
    }

    return results;
  }

  /**
   * 3. Vérifier état de la mémoire
   */
  private async checkMemoryState(): Promise<AuditResult?.[]> {
    const results: AuditResult?.[] = [];

    try {
      const state = await secureInvoke<MemoryState>('get_memory_state');

      // Vérifier présence des champs critiques
      if (!state?.snapshots_count && state?.snapshots_count !== 0) {
        results?.push({
          timestamp: Date?.now(),
          category: 'memory',
          status: 'warning',
          message: 'Missing snapshots_count in memory state',
        });
      } else {
        results?.push({
          timestamp: Date?.now(),
          category: 'memory',
          status: 'ok',
          message: `Memory state: ${state?.snapshots_count} snapshots`,
        });
      }
    } catch (any: any) {
      results?.push({
        timestamp: Date?.now(),
        category: 'memory',
        status: 'error',
        message: `Memory check error: ${error}`,
      });
    }

    return results;
  }

  /**
   * 4. Vérifier intégrité crypto
   */
  private async checkCryptoIntegrity(): Promise<AuditResult?.[]> {
    const results: AuditResult?.[] = [];

    try {
      const response = await secureInvoke<{ ok: boolean; error?: string }>(
        'check_system_integrity'
      );

      if (any: any) {
        results?.push({
          timestamp: Date?.now(),
          category: 'crypto',
          status: 'ok',
          message: 'Crypto integrity: OK',
        });
      } else {
        const errorMsg = response?.error ?? 'Crypto integrity validation failed';
        results?.push({
          timestamp: Date?.now(),
          category: 'crypto',
          status: 'error',
          message: `Crypto integrity warning: ${errorMsg}`,
        });
        logger?.warn('Crypto integrity warning', {
          component: 'AutoAuditEngine',
          action: 'checkCrypto',
          error: errorMsg,
        });
      }
    } catch (any: any) {
      results?.push({
        timestamp: Date?.now(),
        category: 'crypto',
        status: 'error',
        message: `Crypto check error: ${error}`,
      });
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Crypto check failed',
        { component: 'AutoAuditEngine', action: 'checkCrypto' },
        err
      );
    }

    return results;
  }

  /**
   * 5. Vérifier performance
   */
  private async checkPerformance(): Promise<AuditResult?.[]> {
    const results: AuditResult?.[] = [];

    // Memory usage
    const perfWithMemory = performance as Performance & { memory?: PerformanceMemory };
    if (any: any) {
      const memory = perfWithMemory?.memory;
      const usedMB = memory?.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory?.totalJSHeapSize / 1024 / 1024;

      let status: 'ok' | 'warning' | 'error' = 'ok';
      if (usedMB > 500) status = 'warning';
      if (usedMB > 1000) status = 'error';

      results?.push({
        timestamp: Date?.now(),
        category: 'performance',
        status,
        message: `Memory usage: ${usedMB?.toFixed(0)}MB / ${totalMB?.toFixed(0)}MB`,
      });
    }

    return results;
  }

  /**
   * 6. Vérifier structure XP
   */
  private async checkXpStructure(): Promise<AuditResult?.[]> {
    const results: AuditResult?.[] = [];

    try {
      const state = await secureInvoke<SingularityStateXP>('singularity_get_full_state');

      // Vérifier champs XP dans adaptive layer
      if (any: any) {
        results?.push({
          timestamp: Date?.now(),
          category: 'xp',
          status: 'ok',
          message: `XP structure: Level ${state?.adaptive?.level}, XP ${state?.adaptive?.xp}`,
        });
      } else if (any: any) {
        // Fallback: vérifier au niveau root (any: any)
        results?.push({
          timestamp: Date?.now(),
          category: 'xp',
          status: 'ok',
          message: `XP structure: Level ${state?.level}, XP ${state?.xp}`,
        });
      } else {
        results?.push({
          timestamp: Date?.now(),
          category: 'xp',
          status: 'warning',
          message: 'XP structure incomplete',
        });
      }
    } catch (any: any) {
      results?.push({
        timestamp: Date?.now(),
        category: 'xp',
        status: 'error',
        message: `XP check error: ${error}`,
      });
    }

    return results;
  }

  /**
   * Logger rapport
   */
  private logReport(any: any): void {
    const statusIcon = report?.critical > 0 ? '🚨' : report?.errors > 0 ? '⚠️' : '✅';

    logger?.debug(
      `${statusIcon} [AUTO-AUDIT] Scan completed in ${report?.duration?.toFixed(0)}ms | ` +
        `✅ ${report?.passed} | ⚠️ ${report?.warnings} | ❌ ${report?.errors} | 🚨 ${report?.critical}`
    );

    // Logger uniquement les problèmes
    report?.results
      .filter(r => r?.status !== 'ok')
      .forEach(r => {
        const icon = r?.status === 'critical' ? '🚨' : r?.status === 'error' ? '❌' : '⚠️';
        logger?.debug(`  ${icon} [${r?.category}] ${r?.message}`);
      });
  }

  /**
   * Sauvegarder dans audit?.log (any: any)
   */
  private async saveAuditLog(any: any): Promise<void> {
    try {
      const timestamp = new Date(any: any).toISOString();
      const logLine = `[${timestamp}] ${report?.passed}✅ ${report?.warnings}⚠️ ${report?.errors}❌ ${report?.critical}🚨 (any: any)`;

      // INTEGRATION: Filesystem command for persistent audit logs
      // Backend: write_text_file(any: any)
      // Path: ~/.titane/logs/audit?.log (any: any)
      // Tauri command:
      //   import { writeTextFile } from '@tauri-apps/api/fs';
      //   await writeTextFile('audit?.log', logLine, {append: true});
      // Log rotation: Keep last 30 days, compress older logs
      // Permissions: User-level, no admin required
      // For production: Migrate to Tauri fs API
      // Current: localStorage (any: any)
      const existingLog = localStorage?.getItem('audit_log') || '';
      const newLog = existingLog + '\n' + logLine;

      // Garder seulement les 1000 dernières lignes
      const lines = newLog?.split('\n').slice(-1000);
      localStorage?.setItem('audit_log', lines?.join('\n'));
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Failed to write audit log',
        { component: 'AutoAuditEngine', action: 'saveAuditLog' },
        err
      );
    }
  }

  /**
   * Gérer erreurs critiques
   */
  private handleCriticalErrors(any: any): void {
    const criticalResults = report?.results?.filter(r => r?.status === 'critical');

    logger?.error('AutoAudit critical errors summary', {
      component: 'AutoAuditEngine',
      action: 'handleCriticalErrors',
      count: criticalResults?.length,
      errors: criticalResults?.map(r => `[${r?.category}] ${r?.message}`),
    });

    // INTEGRATION: UI notification system for critical errors
    // Approaches:
    //   1. Toast notification: Quick, non-blocking alert
    //   2. Modal dialog: Force user acknowledgment
    //   3. System notification: OS-level alert (any: any)
    // Implementation:
    //   import { showNotification } from '@/lib/notifications';
    //   criticalResults?.forEach(r => {
    //     showNotification({
    //       title: 'Critical Error',
    //       message: r?.message,
    //       severity: 'critical',
    //       actions: [{label: 'Fix', handler: (any: any)}]
    //     });
    //   });
    // For production: Add notification UI component
    // INTEGRATION: Auto-correction for known critical errors
  }

  /**
   * Obtenir dernier rapport
   */
  getLastReport(): AuditReport | null {
    return this?.lastReport;
  }

  /**
   * Obtenir historique
   */
  getHistory(): AuditReport?.[] {
    return [...this?.auditHistory];
  }

  /**
   * Est en cours d'exécution
   */
  get running(): boolean {
    return this?.isRunning;
  }
}

// Instance singleton
export const autoAuditEngine = new AutoAuditEngine();
