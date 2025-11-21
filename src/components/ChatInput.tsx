/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15.8 — CHAT INPUT COMPONENT
 *   Input multi-ligne avec bouton send et gestion keyboard
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, KeyboardEvent } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Pose une question à TITANE∞...',
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sans Shift = envoyer
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />

        <button
          className="chat-input__send-btn"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          title="Envoyer (Enter)"
        >
          {disabled ? '⏳' : '🚀'}
        </button>
      </div>

      <div className="chat-input__hint">
        <span className="chat-input__hint-text">
          <kbd>Enter</kbd> pour envoyer · <kbd>Shift+Enter</kbd> pour nouvelle ligne
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
