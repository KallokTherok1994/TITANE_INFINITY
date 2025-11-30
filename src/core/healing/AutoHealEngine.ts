/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ AUTO-HEAL ENGINE vΩ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Moteur de réparation automatique des modules cassés
 *
 * @responsibilities
 * - Reconstruire modules cassés
 * - Resynchroniser SingularityState
 * - Relancer pipelines audio/visuel
 * - Restaurer modules IA cassés
 * - Reconstituer mémoire endommagée
 *
 * @version Ω (Omega - Final Fusion)
 * @created 2025-11-27
 */

import { invoke } from '@tauri-apps/api/core';
import { runSelfHealing, type SelfHealingRunResult } from '@/engines/selfHealing';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BrokenModule {
  name: string;
  type: ModuleType;
  broken_since: number;
  error: string;
  healable: boolean;
}

export type ModuleType =
  | 'cognitive'
  | 'adaptive'
  | 'narrative'
  | 'avatar'
  | 'tts'
  | 'lipsync'
  | 'memory'
  | 'appearance'
  | 'network'
  | 'pipeline';

export interface HealResult {
  module_name: string;
  success: boolean;
  actions_taken: string[];
  duration: number;
  error?: string;
}

export interface AutoHealConfig {
  enabled: boolean;
  auto_heal_critical: boolean;
  max_heal_attempts: number;
  heal_timeout: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-HEAL ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class AutoHealEngine {
  private static instance: AutoHealEngine;

  private config: AutoHealConfig;
  private brokenModules: Map<string, BrokenModule> = new Map();
  private healHistory: HealResult[] = [];
  private lastSelfHealingResult: SelfHealingRunResult | null = null;

  private constructor() {
    this.config = {
      enabled: true,
      auto_heal_critical: true,
      max_heal_attempts: 3,
      heal_timeout: 10000,
    };
  }

  public static getInstance(): AutoHealEngine {
    if (!AutoHealEngine.instance) {
      AutoHealEngine.instance = new AutoHealEngine();
    }
    return AutoHealEngine.instance;
  }

  /**
   * Configure le moteur
   */
  public configure(config: Partial<AutoHealConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Détecte les modules cassés
   */
  public async detectBrokenModules(): Promise<BrokenModule[]> {
    console.log('[AutoHeal] 🔍 Detecting broken modules...');

    const broken: BrokenModule[] = [];

    try {
      const modules = await invoke<BrokenModule[]>('autoheal_detect_broken');
      broken.push(...modules);
    } catch (error) {
      console.warn('[AutoHeal] Detection failed:', error);
    }

    // Mettre à jour la map
    for (const module of broken) {
      this.brokenModules.set(module.name, module);
    }

    console.log(`[AutoHeal] Found ${broken.length} broken modules`);

    return broken;
  }

  /**
   * Répare tous les modules cassés
   */
  public async healAll(): Promise<HealResult[]> {
    const results: HealResult[] = [];

    if (this.brokenModules.size > 0) {
      await this.runSelfHealingCycle('autoheal.detected.modules');
    }

    for (const [name, module] of this.brokenModules) {
      if (module.healable) {
        const result = await this.healModule(module);
        results.push(result);
        this.healHistory.push(result);

        if (result.success) {
          this.brokenModules.delete(name);
        }
      }
    }

    return results;
  }

  /**
   * Lance un cycle de self-healing via TITANE Local
   */
  public async runSelfHealingCycle(symptoms: string): Promise<SelfHealingRunResult | null> {
    try {
      console.log('[AutoHeal] 🤖 Running TITANE Local self-healing...');
      const result = await runSelfHealing(symptoms);
      this.lastSelfHealingResult = result;
      return result;
    } catch (error) {
      console.error('[AutoHeal] Self-healing cycle failed:', error);
      return null;
    }
  }

  /**
   * Retourne la dernière analyse TITANE Local
   */
  public getLastSelfHealingResult(): SelfHealingRunResult | null {
    return this.lastSelfHealingResult;
  }

  /**
   * Répare un module spécifique
   */
  private async healModule(module: BrokenModule): Promise<HealResult> {
    console.log(`[AutoHeal] 🩹 Healing module: ${module.name}`);

    const startTime = Date.now();
    const actionsTaken: string[] = [];

    try {
      switch (module.type) {
        case 'cognitive':
          await this.healCognitiveModule(actionsTaken);
          break;
        case 'adaptive':
          await this.healAdaptiveModule(actionsTaken);
          break;
        case 'narrative':
          await this.healNarrativeModule(actionsTaken);
          break;
        case 'avatar':
          await this.healAvatarModule(actionsTaken);
          break;
        case 'tts':
          await this.healTTSModule(actionsTaken);
          break;
        case 'lipsync':
          await this.healLipSyncModule(actionsTaken);
          break;
        case 'memory':
          await this.healMemoryModule(actionsTaken);
          break;
        case 'pipeline':
          await this.healPipeline(actionsTaken);
          break;
        default:
          actionsTaken.push('No heal strategy available');
      }

      return {
        module_name: module.name,
        success: true,
        actions_taken: actionsTaken,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        module_name: module.name,
        success: false,
        actions_taken: actionsTaken,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STRATÉGIES DE RÉPARATION
  // ═══════════════════════════════════════════════════════════════════════════

  private async healCognitiveModule(actions: string[]): Promise<void> {
    actions.push('Resetting cognitive state');
    await invoke('autoheal_reset_cognitive');

    actions.push('Reinitializing cognitive engine');
    await invoke('autoheal_init_cognitive');
  }

  private async healAdaptiveModule(actions: string[]): Promise<void> {
    actions.push('Resetting adaptive parameters');
    await invoke('autoheal_reset_adaptive');
  }

  private async healNarrativeModule(actions: string[]): Promise<void> {
    actions.push('Clearing narrative buffer');
    await invoke('autoheal_clear_narrative');

    actions.push('Reinitializing narrative engine');
    await invoke('autoheal_init_narrative');
  }

  private async healAvatarModule(actions: string[]): Promise<void> {
    actions.push('Stopping avatar animations');
    await invoke('autoheal_stop_avatar');

    actions.push('Reloading avatar model');
    await invoke('autoheal_reload_avatar');

    actions.push('Restarting avatar engine');
    await invoke('autoheal_start_avatar');
  }

  private async healTTSModule(actions: string[]): Promise<void> {
    actions.push('Clearing TTS queue');
    await invoke('autoheal_clear_tts_queue');

    actions.push('Reinitializing TTS engine');
    await invoke('autoheal_init_tts');
  }

  private async healLipSyncModule(actions: string[]): Promise<void> {
    actions.push('Resynchronizing lip-sync');
    await invoke('autoheal_resync_lipsync');
  }

  private async healMemoryModule(actions: string[]): Promise<void> {
    actions.push('Rebuilding memory index');
    await invoke('autoheal_rebuild_memory_index');

    actions.push('Validating memory integrity');
    await invoke('autoheal_validate_memory');
  }

  private async healPipeline(actions: string[]): Promise<void> {
    actions.push('Stopping pipeline');
    await invoke('autoheal_stop_pipeline');

    actions.push('Clearing pipeline buffers');
    await invoke('autoheal_clear_pipeline');

    actions.push('Restarting pipeline');
    await invoke('autoheal_start_pipeline');
  }

  /**
   * Resynchronise l'état global
   */
  public async resyncState(): Promise<void> {
    console.log('[AutoHeal] 🔄 Resynchronizing state...');

    try {
      await invoke('autoheal_resync_state');
      console.log('[AutoHeal] ✅ State resynchronized');
    } catch (error) {
      console.error('[AutoHeal] State resync failed:', error);
      throw error;
    }
  }

  /**
   * Obtient l'historique des réparations
   */
  public getHistory(): HealResult[] {
    return [...this.healHistory];
  }

  /**
   * Efface l'historique
   */
  public clearHistory(): void {
    this.healHistory = [];
  }

  /**
   * Obtient les modules actuellement cassés
   */
  public getBrokenModules(): BrokenModule[] {
    return Array.from(this.brokenModules.values());
  }
}

export const AutoHeal = AutoHealEngine.getInstance();
