/**
 * TITANE∞ v35.1.8 - Enhanced LogViewer Component
 * Real-time log stream with filtering, search, and export
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { tauriClient } from '@/lib/tauriClient';

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  has_more: boolean;
}

interface LogViewerProps {
  maxLines?: number;
  autoScroll?: boolean;
  compact?: boolean;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  maxLines = 1000,
  autoScroll = true,
  compact = false,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'debug' | 'info' | 'warn' | 'error'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch logs from backend
  const fetchLogs = useCallback(async () => {
    if (isPaused) return;

    try {
      const result = (await tauriClient.getLogs({
        level: filter === 'all' ? null : filter,
        source: null,
        limit: maxLines,
        offset: 0,
      })) as LogsResponse;

      setLogs(result.logs);

      // Auto-scroll to bottom
      if (autoScroll && containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }, [isPaused, maxLines, filter, autoScroll]);

  // Poll logs every second
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, import.meta.env.DEV ? 1000 : 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Filter logs by search term
  const filteredLogs = logs.filter(
    log =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export logs to JSON
  const exportLogs = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titane-logs-${Date.now()}.json`;
    a.click();
  };

  // Clear all logs
  const clearLogs = async () => {
    try {
      await tauriClient.clearLogs();
      setLogs([]);
    } catch (error) {
      try {
        await tauriClient.clearSystemLogs();
        setLogs([]);
      } catch {
        console.error('Failed to clear logs:', error);
      }
    }
  };

  // Level color mapping
  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'debug':
        return 'text-titanium-text-tertiary';
      default:
        return 'text-titanium-text-secondary';
    }
  };

  return (
    <div className="log-viewer flex flex-col h-full bg-titanium-bg-base rounded-lg border border-titanium-border-default">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 border-b border-titanium-border-default">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-titanium-text-secondary">
            📋 Logs
          </span>
          <span className="text-xs text-titanium-text-disabled">
            ({filteredLogs.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1 text-sm bg-titanium-bg-elevated border border-titanium-border-strong rounded text-titanium-text-secondary focus:outline-none focus:border-blue-500"
          />

          {/* Level Filter */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="px-2 py-1 text-sm bg-titanium-bg-elevated border border-titanium-border-strong rounded text-titanium-text-secondary focus:outline-none"
          >
            <option value="all">All</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>

          {/* Pause/Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1 text-sm rounded ${
              isPaused
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-titanium-bg-interactive hover:bg-titanium-bg-overlay'
            } text-titanium-text-primary transition`}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>

          {/* Export */}
          <button
            onClick={exportLogs}
            className="px-3 py-1 text-sm bg-titanium-bg-interactive hover:bg-titanium-bg-overlay rounded text-titanium-text-primary transition"
          >
            💾 Export
          </button>

          {/* Clear */}
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded text-titanium-text-primary transition"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Log Stream */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto p-3 space-y-1 ${compact ? 'text-xs' : 'text-sm'} font-mono`}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center text-titanium-text-disabled py-8">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={`${log.timestamp}-${idx}`}
              className="flex gap-3 hover:bg-titanium-bg-elevated px-2 py-1 rounded transition"
            >
              {/* Timestamp */}
              <span className="text-titanium-text-disabled flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>

              {/* Level */}
              <span
                className={`${getLevelColor(log.level)} font-semibold flex-shrink-0 w-12`}
              >
                {log.level.toUpperCase()}
              </span>

              {/* Source */}
              <span className="text-blue-400 flex-shrink-0 max-w-[150px] truncate">
                [{log.source}]
              </span>

              {/* Message */}
              <span className="text-titanium-text-secondary flex-1">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
