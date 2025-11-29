/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — CHAT INPUT OMEGA (UI ANTI-CRASH)
 *   PHASE 5Ω: Validation input • Anti-spam • Sanitisation sécurisée
 *   Zone de saisie avec protection contre injection et états corrompus
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { autoHealEngine } from '../../services/ai/autoHealEngine';
import './ChatInput.css';

const isDev = process.env.NODE_ENV === 'development';
const CONTROL_CHAR_PATTERN = /\p{Cc}+/gu;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  voiceModeActive?: boolean;
  onToggleVoiceMode?: () => void;
}

interface ChatInputState {
  inputError: string | null;
  recoveryCount: number;
  lastSpamCheck: number;
  isBlocked: boolean;
  spamCount: number;
}

// Configuration OMEGA
const OMEGA_INPUT_CONFIG = {
  maxLength: 10000,          // Max caractères par message
  minInterval: 1500,         // Min millisecondes entre messages
  maxSpam: 5,                // Max messages spam avant block
  spamResetTime: 30000,      // Reset compteur spam après 30s
  dangerousPatterns: [       // Patterns potentiellement dangereux
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
  ],
} as const;

/**
 * ═══════════════════════════════════════════════════════════════════
 * OMEGA INPUT PROTECTION HOOK
 * ═══════════════════════════════════════════════════════════════════
 */
function useOmegaInputProtection() {
  const [inputState, setInputState] = useState<ChatInputState>({
    inputError: null,
    recoveryCount: 0,
    lastSpamCheck: 0,
    isBlocked: false,
    spamCount: 0
  });

  const lastMessageTime = useRef(0);
  const messageSent = useRef(false);

  const handleInputError = useCallback((error: Error, context: string, inputValue?: string) => {
    // Auto-heal trigger
    autoHealEngine.heal('chat-input', error, 'validation', {
      context,
      inputLength: inputValue?.length || 0,
      timestamp: Date.now()
    });

    setInputState(prev => ({
      ...prev,
      inputError: error.message,
      recoveryCount: prev.recoveryCount + 1
    }));

    isDev && console.error('[OMEGA CHAT INPUT] Error handled:', error, context);
  }, []);

  const validateMessage = useCallback((message: string): { valid: boolean, reason?: string } => {
    try {
      // Validation longueur
      if (message.length === 0) {
        return { valid: false, reason: 'Message vide' };
      }

      if (message.length > OMEGA_INPUT_CONFIG.maxLength) {
        return { valid: false, reason: `Message trop long (max ${OMEGA_INPUT_CONFIG.maxLength} caractères)` };
      }

      // Validation patterns dangereux
      for (const pattern of OMEGA_INPUT_CONFIG.dangerousPatterns) {
        if (pattern.test(message)) {
          return { valid: false, reason: 'Contenu potentiellement dangereux détecté' };
        }
      }

      // Anti-spam check
      const now = Date.now();
      if (now - lastMessageTime.current < OMEGA_INPUT_CONFIG.minInterval) {
        setInputState(prev => ({
          ...prev,
          spamCount: prev.spamCount + 1,
          lastSpamCheck: now
        }));

        if (inputState.spamCount >= OMEGA_INPUT_CONFIG.maxSpam) {
          return { valid: false, reason: 'Limite de fréquence atteinte. Veuillez patienter.' };
        }
      }

      // Reset spam counter si assez de temps écoulé
      if (now - inputState.lastSpamCheck > OMEGA_INPUT_CONFIG.spamResetTime) {
        setInputState(prev => ({
          ...prev,
          spamCount: 0,
          isBlocked: false
        }));
      }

      return { valid: true };

    } catch (validationError) {
      handleInputError(
        validationError instanceof Error ? validationError : new Error(String(validationError)),
        'message-validation',
        message
      );
      return { valid: false, reason: 'Erreur de validation interne' };
    }
  }, [inputState.spamCount, inputState.lastSpamCheck, handleInputError]);

  const sanitizeInput = useCallback((input: string): string => {
    try {
      // Nettoyage basique mais sécurisé
      return input
        .replace(CONTROL_CHAR_PATTERN, '')               // Caractères de contrôle
        .replace(/\s+/g, ' ')                           // Espaces multiples
        .trim();                                       // Trim sécurisé
    } catch (sanitizeError) {
      handleInputError(
        sanitizeError instanceof Error ? sanitizeError : new Error(String(sanitizeError)),
        'input-sanitization',
        input
      );
      return '';
    }
  }, [handleInputError]);

  const resetError = useCallback(() => {
    setInputState(prev => ({
      ...prev,
      inputError: null
    }));
  }, []);

  return {
    inputState,
    validateMessage,
    sanitizeInput,
    handleInputError,
    resetError,
    lastMessageTime,
    messageSent
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * CHAT INPUT OMEGA COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 */
export const ChatInput: React.FC<ChatInputProps> = React.memo(({
  onSend,
  disabled = false,
  placeholder = 'Posez votre question...',
  voiceModeActive = false,
  onToggleVoiceMode,
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(false);

  const {
    inputState,
    validateMessage,
    sanitizeInput,
    handleInputError,
    resetError,
    lastMessageTime,
    messageSent
  } = useOmegaInputProtection();

  // ═══ PHASE 5.1: AUTO-RESIZE WITH PROTECTION ═══
  useEffect(() => {
    if (!mountedRef.current) return;

    try {
      if (textareaRef.current && value.length <= OMEGA_INPUT_CONFIG.maxLength) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    } catch (resizeError) {
      handleInputError(
        resizeError instanceof Error ? resizeError : new Error(String(resizeError)),
        'textarea-resize'
      );
    }
  }, [value, handleInputError]);

  // ═══ PHASE 5.2: FOCUS WITH PROTECTION ═══
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;

      try {
        textareaRef.current?.focus();
        isDev && console.log('[OMEGA CHAT INPUT] Component mounted with focus');
      } catch (focusError) {
        handleInputError(
          focusError instanceof Error ? focusError : new Error(String(focusError)),
          'initial-focus'
        );
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [handleInputError]);

  // ═══ PHASE 5.3: ERROR AUTO-RECOVERY ═══
  useEffect(() => {
    if (inputState.inputError) {
      const timer = setTimeout(resetError, 5000);
      return () => clearTimeout(timer);
    }
  }, [inputState.inputError, resetError]);

  // ═══ PHASE 5.4: PROTECTED SEND HANDLER ═══
  const handleSend = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const sanitized = sanitizeInput(value);
      const validation = validateMessage(sanitized);

      if (!validation.valid) {
        if (validation.reason) {
          handleInputError(new Error(validation.reason), 'send-validation', sanitized);
        }
        return;
      }

      if (disabled || messageSent.current) return;

      // Marquer comme envoyé pour éviter les doubles
      messageSent.current = true;
      lastMessageTime.current = Date.now();

      // Envoyer le message
      onSend(sanitized);
      setValue('');

      // Reset height et état
      setTimeout(() => {
        if (textareaRef.current && mountedRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        messageSent.current = false;
      }, 100);

    } catch (sendError) {
      messageSent.current = false;
      handleInputError(
        sendError instanceof Error ? sendError : new Error(String(sendError)),
        'send-message',
        value
      );
    }
  }, [value, disabled, onSend, sanitizeInput, validateMessage, handleInputError, messageSent, lastMessageTime]);

  // ═══ PHASE 5.5: PROTECTED KEYBOARD HANDLER ═══
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    try {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }

      // Ctrl+A pour tout sélectionner
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        // Laisser le comportement par défaut
        return;
      }

      // Échappement pour nettoyer les erreurs
      if (e.key === 'Escape') {
        resetError();
      }

    } catch (keyError) {
      handleInputError(
        keyError instanceof Error ? keyError : new Error(String(keyError)),
        'keyboard-handler'
      );
    }
  }, [handleSend, resetError, handleInputError]);

  // ═══ PHASE 5.6: PROTECTED INPUT CHANGE ═══
  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newValue = e.target.value;

      // Limite de caractères stricte
      if (newValue.length > OMEGA_INPUT_CONFIG.maxLength) {
        handleInputError(
          new Error(`Limite de ${OMEGA_INPUT_CONFIG.maxLength} caractères atteinte`),
          'input-length-limit'
        );
        return;
      }

      setValue(newValue);

      // Reset erreur si l'utilisateur tape
      if (inputState.inputError) {
        resetError();
      }

    } catch (changeError) {
      handleInputError(
        changeError instanceof Error ? changeError : new Error(String(changeError)),
        'input-change'
      );
    }
  }, [inputState.inputError, resetError, handleInputError]);

  // ═══ PHASE 5.7: PROTECTED VOICE TOGGLE ═══
  const handleVoiceToggle = useCallback(() => {
    try {
      if (onToggleVoiceMode) {
        onToggleVoiceMode();
      }
    } catch (voiceError) {
      handleInputError(
        voiceError instanceof Error ? voiceError : new Error(String(voiceError)),
        'voice-toggle'
      );
    }
  }, [onToggleVoiceMode, handleInputError]);

  // ═══ PHASE 5.8: MEMOIZED COMPUTATIONS ═══
  const isInputDisabled = useMemo(() => {
    return disabled || inputState.isBlocked || !!inputState.inputError;
  }, [disabled, inputState.isBlocked, inputState.inputError]);

  const trimmedValue = useMemo(() => {
    return value.trim();
  }, [value]);

  const characterCount = useMemo(() => {
    return value.length;
  }, [value.length]);

  const placeholderSafe = useMemo(() => {
    if (inputState.inputError) return '⚠️ Erreur d\'input - Réessayez...';
    if (inputState.isBlocked) return '⏳ Limite de fréquence - Patientez...';
    return placeholder;
  }, [inputState.inputError, inputState.isBlocked, placeholder]);

  // ═══ PHASE 5.9: ERROR STATE RENDER ═══
  if (inputState.inputError && inputState.recoveryCount > 3) {
    return (
      <div className="chat-input-container chat-input-error-state">
        <div className="chat-input-error-recovery">
          <div className="chat-input-error-icon">🔄</div>
          <div className="chat-input-error-content">
            <strong>Auto-récupération input OMEGA</strong>
            <p>{inputState.inputError}</p>
            <button onClick={resetError} className="chat-input-error-reset">
              Réinitialiser input
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ PHASE 5.10: MAIN RENDER WITH PROTECTION ═══
  try {
    return (
      <div className="chat-input-container chat-input-omega" data-omega-version="v19.2Ω">
        {/* Error indicator */}
        {inputState.inputError && (
          <div className="chat-input-error-notice">
            <span className="chat-input-error-icon">⚠️</span>
            <span className="chat-input-error-text">{inputState.inputError}</span>
            <button onClick={resetError} className="chat-input-error-dismiss">✕</button>
          </div>
        )}

        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className={`chat-input ${inputState.inputError ? 'chat-input-error' : ''}`}
            placeholder={placeholderSafe}
            value={value}
            onChange={handleValueChange}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            rows={1}
            maxLength={OMEGA_INPUT_CONFIG.maxLength}
            aria-label="Message à envoyer"
            aria-describedby="char-count"
          />

          {/* Character counter */}
          <div id="char-count" className="chat-input-counter">
            <span className={characterCount > OMEGA_INPUT_CONFIG.maxLength * 0.9 ? 'chat-counter-warning' : ''}>
              {characterCount}/{OMEGA_INPUT_CONFIG.maxLength}
            </span>
          </div>

          {/* Voice button with protection */}
          {onToggleVoiceMode && (
            <button
              className={`chat-voice-btn ${voiceModeActive ? 'active' : ''}`}
              onClick={handleVoiceToggle}
              disabled={isInputDisabled}
              title={voiceModeActive ? 'Désactiver le mode vocal' : 'Activer le mode vocal'}
              aria-label={voiceModeActive ? 'Désactiver le mode vocal' : 'Activer le mode vocal'}
            >
              <span className="chat-voice-icon">🎤</span>
            </button>
          )}

          {/* Send button with protection */}
          <button
            className="chat-send-btn chat-send-omega"
            onClick={handleSend}
            disabled={!trimmedValue || isInputDisabled || messageSent.current}
            aria-label="Envoyer le message"
            title="Envoyer le message (Enter)"
          >
            <span className="chat-send-icon">➤</span>
          </button>
        </div>

        <div className="chat-input-hint">
          <span className="chat-hint-text">
            Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
            {onToggleVoiceMode && ' • 🎤 Mode vocal disponible'}
            {inputState.spamCount > 0 && (
              <span className="chat-hint-spam"> • ⚠️ Spam: {inputState.spamCount}/{OMEGA_INPUT_CONFIG.maxSpam}</span>
            )}
            {inputState.recoveryCount > 0 && (
              <span className="chat-hint-recovery"> • 🔄 Récupérations: {inputState.recoveryCount}</span>
            )}
          </span>
        </div>
      </div>
    );

  } catch (renderError) {
    // ═══ ULTIMATE FALLBACK RENDER ═══
    handleInputError(
      renderError instanceof Error ? renderError : new Error(String(renderError)),
      'main-render'
    );

    return (
      <div className="chat-input-container chat-input-critical">
        <div className="chat-input-critical-error">
          <span>🆘 Input OMEGA Error</span>
          <button onClick={() => window.location.reload()}>Recharger</button>
        </div>
      </div>
    );
  }
}, (prevProps, nextProps) => {
  // ═══ MEMOIZATION WITH PROTECTION ═══
  try {
    return (
      prevProps.disabled === nextProps.disabled &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.voiceModeActive === nextProps.voiceModeActive
    );
  } catch (memoError) {
    // Si la memoization plante, on re-render
    isDev && console.error('[OMEGA CHAT INPUT] Memo comparison failed:', memoError);
    return false;
  }
});

ChatInput.displayName = 'ChatInputOmega';

export default ChatInput;
