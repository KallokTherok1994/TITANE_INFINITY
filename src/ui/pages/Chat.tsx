/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — CHAT PAGE OMEGA (UI ANTI-CRASH)
 *   PHASE 5Ω: Protection render • État stable • Récupération auto
 *   Chat IA avec protection render loops et gestion états corrompus
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from '../../components/chat/MessageList';
import { ChatInput } from '../../components/chat/ChatInput';
import { autoHealEngine } from '../../services/ai/autoHealEngine';
import './styles/Chat.css';

const isDev = process.env.NODE_ENV === 'development';

interface ProviderStatus {
  name: string;
  status: 'online' | 'offline' | 'connecting' | 'error';
  latency?: number;
  lastError?: string;
  autoHealed?: boolean;
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
    isCorrupted: false
  });

  const renderAttempts = useRef(0);
  const maxRenderAttempts = 3;

  const handleRenderError = useCallback((error: Error, context: string) => {
    renderAttempts.current++;

    // Auto-heal trigger
    autoHealEngine.heal('chat-page', error, 'validation', {
      context,
      renderAttempts: renderAttempts.current,
      timestamp: Date.now()
    });

    setPageState(prev => ({
      ...prev,
      renderError: error.message,
      recoveryCount: prev.recoveryCount + 1,
      lastRecovery: Date.now(),
      stateVersion: prev.stateVersion + 1,
      isCorrupted: renderAttempts.current >= maxRenderAttempts
    }));

    isDev && console.error('[OMEGA CHAT PAGE] Render error handled:', error, context);
  }, []);

  const resetError = useCallback(() => {
    renderAttempts.current = 0;
    setPageState(prev => ({
      ...prev,
      renderError: null,
      isCorrupted: false,
      stateVersion: prev.stateVersion + 1
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
export const Chat: React.FC = () => {
  const mountedRef = useRef(false);
  const { pageState, handleRenderError, resetError } = useOmegaRenderProtection();
  const [showSettings, setShowSettings] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);

  // ═══ PHASE 5.1: PROTECTED HOOKS ═══
  const chatHookResult = useChat({
    voiceEnabled: voiceModeActive
  });

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    omnisStats,
    uiIntegrity,
    restoreFromVault
  } = chatHookResult;

  useEffect(() => {
    if (error) {
      handleRenderError(new Error(error), 'useChat-hook');
    }
  }, [error, handleRenderError]);

  // ═══ PHASE 5.2: PROTECTED STATE ═══
  const [providerStatus, _setProviderStatus] = useState<ProviderStatus>({
    name: 'OMEGA Neural',
    status: 'online',
    latency: 245,
    autoHealed: omnisStats?.autoHealCount > 0
  });

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

      if (window.confirm('Effacer tout l\'historique du chat ?')) {
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
      return omnisStats || {
        failureCount: 0,
        autoHealCount: 0,
        pipelineHealth: 'unknown',
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0,
        engineVersion: 'unknown'
      };
    } catch (statsError) {
      return {
        failureCount: 0,
        autoHealCount: 0,
        pipelineHealth: 'error',
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0,
        engineVersion: 'unknown'
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

  // ═══ PHASE 5.6: CORRUPTION RECOVERY STATE ═══
  if (pageState.renderError && pageState.isCorrupted) {
    return (
      <div className="chat-page chat-page-critical">
        <div className="chat-critical-recovery">
          <div className="chat-critical-icon">🆘</div>
          <h2 className="chat-critical-title">
            Récupération critique OMEGA
          </h2>
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
              Réinitialiser l'interface
            </button>
            <button onClick={() => window.location.reload()} className="chat-critical-reload">
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ PHASE 5.7: MAIN RENDER WITH PROTECTION ═══
  try {
    return (
      <div className="chat-page" data-omega-version="v19.2Ω" data-state-version={pageState.stateVersion}>
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
            <div className="chat-status-item">
              <span className={`status-indicator status-${providerStatus.status}`}
                    aria-label={`Provider ${providerStatus.status}`} />
              <span className="status-label">Provider:</span>
              <span className="status-value">{providerStatus.name}</span>
              {providerStatus.autoHealed && (
                <span className="status-badge status-healed" title="Auto-guérison activée">🔄</span>
              )}
            </div>

            {providerStatus.latency && (
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
            <MessageList
              messages={messages || []}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        {/* Enhanced Input with Voice Button + Protection */}
        <div className="chat-footer">
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
            <div className="chat-settings-panel" onClick={(e) => e.stopPropagation()}>
              <div className="chat-settings-header">
                <h2 className="chat-settings-title">Paramètres OMEGA v19.2Ω</h2>
                <button
                  className="chat-settings-close"
                  onClick={toggleSettings}
                >
                  ✕
                </button>
              </div>

              <div className="chat-settings-content">
                <div className="chat-setting-section">
                  <h3 className="chat-setting-section-title">🤖 Provider IA</h3>
                  <div className="chat-setting-item">
                    <label className="chat-setting-label">Order Neural OMEGA</label>
                    <div className="chat-setting-value">
                      Local Infaillible → Tauri Rust → Gemini Cloud → Ollama LLM
                    </div>
                  </div>
                  <div className="chat-setting-item">
                    <label className="chat-setting-label">Modèle actif</label>
                    <div className="chat-setting-value">
                      {providerStatus.name} (Latence: {providerStatus.latency}ms)
                    </div>
                  </div>
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
                      {uiIntegrity?.preventedResets ?? 0} protections — version {uiIntegrity?.version ?? 1}
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
      </div>
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
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }
};

export default Chat;
