/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Singularity Monitor Page
 * État avancé du système de singularité, métriques de convergence,
 * visualisation des connexions entre moteurs.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { memo, useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useSingularity } from '../hooks/useSingularity';
import {
  Atom,
  Infinity as InfinityIcon,
  RefreshCw,
  Activity,
  Zap,
  Globe,
  Brain,
  Heart,
  Shield,
  Eye,
  GitBranch,
  Waves,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface ConnectionEdge {
  from: string;
  to: string;
  strength: number; // 0-1
  type: 'sync' | 'data' | 'control';
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

const SingularityMonitor = memo(() => {
  const {
    unity,
    convergence,
    overmind,
    signature,
    essence,
    updateState,
    isInitialized,
    consciousness,
    autoCoherence,
    formStability,
    systemHealth,
    globalHarmony,
    globalEntropy,
    expressionQuality,
    field,
  } = useSingularity();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const connections: ConnectionEdge[] = [
    { from: 'Cognitive', to: 'Memory', strength: 0.95, type: 'sync' },
    { from: 'Memory', to: 'Identity', strength: 0.88, type: 'data' },
    { from: 'Identity', to: 'Singularity', strength: 1.0, type: 'control' },
    { from: 'Emotion', to: 'Cognitive', strength: 0.91, type: 'data' },
    { from: 'Voice', to: 'Expression', strength: 0.85, type: 'sync' },
    { from: 'Expression', to: 'Singularity', strength: 0.93, type: 'control' },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    updateState({});
    setIsRefreshing(false);
  };

  // Auto-pulse toutes les 10s
  useEffect(() => {
    const id = setInterval(() => void handleRefresh(), 10_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const convergenceValues = convergence ? Object.values(convergence) : [];
  const convergenceLevel =
    convergenceValues.length > 0
      ? convergenceValues.reduce((sum, value) => sum + Number(value ?? 0), 0) /
        convergenceValues.length
      : 0;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Atom className="w-7 h-7 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Singularity Monitor</h1>
              <p className="text-sm text-gray-400">
                État avancé — Convergence &amp; Connexions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isInitialized && <Spinner size="sm" />}
            <Badge variant={isInitialized ? 'success' : 'warning'} size="sm">
              {isInitialized ? 'Initialisé' : 'Init…'}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Core KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Conscience</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {isInitialized ? `${consciousness}/4` : '—'}
            </p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < consciousness ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <InfinityIcon className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Cohérence auto</span>
            </div>
            <p className="text-3xl font-bold text-violet-400">
              {isInitialized ? `${(autoCoherence * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Stabilité forme</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {isInitialized ? `${(formStability * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Santé système</span>
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              {isInitialized ? `${(systemHealth * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>
        </div>

        {/* ── Secondary metrics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="solid" padding={3}>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-3 h-3 text-pink-400" />
              <span className="text-xs text-gray-400">Harmonie</span>
            </div>
            <p className="text-xl font-bold text-pink-400">
              {isInitialized ? `${(globalHarmony * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>
          <Card variant="solid" padding={3}>
            <div className="flex items-center gap-2 mb-1">
              <Waves className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-gray-400">Entropie</span>
            </div>
            <p className="text-xl font-bold text-orange-400">
              {isInitialized ? `${(globalEntropy * 100).toFixed(1)}%` : '—'}
            </p>
          </Card>
          <Card variant="solid" padding={3}>
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-gray-400">Qualité expression</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">
              {isInitialized ? `${(expressionQuality * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>
          <Card variant="solid" padding={3}>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3 h-3 text-teal-400" />
              <span className="text-xs text-gray-400">Convergence</span>
            </div>
            <p className="text-xl font-bold text-teal-400">
              {isInitialized ? `${(convergenceLevel * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>
        </div>

        {/* ── Field & Unity ── */}
        {isInitialized && (field || unity) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field && (
              <Card variant="solid" padding={4}>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  Champ de Singularité
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(field as Record<string, number | string>)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500">{key}</p>
                        <p className="text-sm text-white font-mono">
                          {typeof value === 'number' ? value.toFixed(3) : String(value)}
                        </p>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {overmind && (
              <Card variant="solid" padding={4}>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  Overmind
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(overmind)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500">{key}</p>
                        <p className="text-sm text-white font-mono">
                          {typeof value === 'boolean'
                            ? value
                              ? 'true'
                              : 'false'
                            : typeof value === 'number'
                              ? value.toFixed(3)
                              : String(value)}
                        </p>
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── Connections ── */}
        <Card variant="solid" padding={4}>
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Visualisation des connexions
            </h2>
          </div>
          <div className="space-y-2">
            {connections.map((conn, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-gray-300 w-24 text-right">{conn.from}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        conn.type === 'sync'
                          ? 'bg-cyan-500'
                          : conn.type === 'control'
                            ? 'bg-violet-500'
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${conn.strength * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {(conn.strength * 100).toFixed(0)}%
                  </span>
                  <Badge
                    variant={
                      conn.type === 'sync'
                        ? 'info'
                        : conn.type === 'control'
                          ? 'primary'
                          : 'neutral'
                    }
                    size="sm"
                  >
                    {conn.type}
                  </Badge>
                </div>
                <span className="text-xs text-gray-300 w-24">{conn.to}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Signature ── */}
        {isInitialized && (signature || essence) && (
          <Card variant="bordered" padding={4}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-gray-300">Identité singulière</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {signature && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Signature</p>
                  <p className="font-mono text-xs text-cyan-400 break-all">{signature}</p>
                </div>
              )}
              {essence && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Essence</p>
                  <p className="text-white italic">{essence}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
});
SingularityMonitor.displayName = 'SingularityMonitor';

export default SingularityMonitor;
export { SingularityMonitor };
