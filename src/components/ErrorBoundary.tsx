/**
 * TITANE∞ v30.0.0 — Error Boundary Component
 *
 * Capture et gestion des erreurs React non catchées.
 * Empêche la propagation des erreurs et affiche UI de secours.
 * v22Ω AI Performance Optimizations Compatible
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
  errorInfo: ErrorInfo | null;
}

interface NormalizedErrorDisplay {
  message: string;
  stack: string;
}

const safeStringify = (value: unknown): string => {
  try {
    const out = JSON.stringify(value, null, 2);
    return out ?? String(value);
  } catch {
    return String(value);
  }
};

const normalizeErrorDisplay = (value: unknown): NormalizedErrorDisplay => {
  if (value instanceof Error) {
    return {
      message:
        typeof value.message === 'string' ? value.message : safeStringify(value.message),
      stack: typeof value.stack === 'string' ? value.stack : '',
    };
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const message =
      typeof record.message === 'string'
        ? record.message
        : typeof record.msg === 'string'
          ? record.msg
          : safeStringify(value);
    const stack =
      typeof record.stack === 'string'
        ? record.stack
        : record.err && typeof record.err === 'object'
          ? safeStringify(record.err)
          : '';
    return { message, stack };
  }

  return {
    message: typeof value === 'string' ? value : safeStringify(value),
    stack: '',
  };
};

const toError = (value: unknown): Error => {
  if (value instanceof Error) {
    return value;
  }
  const normalized = normalizeErrorDisplay(value);
  return new Error(normalized.message || 'Unknown error');
};

/**
 * ErrorBoundary - Composant de capture d&apos;erreurs React
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

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { context = 'Unknown', onError } = this.props;
    const normalizedError = toError(error);

    // Log structuré avec contexte
    logger.error(
      'Error caught in component tree',
      {
        component: 'ErrorBoundary',
        context,
        action: 'componentDidCatch',
      },
      normalizedError
    );

    // Callback personnalisé
    if (onError) {
      try {
        onError(normalizedError, errorInfo);
      } catch (callbackError) {
        logger.error(
          'onError callback failed',
          { component: 'ErrorBoundary', context },
          callbackError as Error
        );
      }
    }

    // IMPLEMENTATION v19.1+: Send UI errors to watchdog backend
    // 1. Create sendUIErrorReport(context, error, errorInfo): Format error data
    // 2. Include: error.message, error.stack, componentStack from errorInfo
    // 3. Add UI context: current route, user actions (last 10), session ID
    // 4. Tauri command: invoke('watchdog:report_ui_error', { errorReport })
    // 5. Fallback: Store locally if backend unavailable, sync later
    // 6. Privacy: Strip sensitive data (user input, tokens) before sending
    // sendUIErrorReport(context, error, errorInfo);

    this.setState({
      error: normalizedError,
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
    const normalized = normalizeErrorDisplay(error);

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
            border: '2px solid #8f7a7a',
            borderRadius: '0.5rem',
            backgroundColor: '#1f1f1f',
            color: '#8f7a7a',
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
            ⚠️ Erreur dans {context}
          </h2>
          <p style={{ margin: '0 0 1rem 0', color: '#9ca3af' }}>
            Une erreur inattendue s&apos;est produite. Le composant a été isolé pour
            protéger l&apos;application.
          </p>
          {error != null && (
            <details style={{ marginBottom: '1rem' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  color: '#8899aa',
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
                {normalized.message}
                {'\n\n'}
                {normalized.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#727b81',
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
