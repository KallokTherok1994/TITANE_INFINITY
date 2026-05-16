/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Memory Core Timeline
 * Timeline des entrées mémoire avec recherche sémantique
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Input, Badge } from '../../ui';
import { Stack } from '../../components/layout';
import { useAnimation } from '../../contexts/AnimationContext';

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
  conversation: 'var(--color-text-secondary)',
  fact: 'var(--color-info-500)',
  skill: 'var(--color-success-500)',
  experience: 'var(--color-text-muted)',
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
  const { animationConfig: _animationConfig, shouldReduceMotion: _shouldReduceMotion } =
    useAnimation();
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
            margin: '0 0 var(--space-4) 0',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
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
          style={{ marginBottom: 'var(--space-6)' }}
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
                  paddingLeft: 'var(--space-6)',
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
                    border: '2px solid var(--color-bg-primary)',
                  }}
                />

                {/* Entry card */}
                <div
                  style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-bg-primary)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-subtle)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(148,163,184,0.08)';
                    e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--color-bg-primary)';
                    e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--space-2)',
                        alignItems: 'center',
                      }}
                    >
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
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>

                  {/* Content */}
                  <p
                    style={{
                      margin: '0 0 var(--space-2) 0',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {entry.content}
                  </p>

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div
                      style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
                    >
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            background: 'var(--color-border-subtle)',
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
                      marginTop: 'var(--space-2)',
                      height: '3px',
                      background: 'var(--color-border-subtle)',
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
              padding: 'var(--space-8)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            Aucune entrée mémoire
          </div>
        )}
      </motion.div>
    </Card>
  );
};
