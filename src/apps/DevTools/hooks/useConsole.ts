/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — useConsole Hook                                 ║
 * ║   Execute internal commands via DevTools console                   ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ConsoleCommand, ConsoleResult } from '../types';

export function useConsole() {
  const [history, setHistory] = useState<ConsoleResult[]>([]);
  const [executing, setExecuting] = useState(false);

  const executeCommand = async (command: string): Promise<ConsoleResult> => {
    setExecuting(true);

    const cmd: ConsoleCommand = {
      command,
      timestamp: Date.now(),
    };

    try {
      const result = await invoke<unknown>('devtools_command', { command: cmd.command });

      const consoleResult: ConsoleResult = {
        command: cmd.command,
        result,
        success: true,
        timestamp: Date.now(),
      };

      setHistory((prev) => [consoleResult, ...prev]);
      return consoleResult;
    } catch (err) {
      const consoleResult: ConsoleResult = {
        command: cmd.command,
        result: null,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now(),
      };

      setHistory((prev) => [consoleResult, ...prev]);
      return consoleResult;
    } finally {
      setExecuting(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    executing,
    executeCommand,
    clearHistory,
  };
}
