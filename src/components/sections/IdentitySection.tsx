/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * IdentitySection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Mode matrix, persona editor, founding pact, identity center
 */

import React, { memo } from 'react';
import { Grid } from '@components/layout';
import { Card } from '@/ui';
import { TSectionHeader } from '@/design-system';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { detectEnvironment } from '@/core/tauri/environment';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type IdentitySectionProps = Record<string, never>;

// Lazy-load heavy components
const LazyModeMatrix = React.lazy(() =>
  import('@/features/identity/ModeMatrix').then(m => ({
    default: m.ModeMatrix,
  }))
);

const LazyPersonaEditor = React.lazy(() =>
  import('@/features/identity/PersonaEditor').then(m => ({
    default: m.PersonaEditor,
  }))
);

const LazyIdentityCenter = React.lazy(
  () => import('@/components/IdentityCenter/IdentityCenter')
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const IdentitySection: React.FC<IdentitySectionProps> = memo(() => {
  const env = detectEnvironment();

  return (
    <div className="titane-section titane-section-identity">
      <TSectionHeader
        title="🧬 Identité & ADN"
        subtitle="Matrice identité, modes, pacte fondateur"
      />

      <Grid columns={2} gap={4}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Matrice de Modes</h3>
          <React.Suspense fallback={null}>
            <LazyModeMatrix />
          </React.Suspense>
        </Card>

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Personnalité TITANE</h3>
          <React.Suspense fallback={null}>
            <LazyPersonaEditor />
          </React.Suspense>
        </Card>
      </Grid>

      <Card style={{ marginTop: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>Pacte Fondateur</h3>
        <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
          <strong>Excellence Systémique</strong>
          <br />
          Architecture cohérente et maintenable
          <br />
          <br />
          <strong>Innovation Continue</strong>
          <br />
          Évolution permanente du système
          <br />
          <br />
          <strong>Cohérence Totale</strong>
          <br />
          Zéro duplication, source unique de vérité
        </p>
      </Card>

      <Card style={{ marginTop: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>Identity Center</h3>
        {env.isTauri ? (
          <React.Suspense fallback={null}>
            <LazyIdentityCenter />
          </React.Suspense>
        ) : (
          <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
            Disponible en mode Tauri uniquement
          </p>
        )}
      </Card>
    </div>
  );
});

IdentitySection.displayName = 'IdentitySection';
