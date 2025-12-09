/**
 * TITANE∞ v20.0 — Logs Section
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDevToolsStore, type LogLevel } from '../store/devtools.store';
import { SectionHeader, LogLine, LogFilters } from '../components';

/**
 * Logs - Visualisation temps réel des logs système
 */
export function Logs() {
  const { logs, autoScrollLogs, setAutoScrollLogs, clearLogs } = useDevToolsStore();
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScrollLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScrollLogs]);

  // Detect manual scroll up
  const handleScroll = () => {
    if (!logsContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (isAtBottom !== autoScrollLogs) {
      setAutoScrollLogs(isAtBottom);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (selectedLevel !== 'all' && log.level !== selectedLevel) return false;
    if (selectedEngine !== 'all' && log.source !== selectedEngine) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const engineList = Array.from(new Set(logs.map((l) => l.source)));

  return (
    <div className="space-y-4 h-full flex flex-col">
      <SectionHeader
        title="System Logs"
        description="Logs temps réel de tous les moteurs"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150 hover:bg-opacity-80"
              style={{
                background: 'var(--bg-surface, #181c21)',
                color: 'var(--text-primary, #e0e0e0)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
            >
              Clear Logs
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-scroll"
                checked={autoScrollLogs}
                onChange={(e) => setAutoScrollLogs(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label
                htmlFor="auto-scroll"
                className="text-xs font-medium cursor-pointer"
                style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
              >
                Auto-scroll
              </label>
            </div>
          </div>
        }
      />

      {/* Filters */}
      <LogFilters
        selectedLevel={selectedLevel}
        selectedEngine={selectedEngine}
        searchQuery={searchQuery}
        engines={engineList}
        onLevelChange={setSelectedLevel}
        onEngineChange={setSelectedEngine}
        onSearchChange={setSearchQuery}
        onClear={() => {
          setSelectedLevel('all');
          setSelectedEngine('all');
          setSearchQuery('');
        }}
      />

      {/* Stats */}
      <div className="flex items-center gap-4">
        <span
          className="text-xs"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          Total: <span className="font-medium">{logs.length}</span>
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          Filtered: <span className="font-medium">{filteredLogs.length}</span>
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--text-danger, #8b5f5f)' }}
        >
          Errors: <span className="font-medium">{logs.filter((l) => l.level === 'error').length}</span>
        </span>
      </div>

      {/* Logs Container */}
      <div
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="flex-1 rounded-lg border overflow-y-auto"
        style={{
          background: 'var(--bg-panel, #101216)',
          borderColor: 'var(--border, rgba(196,196,196,0.12))',
          maxHeight: 'calc(100vh - 400px)',
        }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p
              className="text-sm"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              {logs.length === 0 ? 'No logs yet' : 'No logs match your filters'}
            </p>
          </div>
        ) : (
          <div>
            {filteredLogs.map((log) => (
              <LogLine
                key={log.id}
                log={log}
                onFilter={(source) => setSelectedEngine(source)}
                onCopy={(message) => navigator.clipboard.writeText(message)}
              />
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
