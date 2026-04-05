/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * TransformationSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Evolution roadmap, evolution lines, milestones
 */

import React, { memo } from 'react';
import { Grid, Stack } from '@components/layout';
import { Card } from '@/ui';
import { TMetric, TBadge, TSectionHeader } from '@/design-system';
import { SectionLoadingFallback } from './SectionLoadingFallback';
import { colors, spacing, fontSizes } from '@themes/tokens';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TransformationSectionProps {
  stats: {
    totalXP: number;
    level: number;
    chatMessageCount: number;
    memoryShortTerm: number;
    memoryMidTerm: number;
    memoryLongTerm: number;
    evolutionScore: number;
  };
}

// Lazy-load heavy components
const LazyTransformationRoadmap = React.lazy(() =>
  import('@/features/transformation/TransformationRoadmap').then(m => ({
    default: m.TransformationRoadmap,
  }))
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TransformationSection: React.FC<TransformationSectionProps> = memo(
  ({ stats }) => {
    const transformationPhase =
      stats.evolutionScore >= 80
        ? 'Symbiose avancée'
        : stats.evolutionScore >= 50
          ? 'Consolidation active'
          : stats.evolutionScore >= 20
            ? 'Croissance structurée'
            : 'Initialisation guidée';

    const totalMemories =
      stats.memoryShortTerm + stats.memoryMidTerm + stats.memoryLongTerm;

    return (
      <div className="titane-section titane-section-transformation">
        <TSectionHeader
          title="🌱 Transformation"
          subtitle="Lignes d'évolution et paliers franchis"
        />

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Roadmap Évolutif</h3>
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Roadmap évolutif"
                note="Chargement des paliers de transformation…"
                testId="loading-transformation-roadmap"
              />
            }
          >
            <LazyTransformationRoadmap />
          </React.Suspense>
        </Card>

        <Grid columns={2} gap={4} style={{ marginTop: spacing[4] }}>
          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>Lignes d&apos;Évolution</h3>
            <Stack direction="vertical" gap={3}>
              <div>
                <TBadge variant="info">Cognitif</TBadge>
                <p
                  style={{
                    fontSize: fontSizes.sm,
                    color: colors.neutral[400],
                    marginTop: spacing[2],
                  }}
                >
                  Capacités de raisonnement et apprentissage
                </p>
              </div>

              <div>
                <TBadge variant="success">Social</TBadge>
                <p
                  style={{
                    fontSize: fontSizes.sm,
                    color: colors.neutral[400],
                    marginTop: spacing[2],
                  }}
                >
                  Interaction et communication
                </p>
              </div>

              <div>
                <TBadge variant="info">Technique</TBadge>
                <p
                  style={{
                    fontSize: fontSizes.sm,
                    color: colors.neutral[400],
                    marginTop: spacing[2],
                  }}
                >
                  Architecture et optimisation
                </p>
              </div>
            </Stack>
          </Card>

          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>Indicateurs Synchronisés</h3>
            <p
              style={{
                fontSize: fontSizes.sm,
                color: colors.neutral[500],
                marginBottom: spacing[3],
              }}
            >
              Calculés depuis l&apos;état réel TITANE — XP, mémoire et activité
              conversationnelle.
            </p>
            <Stack direction="vertical" gap={3}>
              <TMetric label="Phase active" value={transformationPhase} color="success" />
              <TMetric
                label="Niveau actuel"
                value={stats.level.toString()}
                color="success"
              />
              <TMetric
                label="Score évolution"
                value={`${stats.evolutionScore}%`}
                color="info"
              />
              <TMetric
                label="Mémoire consolidée"
                value={totalMemories.toString()}
                color="info"
              />
              <TMetric
                label="Messages synchronisés"
                value={stats.chatMessageCount.toString()}
                color={colors.saphir.primary[500]}
              />
              <p
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                  marginTop: spacing[2],
                }}
              >
                La transformation progresse selon le niveau, les souvenirs consolidés et
                le volume conversationnel réellement observé.
              </p>
            </Stack>
          </Card>
        </Grid>
      </div>
    );
  }
);

TransformationSection.displayName = 'TransformationSection';
