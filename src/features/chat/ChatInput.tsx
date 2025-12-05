/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Chat Input
 * Input de chat avec suggestions et auto-complete
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, useMemo, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { open } from '@tauri-apps/plugin-dialog';
import { safeInvoke } from '../../utils/invoke';
import { mergeFileKnowledge } from '../../services/singularityBridge';
import { Button, Badge } from '../../ui';
import { colors, spacing, radius, shadows, fontSizes, fontWeights } from '@themes/tokens';
import { awardExperience } from '../../services/experienceService';
import { XPSource } from '../../types/experience';
import { XP } from '../../core/experience/XP_ENGINE'; // ✨ v∞.D3 - XP Engine

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface ChatSuggestion {
  id: string;
  text: string;
  category: 'action' | 'question' | 'command';
  icon?: string;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  onFileImported?: (filename: string, xpGained: number) => void; // Nouveau callback
  placeholder?: string;
  disabled?: boolean;
  suggestions?: ChatSuggestion[];
  maxLength?: number;
  isProcessing?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const categoryColors: Record<ChatSuggestion['category'], string> = {
  action: colors.rubis.primary[500],
  question: colors.saphir.primary[500],
  command: colors.emeraude.primary[500],
};

const categoryIcons: Record<ChatSuggestion['category'], string> = {
  action: '⚡',
  question: '❓',
  command: '💻',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  onFileImported,
  placeholder = 'Écrivez votre message...',
  disabled = false,
  suggestions = [],
  maxLength = 2000,
  isProcessing,
}: ChatInputProps): JSX.Element => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);
  const [isImporting, setIsImporting] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false); // ✅ v∞.B7 - Loading state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = typeof isProcessing === 'boolean' ? isProcessing : internalLoading;

  const filteredSuggestions = useMemo(
    () => suggestions.filter(s => s.text.toLowerCase().includes(value.toLowerCase())),
    [suggestions, value]
  );

  useEffect(() => {
    if (typeof isProcessing === 'boolean') {
      setInternalLoading(isProcessing);
    }
  }, [isProcessing]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
      setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0);
    }
  }, [maxLength, onChange, filteredSuggestions.length]);

  const handleSubmit = useCallback((): void => {
    console.log('[ChatInput] 🔘 handleSubmit appelé', {
      value: value.trim().substring(0, 30),
      disabled,
      isLoading
    });

    if (value.trim() && !disabled && !isLoading) {
      console.log('[ChatInput] ✅ Conditions OK, appel onSubmit');
      if (typeof isProcessing !== 'boolean') {
        setInternalLoading(true); // ✅ v∞.B7 - Activer loading local en mode autonome
      }

      // ✨ v∞.D3 - Gain XP pour message utilisateur
      XP.gain(5, "message_user", `Message: "${value.trim().substring(0, 50)}..."`);

      onSubmit(value.trim());
      onChange('');
      setShowSuggestions(false);
      setSelectedSuggestion(-1);

      if (typeof isProcessing !== 'boolean') {
        // Désactiver loading après délai simulé (le parent gère la vraie réponse quand contrôlé)
        setTimeout(() => setInternalLoading(false), 500);
      }
    } else {
      console.log('[ChatInput] ❌ Conditions NON remplies:', {
        hasValue: !!value.trim(),
        disabled,
        isLoading
      });
    }
  }, [value, disabled, isLoading, onSubmit, onChange, isProcessing]);

  const applySuggestion = useCallback((suggestion: ChatSuggestion): void => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    textareaRef.current?.focus();
  }, [onChange]);

  const handleFileImport = useCallback(async (): Promise<void> => {
    setIsImporting(true);
    try {
      // Ouvrir dialogue de sélection de fichier
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Fichiers supportés',
            extensions: ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'py', 'rs', 'toml', 'yaml', 'yml', 'xml', 'html', 'css', 'csv'],
          },
        ],
      });

      if (!selected) {
        setIsImporting(false);
        return;
      }

      // ✅ v∞.B - Appel sécurisé avec safeInvoke
      const result = await safeInvoke<{
        filename: string;
        path: string;
        type: string;
        lines: number;
        words: number;
        size: number;
        summary: string;
        processed_at: string;
        success: boolean;
      }>('upload_and_process_file', { path: selected });

      if (!result || !result.success) {
        console.error('❌ Échec traitement fichier');
        setIsImporting(false);
        return;
      }

      // ✅ v∞.C6 - Intégrer la connaissance dans SingularityState
      mergeFileKnowledge(result.summary, result.type, result.path);

      // ✨ v∞.D3 - Gain XP pour import fichier
      XP.gain(20, "file_import", `Fichier: ${result.filename} (${result.lines} lignes)`);

      // Attribuer XP (Memory +20)
      await awardExperience('memory', 20, XPSource.FileImport, {
        filename: result.filename,
        lines: result.lines,
        words: result.words,
        type: result.type,
      });

      // Notifier le parent
      if (onFileImported) {
        onFileImported(result.filename, 20);
      }

      console.log(`✅ Fichier importé: ${result.filename} (${result.lines} lignes, ${result.words} mots) +20 XP`);
    } catch (err) {
      console.error('❌ Erreur import fichier:', err);
      // TODO v∞: Afficher bulle d'erreur élégante (jamais de crash)
    } finally {
      setIsImporting(false);
    }
  }, [onFileImported]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Submit on Ctrl/Cmd + Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Navigate suggestions with arrow keys
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
        e.preventDefault();
        const suggestion = filteredSuggestions[selectedSuggestion];
        if (suggestion) {
          applySuggestion(suggestion);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    }
  }, [showSuggestions, filteredSuggestions, selectedSuggestion, handleSubmit, applySuggestion]);

  const charCount = value.length;
  const charPercentage = (charCount / maxLength) * 100;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: spacing[2],
              maxHeight: '200px',
              overflowY: 'auto',
              background: colors.rubis.surface.solid,
              border: `1px solid ${colors.rubis.primary[700]}`,
              borderRadius: radius.lg,
              boxShadow: shadows.xl,
              padding: spacing[2],
              zIndex: 1000,
            }}
          >
            <div
              style={{
                fontSize: fontSizes.xs,
                fontWeight: fontWeights.semibold,
                color: colors.neutral[400],
                marginBottom: spacing[2],
                paddingLeft: spacing[2],
              }}
            >
              Suggestions
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applySuggestion(suggestion)}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  background:
                    selectedSuggestion === index
                      ? colors.rubis.primary[900]
                      : colors.rubis.surface.translucent,
                  border: `1px solid ${selectedSuggestion === index ? colors.rubis.primary[600] : 'transparent'}`,
                  borderRadius: radius.md,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  marginBottom: spacing[1],
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {suggestion.icon || categoryIcons[suggestion.category]}
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    fontSize: fontSizes.sm,
                    color: colors.neutral[100],
                  }}
                >
                  {suggestion.text}
                </span>
                <Badge
                  variant="primary"
                  size="sm"
                  style={{
                    background: `${categoryColors[suggestion.category]}33`,
                    color: categoryColors[suggestion.category],
                  }}
                >
                  {suggestion.category}
                </Badge>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: spacing[3],
          padding: spacing[4],
          background: colors.rubis.surface.solid,
          border: `2px solid ${isFocused ? colors.rubis.primary[600] : colors.rubis.primary[800]}`,
          borderRadius: radius.lg,
          boxShadow: isFocused ? shadows.focusRubis : shadows.md,
          transition: 'all 0.3s',
        }}
      >
        {/* ✅ v∞.B7 - Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="chat-thinking"
            style={{
              position: 'absolute',
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: spacing[2],
              background: colors.rubis.primary[900],
              border: `1px solid ${colors.rubis.primary[700]}`,
              borderRadius: radius.md,
              color: colors.neutral[200],
              fontSize: fontSizes.sm,
              whiteSpace: 'nowrap',
              boxShadow: shadows.lg,
            }}
          >
            Je traite votre demande...
          </motion.div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          style={{
            flex: 1,
            minHeight: '44px',
            maxHeight: '200px',
            padding: spacing[3],
            background: colors.neutral[950],
            border: `1px solid ${colors.neutral[800]}`,
            borderRadius: radius.md,
            color: colors.neutral[100],
            fontSize: fontSizes.base,
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            overflowY: 'auto',
          }}
        />

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
            alignItems: 'flex-end',
          }}
        >
          {/* Bouton Import Fichier */}
          <Button
            variant="ghost"
            onClick={handleFileImport}
            disabled={disabled || isImporting || isLoading}
            title="Importer un fichier (+20 XP)"
            leftIcon="📂"
          >
            {isImporting ? 'Import...' : 'Fichier'}
          </Button>

          {/* Bouton Envoyer */}
          <Button
            variant="primary"
            onClick={() => {
              console.log('[ChatInput] 🖱️ Bouton Envoyer cliqué');
              handleSubmit();
            }}
            disabled={disabled || !value.trim() || isLoading}
            leftIcon={isLoading ? '⏳' : '🚀'}
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </Button>

          {/* Character Count */}
          <div
            style={{
              fontSize: fontSizes.xs,
              color:
                charPercentage > 90
                  ? colors.semantic.error[400]
                  : charPercentage > 75
                    ? colors.semantic.warning[400]
                    : colors.neutral[500],
              fontWeight: fontWeights.medium,
            }}
          >
            {charCount}/{maxLength}
          </div>
        </div>
      </div>

      {/* Hint */}
      <div
        style={{
          marginTop: spacing[2],
          fontSize: fontSizes.xs,
          color: colors.neutral[500],
          textAlign: 'center',
        }}
      >
        <kbd
          style={{
            padding: `${spacing[1]} ${spacing[2]}`,
            background: colors.neutral[900],
            border: `1px solid ${colors.neutral[700]}`,
            borderRadius: radius.sm,
            fontFamily: 'monospace',
          }}
        >
          Ctrl
        </kbd>
        {' + '}
        <kbd
          style={{
            padding: `${spacing[1]} ${spacing[2]}`,
            background: colors.neutral[900],
            border: `1px solid ${colors.neutral[700]}`,
            borderRadius: radius.sm,
            fontFamily: 'monospace',
          }}
        >
          Enter
        </kbd>
        {' pour envoyer'}
      </div>
    </div>
  );
};
