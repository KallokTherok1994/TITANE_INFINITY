/**
 * TITANE∞ v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.3.0 — CHAT PAGE OMEGA (UI ANTI-CRASH)
 *   v22Ω AI Performance Optimizations: -40% latency, stream batching
 *   Protection render • État stable • Récupération auto
 *   Keyboard shortcuts, Focus trap, Code splitting
 * ═══════════════════════════════════════════════════════════════════
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type PointerEventHandler,
} from 'react';
import type { CSSProperties } from 'react';
import {
  useChat,
  type ProviderPreference,
  type ChatDebugEntry,
} from '../../hooks/useChat';
// P1-A OPTIMIZATION: Use VirtualizedMessageList for 50+ messages performance
import { VirtualizedMessageList } from '../../components/chat/VirtualizedMessageList';
// OMEGA v19.2Ω: MessageListOptimized as fallback (commented for P1 test)
// import { MessageListOptimized as MessageList } from '../../components/chat/MessageListOptimized';
// import { MessageListSimple as MessageList } from '../../components/chat/MessageListSimple';
// import { MessageList } from '../../components/chat/MessageList';
import { ChatInput } from '../../components/chat/ChatInput';
import { ChatToolbar } from '../../components/chat/ChatToolbar';
import { ChatModeSelector } from '../../components/chat/ChatModeSelector';
import { ModeBadge } from '../../components/chat/ModeBadge';
import { VoiceConversation } from '../../components/VoiceConversation';
import type { ChatModeId } from '../../services/ai/chatModes.config';
import { unifiedHealingFacade } from '../../services/ai/system';
// Phase 1.9: Audio Feedback - VAD + TTS integration
import useVAD, { useVADWithTTS, useBargeInHandler } from '../../hooks/useVAD';
// Phase 2 v24.7.4: Keyboard shortcuts & Focus trap
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useFocusTrap } from '../../hooks/useFocusTrap';
// ✨ v25.7.4: Responsive Chat Layout wrapper
import { ResponsiveChatLayout } from '../../layouts/ResponsiveChatLayout';
// ✨ v26.2: OMEGA Reflection Panel v2 - Compact mode
import {
  ThinkingPanel,
  useThinkingSteps,
} from '../../features/conversation/ThinkingPanel';
import './styles/Chat.css';

const isDev = process.env.NODE_ENV === 'development';

const PROVIDER_PREFERENCE_LABELS: Record<ProviderPreference, string> = {
  auto: 'Auto (sélection intelligente)',
  local: 'Local prioritaire',
  ollama: 'Ollama prioritaire',
  openai: 'OpenAI GPT-4o',
  gemini: 'Google Gemini 2.0',
  anthropic: 'Anthropic Claude',
  copilot: 'GitHub Copilot',
};

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  auto: 'Sélection automatique',
  local: 'Tauri Local',
  'tauri-local': 'Tauri Local',
  'tauri-backend': 'Tauri Backend',
  'tauri-ollama': 'Ollama Local',
  ollama: 'Ollama Local',
  'tauri-gemini': 'Google Gemini',
  gemini: 'Google Gemini',
  'tauri-chat': 'Tauri Chat Bridge',
  openai: 'OpenAI Cloud',
  claude: 'Anthropic Claude',
  'omnis-fallback': 'OMNIS Fallback',
  'omnis-emergency': 'OMNIS Emergency',
  'emergency-fallback': 'Emergency Fallback',
  'ultimate-fallback': 'Ultimate Fallback',
};

const DEFAULT_PROVIDER_NAME = 'OMEGA Neural';
const PROVIDER_PREFERENCE_OPTIONS: ProviderPreference[] = [
  'auto',
  'local',
  'ollama',
  'openai',
  'gemini',
  'anthropic',
];

const resolveProviderDisplayName = (provider: string | null | undefined): string => {
  if (!provider) {
    return DEFAULT_PROVIDER_NAME;
  }

  const key = provider.toLowerCase();
  return PROVIDER_DISPLAY_NAMES[key] ?? provider;
};

type PanelPosition = { x: number; y: number };

interface ChatDebugPanelProps {
  visible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onToggleVisible: () => void;
  position: PanelPosition;
  onPositionChange: (position: PanelPosition) => void;
  entries: ChatDebugEntry[];
}

const DEFAULT_PANEL_POSITION: PanelPosition = { x: 24, y: 96 };

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

  // Memoize styles pour éviter re-création à chaque render (performance optimization)
  const toggleButtonStyle = useMemo<CSSProperties>(
    () => ({
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
    }),
    []
  );

  const panelWidth = collapsed ? 260 : 360;
  const panelHeight = collapsed ? 60 : 360;

  const containerStyle = useMemo<CSSProperties>(
    () => ({
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
    }),
    [position.y, position.x, panelWidth, panelHeight]
  );

  const headerStyle = useMemo<CSSProperties>(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      cursor: 'grab',
      background: 'rgba(30,41,59,0.95)',
      borderBottom: collapsed ? 'none' : '1px solid rgba(148,163,184,0.15)',
      gap: 12,
    }),
    [collapsed]
  );

  const contentStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      overflowY: 'auto',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }),
    []
  );

  if (!visible) {
    return (
      <button type="button" onClick={onToggleVisible} style={toggleButtonStyle}>
        🛠️ Ouvrir Debug Chat
      </button>
    );
  }

  const lastEntry = entries[0];

  return (
    <div style={containerStyle}>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={headerStyle}
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
        <div style={contentStyle}>
          {lastEntry ? (
            <>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                <strong>Provider demandé :</strong> {lastEntry.requestedProvider}
                <br />
                <strong>Statut :</strong>{' '}
                {lastEntry.status === 'success' ? '✅ Succès' : '⚠️ Échec'}
              </div>

              {lastEntry.selectedProvider && (
                <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Provider final :</strong>{' '}
                  {resolveProviderDisplayName(lastEntry.selectedProvider)}
                </div>
              )}

              {typeof lastEntry.latencyMs === 'number' && (
                <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Latence :</strong>{' '}
                  {Math.max(0, Math.round(lastEntry.latencyMs))} ms
                </div>
              )}

              {lastEntry.request.attemptedProviders?.length > 0 && (
                <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                  <strong>Ordre tentatives :</strong>{' '}
                  {lastEntry.request.attemptedProviders
                    .map(provider => resolveProviderDisplayName(provider))
                    .join(' → ')}
                </div>
              )}

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
                        boxShadow: attempt.success
                          ? '0 0 0 1px rgba(56,189,248,0.4)'
                          : 'none',
                      }}
                    >
                      <strong>{resolveProviderDisplayName(attempt.provider)}</strong>{' '}
                      {attempt.success
                        ? '— Succès'
                        : `— Erreur : ${attempt.error ?? 'inconnue'}`}
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

interface ProviderStatus {
  name: string;
  status: 'online' | 'offline' | 'connecting' | 'error';
  latency?: number;
  lastError?: string;
  autoHealed?: boolean;
  selectedProvider?: string;
  attemptedProviders?: string[];
}

interface ChatPageState {
  renderError: string | null;
  recoveryCount: number;
  lastRecovery: number;
  stateVersion: number;
  isCorrupted: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * OMEGA RENDER PROTECTION HOOK
 * ═══════════════════════════════════════════════════════════════════
 */
function useOmegaRenderProtection() {
  const [pageState, setPageState] = useState<ChatPageState>({
    renderError: null,
    recoveryCount: 0,
    lastRecovery: 0,
    stateVersion: 1,
    isCorrupted: false,
  });

  const renderAttempts = useRef(0);
  const maxRenderAttempts = 3;

  const handleRenderError = useCallback((error: Error, context: string) => {
    renderAttempts.current++;

    // Auto-heal trigger (unified, non-bloquant)
    void unifiedHealingFacade
      .heal({
        source: 'chat-page',
        error,
        type: 'validation',
        metadata: {
          context,
          renderAttempts: renderAttempts.current,
          timestamp: Date.now(),
        },
      })
      .catch(err => {
        isDev && console.warn('[OMEGA CHAT PAGE] Unified healing failed:', err);
      });

    setPageState(prev => ({
      ...prev,
      renderError: error.message,
      recoveryCount: prev.recoveryCount + 1,
      lastRecovery: Date.now(),
      stateVersion: prev.stateVersion + 1,
      isCorrupted: renderAttempts.current >= maxRenderAttempts,
    }));

    isDev && console.error('[OMEGA CHAT PAGE] Render error handled:', error, context);
  }, []);

  const resetError = useCallback(() => {
    renderAttempts.current = 0;
    setPageState(prev => ({
      ...prev,
      renderError: null,
      isCorrupted: false,
      stateVersion: prev.stateVersion + 1,
    }));
    isDev && console.log('[OMEGA CHAT PAGE] State reset');
  }, []);

  // Auto-recovery timer
  useEffect(() => {
    if (pageState.renderError && Date.now() - pageState.lastRecovery > 8000) {
      resetError();
    }
  }, [pageState.renderError, pageState.lastRecovery, resetError]);

  return { pageState, handleRenderError, resetError };
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * CHAT PAGE OMEGA COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 */

// Clé localStorage pour persistance du mode
const CHAT_MODE_STORAGE_KEY = 'titane-chat-mode';

export const Chat: React.FC = () => {
  const mountedRef = useRef(false);
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  const { pageState, handleRenderError, resetError } = useOmegaRenderProtection();
  const [showSettings, setShowSettings] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const [debugPanelCollapsed, setDebugPanelCollapsed] = useState(false);
  const [debugPanelPosition, setDebugPanelPosition] =
    useState<PanelPosition>(DEFAULT_PANEL_POSITION);

  // ═══ v25.5.0 - ÉTATS POUR CHAT TOOLBAR ═══
  // Ces états stockent les données multimédia pour intégration future avec messages multimodaux
  const [_pendingDictationText, setPendingDictationText] = useState<string>('');
  const [_ttsEnabled, setTtsEnabled] = useState(true);
  const [_attachedImages, setAttachedImages] = useState<string[]>([]);

  // ═══ MODE CHAT STATE ═══
  const [currentChatMode, setCurrentChatMode] = useState<ChatModeId>(() => {
    try {
      const saved = localStorage.getItem(CHAT_MODE_STORAGE_KEY);
      if (
        saved &&
        [
          'default',
          'brainstorming',
          'synthesis',
          'planning',
          'journal',
          'debug_cognitive',
          'coach',
          'dev',
          'admin',
          'strategy',
          'audit',
        ].includes(saved)
      ) {
        return saved as ChatModeId;
      }
    } catch {
      /* ignore */
    }
    return 'default';
  });

  // Handler changement de mode avec persistance
  const handleModeChange = useCallback((newMode: ChatModeId) => {
    setCurrentChatMode(newMode);
    try {
      localStorage.setItem(CHAT_MODE_STORAGE_KEY, newMode);
    } catch {
      /* ignore */
    }
    isDev && console.log(`[OMEGA CHAT] Mode changé: ${newMode}`);
  }, []);

  const toggleDebugPanelVisibility = useCallback(() => {
    setDebugPanelVisible(prev => !prev);
  }, []);

  const toggleDebugPanelCollapsed = useCallback(() => {
    setDebugPanelCollapsed(prev => !prev);
  }, []);

  const handleDebugPanelPositionChange = useCallback((position: PanelPosition) => {
    setDebugPanelPosition(position);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setDebugPanelPosition(position => {
      const next = {
        x: Math.min(position.x, Math.max(16, window.innerWidth - 360)),
        y: Math.min(position.y, Math.max(16, window.innerHeight - 200)),
      };
      if (next.x === position.x && next.y === position.y) {
        return position;
      }
      return next;
    });
  }, []);

  // ═══ PHASE 5.1: PROTECTED HOOKS ═══
  const chatHookResult = useChat({
    voiceEnabled: voiceModeActive,
  });

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    omnisStats,
    uiIntegrity,
    restoreFromVault,
    preferredProvider,
    setPreferredProvider,
    lastProvider,
    debugEntries,
    providerReadiness, // v24.3.0: Cloud providers availability
  } = chatHookResult;

  // Phase 1.9: Audio Feedback - VAD integration with anti-echo + barge-in
  const vad = useVAD();
  useVADWithTTS(vad); // Auto-suspend VAD during TTS playback (anti-echo)
  useBargeInHandler(); // Auto-stop TTS when user interrupts

  // ✨ v26.2: OMEGA Reflection Panel v2 - Thinking steps management
  const thinking = useThinkingSteps();
  const [thinkingStartTime, setThinkingStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Timer for elapsed time (v2.1)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (thinking.isThinking && thinkingStartTime > 0) {
      interval = setInterval(() => {
        setElapsedTime((Date.now() - thinkingStartTime) / 1000);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [thinking.isThinking, thinkingStartTime]);

  // Sync thinking state with isLoading state from chat
  useEffect(() => {
    if (isLoading && !thinking.isThinking) {
      thinking.startThinking();
      setThinkingStartTime(Date.now());
      setElapsedTime(0);
      // Simulate OMEGA pipeline steps (can be replaced with real steps from backend)
      setTimeout(() => {
        if (thinking.isThinking) {
          thinking.addStep('analysis', 'Analyse du contexte et de la demande...');
        }
      }, 300);
      setTimeout(() => {
        if (thinking.isThinking) {
          thinking.addStep('reasoning', 'Recherche dans la mémoire et raisonnement...');
        }
      }, 800);
    } else if (!isLoading && thinking.isThinking) {
      setTimeout(() => {
        if (thinking.isThinking) {
          thinking.addStep('synthesis', 'Synthèse de la réponse...');
        }
      }, 100);
      setTimeout(() => {
        thinking.stopThinking();
        setThinkingStartTime(0);
      }, 500);
    }
  }, [isLoading, thinking]);

  // Start/stop VAD when voice mode is toggled
  useEffect(() => {
    if (voiceModeActive) {
      vad.enableBargeIn(); // Allow user to interrupt AI
      vad.startListening().catch(err => {
        isDev && console.error('[Chat] Failed to start VAD:', err);
      });
      isDev && console.log('[Chat] 🎤 Voice mode enabled: VAD started, barge-in enabled');
    } else {
      vad.stopListening();
      vad.disableBargeIn();
      // ✅ v∞.FIX - Debug log only (was spamming console every render)
      if (import.meta.env.DEV) {
        console.log('[Chat] 🔇 Voice mode disabled: VAD stopped');
      }
    }
  }, [voiceModeActive, vad]);

  // OMEGA DEBUG: Trace messages dans Chat.tsx
  useEffect(() => {
    isDev &&
      console.log(
        '[OMEGA CHAT PAGE DEBUG] 📊 Messages state changed:',
        messages?.length,
        'messages'
      );
  }, [messages]);

  const providerStatus = useMemo<ProviderStatus>(() => {
    const lastEntry = debugEntries[0];
    const attemptedProviders = lastEntry?.request?.attemptedProviders ?? [];
    const resolvedProviderRaw =
      lastEntry?.selectedProvider ??
      lastEntry?.response?.provider ??
      lastProvider ??
      null;
    const displayName = resolveProviderDisplayName(resolvedProviderRaw);
    const status: ProviderStatus['status'] = (() => {
      if (error) {
        return 'error';
      }
      if (lastEntry?.status === 'error') {
        return attemptedProviders.length > 0 ? 'offline' : 'error';
      }
      if (isLoading) {
        return 'connecting';
      }
      return 'online';
    })();

    const latency =
      typeof lastEntry?.latencyMs === 'number'
        ? lastEntry.latencyMs
        : typeof lastEntry?.response?.latencyMs === 'number'
          ? lastEntry.response.latencyMs
          : undefined;

    return {
      name: displayName,
      status,
      latency,
      lastError: lastEntry?.error,
      autoHealed: (omnisStats?.autoHealCount ?? 0) > 0,
      selectedProvider: resolvedProviderRaw ?? undefined,
      attemptedProviders,
    };
  }, [debugEntries, lastProvider, error, isLoading, omnisStats?.autoHealCount]);

  const handlePreferredProviderChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setPreferredProvider(event.target.value as ProviderPreference);
    },
    [setPreferredProvider]
  );

  useEffect(() => {
    if (!debugPanelVisible && debugEntries[0]?.status === 'error') {
      setDebugPanelVisible(true);
    }
  }, [debugEntries, debugPanelVisible]);

  useEffect(() => {
    if (error) {
      handleRenderError(new Error(error), 'useChat-hook');
    }
  }, [error, handleRenderError]);

  const handleRestoreHistory = useCallback(() => {
    try {
      if (!uiIntegrity?.hasSnapshot) {
        return;
      }
      restoreFromVault();
    } catch (restoreError) {
      handleRenderError(
        restoreError instanceof Error ? restoreError : new Error(String(restoreError)),
        'restore-history'
      );
    }
  }, [handleRenderError, restoreFromVault, uiIntegrity?.hasSnapshot]);

  // ═══ PHASE 5.3: MEMOIZED HANDLERS (éviter render loops) ═══
  const handleClearChat = useCallback(() => {
    try {
      if (messages.length === 0) return;

      if (window.confirm("Effacer tout l'historique du chat ?")) {
        clearChat();
      }
    } catch (clearError) {
      handleRenderError(
        clearError instanceof Error ? clearError : new Error(String(clearError)),
        'clear-chat'
      );
    }
  }, [messages.length, clearChat, handleRenderError]);

  const toggleSettings = useCallback(() => {
    try {
      setShowSettings(prev => !prev);
    } catch (settingsError) {
      handleRenderError(
        settingsError instanceof Error ? settingsError : new Error(String(settingsError)),
        'toggle-settings'
      );
    }
  }, [handleRenderError]);

  const toggleVoiceMode = useCallback(() => {
    try {
      setVoiceModeActive(prev => !prev);
    } catch (voiceError) {
      handleRenderError(
        voiceError instanceof Error ? voiceError : new Error(String(voiceError)),
        'toggle-voice'
      );
    }
  }, [handleRenderError]);

  // ═══ PHASE 5.4: MEMOIZED COMPUTATIONS ═══
  const chatInputPlaceholder = useMemo(() => {
    try {
      if (isLoading) return '🤖 TITANE∞ OMEGA génère une réponse...';
      if (voiceModeActive) return '🎤 Mode vocal actif - Parlez...';
      if (pageState.isCorrupted) return '🔄 Récupération en cours...';
      return '✨ Posez votre question...';
    } catch (placeholderError) {
      return '💬 Chat OMEGA';
    }
  }, [isLoading, voiceModeActive, pageState.isCorrupted]);

  const omnisStatsSafe = useMemo(() => {
    try {
      return (
        omnisStats || {
          failureCount: 0,
          autoHealCount: 0,
          pipelineHealth: 'unknown',
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          successRate: 0,
          engineVersion: 'unknown',
        }
      );
    } catch (statsError) {
      return {
        failureCount: 0,
        autoHealCount: 0,
        pipelineHealth: 'error',
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0,
        engineVersion: 'unknown',
      };
    }
  }, [omnisStats]);

  // ═══ PHASE 5.5: MOUNT PROTECTION ═══
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      isDev && console.log('[OMEGA CHAT PAGE] Component mounted with protection');
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ═══ PHASE 2 v24.7.4: KEYBOARD SHORTCUTS ═══
  const startNewConversation = useCallback(() => {
    // Trigger new conversation logic
    window.location.reload(); // Temporary: reload to reset state
  }, []);

  const toggleDebugPanel = useCallback(() => {
    setDebugPanelVisible(prev => !prev);
  }, []);

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '/',
        ctrl: true,
        action: toggleSettings,
        description: 'Afficher/masquer les paramètres',
      },
      {
        key: 'Escape',
        action: () => {
          if (showSettings) {
            setShowSettings(false);
          }
        },
        description: 'Fermer les fenêtres modales',
      },
      {
        key: 'n',
        ctrl: true,
        action: startNewConversation,
        description: 'Nouvelle conversation',
      },
      {
        key: 'd',
        ctrl: true,
        shift: true,
        action: toggleDebugPanel,
        description: 'Afficher/masquer le panneau de debug',
      },
    ],
    enabled: true,
  });

  // ═══ PHASE 2 v24.7.4: FOCUS TRAP FOR SETTINGS MODAL ═══
  useFocusTrap({
    ref: settingsPanelRef,
    isActive: showSettings,
    onEscape: () => setShowSettings(false),
  });

  // ═══ PHASE 5.6: CORRUPTION RECOVERY STATE ═══
  if (pageState.renderError && pageState.isCorrupted) {
    return (
      <div className="chat-page chat-page-critical">
        <div className="chat-critical-recovery">
          <div className="chat-critical-icon">🆘</div>
          <h2 className="chat-critical-title">Récupération critique OMEGA</h2>
          <p className="chat-critical-text">
            Erreur de rendu persistante détectée. Le système maintient la stabilité.
          </p>
          <div className="chat-critical-details">
            <span>Tentatives : {pageState.recoveryCount}</span>
            <span>Auto-heal : {omnisStatsSafe.autoHealCount}</span>
            <span>Version état : v{pageState.stateVersion}</span>
          </div>
          <div className="chat-critical-actions">
            <button onClick={resetError} className="chat-critical-reset">
              Réinitialiser l&apos;interface
            </button>
            <button
              onClick={() => window.location.reload()}
              className="chat-critical-reload"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ PHASE 5.7: MAIN RENDER WITH PROTECTION + v25.7.4 RESPONSIVE ═══
  try {
    return (
      <ResponsiveChatLayout>
        <div
          className="chat-page"
          data-omega-version="v19.2Ω"
          data-state-version={pageState.stateVersion}
        >
          {/* Enhanced Header with Status Bar + OMEGA Protection */}
          <div className="chat-header">
            <div className="chat-header-main">
              <div className="chat-header-info">
                <div className="chat-header-icon">🟣</div>
                <div className="chat-header-text">
                  <h1 className="chat-header-title">Chat IA TITANE∞ OMEGA</h1>
                  <p className="chat-header-subtitle">
                    Intelligence artificielle cognitive avec architecture auto-guérison
                  </p>
                </div>
              </div>

              {/* ═══ SÉLECTEUR DE MODE ═══ */}
              <div className="chat-header-mode">
                <ChatModeSelector
                  currentMode={currentChatMode}
                  onModeChange={handleModeChange}
                  userPermissionLevel={3}
                  variant="dropdown"
                  disabled={isLoading}
                />
              </div>

              <div className="chat-header-actions">
                <button
                  className="chat-action-btn"
                  onClick={handleClearChat}
                  disabled={messages.length === 0 || isLoading}
                  title="Effacer le chat"
                  aria-label="Effacer l'historique du chat"
                >
                  🗑️
                </button>
                <button
                  className="chat-action-btn"
                  onClick={handleRestoreHistory}
                  disabled={!uiIntegrity?.hasSnapshot}
                  title="Restaurer la dernière session stable"
                  aria-label="Restaurer l'historique sauvegardé"
                >
                  🛡️
                </button>
                <button
                  className="chat-action-btn"
                  onClick={toggleDebugPanelVisibility}
                  title={
                    debugPanelVisible
                      ? 'Masquer le panneau debug'
                      : 'Afficher le panneau debug'
                  }
                  aria-label={
                    debugPanelVisible
                      ? 'Masquer le panneau debug chat'
                      : 'Afficher le panneau debug chat'
                  }
                >
                  🛠️
                </button>
                <button
                  className="chat-action-btn"
                  onClick={toggleSettings}
                  title="Paramètres OMEGA"
                  aria-label="Ouvrir les paramètres"
                >
                  ⚙️
                </button>
              </div>
            </div>

            {/* OMEGA Status Bar */}
            <div className="chat-status-bar chat-status-omega">
              <div className="chat-status-item chat-status-provider">
                <span
                  className={`status-indicator status-${providerStatus.status}`}
                  role="status"
                  aria-live="polite"
                  aria-label={`Provider ${providerStatus.name} : statut ${providerStatus.status}`}
                />
                <span className="status-label">Actif:</span>
                <span
                  className="status-value"
                  title={
                    providerStatus.attemptedProviders?.length
                      ? `Tentatives: ${providerStatus.attemptedProviders
                          .map(provider => resolveProviderDisplayName(provider))
                          .join(' → ')}`
                      : undefined
                  }
                >
                  {providerStatus.name}
                </span>
                {providerStatus.autoHealed && (
                  <span
                    className="status-badge status-healed"
                    title="Auto-guérison activée"
                  >
                    🔄
                  </span>
                )}
                {providerStatus.lastError && (
                  <span
                    className="status-badge status-error"
                    title={providerStatus.lastError}
                  >
                    ⚠️
                  </span>
                )}
              </div>

              {/* Mode Badge compact dans status bar */}
              <div className="chat-status-item chat-status-mode">
                <ModeBadge
                  mode={currentChatMode}
                  size="small"
                  showLabel={true}
                  showTooltip={true}
                />
              </div>

              <div className="chat-status-item chat-status-preference">
                <span className="status-label">Préférence:</span>
                <select
                  className="chat-provider-select"
                  value={preferredProvider}
                  onChange={handlePreferredProviderChange}
                  aria-label="Sélection du provider IA"
                >
                  {PROVIDER_PREFERENCE_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {PROVIDER_PREFERENCE_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>

              {typeof providerStatus.latency === 'number' && (
                <div className="chat-status-item">
                  <span className="status-label">Latence:</span>
                  <span className="status-value">{providerStatus.latency}ms</span>
                </div>
              )}

              <div className="chat-status-item">
                <span className="status-label">Messages:</span>
                <span className="status-value">{messages?.length || 0}</span>
              </div>

              <div className="chat-status-item">
                <span className="status-label">Pipeline:</span>
                <span className={`status-value status-${omnisStatsSafe.pipelineHealth}`}>
                  {omnisStatsSafe.pipelineHealth}
                </span>
              </div>

              {omnisStatsSafe.autoHealCount > 0 && (
                <div className="chat-status-item chat-status-heal">
                  <span className="status-icon">🩹</span>
                  <span className="status-label">Auto-heal:</span>
                  <span className="status-value">{omnisStatsSafe.autoHealCount}</span>
                </div>
              )}

              {voiceModeActive && (
                <div className="chat-status-item chat-status-voice">
                  <span className="status-icon">🎤</span>
                  <span className="status-label">Voice Mode</span>
                </div>
              )}

              {pageState.recoveryCount > 0 && (
                <div className="chat-status-item chat-status-recovery">
                  <span className="status-icon">🔄</span>
                  <span className="status-label">Récupérations:</span>
                  <span className="status-value">{pageState.recoveryCount}</span>
                </div>
              )}

              {uiIntegrity?.preventedResets > 0 && (
                <div className="chat-status-item chat-status-ui-shield">
                  <span className="status-icon">🛡️</span>
                  <span className="status-label">UI Shield:</span>
                  <span className="status-value">{uiIntegrity.preventedResets}</span>
                </div>
              )}

              {debugEntries.length > 0 && (
                <div
                  className="chat-status-item chat-status-debug"
                  title="Entrées du panneau debug"
                >
                  <span className="status-label">Debug:</span>
                  <span className="status-value">{debugEntries.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Container with Protection */}
          <div className="chat-content">
            {error && pageState.renderError ? (
              <div className="chat-error-combined">
                <div className="chat-error-omega">
                  <span className="chat-error-icon">⚠️</span>
                  <div className="chat-error-content">
                    <strong>Erreurs multiples détectées</strong>
                    <p>Chat: {error}</p>
                    <p>Render: {pageState.renderError}</p>
                    <span className="chat-error-recovery">
                      OMEGA maintient la stabilité du système
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* P1-A: Use VirtualizedMessageList for performance (50+ messages → virtualization) */}
                <VirtualizedMessageList
                  messages={messages || []}
                  isLoading={isLoading}
                  error={error}
                />

                {/* ✨ v26.2: OMEGA Reflection Panel v2 - Compact mode by default */}
                {(thinking.isThinking || thinking.steps.length > 0) && (
                  <ThinkingPanel
                    isThinking={thinking.isThinking}
                    steps={thinking.steps}
                    compact={thinking.compact}
                    inline={false}
                    provider={lastProvider || undefined}
                    elapsedTime={thinking.isThinking ? elapsedTime : undefined}
                  />
                )}
              </>
            )}
          </div>

          {/* Enhanced Input with Voice Button + Protection */}
          <div className="chat-footer">
            {/* Voice Conversation Panel when active */}
            {voiceModeActive && (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                }}
              >
                <React.Suspense
                  fallback={
                    <div
                      style={{ padding: '1rem', textAlign: 'center', color: '#93b399' }}
                    >
                      🎤 Chargement conversation vocale...
                    </div>
                  }
                >
                  <VoiceConversation
                    onTranscript={text => {
                      isDev && console.log('[OMEGA] Voice transcript:', text);
                    }}
                    onResponse={response => {
                      isDev && console.log('[OMEGA] Voice response:', response);
                    }}
                  />
                </React.Suspense>
              </div>
            )}

            {/* ✨ v24.3.0 - Provider Readiness Warning */}
            {preferredProvider !== 'auto' &&
              preferredProvider !== 'local' &&
              preferredProvider !== 'ollama' &&
              !providerReadiness[preferredProvider] && (
                <div
                  className="chat-provider-warning"
                  style={{
                    padding: '12px 16px',
                    marginBottom: '8px',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: '8px',
                    color: '#ffc107',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <span>
                    <strong>{preferredProvider.toUpperCase()}</strong> n&apos;est pas
                    configuré. Le système basculera automatiquement vers un provider
                    disponible. Pour utiliser {preferredProvider}, ajoutez votre clé API
                    dans <strong>Gouvernance → Secrets</strong>.
                  </span>
                </div>
              )}

            {/* ═══ v25.5.0 - CHAT TOOLBAR COMPLET ═══ */}
            <ChatToolbar
              onFileImport={files => {
                isDev && console.log('[Chat] Files imported:', files.length);
                // Créer un résumé des fichiers pour le message
                const fileNames = Array.from(files)
                  .map(f => f.name)
                  .join(', ');
                sendMessage(
                  `📎 Fichiers importés pour analyse: ${fileNames}\n\nAnalyse ces fichiers et donne-moi un résumé.`
                );
              }}
              onScreenCapture={imageData => {
                isDev &&
                  console.log('[Chat] Screenshot captured, size:', imageData.length);
                // Stocker l&apos;image et envoyer pour analyse
                setAttachedImages(prev => [...prev, imageData]);
                sendMessage(
                  `📸 [Capture d&apos;écran attachée]\n\nAnalyse cette capture d&apos;écran et décris ce que tu vois.`
                );
              }}
              onImageAnalysis={(imageData, prompt) => {
                isDev && console.log('[Chat] Image analysis requested:', prompt);
                // Stocker l&apos;image et envoyer pour analyse Vision IA
                setAttachedImages(prev => [...prev, imageData]);
                sendMessage(
                  `👁️ [Image attachée pour analyse Vision IA]\n\n${prompt || 'Analyse cette image en détail et décris ce que tu vois.'}`
                );
              }}
              onDictationResult={text => {
                isDev && console.log('[Chat] Dictation result:', text);
                // Stocker le texte dicté pour l&apos;utiliser dans ChatInput
                setPendingDictationText(prev => (prev ? `${prev} ${text}` : text));
                // Envoyer directement le message dicté
                if (text.trim()) {
                  sendMessage(text);
                }
              }}
              onAudioRecorded={audioBlob => {
                isDev && console.log('[Chat] Audio recorded:', audioBlob.size, 'bytes');
                const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
                sendMessage(
                  `🎤 [Message vocal enregistré - ${sizeMB} MB]\n\nTranscris et analyse ce message audio.`
                );
              }}
              onTranscriptionResult={text => {
                isDev && console.log('[Chat] Transcription result:', text);
                sendMessage(
                  `📝 Transcription audio:\n\n"${text}"\n\nRésume et analyse ce contenu.`
                );
              }}
              onToggleAudioConversation={active => {
                isDev && console.log('[Chat] Audio conversation:', active ? 'ON' : 'OFF');
                if (active && !voiceModeActive) {
                  toggleVoiceMode();
                } else if (!active && voiceModeActive) {
                  toggleVoiceMode();
                }
              }}
              onToggleCameraLive={active => {
                isDev && console.log('[Chat] Camera live:', active ? 'ON' : 'OFF');
                // La caméra est gérée via useVisionStore dans ChatToolbar
              }}
              onToggleTTS={active => {
                isDev && console.log('[Chat] TTS:', active ? 'ON' : 'OFF');
                setTtsEnabled(active);
              }}
              disabled={isLoading || pageState.isCorrupted}
              compact={false}
            />

            <ChatInput
              onSend={sendMessage}
              disabled={isLoading || pageState.isCorrupted}
              voiceModeActive={voiceModeActive}
              onToggleVoiceMode={toggleVoiceMode}
              placeholder={chatInputPlaceholder}
            />
          </div>

          {/* Settings Panel (Modal) with OMEGA Stats */}
          {showSettings && (
            <div className="chat-settings-overlay" onClick={toggleSettings}>
              <div
                ref={settingsPanelRef}
                className="chat-settings-panel"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
              >
                <div className="chat-settings-header">
                  <h2 id="settings-title" className="chat-settings-title">
                    Paramètres OMEGA v19.2Ω
                  </h2>
                  <button
                    className="chat-settings-close"
                    onClick={toggleSettings}
                    aria-label="Fermer les paramètres"
                  >
                    ✕
                  </button>
                </div>

                <div className="chat-settings-content">
                  <div className="chat-setting-section">
                    <h3 className="chat-setting-section-title">🤖 Provider IA</h3>
                    <div className="chat-setting-item">
                      <label
                        className="chat-setting-label"
                        htmlFor="omega-provider-preference"
                      >
                        Préférence moteur
                      </label>
                      <select
                        id="omega-provider-preference"
                        className="chat-provider-select"
                        value={preferredProvider}
                        onChange={handlePreferredProviderChange}
                        aria-label="Sélection du provider IA préféré"
                      >
                        {PROVIDER_PREFERENCE_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {PROVIDER_PREFERENCE_LABELS[option]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Dernier provider actif</label>
                      <div className="chat-setting-value">
                        {providerStatus.name}
                        {typeof providerStatus.latency === 'number'
                          ? ` • ${providerStatus.latency}ms`
                          : ''}
                      </div>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Dernière erreur</label>
                      <div className="chat-setting-value">
                        {providerStatus.lastError ?? 'Aucune'}
                      </div>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Entrées debug</label>
                      <div className="chat-setting-value">{debugEntries.length}</div>
                    </div>
                    {providerStatus.attemptedProviders?.length ? (
                      <div className="chat-setting-item">
                        <label className="chat-setting-label">Ordre tentatives</label>
                        <div className="chat-setting-value">
                          {providerStatus.attemptedProviders
                            .map(provider => resolveProviderDisplayName(provider))
                            .join(' → ')}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="chat-setting-section">
                    <h3 className="chat-setting-section-title">📊 Statistiques OMEGA</h3>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Messages en mémoire</label>
                      <div className="chat-setting-value">
                        {messages?.length || 0} messages
                      </div>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Pipeline Health</label>
                      <div className="chat-setting-value">
                        {omnisStatsSafe.pipelineHealth}
                      </div>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Auto-guérisons</label>
                      <div className="chat-setting-value">
                        {omnisStatsSafe.autoHealCount} réparations automatiques
                      </div>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Récupérations UI</label>
                      <div className="chat-setting-value">
                        {pageState.recoveryCount} récupérations render
                      </div>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">UI Shield</label>
                      <div className="chat-setting-value">
                        {uiIntegrity?.preventedResets ?? 0} protections — version{' '}
                        {uiIntegrity?.version ?? 1}
                      </div>
                    </div>
                  </div>

                  <div className="chat-setting-section">
                    <h3 className="chat-setting-section-title">🔧 Configuration</h3>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">Version OMEGA</label>
                      <div className="chat-setting-value">
                        v19.2Ω (État: v{pageState.stateVersion})
                      </div>
                    </div>
                    <div className="chat-setting-item">
                      <label className="chat-setting-label">API Keys</label>
                      <div className="chat-setting-value">
                        Voir .env pour VITE_GEMINI_API_KEY
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ChatDebugPanel
            visible={debugPanelVisible}
            collapsed={debugPanelCollapsed}
            onToggleCollapsed={toggleDebugPanelCollapsed}
            onToggleVisible={toggleDebugPanelVisibility}
            position={debugPanelPosition}
            onPositionChange={handleDebugPanelPositionChange}
            entries={debugEntries}
          />
        </div>
      </ResponsiveChatLayout>
    );
  } catch (renderError) {
    // ═══ ULTIMATE FALLBACK RENDER ═══
    handleRenderError(
      renderError instanceof Error ? renderError : new Error(String(renderError)),
      'main-render'
    );

    return (
      <div className="chat-page chat-page-emergency">
        <div className="chat-emergency">
          <h1>🆘 OMEGA Emergency Mode</h1>
          <p>Erreur de rendu critique interceptée. Système en mode sécurisé.</p>
          <button onClick={() => window.location.reload()}>
            Recharger l&apos;application
          </button>
        </div>
      </div>
    );
  }
};

export default Chat;
