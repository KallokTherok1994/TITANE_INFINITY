/**
 * TITANE∞ v25 - Route Error Boundary
 * Catches and handles errors at route level
 */

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route Error:', error, errorInfo);
    // IMPLEMENTATION: Send to error logging service
    // 1. Function: sendErrorToLoggingService(error, errorInfo, { route: window.location.pathname })
    // 2. Endpoint: POST /api/errors with { error: error.message, stack, componentStack, route, timestamp }
    // 3. Retry: Exponential backoff (max 3 attempts) if network fails
    // 4. Privacy: Anonymize user data, only send error patterns
    // 5. Silent fail: Don't block UI if logging service unavailable
    // 6. Integration: Use same logger as lib/logger.ts logToRemote()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="max-w-md p-8 bg-slate-800 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              ⚠️ Erreur d'Affichage
            </h1>
            <p className="text-slate-300 mb-4">
              Une erreur s'est produite lors du chargement de cette page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Recharger la page
            </button>
            {this.state.error && (
              <details className="mt-4 text-sm text-slate-400">
                <summary className="cursor-pointer hover:text-slate-300">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-2 bg-slate-900 rounded overflow-auto text-xs">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
