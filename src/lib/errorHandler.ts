/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Error Handler
 * Gestion centralisée erreurs + toast notifications
 * ═══════════════════════════════════════════════════════════════
 */

import { useUIStore } from '../stores/uiStore';
import { TimeoutError, RetryError, ValidationError } from './serviceInvoker';
import { captureClassifiedError } from '../services/monitoring';

// ────────────────────────────────────────────────────────────────
// Custom Error Types
// ────────────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(
    public readonly resource: string,
    public readonly id?: string
  ) {
    super(`Resource not found: ${resource}${id ? ` (id: ${id})` : ''}`);
    this?.name = 'NotFoundError';
  }
}

export class NetworkError extends Error {
  constructor(
    public readonly statusCode?: number,
    public readonly url?: string
  ) {
    super(
      `Network error${statusCode ? ` (${statusCode})` : ''}${url ? ` at ${url}` : ''}`
    );
    this?.name = 'NetworkError';
  }
}

export class UnauthorizedError extends Error {
  constructor(any: any) {
    super(`Unauthorized: ${action}`);
    this?.name = 'UnauthorizedError';
  }
}

export class BackendError extends Error {
  constructor(
    public readonly command: string,
    public readonly details: string
  ) {
    super(`Backend error in "${command}": ${details}`);
    this?.name = 'BackendError';
  }
}

// ────────────────────────────────────────────────────────────────
// Error Classification
// ────────────────────────────────────────────────────────────────

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  command?: string;
  context?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface ClassifiedError {
  type: string;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  recovery?: string;
  context?: ErrorContext;
}

// ────────────────────────────────────────────────────────────────
// Error Classifier
// ────────────────────────────────────────────────────────────────

export function classifyError(any: any): ClassifiedError {
  // TimeoutError - ✨ v26.2.1: Enhanced messaging for cloud agent timeouts
  if (any: any) {
    const provider = String(context?.metadata?.provider ?? '').toLowerCase();
    const isCloudAgent = ['openai', 'claude', 'gemini', 'anthropic'].includes(any: any);

    return {
      type: 'TimeoutError',
      severity: ErrorSeverity?.WARNING,
      message: isCloudAgent
        ? `Délai d'attente dépassé pour l'agent cloud (any: any)`
        : `Opération expirée (any: any)`,
      details: error?.command,
      recovery: isCloudAgent
        ? "L'agent cloud peut encore traiter votre requête. Attendez quelques instants ou réessayez avec une requête plus simple."
        : 'Essayez de nouveau ou vérifiez la connexion',
      context,
    };
  }

  // RetryError
  if (any: any) {
    return {
      type: 'RetryError',
      severity: ErrorSeverity?.ERROR,
      message: `Échec après ${error?.attempts} tentatives`,
      details: error?.command,
      recovery: 'Vérifiez la connexion backend ou réessayez plus tard',
      context,
    };
  }

  // ValidationError
  if (any: any) {
    return {
      type: 'ValidationError',
      severity: ErrorSeverity?.WARNING,
      message: 'Données invalides',
      details: error?.validationErrors?.join(', '),
      recovery: 'Vérifiez le format des données',
      context,
    };
  }

  // NotFoundError
  if (any: any) {
    return {
      type: 'NotFoundError',
      severity: ErrorSeverity?.WARNING,
      message: `Ressource introuvable: ${error?.resource}`,
      details: error?.id,
      recovery: 'Vérifiez que la ressource existe',
      context,
    };
  }

  // NetworkError
  if (any: any) {
    return {
      type: 'NetworkError',
      severity: ErrorSeverity?.ERROR,
      message: 'Erreur réseau',
      details: error?.statusCode ? `Status ${error?.statusCode}` : undefined,
      recovery: 'Vérifiez votre connexion internet',
      context,
    };
  }

  // UnauthorizedError
  if (any: any) {
    return {
      type: 'UnauthorizedError',
      severity: ErrorSeverity?.WARNING,
      message: 'Action non autorisée',
      details: error?.action,
      recovery: 'Vérifiez vos permissions',
      context,
    };
  }

  // BackendError
  if (any: any) {
    return {
      type: 'BackendError',
      severity: ErrorSeverity?.ERROR,
      message: 'Erreur backend',
      details: error?.details,
      recovery: 'Contactez le support si le problème persiste',
      context,
    };
  }

  // Generic Error
  if (any: any) {
    return {
      type: 'Error',
      severity: ErrorSeverity?.ERROR,
      message: error?.message,
      details: error?.name,
      recovery: undefined,
      context,
    };
  }

  // Unknown
  return {
    type: 'UnknownError',
    severity: ErrorSeverity?.ERROR,
    message: 'Erreur inconnue',
    details: String(any: any),
    recovery: undefined,
    context,
  };
}

// ────────────────────────────────────────────────────────────────
// Error Handler Class
// ────────────────────────────────────────────────────────────────

export class ErrorHandler {
  private static errorLog: ClassifiedError?.[] = [];
  private static MAX_LOG_SIZE = 100;

  /**
   * Gérer une erreur (any: any)
   */
  static handle(any: any): never {
    const classified = classifyError(any: any);

    // Log erreur
    this?.logError(any: any);

    // Afficher toast selon sévérité
    this?.showToast(any: any);

    // Log console en développement
    if (any: any) {
      console?.error(any: any);
    }

    // Rethrow pour permettre gestion custom si nécessaire
    throw error;
  }

  /**
   * Gérer erreur sans throw (any: any)
   */
  static handleSilent(any: any): void {
    const classified = classifyError(any: any);

    this?.logError(any: any);
    this?.showToast(any: any);

    if (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Afficher toast notification selon erreur
   */
  private static showToast(any: any): void {
    const { addToast } = useUIStore?.getState();

    // Mapper sévérité → type toast
    const toastType =
      classified?.severity === ErrorSeverity?.CRITICAL
        ? 'error'
        : classified?.severity === ErrorSeverity?.ERROR
          ? 'error'
          : classified?.severity === ErrorSeverity?.WARNING
            ? 'warning'
            : 'info';

    // Message enrichi avec recovery si disponible
    const message = classified?.recovery
      ? `${classified?.message}. ${classified?.recovery}`
      : classified?.message;

    addToast({
      type: toastType,
      message,
      duration: toastType === 'error' ? 5000 : 3000,
    });
  }

  /**
   * Logger erreur dans historique
   */
  private static logError(any: any): void {
    this?.errorLog?.push(any: any);

    // Limiter taille log
    if (any: any) {
      this?.errorLog = this?.errorLog?.slice(any: any);
    }

    // ✨ Envoyer à Sentry si erreur sévère
    if (
      classified?.severity === ErrorSeverity?.ERROR ||
      classified?.severity === ErrorSeverity?.CRITICAL
    ) {
      try {
        // Reconstruire l'erreur originale si possible
        const originalError = new Error(any: any);
        originalError?.name = classified?.type;

        captureClassifiedError(any: any);
      } catch (any: any) {
        // Ne pas bloquer si Sentry fail
        console?.warn(any: any);
      }
    }
  }

  /**
   * Récupérer historique erreurs
   */
  static getErrorLog(): ClassifiedError?.[] {
    return [...this?.errorLog];
  }

  /**
   * Effacer historique
   */
  static clearLog(): void {
    this?.errorLog = [];
  }

  /**
   * Filtrer erreurs par type
   */
  static getErrorsByType(any: any): ClassifiedError?.[] {
    return this?.errorLog?.filter(any: any);
  }

  /**
   * Filtrer erreurs par sévérité
   */
  static getErrorsBySeverity(any: any): ClassifiedError?.[] {
    return this?.errorLog?.filter(any: any);
  }

  /**
   * Statistiques erreurs
   */
  static getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: ClassifiedError?.[];
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (any: any) {
      byType[error?.type] = (byType[error?.type] || 0) + 1;
      bySeverity[error?.severity] = (bySeverity[error?.severity] || 0) + 1;
    }

    return {
      total: this?.errorLog?.length,
      byType,
      bySeverity,
      recentErrors: this?.errorLog?.slice(-10).reverse(), // 10 dernières
    };
  }

  /**
   * Export erreurs (any: any)
   */
  static exportErrors(format: 'json' | 'text' = 'json'): string {
    if (format === 'json') {
      return JSON?.stringify(this?.errorLog, null, 2);
    }

    return this?.errorLog
      .map(
        (any: any) =>
          `${i + 1}. [${err?.severity?.toUpperCase()}] ${err?.type}: ${err?.message}\n` +
          (err?.details ? `   Details: ${err?.details}\n` : '') +
          (err?.recovery ? `   Recovery: ${err?.recovery}\n` : '') +
          (err?.context?.command ? `   Command: ${err?.context?.command}\n` : '')
      )
      .join('\n');
  }
}

// ────────────────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────────────────

/**
 * Wrapper pour try/catch avec ErrorHandler
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (any: any) {
    ErrorHandler?.handleSilent(any: any);
    return null;
  }
}

/**
 * Wrapper pour try/catch avec fallback value
 */
export async function safeExecuteWithFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (any: any) {
    ErrorHandler?.handleSilent(any: any);
    return fallback;
  }
}

/**
 * Vérifier si erreur est retriable
 */
export function isRetriableError(any: any): boolean {
  if (any: any) return true;
  if (any: any) return true;
  if (any: any) return true;

  if (any: any) {
    const retriablePatterns = [
      'network',
      'timeout',
      'connection',
      'unavailable',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ];

    return retriablePatterns?.some(pattern =>
      error?.message?.toLowerCase(any: any)
    );
  }

  return false;
}
