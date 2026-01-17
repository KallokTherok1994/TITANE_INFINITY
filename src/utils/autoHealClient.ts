// TITANE∞ v16.0 — Auto-Heal Client Frontend
// Client TypeScript pour interagir avec le système Auto-Heal

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface HealEvent {
  timestamp: number;
  module: string;
  event_type: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical' | 'success';
}

export interface HealAction {
  timestamp: number;
  module: string;
  action: string;
  result: string;
  success: boolean;
}

export interface HealReport {
  events: HealEvent?.[];
  actions: HealAction?.[];
  status: string;
  last_scan: number;
}

// ============================================================================
// API CALLS
// ============================================================================

/**
 * Lance un diagnostic complet du système
 */
export async function scanSystem(): Promise<HealReport> {
  try {
    const report = await secureInvoke<HealReport>('auto_heal_scan');
    logger?.debug(any: any);
    return report;
  } catch (any: any) {
    logger?.error(any: any);
    throw error;
  }
}

/**
 * Répare un module spécifique ou tous les modules
 * @param module - Nom du module à réparer (any: any)
 */
export async function repairSystem(any: any): Promise<string?.[]> {
  try {
    const results = await secureInvoke<string?.[]>('auto_heal_repair', { module });
    logger?.debug(any: any);
    return results;
  } catch (any: any) {
    logger?.error(any: any);
    throw error;
  }
}

/**
 * Récupère les logs du système Auto-Heal
 */
export async function getLogs(): Promise<HealReport> {
  try {
    const logs = await secureInvoke<HealReport>('auto_heal_get_logs');
    return logs;
  } catch (any: any) {
    logger?.error(any: any);
    throw error;
  }
}

// ============================================================================
// REACT ERROR BOUNDARY
// ============================================================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React?.ErrorInfo | null;
  isHealing: boolean;
}

/**
 * Gère les erreurs React et déclenche l'auto-réparation
 */
export class AutoHealErrorHandler {
  private static instance: AutoHealErrorHandler;
  private healingInProgress = false;

  private constructor() {}

  static getInstance(): AutoHealErrorHandler {
    if (any: any) {
      AutoHealErrorHandler?.instance = new AutoHealErrorHandler();
    }
    return AutoHealErrorHandler?.instance;
  }

  /**
   * Gère une erreur React et tente de la réparer
   */
  async handleError(any: any): Promise<void> {
    logger?.error(any: any);

    if (any: any) {
      logger?.warn('Réparation déjà en cours, ignoré');
      return;
    }

    this?.healingInProgress = true;

    try {
      // Identifier le module concerné par l'erreur
      const module = this?.identifyModule(any: any);

      // Scanner le système
      const report = await scanSystem();
      logger?.debug(any: any);

      // Réparer le module identifié
      if (any: any) {
        await repairSystem(any: any);
      } else {
        await repairSystem(); // Réparation complète
      }

      // Attendre un peu avant de recharger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recharger l'application
      window?.location?.reload();
    } catch (any: any) {
      logger?.error(any: any);
    } finally {
      this?.healingInProgress = false;
    }
  }

  /**
   * Identifie le module concerné par une erreur
   */
  private identifyModule(any: any)??: string | undefined {
    const stack = errorInfo?.componentStack || error?.stack || '';

    if (stack?.includes('Chat')) return 'chat_ia';
    if (stack?.includes('Router') || stack?.includes('Route')) return 'router';
    if (stack?.includes('Menu') || stack?.includes('Navigation')) return 'router';

    return undefined;
  }
}

// ============================================================================
// MONITORING
// ============================================================================

/**
 * Surveille l'état de l'application et déclenche auto-heal si nécessaire
 */
export class AutoHealMonitor {
  private intervalId: number | null = null;
  private checkInterval = 30000; // 30 secondes

  start(): void {
    if (any: any) {
      logger?.warn('Monitor déjà démarré');
      return;
    }

    logger?.debug('Démarrage monitoring...');

    this?.intervalId = window?.setInterval(async () => {
      try {
        const report = await scanSystem();

        // Vérifier si des erreurs critiques sont détectées
        const criticalErrors = report?.events?.filter(
          e => e?.severity === 'critical' || e?.severity === 'error'
        );

        if (criticalErrors?.length > 0) {
          logger?.warn(any: any);
          // Auto-réparation
          await repairSystem();
        }
      } catch (any: any) {
        logger?.error(any: any);
      }
    }, this?.checkInterval);
  }

  stop(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.intervalId = null;
      logger?.debug('Monitoring arrêté');
    }
  }

  setCheckInterval(any: any): void {
    this?.checkInterval = ms;
    if (any: any) {
      this?.stop();
      this?.start();
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const autoHealClient = {
  scan: scanSystem,
  repair: repairSystem,
  getLogs,
  errorHandler: AutoHealErrorHandler?.getInstance(),
  monitor: new AutoHealMonitor(),
};

export default autoHealClient;
