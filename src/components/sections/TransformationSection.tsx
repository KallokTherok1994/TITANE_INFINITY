/**
 * TITANE∞ v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * TransformationSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Evolution roadmap, evolution lines, milestones
 *
 * FUSION v30: Évolution Mémoire (ex-MemoryEvolutionSection) fusionnée ici à 100%.
 * Ce composant unifie Transformation + Évolution Mémoire en un seul onglet.
 */

import React, { memo, useEffect } from 'react';
import { moduleContextRegistry } from '@/services/modules/moduleContextRegistry';
import { Grid, Stack } from '@components/layout';
import { Card } from '@/ui';
import { TMetric, TBadge, TSectionHeader } from '@/design-system';
import { SectionLoadingFallback } from './SectionLoadingFallback';
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

    // Module context registry — publish evolution snapshot
    useEffect(() => {
      moduleContextRegistry.publish('titane.evolution', {
        moduleId: 'titane.evolution',
        route: '/titane?tab=transformation',
        title: 'Transformation & Évolution',
        status: mode === 'tauri' ? 'live' : 'partial',
        source: mode === 'tauri' ? 'tauri_ipc' : 'local_cache',
        capabilities: ['evolution-roadmap', 'transformation-phase', 'memory-evolution'],
        visibleMetrics: {
          evolutionScore: stats.evolutionScore,
          transformationPhase,
          totalMemories,
          memorySTM: stats.memoryShortTerm,
          memoryMTM: stats.memoryMidTerm,
          memoryLTM: stats.memoryLongTerm,
          level: stats.level,
          totalXP: stats.totalXP,
          mode,
        },
        actions: [
          { id: 'read_evolution_state', label: 'Lire l\'état d\'évolution', status: 'wired' },
          { id: 'read_transformation_phase', label: 'Phase de transformation', status: 'wired' },
        ],
        warnings: mode !== 'tauri' ? ['Running in browser mode — some evolution data may be limited'] : [],
      });
    }, [stats.evolutionScore, stats.level, stats.totalXP, totalMemories, mode, transformationPhase, stats.memoryShortTerm, stats.memoryMidTerm, stats.memoryLongTerm]);

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
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Roadmap Évolutive</h3>
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
          <h3 style={{ marginBottom: 'var(--space-4)' }}>
            Centre d&apos;Évolution Mémoire
          </h3>
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
              <p style={{ color: 'var(--titanium-text-tertiary, #8a8a8a)', fontSize: 'var(--text-sm)' }}>
                Disponible en mode Tauri uniquement
              </p>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>
                  Timeline d&apos;Évolution
                </h4>
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
        <Grid columns={2} gap={4} style={{ marginTop: 'var(--space-4)' }}>
          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Lignes d&apos;Évolution</h3>
            <Stack direction="vertical" gap={3}>
              <div>
                <TBadge variant="info">Cognitif</TBadge>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--titanium-text-tertiary, #8a8a8a)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  Capacités de raisonnement et apprentissage
                </p>
              </div>

              <div>
                <TBadge variant="success">Social</TBadge>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--titanium-text-tertiary, #8a8a8a)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  Interaction et communication
                </p>
              </div>

              <div>
                <TBadge variant="info">Technique</TBadge>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--titanium-text-tertiary, #8a8a8a)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  Architecture et optimisation
                </p>
              </div>
            </Stack>
          </Card>

          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Indicateurs Synchronisés</h3>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--titanium-text-tertiary, #8a8a8a)',
                marginBottom: 'var(--space-3)',
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
                color={'var(--titanium-accent-bright, #d1d5db)'}
              />
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--titanium-text-tertiary, #8a8a8a)',
                  marginTop: 'var(--space-2)',
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
