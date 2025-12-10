/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v21 — ADAPTIVE BRIDGE
 *   TypeScript API pour l'AdaptiveOptimizationEngine
 *   Auto-optimisation et apprentissage interne
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { TAURI_COMMANDS } from '@/core/commands/TAURI_COMMANDS';

// ═══════════════════════════════════════════════════════════════════
//   INTERFACES TYPESCRIPT — SYNCHRONISÉES AVEC RUST
// ═══════════════════════════════════════════════════════════════════

/**
 * Échantillon de performance système
 */
export interface SystemPerformanceSample {
  timestamp: number;
  cpu_load: number;
  memory_usage: number;
  latency_ai: number;
  latency_tauri_invoke: number;
  ui_fps: number;
  sync_quality: number;
  cognitive_stability: number;
  hash_integrity_ok: boolean;
}

/**
 * Style de préférence IA
 */
export type AiPreference = 'Aggressive' | 'Balanced' | 'Conservative';

/**
 * Mode de comportement système
 */
export type SystemBehaviorMode = 'Speed' | 'Stability' | 'Reliability' | 'Adaptive';

/**
 * Biais d'optimisation
 */
export type OptimizationBias =
  | 'Performance'
  | 'Consistency'
  | 'UserExperience'
  | 'Balanced';

/**
 * Profil de préférences d'adaptation
 */
export interface PreferenceProfile {
  ai_style: AiPreference;
  system_mode: SystemBehaviorMode;
  optimization_bias: OptimizationBias;
  auto_learn: boolean;
}

/**
 * Résumé de l'état adaptatif
 */
export interface AdaptiveSummary {
  total_samples: number;
  optimization_cycles: number;
  patterns_detected: number;
  active_rules: number;
  avg_cpu_load: number;
  avg_ai_latency: number;
  current_mode: string;
  latest_sample: SystemPerformanceSample | null;
}

// ═══════════════════════════════════════════════════════════════════
//   ADAPTIVE BRIDGE v21 — API PRINCIPALE
// ═══════════════════════════════════════════════════════════════════

export class AdaptiveBridgeV21 {
  /**
   * Récupère le profil d'adaptation actuel
   */
  static async getProfile(): Promise<PreferenceProfile> {
    return await secureInvoke<PreferenceProfile>(TAURI_COMMANDS.ADAPTIVE_GET_PROFILE);
  }

  /**
   * Définit le mode système d'adaptation
   */
  static async setMode(mode: SystemBehaviorMode): Promise<void> {
    const modeStr = mode.toLowerCase();
    await secureInvoke(TAURI_COMMANDS.ADAPTIVE_SET_MODE, { mode: modeStr });
  }

  /**
   * Lance un cycle d'apprentissage manuel
   */
  static async learn(): Promise<string> {
    return await secureInvoke<string>(TAURI_COMMANDS.ADAPTIVE_LEARN);
  }

  /**
   * Exécute une optimisation manuelle
   */
  static async runOptimization(): Promise<string[]> {
    return await secureInvoke<string[]>(TAURI_COMMANDS.ADAPTIVE_RUN_OPTIMIZATION);
  }

  /**
   * Récupère l'historique de performance récent
   */
  static async getHistory(limit?: number): Promise<SystemPerformanceSample[]> {
    return await secureInvoke<SystemPerformanceSample[]>(
      TAURI_COMMANDS.ADAPTIVE_GET_HISTORY,
      {
        limit,
      }
    );
  }

  /**
   * Capture un échantillon de performance
   */
  static async captureSample(sample: SystemPerformanceSample): Promise<void> {
    await secureInvoke(TAURI_COMMANDS.ADAPTIVE_CAPTURE_SAMPLE, { sample });
  }

  /**
   * Récupère un résumé de l'état adaptatif
   */
  static async getSummary(): Promise<AdaptiveSummary> {
    return await secureInvoke<AdaptiveSummary>(TAURI_COMMANDS.ADAPTIVE_GET_SUMMARY);
  }

  // ═══════════════════════════════════════════════════════════════
  //   HELPERS — Fonctions utilitaires
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crée un échantillon de performance à partir des métriques actuelles
   */
  static createSample(metrics: {
    cpuLoad?: number;
    memoryUsage?: number;
    latencyAI?: number;
    latencyTauriInvoke?: number;
    uiFps?: number;
    syncQuality?: number;
    cognitiveStability?: number;
    hashIntegrityOk?: boolean;
  }): SystemPerformanceSample {
    return {
      timestamp: Date.now(),
      cpu_load: metrics.cpuLoad ?? 0,
      memory_usage: metrics.memoryUsage ?? 0,
      latency_ai: metrics.latencyAI ?? 0,
      latency_tauri_invoke: metrics.latencyTauriInvoke ?? 0,
      ui_fps: metrics.uiFps ?? 60,
      sync_quality: metrics.syncQuality ?? 1.0,
      cognitive_stability: metrics.cognitiveStability ?? 1.0,
      hash_integrity_ok: metrics.hashIntegrityOk ?? true,
    };
  }

  /**
   * Capture un échantillon automatique depuis les métriques
   */
  static async autoCaptureFromMetrics(metrics: {
    cpuLoad?: number;
    memoryUsage?: number;
    latencyAI?: number;
    latencyTauriInvoke?: number;
    uiFps?: number;
    syncQuality?: number;
    cognitiveStability?: number;
    hashIntegrityOk?: boolean;
  }): Promise<void> {
    const sample = this.createSample(metrics);
    await this.captureSample(sample);
  }

  /**
   * Récupère la santé globale du système adaptatif (0-1)
   */
  static async getAdaptiveHealth(): Promise<number> {
    const summary = await this.getSummary();

    // Calcul simple basé sur les métriques
    const cpuScore = Math.max(0, 1 - summary.avg_cpu_load);
    const latencyScore = Math.max(0, 1 - summary.avg_ai_latency / 10000);
    const samplesScore = Math.min(1, summary.total_samples / 100);

    return (cpuScore + latencyScore + samplesScore) / 3;
  }

  /**
   * Obtient la couleur de santé pour l'UI
   */
  static getHealthColor(health: number): string {
    if (health >= 0.8) return '#00ff88'; // Excellent
    if (health >= 0.6) return '#00ddff'; // Bon
    if (health >= 0.4) return '#ffaa00'; // Moyen
    return '#ff4444'; // Faible
  }

  /**
   * Formatte le mode système pour l'affichage
   */
  static formatMode(mode: SystemBehaviorMode): string {
    const labels: Record<SystemBehaviorMode, string> = {
      Speed: 'Vitesse',
      Stability: 'Stabilité',
      Reliability: 'Fiabilité',
      Adaptive: 'Adaptatif',
    };
    return (labels[mode] as string) || mode;
  }

  /**
   * Formatte le biais d'optimisation pour l'affichage
   */
  static formatBias(bias: OptimizationBias): string {
    const labels: Record<OptimizationBias, string> = {
      Performance: 'Performance',
      Consistency: 'Cohérence',
      UserExperience: 'Expérience Utilisateur',
      Balanced: 'Équilibré',
    };
    return labels[bias] || bias;
  }
}
