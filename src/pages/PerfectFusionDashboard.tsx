/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Perfect Fusion Dashboard Page
 * Visualisation de la fusion des moteurs cognitifs,
 * état de synchronisation entre engines, indicateurs de cohérence.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { memo, useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useSingularity } from '../hooks/useSingularity';
import {
  Atom,
  Link2,
  RefreshCw,
  Zap,
  Heart,
  Brain,
  Layers,
  GitMerge,
  Infinity as InfinityIcon,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface EngineNode {
  id: string;
  name: string;
  domain: 'cognitive' | 'emotional' | 'memory' | 'voice' | 'identity' | 'singularity';
  syncScore: number; // 0-1
  latencyMs: number;
  active: boolean;
}

// ─────────────────────────────────────────────────────────────────
// STATIC ENGINE NODES
// ─────────────────────────────────────────────────────────────────

const INITIAL_ENGINES: EngineNode[] = [
  {
    id: 'cognitive',
    name: 'Cognitive Engine',
    domain: 'cognitive',
    syncScore: 0.97,
    latencyMs: 12,
    active: true,
  },
  {
    id: 'memory',
    name: 'Memory Engine',
    domain: 'memory',
    syncScore: 0.95,
    latencyMs: 18,
    active: true,
  },
  {
    id: 'emotion',
    name: 'Emotion Engine',
    domain: 'emotional',
    syncScore: 0.93,
    latencyMs: 8,
    active: true,
  },
  {
    id: 'voice',
    name: 'Voice Engine',
    domain: 'voice',
    syncScore: 0.88,
    latencyMs: 22,
    active: true,
  },
  {
    id: 'identity',
    name: 'Identity Engine',
    domain: 'identity',
    syncScore: 1.0,
    latencyMs: 5,
    active: true,
  },
  {
    id: 'narrative',
    name: 'Narrative Engine',
    domain: 'cognitive',
    syncScore: 0.91,
    latencyMs: 15,
    active: true,
  },
  {
    id: 'temporal',
    name: 'Temporal Engine',
    domain: 'memory',
    syncScore: 0.89,
    latencyMs: 20,
    active: true,
  },
  {
    id: 'singularity',
    name: 'Singularity Core',
    domain: 'singularity',
    syncScore: 0.99,
    latencyMs: 3,
    active: true,
  },
  {
    id: 'consciousness',
    name: 'Consciousness Engine',
    domain: 'singularity',
    syncScore: 0.96,
    latencyMs: 10,
    active: true,
  },
];

const DOMAIN_COLORS: Record<EngineNode['domain'], string> = {
  cognitive: 'text-blue-400',
  emotional: 'text-pink-400',
  memory: 'text-green-400',
  voice: 'text-yellow-400',
  identity: 'text-violet-400',
  singularity: 'text-cyan-400',
};

const DOMAIN_BG: Record<EngineNode['domain'], string> = {
  cognitive: 'bg-blue-900/30',
  emotional: 'bg-pink-900/30',
  memory: 'bg-green-900/30',
  voice: 'bg-yellow-900/30',
  identity: 'bg-violet-900/30',
  singularity: 'bg-cyan-900/30',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const PerfectFusionDashboard: React.FC = memo(() => {
  const { consciousness, globalHarmony, globalEntropy, isInitialized, autoCoherence } =
    useSingularity();

  const [engines, setEngines] = useState<EngineNode[]>(INITIAL_ENGINES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const avgSync = engines.reduce((s, e) => s + e.syncScore, 0) / engines.length;
  const avgLatency = engines.reduce((s, e) => s + e.latencyMs, 0) / engines.length;
  const activeCount = engines.filter(e => e.active).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setEngines(prev =>
      prev.map(e => ({
        ...e,
        syncScore: Math.max(0.7, Math.min(1, e.syncScore + (Math.random() - 0.5) * 0.05)),
        latencyMs: Math.max(2, Math.round(e.latencyMs + (Math.random() - 0.5) * 5)),
      }))
    );
    setIsRefreshing(false);
  };

  // Pulse toutes les 15s
  useEffect(() => {
    const id = setInterval(handleRefresh, 15_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="bg-gray-900 text-white min-h-screen p-6"
      data-testid="page-fusion"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitMerge className="w-7 h-7 text-violet-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Perfect Fusion Dashboard</h1>
              <p className="text-sm text-gray-400">
                Fusion des moteurs cognitifs — Synchronisation &amp; Cohérence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isInitialized && <Spinner size="sm" />}
            <Badge variant={isInitialized ? 'success' : 'warning'} size="sm">
              {isInitialized ? 'Initialisé' : 'Initialisation…'}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Sync
            </Button>
          </div>
        </div>

        {/* ── Fusion KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <InfinityIcon className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Cohérence auto</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {isInitialized ? `${(autoCoherence * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400">Harmonie globale</span>
            </div>
            <p className="text-3xl font-bold text-pink-400">
              {isInitialized ? `${(globalHarmony * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Conscience</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {isInitialized ? `${consciousness}/4` : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Entropie globale</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {isInitialized ? `${(globalEntropy * 100).toFixed(1)}%` : '—'}
            </p>
          </Card>
        </div>

        {/* ── Sync overview ── */}
        <div className="grid grid-cols-3 gap-4">
          <Card variant="solid" padding={4}>
            <p className="text-xs text-gray-400 mb-1">Sync moyen</p>
            <p className="text-2xl font-bold text-white">{(avgSync * 100).toFixed(1)}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all"
                style={{ width: `${avgSync * 100}%` }}
              />
            </div>
          </Card>
          <Card variant="solid" padding={4}>
            <p className="text-xs text-gray-400 mb-1">Latence moyenne</p>
            <p className="text-2xl font-bold text-white">{avgLatency.toFixed(0)}ms</p>
            <p className="text-xs text-gray-500 mt-1">
              {avgLatency < 15 ? '🟢 Excellent' : avgLatency < 30 ? '🟡 Bon' : '🔴 Lent'}
            </p>
          </Card>
          <Card variant="solid" padding={4}>
            <p className="text-xs text-gray-400 mb-1">Moteurs actifs</p>
            <p className="text-2xl font-bold text-white">
              {activeCount}/{engines.length}
            </p>
            <Badge
              variant={activeCount === engines.length ? 'success' : 'warning'}
              size="sm"
              className="mt-1"
            >
              {activeCount === engines.length ? 'Tous actifs' : 'Dégradé'}
            </Badge>
          </Card>
        </div>

        {/* ── Engine Grid ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Moteurs cognitifs — État de fusion
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engines.map(engine => (
              <Card key={engine.id} variant="solid" elevation="sm" padding={4}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${DOMAIN_BG[engine.domain]}`}>
                      <Atom className={`w-4 h-4 ${DOMAIN_COLORS[engine.domain]}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{engine.name}</p>
                      <p className="text-xs text-gray-500">{engine.domain}</p>
                    </div>
                  </div>
                  {engine.syncScore >= 0.95 ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>

                {/* Sync Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Synchronisation</span>
                    <span
                      className={
                        engine.syncScore >= 0.95 ? 'text-green-400' : 'text-yellow-400'
                      }
                    >
                      {(engine.syncScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        engine.syncScore >= 0.95 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${engine.syncScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    Latence: {engine.latencyMs}ms
                  </span>
                  <Badge variant={engine.active ? 'success' : 'error'} size="sm" dot>
                    {engine.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
PerfectFusionDashboard.displayName = 'PerfectFusionDashboard';

export default PerfectFusionDashboard;
