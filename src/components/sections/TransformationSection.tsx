/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * TransformationSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Evolution roadmap, evolution lines, milestones
 *
 * FUSION v30: Évolution Mémoire (ex-MemoryEvolutionSection) fusionnée ici à 100%.
 * Ce composant unifie Transformation + Évolution Mémoire en un seul onglet.
 */

import React, { memo } from 'react';
import { Grid, Stack } from '@components/layout';
import { Card } from '@/ui';
import { TMetric, TBadge, TSectionHeader } from '@/design-system';
import { SectionLoadingFallback } from './SectionLoadingFallback';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { detectEnvironment } from '@/core/tauri/environment';
import { createLogger } from '@/utils/logger';

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
const sectionLogger = createLogger('TransformationSection');

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function lazyWithRetry<TModule extends Record<string, unknown>>(
  importer: () => Promise<TModule>,
  selector: (module: TModule) => React.ComponentType<any>,
  label: string,
  retries: number = 2
) {
  return React.lazy(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const module = await importer();
        return { default: selector(module) };
      } catch (error) {
        lastError = error;
        sectionLogger.debug('Lazy import retry', {
          label,
          attempt: attempt + 1,
          retries: retries + 1,
          error: error instanceof Error ? error.message : String(error),
        });
        if (attempt < retries) {
          await delay(300 * (attempt + 1));
        }
      }
    }

    throw lastError;
  });
}

const LazyTransformationRoadmap = lazyWithRetry(
  () => import('@/features/transformation/TransformationRoadmap'),
  m => m.TransformationRoadmap,
  'TransformationRoadmap'
);

const LazyMemoryEvolutionCenter = lazyWithRetry(
  () => import('@/components/MemoryEvolution/MemoryEvolutionCenter'),
  m => m.default,
  'MemoryEvolutionCenter'
);

const LazyEvolutionTimeline = lazyWithRetry(
  () => import('@/features/evolution/EvolutionTimeline'),
  m => m.EvolutionTimeline,
  'EvolutionTimeline'
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TransformationSection: React.FC<TransformationSectionProps> = memo(
  ({ stats }) => {
    const env = detectEnvironment();
    const mode = env.isTauri ? 'tauri' : 'browser';

    const transformationPhase =
      stats.evolutionScore >= 80
        ? 'Fusion TWINS avancée'
        : stats.evolutionScore >= 50
          ? 'Consolidation active'
          : stats.evolutionScore >= 20
            ? 'Croissance structurée'
            : 'Initialisation guidée';

    const totalMemories =
      stats.memoryShortTerm + stats.memoryMidTerm + stats.memoryLongTerm;

    return (
      <div
        className="titane-section titane-section-transformation"
        data-testid="transformation-section-root"
        data-memory-evolution-mode={mode}
      >
        <TSectionHeader
          title="🌱 Transform & Évolution"
          subtitle="Transformation cognitive + Évolution mémoire — fusionnées"
        />

        {/* ═══ TRANSFORMATION: Roadmap ═══ */}
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Roadmap Évolutive</h3>
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Roadmap évolutive"
                note="Chargement des paliers de transformation…"
                testId="loading-transformation-roadmap"
              />
            }
          >
            <LazyTransformationRoadmap />
          </React.Suspense>
        </Card>

        {/* ═══ ÉVOLUTION MÉMOIRE (fusionnée depuis MemoryEvolutionSection) ═══ */}
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Centre d&apos;Évolution Mémoire</h3>
          {env.isTauri ? (
            <React.Suspense
              fallback={
                <SectionLoadingFallback
                  label="Évolution mémoire"
                  note="Chargement du centre d'évolution…"
                  testId="loading-memory-evolution-center"
                />
              }
            >
              <LazyMemoryEvolutionCenter />
            </React.Suspense>
          ) : (
            <div>
              <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
                Disponible en mode Tauri uniquement
              </p>
              <div style={{ marginTop: spacing[4] }}>
                <h4 style={{ marginBottom: spacing[3] }}>Timeline d&apos;Évolution</h4>
                <React.Suspense
                  fallback={
                    <SectionLoadingFallback
                      label="Timeline d'évolution"
                      note="Chargement de la timeline…"
                      testId="loading-evolution-timeline"
                    />
                  }
                >
                  <LazyEvolutionTimeline />
                </React.Suspense>
              </div>
            </div>
          )}
        </Card>

        {/* ═══ TRANSFORMATION: Lignes d'Évolution + Indicateurs ═══ */}
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
