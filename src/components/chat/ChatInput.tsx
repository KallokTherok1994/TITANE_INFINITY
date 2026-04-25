import { ErrorBoundary } from '../ErrorBoundary';
/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — CHAT INPUT OMEGA (UI ANTI-CRASH)
 *   Validation input • Anti-spam • Sanitisation sécurisée
 *   Zone de saisie avec protection + Import fichiers pour analyse IA
 *   v22Ω AI Performance Optimizations Compatible
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@/lib/logger';
import { autoHealEngine } from '../../services/ai/system';
import { FileUploadButton, type AnalyzedFile, type FileCategory } from './FileUploadButton';
import { DictationButton } from './DictationButton';
import { resolveImportedFileContent } from './fileImportSupport';
import { UI_DELAYS } from '@/constants/timeouts';
import './ChatInput.css';

const isDev = process.env.NODE_ENV === 'development';
const CONTROL_CHAR_PATTERN = /\p{Cc}+/gu;

interface ChatInputProps {
  onSend: (message: string) => void;
  onFilesAnalyzed?: (files: AnalyzedFile[]) => void;
  disabled?: boolean;
  placeholder?: string;
  voiceModeActive?: boolean;
  onToggleVoiceMode?: () => void;
  enableFileUpload?: boolean;
  enableDictation?: boolean;
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
  softWarningLength: 10000, // Seuil informatif uniquement
  minInterval: 600, // Min millisecondes entre messages
  maxSpam: 15, // Max messages spam avant block
  spamResetTime: 15000, // Reset compteur spam après 15s
  dangerousPatterns: [
    // Patterns potentiellement dangereux
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
    spamCount: 0,
  });

  const lastMessageTime = useRef(0);
  const messageSent = useRef(false);

  const handleInputError = useCallback(
    (error: Error, context: string, inputValue?: string) => {
      // Auto-heal trigger (direct instance)
      autoHealEngine.heal('chat-input', error, 'validation', {
        context,
        inputLength: inputValue?.length || 0,
        timestamp: Date.now(),
      });

      setInputState(prev => ({
        ...prev,
        inputError: error.message,
        recoveryCount: prev.recoveryCount + 1,
      }));

      if (isDev) {
        logger.error(
          'Chat input error handled',
          { component: 'ChatInput', action: 'handleError', context },
          error
        );
      }
    },
    []
  );

  const validateMessage = useCallback(
    (message: string): { valid: boolean; reason?: string } => {
      try {
        // Validation longueur
        if (message.length === 0) {
          return { valid: false, reason: 'Message vide' };
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
            lastSpamCheck: now,
          }));

          if (inputState.spamCount >= OMEGA_INPUT_CONFIG.maxSpam) {
            return {
              valid: false,
              reason: 'Limite de fréquence atteinte. Veuillez patienter.',
            };
          }
        }

        // Reset spam counter si assez de temps écoulé
        if (now - inputState.lastSpamCheck > OMEGA_INPUT_CONFIG.spamResetTime) {
          setInputState(prev => ({
            ...prev,
            spamCount: 0,
            isBlocked: false,
          }));
        }

        return { valid: true };
      } catch (validationError) {
        handleInputError(
          validationError instanceof Error
            ? validationError
            : new Error(String(validationError)),
          'message-validation',
          message
        );
        return { valid: false, reason: 'Erreur de validation interne' };
      }
    },
    [inputState.spamCount, inputState.lastSpamCheck, handleInputError]
  );

  const sanitizeInput = useCallback(
    (input: string): string => {
      try {
        // Nettoyage basique mais sécurisé
        return input
          .replace(CONTROL_CHAR_PATTERN, '') // Caractères de contrôle
          .replace(/\s+/g, ' ') // Espaces multiples
          .trim(); // Trim sécurisé
      } catch (sanitizeError) {
        handleInputError(
          sanitizeError instanceof Error
            ? sanitizeError
            : new Error(String(sanitizeError)),
          'input-sanitization',
          input
        );
        return '';
      }
    },
    [handleInputError]
  );

  const resetError = useCallback(() => {
    setInputState(prev => ({
      ...prev,
      inputError: null,
    }));
  }, []);

  return {
    inputState,
    validateMessage,
    sanitizeInput,
    handleInputError,
    resetError,
    lastMessageTime,
    messageSent,
  };
}

function extCategory(filename: string): FileCategory {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  if (['.ts', '.tsx', '.js', '.jsx', '.rs', '.py', '.java', '.cpp', '.c', '.go', '.rb'].includes(ext)) return 'code';
  if (['.md', '.txt', '.doc', '.docx', '.pdf', '.log'].includes(ext)) return 'document';
  if (['.json', '.xml', '.yaml', '.yml', '.csv', '.sql'].includes(ext)) return 'data';
  if (['.toml', '.ini', '.env', '.config'].includes(ext)) return 'config';
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
  return 'unknown';
}

function extIcon(category: FileCategory): string {
  const map: Record<FileCategory, string> = { code: '📄', document: '📝', data: '📊', config: '⚙️', image: '🖼️', unknown: '📁' };
  return map[category];
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * CHAT INPUT OMEGA COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 */
export const ChatInput: React.FC<ChatInputProps> = React.memo(
  ({
    onSend,
    onFilesAnalyzed,
    disabled = false,
    placeholder = 'Posez votre question...',
    voiceModeActive: externalVoiceModeActive,
    onToggleVoiceMode: externalToggleVoiceMode,
    enableFileUpload = true,
    enableDictation = true,
  }) => {
    // Debug: vérifier si onToggleVoiceMode est défini
    console.warn(
      '[ChatInput] onToggleVoiceMode:',
      typeof externalToggleVoiceMode,
      !!externalToggleVoiceMode
    );

    // État vocal interne si pas de props externes
    const [internalVoiceMode, setInternalVoiceMode] = useState(false);

    // Utiliser les props externes si disponibles, sinon l'état interne
    const voiceModeActive = externalVoiceModeActive ?? internalVoiceMode;
    const onToggleVoiceMode = useMemo(
      () => externalToggleVoiceMode ?? (() => setInternalVoiceMode(prev => !prev)),
      [externalToggleVoiceMode]
    );

    const [value, setValue] = useState('');
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<AnalyzedFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mountedRef = useRef(false);

    const {
      inputState,
      validateMessage,
      sanitizeInput,
      handleInputError,
      resetError,
      lastMessageTime,
      messageSent,
    } = useOmegaInputProtection();

    // ═══ PHASE 5.1: AUTO-RESIZE WITH PROTECTION ═══
    useEffect(() => {
      if (!mountedRef.current) return;

      try {
        if (textareaRef.current) {
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
          isDev && console.warn('[OMEGA CHAT INPUT] Component mounted with focus');
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
        const timer = setTimeout(resetError, UI_DELAYS.ERROR_DISMISS);
        return () => clearTimeout(timer);
      }
    }, [inputState.inputError, resetError]);

    // ═══ PHASE 5.4: PROTECTED SEND HANDLER ═══
    const handleSend = useCallback(async () => {
      console.warn('[ChatInput OMEGA] 🔘 handleSend appelé', {
        value: value.substring(0, 30),
        disabled,
        mounted: mountedRef.current,
      });

      if (!mountedRef.current) {
        console.warn('[ChatInput OMEGA] ❌ Non monté, abandon');
        return;
      }

      try {
        const sanitized = sanitizeInput(value);
        const validation = validateMessage(sanitized);

        console.warn('[ChatInput OMEGA] 🔍 Validation:', validation);

        if (!validation.valid) {
          console.warn('[ChatInput OMEGA] ❌ Validation échouée:', validation.reason);
          if (validation.reason) {
            handleInputError(new Error(validation.reason), 'send-validation', sanitized);
          }
          return;
        }

        if (disabled || messageSent.current) {
          console.warn('[ChatInput OMEGA] ❌ Disabled ou déjà envoyé');
          return;
        }

        console.warn(
          '[ChatInput OMEGA] ✅ Envoi du message:',
          sanitized.substring(0, 50)
        );

        // Marquer comme envoyé pour éviter les doubles
        messageSent.current = true;
        lastMessageTime.current = Date.now();

        // ⭐ PHASE 4 ÉTAPE 1: Timeout restauré 10s (testing si cause blocage)
        const resetTimeout = setTimeout(() => {
          if (messageSent.current && mountedRef.current) {
            logger.warn('messageSent.current force reset after 10s timeout', {
              component: 'ChatInput',
              action: 'handleSend',
            });
            messageSent.current = false;
          }
        }, 10000); // PHASE 4: Timeout restauré à 10s

        try {
          // Envoyer le message (async safe)
          await onSend(sanitized);
          setValue('');

          // ✅ Reset immédiat après succès
          clearTimeout(resetTimeout);
          messageSent.current = false;

          // Reset height et restore focus
          setTimeout(() => {
            if (textareaRef.current && mountedRef.current) {
              textareaRef.current.style.height = 'auto';
              textareaRef.current.focus();
            }
          }, 100);
        } catch (sendError) {
          // ✅ Reset même en erreur
          clearTimeout(resetTimeout);
          messageSent.current = false;
          throw sendError; // Re-throw pour catch externe
        }
      } catch (sendError) {
        messageSent.current = false;
        handleInputError(
          sendError instanceof Error ? sendError : new Error(String(sendError)),
          'send-message',
          value
        );
      }
    }, [
      value,
      disabled,
      onSend,
      sanitizeInput,
      validateMessage,
      handleInputError,
      messageSent,
      lastMessageTime,
    ]);

    // ═══ PHASE 5.5: PROTECTED KEYBOARD HANDLER ═══
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      },
      [handleSend, resetError, handleInputError]
    );

    // ═══ PHASE 5.6: PROTECTED INPUT CHANGE ═══
    const handleValueChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        try {
          const newValue = e.target.value;

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
      },
      [inputState.inputError, resetError, handleInputError]
    );

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

    // ═══ PHASE 5.7.1: FILE UPLOAD HANDLERS ═══
    const handleToggleFileUpload = useCallback(() => {
      setShowFileUpload(prev => !prev);
    }, []);

    const handleFilesSelected = useCallback(
      (files: AnalyzedFile[]) => {
        isDev && console.warn('[ChatInput] Files selected:', files.length);
        setUploadedFiles(files);

        // Notifier le parent
        if (onFilesAnalyzed) {
          onFilesAnalyzed(files);
        }

        // Créer un message formaté avec les fichiers
        if (files.length > 0) {
          const filesSummary = files
            .filter(f => f.status === 'done' && f.analysis)
            .map(
              f => `📄 **${f.name}**\n${f.analysis?.summary || 'Analyse non disponible'}`
            )
            .join('\n\n');

          if (filesSummary) {
            const currentValue = value.trim();
            const newValue = currentValue
              ? `${currentValue}\n\n---\n📎 Fichiers importés:\n${filesSummary}`
              : `📎 Fichiers importés pour analyse:\n${filesSummary}\n\nAnalyse ces fichiers et donne-moi un résumé.`;
            setValue(newValue);
          }
        }
      },
      [onFilesAnalyzed, value]
    );

    // ═══ PHASE 5.7.2: DICTATION HANDLER ═══
    const handleDictationResult = useCallback((text: string) => {
      isDev && console.warn('[ChatInput] Dictation result:', text);

      // Insérer le texte dicté dans le champ de saisie
      setValue(prev => {
        const separator = prev.trim() ? ' ' : '';
        return prev + separator + text;
      });

      // Focus sur le textarea
      textareaRef.current?.focus();
    }, []);

    // ═══ PHASE 5.7.3: DRAG & DROP SUR LE CONTAINER DU CHAT ═══
    const processDroppedFiles = useCallback(
      async (fileList: FileList | File[]) => {
        const files = Array.from(fileList);
        if (files.length === 0) return;
        const results: AnalyzedFile[] = [];
        for (const file of files) {
          const category = extCategory(file.name);
          const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          try {
            const content = await resolveImportedFileContent(file);
            const lines = content.split('\n').length;
            const words = content.split(/\s+/).filter(w => w.length > 0).length;
            results.push({
              id,
              name: file.name,
              size: file.size,
              type: file.type,
              category,
              sourcePath: (file as File & { path?: string }).path ?? null,
              content,
              preview: content.substring(0, 200),
              status: 'done',
              analysis: {
                summary: `${file.name} • ${lines} lignes • ${words} mots`,
                lineCount: lines,
                wordCount: words,
                charCount: content.length,
                contentType: file.name.slice(file.name.lastIndexOf('.')).slice(1).toUpperCase(),
                metadata: {},
              },
            });
          } catch (err) {
            results.push({
              id,
              name: file.name,
              size: file.size,
              type: file.type,
              category: 'unknown',
              sourcePath: null,
              content: null,
              preview: '',
              status: 'error',
              error: err instanceof Error ? err.message : 'Erreur de lecture',
            });
          }
        }
        handleFilesSelected(results);
      },
      [handleFilesSelected]
    );

    const handleContainerDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && e.dataTransfer.types.includes('Files')) {
        setIsDragOver(true);
      }
    }, [disabled]);

    const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    }, []);

    const handleContainerDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (disabled || !e.dataTransfer.files.length) return;
        setShowFileUpload(true);
        await processDroppedFiles(e.dataTransfer.files);
      },
      [disabled, processDroppedFiles]
    );

    // ═══ PHASE 5.8: MEMOIZED COMPUTATIONS ═══
    const isInputDisabled = useMemo(() => {
      return disabled || inputState.isBlocked || !!inputState.inputError;
    }, [disabled, inputState.isBlocked, inputState.inputError]);

    const trimmedValue = useMemo(() => {
      return value.trim();
    }, [value]);

    const placeholderSafe = useMemo(() => {
      if (inputState.inputError) return "⚠️ Erreur d'input - Réessayez...";
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
              <button
                type="button"
                onClick={resetError}
                className="chat-input-error-reset"
                aria-label="Réinitialiser la saisie et réessayer"
              >
                Réinitialiser input
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ═══ PHASE 5.10: MAIN RENDER WITH PROTECTION ═══
    return (
      <ErrorBoundary>
        <div
          className={`chat-input-container chat-input-omega${isDragOver ? ' drag-over' : ''}`}
          data-omega-version="v19.2Ω"
          onDragOver={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={handleContainerDrop}
        >
          {/* Zone d'import fichiers (expandable) */}
          {enableFileUpload && showFileUpload && (
            <div className="chat-file-upload-zone">
              <FileUploadButton
                className="chat-file-upload-expanded"
                onFilesSelected={handleFilesSelected}
                disabled={isInputDisabled}
              />
            </div>
          )}

          {/* Chips fichiers uploadés */}
          {uploadedFiles.length > 0 && (
            <div className="chat-uploaded-files">
              {uploadedFiles.map(file => (
                <div key={file.id} className={`chat-file-chip ${file.status}`}>
                  <span className="chat-file-chip-icon">
                    {extIcon(file.category)}
                  </span>
                  <span className="chat-file-chip-name" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    className="chat-file-chip-remove"
                    onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                    title="Retirer ce fichier"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Wrapper principal : boutons + textarea */}
          <div className="chat-input-wrapper">
            {enableFileUpload && (
              <button
                type="button"
                className={`chat-file-btn${showFileUpload ? ' active' : ''}`}
                onClick={handleToggleFileUpload}
                disabled={isInputDisabled}
                title="Importer un fichier (ou glisser-déposer)"
                aria-label="Importer un fichier"
              >
                <span className="chat-file-icon">📎</span>
              </button>
            )}

            <textarea
              ref={textareaRef}
              className="chat-input"
              data-testid="chat-input-textarea"
              placeholder={isDragOver ? 'Déposez vos fichiers ici...' : placeholderSafe}
              value={value}
              onChange={handleValueChange}
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
              rows={3}
              aria-label="Zone de saisie du message"
            />

            {enableDictation && (
              <DictationButton
                onDictationResult={handleDictationResult}
                disabled={isInputDisabled}
              />
            )}

            <button
              type="button"
              className="chat-send-btn"
              onClick={handleSend}
              disabled={isInputDisabled || !trimmedValue}
              title="Envoyer (Entrée)"
              aria-label="Envoyer le message"
            >
              <span className="chat-send-icon">➤</span>
            </button>
          </div>

          {/* Hint bas de page */}
          <div
            id="chat-input-hint"
            className="chat-input-hint"
            role="region"
            aria-label="Aide à la saisie"
          >
            <span className="chat-hint-text">
              Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
              {enableFileUpload && ' • 📎 Fichiers'}
              {enableDictation && ' • 🎤 Vocal'}
              {(() => {
                const maxUserMessageChars = 12000;
                if (maxUserMessageChars > 10000) {
                  return (
                    <span className="chat-hint-unlimited">
                      {' '}
                      • <span>illimité</span>
                    </span>
                  );
                }
                return null;
              })()}
              {inputState.spamCount > 0 && (
                <span className="chat-hint-spam">
                  {' '}
                  • ⚠️ Spam: {inputState.spamCount}/{OMEGA_INPUT_CONFIG.maxSpam}
                </span>
              )}
              {inputState.recoveryCount > 0 && (
                <span className="chat-hint-recovery">
                  {' '}
                  • 🔄 Récupérations: {inputState.recoveryCount}
                </span>
              )}
              {uploadedFiles.length > 0 && (
                <span className="chat-hint-files">
                  {' '}
                  • 📄 {uploadedFiles.length} fichier(s)
                </span>
              )}
            </span>
          </div>
        </div>
      </ErrorBoundary>
    );
  },
  (prevProps, nextProps) => {
    // ═══ MEMOIZATION WITH PROTECTION ═══
    try {
      return (
        prevProps.disabled === nextProps.disabled &&
        prevProps.placeholder === nextProps.placeholder &&
        prevProps.voiceModeActive === nextProps.voiceModeActive
      );
    } catch (memoError) {
      // Si la memoization plante, on re-render
      if (isDev) {
        logger.error(
          'Memo comparison failed',
          { component: 'ChatInput', action: 'memo' },
          memoError as Error
        );
      }
      return false;
    }
  }
);

ChatInput.displayName = 'ChatInputOmega';

export default ChatInput;
