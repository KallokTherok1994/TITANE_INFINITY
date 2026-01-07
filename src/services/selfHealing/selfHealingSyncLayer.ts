/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING SYNC LAYER — Layer 5
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Couche de synchronisation avec SingularityState
 *
 * @responsibilities
 * - Synchronisation avec l'état Singularity
 * - Mise à jour du profil Self-Healing
 * - Persistance de l'historique
 * - Émission d'événements système
 * - Intégration avec le système de XP
 *
 * @architecture Layer 5 of 5 (Observer → Analyzer → Playbook → Executor → Sync)
 * @version vΩ∞
 * @created 2025-01-07
 */

import { secureInvoke } from '@/lib/security';
import { detectEnvironment } from '@/core/tauri/environment';
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';
import {
  type HealingEvent,
  type HealingDiagnosis,
  type HealingImpactReport as _HealingImpactReport,
  type SelfHealingProfile,
  type PatternRecord,
  type VitalsSnapshot,
} from './selfHealing.config';
import { type PlanExecutionResult } from './selfHealingExecutor';
import { type ExecutionPlan as _ExecutionPlan } from './selfHealingPlaybookEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration du Sync Layer */
export interface SyncLayerConfig {
  enabled: boolean;
  autoSync: boolean;
  syncIntervalMs: number;
  persistHistory: boolean;
  maxHistoryItems: number;
  emitToSingularity: boolean;
  xpMultiplier: number;
}

/** État synchronisé */
export interface SyncedState {
  profile: SelfHealingProfile;
  vitals: VitalsSnapshot;
  recentEvents: HealingEvent[];
  recentDiagnoses: HealingDiagnosis[];
  recentExecutions: PlanExecutionResult[];
  patterns: PatternRecord[];
  lastSyncTime: number;
}

/** Événement de synchronisation */
export interface SyncEvent {
  type: 'profile_update' | 'vitals_update' | 'history_update' | 'pattern_detected';
  timestamp: number;
  data: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: SyncLayerConfig = {
  enabled: true,
  autoSync: true,
  syncIntervalMs: 30000,
  persistHistory: true,
  maxHistoryItems: 100,
  emitToSingularity: true,
  xpMultiplier: 1.0,
};

const DEFAULT_PROFILE: SelfHealingProfile = {
  totalAnomaliesDetected: 0,
  totalRepairsAttempted: 0,
  totalRepairsSuccessful: 0,
  successRate: 0,
  averageRepairTime: 0,
  recurringPatterns: [],
  adaptedPlaybooks: [],
  healingXP: 0,
  evolutionLevel: 1,
  lastEvolutionTime: 0,
};

const DEFAULT_VITALS: VitalsSnapshot = {
  timestamp: Date.now(),
  cpu_usage: 0,
  memory_usage: 0,
  fps: 60,
  webview_responsive: true,
  tauri_backend_alive: true,
  ollama_available: false,
  gemini_available: false,
  tts_available: false,
  memory_integrity: 100,
  active_errors: 0,
  queue_size: 0,
};

// XP nécessaire par niveau
const XP_PER_LEVEL = [
  0, // Level 1
  100, // Level 2
  300, // Level 3
  600, // Level 4
  1000, // Level 5
  1500, // Level 6
  2200, // Level 7
  3000, // Level 8
  4000, // Level 9
  5500, // Level 10 (max)
];

// ═══════════════════════════════════════════════════════════════════════════
// SYNC LAYER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class SelfHealingSyncLayer {
  private static instance: SelfHealingSyncLayer;

  private config: SyncLayerConfig;
  private profile: SelfHealingProfile;
  private vitals: VitalsSnapshot;
  private eventHistory: HealingEvent[];
  private diagnosisHistory: HealingDiagnosis[];
  private executionHistory: PlanExecutionResult[];
  private patterns: Map<string, PatternRecord>;
  private syncInterval: ReturnType<typeof setInterval> | null;
  private unlisteners: UnlistenFn[];
  private lastSyncTime: number;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.profile = { ...DEFAULT_PROFILE };
    this.vitals = { ...DEFAULT_VITALS };
    this.eventHistory = [];
    this.diagnosisHistory = [];
    this.executionHistory = [];
    this.patterns = new Map();
    this.syncInterval = null;
    this.unlisteners = [];
    this.lastSyncTime = 0;
  }

  public static getInstance(): SelfHealingSyncLayer {
    if (!SelfHealingSyncLayer.instance) {
      SelfHealingSyncLayer.instance = new SelfHealingSyncLayer();
    }
    return SelfHealingSyncLayer.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  public async initialize(): Promise<void> {
    logger.debug('🔄 Initializing...');

    // Charger le profil depuis le backend
    await this.loadProfile();

    // Charger les vitaux
    await this.updateVitals();

    // Écouter les événements du backend
    await this.setupListeners();

    // Démarrer la synchronisation automatique
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    logger.debug('✅ Initialized');
  }

  public async shutdown(): Promise<void> {
    logger.debug('🛑 Shutting down...');

    // Arrêter la synchronisation
    this.stopAutoSync();

    // Détacher les listeners
    for (const unlisten of this.unlisteners) {
      unlisten();
    }
    this.unlisteners = [];

    // Sauvegarder le profil
    await this.saveProfile();

    logger.debug('Shutdown complete');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<SyncLayerConfig>): void {
    const wasAutoSync = this.config.autoSync;
    this.config = { ...this.config, ...config };

    // Gérer le changement d'auto-sync
    if (wasAutoSync && !this.config.autoSync) {
      this.stopAutoSync();
    } else if (!wasAutoSync && this.config.autoSync) {
      this.startAutoSync();
    }
  }

  public getConfig(): SyncLayerConfig {
    return { ...this.config };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC STATE
  // ═══════════════════════════════════════════════════════════════════════════

  public getSyncedState(): SyncedState {
    return {
      profile: { ...this.profile },
      vitals: { ...this.vitals },
      recentEvents: [...this.eventHistory].slice(-20),
      recentDiagnoses: [...this.diagnosisHistory].slice(-20),
      recentExecutions: [...this.executionHistory].slice(-10),
      patterns: [...this.patterns.values()],
      lastSyncTime: this.lastSyncTime,
    };
  }

  public getProfile(): SelfHealingProfile {
    return { ...this.profile };
  }

  public getVitals(): VitalsSnapshot {
    return { ...this.vitals };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT RECORDING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistre un événement de healing
   */
  public recordEvent(event: HealingEvent): void {
    this.eventHistory.push(event);
    this.trimHistory();

    this.profile.totalAnomaliesDetected++;

    if (this.config.emitToSingularity) {
      this.emitToSingularity('healing_event', event);
    }
  }

  /**
   * Enregistre un diagnostic
   */
  public recordDiagnosis(diagnosis: HealingDiagnosis): void {
    this.diagnosisHistory.push(diagnosis);
    this.trimHistory();

    if (this.config.emitToSingularity) {
      this.emitToSingularity('healing_diagnosis', diagnosis);
    }
  }

  /**
   * Enregistre une exécution de plan
   */
  public recordExecution(result: PlanExecutionResult): void {
    this.executionHistory.push(result);
    this.trimHistory();

    // Mettre à jour le profil
    this.profile.totalRepairsAttempted++;

    if (result.status === 'success') {
      this.profile.totalRepairsSuccessful++;
    }

    // Calculer le taux de succès
    this.profile.successRate =
      this.profile.totalRepairsAttempted > 0
        ? this.profile.totalRepairsSuccessful / this.profile.totalRepairsAttempted
        : 0;

    // Mettre à jour le temps moyen de réparation
    const totalTime = this.executionHistory.reduce((sum, e) => sum + e.duration, 0);
    this.profile.averageRepairTime = totalTime / this.executionHistory.length;

    // Ajouter l'XP
    const xp = Math.round(result.impactReport.xpAwarded * this.config.xpMultiplier);
    this.addXP(xp);

    if (this.config.emitToSingularity) {
      this.emitToSingularity('healing_execution', result);
    }

    // Persister le profil
    if (this.config.persistHistory) {
      this.saveProfile().catch(console.error);
    }
  }

  /**
   * Enregistre un pattern détecté
   */
  public recordPattern(pattern: PatternRecord): void {
    this.patterns.set(pattern.patternId, pattern);

    // Mettre à jour le profil
    this.profile.recurringPatterns = [...this.patterns.values()];

    if (this.config.emitToSingularity) {
      this.emitToSingularity('healing_pattern', pattern);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // XP & EVOLUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajoute de l'XP au profil
   */
  public addXP(amount: number): void {
    this.profile.healingXP += amount;

    // Vérifier l'évolution de niveau
    const oldLevel = this.profile.evolutionLevel;
    this.profile.evolutionLevel = this.calculateLevel(this.profile.healingXP);

    if (this.profile.evolutionLevel > oldLevel) {
      this.profile.lastEvolutionTime = Date.now();
      logger.debug(
        `[SelfHealingSyncLayer] 🎉 Level up! ${oldLevel} → ${this.profile.evolutionLevel}`
      );

      this.emitToSingularity('healing_level_up', {
        oldLevel,
        newLevel: this.profile.evolutionLevel,
        totalXP: this.profile.healingXP,
      });
    }
  }

  private calculateLevel(xp: number): number {
    for (let level = XP_PER_LEVEL.length - 1; level >= 0; level--) {
      const threshold = XP_PER_LEVEL[level];
      if (threshold !== undefined && xp >= threshold) {
        return level + 1;
      }
    }
    return 1;
  }

  public getXPProgress(): { current: number; nextLevel: number; progress: number } {
    const level = this.profile.evolutionLevel;
    const currentThreshold = XP_PER_LEVEL[level - 1] ?? 0;
    const lastThreshold = XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
    const nextThreshold = XP_PER_LEVEL[level] ?? lastThreshold ?? 0;

    const current = this.profile.healingXP - currentThreshold;
    const nextLevel = nextThreshold - currentThreshold;
    const progress = nextLevel > 0 ? current / nextLevel : 1;

    return { current, nextLevel, progress };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VITALS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Met à jour les vitaux système
   */
  public async updateVitals(): Promise<VitalsSnapshot> {
    try {
      const env = detectEnvironment();
      if (env.isTauri) {
        const vitals = await secureInvoke<VitalsSnapshot>('selfheal_get_vitals');
        this.vitals = {
          ...vitals,
          timestamp: Date.now(),
        };
      } else {
        this.vitals.timestamp = Date.now();
      }
    } catch (error) {
      logger.warn('Could not fetch vitals:', error);
      this.vitals.timestamp = Date.now();
    }

    return this.vitals;
  }

  /**
   * Met à jour un vital spécifique
   */
  public updateVital(key: keyof VitalsSnapshot, value: number | boolean): void {
    (this.vitals as any)[key] = value;
    this.vitals.timestamp = Date.now();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  private async loadProfile(): Promise<void> {
    try {
      const env = detectEnvironment();
      if (env.isTauri) {
        const profile = await secureInvoke<SelfHealingProfile>('selfheal_load_profile');
        this.profile = { ...DEFAULT_PROFILE, ...profile };
      } else {
        this.profile = { ...DEFAULT_PROFILE };
      }
    } catch (error) {
      logger.warn('Could not load profile:', error);
      this.profile = { ...DEFAULT_PROFILE };
    }
  }

  private async saveProfile(): Promise<void> {
    try {
      const env = detectEnvironment();
      if (env.isTauri) {
        await secureInvoke('selfheal_save_profile', { profile: this.profile });
      }
    } catch (error) {
      logger.warn('Could not save profile:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC
  // ═══════════════════════════════════════════════════════════════════════════

  private startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(async () => {
      await this.performSync();
    }, this.config.syncIntervalMs);

    logger.debug(
      `[SelfHealingSyncLayer] Auto-sync started (${this.config.syncIntervalMs}ms)`
    );
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.debug('Auto-sync stopped');
    }
  }

  private async performSync(): Promise<void> {
    try {
      // Mettre à jour les vitaux
      await this.updateVitals();

      // Sauvegarder le profil si nécessaire
      if (this.config.persistHistory) {
        await this.saveProfile();
      }

      this.lastSyncTime = Date.now();
    } catch (error) {
      logger.warn('Sync failed:', error);
    }
  }

  public async forcSync(): Promise<void> {
    await this.performSync();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async setupListeners(): Promise<void> {
    try {
      // Écouter les mises à jour de vitaux du backend
      const unlisten1 = await listen<VitalsSnapshot>(
        'selfheal://vitals_update',
        event => {
          this.vitals = { ...event.payload, timestamp: Date.now() };
        }
      );
      this.unlisteners.push(unlisten1);

      // Écouter les demandes de sync
      const unlisten2 = await listen('selfheal://request_sync', async () => {
        await this.performSync();
      });
      this.unlisteners.push(unlisten2);
    } catch (error) {
      logger.warn('Could not setup listeners:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SINGULARITY INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════

  private async emitToSingularity(eventType: string, data: unknown): Promise<void> {
    if (!this.config.emitToSingularity) return;

    try {
      await emit(`singularity://selfhealing/${eventType}`, {
        timestamp: Date.now(),
        data,
      });
    } catch (error) {
      logger.warn('Could not emit to Singularity:', error);
    }
  }

  /**
   * Synchronise l'état avec Singularity Engine
   */
  public async syncWithSingularity(): Promise<void> {
    try {
      const env = detectEnvironment();
      if (env.isTauri) {
        await secureInvoke('selfheal_sync_with_singularity', {
          profile: this.profile,
          vitals: this.vitals,
        });
      }
    } catch (error) {
      logger.warn('Singularity sync failed:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private trimHistory(): void {
    const max = this.config.maxHistoryItems;

    if (this.eventHistory.length > max) {
      this.eventHistory = this.eventHistory.slice(-max);
    }
    if (this.diagnosisHistory.length > max) {
      this.diagnosisHistory = this.diagnosisHistory.slice(-max);
    }
    if (this.executionHistory.length > max) {
      this.executionHistory = this.executionHistory.slice(-max);
    }
  }

  /**
   * Réinitialise le profil (pour tests/debug)
   */
  public resetProfile(): void {
    this.profile = { ...DEFAULT_PROFILE };
    this.eventHistory = [];
    this.diagnosisHistory = [];
    this.executionHistory = [];
    this.patterns.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingSyncLayer = SelfHealingSyncLayer.getInstance();

export default selfHealingSyncLayer;
