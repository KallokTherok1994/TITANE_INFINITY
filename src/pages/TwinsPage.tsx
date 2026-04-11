/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Twins Page
 * Page des jumeaux numériques : gestion et visualisation des digital
 * twins, état de synchronisation, comportements, identités.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { memo, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { TwinEvolutionPanel } from '../components/twin/TwinEvolutionPanel';
import { useTwinIdentity } from '../hooks/useTwinIdentity';
import { useTwinEvolution } from '../hooks/useTwinEvolution';
import {
  Users,
  RefreshCw,
  Link2,
  Star,
  Activity,
  Heart,
  User,
  Cpu,
  GitMerge,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const TwinsPage: React.FC = memo(() => {
  const {
    identity,
    isLoading: identityLoading,
    coreValues,
    humanStyle,
    fusionIndex,
    refresh: refreshIdentity,
  } = useTwinIdentity();

  const {
    evolutionProfile,
    fusionIndex: evolutionFusion,
    syncScore,
    currentPhase,
    chatContextStatus,
    growthTrends,
    ownerThemes,
    sourceCount,
    isLoading: evolutionLoading,
    refresh: refreshEvolution,
  } = useTwinEvolution();

  const isLoading = identityLoading || evolutionLoading;

  const handleRefresh = async () => {
    await Promise.all([refreshIdentity(), refreshEvolution()]);
  };

  useEffect(() => {
    void handleRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-violet-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Twins — Digital Twins</h1>
              <p className="text-sm text-gray-400">
                Gestion et visualisation des jumeaux numériques — Symbiose Kevin ↔ TITANE∞
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={chatContextStatus === 'active' ? 'success' : chatContextStatus === 'stale' ? 'warning' : 'neutral'}
              size="sm"
              dot
            >
              Chat {chatContextStatus}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Sync KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Score de sync</span>
            </div>
            <p className="text-3xl font-bold text-violet-400">
              {syncScore > 0 ? `${(syncScore * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Index de fusion</span>
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              {evolutionFusion != null
                ? `${(typeof evolutionFusion === 'number' ? evolutionFusion : evolutionFusion.score ?? 0).toFixed(0)}%`
                : fusionIndex > 0
                  ? `${(fusionIndex * 100).toFixed(0)}%`
                  : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Sources connues</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{sourceCount}</p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Phase actuelle</span>
            </div>
            <p className="text-lg font-bold text-green-400 truncate">
              {currentPhase ? String(currentPhase) : '—'}
            </p>
          </Card>
        </div>

        {/* ── Twin Identity + Profile ── */}
        {isLoading ? (
          <Card variant="solid" padding={6}>
            <div className="flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span className="text-gray-400">Chargement identité Twin...</span>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity */}
            <Card variant="solid" padding={4}>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-gray-300">Identité du Twin</h2>
              </div>
              {identity ? (
                <div className="space-y-3">
                  {identity.name && (
                    <div>
                      <p className="text-xs text-gray-500">Nom</p>
                      <p className="text-white font-medium">{identity.name}</p>
                    </div>
                  )}
                  {identity.essence && (
                    <div>
                      <p className="text-xs text-gray-500">Essence</p>
                      <p className="text-gray-300 italic text-sm">{identity.essence}</p>
                    </div>
                  )}
                  {humanStyle && humanStyle.communication_style && (
                    <div>
                      <p className="text-xs text-gray-500">Style communication</p>
                      <p className="text-gray-300 text-sm">{humanStyle.communication_style}</p>
                    </div>
                  )}
                  {coreValues.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valeurs fondamentales</p>
                      <div className="flex flex-wrap gap-1">
                        {coreValues.slice(0, 5).map((v, i) => (
                          <Badge key={i} variant="primary" size="sm">
                            {v.name ?? String(v)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Identité non disponible</p>
              )}
            </Card>

            {/* Evolution profile */}
            <Card variant="solid" padding={4}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-semibold text-gray-300">Profil d'évolution</h2>
              </div>
              {evolutionProfile ? (
                <div className="space-y-3">
                  {growthTrends && (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(growthTrends as Record<string, number>)
                        .slice(0, 4)
                        .map(([key, val]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-500">{key}</p>
                            <p className="text-sm text-white font-mono">
                              {typeof val === 'number' ? val.toFixed(2) : String(val)}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                  {ownerThemes.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Thèmes propriétaire</p>
                      <div className="flex flex-wrap gap-1">
                        {ownerThemes.slice(0, 4).map((theme, i) => (
                          <Badge key={i} variant="info" size="sm">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Profil non disponible</p>
              )}
            </Card>
          </div>
        )}

        {/* ── Sync status ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-gray-300">Comportements</h3>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Empathie', active: true },
                { label: 'Curiosité', active: true },
                { label: 'Authenticité', active: true },
                { label: 'Adaptation', active: syncScore > 0.8 },
              ].map(b => (
                <div key={b.label} className="flex items-center justify-between">
                  <span className="text-gray-300">{b.label}</span>
                  <Badge variant={b.active ? 'success' : 'neutral'} size="sm" dot>
                    {b.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-300">Synchronisation</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Mémoire partagée</span>
                  <span>87%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Cohérence valeurs</span>
                  <span>
                    {syncScore > 0 ? `${(syncScore * 100).toFixed(0)}%` : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full"
                    style={{ width: `${syncScore > 0 ? syncScore * 100 : 80}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-gray-300">État chat</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Contexte chat</span>
                <Badge
                  variant={chatContextStatus === 'active' ? 'success' : chatContextStatus === 'stale' ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {chatContextStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Twin actif</span>
                <Badge variant="success" size="sm" dot>Oui</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sources</span>
                <span className="text-white">{sourceCount}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Twin Evolution Panel ── */}
        <Card variant="solid" padding={0}>
          <div className="p-4 border-b border-gray-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-semibold text-gray-300">
              Panneau d'évolution du Twin
            </h2>
          </div>
          <div className="p-4">
            <TwinEvolutionPanel isAdmin={true} compact={false} />
          </div>
        </Card>
      </div>
    </div>
  );
});
TwinsPage.displayName = 'TwinsPage';

export default TwinsPage;
