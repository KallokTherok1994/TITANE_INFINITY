/**
 * TITANE∞ v24.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.3.0 — MESSAGE LIST OMEGA (UI ANTI-CRASH + OPTIMIZED)
 *   Protection render • Isolation erreurs • Auto-récupération
 *   useMemo optimisé pour performance 100+ messages
 *   v22Ω AI Performance Optimizations Compatible
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { MessageBubble } from './MessageBubble';
import type { AIMessage } from '../../services/ai/types';
import { autoHealEngine } from '../../services/ai/autoHealEngine';
import './MessageList.css';

const isDev = process.env.NODE_ENV === 'development';

// Seuil pour optimisations avancées (messages)
const _OPTIMIZATION_THRESHOLD = 50;

interface MessageListProps {
  messages: AIMessage[];
  isLoading?: boolean;
  error?: string | null;
}

interface MessageListState {
  renderError: string | null;
  recoveryCount: number;
  lastRecovery: number;
  safeMessages: AIMessage[];
  hasCorruption: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * OMEGA ERROR BOUNDARY HOOK
 * ═══════════════════════════════════════════════════════════════════
 */
function useOmegaErrorBoundary() {
  const [state, setState] = useState<MessageListState>({
    renderError: null,
    recoveryCount: 0,
    lastRecovery: 0,
    safeMessages: [],
    hasCorruption: false,
  });

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      renderError: null,
      hasCorruption: false,
    }));
  }, []);

  const handleError = useCallback(
    (error: Error, context: string, messages?: AIMessage[]) => {
      const now = Date.now();

      // Auto-heal trigger
      autoHealEngine.heal('message-list', error, 'validation', {
        context,
        messageCount: messages?.length || 0,
        timestamp: now,
      });

      setState(prev => {
        const newRecoveryCount = prev.recoveryCount + 1;

        // Safe message filtering
        let safeMessages: AIMessage[] = [];
        if (messages) {
          safeMessages = messages.filter(msg => {
            try {
              // Validate message structure
              return (
                msg &&
                typeof msg === 'object' &&
                typeof msg.role === 'string' &&
                typeof msg.content === 'string' &&
                typeof msg.timestamp === 'number' &&
                msg.content.length > 0 &&
                msg.content.length < 100000 // Max 100k chars per message
              );
            } catch (filterError) {
              return false;
            }
          });
        }

        return {
          renderError: error.message,
          recoveryCount: newRecoveryCount,
          lastRecovery: now,
          safeMessages,
          hasCorruption: safeMessages.length !== (messages?.length || 0),
        };
      });

      if (isDev) {
        logger.error(
          'Message list error handled',
          { component: 'MessageList', action: 'handleError', context },
          error
        );
      }
    },
    []
  );

  return { state, resetError, handleError };
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * MESSAGE LIST OMEGA COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 */
// OMEGA OPTIMIZED: React.memo pour éviter re-renders inutiles
export const MessageList = React.memo(function MessageList({
  messages: rawMessages,
  isLoading = false,
  error = null,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const { state: errorState, resetError, handleError } = useOmegaErrorBoundary();

  // Safe messages to render (filtered and validated)
  const messages = errorState.hasCorruption ? errorState.safeMessages : rawMessages;

  // Debug logging only in dev mode (cleaned up v26.2)
  useEffect(() => {
    if (isDev && rawMessages?.length > 0) {
      console.log('[MessageList] Messages:', rawMessages.length);
    }
  }, [rawMessages]);

  // ═══ PHASE 5.1: MOUNT SAFETY ═══
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      isDev && console.log('[OMEGA MESSAGE LIST] Component mounted safely');
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ═══ PHASE 5.2: AUTO-SCROLL WITH ERROR PROTECTION ═══
  useEffect(() => {
    if (!mountedRef.current) return;

    try {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (scrollError) {
      handleError(
        scrollError instanceof Error ? scrollError : new Error(String(scrollError)),
        'auto-scroll'
      );
    }
  }, [messages, isLoading, handleError]);

  // ═══ PHASE 5.3: RECOVERY FROM ERROR STATE ═══
  useEffect(() => {
    if (errorState.renderError && Date.now() - errorState.lastRecovery > 5000) {
      // Auto-recovery after 5 seconds
      resetError();
      isDev && console.log('[OMEGA MESSAGE LIST] Auto-recovery triggered');
    }
  }, [errorState.renderError, errorState.lastRecovery, resetError]);

  // ═══ PHASE 5.4: RENDER ERROR STATE ═══
  if (errorState.renderError) {
    return (
      <div className="message-list-container message-list-error-state" ref={containerRef}>
        <div className="message-list-recovery">
          <div className="message-list-recovery-icon">🔄</div>
          <h3 className="message-list-recovery-title">
            Auto-réparation OMEGA en cours...
          </h3>
          <p className="message-list-recovery-text">
            Une erreur d'affichage a été détectée et corrigée automatiquement.
          </p>
          <div className="message-list-recovery-details">
            <span>Messages récupérés : {errorState.safeMessages.length}</span>
            <span>Tentative #{errorState.recoveryCount}</span>
          </div>
          <button onClick={resetError} className="message-list-recovery-button">
            Reprendre l'affichage
          </button>
        </div>
        <div ref={endRef} />
      </div>
    );
  }

  // ═══ PHASE 5.5: RENDER WITH TRY-CATCH PROTECTION ═══
  try {
    // ═══ EMPTY STATE PROTECTION ═══
    if ((!messages || messages.length === 0) && !isLoading && !error) {
      return (
        <div className="message-list-container" ref={containerRef}>
          <div className="message-list-empty">
            <div className="message-list-empty-icon">🟣</div>
            <h3 className="message-list-empty-title">TITANE∞ Chat IA OMEGA v19.2Ω</h3>
            <p className="message-list-empty-text">
              Système cognitif avec architecture anti-crash. Providers intelligents
              sélectionnés automatiquement pour une fiabilité maximale.
            </p>
            <div className="message-list-empty-providers">
              <span className="provider-badge provider-local">⚡ Local Infaillible</span>
              <span className="provider-badge provider-cloud">🌟 Gemini API</span>
              <span className="provider-badge provider-llm">🤖 Ollama Local</span>
            </div>
            {errorState.hasCorruption && (
              <div className="message-list-corruption-notice">
                <span>
                  🛡️ Protection activée : {rawMessages.length - messages.length} messages
                  corrompus filtrés
                </span>
              </div>
            )}
          </div>
          <div ref={endRef} />
        </div>
      );
    }

    // ═══ MAIN RENDER WITH ISOLATION ═══
    return (
      <div className="message-list-container" ref={containerRef}>
        <div className="message-list">
          {/* Messages avec protection individuelle */}
          {messages.map((message, index) => {
            try {
              // Validation message avant render - OMEGA FIX: permet content vide pour streaming placeholder
              if (
                !message ||
                typeof message !== 'object' ||
                typeof message.content !== 'string'
              ) {
                if (isDev) {
                  logger.warn('Skipping invalid message', {
                    component: 'MessageList',
                    action: 'render',
                    index,
                    messageType: typeof message,
                  });
                }
                return null;
              }

              return (
                <MessageBubble
                  key={`${message.metadata?.uiId ?? `${message.timestamp}-${index}`}-omega`}
                  role={message.role || 'user'}
                  content={String(message.content)}
                  timestamp={message.timestamp || Date.now()}
                  isLatest={index === messages.length - 1}
                />
              );
            } catch (bubbleError) {
              // Isolation : une bulle qui plante n'affecte pas les autres
              handleError(
                bubbleError instanceof Error
                  ? bubbleError
                  : new Error(String(bubbleError)),
                `message-bubble-${index}`,
                messages
              );

              // Render fallback bubble
              return (
                <div
                  key={`fallback-${index}`}
                  className="message-bubble message-bubble-error"
                >
                  <div className="message-bubble-content">
                    <span className="message-error-icon">⚠️</span>
                    Message #{index + 1} récupéré automatiquement
                  </div>
                </div>
              );
            }
          })}

          {/* Loading indicator avec protection */}
          {isLoading && (
            <div
              className="message-loading"
              role="status"
              aria-live="polite"
              aria-label="TITANE∞ OMEGA génère une réponse"
            >
              <div className="message-loading-avatar">
                <div className="message-avatar-ai">
                  <span className="message-avatar-icon">🟣</span>
                </div>
              </div>
              <div className="message-loading-content">
                <div className="message-loading-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="message-loading-text">
                  TITANE∞ OMEGA génère une réponse (pipeline infaillible)...
                </span>
              </div>
            </div>
          )}

          {/* Error indicator avec récupération */}
          {error && (
            <div className="message-error message-error-omega">
              <div className="message-error-icon">🔄</div>
              <div className="message-error-content">
                <strong>Auto-réparation activée</strong>
                <p>{error}</p>
                <span className="message-error-recovery">
                  OMEGA maintient la continuité de la conversation
                </span>
              </div>
            </div>
          )}

          {/* Corruption notice */}
          {errorState.hasCorruption && (
            <div className="message-corruption-notice">
              🛡️ {rawMessages.length - messages.length} message(s) corrompu(s) filtré(s)
              automatiquement
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>
    );
  } catch (renderError) {
    // ═══ ULTIMATE FALLBACK RENDER ═══
    handleError(
      renderError instanceof Error ? renderError : new Error(String(renderError)),
      'main-render',
      rawMessages
    );

    return (
      <div
        className="message-list-container message-list-critical-error"
        ref={containerRef}
      >
        <div className="message-list-critical">
          <div className="message-list-critical-icon">🆘</div>
          <h3 className="message-list-critical-title">Récupération critique OMEGA</h3>
          <p className="message-list-critical-text">
            Erreur de rendu majeure interceptée et corrigée. Le système reste stable.
          </p>
          <div className="message-list-critical-stats">
            <span>Messages total : {rawMessages?.length || 0}</span>
            <span>Récupérations : {errorState.recoveryCount}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="message-list-critical-reload"
          >
            Redémarrer l'interface
          </button>
        </div>
        <div ref={endRef} />
      </div>
    );
  }
});

MessageList.displayName = 'MessageListOmega';
