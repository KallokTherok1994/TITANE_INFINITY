/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING EXECUTOR — Layer 4
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Moteur d'exécution sécurisée des actions de réparation
 *
 * @responsibilities
 * - Exécution séquentielle/parallèle des actions
 * - Gestion des timeouts et erreurs
 * - Support du rollback automatique
 * - Logging détaillé des opérations
 * - Communication avec le backend Rust
 * - Notifications utilisateur
 *
 * @architecture Layer 4 of 5 (Observer → Analyzer → Playbook → Executor → Sync)
 * @version vΩ∞
 * @created 2025-01-07
 */

import { secureInvoke } from '@/lib/security';
import { emit } from '@tauri-apps/api/event';
import { logger } from '@/lib/logger';
import {
  type HealingAction,
  type HealingActionType,
  type HealingResult,
  type HealingImpactReport,
} from './selfHealing.config';
import { type ExecutionPlan, type PlannedAction } from './selfHealingPlaybookEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration de l'Executor */
export interface ExecutorConfig {
  enabled: boolean;
  maxConcurrentActions: number;
  globalTimeout: number;
  autoRollback: boolean;
  dryRunMode: boolean;
  notifyOnStart: boolean;
  notifyOnComplete: boolean;
  notifyOnError: boolean;
}

/** Résultat d'exécution d'une action */
export interface ActionResult {
  actionId: string;
  type: HealingActionType;
  targetModule: string;
  status: 'success' | 'failed' | 'timeout' | 'skipped';
  startTime: number;
  endTime: number;
  duration: number;
  output?: unknown;
  error?: string;
  rollbackRequired: boolean;
}

/** Résultat d'exécution d'un plan complet */
export interface PlanExecutionResult {
  planId: string;
  playbookId: string;
  status: HealingResult;
  startTime: number;
  endTime: number;
  duration: number;
  actionsExecuted: number;
  actionsSucceeded: number;
  actionsFailed: number;
  actionsSkipped: number;
  results: ActionResult[];
  rollbackPerformed: boolean;
  rollbackResults?: ActionResult[];
  impactReport: HealingImpactReport;
}

/** État d'exécution en cours */
export interface ExecutionState {
  isExecuting: boolean;
  currentPlanId: string | null;
  currentActionId: string | null;
  progress: number;
  startTime: number | null;
}

/** Callback de progression */
export type ProgressCallback = (
  state: ExecutionState,
  actionResult?: ActionResult
) => void;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ExecutorConfig = {
  enabled: true,
  maxConcurrentActions: 1,
  globalTimeout: 120000,
  autoRollback: true,
  dryRunMode: false,
  notifyOnStart: true,
  notifyOnComplete: true,
  notifyOnError: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

type ActionHandler = (action: HealingAction) => Promise<unknown>;

const ACTION_HANDLERS: Record<HealingActionType, ActionHandler> = {
  restart_module: async action => {
    return secureInvoke('selfheal_restart_module', {
      module: action.targetModule,
      force: action.parameters.force ?? false,
    });
  },

  clear_cache: async action => {
    return secureInvoke('selfheal_clear_cache', {
      module: action.targetModule,
      cacheType: action.parameters.type ?? 'all',
    });
  },

  regenerate_config: async action => {
    return secureInvoke('selfheal_regenerate_config', {
      module: action.targetModule,
      template: action.parameters.template ?? 'default',
    });
  },

  repair_json: async action => {
    return secureInvoke('selfheal_repair_json', {
      file: action.parameters.file,
      backup: action.parameters.backup ?? true,
    });
  },

  rebuild_memory: async action => {
    return secureInvoke('selfheal_rebuild_memory', {
      scope: action.parameters.type ?? 'full',
      preserveRecent: action.parameters.preserveRecent ?? true,
    });
  },

  fallback_provider: async action => {
    const providers = action.parameters.providers as string[] | undefined;
    return secureInvoke('selfheal_switch_provider', {
      module: action.targetModule,
      providers: providers ?? [],
    });
  },

  reset_state: async action => {
    return secureInvoke('selfheal_reset_state', {
      module: action.targetModule,
      scope: action.parameters.scope ?? 'module',
      source: action.parameters.source,
    });
  },

  restart_worker: async action => {
    return secureInvoke('selfheal_restart_worker', {
      module: action.targetModule,
      graceful: action.parameters.graceful ?? true,
    });
  },

  patch_component: async action => {
    // Patch côté frontend via React
    const { patchReactComponent } = await import('./healingActions/patchComponent');
    return patchReactComponent(action.targetModule, action.parameters);
  },

  restart_process: async action => {
    return secureInvoke('selfheal_restart_process', {
      module: action.targetModule,
      emergency: action.parameters.emergency ?? false,
    });
  },

  sync_state: async action => {
    return secureInvoke('selfheal_sync_state', {
      module: action.targetModule,
      force: action.parameters.force ?? false,
    });
  },

  mini_audit: async action => {
    return secureInvoke('selfheal_mini_audit', {
      module: action.targetModule,
      depth: action.parameters.depth ?? 'standard',
    });
  },

  isolate_module: async action => {
    return secureInvoke('selfheal_isolate_module', {
      module: action.targetModule,
      reason: action.parameters.reason ?? 'auto-healing',
    });
  },

  noop: async () => {
    // Action nulle - ne fait rien
    return { status: 'noop' };
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class SelfHealingExecutor {
  private static instance: SelfHealingExecutor;

  private config: ExecutorConfig;
  private state: ExecutionState;
  private executionHistory: PlanExecutionResult[];
  private progressCallbacks: Set<ProgressCallback>;
  private abortController: AbortController | null;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.state = {
      isExecuting: false,
      currentPlanId: null,
      currentActionId: null,
      progress: 0,
      startTime: null,
    };
    this.executionHistory = [];
    this.progressCallbacks = new Set();
    this.abortController = null;
  }

  public static getInstance(): SelfHealingExecutor {
    if (!SelfHealingExecutor.instance) {
      SelfHealingExecutor.instance = new SelfHealingExecutor();
    }
    return SelfHealingExecutor.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<ExecutorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ExecutorConfig {
    return { ...this.config };
  }

  public getState(): ExecutionState {
    return { ...this.state };
  }

  public onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Exécute un plan de réparation complet
   */
  public async executePlan(plan: ExecutionPlan): Promise<PlanExecutionResult> {
    if (!this.config.enabled) {
      throw new Error('Executor is disabled');
    }

    if (this.state.isExecuting) {
      throw new Error('Another plan is already executing');
    }

    // Initialiser l'état
    this.state = {
      isExecuting: true,
      currentPlanId: plan.id,
      currentActionId: null,
      progress: 0,
      startTime: Date.now(),
    };

    this.abortController = new AbortController();

    console.log(`[SelfHealingExecutor] 🚀 Starting plan: ${plan.playbookName}`);

    // Notifier le début
    if (this.config.notifyOnStart) {
      await this.emitNotification('healing_start', {
        planId: plan.id,
        playbookName: plan.playbookName,
        estimatedDuration: plan.estimatedDuration,
      });
    }

    const startTime = Date.now();
    const results: ActionResult[] = [];
    let rollbackPerformed = false;
    let rollbackResults: ActionResult[] | undefined;
    let needsRollback = false;

    try {
      // Exécuter les actions
      for (let i = 0; i < plan.actions.length; i++) {
        const plannedAction = plan.actions[i];
        if (!plannedAction) continue;

        // Vérifier l'annulation
        if (this.abortController.signal.aborted) {
          results.push(this.createSkippedResult(plannedAction));
          continue;
        }

        // Mettre à jour l'état
        this.state.currentActionId = plannedAction.id;
        this.state.progress = (i / plan.actions.length) * 100;
        this.notifyProgress();

        // Exécuter l'action
        const result = await this.executeAction(plannedAction);
        results.push(result);

        // Notifier la progression
        this.notifyProgress(result);

        // Gérer l'échec selon la politique
        if (result.status === 'failed' || result.status === 'timeout') {
          if (plannedAction.action.onFailure === 'abort') {
            console.log(`[SelfHealingExecutor] ❌ Aborting plan due to failed action`);
            needsRollback = this.config.autoRollback && plan.rollbackActions.length > 0;
            break;
          } else if (plannedAction.action.onFailure === 'rollback') {
            needsRollback = true;
            break;
          }
          // 'continue' - on continue avec l'action suivante
        }
      }

      // Rollback si nécessaire
      if (needsRollback && plan.rollbackActions.length > 0) {
        console.log(`[SelfHealingExecutor] 🔄 Performing rollback...`);
        rollbackResults = await this.executeRollback(plan.rollbackActions);
        rollbackPerformed = true;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        'SelfHealing plan execution failed',
        { component: 'SelfHealingExecutor', action: 'executePlan', planId: plan.id },
        err
      );

      if (this.config.notifyOnError) {
        await this.emitNotification('healing_error', {
          planId: plan.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Calculer les statistiques
    const endTime = Date.now();
    const succeeded = results.filter(r => r.status === 'success').length;
    const failed = results.filter(
      r => r.status === 'failed' || r.status === 'timeout'
    ).length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    // Déterminer le statut global
    let status: HealingResult;
    if (failed === 0 && skipped === 0) {
      status = 'success';
    } else if (succeeded > 0 && failed > 0) {
      status = 'partial';
    } else if (failed === results.length) {
      status = 'failed';
    } else if (rollbackPerformed) {
      status = 'failed';
    } else {
      status = 'partial';
    }

    // Créer le rapport d'impact
    const impactReport = this.generateImpactReport(plan, results, startTime, endTime);

    // Construire le résultat
    const executionResult: PlanExecutionResult = {
      planId: plan.id,
      playbookId: plan.playbookId,
      status,
      startTime,
      endTime,
      duration: endTime - startTime,
      actionsExecuted: results.length,
      actionsSucceeded: succeeded,
      actionsFailed: failed,
      actionsSkipped: skipped,
      results,
      rollbackPerformed,
      rollbackResults,
      impactReport,
    };

    // Enregistrer dans l'historique
    this.executionHistory.push(executionResult);
    if (this.executionHistory.length > 50) {
      this.executionHistory = this.executionHistory.slice(-50);
    }

    // Réinitialiser l'état
    this.state = {
      isExecuting: false,
      currentPlanId: null,
      currentActionId: null,
      progress: 100,
      startTime: null,
    };
    this.abortController = null;

    // Notifier la fin
    if (this.config.notifyOnComplete) {
      await this.emitNotification('healing_complete', {
        planId: plan.id,
        status,
        duration: executionResult.duration,
        succeeded,
        failed,
      });
    }

    console.log(
      `[SelfHealingExecutor] ✅ Plan completed: ${status} (${succeeded}/${results.length} succeeded)`
    );

    return executionResult;
  }

  /**
   * Exécute une action individuelle
   */
  private async executeAction(plannedAction: PlannedAction): Promise<ActionResult> {
    const { action } = plannedAction;
    const startTime = Date.now();

    console.log(
      `[SelfHealingExecutor] 🔧 Executing: ${action.type} on ${action.targetModule}`
    );

    // Mode dry run
    if (this.config.dryRunMode) {
      return {
        actionId: plannedAction.id,
        type: action.type,
        targetModule: action.targetModule,
        status: 'success',
        startTime,
        endTime: Date.now(),
        duration: 0,
        output: { dryRun: true },
        rollbackRequired: false,
      };
    }

    try {
      // Créer un timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Action timeout')), action.timeout);
      });

      // Obtenir le handler
      const handler = ACTION_HANDLERS[action.type];
      if (!handler) {
        throw new Error(`No handler for action type: ${action.type}`);
      }

      // Exécuter avec timeout
      const output = await Promise.race([handler(action), timeoutPromise]);

      const endTime = Date.now();

      return {
        actionId: plannedAction.id,
        type: action.type,
        targetModule: action.targetModule,
        status: 'success',
        startTime,
        endTime,
        duration: endTime - startTime,
        output,
        rollbackRequired: false,
      };
    } catch (error) {
      const endTime = Date.now();
      const isTimeout = error instanceof Error && error.message === 'Action timeout';

      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        'SelfHealing action failed',
        {
          component: 'SelfHealingExecutor',
          action: 'executeAction',
          actionType: action.type,
          targetModule: action.targetModule,
          timeout: isTimeout,
        },
        err
      );

      return {
        actionId: plannedAction.id,
        type: action.type,
        targetModule: action.targetModule,
        status: isTimeout ? 'timeout' : 'failed',
        startTime,
        endTime,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : String(error),
        rollbackRequired: action.onFailure === 'rollback',
      };
    }
  }

  /**
   * Exécute les actions de rollback
   */
  private async executeRollback(
    rollbackActions: PlannedAction[]
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const action of rollbackActions) {
      const result = await this.executeAction(action);
      results.push(result);

      // On continue même si le rollback échoue
      if (result.status !== 'success') {
        console.warn(
          `[SelfHealingExecutor] ⚠️ Rollback action failed: ${action.action.type}`
        );
      }
    }

    return results;
  }

  /**
   * Crée un résultat pour une action ignorée
   */
  private createSkippedResult(plannedAction: PlannedAction): ActionResult {
    return {
      actionId: plannedAction.id,
      type: plannedAction.action.type,
      targetModule: plannedAction.action.targetModule,
      status: 'skipped',
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      rollbackRequired: false,
    };
  }

  /**
   * Génère le rapport d'impact
   */
  private generateImpactReport(
    plan: ExecutionPlan,
    results: ActionResult[],
    startTime: number,
    endTime: number
  ): HealingImpactReport {
    const succeeded = results.filter(r => r.status === 'success').length;
    const failed = results.filter(
      r => r.status === 'failed' || r.status === 'timeout'
    ).length;

    // Calculer XP basé sur la réussite
    let xpAwarded = 0;
    if (succeeded > 0) {
      xpAwarded = succeeded * 10;
      if (failed === 0) {
        xpAwarded += 25; // Bonus pour succès complet
      }
    }

    const modulesAffected = [...new Set(results.map(r => r.targetModule))];

    return {
      playbookId: plan.playbookId,
      executionId: plan.id,
      startTime,
      endTime,
      duration: endTime - startTime,
      actionsExecuted: results.length,
      actionsFailed: failed,
      result: failed === 0 ? 'success' : failed === results.length ? 'failed' : 'partial',
      stateBeforeHealing: {},
      stateAfterHealing: {},
      modulesAffected,
      sideEffects: [],
      recommendations: this.generateRecommendations(results),
      xpAwarded,
    };
  }

  /**
   * Génère des recommandations basées sur les résultats
   */
  private generateRecommendations(results: ActionResult[]): string[] {
    const recommendations: string[] = [];

    const failures = results.filter(r => r.status === 'failed' || r.status === 'timeout');

    if (failures.length > 0) {
      recommendations.push(
        'Certaines actions ont échoué. Vérifiez les logs pour plus de détails.'
      );
    }

    const timeouts = results.filter(r => r.status === 'timeout');
    if (timeouts.length > 0) {
      recommendations.push(
        'Des timeouts ont été détectés. Considérez augmenter les délais ou optimiser les modules.'
      );
    }

    const slowActions = results.filter(r => r.duration > 5000);
    if (slowActions.length > 0) {
      recommendations.push(
        `${slowActions.length} action(s) ont pris plus de 5 secondes. Performance à surveiller.`
      );
    }

    return recommendations;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  private async emitNotification(type: string, data: unknown): Promise<void> {
    try {
      await emit(`selfheal://${type}`, data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('Failed to emit selfhealing notification', {
        component: 'SelfHealingExecutor',
        action: 'emitNotification',
        type,
        error: err.message,
      });
    }
  }

  private notifyProgress(actionResult?: ActionResult): void {
    for (const callback of this.progressCallbacks) {
      try {
        callback(this.state, actionResult);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(
          'SelfHealing progress callback error',
          { component: 'SelfHealingExecutor', action: 'notifyProgress' },
          err
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Annule l'exécution en cours
   */
  public abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      console.log('[SelfHealingExecutor] Execution aborted');
    }
  }

  /**
   * Vérifie si une exécution est en cours
   */
  public isExecuting(): boolean {
    return this.state.isExecuting;
  }

  /**
   * Récupère l'historique d'exécution
   */
  public getExecutionHistory(limit?: number): PlanExecutionResult[] {
    if (limit) {
      return this.executionHistory.slice(-limit);
    }
    return [...this.executionHistory];
  }

  /**
   * Active/désactive le mode dry run
   */
  public setDryRunMode(enabled: boolean): void {
    this.config.dryRunMode = enabled;
    console.log(`[SelfHealingExecutor] Dry run mode: ${enabled}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingExecutor = SelfHealingExecutor.getInstance();

export default selfHealingExecutor;
