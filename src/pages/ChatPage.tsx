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
import {
  ChatMessage,
  ChatInput,
  ChatContextPanel,
  type ChatSuggestion,
  type ChatMessageProps,
} from '@features/chat';
import { ChatModeSelector } from '../components/chat/ChatModeSelector';
import { colors, spacing } from '@themes/tokens';
import { XP } from '../core/experience/XP_ENGINE'; // ✨ v∞.D3 - XP Engine
import { chatEngineCommands } from '../services/tauri/chatEngine.commands';
import type { OmegaResponse } from '../services/tauri/chatEngine.commands';

// Types legacy conservés pour compatibilité temporaire
type BackendChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};
type ChatResponse = OmegaResponse;
type StreamConfig = { provider?: string; mode?: string };
import { useChatModeStore } from '../stores/useChatModeStore'; // Import du store de modes
import { ModeEditor } from '../ui/pages/ChatIA/ModeEditor';
import type { InstructionMode } from '../ui/pages/ChatIA/InstructionModeManager';
import { instructionModeManager } from '../ui/pages/ChatIA/InstructionModeManager';

type ProviderChoice = 'auto' | 'openai' | 'claude' | 'gemini' | 'ollama' | 'local';

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

const _DEBUG_MAX_ENTRIES = 20;

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
    event => {
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
    event => {
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

  const handlePointerUp = useCallback<PointerEventHandler<HTMLDivElement>>(event => {
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
              {lastEntry
                ? new Date(lastEntry.timestamp).toLocaleTimeString()
                : 'Aucun échange'}
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
                <strong>Statut :</strong>{' '}
                {lastEntry.status === 'success' ? '✅ Succès' : '⚠️ Échec'}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 4 }}>
                  Tentatives
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {lastEntry.attempts.map((attempt, index) => (
                    <div
                      key={`${attempt.provider}-${index}`}
                      style={{
                        fontSize: '0.75rem',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: attempt.success
                          ? 'rgba(34,197,94,0.12)'
                          : 'rgba(248,113,113,0.12)',
                        border: `1px solid ${attempt.success ? 'rgba(34,197,94,0.35)' : 'rgba(248,113,113,0.35)'}`,
                      }}
                    >
                      <strong>{attempt.provider}</strong> —{' '}
                      {attempt.success
                        ? 'Succès'
                        : `Erreur : ${attempt.error ?? 'inconnue'}`}
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
                {JSON.stringify(
                  lastEntry.response ?? { error: lastEntry.error ?? 'Aucune donnée' },
                  null,
                  2
                )}
              </pre>
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Aucun échange enregistré pour le moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const initialSystemPrompt = `Tu es TITANE∞, un assistant cognitif avancé de Kevin Thibault.

🌍 RÈGLE ABSOLUE : Tu réponds TOUJOURS et UNIQUEMENT en FRANÇAIS. Jamais un seul mot en anglais. Même si l'utilisateur écrit en anglais, tu réponds en français.

Tu assures la sécurité des données et proposes des actions concrètes. Tu es direct, incarné, responsabilisant.`;

export const ChatPage = (): JSX.Element => {
  const {
    currentModeId,
    changeMode,
    initialize: initializeModeStore,
  } = useChatModeStore();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [frenchMasteryApplied, setFrenchMasteryApplied] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessageProps[]>(() => [
    {
      role: 'system',
      content: 'Système initialisé. Prêt à démarrer une nouvelle conversation OMEGA.',
      timestamp: new Date(),
    },
  ]);
  const [conversationHistory, _setConversationHistory] = useState<BackendChatMessage[]>(
    () => [
      {
        role: 'system',
        content: initialSystemPrompt,
        timestamp: new Date().toISOString(),
      },
    ]
  );
  const historyRef = useRef(conversationHistory);

  useEffect(() => {
    historyRef.current = conversationHistory;
  }, [conversationHistory]);

  // Initialisation du store de modes
  useEffect(() => {
    initializeModeStore();
  }, [initializeModeStore]);

  // Vérification statut providers
  useEffect(() => {
    const checkProviders = async () => {
      try {
        const [openai, claude, gemini, ollama] = await Promise.all([
          (async () => {
            try {
              const res = await invoke<{
                ok: boolean;
                data: { configured: boolean } | null;
              }>('get_openai_key_status');
              return res.ok && res.data?.configured === true;
            } catch {
              return false;
            }
          })(),
          (async () => {
            try {
              const res = await invoke<{
                ok: boolean;
                data: { configured: boolean } | null;
              }>('get_claude_key_status');
              return res.ok && res.data?.configured === true;
            } catch {
              return false;
            }
          })(),
          (async () => {
            try {
              const res = await invoke<{
                ok: boolean;
                data: { configured: boolean } | null;
              }>('get_gemini_key_status');
              return res.ok && res.data?.configured === true;
            } catch {
              return false;
            }
          })(),
          (async () => {
            try {
              const res = await invoke<{ ok: boolean }>('check_ollama_availability');
              return res.ok;
            } catch {
              return false;
            }
          })(),
        ]);

        setProviderStatus({
          openai_configured: openai,
          claude_configured: claude,
          gemini_configured: gemini,
          ollama_available: ollama,
        });
      } catch (error) {
        console.error('[ChatPage] Erreur vérification providers:', error);
      }
    };

    checkProviders();
    const interval = setInterval(checkProviders, 30000); // Refresh toutes les 30s
    return () => clearInterval(interval);
  }, []);

  // Démarrage de la conversation au chargement de la page
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // Tenter de récupérer un conversation_id existant depuis localStorage
        const savedConversationId = localStorage.getItem('titane_conversation_id');

        let conversationIdToUse: string;

        if (savedConversationId) {
          conversationIdToUse = savedConversationId;
          console.log(
            '[ChatPage-OMEGA] 🔄 Réutilisation conversation existante:',
            conversationIdToUse
          );
        } else {
          conversationIdToUse = await chatEngineCommands.createNewConversation();
          localStorage.setItem('titane_conversation_id', conversationIdToUse);
          console.log(
            '[ChatPage-OMEGA] 🆕 Nouvelle conversation créée (OMEGA):',
            conversationIdToUse
          );
        }

        setConversationId(conversationIdToUse);
        setMessages(prev => [
          ...prev,
          {
            role: 'system',
            content: savedConversationId
              ? `Conversation OMEGA reprise. ID: ${conversationIdToUse}`
              : `Conversation OMEGA démarrée. ID: ${conversationIdToUse}`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Erreur critique: Impossible d'initialiser le moteur de conversation OMEGA. ${error instanceof Error ? error.message : ''}`,
            timestamp: new Date(),
          },
        ]);
      }
    };
    initializeConversation();
  }, []);

  const [inputValue, setInputValue] = useState('');
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [provider, setProvider] = useState<ProviderChoice>('auto');
  const [isSending, setIsSending] = useState(false);
  const [lastResponseProvider, setLastResponseProvider] = useState<string | null>(null);
  const [showModeEditor, setShowModeEditor] = useState(false);
  const [currentInstructionMode, setCurrentInstructionMode] = useState<InstructionMode>(
    instructionModeManager.getAllModes()[0]
  );
  const [providerStatus, setProviderStatus] = useState({
    openai_configured: false,
    claude_configured: false,
    gemini_configured: false,
    ollama_available: false,
  });
  const [lastError, setLastError] = useState<string | null>(null);
  const [_debugEntries, _setDebugEntries] = useState<DebugEntry[]>([]);
  const [debugPanelPosition, setDebugPanelPosition] = useState<PanelPosition>({
    x: 24,
    y: 120,
  });
  const [debugPanelVisible, setDebugPanelVisible] = useState(true);
  const [debugPanelCollapsed, setDebugPanelCollapsed] = useState(false);

  const suggestions: ChatSuggestion[] = useMemo(() => [], []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      console.log(
        '[ChatPage-OMEGA] 🎯 handleSendMessage appelé avec:',
        content?.substring(0, 50)
      );

      if (!conversationId) {
        console.error('[ChatPage-OMEGA] ❌ ID de conversation manquant. Envoi annulé.');
        setLastError('Erreur critique : ID de conversation non disponible.');
        return;
      }

      const trimmed = content.trim();
      if (!trimmed) {
        console.log('[ChatPage-OMEGA] ⚠️ Message vide, abandon');
        return;
      }

      console.log('[ChatPage-OMEGA] ✅ Message valide, traitement...');
      const userTimestamp = new Date();
      const userMessage: ChatMessageProps = {
        role: 'user',
        content: trimmed,
        timestamp: userTimestamp,
      };
      setMessages(prev => [...prev, userMessage]);

      setIsSending(true);
      setLastError(null);

      let finalResponse: ChatResponse | null = null;
      let failureMessage: string | null = null;

      console.log('[ChatPage-OMEGA] 🔄 Début envoi message via OMEGA...');

      try {
        // 🎯 PIPELINE OMEGA : Appel direct backend Rust
        const response = await chatEngineCommands.generate({
          message: trimmed,
          conversationId,
          mode: currentModeId as any, // Mode IA actif
          provider: provider === 'local' ? 'ollama' : provider,
        });
        console.log('[ChatPage-OMEGA] 📥 Réponse OMEGA reçue:', {
          mode: currentModeId,
          provider: response?.metadata?.provider,
          contentLength: response?.content?.length,
          frenchMastery: response?.frenchMasteryApplied,
        });
        finalResponse = response;

        // Mettre à jour les métriques d'observabilité
        if (response.latencyMs) {
          setLastLatency(response.latencyMs);
        }
        setFrenchMasteryApplied(response.frenchMasteryApplied ?? false);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ChatPage-OMEGA] ❌ Erreur provider ${provider}:`, message);
        failureMessage = message;
      }

      if (finalResponse) {
        console.log('[ChatPage-OMEGA] ✅ Réponse finale reçue, ajout au state messages');
        XP.gain(25, 'response_ai_omega', `Chat provider ${provider}`); // XP augmenté pour OMEGA
        const assistantTimestamp = new Date();
        const contentToDisplay =
          finalResponse.content && finalResponse.content.trim().length > 0
            ? finalResponse.content
            : 'Réponse vide du moteur IA OMEGA.';

        console.log(
          '[ChatPage-OMEGA] 📝 Contenu à afficher:',
          contentToDisplay.substring(0, 100)
        );

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
        setMessages(prev => [...prev, assistantMessage]);
        setLastResponseProvider(provider);
      } else {
        const message = failureMessage ?? 'Aucune réponse disponible.';
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Chat OMEGA indisponible : ${message}`,
            timestamp: new Date(),
          },
        ]);
        setLastError(message);
      }

      setIsSending(false);
    },
    [provider, conversationId, currentModeId] // Ajout de currentModeId aux dépendances
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
            {/* Pipeline Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(134,239,172,0.3)',
                  background: 'rgba(34,197,94,0.08)',
                  color: '#86efac',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                🔌 {'OMEGA'}
              </span>
              <span
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148,163,184,0.35)',
                  background: 'rgba(148,163,184,0.12)',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                }}
              >
                🆔 {conversationId?.substring(0, 8) ?? '—'}
              </span>
              <span
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99,102,241,0.35)',
                  background: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                  fontSize: '0.75rem',
                }}
              >
                🎛️ {typeof currentModeId === 'string' ? currentModeId : 'default'}
              </span>
              {lastLatency !== null && (
                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(251,191,36,0.35)',
                    background: 'rgba(251,191,36,0.12)',
                    color: '#fde047',
                    fontSize: '0.75rem',
                  }}
                >
                  ⚡ {lastLatency}ms
                </span>
              )}
              {frenchMasteryApplied && (
                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(34,197,94,0.35)',
                    background: 'rgba(34,197,94,0.12)',
                    color: '#86efac',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  🇫🇷 FR ✓
                </span>
              )}
            </div>

            <ChatModeSelector
              currentMode={
                currentModeId as import('@/services/ai/chatModes.config').ChatModeId
              }
              onModeChange={changeMode}
              disabled={isSending}
            />

            <div
              style={{
                display: 'flex',
                gap: spacing[2],
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
                <label
                  htmlFor="instruction-mode"
                  style={{ fontSize: '0.85rem', opacity: 0.8 }}
                >
                  Instructions:
                </label>
                <button
                  type="button"
                  onClick={() => setShowModeEditor(true)}
                  disabled={isSending}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(139,92,246,0.4)',
                    background: 'rgba(139,92,246,0.15)',
                    color: '#c4b5fd',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    opacity: isSending ? 0.5 : 1,
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                  }}
                  title="Gérer les modes d'instructions personnalisés"
                >
                  <span>{currentInstructionMode.icon}</span>
                  <span>{currentInstructionMode.name}</span>
                  <span>⚙️</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
                <label
                  htmlFor="chat-provider"
                  style={{ fontSize: '0.85rem', opacity: 0.8 }}
                >
                  Provider IA:
                </label>
                <select
                  id="chat-provider"
                  value={provider}
                  onChange={event => setProvider(event.target.value as ProviderChoice)}
                  disabled={isSending}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.rubis.primary[700]}`,
                    background: colors.neutral[950],
                    color: '#e2e8f0',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    opacity: isSending ? 0.5 : 1,
                  }}
                >
                  <option value="auto">🤖 Auto (Intelligent)</option>
                  <option value="openai" disabled={!providerStatus.openai_configured}>
                    🔵 OpenAI GPT-4
                    {!providerStatus.openai_configured && ' (⚠️ Non configuré)'}
                  </option>
                  <option value="claude" disabled={!providerStatus.claude_configured}>
                    🧠 Claude 3.5
                    {!providerStatus.claude_configured && ' (⚠️ Non configuré)'}
                  </option>
                  <option value="gemini" disabled={!providerStatus.gemini_configured}>
                    🔵 Gemini{!providerStatus.gemini_configured && ' (⚠️ Non configuré)'}
                  </option>
                  <option value="ollama" disabled={!providerStatus.ollama_available}>
                    🟢 Ollama (Local)
                    {!providerStatus.ollama_available && ' (⚠️ Hors ligne)'}
                  </option>
                  <option value="local">🏠 TITANE Local</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: spacing[3],
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {isSending
                  ? '⚙️ Génération OMEGA...'
                  : lastResponseProvider
                    ? `Dernière réponse : ${lastResponseProvider}`
                    : 'En attente'}
              </span>
              {lastError && (
                <span style={{ color: '#f87171', fontSize: '0.8rem' }}>
                  ⚠️ {lastError}
                </span>
              )}
              <button
                type="button"
                onClick={async () => {
                  localStorage.removeItem('titane_conversation_id');
                  const newConvId = await chatEngineCommands.createNewConversation();
                  localStorage.setItem('titane_conversation_id', newConvId);
                  setConversationId(newConvId);
                  setMessages([
                    {
                      role: 'system',
                      content: `Nouvelle conversation OMEGA démarrée. ID: ${newConvId}`,
                      timestamp: new Date(),
                    },
                  ]);
                }}
                disabled={isSending}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99,102,241,0.35)',
                  background: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  opacity: isSending ? 0.5 : 1,
                }}
              >
                🆕 Nouvelle conversation
              </button>
              <button
                type="button"
                onClick={() => setDebugPanelVisible(prev => !prev)}
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
              <ChatMessage
                key={`${message.role}-${message.timestamp.getTime()}-${index}`}
                {...message}
              />
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
              disabled={isSending || !conversationId}
              isProcessing={isSending}
            />
          </div>
        </div>

        {/* Context Panel */}
        <ChatContextPanel
          cognitiveState={{
            stress: 0.1, // Stress réduit grâce à OMEGA
            clarity: 0.9,
            focus: 0.85,
            energy: 0.88,
            emotionalTone: 'Focalisé',
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
              content: 'Préférence utilisateur : mode local prioritaire',
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
          onToggle={() => setContextCollapsed(prev => !prev)}
        />
      </div>

      <ChatDebugPanel
        visible={debugPanelVisible}
        collapsed={debugPanelCollapsed}
        onToggleCollapsed={() => setDebugPanelCollapsed(prev => !prev)}
        onToggleVisible={() => setDebugPanelVisible(prev => !prev)}
        position={debugPanelPosition}
        onPositionChange={setDebugPanelPosition}
        entries={_debugEntries}
      />

      {/* Mode Editor Modal */}
      {showModeEditor && (
        <ModeEditor
          onClose={() => setShowModeEditor(false)}
          onModeSelect={(mode: InstructionMode) => {
            setCurrentInstructionMode(mode);
            setShowModeEditor(false);
          }}
          currentModeId={currentInstructionMode.id}
        />
      )}
    </>
  );
};
