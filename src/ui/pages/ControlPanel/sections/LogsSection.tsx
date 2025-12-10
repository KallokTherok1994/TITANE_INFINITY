/**
 * TITANE∞ OS - Section Logs
 * Visualisation logs temps réel
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

export const LogsSection: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogs = async () => {
    try {
      const logEntries = await secureInvoke<LogEntry[]>('get_logs', { limit: 100 });
      setLogs(logEntries);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    }
  };

  const clearLogs = async () => {
    try {
      await secureInvoke('clear_logs');
      setLogs([]);
    } catch (error) {
      console.error('Erreur nettoyage logs:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'error':
        return 'cp-log-error';
      case 'warn':
        return 'cp-log-warn';
      default:
        return 'cp-log-info';
    }
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Logs</h2>
        <div className="cp-section-actions">
          <select
            className="cp-input"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">Tous</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Erreur</option>
          </select>
          <button
            className={`cp-button secondary ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Auto-refresh'}
          </button>
          <button className="cp-button danger" onClick={clearLogs}>
            🗑️ Effacer
          </button>
        </div>
      </div>

      <div className="cp-card">
        <div className="cp-logs-container">
          {filteredLogs.length === 0 ? (
            <div className="cp-logs-empty">
              <p>Aucun log disponible</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className={`cp-log-entry ${getLevelClass(log.level)}`}>
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
