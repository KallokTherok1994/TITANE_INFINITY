/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.1 — CHAT INPUT COMPONENT OPTIMISÉ
 *   Zone de saisie avec voice mode, auto-resize et shortcuts
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  voiceModeActive?: boolean;
  onToggleVoiceMode?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Posez votre question...',
  voiceModeActive = false,
  onToggleVoiceMode,
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Focus au montage
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Message à envoyer"
        />

        {onToggleVoiceMode && (
          <button
            className={`chat-voice-btn ${voiceModeActive ? 'active' : ''}`}
            onClick={onToggleVoiceMode}
            disabled={disabled}
            title={voiceModeActive ? 'Désactiver le mode vocal' : 'Activer le mode vocal'}
            aria-label={voiceModeActive ? 'Désactiver le mode vocal' : 'Activer le mode vocal'}
          >
            <span className="chat-voice-icon">🎤</span>
          </button>
        )}

        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Envoyer le message"
        >
          <span className="chat-send-icon">➤</span>
        </button>
      </div>

      <div className="chat-input-hint">
        <span className="chat-hint-text">
          Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
          {onToggleVoiceMode && ' • 🎤 Mode vocal disponible'}
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
