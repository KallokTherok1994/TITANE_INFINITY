/**
 * TITANE∞ vΩ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ vΩ — ChatFallback Component
 * UI Anti-Silence Contract: Garantit qu'aucune bulle vide n'est rendue
 * Always Respond Fallback avec diagnostic et actions
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useCallback } from 'react';
import { Copy, RefreshCw, Settings, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type ChatFallbackReason =
  | 'empty-response'
  | 'timeout'
  | 'aborted'
  | 'backend-down'
  | 'network-error'
  | 'unknown';

export interface ChatFallbackProps {
  reason: ChatFallbackReason;
  traceId?: string;
  timestamp?: number;
  provider?: string;
  mode?: string;
  pipelineState?: string;
  onRetry?: () => void;
  onChangeProvider?: () => void;
  onCopyDiagnostic?: (diagnostic: string) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const REASON_MESSAGES: Record<
  ChatFallbackReason,
  { title: string; description: string }
> = {
  'empty-response': {
    title: 'Réponse vide reçue',
    description: "L'IA a répondu mais le contenu est vide. Veuillez réessayer.",
  },
  timeout: {
    title: 'Délai dépassé',
    description: "La requête a pris trop de temps. L'IA est peut-être surchargée.",
  },
  aborted: {
    title: 'Requête interrompue',
    description: 'La génération a été annulée avant sa fin.',
  },
  'backend-down': {
    title: 'Moteur indisponible',
    description:
      "Le service d'IA ne répond pas. Vérifiez votre connexion ou changez de provider.",
  },
  'network-error': {
    title: 'Erreur réseau',
    description: 'Impossible de contacter le service. Vérifiez votre connexion.',
  },
  unknown: {
    title: 'Erreur inconnue',
    description: 'Une erreur inattendue est survenue. Veuillez réessayer.',
  },
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const ChatFallback: React.FC<ChatFallbackProps> = ({
  reason,
  traceId,
  timestamp,
  provider,
  mode,
  pipelineState,
  onRetry,
  onChangeProvider,
  onCopyDiagnostic,
  className,
}) => {
  const { title, description } = REASON_MESSAGES[reason];

  // Générer diagnostic copiable
  const generateDiagnostic = useCallback((): string => {
    const diagnostic = {
      event: 'CHAT_EMPTY_RESPONSE_HANDLED',
      timestamp: timestamp || Date.now(),
      reason,
      traceId: traceId || 'N/A',
      provider: provider || 'unknown',
      mode: mode || 'default',
      pipelineState: pipelineState || 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };

    return JSON.stringify(diagnostic, null, 2);
  }, [reason, traceId, timestamp, provider, mode, pipelineState]);

  const handleCopyDiagnostic = useCallback(() => {
    const diagnostic = generateDiagnostic();
    if (onCopyDiagnostic) {
      onCopyDiagnostic(diagnostic);
    } else {
      // Fallback: copie dans le presse-papiers
      navigator.clipboard?.writeText(diagnostic).catch(console.error);
    }
  }, [generateDiagnostic, onCopyDiagnostic]);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-6 rounded-lg border-2 border-dashed',
        'border-titanium-border-error bg-titanium-bg-overlay',
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon + Title */}
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <AlertCircle
            size={24}
            className="text-titanium-text-error"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-titanium-text-primary mb-1">
            {title}
          </h3>
          <p className="text-sm text-titanium-text-secondary">{description}</p>
        </div>
      </div>

      {/* Diagnostic Info */}
      <div className="flex flex-col gap-2 text-xs text-titanium-text-tertiary bg-titanium-bg-base rounded p-3 font-mono">
        {traceId && (
          <div className="flex justify-between">
            <span className="opacity-70">Trace ID:</span>
            <span className="font-medium">{traceId}</span>
          </div>
        )}
        {timestamp && (
          <div className="flex justify-between">
            <span className="opacity-70">Timestamp:</span>
            <span className="font-medium">{new Date(timestamp).toLocaleString()}</span>
          </div>
        )}
        {provider && (
          <div className="flex justify-between">
            <span className="opacity-70">Provider:</span>
            <span className="font-medium">{provider}</span>
          </div>
        )}
        {mode && (
          <div className="flex justify-between">
            <span className="opacity-70">Mode:</span>
            <span className="font-medium">{mode}</span>
          </div>
        )}
        {pipelineState && (
          <div className="flex justify-between">
            <span className="opacity-70">Pipeline:</span>
            <span className="font-medium">{pipelineState}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* CTA Primaire: Retry */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
              'bg-titanium-accent-cool text-white font-medium text-sm',
              'hover:bg-titanium-accent-cool/90 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-titanium-accent-cool focus:ring-offset-2'
            )}
            aria-label="Réessayer la génération"
          >
            <RefreshCw size={16} aria-hidden="true" />
            <span>Réessayer</span>
          </button>
        )}

        {/* CTA Secondaire: Changer Provider */}
        {onChangeProvider && (
          <button
            type="button"
            onClick={onChangeProvider}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
              'bg-titanium-bg-interactive text-titanium-text-primary font-medium text-sm',
              'hover:bg-titanium-bg-overlay transition-colors border border-titanium-border-default',
              'focus:outline-none focus:ring-2 focus:ring-titanium-accent-cool focus:ring-offset-2'
            )}
            aria-label="Changer de provider IA"
          >
            <Settings size={16} aria-hidden="true" />
            <span>Changer Provider</span>
          </button>
        )}

        {/* CTA Diagnostic: Copier */}
        <button
          type="button"
          onClick={handleCopyDiagnostic}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'bg-titanium-bg-interactive text-titanium-text-secondary font-medium text-sm',
            'hover:bg-titanium-bg-overlay transition-colors border border-titanium-border-default',
            'focus:outline-none focus:ring-2 focus:ring-titanium-accent-cool focus:ring-offset-2'
          )}
          aria-label="Copier le diagnostic"
          title="Copier les détails techniques pour le support"
        >
          <Copy size={16} aria-hidden="true" />
          <span>Copier Diagnostic</span>
        </button>
      </div>

      {/* Footer hint */}
      <p className="text-xs text-titanium-text-tertiary text-center">
        💡 Si le problème persiste, essayez de changer de provider ou consultez les logs.
      </p>
    </div>
  );
};

ChatFallback.displayName = 'ChatFallback';
