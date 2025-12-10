/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 8: Error Boundary
 * Composant pour capturer et gérer les erreurs React
 * ═══════════════════════════════════════════════════════════════
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from '../icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Composant pour capturer les erreurs React
 *
 * Usage:
 * <ErrorBoundary>
 *   <Dashboard />
 * </ErrorBoundary>
 *
 * Avec callback custom:
 * <ErrorBoundary onError={(error, info) => logToSentry(error, info)}>
 *   <Dashboard />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Mettre à jour l'état pour afficher le fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Logger l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Callback custom si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log structured pour monitoring
    this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset si resetKeys changent
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );
      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo): void {
    // Structured logging
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log en console pour dev
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // En production, envoyer à service monitoring (ex: Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Hook pour intégration Sentry/LogRocket
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }

      // Ou log dans localStorage pour debug
      try {
        const logs = JSON.parse(localStorage.getItem('error-logs') || '[]');
        logs.push(errorLog);
        // Garder max 50 erreurs
        if (logs.length > 50) {
          logs.shift();
        }
        localStorage.setItem('error-logs', JSON.stringify(logs));
      } catch (e) {
        console.error('Failed to log error:', e);
      }
    }
  }

  private reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Si fallback custom fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback UI par défaut
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border-2 border-red-200 p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Une erreur est survenue
                </h1>
                <p className="text-gray-600 mt-1">
                  Nous sommes désolés, quelque chose s'est mal passé.
                </p>
              </div>
            </div>

            {/* Error Details (dev only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">
                    Détails de l'erreur (mode développement)
                  </h3>
                  <div className="text-xs text-red-800 font-mono mb-2">
                    {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-red-700 hover:text-red-900">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-red-700 hover:text-red-900">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.reset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Réessayer
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Recharger la page
              </button>
              <button
                onClick={this.handleHome}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                <Home className="w-5 h-5" />
                Retour accueil
              </button>
            </div>

            {/* Help */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Que faire maintenant ?
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Essayez de recharger la page</li>
                <li>• Vérifiez votre connexion internet</li>
                <li>• Si le problème persiste, contactez le support</li>
                {process.env.NODE_ENV === 'development' && (
                  <li>• Consultez la console navigateur pour plus de détails</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Type pour window.Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: unknown) => void;
    };
  }
}

/**
 * Hook pour obtenir les logs d'erreurs stockés
 */
export function useErrorLogs() {
  try {
    const logs = JSON.parse(localStorage.getItem('error-logs') || '[]');
    return logs;
  } catch {
    return [];
  }
}

/**
 * Fonction pour nettoyer les logs d'erreurs
 */
export function clearErrorLogs() {
  localStorage.removeItem('error-logs');
}
