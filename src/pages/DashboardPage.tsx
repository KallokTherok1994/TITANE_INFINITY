/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Dashboard Page
 * Vue d'ensemble du système avec métriques et statistiques
 * ═══════════════════════════════════════════════════════════════
 */

import { Container, Grid, Stack } from '@components/layout';
import { Card, Badge } from '../ui';
import { XPProgressBar } from '@features/progression';
import { colors, spacing, fontSizes, fontWeights } from '@themes/tokens';

export const DashboardPage = (): JSX.Element => {
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
            Système d'intelligence cognitive v17.1
          </p>
        </div>

        {/* XP Progress */}
        <XPProgressBar
          currentXP={2450}
          requiredXP={3000}
          level={12}
          showDetails
        />

        {/* Stats Grid */}
        <Grid columns={3} gap={4}>
          <Card variant="glass" elevation="lg" hoverable>
            <Stack direction="vertical" gap={2}>
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: spacing[2],
                }}
              >
                💬
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: fontSizes['2xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.neutral[100],
                }}
              >
                1,234
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Conversations
              </p>
              <Badge variant="success" size="sm">
                +12% ce mois
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
                🧠
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: fontSizes['2xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.neutral[100],
                }}
              >
                5,678
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Mémoires stockées
              </p>
              <Badge variant="info" size="sm">
                Capacité: 78%
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
                ⚡
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: fontSizes['2xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.neutral[100],
                }}
              >
                24
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Talents débloqués
              </p>
              <Badge variant="primary" size="sm">
                Niveau 12
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
                icon: '💬',
                title: 'Nouvelle conversation',
                time: 'Il y a 5 minutes',
                type: 'chat',
              },
              {
                icon: '🧠',
                title: 'Analyse cognitive complétée',
                time: 'Il y a 23 minutes',
                type: 'cognitive',
              },
              {
                icon: '⚡',
                title: 'Talent "Code Expert" débloqué',
                time: 'Il y a 1 heure',
                type: 'achievement',
              },
              {
                icon: '📚',
                title: '15 nouvelles mémoires ajoutées',
                time: 'Il y a 2 heures',
                type: 'memory',
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
