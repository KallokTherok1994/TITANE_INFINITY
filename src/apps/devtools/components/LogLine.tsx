/**
 * TITANE∞ v20.0 — LogLine Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';
import type { LogEntry, LogLevel } from '../store/devtools.store';

export interface LogLineProps {
  log: LogEntry;
  onFilter?: (source: string) => void;
  onCopy?: (message: string) => void;
  className?: string;
}

const levelStyles: Record<LogLevel, { bg: string; text: string; label: string }> = {
  info: {
    bg: 'rgba(114, 123, 129, 0.10)',
    text: 'var(--text-info, #727b81)',
    label: 'INFO',
  },
  warn: {
    bg: 'rgba(227, 213, 213, 0.10)',
    text: 'var(--text-warning, #e3d5d5)',
    label: 'WARN',
  },
  error: {
    bg: 'rgba(139, 95, 95, 0.10)',
    text: 'var(--text-danger, #8b5f5f)',
    label: 'ERROR',
  },
  debug: {
    bg: 'rgba(255, 255, 255, 0.05)',
    text: 'var(--text-muted, rgba(255,255,255,0.60))',
    label: 'DEBUG',
  },
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 1000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

/**
 * LogLine - Ligne de log avec couleur sémantique
 *
 * @example
 * ```tsx
 * <LogLine
 *   log={logEntry}
 *   onFilter={(source) => console.log('Filter by', source)}
 *   onCopy={(msg) => navigator.clipboard.writeText(msg)}
 * />
 * ```
 */
export function LogLine({ log, onFilter, onCopy, className = '' }: LogLineProps) {
  const styles = levelStyles[log.level];

  return (
    <div
      className={`flex items-start gap-3 px-3 py-2 border-b hover:bg-opacity-50 transition-colors duration-150 font-mono text-xs ${className}`}
      style={{
        background: styles.bg,
        borderColor: 'var(--border, rgba(196,196,196,0.08))',
      }}
    >
      {/* Timestamp */}
      <span
        className="flex-shrink-0 w-16 text-xs"
        style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        title={new Date(log.timestamp).toLocaleString()}
      >
        {formatRelativeTime(log.timestamp)}
      </span>

      {/* Level */}
      <span
        className="flex-shrink-0 w-12 font-bold text-xs"
        style={{ color: styles.text }}
      >
        {styles.label}
      </span>

      {/* Source */}
      <button
        onClick={() => onFilter?.(log.source)}
        className="flex-shrink-0 w-24 text-left text-xs font-medium hover:underline truncate"
        style={{ color: 'var(--text-primary, #e0e0e0)' }}
        title={`Filter by ${log.source}`}
      >
        [{log.source}]
      </button>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs break-words"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          {log.message}
        </p>
        {log.details && (
          <p
            className="text-xs mt-1 opacity-70"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            {log.details}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {onCopy && (
          <button
            onClick={() => onCopy(log.message)}
            className="px-2 py-1 text-xs rounded hover:bg-white hover:bg-opacity-10 transition-colors"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            title="Copy message"
          >
            📋
          </button>
        )}
      </div>
    </div>
  );
}
