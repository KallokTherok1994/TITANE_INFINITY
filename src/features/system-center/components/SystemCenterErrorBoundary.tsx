/**
 * TITANE∞ v21 — System Center Error Boundary
 *
 * Error boundary personnalisé pour le Centre Système avec UX améliorée
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React from 'react';
import { logger } from '@/lib/logger';
import {
  formatUserError,
  formatErrorForLog,
  generateErrorId,
  isErrorCritical,
} from '../utils/errorMessages';

interface Props {
  children: React.ReactNode;
  fallbackUI?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  showDetails: boolean;
}

/**
 * ErrorBoundary pour le System Center avec gestion élégante des erreurs
 */
export class SystemCenterErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log complet pour les développeurs
    const _errorLog = formatErrorForLog(error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    logger.error(
      'System Center error caught',
      {
        component: 'SystemCenterErrorBoundary',
        action: 'componentDidCatch',
        errorId: this.state.errorId,
        critical: isErrorCritical(error),
      },
      error
    );

    // Callback optionnel (pour reporting, analytics, etc.)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
    });
  };

  handleToggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Utiliser le fallback custom si fourni
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      // Formater l'erreur pour l'utilisateur
      const formatted = formatUserError(this.state.error);
      const isCritical = isErrorCritical(this.state.error);

      return (
        <div
          className={`sc-error-boundary ${isCritical ? 'sc-error-boundary--critical' : ''}`}
        >
          {/* Header */}
          <div className="sc-error-boundary-header">
            <span className="sc-error-boundary-icon">{isCritical ? '🔥' : '⚠️'}</span>
            <h3 className="sc-error-boundary-title">
              {isCritical ? 'Erreur Critique' : "Une Erreur s'est Produite"}
            </h3>
          </div>

          {/* Message Utilisateur */}
          <div className="sc-error-boundary-content">
            <p className="sc-error-boundary-message">{formatted.userMessage}</p>

            {/* Suggestions */}
            {formatted.suggestions.length > 0 && (
              <div className="sc-error-boundary-suggestions">
                <strong>💡 Suggestions :</strong>
                <ul>
                  {formatted.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="sc-error-boundary-actions">
              <button className="sc-btn sc-btn--primary" onClick={this.handleReset}>
                {isCritical ? '🔄 Réinitialiser' : '✓ Réessayer'}
              </button>

              {isCritical && (
                <button
                  className="sc-btn sc-btn--secondary"
                  onClick={() => window.location.reload()}
                >
                  🔃 Recharger la Page
                </button>
              )}
            </div>

            {/* Détails Techniques (repliable) */}
            <details className="sc-error-boundary-details" open={this.state.showDetails}>
              <summary onClick={this.handleToggleDetails}>🛠️ Détails Techniques</summary>
              <div className="sc-error-boundary-technical">
                {/* ID d'erreur */}
                {this.state.errorId && (
                  <div className="sc-error-id">
                    <strong>ID d&apos;erreur :</strong>
                    <code>{this.state.errorId}</code>
                  </div>
                )}

                {/* Détails techniques */}
                <div className="sc-error-technical-details">
                  <strong>Détails :</strong>
                  <pre>{formatted.technicalDetails}</pre>
                </div>

                {/* Stack trace (dev mode uniquement) */}
                {import.meta.env.DEV && this.state.error.stack && (
                  <div className="sc-error-stack">
                    <strong>Stack Trace (Dev Mode) :</strong>
                    <pre>{this.state.error.stack}</pre>
                  </div>
                )}

                {/* Timestamp */}
                <div className="sc-error-timestamp">
                  <strong>Timestamp :</strong>
                  <code>{new Date().toISOString()}</code>
                </div>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SystemCenterErrorBoundary;
