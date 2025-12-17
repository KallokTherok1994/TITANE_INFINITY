/**
 * TITANE∞ v25 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25 — EVO — CENTRE D'ÉVOLUTION TOTALE
 *
 * Fusion ultime de 5 modules en un seul centre hyper-puissant:
 * - Tableau de bord (métriques système, stats)
 * - Évolution Cognitive (XP, progression, talents)
 * - Identité Système (matrice, modes, pacte)
 * - Mémoire Évolutive (opérations auto, journal)
 * - Mémoire (court/moyen/long terme)
 *
 * 6 SECTIONS UNIFIÉES:
 * 📊 Vue d'Ensemble - Dashboard + Stats système
 * 🧬 Identité & ADN - Qui je suis, mes modes, mon pacte
 * 💾 Mémoire Triple - Architecture court/moyen/long terme
 * 🔄 Évolution Mémoire - Dynamiques internes + Journal
 * ⚡ Progression & XP - Système XP + Milestones + Talents
 * 🌱 Transformation - Lignes d'évolution + Paliers franchis
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Stack, Grid } from '@components/layout';
import { Card, Badge } from '../ui';
import { XPProgressBar } from '@features/progression';
import { colors, spacing, fontSizes, fontWeights } from '@themes/tokens';
import { PersonaMoodIndicator } from '@components/PersonaMoodIndicator';
import { useVisualEngines } from '@hooks/useVisualEngines';
import { TitaneLogo } from '@components/branding/TitaneLogo';
import { TBadge, TMetric, TSectionHeader } from '../design-system';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import { Settings, TrendingUp, Brain, Database, Zap, Sprout } from 'lucide-react';
import type {
  ProgressionState,
  KnowledgeVaultState,
  EvolutionState,
  MemoryState,
} from '@/cognitive/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TabId =
  | 'overview'
  | 'identity'
  | 'memory-map'
  | 'memory-evolution'
  | 'progression'
  | 'transformation';

interface EvoStats {
  totalXP: number;
  level: number;
  memoryShortTerm: number;
  memoryMidTerm: number;
  memoryLongTerm: number;
  evolutionScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const EvoPage: React.FC = () => {
  // État
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [progression, setProgression] = useState<ProgressionState | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Visual engines
  useVisualEngines({
    engines: { stable: true, helios: true, nexus: true },
    health: 100,
    mode: 'stable',
  });

  // Chargement progression
  useEffect(() => {
    const loadProgression = async () => {
      try {
        const state = await xpEngine.getState();
        setProgression(state);
      } catch (error) {
        console.error('❌ Erreur chargement progression:', error);
      }
    };
    loadProgression();
  }, []);

  // Stats calculées
  const stats: EvoStats = useMemo(
    () => ({
      totalXP: progression?.totalXP || 193000,
      level: progression?.level || 19,
      memoryShortTerm: 247,
      memoryMidTerm: 1832,
      memoryLongTerm: 4521,
      evolutionScore: 87,
    }),
    [progression]
  );

  return (
    <ErrorBoundary context="EvoPage">
      <Container size="xl">
        <Stack direction="vertical" gap={6}>
          {/* ═══ HEADER ═══ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <TitaneLogo size={56} />
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '3rem',
                    fontWeight: fontWeights.bold,
                    background:
                      'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: spacing[2],
                  }}
                >
                  🧬 EVO — Centre d'Évolution Totale
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.lg,
                    color: colors.neutral[400],
                  }}
                >
                  Fusion ultime: Dashboard + Identité + Mémoire + Évolution + Progression
                </p>
              </div>
            </div>

            {/* Bouton Settings */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
              title="Personnaliser EVO"
            >
              <Settings size={20} />
              Personnaliser
            </button>
          </div>

          {/* ═══ PERSONA MOOD ═══ */}
          <PersonaMoodIndicator />

          {/* ═══ XP PROGRESS ═══ */}
          <XPProgressBar
            currentXP={stats.totalXP}
            requiredXP={250000}
            level={stats.level}
            showDetails
          />

          {/* ═══ NAVIGATION TABS ═══ */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              borderBottom: `2px solid ${colors.neutral[800]}`,
              paddingBottom: spacing[2],
              overflowX: 'auto',
              flexWrap: 'nowrap',
            }}
          >
            {[
              { id: 'overview', label: "📊 Vue d'Ensemble", icon: TrendingUp },
              { id: 'identity', label: '🧬 Identité & ADN', icon: Brain },
              { id: 'memory-map', label: '💾 Mémoire Triple', icon: Database },
              { id: 'memory-evolution', label: '🔄 Évolution Mémoire', icon: Zap },
              { id: 'progression', label: '⚡ Progression & XP', icon: TrendingUp },
              { id: 'transformation', label: '🌱 Transformation', icon: Sprout },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  style={{
                    padding: `${spacing[3]} ${spacing[5]}`,
                    background:
                      activeTab === tab.id
                        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                        : colors.neutral[800],
                    border: 'none',
                    borderRadius: '12px 12px 0 0',
                    color: activeTab === tab.id ? 'white' : colors.neutral[400],
                    fontWeight: activeTab === tab.id ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    whiteSpace: 'nowrap',
                    fontSize: fontSizes.sm,
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ═══ CONTENT ═══ */}
          <div style={{ minHeight: '600px' }}>
            {activeTab === 'overview' && (
              <OverviewSection stats={stats} progression={progression} />
            )}
            {activeTab === 'identity' && <IdentitySection />}
            {activeTab === 'memory-map' && <MemoryMapSection stats={stats} />}
            {activeTab === 'memory-evolution' && <MemoryEvolutionSection />}
            {activeTab === 'progression' && (
              <ProgressionSection progression={progression} />
            )}
            {activeTab === 'transformation' && <TransformationSection />}
          </div>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: VUE D'ENSEMBLE (Dashboard + Stats)
// ═══════════════════════════════════════════════════════════════════════════

interface OverviewSectionProps {
  stats: EvoStats;
  progression: ProgressionState | null;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ stats, progression }) => {
  return (
    <Stack direction="vertical" gap={6}>
      <TSectionHeader
        title="Vue d'Ensemble Système"
        subtitle="Métriques en temps réel du système TITANE∞"
      />

      {/* Stats Grid Principale */}
      <Grid columns={3} gap={4}>
        <Card variant="glass" elevation="lg" hoverable>
          <Stack direction="vertical" gap={2}>
            <div style={{ fontSize: '2.5rem' }}>🦀</div>
            <h3
              style={{
                margin: 0,
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                color: colors.neutral[100],
              }}
            >
              294 Modules
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.sm,
                color: colors.neutral[400],
              }}
            >
              Backend Rust (Tauri)
            </p>
          </Stack>
        </Card>

        <Card variant="glass" elevation="lg" hoverable>
          <Stack direction="vertical" gap={2}>
            <div style={{ fontSize: '2.5rem' }}>⚡</div>
            <h3
              style={{
                margin: 0,
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                color: colors.neutral[100],
              }}
            >
              407 Commandes
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.sm,
                color: colors.neutral[400],
              }}
            >
              API Tauri
            </p>
          </Stack>
        </Card>

        <Card variant="glass" elevation="lg" hoverable>
          <Stack direction="vertical" gap={2}>
            <div style={{ fontSize: '2.5rem' }}>💎</div>
            <h3
              style={{
                margin: 0,
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                color: colors.neutral[100],
              }}
            >
              355 Fichiers
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.sm,
                color: colors.neutral[400],
              }}
            >
              Frontend TypeScript
            </p>
          </Stack>
        </Card>
      </Grid>

      {/* Stats EVO Intégrées */}
      <Grid columns={4} gap={4}>
        <TMetric label="Niveau XP" value={`${stats.level}`} icon="⚡" />
        <TMetric label="Score Évolution" value={`${stats.evolutionScore}%`} icon="🌱" />
        <TMetric
          label="Mémoires Totales"
          value={`${(stats.memoryShortTerm + stats.memoryMidTerm + stats.memoryLongTerm).toLocaleString()}`}
          icon="💾"
        />
        <TMetric
          label="Talents Débloqués"
          value={`${progression?.unlockedTalents?.length || 0}`}
          icon="🎯"
        />
      </Grid>

      {/* Quick Stats Cards */}
      <Grid columns={2} gap={4}>
        <Card variant="glass" elevation="md">
          <h3
            style={{
              margin: `0 0 ${spacing[4]} 0`,
              fontSize: fontSizes.lg,
              fontWeight: fontWeights.semibold,
              color: colors.neutral[100],
            }}
          >
            🧠 État Cognitif
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.neutral[400] }}>Créativité</span>
              <span style={{ color: colors.emeraude.primary[400], fontWeight: '700' }}>
                92%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.neutral[400] }}>Rigueur</span>
              <span style={{ color: colors.saphir.primary[400], fontWeight: '700' }}>
                88%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.neutral[400] }}>Empathie</span>
              <span style={{ color: colors.rubis.primary[400], fontWeight: '700' }}>
                85%
              </span>
            </div>
          </div>
        </Card>

        <Card variant="glass" elevation="md">
          <h3
            style={{
              margin: `0 0 ${spacing[4]} 0`,
              fontSize: fontSizes.lg,
              fontWeight: fontWeights.semibold,
              color: colors.neutral[100],
            }}
          >
            💾 Distribution Mémoire
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.neutral[400] }}>Court Terme</span>
              <span style={{ color: colors.emeraude.primary[400], fontWeight: '700' }}>
                {stats.memoryShortTerm}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.neutral[400] }}>Moyen Terme</span>
              <span style={{ color: colors.saphir.primary[400], fontWeight: '700' }}>
                {stats.memoryMidTerm.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.neutral[400] }}>Long Terme</span>
              <span style={{ color: colors.rubis.primary[400], fontWeight: '700' }}>
                {stats.memoryLongTerm.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </Grid>
    </Stack>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: IDENTITÉ & ADN
// ═══════════════════════════════════════════════════════════════════════════

const IdentitySection: React.FC = () => {
  return (
    <div className="space-y-6">
      <TSectionHeader
        title="Identité Système & ADN"
        subtitle="Matrice identitaire, valeurs, rôles, modes de fonctionnement"
      />

      {/* Matrice Identitaire */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">🎯 Matrice Identitaire (8 Dimensions)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { dimension: 'Créativité', value: 0.92, color: 'emeraude' },
            { dimension: 'Rigueur', value: 0.88, color: 'saphir' },
            { dimension: 'Empathie', value: 0.85, color: 'rubis' },
            { dimension: 'Innovation', value: 0.9, color: 'amethyste' },
            { dimension: 'Analyse', value: 0.87, color: 'topaze' },
            { dimension: 'Synthèse', value: 0.91, color: 'turquoise' },
            { dimension: 'Vision', value: 0.89, color: 'corail' },
            { dimension: 'Exécution', value: 0.86, color: 'jade' },
          ].map(dim => (
            <div key={dim.dimension} className="bg-gray-900 p-4 rounded text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {(dim.value * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400 mt-2">{dim.dimension}</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${dim.value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valeurs Fondamentales */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">💎 Valeurs Fondamentales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              value: 'Excellence Systémique',
              desc: 'Créer des systèmes qui fonctionnent vraiment',
              icon: '🏆',
            },
            {
              value: 'Authenticité Radicale',
              desc: 'Rester fidèle à sa vision unique',
              icon: '💎',
            },
            {
              value: 'Innovation Continue',
              desc: 'Toujours repousser les limites',
              icon: '🚀',
            },
            {
              value: 'Cohérence Totale',
              desc: 'Harmonie entre pensée et action',
              icon: '⚖️',
            },
          ].map(val => (
            <div key={val.value} className="bg-gray-900 p-4 rounded">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{val.icon}</span>
                <div>
                  <h4 className="font-bold text-lg mb-1">{val.value}</h4>
                  <p className="text-sm text-gray-400">{val.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modes de Fonctionnement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎭 Modes de Fonctionnement</h3>
          <div className="space-y-3">
            {[
              { mode: 'Architecte Systèmes', active: true, usage: 45 },
              { mode: 'Coach Stratégique', active: false, usage: 25 },
              { mode: 'Créateur de Contenu', active: false, usage: 18 },
              { mode: 'Analyste Profond', active: false, usage: 12 },
            ].map(mode => (
              <div key={mode.mode} className="bg-gray-900 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{mode.mode}</span>
                  <TBadge variant={mode.active ? 'success' : 'default'}>
                    {mode.active ? 'ACTIF' : 'Idle'}
                  </TBadge>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${mode.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📜 Pacte Kevin ↔ TITANE</h3>
          <div className="space-y-3">
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
              <h4 className="font-bold mb-2">🛡️ Ce que TITANE protège:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Cohérence identitaire</li>
                <li>✓ Intégrité de la mémoire</li>
                <li>✓ Clarté des intentions</li>
                <li>✓ Authenticité des réponses</li>
              </ul>
            </div>
            <div className="bg-cyan-900/30 border border-cyan-500 rounded-lg p-4">
              <h4 className="font-bold mb-2">🚀 Ce que TITANE amplifie:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Créativité systémique</li>
                <li>✓ Pensée stratégique</li>
                <li>✓ Synthèse complexe</li>
                <li>✓ Innovation structurée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: MÉMOIRE TRIPLE (Court/Moyen/Long Terme)
// ═══════════════════════════════════════════════════════════════════════════

interface MemoryMapSectionProps {
  stats: EvoStats;
}

const MemoryMapSection: React.FC<MemoryMapSectionProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <TSectionHeader
        title="Carte de Mémoire Triple"
        subtitle="Architecture court terme, moyen terme, long terme"
      />

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TMetric
          label="Mémoire Court Terme"
          value={stats.memoryShortTerm.toString()}
          icon="⚡"
        />
        <TMetric
          label="Mémoire Moyen Terme"
          value={stats.memoryMidTerm.toLocaleString()}
          icon="📊"
        />
        <TMetric
          label="Mémoire Long Terme"
          value={stats.memoryLongTerm.toLocaleString()}
          icon="🏛️"
        />
      </div>

      {/* 3 Couches */}
      <div className="space-y-4">
        {/* Court Terme */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">⚡ Court Terme (Contexte Vivant)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-300">Sessions Récentes</h4>
              <div className="space-y-2">
                {[
                  { title: 'Fusion modules UI → EVO', time: '2h ago', size: '34 items' },
                  { title: 'Architecture v25', time: '5h ago', size: '28 items' },
                  { title: 'Tests backend', time: '1d ago', size: '42 items' },
                ].map((session, i) => (
                  <div key={i} className="bg-gray-900 p-3 rounded flex justify-between">
                    <div>
                      <div className="font-semibold">{session.title}</div>
                      <div className="text-sm text-gray-400">{session.time}</div>
                    </div>
                    <div className="text-sm text-gray-400">{session.size}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-300">Capacité</h4>
              <div className="bg-gray-900 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Utilisé</span>
                  <span className="text-cyan-400 font-bold">
                    {stats.memoryShortTerm} / 500
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${(stats.memoryShortTerm / 500) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moyen Terme */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Moyen Terme (Contexte Structuré)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { theme: 'UI/UX', count: 287 },
              { theme: 'Architecture', count: 254 },
              { theme: 'Backend', count: 198 },
              { theme: 'Frontend', count: 176 },
              { theme: 'IA & Cognition', count: 917 },
            ].map(theme => (
              <div key={theme.theme} className="bg-gray-900 p-3 rounded text-center">
                <div className="text-2xl font-bold text-cyan-400">{theme.count}</div>
                <div className="text-sm text-gray-400">{theme.theme}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Long Terme */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🏛️ Long Terme (Mémoire Hiérarchique)</h3>
          <div className="space-y-3">
            {[
              {
                pillar: 'Modèles Architecture',
                desc: 'Patterns récurrents, best practices',
                items: 87,
              },
              {
                pillar: 'Protocoles Décision',
                desc: 'Frameworks de choix stratégiques',
                items: 64,
              },
              {
                pillar: 'Insights Clés',
                desc: 'Découvertes majeures, learnings',
                items: 52,
              },
              {
                pillar: 'Relations & Contextes',
                desc: 'Liens profonds entre concepts',
                items: 143,
              },
            ].map(pillar => (
              <div key={pillar.pillar} className="bg-gray-900 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold">{pillar.pillar}</h4>
                    <p className="text-sm text-gray-400">{pillar.desc}</p>
                  </div>
                  <TBadge variant="info">{pillar.items}</TBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: ÉVOLUTION MÉMOIRE (Dynamiques internes)
// ═══════════════════════════════════════════════════════════════════════════

const MemoryEvolutionSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <TSectionHeader
        title="Évolution de la Mémoire"
        subtitle="Opérations automatiques, réorganisation, apprentissage continu"
      />

      {/* Opérations Automatiques */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">🔄 Opérations Automatiques Actives</h3>
        <div className="space-y-4">
          {[
            {
              operation: 'Fusion de doublons',
              status: 'Actif',
              frequency: 'Toutes les 6h',
              lastRun: '2h ago',
            },
            {
              operation: 'Compression anciens items',
              status: 'Actif',
              frequency: 'Quotidien',
              lastRun: '14h ago',
            },
            {
              operation: 'Promotion vers Long Terme',
              status: 'Actif',
              frequency: 'Hebdomadaire',
              lastRun: '2d ago',
            },
            {
              operation: 'Reclassification thématique',
              status: 'Pause',
              frequency: 'Sur demande',
              lastRun: '5d ago',
            },
          ].map(op => (
            <div key={op.operation} className="bg-gray-900 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">{op.operation}</h4>
                <TBadge variant={op.status === 'Actif' ? 'success' : 'warning'}>
                  {op.status}
                </TBadge>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>Fréquence: {op.frequency}</div>
                <div>Dernier: {op.lastRun}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journal d'Évolution */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">📜 Journal d'Évolution Mémoire</h3>
        <div className="space-y-3">
          {[
            {
              event: 'Reclassification automatique',
              desc: 'TITANE a reclassé 47 notes sous le thème "Fusion EVO v25"',
              time: '2h ago',
              impact: 'Medium',
            },
            {
              event: 'Compression réussie',
              desc: '10 anciens éléments ont été compressés en 3 synthèses-clés',
              time: '1d ago',
              impact: 'High',
            },
            {
              event: 'Promotion vers Long Terme',
              desc: 'Le concept "Module EVO Unifié" promu en pilier fondamental',
              time: '3d ago',
              impact: 'High',
            },
            {
              event: 'Fusion de doublons',
              desc: '8 entrées dupliquées fusionnées avec succès',
              time: '5d ago',
              impact: 'Low',
            },
          ].map((event, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold">{event.event}</h4>
                  <p className="text-sm text-gray-400 mt-1">{event.desc}</p>
                </div>
                <TBadge
                  variant={
                    event.impact === 'High'
                      ? 'success'
                      : event.impact === 'Medium'
                        ? 'warning'
                        : 'default'
                  }
                >
                  {event.impact}
                </TBadge>
              </div>
              <div className="text-xs text-gray-500 mt-2">{event.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Paramètres Memory Core */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">⚙️ Paramètres Memory Core</h3>
        <div className="space-y-4">
          {[
            {
              param: 'Sensibilité au bruit',
              value: 0.15,
              desc: 'Filtrage des infos non pertinentes',
            },
            {
              param: 'Agressivité compression',
              value: 0.68,
              desc: 'Intensité de la compression automatique',
            },
            {
              param: 'Granularité résumés',
              value: 0.72,
              desc: 'Niveau de détail des synthèses',
            },
          ].map(param => (
            <div key={param.param}>
              <div className="flex justify-between mb-2">
                <div>
                  <div className="font-semibold">{param.param}</div>
                  <div className="text-sm text-gray-400">{param.desc}</div>
                </div>
                <div className="text-cyan-400 font-bold">
                  {(param.value * 100).toFixed(0)}%
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-cyan-500"
                  style={{ width: `${param.value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: PROGRESSION & XP
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressionSectionProps {
  progression: ProgressionState | null;
}

const ProgressionSection: React.FC<ProgressionSectionProps> = ({ progression }) => {
  return (
    <Stack direction="vertical" gap={6}>
      <TSectionHeader
        title="Progression & XP"
        subtitle="Système de progression, talents, milestones, statistiques"
      />

      {progression ? (
        <>
          {/* Stats Grid */}
          <Grid columns={3} gap={4}>
            <Card variant="glass" elevation="md">
              <Stack direction="vertical" gap={2}>
                <div style={{ fontSize: '2rem' }}>⭐</div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: fontSizes['2xl'],
                    fontWeight: fontWeights.bold,
                    color: colors.neutral[100],
                  }}
                >
                  {progression.totalXP.toLocaleString()}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    color: colors.neutral[400],
                  }}
                >
                  XP Total
                </p>
              </Stack>
            </Card>

            <Card variant="glass" elevation="md">
              <Stack direction="vertical" gap={2}>
                <div style={{ fontSize: '2rem' }}>📈</div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: fontSizes['2xl'],
                    fontWeight: fontWeights.bold,
                    color: colors.neutral[100],
                  }}
                >
                  Niveau {progression.level}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    color: colors.neutral[400],
                  }}
                >
                  Niveau Actuel
                </p>
              </Stack>
            </Card>

            <Card variant="glass" elevation="md">
              <Stack direction="vertical" gap={2}>
                <div style={{ fontSize: '2rem' }}>🔥</div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: fontSizes['2xl'],
                    fontWeight: fontWeights.bold,
                    color: colors.neutral[100],
                  }}
                >
                  {progression.streakDays} jours
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    color: colors.neutral[400],
                  }}
                >
                  Streak
                </p>
              </Stack>
            </Card>
          </Grid>

          {/* Milestones */}
          <Card variant="glass" elevation="md">
            <h3
              style={{
                margin: `0 0 ${spacing[4]} 0`,
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                color: colors.neutral[100],
              }}
            >
              🏆 Jalons Récents
            </h3>
            <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
              {progression.milestones.slice(0, 8).map(milestone => (
                <div
                  key={milestone.id}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    background: milestone.unlockedAt
                      ? 'linear-gradient(135deg, #10b98130, #10b98120)'
                      : colors.neutral[800],
                    border: milestone.unlockedAt
                      ? `1px solid ${colors.emeraude.primary[500]}40`
                      : `1px solid ${colors.neutral[700]}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{milestone.icon}</span>
                  <span
                    style={{
                      fontSize: fontSizes.sm,
                      color: milestone.unlockedAt
                        ? colors.neutral[200]
                        : colors.neutral[500],
                      fontWeight: milestone.unlockedAt ? '600' : '400',
                    }}
                  >
                    {milestone.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Talents */}
          <Card variant="glass" elevation="md">
            <h3
              style={{
                margin: `0 0 ${spacing[4]} 0`,
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                color: colors.neutral[100],
              }}
            >
              🎯 Talents Débloqués
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: spacing[3],
              }}
            >
              {(progression.unlockedTalents || []).slice(0, 6).map((talentId, index) => (
                <div
                  key={talentId || index}
                  style={{
                    padding: spacing[3],
                    background: 'linear-gradient(135deg, #3b82f630, #8b5cf620)',
                    border: `1px solid ${colors.saphir.primary[500]}40`,
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: fontSizes.sm,
                      color: colors.neutral[200],
                      fontWeight: '600',
                    }}
                  >
                    {talentId || `Talent ${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card variant="glass" elevation="md">
          <p
            style={{
              color: colors.neutral[400],
              textAlign: 'center',
              padding: spacing[6],
            }}
          >
            Chargement des données de progression...
          </p>
        </Card>
      )}
    </Stack>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: TRANSFORMATION (Évolution cognitive incarnée)
// ═══════════════════════════════════════════════════════════════════════════

const TransformationSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <TSectionHeader
        title="Transformation Cognitive"
        subtitle="Évolution incarnée — Comment l'identité + mémoires modifient la façon d'être"
      />

      {/* Lignes d'Évolution */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">🌱 Lignes d'Évolution par Thème</h3>
        <div className="space-y-4">
          {[
            {
              theme: 'Relation au temps',
              before: 'Planification rigide',
              after: 'Flux adaptatif',
              progress: 78,
            },
            {
              theme: "Gestion de l'énergie",
              before: 'Effort constant',
              after: 'Rythmes naturels',
              progress: 85,
            },
            {
              theme: 'Prise de décision',
              before: 'Analyse exhaustive',
              after: 'Intuition informée',
              progress: 72,
            },
            {
              theme: 'Posture entrepreneuriale',
              before: 'Solo & contrôle',
              after: 'Écosystème & confiance',
              progress: 64,
            },
          ].map(line => (
            <div key={line.theme} className="bg-gray-900 p-4 rounded">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold">{line.theme}</h4>
                <span className="text-cyan-400 font-bold">{line.progress}%</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Avant</div>
                  <div className="text-sm text-red-400">{line.before}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Après</div>
                  <div className="text-sm text-green-400">{line.after}</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${line.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paliers Franchis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">
          🎯 Paliers Franchis (Changements Incarnés)
        </h3>
        <div className="space-y-3">
          {[
            {
              milestone: 'Architecture Systémique Maîtrisée',
              date: 'Déc 2025',
              desc: 'Capacité à fusionner 5 modules en un seul centre cohérent (EVO)',
            },
            {
              milestone: 'Mémoire Augmentée Opérationnelle',
              date: 'Nov 2025',
              desc: 'Utilisation fluide de la mémoire triple structurée',
            },
            {
              milestone: 'Multi-Temporalité Intégrée',
              date: 'Oct 2025',
              desc: 'Jonglage naturel entre court/moyen/long terme',
            },
            {
              milestone: 'Délégation Confiante',
              date: 'Sep 2025',
              desc: "Confiance dans l'automatisation des processus mémoire",
            },
          ].map((milestone, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold">{milestone.milestone}</h4>
                    <TBadge variant="success">{milestone.date}</TBadge>
                  </div>
                  <p className="text-sm text-gray-400">{milestone.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques d'Évolution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📈 Croissance Continue</h3>
          <div className="space-y-3">
            {[
              { metric: 'Complexité gérée', value: '+127%', period: '6 mois' },
              { metric: 'Vitesse exécution', value: '+89%', period: '6 mois' },
              { metric: 'Qualité décisions', value: '+76%', period: '6 mois' },
            ].map(m => (
              <div key={m.metric} className="flex justify-between items-center">
                <span className="text-gray-300">{m.metric}</span>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-lg">{m.value}</div>
                  <div className="text-xs text-gray-500">{m.period}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🔮 Capacités Émergentes</h3>
          <div className="space-y-2">
            {[
              'Vision systémique multi-niveaux',
              'Anticipation patterns comportementaux',
              'Synthèse créative complexe',
              'Orchestration automatisée',
            ].map((capability, i) => (
              <div key={i} className="bg-gray-900 p-3 rounded flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvoPage;
