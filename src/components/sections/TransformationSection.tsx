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
import { colors, spacing, fontSizes } from '@themes/tokens';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TransformationSectionProps = Record<string, never>;

// Lazy-load heavy components
const LazyTransformationRoadmap = React.lazy(() =>
  import('@/features/transformation/TransformationRoadmap').then(m => ({
    default: m.TransformationRoadmap,
  }))
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TransformationSection: React.FC<TransformationSectionProps> = memo(() => {
  return (
    <div className="titane-section titane-section-transformation">
      <TSectionHeader
        title="🌱 Transformation"
        subtitle="Lignes d'évolution et paliers franchis"
      />

      <Card>
        <h3 style={{ marginBottom: spacing[4] }}>Roadmap Évolutif</h3>
        <React.Suspense fallback={null}>
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
          <h3 style={{ marginBottom: spacing[4] }}>Paliers Franchis</h3>
          <Stack direction="vertical" gap={3}>
            <TMetric label="v25.0" value="Fusion EVO" color="success" />
            <TMetric label="v25.1" value="Fusion TIME" color="success" />
            <TMetric label="v25.2" value="Fusion STATS + ADMIN" color="success" />
            <TMetric
              label="v25.3"
              value="Fusion TITANE"
              color={colors.saphir.primary[500]}
            />
          </Stack>
        </Card>
      </Grid>
    </div>
  );
});

TransformationSection.displayName = 'TransformationSection';
