/**
 * TITANE∞ v19 - Error Boundary Component
 *
 * Capture et gestion des erreurs React non catchées.
 * Empêche la propagation des erreurs et affiche UI de secours.
 *
 * @license Proprietary - TITANE Team 2025
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Composant de capture d'erreurs React
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary context="ChatWindow">
 *   <ChatWindow />
 * </ErrorBoundary>
 * ```
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
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { context = 'Unknown', onError } = this.props;

    // Log structuré avec contexte
    console.error(`[ErrorBoundary:${context}] Error caught:`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      context,
    });

    // Callback personnalisé
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (callbackError) {
        console.error('[ErrorBoundary] onError callback failed:', callbackError);
      }
    }

    // TODO v19.1: Envoyer au watchdog backend
    // sendUIErrorReport(context, error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, context = 'Component' } = this.props;

    if (hasError) {
      // Fallback personnalisé
      if (fallback) {
        return fallback;
      }

      // Fallback par défaut
      return (
        <div
          style={{
            padding: '2rem',
            margin: '1rem',
            border: '2px solid #ef4444',
            borderRadius: '0.5rem',
            backgroundColor: '#1f1f1f',
            color: '#ef4444',
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
            ⚠️ Erreur dans {context}
          </h2>
          <p style={{ margin: '0 0 1rem 0', color: '#9ca3af' }}>
            Une erreur inattendue s'est produite. Le composant a été isolé pour protéger
            l'application.
          </p>
          {error && (
            <details style={{ marginBottom: '1rem' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  color: '#60a5fa',
                  marginBottom: '0.5rem',
                }}
              >
                Détails techniques
              </summary>
              <pre
                style={{
                  fontSize: '0.75rem',
                  padding: '1rem',
                  backgroundColor: '#000',
                  borderRadius: '0.25rem',
                  overflow: 'auto',
                  maxHeight: '300px',
                }}
              >
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook pour utilisation fonctionnelle de ErrorBoundary
 */
export function useErrorBoundary(): {
  showBoundary: (error: Error) => void;
} {
  const [, setError] = React.useState<Error | null>(null);

  const showBoundary = React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);

  return { showBoundary };
}

export default ErrorBoundary;
