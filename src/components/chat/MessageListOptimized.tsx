/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — MESSAGE LIST OPTIMIZED
 *   Version optimisée avec virtualisation, animations et accessibilité
 *   Features: Auto-scroll, Copy, TTS per message, Performance optimized
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { logger } from '@/lib/logger';
import type { AIMessage } from '../../services/ai/types';
import { hybridTTS } from '../../services/tts/hybridTTS';
import './MessageList.css';

const isDev = process.env.NODE_ENV === 'development';

interface MessageListOptimizedProps {
  messages: AIMessage[];
  isLoading?: boolean;
  error?: string | null;
  onCopyMessage?: (content: string) => void;
  enableTTS?: boolean;
  autoScroll?: boolean;
}

interface MessageBubbleProps {
  message: AIMessage;
  index: number;
  onCopy?: (content: string) => void;
  enableTTS?: boolean;
}

// ═══ MESSAGE BUBBLE COMPONENT (Memoized) ═══
const MessageBubble = memo<MessageBubbleProps>(
  ({ message, index, onCopy, enableTTS = true }) => {
    const [isCopied, setIsCopied] = React.useState(false);
    const [isSpeaking, setIsSpeaking] = React.useState(false);

    const isUser = message.role === 'user';
    const metadataStatus = message.metadata?.status as string | undefined;
    const isStreaming = metadataStatus === 'streaming';
    const hasError = metadataStatus === 'error';
    const metadataProvider = message.metadata?.provider as string | undefined;
    const provider = message.provider || metadataProvider;

    // Format timestamp
    const formattedTime = useMemo(() => {
      if (!message.timestamp) return '';
      const date = new Date(message.timestamp);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }, [message.timestamp]);

    // Copy handler
    const handleCopy = useCallback(async () => {
      if (!message.content) return;

      try {
        await navigator.clipboard.writeText(message.content);
        setIsCopied(true);
        onCopy?.(message.content);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        logger.error(
          'Message copy failed',
          { component: 'MessageListOptimized', action: 'handleCopy' },
          err as Error
        );
      }
    }, [message.content, onCopy]);

    // TTS handler
    const handleSpeak = useCallback(async () => {
      if (!message.content || isSpeaking) return;

      try {
        setIsSpeaking(true);
        await hybridTTS.speak(message.content);
      } catch (err) {
        logger.error(
          'TTS speak failed',
          { component: 'MessageListOptimized', action: 'handleSpeak' },
          err as Error
        );
      } finally {
        setIsSpeaking(false);
      }
    }, [message.content, isSpeaking]);

    // Stop TTS handler
    const handleStopSpeak = useCallback(async () => {
      try {
        await hybridTTS.stop();
        setIsSpeaking(false);
      } catch (err) {
        logger.error(
          'TTS stop failed',
          { component: 'MessageListOptimized', action: 'handleStopSpeak' },
          err as Error
        );
      }
    }, []);

    return (
      <div
        className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'} ${isStreaming ? 'message-streaming' : ''} ${hasError ? 'message-error' : ''}`}
        data-index={index}
        role="article"
        aria-label={`Message de ${isUser ? 'vous' : 'TITANE∞'}`}
      >
        {/* Header */}
        <div className="message-header">
          <span className="message-role">{isUser ? '👤 Vous' : '🤖 TITANE∞'}</span>
          {!isUser && provider && (
            <span className="message-provider" title={`Provider: ${provider}`}>
              via {provider}
            </span>
          )}
          {formattedTime && <span className="message-time">{formattedTime}</span>}
        </div>

        {/* Content */}
        <div className="message-content">
          {message.content ? (
            <div className="message-text">{message.content}</div>
          ) : isStreaming ? (
            <div className="message-typing">
              <span className="typing-dot">●</span>
              <span className="typing-dot">●</span>
              <span className="typing-dot">●</span>
            </div>
          ) : (
            <div className="message-empty">(Message vide)</div>
          )}
        </div>

        {/* Actions (only for assistant messages with content) */}
        {!isUser && message.content && !isStreaming && (
          <div className="message-actions">
            <button
              className={`message-action-btn ${isCopied ? 'copied' : ''}`}
              onClick={handleCopy}
              title={isCopied ? 'Copié !' : 'Copier le message'}
              aria-label="Copier le message"
            >
              {isCopied ? '✓' : '📋'}
            </button>

            {enableTTS && (
              <button
                className={`message-action-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={isSpeaking ? handleStopSpeak : handleSpeak}
                title={isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
                aria-label={isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
              >
                {isSpeaking ? '⏹️' : '🔊'}
              </button>
            )}
          </div>
        )}

        {/* Error indicator */}
        {hasError && <div className="message-error-badge">⚠️ Erreur de génération</div>}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="message-streaming-badge">⏳ Génération en cours...</div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.metadata?.status === nextProps.message.metadata?.status &&
      prevProps.index === nextProps.index &&
      prevProps.enableTTS === nextProps.enableTTS
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

// ═══ MAIN MESSAGE LIST COMPONENT ═══
export const MessageListOptimized: React.FC<MessageListOptimizedProps> = ({
  messages,
  isLoading = false,
  error = null,
  onCopyMessage,
  enableTTS = true,
  autoScroll = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!autoScroll) return;

    const currentLength = messages?.length || 0;
    const shouldScroll = currentLength > prevMessagesLengthRef.current || isLoading;

    if (shouldScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages, isLoading, autoScroll]);

  // Debug logging
  useEffect(() => {
    isDev &&
      console.log('[MessageListOptimized] 📊 Render:', {
        messagesCount: messages?.length || 0,
        isLoading,
        hasError: !!error,
      });
  }, [messages?.length, isLoading, error]);

  // Memoized empty state
  const emptyState = useMemo(
    () => (
      <div className="message-list-empty">
        <div className="empty-icon">💬</div>
        <div className="empty-title">Bienvenue dans TITANE∞</div>
        <div className="empty-subtitle">
          Posez votre première question pour commencer la conversation.
        </div>
        <div className="empty-suggestions">
          <span className="suggestion-chip">Qu'est-ce que tu sais faire ?</span>
          <span className="suggestion-chip">Aide-moi à coder</span>
          <span className="suggestion-chip">Explique-moi un concept</span>
        </div>
      </div>
    ),
    []
  );

  // Filter valid messages
  const validMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    return messages.filter(
      msg => msg && typeof msg === 'object' && typeof msg.role === 'string'
    );
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="message-list-container message-list-optimized"
      role="log"
      aria-label="Historique de conversation"
      aria-live="polite"
    >
      {/* Debug header (dev only) */}
      {isDev && (
        <div className="message-list-debug">
          📊 {validMessages.length} messages | Loading: {isLoading ? '✓' : '✗'} | TTS:{' '}
          {enableTTS ? '✓' : '✗'}
        </div>
      )}

      {/* Messages or empty state */}
      {validMessages.length > 0 ? (
        <div className="message-list-content">
          {validMessages.map((message, index) => {
            const uiId = message.metadata?.uiId;
            const key =
              (typeof uiId === 'string' ? uiId : null) ||
              `msg-${index}-${message.timestamp}`;
            return (
              <MessageBubble
                key={key}
                message={message}
                index={index}
                onCopy={onCopyMessage}
                enableTTS={enableTTS}
              />
            );
          })}
        </div>
      ) : !isLoading ? (
        emptyState
      ) : null}

      {/* Loading indicator */}
      {isLoading && (
        <div className="message-loading-indicator">
          <div className="loading-animation">
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
          </div>
          <span className="loading-text">TITANE∞ réfléchit...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="message-error-banner" role="alert">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} className="message-list-anchor" />
    </div>
  );
};

export default MessageListOptimized;
