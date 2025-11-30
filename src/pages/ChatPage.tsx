/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Chat Page
 * Interface de chat avec contexte cognitif
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEventHandler } from 'react';
import { ChatMessage, ChatInput, ChatContextPanel, type ChatSuggestion, type ChatMessageProps } from '@features/chat';
import { colors, spacing } from '@themes/tokens';
import { XP } from '../core/experience/XP_ENGINE'; // ✨ v∞.D3 - XP Engine
import {
  chatService,
  type ChatMessage as BackendChatMessage,
  type ChatResponse,
  type StreamConfig,
} from '../services/api';

type ProviderChoice = 'local' | 'ollama';

type DebugAttempt = {
  provider: string;
  success: boolean;
  error?: string;
  response?: ChatResponse;
};

type DebugEntry = {
  id: string;
  timestamp: number;
  requestedProvider: ProviderChoice | string;
  attempts: DebugAttempt[];
  request: {
    messages: BackendChatMessage[];
    config: StreamConfig;
  };
  status: 'success' | 'error';
  response?: ChatResponse;
  error?: string;
};

type PanelPosition = { x: number; y: number };

interface ChatDebugPanelProps {
  visible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onToggleVisible: () => void;
  position: PanelPosition;
  onPositionChange: (position: PanelPosition) => void;
  entries: DebugEntry[];
}

const DEBUG_MAX_ENTRIES = 20;

const ChatDebugPanel = ({
  visible,
  collapsed,
  onToggleCollapsed,
  onToggleVisible,
  position,
  onPositionChange,
  entries,
}: ChatDebugPanelProps): JSX.Element => {
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const clampPosition = useCallback(
    (next: PanelPosition, panelWidth: number, panelHeight: number): PanelPosition => {
      if (typeof window === 'undefined') {
        return next;
      }
      const maxX = window.innerWidth - panelWidth - 16;
      const maxY = window.innerHeight - panelHeight - 16;
      return {
        x: Math.max(16, Math.min(next.x, maxX)),
        y: Math.max(16, Math.min(next.y, maxY)),
      };
    },
    []
  );

  const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      const header = event.currentTarget;
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - position.x,
        offsetY: event.clientY - position.y,
      };
      header.setPointerCapture(event.pointerId);
    },
    [position.x, position.y]
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      const dragState = dragRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const panelWidth = collapsed ? 260 : 360;
      const panelHeight = collapsed ? 60 : 360;
      const nextPosition = clampPosition(
        {
          x: event.clientX - dragState.offsetX,
          y: event.clientY - dragState.offsetY,
        },
        panelWidth,
        panelHeight
      );
      onPositionChange(nextPosition);
    },
    [clampPosition, collapsed, onPositionChange]
  );

  const handlePointerUp = useCallback<PointerEventHandler<HTMLDivElement>>((event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragRef.current = null;
    }
  }, []);

  if (!visible) {
    return (
      <button
        type="button"
        onClick={onToggleVisible}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '10px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(148,163,184,0.3)',
          background: 'rgba(15,23,42,0.9)',
          color: '#e2e8f0',
          cursor: 'pointer',
          zIndex: 9100,
          fontSize: '0.85rem',
        }}
      >
        🛠️ Ouvrir Debug Chat
      </button>
    );
  }

  const panelWidth = collapsed ? 260 : 360;
  const panelHeight = collapsed ? 60 : 360;
  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    width: panelWidth,
    maxHeight: panelHeight,
    background: 'rgba(15,23,42,0.94)',
    borderRadius: '14px',
    border: '1px solid rgba(148,163,184,0.25)',
    boxShadow: '0 20px 45px rgba(2,6,23,0.45)',
    color: '#e2e8f0',
    overflow: 'hidden',
    zIndex: 9200,
    display: 'flex',
    flexDirection: 'column',
  };

  const lastEntry = entries[0];

  return (
    <div style={containerStyle}>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          cursor: 'grab',
          background: 'rgba(30,41,59,0.95)',
          borderBottom: collapsed ? 'none' : '1px solid rgba(148,163,184,0.15)',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Debug Chat IA</span>
          {!collapsed && (
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
              {lastEntry ? new Date(lastEntry.timestamp).toLocaleTimeString() : 'Aucun échange'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            style={{
              border: 'none',
              background: 'rgba(148,163,184,0.15)',
              color: '#e2e8f0',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            {collapsed ? '▢' : '—'}
          </button>
          <button
            type="button"
            onClick={onToggleVisible}
            style={{
              border: 'none',
              background: 'rgba(248,113,113,0.2)',
              color: '#fca5a5',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {lastEntry ? (
            <>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                <strong>Provider demandé :</strong> {lastEntry.requestedProvider}
                <br />
                <strong>Statut :</strong> {lastEntry.status === 'success' ? '✅ Succès' : '⚠️ Échec'}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 4 }}>Tentatives</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {lastEntry.attempts.map((attempt, index) => (
                    <div
                      key={`${attempt.provider}-${index}`}
                      style={{
                        fontSize: '0.75rem',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: attempt.success ? 'rgba(34,197,94,0.12)' : 'rgba(248,113,113,0.12)',
                        border: `1px solid ${attempt.success ? 'rgba(34,197,94,0.35)' : 'rgba(248,113,113,0.35)'}`,
                      }}
                    >
                      <strong>{attempt.provider}</strong> — {attempt.success ? 'Succès' : `Erreur : ${attempt.error ?? 'inconnue'}`}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Payload Requête</div>
              <pre
                style={{
                  background: 'rgba(15,23,42,0.8)',
                  borderRadius: '8px',
                  padding: '8px',
                  maxHeight: 140,
                  overflow: 'auto',
                  fontSize: '0.7rem',
                }}
              >
                {JSON.stringify(lastEntry.request, null, 2)}
              </pre>

              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Réponse</div>
              <pre
                style={{
                  background: 'rgba(15,23,42,0.8)',
                  borderRadius: '8px',
                  padding: '8px',
                  maxHeight: 140,
                  overflow: 'auto',
                  fontSize: '0.7rem',
                }}
              >
                {JSON.stringify(lastEntry.response ?? { error: lastEntry.error ?? 'Aucune donnée' }, null, 2)}
              </pre>
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Aucun échange enregistré pour le moment.</div>
          )}
        </div>
      )}
    </div>
  );
};

const initialSystemPrompt = 'Tu es TITANE∞, un assistant cognitif avancé. Réponds en français par défaut, assure la sécurité des données et propose des actions concrètes.';

export const ChatPage = (): JSX.Element => {
  const [messages, setMessages] = useState<ChatMessageProps[]>(() => [
    {
      role: 'system',
      content: 'Système initialisé. Mode méta engagé.',
      timestamp: new Date(),
    },
  ]);
  const [conversationHistory, setConversationHistory] = useState<BackendChatMessage[]>(() => [
    {
      role: 'system',
      content: initialSystemPrompt,
      timestamp: new Date().toISOString(),
    },
  ]);
  const historyRef = useRef(conversationHistory);

  useEffect(() => {
    historyRef.current = conversationHistory;
  }, [conversationHistory]);

  const [inputValue, setInputValue] = useState('');
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [provider, setProvider] = useState<ProviderChoice>('local');
  const [isSending, setIsSending] = useState(false);
  const [lastResponseProvider, setLastResponseProvider] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [debugEntries, setDebugEntries] = useState<DebugEntry[]>([]);
  const [debugPanelPosition, setDebugPanelPosition] = useState<PanelPosition>({ x: 24, y: 120 });
  const [debugPanelVisible, setDebugPanelVisible] = useState(true);
  const [debugPanelCollapsed, setDebugPanelCollapsed] = useState(false);

  const suggestions: ChatSuggestion[] = useMemo(
    () => [
      {
        id: 's1',
        text: 'Analyses cognitives rapides',
        category: 'action',
        icon: '🧠',
      },
      {
        id: 's2',
        text: 'Planifier mes tâches prioritaires',
        category: 'question',
      },
      {
        id: 's3',
        text: '/diagnostic sécurité',
        category: 'command',
      },
    ],
    []
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      const userTimestamp = new Date();
      const userMessage: ChatMessageProps = {
        role: 'user',
        content: trimmed,
        timestamp: userTimestamp,
      };
      setMessages((prev) => [...prev, userMessage]);

      const backendUserMessage: BackendChatMessage = {
        role: 'user',
        content: trimmed,
        timestamp: userTimestamp.toISOString(),
      };

      const requestHistory = [...historyRef.current, backendUserMessage];
      historyRef.current = requestHistory;
      setConversationHistory(requestHistory);

      setIsSending(true);
      setLastError(null);

      const candidates: string[] = provider === 'local' ? ['local', 'ollama'] : [provider, 'local'];
      const attempts: DebugAttempt[] = [];
      let finalResponse: ChatResponse | null = null;
      let successfulProvider: string | null = null;
      let failureMessage: string | null = null;

      console.log('[ChatPage] 🔄 Début envoi message, providers:', candidates);

      for (const candidate of candidates) {
        try {
          console.log(`[ChatPage] 📤 Tentative avec provider: ${candidate}`);
          const response = await chatService.sendMessage(requestHistory, { provider: candidate });
          console.log('[ChatPage] 📥 Réponse reçue:', {
            provider: candidate,
            contentLength: response?.content?.length,
            content: response?.content?.substring(0, 100),
          });
          attempts.push({ provider: candidate, success: true, response });
          finalResponse = response;
          successfulProvider = candidate;
          break;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[ChatPage] ❌ Erreur provider ${candidate}:`, message);
          attempts.push({ provider: candidate, success: false, error: message });
          failureMessage = message;
        }
      }

      const requestConfig: StreamConfig = { provider };

      if (finalResponse) {
        console.log('[ChatPage] ✅ Réponse finale reçue, ajout au state messages');
        XP.gain(12, 'response_ai', `Chat provider ${successfulProvider ?? provider}`);
        const assistantTimestamp = new Date();
        const contentToDisplay =
          finalResponse.content && finalResponse.content.trim().length > 0
            ? finalResponse.content
            : 'Réponse vide du moteur IA.';

        console.log('[ChatPage] 📝 Contenu à afficher:', contentToDisplay.substring(0, 100));

        const assistantMessage: ChatMessageProps = {
          role: 'assistant',
          content: contentToDisplay,
          timestamp: assistantTimestamp,
          metadata: finalResponse.latencyMs
            ? {
                processingTime: finalResponse.latencyMs,
              }
            : undefined,
        };
        setMessages((prev) => {
          console.log('[ChatPage] 📊 Messages avant ajout:', prev.length);
          const newMessages = [...prev, assistantMessage];
          console.log('[ChatPage] 📊 Messages après ajout:', newMessages.length);
          return newMessages;
        });

        const backendAssistant: BackendChatMessage = {
          role: 'assistant',
          content: contentToDisplay,
          timestamp: assistantTimestamp.toISOString(),
        };
        const finalHistory = [...requestHistory, backendAssistant];
        historyRef.current = finalHistory;
        setConversationHistory(finalHistory);
        setLastResponseProvider(successfulProvider);
      } else {
        const message = failureMessage ?? 'Aucune réponse disponible.';
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Chat indisponible : ${message}`,
            timestamp: new Date(),
          },
        ]);
        setLastError(message);
      }

      const status: DebugEntry['status'] = finalResponse ? 'success' : 'error';
      const newDebugEntry: DebugEntry = {
        id: `debug-${Date.now()}`,
        timestamp: Date.now(),
        requestedProvider: provider,
        attempts,
        request: {
          messages: requestHistory,
          config: requestConfig,
        },
        status,
        response: finalResponse ?? undefined,
        error: finalResponse ? undefined : failureMessage ?? 'Erreur inconnue',
      };

      setDebugEntries((prev): DebugEntry[] => [newDebugEntry, ...prev].slice(0, DEBUG_MAX_ENTRIES));

      setIsSending(false);
    },
    [provider]
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          minHeight: 'calc(100vh - 64px - 48px)',
          background: colors.neutral[950],
        }}
      >
        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {/* Controls */}
          <div
            style={{
              padding: spacing[4],
              borderBottom: `1px solid ${colors.rubis.primary[800]}`,
              background: 'rgba(4,7,15,0.75)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[4],
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
              <label htmlFor="chat-provider" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                Provider IA
              </label>
              <select
                id="chat-provider"
                value={provider}
                onChange={(event) => setProvider(event.target.value as ProviderChoice)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.rubis.primary[700]}`,
                  background: colors.neutral[950],
                  color: '#e2e8f0',
                }}
              >
                <option value="local">Local</option>
                <option value="ollama">Ollama</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {isSending ? '⚙️ Génération en cours...' : lastResponseProvider ? `Dernière réponse : ${lastResponseProvider}` : 'Aucune réponse enregistrée'}
              </span>
              {lastError && (
                <span style={{ color: '#f87171', fontSize: '0.8rem' }}>⚠️ {lastError}</span>
              )}
              <button
                type="button"
                onClick={() => setDebugPanelVisible((prev) => !prev)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148,163,184,0.3)',
                  background: 'rgba(15,23,42,0.8)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                {debugPanelVisible ? 'Masquer debug' : 'Afficher debug'}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: spacing[6],
            }}
          >
            {messages.map((message, index) => (
              <ChatMessage key={`${message.role}-${message.timestamp.getTime()}-${index}`} {...message} />
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: spacing[4],
              borderTop: `1px solid ${colors.rubis.primary[800]}`,
              background: 'rgba(4,7,15,0.75)',
            }}
          >
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSendMessage}
              suggestions={suggestions}
              disabled={isSending}
              isProcessing={isSending}
            />
          </div>
        </div>

        {/* Context Panel */}
        <ChatContextPanel
          cognitiveState={{
            stress: 0.22,
            clarity: 0.82,
            focus: 0.79,
            energy: 0.81,
            emotionalTone: 'Calme',
          }}
          activeMemories={[
            {
              id: 'm1',
              type: 'conversation',
              content: 'Diagnostic mémoire sécurisé complété hier',
              relevance: 0.91,
              timestamp: new Date(Date.now() - 7200000),
            },
            {
              id: 'm2',
              type: 'fact',
              content: "Préférence utilisateur : mode local prioritaire",
              relevance: 0.76,
              timestamp: new Date(Date.now() - 86400000),
            },
          ]}
          suggestions={[
            'Analyser les patterns de productivité',
            'Réviser les objectifs de la semaine',
            'Optimiser la gestion du temps',
          ]}
          isCollapsed={contextCollapsed}
          onToggle={() => setContextCollapsed((prev) => !prev)}
        />
      </div>

      <ChatDebugPanel
        visible={debugPanelVisible}
        collapsed={debugPanelCollapsed}
        onToggleCollapsed={() => setDebugPanelCollapsed((prev) => !prev)}
        onToggleVisible={() => setDebugPanelVisible((prev) => !prev)}
        position={debugPanelPosition}
        onPositionChange={setDebugPanelPosition}
        entries={debugEntries}
      />
    </>
  );
};
