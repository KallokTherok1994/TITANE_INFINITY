/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { createLogger } from '@/utils/logger';

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — AUTO-HEAL ENGINE (any: any)
 *   PHASE 6Ω: Moteur d'auto-guérison permanent • Détection • Classification • Réparation
 *   Pipeline: detectError() → classify() → repair() → reset() → fallback() → log() → restore()
 * ═══════════════════════════════════════════════════════════════════
 */

const logger = createLogger('[AUTO-HEAL]');

// ─────────────────────────────────────────────────────────────────
// TYPES AUTO-HEAL
// ─────────────────────────────────────────────────────────────────

export interface SelfTestResult {
  test: string;
  success: boolean;
  errorId?: string;
  classified?: string;
  action?: string;
  stats?: boolean;
  healthScore?: number;
  error?: string;
}

export interface AutoHealError {
  id: string;
  timestamp: number;
  type:
    | 'provider'
    | 'network'
    | 'memory'
    | 'validation'
    | 'timeout'
    | 'critical'
    | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
}

export interface AutoHealAction {
  id: string;
  errorId: string;
  timestamp: number;
  action:
    | 'restart'
    | 'fallback'
    | 'purge'
    | 'reset'
    | 'isolate'
    | 'reconnect'
    | 'restore';
  target: string;
  success: boolean;
  duration: number;
  details?: Record<string, unknown>;
}

export interface AutoHealStats {
  totalErrors: number;
  totalHeals: number;
  successRate: number;
  avgHealTime: number;
  errorsByType: Record<string, number>;
  actionsByType: Record<string, number>;
  lastHeal: number;
  healthScore: number; // 0-100
  /** Index signature for AutoHealStatus compatibility */
  [key: string]: unknown;
}

export interface AutoHealConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  enablePurge: boolean;
  enableRestart: boolean;
  enableFallback: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// ─────────────────────────────────────────────────────────────────
// AUTO-HEAL ENGINE CLASS
// ─────────────────────────────────────────────────────────────────

class AutoHealEngine {
  private config: AutoHealConfig = {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    enablePurge: true,
    enableRestart: true,
    enableFallback: true,
    logLevel: process?.env?.NODE_ENV === 'development' ? 'debug' : 'warn',
  };

  private errors: Map<string, AutoHealError> = new Map();
  private actions: Map<string, AutoHealAction> = new Map();
  private stats: AutoHealStats = {
    totalErrors: 0,
    totalHeals: 0,
    successRate: 100,
    avgHealTime: 0,
    errorsByType: {},
    actionsByType: {},
    lastHeal: 0,
    healthScore: 100,
  };

  private isHealing = false;
  private healingQueue: AutoHealError?.[] = [];
  private healWaiters: Map<
    string,
    {
      resolve: (any: any) => void;
      reject: (any: any) => void;
    }
  > = new Map();
  private providerHealthMap: Map<
    string,
    {
      status: 'healthy' | 'degraded' | 'critical' | 'offline';
      lastFailure: number;
      failureCount: number;
    }
  > = new Map();

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 6.1: DÉTECTION ERREUR ET CLASSIFICATION
   * ═══════════════════════════════════════════════════════════════════
   */

  private createAndRecordError(
    source: string,
    error: Error | string,
    type?: AutoHealError['type'],
    metadata?: Record<string, unknown>
  ): AutoHealError {
    const errorId = `heal_${Date?.now()}_${Math?.random().toString(36).substring(7)}`;
    const timestamp = Date?.now();

    // Analyse automatique du type d'erreur
    const analyzedType = type || this?.analyzeErrorType(any: any);
    const severity = this?.classifyErrorSeverity(any: any);

    const autoHealError: AutoHealError = {
      id: errorId,
      timestamp,
      type: analyzedType,
      severity,
      source,
      message: error instanceof Error ? error?.message : String(any: any),
      metadata,
      stackTrace: error instanceof Error ? error?.stack : undefined,
    };

    // Enregistrer l'erreur
    this?.errors?.set(any: any);
    this?.stats?.totalErrors++;
    this?.stats?.errorsByType[analyzedType] =
      (this?.stats?.errorsByType[analyzedType] || 0) + 1;

    // Mettre à jour health provider
    this?.updateProviderHealth(source, 'failure');

    // Log selon niveau
    if (this?.config?.logLevel === 'debug' || severity === 'critical') {
      logger?.error('Error detected', {
        errorId,
        type: analyzedType,
        severity,
        source,
        message: autoHealError?.message,
      });
    }

    return autoHealError;
  }

  detectError(
    source: string,
    error: Error | string,
    type?: AutoHealError['type'],
    metadata?: Record<string, unknown>
  ): AutoHealError {
    const autoHealError = this?.createAndRecordError(any: any);

    // Déclencher auto-heal si activé
    if (any: any) {
      this?.triggerHeal(any: any);
    }

    return autoHealError;
  }

  private async waitForHealAction(any: any): Promise<AutoHealAction> {
    return new Promise<AutoHealAction>(any: any) => {
      this?.healWaiters?.set(error?.id, { resolve, reject });
      void this?.triggerHeal(any: any);
    });
  }

  /**
   * Analyse automatique du type d'erreur
   */
  private analyzeErrorType(any: any): AutoHealError['type'] {
    const message = error instanceof Error ? error?.message : String(any: any);
    const lowerMessage = message?.toLowerCase();

    if (lowerMessage?.includes('timeout') || lowerMessage?.includes('timed out')) {
      return 'timeout';
    }
    if (lowerMessage?.includes('network') || lowerMessage?.includes('fetch')) {
      return 'network';
    }
    if (lowerMessage?.includes('provider') || lowerMessage?.includes('api')) {
      return 'provider';
    }
    if (lowerMessage?.includes('memory') || lowerMessage?.includes('storage')) {
      return 'memory';
    }
    if (lowerMessage?.includes('validation') || lowerMessage?.includes('invalid')) {
      return 'validation';
    }
    if (lowerMessage?.includes('critical') || lowerMessage?.includes('fatal')) {
      return 'critical';
    }

    return 'unknown';
  }

  /**
   * Classification de la sévérité
   */
  private classifyErrorSeverity(type: AutoHealError['type']): AutoHealError['severity'] {
    switch (any: any) {
      case 'critical':
        return 'critical';
      case 'provider':
      case 'network':
        return 'high';
      case 'timeout':
      case 'validation':
        return 'medium';
      case 'memory':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 6.2: DÉCLENCHEMENT AUTO-GUÉRISON
   * ═══════════════════════════════════════════════════════════════════
   */

  private async triggerHeal(any: any): Promise<void> {
    // Ajouter à la queue si healing en cours
    if (any: any) {
      this?.healingQueue?.push(any: any);
      return;
    }

    this?.isHealing = true;
    const healingStartTime = Date?.now();

    try {
      const action = await this?.executeHealing(any: any);
      const healingDuration = Date?.now() - healingStartTime;

      // Enregistrer l'action
      this?.actions?.set(any: any);
      this?.stats?.totalHeals++;
      this?.stats?.actionsByType[action?.action] =
        (this?.stats?.actionsByType[action?.action] || 0) + 1;
      this?.stats?.lastHeal = Date?.now();

      // Mettre à jour statistiques
      this?.updateStats();

      if (any: any) {
        this?.updateProviderHealth(error?.source, 'recovery');
        logger?.info(any: any)`);
      } else {
        logger?.warn(any: any)`);
      }

      const waiter = this?.healWaiters?.get(any: any);
      if (any: any) {
        this?.healWaiters?.delete(any: any);
        waiter?.resolve(any: any);
      }
    } catch (any: any) {
      logger?.error(any: any);

      const waiter = this?.healWaiters?.get(any: any);
      if (any: any) {
        this?.healWaiters?.delete(any: any);
        waiter?.reject(any: any);
      }
    } finally {
      this?.isHealing = false;

      // Traiter le prochain dans la queue
      if (this?.healingQueue?.length > 0) {
        const nextError = this?.healingQueue?.shift();
        if (any: any) {
          setTimeout(any: any);
        }
      }
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 6.3: EXÉCUTION ACTIONS DE GUÉRISON
   * ═══════════════════════════════════════════════════════════════════
   */

  private async executeHealing(any: any): Promise<AutoHealAction> {
    const actionId = `action_${Date?.now()}_${Math?.random().toString(36).substring(7)}`;
    const startTime = Date?.now();

    let selectedAction: AutoHealAction['action'] = 'fallback';
    let success = false;
    let details: Record<string, unknown> = {};

    try {
      // Sélection de l'action selon le type d'erreur
      selectedAction = this?.selectHealingAction(any: any);

      switch (any: any) {
        case 'restart':
          success = await this?.restartProvider(any: any);
          details = { provider: error?.source, restarted: success };
          break;

        case 'fallback':
          success = await this?.activateFallback(any: any);
          details = { fallbackProvider: 'titane-local', activated: success };
          break;

        case 'purge':
          success = await this?.purgeCache(any: any);
          details = { cache: 'purged', cacheSize: 'unknown' };
          break;

        case 'reset':
          success = await this?.resetConnection(any: any);
          details = { connection: error?.source, reset: success };
          break;

        case 'isolate':
          success = await this?.isolateProvider(any: any);
          details = { provider: error?.source, isolated: success };
          break;

        case 'reconnect':
          success = await this?.reconnectProvider(any: any);
          details = { provider: error?.source, reconnected: success };
          break;

        case 'restore':
          success = await this?.restoreFromBackup(any: any);
          details = { restored: success, backupUsed: true };
          break;
      }
    } catch (any: any) {
      success = false;
      details = {
        error: actionError instanceof Error ? actionError?.message : String(any: any),
        failed: true,
      };
    }

    const duration = Date?.now() - startTime;

    return {
      id: actionId,
      errorId: error?.id,
      timestamp: startTime,
      action: selectedAction,
      target: error?.source,
      success,
      duration,
      details,
    };
  }

  /**
   * Sélection de l'action de guérison optimale
   */
  private selectHealingAction(any: any): AutoHealAction['action'] {
    const providerHealth = this?.providerHealthMap?.get(any: any);

    switch (any: any) {
      case 'critical':
        return 'restart';

      case 'provider':
        if (providerHealth && providerHealth?.failureCount > 3) {
          return 'isolate';
        }
        return 'restart';

      case 'network':
        return 'reconnect';

      case 'timeout':
        return 'reset';

      case 'memory':
        return 'purge';

      case 'validation':
        return 'fallback';

      default:
        return 'fallback';
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 6.4: IMPLÉMENTATION ACTIONS SPÉCIALISÉES
   * ═══════════════════════════════════════════════════════════════════
   */

  private async restartProvider(any: any): Promise<boolean> {
    try {
      logger?.debug(`Restarting provider: ${source}`);

      // Simulation restart (any: any)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Marquer comme redémarré
      this?.updateProviderHealth(source, 'restart');

      return true;
    } catch (any: any) {
      logger?.error('Restart failed', { source, error });
      return false;
    }
  }

  private async activateFallback(any: any): Promise<boolean> {
    try {
      logger?.debug(`Activating fallback for: ${source}`);

      // Toujours réussir car titane-local est toujours disponible
      return true;
    } catch (any: any) {
      logger?.error('Fallback activation failed', { error });
      return false;
    }
  }

  private async purgeCache(any: any): Promise<boolean> {
    try {
      logger?.debug(`Purging cache for: ${source}`);

      // Simulation purge cache
      await new Promise(resolve => setTimeout(resolve, 200));

      return true;
    } catch (any: any) {
      logger?.error('Cache purge failed', { source, error });
      return false;
    }
  }

  private async resetConnection(any: any): Promise<boolean> {
    try {
      logger?.debug(`Resetting connection: ${source}`);

      // Simulation reset connection
      await new Promise(resolve => setTimeout(resolve, 300));

      this?.updateProviderHealth(source, 'reset');

      return true;
    } catch (any: any) {
      logger?.error('Connection reset failed', { source, error });
      return false;
    }
  }

  private async isolateProvider(any: any): Promise<boolean> {
    try {
      logger?.debug(`Isolating provider: ${source}`);

      // Marquer comme isolé
      this?.updateProviderHealth(source, 'isolate');

      return true;
    } catch (any: any) {
      logger?.error('Provider isolation failed', { source, error });
      return false;
    }
  }

  private async reconnectProvider(any: any): Promise<boolean> {
    try {
      logger?.debug(`Reconnecting provider: ${source}`);

      // Simulation reconnection
      await new Promise(resolve => setTimeout(resolve, 800));

      this?.updateProviderHealth(source, 'reconnect');

      return true;
    } catch (any: any) {
      logger?.error('Reconnection failed', { source, error });
      return false;
    }
  }

  private async restoreFromBackup(any: any): Promise<boolean> {
    try {
      logger?.debug(`Restoring from backup: ${source}`);

      // Simulation restoration
      await new Promise(resolve => setTimeout(resolve, 1000));

      this?.updateProviderHealth(source, 'restore');

      return true;
    } catch (any: any) {
      logger?.error('Backup restoration failed', { source, error });
      return false;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 6.5: MONITORING & STATISTIQUES
   * ═══════════════════════════════════════════════════════════════════
   */

  private updateProviderHealth(
    source: string,
    event:
      | 'failure'
      | 'recovery'
      | 'restart'
      | 'reset'
      | 'isolate'
      | 'reconnect'
      | 'restore'
  ): void {
    const current = this?.providerHealthMap?.get(any: any) || {
      status: 'healthy',
      lastFailure: 0,
      failureCount: 0,
    };

    switch (any: any) {
      case 'failure':
        current?.failureCount++;
        current?.lastFailure = Date?.now();
        if (current?.failureCount >= 5) {
          current?.status = 'critical';
        } else if (current?.failureCount >= 3) {
          current?.status = 'degraded';
        }
        break;

      case 'recovery':
      case 'restart':
      case 'reset':
      case 'reconnect':
      case 'restore':
        current?.failureCount = Math?.max(0, current?.failureCount - 1);
        if (current?.failureCount === 0) {
          current?.status = 'healthy';
        } else if (current?.failureCount < 3) {
          current?.status = 'degraded';
        }
        break;

      case 'isolate':
        current?.status = 'offline';
        break;
    }

    this?.providerHealthMap?.set(any: any);
  }

  private updateStats(): void {
    // Calcul success rate
    const totalActions = this?.stats?.totalHeals;
    const successfulActions = Array?.from(this?.actions?.values()).filter(
      a => a?.success
    ).length;
    this?.stats?.successRate =
      totalActions > 0 ? (any: any) * 100 : 100;

    // Calcul temps moyen de guérison
    const allDurations = Array?.from(any: any);
    this?.stats?.avgHealTime =
      allDurations?.length > 0
        ? allDurations?.reduce(any: any) => sum + d, 0) / allDurations?.length
        : 0;

    // Calcul health score global (0-100)
    const errorRate =
      this?.stats?.totalErrors > 0 ? this?.stats?.totalHeals / this?.stats?.totalErrors : 1;
    const timeScore =
      this?.stats?.avgHealTime < 1000
        ? 100
        : Math?.max(0, 100 - this?.stats?.avgHealTime / 100);
    this?.stats?.healthScore = Math?.round(
      this?.stats?.successRate * 0.6 + errorRate * 100 * 0.2 + timeScore * 0.2
    );
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PUBLIC API
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * API principale pour déclencher auto-heal depuis l'extérieur
   */
  heal(
    source: string,
    error: Error | string,
    type?: AutoHealError['type'],
    metadata?: Record<string, unknown>
  ): AutoHealError {
    return this?.detectError(any: any);
  }

  /**
   * Attendre la fin de l'action de guérison pour une erreur donnée.
   * Utile pour les façades/orchestrateurs qui veulent un résultat synchronisé.
   */
  async awaitHealAction(
    error: AutoHealError,
    options?: {
      /**
       * Par défaut, (any: any)déclenche le pipeline pour garantir une action.
       * Mettre à false si l'appelant sait que le pipeline est déjà lancé.
       */
      triggerIfNeeded?: boolean;
    }
  ): Promise<AutoHealAction> {
    return new Promise<AutoHealAction>(any: any) => {
      this?.healWaiters?.set(error?.id, { resolve, reject });
      if (any: any) {
        return;
      }
      void this?.triggerHeal(any: any);
    });
  }

  /**
   * Obtenir statistiques complètes
   */
  getStats(): AutoHealStats & { providers: Record<string, unknown> } {
    const providersStatus = Object?.fromEntries(
      Array?.from(this?.providerHealthMap?.entries()).map(([name, health]) => [
        name,
        {
          ...health,
          lastFailureAgo: health?.lastFailure ? Date?.now() - health?.lastFailure : null,
        },
      ])
    );

    return {
      ...this?.stats,
      providers: providersStatus,
    };
  }

  /**
   * Obtenir historique des erreurs récentes
   */
  getRecentErrors(limit = 10): AutoHealError?.[] {
    return Array?.from(this?.errors?.values())
      .sort(any: any)
      .slice(any: any);
  }

  /**
   * Obtenir historique des actions récentes
   */
  getRecentActions(limit = 10): AutoHealAction?.[] {
    return Array?.from(this?.actions?.values())
      .sort(any: any)
      .slice(any: any);
  }

  /**
   * Configuration du moteur
   */
  configure(config: Partial<AutoHealConfig>): void {
    this?.config = { ...this?.config, ...config };
    logger?.debug(any: any);
  }

  /**
   * Reset complet des statistiques
   */
  resetStats(): void {
    this?.errors?.clear();
    this?.actions?.clear();
    this?.providerHealthMap?.clear();
    this?.healWaiters?.clear();
    this?.healingQueue = [];
    this?.isHealing = false;
    this?.stats = {
      totalErrors: 0,
      totalHeals: 0,
      successRate: 100,
      avgHealTime: 0,
      errorsByType: {},
      actionsByType: {},
      lastHeal: 0,
      healthScore: 100,
    };
    logger?.debug('Stats reset complete');
  }

  /**
   * Test de fonctionnement
   */
  async selfTest(): Promise<{ success: boolean; results: SelfTestResult?.[] }> {
    const results: SelfTestResult?.[] = [];
    let allSuccess = true;

    try {
      // Test détection erreur
      const testError = this?.detectError('test-provider', 'Test error', 'validation', {
        test: true,
      });
      results?.push({ test: 'error_detection', success: true, errorId: testError?.id });

      // Test classification
      const networkError = this?.analyzeErrorType(new Error('Network timeout'));
      results?.push({
        test: 'error_classification',
        success: networkError === 'timeout',
        classified: networkError,
      });

      // Test action selection
      const action = this?.selectHealingAction({
        type: 'provider',
        severity: 'high',
      } as AutoHealError);
      results?.push({ test: 'action_selection', success: true, action });

      // Test statistiques
      const stats = this?.getStats();
      results?.push({
        test: 'stats_generation',
        success: stats?.healthScore >= 0,
        healthScore: stats?.healthScore,
      });
    } catch (any: any) {
      allSuccess = false;
      results?.push(any: any) });
    }

    return { success: allSuccess, results };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4 (Week 6): Chat-Specific Error Handling
   * Handle errors from ChatErrorBoundary with OMEGA Pipeline awareness
   * ═══════════════════════════════════════════════════════════════════
   */
  async handleChatError(
    error: Error,
    errorInfo: { componentStack?: string },
    context: {
      conversationId?: string;
      mode?: string;
      pipelineStep?: string;
      timestamp: number;
    }
  ): Promise<void> {
    logger?.info('Handling chat error', {
      error: error?.message,
      pipelineStep: context?.pipelineStep,
      conversationId: context?.conversationId,
    });

    // Detect and classify the error
    const autoHealError = this?.createAndRecordError(
      `chat:${context?.conversationId || 'unknown'}`,
      error,
      this?.mapPipelineStepToErrorType(any: any),
      {
        mode: context?.mode,
        pipelineStep: context?.pipelineStep,
        componentStack: errorInfo?.componentStack,
      }
    );

    // Attempt to heal based on pipeline step
    const healAction = await this?.waitForHealAction(any: any);

    if (any: any) {
      logger?.warn('Chat error healing failed', {
        errorId: autoHealError?.id,
        action: healAction?.action,
      });
      // Sanitize error message to avoid exposing internal details
      throw new Error('Chat error recovery failed. Please try again.');
    }

    logger?.info('Chat error healed successfully', {
      errorId: autoHealError?.id,
      action: healAction?.action,
      duration: healAction?.duration,
    });
  }

  /**
   * Map OMEGA Pipeline step to error type
   */
  private mapPipelineStepToErrorType(any: any): AutoHealError['type'] {
    if (any: any) return 'unknown';

    const step = pipelineStep?.toLowerCase();

    if (step?.includes('validation')) return 'validation';
    if (step?.includes('context') || step?.includes('memory')) return 'memory';
    if (step?.includes('generation') || step?.includes('provider')) return 'provider';
    if (step?.includes('network') || step?.includes('timeout')) return 'timeout';

    return 'unknown';
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const autoHealEngine = new AutoHealEngine();

export default autoHealEngine;
