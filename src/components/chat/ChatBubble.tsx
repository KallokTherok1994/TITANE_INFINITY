/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.20.0 — CHAT BUBBLE GLOBAL
 *   Bulle de chat flottante visible sur toutes les pages
 *   Super Prompt #3 — Feature #1
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Camera, Mic, MicOff, Volume2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useVisionStore } from '@/stores/useVisionStore';
import { DevSudoBadge } from '@/components/dev/DevSudoBadge';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { useGovernance } from '@/features/governance-center/hooks/useGovernance';
import { useAudioChat } from '@/hooks/useAudioChat';
import { ListeningIndicator } from '@/components/audio/ListeningIndicator';
import './ChatBubble-ArcReactor.css';

interface ChatBubbleProps {
  position?: 'bottom-right' | 'bottom-left';
  persistHistory?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  position = 'bottom-right',
  persistHistory: _persistHistory = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');

  const { messages, isLoading, sendMessage } = useChat({});

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
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    resetTranscript,
  } = useAudioChat({ enabled: true, autoListen: false });

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
      if (lastMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1);
        // ✨ TITANE parle sa réponse
        if (lastMessage.content) {
          speak(lastMessage.content);
        }
      }
    }
  }, [messages, isOpen, speak]);

  // Réinitialiser le compteur à l'ouverture
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleCameraToggle = useCallback(async () => {
    if (isCameraActive) {
      disableVision();
    } else {
      await enableVision(30 * 60 * 1000); // 30 minutes
    }
  }, [isCameraActive, enableVision, disableVision]);

  return (
    <>
      {/* Bulle fermée */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className={`chat-bubble-trigger ${position}`}
            onClick={handleOpen}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
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
            className={`chat-bubble-panel ${position}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="chat-bubble-header">
              <div className="chat-bubble-title">
                <MessageSquare size={18} />
                <span>TITANE∞ Chat</span>
                <DevSudoBadge active={true} compact={true} />
              </div>
              <div className="chat-bubble-actions">
                <button
                  className={`chat-bubble-action ${isListening ? 'active' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  title={isListening ? 'Écoute active' : 'Activer écoute vocale'}
                  style={{
                    position: 'relative',
                  }}
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                  {isListening && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '50%',
                        border: '2px solid rgba(59, 130, 246, 0.5)',
                        animation: 'pulse-ring 1.5s ease-out infinite',
                      }}
                    />
                  )}
                </button>
                <button
                  className={`chat-bubble-action ${isSpeaking ? 'active' : ''}`}
                  onClick={() =>
                    speak('Bonjour, je suis TITANE, votre assistant intelligent.')
                  }
                  title="Test audio"
                  disabled={isSpeaking}
                >
                  <Volume2 size={16} />
                </button>
                <button
                  className={`chat-bubble-action ${isCameraActive ? 'active' : ''}`}
                  onClick={handleCameraToggle}
                  title={isCameraActive ? 'Désactiver caméra' : 'Activer caméra'}
                >
                  <Camera size={16} />
                </button>
                <button
                  className="chat-bubble-action"
                  onClick={handleClose}
                  title="Fermer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-bubble-messages">
              {/* ✨ Listening Indicator */}
              <ListeningIndicator isActive={isListening} />

              {messages.length === 0 ? (
                <div className="chat-bubble-empty">
                  <MessageSquare size={32} opacity={0.3} />
                  <p>Commencez une conversation...</p>
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
                  placeholder="Message TITANE∞..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isLoading}
                />
                <div className="chat-bubble-input-actions">
                  <button
                    className="chat-bubble-send"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
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
