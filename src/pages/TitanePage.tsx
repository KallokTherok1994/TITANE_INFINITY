/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.3.0 — TITANE — LE CŒUR DU SYSTÈME
 *
 * FUSION ULTIME de 3 modules majeurs:
 * - Chat IA (/chat) → Communication & Intelligence Conversationnelle
 * - Vision (/camera) → Perception Visuelle & Affect Estimation
 * - EVO (/evo) → Évolution Totale (Dashboard, Identity, Memory, Progression)
 *
 * 8 SECTIONS UNIFIÉES:
 * 💬 CONVERSATION - Interface Chat IA multi-provider
 * 📷 VISION & PERCEPTION - Analyse visuelle et affective
 * 📊 VUE D'ENSEMBLE - Dashboard système et stats
 * 🧬 IDENTITÉ & ADN - Matrice identité, modes, pacte
 * 💾 MÉMOIRE TRIPLE - Architecture court/moyen/long terme
 * 🔄 ÉVOLUTION MÉMOIRE - Dynamiques internes et journal
 * ⚡ PROGRESSION & XP - Système XP, milestones, talents
 * 🌱 TRANSFORMATION - Lignes d'évolution et paliers
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Container, Stack, Grid } from '@components/layout';
import { Button, Card } from '../ui';
import { XPProgressBar } from '@features/progression';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { PersonaMoodIndicator } from '@components/PersonaMoodIndicator';
import { useVisualEngines } from '@hooks/useVisualEngines';
import {
  useVisionStore,
  selectIsCameraActive,
  selectIsObservationActive,
  selectEnergyLevel,
  selectTensionLevel,
  selectEngagementLevel,
  selectConfidence,
} from '@/stores/useVisionStore';
import { useConversationEngine } from '@hooks/useConversationEngine';
import type { ConversationMode } from '@/services/conversationEngine';
import { TitaneLogo } from '@components/branding/TitaneLogo';
import { TBadge, TMetric, TSectionHeader } from '../design-system';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import { CameraPreview } from '@/components/vision/CameraPreview';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { ChatToolbar } from '@/components/chat/ChatToolbar';
import { ThinkingPanel, useThinkingSteps } from '@/features/chat/ThinkingPanel';
import {
  downloadConversation,
  downloadMarkdown,
  copyToClipboard,
} from '@/features/chat/exportImport';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { AchievementCard } from '@/features/progression/AchievementCard';
import { ACHIEVEMENTS } from '@/features/progression/achievements';
import { RealTimeCharts, QuickStatCard } from '@/features/dashboard/RealTimeCharts';
import { Download, FileText, Copy, Trash2, Search } from 'lucide-react';
import { ModeBuilder, type CustomMode } from '@/components/conversation/ModeBuilder';
import { detectEnvironment } from '@/core/tauri/environment';
import { Camera } from 'lucide-react';
import type { ProgressionState } from '@/cognitive/types';
import type { VisualLevel } from '@/types/visionAffect';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { VisionMetricsChart } from '@/features/vision/VisionMetricsChart';
import { DetectionOverlay } from '@/features/vision/DetectionOverlay';
import { createLogger } from '@/utils/logger';
// NOTE: Heavy tab components are lazy-loaded below (Phase 5.2)
import './TitanePage.css';

const pageLogger = createLogger('TitanePage');

// ═══ HELPER FUNCTIONS FOR OPTIMIZATION ═══

// ═══ LAZY-LOADED TAB COMPONENTS (Phase 5.2 Code Splitting) ═══

const LazyMemoryTreeViewer = React.lazy(() =>
  import('@/features/memory/MemoryTreeViewer').then(m => ({
    default: m.MemoryTreeViewer,
  }))
);

const LazyMemorySearchPanel = React.lazy(() =>
  import('@/features/memory/MemorySearchPanel').then(m => ({
    default: m.MemorySearchPanel,
  }))
);

const LazyMemoryDashboard = React.lazy(() =>
  import('@/components/chat/MemoryDashboard').then(m => ({
    default: m.MemoryDashboard,
  }))
);

const LazyMemoryEvolutionCenter = React.lazy(
  () => import('@/components/MemoryEvolution/MemoryEvolutionCenter')
);

const LazyEvolutionTimeline = React.lazy(() =>
  import('@/features/evolution/EvolutionTimeline').then(m => ({
    default: m.EvolutionTimeline,
  }))
);

const LazyIdentityCenter = React.lazy(
  () => import('@/components/IdentityCenter/IdentityCenter')
);

const LazyModeMatrix = React.lazy(() =>
  import('@/features/identity/ModeMatrix').then(m => ({
    default: m.ModeMatrix,
  }))
);

const LazyPersonaEditor = React.lazy(() =>
  import('@/features/identity/PersonaEditor').then(m => ({
    default: m.PersonaEditor,
  }))
);

const LazyTransformationRoadmap = React.lazy(() =>
  import('@/features/transformation/TransformationRoadmap').then(m => ({
    default: m.TransformationRoadmap,
  }))
);

/**
 * Sanitize input pour sécurité renforcée (XSS prevention)
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
    .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers
    .slice(0, 10000); // Max 10k characters
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TabId =
  | 'conversation'
  | 'vision'
  | 'overview'
  | 'identity'
  | 'memory-map'
  | 'memory-evolution'
  | 'progression'
  | 'transformation';

interface TitaneStats {
  totalXP: number;
  level: number;
  memoryShortTerm: number;
  memoryMidTerm: number;
  memoryLongTerm: number;
  evolutionScore: number;
}

interface StatusIndicatorProps {
  active: boolean;
  label: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const _levelToPercent = (level: VisualLevel): number => {
  switch (level) {
    case 'low':
      return 25;
    case 'medium':
      return 50;
    case 'high':
      return 75;
    default:
      return 50;
  }
};

const _levelToColor = (level: VisualLevel): string => {
  switch (level) {
    case 'high':
      return 'var(--titane-accent)';
    case 'medium':
      return 'var(--titane-primary)';
    case 'low':
      return 'var(--titane-secondary)';
    default:
      return 'var(--titane-secondary)';
  }
};

const _levelToLabel = (level: VisualLevel): string => {
  switch (level) {
    case 'low':
      return 'Faible';
    case 'medium':
      return 'Moyen';
    case 'high':
      return 'Élevé';
    default:
      return '—';
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatusIndicator: React.FC<StatusIndicatorProps> = memo(({ active, label }) => (
  <div className={`titane-status-indicator ${active ? 'active' : ''}`}>
    <span className="status-dot" />
    <span className="status-label">{label}</span>
  </div>
));
StatusIndicator.displayName = 'StatusIndicator';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: CONVERSATION
// ═══════════════════════════════════════════════════════════════════════════

interface ConversationSectionProps {}

const ConversationSection: React.FC<ConversationSectionProps> = () => {
  // ═══ IMPORTS & HOOKS ═══
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
    maxMessages: 500, // Limite historique pour optimiser mémoire
  });

  // ═══ LOCAL STATE ═══
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
  const sendingRef = useRef(false); // v26.2 - Protection contre double-envoi

  // ═══ THINKING STEPS (v25.6.0) ═══
  const thinking = useThinkingSteps();

  // ═══ VOICE ENGINE INTEGRATION (v25.4.2) ═══
  const voiceEngine = useVoiceEngine({
    language: 'fr-FR',
    onTranscript: text => {
      // Auto-insert transcript into input
      setInputValue(prev => (prev ? `${prev} ${text}` : text));
    },
    onError: error => {
      pageLogger.error('Voice recognition error', error);
    },
  });

  // Available providers
  const availableProviders = [
    { id: 'gemini', name: 'Gemini', icon: '✨', available: true },
    { id: 'ollama', name: 'Ollama', icon: '🦙', available: true },
    { id: 'openai', name: 'OpenAI', icon: '🤖', available: true },
    { id: 'claude', name: 'Claude', icon: '🧠', available: true },
  ];

  // Conversation modes disponibles (merge built-in + custom)
  const conversationModes = useMemo(() => {
    const builtInModes = [
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

    const customModesFormatted = customModes.map(m => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      description: m.description,
    }));

    return [...builtInModes, ...customModesFormatted];
  }, [customModes]);

  // ═══ CHARGER MODES CUSTOM AU DÉMARRAGE ═══
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

  // ═══ HANDLERS ═══
  const handleSaveCustomMode = useCallback((mode: CustomMode) => {
    setCustomModes(prev => [...prev, mode]);
    pageLogger.debug('Mode personnalisé sauvegardé', mode);
  }, []);

  const filteredMessages = useMemo(() => {
    let result = messages;

    if (searchQuery.trim()) {
      const needle = searchQuery.toLowerCase();
      result = result.filter(m => m.content.toLowerCase().includes(needle));
    }

    if (filterRole !== 'all') {
      result = result.filter(m => m.role === filterRole);
    }

    return result;
  }, [messages, searchQuery, filterRole]);

  // ═══ AUTO-SCROLL ═══
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ═══ HANDLERS ═══
  const handleSend = useCallback(async () => {
    // v26.2 - Protection double-envoi
    if (!inputValue.trim() || isLoading || sendingRef.current) return;
    sendingRef.current = true;

    // Sanitize input pour sécurité
    const sanitized = sanitizeInput(inputValue);
    if (!sanitized || sanitized.length === 0) {
      pageLogger.debug('Input vide apres sanitization');
      sendingRef.current = false;
      return;
    }

    const messageText = sanitized;
    setInputValue(''); // Clear immédiatement (Optimistic UI)

    // Start thinking visualization
    thinking.startThinking();
    thinking.addStep('analysis', 'Analyse de votre message...');

    try {
      thinking.addStep('reasoning', 'Traitement par le pipeline OMEGA...');
      const response = await sendMessage(messageText);

      // Stop thinking
      thinking.addStep('synthesis', 'Génération de la réponse...');
      thinking.stopThinking();

      // TTS si actif et reponse valide
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

  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      pageLogger.warn('Copy message failed', err);
      alert('❌ Impossible de copier le message');
    }
  }, []);

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

  const handleVoiceInput = useCallback(async () => {
    // ✅ v25.4.2: Speech Recognition implementation avec useVoiceEngine
    if (!voiceEngine.status.isMicAvailable) {
      alert('🎤 Microphone non disponible. Vérifiez les permissions.');
      return;
    }

    try {
      if (voiceEngine.status.isRecording) {
        // Stop dictation et récupérer le transcript
        const finalTranscript = await voiceEngine.stopDictation();
        setIsRecording(false);
        pageLogger.debug('Voice dictation stopped', finalTranscript);
      } else {
        // Start dictation
        await voiceEngine.startDictation();
        setIsRecording(true);
        pageLogger.debug('Voice dictation started');
      }
    } catch (error) {
      pageLogger.error('Voice input error', error);
      setIsRecording(false);
      alert('❌ Erreur reconnaissance vocale. Consultez la console.');
    }
  }, [voiceEngine]);

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
              providers={availableProviders}
            />

            {/* Mode Selector */}
            <select
              className="conversation-mode-select"
              value={currentMode}
              onChange={e => setMode(e.target.value as ConversationMode)}
            >
              {conversationModes.map(mode => (
                <option key={mode.id} value={mode.id}>
                  {mode.icon} {mode.name}
                </option>
              ))}
            </select>
          </div>

          <div className="conversation-toolbar-right">
            {/* Export JSON */}
            <button
              className="conversation-icon-btn"
              onClick={() =>
                downloadConversation('current', 'Conversation TITANE', messages)
              }
              title="Exporter en JSON"
              disabled={messages.length === 0}
            >
              <Download size={16} />
            </button>

            {/* Export Markdown */}
            <button
              className="conversation-icon-btn"
              onClick={() => downloadMarkdown('Conversation TITANE', messages)}
              title="Exporter en Markdown"
              disabled={messages.length === 0}
            >
              <FileText size={16} />
            </button>

            {/* Copy to Clipboard */}
            <button
              className="conversation-icon-btn"
              onClick={async () => {
                const success = await copyToClipboard('Conversation TITANE', messages);
                if (success) alert('✅ Conversation copiée!');
              }}
              title="Copier dans le presse-papier"
              disabled={messages.length === 0}
            >
              <Copy size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              className={`conversation-icon-btn ${audioEnabled ? 'active' : ''}`}
              onClick={() => setAudioEnabled(!audioEnabled)}
              title="Audio (TTS)"
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>

            {/* Voice Input */}
            <button
              className={`conversation-icon-btn ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceInput}
              title="Reconnaissance vocale"
            >
              🎤
            </button>

            {/* Mode Builder */}
            <button
              className="conversation-icon-btn"
              onClick={() => setShowModeBuilder(!showModeBuilder)}
              title="Créer un mode personnalisé"
            >
              ⚙️
            </button>

            {/* Health Check */}
            <button
              className={`conversation-icon-btn ${healthReport?.status === 'Healthy' ? 'healthy' : ''}`}
              onClick={refreshHealth}
              title={`Santé: ${healthReport?.status || 'Unknown'}`}
            >
              {healthReport?.status === 'Healthy' ? '✅' : '⚠️'}
            </button>

            {/* Clear Chat */}
            <button
              className="conversation-icon-btn"
              onClick={handleClearChat}
              title="Effacer l'historique"
            >
              <Trash2 size={16} />
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
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Rechercher dans la conversation"
            />
          </div>

          <select
            className="conversation-filters-role"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value as typeof filterRole)}
            aria-label="Filtrer par rôle"
          >
            <option value="all">Tous</option>
            <option value="user">Utilisateur</option>
            <option value="assistant">TITANE</option>
          </select>

          <div className="conversation-filters-count">
            {filteredMessages.length}/{messages.length}
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
                Mode actuel:{' '}
                <strong>{conversationModes.find(m => m.id === currentMode)?.name}</strong>
                <br />
                Provider: <strong>{selectedProvider}</strong>
              </p>
              <div className="conversation-empty-suggestions">
                <button onClick={() => setInputValue('Explique-moi ton fonctionnement')}>
                  💡 Comment tu fonctionnes ?
                </button>
                <button onClick={() => setInputValue('Aide-moi à planifier mon projet')}>
                  📋 Planifier un projet
                </button>
                <button
                  onClick={() => setInputValue('Brainstorming sur une idée innovante')}
                >
                  💡 Brainstorming
                </button>
              </div>
            </div>
          )}

          {filteredMessages.map((msg, index) => (
            <div
              key={msg.id || `msg-${index}`}
              className={`conversation-message ${msg.role}`}
            >
              <div className="conversation-message-avatar">
                {msg.role === 'user' ? '👤' : '🧠'}
              </div>
              <div className="conversation-message-content">
                <div className="conversation-message-header">
                  <span className="conversation-message-role">
                    {msg.role === 'user' ? 'Vous' : 'TITANE'}
                  </span>
                  {msg.metadata?.tags && msg.metadata.tags.length > 0 && (
                    <div className="conversation-message-tags">
                      {msg.metadata.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="conversation-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="conversation-message-text">{msg.content}</div>
                {msg.metadata?.intention && (
                  <div className="conversation-message-meta">
                    <span className="meta-intention">{msg.metadata.intention}</span>
                  </div>
                )}

                <div className="conversation-message-actions">
                  <button
                    type="button"
                    className="conversation-message-action"
                    onClick={() => handleCopyMessage(msg.content)}
                    title="Copier le message"
                  >
                    📋 Copier
                  </button>

                  {msg.role === 'user' && (
                    <button
                      type="button"
                      className="conversation-message-action"
                      onClick={() => handleRetryMessage(msg.content)}
                      title="Renvoyer ce message"
                      disabled={isLoading}
                    >
                      🔄 Retry
                    </button>
                  )}

                  <button
                    type="button"
                    className="conversation-message-action danger"
                    onClick={() => deleteMessage(msg.id)}
                    title="Supprimer ce message"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

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
          onFileImport={files => {
            const fileNames = Array.from(files)
              .map(f => f.name)
              .join(', ');
            sendMessage(`📎 Fichiers: ${fileNames}\n\nAnalyse ces fichiers.`);
          }}
          onScreenCapture={imageData => {
            setAttachedImages(prev => [...prev, imageData]);
            sendMessage('📸 [Capture ecran]\n\nAnalyse cette capture.');
          }}
          onImageAnalysis={(imageData, prompt) => {
            setAttachedImages(prev => [...prev, imageData]);
            sendMessage(`👁️ [Image]\n\n${prompt || 'Analyse cette image.'}`);
          }}
          onDictationResult={text => {
            if (text.trim()) setInputValue(prev => (prev ? `${prev} ${text}` : text));
          }}
          onAudioRecorded={audioBlob => {
            const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
            sendMessage(`🎤 [Audio - ${sizeMB} MB]\n\nTranscris ce message.`);
          }}
          onTranscriptionResult={text => {
            sendMessage(`📝 Transcription:\n\n"${text}"\n\nAnalyse ce contenu.`);
          }}
          onToggleAudioConversation={active => setAudioEnabled(active)}
          onToggleCameraLive={() => setCameraActive(prev => !prev)}
          onToggleTTS={active => setAudioEnabled(active)}
          disabled={isLoading}
          compact={false}
        />

        {/* ═══ INPUT AREA ═══ */}
        <div className="conversation-input-container">
          <textarea
            className="conversation-input"
            placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
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
          <ModeBuilder
            onClose={() => setShowModeBuilder(false)}
            onSave={handleSaveCustomMode}
          />
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: VISION & PERCEPTION
// ═══════════════════════════════════════════════════════════════════════════

interface VisionSectionProps {}

const VisionSection: React.FC<VisionSectionProps> = () => {
  const env = detectEnvironment();
  const isCameraActive = useVisionStore(selectIsCameraActive);
  const isObservationActive = useVisionStore(selectIsObservationActive);
  const energyLevel = useVisionStore(selectEnergyLevel);
  const tensionLevel = useVisionStore(selectTensionLevel);
  const engagementLevel = useVisionStore(selectEngagementLevel);
  const confidence = useVisionStore(selectConfidence);
  const enableVision = useVisionStore(s => s.enableVision);
  const requestCameraPermission = useVisionStore(s => s.requestCameraPermission);
  const startCamera = useVisionStore(s => s.startCamera);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartVision = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const permission = await requestCameraPermission();
      if (permission !== 'granted') {
        setError('Permission caméra refusée. Autorisez la caméra pour activer Vision.');
        return;
      }

      const enabled = await enableVision();
      if (!enabled) {
        setError('Activation Vision annulée ou impossible.');
        return;
      }

      const started = await startCamera();
      if (!started) {
        setError('Impossible de démarrer la caméra.');
        return;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      pageLogger.error('Vision start failed', e);
    } finally {
      setIsStarting(false);
    }
  }, [enableVision, requestCameraPermission, startCamera]);

  return (
    <div className="titane-section titane-section-vision">
      <TSectionHeader
        title="📷 Vision & Perception"
        subtitle="Analyse visuelle et estimation affective en temps réel"
      />

      <Grid columns={2} gap={4}>
        {/* Camera Preview avec Detection Overlay */}
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Caméra & Détections</h3>
          <StatusIndicator active={isCameraActive} label="Caméra Active" />

          <div className="vision-camera-container">
            {env.isTauri ? (
              <div style={{ position: 'relative' }}>
                {!isCameraActive && (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}
                  >
                    <div style={{ color: colors.neutral[400] }}>
                      Opt-in requis: activez Vision puis démarrez la caméra.
                    </div>
                    {error && (
                      <div style={{ color: colors.semantic.error[400] }}>{error}</div>
                    )}
                    <div style={{ display: 'flex', gap: spacing[3] }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStartVision}
                        disabled={isStarting}
                      >
                        {isStarting ? 'Activation...' : 'Activer Vision & Caméra'}
                      </Button>
                    </div>
                  </div>
                )}

                <CameraPreview position="bottom-left" />
                <DetectionOverlay />
              </div>
            ) : (
              <div className="vision-placeholder">
                <Camera size={48} color={colors.neutral[400]} />
                <p style={{ color: colors.neutral[400], marginTop: spacing[4] }}>
                  Disponible en mode Tauri uniquement
                </p>
              </div>
            )}
          </div>

          <div className="vision-ethical-disclaimer" style={{ marginTop: spacing[4] }}>
            <h4>⚠️ Information Importante</h4>
            <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
              Le module Vision est <strong>100% local</strong> — aucune donnée n&apos;est
              envoyée vers le cloud.
            </p>
          </div>
        </Card>

        {/* Vision Stats - Placeholder pour compatibilité */}
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Métriques Vision</h3>

          <Stack direction="vertical" gap={3}>
            <TMetric
              label="Observation"
              value={isObservationActive ? 'Active' : 'Inactive'}
              color={isObservationActive ? 'success' : 'warning'}
            />
            <TMetric
              label="Énergie (indice)"
              value={`${_levelToLabel(energyLevel)} (${_levelToPercent(energyLevel)}%)`}
              color="success"
            />
            <TMetric
              label="Tension (indice)"
              value={`${_levelToLabel(tensionLevel)} (${_levelToPercent(tensionLevel)}%)`}
              color="warning"
            />
            <TMetric
              label="Engagement (indice)"
              value={`${_levelToLabel(engagementLevel)} (${_levelToPercent(engagementLevel)}%)`}
              color="info"
            />
            <TMetric
              label="Confiance"
              value={`${Math.round((confidence || 0) * 100)}%`}
              color="primary"
            />
          </Stack>
        </Card>
      </Grid>

      {/* Vision Metrics Charts */}
      <div style={{ marginTop: spacing[6] }}>
        <h3 style={{ marginBottom: spacing[4] }}>📈 Graphiques de Métriques</h3>
        <VisionMetricsChart />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: VUE D'ENSEMBLE
// ═══════════════════════════════════════════════════════════════════════════

interface OverviewSectionProps {
  stats: TitaneStats;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ stats }) => {
  return (
    <div className="titane-section titane-section-overview">
      <TSectionHeader
        title="📊 Vue d'Ensemble"
        subtitle="Dashboard système et métriques principales"
      />

      {/* Quick Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6],
        }}
      >
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>⚡</span>}
          label="Niveau"
          value={stats.level}
          trend="up"
          trendValue="+2 cette semaine"
          color="#3b82f6"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>✨</span>}
          label="XP Total"
          value={stats.totalXP.toLocaleString()}
          trend="up"
          trendValue="+15k aujourd'hui"
          color="#10b981"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>💬</span>}
          label="Messages"
          value="1,247"
          trend="neutral"
          trendValue="128/h"
          color="#f59e0b"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>🎯</span>}
          label="Score Évolution"
          value={`${stats.evolutionScore}%`}
          trend="up"
          trendValue="+5%"
          color="#8b5cf6"
        />
      </div>

      {/* Real-Time Charts */}
      <RealTimeCharts />

      {/* Memory System Stats */}
      <div style={{ marginTop: spacing[6] }}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Mémoire Système</h3>
          <Grid columns={3} gap={4}>
            <TMetric label="Court Terme" value={stats.memoryShortTerm.toString()} />
            <TMetric label="Moyen Terme" value={stats.memoryMidTerm.toString()} />
            <TMetric label="Long Terme" value={stats.memoryLongTerm.toString()} />
          </Grid>
        </Card>
      </div>

      {/* Persona Mood */}
      <div style={{ marginTop: spacing[6] }}>
        <PersonaMoodIndicator />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: IDENTITÉ & ADN
// ═══════════════════════════════════════════════════════════════════════════

interface IdentitySectionProps {}

const IdentitySection: React.FC<IdentitySectionProps> = () => {
  const env = detectEnvironment();

  return (
    <div className="titane-section titane-section-identity">
      <TSectionHeader
        title="🧬 Identité & ADN"
        subtitle="Matrice identité, modes, pacte fondateur"
      />

      <Grid columns={2} gap={4}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Matrice de Modes</h3>
          <React.Suspense fallback={null}>
            <LazyModeMatrix />
          </React.Suspense>
        </Card>

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Personnalité TITANE</h3>
          <React.Suspense fallback={null}>
            <LazyPersonaEditor />
          </React.Suspense>
        </Card>
      </Grid>

      <Card style={{ marginTop: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>Pacte Fondateur</h3>
        <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
          <strong>Excellence Systémique</strong>
          <br />
          Architecture cohérente et maintenable
          <br />
          <br />
          <strong>Innovation Continue</strong>
          <br />
          Évolution permanente du système
          <br />
          <br />
          <strong>Cohérence Totale</strong>
          <br />
          Zéro duplication, source unique de vérité
        </p>
      </Card>

      <Card style={{ marginTop: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>Identity Center</h3>
        {env.isTauri ? (
          <React.Suspense fallback={null}>
            <LazyIdentityCenter />
          </React.Suspense>
        ) : (
          <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
            Disponible en mode Tauri uniquement
          </p>
        )}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: MÉMOIRE TRIPLE
// ═══════════════════════════════════════════════════════════════════════════

interface MemorySectionProps {
  stats: TitaneStats;
}

type MemoryTreeNodeData = {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: MemoryTreeNodeData[];
};

type MemorySearchEntry = {
  id: string;
  content: string;
  type: 'short' | 'mid' | 'long';
  timestamp: number;
  tags?: string[];
  relevance?: number;
};

const MemorySection: React.FC<MemorySectionProps> = ({ stats }) => {
  const [selectedNode, setSelectedNode] = useState<MemoryTreeNodeData | null>(null);

  const handleNodeClick = useCallback((node: MemoryTreeNodeData) => {
    setSelectedNode(node);
    pageLogger.debug('Node clicked', node);
  }, []);

  const handleEntryClick = useCallback((entry: MemorySearchEntry) => {
    pageLogger.debug('Memory entry clicked', entry);
  }, []);

  return (
    <div className="titane-section titane-section-memory">
      <TSectionHeader
        title="💾 Mémoire Triple"
        subtitle="Architecture court/moyen/long terme avec visualisation hiérarchique"
      />

      {/* Stats Cards */}
      <Grid columns={3} gap={4}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Court Terme</h3>
          <TMetric
            label="Entrées"
            value={stats.memoryShortTerm.toString()}
            color="primary"
          />
          <p
            style={{
              fontSize: fontSizes.sm,
              color: colors.neutral[500],
              marginTop: spacing[4],
            }}
          >
            Contexte immédiat et conversation active
          </p>
        </Card>

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Moyen Terme</h3>
          <TMetric
            label="Entrées"
            value={stats.memoryMidTerm.toString()}
            color="success"
          />
          <p
            style={{
              fontSize: fontSizes.sm,
              color: colors.neutral[500],
              marginTop: spacing[4],
            }}
          >
            Sessions récentes et apprentissages temporaires
          </p>
        </Card>

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Long Terme</h3>
          <TMetric label="Entrées" value={stats.memoryLongTerm.toString()} color="info" />
          <p
            style={{
              fontSize: fontSizes.sm,
              color: colors.neutral[500],
              marginTop: spacing[4],
            }}
          >
            Connaissances permanentes et identité
          </p>
        </Card>
      </Grid>

      <div style={{ marginTop: spacing[6] }}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>📚 Dashboard Mémoire</h3>
          <React.Suspense fallback={null}>
            <LazyMemoryDashboard modeId="default" compact={true} />
          </React.Suspense>
        </Card>
      </div>

      {/* Memory Tree Visualization */}
      <div style={{ marginTop: spacing[6] }}>
        <h3 style={{ marginBottom: spacing[4] }}>🌳 Arbre de la Mémoire</h3>
        <React.Suspense fallback={null}>
          <LazyMemoryTreeViewer onNodeClick={handleNodeClick} showAttributes={true} />
        </React.Suspense>
        {selectedNode && (
          <Card style={{ marginTop: spacing[4] }}>
            <h4>Nœud sélectionné</h4>
            <pre style={{ fontSize: fontSizes.xs, color: colors.neutral[400] }}>
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </Card>
        )}
      </div>

      {/* Memory Search */}
      <div style={{ marginTop: spacing[6] }}>
        <h3 style={{ marginBottom: spacing[4] }}>🔍 Recherche Sémantique</h3>
        <React.Suspense fallback={null}>
          <LazyMemorySearchPanel onEntryClick={handleEntryClick} />
        </React.Suspense>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: ÉVOLUTION MÉMOIRE
// ═══════════════════════════════════════════════════════════════════════════

interface MemoryEvolutionSectionProps {}

const MemoryEvolutionSection: React.FC<MemoryEvolutionSectionProps> = () => {
  const env = detectEnvironment();

  return (
    <div className="titane-section titane-section-memory-evolution">
      <TSectionHeader
        title="🔄 Évolution Mémoire"
        subtitle="Dynamiques internes et journal évolutif"
      />

      <Card>
        <h3 style={{ marginBottom: spacing[4] }}>Centre d&apos;Évolution Mémoire</h3>
        {env.isTauri ? (
          <React.Suspense fallback={null}>
            <LazyMemoryEvolutionCenter />
          </React.Suspense>
        ) : (
          <div>
            <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
              Disponible en mode Tauri uniquement
            </p>
            <div style={{ marginTop: spacing[4] }}>
              <h4 style={{ marginBottom: spacing[3] }}>Timeline d&apos;Évolution</h4>
              <React.Suspense fallback={null}>
                <LazyEvolutionTimeline />
              </React.Suspense>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: PROGRESSION & XP
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressionSectionProps {
  progression: ProgressionState | null;
  stats: TitaneStats;
}

const ProgressionSection: React.FC<ProgressionSectionProps> = ({
  progression: _progression,
  stats,
}) => {
  // Current stats for achievement progress
  const currentStats = useMemo(
    () => ({
      level: stats.level,
      totalXP: stats.totalXP,
      messageCount: 1247, // From real data or store
      modesUsed: 4,
    }),
    [stats]
  );

  // Filter achievements by category
  const categories = useMemo(
    () => ({
      conversation: ACHIEVEMENTS.filter(a => a.category === 'conversation'),
      progression: ACHIEVEMENTS.filter(a => a.category === 'progression'),
      exploration: ACHIEVEMENTS.filter(a => a.category === 'exploration'),
      mastery: ACHIEVEMENTS.filter(a => a.category === 'mastery'),
    }),
    []
  );

  return (
    <div className="titane-section titane-section-progression">
      <TSectionHeader
        title="⚡ Progression & XP"
        subtitle="Système XP, milestones, talents et achievements"
      />

      {/* XP Progress Bar */}
      <div style={{ marginBottom: spacing[6] }}>
        <XPProgressBar
          currentXP={stats.totalXP}
          level={stats.level}
          requiredXP={(stats.level + 1) * 10000}
        />
      </div>

      {/* Milestones & Talents */}
      <Grid columns={2} gap={4} style={{ marginBottom: spacing[6] }}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Milestones</h3>
          <Stack direction="vertical" gap={3}>
            <TMetric
              label="Niveau Atteint"
              value={stats.level.toString()}
              color="primary"
            />
            <TMetric
              label="Total XP"
              value={stats.totalXP.toLocaleString()}
              color="success"
            />
            <TMetric
              label="Prochain Niveau"
              value={`${((stats.totalXP % 10000) / 10000) * 100}%`}
            />
          </Stack>
        </Card>

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Talents Débloqués</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            <TBadge variant="success">Architecte</TBadge>
            <TBadge variant="info">Optimiseur</TBadge>
            <TBadge variant="info">Évolutionniste</TBadge>
            <TBadge variant="success">Pédagogue</TBadge>
          </div>
        </Card>
      </Grid>

      {/* Achievements Grid */}
      <div style={{ marginBottom: spacing[6] }}>
        <h3 style={{ marginBottom: spacing[4] }}>🏆 Achievements</h3>

        {/* Mastery (Legendary) */}
        <div style={{ marginBottom: spacing[6] }}>
          <h4
            style={{
              fontSize: fontSizes.sm,
              color: colors.neutral[400],
              marginBottom: spacing[3],
            }}
          >
            👑 Maîtrise
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: spacing[4],
            }}
          >
            {categories.mastery.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                currentStats={currentStats}
              />
            ))}
          </div>
        </div>

        {/* Progression */}
        <div style={{ marginBottom: spacing[6] }}>
          <h4
            style={{
              fontSize: fontSizes.sm,
              color: colors.neutral[400],
              marginBottom: spacing[3],
            }}
          >
            ⚡ Progression
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: spacing[4],
            }}
          >
            {categories.progression.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                currentStats={currentStats}
              />
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div style={{ marginBottom: spacing[6] }}>
          <h4
            style={{
              fontSize: fontSizes.sm,
              color: colors.neutral[400],
              marginBottom: spacing[3],
            }}
          >
            💬 Communication
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: spacing[4],
            }}
          >
            {categories.conversation.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                currentStats={currentStats}
              />
            ))}
          </div>
        </div>

        {/* Exploration */}
        <div>
          <h4
            style={{
              fontSize: fontSizes.sm,
              color: colors.neutral[400],
              marginBottom: spacing[3],
            }}
          >
            🧭 Exploration
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: spacing[4],
            }}
          >
            {categories.exploration.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                currentStats={currentStats}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: TRANSFORMATION
// ═══════════════════════════════════════════════════════════════════════════

interface TransformationSectionProps {}

const TransformationSection: React.FC<TransformationSectionProps> = () => {
  return (
    <div className="titane-section titane-section-transformation">
      <TSectionHeader
        title="🌱 Transformation"
        subtitle="Lignes d'évolution et paliers franchis"
      />

      <Card>
        <h3 style={{ marginBottom: spacing[4] }}>Roadmap Évolutif</h3>
        <React.Suspense fallback={null}>
          <LazyTransformationRoadmap />
        </React.Suspense>
      </Card>

      <Grid columns={2} gap={4} style={{ marginTop: spacing[4] }}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Lignes d&apos;Évolution</h3>
          <Stack direction="vertical" gap={3}>
            <div>
              <TBadge variant="info">Cognitif</TBadge>
              <p
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                  marginTop: spacing[2],
                }}
              >
                Capacités de raisonnement et apprentissage
              </p>
            </div>

            <div>
              <TBadge variant="success">Social</TBadge>
              <p
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                  marginTop: spacing[2],
                }}
              >
                Interaction et communication
              </p>
            </div>

            <div>
              <TBadge variant="info">Technique</TBadge>
              <p
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                  marginTop: spacing[2],
                }}
              >
                Architecture et optimisation
              </p>
            </div>
          </Stack>
        </Card>

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Paliers Franchis</h3>
          <Stack direction="vertical" gap={3}>
            <TMetric label="v25.0" value="Fusion EVO" color="success" />
            <TMetric label="v25.1" value="Fusion TIME" color="success" />
            <TMetric label="v25.2" value="Fusion STATS + ADMIN" color="success" />
            <TMetric
              label="v25.3"
              value="Fusion TITANE"
              color={colors.saphir.primary[500]}
            />
          </Stack>
        </Card>
      </Grid>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const TitanePage: React.FC = () => {
  // État
  const [activeTab, setActiveTab] = useState<TabId>('conversation');
  const [progression, setProgression] = useState<ProgressionState | null>(null);
  const [_isEditing, _setIsEditing] = useState(false);

  // Visual engines
  useVisualEngines({
    engines: { stable: true, helios: true, nexus: true },
    health: 100,
    mode: 'stable',
  });

  // Chargement progression
  useEffect(() => {
    const loadProgression = async () => {
      try {
        const state = await xpEngine.getState();
        setProgression(state);
      } catch (error) {
        pageLogger.error('Erreur chargement progression', error);
      }
    };
    loadProgression();
  }, []);

  // Stats calculées
  const stats: TitaneStats = useMemo(
    () => ({
      totalXP: progression?.totalXP || 193000,
      level: progression?.level || 19,
      memoryShortTerm: 247,
      memoryMidTerm: 1832,
      memoryLongTerm: 4521,
      evolutionScore: 92,
    }),
    [progression]
  );

  // Render section active
  const renderActiveSection = useCallback(() => {
    switch (activeTab) {
      case 'conversation':
        return <ConversationSection />;
      case 'vision':
        return <VisionSection />;
      case 'overview':
        return <OverviewSection stats={stats} />;
      case 'identity':
        return <IdentitySection />;
      case 'memory-map':
        return <MemorySection stats={stats} />;
      case 'memory-evolution':
        return <MemoryEvolutionSection />;
      case 'progression':
        return <ProgressionSection progression={progression} stats={stats} />;
      case 'transformation':
        return <TransformationSection />;
      default:
        return <ConversationSection />;
    }
  }, [activeTab, progression, stats]);

  return (
    <ErrorBoundary context="TitanePage">
      <Container size="xl" className="titane-page">
        <Stack direction="vertical" gap={6}>
          {/* ═══ HEADER ═══ */}
          <div className="titane-header">
            <div className="titane-header-content">
              <div className="titane-header-left">
                <TitaneLogo size={64} />
                <div className="titane-header-text">
                  <h1 className="titane-title">⚡ TITANE — Le Cœur du Système</h1>
                  <p className="titane-subtitle">
                    Fusion ultime: Communication + Perception + Évolution Complète
                  </p>
                </div>
              </div>

              {/* Badge INFINITY */}
              <TBadge variant="info" size="lg">
                INFINITY
              </TBadge>
            </div>
          </div>

          {/* ═══ NAVIGATION TABS (A11Y Enhanced v25.4.1) ═══ */}
          <div
            className="titane-tabs"
            role="tablist"
            aria-label="Sections principales TITANE"
          >
            <button
              className={`titane-tab ${activeTab === 'conversation' ? 'active' : ''}`}
              onClick={() => setActiveTab('conversation')}
              role="tab"
              aria-selected={activeTab === 'conversation'}
              aria-controls="titane-panel-conversation"
              id="titane-tab-conversation"
            >
              💬 Conversation
            </button>
            <button
              className={`titane-tab ${activeTab === 'vision' ? 'active' : ''}`}
              onClick={() => setActiveTab('vision')}
              role="tab"
              aria-selected={activeTab === 'vision'}
              aria-controls="titane-panel-vision"
              id="titane-tab-vision"
            >
              📷 Vision
            </button>
            <button
              className={`titane-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-controls="titane-panel-overview"
              id="titane-tab-overview"
            >
              📊 Vue
            </button>
            <button
              className={`titane-tab ${activeTab === 'identity' ? 'active' : ''}`}
              onClick={() => setActiveTab('identity')}
              role="tab"
              aria-selected={activeTab === 'identity'}
              aria-controls="titane-panel-identity"
              id="titane-tab-identity"
            >
              🧬 Identité
            </button>
            <button
              className={`titane-tab ${activeTab === 'memory-map' ? 'active' : ''}`}
              onClick={() => setActiveTab('memory-map')}
              role="tab"
              aria-selected={activeTab === 'memory-map'}
              aria-controls="titane-panel-memory"
              id="titane-tab-memory"
            >
              💾 Mémoire
            </button>
            <button
              className={`titane-tab ${activeTab === 'memory-evolution' ? 'active' : ''}`}
              onClick={() => setActiveTab('memory-evolution')}
              role="tab"
              aria-selected={activeTab === 'memory-evolution'}
              aria-controls="titane-panel-evolution"
              id="titane-tab-evolution"
            >
              🔄 Évolution
            </button>
            <button
              className={`titane-tab ${activeTab === 'progression' ? 'active' : ''}`}
              onClick={() => setActiveTab('progression')}
              role="tab"
              aria-selected={activeTab === 'progression'}
              aria-controls="titane-panel-progression"
              id="titane-tab-progression"
            >
              ⚡ Progression
            </button>
            <button
              className={`titane-tab ${activeTab === 'transformation' ? 'active' : ''}`}
              onClick={() => setActiveTab('transformation')}
              role="tab"
              aria-selected={activeTab === 'transformation'}
              aria-controls="titane-panel-transformation"
              id="titane-tab-transformation"
            >
              🌱 Transform
            </button>
          </div>

          {/* ═══ CONTENT AREA (A11Y Enhanced) ═══ */}
          <div
            className="titane-content"
            role="tabpanel"
            id={`titane-panel-${activeTab}`}
            aria-labelledby={`titane-tab-${activeTab.replace('-', '')}`}
            tabIndex={0}
          >
            {renderActiveSection()}
          </div>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
};

export default TitanePage;
