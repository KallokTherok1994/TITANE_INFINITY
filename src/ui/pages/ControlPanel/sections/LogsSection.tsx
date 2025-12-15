/**
 * TITANE∞ OS v24.7 - Section Logs
 * Visualisation logs temps réel
 * Optimisé avec useCallback et useMemo
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { secureInvoke } from '@/lib/security';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

const LOG_LEVEL_CLASSES: Record<string, string> = {
  error: 'cp-log-error',
  warn: 'cp-log-warn',
  info: 'cp-log-info',
};

export const LogsSection: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadLogs = useCallback(async () => {
    try {
      const logEntries = await secureInvoke<LogEntry[]>('get_logs', { limit: 100 });
      setLogs(logEntries);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    }
  }, []);

  useEffect(() => {
    loadLogs();
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadLogs]);

  const clearLogs = useCallback(async () => {
    try {
      await secureInvoke('clear_logs');
      setLogs([]);
    } catch (error) {
      console.error('Erreur nettoyage logs:', error);
    }
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  }, []);

  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter(log => log.level === filter);
  }, [logs, filter]);

  const getLevelClass = useCallback((level: string) => {
    return LOG_LEVEL_CLASSES[level] || 'cp-log-info';
  }, []);

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Logs</h2>
        <div className="cp-section-actions">
          <select
            className="cp-input"
            value={filter}
            onChange={handleFilterChange}
            style={{ width: '150px' }}
            aria-label="Filtrer les logs par niveau"
          >
            <option value="all">Tous</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Erreur</option>
          </select>
          <button
            className={`cp-button secondary ${autoRefresh ? 'active' : ''}`}
            onClick={toggleAutoRefresh}
            aria-pressed={autoRefresh}
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Auto-refresh'}
          </button>
          <button className="cp-button danger" onClick={clearLogs}>
            🗑️ Effacer
          </button>
        </div>
      </div>

      <div className="cp-card">
        <div className="cp-logs-container" role="log" aria-live="polite">
          {filteredLogs.length === 0 ? (
            <div className="cp-logs-empty">
              <p>Aucun log disponible</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                className={`cp-log-entry ${getLevelClass(log.level)}`}
              >
                <span className="cp-log-timestamp">{log.timestamp}</span>
                <span className="cp-log-level">{log.level.toUpperCase()}</span>
                <span className="cp-log-source">[{log.source}]</span>
                <span className="cp-log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
