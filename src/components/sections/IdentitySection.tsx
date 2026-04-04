/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * IdentitySection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Mode matrix, persona editor, founding pact, identity center
 */

import React, { memo, useCallback } from 'react';
import { Grid } from '@components/layout';
import { Card } from '@/ui';
import { TSectionHeader } from '@/design-system';
import { SectionLoadingFallback } from './SectionLoadingFallback';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { detectEnvironment } from '@/core/tauri/environment';
import {
  useChatModeStore,
  useCurrentChatModeId,
  useAvailableChatModes,
} from '@/stores/useChatModeStore';

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
  const currentModeId = useCurrentChatModeId();
  const changeMode = useChatModeStore(state => state.changeMode);

  const handleModeSelect = useCallback(
    (mode: { id: string }) => {
      changeMode(mode.id).catch(err =>
        console.warn('[IdentitySection] changeMode failed:', err)
      );
    },
    [changeMode]
  );

  return (
    <div className="titane-section titane-section-identity">
      <TSectionHeader
        title="🧬 Identité & ADN"
        subtitle="Matrice identité, modes, pacte fondateur"
      />

      <Grid columns={2} gap={4}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Matrice de Modes</h3>
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Matrice de modes"
                note="Chargement des modes d’identité…"
                testId="loading-identity-modes"
              />
            }
          >
            <LazyModeMatrix
              currentMode={currentModeId ?? undefined}
              onModeSelect={handleModeSelect}
            />
          </React.Suspense>
        </Card>

        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Personnalité TITANE</h3>
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Personnalité TITANE"
                note="Chargement de l’éditeur de persona…"
                testId="loading-persona-editor"
              />
            }
          >
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
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Identity Center"
                note="Chargement du centre d’identité…"
                testId="loading-identity-center"
              />
            }
          >
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
