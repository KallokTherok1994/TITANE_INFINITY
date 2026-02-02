/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ConversationSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Chat UI, message management, voice input, TTS
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useDeferredValue,
  memo,
} from 'react';
import { useToast } from '@/hooks/useToast';
import { useConversationEngine } from '@hooks/useConversationEngine';
import type { ConversationMode } from '@/services/conversationEngine';
import type { AnalyzedFile } from '@/components/chat/FileUploadButton';
import { ThinkingPanel, useThinkingSteps } from '@/features/chat/ThinkingPanel';
import {
  downloadConversation,
  downloadMarkdown,
  copyToClipboard,
} from '@/features/chat/exportImport';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { ChatToolbar } from '@/components/chat/ChatToolbar';
import { ModeBuilder, type CustomMode } from '@/components/conversation/ModeBuilder';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { TSectionHeader } from '@/design-system';
import { Download, FileText, Copy, Trash2, Search } from 'lucide-react';
import { colors } from '@themes/tokens';
import { Card } from '@/ui';
import { createLogger } from '@/utils/logger';

const pageLogger = createLogger('ConversationSection');

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

type ConversationSectionProps = Record<string, never>;

interface ConversationMessageItem {
  id?: string;
  role: 'user' | 'assistant' | string;
  content: string;
  metadata?: {
    tags?: string[];
    intention?: string;
  };
}

const AVAILABLE_PROVIDERS = [
  { id: 'gemini', name: 'Gemini', icon: '✨', available: true },
  { id: 'ollama', name: 'Ollama', icon: '🦙', available: true },
  { id: 'openai', name: 'OpenAI', icon: '🤖', available: true },
  { id: 'claude', name: 'Claude', icon: '🧠', available: true },
];

const BUILT_IN_CONVERSATION_MODES = [
  { id: 'default', name: 'Normal', icon: '💬', description: 'Conversation standard' },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    icon: '💡',
    description: 'Idéation créative',
  },
  { id: 'synthesis', name: 'Synthèse', icon: '📝', description: 'Résumé et analyse' },
  {
    id: 'planning',
    name: 'Planification',
    icon: '📋',
    description: 'Stratégie et organisation',
  },
  {
    id: 'journal',
    name: 'Journal',
    icon: '📔',
    description: 'Réflexion personnelle',
  },
  {
    id: 'debug_cognitive',
    name: 'Debug Cognitif',
    icon: '🔧',
    description: 'Analyse système',
  },
];

const CONVERSATION_SUGGESTIONS = [
  { label: '💡 Brainstorm ideas', value: 'Help me brainstorm some ideas for...' },
  { label: '📝 Summarize', value: 'Please summarize the key points...' },
  { label: '🔍 Analyze', value: 'Analyze this for me...' },
  { label: '💬 Explain', value: 'Explain this concept...' },
];

/**
 * Sanitize input pour sécurité renforcée (XSS prevention)
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .slice(0, 10000);
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ConversationMessage = memo(
  ({
    message,
    isLoading,
    onCopy,
    onRetry,
    onDelete,
  }: {
    message: ConversationMessageItem;
    isLoading: boolean;
    onCopy: (content: string) => void;
    onRetry: (content: string) => void;
    onDelete: (id: string) => void;
  }) => {
    const handleCopy = useCallback(
      () => onCopy(message.content),
      [message.content, onCopy]
    );
    const handleRetry = useCallback(
      () => onRetry(message.content),
      [message.content, onRetry]
    );
    const handleDelete = useCallback(() => {
      if (message.id) {
        onDelete(message.id);
      }
    }, [message.id, onDelete]);

    return (
      <div className={`conversation-message ${message.role}`}>
        <div className="conversation-message-avatar">
          {message.role === 'user' ? '👤' : '🧠'}
        </div>
        <div className="conversation-message-content">
          <div className="conversation-message-header">
            <span className="conversation-message-role">
              {message.role === 'user' ? 'Vous' : 'TITANE'}
            </span>
            {message.metadata?.tags && message.metadata.tags.length > 0 && (
              <div className="conversation-message-tags">
                {message.metadata.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="conversation-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="conversation-message-text">{message.content}</div>
          {message.metadata?.intention && (
            <div className="conversation-message-meta">
              <span className="meta-intention">{message.metadata.intention}</span>
            </div>
          )}

          <div className="conversation-message-actions">
            <button
              type="button"
              className="conversation-message-action"
              onClick={handleCopy}
              title="Copier le message"
            >
              📋 Copier
            </button>

            {message.role === 'user' && (
              <button
                type="button"
                className="conversation-message-action"
                onClick={handleRetry}
                title="Renvoyer ce message"
                disabled={isLoading}
              >
                🔄 Retry
              </button>
            )}

            <button
              type="button"
              className="conversation-message-action danger"
              onClick={handleDelete}
              title="Supprimer ce message"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ConversationMessage.displayName = 'ConversationMessage';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ConversationSection: React.FC<ConversationSectionProps> = memo(() => {
  // ═══ HOOKS ═══
  const { success: toastSuccess, error: errorToast } = useToast();
  const {
    messages,
    isLoading,
    error,
    currentMode,
    setMode,
    sendMessage,
    clearMessages,
    deleteMessage,
    healthReport,
    refreshHealth,
  } = useConversationEngine({
    mode: 'default',
    autoHealthCheck: false,
    maxMessages: 500,
  });

  // ═══ STATE ═══
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [inputValue, setInputValue] = useState('');
  const [showModeBuilder, setShowModeBuilder] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [customModes, setCustomModes] = useState<CustomMode[]>([]);
  const [_attachedImages, setAttachedImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'assistant'>('all');
  const [_cameraActive, setCameraActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // ═══ THINKING STEPS ═══
  const thinking = useThinkingSteps();

  // ═══ VOICE ENGINE ═══
  const handleVoiceTranscript = useCallback((text: string) => {
    setInputValue(prev => (prev ? `${prev} ${text}` : text));
  }, []);

  const handleVoiceError = useCallback((error: unknown) => {
    pageLogger.error('Voice recognition error', error);
  }, []);

  const voiceEngine = useVoiceEngine({
    language: 'fr-FR',
    onTranscript: handleVoiceTranscript,
    onError: handleVoiceError,
  });

  // ═══ HANDLERS ═══
  const handleCopyMessage = useCallback(
    async (content: string) => {
      try {
        await navigator.clipboard.writeText(content);
      } catch (err) {
        pageLogger.warn('Copy message failed', err);
        errorToast('Impossible de copier le message');
      }
    },
    [errorToast]
  );

  const handleRetryMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;
      thinking.startThinking();
      try {
        await sendMessage(content);
      } finally {
        thinking.stopThinking();
      }
    },
    [isLoading, sendMessage, thinking]
  );

  const handleSuggestionClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const value = e.currentTarget.dataset.value;
      if (value) setInputValue(value);
    },
    []
  );

  // ═══ COMPUTED VALUES ═══
  const conversationModes = useMemo(() => {
    const customModesFormatted = customModes.map(m => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      description: m.description,
    }));

    return [...BUILT_IN_CONVERSATION_MODES, ...customModesFormatted];
  }, [customModes]);

  const currentModeLabel = useMemo(
    () => conversationModes.find(m => m.id === currentMode)?.name ?? '—',
    [conversationModes, currentMode]
  );

  const selectedProviderLabel = useMemo(
    () =>
      AVAILABLE_PROVIDERS.find(p => p.id === selectedProvider)?.name ?? selectedProvider,
    [selectedProvider]
  );

  const conversationModeOptions = useMemo(
    () =>
      conversationModes.map(mode => (
        <option key={mode.id} value={mode.id}>
          {mode.icon} {mode.name}
        </option>
      )),
    [conversationModes]
  );

  const hasMessages = messages.length > 0;
  const isHealthy = healthReport?.status === 'Healthy';

  const searchNeedle = useMemo(() => {
    const trimmed = deferredSearchQuery.trim();
    return trimmed ? trimmed.toLowerCase() : '';
  }, [deferredSearchQuery]);

  const filteredMessages = useMemo(() => {
    if (!searchNeedle && filterRole === 'all') {
      return messages;
    }

    let result = messages;

    if (searchNeedle) {
      result = result.filter(m => m.content.toLowerCase().includes(searchNeedle));
    }

    if (filterRole !== 'all') {
      result = result.filter(m => m.role === filterRole);
    }

    return result;
  }, [messages, searchNeedle, filterRole]);

  const filteredCount = filteredMessages.length;
  const messageCount = messages.length;

  const messageItems = useMemo(
    () =>
      filteredMessages.map((msg, index) => (
        <ConversationMessage
          key={msg.id || `msg-${index}`}
          message={msg}
          isLoading={isLoading}
          onCopy={handleCopyMessage}
          onRetry={handleRetryMessage}
          onDelete={deleteMessage}
        />
      )),
    [filteredMessages, isLoading, handleCopyMessage, handleRetryMessage, deleteMessage]
  );

  const suggestionButtons = useMemo(
    () =>
      CONVERSATION_SUGGESTIONS.map(suggestion => (
        <button
          key={suggestion.value}
          type="button"
          data-value={suggestion.value}
          onClick={handleSuggestionClick}
        >
          {suggestion.label}
        </button>
      )),
    []
  );

  // ═══ EFFECTS ═══
  useEffect(() => {
    try {
      const stored = localStorage.getItem('titane_custom_modes');
      if (stored) {
        setCustomModes(JSON.parse(stored));
      }
    } catch (error) {
      pageLogger.error('Erreur chargement modes custom', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ═══ MORE HANDLERS ═══
  const handleSaveCustomMode = useCallback((mode: CustomMode) => {
    setCustomModes(prev => [...prev, mode]);
    pageLogger.debug('Mode personnalisé sauvegardé', mode);
  }, []);

  const handleSend = useCallback(async () => {
    const rawInput = inputValue;
    const trimmedInput = rawInput.trim();
    if (!trimmedInput || isLoading || sendingRef.current) return;
    sendingRef.current = true;

    const sanitized = sanitizeInput(rawInput);
    if (!sanitized || sanitized.length === 0) {
      pageLogger.debug('Input vide apres sanitization');
      sendingRef.current = false;
      return;
    }

    const messageText = sanitized;
    setInputValue('');

    thinking.startThinking();
    thinking.addStep('analysis', 'Analyse de votre message...');

    try {
      thinking.addStep('reasoning', 'Traitement par le pipeline OMEGA...');
      const response = await sendMessage(messageText);

      thinking.addStep('synthesis', 'Génération de la réponse...');
      thinking.stopThinking();

      if (audioEnabled && response?.assistant_message) {
        try {
          await hybridTTS.speak(response.assistant_message, {
            rate: 1.0,
            pitch: 1.0,
            lang: 'fr-FR',
          });
        } catch (ttsError) {
          pageLogger.warn('TTS error (non-critical)', ttsError);
          setAudioEnabled(false);
        }
      }
    } catch (err) {
      pageLogger.error('Send message error', err);
      thinking.stopThinking();
    } finally {
      sendingRef.current = false;
    }
  }, [inputValue, isLoading, sendMessage, audioEnabled, thinking]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleClearChat = useCallback(() => {
    if (confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
      clearMessages();
    }
  }, [clearMessages]);

  const handleExportJson = useCallback(() => {
    downloadConversation('current', 'Conversation TITANE', messages);
  }, [messages]);

  const handleExportMarkdown = useCallback(() => {
    downloadMarkdown('Conversation TITANE', messages);
  }, [messages]);

  const handleCopyAll = useCallback(async () => {
    const copySuccess = await copyToClipboard('Conversation TITANE', messages);
    if (copySuccess) toastSuccess('Conversation copiée.');
  }, [messages, toastSuccess]);

  const handleVoiceInput = useCallback(async () => {
    if (!voiceEngine.status.isMicAvailable) {
      errorToast('Microphone non disponible. Vérifiez les permissions.');
      return;
    }

    try {
      if (voiceEngine.status.isRecording) {
        const finalTranscript = await voiceEngine.stopDictation();
        setIsRecording(false);
        pageLogger.debug('Voice dictation stopped', finalTranscript);
      } else {
        await voiceEngine.startDictation();
        setIsRecording(true);
        pageLogger.debug('Voice dictation started');
      }
    } catch (error) {
      pageLogger.error('Voice input error', error);
      setIsRecording(false);
      errorToast('Erreur reconnaissance vocale. Consultez la console.');
    }
  }, [errorToast, voiceEngine]);

  const handleFilesAnalyzed = useCallback(
    (files: AnalyzedFile[]) => {
      const filesSummary = files
        .map(file => {
          const lines = [
            `📄 **${file.name}**`,
            `- Taille: ${(file.size / 1024).toFixed(1)} KB`,
          ];

          if (file.analysis?.summary) {
            lines.push(`- Résumé: ${file.analysis.summary}`);
          }

          return lines.join('\n');
        })
        .join('\n\n');

      sendMessage(
        `📎 Fichiers importés pour analyse:\n\n${filesSummary}\n\nAnalyse ces fichiers.`
      );
    },
    [sendMessage]
  );

  const handleFileImport = useCallback(
    (files: FileList) => {
      const fileNames = Array.from(files)
        .map(f => f.name)
        .join(', ');
      sendMessage(`📎 Fichiers: ${fileNames}\n\nAnalyse ces fichiers.`);
    },
    [sendMessage]
  );

  const handleScreenCapture = useCallback(
    (imageData: string) => {
      setAttachedImages(prev => [...prev, imageData]);
      sendMessage('📸 [Capture ecran]\n\nAnalyse cette capture.');
    },
    [sendMessage]
  );

  const handleImageAnalysis = useCallback(
    (imageData: string, prompt?: string) => {
      setAttachedImages(prev => [...prev, imageData]);
      sendMessage(`👁️ [Image]\n\n${prompt || 'Analyse cette image.'}`);
    },
    [sendMessage]
  );

  const handleDictationResult = useCallback((text: string) => {
    if (text.trim()) setInputValue(prev => (prev ? `${prev} ${text}` : text));
  }, []);

  const handleAudioRecorded = useCallback(
    (audioBlob: Blob) => {
      const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
      sendMessage(`🎤 [Audio - ${sizeMB} MB]\n\nTranscris ce message.`);
    },
    [sendMessage]
  );

  const handleTranscriptionResult = useCallback(
    (text: string) => {
      sendMessage(`📝 Transcription:\n\n"${text}"\n\nAnalyse ce contenu.`);
    },
    [sendMessage]
  );

  const handleModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMode(e.target.value as ConversationMode);
    },
    [setMode]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterRoleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterRole(e.target.value as typeof filterRole);
    },
    []
  );

  const toggleAudioEnabled = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  const toggleModeBuilder = useCallback(() => {
    setShowModeBuilder(prev => !prev);
  }, []);

  const handleToggleAudioConversation = useCallback((active: boolean) => {
    setAudioEnabled(active);
  }, []);

  const handleToggleTTS = useCallback((active: boolean) => {
    setAudioEnabled(active);
  }, []);

  const handleToggleCameraLive = useCallback(() => {
    setCameraActive(prev => !prev);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleCloseModeBuilder = useCallback(() => {
    setShowModeBuilder(false);
  }, []);

  // ═══ RENDER ═══
  return (
    <div className="titane-section titane-section-conversation">
      <TSectionHeader
        title="💬 Communication & Intelligence"
        subtitle="Interface conversationnelle multi-provider avec modes spécialisés"
      />

      <div className="conversation-container">
        {/* ═══ TOOLBAR ═══ */}
        <div className="conversation-toolbar">
          <div className="conversation-toolbar-left">
            <ChatProviderSelector
              selectedProvider={selectedProvider}
              onChange={setSelectedProvider}
              providers={AVAILABLE_PROVIDERS}
            />

            {/* Mode Selector */}
            <select
              className="conversation-mode-select"
              value={currentMode}
              onChange={handleModeChange}
            >
              {conversationModeOptions}
            </select>
          </div>

          <div className="conversation-toolbar-right">
            {/* Export JSON */}
            <button
              className="conversation-icon-btn"
              onClick={handleExportJson}
              title="Exporter en JSON"
              disabled={!hasMessages}
            >
              <Download size={16} />
            </button>

            {/* Export Markdown */}
            <button
              className="conversation-icon-btn"
              onClick={handleExportMarkdown}
              title="Exporter en Markdown"
              disabled={!hasMessages}
            >
              <FileText size={16} />
            </button>

            {/* Copy to Clipboard */}
            <button
              className="conversation-icon-btn"
              onClick={handleCopyAll}
              title="Copier dans le presse-papier"
              disabled={!hasMessages}
            >
              <Copy size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              className={`conversation-icon-btn ${audioEnabled ? 'active' : ''}`}
              onClick={toggleAudioEnabled}
              title="Audio (TTS)"
              aria-label={audioEnabled ? 'Désactiver audio (TTS)' : 'Activer audio (TTS)'}
              aria-pressed={audioEnabled}
              role="switch"
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>

            {/* Voice Input */}
            <button
              className={`conversation-icon-btn ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceInput}
              title="Reconnaissance vocale"
              aria-label={
                isRecording
                  ? "Arrêter l'enregistrement"
                  : 'Démarrer reconnaissance vocale'
              }
              aria-pressed={isRecording}
            >
              🎤
            </button>

            {/* Mode Builder */}
            <button
              className="conversation-icon-btn"
              onClick={toggleModeBuilder}
              title="Créer un mode personnalisé"
              aria-label="Créer un mode personnalisé"
            >
              ⚙️
            </button>

            {/* Health Check */}
            <button
              className={`conversation-icon-btn ${isHealthy ? 'healthy' : ''}`}
              onClick={refreshHealth}
              title={`Santé: ${healthReport?.status || 'Unknown'}`}
              aria-label={`Vérifier santé du système (Statut: ${healthReport?.status || 'Inconnu'})`}
            >
              {isHealthy ? '✅' : '⚠️'}
            </button>

            {/* Clear Chat */}
            <button
              className="conversation-icon-btn"
              onClick={handleClearChat}
              title="Effacer l'historique"
              aria-label="Effacer l'historique du chat"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ═══ SEARCH / FILTERS ═══ */}
        <div className="conversation-filters">
          <div className="conversation-filters-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Rechercher dans la conversation"
            />
          </div>

          <select
            className="conversation-filters-role"
            value={filterRole}
            onChange={handleFilterRoleChange}
            aria-label="Filtrer par rôle"
          >
            <option value="all">Tous</option>
            <option value="user">Utilisateur</option>
            <option value="assistant">TITANE</option>
          </select>

          <div className="conversation-filters-count">
            {filteredCount}/{messageCount}
          </div>
        </div>

        {/* ═══ THINKING PANEL ═══ */}
        <ThinkingPanel
          steps={thinking.steps}
          isThinking={thinking.isThinking}
          compact={thinking.compact}
          inline={false}
        />

        {/* ═══ MESSAGES AREA ═══ */}
        <div className="conversation-messages">
          {messages.length === 0 && !thinking.isThinking && (
            <div className="conversation-empty">
              <div className="conversation-empty-icon">🧠⚡∞</div>
              <h3>TITANE∞ est prêt à converser</h3>
              <p>
                Mode actuel: <strong>{currentModeLabel}</strong>
                <br />
                Provider: <strong>{selectedProviderLabel}</strong>
              </p>
              <div className="conversation-empty-suggestions">{suggestionButtons}</div>
            </div>
          )}

          {messageItems}

          {isLoading && (
            <div className="conversation-message assistant loading">
              <div className="conversation-message-avatar">🧠</div>
              <div className="conversation-message-content">
                <div className="conversation-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <small style={{ color: colors.neutral[400] }}>TITANE réfléchit...</small>
              </div>
            </div>
          )}

          {error && (
            <div className="conversation-error">
              <strong>❌ Erreur:</strong> {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ═══ CHAT TOOLBAR (v25.5.0) ═══ */}
        <ChatToolbar
          onFilesAnalyzed={handleFilesAnalyzed}
          onFileImport={handleFileImport}
          onScreenCapture={handleScreenCapture}
          onImageAnalysis={handleImageAnalysis}
          onDictationResult={handleDictationResult}
          onAudioRecorded={handleAudioRecorded}
          onTranscriptionResult={handleTranscriptionResult}
          onToggleAudioConversation={handleToggleAudioConversation}
          onToggleCameraLive={handleToggleCameraLive}
          onToggleTTS={handleToggleTTS}
          disabled={isLoading}
          compact={false}
        />

        {/* ═══ INPUT AREA ═══ */}
        <div className="conversation-input-container">
          <textarea
            className="conversation-input"
            placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={3}
          />
          <button
            className="conversation-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'} Envoyer
          </button>
        </div>

        {/* ═══ MODE BUILDER MODAL ═══ */}
        {showModeBuilder && (
          <ModeBuilder onClose={handleCloseModeBuilder} onSave={handleSaveCustomMode} />
        )}
      </div>
    </div>
  );
});

ConversationSection.displayName = 'ConversationSection';
