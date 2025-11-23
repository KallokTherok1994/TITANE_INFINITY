/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 5: Virtual Command Stats Table
 * Table optimisée avec virtual scrolling (react-window)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { ServiceMetrics } from '../../lib/serviceMetrics';
import { ArrowUp, ArrowDown, Clock, AlertCircle, Activity } from 'lucide-react';

type SortColumn = 'command' | 'calls' | 'avgLatency' | 'errorRate';
type SortDirection = 'asc' | 'desc';

export interface VirtualCommandStatsTableProps {
  limit?: number;
  mode?: 'volume' | 'latency' | 'errors';
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  height?: number; // Hauteur du container virtuel
  rowHeight?: number; // Hauteur d'une ligne
}

export const VirtualCommandStatsTable: React.FC<VirtualCommandStatsTableProps> = ({
  limit = 100,
  mode = 'volume',
  autoRefresh = true,
  refreshInterval = 5000,
  className = '',
  height = 600,
}) => {
  const [stats, setStats] = useState<ReturnType<typeof ServiceMetrics.getTopCommands>>([]);
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
      console.error('Erreur chargement command stats:', error);
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

      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [stats, sortColumn, sortDirection]);

  // Icône tri
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  // Format temps relatif
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 1000) return "À l'instant";
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}j`;
  };

  // Couleur selon valeur
  const getLatencyColor = (latency: number) => {
    if (latency < 1000) return 'text-green-500';
    if (latency < 5000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getErrorRateColor = (errorRate: number) => {
    if (errorRate < 0.1) return 'text-green-500';
    if (errorRate < 0.3) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Mode titres
  const modeConfig = {
    volume: {
      title: 'Top Commandes (Volume)',
      icon: Activity,
      color: 'blue',
    },
    latency: {
      title: 'Commandes Lentes',
      icon: Clock,
      color: 'yellow',
    },
    errors: {
      title: 'Commandes à Erreurs',
      icon: AlertCircle,
      color: 'red',
    },
  };

  const config = modeConfig[mode];
  const Icon = config.icon;

  // Render row (virtual)
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const stat = sortedStats[index];
    if (!stat) return null;

    return (
      <div
        style={style}
        className="flex items-center border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
      >
        {/* Rank */}
        <div className="w-12 px-2 text-sm text-gray-500 font-mono">
          #{index + 1}
        </div>

        {/* Command */}
        <div className="flex-1 px-4 text-sm font-mono truncate" title={stat.command}>
          {stat.command}
        </div>

        {/* Calls */}
        <div className="w-24 px-4 text-sm text-right font-semibold">
          {stat.calls.toLocaleString()}
        </div>

        {/* Avg Latency */}
        <div className={`w-28 px-4 text-sm text-right font-semibold ${getLatencyColor(stat.avgLatency)}`}>
          {stat.avgLatency < 1000
            ? `${stat.avgLatency}ms`
            : `${(stat.avgLatency / 1000).toFixed(2)}s`}
        </div>

        {/* Error Rate */}
        <div className={`w-24 px-4 text-sm text-right font-semibold ${getErrorRateColor(stat.errorRate)}`}>
          {(stat.errorRate * 100).toFixed(1)}%
        </div>

        {/* Last Call */}
        <div className="w-28 px-4 text-sm text-right text-gray-400">
          {formatTime(stat.lastCall)}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 text-${config.color}-500`} />
          <h3 className="text-lg font-semibold text-white">{config.title}</h3>
          <span className="text-sm text-gray-400">
            ({sortedStats.length} commandes)
          </span>
        </div>
      </div>

      {/* Table Header (Fixed) */}
      <div className="flex items-center bg-gray-800/50 border-b border-gray-700 text-sm font-medium text-gray-300">
        <div className="w-12 px-2">#</div>
        <button
          onClick={() => handleSort('command')}
          className="flex-1 px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center"
        >
          Commande
          <SortIcon column="command" />
        </button>
        <button
          onClick={() => handleSort('calls')}
          className="w-24 px-4 py-3 text-right hover:bg-gray-700/50 transition-colors flex items-center justify-end"
        >
          Appels
          <SortIcon column="calls" />
        </button>
        <button
          onClick={() => handleSort('avgLatency')}
          className="w-28 px-4 py-3 text-right hover:bg-gray-700/50 transition-colors flex items-center justify-end"
        >
          Latence
          <SortIcon column="avgLatency" />
        </button>
        <button
          onClick={() => handleSort('errorRate')}
          className="w-24 px-4 py-3 text-right hover:bg-gray-700/50 transition-colors flex items-center justify-end"
        >
          Erreurs
          <SortIcon column="errorRate" />
        </button>
        <div className="w-28 px-4 py-3 text-right">Dernier</div>
      </div>

      {/* Standard List (Virtual scrolling removed due to react-window compatibility) */}
      <div style={{ maxHeight: height, overflowY: 'auto' }} className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {sortedStats.length > 0 ? (
          sortedStats.map((_, index) => (
            <div key={index}>{Row({ index, style: {} })}</div>
          ))
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-400">
            Aucune donnée disponible
          </div>
        )}
      </div>
    </div>
  );
};
