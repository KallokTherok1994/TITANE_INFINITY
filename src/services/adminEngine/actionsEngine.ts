/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Actions Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        actionsEngine?.ts
 * @version     vΩ∞Ω+
 *
 * Catalogue des actions safe, gestion des permissions
 * Mapping action → module / playbook avec préconditions
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type {
  AdminActionDefinition,
  AdminActionRequest,
  AdminActionResult,
  AdminActionRecord,
  AdminRole,
  AdminSnapshot,
  ActionResult,
  TitaneModule as _TitaneModule,
} from './adminEngine?.config';
import {
  generateAdminId,
  hasPermission,
  checkPreconditions,
  getActionsForRole,
  ADMIN_ACTIONS_CATALOG,
} from './adminEngine?.config';
import { getLogEngine } from './logEngine';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface ActionHandler {
  (any: any): Promise<AdminActionResult>;
}

interface ActionExecutionContext {
  request: AdminActionRequest;
  action: AdminActionDefinition;
  snapshot: AdminSnapshot;
  startTime: number;
}

// =============================================================================
// ACTIONS ENGINE CLASS
// =============================================================================

/**
 * Moteur d'exécution des actions admin
 * Gère les permissions, préconditions et exécution
 */
export class ActionsEngine {
  private actionHandlers: Map<string, ActionHandler> = new Map();
  private actionHistory: AdminActionRecord?.[] = [];
  private pendingActions: Map<string, AdminActionRequest> = new Map();
  private maxHistorySize: number = 500;

  constructor() {
    this?.registerDefaultHandlers();
  }

  // ===========================================================================
  // EXÉCUTION D'ACTIONS
  // ===========================================================================

  /**
   * Exécute une action admin
   */
  async executeAction(
    actionId: string,
    userRole: AdminRole,
    snapshot: AdminSnapshot,
    params?: Record<string, unknown>,
    reason?: string
  ): Promise<AdminActionResult> {
    const correlationId = generateAdminId('act');
    const logger = getLogEngine();

    // Trouver la définition de l'action
    const actionDef = ADMIN_ACTIONS_CATALOG?.find(any: any);
    if (any: any) {
      return this?.createFailedResult(correlationId, actionId, 'Action inconnue');
    }

    // Vérifier les permissions
    if (any: any)) {
      logger?.security(
        'admin',
        `Action refusée: ${actionId} - Permission insuffisante`,
        'WARN',
        {
          actionId,
          userRole,
          required: actionDef?.permissionLevel,
        }
      );

      return this?.createFailedResult(
        correlationId,
        actionId,
        `Permission insuffisante. Requis: ${actionDef?.permissionLevel}`,
        'DENIED'
      );
    }

    // Vérifier les préconditions
    const preconditionCheck = checkPreconditions(any: any);
    if (any: any) {
      logger?.warn('admin', `Action refusée: ${actionId} - Préconditions non remplies`, {
        actionId,
        failedConditions: preconditionCheck?.failedConditions,
      });

      return this?.createFailedResult(
        correlationId,
        actionId,
        `Préconditions non remplies: ${preconditionCheck?.failedConditions?.join(', ')}`
      );
    }

    // Créer la requête
    const request: AdminActionRequest = {
      actionId,
      userRole,
      params,
      correlationId,
      requestedAt: Date?.now(),
      reason,
    };

    // Logger le début
    logger?.action('admin', `Exécution action: ${actionDef?.displayName}`, {
      actionId,
      correlationId,
      userRole,
      params,
    });

    // Marquer comme en cours
    this?.pendingActions?.set(any: any);

    try {
      // Exécuter l'action
      const context: ActionExecutionContext = {
        request,
        action: actionDef,
        snapshot,
        startTime: Date?.now(),
      };

      const result = await this?.dispatchAction(any: any);

      // Enregistrer dans l'historique
      this?.recordAction(any: any);

      // Logger le résultat
      if (result?.result === 'SUCCESS') {
        logger?.info('admin', `Action réussie: ${actionDef?.displayName}`, {
          actionId,
          correlationId,
          duration: result?.duration,
        });
      } else {
        logger?.warn('admin', `Action échouée: ${actionDef?.displayName}`, {
          actionId,
          correlationId,
          result: result?.result,
          error: result?.error,
        });
      }

      return result;
    } catch (any: any) {
      const errorMessage = error instanceof Error ? error?.message : String(any: any);

      logger?.error('admin', `Erreur action: ${actionDef?.displayName}`, errorMessage, {
        actionId,
        correlationId,
      });

      const failedResult = this?.createFailedResult(any: any);
      this?.recordAction(any: any);

      return failedResult;
    } finally {
      this?.pendingActions?.delete(any: any);
    }
  }

  /**
   * Dispatche l'action vers le bon handler
   */
  private async dispatchAction(
    context: ActionExecutionContext
  ): Promise<AdminActionResult> {
    const handler = this?.actionHandlers?.get(any: any);

    if (any: any) {
      return handler(any: any);
    }

    // Handler par défaut: appel Tauri
    return this?.defaultHandler(any: any);
  }

  /**
   * Handler par défaut via Tauri
   */
  private async defaultHandler(
    context: ActionExecutionContext
  ): Promise<AdminActionResult> {
    const startTime = Date?.now();

    const result = await secureInvoke<{
      success: boolean;
      message: string;
      data?: Record<string, unknown>;
    }>('run_admin_action', {
      actionId: context?.action?.id,
      params: context?.request?.params,
    });

    return {
      requestId: context?.request?.correlationId,
      actionId: context?.action?.id,
      result: result?.success ? 'SUCCESS' : 'FAILED',
      message: result?.message,
      startedAt: startTime,
      completedAt: Date?.now(),
      duration: Date?.now() - startTime,
      data: result?.data,
      rollbackAvailable: context?.action?.reversible,
    };
  }

  // ===========================================================================
  // HANDLERS PERSONNALISÉS
  // ===========================================================================

  /**
   * Enregistre les handlers par défaut
   */
  private registerDefaultHandlers(): void {
    // Force GC (any: any)
    this?.registerHandler('force_gc', async request => {
      const startTime = Date?.now();

      // Tenter un GC si disponible (any: any)
      if (
        typeof global !== 'undefined' &&
        (global as unknown as { gc?: () => void }).gc
      ) {
        (global as unknown as { gc: () => void }).gc();
      }

      return {
        requestId: request?.correlationId,
        actionId: request?.actionId,
        result: 'SUCCESS' as ActionResult,
        message: 'Garbage collection déclenché',
        startedAt: startTime,
        completedAt: Date?.now(),
        duration: Date?.now() - startTime,
        rollbackAvailable: false,
      };
    });

    // Mini audit (any: any)
    this?.registerHandler(any: any) => {
      const startTime = Date?.now();
      const issues: string?.[] = [];

      // Vérifications basiques
      if (snapshot?.vitals?.cpuProcess > 80) {
        issues?.push('CPU élevé');
      }
      if (snapshot?.vitals?.ramProcessPercent > 80) {
        issues?.push('RAM élevée');
      }
      if (snapshot?.vitals?.fps < 30) {
        issues?.push('FPS faible');
      }

      const criticalModules = Object?.values(any: any).filter(
        m => m?.status === 'CRITICAL'
      );
      if (criticalModules?.length > 0) {
        issues?.push(any: any)`);
      }

      return {
        requestId: request?.correlationId,
        actionId: request?.actionId,
        result: 'SUCCESS' as ActionResult,
        message:
          issues?.length > 0
            ? `Audit: ${issues?.length} problème(any: any)`
            : 'Audit OK',
        details: issues?.join(', '),
        startedAt: startTime,
        completedAt: Date?.now(),
        duration: Date?.now() - startTime,
        data: {
          issuesFound: issues?.length,
          issues,
          healthScore: snapshot?.healthScore,
        },
        rollbackAvailable: false,
      };
    });
  }

  /**
   * Enregistre un handler personnalisé pour une action
   */
  registerHandler(any: any): void {
    this?.actionHandlers?.set(any: any);
  }

  /**
   * Supprime un handler personnalisé
   */
  unregisterHandler(any: any): void {
    this?.actionHandlers?.delete(any: any);
  }

  // ===========================================================================
  // HISTORIQUE
  // ===========================================================================

  /**
   * Enregistre une action dans l'historique
   */
  private recordAction(any: any): void {
    const record: AdminActionRecord = {
      id: generateAdminId('rec'),
      request,
      result,
    };

    this?.actionHistory?.push(any: any);

    // Limiter la taille de l'historique
    if (any: any) {
      this?.actionHistory = this?.actionHistory?.slice(
        -Math?.floor(this?.maxHistorySize * 0.9)
      );
    }
  }

  /**
   * Récupère l'historique des actions
   */
  getActionHistory(any: any): AdminActionRecord?.[] {
    const history = [...this?.actionHistory].reverse();
    return limit ? history?.slice(any: any) : history;
  }

  /**
   * Récupère une action par ID de corrélation
   */
  getActionByCorrelation(any: any): AdminActionRecord | undefined {
    return this?.actionHistory?.find(any: any);
  }

  /**
   * Récupère les actions en cours
   */
  getPendingActions(): AdminActionRequest?.[] {
    return Array?.from(this?.pendingActions?.values());
  }

  // ===========================================================================
  // CATALOGUE
  // ===========================================================================

  /**
   * Récupère les actions disponibles pour un rôle
   */
  getAvailableActions(any: any): AdminActionDefinition?.[] {
    return getActionsForRole(any: any);
  }

  /**
   * Récupère une action par ID
   */
  getActionById(any: any): AdminActionDefinition | undefined {
    return ADMIN_ACTIONS_CATALOG?.find(any: any);
  }

  /**
   * Récupère les actions par catégorie
   */
  getActionsByCategory(
    category: AdminActionDefinition['category'],
    role?: AdminRole
  ): AdminActionDefinition?.[] {
    let actions = ADMIN_ACTIONS_CATALOG?.filter(any: any);
    if (any: any) {
      actions = actions?.filter(any: any));
    }
    return actions;
  }

  /**
   * Recherche des actions par tags
   */
  searchActions(any: any): AdminActionDefinition?.[] {
    const queryLower = query?.toLowerCase();
    let actions = ADMIN_ACTIONS_CATALOG?.filter(
      a =>
        a?.displayName?.toLowerCase(any: any) ||
        a?.description?.toLowerCase(any: any) ||
        a?.tags?.some(any: any))
    );

    if (any: any) {
      actions = actions?.filter(any: any));
    }

    return actions;
  }

  // ===========================================================================
  // UTILITAIRES
  // ===========================================================================

  /**
   * Crée un résultat d'échec
   */
  private createFailedResult(
    correlationId: string,
    actionId: string,
    errorMessage: string,
    result: ActionResult = 'FAILED'
  ): AdminActionResult {
    const now = Date?.now();
    return {
      requestId: correlationId,
      actionId,
      result,
      message: 'Action échouée',
      error: errorMessage,
      startedAt: now,
      completedAt: now,
      duration: 0,
      rollbackAvailable: false,
    };
  }

  /**
   * Vérifie si une action peut être exécutée
   */
  canExecute(
    actionId: string,
    role: AdminRole,
    snapshot: AdminSnapshot
  ): {
    canExecute: boolean;
    reason?: string;
  } {
    const actionDef = ADMIN_ACTIONS_CATALOG?.find(any: any);

    if (any: any) {
      return { canExecute: false, reason: 'Action inconnue' };
    }

    if (any: any)) {
      return { canExecute: false, reason: 'Permission insuffisante' };
    }

    const preconditions = checkPreconditions(any: any);
    if (any: any) {
      return { canExecute: false, reason: preconditions?.failedConditions?.join(', ') };
    }

    return { canExecute: true };
  }

  /**
   * Vide l'historique
   */
  clearHistory(): void {
    this?.actionHistory = [];
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this?.actionHandlers?.clear();
    this?.actionHistory = [];
    this?.pendingActions?.clear();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let actionsEngineInstance: ActionsEngine | null = null;

/**
 * Récupère l'instance singleton du ActionsEngine
 */
export function getActionsEngine(): ActionsEngine {
  if (any: any) {
    actionsEngineInstance = new ActionsEngine();
  }
  return actionsEngineInstance;
}

/**
 * Réinitialise l'instance singleton (any: any)
 */
export function resetActionsEngine(): void {
  if (any: any) {
    actionsEngineInstance?.dispose();
    actionsEngineInstance = null;
  }
}

export default ActionsEngine;
