/**
 * TITANE∞ - Console Monitor Dashboard
 *
 * Visualisation en temps réel des statistiques de monitoring console
 */

import React, { useEffect, useState } from 'react';
import {
  consoleMonitor,
  type ConsoleStats,
  type ConsoleLogEntry,
} from '@/services/monitoring/consoleMonitor';

export const ConsoleMonitorDashboard: React.FC = () => {
  const [stats, setStats] = useState<ConsoleStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<ConsoleLogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(consoleMonitor.getStats());
      setRecentErrors(consoleMonitor.getErrors(10));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const errorRateClass =
    stats.errorRate >= 10
      ? 'text-red-500'
      : stats.errorRate >= 5
        ? 'text-yellow-500'
        : 'text-green-500';

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 z-50">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-sm">Console Monitor</span>
          <span className={`text-xs font-mono ${errorRateClass}`}>
            {stats.errorRate} err/min
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-700">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-800/50">
            <StatCard label="Logs" value={stats.totalLogs} />
            <StatCard
              label="Warnings"
              value={stats.totalWarnings}
              color="text-yellow-400"
            />
            <StatCard label="Errors" value={stats.totalErrors} color="text-red-400" />
          </div>

          {/* Top Errors */}
          {stats.topErrors.length > 0 && (
            <div className="p-3 border-t border-gray-700">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Top Errors</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {stats.topErrors.slice(0, 5).map((error, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs bg-gray-800 p-2 rounded"
                  >
                    <span className="truncate flex-1 text-gray-300" title={error.message}>
                      {error.message.substring(0, 40)}...
                    </span>
                    <span className="ml-2 text-red-400 font-mono">{error.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <div className="p-3 border-t border-gray-700">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Recent Errors</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {recentErrors.slice(0, 5).map((entry, i) => (
                  <div key={i} className="text-xs bg-gray-800 p-2 rounded space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-red-400 font-semibold">
                        {entry.level.toUpperCase()}
                      </span>
                      <span className="text-gray-500 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className="text-gray-300 font-mono truncate"
                      title={entry.message}
                    >
                      {entry.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                consoleMonitor.clear();
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                const allLogs = consoleMonitor.getRecentLogs(1000);
                const blob = new Blob([JSON.stringify(allLogs, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `console-logs-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors"
            >
              Export JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color?: string }> = ({
  label,
  value,
  color = 'text-blue-400',
}) => (
  <div className="text-center">
    <div className={`text-lg font-bold ${color}`}>{value.toLocaleString()}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);
