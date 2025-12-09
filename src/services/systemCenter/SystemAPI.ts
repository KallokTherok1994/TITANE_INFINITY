/**
 * TITANE_INFINITY v21.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — SYSTEM API (Unified Safe Commands)
 *   Interface unique pour tous les appels système sécurisés
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { systemCenterAutoFix, type DetectedError } from './SystemCenterAutoFix';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'unavailable';
  modules: ModuleHealth[];
  overallScore: number;
  timestamp: number;
}

export interface ModuleHealth {
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastCheck: number;
  metrics?: Record<string, unknown>;
}

export interface DiagnosticResult {
  success: boolean;
  data?: unknown;
  error?: string;
  autoFixed?: boolean;
  originalCommand?: string;
  replacedBy?: string;
}

export interface MonitoringMetrics {
  cpu: number;
  memory: number;
  engines: EngineMetrics[];
  timestamp: number;
}

export interface EngineMetrics {
  name: string;
  active: boolean;
  performance: number;
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM API CLASS
// ═══════════════════════════════════════════════════════════════

export class SystemAPI {
  /**
   * Obtenir l'état de santé global du système
   * Auto-repair si command échoue
   */
  static async getSystemHealth(): Promise<DiagnosticResult> {
    try {
      const data = await secureInvoke<SystemHealth>('get_system_health', {});
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Auto-fix attempt
      const detectedError = systemCenterAutoFix.analyzeError(error as Error);
      const fix = await systemCenterAutoFix.autoFix(detectedError);

      if (fix.success && fix.newCommand) {
        try {
          const data = await secureInvoke(fix.newCommand, {});
          return {
            success: true,
            data,
            autoFixed: true,
            originalCommand: 'get_system_health',
            replacedBy: fix.newCommand,
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: 'Système temporairement indisponible',
            autoFixed: false,
          };
        }
      }

      return {
        success: false,
        error: (error as Error).message,
        autoFixed: false,
      };
    }
  }

  /**
   * Obtenir les métriques de monitoring
   */
  static async getMonitoringMetrics(): Promise<DiagnosticResult> {
    const commands = [
      'engines_monitoring_get_metrics',
      'performance_get_metrics',
      'get_helios_metrics',
    ];

    for (const command of commands) {
      try {
        const data = await secureInvoke<MonitoringMetrics>(command, {});
        return {
          success: true,
          data,
          originalCommand: command,
        };
      } catch (error) {
        // Essayer la commande suivante
        continue;
      }
    }

    // Aucune commande n'a fonctionné - Fallback minimal
    return {
      success: true,
      data: {
        cpu: 0,
        memory: 0,
        engines: [],
        timestamp: Date.now(),
      },
      autoFixed: true,
      error: 'Monitoring en mode lecture seule',
    };
  }

  /**
   * Obtenir l'état d'un module spécifique
   */
  static async getModuleHealth(moduleName: string): Promise<DiagnosticResult> {
    try {
      const data = await secureInvoke('get_module_health', { module: moduleName });
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Fallback: retourner état minimal
      return {
        success: true,
        data: {
          name: moduleName,
          status: 'unknown',
          lastCheck: Date.now(),
        },
        autoFixed: true,
        error: 'Module non disponible',
      };
    }
  }

  /**
   * Obtenir l'état cognitif
   */
  static async getCognitiveState(): Promise<DiagnosticResult> {
    const commands = ['get_cognitive_state', 'singularity_get_state'];

    for (const command of commands) {
      try {
        const data = await secureInvoke(command, {});
        return {
          success: true,
          data,
          originalCommand: command,
        };
      } catch (error) {
        continue;
      }
    }

    return {
      success: false,
      error: 'État cognitif non disponible',
      autoFixed: false,
    };
  }

  /**
   * Obtenir les métriques Helios
   */
  static async getHeliosMetrics(): Promise<DiagnosticResult> {
    try {
      const data = await secureInvoke('get_helios_metrics', {});
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Fallback vers système général
      return this.getSystemHealth();
    }
  }

  /**
   * Obtenir la configuration runtime
   */
  static async getRuntimeConfig(): Promise<DiagnosticResult> {
    const commands = ['get_runtime_config', 'state_get'];

    for (const command of commands) {
      try {
        const data = await secureInvoke(command, {});
        return {
          success: true,
          data,
          originalCommand: command,
        };
      } catch (error) {
        continue;
      }
    }

    return {
      success: true,
      data: {},
      autoFixed: true,
      error: 'Configuration par défaut chargée',
    };
  }

  /**
   * Lancer un diagnostic rapide (safe)
   */
  static async runQuickDiagnostic(): Promise<DiagnosticResult> {
    // Utiliser uniquement des commandes whitelistées
    const results = await Promise.allSettled([
      this.getSystemHealth(),
      this.getMonitoringMetrics(),
      this.getCognitiveState(),
    ]);

    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    return {
      success: successful.length > 0,
      data: {
        successful: successful.length,
        failed: failed.length,
        results: results.map((r, i) =>
          r.status === 'fulfilled' ? r.value : { error: 'Failed' }
        ),
      },
      autoFixed: failed.length > 0,
    };
  }

  /**
   * Obtenir le dashboard de monitoring complet
   */
  static async getMonitoringDashboard(): Promise<DiagnosticResult> {
    try {
      const data = await secureInvoke('engines_monitoring_get_dashboard', {});
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Fallback: construire dashboard minimal depuis métriques
      const metrics = await this.getMonitoringMetrics();
      return {
        success: true,
        data: {
          metrics: metrics.data,
          mode: 'readonly',
        },
        autoFixed: true,
        error: 'Dashboard en mode lecture seule',
      };
    }
  }

  /**
   * Vérifier si une commande est disponible (test safe)
   */
  static async isCommandAvailable(command: string): Promise<boolean> {
    try {
      await secureInvoke(command, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtenir les erreurs détectées par AutoFix
   */
  static getDetectedErrors(): DetectedError[] {
    return systemCenterAutoFix.getDetectedErrors();
  }

  /**
   * Clear l'historique AutoFix
   */
  static clearAutoFixHistory(): void {
    systemCenterAutoFix.clearHistory();
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default SystemAPI;
