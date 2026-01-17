/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.0.0 — DEV-SUDO MODE HANDLER (Refactored - Phase 2 Day 1)
 *   Détection et exécution des commandes développeur dans le Chat IA
 *   Modular architecture with extracted pattern matching and execution logic
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { DevSudoCommand, DevSudoAction } from './types';
import { DEV_SUDO_PATTERNS } from './devSudoPatterns';
import { executeDevSudoCommand } from './devSudoExecutor';

// Re-export types for external consumers
export type { DevSudoCommand, DevSudoAction, DevSudoResult } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// DÉTECTION DES COMMANDES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si le message contient une commande DEV-SUDO
 */
export function containsDevSudoCommand(message: string): boolean {
  const trimmed = message.trim();

  // Commandes simples
  for (const patterns of Object.values(DEV_SUDO_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Parse le message pour extraire la commande DEV-SUDO
 */
export function parseDevSudoCommand(message: string): DevSudoCommand | null {
  const trimmed = message.trim();

  for (const [action, patterns] of Object.entries(DEV_SUDO_PATTERNS)) {
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return {
          type: 'dev-sudo',
          action: action as DevSudoAction,
          params: extractParams(action as DevSudoAction, match),
          raw: trimmed,
        };
      }
    }
  }

  return null;
}

function extractParams(
  action: DevSudoAction,
  match: RegExpMatchArray
): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  switch (action) {
    case 'analyze-module':
    case 'repair-component':
    case 'show-code':
      params.target = match[2] ?? match[1] ?? '';
      break;

    case 'fix-error':
      params.error = match[4] ?? match[2] ?? '';
      break;

    case 'merge-opus':
      params.opus1 = match[1] ?? '';
      params.opus2 = match[3] ?? match[2] ?? '';
      break;

    case 'create-component':
    case 'add-feature':
      params.name = match[2] ?? match[1] ?? '';
      break;

    case 'whitelist-tauri':
      params.command = match[1] ?? match[2] ?? '';
      break;

    // Console commands
    case 'console-ls':
      params.path = match[3] ?? match[2] ?? '/src';
      break;

    case 'console-open':
    case 'console-patch':
      params.target = match[2] ?? match[1] ?? '';
      break;

    // Test commands
    case 'test-module':
      params.module = match[2] ?? match[1] ?? '';
      break;

    // API commands
    case 'connect-api':
    case 'test-api':
      params.api = match[1] ?? '';
      break;

    // IDE Mode commands
    case 'open-file':
    case 'view-file':
    case 'patch-file':
    case 'explain-code':
      params.file = match[1] ?? '';
      break;

    case 'create-file':
      params.file = match[3] ?? match[1] ?? '';
      params.content = '';
      break;

    case 'goto-function':
      params.function = match[2] ?? match[1] ?? '';
      break;

    case 'goto-component':
      params.component = match[2] ?? match[1] ?? '';
      break;

    case 'goto-handler':
      params.handler = match[2] ?? match[1] ?? '';
      break;

    case 'copilot-suggest':
    case 'auto-complete':
      params.context = match[1] ?? '';
      break;

    case 'refactor-component':
      params.component = match[2] ?? match[1] ?? '';
      break;

    case 'refactor-hook':
      params.hook = match[2] ?? match[1] ?? '';
      break;

    case 'refactor-handler':
      params.handler = match[3] ?? match[2] ?? match[1] ?? '';
      break;

    case 'generate-module':
      params.module = match[3] ?? match[2] ?? match[1] ?? '';
      break;

    case 'code-review':
      params.target = match[3] ?? match[2] ?? match[1] ?? '';
      break;

    // Backend & API Master commands
    case 'fix-handler':
      params.target = match[1] ?? '';
      break;

    case 'create-api':
      params.name = match[1] ?? '';
      break;

    case 'whitelist-command':
      params.commandName = match[1] ?? '';
      break;

    // Memory Eternal Engine commands
    case 'memory-import':
      params.filePath = match[1] ?? '';
      break;

    // Hybrid Engine commands (Super Prompt #16) v∞.26.0
    case 'hybrid-heal': {
      // Extraire target= si présent
      const healMatch = action.match(/target=(\S+)/);
      const healTarget = healMatch?.[1];
      params.target = healTarget ?? 'all';
      break;
    }

    case 'hybrid-inspect': {
      // Extraire path= depuis le raw command
      const inspectMatch = action.match(/path=(\S+)/);
      const inspectPath = inspectMatch?.[1];
      params.path = inspectPath ?? match[1] ?? '';
      break;
    }

    case 'hybrid-fix': {
      // Extraire target= depuis le raw command
      const fixMatch = action.match(/target=(\S+)/);
      const fixTarget = fixMatch?.[1];
      params.target = fixTarget ?? match[1] ?? '';
      break;
    }

    case 'hybrid-apply': {
      // Extraire file, lineStart, lineEnd, newCode depuis le raw command
      const applyMatch = action.match(
        /file=(\S+)\s+lineStart=(\d+)\s+lineEnd=(\d+)\s+newCode=(.+)/
      );
      if (applyMatch) {
        const file = applyMatch[1];
        const lineStartStr = applyMatch[2];
        const lineEndStr = applyMatch[3];
        const newCode = applyMatch[4];
        if (file && lineStartStr && lineEndStr && newCode) {
          params.file = file;
          params.lineStart = parseInt(lineStartStr, 10);
          params.lineEnd = parseInt(lineEndStr, 10);
          params.newCode = newCode;
        }
      }
      break;
    }

    case 'hybrid-run': {
      // Extraire command= depuis le raw command
      const runMatch = action.match(/command="?(.+?)"?$/);
      const runCommand = runMatch?.[1];
      params.command = runCommand ?? match[1] ?? '';
      break;
    }

    case 'hybrid-logs': {
      // Extraire filter= si présent
      const logsMatch = action.match(/filter=(\S+)/);
      const logsFilter = logsMatch?.[1];
      params.filter = logsFilter;
      break;
    }

    // Fusion Engine commands (Super Prompt #17) v∞.27.0
    case 'fusion-export': {
      const formatMatch = match[1];
      params.format = formatMatch ?? 'json';
      break;
    }

    case 'fusion-merge': {
      const sourceMatch = match[1];
      params.source = sourceMatch ?? '';
      break;
    }

    // Vocal Dev Console commands (Super Prompt #18) v∞.28.0
    case 'vocal-run':
      params.commandText = match[1] ?? '';
      break;

    case 'vocal-inspect':
      params.target = match[1] ?? '';
      break;

    case 'vocal-set-model':
      params.modelName = match[1] ?? '';
      break;

    // Live Debugger Vocal commands (Super Prompt #19) v∞.29.0
    case 'live-on':
      params.mode = match[1] ?? 'minimal';
      break;

    case 'live-inspect':
      params.target = match[1] ?? '';
      break;

    case 'live-set-mode':
      params.modeName = match[1] ?? 'minimal';
      break;

    // Talk-To-TITANE Suite commands (Super Prompts #20-24) v∞.30.0
    case 'talk-on':
      params.mode = match[1] ?? 'conversation';
      break;

    case 'talk-mode':
      params.mode = match[1] ?? 'conversation';
      break;

    case 'talk-calibrate':
      params.tone = match[1] ?? 'balanced';
      break;

    case 'talk-history':
      params.limit = parseInt(match[1] ?? '10', 10);
      break;

    case 'conversation-export':
      params.format = match[1] ?? 'markdown';
      break;

    case 'timeline-show':
      params.limit = parseInt(match[1] ?? '20', 10);
      break;

    case 'timeline-export':
      params.format = match[1] ?? 'json';
      break;

    case 'selfheal-rebuild':
      params.filePath = match[1] ?? '';
      break;

    // AI Local Model commands (Super Prompt #12)
    case 'ia-set-default':
      params.modelName = match[1] ?? '';
      break;

    // AI Bubble Engine commands (Super Prompt #14)
    case 'chat-set-model':
      params.modelName = match[1] ?? '';
      break;

    // Data Collector Engine commands (Super Prompt #15)
    case 'dataset-add':
      params.filepath = match[1] ?? '';
      break;
  }

  return params;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const devSudoHandler = {
  containsCommand: containsDevSudoCommand,
  parseCommand: parseDevSudoCommand,
  executeCommand: executeDevSudoCommand,
};

export { executeDevSudoCommand };
