/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — MESSAGE BUBBLE COMPONENT OPTIMISÉ
 *   Bulle de message avec markdown rendering et animations
 *   Optimisé avec React.memo et useMemo pour performance
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { memo, useMemo, useState } from 'react';
import './MessageBubble.css';
import { MarkdownContent } from './MarkdownContent';
import { ChatFallback } from './ChatFallback';
import { MessageReactions } from './MessageReactions'; // Sprint 6 Phase 3
import {
  messageSpeechController,
  useMessageSpeechState,
  type MessageSpeechStatus,
} from '@/services/tts/messageSpeechController';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isLatest?: boolean;
  onRetry?: () => void;
  metadata?: Record<string, unknown>;
}

/**
 * Formate un timestamp en heure UTC
 */
const formatTime = (ts: number): string => {
  const date = new Date(ts);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

/**
 * Mapping des avatars par rôle
 */
const AVATARS: Record<MessageBubbleProps['role'], React.ReactNode> = {
  user: <div className="message-avatar-user">👤</div>,
  system: <div className="message-avatar-system">⚙️</div>,
  assistant: (
    <div className="message-avatar-ai">
      <span className="message-avatar-icon">🤖</span>
    </div>
  ),
};

/**
 * Mapping des noms d'auteur par rôle
 */
const AUTHOR_NAMES: Record<MessageBubbleProps['role'], string> = {
  user: 'Vous',
  system: 'Système',
  assistant: 'TITANE∞',
};

const getSpeechStatusLabel = (
  status: MessageSpeechStatus,
  provider: 'tauri' | 'webspeech' | null,
  error: string | null
): string => {
  switch (status) {
    case 'loading':
      return provider === 'webspeech'
        ? 'Préparation de la lecture Web Speech...'
        : 'Préparation de la lecture desktop...';
    case 'speaking':
      return provider === 'webspeech'
        ? 'Lecture en cours via Web Speech.'
        : 'Lecture en cours sur le runtime desktop.';
    case 'paused':
      return 'Lecture en pause.';
    case 'completed':
      return 'Lecture terminée.';
    case 'stopped':
      return 'Lecture arrêtée.';
    case 'error':
      return error ? `Erreur audio: ${error}` : 'Erreur audio.';
    default:
      return 'Prêt pour la lecture audio.';
  }
};

/**
 * Indicateur de frappe
 */
const TypingIndicator = memo(function TypingIndicator() {
  return (
    <span className="typing-indicator" aria-label="TITANE∞ génère une réponse...">
      <span className="typing-dot">●</span>
      <span className="typing-dot">●</span>
      <span className="typing-dot">●</span>
    </span>
  );
});

/**
 * Composant MessageBubble optimisé
 * Utilise React.memo pour éviter les re-renders inutiles
 */
export const MessageBubble = memo(function MessageBubble({
  role,
  content,
  timestamp,
  isLatest = false,
  onRetry,
  metadata,
}: MessageBubbleProps) {
  // État pour gérer le retry loading
  const [isRetrying, setIsRetrying] = useState(false);
  const messageId = `${role}-${timestamp}`;
  const speechState = useMessageSpeechState(
    messageId,
    role === 'assistant' ? content : ''
  );

  // Memoize le temps formaté
  const formattedTime = useMemo(() => formatTime(timestamp), [timestamp]);

  // Memoize les classes CSS
  const bubbleClasses = useMemo(
    () =>
      `message-bubble message-bubble-${role} ${isLatest ? 'message-bubble-latest' : ''} ${isRetrying ? 'message-bubble-loading' : ''}`,
    [role, isLatest, isRetrying]
  );

  // Memoize le label aria
  const ariaLabel = useMemo(
    () => `Message de ${role === 'user' ? 'vous' : 'TITANE∞'}`,
    [role]
  );

  // Handler pour retry avec état loading
  const handleRetry = React.useCallback(async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      // Reset après un délai pour permettre de voir l'état
      setTimeout(() => setIsRetrying(false), 500);
    }
  }, [onRetry, isRetrying]);

  // Handler pour copier le diagnostic
  const handleCopyDiagnostic = React.useCallback((diagnostic: string) => {
    navigator.clipboard?.writeText(diagnostic).catch(console.error);
  }, []);

  // Contenu du message avec markdown amélioré et fallback UI
  const messageContent = useMemo(() => {
    if (role === 'assistant') {
      // Si retry en cours, afficher état loading
      if (isRetrying) {
        return (
          <div className="message-retry-loading">
            <TypingIndicator />
            <span className="message-retry-text">Nouvelle tentative en cours...</span>
          </div>
        );
      }

      // Si le message a du contenu, l'afficher avec markdown
      if (content && content.trim().length > 0) {
        return <MarkdownContent content={content} />;
      }

      // Si le message est vide mais récent (< 3s), afficher le typing indicator
      const messageAge = Date.now() - timestamp;
      if (messageAge < 3000) {
        return <TypingIndicator />;
      }

      // Message vide et ancien = erreur → Utiliser ChatFallback
      return (
        <ChatFallback
          reason="empty-response"
          traceId={metadata?.traceId as string | undefined}
          timestamp={timestamp}
          provider={metadata?.provider as string | undefined}
          mode={metadata?.mode as string | undefined}
          pipelineState={metadata?.pipelineState as string | undefined}
          onRetry={onRetry ? handleRetry : undefined}
          onCopyDiagnostic={handleCopyDiagnostic}
          className="message-bubble-fallback"
        />
      );
    }
    return content;
  }, [
    role,
    content,
    timestamp,
    isRetrying,
    metadata,
    onRetry,
    handleRetry,
    handleCopyDiagnostic,
  ]);

  return (
    <div className={bubbleClasses} role="article" aria-label={ariaLabel}>
      <div className="message-bubble-avatar">{AVATARS[role]}</div>

      <div className="message-bubble-content">
        <div className="message-bubble-header">
          <span className="message-bubble-author">{AUTHOR_NAMES[role]}</span>
          <span className="message-bubble-time">{formattedTime}</span>
          {/* XP Quality tier badge for user messages */}
          {role === 'user' && typeof metadata?.qualityTier === 'string' && (
            <span
              className={`message-xp-badge message-xp-badge-${metadata.qualityTier as string}`}
              data-testid={`message-xp-badge-${timestamp}`}
              title={`Qualité: ${metadata.qualityTier as string} (+${String(metadata.xpAwarded ?? '?')} XP)`}
              aria-label={`Points XP: qualité ${metadata.qualityTier as string}`}
            >
              {metadata.qualityTier === 'exceptional' && '🌟'}
              {metadata.qualityTier === 'excellent' && '⭐'}
              {metadata.qualityTier === 'good' && '✨'}
              {metadata.qualityTier === 'basic' && '💬'}
              {metadata.qualityTier === 'minimal' && '·'}
              {' +'}
              {String(metadata.xpAwarded ?? '5')} XP
            </span>
          )}
          {/* LOCK1 — PROVIDER_DISPLAY_TRUTH: actual provider from backend, not localStorage */}
          {role === 'assistant' && typeof metadata?.providerUsed === 'string' && (
            <span
              className={`message-provider-badge${
                typeof metadata.requestedProvider === 'string' &&
                metadata.requestedProvider !== 'auto' &&
                metadata.providerUsed !== metadata.requestedProvider
                  ? ' message-provider-badge-mismatch'
                  : ''
              }`}
              data-testid={`message-provider-badge-${timestamp}`}
              title={`Fournisseur réel: ${metadata.providerUsed}`}
              aria-label={`Fournisseur utilisé: ${metadata.providerUsed as string}`}
            >
              {metadata.providerUsed as string}
              {typeof metadata.requestedProvider === 'string' &&
                metadata.requestedProvider !== 'auto' &&
                metadata.providerUsed !== metadata.requestedProvider && (
                  <span
                    className="message-provider-mismatch-indicator"
                    data-testid={`message-provider-mismatch-${timestamp}`}
                    title={`Demandé: ${metadata.requestedProvider}, fallback: ${metadata.providerUsed as string}`}
                    aria-label={`Avertissement: demandé ${metadata.requestedProvider}, utilisé ${metadata.providerUsed as string}`}
                  >
                    {' '}
                    ⚠
                  </span>
                )}
            </span>
          )}
        </div>

        <div className="message-bubble-text">{messageContent}</div>

        {role === 'assistant' &&
          content &&
          content.trim().length > 0 &&
          speechState.canPlay && (
            <div
              className="message-bubble-audio"
              data-testid={`message-tts-controls-${timestamp}`}
            >
              <div
                className={`message-bubble-audio-status message-bubble-audio-status-${speechState.status}`}
                data-testid={`message-tts-status-${timestamp}`}
              >
                {getSpeechStatusLabel(
                  speechState.status,
                  speechState.provider,
                  speechState.error
                )}
              </div>

              <div className="message-bubble-audio-actions">
                {(speechState.status === 'idle' ||
                  speechState.status === 'completed' ||
                  speechState.status === 'stopped' ||
                  speechState.status === 'error') && (
                  <button
                    type="button"
                    className="message-bubble-audio-button message-bubble-audio-button-primary"
                    onClick={() => {
                      void messageSpeechController.playMessage(messageId, content);
                    }}
                    data-testid={`message-tts-read-${timestamp}`}
                  >
                    {speechState.status === 'completed' ||
                    speechState.status === 'stopped'
                      ? 'Relire'
                      : 'Lire à haute voix'}
                  </button>
                )}

                {speechState.status === 'loading' && (
                  <button
                    type="button"
                    className="message-bubble-audio-button"
                    disabled
                    data-testid={`message-tts-loading-${timestamp}`}
                  >
                    Préparation audio...
                  </button>
                )}

                {speechState.status === 'speaking' && speechState.supportsPause && (
                  <button
                    type="button"
                    className="message-bubble-audio-button"
                    onClick={() => {
                      void messageSpeechController.pause();
                    }}
                    data-testid={`message-tts-pause-${timestamp}`}
                  >
                    Pause
                  </button>
                )}

                {speechState.status === 'paused' && (
                  <button
                    type="button"
                    className="message-bubble-audio-button"
                    onClick={() => {
                      void messageSpeechController.resume();
                    }}
                    data-testid={`message-tts-resume-${timestamp}`}
                  >
                    Reprendre
                  </button>
                )}

                {(speechState.status === 'loading' ||
                  speechState.status === 'speaking' ||
                  speechState.status === 'paused') && (
                  <button
                    type="button"
                    className="message-bubble-audio-button message-bubble-audio-button-secondary"
                    onClick={() => {
                      void messageSpeechController.stop();
                    }}
                    data-testid={`message-tts-stop-${timestamp}`}
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          )}

        {/* Sprint 6 Phase 3: Message Reactions */}
        {role === 'assistant' && content && content.trim().length > 0 && (
          <MessageReactions messageTimestamp={timestamp} compact />
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
