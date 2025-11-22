/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Memory Core Timeline
 * Timeline des entrées mémoire avec recherche sémantique
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Input, Badge } from '../../ui';
import { Stack } from '../../components/layout';
import { colors, spacing } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: Date;
  type: 'conversation' | 'fact' | 'skill' | 'experience';
  importance: number;
  tags: string[];
  similarity?: number;
}

export interface MemoryTimelineProps {
  entries: MemoryEntry[];
  onSearch?: (query: string) => void;
  onEntryClick?: (entry: MemoryEntry) => void;
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const typeColors: Record<MemoryEntry['type'], string> = {
  conversation: colors.rubis.primary[500],
  fact: colors.saphir.primary[500],
  skill: colors.emeraude.primary[500],
  experience: colors.diamant.primary[400],
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `Il y a ${minutes}min`;
  }
  if (hours < 24) {
    return `Il y a ${hours}h`;
  }
  return `Il y a ${days}j`;
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const MemoryTimeline = ({
  entries,
  onSearch,
  onEntryClick,
}: MemoryTimelineProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string): void => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <Card variant="glass" elevation="lg" padding={6}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3
          style={{
            margin: `0 0 ${spacing[4]} 0`,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colors.neutral[100],
          }}
        >
          💾 Memory Core - Timeline
        </h3>

        {/* Search */}
        <Input
          placeholder="Recherche sémantique..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          size="md"
          style={{ marginBottom: spacing[6] }}
        />

        {/* Timeline */}
        <Stack direction="vertical" gap={3}>
          <AnimatePresence mode="popLayout">
            {entries.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'relative',
                  paddingLeft: spacing[6],
                  borderLeft: `2px solid ${typeColors[entry.type]}`,
                  cursor: onEntryClick ? 'pointer' : 'default',
                }}
                onClick={() => onEntryClick?.(entry)}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-6px',
                    top: '8px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: typeColors[entry.type],
                    border: `2px solid ${colors.neutral[950]}`,
                  }}
                />

                {/* Entry card */}
                <div
                  style={{
                    padding: spacing[4],
                    background: colors.neutral[900],
                    borderRadius: '8px',
                    border: `1px solid ${colors.neutral[800]}`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = colors.rubis.surface.translucent;
                    e.currentTarget.style.borderColor = colors.rubis.primary[800];
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = colors.neutral[900];
                    e.currentTarget.style.borderColor = colors.neutral[800];
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing[2],
                    }}
                  >
                    <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
                      <Badge
                        variant="neutral"
                        size="sm"
                        style={{
                          background: `${typeColors[entry.type]}33`,
                          color: typeColors[entry.type],
                        }}
                      >
                        {entry.type}
                      </Badge>
                      {entry.similarity !== undefined && (
                        <Badge variant="info" size="sm">
                          {Math.round(entry.similarity * 100)}% match
                        </Badge>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: colors.neutral[500],
                      }}
                    >
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>

                  {/* Content */}
                  <p
                    style={{
                      margin: `0 0 ${spacing[2]} 0`,
                      fontSize: '0.875rem',
                      color: colors.neutral[200],
                      lineHeight: 1.5,
                    }}
                  >
                    {entry.content}
                  </p>

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: `${spacing[1]} ${spacing[2]}`,
                            fontSize: '0.75rem',
                            color: colors.neutral[400],
                            background: colors.neutral[800],
                            borderRadius: '4px',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Importance indicator */}
                  <div
                    style={{
                      marginTop: spacing[2],
                      height: '3px',
                      background: colors.neutral[800],
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${entry.importance * 100}%`,
                        height: '100%',
                        background: typeColors[entry.type],
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>

        {entries.length === 0 && (
          <div
            style={{
              padding: spacing[8],
              textAlign: 'center',
              color: colors.neutral[500],
            }}
          >
            Aucune entrée mémoire
          </div>
        )}
      </motion.div>
    </Card>
  );
};
