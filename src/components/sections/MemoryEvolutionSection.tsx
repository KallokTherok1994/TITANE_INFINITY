/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MemoryEvolutionSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Memory evolution center, evolution timeline
 */

import React, { memo } from 'react';
import { Card } from '@/ui';
import { TSectionHeader } from '@/design-system';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { detectEnvironment } from '@/core/tauri/environment';
import { SectionLoadingFallback } from './SectionLoadingFallback';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type MemoryEvolutionSectionProps = Record<string, never>;

// Lazy-load heavy components
const LazyMemoryEvolutionCenter = React.lazy(
  () => import('@/components/MemoryEvolution/MemoryEvolutionCenter')
);

const LazyEvolutionTimeline = React.lazy(() =>
  import('@/features/evolution/EvolutionTimeline').then(m => ({
    default: m.EvolutionTimeline,
  }))
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const MemoryEvolutionSection: React.FC<MemoryEvolutionSectionProps> = memo(() => {
  const env = detectEnvironment();
  const mode = env.isTauri ? 'tauri' : 'browser';

  return (
    <div
      className="titane-section titane-section-memory-evolution"
      data-testid="memory-evolution-section-root"
      data-memory-evolution-mode={mode}
      data-memory-evolution-surface-state={env.isTauri ? 'live-center' : 'browser-fallback'}
    >
      <TSectionHeader
        title="🔄 Évolution Mémoire"
        subtitle="Dynamiques internes et journal évolutif"
      />

      <Card>
        <h3 style={{ marginBottom: spacing[4] }}>Centre d&apos;Évolution Mémoire</h3>
        {env.isTauri ? (
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Évolution mémoire"
                note="Chargement du centre d’évolution…"
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
                    label="Timeline d’évolution"
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
    </div>
  );
});

MemoryEvolutionSection.displayName = 'MemoryEvolutionSection';
