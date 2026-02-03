/**
 * ✅ Compliance: Legacy chat_send_message usage forbidden in runtime code
 * Blocks any direct invoke of chat_send_message outside tests/legacy
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const EXCLUDE_DIRS = ['__tests__', 'tests', 'test', 'legacy', 'docs', 'scripts'];

const EXCLUDE_FILES = ['src/core/commands/TAURI_COMMANDS.ts', 'src/lib/tauriCommands.ts'];

const FORBIDDEN_PATTERNS = [
  /invoke\(['"]chat_send_message['"]/,
  /TAURI_COMMANDS\.CHAT_SEND_MESSAGE/,
];

describe('🔒 Compliance — No legacy chat_send_message in runtime', () => {
  it('should not reference legacy chat_send_message in runtime code', () => {
    const files = getAllTsFiles('src');

    files.forEach(file => {
      if (EXCLUDE_FILES.some(excluded => file.endsWith(excluded))) {
        return;
      }
      const content = fs.readFileSync(file, 'utf-8');
      FORBIDDEN_PATTERNS.forEach(pattern => {
        expect(content).not.toMatch(pattern);
      });
    });
  });
});

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.some(ex => fullPath.includes(path.sep + ex + path.sep))) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}
