/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v24 - Progression Page
 * Cartographie des connaissances (sans gamification)
 * ═══════════════════════════════════════════════════════════════
 */

import { Container, Stack } from '@components/layout';
import { Card } from '../ui';
import { XPProgressBar } from '@features/progression';
import { KnowledgeDomains } from '../components/progression/KnowledgeDomains';
import { useExperience } from '../hooks/useExperience';
import { colors, spacing, fontSizes, fontWeights } from '@themes/tokens';

export const ProgressionPage = (): JSX.Element => {
  const { totalXp, level, xpForNextLevel, domains, isLoading } = useExperience();

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <div style={{ textAlign: 'center', padding: '48px', color: '#727b81' }}>
          Chargement du système d'expérience...
        </div>
      </Container>
    );
  }

  const xpForCurrentLevel = level ** 2 * 100;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

  return (
    <Container maxWidth="xl">
      <Stack spacing={6}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: spacing[4] }}>
          <h1
            style={{
              fontSize: fontSizes['4xl'],
              fontWeight: fontWeights.bold,
              background: 'linear-gradient(135deg, #c4c4c4, #93b399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}
          >
            Progression TITANE∞
          </h1>
          <p
            style={{
              fontSize: fontSizes.lg,
              color: colors.neutral[400],
              marginTop: spacing[2],
            }}
          >
            Système de cartographie des connaissances
          </p>
        </div>

        {/* XP Progress Bar */}
        <XPProgressBar
          currentXP={xpInCurrentLevel}
          requiredXP={xpNeededForNextLevel}
          level={level}
          showDetails
        />

        {/* Stats */}
        <Card variant="glass" elevation="md">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: fontSizes['3xl'],
                  fontWeight: fontWeights.bold,
                  color: '#93b399',
                  marginBottom: spacing[1],
                }}
              >
                {totalXp.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                XP Total
              </div>
            </div>

            <div
              style={{
                width: '1px',
                height: '40px',
                background: colors.neutral[800],
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: fontSizes['3xl'],
                  fontWeight: fontWeights.bold,
                  color: '#c4c4c4',
                  marginBottom: spacing[1],
                }}
              >
                {level}
              </div>
              <div
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Niveau Global
              </div>
            </div>

            <div
              style={{
                width: '1px',
                height: '40px',
                background: colors.neutral[800],
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: fontSizes['3xl'],
                  fontWeight: fontWeights.bold,
                  color: '#727b81',
                  marginBottom: spacing[1],
                }}
              >
                {domains.length}
              </div>
              <div
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Domaines Actifs
              </div>
            </div>
          </div>
        </Card>

        {/* Knowledge Domains */}
        <KnowledgeDomains
          domains={domains}
          onDomainClick={(domain) => {
            console.log('Domain clicked:', domain);
            // TODO: Ouvrir modal avec détails du domaine
          }}
        />
      </Stack>
    </Container>
  );
};

export const ProgressionPage = (): JSX.Element => {
  const [availablePoints, setAvailablePoints] = useState(5);
  const [talents, setTalents] = useState<TalentNode[]>([
    // Tier 1 - Foundation
    {
      id: 't1',
      name: 'Chat Basique',
      description: 'Débloquez les conversations de base avec TITANE∞',
      tier: 1,
      cost: 1,
      category: 'chat',
      unlocked: true,
      requirements: [],
      x: 370,
      y: 450,
    },
    {
      id: 't2',
      name: 'Analyse Cognitive',
      description: 'Accédez à l\'analyse de votre état mental',
      tier: 1,
      cost: 1,
      category: 'system',
      unlocked: true,
      requirements: [],
      x: 150,
      y: 450,
    },

    // Tier 2 - Intermediate
    {
      id: 't3',
      name: 'Chat Contextuel',
      description: 'Le chat utilise maintenant le contexte des conversations précédentes',
      tier: 2,
      cost: 2,
      category: 'chat',
      unlocked: true,
      requirements: ['t1'],
      x: 370,
      y: 350,
    },
    {
      id: 't4',
      name: 'Voice Mode',
      description: 'Communiquez vocalement avec TITANE∞',
      tier: 2,
      cost: 2,
      category: 'voice',
      unlocked: false,
      requirements: ['t1'],
      x: 570,
      y: 350,
    },
    {
      id: 't5',
      name: 'Mémoire Avancée',
      description: 'Stockage et rappel intelligent des informations',
      tier: 2,
      cost: 2,
      category: 'system',
      unlocked: false,
      requirements: ['t2'],
      x: 150,
      y: 350,
    },

    // Tier 3 - Advanced
    {
      id: 't6',
      name: 'Code Assistant',
      description: 'Aide à la programmation avec suggestions intelligentes',
      tier: 3,
      cost: 3,
      category: 'code',
      unlocked: false,
      requirements: ['t3'],
      x: 370,
      y: 250,
    },
    {
      id: 't7',
      name: 'Voice Recognition Pro',
      description: 'Reconnaissance vocale avancée avec commandes personnalisées',
      tier: 3,
      cost: 3,
      category: 'voice',
      unlocked: false,
      requirements: ['t4'],
      x: 570,
      y: 250,
    },
    {
      id: 't8',
      name: 'Patterns Analysis',
      description: 'Analyse approfondie de vos comportements et habitudes',
      tier: 3,
      cost: 3,
      category: 'system',
      unlocked: false,
      requirements: ['t5'],
      x: 150,
      y: 250,
    },

    // Tier 4 - Expert
    {
      id: 't9',
      name: 'Project Manager',
      description: 'Gestion complète de projets avec suivi automatique',
      tier: 4,
      cost: 4,
      category: 'projects',
      unlocked: false,
      requirements: ['t6', 't8'],
      x: 260,
      y: 150,
    },
    {
      id: 't10',
      name: 'Meta-Mode Master',
      description: 'Accès complet au mode méta avec auto-évolution',
      tier: 4,
      cost: 5,
      category: 'system',
      unlocked: false,
      requirements: ['t6', 't7', 't8'],
      x: 370,
      y: 50,
    },
  ]);

  const handleUnlockTalent = (talentId: string): void => {
    const talent = talents.find(t => t.id === talentId);
    if (!talent) {
      return;
    }

    setTalents(prev =>
      prev.map(t =>
        t.id === talentId ? { ...t, unlocked: true } : t
      )
    );

    setAvailablePoints(prev => prev - talent.cost);
  };

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
            Progression
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.lg,
              color: colors.neutral[400],
            }}
          >
            Débloquez de nouvelles capacités et évoluez avec TITANE∞
          </p>
        </div>

        {/* XP Progress */}
        <XPProgressBar
          currentXP={2450}
          requiredXP={3000}
          level={12}
          showDetails
        />

        {/* Stats */}
        <Card variant="glass" elevation="md">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: fontSizes['3xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.rubis.primary[400],
                  marginBottom: spacing[1],
                }}
              >
                {availablePoints}
              </div>
              <div
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Points disponibles
              </div>
            </div>

            <div
              style={{
                width: '1px',
                height: '40px',
                background: colors.neutral[800],
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: fontSizes['3xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.saphir.primary[400],
                  marginBottom: spacing[1],
                }}
              >
                {talents.filter(t => t.unlocked).length}
              </div>
              <div
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Talents débloqués
              </div>
            </div>

            <div
              style={{
                width: '1px',
                height: '40px',
                background: colors.neutral[800],
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: fontSizes['3xl'],
                  fontWeight: fontWeights.bold,
                  color: colors.emeraude.primary[400],
                  marginBottom: spacing[1],
                }}
              >
                {Math.max(...talents.map(t => t.unlocked ? t.tier : 0))}
              </div>
              <div
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                }}
              >
                Tier maximum atteint
              </div>
            </div>
          </div>
        </Card>

        {/* Talent Tree */}
        <TalentTree
          talents={talents}
          availablePoints={availablePoints}
          onUnlock={handleUnlockTalent}
        />
      </Stack>
    </Container>
  );
};
