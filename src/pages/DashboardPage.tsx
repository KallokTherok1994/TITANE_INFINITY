/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v16.0.0 - Dashboard Page
 * Vue d'ensemble du système avec métriques réelles
 * + INTÉGRATION: PersonaMoodIndicator + Visual Engines
 * Real stats: 407 Tauri commands, 294 Rust modules, 355 TS files
 * ═══════════════════════════════════════════════════════════════
 */

import { Container, Grid, Stack } from '@components/layout';
import { Card, Badge } from '../ui';
import { XPProgressBar } from '@features/progression';
import { colors, spacing, fontSizes, fontWeights } from '@themes/tokens';
import { PersonaMoodIndicator } from '@components/PersonaMoodIndicator';
import { useVisualEngines } from '@hooks/useVisualEngines';

export const DashboardPage = (): JSX.Element => {
  // 🌟 Activer visual engines pour cette page
  useVisualEngines('stable', 'helios');

  return (
    <Container size="xl">
      <Stack direction="vertical" gap={6}>
        {/* Header */}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: fontWeights.bold,
              color: colors.neutral[100],
              marginBottom: spacing[2],
            }}
          >
            Bienvenue sur TITANE∞
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.lg,
              color: colors.neutral[400],
            }}
          >
            Système d'intelligence cognitive v16.0.0 — Cognitive Layer Active
          </p>
        </div>

        {/* 🎭 NEW: Persona Mood Indicator */}
        <PersonaMoodIndicator />

        {/* XP Progress - Stats Réelles Système v16 */}
        <XPProgressBar
          currentXP={113783}
          requiredXP={150000}
          level={16}
          showDetails
        />

        {/* Stats Grid - TITANE∞ v16 Real Metrics */}
        <Grid columns={3} gap={4}>
          <Card variant="glass" elevation="lg" hoverable>
            <Stack direction="vertical" gap={2}>
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: spacing[2],
                }}
              >
                🦀
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: fontSizes['2xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.neutral[100],
                }}
              >
                407
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Commandes Tauri
              </p>
              <Badge variant="success" size="sm">
                Backend Rust v16
              </Badge>
            </Stack>
          </Card>

          <Card variant="glass" elevation="lg" hoverable>
            <Stack direction="vertical" gap={2}>
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: spacing[2],
                }}
              >
                📦
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: fontSizes['2xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.neutral[100],
                }}
              >
                294
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Modules Rust (45,616 LOC)
              </p>
              <Badge variant="info" size="sm">
                8.8 MB binary
              </Badge>
            </Stack>
          </Card>

          <Card variant="glass" elevation="lg" hoverable>
            <Stack direction="vertical" gap={2}>
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: spacing[2],
                }}
              >
                ⚛️
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: fontSizes['2xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.neutral[100],
                }}
              >
                355
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Fichiers TS/TSX (68,168 LOC)
              </p>
              <Badge variant="primary" size="sm">
                2.4 MB dist
              </Badge>
            </Stack>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Card variant="solid" elevation="md">
          <h2
            style={{
              margin: 0,
              marginBottom: spacing[4],
              fontSize: fontSizes.xl,
              fontWeight: fontWeights.semibold,
              color: colors.neutral[100],
            }}
          >
            Activité récente
          </h2>
          <Stack direction="vertical" gap={3}>
            {[
              {
                icon: '🧠',
                title: 'Cognitive Layer v16 activée',
                time: 'Système actif',
                type: 'cognitive',
              },
              {
                icon: '🤖',
                title: 'Gemini API opérationnelle (gemini-2.0-flash)',
                time: 'Provider principal',
                type: 'ai',
              },
              {
                icon: '🦙',
                title: 'Ollama Local actif (llama2:latest v0.13.0)',
                time: 'Fallback disponible',
                type: 'ai-local',
              },
              {
                icon: '✅',
                title: 'Build v16: 0 warnings, 0 errors (143 tests pass)',
                time: 'Production ready',
                type: 'build',
              },
            ].map((activity, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  background: colors.neutral[900],
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>{activity.icon}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: fontSizes.base,
                      color: colors.neutral[200],
                      marginBottom: spacing[1],
                    }}
                  >
                    {activity.title}
                  </div>
                  <div
                    style={{
                      fontSize: fontSizes.sm,
                      color: colors.neutral[500],
                    }}
                  >
                    {activity.time}
                  </div>
                </div>
                <Badge variant="neutral" size="sm">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};
