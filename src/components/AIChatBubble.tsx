/**
 * TITANE∞ v∞.25.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ AI BUBBLE ENGINE v∞
 *   Chat IA omniprésent — Disponible sur toutes les pages
 *   Design: Bulle flottante + Panneau extensible
 *   Connecté: Singularity, Memory Eternal, Self-Healing, Dev Engine
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalAIChat } from '../hooks/useGlobalAIChat';
import { MessageBubble } from './chat/MessageBubble';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import type { Message as _Message } from '../core/ARCHITECTURE_TYPES_v∞';
import type { AIMessage } from '../services/ai/types';
import { chatMetrics } from '../services/monitoring/chatMetrics';
import { logger, generateCorrelationId } from '../services/monitoring/logger';
import { alerting, AlertType, AlertSeverity } from '../services/monitoring/alerting';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AIChatBubbleProps {
  /** Position initiale de la bulle */
  initialPosition?: { x: number; y: number };
  /** Mode dev forcé */
  devMode?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const BUBBLE_SIZE = 56;
const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 600;

const styles = {
  bubble: {
    position: 'fixed' as const,
    bottom: 24,
    right: 24,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #727B81 0%, #C4C4C4 100%)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(196, 196, 196, 0.3)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    outline: 'none', // Supprime outline par défaut
  },
  bubbleFocus: {
    // WCAG 2.1 AA: Focus indicator visible (3:1 contrast)
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.2), 0 0 0 3px rgba(196, 196, 196, 0.6)',
    outline: '2px solid #C4C4C4',
    outlineOffset: '2px',
  },
  bubbleHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.3)',
  },
  bubbleIcon: {
    fontSize: '24px',
    color: '#040F1F',
    fontWeight: '600',
  },
  panel: {
    position: 'fixed' as const,
    bottom: 24,
    right: 24,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    background: 'linear-gradient(180deg, #1a1f2e 0%, #0a0e1a 100%)',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(196, 196, 196, 0.1)',
    border: '1px solid rgba(114, 123, 129, 0.3)',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(114, 123, 129, 0.2)',
    background: 'rgba(114, 123, 129, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#C4C4C4',
    margin: 0,
  },
  subtitle: {
    fontSize: '11px',
    color: '#727B81',
    marginTop: '2px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: '6px',
    background: 'rgba(114, 123, 129, 0.15)',
    border: '1px solid rgba(196, 196, 196, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#C4C4C4',
    fontSize: '14px',
    transition: 'background 0.2s ease-in-out, outline 0.2s ease-in-out',
    outline: 'none', // Supprime outline par défaut
  },
  iconButtonFocus: {
    // WCAG 2.1 AA: Focus indicator visible
    outline: '2px solid #C4C4C4',
    outlineOffset: '2px',
    background: 'rgba(114, 123, 129, 0.25)',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  inputContainer: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(114, 123, 129, 0.2)',
    background: 'rgba(4, 15, 31, 0.5)',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(114, 123, 129, 0.1)',
    border: '1px solid rgba(196, 196, 196, 0.2)',
    borderRadius: '8px',
    color: '#C4C4C4',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    resize: 'none' as const,
  },
  inputFocus: {
    // WCAG 2.1 AA: Focus indicator visible
    borderColor: '#C4C4C4',
    boxShadow: '0 0 0 2px rgba(196, 196, 196, 0.3)',
  },
  sendButton: {
    marginTop: '8px',
    width: '100%',
    padding: '8px',
    background: 'linear-gradient(135deg, #727B81 0%, #C4C4C4 100%)',
    border: 'none',
    borderRadius: '6px',
    color: '#040F1F',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease-in-out, outline 0.2s ease-in-out',
    outline: 'none',
  },
  sendButtonFocus: {
    // WCAG 2.1 AA: Focus indicator visible
    outline: '2px solid #C4C4C4',
    outlineOffset: '2px',
  },
  statusBar: {
    padding: '8px 16px',
    background: 'rgba(114, 123, 129, 0.05)',
    borderTop: '1px solid rgba(114, 123, 129, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#727B81',
  },
  modelBadge: {
    padding: '2px 6px',
    background: 'rgba(196, 196, 196, 0.1)',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#C4C4C4',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AIChatBubble: React.FC<AIChatBubbleProps> = ({
  initialPosition = { x: 24, y: 24 },
  devMode = false,
}) => {
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    currentModel,
    open,
    close,
    minimize,
    maximize,
    sendMessage: sendGlobalMessage,
    clear,
    setModel,
    toggleFullscreen,
    enableDevMode,
  } = useGlobalAIChat();

  // Props currently unused but kept for API compatibility
  void initialPosition;
  void devMode;

  const [input, setInput] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isBubbleFocused, setIsBubbleFocused] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSendButtonFocused, setIsSendButtonFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 📊 Monitoring: Conversation ID unique (persiste pendant la session)
  const conversationId = useRef<string>(generateCorrelationId());
  const messageStartTime = useRef<number>(0);

  /**
   * 🔧 HELPER: Extrait le contenu textuel d'un message (supporte string ou objet)
   */
  const getMessageText = useCallback((message: AIMessage): string => {
    if (typeof message.content === 'string') {
      return message.content;
    }
    if (message.content && typeof message.content === 'object') {
      return (message.content as { text?: string }).text || '';
    }
    return '';
  }, []);

  /**
   * 🔒 MEMOIZED: Messages filtrés et validés (évite race conditions)
   */
  const validMessages = useMemo(() => {
    return messages.filter(message => {
      // Validation stricte structure
      if (!message || typeof message !== 'object') {
        console.warn('[AIChatBubble] ⚠️ Message invalide (structure)', message);
        return false;
      }
      
      // Validation rôle
      if (!message.role || !['user', 'assistant'].includes(message.role)) {
        console.warn('[AIChatBubble] ⚠️ Message invalide (rôle)', message);
        return false;
      }
      
      // Validation contenu
      const messageText = getMessageText(message);
      const hasContent = messageText && messageText.trim().length > 0;
      if (!hasContent) {
        console.warn('[AIChatBubble] ⚠️ Message vide', { 
          role: message.role, 
          timestamp: message.timestamp 
        });
        return false;
      }
      
      // Message valide
      console.log('[AIChatBubble] ✅ Message affiché', {
        role: message.role,
        contentLength: messageText.length,
        timestamp: message.timestamp
      });
      return true;
    });
  }, [messages, getMessageText]);

  // ═══ AUTO-SCROLL ═══
  useEffect(() => {
    // 🚨 DEBUG: Log changement messages
    console.log('[AIChatBubble] 🔄 Messages mis à jour', {
      count: messages.length,
      lastMessage: messages[messages.length - 1],
      timestamp: new Date().toISOString()
    });
    
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ═══ SUDO COMMANDS LISTENER ═══
  useEffect(() => {
    const handleChatOpen = () => open();
    const handleChatClose = () => close();
    const handleChatMinimize = () => minimize();
    const handleChatMaximize = () => maximize();
    const handleChatClear = () => clear();
    const handleChatSetModel = (e: Event) => {
      const customEvent = e as CustomEvent<{ model: string }>;
      if (customEvent.detail?.model) {
        setModel(customEvent.detail.model);
      }
    };
    const handleChatDevMode = () => enableDevMode();
    const handleChatFullscreen = () => toggleFullscreen();

    if (typeof window !== 'undefined') {
      window.addEventListener('titane-chat-open', handleChatOpen);
      window.addEventListener('titane-chat-close', handleChatClose);
      window.addEventListener('titane-chat-minimize', handleChatMinimize);
      window.addEventListener('titane-chat-maximize', handleChatMaximize);
      window.addEventListener('titane-chat-clear', handleChatClear);
      window.addEventListener('titane-chat-set-model', handleChatSetModel);
      window.addEventListener('titane-chat-dev-mode', handleChatDevMode);
      window.addEventListener('titane-chat-fullscreen', handleChatFullscreen);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('titane-chat-open', handleChatOpen);
        window.removeEventListener('titane-chat-close', handleChatClose);
        window.removeEventListener('titane-chat-minimize', handleChatMinimize);
        window.removeEventListener('titane-chat-maximize', handleChatMaximize);
        window.removeEventListener('titane-chat-clear', handleChatClear);
        window.removeEventListener('titane-chat-set-model', handleChatSetModel);
        window.removeEventListener('titane-chat-dev-mode', handleChatDevMode);
        window.removeEventListener('titane-chat-fullscreen', handleChatFullscreen);
      }
    };
  }, [open, close, minimize, maximize, clear, setModel, enableDevMode, toggleFullscreen]);

  // 📊 Monitoring: Démarrer conversation au premier message
  useEffect(() => {
    if (messages.length === 1 && !isLoading) {
      chatMetrics.startConversation(conversationId.current);
      logger.info('Conversation démarrée', 'AIChatBubble', {
        conversationId: conversationId.current,
      });
      
      // Démarrer le système d'alertes si pas déjà démarré
      alerting.start();
    }
  }, [messages.length, isLoading]);

  // ═══ HANDLERS ═══
  const handleBubbleClick = useCallback(() => {
    if (isMinimized) {
      maximize();
    } else {
      open();
    }
  }, [isMinimized, maximize, open]);

  const handleMinimize = useCallback(() => {
    minimize();
  }, [minimize]);

  const handleClose = useCallback(() => {
    close();
  }, [close]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    const correlationId = generateCorrelationId();
    
    try {
      // 📊 Métriques: Enregistrer envoi message
      chatMetrics.recordMessageSent(conversationId.current, message.length);
      messageStartTime.current = Date.now();
      
      // 🚨 DEBUG: Log envoi message UI
      console.log('[AIChatBubble] 📤 Envoi message UI', {
        message: message.substring(0, 100),
        messageLength: message.length,
        currentMessagesCount: messages.length,
        timestamp: new Date().toISOString()
      });
      
      logger.info('Message utilisateur envoyé', 'AIChatBubble', {
        messageLength: message.length,
        messagesCount: messages.length,
      }, correlationId);
      
      setInput('');
      await sendGlobalMessage(message);
      
      // 📊 Métriques: Enregistrer réception réponse
      const responseTime = Date.now() - messageStartTime.current;
      const lastMessage = messages[messages.length - 1];
      const responseLength = lastMessage ? getMessageText(lastMessage).length : 0;
      
      chatMetrics.recordMessageReceived(conversationId.current, responseTime, responseLength);
      
      logger.info('Réponse IA reçue', 'AIChatBubble', {
        responseTime,
        responseLength,
      }, correlationId);
      
      // 🚨 DEBUG: Log après envoi
      console.log('[AIChatBubble] ✅ Message envoyé, attente réponse...', {
        newMessagesCount: messages.length,
        isLoading
      });
    } catch (error) {
      // � Métriques: Enregistrer erreur
      const errorMessage = error instanceof Error ? error.message : String(error);
      chatMetrics.recordError(conversationId.current, 'send_message_failed', errorMessage);
      
      logger.error('Erreur envoi message', 'AIChatBubble', error, {
        messageLength: message.length,
      }, correlationId);
      
      // 🔔 Alerte: Déclencher alerte si erreur
      alerting.triggerManualAlert(
        AlertType.ERROR_BOUNDARY_TRIGGERED,
        AlertSeverity.WARNING,
        `Erreur envoi message: ${errorMessage}`,
        { conversationId: conversationId.current, errorMessage }
      );
      
      // 🔴 FAILSAFE: Ne jamais crasher l'UI
      console.error('[AIChatBubble] ❌ Erreur envoi message', error);
      setInput(message); // Restaurer input si erreur
    }
  }, [input, isLoading, sendGlobalMessage, messages.length, getMessageText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleClear = useCallback(() => {
    if (window.confirm('Effacer toute la conversation ?')) {
      clear();
    }
  }, [clear]);

  // ═══ RENDER BUBBLE (Minimized) ═══
  if (!isOpen || isMinimized) {
    return (
      <ChatErrorBoundary>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            ...styles.bubble,
            ...(isHovering ? styles.bubbleHover : {}),
            ...(isBubbleFocused ? styles.bubbleFocus : {}),
          }}
          onClick={handleBubbleClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onFocus={() => setIsBubbleFocused(true)}
          onBlur={() => setIsBubbleFocused(false)}
          title="TITANE∞ AI Companion"
          role="button"
          aria-label="Ouvrir TITANE∞ AI Companion"
          aria-expanded={isOpen && !isMinimized}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBubbleClick();
            }
          }}
        >
          <span style={styles.bubbleIcon} role="img" aria-label="Icône cerveau intelligence artificielle">🧠</span>
        </motion.div>
      </ChatErrorBoundary>
    );
  }

  // ═══ RENDER PANEL (Open) ═══
  return (
    <ChatErrorBoundary>
      <AnimatePresence>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={styles.panel}
        role="dialog"
        aria-label="TITANE∞ AI Companion Chat Panel"
        aria-modal="false"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
          }
        }}
      >
        {/* Header */}
        <div style={styles.header} role="banner">
          <div>
            <h3 style={styles.title} id="chat-title">TITANE∞ AI COMPANION</h3>
            <div style={styles.subtitle} role="status" aria-live="polite">
              {currentModel} • {messages.length} messages
            </div>
          </div>
          <div style={styles.headerActions} role="toolbar" aria-label="Actions du chat">
            <button 
              style={styles.iconButton} 
              onClick={handleClear} 
              title="Effacer la conversation"
              aria-label="Effacer la conversation"
            >
              <span role="img" aria-label="Icône corbeille">🗑️</span>
            </button>
            <button 
              style={styles.iconButton} 
              onClick={handleMinimize} 
              title="Minimiser"
              aria-label="Minimiser le chat"
            >
              —
            </button>
            <button 
              style={styles.iconButton} 
              onClick={handleClose} 
              title="Fermer"
              aria-label="Fermer le chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          style={styles.messagesContainer}
          role="log"
          aria-label="Historique de conversation"
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions"
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#727B81', padding: '40px 20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠⚡∞</div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                TITANE∞ AI Companion
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                Assistant permanent • Toujours disponible
              </div>
            </div>
          )}

          {validMessages.map((message, index) => (
            <MessageBubble
              key={message.timestamp ? `${message.timestamp}-${index}` : `msg-${index}`}
              role={message.role}
              content={getMessageText(message)}
              timestamp={message.timestamp}
            />
          ))}

          {isLoading && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(114, 123, 129, 0.1)',
                borderRadius: '8px',
                color: '#727B81',
                fontSize: '12px',
              }}
            >
              <span>TITANE∞ réfléchit</span>
              <span className="animate-pulse">...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer} role="form" aria-label="Formulaire de message">
          <textarea
            style={{
              ...styles.input,
              ...(isInputFocused ? styles.inputFocus : {}),
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Message TITANE∞..."
            rows={2}
            disabled={isLoading}
            aria-label="Saisir votre message"
            aria-multiline="true"
            aria-required="false"
            aria-disabled={isLoading}
          />
          <button
            style={{
              ...styles.sendButton,
              ...(isSendButtonFocused ? styles.sendButtonFocus : {}),
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSend}
            onFocus={() => setIsSendButtonFocused(true)}
            onBlur={() => setIsSendButtonFocused(false)}
            disabled={!input.trim() || isLoading}
            aria-label={isLoading ? 'Envoi en cours...' : 'Envoyer le message'}
            aria-disabled={!input.trim() || isLoading}
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>

        {/* Status Bar */}
        <div style={styles.statusBar}>
          <span>TITANE∞ v∞.25.0</span>
          <span style={styles.modelBadge}>{currentModel}</span>
        </div>
      </motion.div>
    </AnimatePresence>
    </ChatErrorBoundary>
  );
};

AIChatBubble.displayName = 'AIChatBubble';

export default AIChatBubble;
