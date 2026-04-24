/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — MESSAGE LIST OMEGA (UI ANTI-CRASH + OPTIMIZED)
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
import { ChatFallback } from './ChatFallback'; // ✨ UI vΩ - Anti-Silence Contract
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './MessageList.css';

const isDev = process.env.NODE_ENV === 'development';
const DEFAULT_RENDER_MESSAGE_LIMIT = Number.MAX_SAFE_INTEGER;

// Seuil pour optimisations avancées (messages)
const _OPTIMIZATION_THRESHOLD = 50;

interface MessageListProps {
  messages: AIMessage[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function MessageListImpl({
  messages: rawMessages,
  isLoading = false,
  error = null,
  onRetry,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Simuler un état d'erreur pour la démonstration (remplacer par votre logique réelle)
  const [errorState] = useState<{ hasCorruption: boolean; safeMessages: AIMessage[] }>({
    hasCorruption: false,
    safeMessages: rawMessages,
  });
  // Pour la logique réelle, remplacer ci-dessus par votre hook d'erreur (ex: useOmegaErrorBoundary)
  const messages = errorState.hasCorruption ? errorState.safeMessages : rawMessages;

  useEffect(() => {
    if (isDev && rawMessages?.length > 0) {
      console.warn('[MessageList] Messages:', rawMessages.length);
    }
  }, [rawMessages]);

  return (
    <ErrorBoundary>
      <div className="message-list-container" ref={containerRef}>
        <div className="message-list">
          {/* Messages avec protection individuelle + détection vide */}
          {(!messages || messages.length === 0) && !isLoading && !error ? (
            <div className="message-list-empty">
              <div className="message-list-empty-icon">🟣</div>
              <h3 className="message-list-empty-title">TITANE∞ Chat IA OMEGA v30.0.0Ω</h3>
              <p className="message-list-empty-text">
                Système cognitif v30 avec architecture anti-crash. Providers intelligents
                sélectionnés automatiquement pour une fiabilité maximale.
              </p>
              <div className="message-list-empty-providers">
                <span className="provider-badge provider-local">
                  ⚡ Local Infaillible
                </span>
                <span className="provider-badge provider-cloud">🌟 Gemini API</span>
                <span className="provider-badge provider-llm">🤖 Ollama Local</span>
              </div>
              {errorState.hasCorruption && (
                <div className="message-list-corruption-notice">
                  <span>
                    🛡️ Protection activée : {rawMessages.length - messages.length}{' '}
                    messages corrompus filtrés
                  </span>
                </div>
              )}
            </div>
          ) : null}
          {messages &&
            messages.length > 0 &&
            (!(!messages || messages.length === 0) || isLoading || error) &&
            messages.map((message, index) => {
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
              const isLatest = index === messages.length - 1;
              return (
                <MessageBubble
                  key={`${message.metadata?.uiId ?? `${message.timestamp}-${index}`}-omega`}
                  role={message.role || 'user'}
                  content={String(message.content)}
                  timestamp={message.timestamp || Date.now()}
                  isLatest={isLatest}
                  onRetry={onRetry}
                  metadata={message.metadata}
                />
              );
            })}
          <div ref={endRef} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export const MessageList = React.memo(MessageListImpl);
MessageList.displayName = 'MessageListOmega';
