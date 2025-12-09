/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — useLogs Hook                                    ║
 * ║   Stream logs from Rust backend                                    ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { LogEntry, LogLevel } from '../types';

interface UseLogsOptions {
  filterLevel?: LogLevel;
  filterSource?: string;
  maxEntries?: number;
}

export function useLogs(options: UseLogsOptions = {}) {
  const { filterLevel, filterSource, maxEntries = 1000 } = options;

  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      unlisten = await listen<LogEntry>('log_event', (event) => {
        const log = event.payload;

        // Apply filters
        if (filterLevel && !shouldIncludeLevel(log.level, filterLevel)) {
          return;
        }

        if (filterSource && log.source !== filterSource) {
          return;
        }

        setLogs((prev) => {
          const updated = [log, ...prev];
          // Keep only maxEntries
          return updated.slice(0, maxEntries);
        });
      });
    };

    setupListener();

    return () => {
      unlisten?.();
    };
  }, [filterLevel, filterSource, maxEntries]);

  const clearLogs = () => {
    setLogs([]);
  };

  return { logs, clearLogs };
}

// Helper: Check if log level should be included based on filter
function shouldIncludeLevel(logLevel: LogLevel, filterLevel: LogLevel): boolean {
  const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
  const logIndex = levels.indexOf(logLevel);
  const filterIndex = levels.indexOf(filterLevel);
  return logIndex >= filterIndex;
}
