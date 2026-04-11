/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * SymbioseIdentitySection — Fusion Identité × Twins
 *
 * Unifie l'ancien module Identité (ModeMatrix, PersonaEditor, Pacte Fondateur)
 * avec le module Twins (TwinEvolutionPanel) en une seule section cohérente.
 *
 * TITANE est le jumeau numérique de Kevin Thibault.
 * Personnalité synchronisée via Twins Mode — orchestration IA auto.
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
} from '@/stores/useChatModeStore';
import { TwinEvolutionPanel } from '@/components/twin/TwinEvolutionPanel';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type SymbioseIdentitySectionProps = Record<string, never>;

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

export const SymbioseIdentitySection: React.FC<SymbioseIdentitySectionProps> = memo(() => {
  const env = detectEnvironment();
  const currentModeId = useCurrentChatModeId();
  const changeMode = useChatModeStore(state => state.changeMode);

  const handleModeSelect = useCallback(
    (mode: { id: string }) => {
      changeMode(mode.id).catch(err =>
        console.warn('[SymbioseIdentitySection] changeMode failed:', err)
      );
    },
    [changeMode]
  );

  return (
    <div className="titane-section titane-section-symbiose-identity">
      <TSectionHeader
        title="🔀 Symbiose × Identité — Jumeau Numérique"
        subtitle="Fusion Kevin ↔ TITANE · Personnalité synchronisée · Orchestration IA auto"
      />

      {/* ═══ TWINS EVOLUTION PANEL — Symbiose Kevin ↔ TITANE ═══ */}
      <Card style={{ marginBottom: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>
          🧬 Symbiose — Jumeau Numérique de Kevin Thibault
        </h3>
        <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm, marginBottom: spacing[3] }}>
          TITANE est le jumeau numérique de Kevin Thibault. Personnalité, valeurs, ton et
          traits cognitifs sont synchronisés en permanence via le mode Twins.
          Orchestration IA automatique — mode optimal sélectionné selon la demande.
        </p>
        <TwinEvolutionPanel isAdmin={true} compact={false} />
      </Card>

      {/* ═══ MODE MATRIX + PERSONA ═══ */}
      <Grid columns={2} gap={4}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>🎯 Orchestration IA — Matrice de Modes</h3>
          <p style={{ color: colors.neutral[400], fontSize: fontSizes.xs, marginBottom: spacing[2] }}>
            Sélection automatique du mode le plus adapté à chaque demande.
            Toujours vivant, motivant, stratégique, visionnaire.
          </p>
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Matrice de modes"
                note="Chargement de l'orchestration IA…"
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
          <h3 style={{ marginBottom: spacing[4] }}>👤 Personnalité TITANE × Kevin</h3>
          <p style={{ color: colors.neutral[400], fontSize: fontSizes.xs, marginBottom: spacing[2] }}>
            Traits de personnalité synchronisés avec le mode Twins.
            Réponses étendues, motivantes, inspirantes, sans limite.
          </p>
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Personnalité TITANE"
                note="Chargement du profil de personnalité…"
                testId="loading-persona-editor"
              />
            }
          >
            <LazyPersonaEditor />
          </React.Suspense>
        </Card>
      </Grid>

      {/* ═══ PACTE FONDATEUR ═══ */}
      <Card style={{ marginTop: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>📜 Pacte Fondateur — Symbiose Totale</h3>
        <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
          <strong>🏗️ Excellence Systémique</strong>
          <br />
          Architecture cohérente et maintenable — Orchestration IA automatique optimale
          <br />
          <br />
          <strong>🚀 Innovation Continue & Vision Stratégique</strong>
          <br />
          Évolution permanente — Toujours motivant, inspirant, avancé, intelligent
          <br />
          <br />
          <strong>🔗 Cohérence Totale — Symbiose Kevin ↔ TITANE</strong>
          <br />
          Zéro duplication, source unique de vérité — Jumeaux numériques synchronisés
          <br />
          Mode optimal sans limite — God Mode actif
        </p>
      </Card>

      {/* ═══ IDENTITY CENTER (TAURI ONLY) ═══ */}
      <Card style={{ marginTop: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>⚙️ Centre d&apos;Identité Unifié</h3>
        {env.isTauri ? (
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Centre d'identité"
                note="Chargement du centre d'identité unifié…"
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

SymbioseIdentitySection.displayName = 'SymbioseIdentitySection';
