/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v15 - ChatWindow Component
// Main chat interface with messages, input, and status

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { useConnection } from '../hooks/useConnection';
import { MessageBubble } from './MessageBubble';
import { StatusIndicator } from './StatusIndicator';
import { VitalsPanel } from './VitalsPanel';
import { ChatFileImport } from './chat/ChatFileImport';
import { useSingularityState } from '../core/state/SingularityState';
import type { Message } from '../core/ARCHITECTURE_TYPES_v∞';
import './ChatWindow.css';

export interface ChatWindowProps {
  onVoiceModeToggle?: () => void;
  voiceModeActive?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = React.memo(({
  onVoiceModeToggle,
  voiceModeActive = false,
}) => {
  const { messages, isLoading, error, sendMessage, currentMode, anomalyCount: _anomalyCount } = useChat({ voiceEnabled: voiceModeActive });
  const { status: connectionStatus } = useConnection();
  const setAIStatus = useSingularityState((state) => state.setAIStatus);
  const setAIError = useSingularityState((state) => state.setAIError);
  // CPU load removed - not in SingularityFrontendState (use useVitals for system metrics)

  const [input, setInput] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [showFileImport, setShowFileImport] = useState(false);
  const [_lastLatency, _setLastLatency] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendWithRetry = useCallback(async (prompt: string, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        setAIStatus('processing');

        // Timeout après 30s
        const timeoutPromise = new Promise((_, reject) => {
          timeoutRef.current = setTimeout(() => reject(new Error('Timeout')), 30000);
        });

        await Promise.race([sendMessage(prompt), timeoutPromise]);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setAIStatus('idle');
        setAIError(null);
        return;
      } catch (err) {
        console.warn(`Tentative ${attempt + 1}/${retries} échouée:`, err);

        if (attempt < retries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        } else {
          // Fallback local après 3 échecs
          setAIError('Modèle distant indisponible. Basculer sur Ollama local?');
          setAIStatus('error');
        }
      }
    }
  }, [sendMessage, setAIStatus, setAIError]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || retrying) return;

    const prompt = input.trim();
    setInput('');

    setRetrying(true);
    await handleSendWithRetry(prompt);
    setRetrying(false);
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
            provider={connectionStatus.provider as 'Gemini' | 'Ollama' | 'Offline'}
            health={connectionStatus.online ? 1 : 0.3}
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

      {/* VitalsPanel - System Status */}
      <VitalsPanel
        currentMode={currentMode}
        messagesCount={messages.length}
      />

      <div className="chat-messages">\n        {messages.length === 0 && (
          <div className="chat-welcome">
            <h3>Bienvenue dans TITANE∞</h3>
            <p>
              Chat IA hybride avec Gemini & Ollama
              <br />
              Mode {currentMode} actif • Mémoire par mode • TTS intégré
            </p>
          </div>
        )}

        {messages
          .filter((message) => message.role !== 'system')
          .map((message) => (
            <MessageBubble key={message.timestamp} message={message as Message} />
          ))}

        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-indicator-label">TITANE réfléchit...</div>
            <div className="typing-indicator-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showFileImport && (
        <div className="chat-file-import-section">
          <ChatFileImport
            onFileAnalyzed={(analysis) => {
              console.log('✅ Fichier analysé:', analysis);
              // Injecte résumé fichier dans input
              setInput(
                `Analyse ce fichier:

**${analysis.filename}** (${analysis.lines} lignes, ${analysis.wordCount} mots)

Contenu:
\`\`\`
${analysis.summary}
\`\`\`

Que peux-tu en dire?`
              );
              setShowFileImport(false);
              // Award +20 XP Memory (si backend disponible)
              console.log('🎁 +20 XP Memory (fichier analysé)');
            }}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="chat-input-container">
        <button
          className="file-import-button"
          onClick={() => setShowFileImport(!showFileImport)}
          disabled={isLoading}
          title="Importer un fichier"
        >
          📎
        </button>
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
});

ChatWindow.displayName = 'ChatWindow';
