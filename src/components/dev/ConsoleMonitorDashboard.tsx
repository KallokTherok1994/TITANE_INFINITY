/**
 * TITANE∞ - Console Monitor Dashboard
 *
 * Visualisation en temps réel des statistiques de monitoring console
 * Enhanced v2.0 - Résolution augmentée, mise en page optimisée
 */

import React, { useEffect, useState } from 'react';
import {
  consoleMonitor,
  type ConsoleStats,
  type ConsoleLogEntry,
} from '@/services/monitoring/consoleMonitor';
import './ConsoleMonitorDashboard.css';

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
    <div className="fixed bottom-4 right-4 bg-gray-950 text-white rounded-xl shadow-2xl border-2 border-gray-700 z-50 min-w-105 backdrop-blur-sm">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/80 transition-all duration-200 rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
          <span className="font-bold text-base tracking-wide">Console Monitor</span>
          <span
            className={`text-sm font-mono font-bold px-3 py-1 rounded ${errorRateClass} bg-gray-800/60`}
          >
            {stats.errorRate} err/min
          </span>
        </div>
        <button
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-all"
          aria-label={isExpanded ? 'Réduire' : 'Agrandir'}
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t-2 border-gray-700">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-linear-to-br from-gray-800/60 to-gray-900/60">
            <StatCard label="Logs" value={stats.totalLogs} icon="📝" />
            <StatCard
              label="Warnings"
              value={stats.totalWarnings}
              color="text-yellow-400"
              icon="⚠️"
            />
            <StatCard
              label="Errors"
              value={stats.totalErrors}
              color="text-red-400"
              icon="❌"
            />
          </div>

          {/* Top Errors */}
          {stats.topErrors.length > 0 && (
            <div className="p-4 border-t-2 border-gray-700">
              <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                <span>🔥</span> Top Errors
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {stats.topErrors.slice(0, 5).map((error, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm bg-gray-800/70 p-3 rounded-lg hover:bg-gray-700/70 transition-colors border border-gray-700/50"
                  >
                    <span
                      className="truncate flex-1 text-gray-200 font-medium"
                      title={error.message}
                    >
                      {error.message.substring(0, 50)}...
                    </span>
                    <span className="ml-3 text-red-400 font-mono font-bold bg-red-900/30 px-2 py-1 rounded">
                      {error.count}×
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <div className="p-4 border-t-2 border-gray-700">
              <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                <span>🕐</span> Recent Errors
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {recentErrors.slice(0, 5).map((entry, i) => (
                  <div
                    key={i}
                    className="text-sm bg-gray-800/70 p-3 rounded-lg space-y-2 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-red-400 font-bold text-xs px-2 py-1 bg-red-900/30 rounded">
                        {entry.level.toUpperCase()}
                      </span>
                      <span className="text-gray-400 font-mono text-xs">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className="text-gray-200 font-mono text-xs leading-relaxed wrap-break-word"
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
          <div className="p-4 border-t-2 border-gray-700 flex gap-3 bg-gray-900/50 rounded-b-xl">
            <button
              onClick={e => {
                e.stopPropagation();
                consoleMonitor.clear();
              }}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-500"
              title="Effacer tous les logs"
            >
              <span>🗑️</span>
              Clear Logs
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                const allLogs = consoleMonitor.getRecentLogs(1000);

                // Sanitize logs: remove circular references and complex objects
                const sanitizedLogs = allLogs.map(log => ({
                  timestamp: log.timestamp,
                  level: log.level,
                  message: log.message,
                  stack: log.stack,
                  // Serialize args safely by converting to string
                  args: log.args.map(arg => {
                    try {
                      // Check if it's a primitive or simple object
                      if (arg === null || arg === undefined) return arg;
                      if (typeof arg !== 'object') return arg;
                      // For objects, try to extract useful info without circular refs
                      if (arg instanceof Error) {
                        return { error: arg.message, stack: arg.stack };
                      }
                      // For DOM elements, extract tag name
                      if (arg instanceof Element) {
                        return `[${arg.tagName}]`;
                      }
                      // For other objects, use string representation
                      return String(arg);
                    } catch {
                      return '[Complex Object]';
                    }
                  }),
                }));

                const blob = new Blob([JSON.stringify(sanitizedLogs, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `console-logs-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-blue-500 hover:border-blue-400 shadow-lg shadow-blue-600/30"
              title="Exporter les logs en JSON"
            >
              <span>📥</span>
              Export JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  color?: string;
  icon?: string;
}> = ({ label, value, color = 'text-blue-400', icon }) => (
  <div className="text-center p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all hover:scale-105">
    {icon && <div className="text-2xl mb-1">{icon}</div>}
    <div className={`text-2xl font-bold ${color} mb-1`}>{value.toLocaleString()}</div>
    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
      {label}
    </div>
  </div>
);
