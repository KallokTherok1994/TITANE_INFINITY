/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — Logs Panel                                      ║
 * ║   Stream and filter logs from Rust backend                         ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from 'react';
import { useLogs } from '../hooks/useLogs';
import { Badge } from '../components/Badge';
import type { LogLevel } from '../types';
import './LogsPanel.css';

const LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

export const LogsPanel: React.FC = () => {
  const [filterLevel, setFilterLevel] = useState<LogLevel>('INFO');
  const [filterSource, setFilterSource] = useState<string>('');
  const { logs, clearLogs } = useLogs({
    filterLevel,
    filterSource: filterSource || undefined,
  });

  return (
    <div className="logs-panel">
      <div className="panel-header">
        <h2 className="panel-title">📝 Logs</h2>
        <div className="panel-actions">
          <select
            className="filter-select"
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value as LogLevel)}
          >
            {LOG_LEVELS.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="filter-input"
            placeholder="Filter by source..."
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={clearLogs}>
            Clear
          </button>
        </div>
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="empty-message">No logs to display</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`log-entry log-${log.level.toLowerCase()}`}>
              <div className="log-header">
                <Badge
                  variant={
                    log.level === 'ERROR' || log.level === 'FATAL'
                      ? 'error'
                      : log.level === 'WARN'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {log.level}
                </Badge>
                <span className="log-source">{log.source}</span>
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="log-message">{log.message}</div>
              {log.metadata && (
                <details className="log-metadata">
                  <summary>Metadata</summary>
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                </details>
              )}
              {log.stack_trace && (
                <details className="log-stacktrace">
                  <summary>Stack Trace</summary>
                  <pre>{log.stack_trace}</pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
