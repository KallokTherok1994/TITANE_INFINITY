/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — CENTRE D'ÉVOLUTION COGNITIVE (OPUS #4)
 *   Page unifiée: Progression + Knowledge + Evolution + Memory
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { Container, Stack } from '@components/layout';
import { Card } from '../ui';
import { colors, spacing, fontSizes, fontWeights } from '@themes/tokens';
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

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div style={{
    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
    border: `1px solid ${color}40`,
    borderRadius: '12px',
    padding: spacing[4],
    minWidth: '150px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
      <span style={{
        fontSize: '1.5rem',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}30`,
        borderRadius: '8px',
      }}>
        {icon}
      </span>
      <span style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>{title}</span>
    </div>
    <div style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color }}>{value}</div>
    {subtitle && (
      <div style={{ fontSize: fontSizes.xs, color: colors.neutral[500], marginTop: spacing[1] }}>{subtitle}</div>
    )}
  </div>
);

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color }) => (
  <div style={{ width: '100%', height: '8px', background: colors.neutral[800], borderRadius: '4px' }}>
    <div style={{
      width: `${Math.min((value / max) * 100, 100)}%`,
      height: '100%',
      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    }} />
  </div>
);

interface TabButtonProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[2]} ${spacing[4]}`,
      background: active
        ? `linear-gradient(135deg, ${colors.emeraude.primary[500]}30, ${colors.emeraude.primary[600]}20)`
        : 'transparent',
      border: active ? `1px solid ${colors.emeraude.primary[500]}50` : '1px solid transparent',
      borderRadius: '8px',
      color: active ? colors.emeraude.primary[400] : colors.neutral[400],
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: fontSizes.sm,
      fontWeight: active ? fontWeights.semibold : fontWeights.normal,
    }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────

export const EvolutionCenterPage: React.FC = () => {
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

  // Initialize engines and fetch states
  useEffect(() => {
    const loadStates = async () => {
      try {
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
        const memoryState = MemoryEngine.getState();
        setMemory(memoryState);

        // Calculate combined stats
        const phaseInfo = phaseDisplayInfo[evolutionState.phase] || { label: evolutionState.phase };

        setStats({
          totalXP: progressionState.totalXP,
          level: progressionState.level,
          knowledgeCount: knowledgeState.totalDocuments,
          memoriesCount: memoryState.stats.totalMemories,
          evolutionPhase: phaseInfo.label,
        });
      } catch (error) {
        console.error('[EvolutionCenter] Failed to load states:', error);
      }
    };

    loadStates();
  }, []);

  // Tab content renderers
  const renderOverview = useCallback(() => (
    <Stack gap={6}>
      {/* Stats Row */}
      <div style={{ display: 'flex', gap: spacing[4], flexWrap: 'wrap' }}>
        <StatCard
          title="Niveau"
          value={stats.level}
          icon="📊"
          color={colors.emeraude.primary[500]}
          subtitle={`${stats.totalXP} XP total`}
        />
        <StatCard
          title="Connaissances"
          value={stats.knowledgeCount}
          icon="📚"
          color={colors.saphir.primary[500]}
          subtitle="Documents indexés"
        />
        <StatCard
          title="Mémoires"
          value={stats.memoriesCount}
          icon="🧠"
          color={colors.rubis.primary[500]}
          subtitle="Souvenirs actifs"
        />
        <StatCard
          title="Phase"
          value={stats.evolutionPhase}
          icon="🌱"
          color={colors.emeraude.primary[400]}
        />
      </div>

      {/* Progress Section */}
      {progression && (
        <Card title="Progression">
          <Stack gap={4}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: colors.neutral[300], fontSize: fontSizes.sm }}>
                Niveau {progression.level}
              </span>
              <span style={{ color: colors.neutral[500], fontSize: fontSizes.xs }}>
                {progression.xpInCurrentLevel} / {progression.xpToNextLevel} XP
              </span>
            </div>
            <ProgressBar
              value={progression.xpInCurrentLevel}
              max={progression.xpToNextLevel}
              color={colors.emeraude.primary[500]}
            />
          </Stack>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Actions Rapides">
        <div style={{ display: 'flex', gap: spacing[3], flexWrap: 'wrap' }}>
          <button style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: `linear-gradient(135deg, ${colors.emeraude.primary[600]}, ${colors.emeraude.primary[700]})`,
            border: 'none',
            borderRadius: '8px',
            color: colors.neutral[100],
            cursor: 'pointer',
            fontSize: fontSizes.sm,
          }}>
            🎯 Définir Objectif
          </button>
          <button style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: `linear-gradient(135deg, ${colors.saphir.primary[600]}, ${colors.saphir.primary[700]})`,
            border: 'none',
            borderRadius: '8px',
            color: colors.neutral[100],
            cursor: 'pointer',
            fontSize: fontSizes.sm,
          }}>
            📖 Ajouter Connaissance
          </button>
          <button style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: `linear-gradient(135deg, ${colors.rubis.primary[600]}, ${colors.rubis.primary[700]})`,
            border: 'none',
            borderRadius: '8px',
            color: colors.neutral[100],
            cursor: 'pointer',
            fontSize: fontSizes.sm,
          }}>
            💾 Créer Mémoire
          </button>
        </div>
      </Card>
    </Stack>
  ), [stats, progression]);

  const renderProgression = useCallback(() => (
    <Stack gap={6}>
      <Card title="Système de Progression">
        {progression ? (
          <Stack gap={4}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: spacing[4],
            }}>
              <StatCard
                title="XP Total"
                value={progression.totalXP.toLocaleString()}
                icon="⭐"
                color={colors.emeraude.primary[500]}
              />
              <StatCard
                title="Niveau"
                value={progression.level}
                icon="📈"
                color={colors.saphir.primary[500]}
              />
              <StatCard
                title="Streak"
                value={`${progression.streakDays} jours`}
                icon="🔥"
                color={colors.rubis.primary[500]}
              />
            </div>

            {/* XP Progress */}
            <div style={{
              background: colors.neutral[900],
              padding: spacing[4],
              borderRadius: '12px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: spacing[2],
              }}>
                <span style={{ color: colors.neutral[300] }}>Niveau {progression.level}</span>
                <span style={{ color: colors.neutral[500] }}>
                  {Math.round((progression.xpInCurrentLevel / progression.xpToNextLevel) * 100)}%
                </span>
              </div>
              <ProgressBar
                value={progression.xpInCurrentLevel}
                max={progression.xpToNextLevel}
                color={colors.emeraude.primary[500]}
              />
              <div style={{
                marginTop: spacing[2],
                fontSize: fontSizes.xs,
                color: colors.neutral[500],
              }}>
                {progression.xpToNextLevel - progression.xpInCurrentLevel} XP jusqu'au niveau {progression.level + 1}
              </div>
            </div>

            {/* Milestones Preview */}
            <div>
              <h4 style={{ color: colors.neutral[300], marginBottom: spacing[3], margin: `0 0 ${spacing[3]} 0` }}>
                🏆 Jalons Récents
              </h4>
              <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                {progression.milestones.slice(0, 5).map((milestone) => (
                  <div key={milestone.id} style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    background: milestone.unlockedAt
                      ? `linear-gradient(135deg, ${colors.emeraude.primary[600]}30, ${colors.emeraude.primary[700]}20)`
                      : colors.neutral[800],
                    border: milestone.unlockedAt
                      ? `1px solid ${colors.emeraude.primary[500]}40`
                      : `1px solid ${colors.neutral[700]}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}>
                    <span>{milestone.icon}</span>
                    <span style={{
                      fontSize: fontSizes.xs,
                      color: milestone.unlockedAt ? colors.neutral[200] : colors.neutral[500],
                    }}>
                      {milestone.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Stack>
        ) : (
          <div style={{ color: colors.neutral[500], textAlign: 'center', padding: spacing[6] }}>
            Chargement de la progression...
          </div>
        )}
      </Card>
    </Stack>
  ), [progression]);

  const renderKnowledge = useCallback(() => (
    <Stack gap={6}>
      <Card title="Coffre de Connaissances">
        {knowledge ? (
          <Stack gap={4}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: spacing[4],
            }}>
              <StatCard
                title="Documents"
                value={knowledge.totalDocuments}
                icon="📄"
                color={colors.saphir.primary[500]}
              />
              <StatCard
                title="Taille Totale"
                value={`${Math.round(knowledge.totalSizeBytes / 1024)} KB`}
                icon="💾"
                color={colors.emeraude.primary[500]}
              />
              <StatCard
                title="Catégories"
                value={Object.keys(knowledge.categoryCounts).length}
                icon="📁"
                color={colors.rubis.primary[500]}
              />
            </div>

            {/* Category Distribution */}
            <div>
              <h4 style={{ color: colors.neutral[300], marginBottom: spacing[3], margin: `0 0 ${spacing[3]} 0` }}>
                📁 Répartition par Catégorie
              </h4>
              <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                {Object.entries(knowledge.categoryCounts)
                  .filter(([, count]) => count > 0)
                  .map(([category, count]) => (
                    <div key={category} style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      background: colors.neutral[800],
                      border: `1px solid ${colors.neutral[700]}`,
                      borderRadius: '6px',
                      fontSize: fontSizes.sm,
                      color: colors.neutral[300],
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                    }}>
                      <span>{category}</span>
                      <span style={{
                        background: colors.saphir.primary[500] + '30',
                        padding: `${spacing[1]} ${spacing[2]}`,
                        borderRadius: '4px',
                        fontSize: fontSizes.xs,
                        color: colors.saphir.primary[400],
                      }}>
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Entries */}
            <div>
              <h4 style={{ color: colors.neutral[300], marginBottom: spacing[3], margin: `0 0 ${spacing[3]} 0` }}>
                📝 Entrées Récentes
              </h4>
              {knowledge.entries.length > 0 ? (
                <Stack gap={2}>
                  {knowledge.entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} style={{
                      padding: spacing[3],
                      background: colors.neutral[900],
                      border: `1px solid ${colors.neutral[800]}`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ color: colors.neutral[200], fontSize: fontSizes.sm }}>
                          {entry.title}
                        </div>
                        <div style={{ color: colors.neutral[500], fontSize: fontSizes.xs }}>
                          {entry.category} • {new Date(entry.indexedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{
                        padding: `${spacing[1]} ${spacing[2]}`,
                        background: `${colors.emeraude.primary[500]}20`,
                        borderRadius: '4px',
                        fontSize: fontSizes.xs,
                        color: colors.emeraude.primary[400],
                      }}>
                        {entry.status}
                      </div>
                    </div>
                  ))}
                </Stack>
              ) : (
                <div style={{
                  padding: spacing[6],
                  textAlign: 'center',
                  color: colors.neutral[500],
                  background: colors.neutral[900],
                  borderRadius: '8px',
                }}>
                  Aucun document indexé. Commencez à ajouter des connaissances !
                </div>
              )}
            </div>
          </Stack>
        ) : (
          <div style={{ color: colors.neutral[500], textAlign: 'center', padding: spacing[6] }}>
            Chargement des connaissances...
          </div>
        )}
      </Card>
    </Stack>
  ), [knowledge]);

  const renderEvolution = useCallback(() => (
    <Stack gap={6}>
      <Card title="Système d'Évolution">
        {evolution ? (
          <Stack gap={4}>
            {/* Current Phase */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.emeraude.primary[600]}20, ${colors.emeraude.primary[700]}10)`,
              border: `1px solid ${colors.emeraude.primary[500]}40`,
              borderRadius: '12px',
              padding: spacing[4],
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                marginBottom: spacing[3],
              }}>
                <span style={{ fontSize: '2rem' }}>{phaseDisplayInfo[evolution.phase]?.icon || '🌱'}</span>
                <div>
                  <div style={{ color: colors.neutral[200], fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }}>
                    Phase: {phaseDisplayInfo[evolution.phase]?.label || evolution.phase}
                  </div>
                  <div style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>
                    Version {evolution.version}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: spacing[4],
            }}>
              <StatCard
                title="Cycles"
                value={evolution.totalCycles}
                icon="🔄"
                color={colors.emeraude.primary[500]}
              />
              <StatCard
                title="Mutations"
                value={evolution.totalMutations}
                icon="🧬"
                color={colors.saphir.primary[500]}
              />
              <StatCard
                title="Stabilité"
                value={`${Math.round(evolution.currentMetrics.stability * 100)}%`}
                icon="⚖️"
                color={colors.rubis.primary[500]}
              />
            </div>

            {/* Metrics */}
            <div style={{
              background: colors.neutral[900],
              padding: spacing[4],
              borderRadius: '12px',
            }}>
              <h4 style={{ color: colors.neutral[300], marginBottom: spacing[3], margin: `0 0 ${spacing[3]} 0` }}>
                📊 Métriques Actuelles
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                    <span style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>Cohérence</span>
                    <span style={{ color: colors.neutral[300], fontSize: fontSizes.sm }}>
                      {Math.round(evolution.currentMetrics.coherence * 100)}%
                    </span>
                  </div>
                  <ProgressBar value={evolution.currentMetrics.coherence * 100} max={100} color={colors.emeraude.primary[500]} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                    <span style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>Performance</span>
                    <span style={{ color: colors.neutral[300], fontSize: fontSizes.sm }}>
                      {Math.round(evolution.currentMetrics.performance * 100)}%
                    </span>
                  </div>
                  <ProgressBar value={evolution.currentMetrics.performance * 100} max={100} color={colors.saphir.primary[500]} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                    <span style={{ color: colors.neutral[400], fontSize: fontSizes.sm }}>Profondeur Cognitive</span>
                    <span style={{ color: colors.neutral[300], fontSize: fontSizes.sm }}>
                      {Math.round(evolution.currentMetrics.cognitiveDepth * 100)}%
                    </span>
                  </div>
                  <ProgressBar value={evolution.currentMetrics.cognitiveDepth * 100} max={100} color={colors.rubis.primary[500]} />
                </div>
              </div>
            </div>
          </Stack>
        ) : (
          <div style={{ color: colors.neutral[500], textAlign: 'center', padding: spacing[6] }}>
            Chargement de l'évolution...
          </div>
        )}
      </Card>
    </Stack>
  ), [evolution]);

  const renderMemory = useCallback(() => (
    <Stack gap={6}>
      <Card title="Système de Mémoire">
        {memory ? (
          <Stack gap={4}>
            {/* Memory Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: spacing[4],
            }}>
              <StatCard
                title="Mémoires Totales"
                value={memory.stats.totalMemories}
                icon="🧠"
                color={colors.emeraude.primary[500]}
              />
              <StatCard
                title="Court Terme"
                value={memory.stats.shortTermCount}
                icon="⚡"
                color={colors.saphir.primary[500]}
              />
              <StatCard
                title="Long Terme"
                value={memory.stats.longTermCount}
                icon="💾"
                color={colors.rubis.primary[500]}
              />
            </div>

            {/* Memory Type Distribution */}
            <div style={{
              background: colors.neutral[900],
              padding: spacing[4],
              borderRadius: '12px',
            }}>
              <h4 style={{ color: colors.neutral[300], marginBottom: spacing[3], margin: `0 0 ${spacing[3]} 0` }}>
                🧠 Types de Mémoire
              </h4>
              <div style={{ display: 'flex', gap: spacing[3], flexWrap: 'wrap' }}>
                <div style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  background: colors.neutral[800],
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}>
                  <span>📖</span>
                  <span style={{ color: colors.neutral[300], fontSize: fontSizes.sm }}>Épisodique: {memory.stats.episodicCount}</span>
                </div>
                <div style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  background: colors.neutral[800],
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}>
                  <span>🔤</span>
                  <span style={{ color: colors.neutral[300], fontSize: fontSizes.sm }}>Sémantique: {memory.stats.semanticCount}</span>
                </div>
                <div style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  background: colors.neutral[800],
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}>
                  <span>⚙️</span>
                  <span style={{ color: colors.neutral[300], fontSize: fontSizes.sm }}>Procédurale: {memory.stats.proceduralCount}</span>
                </div>
              </div>
            </div>

            {/* Recent Memories */}
            <div>
              <h4 style={{ color: colors.neutral[300], marginBottom: spacing[3], margin: `0 0 ${spacing[3]} 0` }}>
                💭 Mémoires Récentes
              </h4>
              {memory.memories.length > 0 ? (
                <Stack gap={2}>
                  {memory.memories.slice(0, 5).map((mem) => (
                    <div key={mem.id} style={{
                      padding: spacing[3],
                      background: colors.neutral[900],
                      border: `1px solid ${colors.neutral[800]}`,
                      borderRadius: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: spacing[2],
                      }}>
                        <div style={{ color: colors.neutral[200], fontSize: fontSizes.sm, flex: 1 }}>
                          {mem.content.substring(0, 100)}{mem.content.length > 100 ? '...' : ''}
                        </div>
                        <div style={{
                          padding: `${spacing[1]} ${spacing[2]}`,
                          background: mem.type === 'short-term'
                            ? `${colors.saphir.primary[500]}20`
                            : `${colors.emeraude.primary[500]}20`,
                          borderRadius: '4px',
                          fontSize: fontSizes.xs,
                          color: mem.type === 'short-term'
                            ? colors.saphir.primary[400]
                            : colors.emeraude.primary[400],
                          marginLeft: spacing[2],
                          whiteSpace: 'nowrap',
                        }}>
                          {mem.type}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: spacing[3],
                        fontSize: fontSizes.xs,
                        color: colors.neutral[500],
                      }}>
                        <span>Importance: {Math.round(mem.importance * 100)}%</span>
                        <span>Force: {Math.round(mem.strength * 100)}%</span>
                        <span>Accès: {mem.accessCount}x</span>
                      </div>
                    </div>
                  ))}
                </Stack>
              ) : (
                <div style={{
                  padding: spacing[6],
                  textAlign: 'center',
                  color: colors.neutral[500],
                  background: colors.neutral[900],
                  borderRadius: '8px',
                }}>
                  Aucune mémoire active. Les interactions seront enregistrées automatiquement.
                </div>
              )}
            </div>

            {/* Memory Stats Footer */}
            <div style={{
              display: 'flex',
              gap: spacing[4],
              padding: spacing[3],
              background: colors.neutral[900],
              borderRadius: '8px',
              flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: fontSizes.xs, color: colors.neutral[500] }}>
                Force moyenne: <span style={{ color: colors.neutral[300] }}>{Math.round(memory.stats.averageStrength * 100)}%</span>
              </div>
              <div style={{ fontSize: fontSizes.xs, color: colors.neutral[500] }}>
                Taux consolidation: <span style={{ color: colors.neutral[300] }}>{Math.round(memory.stats.consolidationRate * 100)}%</span>
              </div>
              <div style={{ fontSize: fontSizes.xs, color: colors.neutral[500] }}>
                Total rappels: <span style={{ color: colors.neutral[300] }}>{memory.stats.totalRecalls}</span>
              </div>
            </div>
          </Stack>
        ) : (
          <div style={{ color: colors.neutral[500], textAlign: 'center', padding: spacing[6] }}>
            Chargement des mémoires...
          </div>
        )}
      </Card>
    </Stack>
  ), [memory]);

  // Tab content mapping
  const tabContent: Record<TabId, () => JSX.Element> = {
    overview: renderOverview,
    progression: renderProgression,
    knowledge: renderKnowledge,
    evolution: renderEvolution,
    memory: renderMemory,
  };

  return (
    <Container size="xl" style={{ paddingTop: spacing[6], paddingBottom: spacing[6] }}>
      <Stack gap={6}>
        {/* Header */}
        <div style={{ marginBottom: spacing[4] }}>
          <h1 style={{
            margin: 0,
            fontSize: fontSizes['3xl'],
            fontWeight: fontWeights.bold,
            color: colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
          }}>
            <span style={{ fontSize: '2rem' }}>🧠</span>
            Centre d'Évolution Cognitive
          </h1>
          <p style={{
            margin: `${spacing[2]} 0 0`,
            color: colors.neutral[400],
            fontSize: fontSizes.base,
          }}>
            OPUS #4 — Fusion Progression + Knowledge + Evolution + Memory
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: spacing[2],
          flexWrap: 'wrap',
          padding: spacing[2],
          background: colors.neutral[900],
          borderRadius: '12px',
          border: `1px solid ${colors.neutral[800]}`,
        }}>
          <TabButton label="Vue d'ensemble" icon="📊" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton label="Progression" icon="⭐" active={activeTab === 'progression'} onClick={() => setActiveTab('progression')} />
          <TabButton label="Connaissances" icon="📚" active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} />
          <TabButton label="Évolution" icon="🌱" active={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')} />
          <TabButton label="Mémoire" icon="🧠" active={activeTab === 'memory'} onClick={() => setActiveTab('memory')} />
        </div>

        {/* Tab Content */}
        {tabContent[activeTab]()}
      </Stack>
    </Container>
  );
};

export default EvolutionCenterPage;
