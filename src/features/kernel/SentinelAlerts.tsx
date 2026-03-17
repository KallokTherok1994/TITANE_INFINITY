/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — SentinelAlerts
 * Visualisation des alertes et anomalies
 * [FIX-005] Adapted to SentinelEngineState (engine_get_sentinel_state)
 * Fields: health, alert_count, active_monitors, protection_level, last_check_ms, initialized
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import {
  useSentinelSnapshot,
  useFetchSentinel,
} from '../../stores/systemStore.selectors';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export function SentinelAlerts() {
  const { sentinel, loading, error } = useSentinelSnapshot();
  const fetchSentinel = useFetchSentinel();

  useEffect(() => {
    fetchSentinel();
    const interval = setInterval(() => { fetchSentinel(); }, 3000);
    return () => clearInterval(interval);
  }, [fetchSentinel]);

  if (loading && !sentinel) {
    return <Card className="p-8 text-center">Chargement...</Card>;
  }
  if (error) {
    return <Card className="p-8 text-center text-red-500">Erreur: {error}</Card>;
  }
  if (!sentinel) {
    return null;
  }

  // [FIX-005] protection_level is u8 (0-255) — scale to 0-100%
  const protectionPct = Math.round((sentinel.protection_level / 255) * 100);

  const getProtectionColor = (pct: number): string => {
    if (pct >= 90) return 'green';
    if (pct >= 70) return 'yellow';
    return 'red';
  };

  const getHealthColor = (health: string): string => {
    if (health === 'Ready') return 'green';
    if (health === 'Degraded') return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sentinel — Détection d&apos;Anomalies</h2>
        <div className="flex items-center gap-3">
          <Badge color={sentinel.alert_count > 0 ? 'red' : 'green'} size="lg">
            {sentinel.alert_count} alerte{sentinel.alert_count !== 1 ? 's' : ''}
          </Badge>
          <Badge color={getProtectionColor(protectionPct)} size="lg">
            Protection: {protectionPct}%
          </Badge>
        </div>
      </div>

      {/* Protection Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Niveau de Protection</span>
          <span className="text-lg font-semibold">{protectionPct}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              protectionPct >= 90 ? 'bg-green-500' : protectionPct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${protectionPct}%` }}
          />
        </div>
      </Card>

      {/* Engine Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">État moteur Sentinel</span>
          <Badge color={getHealthColor(sentinel.health)} size="sm">
            {sentinel.health}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-500">{sentinel.alert_count}</div>
            <div className="text-xs text-gray-400">Alertes détectées</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{sentinel.active_monitors}</div>
            <div className="text-xs text-gray-400">Moniteurs actifs</div>
          </div>
        </div>
      </Card>

      {/* Status */}
      <Card className="p-4 bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Moniteurs actifs:</span>
          <span className="font-semibold">{sentinel.active_monitors}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-400">Initialisé:</span>
          <span className="font-semibold">{sentinel.initialized ? '✅ Oui' : '⏳ Non'}</span>
        </div>
      </Card>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Dernière vérification:{' '}
        {sentinel.last_check_ms > 0
          ? new Date(sentinel.last_check_ms).toLocaleTimeString()
          : 'Non encore effectuée'}
      </div>
    </div>
  );
}
