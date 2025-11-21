/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15.8 — CHAT IA PAGE (COMPLETE)
 *   Interface Chat complète avec IA, streaming, memory, XP
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { AIMessageBubble } from '../components/AIMessageBubble';
import { ChatInput } from '../components/ChatInput';
import './Chat.css';

export const Chat: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = () => {
    if (confirm('Effacer tout l\'historique de conversation ?')) {
      clearChat();
    }
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-page__header">
        <div className="chat-page__header-left">
          <div className="chat-page__icon">🤖</div>
          <div className="chat-page__title-block">
            <h1 className="chat-page__title">TITANE∞ Chat IA</h1>
            <p className="chat-page__subtitle">
              Assistant cognitif avancé — Gemini & Ollama
            </p>
          </div>
        </div>

        <div className="chat-page__header-actions">
          <button
            className="chat-page__action-btn chat-page__action-btn--clear"
            onClick={handleClearChat}
            title="Effacer l'historique"
          >
            🗑️ Effacer
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-page__messages">
        {messages.length === 0 ? (
          <div className="chat-page__welcome">
            <div className="chat-page__welcome-icon">🌟</div>
            <h2 className="chat-page__welcome-title">Bienvenue dans TITANE∞ Chat</h2>
            <p className="chat-page__welcome-text">
              Je suis ton assistant IA intégré. Pose-moi tes questions sur :
            </p>
            <div className="chat-page__suggestions">
              <button
                className="chat-page__suggestion"
                onClick={() => sendMessage('Explique-moi le fonctionnement de TITANE∞')}
              >
                💡 Fonctionnement de TITANE∞
              </button>
              <button
                className="chat-page__suggestion"
                onClick={() => sendMessage('Quels sont les modules actifs ?')}
              >
                ⚙️ Modules actifs
              </button>
              <button
                className="chat-page__suggestion"
                onClick={() => sendMessage('Comment optimiser mes performances ?')}
              >
                🚀 Optimisation
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <AIMessageBubble key={`${message.timestamp}-${index}`} message={message} />
            ))}

            {isLoading && (
              <div className="chat-page__loading">
                <div className="chat-page__loading-icon">
                  <span className="chat-page__loading-dot"></span>
                  <span className="chat-page__loading-dot"></span>
                  <span className="chat-page__loading-dot"></span>
                </div>
                <span className="chat-page__loading-text">TITANE∞ réfléchit...</span>
              </div>
            )}

            {error && (
              <div className="chat-page__error">
                <span className="chat-page__error-icon">⚠️</span>
                <span className="chat-page__error-text">{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;
