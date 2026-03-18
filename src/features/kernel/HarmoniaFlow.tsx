/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — HarmoniaFlow
 * Visualisation de l'équilibrage système
 * [FIX-005] Adapted to HarmoniaEngineState (engine_get_harmonia_state)
 * Fields: health, harmony_index, balance_score, last_check_ms, initialized
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import {
  useHarmoniaSnapshot,
  useFetchHarmonia,
} from '../../stores/systemStore.selectors';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export function HarmoniaFlow() {
  const { harmonia, loading, error } = useHarmoniaSnapshot();
  const fetchHarmonia = useFetchHarmonia();

  useEffect(() => {
    fetchHarmonia();
    const interval = setInterval(() => {
      fetchHarmonia();
    }, 2500);
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

  // [FIX-005] Derive stabilization level from health string (no stabilization_level in engine response)
  const getStabilizationLevel = (health: string): string => {
    if (health === 'Ready') return 'Stable';
    if (health === 'Degraded') return 'Adjusting';
    return 'Critical';
  };

  const getStabilizationColor = (level: string): string => {
    if (level === 'Stable') return 'green';
    if (level === 'Adjusting') return 'yellow';
    return 'red';
  };

  const stabilizationLevel = getStabilizationLevel(harmonia.health);
  // balance_score from Rust is f32 (0.0–1.0) — scale to percentage
  const balancePct = Math.round(harmonia.balance_score * 100);
  // harmony_index is f32 (0.0–1.0) — used as adjustments proxy
  const harmonyPct = Math.round(harmonia.harmony_index * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Harmonia — Équilibrage Système</h2>
        <Badge color={getStabilizationColor(stabilizationLevel)} size="lg">
          {stabilizationLevel}
        </Badge>
      </div>

      {/* Balance Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Score d&apos;Équilibre</span>
          <span className="text-2xl font-bold">{balancePct}%</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              balancePct >= 85
                ? 'bg-green-500'
                : balancePct >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${balancePct}%` }}
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
          className={`p-6 ${stabilizationLevel === 'Stable' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🟢</div>
            <div className="font-semibold">Stable</div>
            <div className="text-xs text-gray-500 mt-1">Système équilibré</div>
          </div>
        </Card>

        <Card
          className={`p-6 ${stabilizationLevel === 'Adjusting' ? 'ring-2 ring-yellow-500' : ''}`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🟡</div>
            <div className="font-semibold">Ajustement</div>
            <div className="text-xs text-gray-500 mt-1">Corrections en cours</div>
          </div>
        </Card>

        <Card
          className={`p-6 ${stabilizationLevel === 'Critical' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🔴</div>
            <div className="font-semibold">Critique</div>
            <div className="text-xs text-gray-500 mt-1">Intervention requise</div>
          </div>
        </Card>
      </div>

      {/* Harmony Index */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Indice d&apos;Harmonie</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{harmonyPct}%</span>
            <Badge color="blue" size="sm">
              harmony_index
            </Badge>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Niveau d&apos;harmonie système</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${harmonyPct}%` }}
              />
            </div>
            <span className="text-xs">{harmonyPct}%</span>
          </div>
        </div>
      </Card>

      {/* Status Description */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">État du Système</h3>
        <div className="space-y-2 text-sm text-gray-300">
          {stabilizationLevel === 'Stable' && (
            <p>
              ✅ Le système fonctionne de manière optimale. Tous les flux sont équilibrés.
            </p>
          )}
          {stabilizationLevel === 'Adjusting' && (
            <p>
              ⚠️ Harmonia effectue des corrections pour rétablir l&apos;équilibre système.
            </p>
          )}
          {stabilizationLevel === 'Critical' && (
            <p>🚨 Déséquilibre critique détecté. Intervention immédiate recommandée.</p>
          )}
        </div>
      </Card>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Dernière mise à jour:{' '}
        {harmonia.last_check_ms > 0
          ? new Date(harmonia.last_check_ms).toLocaleTimeString()
          : 'Non encore effectuée'}
      </div>
    </div>
  );
}
