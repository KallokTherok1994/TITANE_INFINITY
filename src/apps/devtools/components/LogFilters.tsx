/**
 * TITANE∞ v20.0 — LogFilters Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';
import type { LogLevel } from '../store/devtools.store';

export interface LogFiltersProps {
  selectedLevel: LogLevel | 'all';
  selectedEngine: string | 'all';
  searchQuery: string;
  engines: string[];
  onLevelChange: (level: LogLevel | 'all') => void;
  onEngineChange: (engine: string | 'all') => void;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  className?: string;
}

const levels: Array<LogLevel | 'all'> = ['all', 'info', 'warn', 'error', 'debug'];

/**
 * LogFilters - Filtres pour les logs DevTools
 *
 * @example
 * ```tsx
 * <LogFilters
 *   selectedLevel="error"
 *   selectedEngine="helios"
 *   searchQuery=""
 *   engines={['helios', 'nexus']}
 *   onLevelChange={(level) => setLevel(level)}
 *   onEngineChange={(engine) => setEngine(engine)}
 *   onSearchChange={(q) => setQuery(q)}
 *   onClear={() => clearFilters()}
 * />
 * ```
 */
export function LogFilters({
  selectedLevel,
  selectedEngine,
  searchQuery,
  engines,
  onLevelChange,
  onEngineChange,
  onSearchChange,
  onClear,
  className = '',
}: LogFiltersProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border ${className}`}
      style={{
        background: 'var(--bg-surface, #181c21)',
        borderColor: 'var(--border, rgba(196,196,196,0.12))',
      }}
    >
      {/* Level Filter */}
      <div className="flex items-center gap-2">
        <label
          className="text-xs font-medium"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          Level:
        </label>
        <div className="flex gap-1">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => onLevelChange(level)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all duration-150 ${
                selectedLevel === level ? 'ring-1' : ''
              }`}
              style={{
                background:
                  selectedLevel === level
                    ? 'var(--bg-primary, #727b81)'
                    : 'var(--bg-panel, #101216)',
                color:
                  selectedLevel === level
                    ? 'var(--text-inverse, #ffffff)'
                    : 'var(--text-primary, #e0e0e0)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Engine Filter */}
      <div className="flex items-center gap-2">
        <label
          className="text-xs font-medium"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          Engine:
        </label>
        <select
          value={selectedEngine}
          onChange={e => onEngineChange(e.target.value as string | 'all')}
          className="px-2 py-1 text-xs font-medium rounded border transition-all duration-150"
          style={{
            background: 'var(--bg-panel, #101216)',
            color: 'var(--text-primary, #e0e0e0)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        >
          <option value="all">All Engines</option>
          {engines.map(engine => (
            <option key={engine} value={engine}>
              {engine}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search logs..."
          className="w-full px-3 py-1 text-xs rounded border transition-all duration-150 focus:outline-none focus:ring-[3px] focus:ring-[rgba(114,123,129,0.6)]"
          style={{
            background: 'var(--bg-panel, #101216)',
            color: 'var(--text-primary, #e0e0e0)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        />
      </div>

      {/* Clear */}
      <button
        onClick={onClear}
        className="px-3 py-1 text-xs font-medium rounded border transition-colors duration-150 hover:bg-opacity-80"
        style={{
          background: 'var(--bg-surface, #181c21)',
          color: 'var(--text-primary, #e0e0e0)',
          borderColor: 'var(--border, rgba(196,196,196,0.12))',
        }}
      >
        Clear Filters
      </button>
    </div>
  );
}
