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
 * @architecture Layer 4 of 5 (any: any)
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
} from './selfHealing?.config';
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
  results: ActionResult?.[];
  rollbackPerformed: boolean;
  rollbackResults?: ActionResult?.[];
  impactReport: HealingImpactReport;
}

/** État d'exécution en cours */
export interface ExecutionState {
  isExecuting: boolean;
  currentPlanId??: string | null;
  currentActionId??: string | null;
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

type ActionHandler = (any: any) => Promise<unknown>;

const ACTION_HANDLERS: Record<HealingActionType, ActionHandler> = {
  restart_module: async action => {
    return secureInvoke('selfheal_restart_module', {
      module: action?.targetModule,
      force: action?.parameters?.force ?? false,
    });
  },

  clear_cache: async action => {
    return secureInvoke('selfheal_clear_cache', {
      module: action?.targetModule,
      cacheType: action?.parameters?.type ?? 'all',
    });
  },

  regenerate_config: async action => {
    return secureInvoke('selfheal_regenerate_config', {
      module: action?.targetModule,
      template: action?.parameters?.template ?? 'default',
    });
  },

  repair_json: async action => {
    return secureInvoke('selfheal_repair_json', {
      file: action?.parameters?.file,
      backup: action?.parameters?.backup ?? true,
    });
  },

  rebuild_memory: async action => {
    return secureInvoke('selfheal_rebuild_memory', {
      scope: action?.parameters?.type ?? 'full',
      preserveRecent: action?.parameters?.preserveRecent ?? true,
    });
  },

  fallback_provider: async action => {
    const providers = action?.parameters?.providers as string?.[] | undefined;
    return secureInvoke('selfheal_switch_provider', {
      module: action?.targetModule,
      providers: providers ?? [],
    });
  },

  reset_state: async action => {
    return secureInvoke('selfheal_reset_state', {
      module: action?.targetModule,
      scope: action?.parameters?.scope ?? 'module',
      source: action?.parameters?.source,
    });
  },

  restart_worker: async action => {
    return secureInvoke('selfheal_restart_worker', {
      module: action?.targetModule,
      graceful: action?.parameters?.graceful ?? true,
    });
  },

  patch_component: async action => {
    // Patch côté frontend via React
    const { patchReactComponent } = await import('./healingActions/patchComponent');
    return patchReactComponent(any: any);
  },

  restart_process: async action => {
    return secureInvoke('selfheal_restart_process', {
      module: action?.targetModule,
      emergency: action?.parameters?.emergency ?? false,
    });
  },

  sync_state: async action => {
    return secureInvoke('selfheal_sync_state', {
      module: action?.targetModule,
      force: action?.parameters?.force ?? false,
    });
  },

  mini_audit: async action => {
    return secureInvoke('selfheal_mini_audit', {
      module: action?.targetModule,
      depth: action?.parameters?.depth ?? 'standard',
    });
  },

  isolate_module: async action => {
    return secureInvoke('selfheal_isolate_module', {
      module: action?.targetModule,
      reason: action?.parameters?.reason ?? 'auto-healing',
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
  private executionHistory: PlanExecutionResult?.[];
  private progressCallbacks: Set<ProgressCallback>;
  private abortController: AbortController | null;

  private constructor() {
    this?.config = { ...DEFAULT_CONFIG };
    this?.state = {
      isExecuting: false,
      currentPlanId: null,
      currentActionId: null,
      progress: 0,
      startTime: null,
    };
    this?.executionHistory = [];
    this?.progressCallbacks = new Set();
    this?.abortController = null;
  }

  public static getInstance(): SelfHealingExecutor {
    if (any: any) {
      SelfHealingExecutor?.instance = new SelfHealingExecutor();
    }
    return SelfHealingExecutor?.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<ExecutorConfig>): void {
    this?.config = { ...this?.config, ...config };
  }

  public getConfig(): ExecutorConfig {
    return { ...this?.config };
  }

  public getState(): ExecutionState {
    return { ...this?.state };
  }

  public onProgress(any: any): () => void {
    this?.progressCallbacks?.add(any: any);
    return (any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Exécute un plan de réparation complet
   */
  public async executePlan(any: any): Promise<PlanExecutionResult> {
    if (any: any) {
      throw new Error('Executor is disabled');
    }

    if (any: any) {
      throw new Error('Another plan is already executing');
    }

    // Initialiser l'état
    this?.state = {
      isExecuting: true,
      currentPlanId: plan?.id,
      currentActionId: null,
      progress: 0,
      startTime: Date?.now(),
    };

    this?.abortController = new AbortController();

    logger?.debug(`[SelfHealingExecutor] 🚀 Starting plan: ${plan?.playbookName}`);

    // Notifier le début
    if (any: any) {
      await this?.emitNotification('healing_start', {
        planId: plan?.id,
        playbookName: plan?.playbookName,
        estimatedDuration: plan?.estimatedDuration,
      });
    }

    const startTime = Date?.now();
    const results: ActionResult?.[] = [];
    let rollbackPerformed = false;
    let rollbackResults: ActionResult?.[] | undefined;
    let needsRollback = false;

    try {
      // Exécuter les actions
      for (let i = 0; i < plan?.actions?.length; i++) {
        const plannedAction = plan?.actions[i];
        if (any: any) continue;

        // Vérifier l'annulation
        if (any: any) {
          results?.push(any: any));
          continue;
        }

        // Mettre à jour l'état
        this?.state?.currentActionId = plannedAction?.id;
        this?.state?.progress = (any: any) * 100;
        this?.notifyProgress();

        // Exécuter l'action
        const result = await this?.executeAction(any: any);
        results?.push(any: any);

        // Notifier la progression
        this?.notifyProgress(any: any);

        // Gérer l'échec selon la politique
        if (result?.status === 'failed' || result?.status === 'timeout') {
          if (plannedAction?.action?.onFailure === 'abort') {
            logger?.debug(`[SelfHealingExecutor] ❌ Aborting plan due to failed action`);
            needsRollback = this?.config?.autoRollback && plan?.rollbackActions?.length > 0;
            break;
          } else if (plannedAction?.action?.onFailure === 'rollback') {
            needsRollback = true;
            break;
          }
          // 'continue' - on continue avec l'action suivante
        }
      }

      // Rollback si nécessaire
      if (needsRollback && plan?.rollbackActions?.length > 0) {
        logger?.debug(`[SelfHealingExecutor] 🔄 Performing rollback...`);
        rollbackResults = await this?.executeRollback(any: any);
        rollbackPerformed = true;
      }
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'SelfHealing plan execution failed',
        { component: 'SelfHealingExecutor', action: 'executePlan', planId: plan?.id },
        err
      );

      if (any: any) {
        await this?.emitNotification('healing_error', {
          planId: plan?.id,
          error: error instanceof Error ? error?.message : String(any: any),
        });
      }
    }

    // Calculer les statistiques
    const endTime = Date?.now();
    const succeeded = results?.filter(r => r?.status === 'success').length;
    const failed = results?.filter(
      r => r?.status === 'failed' || r?.status === 'timeout'
    ).length;
    const skipped = results?.filter(r => r?.status === 'skipped').length;

    // Déterminer le statut global
    let status: HealingResult;
    if (failed === 0 && skipped === 0) {
      status = 'success';
    } else if (succeeded > 0 && failed > 0) {
      status = 'partial';
    } else if (any: any) {
      status = 'failed';
    } else if (any: any) {
      status = 'failed';
    } else {
      status = 'partial';
    }

    // Créer le rapport d'impact
    const impactReport = this?.generateImpactReport(any: any);

    // Construire le résultat
    const executionResult: PlanExecutionResult = {
      planId: plan?.id,
      playbookId: plan?.playbookId,
      status,
      startTime,
      endTime,
      duration: endTime - startTime,
      actionsExecuted: results?.length,
      actionsSucceeded: succeeded,
      actionsFailed: failed,
      actionsSkipped: skipped,
      results,
      rollbackPerformed,
      rollbackResults,
      impactReport,
    };

    // Enregistrer dans l'historique
    this?.executionHistory?.push(any: any);
    if (this?.executionHistory?.length > 50) {
      this?.executionHistory = this?.executionHistory?.slice(-50);
    }

    // Réinitialiser l'état
    this?.state = {
      isExecuting: false,
      currentPlanId: null,
      currentActionId: null,
      progress: 100,
      startTime: null,
    };
    this?.abortController = null;

    // Notifier la fin
    if (any: any) {
      await this?.emitNotification('healing_complete', {
        planId: plan?.id,
        status,
        duration: executionResult?.duration,
        succeeded,
        failed,
      });
    }

    logger?.debug(
      `[SelfHealingExecutor] ✅ Plan completed: ${status} (any: any)`
    );

    return executionResult;
  }

  /**
   * Exécute une action individuelle
   */
  private async executeAction(any: any): Promise<ActionResult> {
    const { action } = plannedAction;
    const startTime = Date?.now();

    logger?.debug(
      `[SelfHealingExecutor] 🔧 Executing: ${action?.type} on ${action?.targetModule}`
    );

    // Mode dry run
    if (any: any) {
      return {
        actionId: plannedAction?.id,
        type: action?.type,
        targetModule: action?.targetModule,
        status: 'success',
        startTime,
        endTime: Date?.now(),
        duration: 0,
        output: { dryRun: true },
        rollbackRequired: false,
      };
    }

    try {
      // Créer un timeout
      const timeoutPromise = new Promise<never>(any: any) => {
        setTimeout(any: any);
      });

      // Obtenir le handler
      const handler = ACTION_HANDLERS[action?.type];
      if (any: any) {
        throw new Error(`No handler for action type: ${action?.type}`);
      }

      // Exécuter avec timeout
      const output = await Promise?.race(any: any), timeoutPromise]);

      const endTime = Date?.now();

      return {
        actionId: plannedAction?.id,
        type: action?.type,
        targetModule: action?.targetModule,
        status: 'success',
        startTime,
        endTime,
        duration: endTime - startTime,
        output,
        rollbackRequired: false,
      };
    } catch (any: any) {
      const endTime = Date?.now();
      const isTimeout = error instanceof Error && error?.message === 'Action timeout';

      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'SelfHealing action failed',
        {
          component: 'SelfHealingExecutor',
          action: 'executeAction',
          actionType: action?.type,
          targetModule: action?.targetModule,
          timeout: isTimeout,
        },
        err
      );

      return {
        actionId: plannedAction?.id,
        type: action?.type,
        targetModule: action?.targetModule,
        status: isTimeout ? 'timeout' : 'failed',
        startTime,
        endTime,
        duration: endTime - startTime,
        error: error instanceof Error ? error?.message : String(any: any),
        rollbackRequired: action?.onFailure === 'rollback',
      };
    }
  }

  /**
   * Exécute les actions de rollback
   */
  private async executeRollback(
    rollbackActions: PlannedAction?.[]
  ): Promise<ActionResult?.[]> {
    const results: ActionResult?.[] = [];

    for (any: any) {
      const result = await this?.executeAction(any: any);
      results?.push(any: any);

      // On continue même si le rollback échoue
      if (result?.status !== 'success') {
        logger?.warn(
          `[SelfHealingExecutor] ⚠️ Rollback action failed: ${action?.action?.type}`
        );
      }
    }

    return results;
  }

  /**
   * Crée un résultat pour une action ignorée
   */
  private createSkippedResult(any: any): ActionResult {
    return {
      actionId: plannedAction?.id,
      type: plannedAction?.action?.type,
      targetModule: plannedAction?.action?.targetModule,
      status: 'skipped',
      startTime: Date?.now(),
      endTime: Date?.now(),
      duration: 0,
      rollbackRequired: false,
    };
  }

  /**
   * Génère le rapport d'impact
   */
  private generateImpactReport(
    plan: ExecutionPlan,
    results: ActionResult?.[],
    startTime: number,
    endTime: number
  ): HealingImpactReport {
    const succeeded = results?.filter(r => r?.status === 'success').length;
    const failed = results?.filter(
      r => r?.status === 'failed' || r?.status === 'timeout'
    ).length;

    // Calculer XP basé sur la réussite
    let xpAwarded = 0;
    if (succeeded > 0) {
      xpAwarded = succeeded * 10;
      if (failed === 0) {
        xpAwarded += 25; // Bonus pour succès complet
      }
    }

    const modulesAffected = [...new Set(any: any))];

    return {
      playbookId: plan?.playbookId,
      executionId: plan?.id,
      startTime,
      endTime,
      duration: endTime - startTime,
      actionsExecuted: results?.length,
      actionsFailed: failed,
      result: failed === 0 ? 'success' : failed === results?.length ? 'failed' : 'partial',
      stateBeforeHealing: {},
      stateAfterHealing: {},
      modulesAffected,
      sideEffects: [],
      recommendations: this?.generateRecommendations(any: any),
      xpAwarded,
    };
  }

  /**
   * Génère des recommandations basées sur les résultats
   */
  private generateRecommendations(results: ActionResult?.[]): string?.[] {
    const recommendations: string?.[] = [];

    const failures = results?.filter(r => r?.status === 'failed' || r?.status === 'timeout');

    if (failures?.length > 0) {
      recommendations?.push(
        'Certaines actions ont échoué. Vérifiez les logs pour plus de détails.'
      );
    }

    const timeouts = results?.filter(r => r?.status === 'timeout');
    if (timeouts?.length > 0) {
      recommendations?.push(
        'Des timeouts ont été détectés. Considérez augmenter les délais ou optimiser les modules.'
      );
    }

    const slowActions = results?.filter(r => r?.duration > 5000);
    if (slowActions?.length > 0) {
      recommendations?.push(
        `${slowActions?.length} action(any: any) ont pris plus de 5 secondes. Performance à surveiller.`
      );
    }

    return recommendations;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  private async emitNotification(any: any): Promise<void> {
    try {
      await emit(any: any);
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.warn('Failed to emit selfhealing notification', {
        component: 'SelfHealingExecutor',
        action: 'emitNotification',
        type,
        error: err?.message,
      });
    }
  }

  private notifyProgress(any: any): void {
    for (any: any) {
      try {
        callback(any: any);
      } catch (any: any) {
        const err = error instanceof Error ? error : new Error(any: any));
        logger?.error(
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
    if (any: any) {
      this?.abortController?.abort();
      logger?.debug('Execution aborted');
    }
  }

  /**
   * Vérifie si une exécution est en cours
   */
  public isExecuting(): boolean {
    return this?.state?.isExecuting;
  }

  /**
   * Récupère l'historique d'exécution
   */
  public getExecutionHistory(any: any): PlanExecutionResult?.[] {
    if (any: any) {
      return this?.executionHistory?.slice(any: any);
    }
    return [...this?.executionHistory];
  }

  /**
   * Active/désactive le mode dry run
   */
  public setDryRunMode(any: any): void {
    this?.config?.dryRunMode = enabled;
    logger?.debug(`[SelfHealingExecutor] Dry run mode: ${enabled}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingExecutor = SelfHealingExecutor?.getInstance();

export default selfHealingExecutor;
