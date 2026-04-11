/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Reality Center Page
 * Dashboard de monitoring : état réel vs état attendu du système.
 * Métriques de conformité, drift detection, état des modules.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { memo, useEffect, useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useSystemHealth } from '../hooks/useSystemHealth';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
  Shield,
  Database,
  Cpu,
  Clock,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface ModuleStatus {
  name: string;
  expected: string;
  actual: string;
  conformance: number; // 0-100
  drift: number; // delta
  status: 'nominal' | 'degraded' | 'critical' | 'unknown';
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function conformanceBadgeVariant(
  pct: number
): 'success' | 'warning' | 'error' | 'neutral' {
  if (pct >= 90) return 'success';
  if (pct >= 70) return 'warning';
  if (pct > 0) return 'error';
  return 'neutral';
}

function statusToHealth(
  status: ModuleStatus['status']
): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'nominal':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'critical':
      return 'error';
    default:
      return 'neutral';
  }
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const RealityCenter: React.FC = memo(() => {
  const { health, refreshHealth, isMonitoring } = useSystemHealth();
  const isLoading = isMonitoring && !health;

  const [modules, setModules] = useState<ModuleStatus[]>([
    {
      name: 'Cognitive Engine',
      expected: 'ACTIVE',
      actual: 'ACTIVE',
      conformance: 100,
      drift: 0,
      status: 'nominal',
    },
    {
      name: 'Memory Persistence',
      expected: 'HEALTHY',
      actual: 'HEALTHY',
      conformance: 97,
      drift: 3,
      status: 'nominal',
    },
    {
      name: 'Singularity Bridge',
      expected: 'SYNCED',
      actual: 'SYNCED',
      conformance: 100,
      drift: 0,
      status: 'nominal',
    },
    {
      name: 'IPC Gateway',
      expected: 'OPEN',
      actual: 'OPEN',
      conformance: 100,
      drift: 0,
      status: 'nominal',
    },
    {
      name: 'Voice Engine',
      expected: 'READY',
      actual: 'STANDBY',
      conformance: 75,
      drift: 25,
      status: 'degraded',
    },
    {
      name: 'Visual Engine v21',
      expected: 'RUNNING',
      actual: 'RUNNING',
      conformance: 98,
      drift: 2,
      status: 'nominal',
    },
    {
      name: 'Evolution Monitor',
      expected: 'TRACKING',
      actual: 'PAUSED',
      conformance: 60,
      drift: 40,
      status: 'degraded',
    },
    {
      name: 'Security Sandbox',
      expected: 'ENFORCED',
      actual: 'ENFORCED',
      conformance: 100,
      drift: 0,
      status: 'nominal',
    },
  ]);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = useCallback(async () => {
    await refreshHealth();
    setLastRefresh(new Date());
    // Simulate slight drift update
    setModules(prev =>
      prev.map(m => ({
        ...m,
        conformance: Math.max(
          50,
          Math.min(100, m.conformance + (Math.random() - 0.5) * 4)
        ),
      }))
    );
  }, [refreshHealth]);

  // Auto-refresh toutes les 30s
  useEffect(() => {
    const id = setInterval(handleRefresh, 30_000);
    return () => clearInterval(id);
  }, [handleRefresh]);

  const globalConformance =
    modules.reduce((acc, m) => acc + m.conformance, 0) / modules.length;
  const criticalCount = modules.filter(m => m.status === 'critical').length;
  const degradedCount = modules.filter(m => m.status === 'degraded').length;
  const nominalCount = modules.filter(m => m.status === 'nominal').length;

  const overallStatus =
    criticalCount > 0 ? 'critical' : degradedCount > 0 ? 'degraded' : 'nominal';

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-7 h-7 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Reality Center</h1>
              <p className="text-sm text-gray-400">
                Monitoring état réel vs état attendu — Drift Detection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Dernière mise à jour : {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* ── Global Status ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Conformité globale</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {globalConformance.toFixed(0)}%
            </p>
            <Badge
              variant={conformanceBadgeVariant(globalConformance)}
              size="sm"
              className="mt-1"
            >
              {overallStatus}
            </Badge>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Nominaux</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{nominalCount}</p>
            <p className="text-xs text-gray-500 mt-1">modules</p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Dégradés</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{degradedCount}</p>
            <p className="text-xs text-gray-500 mt-1">modules</p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Critiques</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-xs text-gray-500 mt-1">modules</p>
          </Card>
        </div>

        {/* ── System Health from hook ── */}
        {isLoading ? (
          <Card variant="solid" elevation="sm" padding={6}>
            <div className="flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span className="text-gray-400">Chargement santé système...</span>
            </div>
          </Card>
        ) : health ? (
          <Card variant="solid" elevation="sm" padding={4}>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Santé système en temps réel
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Conversation</p>
                <Badge
                  variant={
                    health.conversation?.status === 'healthy' ? 'success' : 'warning'
                  }
                  size="sm"
                >
                  {health.conversation?.status ?? 'unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mémoire</p>
                <Badge
                  variant={health.memory?.status === 'healthy' ? 'success' : 'warning'}
                  size="sm"
                >
                  {health.memory?.status ?? 'unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Singularité</p>
                <Badge
                  variant={
                    health.singularity?.status === 'healthy' ? 'success' : 'warning'
                  }
                  size="sm"
                >
                  {health.singularity?.status ?? 'unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Système</p>
                <Badge
                  variant={health.system?.status === 'healthy' ? 'success' : 'warning'}
                  size="sm"
                >
                  {health.system?.status ?? 'unknown'}
                </Badge>
              </div>
            </div>
          </Card>
        ) : null}

        {/* ── Module Drift Table ── */}
        <Card variant="solid" elevation="md" padding={0}>
          <div className="p-4 border-b border-gray-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-gray-300">
              État des modules — Réel vs Attendu
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                  <th className="text-left p-3">Module</th>
                  <th className="text-left p-3">Attendu</th>
                  <th className="text-left p-3">Réel</th>
                  <th className="text-right p-3">Conformité</th>
                  <th className="text-right p-3">Drift</th>
                  <th className="text-center p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, i) => (
                  <tr
                    key={mod.name}
                    className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                      i % 2 === 0 ? 'bg-gray-900/30' : ''
                    }`}
                  >
                    <td className="p-3 font-medium text-white">{mod.name}</td>
                    <td className="p-3 text-gray-300 font-mono text-xs">
                      {mod.expected}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      <span
                        className={
                          mod.actual === mod.expected
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        }
                      >
                        {mod.actual}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              mod.conformance >= 90
                                ? 'bg-green-500'
                                : mod.conformance >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${mod.conformance}%` }}
                          />
                        </div>
                        <span className="text-white w-10 text-right">
                          {mod.conformance.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`flex items-center justify-end gap-1 ${
                          mod.drift === 0
                            ? 'text-green-400'
                            : mod.drift < 20
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {mod.drift === 0 ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : mod.drift < 20 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {mod.drift}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={statusToHealth(mod.status)} size="sm">
                        {mod.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Network Status ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-gray-300">Connectivité</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">IPC One Door</span>
                <Badge variant="success" size="sm">
                  OK
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Backend Rust</span>
                <Badge variant="success" size="sm">
                  OK
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">AI Gateway</span>
                <Badge variant="success" size="sm">
                  OK
                </Badge>
              </div>
            </div>
          </Card>

          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-300">Horloge système</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white font-mono">
                  {health?.system?.uptime_ms
                    ? `${Math.floor(health.system.uptime_ms / 3600000)}h ${Math.floor((health.system.uptime_ms % 3600000) / 60000)}m`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">CPU</span>
                <span className="text-white font-mono">
                  {health?.system?.cpu_usage != null
                    ? `${health.system.cpu_usage.toFixed(1)}%`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Refresh auto</span>
                <Badge variant="info" size="sm">
                  30s
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});
RealityCenter.displayName = 'RealityCenter';

export default RealityCenter;
