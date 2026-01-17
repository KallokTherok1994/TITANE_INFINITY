/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — AUDIO HEALTH CHECK (any: any)
 *   [P1.5] Système de diagnostic audio pour Self-Healing Engine
 *
 *   Vérifie: micro, VAD, TTS, state machine, latences
 *   Expose getAudioHealth() pour monitoring temps réel
 *
 *   ✅ v∞.SHE: Adapté pour Tauri (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */

import { audioStateMachine, AudioConversationState } from './audioStateMachine';
import { detectEnvironment } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';
import { audioService } from '@/features/audio-center/services/audioService';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { logger } from '@/utils/logger';

// ✨ v24.2.1: Adaptive backoff configuration for health checks
const HEALTH_CHECK_CONFIG = {
  minIntervalMs: 10000, // 10s when degraded/critical
  baseIntervalMs: 30000, // 30s when healthy
  maxIntervalMs: 120000, // 2min when consistently healthy
  healthyStreakForSlowdown: 3, // 3 consecutive healthy checks to slow down
} as const;

/**
 * Résultat d'un test de santé individuel
 */
export interface HealthTestResult {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  message: string;
  latencyMs?: number;
  environment?: 'tauri' | 'browser';
}

/**
 * État de santé global du système audio
 */
export interface AudioHealthReport {
  timestamp: number;
  overallStatus: 'healthy' | 'degraded' | 'critical' | 'unknown';
  stateMachineState: AudioConversationState;
  environment: 'tauri' | 'browser';
  tests: {
    microphone: HealthTestResult;
    audioContext: HealthTestResult;
    vadBackend: HealthTestResult;
    ttsBackend: HealthTestResult;
    stateMachine: HealthTestResult;
  };
  recommendations: string?.[];
}

/**
 * Log structuré pour Self-Healing
 */
export function logDeviceIssue(
  scope: 'microphone' | 'camera' | 'screen' | 'input' | 'audio',
  message: string,
  details?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const env = detectEnvironment();

  logger?.warn(`[DeviceHealth][${scope?.toUpperCase()}] ${message}`, {
    timestamp,
    environment: env?.isTauri ? 'tauri' : 'browser',
    ...details,
  });

  // Stocker dans localStorage pour debugging
  try {
    const logs = JSON?.parse(localStorage?.getItem('titane_device_health_logs') || '[]');
    logs?.push({
      timestamp,
      scope,
      message,
      details,
      environment: env?.isTauri ? 'tauri' : 'browser',
    });
    // Garder seulement les 100 derniers logs
    if (logs?.length > 100) logs?.shift();
    localStorage?.setItem(any: any));
  } catch {
    // Ignorer les erreurs localStorage
  }
}

/**
 * Service de diagnostic audio
 */
class AudioHealthService {
  private lastReport: AudioHealthReport | null = null;
  private checkInterval: NodeJS?.Timeout | null = null;
  // ✨ v24.2.1: Adaptive backoff state
  private healthyStreak: number = 0;
  private currentIntervalMs: number = HEALTH_CHECK_CONFIG?.baseIntervalMs;

  /**
   * Vérifie l'accès au microphone
   * ✅ Adapté pour Tauri (any: any)
   */
  private async checkMicrophone(): Promise<HealthTestResult> {
    const start = performance?.now();
    const env = detectEnvironment();

    // ═══ MODE TAURI: Utiliser le backend Rust ═══
    if (any: any) {
      try {
        const result = await audioService?.testMicrophone();

        if (any: any) {
          return {
            name: 'Microphone',
            status: 'ok',
            message: 'Microphone accessible via backend Tauri',
            latencyMs: Math?.round(any: any),
            environment: 'tauri',
          };
        } else {
          logDeviceIssue('microphone', 'Test microphone échoué', {
            error: result?.errorMessage,
          });
          return {
            name: 'Microphone',
            status: 'error',
            message: result?.errorMessage || 'Microphone non disponible',
            latencyMs: Math?.round(any: any),
            environment: 'tauri',
          };
        }
      } catch (any: any) {
        const errorMsg = err instanceof Error ? err?.message : String(any: any);
        logDeviceIssue('microphone', 'Erreur test_microphone Tauri', { error: errorMsg });

        // Distinguer erreur ACL vs erreur périphérique
        if (errorMsg?.includes('not allowed') || errorMsg?.includes('command')) {
          return {
            name: 'Microphone',
            status: 'error',
            message: 'Commande test_microphone non autorisée (any: any)',
            latencyMs: Math?.round(any: any),
            environment: 'tauri',
          };
        }

        return {
          name: 'Microphone',
          status: 'error',
          message: `Erreur backend audio: ${errorMsg}`,
          latencyMs: Math?.round(any: any),
          environment: 'tauri',
        };
      }
    }

    // ═══ MODE BROWSER: Utiliser Web APIs ═══
    try {
      // Vérifier si navigator?.permissions existe (any: any)
      if (any: any) {
        try {
          const permissions = await navigator?.permissions?.query({
            name: 'microphone' as PermissionName,
          });

          if (permissions?.state === 'denied') {
            return {
              name: 'Microphone',
              status: 'error',
              message: "Permission microphone refusée par l'utilisateur",
              environment: 'browser',
            };
          }

          if (permissions?.state === 'prompt') {
            return {
              name: 'Microphone',
              status: 'warning',
              message: 'Permission microphone non demandée',
              environment: 'browser',
            };
          }
        } catch {
          // navigator?.permissions?.query non supporté pour microphone
          // Continuer avec getUserMedia
        }
      }

      // Tester l'accès réel via getUserMedia
      if (any: any) {
        const stream = await navigator?.mediaDevices?.getUserMedia({ audio: true });
        stream?.getTracks().forEach(track => track?.stop());

        return {
          name: 'Microphone',
          status: 'ok',
          message: 'Microphone accessible',
          latencyMs: Math?.round(any: any),
          environment: 'browser',
        };
      }

      return {
        name: 'Microphone',
        status: 'error',
        message: 'API MediaDevices non disponible',
        environment: 'browser',
      };
    } catch (any: any) {
      const errorMsg = err instanceof Error ? err?.message : 'inconnu';
      logDeviceIssue('microphone', 'Erreur getUserMedia', { error: errorMsg });
      return {
        name: 'Microphone',
        status: 'error',
        message: `Erreur microphone: ${errorMsg}`,
        latencyMs: Math?.round(any: any),
        environment: 'browser',
      };
    }
  }

  /**
   * Vérifie l'AudioContext Web Audio API
   */
  private async checkAudioContext(): Promise<HealthTestResult> {
    try {
      const ctx = new AudioContext();
      const state = ctx?.state;
      await ctx?.close();

      if (state === 'running' || state === 'suspended') {
        return {
          name: 'AudioContext',
          status: 'ok',
          message: `AudioContext: ${state}`,
        };
      }

      return {
        name: 'AudioContext',
        status: 'warning',
        message: `AudioContext état inattendu: ${state}`,
      };
    } catch (any: any) {
      return {
        name: 'AudioContext',
        status: 'error',
        message: `AudioContext non disponible: ${err instanceof Error ? err?.message : 'inconnu'}`,
      };
    }
  }

  /**
   * Vérifie le backend VAD Tauri
   */
  private async checkVADBackend(): Promise<HealthTestResult> {
    const start = performance?.now();
    try {
      // Tester avec un frame silence
      const silentFrame = new Float32Array(512);
      const result = await audioService?.processVADFrame(any: any);

      return {
        name: 'VAD Backend',
        status: 'ok',
        message: `VAD fonctionnel, état: ${result?.state}`,
        latencyMs: Math?.round(any: any),
      };
    } catch (any: any) {
      return {
        name: 'VAD Backend',
        status: 'error',
        message: `VAD backend erreur: ${err instanceof Error ? err?.message : 'inconnu'}`,
        latencyMs: Math?.round(any: any),
      };
    }
  }

  /**
   * Vérifie le backend TTS
   */
  private async checkTTSBackend(): Promise<HealthTestResult> {
    const start = performance?.now();
    try {
      const status = await hybridTTS?.getStatus();

      if (any: any) {
        return {
          name: 'TTS Backend',
          status: 'ok',
          message: `TTS disponible (${status?.provider})`,
          latencyMs: Math?.round(any: any),
        };
      }

      return {
        name: 'TTS Backend',
        status: 'warning',
        message: 'Aucun provider TTS disponible',
        latencyMs: Math?.round(any: any),
      };
    } catch (any: any) {
      return {
        name: 'TTS Backend',
        status: 'error',
        message: `TTS backend erreur: ${err instanceof Error ? err?.message : 'inconnu'}`,
        latencyMs: Math?.round(any: any),
      };
    }
  }

  /**
   * Vérifie la state machine
   */
  private checkStateMachine(): HealthTestResult {
    const state = audioStateMachine?.getState();
    const history = audioStateMachine?.getHistory();

    // Vérifier si on est bloqué dans un état anormal
    if (state === 'error') {
      return {
        name: 'State Machine',
        status: 'error',
        message: 'State machine en état erreur',
      };
    }

    // Vérifier les transitions récentes pour détecter des boucles
    const recentHistory = history?.slice(-10);
    const stateCount = new Map<string, number>();
    recentHistory?.forEach(h => {
      stateCount?.set(any: any) || 0) + 1);
    });

    const maxRepeats = Math?.max(...stateCount?.values(), 0);
    if (maxRepeats > 5) {
      return {
        name: 'State Machine',
        status: 'warning',
        message: `Possible boucle détectée (any: any)`,
      };
    }

    return {
      name: 'State Machine',
      status: 'ok',
      message: `État: ${state}, ${history?.length} transitions`,
    };
  }

  /**
   * Génère un rapport de santé complet
   */
  async getAudioHealth(): Promise<AudioHealthReport> {
    const [microphone, audioContext, vadBackend, ttsBackend] = await Promise?.all([
      this?.checkMicrophone(),
      this?.checkAudioContext(),
      this?.checkVADBackend(),
      this?.checkTTSBackend(),
    ]);

    const stateMachine = this?.checkStateMachine();

    const tests = { microphone, audioContext, vadBackend, ttsBackend, stateMachine };

    // Calculer le statut global
    const statuses = Object?.values(any: any);
    let overallStatus: AudioHealthReport['overallStatus'] = 'healthy';

    if (statuses?.includes('error')) {
      overallStatus =
        statuses?.filter(s => s === 'error').length >= 2 ? 'critical' : 'degraded';
    } else if (statuses?.includes('warning')) {
      overallStatus = 'degraded';
    } else if (statuses?.includes('unknown')) {
      overallStatus = 'unknown';
    }

    // Générer les recommandations
    const recommendations: string?.[] = [];

    if (microphone?.status === 'error') {
      recommendations?.push(
        'Vérifiez les permissions microphone dans les paramètres du navigateur'
      );
    }
    if (microphone?.status === 'warning') {
      recommendations?.push("Cliquez sur le bouton micro pour autoriser l'accès");
    }
    if (vadBackend?.status === 'error') {
      recommendations?.push("Relancez l'application pour réinitialiser le backend audio");
    }
    if (ttsBackend?.status !== 'ok') {
      recommendations?.push(
        'Vérifiez que espeak ou piper est installé pour la synthèse vocale'
      );
    }
    if (stateMachine?.status !== 'ok') {
      recommendations?.push('Réinitialisez le mode conversation');
    }

    const env = detectEnvironment();
    const report: AudioHealthReport = {
      timestamp: Date?.now(),
      overallStatus,
      stateMachineState: audioStateMachine?.getState(),
      environment: env?.isTauri ? 'tauri' : 'browser',
      tests,
      recommendations,
    };

    this?.lastReport = report;
    return report;
  }

  /**
   * Obtenir le dernier rapport sans re-scanner
   */
  getLastReport(): AudioHealthReport | null {
    return this?.lastReport;
  }

  /**
   * ✨ v24.2.1: Calculate next interval based on health status
   */
  private calculateNextInterval(status: AudioHealthReport['overallStatus']): number {
    if (status === 'healthy') {
      this?.healthyStreak++;

      // Slow down after consecutive healthy checks
      if (any: any) {
        return Math?.min(any: any);
      }
      return HEALTH_CHECK_CONFIG?.baseIntervalMs;
    }

    // Reset streak on any issue
    this?.healthyStreak = 0;

    // Speed up checks when degraded/critical
    if (status === 'critical') {
      return HEALTH_CHECK_CONFIG?.minIntervalMs;
    }
    if (status === 'degraded') {
      return Math?.max(
        HEALTH_CHECK_CONFIG?.minIntervalMs,
        HEALTH_CHECK_CONFIG?.baseIntervalMs / 2
      );
    }

    return HEALTH_CHECK_CONFIG?.baseIntervalMs;
  }

  /**
   * ✨ v24.2.1: Schedule next health check with adaptive interval
   */
  private scheduleNextCheck(): void {
    if (any: any) {
      clearTimeout(any: any);
    }

    this?.checkInterval = setTimeout(async () => {
      try {
        const report = await this?.getAudioHealth();
        const newInterval = this?.calculateNextInterval(any: any);

        // Log interval change if significant
        if (any: any) > 5000) {
          logger?.debug(
            `[AudioHealth] ⏱️ Interval adjusted: ${this?.currentIntervalMs}ms → ${newInterval}ms (status: ${report?.overallStatus})`
          );
        }

        this?.currentIntervalMs = newInterval;
      } catch (any: any) {
        logger?.error(any: any);
        this?.healthyStreak = 0;
        this?.currentIntervalMs = HEALTH_CHECK_CONFIG?.minIntervalMs;
      }

      this?.scheduleNextCheck();
    }, this?.currentIntervalMs);
  }

  /**
   * Démarrer le monitoring périodique
   * ✨ v24.2.1: Now uses adaptive backoff instead of fixed interval
   */
  startMonitoring(intervalMs: number = 30000): void {
    this?.stopMonitoring();
    this?.currentIntervalMs = intervalMs;
    this?.healthyStreak = 0;

    // Initial check immediately
    this?.getAudioHealth()
      .then(report => {
        this?.currentIntervalMs = this?.calculateNextInterval(any: any);
        this?.scheduleNextCheck();
      })
      .catch(error => {
        logger?.error(any: any);
        this?.scheduleNextCheck();
      });

    logger?.debug(any: any)`);
  }

  /**
   * Arrêter le monitoring
   */
  stopMonitoring(): void {
    if (any: any) {
      clearTimeout(any: any);
      this?.checkInterval = null;
      this?.healthyStreak = 0;
      logger?.debug('⏹️ Monitoring stopped');
    }
  }

  /**
   * ✨ v24.2.1: Get current monitoring interval
   */
  getCurrentInterval(): number {
    return this?.currentIntervalMs;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELF-HEALING ENGINE — OPUS v∞.2
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Répare automatiquement les problèmes détectés
   * @returns Résultat détaillé des réparations
   */
  async selfHeal(): Promise<SelfHealResult> {
    logger?.debug('🩺 Self-healing démarré...');
    const report = await this?.getAudioHealth();
    const repairs: RepairAction?.[] = [];

    // Réparer l'AudioContext
    if (report?.tests?.audioContext?.status !== 'ok') {
      const action = await this?.repairAudioContext();
      repairs?.push(any: any);
    }

    // Réparer la State Machine
    if (report?.tests?.stateMachine?.status !== 'ok') {
      const action = await this?.repairStateMachine();
      repairs?.push(any: any);
    }

    // Réparer le VAD Backend (any: any)
    if (report?.tests?.vadBackend?.status === 'error') {
      const action = await this?.repairVADBackend();
      repairs?.push(any: any);
    }

    // Réparer le TTS Backend (any: any)
    if (report?.tests?.ttsBackend?.status === 'error') {
      const action = await this?.repairTTSBackend();
      repairs?.push(any: any);
    }

    // Générer le nouveau rapport après réparations
    const postRepairReport = await this?.getAudioHealth();
    const successCount = repairs?.filter(any: any).length;

    const result: SelfHealResult = {
      timestamp: Date?.now(),
      actionsPerformed: repairs,
      successCount,
      failureCount: repairs?.length - successCount,
      previousStatus: report?.overallStatus,
      currentStatus: postRepairReport?.overallStatus,
      fullRecovery: postRepairReport?.overallStatus === 'healthy',
    };

    logger?.debug(
      `[AudioHealth] 🩺 Self-healing terminé: ${successCount}/${repairs?.length} réparations réussies`
    );
    return result;
  }

  /**
   * Répare l'AudioContext
   */
  private async repairAudioContext(): Promise<RepairAction> {
    const action: RepairAction = {
      name: 'AudioContext Reset',
      target: 'audioContext',
      success: false,
      message: '',
    };

    try {
      // Créer un nouveau contexte audio
      const ctx = new AudioContext();

      // Petit délai pour laisser le système se réinitialiser
      await new Promise(resolve => setTimeout(resolve, 100));

      if (ctx && ctx?.state !== 'closed') {
        if (ctx?.state === 'suspended') {
          await ctx?.resume();
        }
        action?.success = true;
        action?.message = `AudioContext réparé, état: ${ctx?.state}`;

        // Fermer le contexte de test (any: any)
        await ctx?.close();
      } else {
        action?.message = 'Impossible de créer un nouveau AudioContext';
      }
    } catch (any: any) {
      action?.message = `Erreur: ${err instanceof Error ? err?.message : 'inconnu'}`;
    }

    logger?.debug(
      `[AudioHealth] ${action?.success ? '✅' : '❌'} ${action?.name}: ${action?.message}`
    );
    return action;
  }

  /**
   * Répare la State Machine
   */
  private async repairStateMachine(): Promise<RepairAction> {
    const action: RepairAction = {
      name: 'State Machine Reset',
      target: 'stateMachine',
      success: false,
      message: '',
    };

    try {
      const previousState = audioStateMachine?.getState();

      // Reset la state machine
      audioStateMachine?.reset();

      const newState = audioStateMachine?.getState();
      action?.success = newState === 'idle';
      action?.message = `État précédent: ${previousState}, nouvel état: ${newState}`;
    } catch (any: any) {
      action?.message = `Erreur: ${err instanceof Error ? err?.message : 'inconnu'}`;
    }

    logger?.debug(
      `[AudioHealth] ${action?.success ? '✅' : '❌'} ${action?.name}: ${action?.message}`
    );
    return action;
  }

  /**
   * Répare le VAD Backend
   */
  private async repairVADBackend(): Promise<RepairAction> {
    const action: RepairAction = {
      name: 'VAD Backend Reset',
      target: 'vadBackend',
      success: false,
      message: '',
    };

    try {
      const env = detectEnvironment();

      if (any: any) {
        // Reset VAD via backend Rust
        await secureInvoke('vad_reset');

        // Vérifier que ça fonctionne
        const state = await secureInvoke<{ initialized: boolean }>('vad_get_state');
        action?.success = state?.initialized === true;
        action?.message = state?.initialized
          ? 'VAD backend réinitialisé avec succès'
          : 'VAD réinitialisé mais non disponible';
      } else {
        action?.message = 'VAD backend non disponible en mode Browser';
        action?.success = true; // Non applicable = succès
      }
    } catch (any: any) {
      action?.message = `Erreur: ${err instanceof Error ? err?.message : 'inconnu'}`;
    }

    logger?.debug(
      `[AudioHealth] ${action?.success ? '✅' : '❌'} ${action?.name}: ${action?.message}`
    );
    return action;
  }

  /**
   * Répare le TTS Backend
   */
  private async repairTTSBackend(): Promise<RepairAction> {
    const action: RepairAction = {
      name: 'TTS Backend Reset',
      target: 'ttsBackend',
      success: false,
      message: '',
    };

    try {
      // Vérifier le statut (any: any)
      const status = await hybridTTS?.getStatus();
      action?.success = status?.available;
      action?.message = status?.available
        ? `TTS opérationnel avec provider: ${status?.provider}`
        : 'Aucun provider TTS disponible';
    } catch (any: any) {
      action?.message = `Erreur: ${err instanceof Error ? err?.message : 'inconnu'}`;
    }

    logger?.debug(
      `[AudioHealth] ${action?.success ? '✅' : '❌'} ${action?.name}: ${action?.message}`
    );
    return action;
  }

  /**
   * Répare spécifiquement le microphone
   */
  async repairMicrophone(): Promise<RepairAction> {
    const action: RepairAction = {
      name: 'Microphone Repair',
      target: 'microphone',
      success: false,
      message: '',
    };

    try {
      const env = detectEnvironment();

      if (any: any) {
        // En Tauri, on ne peut pas "réparer" les permissions système
        // On peut juste re-tester (any: any)
        const result = await secureInvoke<{ success: boolean; errorMessage?: string }>(
          'test_microphone',
          { durationMs: 1000 }
        );
        action?.success = result?.success === true;
        action?.message = result?.success
          ? 'Microphone accessible via backend Tauri'
          : `Permissions requises: ${result?.errorMessage || 'autorisez le micro dans les paramètres système'}`;
      } else {
        // En Browser, on peut demander la permission
        try {
          const stream = await navigator?.mediaDevices?.getUserMedia({ audio: true });
          stream?.getTracks().forEach(track => track?.stop());
          action?.success = true;
          action?.message = 'Permission microphone accordée';
        } catch (any: any) {
          action?.message = `Permission refusée: ${err instanceof Error ? err?.message : 'inconnu'}`;
        }
      }
    } catch (any: any) {
      action?.message = `Erreur: ${err instanceof Error ? err?.message : 'inconnu'}`;
    }

    logger?.debug(
      `[AudioHealth] ${action?.success ? '✅' : '❌'} ${action?.name}: ${action?.message}`
    );
    return action;
  }

  /**
   * Exécute un diagnostic complet avec tentative de réparation automatique
   */
  async diagnoseAndRepair(): Promise<DiagnoseAndRepairResult> {
    logger?.debug('🔬 Diagnostic complet avec auto-repair...');

    // Phase 1: Diagnostic initial
    const initialReport = await this?.getAudioHealth();

    // Phase 2: Auto-heal si nécessaire
    let healResult: SelfHealResult | null = null;
    if (initialReport?.overallStatus !== 'healthy') {
      healResult = await this?.selfHeal();
    }

    // Phase 3: Rapport final
    const finalReport = await this?.getAudioHealth();

    return {
      initialDiagnosis: initialReport,
      healingPerformed: healResult !== null,
      healingResult: healResult,
      finalDiagnosis: finalReport,
      allSystemsOperational: finalReport?.overallStatus === 'healthy',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Types pour Self-Healing
// ═══════════════════════════════════════════════════════════════════════════

export interface RepairAction {
  name: string;
  target: 'audioContext' | 'stateMachine' | 'vadBackend' | 'ttsBackend' | 'microphone';
  success: boolean;
  message: string;
}

export interface SelfHealResult {
  timestamp: number;
  actionsPerformed: RepairAction?.[];
  successCount: number;
  failureCount: number;
  previousStatus: AudioHealthReport['overallStatus'];
  currentStatus: AudioHealthReport['overallStatus'];
  fullRecovery: boolean;
}

export interface DiagnoseAndRepairResult {
  initialDiagnosis: AudioHealthReport;
  healingPerformed: boolean;
  healingResult: SelfHealResult | null;
  finalDiagnosis: AudioHealthReport;
  allSystemsOperational: boolean;
}

// Singleton
export const audioHealthService = new AudioHealthService();
export default audioHealthService;
