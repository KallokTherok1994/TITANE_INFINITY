/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.1 — CHAT PAGE OPTIMISÉE
 *   Chat IA avec markdown, status bar, voice mode
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from '../../components/chat/MessageList';
import { ChatInput } from '../../components/chat/ChatInput';
import './styles/Chat.css';

interface ProviderStatus {
  name: string;
  status: 'online' | 'offline' | 'connecting';
  latency?: number;
}

export const Chat: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const [showSettings, setShowSettings] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  
  // TODO: Implémenter la récupération dynamique du provider status
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [providerStatus, _setProviderStatus] = useState<ProviderStatus>({
    name: 'Gemini',
    status: 'online',
    latency: 245
  });

  const handleClearChat = () => {
    if (messages.length === 0) return;
    
    if (window.confirm('Effacer tout l\'historique du chat ?')) {
      clearChat();
    }
  };

  const toggleVoiceMode = () => {
    setVoiceModeActive(!voiceModeActive);
  };

  return (
    <div className="chat-page">
      {/* Enhanced Header with Status Bar */}
      <div className="chat-header">
        <div className="chat-header-main">
          <div className="chat-header-info">
            <div className="chat-header-icon">💬</div>
            <div className="chat-header-text">
              <h1 className="chat-header-title">Chat IA TITANE∞</h1>
              <p className="chat-header-subtitle">
                Intelligence artificielle cognitive avancée
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            <button
              className="chat-action-btn"
              onClick={handleClearChat}
              disabled={messages.length === 0}
              title="Effacer le chat"
              aria-label="Effacer l'historique du chat"
            >
              🗑️
            </button>
            <button
              className="chat-action-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Paramètres"
              aria-label="Ouvrir les paramètres"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="chat-status-bar">
          <div className="chat-status-item">
            <span className={`status-indicator status-${providerStatus.status}`} 
                  aria-label={`Provider ${providerStatus.status}`} />
            <span className="status-label">Provider:</span>
            <span className="status-value">{providerStatus.name}</span>
          </div>
          
          {providerStatus.latency && (
            <div className="chat-status-item">
              <span className="status-label">Latence:</span>
              <span className="status-value">{providerStatus.latency}ms</span>
            </div>
          )}

          <div className="chat-status-item">
            <span className="status-label">Messages:</span>
            <span className="status-value">{messages.length}</span>
          </div>

          {voiceModeActive && (
            <div className="chat-status-item chat-status-voice">
              <span className="status-icon">🎤</span>
              <span className="status-label">Voice Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-content">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Enhanced Input with Voice Button */}
      <div className="chat-footer">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          voiceModeActive={voiceModeActive}
          onToggleVoiceMode={toggleVoiceMode}
          placeholder={
            isLoading
              ? '🤖 TITANE∞ génère une réponse...'
              : voiceModeActive
              ? '🎤 Mode vocal actif - Parlez...'
              : '✨ Posez votre question...'
          }
        />
      </div>

      {/* Settings Panel (Modal) */}
      {showSettings && (
        <div className="chat-settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="chat-settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="chat-settings-header">
              <h2 className="chat-settings-title">Paramètres du Chat</h2>
              <button
                className="chat-settings-close"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>

            <div className="chat-settings-content">
              <div className="chat-setting-item">
                <label className="chat-setting-label">Provider IA</label>
                <div className="chat-setting-value">
                  Gemini → Ollama → Fallback (Auto)
                </div>
              </div>

              <div className="chat-setting-item">
                <label className="chat-setting-label">Modèle</label>
                <div className="chat-setting-value">
                  gemini-pro / llama2
                </div>
              </div>

              <div className="chat-setting-item">
                <label className="chat-setting-label">Messages en mémoire</label>
                <div className="chat-setting-value">
                  {messages.length} messages
                </div>
              </div>

              <div className="chat-setting-item">
                <label className="chat-setting-label">Configuration</label>
                <div className="chat-setting-value">
                  Voir .env pour VITE_GEMINI_API_KEY
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
