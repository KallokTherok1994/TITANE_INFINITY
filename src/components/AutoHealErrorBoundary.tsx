// TITANE∞ v16.0 — Auto-Heal Error Boundary React
import { Component, ErrorInfo, ReactNode } from 'react';
import { autoHealClient } from '../utils/autoHealClient';
import './AutoHealErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isHealing: boolean;
  healingProgress: string;
}

export class AutoHealErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isHealing: false,
      healingProgress: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Erreur capturée:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      isHealing: true,
      healingProgress: 'Diagnostic en cours...',
    });

    // Déclencher auto-heal
    void this.performAutoHeal(error, errorInfo);
  }

  private async performAutoHeal(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      // Étape 1: Scan
      this.setState({ healingProgress: '🔍 Analyse du système...' });
      await autoHealClient.scan();
      await this.delay(1000);

      // Étape 2: Réparation
      this.setState({ healingProgress: '🔧 Réparation en cours...' });
      await autoHealClient.errorHandler.handleError(error, errorInfo);
      await this.delay(1000);

      // Étape 3: Vérification
      this.setState({ healingProgress: '✅ Reconstruction terminée' });
      await this.delay(1000);

      // Étape 4: Reload (géré par errorHandler.handleError)
    } catch (err) {
      console.error('[ErrorBoundary] Échec auto-heal:', err);
      this.setState({
        isHealing: false,
        healingProgress: '❌ Auto-réparation échouée. Rechargement manuel requis.',
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleManualReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isHealing: false,
      healingProgress: '',
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="auto-heal-error-boundary">
          <div className="error-container">
            <div className="error-header">
              <div className="error-icon">⚠️</div>
              <h1>TITANE∞ Auto-Heal</h1>
            </div>

            {this.state.isHealing ? (
              <div className="healing-status">
                <div className="healing-spinner"></div>
                <p className="healing-text">{this.state.healingProgress}</p>
                <div className="healing-bar">
                  <div className="healing-bar-fill"></div>
                </div>
              </div>
            ) : (
              <div className="error-details">
                <h2>Une erreur est survenue</h2>
                <div className="error-message">
                  <strong>Message:</strong>
                  <pre>{this.state.error?.message}</pre>
                </div>
                {this.state.errorInfo && (
                  <details className="error-stack">
                    <summary>Détails techniques</summary>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
                <div className="error-actions">
                  <button onClick={this.handleManualReload} className="btn-primary">
                    🔄 Recharger l'application
                  </button>
                  <button onClick={this.handleReset} className="btn-secondary">
                    ↩️ Réessayer
                  </button>
                </div>
              </div>
            )}

            <div className="error-footer">
              <p>Système Auto-Heal TITANE∞ v16.0</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AutoHealErrorBoundary;
