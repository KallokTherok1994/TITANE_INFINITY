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
  events: HealEvent[];
  actions: HealAction[];
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
    logger.debug('Scan terminé:', report);
    return report;
  } catch (error) {
    logger.error('Erreur scan:', error);
    throw error;
  }
}

/**
 * Répare un module spécifique ou tous les modules
 * @param module - Nom du module à réparer (optionnel)
 */
export async function repairSystem(module?: string): Promise<string[]> {
  try {
    const results = await secureInvoke<string[]>('auto_heal_repair', { module });
    logger.debug('Réparation terminée:', results);
    return results;
  } catch (error) {
    logger.error('Erreur réparation:', error);
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
  } catch (error) {
    logger.error('Erreur récupération logs:', error);
    throw error;
  }
}

// ============================================================================
// REACT ERROR BOUNDARY
// ============================================================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
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
    if (!AutoHealErrorHandler.instance) {
      AutoHealErrorHandler.instance = new AutoHealErrorHandler();
    }
    return AutoHealErrorHandler.instance;
  }

  /**
   * Gère une erreur React et tente de la réparer
   */
  async handleError(error: Error, errorInfo: React.ErrorInfo): Promise<void> {
    logger.error('Erreur React détectée:', error, errorInfo);

    if (this.healingInProgress) {
      logger.warn('Réparation déjà en cours, ignoré');
      return;
    }

    this.healingInProgress = true;

    try {
      // Identifier le module concerné par l'erreur
      const module = this.identifyModule(error, errorInfo);

      // Scanner le système
      const report = await scanSystem();
      logger.debug('Rapport scan:', report);

      // Réparer le module identifié
      if (module) {
        await repairSystem(module);
      } else {
        await repairSystem(); // Réparation complète
      }

      // Attendre un peu avant de recharger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recharger l'application
      window.location.reload();
    } catch (error) {
      logger.error('Échec auto-réparation:', error);
    } finally {
      this.healingInProgress = false;
    }
  }

  /**
   * Identifie le module concerné par une erreur
   */
  private identifyModule(error: Error, errorInfo: React.ErrorInfo): string | undefined {
    const stack = errorInfo.componentStack || error.stack || '';

    if (stack.includes('Chat')) return 'chat_ia';
    if (stack.includes('Router') || stack.includes('Route')) return 'router';
    if (stack.includes('Menu') || stack.includes('Navigation')) return 'router';

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
    if (this.intervalId) {
      logger.warn('Monitor déjà démarré');
      return;
    }

    logger.debug('Démarrage monitoring...');

    this.intervalId = window.setInterval(async () => {
      try {
        const report = await scanSystem();

        // Vérifier si des erreurs critiques sont détectées
        const criticalErrors = report.events.filter(
          e => e.severity === 'critical' || e.severity === 'error'
        );

        if (criticalErrors.length > 0) {
          logger.warn('Erreurs critiques détectées:', criticalErrors);
          // Auto-réparation
          await repairSystem();
        }
      } catch (error) {
        logger.error('Erreur monitoring:', error);
      }
    }, this.checkInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.debug('Monitoring arrêté');
    }
  }

  setCheckInterval(ms: number): void {
    this.checkInterval = ms;
    if (this.intervalId) {
      this.stop();
      this.start();
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
  errorHandler: AutoHealErrorHandler.getInstance(),
  monitor: new AutoHealMonitor(),
};

export default autoHealClient;
