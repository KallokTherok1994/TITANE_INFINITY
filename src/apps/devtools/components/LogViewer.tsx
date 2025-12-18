/**
 * TITANE∞ v22.0 — LogViewer Component
 * Real-time log streaming with advanced filtering capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import './LogViewer.css';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  correlation_id?: string;
  metadata?: Record<string, unknown>;
}

interface LogStats {
  total: number;
  debug: number;
  info: number;
  warn: number;
  error: number;
  critical: number;
}

interface LogsResponse {
  success: boolean;
  data?: LogEntry[];
  error?: string;
}

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    critical: 0,
  });

  // Update statistics
  const updateStats = useCallback((logEntries: LogEntry[]) => {
    const newStats: LogStats = {
      total: logEntries.length,
      debug: logEntries.filter(l => l.level === 'DEBUG').length,
      info: logEntries.filter(l => l.level === 'INFO').length,
      warn: logEntries.filter(l => l.level === 'WARN').length,
      error: logEntries.filter(l => l.level === 'ERROR').length,
      critical: logEntries.filter(l => l.level === 'CRITICAL').length,
    };
    setStats(newStats);
  }, []);

  // Fetch logs from backend
  const fetchLogs = useCallback(async () => {
    try {
      const response = await secureInvoke<LogsResponse>('get_system_logs', {
        limit: 500,
      });
      if (response.success && response.data) {
        setLogs(response.data);
        updateStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }, [updateStats]);
    setStats(newStats);
  };

  // Apply filters
  useEffect(() => {
    let filtered = logs;

    // Level filter
    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Source filter
    if (sourceFilter) {
      filtered = filtered.filter(log =>
        log.source.toLowerCase().includes(sourceFilter.toLowerCase())
      );
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, levelFilter, sourceFilter, searchQuery]);

  // Auto-refresh effect
  useEffect(() => {
    fetchLogs();
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchLogs]); // Fixed deps

  // Clear logs
  const handleClear = async () => {
    try {
      await secureInvoke('clear_system_logs');
      setLogs([]);
      setFilteredLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  // Copy correlation ID
  const copyCorrelationId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  // Get level color
  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'DEBUG':
        return '#6b7280';
      case 'INFO':
        return '#3b82f6';
      case 'WARN':
        return '#f59e0b';
      case 'ERROR':
        return '#ef4444';
      case 'CRITICAL':
        return '#dc2626';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div className="log-viewer">
      {/* Stats Header */}
      <div className="log-stats">
        <div className="log-stat">
          <span className="log-stat-value">{stats.total}</span>
          <span className="log-stat-label">Total</span>
        </div>
        <div className="log-stat" style={{ color: getLevelColor('INFO') }}>
          <span className="log-stat-value">{stats.info}</span>
          <span className="log-stat-label">Info</span>
        </div>
        <div className="log-stat" style={{ color: getLevelColor('WARN') }}>
          <span className="log-stat-value">{stats.warn}</span>
          <span className="log-stat-label">Warn</span>
        </div>
        <div className="log-stat" style={{ color: getLevelColor('ERROR') }}>
          <span className="log-stat-value">{stats.error}</span>
          <span className="log-stat-label">Error</span>
        </div>
        <div className="log-stat" style={{ color: getLevelColor('CRITICAL') }}>
          <span className="log-stat-value">{stats.critical}</span>
          <span className="log-stat-label">Critical</span>
        </div>
      </div>

      {/* Filters */}
      <div className="log-filters">
        <select
          className="log-filter-select"
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
        >
          <option value="ALL">All Levels</option>
          <option value="DEBUG">Debug</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
        </select>

        <input
          type="text"
          className="log-filter-input"
          placeholder="Filter by source..."
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
        />

        <input
          type="text"
          className="log-filter-input"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <label className="log-toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
          />
          <span>Auto-refresh (2s)</span>
        </label>

        <button className="log-btn" onClick={fetchLogs}>
          🔄 Refresh
        </button>

        <button className="log-btn log-btn-danger" onClick={handleClear}>
          🗑️ Clear
        </button>
      </div>

      {/* Log Entries */}
      <div className="log-entries">
        {filteredLogs.length === 0 ? (
          <div className="log-empty">
            <span>📋</span>
            <p>No logs to display</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`log-entry log-entry-${log.level.toLowerCase()}`}
            >
              <div className="log-entry-header">
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className="log-level"
                  style={{ backgroundColor: getLevelColor(log.level), color: 'white' }}
                >
                  {log.level}
                </span>
                <span className="log-source">{log.source}</span>
                {log.correlation_id && (
                  <button
                    className="log-copy-btn"
                    onClick={() => copyCorrelationId(log.correlation_id || '')}
                    title="Copy correlation ID"
                  >
                    📋 {log.correlation_id?.substring(0, 8)}
                  </button>
                )}
              </div>
              <div className="log-message">{log.message}</div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="log-metadata">
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
