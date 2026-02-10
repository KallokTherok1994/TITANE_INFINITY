/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ CRASH GUARD ENGINE vΩ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Protection contre les crashes et recovery automatique
 *
 * @responsibilities
 * - Détecter crashes imminents
 * - Rollback automatique
 * - Auto-heal sur rupture pipeline
 * - Vérification intégrité continue
 * - Sandbox renforcé
 * - Emergency recovery
 * - Prévention panics
 *
 * @version Ω (Omega - Final Fusion)
 * @created 2025-11-27
 */

import { tauriClient } from '@/lib/tauriClient';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CrashThreat {
  id: string;
  type: CrashType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  detected_at: number;
  preventable: boolean;
}

export type CrashType =
  | 'memory_overflow'
  | 'stack_overflow'
  | 'infinite_loop'
  | 'deadlock'
  | 'null_pointer'
  | 'panic'
  | 'exception'
  | 'resource_exhaustion';

export interface RecoveryAction {
  id: string;
  type: RecoveryType;
  threat_id: string;
  success: boolean;
  duration: number;
  timestamp: number;
}

export type RecoveryType =
  | 'rollback_state'
  | 'restart_module'
  | 'kill_thread'
  | 'clear_memory'
  | 'reset_pipeline'
  | 'emergency_shutdown';

export interface CrashGuardConfig {
  enabled: boolean;
  auto_recovery: boolean;
  detection_interval: number; // ms
  threat_threshold: number; // Nombre de menaces avant action
  emergency_rollback: boolean;
  sandbox_mode: boolean;
}

export interface CrashGuardStats {
  threats_detected: number;
  threats_prevented: number;
  recoveries_performed: number;
  crashes_avoided: number;
  uptime: number; // ms
  last_threat: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRASH GUARD ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class CrashGuardEngine {
  private static instance: CrashGuardEngine;

  private config: CrashGuardConfig;
  private activeThreats: Map<string, CrashThreat> = new Map();
  private recoveryHistory: RecoveryAction[] = [];
  private stats: CrashGuardStats;

  private detectionInterval: number | null = null;
  private startTime: number = Date.now();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.stats = this.createInitialStats();

    // Installer handlers globaux
    this.installGlobalHandlers();
  }

  public static getInstance(): CrashGuardEngine {
    if (!CrashGuardEngine.instance) {
      CrashGuardEngine.instance = new CrashGuardEngine();
    }
    return CrashGuardEngine.instance;
  }

  /**
   * Configuration par défaut
   */
  private getDefaultConfig(): CrashGuardConfig {
    return {
      enabled: true,
      auto_recovery: true,
      detection_interval: 2000, // 2s
      threat_threshold: 3,
      emergency_rollback: true,
      sandbox_mode: true,
    };
  }

  /**
   * Stats initiales
   */
  private createInitialStats(): CrashGuardStats {
    return {
      threats_detected: 0,
      threats_prevented: 0,
      recoveries_performed: 0,
      crashes_avoided: 0,
      uptime: 0,
      last_threat: null,
    };
  }

  /**
   * Configure le guard
   */
  public configure(config: Partial<CrashGuardConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[CrashGuard] 🔧 Configuration updated');
  }

  /**
   * Démarre la surveillance
   */
  public start(): void {
    if (this.detectionInterval) {
      return;
    }

    this.detectionInterval = window.setInterval(async () => {
      await this.detectThreats();
      this.updateStats();
    }, this.config.detection_interval);

    console.log('[CrashGuard] 🛡️ Protection started');
  }

  /**
   * Arrête la surveillance
   */
  public stop(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
      console.log('[CrashGuard] 🛑 Protection stopped');
    }
  }

  /**
   * Installe les handlers globaux
   */
  private installGlobalHandlers(): void {
    // Erreurs JavaScript non catchées
    window.addEventListener('error', event => {
      this.handleUncaughtError(event.error);
    });

    // Promesses rejetées non gérées
    window.addEventListener('unhandledrejection', event => {
      this.handleUnhandledRejection(event.reason);
    });

    // Avant déchargement (crash imminent)
    window.addEventListener('beforeunload', () => {
      this.handleBeforeUnload();
    });
  }

  /**
   * Gère erreur non catchée
   */
  private handleUncaughtError(error: Error): void {
    const threat: CrashThreat = {
      id: `threat-${Date.now()}`,
      type: 'exception',
      severity: 'high',
      description: error.message,
      source: error.stack || 'unknown',
      detected_at: Date.now(),
      preventable: true,
    };

    this.registerThreat(threat);
  }

  /**
   * Gère promesse rejetée non gérée
   */
  private handleUnhandledRejection(reason: unknown): void {
    const threat: CrashThreat = {
      id: `threat-${Date.now()}`,
      type: 'exception',
      severity: 'medium',
      description: String(reason),
      source: 'promise',
      detected_at: Date.now(),
      preventable: true,
    };

    this.registerThreat(threat);
  }

  /**
   * Gère avant déchargement
   */
  private handleBeforeUnload(): void {
    // Sauvegarder état d'urgence
    if (this.config.emergency_rollback) {
      try {
        const state = localStorage.getItem('singularity-state');
        if (state) {
          localStorage.setItem('singularity-emergency-backup', state);
        }
      } catch (error) {
        console.error('[CrashGuard] Failed to create emergency backup');
      }
    }
  }

  /**
   * Détecte les menaces
   */
  private async detectThreats(): Promise<void> {
    try {
      const threats = (await tauriClient.crashguardDetectThreats()) as CrashThreat[];

      for (const threat of threats) {
        this.registerThreat(threat);
      }
    } catch (error) {
      console.warn('[CrashGuard] Threat detection failed:', error);
    }
  }

  /**
   * Enregistre une menace
   */
  private registerThreat(threat: CrashThreat): void {
    this.activeThreats.set(threat.id, threat);
    this.stats.threats_detected++;
    this.stats.last_threat = threat.detected_at;

    console.warn(`[CrashGuard] ⚠️ Threat detected: ${threat.type} (${threat.severity})`);

    // Auto-recovery si activé
    if (this.config.auto_recovery && threat.preventable) {
      this.performRecovery(threat);
    }

    // Si trop de menaces, action d'urgence
    if (this.activeThreats.size >= this.config.threat_threshold) {
      this.performEmergencyAction();
    }
  }

  /**
   * Effectue une récupération
   */
  private async performRecovery(threat: CrashThreat): Promise<void> {
    console.log(`[CrashGuard] 🔧 Performing recovery for: ${threat.type}`);

    const startTime = Date.now();
    let recoveryType: RecoveryType = 'restart_module';
    let success = false;

    try {
      switch (threat.type) {
        case 'memory_overflow':
          recoveryType = 'clear_memory';
          await tauriClient.crashguardClearMemory();
          success = true;
          break;

        case 'infinite_loop':
          recoveryType = 'kill_thread';
          await tauriClient.crashguardKillThread({ source: threat.source });
          success = true;
          break;

        case 'deadlock':
          recoveryType = 'restart_module';
          await tauriClient.crashguardRestartModule({ module: threat.source });
          success = true;
          break;

        case 'panic':
          recoveryType = 'emergency_shutdown';
          await tauriClient.crashguardEmergencyShutdown();
          success = true;
          break;

        default:
          recoveryType = 'reset_pipeline';
          await tauriClient.crashguardResetPipeline();
          success = true;
      }

      if (success) {
        this.stats.threats_prevented++;
        this.stats.crashes_avoided++;
        this.activeThreats.delete(threat.id);
      }
    } catch (error) {
      console.error('[CrashGuard] Recovery failed:', error);
    }

    const recovery: RecoveryAction = {
      id: `recovery-${Date.now()}`,
      type: recoveryType,
      threat_id: threat.id,
      success,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    };

    this.recoveryHistory.push(recovery);
    this.stats.recoveries_performed++;

    // Limiter historique
    if (this.recoveryHistory.length > 50) {
      this.recoveryHistory = this.recoveryHistory.slice(-50);
    }
  }

  /**
   * Action d'urgence
   */
  private async performEmergencyAction(): Promise<void> {
    console.error('[CrashGuard] 🚨 EMERGENCY ACTION - Too many threats!');

    if (this.config.emergency_rollback) {
      try {
        // Rollback état
        await tauriClient.crashguardEmergencyRollback();

        // Clear toutes les menaces
        this.activeThreats.clear();

        console.log('[CrashGuard] ✅ Emergency rollback successful');
      } catch (error) {
        console.error('[CrashGuard] Emergency rollback failed:', error);
      }
    }
  }

  /**
   * Met à jour les stats
   */
  private updateStats(): void {
    this.stats.uptime = Date.now() - this.startTime;
  }

  /**
   * Obtient les menaces actives
   */
  public getActiveThreats(): CrashThreat[] {
    return Array.from(this.activeThreats.values());
  }

  /**
   * Obtient l'historique de récupération
   */
  public getRecoveryHistory(): RecoveryAction[] {
    return [...this.recoveryHistory];
  }

  /**
   * Obtient les stats
   */
  public getStats(): CrashGuardStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Réinitialise
   */
  public reset(): void {
    this.activeThreats.clear();
    this.recoveryHistory = [];
    this.stats = this.createInitialStats();
    this.startTime = Date.now();
    console.log('[CrashGuard] ♻️ Reset complete');
  }
}

export const CrashGuard = CrashGuardEngine.getInstance();
