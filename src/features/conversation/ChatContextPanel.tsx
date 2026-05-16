/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Chat Context Panel
 * Panneau latéral affichant le contexte cognitif pendant le chat
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { Card, Badge } from '../../ui';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface CognitiveContext {
  stress: number;
  clarity: number;
  focus: number;
  energy: number;
  emotionalTone: string;
}

export interface ActiveMemory {
  id: string;
  type: 'fact' | 'conversation' | 'skill' | 'experience';
  content: string;
  relevance: number;
  timestamp: Date;
}

export interface ChatContextPanelProps {
  cognitiveState: CognitiveContext;
  activeMemories: ActiveMemory[];
  suggestions?: string[];
  isCollapsed?: boolean;
  onToggle?: () => void;
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const memoryTypeColors: Record<ActiveMemory['type'], string> = {
  fact: 'var(--color-success-500)',
  conversation: 'var(--color-info-500)',
  skill: 'var(--color-text-secondary)',
  experience: 'var(--color-text-muted)',
};

const getMetricColor = (value: number): string => {
  if (value >= 0.7) {
    return 'var(--color-success-500)';
  }
  if (value >= 0.4) {
    return 'var(--color-warning-500)';
  }
  return 'var(--color-error-500)';
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const ChatContextPanel = ({
  cognitiveState,
  activeMemories,
  suggestions = [],
  isCollapsed = false,
  onToggle,
}: ChatContextPanelProps): JSX.Element => {
  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '60px' }}
        style={{
          height: '100%',
          background: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--space-2)',
        }}
      >
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: 'var(--space-2)',
          }}
        >
          ◀
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: '320px' }}
      style={{
        height: '100%',
        background: 'var(--color-bg-secondary)',
        borderLeft: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
          }}
        >
          🧠 Contexte
        </h3>
        {onToggle && (
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: 'var(--space-1)',
            }}
          >
            ▶
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 'var(--space-4)', overflowY: 'auto' }}>
        {/* Cognitive State */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h4
            style={{
              margin: 0,
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            État Cognitif
          </h4>
          <Card variant="translucent" padding={3}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
            >
              {/* Stress */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>Stress</span>
                  <span style={{ color: getMetricColor(1 - cognitiveState.stress) }}>
                    {(cognitiveState.stress * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${cognitiveState.stress * 100}%`,
                      height: '100%',
                      background: getMetricColor(1 - cognitiveState.stress),
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>

              {/* Clarity */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>Clarté</span>
                  <span style={{ color: getMetricColor(cognitiveState.clarity) }}>
                    {(cognitiveState.clarity * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${cognitiveState.clarity * 100}%`,
                      height: '100%',
                      background: getMetricColor(cognitiveState.clarity),
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>

              {/* Focus */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>Focus</span>
                  <span style={{ color: getMetricColor(cognitiveState.focus) }}>
                    {(cognitiveState.focus * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${cognitiveState.focus * 100}%`,
                      height: '100%',
                      background: getMetricColor(cognitiveState.focus),
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>

              {/* Energy */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>Énergie</span>
                  <span style={{ color: getMetricColor(cognitiveState.energy) }}>
                    {(cognitiveState.energy * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${cognitiveState.energy * 100}%`,
                      height: '100%',
                      background: getMetricColor(cognitiveState.energy),
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>

              {/* Emotional Tone */}
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Ton émotionnel
                  </span>
                  <Badge variant="primary" size="sm">
                    {cognitiveState.emotionalTone}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Active Memories */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h4
            style={{
              margin: 0,
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Mémoires Actives ({activeMemories.length})
          </h4>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          >
            {activeMemories.length === 0 ? (
              <Card variant="translucent" padding={3}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                  }}
                >
                  Aucune mémoire active
                </p>
              </Card>
            ) : (
              activeMemories.map(memory => (
                <Card key={memory.id} variant="translucent" padding={3}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <Badge
                      variant="primary"
                      size="sm"
                      style={{
                        background: `${memoryTypeColors[memory.type]}33`,
                        color: memoryTypeColors[memory.type],
                      }}
                    >
                      {memory.type}
                    </Badge>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {(memory.relevance * 100).toFixed(0)}% pertinent
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.4,
                    }}
                  >
                    {memory.content.length > 80
                      ? `${memory.content.slice(0, 80)}...`
                      : memory.content}
                  </p>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <section>
            <h4
              style={{
                margin: 0,
                marginBottom: 'var(--space-3)',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Suggestions
            </h4>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
            >
              {suggestions.map((suggestion, index) => (
                <Card key={index} variant="translucent" padding={3}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {suggestion}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};
