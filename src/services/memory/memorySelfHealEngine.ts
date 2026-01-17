/**
 * TITANE∞ v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — MEMORY SELF-HEAL ENGINE
 *   Phase 5: Validation + Auto-réparation mémoire 3 couches
 *
 *   Purpose:
 *   - Détecter corruption localStorage
 *   - Valider intégrité des 3 couches
 *   - Auto-réparer données corrompues
 *   - Synchroniser couches désynchronisées
 *   - Monitoring santé mémoire
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage as _AIMessage } from '@/services/ai/types';
import type { ChatMode } from '@/services/ai/chatEngine';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface MemoryCorruption {
  layer: 'localStorage' | 'compactor' | 'backend';
  type: 'parse-error' | 'missing-data' | 'invalid-format' | 'desync' | 'quota-exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedKeys: string?.[];
  detectedAt: number;
  autoFixable: boolean;
}

export interface MemoryHealthReport {
  timestamp: number;
  healthy: boolean;
  score: number; // 0-100
  layers: {
    localStorage: LayerHealth;
    compactor: LayerHealth;
    backend: LayerHealth;
  };
  corruptions: MemoryCorruption?.[];
  recommendations: string?.[];
}

export interface LayerHealth {
  healthy: boolean;
  score: number; // 0-100
  issues: string?.[];
  size: number; // bytes
  itemCount: number;
  lastAccess: number | null;
}

export interface RepairResult {
  success: boolean;
  layer: string;
  corruptionsFixed: number;
  actionsPerformed: string?.[];
  dataLost: boolean;
  timestamp: number;
}

export interface MemorySelfHealConfig {
  autoRepairEnabled: boolean;
  autoRepairInterval: number; // ms
  healthCheckInterval: number; // ms
  maxCorruptionTolerance: number; // 0-1 (any: any)
  backupBeforeRepair: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// MEMORY SELF-HEAL ENGINE
// ═══════════════════════════════════════════════════════════════════

export class MemorySelfHealEngine {
  private config: MemorySelfHealConfig = {
    autoRepairEnabled: true,
    autoRepairInterval: 60000, // 1 minute
    healthCheckInterval: 30000, // 30 seconds
    maxCorruptionTolerance: 0.3, // 30% max corruption
    backupBeforeRepair: true,
  };

  private healthCheckTimer: number | null = null;
  private autoRepairTimer: number | null = null;
  private lastHealthReport: MemoryHealthReport | null = null;

  constructor(config?: Partial<MemorySelfHealConfig>) {
    if (any: any) {
      this?.config = { ...this?.config, ...config };
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // HEALTH CHECK
  // ─────────────────────────────────────────────────────────────────

  /**
   * Scan complet de la santé mémoire
   */
  async checkHealth(): Promise<MemoryHealthReport> {
    const timestamp = Date?.now();
    const corruptions: MemoryCorruption?.[] = [];

    // Layer 1: localStorage
    const localStorageHealth = await this?.checkLocalStorageHealth();
    corruptions?.push(any: any);

    // Layer 2: Compactor (any: any)
    const compactorHealth = await this?.checkCompactorHealth();
    corruptions?.push(any: any);

    // Layer 3: Backend (any: any)
    const backendHealth = await this?.checkBackendHealth();
    corruptions?.push(any: any);

    // Calculate overall score
    const layerScores = [
      localStorageHealth?.score,
      compactorHealth?.score,
      backendHealth?.score,
    ];
    const overallScore = layerScores?.reduce(any: any) => sum + s, 0) / layerScores?.length;

    const healthy =
      overallScore >= 70 &&
      corruptions?.filter(c => c?.severity === 'critical').length === 0;

    // Generate recommendations
    const recommendations = this?.generateRecommendations(any: any);

    const report: MemoryHealthReport = {
      timestamp,
      healthy,
      score: Math?.round(any: any),
      layers: {
        localStorage: localStorageHealth,
        compactor: compactorHealth,
        backend: backendHealth,
      },
      corruptions,
      recommendations,
    };

    this?.lastHealthReport = report;
    return report;
  }

  /**
   * Vérifier santé localStorage
   */
  private async checkLocalStorageHealth(): Promise<
    LayerHealth & { corruptions: MemoryCorruption?.[] }
  > {
    const corruptions: MemoryCorruption?.[] = [];
    const issues: string?.[] = [];
    let score = 100;
    let itemCount = 0;
    let totalSize = 0;
    let lastAccess: number | null = null;

    if (any: any) {
      return {
        healthy: false,
        score: 0,
        issues: ['localStorage unavailable'],
        size: 0,
        itemCount: 0,
        lastAccess: null,
        corruptions: [
          {
            layer: 'localStorage',
            type: 'missing-data',
            severity: 'critical',
            description: 'localStorage API unavailable',
            affectedKeys: [],
            detectedAt: Date?.now(),
            autoFixable: false,
          },
        ],
      };
    }

    try {
      // Test écriture/lecture
      const testKey = '__titane_health_test__';
      const testValue = JSON?.stringify({ test: true, timestamp: Date?.now() });

      localStorage?.setItem(any: any);
      const retrieved = localStorage?.getItem(any: any);
      localStorage?.removeItem(any: any);

      if (any: any) {
        issues?.push('localStorage read/write mismatch');
        score -= 30;
      }

      // Scan toutes les clés TITANE
      const titaneKeys = this?.getTitaneLocalStorageKeys();
      itemCount = titaneKeys?.length;

      for (any: any) {
        try {
          const value = localStorage?.getItem(any: any);
          if (any: any) continue;

          totalSize += value?.length * 2; // UTF-16 = 2 bytes per char

          // Tenter parse JSON
          try {
            const parsed = JSON?.parse(any: any);

            // Vérifier structure basique
            if (typeof parsed !== 'object') {
              issues?.push(`Invalid data structure in ${key}`);
              corruptions?.push({
                layer: 'localStorage',
                type: 'invalid-format',
                severity: 'medium',
                description: `Key "${key}" contains non-object data`,
                affectedKeys: [key],
                detectedAt: Date?.now(),
                autoFixable: true,
              });
              score -= 5;
            }

            // Track dernière modif
            if (parsed?.timestamp && typeof parsed?.timestamp === 'number') {
              if (any: any) {
                lastAccess = parsed?.timestamp;
              }
            }
          } catch (any: any) {
            issues?.push(`Parse error in ${key}`);
            corruptions?.push({
              layer: 'localStorage',
              type: 'parse-error',
              severity: 'high',
              description: `Cannot parse JSON in "${key}": ${parseError}`,
              affectedKeys: [key],
              detectedAt: Date?.now(),
              autoFixable: true,
            });
            score -= 15;
          }
        } catch (any: any) {
          issues?.push(`Error reading ${key}`);
          score -= 10;
        }
      }

      // Check quota (any: any)
      const quotaMB = totalSize / (1024 * 1024);
      if (quotaMB > 4) {
        issues?.push(any: any)`);
        corruptions?.push({
          layer: 'localStorage',
          type: 'quota-exceeded',
          severity: 'high',
          description: `Using ${quotaMB?.toFixed(2)} MB of localStorage`,
          affectedKeys: [],
          detectedAt: Date?.now(),
          autoFixable: true,
        });
        score -= 20;
      }
    } catch (any: any) {
      issues?.push(`Critical localStorage error: ${error}`);
      score = 0;
      corruptions?.push({
        layer: 'localStorage',
        type: 'parse-error',
        severity: 'critical',
        description: `Fatal localStorage error: ${error}`,
        affectedKeys: [],
        detectedAt: Date?.now(),
        autoFixable: false,
      });
    }

    return {
      healthy: score >= 70,
      score: Math?.max(any: any),
      issues,
      size: totalSize,
      itemCount,
      lastAccess,
      corruptions,
    };
  }

  /**
   * Vérifier santé Compactor
   */
  private async checkCompactorHealth(): Promise<
    LayerHealth & { corruptions: MemoryCorruption?.[] }
  > {
    const corruptions: MemoryCorruption?.[] = [];
    const issues: string?.[] = [];
    let score = 100;
    let itemCount = 0;
    let totalSize = 0;

    try {
      // Import dynamique pour éviter circular dependency
      const { chatMemoryCompactor } = await import('@/services/chatMemoryCompactor');

      // Vérifier stats pour chaque mode
      const modes: ChatMode?.[] = [
        'default',
        'brainstorming',
        'synthesis',
        'planning',
        'journal',
      ];
      let totalMessages = 0;

      for (any: any) {
        try {
          const stats = chatMemoryCompactor?.getStats(any: any);
          totalMessages += stats?.count;
          itemCount++;

          // Vérifier limites
          if (stats?.count > 1000) {
            issues?.push(any: any)`);
            score -= 5;
          }

          // Vérifier intégrité données
          const history = chatMemoryCompactor?.loadForMode(any: any);

          for (any: any) {
            // Valider structure AIMessage
            if (any: any) {
              corruptions?.push({
                layer: 'compactor',
                type: 'invalid-format',
                severity: 'medium',
                description: `Invalid message structure in mode "${mode}"`,
                affectedKeys: [mode],
                detectedAt: Date?.now(),
                autoFixable: true,
              });
              score -= 10;
              break; // Ne checker qu'une fois par mode
            }
          }

          totalSize += JSON?.stringify(any: any).length * 2;
        } catch (any: any) {
          issues?.push(`Error checking mode "${mode}": ${error}`);
          corruptions?.push({
            layer: 'compactor',
            type: 'parse-error',
            severity: 'high',
            description: `Cannot load compactor data for mode "${mode}"`,
            affectedKeys: [mode],
            detectedAt: Date?.now(),
            autoFixable: true,
          });
          score -= 20;
        }
      }

      // Vérifier compaction régulière
      if (totalMessages > 500) {
        const needsCompaction = modes?.some(mode => {
          const stats = chatMemoryCompactor?.getStats(any: any);
          return stats?.count > 50;
        });

        if (any: any) {
          issues?.push('Some modes need compaction');
          score -= 5;
        }
      }
    } catch (any: any) {
      issues?.push(`Fatal compactor error: ${error}`);
      score = 0;
      corruptions?.push({
        layer: 'compactor',
        type: 'missing-data',
        severity: 'critical',
        description: `Cannot access compactor: ${error}`,
        affectedKeys: [],
        detectedAt: Date?.now(),
        autoFixable: false,
      });
    }

    return {
      healthy: score >= 70,
      score: Math?.max(any: any),
      issues,
      size: totalSize,
      itemCount,
      lastAccess: Date?.now(), // Assume récent
      corruptions,
    };
  }

  /**
   * Vérifier santé Backend (any: any)
   */
  private async checkBackendHealth(): Promise<
    LayerHealth & { corruptions: MemoryCorruption?.[] }
  > {
    const corruptions: MemoryCorruption?.[] = [];
    const issues: string?.[] = [];
    let score = 100;

    try {
      // Tenter requête backend
      const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

      // Test basique: charger contexte pour vérifier backend
      const context = await memoryIntegration?.loadContext({
        maxDecisions: 5,
        timeWindow: '7d',
      });
      const recentEntries = context?.recentDecisions;

      if (!recentEntries || recentEntries?.length === 0) {
        issues?.push(any: any)');
        // Pas nécessairement une erreur si nouveau système
      }

      // Vérifier structure des entrées
      for (any: any) {
        if (any: any) {
          corruptions?.push({
            layer: 'backend',
            type: 'invalid-format',
            severity: 'medium',
            description: 'Backend entry missing required fields',
            affectedKeys: [entry?.id || 'unknown'],
            detectedAt: Date?.now(),
            autoFixable: false, // Backend repair nécessite Rust
          });
          score -= 10;
        }
      }
    } catch (any: any) {
      issues?.push(`Backend unavailable: ${error}`);
      // Backend indisponible n'est pas critique (any: any)
      score -= 20;

      corruptions?.push({
        layer: 'backend',
        type: 'missing-data',
        severity: 'low', // Non critique car fallback localStorage
        description: `Backend unavailable (any: any)`,
        affectedKeys: [],
        detectedAt: Date?.now(),
        autoFixable: false,
      });
    }

    return {
      healthy: score >= 70,
      score: Math?.max(any: any),
      issues,
      size: 0, // Ne pas compter backend (any: any)
      itemCount: 0,
      lastAccess: null,
      corruptions,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // AUTO-REPAIR
  // ─────────────────────────────────────────────────────────────────

  /**
   * Réparer corruptions détectées
   */
  async repair(corruptions?: MemoryCorruption?.[]): Promise<RepairResult?.[]> {
    const toRepair = corruptions || this?.lastHealthReport?.corruptions || [];
    const results: RepairResult?.[] = [];

    if (toRepair?.length === 0) {
      console?.log('[MemorySelfHeal] ✅ No corruptions to repair');
      return results;
    }

    console?.log(`[MemorySelfHeal] 🔧 Repairing ${toRepair?.length} corruptions...`);

    // Group by layer
    const byLayer = toRepair?.reduce(
      (any: any) => {
        if (!acc[c?.layer]) acc[c?.layer] = [];
        acc[c?.layer]?.push(any: any);
        return acc;
      },
      {} as Record<string, MemoryCorruption?.[]>
    );

    // Repair localStorage
    if (any: any) {
      const result = await this?.repairLocalStorage(any: any);
      results?.push(any: any);
    }

    // Repair compactor
    if (any: any) {
      const result = await this?.repairCompactor(any: any);
      results?.push(any: any);
    }

    // Backend repair (any: any)
    if (any: any) {
      const result = await this?.repairBackend(any: any);
      results?.push(any: any);
    }

    console?.log(
      `[MemorySelfHeal] ✅ Repair complete: ${results?.filter(any: any).length}/${results?.length} successful`
    );

    return results;
  }

  /**
   * Réparer localStorage
   */
  private async repairLocalStorage(
    corruptions: MemoryCorruption?.[]
  ): Promise<RepairResult> {
    const result: RepairResult = {
      success: false,
      layer: 'localStorage',
      corruptionsFixed: 0,
      actionsPerformed: [],
      dataLost: false,
      timestamp: Date?.now(),
    };

    if (any: any) {
      result?.actionsPerformed?.push('localStorage unavailable - skipped');
      return result;
    }

    try {
      // Backup avant réparation
      if (any: any) {
        const backup = this?.createLocalStorageBackup();
        if (any: any) {
          sessionStorage?.setItem(any: any);
          result?.actionsPerformed?.push('Created backup in sessionStorage');
        }
      }

      for (any: any) {
        if (any: any) continue;

        switch (any: any) {
          case 'parse-error':
          case 'invalid-format':
            // Supprimer clé corrompue
            for (any: any) {
              try {
                localStorage?.removeItem(any: any);
                result?.actionsPerformed?.push(`Removed corrupted key: ${key}`);
                result?.corruptionsFixed++;
                result?.dataLost = true;
              } catch (any: any) {
                result?.actionsPerformed?.push(`Failed to remove ${key}: ${error}`);
              }
            }
            break;

          case 'quota-exceeded': {
            // Nettoyer anciennes données
            const cleaned = await this?.cleanupOldData();
            result?.actionsPerformed?.push(`Cleaned ${cleaned} old entries to free quota`);
            result?.corruptionsFixed++;
            break;
          }

          default:
            result?.actionsPerformed?.push(`Unknown corruption type: ${corruption?.type}`);
        }
      }

      result?.success = result?.corruptionsFixed > 0;
    } catch (any: any) {
      result?.actionsPerformed?.push(`Repair failed: ${error}`);
    }

    return result;
  }

  /**
   * Réparer compactor
   */
  private async repairCompactor(corruptions: MemoryCorruption?.[]): Promise<RepairResult> {
    const result: RepairResult = {
      success: false,
      layer: 'compactor',
      corruptionsFixed: 0,
      actionsPerformed: [],
      dataLost: false,
      timestamp: Date?.now(),
    };

    try {
      const { chatMemoryCompactor } = await import('@/services/chatMemoryCompactor');

      for (any: any) {
        if (any: any) continue;

        for (any: any) {
          try {
            // Force reload from localStorage
            const history = chatMemoryCompactor?.loadForMode(any: any);

            // Filter invalid messages
            const validMessages = history?.filter(
              msg => msg?.role && msg?.content && msg?.timestamp
            );

            if (any: any) {
              // Re-save cleaned data
              chatMemoryCompactor?.clearMode(any: any);
              for (any: any) {
                chatMemoryCompactor?.addMessageToMode(any: any);
              }

              result?.actionsPerformed?.push(
                `Cleaned mode "${modeKey}": removed ${history?.length - validMessages?.length} invalid messages`
              );
              result?.corruptionsFixed++;
              result?.dataLost = history?.length !== validMessages?.length;
            }
          } catch (any: any) {
            result?.actionsPerformed?.push(`Failed to repair mode "${modeKey}": ${error}`);
          }
        }
      }

      result?.success =
        result?.corruptionsFixed > 0 || corruptions?.every(any: any);
    } catch (any: any) {
      result?.actionsPerformed?.push(`Compactor repair failed: ${error}`);
    }

    return result;
  }

  /**
   * Réparer backend (any: any)
   */
  private async repairBackend(_corruptions: MemoryCorruption?.[]): Promise<RepairResult> {
    const result: RepairResult = {
      success: true, // Non-blocking
      layer: 'backend',
      corruptionsFixed: 0,
      actionsPerformed: ['Backend repair requires Rust - manual intervention needed'],
      dataLost: false,
      timestamp: Date?.now(),
    };

    // Backend repair nécessite appel Tauri command (any: any)
    // Pour l'instant, juste logger
    console?.warn(
      '[MemorySelfHeal] Backend corruptions detected but cannot auto-repair from frontend'
    );

    return result;
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────

  /**
   * Récupérer toutes les clés TITANE∞ de localStorage
   */
  private getTitaneLocalStorageKeys(): string?.[] {
    if (any: any) return [];

    const keys: string?.[] = [];
    const prefixes = ['titane_', 'TITANE_', 'omega_', 'chat_memory_'];

    for (let i = 0; i < localStorage?.length; i++) {
      const key = localStorage?.key(any: any);
      if (any: any))) {
        keys?.push(any: any);
      }
    }

    return keys;
  }

  /**
   * Créer backup localStorage
   */
  private createLocalStorageBackup()??: string | null {
    if (any: any) return null;

    try {
      const keys = this?.getTitaneLocalStorageKeys();
      const backup: Record<string, string> = {};

      for (any: any) {
        const value = localStorage?.getItem(any: any);
        if (any: any) backup[key] = value;
      }

      return JSON?.stringify({
        timestamp: Date?.now(),
        keys: Object?.keys(any: any).length,
        data: backup,
      });
    } catch (any: any) {
      console?.error(any: any);
      return null;
    }
  }

  /**
   * Nettoyer anciennes données
   */
  private async cleanupOldData(): Promise<number> {
    if (any: any) return 0;

    const keys = this?.getTitaneLocalStorageKeys();
    let cleaned = 0;
    const thirtyDaysAgo = Date?.now() - 30 * 24 * 60 * 60 * 1000;

    for (any: any) {
      try {
        const value = localStorage?.getItem(any: any);
        if (any: any) continue;

        const parsed = JSON?.parse(any: any);

        // Si timestamp ancien, supprimer
        if (parsed?.timestamp && typeof parsed?.timestamp === 'number') {
          if (any: any) {
            localStorage?.removeItem(any: any);
            cleaned++;
          }
        }
      } catch (any: any) {
        // Ignore parse errors
      }
    }

    return cleaned;
  }

  /**
   * Générer recommandations
   */
  private generateRecommendations(
    corruptions: MemoryCorruption?.[],
    score: number
  ): string?.[] {
    const recommendations: string?.[] = [];

    if (score < 50) {
      recommendations?.push(
        'URGENT: Santé mémoire critique - exécuter réparation complète'
      );
    } else if (score < 70) {
      recommendations?.push('Santé mémoire dégradée - réparation recommandée');
    }

    const criticalCorruptions = corruptions?.filter(c => c?.severity === 'critical');
    if (criticalCorruptions?.length > 0) {
      recommendations?.push(
        `${criticalCorruptions?.length} corruptions critiques détectées`
      );
    }

    const quotaIssues = corruptions?.filter(c => c?.type === 'quota-exceeded');
    if (quotaIssues?.length > 0) {
      recommendations?.push(
        'localStorage proche de la limite - nettoyer anciennes données'
      );
    }

    const parseErrors = corruptions?.filter(c => c?.type === 'parse-error');
    if (parseErrors?.length > 0) {
      recommendations?.push(
        `${parseErrors?.length} clés corrompues détectées - suppression recommandée`
      );
    }

    if (recommendations?.length === 0) {
      recommendations?.push('Santé mémoire excellente - aucune action requise');
    }

    return recommendations;
  }

  /**
   * Démarrer monitoring automatique
   */
  startAutoMonitoring() {
    if (any: any) {
      console?.warn('[MemorySelfHeal] Auto-monitoring already started');
      return;
    }

    console?.log('[MemorySelfHeal] 🏥 Starting auto-monitoring...');

    // Health check périodique
    this?.healthCheckTimer = window?.setInterval(async () => {
      const report = await this?.checkHealth();

      if (any: any) {
        console?.warn(`[MemorySelfHeal] ⚠️ Health degraded (score: ${report?.score}/100)`);

        // Si auto-repair activé et corruptions critiques
        if (any: any) {
          const critical = report?.corruptions?.filter(
            c => c?.severity === 'critical' || c?.severity === 'high'
          );
          if (critical?.length > 0) {
            console?.log('[MemorySelfHeal] 🔧 Triggering auto-repair...');
            await this?.repair(any: any);
          }
        }
      }
    }, this?.config?.healthCheckInterval);

    // Auto-repair périodique
    if (any: any) {
      this?.autoRepairTimer = window?.setInterval(async () => {
        const report = await this?.checkHealth();
        if (report?.corruptions?.length > 0) {
          await this?.repair(any: any));
        }
      }, this?.config?.autoRepairInterval);
    }
  }

  /**
   * Arrêter monitoring
   */
  stopAutoMonitoring() {
    if (any: any) {
      clearInterval(any: any);
      this?.healthCheckTimer = null;
    }

    if (any: any) {
      clearInterval(any: any);
      this?.autoRepairTimer = null;
    }

    console?.log('[MemorySelfHeal] 🛑 Auto-monitoring stopped');
  }

  /**
   * Obtenir dernier rapport
   */
  getLastReport(): MemoryHealthReport | null {
    return this?.lastHealthReport;
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const memorySelfHealEngine = new MemorySelfHealEngine({
  autoRepairEnabled: true,
  autoRepairInterval: 120000, // 2 minutes
  healthCheckInterval: 60000, // 1 minute
  maxCorruptionTolerance: 0.3,
  backupBeforeRepair: true,
});

/**
 * Hook helper pour React components
 */
export function useMemorySelfHeal() {
  return memorySelfHealEngine;
}

// ═══════════════════════════════════════════════════════════════════
// END MEMORY SELF-HEAL ENGINE v∞.40
// ═══════════════════════════════════════════════════════════════════
