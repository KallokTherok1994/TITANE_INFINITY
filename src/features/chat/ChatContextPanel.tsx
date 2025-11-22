/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Chat Context Panel
 * Panneau latéral affichant le contexte cognitif pendant le chat
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { Card, Badge } from '../../ui';
import { colors, spacing, radius, fontSizes, fontWeights } from '@themes/tokens';

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
  fact: colors.emeraude.primary[500],
  conversation: colors.saphir.primary[500],
  skill: colors.rubis.primary[500],
  experience: colors.diamant.primary[400],
};

const getMetricColor = (value: number): string => {
  if (value >= 0.7) {
    return colors.semantic.success as string;
  }
  if (value >= 0.4) {
    return colors.semantic.warning as string;
  }
  return colors.semantic.error as string;
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
          background: colors.rubis.surface.solid,
          borderLeft: `1px solid ${colors.rubis.primary[800]}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: spacing[2],
        }}
      >
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: colors.neutral[400],
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: spacing[2],
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
        background: colors.rubis.surface.solid,
        borderLeft: `1px solid ${colors.rubis.primary[800]}`,
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
          padding: spacing[4],
          borderBottom: `1px solid ${colors.rubis.primary[800]}`,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.semibold,
            color: colors.neutral[100],
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
              color: colors.neutral[400],
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: spacing[1],
            }}
          >
            ▶
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: spacing[4], overflowY: 'auto' }}>
        {/* Cognitive State */}
        <section style={{ marginBottom: spacing[6] }}>
          <h4
            style={{
              margin: 0,
              marginBottom: spacing[3],
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.semibold,
              color: colors.neutral[300],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            État Cognitif
          </h4>
          <Card variant="translucent" padding={3}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {/* Stress */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: spacing[1],
                    fontSize: fontSizes.xs,
                  }}
                >
                  <span style={{ color: colors.neutral[400] }}>Stress</span>
                  <span style={{ color: getMetricColor(1 - cognitiveState.stress) }}>
                    {(cognitiveState.stress * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: colors.neutral[900],
                    borderRadius: radius.full,
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
                    marginBottom: spacing[1],
                    fontSize: fontSizes.xs,
                  }}
                >
                  <span style={{ color: colors.neutral[400] }}>Clarté</span>
                  <span style={{ color: getMetricColor(cognitiveState.clarity) }}>
                    {(cognitiveState.clarity * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: colors.neutral[900],
                    borderRadius: radius.full,
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
                    marginBottom: spacing[1],
                    fontSize: fontSizes.xs,
                  }}
                >
                  <span style={{ color: colors.neutral[400] }}>Focus</span>
                  <span style={{ color: getMetricColor(cognitiveState.focus) }}>
                    {(cognitiveState.focus * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: colors.neutral[900],
                    borderRadius: radius.full,
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
                    marginBottom: spacing[1],
                    fontSize: fontSizes.xs,
                  }}
                >
                  <span style={{ color: colors.neutral[400] }}>Énergie</span>
                  <span style={{ color: getMetricColor(cognitiveState.energy) }}>
                    {(cognitiveState.energy * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: colors.neutral[900],
                    borderRadius: radius.full,
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
                  marginTop: spacing[2],
                  paddingTop: spacing[3],
                  borderTop: `1px solid ${colors.neutral[800]}`,
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
                      fontSize: fontSizes.xs,
                      color: colors.neutral[400],
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
        <section style={{ marginBottom: spacing[6] }}>
          <h4
            style={{
              margin: 0,
              marginBottom: spacing[3],
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.semibold,
              color: colors.neutral[300],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Mémoires Actives ({activeMemories.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {activeMemories.length === 0 ? (
              <Card variant="translucent" padding={3}>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    color: colors.neutral[500],
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
                      gap: spacing[2],
                      marginBottom: spacing[2],
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
                        fontSize: fontSizes.xs,
                        color: colors.neutral[500],
                      }}
                    >
                      {(memory.relevance * 100).toFixed(0)}% pertinent
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: fontSizes.sm,
                      color: colors.neutral[300],
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
                marginBottom: spacing[3],
                fontSize: fontSizes.sm,
                fontWeight: fontWeights.semibold,
                color: colors.neutral[300],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Suggestions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {suggestions.map((suggestion, index) => (
                <Card key={index} variant="translucent" padding={3}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: fontSizes.sm,
                      color: colors.neutral[200],
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
