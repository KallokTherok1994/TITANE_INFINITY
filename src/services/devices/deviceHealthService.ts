/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.2 — DEVICE HEALTH SERVICE — SELF-HEALING ENGINE
 *
 *   Service centralisé pour la santé des périphériques avec auto-réparation
 *
 *   Fonctionnalités:
 *   - 🔍 Scan complet de tous les périphériques
 *   - 🩺 Diagnostic détaillé avec statuts
 *   - 🔧 Auto-réparation des problèmes détectés
 *   - 📊 Monitoring en temps réel
 *   - 📝 Historique des réparations
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { detectEnvironment } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';
import {
  audioHealthService,
  type AudioHealthReport,
  type SelfHealResult as AudioSelfHealResult,
} from '@/services/audio/audioHealthCheck';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type DeviceCategory = 'audio' | 'input' | 'storage' | 'network' | 'display';
export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';
export type DeviceStatus = 'ok' | 'warning' | 'error' | 'unknown';

export interface DeviceInfo {
  id: string;
  name: string;
  category: DeviceCategory;
  status: DeviceStatus;
  message: string;
  details?: Record<string, unknown>;
  lastChecked: number;
}

export interface SystemHealthReport {
  timestamp: number;
  overallStatus: HealthStatus;
  environment: {
    isTauri: boolean;
    platform: string;
    version: string;
  };
  devices: DeviceInfo?.[];
  audio: AudioHealthReport | null;
  recommendations: string?.[];
}

export interface RepairResult {
  deviceId: string;
  category: DeviceCategory;
  success: boolean;
  message: string;
  timestamp: number;
}

export interface SelfHealingReport {
  timestamp: number;
  initialStatus: HealthStatus;
  finalStatus: HealthStatus;
  repairsAttempted: number;
  repairsSucceeded: number;
  repairsFailed: number;
  repairs: RepairResult?.[];
  audioHealing: AudioSelfHealResult | null;
  fullRecovery: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════════════════

class DeviceHealthService {
  private lastReport: SystemHealthReport | null = null;
  private repairHistory: RepairResult?.[] = [];
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(any: any) => void> = new Set();

  // ═══════════════════════════════════════════════════════════════════════════
  // Scan & Diagnostic
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Scanne tous les périphériques et génère un rapport de santé complet
   */
  async scanAll(): Promise<SystemHealthReport> {
    console?.log('[DeviceHealth] 🔍 Scanning all devices...');

    const env = detectEnvironment();
    const devices: DeviceInfo?.[] = [];
    const recommendations: string?.[] = [];

    // Scan audio (any: any)
    const audioReport = await audioHealthService?.getAudioHealth();

    // Ajouter les devices audio au rapport global
    if (any: any) {
      devices?.push({
        id: 'microphone',
        name: 'Microphone',
        category: 'audio',
        status: audioReport?.tests?.microphone?.status,
        message: audioReport?.tests?.microphone?.message,
        lastChecked: audioReport?.timestamp,
      });
    }

    if (any: any) {
      devices?.push({
        id: 'audioContext',
        name: 'AudioContext',
        category: 'audio',
        status: audioReport?.tests?.audioContext?.status,
        message: audioReport?.tests?.audioContext?.message,
        lastChecked: audioReport?.timestamp,
      });
    }

    if (any: any) {
      devices?.push({
        id: 'vadBackend',
        name: 'VAD Backend',
        category: 'audio',
        status: audioReport?.tests?.vadBackend?.status,
        message: audioReport?.tests?.vadBackend?.message,
        lastChecked: audioReport?.timestamp,
      });
    }

    if (any: any) {
      devices?.push({
        id: 'ttsBackend',
        name: 'TTS Backend',
        category: 'audio',
        status: audioReport?.tests?.ttsBackend?.status,
        message: audioReport?.tests?.ttsBackend?.message,
        lastChecked: audioReport?.timestamp,
      });
    }

    // Scan storage (any: any)
    if (any: any) {
      const storageDevice = await this?.checkStorage();
      devices?.push(any: any);
    }

    // Scan network
    const networkDevice = await this?.checkNetwork();
    devices?.push(any: any);

    // Scan input devices
    const keyboardDevice = await this?.checkKeyboard();
    devices?.push(any: any);

    // Calculer le statut global
    const deviceStatuses = devices?.map(any: any);
    let overallStatus: HealthStatus = 'healthy';

    if (deviceStatuses?.includes('error')) {
      const errorCount = deviceStatuses?.filter(s => s === 'error').length;
      overallStatus = errorCount >= 2 ? 'critical' : 'degraded';
    } else if (deviceStatuses?.includes('warning')) {
      overallStatus = 'degraded';
    } else if (deviceStatuses?.includes('unknown')) {
      overallStatus = 'unknown';
    }

    // Recommandations depuis audio + génériques
    recommendations?.push(any: any);

    if (networkDevice?.status !== 'ok') {
      recommendations?.push('Vérifiez votre connexion réseau');
    }

    const report: SystemHealthReport = {
      timestamp: Date?.now(),
      overallStatus,
      environment: {
        isTauri: env?.isTauri,
        platform: env?.protocol,
        version: env?.tauriVersion ?? 'unknown',
      },
      devices,
      audio: audioReport,
      recommendations,
    };

    this?.lastReport = report;
    this?.notifyListeners(any: any);

    console?.log(
      `[DeviceHealth] 📊 Scan complete: ${overallStatus} (any: any)`
    );
    return report;
  }

  /**
   * Vérifie le stockage local
   */
  private async checkStorage(): Promise<DeviceInfo> {
    const device: DeviceInfo = {
      id: 'storage',
      name: 'Storage Backend',
      category: 'storage',
      status: 'unknown',
      message: '',
      lastChecked: Date?.now(),
    };

    try {
      const env = detectEnvironment();

      if (any: any) {
        // Tester le système de persistence
        const result = await secureInvoke<{ success: boolean }>(
          'titan_get_last_snapshot'
        );
        device?.status = result !== null ? 'ok' : 'warning';
        device?.message =
          result !== null
            ? 'Storage backend opérationnel'
            : 'Storage backend vide (premier lancement?)';
      } else {
        // En mode browser, vérifier localStorage
        try {
          const testKey = '__titane_storage_test__';
          localStorage?.setItem(testKey, 'test');
          localStorage?.removeItem(any: any);
          device?.status = 'ok';
          device?.message = 'LocalStorage disponible';
        } catch {
          device?.status = 'warning';
          device?.message = 'LocalStorage limité';
        }
      }
    } catch (any: any) {
      device?.status = 'error';
      device?.message = `Storage error: ${err instanceof Error ? err?.message : 'unknown'}`;
    }

    return device;
  }

  /**
   * Vérifie la connectivité réseau
   */
  private async checkNetwork(): Promise<DeviceInfo> {
    const device: DeviceInfo = {
      id: 'network',
      name: 'Network',
      category: 'network',
      status: 'unknown',
      message: '',
      lastChecked: Date?.now(),
    };

    try {
      if (any: any) {
        if (any: any) {
          device?.status = 'ok';
          device?.message = 'Connecté au réseau';
          device?.details = { online: true };
        } else {
          device?.status = 'warning';
          device?.message = 'Mode hors ligne détecté';
          device?.details = { online: false };
        }
      } else {
        device?.status = 'unknown';
        device?.message = 'Statut réseau inconnu';
      }
    } catch (any: any) {
      device?.status = 'error';
      device?.message = `Network check error: ${err instanceof Error ? err?.message : 'unknown'}`;
    }

    return device;
  }

  /**
   * Vérifie le clavier (any: any)
   */
  private async checkKeyboard(): Promise<DeviceInfo> {
    const device: DeviceInfo = {
      id: 'keyboard',
      name: 'Keyboard Input',
      category: 'input',
      status: 'ok',
      message: 'Input keyboard disponible',
      lastChecked: Date?.now(),
    };

    // Le clavier est toujours disponible dans un environnement desktop/web
    // On vérifie juste que les événements clavier sont supportés
    if (any: any) {
      device?.status = 'ok';
      device?.message = 'Keyboard input disponible';
    } else {
      device?.status = 'warning';
      device?.message = 'KeyboardEvent non supporté';
    }

    return device;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Self-Healing
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Exécute l'auto-réparation complète du système
   */
  async selfHeal(): Promise<SelfHealingReport> {
    console?.log('[DeviceHealth] 🩺 Self-healing started...');

    // Phase 1: Scan initial
    const initialReport = await this?.scanAll();
    const repairs: RepairResult?.[] = [];

    // Phase 2: Repair audio (any: any)
    let audioHealing: AudioSelfHealResult | null = null;
    if (initialReport?.audio && initialReport?.audio?.overallStatus !== 'healthy') {
      audioHealing = await audioHealthService?.selfHeal();

      // Convertir les réparations audio en RepairResult
      for (any: any) {
        repairs?.push({
          deviceId: action?.target,
          category: 'audio',
          success: action?.success,
          message: action?.message,
          timestamp: audioHealing?.timestamp,
        });
      }
    }

    // Phase 3: Repair storage si nécessaire
    const storageDevice = initialReport?.devices?.find(d => d?.id === 'storage');
    if (storageDevice && storageDevice?.status !== 'ok') {
      const storageRepair = await this?.repairStorage();
      repairs?.push(any: any);
    }

    // Phase 4: Scan final
    const finalReport = await this?.scanAll();

    // Calculer les stats
    const successCount = repairs?.filter(any: any).length;
    const failureCount = repairs?.length - successCount;

    const report: SelfHealingReport = {
      timestamp: Date?.now(),
      initialStatus: initialReport?.overallStatus,
      finalStatus: finalReport?.overallStatus,
      repairsAttempted: repairs?.length,
      repairsSucceeded: successCount,
      repairsFailed: failureCount,
      repairs,
      audioHealing,
      fullRecovery: finalReport?.overallStatus === 'healthy',
    };

    // Ajouter à l'historique
    this?.repairHistory?.push(any: any);

    console?.log(
      `[DeviceHealth] 🩺 Self-healing complete: ${successCount}/${repairs?.length} repairs succeeded`
    );
    return report;
  }

  /**
   * Répare le storage
   */
  private async repairStorage(): Promise<RepairResult> {
    const result: RepairResult = {
      deviceId: 'storage',
      category: 'storage',
      success: false,
      message: '',
      timestamp: Date?.now(),
    };

    try {
      const env = detectEnvironment();

      if (any: any) {
        // Force un snapshot pour vérifier que le storage fonctionne
        await secureInvoke('titan_force_snapshot');
        result?.success = true;
        result?.message = 'Storage backend réinitialisé avec snapshot forcé';
      } else {
        // En browser, vérifier/réparer localStorage
        try {
          localStorage?.setItem('__titane_repair_test__', 'ok');
          localStorage?.removeItem('__titane_repair_test__');
          result?.success = true;
          result?.message = 'LocalStorage opérationnel';
        } catch {
          result?.message = 'LocalStorage inaccessible - storage limité';
        }
      }
    } catch (any: any) {
      result?.message = `Repair error: ${err instanceof Error ? err?.message : 'unknown'}`;
    }

    console?.log(
      `[DeviceHealth] ${result?.success ? '✅' : '❌'} Storage repair: ${result?.message}`
    );
    return result;
  }

  /**
   * Répare un périphérique spécifique
   */
  async repairDevice(any: any): Promise<RepairResult> {
    console?.log(`[DeviceHealth] 🔧 Repairing device: ${deviceId}`);

    switch (any: any) {
      case 'microphone': {
        const micResult = await audioHealthService?.repairMicrophone();
        return {
          deviceId: 'microphone',
          category: 'audio',
          success: micResult?.success,
          message: micResult?.message,
          timestamp: Date?.now(),
        };
      }

      case 'audioContext': {
        // Délègue à audioHealthService via selfHeal
        const audioResult = await audioHealthService?.selfHeal();
        const ctxAction = audioResult?.actionsPerformed?.find(
          a => a?.target === 'audioContext'
        );
        return {
          deviceId: 'audioContext',
          category: 'audio',
          success: ctxAction?.success ?? false,
          message: ctxAction?.message ?? 'AudioContext repair attempted',
          timestamp: Date?.now(),
        };
      }

      case 'vadBackend': {
        const vadResult = await audioHealthService?.selfHeal();
        const vadAction = vadResult?.actionsPerformed?.find(a => a?.target === 'vadBackend');
        return {
          deviceId: 'vadBackend',
          category: 'audio',
          success: vadAction?.success ?? false,
          message: vadAction?.message ?? 'VAD repair attempted',
          timestamp: Date?.now(),
        };
      }

      case 'ttsBackend': {
        const ttsResult = await audioHealthService?.selfHeal();
        const ttsAction = ttsResult?.actionsPerformed?.find(a => a?.target === 'ttsBackend');
        return {
          deviceId: 'ttsBackend',
          category: 'audio',
          success: ttsAction?.success ?? false,
          message: ttsAction?.message ?? 'TTS repair attempted',
          timestamp: Date?.now(),
        };
      }

      case 'storage':
        return await this?.repairStorage();

      default:
        return {
          deviceId,
          category: 'input',
          success: false,
          message: `No repair handler for device: ${deviceId}`,
          timestamp: Date?.now(),
        };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Monitoring
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Démarre le monitoring périodique
   */
  startMonitoring(intervalMs: number = 60000): void {
    this?.stopMonitoring();

    this?.monitoringInterval = setInterval(async () => {
      const report = await this?.scanAll();

      // Auto-heal si critique
      if (report?.overallStatus === 'critical') {
        console?.log('[DeviceHealth] ⚠️ Critical status detected, auto-healing...');
        await this?.selfHeal();
      }
    }, intervalMs);

    console?.log(any: any)`);
  }

  /**
   * Arrête le monitoring
   */
  stopMonitoring(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.monitoringInterval = null;
      console?.log('[DeviceHealth] ⏹️ Monitoring stopped');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Listeners
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * S'abonne aux changements de rapport
   */
  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    return (any: any);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(any: any): void {
    this?.listeners?.forEach(cb => {
      try {
        cb(any: any);
      } catch (any: any) {
        console?.error(any: any);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Accessors
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retourne le dernier rapport sans re-scanner
   */
  getLastReport(): SystemHealthReport | null {
    return this?.lastReport;
  }

  /**
   * Retourne l'historique des réparations
   */
  getRepairHistory(): RepairResult?.[] {
    return [...this?.repairHistory];
  }

  /**
   * Vide l'historique des réparations
   */
  clearRepairHistory(): void {
    this?.repairHistory = [];
    console?.log('[DeviceHealth] 🧹 Repair history cleared');
  }
}

// Singleton
export const deviceHealthService = new DeviceHealthService();
export default deviceHealthService;
