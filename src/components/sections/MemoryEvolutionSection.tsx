/**
 * TITANE∞ v25.3.0 — Proprietary License
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

  return (
    <div className="titane-section titane-section-memory-evolution">
      <TSectionHeader
        title="🔄 Évolution Mémoire"
        subtitle="Dynamiques internes et journal évolutif"
      />

      <Card>
        <h3 style={{ marginBottom: spacing[4] }}>Centre d&apos;Évolution Mémoire</h3>
        {env.isTauri ? (
          <React.Suspense fallback={null}>
            <LazyMemoryEvolutionCenter />
          </React.Suspense>
        ) : (
          <div>
            <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
              Disponible en mode Tauri uniquement
            </p>
            <div style={{ marginTop: spacing[4] }}>
              <h4 style={{ marginBottom: spacing[3] }}>Timeline d&apos;Évolution</h4>
              <React.Suspense fallback={null}>
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
