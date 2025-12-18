/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — HarmoniaFlow
 * Visualisation de l'équilibrage système
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { useSystemStore } from '../../stores/systemStore';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export function HarmoniaFlow() {
  const { harmonia, loading, error, fetchHarmonia } = useSystemStore();

  useEffect(() => {
    fetchHarmonia();

    const interval = setInterval(() => {
      fetchHarmonia();
    }, 2500); // Update every 2.5s

    return () => clearInterval(interval);
  }, [fetchHarmonia]);

  if (loading && !harmonia) {
    return <Card className="p-8 text-center">Chargement...</Card>;
  }

  if (error) {
    return <Card className="p-8 text-center text-red-500">Erreur: {error}</Card>;
  }

  if (!harmonia) {
    return null;
  }

  const getStabilizationColor = (level: string): string => {
    switch (level) {
      case 'Stable':
        return 'green';
      case 'Adjusting':
        return 'yellow';
      case 'Critical':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Harmonia — Équilibrage Système</h2>
        <Badge color={getStabilizationColor(harmonia.stabilization_level)} size="lg">
          {harmonia.stabilization_level}
        </Badge>
      </div>

      {/* Balance Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Score d&apos;Équilibre</span>
          <span className="text-2xl font-bold">{harmonia.balance_score.toFixed(1)}%</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              harmonia.balance_score >= 85
                ? 'bg-green-500'
                : harmonia.balance_score >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${harmonia.balance_score}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Critique</span>
          <span>Ajustement</span>
          <span>Stable</span>
        </div>
      </Card>

      {/* Stabilization Level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`p-6 ${harmonia.stabilization_level === 'Stable' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🟢</div>
            <div className="font-semibold">Stable</div>
            <div className="text-xs text-gray-500 mt-1">Système équilibré</div>
          </div>
        </Card>

        <Card
          className={`p-6 ${harmonia.stabilization_level === 'Adjusting' ? 'ring-2 ring-yellow-500' : ''}`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🟡</div>
            <div className="font-semibold">Ajustement</div>
            <div className="text-xs text-gray-500 mt-1">Corrections en cours</div>
          </div>
        </Card>

        <Card
          className={`p-6 ${harmonia.stabilization_level === 'Critical' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🔴</div>
            <div className="font-semibold">Critique</div>
            <div className="text-xs text-gray-500 mt-1">Intervention requise</div>
          </div>
        </Card>
      </div>

      {/* Adjustments Made */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Ajustements effectués</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{harmonia.adjustments_made}</span>
            <Badge color="blue" size="sm">
              Total
            </Badge>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Fréquence d&apos;ajustement</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((harmonia.adjustments_made / 100) * 100, 100)}%`,
                }}
              />
            </div>
            <span className="text-xs">
              {((harmonia.adjustments_made / 100) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Status Description */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">État du Système</h3>
        <div className="space-y-2 text-sm text-gray-300">
          {harmonia.stabilization_level === 'Stable' && (
            <p>
              ✅ Le système fonctionne de manière optimale. Tous les flux sont équilibrés.
            </p>
          )}
          {harmonia.stabilization_level === 'Adjusting' && (
            <p>
              ⚠️ Harmonia effectue des corrections pour rétablir l&apos;équilibre système.
            </p>
          )}
          {harmonia.stabilization_level === 'Critical' && (
            <p>🚨 Déséquilibre critique détecté. Intervention immédiate recommandée.</p>
          )}
        </div>
      </Card>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Dernière mise à jour: {new Date(harmonia.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
