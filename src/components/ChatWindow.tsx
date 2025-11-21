// TITANE∞ v12 - ChatWindow Component
// Main chat interface with messages, input, and status

import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../hooks/useAI';
import { useConnection } from '../hooks/useConnection';
import { MessageBubble } from './MessageBubble';
import { StatusIndicator } from './StatusIndicator';
// No CSS import needed - styles are global

export interface ChatWindowProps {
  onVoiceModeToggle?: () => void;
  voiceModeActive?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onVoiceModeToggle,
  voiceModeActive = false,
}) => {
  const { messages, isLoading, error, status, query, checkHealth } = useAI();
  const { status: connectionStatus } = useConnection();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check health on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const prompt = input.trim();
    setInput('');

    await query(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>TITANE∞ Chat IA</h2>
        <div className="chat-header-actions">
          <StatusIndicator
            online={connectionStatus.online}
            provider={connectionStatus.provider}
            health={status.health}
          />
          {onVoiceModeToggle && (
            <button
              className={`voice-mode-toggle ${voiceModeActive ? 'active' : ''}`}
              onClick={onVoiceModeToggle}
              title="Toggle Voice Mode"
            >
              🎤
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <h3>Bienvenue dans TITANE∞</h3>
            <p>
              Chat IA hybride avec Gemini & Ollama
              <br />
              Mode offline garanti • Mémoire cryptée • TTS intégré
            </p>
          </div>
        )}

        {messages.filter((message) => message.role !== 'system').map((message) => (
          <MessageBubble key={message.id} message={message as any} />
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {error && (
          <div className="chat-error">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question... (Shift+Enter pour nouvelle ligne)"
          rows={1}
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? '⏳' : '📨'}
        </button>
      </div>
    </div>
  );
};
