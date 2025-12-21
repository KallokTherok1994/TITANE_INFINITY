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
    this.name = 'NotFoundError';
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
    this.name = 'NetworkError';
  }
}

export class UnauthorizedError extends Error {
  constructor(public readonly action: string) {
    super(`Unauthorized: ${action}`);
    this.name = 'UnauthorizedError';
  }
}

export class BackendError extends Error {
  constructor(
    public readonly command: string,
    public readonly details: string
  ) {
    super(`Backend error in "${command}": ${details}`);
    this.name = 'BackendError';
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

export function classifyError(error: unknown, context?: ErrorContext): ClassifiedError {
  // TimeoutError - ✨ v26.2.1: Enhanced messaging for cloud agent timeouts
  if (error instanceof TimeoutError) {
    const provider = String(context?.metadata?.provider ?? '').toLowerCase();
    const isCloudAgent = ['openai', 'claude', 'gemini', 'anthropic'].includes(provider);
    
    return {
      type: 'TimeoutError',
      severity: ErrorSeverity.WARNING,
      message: isCloudAgent 
        ? `Délai d'attente dépassé pour l'agent cloud (${error.timeoutMs}ms)`
        : `Opération expirée (${error.timeoutMs}ms)`,
      details: error.command,
      recovery: isCloudAgent
        ? "L'agent cloud peut encore traiter votre requête. Attendez quelques instants ou réessayez avec une requête plus simple."
        : 'Essayez de nouveau ou vérifiez la connexion',
      context,
    };
  }

  // RetryError
  if (error instanceof RetryError) {
    return {
      type: 'RetryError',
      severity: ErrorSeverity.ERROR,
      message: `Échec après ${error.attempts} tentatives`,
      details: error.command,
      recovery: 'Vérifiez la connexion backend ou réessayez plus tard',
      context,
    };
  }

  // ValidationError
  if (error instanceof ValidationError) {
    return {
      type: 'ValidationError',
      severity: ErrorSeverity.WARNING,
      message: 'Données invalides',
      details: error.validationErrors.join(', '),
      recovery: 'Vérifiez le format des données',
      context,
    };
  }

  // NotFoundError
  if (error instanceof NotFoundError) {
    return {
      type: 'NotFoundError',
      severity: ErrorSeverity.WARNING,
      message: `Ressource introuvable: ${error.resource}`,
      details: error.id,
      recovery: 'Vérifiez que la ressource existe',
      context,
    };
  }

  // NetworkError
  if (error instanceof NetworkError) {
    return {
      type: 'NetworkError',
      severity: ErrorSeverity.ERROR,
      message: 'Erreur réseau',
      details: error.statusCode ? `Status ${error.statusCode}` : undefined,
      recovery: 'Vérifiez votre connexion internet',
      context,
    };
  }

  // UnauthorizedError
  if (error instanceof UnauthorizedError) {
    return {
      type: 'UnauthorizedError',
      severity: ErrorSeverity.WARNING,
      message: 'Action non autorisée',
      details: error.action,
      recovery: 'Vérifiez vos permissions',
      context,
    };
  }

  // BackendError
  if (error instanceof BackendError) {
    return {
      type: 'BackendError',
      severity: ErrorSeverity.ERROR,
      message: 'Erreur backend',
      details: error.details,
      recovery: 'Contactez le support si le problème persiste',
      context,
    };
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      type: 'Error',
      severity: ErrorSeverity.ERROR,
      message: error.message,
      details: error.name,
      recovery: undefined,
      context,
    };
  }

  // Unknown
  return {
    type: 'UnknownError',
    severity: ErrorSeverity.ERROR,
    message: 'Erreur inconnue',
    details: String(error),
    recovery: undefined,
    context,
  };
}

// ────────────────────────────────────────────────────────────────
// Error Handler Class
// ────────────────────────────────────────────────────────────────

export class ErrorHandler {
  private static errorLog: ClassifiedError[] = [];
  private static MAX_LOG_SIZE = 100;

  /**
   * Gérer une erreur (log + toast notification)
   */
  static handle(error: unknown, context?: ErrorContext): never {
    const classified = classifyError(error, context);

    // Log erreur
    this.logError(classified);

    // Afficher toast selon sévérité
    this.showToast(classified);

    // Log console en développement
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', classified);
    }

    // Rethrow pour permettre gestion custom si nécessaire
    throw error;
  }

  /**
   * Gérer erreur sans throw (silencieux)
   */
  static handleSilent(error: unknown, context?: ErrorContext): void {
    const classified = classifyError(error, context);

    this.logError(classified);
    this.showToast(classified);

    if (import.meta.env.DEV) {
      console.error('[ErrorHandler Silent]', classified);
    }
  }

  /**
   * Afficher toast notification selon erreur
   */
  private static showToast(classified: ClassifiedError): void {
    const { addToast } = useUIStore.getState();

    // Mapper sévérité → type toast
    const toastType =
      classified.severity === ErrorSeverity.CRITICAL
        ? 'error'
        : classified.severity === ErrorSeverity.ERROR
          ? 'error'
          : classified.severity === ErrorSeverity.WARNING
            ? 'warning'
            : 'info';

    // Message enrichi avec recovery si disponible
    const message = classified.recovery
      ? `${classified.message}. ${classified.recovery}`
      : classified.message;

    addToast({
      type: toastType,
      message,
      duration: toastType === 'error' ? 5000 : 3000,
    });
  }

  /**
   * Logger erreur dans historique
   */
  private static logError(classified: ClassifiedError): void {
    this.errorLog.push(classified);

    // Limiter taille log
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-this.MAX_LOG_SIZE);
    }

    // ✨ Envoyer à Sentry si erreur sévère
    if (
      classified.severity === ErrorSeverity.ERROR ||
      classified.severity === ErrorSeverity.CRITICAL
    ) {
      try {
        // Reconstruire l'erreur originale si possible
        const originalError = new Error(classified.message);
        originalError.name = classified.type;

        captureClassifiedError(classified, originalError);
      } catch (sentryError) {
        // Ne pas bloquer si Sentry fail
        console.warn('[ErrorHandler] Failed to send to Sentry:', sentryError);
      }
    }
  }

  /**
   * Récupérer historique erreurs
   */
  static getErrorLog(): ClassifiedError[] {
    return [...this.errorLog];
  }

  /**
   * Effacer historique
   */
  static clearLog(): void {
    this.errorLog = [];
  }

  /**
   * Filtrer erreurs par type
   */
  static getErrorsByType(type: string): ClassifiedError[] {
    return this.errorLog.filter(err => err.type === type);
  }

  /**
   * Filtrer erreurs par sévérité
   */
  static getErrorsBySeverity(severity: ErrorSeverity): ClassifiedError[] {
    return this.errorLog.filter(err => err.severity === severity);
  }

  /**
   * Statistiques erreurs
   */
  static getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: ClassifiedError[];
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const error of this.errorLog) {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    }

    return {
      total: this.errorLog.length,
      byType,
      bySeverity,
      recentErrors: this.errorLog.slice(-10).reverse(), // 10 dernières
    };
  }

  /**
   * Export erreurs (pour debugging/support)
   */
  static exportErrors(format: 'json' | 'text' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.errorLog, null, 2);
    }

    return this.errorLog
      .map(
        (err, i) =>
          `${i + 1}. [${err.severity.toUpperCase()}] ${err.type}: ${err.message}\n` +
          (err.details ? `   Details: ${err.details}\n` : '') +
          (err.recovery ? `   Recovery: ${err.recovery}\n` : '') +
          (err.context?.command ? `   Command: ${err.context.command}\n` : '')
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
  } catch (error) {
    ErrorHandler.handleSilent(error, context);
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
  } catch (error) {
    ErrorHandler.handleSilent(error, context);
    return fallback;
  }
}

/**
 * Vérifier si erreur est retriable
 */
export function isRetriableError(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (error instanceof NetworkError) return true;
  if (error instanceof BackendError) return true;

  if (error instanceof Error) {
    const retriablePatterns = [
      'network',
      'timeout',
      'connection',
      'unavailable',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ];

    return retriablePatterns.some(pattern =>
      error.message.toLowerCase().includes(pattern)
    );
  }

  return false;
}
