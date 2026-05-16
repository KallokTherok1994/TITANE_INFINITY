/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Chat Message
 * Message de chat avec support streaming et metadata cognitive
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui';
import { useAnimation } from '../../contexts/AnimationContext';
import { useTTS } from '@/hooks/useTTS';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  streaming?: boolean;
  provider?: 'gemini' | 'openai' | 'claude' | 'ollama' | 'local';
  metadata?: {
    cognitiveState?: {
      stress: number;
      clarity: number;
      focus: number;
    };
    memoryReferences?: Array<{
      id: string;
      type: string;
      relevance: number;
    }>;
    processingTime?: number;
  };
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const roleConfig = {
  user: {
    bgColor: 'var(--chat-bubble-user)',
    borderColor: 'var(--color-violet-700)',
    textColor: 'var(--color-text-primary)',
    align: 'flex-end' as const,
    label: 'Vous',
  },
  assistant: {
    bgColor: 'var(--chat-bubble-ai)',
    borderColor: 'var(--color-border-default)',
    textColor: 'var(--color-text-primary)',
    align: 'flex-start' as const,
    label: 'TITANE∞',
  },
  system: {
    bgColor: 'var(--color-bg-secondary)',
    borderColor: 'var(--color-border-subtle)',
    textColor: 'var(--color-text-secondary)',
    align: 'center' as const,
    label: 'Système',
  },
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

const providerConfig = {
  gemini: { emoji: '🤖', label: 'Gemini', color: 'var(--color-info-500)' },
  openai: { emoji: '✨', label: 'GPT-4o', color: 'var(--color-text-secondary)' },
  claude: { emoji: '🧠', label: 'Claude', color: 'var(--color-violet-500)' },
  ollama: { emoji: '🦉', label: 'Ollama', color: 'var(--color-success-500)' },
  local: { emoji: '🏠', label: 'Local', color: 'var(--color-text-muted)' },
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const ChatMessage = ({
  role,
  content,
  timestamp,
  streaming = false,
  provider,
  metadata,
}: ChatMessageProps): JSX.Element => {
  const { animationConfig } = useAnimation();
  const { speak, stop, isSpeaking } = useTTS();
  const [displayedContent, setDisplayedContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const config = roleConfig[role];
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content);
    }
  };

  useEffect(() => {
    if (!streaming) {
      setDisplayedContent(content);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [content, streaming]);

  useEffect(() => {
    if (streaming && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [displayedContent, streaming]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animationConfig.duration }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: config.align,
        marginBottom: 'var(--space-4)',
      }}
    >
      {/* Message Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        <span style={{ fontWeight: 600 }}>{config.label}</span>
        <span>•</span>
        <span>{formatTime(timestamp)}</span>
        {provider && role === 'assistant' && (
          <Badge
            variant="info"
            style={{
              backgroundColor: `${providerConfig[provider].color}20`,
              color: providerConfig[provider].color,
              borderColor: providerConfig[provider].color,
              fontSize: 'var(--text-xs)',
              padding: 'var(--space-1) var(--space-2)',
            }}
          >
            {providerConfig[provider].emoji} {providerConfig[provider].label}
          </Badge>
        )}
        {streaming && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: 'var(--color-violet-400)' }}
          >
            ⚡
          </motion.span>
        )}
        {role === 'assistant' && !streaming && (
          <button
            onClick={handleSpeak}
            title={isSpeaking ? 'Arrêter' : 'Écouter'}
            aria-label={isSpeaking ? 'Arrêter la lecture' : 'Lire le message'}
            style={{
              background: isSpeaking
                ? 'var(--color-violet-700)'
                : 'var(--color-bg-elevated)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background-color 150ms ease',
              marginLeft: 'var(--space-2)',
            }}
          >
            {isSpeaking ? '⏹️' : '🔊'}
          </button>
        )}
      </div>

      {/* Message Bubble */}
      <div
        ref={contentRef}
        style={{
          maxWidth: role === 'system' ? '80%' : '70%',
          padding: 'var(--space-4)',
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          color: config.textColor,
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--leading-relaxed)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {displayedContent}
        {streaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1em',
              marginLeft: '2px',
              background: 'var(--color-violet-400)',
              verticalAlign: 'middle',
            }}
          />
        )}
      </div>

      {/* Metadata (collapsible) */}
      {metadata && role === 'assistant' && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 0,
            }}
          >
            <span>{isExpanded ? '▼' : '▶'}</span>
            <span>Métadonnées cognitives</span>
          </button>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {metadata.cognitiveState && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    État Cognitif:
                  </div>
                  <div
                    style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
                  >
                    <Badge variant="neutral" size="sm">
                      Stress: {(metadata.cognitiveState.stress * 100).toFixed(0)}%
                    </Badge>
                    <Badge variant="info" size="sm">
                      Clarté: {(metadata.cognitiveState.clarity * 100).toFixed(0)}%
                    </Badge>
                    <Badge variant="success" size="sm">
                      Focus: {(metadata.cognitiveState.focus * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              )}

              {metadata.memoryReferences && metadata.memoryReferences.length > 0 && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    Références Mémoire ({metadata.memoryReferences.length}):
                  </div>
                  <div
                    style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
                  >
                    {metadata.memoryReferences.map((ref, index) => (
                      <Badge
                        key={`${ref.id}-${index}`}
                        variant="primary"
                        size="sm"
                        style={{ opacity: ref.relevance }}
                      >
                        {ref.type} ({(ref.relevance * 100).toFixed(0)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {metadata.processingTime && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Temps de traitement:{' '}
                  </span>
                  <span style={{ color: 'var(--color-success-500)' }}>
                    {metadata.processingTime.toFixed(2)}ms
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};
