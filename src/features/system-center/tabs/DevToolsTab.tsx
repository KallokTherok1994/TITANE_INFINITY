/**
 * TITANE∞ v∞ — DevTools Tab
 *
 * Onglet des outils développeur (logs, events)
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSystemLogs } from '../hooks/useSystemLogs';
import type { LogLevel } from '../types/systemCenter.types';

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const getLogLevelIcon = (level: LogLevel): string => {
  switch (level) {
    case 'Trace': return '🔍';
    case 'Debug': return '🐛';
    case 'Info': return 'ℹ️';
    case 'Warn': return '⚠️';
    case 'Error': return '❌';
    default: return '📝';
  }
};

const getLogLevelClass = (level: LogLevel): string => {
  return `sc-log--${level.toLowerCase()}`;
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${time}.${ms}`;
};

// ══════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════

export const DevToolsTab: React.FC = () => {
  const {
    logs,
    stats,
    isLoading,
    error,
    filter,
    setFilter,
    refreshLogs,
    clearLogs,
  } = useSystemLogs(true, 3000);

  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');

  // Update filter when level changes
  useEffect(() => {
    setFilter({
      ...filter,
      level: selectedLevel === 'all' ? undefined : selectedLevel,
    });
  }, [selectedLevel, setFilter, filter]);

  // Filtered logs
  const filteredLogs = selectedLevel === 'all'
    ? logs
    : logs.filter(log => log.level === selectedLevel);

  return (
    <div className="sc-devtools">
      {/* Stats Bar */}
      {stats && (
        <motion.div
          className="sc-stats-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="sc-stat">
            <span className="sc-stat-value">{stats.total_entries}</span>
            <span className="sc-stat-label">Total</span>
          </div>
          <div className="sc-stat sc-stat--error">
            <span className="sc-stat-value">{stats.by_level['ERROR'] || 0}</span>
            <span className="sc-stat-label">Erreurs</span>
          </div>
          <div className="sc-stat sc-stat--warn">
            <span className="sc-stat-value">{stats.by_level['WARN'] || 0}</span>
            <span className="sc-stat-label">Warnings</span>
          </div>
          <div className="sc-stat sc-stat--info">
            <span className="sc-stat-value">{stats.by_level['INFO'] || 0}</span>
            <span className="sc-stat-label">Info</span>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="sc-controls">
        <div className="sc-filter-group">
          <label>Niveau:</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
            className="sc-select"
          >
            <option value="all">Tous</option>
            <option value="Error">Erreurs</option>
            <option value="Warn">Warnings</option>
            <option value="Info">Info</option>
            <option value="Debug">Debug</option>
            <option value="Trace">Trace</option>
          </select>
        </div>

        <div className="sc-toggle-group">
          <label className="sc-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            <span>Auto-scroll</span>
          </label>
        </div>

        <div className="sc-action-group">
          <button
            className="sc-btn sc-btn--small"
            onClick={refreshLogs}
            disabled={isLoading}
          >
            🔄 Rafraîchir
          </button>
          <button
            className="sc-btn sc-btn--small sc-btn--danger"
            onClick={clearLogs}
          >
            🗑️ Effacer
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="sc-error">
          <span className="sc-error-icon">⚠️</span>
          <span className="sc-error-message">{error}</span>
        </div>
      )}

      {/* Logs List */}
      <div className={`sc-logs-container ${autoScroll ? 'sc-logs--auto-scroll' : ''}`}>
        {filteredLogs.length === 0 ? (
          <div className="sc-empty-state">
            <span className="sc-empty-icon">📋</span>
            <p>Aucun log à afficher</p>
          </div>
        ) : (
          <div className="sc-logs-list">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                className={`sc-log ${getLogLevelClass(log.level)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index * 0.01, 0.5) }}
              >
                <span className="sc-log-time">{formatTimestamp(log.timestamp)}</span>
                <span className="sc-log-icon">{getLogLevelIcon(log.level)}</span>
                <span className="sc-log-level">{log.level}</span>
                <span className="sc-log-source">[{log.source}]</span>
                <span className="sc-log-message">{log.message}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevToolsTab;
