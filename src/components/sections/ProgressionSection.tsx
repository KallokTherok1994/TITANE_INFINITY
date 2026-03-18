/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ProgressionSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: XP progression, achievements, talents, milestones
 */

import React, { useMemo, memo } from 'react';
import { Grid, Stack } from '@components/layout';
import { Card } from '@/ui';
import { XPProgressBar } from '@features/progression';
import { AchievementCard } from '@/features/progression/AchievementCard';
import { ACHIEVEMENTS, resolveAchievements, resolveTalents } from '@/features/progression/achievements';
import { TMetric, TBadge, TSectionHeader } from '@/design-system';
import { spacing, fontSizes } from '@themes/tokens';
import type { ProgressionState } from '@/cognitive/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TitaneStats {
  totalXP: number;
  level: number;
  memoryShortTerm: number;
  memoryMidTerm: number;
  memoryLongTerm: number;
  evolutionScore: number;
}

interface ProgressionSectionProps {
  progression: ProgressionState | null;
  stats: TitaneStats;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ProgressionSection: React.FC<ProgressionSectionProps> = memo(
  ({ progression, stats }) => {
    // Real chatMessageCount from xpEngine state (canonical source — incremented per chat_message XP event)
    const chatMessageCount = progression?.chatMessageCount ?? 0;

    // Current stats for achievement progress — chatMessageCount now from real xpEngine
    const currentStats = useMemo(
      () => ({
        level: stats.level,
        totalXP: stats.totalXP,
        messageCount: chatMessageCount,
        modesUsed: 0, // [DISPLAY_ONLY] pas de compteur de modes connecté
        chatMessageCount,
      }),
      [stats, chatMessageCount]
    );

    // Resolve achievements from real stats (level/XP/messages computed from xpEngine)
    const resolvedAchievements = useMemo(
      () => resolveAchievements(ACHIEVEMENTS, { level: stats.level, totalXP: stats.totalXP, chatMessageCount }),
      [stats.level, stats.totalXP, chatMessageCount]
    );

    // Resolve talents from real level threshold
    const talents = useMemo(() => resolveTalents(stats.level), [stats.level]);

    // Filter achievements by category
    const categories = useMemo(
      () => ({
        conversation: resolvedAchievements.filter(a => a.category === 'conversation'),
        progression: resolvedAchievements.filter(a => a.category === 'progression'),
        exploration: resolvedAchievements.filter(a => a.category === 'exploration'),
        mastery: resolvedAchievements.filter(a => a.category === 'mastery'),
      }),
      [resolvedAchievements]
    );

    return (
      <div className="titane-section titane-section-progression">
        <TSectionHeader
          title="⚡ Progression & XP"
          subtitle="Système XP, milestones, talents et achievements"
        />

        {/* XP Progress Bar */}
        <div style={{ marginBottom: spacing[6] }}>
          <XPProgressBar
            currentXP={stats.totalXP}
            level={stats.level}
            requiredXP={(stats.level + 1) * 10000}
          />
        </div>

        {/* Milestones & Talents */}
        <Grid columns={2} gap={4} style={{ marginBottom: spacing[6] }}>
          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>Milestones</h3>
            <Stack direction="vertical" gap={3}>
              <TMetric
                label="Niveau Atteint"
                value={stats.level.toString()}
                color="primary"
              />
              <TMetric
                label="Total XP"
                value={stats.totalXP.toLocaleString()}
                color="success"
              />
              <TMetric
                label="Prochain Niveau"
                value={`${((stats.totalXP % 10000) / 10000) * 100}%`}
              />
            </Stack>
          </Card>

          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>Talents Débloqués</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
              {talents.map(t => (
                <TBadge
                  key={t.label}
                  variant={t.unlocked ? t.variant : 'default'}
                  title={t.unlocked ? `Débloqué (niveau ≥ ${t.requiredLevel})` : `Verrouillé — niveau ${t.requiredLevel} requis`}
                >
                  {t.unlocked ? t.label : `🔒 ${t.label}`}
                </TBadge>
              ))}
            </div>
          </Card>
        </Grid>

        {/* Achievements Grid */}
        <div style={{ marginBottom: spacing[6] }}>
          <h3 style={{ marginBottom: spacing[4] }}>🏆 Achievements</h3>

          {/* Mastery (Legendary) */}
          <div style={{ marginBottom: spacing[6] }}>
            <h4
              style={{
                fontSize: fontSizes.sm,
                marginBottom: spacing[3],
              }}
            >
              👑 Maîtrise
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: spacing[4],
              }}
            >
              {categories.mastery.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  currentStats={currentStats}
                />
              ))}
            </div>
          </div>

          {/* Progression */}
          <div style={{ marginBottom: spacing[6] }}>
            <h4
              style={{
                fontSize: fontSizes.sm,
                marginBottom: spacing[3],
              }}
            >
              ⚡ Progression
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: spacing[4],
              }}
            >
              {categories.progression.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  currentStats={currentStats}
                />
              ))}
            </div>
          </div>

          {/* Conversation */}
          <div style={{ marginBottom: spacing[6] }}>
            <h4
              style={{
                fontSize: fontSizes.sm,
                marginBottom: spacing[3],
              }}
            >
              💬 Communication
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: spacing[4],
              }}
            >
              {categories.conversation.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  currentStats={currentStats}
                />
              ))}
            </div>
          </div>

          {/* Exploration */}
          <div>
            <h4
              style={{
                fontSize: fontSizes.sm,
                marginBottom: spacing[3],
              }}
            >
              🧭 Exploration
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: spacing[4],
              }}
            >
              {categories.exploration.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  currentStats={currentStats}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProgressionSection.displayName = 'ProgressionSection';
