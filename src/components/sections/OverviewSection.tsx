/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * OverviewSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Dashboard stats, real-time charts, persona mood
 */

import React, { memo } from 'react';
import { Grid } from '@components/layout';
import { Card } from '@/ui';
import { QuickStatCard } from '@/features/dashboard';
import { PersonaMoodIndicator } from '@components/PersonaMoodIndicator';
import { TMetric, TSectionHeader } from '@/design-system';
import { spacing } from '@themes/tokens';

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

interface OverviewSectionProps {
  stats: TitaneStats;
}

// Lazy-load heavy components
const LazyRealTimeCharts = React.lazy(() =>
  import('@/features/dashboard/RealTimeCharts').then(m => ({
    default: m.RealTimeCharts,
  }))
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const OverviewSection: React.FC<OverviewSectionProps> = memo(({ stats }) => {
  return (
    <div className="titane-section titane-section-overview">
      <TSectionHeader
        title="📊 Vue d'Ensemble"
        subtitle="Dashboard système et métriques principales"
      />

      {/* Quick Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6],
        }}
      >
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>⚡</span>}
          label="Niveau"
          value={stats.level}
          trend="up"
          trendValue="+2 cette semaine"
          color="#3b82f6"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>✨</span>}
          label="XP Total"
          value={stats.totalXP.toLocaleString()}
          trend="up"
          trendValue="+15k aujourd'hui"
          color="#10b981"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>💬</span>}
          label="Messages"
          value="1,247"
          trend="neutral"
          trendValue="128/h"
          color="#f59e0b"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>🎯</span>}
          label="Score Évolution"
          value={`${stats.evolutionScore}%`}
          trend="up"
          trendValue="+5%"
          color="#8b5cf6"
        />
      </div>

      {/* Real-Time Charts */}
      <React.Suspense fallback={null}>
        <LazyRealTimeCharts />
      </React.Suspense>

      {/* Memory System Stats */}
      <div style={{ marginTop: spacing[6] }}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Mémoire Système</h3>
          <Grid columns={3} gap={4}>
            <TMetric label="Court Terme" value={stats.memoryShortTerm.toString()} />
            <TMetric label="Moyen Terme" value={stats.memoryMidTerm.toString()} />
            <TMetric label="Long Terme" value={stats.memoryLongTerm.toString()} />
          </Grid>
        </Card>
      </div>

      {/* Persona Mood */}
      <div style={{ marginTop: spacing[6] }}>
        <PersonaMoodIndicator />
      </div>
    </div>
  );
});

OverviewSection.displayName = 'OverviewSection';
