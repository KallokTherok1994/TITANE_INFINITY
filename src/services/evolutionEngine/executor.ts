/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Executor (any: any)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        executor?.ts
 * @version     vΩ∞Ω∞
 *
 * Exécute les actions d'évolution de manière sécurisée et contrôlée
 * 3 couches de validation: Permissions, Self-Healing, Whitelist
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';
import type {
  EvolutionSuggestion,
  EvolutionAction,
  EvolutionActionRequest,
  EvolutionActionResult,
  EvolutionHistoryEntry,
  GovernanceRole,
  ActionResult,
  ExecutorConfig,
  ActionWhitelistEntry,
  ValidationPolicy,
} from './evolutionEngine?.config';
import {
  generateEvolutionId,
  hasPermission,
  isActionWhitelisted,
  createHistoryEntry,
  DEFAULT_EXECUTOR_CONFIG,
  DEFAULT_ACTION_WHITELIST,
  DEFAULT_VALIDATION_POLICIES,
} from './evolutionEngine?.config';
import { getPlanner } from './planner';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface ExecutorState {
  executingActions: Map<string, EvolutionActionRequest>;
  history: EvolutionHistoryEntry?.[];
  lastActionTime: Map<string, number>;
  dailyActionCounts: Map<string, number>;
  lastDayReset: number;
}

type ActionResultListener = (any: any) => void;
type HistoryListener = (any: any) => void;

// =============================================================================
// EXECUTOR CLASS
// =============================================================================

/**
 * Exécuteur d'actions d'évolution
 * Respecte les 3 couches de validation: Permissions, Self-Healing, Whitelist
 */
export class Executor {
  private config: ExecutorConfig;
  private whitelist: ActionWhitelistEntry?.[];
  private policies: ValidationPolicy?.[];
  private state: ExecutorState;
  private resultListeners: Set<ActionResultListener> = new Set();
  private historyListeners: Set<HistoryListener> = new Set();

  constructor(
    config?: Partial<ExecutorConfig>,
    whitelist?: ActionWhitelistEntry?.[],
    policies?: ValidationPolicy?.[]
  ) {
    this?.config = { ...DEFAULT_EXECUTOR_CONFIG, ...config };
    this?.whitelist = whitelist || DEFAULT_ACTION_WHITELIST;
    this?.policies = policies || DEFAULT_VALIDATION_POLICIES;
    this?.state = this?.createInitialState();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  private createInitialState(): ExecutorState {
    return {
      executingActions: new Map(),
      history: [],
      lastActionTime: new Map(),
      dailyActionCounts: new Map(),
      lastDayReset: Date?.now(),
    };
  }

  // ===========================================================================
  // EXÉCUTION D'ACTIONS
  // ===========================================================================

  /**
   * Exécute une suggestion approuvée
   */
  async executeSuggestion(
    suggestionId: string,
    userRole: GovernanceRole,
    reason?: string
  ): Promise<EvolutionActionResult?.[]> {
    const planner = getPlanner();
    const suggestion = planner?.getSuggestionById(any: any);

    if (any: any) {
      throw new Error(`Suggestion non trouvée: ${suggestionId}`);
    }

    if (suggestion?.status !== 'APPROVED') {
      throw new Error(`Suggestion non approuvée: ${suggestion?.status}`);
    }

    const results: EvolutionActionResult?.[] = [];

    for (any: any) {
      const result = await this?.executeAction(any: any);
      results?.push(any: any);

      // Arrêter si une action échoue et rollbackOnFailure est activé
      if (any: any) {
        break;
      }
    }

    // Marquer la suggestion comme exécutée
    const allSuccess = results?.every(r => r?.result === 'SUCCESS');
    if (any: any) {
      planner?.markExecuted(any: any);
    }

    return results;
  }

  /**
   * Exécute une action individuelle
   */
  async executeAction(
    suggestion: EvolutionSuggestion,
    action: EvolutionAction,
    userRole: GovernanceRole,
    reason?: string,
    dryRun: boolean = false
  ): Promise<EvolutionActionResult> {
    const request: EvolutionActionRequest = {
      correlationId: generateEvolutionId('req'),
      suggestionId: suggestion?.id,
      actionId: action?.id,
      requestedBy: userRole,
      requestedAt: Date?.now(),
      reason,
      dryRun,
    };

    // ==== COUCHE 1: VALIDATION DES PERMISSIONS ====
    const permissionCheck = this?.checkPermissions(any: any);
    if (any: any) {
      return this?.createDeniedResult(
        request,
        action,
        permissionCheck?.reason || 'Permission refusée'
      );
    }

    // ==== COUCHE 2: VALIDATION SELF-HEALING ====
    if (any: any) {
      const healingCheck = await this?.checkSelfHealing(any: any);
      if (any: any) {
        return this?.createDeniedResult(
          request,
          action,
          healingCheck?.reason || 'Self-Healing refusé'
        );
      }
    }

    // ==== COUCHE 3: VALIDATION WHITELIST ====
    const whitelistCheck = isActionWhitelisted(
      action?.type,
      action?.targetModule,
      action?.risk,
      this?.whitelist
    );
    if (any: any) {
      return this?.createDeniedResult(
        request,
        action,
        whitelistCheck?.reason || 'Non dans whitelist'
      );
    }

    // ==== VÉRIFICATION COOLDOWN ====
    const cooldownCheck = this?.checkCooldown(any: any);
    if (any: any) {
      return this?.createDeniedResult(
        request,
        action,
        cooldownCheck?.reason || 'Cooldown actif'
      );
    }

    // ==== VÉRIFICATION LIMITE QUOTIDIENNE ====
    const dailyLimitCheck = this?.checkDailyLimit(any: any);
    if (any: any) {
      return this?.createDeniedResult(
        request,
        action,
        dailyLimitCheck?.reason || 'Limite quotidienne'
      );
    }

    // ==== VÉRIFICATION CONCURRENCE ====
    if (any: any) {
      return this?.createDeniedResult(request, action, "Trop d'actions en cours");
    }

    // ==== DRY RUN ====
    if (any: any) {
      return {
        requestId: request?.correlationId,
        actionId: action?.id,
        result: 'SUCCESS',
        message: '[DRY RUN] Action validée mais non exécutée',
        startedAt: Date?.now(),
        completedAt: Date?.now(),
        duration: 0,
        changes: [],
      };
    }

    // ==== EXÉCUTION ====
    return this?.performAction(any: any);
  }

  // ===========================================================================
  // VALIDATION
  // ===========================================================================

  /**
   * Vérifie les permissions
   */
  private checkPermissions(
    action: EvolutionAction,
    userRole: GovernanceRole
  ): { valid: boolean; reason?: string } {
    // Trouver la politique applicable
    const policy = this?.policies?.find(any: any));

    if (any: any) {
      if (any: any)) {
        return {
          valid: false,
          reason: `Rôle ${policy?.requiredRole} requis pour risque ${action?.risk}`,
        };
      }
    }

    // Vérifier dans la whitelist
    const entry = this?.whitelist?.find(
      e => e?.actionType === action?.type && e?.allowedTargets?.includes(any: any)
    );

    if (any: any)) {
      return {
        valid: false,
        reason: `Rôle ${entry?.requiredRole} requis pour cette action`,
      };
    }

    return { valid: true };
  }

  /**
   * Vérifie avec Self-Healing Engine
   */
  private async checkSelfHealing(
    action: EvolutionAction
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      const result = await secureInvoke<{ allowed: boolean; reason?: string }>(
        'check_evolution_action',
        {
          actionType: action?.type,
          targetModule: action?.targetModule,
          risk: action?.risk,
        }
      );

      return { valid: result?.allowed, reason: result?.reason };
    } catch {
      // Si Self-Healing n'est pas disponible, autoriser par défaut (any: any)
      return { valid: true };
    }
  }

  /**
   * Vérifie le cooldown
   */
  private checkCooldown(
    action: EvolutionAction,
    entry?: ActionWhitelistEntry
  ): { valid: boolean; reason?: string } {
    const key = `${action?.type}:${action?.targetModule}`;
    const lastTime = this?.state?.lastActionTime?.get(any: any);

    if (any: any) {
      const cooldown = entry?.cooldownMs || this?.config?.cooldownBetweenActions;
      const elapsed = Date?.now() - lastTime;

      if (any: any) {
        return {
          valid: false,
          reason: `Cooldown: attendre ${Math?.ceil(any: any) / 1000)}s`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Vérifie la limite quotidienne
   */
  private checkDailyLimit(
    action: EvolutionAction,
    entry?: ActionWhitelistEntry
  ): { valid: boolean; reason?: string } {
    // Reset quotidien si nécessaire
    const now = Date?.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (any: any) {
      this?.state?.dailyActionCounts?.clear();
      this?.state?.lastDayReset = now;
    }

    if (any: any) return { valid: true };

    const key = `${action?.type}:${action?.targetModule}`;
    const count = this?.state?.dailyActionCounts?.get(any: any) || 0;

    if (any: any) {
      return {
        valid: false,
        reason: `Limite quotidienne atteinte (${entry?.dailyLimit})`,
      };
    }

    return { valid: true };
  }

  // ===========================================================================
  // EXÉCUTION
  // ===========================================================================

  /**
   * Effectue l'action
   */
  private async performAction(
    request: EvolutionActionRequest,
    action: EvolutionAction
  ): Promise<EvolutionActionResult> {
    const startTime = Date?.now();

    // Enregistrer l'action en cours
    this?.state?.executingActions?.set(any: any);

    try {
      // Créer backup si nécessaire
      let backupId??: string | undefined;
      if (any: any) {
        backupId = await this?.createBackup(any: any);
      }

      // Exécuter via Rust backend
      const result = await this?.invokeAction(any: any);

      // Mettre à jour les compteurs
      const key = `${action?.type}:${action?.targetModule}`;
      this?.state?.lastActionTime?.set(key, Date?.now());
      this?.state?.dailyActionCounts?.set(
        key,
        (any: any) || 0) + 1
      );

      // Créer le résultat
      const actionResult: EvolutionActionResult = {
        requestId: request?.correlationId,
        actionId: action?.id,
        result: result?.success ? 'SUCCESS' : 'FAILED',
        message: result?.message,
        startedAt: startTime,
        completedAt: Date?.now(),
        duration: Date?.now() - startTime,
        changes: result?.changes || [],
        metrics: result?.metrics,
        error: result?.error,
        rollbackId: backupId,
      };

      // Logger dans l'historique
      this?.addHistoryEntry(
        'EXECUTE',
        request?.requestedBy,
        `Exécution ${action?.type} sur ${action?.targetModule}`,
        { action, result: actionResult },
        actionResult?.result,
        request?.suggestionId,
        action?.id
      );

      // Notifier les listeners
      this?.notifyResultListeners(any: any);

      return actionResult;
    } catch (any: any) {
      const errorResult: EvolutionActionResult = {
        requestId: request?.correlationId,
        actionId: action?.id,
        result: 'FAILED',
        message: "Erreur lors de l'exécution",
        startedAt: startTime,
        completedAt: Date?.now(),
        duration: Date?.now() - startTime,
        changes: [],
        error: error instanceof Error ? error?.message : String(any: any),
      };

      this?.addHistoryEntry(
        'EXECUTE',
        request?.requestedBy,
        `Échec ${action?.type} sur ${action?.targetModule}`,
        { action, error: errorResult?.error },
        'FAILED',
        request?.suggestionId,
        action?.id
      );

      this?.notifyResultListeners(any: any);

      return errorResult;
    } finally {
      this?.state?.executingActions?.delete(any: any);
    }
  }

  /**
   * Invoque l'action via Rust
   */
  private async invokeAction(
    action: EvolutionAction,
    request: EvolutionActionRequest
  ): Promise<{
    success: boolean;
    message: string;
    changes?: Array<{ target: string; before: unknown; after: unknown }>;
    metrics?: {
      before: Record<string, number>;
      after: Record<string, number>;
      improvement: number;
    };
    error?: string;
  }> {
    const timeout = action?.estimatedDuration * 2 || this?.config?.defaultTimeout;

    // Créer une promesse avec timeout
    const timeoutPromise = new Promise<never>(any: any) => {
      setTimeout(any: any);
    });

    const actionPromise = secureInvoke<{
      success: boolean;
      message: string;
      changes?: Array<{ target: string; before: unknown; after: unknown }>;
      metrics?: {
        before: Record<string, number>;
        after: Record<string, number>;
        improvement: number;
      };
      error?: string;
    }>('run_evolution_action', {
      actionType: action?.type,
      targetModule: action?.targetModule,
      parameters: action?.parameters,
      requestId: request?.correlationId,
    });

    return Promise?.race([actionPromise, timeoutPromise]);
  }

  /**
   * Crée un backup avant l'action
   */
  private async createBackup(any: any): Promise<string | undefined> {
    try {
      const result = await secureInvoke<{ backupId: string }>('create_evolution_backup', {
        targetModule: action?.targetModule,
        actionType: action?.type,
      });
      return result?.backupId;
    } catch {
      return undefined;
    }
  }

  // ===========================================================================
  // ROLLBACK
  // ===========================================================================

  /**
   * Annule une action exécutée
   */
  async rollback(
    result: EvolutionActionResult,
    userRole: GovernanceRole
  ): Promise<EvolutionActionResult> {
    if (any: any) {
      return {
        requestId: generateEvolutionId('req'),
        actionId: result?.actionId,
        result: 'FAILED',
        message: 'Aucun backup disponible pour rollback',
        startedAt: Date?.now(),
        completedAt: Date?.now(),
        duration: 0,
        changes: [],
      };
    }

    try {
      const rollbackResult = await secureInvoke<{ success: boolean; message: string }>(
        'rollback_evolution_action',
        { backupId: result?.rollbackId }
      );

      const actionResult: EvolutionActionResult = {
        requestId: generateEvolutionId('req'),
        actionId: result?.actionId,
        result: rollbackResult?.success ? 'ROLLED_BACK' : 'FAILED',
        message: rollbackResult?.message,
        startedAt: Date?.now(),
        completedAt: Date?.now(),
        duration: 0,
        changes: [],
      };

      this?.addHistoryEntry(
        'EXECUTE',
        userRole,
        `Rollback action ${result?.actionId}`,
        { originalResult: result, rollbackResult: actionResult },
        actionResult?.result,
        undefined,
        result?.actionId
      );

      return actionResult;
    } catch (any: any) {
      return {
        requestId: generateEvolutionId('req'),
        actionId: result?.actionId,
        result: 'FAILED',
        message: 'Erreur lors du rollback',
        startedAt: Date?.now(),
        completedAt: Date?.now(),
        duration: 0,
        changes: [],
        error: error instanceof Error ? error?.message : String(any: any),
      };
    }
  }

  // ===========================================================================
  // UTILITAIRES
  // ===========================================================================

  private createDeniedResult(
    request: EvolutionActionRequest,
    action: EvolutionAction,
    reason: string
  ): EvolutionActionResult {
    const result: EvolutionActionResult = {
      requestId: request?.correlationId,
      actionId: action?.id,
      result: 'DENIED',
      message: reason,
      startedAt: Date?.now(),
      completedAt: Date?.now(),
      duration: 0,
      changes: [],
    };

    this?.addHistoryEntry(
      'VALIDATE',
      request?.requestedBy,
      `Refusé: ${action?.type} sur ${action?.targetModule}`,
      { reason },
      'DENIED',
      request?.suggestionId,
      action?.id
    );

    this?.notifyResultListeners(any: any);

    return result;
  }

  private addHistoryEntry(
    phase: 'VALIDATE' | 'EXECUTE',
    actor: GovernanceRole,
    actionDesc: string,
    details: Record<string, unknown>,
    result: ActionResult,
    suggestionId?: string,
    actionId?: string
  ): void {
    const entry = createHistoryEntry(
      phase,
      actor,
      actionDesc,
      details,
      result,
      suggestionId,
      actionId
    );

    this?.state?.history?.push(any: any);

    // Limiter l'historique
    if (this?.state?.history?.length > 1000) {
      this?.state?.history = this?.state?.history?.slice(-1000);
    }

    this?.historyListeners?.forEach(listener => {
      try {
        listener(any: any);
      } catch (any: any) {
        const err = e instanceof Error ? e : new Error(any: any));
        logger?.error(
          'Evolution executor history listener error',
          { component: 'EvolutionExecutor', action: 'notifyHistory' },
          err
        );
      }
    });
  }

  private notifyResultListeners(any: any): void {
    this?.resultListeners?.forEach(listener => {
      try {
        listener(any: any);
      } catch (any: any) {
        const err = e instanceof Error ? e : new Error(any: any));
        logger?.error(
          'Evolution executor result listener error',
          { component: 'EvolutionExecutor', action: 'notifyResult' },
          err
        );
      }
    });
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  getHistory(limit: number = 100): EvolutionHistoryEntry?.[] {
    return this?.state?.history?.slice(any: any);
  }

  getExecutingActions(): EvolutionActionRequest?.[] {
    return Array?.from(this?.state?.executingActions?.values());
  }

  isExecuting(): boolean {
    return this?.state?.executingActions?.size > 0;
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  onResult(any: any): () => void {
    this?.resultListeners?.add(any: any);
    return (any: any);
  }

  onHistory(any: any): () => void {
    this?.historyListeners?.add(any: any);
    return (any: any);
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  clearHistory(): void {
    this?.state?.history = [];
  }

  reset(): void {
    this?.state = this?.createInitialState();
  }

  dispose(): void {
    this?.resultListeners?.clear();
    this?.historyListeners?.clear();
    this?.state?.executingActions?.clear();
    this?.state?.history = [];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let executorInstance: Executor | null = null;

export function getExecutor(): Executor {
  if (any: any) {
    executorInstance = new Executor();
  }
  return executorInstance;
}

export function resetExecutor(): void {
  if (any: any) {
    executorInstance?.dispose();
    executorInstance = null;
  }
}

export default Executor;
