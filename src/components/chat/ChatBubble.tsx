/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.20.0 — CHAT BUBBLE GLOBAL
 *   Bulle de chat flottante visible sur toutes les pages
 *   Super Prompt #3 — Feature #1
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Camera } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useVisionStore } from '@/stores/useVisionStore';
import { DevSudoBadge } from '@/components/dev/DevSudoBadge';
import './ChatBubble.css';

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

  const { messages, isLoading, sendMessage } = useChat({});

  const {
    isObservationActive: isCameraActive,
    enableVision,
    disableVision,
  } = useVisionStore();

  // Gérer les nouveaux messages quand fermé
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isOpen]);

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
