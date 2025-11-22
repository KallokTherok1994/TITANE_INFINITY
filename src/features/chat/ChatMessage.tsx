/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Chat Message
 * Message de chat avec support streaming et metadata cognitive
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui';
import { colors, spacing, radius, shadows, fontSizes, fontWeights, lineHeights } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  streaming?: boolean;
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
    bgColor: colors.rubis.primary[900],
    borderColor: colors.rubis.primary[700],
    textColor: colors.neutral[100],
    align: 'flex-end' as const,
    label: 'Vous',
  },
  assistant: {
    bgColor: colors.saphir.primary[900],
    borderColor: colors.saphir.primary[800],
    textColor: colors.neutral[100],
    align: 'flex-start' as const,
    label: 'TITANE∞',
  },
  system: {
    bgColor: colors.neutral[900],
    borderColor: colors.neutral[700],
    textColor: colors.neutral[300],
    align: 'center' as const,
    label: 'Système',
  },
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const ChatMessage = ({
  role,
  content,
  timestamp,
  streaming = false,
  metadata,
}: ChatMessageProps): JSX.Element => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const config = roleConfig[role];
  const contentRef = useRef<HTMLDivElement>(null);

  // Streaming animation
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

  // Auto-scroll during streaming
  useEffect(() => {
    if (streaming && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [displayedContent, streaming]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: config.align,
        marginBottom: spacing[4],
      }}
    >
      {/* Message Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          marginBottom: spacing[2],
          fontSize: fontSizes.sm,
          color: colors.neutral[400],
        }}
      >
        <span style={{ fontWeight: fontWeights.semibold }}>
          {config.label}
        </span>
        <span>•</span>
        <span>{formatTime(timestamp)}</span>
        {streaming && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: colors.saphir.primary[400] }}
          >
            ⚡
          </motion.span>
        )}
      </div>

      {/* Message Bubble */}
      <div
        ref={contentRef}
        style={{
          maxWidth: role === 'system' ? '80%' : '70%',
          padding: spacing[4],
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: radius.lg,
          boxShadow: shadows.md,
          color: config.textColor,
          fontSize: fontSizes.base,
          lineHeight: lineHeights.relaxed,
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
              background: colors.saphir.primary[400],
              verticalAlign: 'middle',
            }}
          />
        )}
      </div>

      {/* Metadata (collapsible) */}
      {metadata && role === 'assistant' && (
        <div style={{ marginTop: spacing[2] }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.neutral[500],
              fontSize: fontSizes.xs,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
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
                marginTop: spacing[2],
                padding: spacing[3],
                background: colors.neutral[950],
                border: `1px solid ${colors.neutral[800]}`,
                borderRadius: radius.md,
                fontSize: fontSizes.sm,
              }}
            >
              {/* Cognitive State */}
              {metadata.cognitiveState && (
                <div style={{ marginBottom: spacing[3] }}>
                  <div
                    style={{
                      fontWeight: fontWeights.semibold,
                      color: colors.neutral[300],
                      marginBottom: spacing[2],
                    }}
                  >
                    État Cognitif:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: spacing[2],
                      flexWrap: 'wrap',
                    }}
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

              {/* Memory References */}
              {metadata.memoryReferences && metadata.memoryReferences.length > 0 && (
                <div style={{ marginBottom: spacing[3] }}>
                  <div
                    style={{
                      fontWeight: fontWeights.semibold,
                      color: colors.neutral[300],
                      marginBottom: spacing[2],
                    }}
                  >
                    Références Mémoire ({metadata.memoryReferences.length}):
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: spacing[2],
                      flexWrap: 'wrap',
                    }}
                  >
                    {metadata.memoryReferences.map((ref, index) => (
                      <Badge
                        key={`${ref.id}-${index}`}
                        variant="primary"
                        size="sm"
                        style={{
                          opacity: ref.relevance,
                        }}
                      >
                        {ref.type} ({(ref.relevance * 100).toFixed(0)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Processing Time */}
              {metadata.processingTime && (
                <div>
                  <span style={{ color: colors.neutral[400] }}>
                    Temps de traitement:{' '}
                  </span>
                  <span style={{ color: colors.emeraude.primary[400] }}>
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
