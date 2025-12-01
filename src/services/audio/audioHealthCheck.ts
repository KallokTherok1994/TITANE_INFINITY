/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — AUDIO HEALTH CHECK
 *   [P1.5] Système de diagnostic audio pour Self-Healing Engine
 *
 *   Vérifie: micro, VAD, TTS, state machine, latences
 *   Expose getAudioHealth() pour monitoring temps réel
 * ═══════════════════════════════════════════════════════════════════
 */

import { audioStateMachine, AudioConversationState } from './audioStateMachine';

/**
 * Résultat d'un test de santé individuel
 */
export interface HealthTestResult {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  message: string;
  latencyMs?: number;
}

/**
 * État de santé global du système audio
 */
export interface AudioHealthReport {
  timestamp: number;
  overallStatus: 'healthy' | 'degraded' | 'critical' | 'unknown';
  stateMachineState: AudioConversationState;
  tests: {
    microphone: HealthTestResult;
    audioContext: HealthTestResult;
    vadBackend: HealthTestResult;
    ttsBackend: HealthTestResult;
    stateMachine: HealthTestResult;
  };
  recommendations: string[];
}

/**
 * Service de diagnostic audio
 */
class AudioHealthService {
  private lastReport: AudioHealthReport | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Vérifie l'accès au microphone
   */
  private async checkMicrophone(): Promise<HealthTestResult> {
    const start = performance.now();
    try {
      // Vérifier si on a les permissions
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      if (permissions.state === 'denied') {
        return {
          name: 'Microphone',
          status: 'error',
          message: 'Permission microphone refusée',
        };
      }

      if (permissions.state === 'prompt') {
        return {
          name: 'Microphone',
          status: 'warning',
          message: 'Permission microphone non demandée',
        };
      }

      // Tester l'accès réel
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      return {
        name: 'Microphone',
        status: 'ok',
        message: 'Microphone accessible',
        latencyMs: Math.round(performance.now() - start),
      };
    } catch (err) {
      return {
        name: 'Microphone',
        status: 'error',
        message: `Erreur microphone: ${err instanceof Error ? err.message : 'inconnu'}`,
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  /**
   * Vérifie l'AudioContext Web Audio API
   */
  private async checkAudioContext(): Promise<HealthTestResult> {
    try {
      const ctx = new AudioContext();
      const state = ctx.state;
      await ctx.close();

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
    } catch (err) {
      return {
        name: 'AudioContext',
        status: 'error',
        message: `AudioContext non disponible: ${err instanceof Error ? err.message : 'inconnu'}`,
      };
    }
  }

  /**
   * Vérifie le backend VAD Tauri
   */
  private async checkVADBackend(): Promise<HealthTestResult> {
    const start = performance.now();
    try {
      // Import dynamique pour éviter les erreurs en mode browser
      const { audioService } = await import('@/features/audio-center/services/audioService');

      // Tester avec un frame silence
      const silentFrame = new Float32Array(512);
      const result = await audioService.processVADFrame(silentFrame);

      return {
        name: 'VAD Backend',
        status: 'ok',
        message: `VAD fonctionnel, état: ${result.state}`,
        latencyMs: Math.round(performance.now() - start),
      };
    } catch (err) {
      return {
        name: 'VAD Backend',
        status: 'error',
        message: `VAD backend erreur: ${err instanceof Error ? err.message : 'inconnu'}`,
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  /**
   * Vérifie le backend TTS
   */
  private async checkTTSBackend(): Promise<HealthTestResult> {
    const start = performance.now();
    try {
      const { hybridTTS } = await import('@/services/tts/hybridTTS');
      const status = await hybridTTS.getStatus();

      if (status.available) {
        return {
          name: 'TTS Backend',
          status: 'ok',
          message: `TTS disponible (${status.provider})`,
          latencyMs: Math.round(performance.now() - start),
        };
      }

      return {
        name: 'TTS Backend',
        status: 'warning',
        message: 'Aucun provider TTS disponible',
        latencyMs: Math.round(performance.now() - start),
      };
    } catch (err) {
      return {
        name: 'TTS Backend',
        status: 'error',
        message: `TTS backend erreur: ${err instanceof Error ? err.message : 'inconnu'}`,
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  /**
   * Vérifie la state machine
   */
  private checkStateMachine(): HealthTestResult {
    const state = audioStateMachine.getState();
    const history = audioStateMachine.getHistory();

    // Vérifier si on est bloqué dans un état anormal
    if (state === 'error') {
      return {
        name: 'State Machine',
        status: 'error',
        message: 'State machine en état erreur',
      };
    }

    // Vérifier les transitions récentes pour détecter des boucles
    const recentHistory = history.slice(-10);
    const stateCount = new Map<string, number>();
    recentHistory.forEach(h => {
      stateCount.set(h.state, (stateCount.get(h.state) || 0) + 1);
    });

    const maxRepeats = Math.max(...stateCount.values(), 0);
    if (maxRepeats > 5) {
      return {
        name: 'State Machine',
        status: 'warning',
        message: `Possible boucle détectée (${maxRepeats} répétitions)`,
      };
    }

    return {
      name: 'State Machine',
      status: 'ok',
      message: `État: ${state}, ${history.length} transitions`,
    };
  }

  /**
   * Génère un rapport de santé complet
   */
  async getAudioHealth(): Promise<AudioHealthReport> {
    const [microphone, audioContext, vadBackend, ttsBackend] = await Promise.all([
      this.checkMicrophone(),
      this.checkAudioContext(),
      this.checkVADBackend(),
      this.checkTTSBackend(),
    ]);

    const stateMachine = this.checkStateMachine();

    const tests = { microphone, audioContext, vadBackend, ttsBackend, stateMachine };

    // Calculer le statut global
    const statuses = Object.values(tests).map(t => t.status);
    let overallStatus: AudioHealthReport['overallStatus'] = 'healthy';

    if (statuses.includes('error')) {
      overallStatus = statuses.filter(s => s === 'error').length >= 2 ? 'critical' : 'degraded';
    } else if (statuses.includes('warning')) {
      overallStatus = 'degraded';
    } else if (statuses.includes('unknown')) {
      overallStatus = 'unknown';
    }

    // Générer les recommandations
    const recommendations: string[] = [];

    if (microphone.status === 'error') {
      recommendations.push('Vérifiez les permissions microphone dans les paramètres du navigateur');
    }
    if (microphone.status === 'warning') {
      recommendations.push('Cliquez sur le bouton micro pour autoriser l\'accès');
    }
    if (vadBackend.status === 'error') {
      recommendations.push('Relancez l\'application pour réinitialiser le backend audio');
    }
    if (ttsBackend.status !== 'ok') {
      recommendations.push('Vérifiez que espeak ou piper est installé pour la synthèse vocale');
    }
    if (stateMachine.status !== 'ok') {
      recommendations.push('Réinitialisez le mode conversation');
    }

    const report: AudioHealthReport = {
      timestamp: Date.now(),
      overallStatus,
      stateMachineState: audioStateMachine.getState(),
      tests,
      recommendations,
    };

    this.lastReport = report;
    return report;
  }

  /**
   * Obtenir le dernier rapport sans re-scanner
   */
  getLastReport(): AudioHealthReport | null {
    return this.lastReport;
  }

  /**
   * Démarrer le monitoring périodique
   */
  startMonitoring(intervalMs: number = 30000): void {
    this.stopMonitoring();
    this.checkInterval = setInterval(() => {
      this.getAudioHealth().catch(console.error);
    }, intervalMs);
    console.log(`[AudioHealth] 🔄 Monitoring started (${intervalMs}ms interval)`);
  }

  /**
   * Arrêter le monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[AudioHealth] ⏹️ Monitoring stopped');
    }
  }
}

// Singleton
export const audioHealthService = new AudioHealthService();
export default audioHealthService;
