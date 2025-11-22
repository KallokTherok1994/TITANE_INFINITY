/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Progression Page
 * Système d'XP et arbre de talents
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { Container, Stack } from '@components/layout';
import { Card } from '../ui';
import { XPProgressBar, TalentTree, type TalentNode } from '@features/progression';
import { colors, spacing, fontSizes, fontWeights } from '@themes/tokens';

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
