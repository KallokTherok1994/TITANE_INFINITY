/**
 * TITANE∞ v35.1.8 — LogLine Component
 * Single log entry display
 */

import type { LogEntry, LogLevel } from '@/types';

export interface LogLineProps {
  log: LogEntry;
  highlight?: boolean;
}

export function LogLine({ log, highlight }: LogLineProps) {
  const levelColors: Partial<Record<LogLevel, string>> = {
    debug: 'text-titanium-text-tertiary',
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    Info: 'text-blue-400',
    Warning: 'text-yellow-400',
    Error: 'text-red-400',
  };

  const bgColor = highlight ? 'bg-blue-900/20' : 'hover:bg-titanium-bg-elevated';

  return (
    <div
      className={`p-2 font-mono text-sm ${bgColor} border-b border-titanium-border-subtle`}
    >
      <div className="flex gap-3">
        <span className="text-titanium-text-disabled text-xs">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        <span className={`font-medium ${levelColors[log.level]}`}>
          {log.level.toUpperCase()}
        </span>
        {log.category && (
          <span className="text-titanium-text-tertiary text-xs">[{log.category}]</span>
        )}
        <span className="flex-1 text-titanium-text-primary">{log.message}</span>
      </div>
      {log.details && (
        <div className="mt-1 ml-20 text-titanium-text-tertiary text-xs">
          {JSON.stringify(log.details, null, 2)}
        </div>
      )}
    </div>
  );
}

LogLine.displayName = 'LogLine';
