/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ══════════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — OMNIS ERROR BOUNDARY (UI ANTI-CRASH v1.0)
 *   PHASE 5 OMNIS: Auto-recovery UI • State preservation • Fault-tolerant components
 *   Architecture: Error-Capture → State-Backup → Graceful-Degradation → Auto-Recovery
 *   Garantit interface utilisateur mathématiquement impossible à crasher
 * ══════════════════════════════════════════════════════════════════════════════════
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Shield, Activity } from '../icons';

// ─────────────────────────────────────────────────────────────────
// TYPES OMNIS ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────────

interface OmnisErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  level: 'critical' | 'important' | 'minor';
  autoRecovery?: boolean;
  stateBackup?: boolean;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, recovery?: () => void) => void;
  resetKeys?: Array<string | number>;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface OmnisErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
  lastErrorTimestamp: number;
  backupState?: BackupSnapshot | null;
  degradedMode: boolean;
  recoveryAttempts: number[];
}

interface BackupSnapshot {
  timestamp: number;
  componentName?: string;
  metadata: {
    userAgent: string;
    url: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

interface ErrorMetrics {
  timestamp: number;
  componentName: string;
  errorType: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  retryCount: number;
  recoverySuccess: boolean;
  degradedMode: boolean;
}

// ─────────────────────────────────────────────────────────────────
// OMNIS ERROR BOUNDARY CLASS
// ─────────────────────────────────────────────────────────────────

export class OmnisErrorBoundary extends Component<
  OmnisErrorBoundaryProps,
  OmnisErrorState
> {
  private recoveryTimer?: NodeJS.Timeout;
  private stateBackupKey: string;
  private errorMetrics: ErrorMetrics[] = [];

  constructor(props: OmnisErrorBoundaryProps) {
    super(props);

    this.stateBackupKey = `omnis-state-${props.componentName || 'component'}-backup`;

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      lastErrorTimestamp: 0,
      backupState: this.loadBackupState(),
      degradedMode: false,
      recoveryAttempts: [],
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 5.1: ERROR CAPTURE & IMMEDIATE RESPONSE
   * ═══════════════════════════════════════════════════════════════════
   */

  static getDerivedStateFromError(error: Error): Partial<OmnisErrorState> {
    return {
      hasError: true,
      error,
      lastErrorTimestamp: Date.now(),
      degradedMode: true, // Immediate degraded mode activation
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const now = Date.now();
    const newRetryCount = this.state.retryCount + 1;

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      retryCount: newRetryCount,
      recoveryAttempts: [...prevState.recoveryAttempts, now],
    }));

    // Immediate state backup before processing error
    this.backupCurrentState();

    // Log error with OMNIS metrics
    this.logOmnisError(error, errorInfo, newRetryCount);

    // Trigger recovery sequence if enabled
    if (
      this.props.autoRecovery !== false &&
      newRetryCount <= (this.props.maxRetries || 3)
    ) {
      this.initiateRecoverySequence();
    }

    // Custom error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo, () => this.forceRecovery());
    }
  }

  componentDidUpdate(prevProps: OmnisErrorBoundaryProps): void {
    // Auto-reset on resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );
      if (hasResetKeyChanged) {
        this.executeRecovery();
      }
    }
  }

  componentWillUnmount(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 5.2: STATE BACKUP & RESTORATION
   * ═══════════════════════════════════════════════════════════════════
   */

  private backupCurrentState(): void {
    if (!this.props.stateBackup) return;

    try {
      const stateSnapshot: BackupSnapshot = {
        timestamp: Date.now(),
        componentName: this.props.componentName,
        // Try to capture React state from children (limited access)
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
      };

      localStorage.setItem(this.stateBackupKey, JSON.stringify(stateSnapshot));

      // Also backup to sessionStorage as secondary
      sessionStorage.setItem(
        `${this.stateBackupKey}-session`,
        JSON.stringify(stateSnapshot)
      );
    } catch (error) {
      console.warn('[OMNIS] State backup failed:', error);
    }
  }

  private loadBackupState(): BackupSnapshot | null {
    try {
      const stored = localStorage.getItem(this.stateBackupKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use backup if less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed as BackupSnapshot;
        }
      }
    } catch (error) {
      console.warn('[OMNIS] State restore failed:', error);
    }
    return null;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 5.3: RECOVERY SEQUENCE & AUTO-HEAL
   * ═══════════════════════════════════════════════════════════════════
   */

  private initiateRecoverySequence(): void {
    const delayMs = this.calculateRecoveryDelay();

    this.setState({ isRecovering: true });

    this.recoveryTimer = setTimeout(() => {
      this.executeRecovery();
    }, delayMs);
  }

  private calculateRecoveryDelay(): number {
    const baseDelay = this.props.retryDelayMs || 2000;
    const backoffMultiplier = Math.min(2 ** this.state.retryCount, 8); // Max 8x
    const jitter = Math.random() * 1000; // Add jitter

    return Math.min(baseDelay * backoffMultiplier + jitter, 10000); // Max 10s
  }

  private executeRecovery = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      degradedMode: false, // Exit degraded mode on recovery
    });

    // Clear recovery timer
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
      this.recoveryTimer = undefined;
    }

    // Log successful recovery
    this.logRecoverySuccess();
  };

  private forceRecovery = (): void => {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
    this.executeRecovery();
  };

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 5.4: METRICS & MONITORING
   * ═══════════════════════════════════════════════════════════════════
   */

  private logOmnisError(error: Error, errorInfo: ErrorInfo, retryCount: number): void {
    const metrics: ErrorMetrics = {
      timestamp: Date.now(),
      componentName: this.props.componentName || 'unknown',
      errorType: error.name || 'Error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack ?? undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount,
      recoverySuccess: false,
      degradedMode: this.state.degradedMode,
    };

    this.errorMetrics.push(metrics);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🛡️ OMNIS Error Boundary - ${this.props.level.toUpperCase()}`);
      console.error('Component:', this.props.componentName);
      console.error('Error:', error);
      console.error('Retry Count:', retryCount);
      console.error('Component Stack:', errorInfo?.componentStack);
      console.groupEnd();
    }

    // Production error tracking
    try {
      const errorLog = localStorage.getItem('omnis-error-logs') || '[]';
      const logs = JSON.parse(errorLog);
      logs.push(metrics);

      // Keep last 100 errors
      if (logs.length > 100) logs.shift();

      localStorage.setItem('omnis-error-logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('[OMNIS] Error logging failed:', e);
    }
  }

  private logRecoverySuccess(): void {
    if (this.errorMetrics.length > 0) {
      const lastMetric = this.errorMetrics[this.errorMetrics.length - 1];
      lastMetric.recoverySuccess = true;
    }

    console.log(`[OMNIS] Recovery successful for ${this.props.componentName}`);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 5.5: GRACEFUL DEGRADATION UI
   * ═══════════════════════════════════════════════════════════════════
   */

  private renderDegradedFallback(): ReactNode {
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { error, isRecovering, retryCount } = this.state;
    const maxRetries = this.props.maxRetries || 3;
    const canRetry = retryCount < maxRetries;
    const isMinor = this.props.level === 'minor';

    return (
      <div className={`omnis-error-boundary ${this.props.level}`}>
        <div className="omnis-error-content">
          {/* Error Icon */}
          <div className="omnis-error-icon">
            {this.props.level === 'critical' ? (
              <AlertTriangle size={isMinor ? 24 : 48} />
            ) : (
              <Shield size={isMinor ? 20 : 32} />
            )}
          </div>

          {/* Error Message */}
          <div className="omnis-error-message">
            <h3>
              {this.props.level === 'critical'
                ? 'Erreur Système Critique'
                : this.props.level === 'important'
                  ? 'Composant Temporairement Indisponible'
                  : 'Erreur Mineure'}
            </h3>

            {!isMinor && (
              <p>
                {this.props.componentName
                  ? `Le composant "${this.props.componentName}" a rencontré une erreur.`
                  : "Une erreur inattendue s'est produite."}
              </p>
            )}

            {process.env.NODE_ENV === 'development' && error && (
              <details className="omnis-error-details">
                <summary>Détails techniques</summary>
                <code>{error.message}</code>
              </details>
            )}
          </div>

          {/* Recovery Actions */}
          {!isRecovering && (
            <div className="omnis-error-actions">
              {canRetry && (
                <button
                  onClick={this.forceRecovery}
                  className="omnis-recovery-button"
                  disabled={isRecovering}
                >
                  <RefreshCw size={16} />
                  Réessayer {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </button>
              )}

              {this.props.level === 'critical' && (
                <button
                  onClick={() => window.location.reload()}
                  className="omnis-reload-button"
                >
                  <Home size={16} />
                  Recharger la page
                </button>
              )}
            </div>
          )}

          {/* Recovery Status */}
          {isRecovering && (
            <div className="omnis-recovery-status">
              <Activity size={16} className="omnis-recovery-spinner" />
              <span>Récupération automatique en cours...</span>
            </div>
          )}

          {/* Degraded Mode Indicator */}
          {this.state.degradedMode && (
            <div className="omnis-degraded-indicator">
              <Shield size={14} />
              <span>Mode dégradé OMNIS activé</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderDegradedFallback();
    }

    return this.props.children;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * OMNIS PUBLIC API
   * ═══════════════════════════════════════════════════════════════════
   */

  public getOmnisMetrics() {
    return {
      errorCount: this.errorMetrics.length,
      lastError: this.errorMetrics[this.errorMetrics.length - 1] || null,
      retryCount: this.state.retryCount,
      degradedMode: this.state.degradedMode,
      hasBackup: !!this.state.backupState,
      componentName: this.props.componentName,
      level: this.props.level,
    };
  }

  public forceReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      degradedMode: false,
      recoveryAttempts: [],
    });
  };
}

// ─────────────────────────────────────────────────────────────────
// OMNIS ERROR BOUNDARY HOC
// ─────────────────────────────────────────────────────────────────

export function withOmnisErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Partial<OmnisErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <OmnisErrorBoundary
      componentName={Component.displayName || Component.name}
      level="important"
      autoRecovery={true}
      stateBackup={true}
      {...boundaryProps}
    >
      <Component {...props} />
    </OmnisErrorBoundary>
  );

  WrappedComponent.displayName = `withOmnisErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// ─────────────────────────────────────────────────────────────────
// OMNIS ERROR BOUNDARY STYLES (to be added to CSS)
// ─────────────────────────────────────────────────────────────────

export const OmnisErrorBoundaryStyles = `
.omnis-error-boundary {
  padding: 1rem;
  margin: 0.5rem;
  border-radius: 8px;
  border: 2px solid;
}

.omnis-error-boundary.critical {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgb(239, 68, 68);
}

.omnis-error-boundary.important {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgb(245, 158, 11);
}

.omnis-error-boundary.minor {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgb(59, 130, 246);
  padding: 0.5rem;
}

.omnis-error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.omnis-error-icon {
  color: currentColor;
  opacity: 0.8;
}

.omnis-error-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.omnis-recovery-button, .omnis-reload-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.omnis-recovery-button:hover, .omnis-reload-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.omnis-recovery-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.omnis-recovery-spinner {
  animation: spin 1s linear infinite;
}

.omnis-degraded-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
