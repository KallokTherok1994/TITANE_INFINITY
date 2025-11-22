/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — SentinelAlerts
 * Visualisation des alertes et anomalies
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { useSystemStore } from '../../stores/systemStore';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import type { Severity, AlertCategory } from '../../services/tauri/backend-v17.2.types';

export function SentinelAlerts() {
  const { sentinel, loading, error, fetchSentinel } = useSystemStore();
  const [filter, setFilter] = useState<Severity | 'all'>('all');

  useEffect(() => {
    fetchSentinel();
    
    const interval = setInterval(() => {
      fetchSentinel();
    }, 3000); // Update every 3s

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

  const getSeverityColor = (severity: Severity): string => {
    switch (severity) {
      case 'Low': return 'blue';
      case 'Medium': return 'yellow';
      case 'High': return 'orange';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: AlertCategory): string => {
    switch (category) {
      case 'Performance': return '⚡';
      case 'Security': return '🛡️';
      case 'Stability': return '⚖️';
      case 'Resource': return '💾';
      default: return '❓';
    }
  };

  const getIntegrityColor = (score: number): string => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  const filteredAlerts = filter === 'all' 
    ? sentinel.alerts 
    : sentinel.alerts.filter(alert => alert.severity === filter);

  const unresolvedCount = sentinel.alerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sentinel — Détection d'Anomalies</h2>
        <div className="flex items-center gap-3">
          <Badge color={unresolvedCount > 0 ? 'red' : 'green'} size="lg">
            {unresolvedCount} non résolues
          </Badge>
          <Badge color={getIntegrityColor(sentinel.integrity_score)} size="lg">
            Intégrité: {sentinel.integrity_score.toFixed(0)}%
          </Badge>
        </div>
      </div>

      {/* Integrity Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Score d'Intégrité</span>
          <span className="text-lg font-semibold">{sentinel.integrity_score.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              sentinel.integrity_score >= 90
                ? 'bg-green-500'
                : sentinel.integrity_score >= 70
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${sentinel.integrity_score}%` }}
          />
        </div>
      </Card>

      {/* Severity Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'Low', 'Medium', 'High', 'Critical'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === sev
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {sev === 'all' ? 'Toutes' : sev}
            {sev !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                ({sentinel.alerts.filter(a => a.severity === sev).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center text-gray-400">
            Aucune alerte {filter !== 'all' ? `de niveau ${filter}` : ''}
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`p-4 ${alert.resolved ? 'opacity-50' : ''} hover:bg-gray-800 transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getCategoryIcon(alert.category)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge color={getSeverityColor(alert.severity)} size="sm">
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-gray-500">{alert.category}</span>
                    {alert.resolved && (
                      <Badge color="green" size="sm">Résolu</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300">{alert.message}</p>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {sentinel.alerts.filter(a => a.severity === 'Low').length}
            </div>
            <div className="text-xs text-gray-400">Low</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {sentinel.alerts.filter(a => a.severity === 'Medium').length}
            </div>
            <div className="text-xs text-gray-400">Medium</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">
              {sentinel.alerts.filter(a => a.severity === 'High').length}
            </div>
            <div className="text-xs text-gray-400">High</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {sentinel.alerts.filter(a => a.severity === 'Critical').length}
            </div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
        </div>
      </Card>

      {/* Scans Info */}
      <Card className="p-4 bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Scans effectués:</span>
          <span className="font-semibold">{sentinel.scans_performed}</span>
        </div>
      </Card>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Dernière mise à jour: {new Date(sentinel.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
