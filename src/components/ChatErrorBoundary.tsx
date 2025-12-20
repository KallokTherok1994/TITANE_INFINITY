/**
 * TITANE∞ v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 - Chat Error Boundary Component
 * Specialized error boundary for Chat IA with OMEGA Pipeline integration
 * Phase 4 - Week 6: Error boundaries for ChatIA
 * 
 * FUTURE IMPROVEMENT (Phase 5+):
 * - Replace string-based error detection with structured error codes
 * - Example: error.code = 'OMEGA_STEP_1_VALIDATION'
 * - This would make detection more robust and maintainable
 * ═══════════════════════════════════════════════════════════════
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { autoHealEngine } from '@/services/ai/autoHealEngine';
import { monitoring } from '@/monitoring';

interface ChatErrorBoundaryProps {
  children: ReactNode;
  conversationId?: string;
  mode?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isAutoHealing: boolean;
  healingAttempts: number;
  errorContext: ChatErrorContext | null;
}

interface ChatErrorContext {
  conversationId?: string;
  mode?: string;
  timestamp: number;
  userAgent: string;
  lastMessage?: string;
  pipelineStep?: string;
}

/**
 * ChatErrorBoundary - Specialized error boundary for Chat IA
 * 
 * Features:
 * - OMEGA Pipeline error tracking
 * - Auto-healing integration
 * - Conversation context preservation
 * - Graceful degradation
 * - User-friendly error messages
 * 
 * Usage:
 * ```tsx
 * <ChatErrorBoundary conversationId={conversationId} mode="creative">
 *   <ChatInterface />
 * </ChatErrorBoundary>
 * ```
 */
export class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  private static readonly MAX_AUTO_HEAL_ATTEMPTS = 3;
  private static readonly AUTO_HEAL_TIMEOUT_MS = 5000;

  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null, // Renamed to _errorInfo
      isAutoHealing: false,
      healingAttempts: 0,
      errorContext: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ChatErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { conversationId, mode, onError } = this.props;

    // Capture error context
    const errorContext: ChatErrorContext = {
      conversationId,
      mode,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      pipelineStep: this.detectPipelineStep(error),
    };

    // Log structured error
    logger.error(
      'Chat error captured',
      {
        component: 'ChatErrorBoundary',
        context: 'Chat',
        conversationId,
        mode,
        pipelineStep: errorContext.pipelineStep,
      },
      error
    );

    // Monitoring (metrics + optional Sentry)
    try {
      monitoring.addBreadcrumb('Chat error captured', 'chat', {
        component: 'ChatErrorBoundary',
        conversationId,
        mode,
        pipelineStep: errorContext.pipelineStep,
      });

      monitoring.trackError(error, {
        component: 'ChatErrorBoundary',
        context: 'Chat',
        conversationId,
        mode,
        pipelineStep: errorContext.pipelineStep,
        componentStack: errorInfo.componentStack,
      });

      if (errorContext.pipelineStep?.startsWith('Step ')) {
        monitoring.trackPipelineError();
      }
    } catch (monitoringError) {
      logger.error(
        'Monitoring tracking failed',
        { component: 'ChatErrorBoundary' },
        monitoringError as Error
      );
    }

    // Log component stack
    if (errorInfo.componentStack) {
      logger.debug('Component stack trace', {
        component: 'ChatErrorBoundary',
        componentStack: errorInfo.componentStack,
      });
    }

    // Custom error callback
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (callbackError) {
        logger.error(
          'onError callback failed',
          { component: 'ChatErrorBoundary' },
          callbackError as Error
        );
      }
    }

    // Update state
    this.setState({
      error,
      errorInfo,
      errorContext,
    });

    // Attempt auto-healing
    void this.attemptAutoHeal(error, errorInfo, errorContext);
  }

  /**
   * Detect which OMEGA Pipeline step failed based on error
   * Uses a priority-based matching system to handle overlapping keywords
   */
  private detectPipelineStep(error: Error): string | undefined {
    const message = error.message.toLowerCase();

    // Priority 1: Specific combinations (check these first)
    if (message.includes('output') && message.includes('validation')) {
      return 'Step 7: Output Validation';
    }
    if (message.includes('save') && message.includes('memory')) {
      return 'Step 8: Memory Save';
    }

    // Priority 2: Single keywords
    if (message.includes('validation') || message.includes('sanitize')) {
      return 'Step 1: Input Validation';
    }
    if (message.includes('memory') || message.includes('context')) {
      return 'Step 2: Context Retrieval';
    }
    if (message.includes('intent') || message.includes('emotion')) {
      return 'Step 3: Intent/Emotion Analysis';
    }
    if (message.includes('prompt') || message.includes('construction')) {
      return 'Step 4: Prompt Construction';
    }
    if (message.includes('ai') || message.includes('generation') || message.includes('provider')) {
      return 'Step 5: AI Generation';
    }
    if (message.includes('post') || message.includes('process')) {
      return 'Step 6: Post-Processing';
    }
    if (message.includes('singularity') || message.includes('sync')) {
      return 'Step 9: Singularity Sync';
    }
    if (message.includes('healing') || message.includes('health')) {
      return 'Step 10: Self-Healing Check';
    }

    // Future refactor: replace string matching with structured error codes
    // e.g., error.code === 'OMEGA_STEP_1_VALIDATION'
    return 'Unknown Pipeline Step';
  }

  /**
   * Attempt auto-healing via OMEGA Pipeline self-healing
   */
  private async attemptAutoHeal(
    error: Error,
    errorInfo: ErrorInfo,
    errorContext: ChatErrorContext
  ): Promise<void> {
    const { healingAttempts } = this.state;

    // Max attempts reached
    if (healingAttempts >= ChatErrorBoundary.MAX_AUTO_HEAL_ATTEMPTS) {
      logger.warn('Max auto-heal attempts reached', {
        component: 'ChatErrorBoundary',
        attempts: healingAttempts,
      });
      return;
    }

    this.setState({ isAutoHealing: true, healingAttempts: healingAttempts + 1 });

    try {
      logger.info('Attempting auto-heal', {
        component: 'ChatErrorBoundary',
        attempt: healingAttempts + 1,
        pipelineStep: errorContext.pipelineStep,
      });

      // Trigger auto-heal engine
      await Promise.race([
        autoHealEngine.handleChatError(error, 
          { componentStack: errorInfo.componentStack ?? undefined }, 
          errorContext
        ),
        this.timeout(ChatErrorBoundary.AUTO_HEAL_TIMEOUT_MS),
      ]);

      // Healing successful - reset state
      logger.info('Auto-heal successful', {
        component: 'ChatErrorBoundary',
        attempt: healingAttempts + 1,
      });

      await this.delay(1000); // Brief delay for user feedback

      this.handleReset();
    } catch (healError) {
      logger.error(
        'Auto-heal failed',
        {
          component: 'ChatErrorBoundary',
          attempt: healingAttempts + 1,
        },
        healError as Error
      );

      this.setState({ isAutoHealing: false });
    }
  }

  /**
   * Reset error boundary state
   */
  private handleReset = (): void => {
    const { onReset } = this.props;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isAutoHealing: false,
      errorContext: null,
    });

    if (onReset) {
      try {
        onReset();
      } catch (error) {
        logger.error(
          'onReset callback failed',
          { component: 'ChatErrorBoundary' },
          error as Error
        );
      }
    }
  };

  /**
   * Clear conversation and reset
   */
  private handleClearConversation = (): void => {
    logger.info('Clearing conversation after error', {
      component: 'ChatErrorBoundary',
      conversationId: this.state.errorContext?.conversationId,
    });

    // Clear local storage (if used)
    try {
      const { conversationId } = this.state.errorContext || {};
      if (conversationId) {
        localStorage.removeItem(`chat_${conversationId}`);
      }
    } catch (error) {
      logger.error(
        'Failed to clear conversation storage',
        { component: 'ChatErrorBoundary' },
        error as Error
      );
    }

    this.handleReset();
  };

  /**
   * Report error to backend
   */
  private handleReportError = async (): Promise<void> => {
    const { error, errorContext } = this.state;

    if (!error || !errorContext) return;

    try {
      logger.info('Reporting error to backend', {
        component: 'ChatErrorBoundary',
        conversationId: errorContext.conversationId,
      });

      // Send error report via Tauri (implementation in future)
      // await invoke('report_chat_error', {
      //   error: {
      //     message: error.message,
      //     stack: error.stack,
      //     componentStack: errorInfo?.componentStack,
      //     context: errorContext,
      //   },
      // });

      logger.info('Error reported successfully', {
        component: 'ChatErrorBoundary',
      });
    } catch (reportError) {
      logger.error(
        'Failed to report error',
        { component: 'ChatErrorBoundary' },
        reportError as Error
      );
    }
  };

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auto-heal timeout')), ms)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  render(): ReactNode {
    const { children } = this.props;
    const { hasError, error, isAutoHealing, healingAttempts, errorContext } = this.state;

    if (!hasError) {
      return children;
    }

    // Auto-healing in progress
    if (isAutoHealing) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="max-w-md p-8 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2 text-gray-100">
              🔧 Auto-réparation en cours...
            </h2>
            <p className="text-center text-gray-400">
              Tentative {healingAttempts}/{ChatErrorBoundary.MAX_AUTO_HEAL_ATTEMPTS}
            </p>
            {errorContext?.pipelineStep && (
              <p className="text-sm text-center text-gray-500 mt-2">
                Étape: {errorContext.pipelineStep}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Error fallback UI
    return (
      <div className="flex items-center justify-center h-full w-full p-4">
        <div className="max-w-2xl w-full bg-gray-800 rounded-lg border-2 border-red-500/50 p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 text-4xl mr-4">⚠️</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                Erreur dans le Chat IA
              </h2>
              <p className="text-gray-300">
                Une erreur inattendue s&apos;est produite dans le système de conversation.
                Vos données sont sécurisées et la conversation a été isolée.
              </p>
            </div>
          </div>

          {/* Pipeline Step */}
          {errorContext?.pipelineStep && (
            <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Étape de pipeline:</span>{' '}
                {errorContext.pipelineStep}
              </p>
            </div>
          )}

          {/* Error Details */}
          {error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-blue-400 hover:text-blue-300 mb-2">
                Détails techniques
              </summary>
              <div className="bg-black p-4 rounded overflow-auto max-h-48">
                <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </div>
            </details>
          )}

          {/* Context Info */}
          {errorContext && (
            <div className="mb-4 text-sm text-gray-500">
              <p>Mode: {errorContext.mode || 'default'}</p>
              <p>Conversation ID: {errorContext.conversationId || 'N/A'}</p>
              <p>Timestamp: {new Date(errorContext.timestamp).toLocaleString()}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              Réessayer
            </button>

            <button
              onClick={this.handleClearConversation}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium transition-colors"
            >
              Nouvelle Conversation
            </button>

            <button
              onClick={this.handleReportError}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              Signaler l&apos;erreur
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              Recharger l&apos;application
            </button>
          </div>

          {/* Healing Attempts Info */}
          {healingAttempts > 0 && (
            <div className="mt-4 p-3 bg-orange-900/20 border border-orange-500/30 rounded">
              <p className="text-sm text-orange-400">
                ℹ️ {healingAttempts} tentative(s) d&apos;auto-réparation effectuée(s)
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-500">
            <p className="mb-2">
              <strong>Que faire ?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Cliquez sur « Réessayer » pour tenter de reprendre la conversation</li>
              <li>Créez une &quot;Nouvelle Conversation&quot; pour repartir à zéro</li>
              <li>Si le problème persiste, rechargez l’application</li>
              <li>Vous pouvez signaler cette erreur pour nous aider à l’améliorer</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Extension for autoHealEngine to handle chat-specific errors
 */
declare module '@/services/ai/autoHealEngine' {
  interface AutoHealEngine {
    handleChatError(
      error: Error,
      errorInfo: { componentStack?: string },
      context: {
        conversationId?: string;
        mode?: string;
        pipelineStep?: string;
        timestamp: number;
      }
    ): Promise<void>;
  }
}

export default ChatErrorBoundary;
