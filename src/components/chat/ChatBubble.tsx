/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.4.2 — CHAT BUBBLE GLOBAL (ENHANCED)
 *   Bulle de chat flottante visible sur toutes les pages
 *   Features: Import fichiers, Modes audio/vidéo, Mode selector
 *   Super Prompt #3 — Feature #1
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  Video,
  VideoOff,
  Settings2,
  Maximize2,
  Minimize2,
  Trash2,
  Image,
  FileText,
  Code,
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useVisionStore } from '@/stores/useVisionStore';
import { DevSudoBadge } from '@/components/dev/DevSudoBadge';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { useGovernance } from '@/features/governance-center/hooks/useGovernance';
import { useAudioChat } from '@/hooks/useAudioChat';
import { ListeningIndicator } from '@/components/audio/ListeningIndicator';
import './ChatBubble-ArcReactor.css';

// ═══ TYPES ═══
interface ChatBubbleProps {
  position?: 'bottom-right' | 'bottom-left';
  persistHistory?: boolean;
}

interface ImportedFile {
  id: string;
  name: string;
  size: number;
  type: 'code' | 'document' | 'image' | 'data' | 'unknown';
  preview: string;
}

// ═══ UTILITAIRES ═══
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i] ?? 'B'}`;
};

const classifyFile = (filename: string): ImportedFile['type'] => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'java', 'cpp', 'go'].includes(ext))
    return 'code';
  if (['md', 'txt', 'doc', 'docx', 'pdf'].includes(ext)) return 'document';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (['json', 'xml', 'yaml', 'yml', 'csv'].includes(ext)) return 'data';
  return 'unknown';
};

const getFileIcon = (type: ImportedFile['type']) => {
  switch (type) {
    case 'code':
      return <Code size={14} />;
    case 'document':
      return <FileText size={14} />;
    case 'image':
      return <Image size={14} />;
    default:
      return <FileText size={14} />;
  }
};

// ═══ COMPOSANT PRINCIPAL ═══
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  position = 'bottom-right',
  persistHistory: _persistHistory = true,
}) => {
  // ═══ ÉTATS ═══
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ✨ v25.4.2 - États pour fichiers importés
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✨ v25.4.2 - États modes multimédia
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // ✨ Drag & Drop state (pour le panel)
  const [isDragging, setIsDragging] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 });
  const [justDragged, setJustDragged] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, clearChat } = useChat({});

  const {
    isObservationActive: isCameraActive,
    enableVision,
    disableVision,
  } = useVisionStore();

  // ✨ v∞ - Provider IA integration
  const { geminiStatus, openaiStatus, anthropicStatus, ollamaStatus } = useGovernance();

  const providers = [
    {
      id: 'gemini',
      name: 'Gemini',
      icon: '🌐',
      available: geminiStatus?.provider_enabled || false,
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      available: openaiStatus?.provider_enabled || false,
    },
    {
      id: 'anthropic',
      name: 'Claude',
      icon: '🧠',
      available: anthropicStatus?.provider_enabled || false,
    },
    {
      id: 'ollama',
      name: 'Ollama',
      icon: '🏠',
      available: ollamaStatus?.provider_enabled || false,
    },
  ];

  // ✨ v∞ - Audio Chat Integration
  const {
    isListening,
    isSpeaking: _isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    resetTranscript,
  } = useAudioChat({ enabled: true, autoListen: false });

  // Auto-scroll vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send transcript when listening stops
  useEffect(() => {
    if (transcript && !isListening && transcript.trim().length > 0) {
      setInputValue(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  // Gérer les nouveaux messages quand fermé
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1);
        // ✨ TITANE parle sa réponse si autoSpeak activé
        if (lastMessage.content && autoSpeak) {
          speak(lastMessage.content);
        }
      }
    }
  }, [messages, isOpen, speak, autoSpeak]);

  // ═══ HANDLERS ═══
  const handleOpen = useCallback(() => {
    if (!isDragging && !justDragged) {
      setIsOpen(true);
      setUnreadCount(0);
    }
  }, [isDragging, justDragged]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setShowSettings(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    // Construire le message avec fichiers attachés
    let message = inputValue.trim();
    if (importedFiles.length > 0) {
      const filesList = importedFiles.map(f => `📎 ${f.name}`).join('\n');
      message = `${message}\n\n[Fichiers attachés]\n${filesList}`;
    }

    setInputValue('');
    setImportedFiles([]); // Clear after send
    await sendMessage(message);
  }, [inputValue, isLoading, sendMessage, importedFiles]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ✨ v25.4.2 - Camera toggle
  const handleCameraToggle = useCallback(async () => {
    if (isCameraActive) {
      disableVision();
    } else {
      await enableVision(30 * 60 * 1000); // 30 minutes
    }
  }, [isCameraActive, enableVision, disableVision]);

  // ✨ v25.4.2 - Video mode toggle
  const handleVideoModeToggle = useCallback(() => {
    setIsVideoMode(prev => !prev);
    if (!isVideoMode && !isCameraActive) {
      enableVision(30 * 60 * 1000);
    }
  }, [isVideoMode, isCameraActive, enableVision]);

  // ✨ v25.4.2 - File import handlers
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: ImportedFile[] = [];

    for (const file of Array.from(files).slice(0, 5)) {
      // Max 5 fichiers
      const type = classifyFile(file.name);
      let preview = '';

      if (type !== 'image' && file.size < 50000) {
        // Lire preview pour fichiers texte < 50KB
        try {
          const text = await file.text();
          preview = text.substring(0, 150) + (text.length > 150 ? '...' : '');
        } catch {
          preview = '(Aperçu non disponible)';
        }
      }

      newFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        name: file.name,
        size: file.size,
        type,
        preview,
      });
    }

    setImportedFiles(prev => [...prev, ...newFiles].slice(0, 5));
    e.target.value = ''; // Reset input
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setImportedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // ✨ v25.4.2 - Drag & Drop for files
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (!files.length) return;

    // Simulate file input change
    const dataTransfer = new DataTransfer();
    for (const file of Array.from(files).slice(0, 5)) {
      dataTransfer.items.add(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  // ✨ v25.4.2 - Clear conversation
  const handleClearConversation = useCallback(() => {
    if (clearChat) {
      clearChat();
    }
    setImportedFiles([]);
  }, [clearChat]);

  // ═══ RENDER ═══
  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.yaml,.yml,.js,.ts,.tsx,.jsx,.py,.rs,.cpp,.java,.go,.xml,.csv,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Bulle fermée */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className={`chat-bubble-trigger ${position} ${isDragging ? 'dragging' : ''}`}
            onClick={handleOpen}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{
              top: -window.innerHeight + 100,
              left: -window.innerWidth + 100,
              right: window.innerWidth - 100,
              bottom: window.innerHeight - 100,
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_, info) => {
              setIsDragging(false);
              if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
                setJustDragged(true);
                setTimeout(() => setJustDragged(false), 300);
              }
              setBubblePosition({
                x: bubblePosition.x + info.offset.x,
                y: bubblePosition.y + info.offset.y,
              });
            }}
            style={{ x: bubblePosition.x, y: bubblePosition.y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={!isDragging ? { scale: 1.1 } : {}}
            whileTap={!isDragging ? { scale: 0.95 } : {}}
          >
            <MessageSquare size={24} />
            {unreadCount > 0 && (
              <motion.div
                className="chat-bubble-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {unreadCount}
              </motion.div>
            )}

            {/* Status indicators */}
            {(isListening || isCameraActive) && (
              <motion.div
                className="chat-bubble-status-indicator"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: -2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: isListening ? '#ef4444' : '#22c55e',
                  border: '2px solid #1a1a2e',
                }}
              />
            )}

            {/* Pulsation */}
            <motion.div
              className="chat-bubble-pulse"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel de chat ouvert */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chat-bubble-panel ${position} ${isDragging ? 'dragging' : ''} ${isExpanded ? 'expanded' : ''}`}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{
              top: -window.innerHeight + 200,
              left: -window.innerWidth + 200,
              right: window.innerWidth - 200,
              bottom: window.innerHeight - 200,
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_, info) => {
              setIsDragging(false);
              if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
                setJustDragged(true);
                setTimeout(() => setJustDragged(false), 300);
              }
              setBubblePosition({
                x: bubblePosition.x + info.offset.x,
                y: bubblePosition.y + info.offset.y,
              });
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              x: bubblePosition.x,
              y: bubblePosition.y,
              width: isExpanded ? '600px' : undefined,
              maxHeight: isExpanded ? '80vh' : undefined,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Drop overlay */}
            {isDragOver && (
              <div className="chat-bubble-drop-overlay">
                <Paperclip size={32} />
                <span>Déposez vos fichiers ici</span>
              </div>
            )}

            {/* Header */}
            <div className="chat-bubble-header">
              <div className="chat-bubble-title">
                <MessageSquare size={18} />
                <span>TITANE∞ Chat</span>
                <DevSudoBadge active={true} compact={true} />
              </div>
              <div className="chat-bubble-actions">
                {/* ✨ v25.4.2 - Bouton import fichier */}
                <button
                  className="chat-bubble-action"
                  onClick={() => fileInputRef.current?.click()}
                  title="Importer fichiers (📎)"
                >
                  <Paperclip size={16} />
                </button>

                {/* Microphone */}
                <button
                  className={`chat-bubble-action ${isListening ? 'active recording' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  title={isListening ? 'Arrêter écoute' : 'Écoute vocale'}
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>

                {/* Speaker */}
                <button
                  className={`chat-bubble-action ${autoSpeak ? 'active' : ''}`}
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  title={
                    autoSpeak ? 'Désactiver synthèse vocale' : 'Activer synthèse vocale'
                  }
                >
                  {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                {/* Camera */}
                <button
                  className={`chat-bubble-action ${isCameraActive ? 'active' : ''}`}
                  onClick={handleCameraToggle}
                  title={isCameraActive ? 'Désactiver caméra' : 'Activer caméra'}
                >
                  <Camera size={16} />
                </button>

                {/* ✨ v25.4.2 - Mode vidéo */}
                <button
                  className={`chat-bubble-action ${isVideoMode ? 'active' : ''}`}
                  onClick={handleVideoModeToggle}
                  title={isVideoMode ? 'Désactiver mode vidéo' : 'Mode vidéo'}
                >
                  {isVideoMode ? <Video size={16} /> : <VideoOff size={16} />}
                </button>

                {/* Settings */}
                <button
                  className={`chat-bubble-action ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  title="Paramètres"
                >
                  <Settings2 size={16} />
                </button>

                {/* Expand/Collapse */}
                <button
                  className="chat-bubble-action"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Réduire' : 'Agrandir'}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {/* Close */}
                <button
                  className="chat-bubble-action"
                  onClick={handleClose}
                  title="Fermer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ✨ v25.4.2 - Settings panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  className="chat-bubble-settings"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                    background: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleClearConversation}
                      className="chat-bubble-settings-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#f87171',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                      Effacer conversation
                    </button>
                    <span
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {messages.length} messages
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ✨ v25.4.2 - Fichiers importés */}
            {importedFiles.length > 0 && (
              <div
                className="chat-bubble-files"
                style={{
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                  background: 'rgba(59, 130, 246, 0.05)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                {importedFiles.map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="chat-bubble-file-chip"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: 'white',
                    }}
                  >
                    {getFileIcon(file.type)}
                    <span
                      style={{
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.name}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        padding: '0 2px',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="chat-bubble-messages">
              {/* ✨ Listening Indicator */}
              <ListeningIndicator isActive={isListening} />

              {messages.length === 0 ? (
                <div className="chat-bubble-empty">
                  <MessageSquare size={32} opacity={0.3} />
                  <p>Commencez une conversation...</p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: '0.5rem',
                    }}
                  >
                    📎 Glissez des fichiers • 🎤 Parlez • 📹 Vidéo
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`chat-bubble-message ${msg.role}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="message-content">{msg.content}</div>
                  </motion.div>
                ))
              )}

              {isLoading && (
                <motion.div
                  className="chat-bubble-message assistant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-content typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-bubble-input-container">
              {/* ✨ Provider Selector */}
              <div
                style={{
                  padding: '0.5rem 1rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <ChatProviderSelector
                  selectedProvider={selectedProvider}
                  onChange={setSelectedProvider}
                  providers={providers}
                />
              </div>

              <div className="chat-bubble-input-wrapper">
                <textarea
                  className="chat-bubble-input"
                  placeholder={
                    importedFiles.length > 0
                      ? `Message avec ${importedFiles.length} fichier(s)...`
                      : 'Message TITANE∞...'
                  }
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isLoading}
                />
                <div className="chat-bubble-input-actions">
                  {/* Quick file attach */}
                  <button
                    className="chat-bubble-attach"
                    onClick={() => fileInputRef.current?.click()}
                    title="Joindre fichier"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      marginRight: '0.25rem',
                    }}
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    className="chat-bubble-send"
                    onClick={handleSend}
                    disabled={
                      (!inputValue.trim() && importedFiles.length === 0) || isLoading
                    }
                    title="Envoyer (Enter)"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBubble;
