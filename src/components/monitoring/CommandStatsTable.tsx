/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Command Stats Table Component
 * Table des statistiques commandes (top volume/latency/errors)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { ServiceMetrics } from '../../lib/serviceMetrics';
import { ArrowUp, ArrowDown, Clock, AlertCircle, Activity } from 'lucide-react';

type SortColumn = 'command' | 'calls' | 'avgLatency' | 'errorRate';
type SortDirection = 'asc' | 'desc';

export interface CommandStatsTableProps {
  limit?: number;
  mode?: 'volume' | 'latency' | 'errors';
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const CommandStatsTable: React.FC<CommandStatsTableProps> = ({
  limit = 10,
  mode = 'volume',
  autoRefresh = true,
  refreshInterval = 5000,
  className = '',
}) => {
  const [stats, setStats] = useState<ReturnType<typeof ServiceMetrics.getTopCommands>>(
    []
  );
  const [sortColumn, setSortColumn] = useState<SortColumn>('calls');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Charger stats selon mode
  const loadStats = React.useCallback(() => {
    try {
      switch (mode) {
        case 'volume':
          setStats(ServiceMetrics.getTopCommands(limit));
          break;
        case 'latency':
          setStats(ServiceMetrics.getSlowestCommands(limit));
          break;
        case 'errors':
          setStats(ServiceMetrics.getErrorProneCommands(limit));
          break;
      }
    } catch (error) {
      logger.error(
        'Failed to load command stats',
        { component: 'CommandStatsTable', action: 'loadStats', mode },
        error as Error
      );
    }
  }, [limit, mode]);

  // Auto-refresh
  useEffect(() => {
    loadStats();

    if (autoRefresh) {
      const interval = setInterval(loadStats, refreshInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [loadStats, autoRefresh, refreshInterval]);

  // Tri
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Trier données
  const sortedStats = React.useMemo(() => {
    return [...stats].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortColumn) {
        case 'command':
          aVal = a.command;
          bVal = b.command;
          break;
        case 'calls':
          aVal = a.calls;
          bVal = b.calls;
          break;
        case 'avgLatency':
          aVal = a.avgLatency;
          bVal = b.avgLatency;
          break;
        case 'errorRate':
          aVal = a.errorRate;
          bVal = b.errorRate;
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [stats, sortColumn, sortDirection]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  // Render sort icon
  const SortIcon: React.FC<{ column: SortColumn }> = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  // Titre selon mode
  const title =
    mode === 'volume'
      ? 'Top Commandes par Volume'
      : mode === 'latency'
        ? 'Commandes les Plus Lentes'
        : 'Commandes Error-Prone';

  const Icon = mode === 'volume' ? Activity : mode === 'latency' ? Clock : AlertCircle;

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800/50 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <span className="text-sm text-gray-400">({stats.length} entrées)</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th
                className="text-left py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('command')}
              >
                <div className="flex items-center gap-2">
                  Commande
                  <SortIcon column="command" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('calls')}
              >
                <div className="flex items-center justify-end gap-2">
                  Appels
                  <SortIcon column="calls" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('avgLatency')}
              >
                <div className="flex items-center justify-end gap-2">
                  Latence Moy.
                  <SortIcon column="avgLatency" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('errorRate')}
              >
                <div className="flex items-center justify-end gap-2">
                  Taux Erreurs
                  <SortIcon column="errorRate" />
                </div>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                Dernier Appel
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              sortedStats.map((stat, index) => (
                <tr
                  key={stat.command}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  {/* Command */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-white text-sm">
                        {stat.command}
                      </span>
                    </div>
                  </td>

                  {/* Calls */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-blue-400">
                      {stat.calls.toLocaleString('fr-FR')}
                    </span>
                  </td>

                  {/* Avg Latency */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-sm font-medium ${
                        stat.avgLatency > 5000
                          ? 'text-red-400'
                          : stat.avgLatency > 1000
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      }`}
                    >
                      {stat.avgLatency < 1000
                        ? `${stat.avgLatency}ms`
                        : `${(stat.avgLatency / 1000).toFixed(2)}s`}
                    </span>
                  </td>

                  {/* Error Rate */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-sm font-medium ${
                        stat.errorRate > 0.3
                          ? 'text-red-400'
                          : stat.errorRate > 0.1
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      }`}
                    >
                      {(stat.errorRate * 100).toFixed(1)}%
                    </span>
                  </td>

                  {/* Last Call */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-gray-400">
                      {formatTime(stat.lastCall)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommandStatsTable;
