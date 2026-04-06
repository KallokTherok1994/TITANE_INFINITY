/**
 * TITANE∞ v30.0.0 — Proprietary License
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
import { SectionLoadingFallback } from './SectionLoadingFallback';
import { PersonaMoodIndicator } from '@components/PersonaMoodIndicator';
import { TMetric, TSectionHeader } from '@/design-system';
import { spacing } from '@themes/tokens';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TitaneStats {
  totalXP: number;
  level: number;
  chatMessageCount: number;
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
          trend={stats.level > 1 ? 'up' : 'neutral'}
          trendValue={
            stats.level > 1 ? `Niveau ${stats.level} synchronisé` : 'Initialisation'
          }
          color="#3b82f6"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>✨</span>}
          label="XP Total"
          value={stats.totalXP.toLocaleString()}
          trend={stats.totalXP > 0 ? 'up' : 'neutral'}
          trendValue={
            stats.totalXP > 0
              ? `${stats.totalXP.toLocaleString()} XP enregistrés`
              : 'Aucun XP synchronisé'
          }
          color="#10b981"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>💬</span>}
          label="Messages"
          value={stats.chatMessageCount.toLocaleString()}
          trend={stats.chatMessageCount > 0 ? 'up' : 'neutral'}
          trendValue={
            stats.chatMessageCount > 0
              ? 'Historique conversationnel synchronisé'
              : 'Aucune conversation enregistrée'
          }
          color="#f59e0b"
        />
        <QuickStatCard
          icon={<span style={{ fontSize: '1.5rem' }}>🎯</span>}
          label="Score Évolution"
          value={`${stats.evolutionScore}%`}
          trend={stats.evolutionScore > 0 ? 'up' : 'neutral'}
          trendValue={
            stats.evolutionScore > 0
              ? 'Calculé depuis XP et mémoire'
              : 'En attente de progression'
          }
          color="#8b5cf6"
        />
      </div>

      {/* Real-Time Charts */}
      <React.Suspense
        fallback={
          <SectionLoadingFallback
            label="Graphiques temps réel"
            note="Chargement du dashboard en temps réel…"
            testId="loading-overview-charts"
          />
        }
      >
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
