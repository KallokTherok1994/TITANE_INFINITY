/**
 * TITANE_INFINITY v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — CENTRE D'ÉVOLUTION COGNITIVE (OPUS #4)
 *   Page unifiée: Progression + Knowledge + Evolution + Memory
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import { Container, Stack } from '@components/layout';
import { Card } from '../ui';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import { knowledgeVault } from '@/cognitive/knowledge/knowledgeVault';
import { evolutionEngine } from '@/cognitive/evolution/evolutionEngine';
import { MemoryEngine } from '@/cognitive/memory/memoryEngine';
import type {
  ProgressionState,
  KnowledgeVaultState,
  EvolutionState,
  MemoryState,
  EvolutionPhase,
} from '@/cognitive/types';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'progression' | 'knowledge' | 'evolution' | 'memory';

interface CognitiveStats {
  totalXP: number;
  level: number;
  knowledgeCount: number;
  memoriesCount: number;
  evolutionPhase: string;
}

// Phase display info
const phaseDisplayInfo: Record<EvolutionPhase, { icon: string; label: string }> = {
  nascent: { icon: '🌱', label: 'Naissant' },
  learning: { icon: '📚', label: 'Apprentissage' },
  adapting: { icon: '🔄', label: 'Adaptation' },
  optimizing: { icon: '⚡', label: 'Optimisation' },
  evolving: { icon: '🚀', label: 'Évolution' },
  singularity: { icon: '✨', label: 'Singularité' },
};

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: StatCardProps): JSX.Element {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        border: `1px solid ${color}40`,
        borderRadius: '12px',
        padding: 'var(--space-4)',
        minWidth: '150px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
        }}
      >
        <span
          style={{
            fontSize: '1.5rem',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}30`,
            borderRadius: '8px',
          }}
        >
          {icon}
        </span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {title}
        </span>
      </div>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', color }}>{value}</div>
      {subtitle && (
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
});

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
}

const ProgressBar = memo(function ProgressBar({
  value,
  max,
  color,
}: ProgressBarProps): JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '8px',
        background: 'var(--color-border-subtle)',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          width: `${Math.min((value / max) * 100, 100)}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
});

interface TabButtonProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

const TabButton = memo(function TabButton({
  label,
  icon,
  active,
  onClick,
}: TabButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-4)',
        background: active
          ? 'linear-gradient(135deg, var(--color-success-500)30, var(--color-success-500)20)'
          : 'transparent',
        border: active ? '1px solid var(--color-success-500)50' : '1px solid transparent',
        borderRadius: '8px',
        color: active ? 'var(--color-success-500)' : 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? '600' : '400',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────

function EvolutionCenterPageContent(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [progression, setProgression] = useState<ProgressionState | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeVaultState | null>(null);
  const [evolution, setEvolution] = useState<EvolutionState | null>(null);
  const [memory, setMemory] = useState<MemoryState | null>(null);
  const [stats, setStats] = useState<CognitiveStats>({
    totalXP: 0,
    level: 1,
    knowledgeCount: 0,
    memoriesCount: 0,
    evolutionPhase: 'Initialisation',
  });
  const [loading, setLoading] = useState(true);
  const { isLoaded: isIdentityMatrixLoaded } = useIdentityMatrix();
  const _singularityState = useSingularityStateSafe();

  // Initialize engines and fetch states
  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoading(true);

        // Get progression state
        const progressionState = xpEngine.getState();
        setProgression(progressionState);

        // Get knowledge state
        const knowledgeState = knowledgeVault.getState();
        setKnowledge(knowledgeState);

        // Get evolution state
        const evolutionState = evolutionEngine.getState();
        setEvolution(evolutionState);

        // Get memory state
        await MemoryEngine.initialize();
        const memoryState = MemoryEngine.getState();
        setMemory(memoryState);

        // Calculate combined stats
        const phaseInfo = phaseDisplayInfo[evolutionState.phase] || {
          label: evolutionState.phase,
        };

        setStats({
          totalXP: progressionState.totalXP,
          level: progressionState.level,
          knowledgeCount: knowledgeState.totalDocuments,
          memoriesCount: memoryState.stats.totalMemories,
          evolutionPhase: phaseInfo.label,
        });
      } catch (error) {
        console.error('[EvolutionCenter] Failed to load states:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStates();
  }, []);

  // Tab content renderers
  const renderOverview = useCallback(
    () => (
      <Stack gap={6}>
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <StatCard
            title="Niveau"
            value={stats.level}
            icon="📊"
            color={'var(--color-success-500)'}
            subtitle={'${stats.totalXP} XP total'}
          />
          <StatCard
            title="Connaissances"
            value={stats.knowledgeCount}
            icon="📚"
            color={'var(--color-info-500)'}
            subtitle="Documents indexés"
          />
          <StatCard
            title="Mémoires"
            value={stats.memoriesCount}
            icon="🧠"
            color={'var(--color-text-secondary)'}
            subtitle="Souvenirs actifs"
          />
          <StatCard
            title="Phase"
            value={stats.evolutionPhase}
            icon="🌱"
            color={'var(--color-success-500)'}
          />
        </div>

        {/* Progress Section */}
        {progression && (
          <Card title="Progression">
            <Stack gap={4}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  Niveau {progression.level}
                </span>
                <span
                  style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}
                >
                  {progression.xpInCurrentLevel} / {progression.xpToNextLevel} XP
                </span>
              </div>
              <ProgressBar
                value={progression.xpInCurrentLevel}
                max={progression.xpToNextLevel}
                color={'var(--color-success-500)'}
              />
            </Stack>
          </Card>
        )}

        {/* Quick Actions */}
        <Card title="Actions Rapides">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background:
                  'linear-gradient(135deg, var(--color-success-500), var(--color-success-700))',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
              }}
            >
              🎯 Définir Objectif
            </button>
            <button
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background:
                  'linear-gradient(135deg, var(--color-info-500), var(--color-border-default))',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
              }}
            >
              📖 Ajouter Connaissance
            </button>
            <button
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background:
                  'linear-gradient(135deg, var(--color-text-disabled), var(--color-border-default))',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
              }}
            >
              💾 Créer Mémoire
            </button>
          </div>
        </Card>
      </Stack>
    ),
    [stats, progression]
  );

  const renderProgression = useCallback(
    () => (
      <Stack gap={6}>
        <Card title="Système de Progression">
          {progression ? (
            <Stack gap={4}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <StatCard
                  title="XP Total"
                  value={progression.totalXP.toLocaleString()}
                  icon="⭐"
                  color={'var(--color-success-500)'}
                />
                <StatCard
                  title="Niveau"
                  value={progression.level}
                  icon="📈"
                  color={'var(--color-info-500)'}
                />
                <StatCard
                  title="Streak"
                  value={'${progression.streakDays} jours'}
                  icon="🔥"
                  color={'var(--color-text-secondary)'}
                />
              </div>

              {/* XP Progress */}
              <div
                style={{
                  background: 'var(--color-bg-primary)',
                  padding: 'var(--space-4)',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Niveau {progression.level}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {Math.round(
                      (progression.xpInCurrentLevel / progression.xpToNextLevel) * 100
                    )}
                    %
                  </span>
                </div>
                <ProgressBar
                  value={progression.xpInCurrentLevel}
                  max={progression.xpToNextLevel}
                  color={'var(--color-success-500)'}
                />
                <div
                  style={{
                    marginTop: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {progression.xpToNextLevel - progression.xpInCurrentLevel} XP
                  jusqu&apos;au niveau {progression.level + 1}
                </div>
              </div>

              {/* Milestones Preview */}
              <div>
                <h4
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-3)',
                    margin: '0 0 var(--space-3) 0',
                  }}
                >
                  🏆 Jalons Récents
                </h4>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {progression.milestones.slice(0, 5).map(milestone => (
                    <div
                      key={milestone.id}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: milestone.unlockedAt
                          ? 'linear-gradient(135deg, var(--color-success-500)30, var(--color-success-700)20)'
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
                      <span>{milestone.icon}</span>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: milestone.unlockedAt
                            ? 'var(--color-text-secondary)'
                            : 'var(--color-text-muted)',
                        }}
                      >
                        {milestone.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Stack>
          ) : (
            <div
              style={{
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: 'var(--space-6)',
              }}
            >
              Chargement de la progression...
            </div>
          )}
        </Card>
      </Stack>
    ),
    [progression]
  );

  const renderKnowledge = useCallback(
    () => (
      <Stack gap={6}>
        <Card title="Coffre de Connaissances">
          {knowledge ? (
            <Stack gap={4}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <StatCard
                  title="Documents"
                  value={knowledge.totalDocuments}
                  icon="📄"
                  color={'var(--color-info-500)'}
                />
                <StatCard
                  title="Taille Totale"
                  value={'${Math.round(knowledge.totalSizeBytes / 1024)} KB'}
                  icon="💾"
                  color={'var(--color-success-500)'}
                />
                <StatCard
                  title="Catégories"
                  value={Object.keys(knowledge.categoryCounts).length}
                  icon="📁"
                  color={'var(--color-text-secondary)'}
                />
              </div>

              {/* Category Distribution */}
              <div>
                <h4
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-3)',
                    margin: '0 0 var(--space-3) 0',
                  }}
                >
                  📁 Répartition par Catégorie
                </h4>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {Object.entries(knowledge.categoryCounts)
                    .filter(([, count]) => count > 0)
                    .map(([category, count]) => (
                      <div
                        key={category}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          background: 'var(--color-border-subtle)',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: '6px',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <span>{category}</span>
                        <span
                          style={{
                            background: 'var(--color-info-500)' + '30',
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: '4px',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-info-500)',
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Entries */}
              <div>
                <h4
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-3)',
                    margin: '0 0 var(--space-3) 0',
                  }}
                >
                  📝 Entrées Récentes
                </h4>
                {knowledge.entries.length > 0 ? (
                  <Stack gap={2}>
                    {knowledge.entries.slice(0, 5).map(entry => (
                      <div
                        key={entry.id}
                        style={{
                          padding: 'var(--space-3)',
                          background: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: 'var(--color-text-secondary)',
                              fontSize: 'var(--text-sm)',
                            }}
                          >
                            {entry.title}
                          </div>
                          <div
                            style={{
                              color: 'var(--color-text-muted)',
                              fontSize: 'var(--text-xs)',
                            }}
                          >
                            {entry.category} •{' '}
                            {new Date(entry.indexedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            background: 'var(--color-success-500)20',
                            borderRadius: '4px',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-success-500)',
                          }}
                        >
                          {entry.status}
                        </div>
                      </div>
                    ))}
                  </Stack>
                ) : (
                  <div
                    style={{
                      padding: 'var(--space-6)',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-primary)',
                      borderRadius: '8px',
                    }}
                  >
                    Aucun document indexé. Commencez à ajouter des connaissances !
                  </div>
                )}
              </div>
            </Stack>
          ) : (
            <div
              style={{
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: 'var(--space-6)',
              }}
            >
              Chargement des connaissances...
            </div>
          )}
        </Card>
      </Stack>
    ),
    [knowledge]
  );

  const renderEvolution = useCallback(
    () => (
      <Stack gap={6}>
        <Card title="Système d'Évolution">
          {evolution ? (
            <Stack gap={4}>
              {/* Current Phase */}
              <div
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-success-500)20, var(--color-success-700)10)',
                  border: '1px solid var(--color-success-500)40',
                  borderRadius: '12px',
                  padding: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>
                    {phaseDisplayInfo[evolution.phase]?.icon || '🌱'}
                  </span>
                  <div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--text-lg)',
                        fontWeight: '600',
                      }}
                    >
                      Phase: {phaseDisplayInfo[evolution.phase]?.label || evolution.phase}
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      Version {evolution.version}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <StatCard
                  title="Cycles"
                  value={evolution.totalCycles}
                  icon="🔄"
                  color={'var(--color-success-500)'}
                />
                <StatCard
                  title="Mutations"
                  value={evolution.totalMutations}
                  icon="🧬"
                  color={'var(--color-info-500)'}
                />
                <StatCard
                  title="Stabilité"
                  value={'${Math.round(evolution.currentMetrics.stability * 100)}%'}
                  icon="⚖️"
                  color={'var(--color-text-secondary)'}
                />
              </div>

              {/* Metrics */}
              <div
                style={{
                  background: 'var(--color-bg-primary)',
                  padding: 'var(--space-4)',
                  borderRadius: '12px',
                }}
              >
                <h4
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-3)',
                    margin: '0 0 var(--space-3) 0',
                  }}
                >
                  📊 Métriques Actuelles
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        Cohérence
                      </span>
                      <span
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        {Math.round(evolution.currentMetrics.coherence * 100)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={evolution.currentMetrics.coherence * 100}
                      max={100}
                      color={'var(--color-success-500)'}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        Performance
                      </span>
                      <span
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        {Math.round(evolution.currentMetrics.performance * 100)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={evolution.currentMetrics.performance * 100}
                      max={100}
                      color={'var(--color-info-500)'}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        Profondeur Cognitive
                      </span>
                      <span
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        {Math.round(evolution.currentMetrics.cognitiveDepth * 100)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={evolution.currentMetrics.cognitiveDepth * 100}
                      max={100}
                      color={'var(--color-text-secondary)'}
                    />
                  </div>
                </div>
              </div>
            </Stack>
          ) : (
            <div
              style={{
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: 'var(--space-6)',
              }}
            >
              Chargement de l&apos;évolution...
            </div>
          )}
        </Card>
      </Stack>
    ),
    [evolution]
  );

  const renderMemory = useCallback(
    () => (
      <Stack gap={6}>
        <Card title="Système de Mémoire">
          {memory ? (
            <Stack gap={4}>
              {/* Memory Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <StatCard
                  title="Mémoires Totales"
                  value={memory.stats.totalMemories}
                  icon="🧠"
                  color={'var(--color-success-500)'}
                />
                <StatCard
                  title="Court Terme"
                  value={memory.stats.shortTermCount}
                  icon="⚡"
                  color={'var(--color-info-500)'}
                />
                <StatCard
                  title="Long Terme"
                  value={memory.stats.longTermCount}
                  icon="💾"
                  color={'var(--color-text-secondary)'}
                />
              </div>

              {/* Memory Type Distribution */}
              <div
                style={{
                  background: 'var(--color-bg-primary)',
                  padding: 'var(--space-4)',
                  borderRadius: '12px',
                }}
              >
                <h4
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-3)',
                    margin: '0 0 var(--space-3) 0',
                  }}
                >
                  🧠 Types de Mémoire
                </h4>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--color-border-subtle)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <span>📖</span>
                    <span
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      Épisodique: {memory.stats.episodicCount}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--color-border-subtle)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <span>🔤</span>
                    <span
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      Sémantique: {memory.stats.semanticCount}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--color-border-subtle)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <span>⚙️</span>
                    <span
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      Procédurale: {memory.stats.proceduralCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Memories */}
              <div>
                <h4
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-3)',
                    margin: '0 0 var(--space-3) 0',
                  }}
                >
                  💭 Mémoires Récentes
                </h4>
                {memory.memories.length > 0 ? (
                  <Stack gap={2}>
                    {memory.memories.slice(0, 5).map(mem => (
                      <div
                        key={mem.id}
                        style={{
                          padding: 'var(--space-3)',
                          background: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 'var(--space-2)',
                          }}
                        >
                          <div
                            style={{
                              color: 'var(--color-text-secondary)',
                              fontSize: 'var(--text-sm)',
                              flex: 1,
                            }}
                          >
                            {mem.content.substring(0, 100)}
                            {mem.content.length > 100 ? '...' : ''}
                          </div>
                          <div
                            style={{
                              padding: 'var(--space-1) var(--space-2)',
                              background:
                                mem.type === 'short-term'
                                  ? 'var(--color-info-500)20'
                                  : 'var(--color-success-500)20',
                              borderRadius: '4px',
                              fontSize: 'var(--text-xs)',
                              color:
                                mem.type === 'short-term'
                                  ? 'var(--color-info-500)'
                                  : 'var(--color-success-500)',
                              marginLeft: 'var(--space-2)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {mem.type}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 'var(--space-3)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          <span>Importance: {Math.round(mem.importance * 100)}%</span>
                          <span>Force: {Math.round(mem.strength * 100)}%</span>
                          <span>Accès: {mem.accessCount}x</span>
                        </div>
                      </div>
                    ))}
                  </Stack>
                ) : (
                  <div
                    style={{
                      padding: 'var(--space-6)',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-primary)',
                      borderRadius: '8px',
                    }}
                  >
                    Aucune mémoire active. Les interactions seront enregistrées
                    automatiquement.
                  </div>
                )}
              </div>

              {/* Memory Stats Footer */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-primary)',
                  borderRadius: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                >
                  Force moyenne:{' '}
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {Math.round(memory.stats.averageStrength * 100)}%
                  </span>
                </div>
                <div
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                >
                  Taux consolidation:{' '}
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {Math.round(memory.stats.consolidationRate * 100)}%
                  </span>
                </div>
                <div
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                >
                  Total rappels:{' '}
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {memory.stats.totalRecalls}
                  </span>
                </div>
              </div>
            </Stack>
          ) : (
            <div
              style={{
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: 'var(--space-6)',
              }}
            >
              Chargement des mémoires...
            </div>
          )}
        </Card>
      </Stack>
    ),
    [memory]
  );

  // Tab content mapping
  const tabContent: Record<TabId, () => React.ReactElement> = {
    overview: renderOverview,
    progression: renderProgression,
    knowledge: renderKnowledge,
    evolution: renderEvolution,
    memory: renderMemory,
  };

  const matrixLoading = !isIdentityMatrixLoaded;
  if (loading || matrixLoading) {
    return (
      <Container
        size="xl"
        style={{
          paddingTop: 'var(--space-6)',
          paddingBottom: 'var(--space-6)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-text-muted)' }}>
          🔄 Chargement du Centre d&apos;Évolution...
        </div>
      </Container>
    );
  }

  return (
    <Container
      size="xl"
      style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}
    >
      <Stack gap={6}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--text-3xl)',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🧠</span>
            Centre d&apos;Évolution Cognitive
          </h1>
          <p
            style={{
              margin: 'var(--space-2) 0 0',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-base)',
            }}
          >
            OPUS #4 — Fusion Progression + Knowledge + Evolution + Memory
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            padding: 'var(--space-2)',
            background: 'var(--color-bg-primary)',
            borderRadius: '12px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <TabButton
            label="Vue d'ensemble"
            icon="📊"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            label="Progression"
            icon="⭐"
            active={activeTab === 'progression'}
            onClick={() => setActiveTab('progression')}
          />
          <TabButton
            label="Connaissances"
            icon="📚"
            active={activeTab === 'knowledge'}
            onClick={() => setActiveTab('knowledge')}
          />
          <TabButton
            label="Évolution"
            icon="🌱"
            active={activeTab === 'evolution'}
            onClick={() => setActiveTab('evolution')}
          />
          <TabButton
            label="Mémoire"
            icon="🧠"
            active={activeTab === 'memory'}
            onClick={() => setActiveTab('memory')}
          />
        </div>

        {/* Tab Content */}
        {tabContent[activeTab]()}
      </Stack>
    </Container>
  );
}

// Export with ErrorBoundary
export const EvolutionCenterPage: React.FC = () => {
  return (
    <ErrorBoundary context="EvolutionCenter">
      <EvolutionCenterPageContent />
    </ErrorBoundary>
  );
};

export default EvolutionCenterPage;
