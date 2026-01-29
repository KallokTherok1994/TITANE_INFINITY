/**
 * TITANE∞ v26.4.0 — LogLine Component
 * Single log entry display
 */

import type { LogEntry, LogLevel } from '@/types';

export interface LogLineProps {
  log: LogEntry;
  highlight?: boolean;
}

export function LogLine({ log, highlight }: LogLineProps) {
  const levelColors: Partial<Record<LogLevel, string>> = {
    debug: 'text-gray-400',
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    Info: 'text-blue-400',
    Warning: 'text-yellow-400',
    Error: 'text-red-400',
  };

  const bgColor = highlight ? 'bg-blue-900/20' : 'hover:bg-gray-800';

  return (
    <div className={`p-2 font-mono text-sm ${bgColor} border-b border-gray-800`}>
      <div className="flex gap-3">
        <span className="text-gray-500 text-xs">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        <span className={`font-medium ${levelColors[log.level]}`}>
          {log.level.toUpperCase()}
        </span>
        {log.category && <span className="text-gray-400 text-xs">[{log.category}]</span>}
        <span className="flex-1 text-white">{log.message}</span>
      </div>
      {log.details && (
        <div className="mt-1 ml-20 text-gray-400 text-xs">
          {JSON.stringify(log.details, null, 2)}
        </div>
      )}
    </div>
  );
}
