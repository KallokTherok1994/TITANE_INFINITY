/**
 * TITANE∞ v15 — Proprietary License
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

import { Card } from '../ui';
import { XPProgressBar } from '@features/progression';
import { KnowledgeDomains } from '../components/progression/KnowledgeDomains';
import { useExperience } from '../hooks/useExperience';
import { colors, spacing, fontSizes, fontWeights } from '@themes/tokens';

export const ProgressionPage = (): JSX.Element => {
  const { totalXp, level, xpForNextLevel, domains, isLoading } = useExperience();

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: spacing[6] }}>
        <div style={{ textAlign: 'center', padding: '48px', color: '#727b81' }}>
          Chargement du système d'expérience...
        </div>
      </div>
    );
  }

  const xpForCurrentLevel = level ** 2 * 100;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: spacing[6] }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
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
          onDomainClick={domain => {
            console.log('Domain clicked:', domain);
            // IMPLEMENTATION: Open domain details modal
            // 1. Component: <DomainDetailsModal domain={domain} open={modalOpen} onClose={() => setModalOpen(false)} />
            // 2. Display: Knowledge items in domain, mastery level (0-100%), last updated
            // 3. Progress: Visual graph of mastery over time, trending (up/down/stable)
            // 4. Resources: Related learning materials, suggested topics
            // 5. Actions: Edit domain, add knowledge items, tag items, export notes
            // 6. State: Use modal state (setSelectedDomain, setModalOpen)
          }}
        />
      </div>
    </div>
  );
};
