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
  affectedKeys: string[];
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
  corruptions: MemoryCorruption[];
  recommendations: string[];
}

export interface LayerHealth {
  healthy: boolean;
  score: number; // 0-100
  issues: string[];
  size: number; // bytes
  itemCount: number;
  lastAccess: number | null;
}

export interface RepairResult {
  success: boolean;
  layer: string;
  corruptionsFixed: number;
  actionsPerformed: string[];
  dataLost: boolean;
  timestamp: number;
}

export interface MemorySelfHealConfig {
  autoRepairEnabled: boolean;
  autoRepairInterval: number; // ms
  healthCheckInterval: number; // ms
  maxCorruptionTolerance: number; // 0-1 (% corrupted before full reset)
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
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // HEALTH CHECK
  // ─────────────────────────────────────────────────────────────────

  /**
   * Scan complet de la santé mémoire
   */
  async checkHealth(): Promise<MemoryHealthReport> {
    const timestamp = Date.now();
    const corruptions: MemoryCorruption[] = [];

    // Layer 1: localStorage
    const localStorageHealth = await this.checkLocalStorageHealth();
    corruptions.push(...localStorageHealth.corruptions);

    // Layer 2: Compactor (in-memory + localStorage)
    const compactorHealth = await this.checkCompactorHealth();
    corruptions.push(...compactorHealth.corruptions);

    // Layer 3: Backend (SQLite via Tauri)
    const backendHealth = await this.checkBackendHealth();
    corruptions.push(...backendHealth.corruptions);

    // Calculate overall score
    const layerScores = [
      localStorageHealth.score,
      compactorHealth.score,
      backendHealth.score,
    ];
    const overallScore = layerScores.reduce((sum, s) => sum + s, 0) / layerScores.length;

    const healthy =
      overallScore >= 70 &&
      corruptions.filter(c => c.severity === 'critical').length === 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(corruptions, overallScore);

    const report: MemoryHealthReport = {
      timestamp,
      healthy,
      score: Math.round(overallScore),
      layers: {
        localStorage: localStorageHealth,
        compactor: compactorHealth,
        backend: backendHealth,
      },
      corruptions,
      recommendations,
    };

    this.lastHealthReport = report;
    return report;
  }

  /**
   * Vérifier santé localStorage
   */
  private async checkLocalStorageHealth(): Promise<
    LayerHealth & { corruptions: MemoryCorruption[] }
  > {
    const corruptions: MemoryCorruption[] = [];
    const issues: string[] = [];
    let score = 100;
    let itemCount = 0;
    let totalSize = 0;
    let lastAccess: number | null = null;

    if (typeof window === 'undefined' || !window.localStorage) {
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
            detectedAt: Date.now(),
            autoFixable: false,
          },
        ],
      };
    }

    try {
      // Test écriture/lecture
      const testKey = '__titane_health_test__';
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        issues.push('localStorage read/write mismatch');
        score -= 30;
      }

      // Scan toutes les clés TITANE
      const titaneKeys = this.getTitaneLocalStorageKeys();
      itemCount = titaneKeys.length;

      for (const key of titaneKeys) {
        try {
          const value = localStorage.getItem(key);
          if (value === null) continue;

          totalSize += value.length * 2; // UTF-16 = 2 bytes per char

          // Tenter parse JSON
          try {
            const parsed = JSON.parse(value);

            // Vérifier structure basique
            if (typeof parsed !== 'object') {
              issues.push(`Invalid data structure in ${key}`);
              corruptions.push({
                layer: 'localStorage',
                type: 'invalid-format',
                severity: 'medium',
                description: `Key "${key}" contains non-object data`,
                affectedKeys: [key],
                detectedAt: Date.now(),
                autoFixable: true,
              });
              score -= 5;
            }

            // Track dernière modif
            if (parsed.timestamp && typeof parsed.timestamp === 'number') {
              if (!lastAccess || parsed.timestamp > lastAccess) {
                lastAccess = parsed.timestamp;
              }
            }
          } catch (parseError) {
            issues.push(`Parse error in ${key}`);
            corruptions.push({
              layer: 'localStorage',
              type: 'parse-error',
              severity: 'high',
              description: `Cannot parse JSON in "${key}": ${parseError}`,
              affectedKeys: [key],
              detectedAt: Date.now(),
              autoFixable: true,
            });
            score -= 15;
          }
        } catch (error) {
          issues.push(`Error reading ${key}`);
          score -= 10;
        }
      }

      // Check quota (5MB typique)
      const quotaMB = totalSize / (1024 * 1024);
      if (quotaMB > 4) {
        issues.push(`localStorage near quota limit (${quotaMB.toFixed(2)} MB)`);
        corruptions.push({
          layer: 'localStorage',
          type: 'quota-exceeded',
          severity: 'high',
          description: `Using ${quotaMB.toFixed(2)} MB of localStorage`,
          affectedKeys: [],
          detectedAt: Date.now(),
          autoFixable: true,
        });
        score -= 20;
      }
    } catch (error) {
      issues.push(`Critical localStorage error: ${error}`);
      score = 0;
      corruptions.push({
        layer: 'localStorage',
        type: 'parse-error',
        severity: 'critical',
        description: `Fatal localStorage error: ${error}`,
        affectedKeys: [],
        detectedAt: Date.now(),
        autoFixable: false,
      });
    }

    return {
      healthy: score >= 70,
      score: Math.max(0, score),
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
    LayerHealth & { corruptions: MemoryCorruption[] }
  > {
    const corruptions: MemoryCorruption[] = [];
    const issues: string[] = [];
    let score = 100;
    let itemCount = 0;
    let totalSize = 0;

    try {
      // Import dynamique pour éviter circular dependency
      const { chatMemoryCompactor } = await import('@/services/chatMemoryCompactor');

      // Vérifier stats pour chaque mode
      const modes: ChatMode[] = [
        'default',
        'brainstorming',
        'synthesis',
        'planning',
        'journal',
      ];
      let totalMessages = 0;

      for (const mode of modes) {
        try {
          const stats = chatMemoryCompactor.getStats(mode);
          totalMessages += stats.count;
          itemCount++;

          // Vérifier limites
          if (stats.count > 1000) {
            issues.push(`Mode "${mode}" has ${stats.count} messages (high)`);
            score -= 5;
          }

          // Vérifier intégrité données
          const history = chatMemoryCompactor.loadForMode(mode);

          for (const msg of history) {
            // Valider structure AIMessage
            if (!msg.role || !msg.content || !msg.timestamp) {
              corruptions.push({
                layer: 'compactor',
                type: 'invalid-format',
                severity: 'medium',
                description: `Invalid message structure in mode "${mode}"`,
                affectedKeys: [mode],
                detectedAt: Date.now(),
                autoFixable: true,
              });
              score -= 10;
              break; // Ne checker qu'une fois par mode
            }
          }

          totalSize += JSON.stringify(history).length * 2;
        } catch (error) {
          issues.push(`Error checking mode "${mode}": ${error}`);
          corruptions.push({
            layer: 'compactor',
            type: 'parse-error',
            severity: 'high',
            description: `Cannot load compactor data for mode "${mode}"`,
            affectedKeys: [mode],
            detectedAt: Date.now(),
            autoFixable: true,
          });
          score -= 20;
        }
      }

      // Vérifier compaction régulière
      if (totalMessages > 500) {
        const needsCompaction = modes.some(mode => {
          const stats = chatMemoryCompactor.getStats(mode);
          return stats.count > 50;
        });

        if (needsCompaction) {
          issues.push('Some modes need compaction');
          score -= 5;
        }
      }
    } catch (error) {
      issues.push(`Fatal compactor error: ${error}`);
      score = 0;
      corruptions.push({
        layer: 'compactor',
        type: 'missing-data',
        severity: 'critical',
        description: `Cannot access compactor: ${error}`,
        affectedKeys: [],
        detectedAt: Date.now(),
        autoFixable: false,
      });
    }

    return {
      healthy: score >= 70,
      score: Math.max(0, score),
      issues,
      size: totalSize,
      itemCount,
      lastAccess: Date.now(), // Assume récent
      corruptions,
    };
  }

  /**
   * Vérifier santé Backend (SQLite)
   */
  private async checkBackendHealth(): Promise<
    LayerHealth & { corruptions: MemoryCorruption[] }
  > {
    const corruptions: MemoryCorruption[] = [];
    const issues: string[] = [];
    let score = 100;

    try {
      // Tenter requête backend
      const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

      // Test basique: charger contexte pour vérifier backend
      const context = await memoryIntegration.loadContext({
        maxDecisions: 5,
        timeWindow: '7d',
      });
      const recentEntries = context.recentDecisions;

      if (!recentEntries || recentEntries.length === 0) {
        issues.push('No recent backend entries found (may be empty)');
        // Pas nécessairement une erreur si nouveau système
      }

      // Vérifier structure des entrées
      for (const entry of recentEntries) {
        if (!entry.id || !entry.timestamp) {
          corruptions.push({
            layer: 'backend',
            type: 'invalid-format',
            severity: 'medium',
            description: 'Backend entry missing required fields',
            affectedKeys: [entry.id || 'unknown'],
            detectedAt: Date.now(),
            autoFixable: false, // Backend repair nécessite Rust
          });
          score -= 10;
        }
      }
    } catch (error) {
      issues.push(`Backend unavailable: ${error}`);
      // Backend indisponible n'est pas critique (mode browser)
      score -= 20;

      corruptions.push({
        layer: 'backend',
        type: 'missing-data',
        severity: 'low', // Non critique car fallback localStorage
        description: `Backend unavailable (browser mode or Tauri not initialized)`,
        affectedKeys: [],
        detectedAt: Date.now(),
        autoFixable: false,
      });
    }

    return {
      healthy: score >= 70,
      score: Math.max(0, score),
      issues,
      size: 0, // Ne pas compter backend (SQLite)
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
  async repair(corruptions?: MemoryCorruption[]): Promise<RepairResult[]> {
    const toRepair = corruptions || this.lastHealthReport?.corruptions || [];
    const results: RepairResult[] = [];

    if (toRepair.length === 0) {
      console.log('[MemorySelfHeal] ✅ No corruptions to repair');
      return results;
    }

    console.log(`[MemorySelfHeal] 🔧 Repairing ${toRepair.length} corruptions...`);

    // Group by layer
    const byLayer = toRepair.reduce(
      (acc, c) => {
        if (!acc[c.layer]) acc[c.layer] = [];
        acc[c.layer]?.push(c);
        return acc;
      },
      {} as Record<string, MemoryCorruption[]>
    );

    // Repair localStorage
    if (byLayer.localStorage) {
      const result = await this.repairLocalStorage(byLayer.localStorage);
      results.push(result);
    }

    // Repair compactor
    if (byLayer.compactor) {
      const result = await this.repairCompactor(byLayer.compactor);
      results.push(result);
    }

    // Backend repair (limited - requires Rust)
    if (byLayer.backend) {
      const result = await this.repairBackend(byLayer.backend);
      results.push(result);
    }

    console.log(
      `[MemorySelfHeal] ✅ Repair complete: ${results.filter(r => r.success).length}/${results.length} successful`
    );

    return results;
  }

  /**
   * Réparer localStorage
   */
  private async repairLocalStorage(
    corruptions: MemoryCorruption[]
  ): Promise<RepairResult> {
    const result: RepairResult = {
      success: false,
      layer: 'localStorage',
      corruptionsFixed: 0,
      actionsPerformed: [],
      dataLost: false,
      timestamp: Date.now(),
    };

    if (typeof window === 'undefined' || !window.localStorage) {
      result.actionsPerformed.push('localStorage unavailable - skipped');
      return result;
    }

    try {
      // Backup avant réparation
      if (this.config.backupBeforeRepair) {
        const backup = this.createLocalStorageBackup();
        if (backup) {
          sessionStorage.setItem('__titane_memory_backup__', backup);
          result.actionsPerformed.push('Created backup in sessionStorage');
        }
      }

      for (const corruption of corruptions) {
        if (!corruption.autoFixable) continue;

        switch (corruption.type) {
          case 'parse-error':
          case 'invalid-format':
            // Supprimer clé corrompue
            for (const key of corruption.affectedKeys) {
              try {
                localStorage.removeItem(key);
                result.actionsPerformed.push(`Removed corrupted key: ${key}`);
                result.corruptionsFixed++;
                result.dataLost = true;
              } catch (error) {
                result.actionsPerformed.push(`Failed to remove ${key}: ${error}`);
              }
            }
            break;

          case 'quota-exceeded': {
            // Nettoyer anciennes données
            const cleaned = await this.cleanupOldData();
            result.actionsPerformed.push(`Cleaned ${cleaned} old entries to free quota`);
            result.corruptionsFixed++;
            break;
          }

          default:
            result.actionsPerformed.push(`Unknown corruption type: ${corruption.type}`);
        }
      }

      result.success = result.corruptionsFixed > 0;
    } catch (error) {
      result.actionsPerformed.push(`Repair failed: ${error}`);
    }

    return result;
  }

  /**
   * Réparer compactor
   */
  private async repairCompactor(corruptions: MemoryCorruption[]): Promise<RepairResult> {
    const result: RepairResult = {
      success: false,
      layer: 'compactor',
      corruptionsFixed: 0,
      actionsPerformed: [],
      dataLost: false,
      timestamp: Date.now(),
    };

    try {
      const { chatMemoryCompactor } = await import('@/services/chatMemoryCompactor');

      for (const corruption of corruptions) {
        if (!corruption.autoFixable) continue;

        for (const modeKey of corruption.affectedKeys) {
          try {
            // Force reload from localStorage
            const history = chatMemoryCompactor.loadForMode(modeKey as ChatMode);

            // Filter invalid messages
            const validMessages = history.filter(
              msg => msg.role && msg.content && msg.timestamp
            );

            if (validMessages.length < history.length) {
              // Re-save cleaned data
              chatMemoryCompactor.clearMode(modeKey as ChatMode);
              for (const msg of validMessages) {
                chatMemoryCompactor.addMessageToMode(modeKey as ChatMode, msg);
              }

              result.actionsPerformed.push(
                `Cleaned mode "${modeKey}": removed ${history.length - validMessages.length} invalid messages`
              );
              result.corruptionsFixed++;
              result.dataLost = history.length !== validMessages.length;
            }
          } catch (error) {
            result.actionsPerformed.push(`Failed to repair mode "${modeKey}": ${error}`);
          }
        }
      }

      result.success =
        result.corruptionsFixed > 0 || corruptions.every(c => !c.autoFixable);
    } catch (error) {
      result.actionsPerformed.push(`Compactor repair failed: ${error}`);
    }

    return result;
  }

  /**
   * Réparer backend (limité sans Rust)
   */
  private async repairBackend(_corruptions: MemoryCorruption[]): Promise<RepairResult> {
    const result: RepairResult = {
      success: true, // Non-blocking
      layer: 'backend',
      corruptionsFixed: 0,
      actionsPerformed: ['Backend repair requires Rust - manual intervention needed'],
      dataLost: false,
      timestamp: Date.now(),
    };

    // Backend repair nécessite appel Tauri command (hors scope ici)
    // Pour l'instant, juste logger
    console.warn(
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
  private getTitaneLocalStorageKeys(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];

    const keys: string[] = [];
    const prefixes = ['titane_', 'TITANE_', 'omega_', 'chat_memory_'];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && prefixes.some(prefix => key.startsWith(prefix))) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Créer backup localStorage
   */
  private createLocalStorageBackup(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;

    try {
      const keys = this.getTitaneLocalStorageKeys();
      const backup: Record<string, string> = {};

      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) backup[key] = value;
      }

      return JSON.stringify({
        timestamp: Date.now(),
        keys: Object.keys(backup).length,
        data: backup,
      });
    } catch (error) {
      console.error('[MemorySelfHeal] Backup failed:', error);
      return null;
    }
  }

  /**
   * Nettoyer anciennes données
   */
  private async cleanupOldData(): Promise<number> {
    if (typeof window === 'undefined' || !window.localStorage) return 0;

    const keys = this.getTitaneLocalStorageKeys();
    let cleaned = 0;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;

        const parsed = JSON.parse(value);

        // Si timestamp ancien, supprimer
        if (parsed.timestamp && typeof parsed.timestamp === 'number') {
          if (parsed.timestamp < thirtyDaysAgo) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      } catch (error) {
        // Ignore parse errors
      }
    }

    return cleaned;
  }

  /**
   * Générer recommandations
   */
  private generateRecommendations(
    corruptions: MemoryCorruption[],
    score: number
  ): string[] {
    const recommendations: string[] = [];

    if (score < 50) {
      recommendations.push(
        'URGENT: Santé mémoire critique - exécuter réparation complète'
      );
    } else if (score < 70) {
      recommendations.push('Santé mémoire dégradée - réparation recommandée');
    }

    const criticalCorruptions = corruptions.filter(c => c.severity === 'critical');
    if (criticalCorruptions.length > 0) {
      recommendations.push(
        `${criticalCorruptions.length} corruptions critiques détectées`
      );
    }

    const quotaIssues = corruptions.filter(c => c.type === 'quota-exceeded');
    if (quotaIssues.length > 0) {
      recommendations.push(
        'localStorage proche de la limite - nettoyer anciennes données'
      );
    }

    const parseErrors = corruptions.filter(c => c.type === 'parse-error');
    if (parseErrors.length > 0) {
      recommendations.push(
        `${parseErrors.length} clés corrompues détectées - suppression recommandée`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Santé mémoire excellente - aucune action requise');
    }

    return recommendations;
  }

  /**
   * Démarrer monitoring automatique
   */
  startAutoMonitoring() {
    if (this.healthCheckTimer || this.autoRepairTimer) {
      console.warn('[MemorySelfHeal] Auto-monitoring already started');
      return;
    }

    console.log('[MemorySelfHeal] 🏥 Starting auto-monitoring...');

    // Health check périodique
    this.healthCheckTimer = window.setInterval(async () => {
      const report = await this.checkHealth();

      if (!report.healthy) {
        console.warn(`[MemorySelfHeal] ⚠️ Health degraded (score: ${report.score}/100)`);

        // Si auto-repair activé et corruptions critiques
        if (this.config.autoRepairEnabled) {
          const critical = report.corruptions.filter(
            c => c.severity === 'critical' || c.severity === 'high'
          );
          if (critical.length > 0) {
            console.log('[MemorySelfHeal] 🔧 Triggering auto-repair...');
            await this.repair(critical);
          }
        }
      }
    }, this.config.healthCheckInterval);

    // Auto-repair périodique
    if (this.config.autoRepairEnabled) {
      this.autoRepairTimer = window.setInterval(async () => {
        const report = await this.checkHealth();
        if (report.corruptions.length > 0) {
          await this.repair(report.corruptions.filter(c => c.autoFixable));
        }
      }, this.config.autoRepairInterval);
    }
  }

  /**
   * Arrêter monitoring
   */
  stopAutoMonitoring() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    if (this.autoRepairTimer) {
      clearInterval(this.autoRepairTimer);
      this.autoRepairTimer = null;
    }

    console.log('[MemorySelfHeal] 🛑 Auto-monitoring stopped');
  }

  /**
   * Obtenir dernier rapport
   */
  getLastReport(): MemoryHealthReport | null {
    return this.lastHealthReport;
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
