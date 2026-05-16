/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * @deprecated Legacy page kept for compatibility.
 * Active canonical evolution experience is /titane (tabs: overview/progression/transformation).
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 — EVO — CENTRE D'ÉVOLUTION TOTALE
 *
 * Fusion ultime de 5 modules en un seul centre hyper-puissant:
 * - Tableau de bord (métriques système, stats)
 * - Évolution Cognitive (XP, progression, talents)
 * - TWINS (jumeau numérique, matrice, modes, pacte)
 * - Mémoire Évolutive (opérations auto, journal)
 * - Mémoire (court/moyen/long terme)
 *
 * 5 SECTIONS UNIFIÉES:
 * 📊 Vue d&apos;Ensemble - Dashboard + Stats système
 * 🧬 TWINS — Jumeau numérique, mes modes, mon pacte
 * 💾 Mémoire Triple - Architecture court/moyen/long terme
 * ⚡ Progression & XP - Système XP + Milestones + Talents
 * 🌱 Transform & Évolution - Transformation + Évolution mémoire fusionnées
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Container } from '@components/layout/Container';
import { Stack } from '@components/layout/Stack';
import { Grid } from '@components/layout/Grid';
import { Card } from '../ui';
import { XPProgressBar } from '@features/progression';
import { PersonaMoodIndicator } from '@components/PersonaMoodIndicator';
import { useVisualEngines } from '@hooks/useVisualEngines';
import { TitaneLogo } from '@components/branding/TitaneLogo';
import { TBadge, TMetric, TSectionHeader } from '../design-system';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import { Settings, TrendingUp, Brain, Database, Sprout } from 'lucide-react';
import type { ProgressionState } from '@/cognitive/types';
import { tauriClient } from '@/lib/tauriClient';
import type { MemoryStats } from '@/services/memory/persistentMemory.config';
import { normalizePersistentMemoryStats } from '@/services/memory/persistentMemory.normalize';
import { SurfaceTruthBadge } from '@/components/system/SurfaceTruthBadge';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TabId = 'overview' | 'twins' | 'memory-map' | 'progression' | 'transformation';

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
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
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

  // Chargement stats mémoire
  useEffect(() => {
    const loadMemoryStats = async () => {
      try {
        const stats = normalizePersistentMemoryStats(
          await tauriClient.persistentMemoryGetStats()
        ) as MemoryStats;
        setMemoryStats(stats);
      } catch {
        // Non-blocking: fallback → 0
      }
    };
    loadMemoryStats();
  }, []);

  // Stats calculées
  const stats: EvoStats = useMemo(
    () => ({
      totalXP: progression?.totalXP || 193000,
      level: progression?.level || 19,
      memoryShortTerm: memoryStats?.countByLevel['session'] ?? 0,
      memoryMidTerm: memoryStats?.countByLevel['intermediate'] ?? 0,
      memoryLongTerm: memoryStats?.countByLevel['long_term'] ?? 0,
      evolutionScore: 87,
    }),
    [progression, memoryStats]
  );

  return (
    <ErrorBoundary context="EvoPage">
      <Container size="xl">
        <Stack direction="vertical" gap={6}>
          <SurfaceTruthBadge variant={memoryStats != null ? 'LIVE' : 'PARTIAL'} />
          {/* ═══ HEADER ═══ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <TitaneLogo size={56} />
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '3rem',
                    fontWeight: '700',
                    background:
                      'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  🧬 EVO — Centre d&apos;Évolution Totale
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Fusion ultime: Dashboard + TWINS + Mémoire + Évolution + Progression
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
              gap: 'var(--space-2)',
              borderBottom: '2px solid var(--color-border-subtle)',
              paddingBottom: 'var(--space-2)',
              overflowX: 'auto',
              flexWrap: 'nowrap',
            }}
          >
            {[
              { id: 'overview', label: '📊 Vue d&apos;Ensemble', icon: TrendingUp },
              { id: 'twins', label: '🧬 TWINS', icon: Brain },
              { id: 'memory-map', label: '💾 Mémoire Triple', icon: Database },
              { id: 'progression', label: '⚡ Progression & XP', icon: TrendingUp },
              { id: 'transformation', label: '🌱 Transform & Évo', icon: Sprout },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  style={{
                    padding: 'var(--space-3) var(--space-5)',
                    background:
                      activeTab === tab.id
                        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                        : 'var(--color-border-subtle)',
                    border: 'none',
                    borderRadius: '12px 12px 0 0',
                    color: activeTab === tab.id ? 'white' : 'var(--color-text-muted)',
                    fontWeight: activeTab === tab.id ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    whiteSpace: 'nowrap',
                    fontSize: 'var(--text-sm)',
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
            {activeTab === 'twins' && <EvoTwinsSection />}
            {activeTab === 'memory-map' && <MemoryMapSection stats={stats} />}
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
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}
            >
              294 Modules
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
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
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}
            >
              407 Commandes
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
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
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}
            >
              355 Fichiers
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
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
          value={`${progression?.milestones?.filter(m => m.unlockedAt).length || 0}`}
          icon="🎯"
        />
      </Grid>

      {/* Quick Stats Cards */}
      <Grid columns={2} gap={4}>
        <Card variant="glass" elevation="md">
          <h3
            style={{
              margin: '0 0 var(--space-4) 0',
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            🧠 État Cognitif
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Créativité</span>
              <span style={{ color: 'var(--color-success-500)', fontWeight: '700' }}>
                92%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Rigueur</span>
              <span style={{ color: 'var(--color-info-500)', fontWeight: '700' }}>
                88%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Empathie</span>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '700' }}>
                85%
              </span>
            </div>
          </div>
        </Card>

        <Card variant="glass" elevation="md">
          <h3
            style={{
              margin: '0 0 var(--space-4) 0',
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            💾 Distribution Mémoire
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Court Terme</span>
              <span style={{ color: 'var(--color-success-500)', fontWeight: '700' }}>
                {stats.memoryShortTerm}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Moyen Terme</span>
              <span style={{ color: 'var(--color-info-500)', fontWeight: '700' }}>
                {stats.memoryMidTerm.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Long Terme</span>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '700' }}>
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
// SECTION 2: TWINS — Jumeau Numérique
// ═══════════════════════════════════════════════════════════════════════════

const EvoTwinsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <TSectionHeader
        title="TWINS — Jumeau Numérique & ADN"
        subtitle="Matrice identitaire, valeurs, rôles, modes de fonctionnement — Synchronisé avec Kevin"
      />

      {/* Matrice Identitaire */}
      <div className="bg-titanium-bg-elevated rounded-lg p-6">
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
            <div
              key={dim.dimension}
              className="bg-titanium-bg-base p-4 rounded text-center"
            >
              <div className="text-2xl font-bold text-cyan-400">
                {(dim.value * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-titanium-text-tertiary mt-2">
                {dim.dimension}
              </div>
              <div className="w-full bg-titanium-bg-interactive rounded-full h-2 mt-3">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${dim.value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valeurs Fondamentales */}
      <div className="bg-titanium-bg-elevated rounded-lg p-6">
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
            <div key={val.value} className="bg-titanium-bg-base p-4 rounded">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{val.icon}</span>
                <div>
                  <h4 className="font-bold text-lg mb-1">{val.value}</h4>
                  <p className="text-sm text-titanium-text-tertiary">{val.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modes de Fonctionnement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-titanium-bg-elevated rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎭 Modes de Fonctionnement</h3>
          <div className="space-y-3">
            {[
              { mode: 'Architecte Systèmes', active: true, usage: 45 },
              { mode: 'Coach Stratégique', active: false, usage: 25 },
              { mode: 'Créateur de Contenu', active: false, usage: 18 },
              { mode: 'Analyste Profond', active: false, usage: 12 },
            ].map(mode => (
              <div key={mode.mode} className="bg-titanium-bg-base p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{mode.mode}</span>
                  <TBadge variant={mode.active ? 'success' : 'default'}>
                    {mode.active ? 'ACTIF' : 'Idle'}
                  </TBadge>
                </div>
                <div className="w-full bg-titanium-bg-interactive rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${mode.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-titanium-bg-elevated rounded-lg p-6">
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

      {/* Vue d&apos;ensemble */}
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
        <div className="bg-titanium-bg-elevated rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">⚡ Court Terme (Contexte Vivant)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-titanium-text-secondary">
                Sessions Récentes
              </h4>
              <div className="space-y-2">
                {[
                  { title: 'Fusion modules UI → EVO', time: '2h ago', size: '34 items' },
                  { title: 'Architecture v25', time: '5h ago', size: '28 items' },
                  { title: 'Tests backend', time: '1d ago', size: '42 items' },
                ].map((session, i) => (
                  <div
                    key={i}
                    className="bg-titanium-bg-base p-3 rounded flex justify-between"
                  >
                    <div>
                      <div className="font-semibold">{session.title}</div>
                      <div className="text-sm text-titanium-text-tertiary">
                        {session.time}
                      </div>
                    </div>
                    <div className="text-sm text-titanium-text-tertiary">
                      {session.size}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-titanium-text-secondary">
                Capacité
              </h4>
              <div className="bg-titanium-bg-base p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-titanium-text-tertiary">Utilisé</span>
                  <span className="text-cyan-400 font-bold">
                    {stats.memoryShortTerm} / 500
                  </span>
                </div>
                <div className="w-full bg-titanium-bg-interactive rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-linear-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${(stats.memoryShortTerm / 500) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moyen Terme */}
        <div className="bg-titanium-bg-elevated rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Moyen Terme (Contexte Structuré)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { theme: 'UI/UX', count: 287 },
              { theme: 'Architecture', count: 254 },
              { theme: 'Backend', count: 198 },
              { theme: 'Frontend', count: 176 },
              { theme: 'IA & Cognition', count: 917 },
            ].map(theme => (
              <div
                key={theme.theme}
                className="bg-titanium-bg-base p-3 rounded text-center"
              >
                <div className="text-2xl font-bold text-cyan-400">{theme.count}</div>
                <div className="text-sm text-titanium-text-tertiary">{theme.theme}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Long Terme */}
        <div className="bg-titanium-bg-elevated rounded-lg p-6">
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
              <div key={pillar.pillar} className="bg-titanium-bg-base p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold">{pillar.pillar}</h4>
                    <p className="text-sm text-titanium-text-tertiary">{pillar.desc}</p>
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
// SECTION 4: PROGRESSION & XP (renumerotée après fusion Évolution → Transform)
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
                    fontSize: 'var(--text-2xl)',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {progression.totalXP.toLocaleString()}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
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
                    fontSize: 'var(--text-2xl)',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Niveau {progression.level}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
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
                    fontSize: 'var(--text-2xl)',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {progression.streakDays} jours
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
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
                margin: '0 0 var(--space-4) 0',
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}
            >
              🏆 Jalons Récents
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {progression.milestones.slice(0, 8).map(milestone => (
                <div
                  key={milestone.id}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: milestone.unlockedAt
                      ? 'linear-gradient(135deg, #10b98130, #10b98120)'
                      : 'var(--color-border-subtle)',
                    border: milestone.unlockedAt
                      ? '1px solid var(--color-success-500)40'
                      : '1px solid var(--color-border-default)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{milestone.icon}</span>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: milestone.unlockedAt
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-text-muted)',
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
                margin: '0 0 var(--space-4) 0',
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}
            >
              🎯 Talents Débloqués
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              {progression.milestones
                .filter(m => m.unlockedAt)
                .slice(0, 6)
                .map(milestone => (
                  <div
                    key={milestone.id}
                    style={{
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, #3b82f630, #8b5cf620)',
                      border: '1px solid var(--color-info-500)40',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: '600',
                      }}
                    >
                      {milestone.icon} {milestone.name}
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
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: 'var(--space-6)',
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
// SECTION 5: TRANSFORM & ÉVOLUTION (fusion Transformation + Évolution mémoire)
// ═══════════════════════════════════════════════════════════════════════════

const TransformationSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <TSectionHeader
        title="Transform & Évolution"
        subtitle="Transformation cognitive + Évolution mémoire — fusionnées"
      />

      {/* Lignes d'Évolution */}
      <div className="bg-titanium-bg-elevated rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">🌱 Lignes d&apos;Évolution par Thème</h3>
        <div className="space-y-4">
          {[
            {
              theme: 'Relation au temps',
              before: 'Planification rigide',
              after: 'Flux adaptatif',
              progress: 78,
            },
            {
              theme: 'Gestion de l&apos;énergie',
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
            <div key={line.theme} className="bg-titanium-bg-base p-4 rounded">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold">{line.theme}</h4>
                <span className="text-cyan-400 font-bold">{line.progress}%</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-titanium-text-disabled mb-1">Avant</div>
                  <div className="text-sm text-red-400">{line.before}</div>
                </div>
                <div>
                  <div className="text-xs text-titanium-text-disabled mb-1">Après</div>
                  <div className="text-sm text-green-400">{line.after}</div>
                </div>
              </div>
              <div className="w-full bg-titanium-bg-interactive rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-linear-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${line.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paliers Franchis */}
      <div className="bg-titanium-bg-elevated rounded-lg p-6">
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
              desc: 'Confiance dans l&apos;automatisation des processus mémoire',
            },
          ].map((milestone, i) => (
            <div key={i} className="bg-titanium-bg-base p-4 rounded">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold">{milestone.milestone}</h4>
                    <TBadge variant="success">{milestone.date}</TBadge>
                  </div>
                  <p className="text-sm text-titanium-text-tertiary">{milestone.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques d'Évolution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-titanium-bg-elevated rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📈 Croissance Continue</h3>
          <div className="space-y-3">
            {[
              { metric: 'Complexité gérée', value: '+127%', period: '6 mois' },
              { metric: 'Vitesse exécution', value: '+89%', period: '6 mois' },
              { metric: 'Qualité décisions', value: '+76%', period: '6 mois' },
            ].map(m => (
              <div key={m.metric} className="flex justify-between items-center">
                <span className="text-titanium-text-secondary">{m.metric}</span>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-lg">{m.value}</div>
                  <div className="text-xs text-titanium-text-disabled">{m.period}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-titanium-bg-elevated rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🔮 Capacités Émergentes</h3>
          <div className="space-y-2">
            {[
              'Vision systémique multi-niveaux',
              'Anticipation patterns comportementaux',
              'Synthèse créative complexe',
              'Orchestration automatisée',
            ].map((capability, i) => (
              <div
                key={i}
                className="bg-titanium-bg-base p-3 rounded flex items-center gap-2"
              >
                <span className="text-green-400">✓</span>
                <span className="text-sm">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ÉVOLUTION MÉMOIRE (fusionnée depuis Section 4) ═══ */}

      {/* Opérations Automatiques */}
      <div className="bg-titanium-bg-elevated rounded-lg p-6">
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
            <div key={op.operation} className="bg-titanium-bg-base p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">{op.operation}</h4>
                <TBadge variant={op.status === 'Actif' ? 'success' : 'warning'}>
                  {op.status}
                </TBadge>
              </div>
              <div className="text-sm text-titanium-text-tertiary space-y-1">
                <div>Fréquence: {op.frequency}</div>
                <div>Dernier: {op.lastRun}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journal d'Évolution */}
      <div className="bg-titanium-bg-elevated rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">📜 Journal d&apos;Évolution Mémoire</h3>
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
            <div key={i} className="bg-titanium-bg-base p-4 rounded">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold">{event.event}</h4>
                  <p className="text-sm text-titanium-text-tertiary mt-1">{event.desc}</p>
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
              <div className="text-xs text-titanium-text-disabled mt-2">{event.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Paramètres Memory Core */}
      <div className="bg-titanium-bg-elevated rounded-lg p-6">
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
                  <div className="text-sm text-titanium-text-tertiary">{param.desc}</div>
                </div>
                <div className="text-cyan-400 font-bold">
                  {(param.value * 100).toFixed(0)}%
                </div>
              </div>
              <div className="w-full bg-titanium-bg-interactive rounded-full h-2">
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

export default EvoPage;
