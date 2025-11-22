/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Chat Input
 * Input de chat avec suggestions et auto-complete
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '../../ui';
import { colors, spacing, radius, shadows, fontSizes, fontWeights } from '@themes/tokens';

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
  placeholder?: string;
  disabled?: boolean;
  suggestions?: ChatSuggestion[];
  maxLength?: number;
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
  placeholder = 'Écrivez votre message...',
  disabled = false,
  suggestions = [],
  maxLength = 2000,
}: ChatInputProps): JSX.Element => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredSuggestions = suggestions.filter(s =>
    s.text.toLowerCase().includes(value.toLowerCase())
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
      setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
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
  };

  const handleSubmit = (): void => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      onChange('');
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const applySuggestion = (suggestion: ChatSuggestion): void => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    textareaRef.current?.focus();
  };

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
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
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
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
          >
            Envoyer
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
