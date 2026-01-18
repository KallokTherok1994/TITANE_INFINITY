/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v15 - ChatWindow Component
// Main chat interface with messages, input, and status

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@/lib/logger';
import { useChat } from '../hooks/useChat';
import { useConnection } from '../hooks/useConnection';
import { MessageBubble } from './chat/MessageBubble';
import { StatusIndicator } from './StatusIndicator';
import { VitalsPanel } from './VitalsPanel';
import { ChatFileImport } from './chat/ChatFileImport';
import { useSingularityState } from '../core/state/SingularityState';
import type { Message as _Message } from '../core/ARCHITECTURE_TYPES_v∞';
import { listPromptPresets } from '@/core/prompts';
import type { ChatMode } from '@/services/ai';
import { getMessageText } from '@/services/ai/types';
import './ChatWindow.css';

export interface ChatWindowProps {
  onVoiceModeToggle?: () => void;
  voiceModeActive?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = React.memo(
  ({ onVoiceModeToggle, voiceModeActive = false }) => {
    const {
      messages,
      isLoading,
      error,
      sendMessage,
      currentMode,
      anomalyCount: _anomalyCount,
      setMode,
      uiIntegrity,
      restoreFromVault,
    } = useChat({ voiceEnabled: voiceModeActive });
    const { status: connectionStatus } = useConnection();
    const setAIStatus = useSingularityState(state => state.setAIStatus);
    const setAIError = useSingularityState(state => state.setAIError);
    // CPU load removed - not in SingularityFrontendState (use useVitals for system metrics)

    const [input, setInput] = useState('');
    const [retrying, setRetrying] = useState(false);
    const [showFileImport, setShowFileImport] = useState(false);
    const [_lastLatency, _setLastLatency] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const promptPresets = useMemo(() => listPromptPresets(), []);
    const presetModeMap = useMemo<Partial<Record<string, ChatMode>>>(
      () => ({
        core: 'default',
        guide_deuxieme_vitesse: 'debug_cognitive',
        facilitateur_ecoute: 'journal',
        architecte_projet: 'planning',
        optimiseur_decision: 'planning',
        coach_ancrage: 'journal',
      }),
      []
    );

    // ✨ v24.2.1 FIX: Memoize filtered messages to prevent filter recalculation on every render
    const filteredMessages = useMemo(() => {
      if (!Array.isArray(messages)) return [];
      return messages.filter(message => {
        // Vérifier que le message existe et a un rôle valide
        if (!message || !message.role || !['user', 'assistant'].includes(message.role)) {
          return false;
        }
        
        // Extraire le texte du message (support pour string content et objets complexes)
        const messageText = getMessageText(message);
        
        // Vérifier que le contenu existe et n'est pas vide
        return messageText && messageText.trim().length > 0;
      });
    }, [messages]);

    const handleRestoreHistory = useCallback(() => {
      if (!uiIntegrity?.hasSnapshot) {
        return;
      }
      restoreFromVault();
    }, [restoreFromVault, uiIntegrity?.hasSnapshot]);

    // Auto-scroll to bottom
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendWithRetry = useCallback(
      async (prompt: string, retries = 3) => {
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
            const error = err as Error;
            logger.warn('Chat retry attempt failed', {
              component: 'ChatWindow',
              action: 'handleSendWithRetry',
              attempt: attempt + 1,
              retries,
              error: error.message,
            });

            if (attempt < retries - 1) {
              // Exponential backoff: 1s, 2s, 4s
              await new Promise(resolve =>
                setTimeout(resolve, Math.pow(2, attempt) * 1000)
              );
            } else {
              // Fallback local après 3 échecs
              setAIError('Modèle distant indisponible. Basculer sur Ollama local?');
              setAIStatus('error');
            }
          }
        }
      },
      [sendMessage, setAIStatus, setAIError]
    );

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

    const handlePresetSelect = useCallback(
      (presetId: string) => {
        const preset = promptPresets.find(item => item.id === presetId);
        if (!preset) return;

        setInput(preset.userPrompt);

        const mappedMode = presetModeMap[preset.profileId];
        if (mappedMode && mappedMode !== currentMode) {
          try {
            setMode(mappedMode);
          } catch (error) {
            const err = error as Error;
            logger.warn('Preset mode switch failed', {
              component: 'ChatWindow',
              action: 'handlePresetSelect',
              presetId,
              mappedMode,
              error: err.message,
            });
          }
        }
      },
      [promptPresets, presetModeMap, currentMode, setMode]
    );

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
            <button
              type="button"
              className={`ui-shield-button ${uiIntegrity?.hasSnapshot ? 'active' : ''}`}
              onClick={handleRestoreHistory}
              disabled={!uiIntegrity?.hasSnapshot}
              title={
                uiIntegrity?.hasSnapshot
                  ? 'Restaurer la dernière session stable'
                  : 'Aucun instantané disponible'
              }
              aria-label="Restaurer l'historique sécurisé"
            >
              <span aria-hidden="true">🛡️</span>
            </button>
            {onVoiceModeToggle && (
              <button
                type="button"
                className={`voice-mode-toggle ${voiceModeActive ? 'active' : ''}`}
                onClick={onVoiceModeToggle}
                title={voiceModeActive ? 'Désactiver mode vocal' : 'Activer mode vocal'}
                aria-label={
                  voiceModeActive ? 'Désactiver mode vocal' : 'Activer mode vocal'
                }
                aria-pressed={voiceModeActive}
              >
                <span aria-hidden="true">🎤</span>
              </button>
            )}
          </div>
        </div>

        {/* VitalsPanel - System Status */}
        <VitalsPanel currentMode={currentMode} messagesCount={messages.length} />

        <div
          className="chat-messages"
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions"
          aria-label="Historique de conversation"
        >
          {uiIntegrity?.preventedResets ? (
            <div className="ui-shield-banner" role="status" aria-label="UI Shield actif">
              <span className="ui-shield-label">UI Shield actif</span>
              <span className="ui-shield-value">
                {uiIntegrity.preventedResets} blocage(s) évité(s) • Version{' '}
                {uiIntegrity.version}
              </span>
            </div>
          ) : null}

          {messages.length === 0 && (
            <div className="chat-welcome" role="region" aria-label="Message de bienvenue">
              <h3>Bienvenue dans TITANE∞</h3>
              <p>
                Chat IA hybride avec Gemini & Ollama
                <br />
                <span className="sr-only">Mode actuel: </span>
                Mode {currentMode} actif • Mémoire par mode • TTS intégré
              </p>
            </div>
          )}

          {/* ✨ v24.2.1 FIX: Use memoized filtered messages - see filteredMessages useMemo above */}
          {filteredMessages.map(message => (
            <MessageBubble
              key={
                (message as { metadata?: { uiId?: string } })?.metadata?.uiId ??
                `msg-${message.timestamp}`
              }
              role={message.role}
              content={getMessageText(message)}
              timestamp={message.timestamp}
            />
          ))}

          {isLoading && (
            <div
              className="typing-indicator"
              role="status"
              aria-live="polite"
              aria-label="TITANE est en train de réfléchir"
            >
              <div className="typing-indicator-label">TITANE réfléchit...</div>
              <div className="typing-indicator-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error" role="alert" aria-live="assertive">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-presets">
          {promptPresets.slice(0, 4).map(preset => (
            <button
              key={preset.id}
              type="button"
              className="chat-preset-button"
              onClick={() => handlePresetSelect(preset.id)}
              disabled={isLoading}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {showFileImport && (
          <div className="chat-file-import-section">
            <ChatFileImport
              onFileAnalyzed={analysis => {
                logger.info('File analyzed successfully', {
                  component: 'ChatWindow',
                  action: 'onFileAnalyzed',
                  filename: analysis.filename,
                  lines: analysis.lines,
                });
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
                logger.info('+20 XP Memory awarded', {
                  component: 'ChatWindow',
                  action: 'onFileAnalyzed',
                  xpType: 'memory',
                  amount: 20,
                });
              }}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="chat-input-container">
          <button
            type="button"
            className="file-import-button"
            onClick={() => setShowFileImport(!showFileImport)}
            disabled={isLoading}
            title={showFileImport ? 'Fermer import fichier' : 'Importer un fichier'}
            aria-label="Importer un fichier"
            aria-expanded={showFileImport}
          >
            <span aria-hidden="true">📎</span>
          </button>
          <label htmlFor="chat-window-textarea" className="sr-only">
            Message à envoyer à TITANE
          </label>
          <textarea
            id="chat-window-textarea"
            ref={textareaRef}
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question... (Shift+Enter pour nouvelle ligne)"
            rows={1}
            disabled={isLoading}
            aria-label="Message à envoyer"
            aria-invalid={!!error}
          />
          <button
            type="submit"
            className="send-button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label={isLoading ? 'Envoi en cours' : 'Envoyer le message'}
            aria-busy={isLoading}
            title="Envoyer (Enter)"
          >
            <span aria-hidden="true">{isLoading ? '⏳' : '📨'}</span>
          </button>
        </div>
      </div>
    );
  }
);

ChatWindow.displayName = 'ChatWindow';
