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
import { ACHIEVEMENTS } from '@/features/progression/achievements';
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
  ({ progression: _progression, stats }) => {
    // Current stats for achievement progress
    const currentStats = useMemo(
      () => ({
        level: stats.level,
        totalXP: stats.totalXP,
        messageCount: 1247,
        modesUsed: 4,
      }),
      [stats]
    );

    // Filter achievements by category
    const categories = useMemo(
      () => ({
        conversation: ACHIEVEMENTS.filter(a => a.category === 'conversation'),
        progression: ACHIEVEMENTS.filter(a => a.category === 'progression'),
        exploration: ACHIEVEMENTS.filter(a => a.category === 'exploration'),
        mastery: ACHIEVEMENTS.filter(a => a.category === 'mastery'),
      }),
      []
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
              <TBadge variant="success">Architecte</TBadge>
              <TBadge variant="info">Optimiseur</TBadge>
              <TBadge variant="info">Évolutionniste</TBadge>
              <TBadge variant="success">Pédagogue</TBadge>
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
