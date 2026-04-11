/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * TwinsSection — surface TWINS unifiée
 *
 * Section canonique : TwinEvolutionPanel, ModeMatrix, PersonaEditor
 * et passerelles directes vers le Chat IA — tout sous le nom TWINS.
 *
 * TITANE est le TWINS numérique de Kevin Thibault.
 * Personnalité synchronisée et orchestration IA auto.
 */

import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@components/layout';
import { Card } from '@/ui';
import { TSectionHeader } from '@/design-system';
import { SectionLoadingFallback } from './SectionLoadingFallback';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { useChatModeStore, useCurrentChatModeId } from '@/stores/useChatModeStore';
import { TwinEvolutionPanel } from '@/components/twin/TwinEvolutionPanel';
import { useTwinEvolution } from '@/hooks/useTwinEvolution';
import { createLogger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TwinsSectionProps = Record<string, never>;

const sectionLogger = createLogger('TwinsSection');

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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TwinsSection: React.FC<TwinsSectionProps> = memo(() => {
  const currentModeId = useCurrentChatModeId();
  const changeMode = useChatModeStore(state => state.changeMode);
  const navigate = useNavigate();
  const { chatContextStatus, lastSyncAt, currentPhase, syncScore } = useTwinEvolution();

  const handleModeSelect = useCallback(
    (mode: { id: string }) => {
      changeMode(mode.id).catch(err => sectionLogger.warn('changeMode failed', err));
    },
    [changeMode]
  );

  const goToChat = useCallback(() => {
    navigate('/titane?tab=conversation');
  }, [navigate]);

  const chatStatusMeta =
    chatContextStatus === 'active'
      ? {
          label: '🟢 Contexte TWINS actif — injecté dans le Chat IA',
          color: '#b7eb8f',
          bg: 'rgba(82,196,26,0.12)',
          border: 'rgba(82,196,26,0.5)',
        }
      : chatContextStatus === 'stale'
        ? {
            label: '🟠 Contexte TWINS à resynchroniser',
            color: '#ffd591',
            bg: 'rgba(250,173,20,0.12)',
            border: 'rgba(250,173,20,0.5)',
          }
        : {
            label: "⚪ Contexte TWINS en attente d'initialisation",
            color: '#d9d9d9',
            bg: 'rgba(140,140,140,0.12)',
            border: 'rgba(140,140,140,0.5)',
          };

  const lastSyncDisplay = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="titane-section titane-section-twins">
      <TSectionHeader
        title="🧬 TWINS — Jumeau Numérique"
        subtitle="Surface unifiée Kevin ↔ TITANE · contexte Chat IA · orchestration automatique"
      />

      {/* ═══ CHAT IA CONNECTION STATUS ═══ */}
      <Card style={{ marginBottom: spacing[4], padding: spacing[3] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing[2],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span
              data-testid="twins-context-status"
              style={{
                display: 'inline-block',
                padding: `${spacing[1]} ${spacing[3]}`,
                borderRadius: '20px',
                fontSize: fontSizes.xs,
                fontWeight: 600,
                color: chatStatusMeta.color,
                background: chatStatusMeta.bg,
                border: `1px solid ${chatStatusMeta.border}`,
              }}
            >
              {chatStatusMeta.label}
            </span>
            <span
              style={{ fontSize: fontSizes.xs, color: colors.neutral[500] }}
              data-testid="twins-context-meta"
            >
              {lastSyncDisplay ? `Dernière sync : ${lastSyncDisplay}` : 'Sync en attente'}
              {currentPhase ? ` · Phase : ${currentPhase}` : ''}
              {chatContextStatus === 'active' ? ` · Sync : ${Math.round(syncScore * 100)}%` : ''}
            </span>
          </div>
          <button
            data-testid="twins-go-to-chat"
            onClick={goToChat}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: fontSizes.sm,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            💬 Ouvrir le Chat IA
          </button>
        </div>
      </Card>

      {/* ═══ TWINS EVOLUTION PANEL — Kevin ↔ TITANE ═══ */}
      <Card style={{ marginBottom: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>
          🧬 TWINS — Jumeau Numérique de Kevin Thibault
        </h3>
        <p
          style={{
            color: colors.neutral[400],
            fontSize: fontSizes.sm,
            marginBottom: spacing[3],
          }}
        >
          TITANE est le TWINS numérique de Kevin Thibault. Personnalité, valeurs, ton et
          traits cognitifs sont synchronisés en permanence via le mode TWINS.
          Orchestration IA automatique — mode optimal sélectionné selon la demande.
        </p>
        <TwinEvolutionPanel isAdmin={true} compact={false} />
      </Card>

      {/* ═══ MODE MATRIX + PERSONA ═══ */}
      <Grid columns={2} gap={4}>
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>
            🎯 Orchestration IA — Matrice de Modes
          </h3>
          <p
            style={{
              color: colors.neutral[400],
              fontSize: fontSizes.xs,
              marginBottom: spacing[2],
            }}
          >
            Sélection automatique du mode le plus adapté à chaque demande. Toujours
            vivant, motivant, stratégique, visionnaire.
          </p>
          <React.Suspense
            fallback={
              <SectionLoadingFallback
                label="Matrice de modes"
                note="Chargement de l'orchestration IA…"
                testId="loading-twins-modes"
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
          <p
            style={{
              color: colors.neutral[400],
              fontSize: fontSizes.xs,
              marginBottom: spacing[2],
            }}
          >
            Traits de personnalité synchronisés avec le mode Twins. Réponses étendues,
            motivantes, inspirantes, sans limite.
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
        <h3 style={{ marginBottom: spacing[4] }}>📜 Pacte Fondateur — Alignement TWINS</h3>
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
          <strong>🔗 Cohérence Totale — TWINS Kevin ↔ TITANE</strong>
          <br />
          Zéro duplication, source unique de vérité — Jumeaux numériques synchronisés
          <br />
          Mode optimal sans limite — God Mode actif
        </p>
      </Card>

      {/* ═══ TWINS SURFACE SUMMARY ═══ */}
      <Card style={{ marginTop: spacing[4] }}>
        <h3 style={{ marginBottom: spacing[4] }}>⚙️ Surface TWINS canonique</h3>
        <p style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
          Les anciennes surfaces <strong>Identity</strong> et <strong>Symbiose</strong>
          sont maintenant consolidées ici. Toute navigation legacy redirige vers le
          point d&apos;entrée unique <code>/titane?tab=twins</code>.
        </p>
        <ul
          style={{
            marginTop: spacing[3],
            paddingLeft: spacing[4],
            color: colors.neutral[300],
            fontSize: fontSizes.sm,
          }}
        >
          <li>🧭 Routing public unique : `?tab=twins`</li>
          <li>💬 Contexte TWINS injecté explicitement dans le Chat IA</li>
          <li>🎯 Orchestration et personnalité pilotées depuis cette section</li>
        </ul>
      </Card>
    </div>
  );
});

TwinsSection.displayName = 'TwinsSection';
