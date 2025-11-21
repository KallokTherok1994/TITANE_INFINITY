/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — MESSAGE LIST COMPONENT
 *   Liste scrollable des messages avec auto-scroll et états
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import type { AIMessage } from '../../services/ai/types';
import './MessageList.css';

interface MessageListProps {
  messages: AIMessage[];
  isLoading?: boolean;
  error?: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  error = null,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  // État vide
  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className="message-list-container" ref={containerRef}>
        <div className="message-list-empty">
          <div className="message-list-empty-icon">💬</div>
          <h3 className="message-list-empty-title">
            Bienvenue dans TITANE∞ Chat IA
          </h3>
          <p className="message-list-empty-text">
            Commencez une conversation. Le système sélectionnera automatiquement
            le meilleur provider IA pour vos besoins.
          </p>
          <div className="message-list-empty-providers">
            <span className="provider-badge">🌟 Gemini API</span>
            <span className="provider-badge">🤖 Ollama Local</span>
          </div>
        </div>
        <div ref={endRef} />
      </div>
    );
  }

  return (
    <div className="message-list-container" ref={containerRef}>
      <div className="message-list">
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.timestamp}-${index}`}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            isLatest={index === messages.length - 1}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="message-loading" role="status" aria-live="polite" aria-label="TITANE∞ est en train d'écrire">
            <div className="message-loading-avatar">
              <div className="message-avatar-ai">
                <span className="message-avatar-icon">🤖</span>
              </div>
            </div>
            <div className="message-loading-content">
              <div className="message-loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <span className="message-loading-text">TITANE∞ génère une réponse...</span>
            </div>
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className="message-error">
            <div className="message-error-icon">⚠️</div>
            <div className="message-error-content">
              <strong>Erreur</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
};

export default MessageList;
