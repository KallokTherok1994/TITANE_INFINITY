/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Actions Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        actionsEngine.ts
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
} from './adminEngine.config';
import {
  generateAdminId,
  hasPermission,
  checkPreconditions,
  getActionsForRole,
  ADMIN_ACTIONS_CATALOG,
} from './adminEngine.config';
import { getLogEngine } from './logEngine';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface ActionHandler {
  (request: AdminActionRequest, snapshot: AdminSnapshot): Promise<AdminActionResult>;
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
  private actionHistory: AdminActionRecord[] = [];
  private pendingActions: Map<string, AdminActionRequest> = new Map();
  private maxHistorySize: number = 500;

  constructor() {
    this.registerDefaultHandlers();
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
    const actionDef = ADMIN_ACTIONS_CATALOG.find(a => a.id === actionId);
    if (!actionDef) {
      return this.createFailedResult(correlationId, actionId, 'Action inconnue');
    }

    // Vérifier les permissions
    if (!hasPermission(userRole, actionDef)) {
      logger.security(
        'admin',
        `Action refusée: ${actionId} - Permission insuffisante`,
        'WARN',
        {
          actionId,
          userRole,
          required: actionDef.permissionLevel,
        }
      );

      return this.createFailedResult(
        correlationId,
        actionId,
        `Permission insuffisante. Requis: ${actionDef.permissionLevel}`,
        'DENIED'
      );
    }

    // Vérifier les préconditions
    const preconditionCheck = checkPreconditions(actionDef, snapshot);
    if (!preconditionCheck.valid) {
      logger.warn('admin', `Action refusée: ${actionId} - Préconditions non remplies`, {
        actionId,
        failedConditions: preconditionCheck.failedConditions,
      });

      return this.createFailedResult(
        correlationId,
        actionId,
        `Préconditions non remplies: ${preconditionCheck.failedConditions.join(', ')}`
      );
    }

    // Créer la requête
    const request: AdminActionRequest = {
      actionId,
      userRole,
      params,
      correlationId,
      requestedAt: Date.now(),
      reason,
    };

    // Logger le début
    logger.action('admin', `Exécution action: ${actionDef.displayName}`, {
      actionId,
      correlationId,
      userRole,
      params,
    });

    // Marquer comme en cours
    this.pendingActions.set(correlationId, request);

    try {
      // Exécuter l'action
      const context: ActionExecutionContext = {
        request,
        action: actionDef,
        snapshot,
        startTime: Date.now(),
      };

      const result = await this.dispatchAction(context);

      // Enregistrer dans l'historique
      this.recordAction(request, result);

      // Logger le résultat
      if (result.result === 'SUCCESS') {
        logger.info('admin', `Action réussie: ${actionDef.displayName}`, {
          actionId,
          correlationId,
          duration: result.duration,
        });
      } else {
        logger.warn('admin', `Action échouée: ${actionDef.displayName}`, {
          actionId,
          correlationId,
          result: result.result,
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error('admin', `Erreur action: ${actionDef.displayName}`, errorMessage, {
        actionId,
        correlationId,
      });

      const failedResult = this.createFailedResult(correlationId, actionId, errorMessage);
      this.recordAction(request, failedResult);

      return failedResult;
    } finally {
      this.pendingActions.delete(correlationId);
    }
  }

  /**
   * Dispatche l'action vers le bon handler
   */
  private async dispatchAction(
    context: ActionExecutionContext
  ): Promise<AdminActionResult> {
    const handler = this.actionHandlers.get(context.action.id);

    if (handler) {
      return handler(context.request, context.snapshot);
    }

    // Handler par défaut: appel Tauri
    return this.defaultHandler(context);
  }

  /**
   * Handler par défaut via Tauri
   */
  private async defaultHandler(
    context: ActionExecutionContext
  ): Promise<AdminActionResult> {
    const startTime = Date.now();

    const result = await secureInvoke<{
      success: boolean;
      message: string;
      data?: Record<string, unknown>;
    }>('run_admin_action', {
      actionId: context.action.id,
      params: context.request.params,
    });

    return {
      requestId: context.request.correlationId,
      actionId: context.action.id,
      result: result.success ? 'SUCCESS' : 'FAILED',
      message: result.message,
      startedAt: startTime,
      completedAt: Date.now(),
      duration: Date.now() - startTime,
      data: result.data,
      rollbackAvailable: context.action.reversible,
    };
  }

  // ===========================================================================
  // HANDLERS PERSONNALISÉS
  // ===========================================================================

  /**
   * Enregistre les handlers par défaut
   */
  private registerDefaultHandlers(): void {
    // Force GC (JS only)
    this.registerHandler('force_gc', async request => {
      const startTime = Date.now();

      // Tenter un GC si disponible (Node.js avec --expose-gc)
      if (
        typeof global !== 'undefined' &&
        (global as unknown as { gc?: () => void }).gc
      ) {
        (global as unknown as { gc: () => void }).gc();
      }

      return {
        requestId: request.correlationId,
        actionId: request.actionId,
        result: 'SUCCESS' as ActionResult,
        message: 'Garbage collection déclenché',
        startedAt: startTime,
        completedAt: Date.now(),
        duration: Date.now() - startTime,
        rollbackAvailable: false,
      };
    });

    // Mini audit (local check)
    this.registerHandler('run_mini_audit', async (request, snapshot) => {
      const startTime = Date.now();
      const issues: string[] = [];

      // Vérifications basiques
      if (snapshot.vitals.cpuProcess > 80) {
        issues.push('CPU élevé');
      }
      if (snapshot.vitals.ramProcessPercent > 80) {
        issues.push('RAM élevée');
      }
      if (snapshot.vitals.fps < 30) {
        issues.push('FPS faible');
      }

      const criticalModules = Object.values(snapshot.modules).filter(
        m => m.status === 'CRITICAL'
      );
      if (criticalModules.length > 0) {
        issues.push(`${criticalModules.length} module(s) critique(s)`);
      }

      return {
        requestId: request.correlationId,
        actionId: request.actionId,
        result: 'SUCCESS' as ActionResult,
        message:
          issues.length > 0
            ? `Audit: ${issues.length} problème(s) détecté(s)`
            : 'Audit OK',
        details: issues.join(', '),
        startedAt: startTime,
        completedAt: Date.now(),
        duration: Date.now() - startTime,
        data: {
          issuesFound: issues.length,
          issues,
          healthScore: snapshot.healthScore,
        },
        rollbackAvailable: false,
      };
    });
  }

  /**
   * Enregistre un handler personnalisé pour une action
   */
  registerHandler(actionId: string, handler: ActionHandler): void {
    this.actionHandlers.set(actionId, handler);
  }

  /**
   * Supprime un handler personnalisé
   */
  unregisterHandler(actionId: string): void {
    this.actionHandlers.delete(actionId);
  }

  // ===========================================================================
  // HISTORIQUE
  // ===========================================================================

  /**
   * Enregistre une action dans l'historique
   */
  private recordAction(request: AdminActionRequest, result: AdminActionResult): void {
    const record: AdminActionRecord = {
      id: generateAdminId('rec'),
      request,
      result,
    };

    this.actionHistory.push(record);

    // Limiter la taille de l'historique
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory = this.actionHistory.slice(
        -Math.floor(this.maxHistorySize * 0.9)
      );
    }
  }

  /**
   * Récupère l'historique des actions
   */
  getActionHistory(limit?: number): AdminActionRecord[] {
    const history = [...this.actionHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Récupère une action par ID de corrélation
   */
  getActionByCorrelation(correlationId: string): AdminActionRecord | undefined {
    return this.actionHistory.find(r => r.request.correlationId === correlationId);
  }

  /**
   * Récupère les actions en cours
   */
  getPendingActions(): AdminActionRequest[] {
    return Array.from(this.pendingActions.values());
  }

  // ===========================================================================
  // CATALOGUE
  // ===========================================================================

  /**
   * Récupère les actions disponibles pour un rôle
   */
  getAvailableActions(role: AdminRole): AdminActionDefinition[] {
    return getActionsForRole(role);
  }

  /**
   * Récupère une action par ID
   */
  getActionById(actionId: string): AdminActionDefinition | undefined {
    return ADMIN_ACTIONS_CATALOG.find(a => a.id === actionId);
  }

  /**
   * Récupère les actions par catégorie
   */
  getActionsByCategory(
    category: AdminActionDefinition['category'],
    role?: AdminRole
  ): AdminActionDefinition[] {
    let actions = ADMIN_ACTIONS_CATALOG.filter(a => a.category === category);
    if (role) {
      actions = actions.filter(a => hasPermission(role, a));
    }
    return actions;
  }

  /**
   * Recherche des actions par tags
   */
  searchActions(query: string, role?: AdminRole): AdminActionDefinition[] {
    const queryLower = query.toLowerCase();
    let actions = ADMIN_ACTIONS_CATALOG.filter(
      a =>
        a.displayName.toLowerCase().includes(queryLower) ||
        a.description.toLowerCase().includes(queryLower) ||
        a.tags.some(t => t.toLowerCase().includes(queryLower))
    );

    if (role) {
      actions = actions.filter(a => hasPermission(role, a));
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
    const now = Date.now();
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
    const actionDef = ADMIN_ACTIONS_CATALOG.find(a => a.id === actionId);

    if (!actionDef) {
      return { canExecute: false, reason: 'Action inconnue' };
    }

    if (!hasPermission(role, actionDef)) {
      return { canExecute: false, reason: 'Permission insuffisante' };
    }

    const preconditions = checkPreconditions(actionDef, snapshot);
    if (!preconditions.valid) {
      return { canExecute: false, reason: preconditions.failedConditions.join(', ') };
    }

    return { canExecute: true };
  }

  /**
   * Vide l'historique
   */
  clearHistory(): void {
    this.actionHistory = [];
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this.actionHandlers.clear();
    this.actionHistory = [];
    this.pendingActions.clear();
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
  if (!actionsEngineInstance) {
    actionsEngineInstance = new ActionsEngine();
  }
  return actionsEngineInstance;
}

/**
 * Réinitialise l'instance singleton (pour tests)
 */
export function resetActionsEngine(): void {
  if (actionsEngineInstance) {
    actionsEngineInstance.dispose();
    actionsEngineInstance = null;
  }
}

export default ActionsEngine;
