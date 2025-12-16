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

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalAIChat } from '../hooks/useGlobalAIChat';
import { MessageBubble } from './chat/MessageBubble';
import type { Message } from '../core/ARCHITECTURE_TYPES_v∞';

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
    transition: 'background 0.2s ease-in-out',
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
    transition: 'border-color 0.2s ease-in-out',
    resize: 'none' as const,
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
    transition: 'opacity 0.2s ease-in-out',
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ═══ AUTO-SCROLL ═══
  useEffect(() => {
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
    setInput('');
    await sendGlobalMessage(message);
  }, [input, isLoading, sendGlobalMessage]);

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
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          ...styles.bubble,
          ...(isHovering ? styles.bubbleHover : {}),
        }}
        onClick={handleBubbleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        title="TITANE∞ AI Companion"
      >
        <span style={styles.bubbleIcon}>🧠</span>
      </motion.div>
    );
  }

  // ═══ RENDER PANEL (Open) ═══
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={styles.panel}
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>TITANE∞ AI COMPANION</h3>
            <div style={styles.subtitle}>
              {currentModel} • {messages.length} messages
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.iconButton} onClick={handleClear} title="Effacer">
              🗑️
            </button>
            <button style={styles.iconButton} onClick={handleMinimize} title="Minimiser">
              —
            </button>
            <button style={styles.iconButton} onClick={handleClose} title="Fermer">
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
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

          {messages.map((message, index) => (
            <MessageBubble
              key={message.timestamp ? `${message.timestamp}-${index}` : `msg-${index}`}
              role={message.role}
              content={message.content}
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
        <div style={styles.inputContainer}>
          <textarea
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message TITANE∞..."
            rows={2}
            disabled={isLoading}
          />
          <button
            style={{
              ...styles.sendButton,
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
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
  );
};

AIChatBubble.displayName = 'AIChatBubble';

export default AIChatBubble;
