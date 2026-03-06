import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '../..');

const LEGACY_ALLOWED_IMPORTERS = new Set([
  path.normalize('src/hooks/useVoiceMode.ts'),
  path.normalize('src/utils/cloudAPIConfirmation.ts'),
]);

describe('Architecture: offline-first legacy isolation', () => {
  it('disallows new runtime imports of src/config/offline-first', () => {
    const violations: Array<{ file: string; line: number; text: string }> = [];
    const sourceFiles = findSourceFiles(SRC_DIR);

    for (const file of sourceFiles) {
      const relative = path.normalize(path.relative(process.cwd(), file));
      if (relative === path.normalize('src/config/offline-first.ts')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (!line.includes('offline-first')) {
          return;
        }

        const isImportLine =
          line.includes('from') || line.includes('import(') || line.includes('require(');
        if (!isImportLine) {
          return;
        }

        const mentionsConfigPath =
          line.includes('/config/offline-first') || line.includes('config/offline-first');
        if (!mentionsConfigPath) {
          return;
        }

        if (LEGACY_ALLOWED_IMPORTERS.has(relative)) {
          return;
        }

        violations.push({
          file: relative,
          line: index + 1,
          text: line.trim(),
        });
      });
    }

    if (violations.length > 0) {
      const report = violations.map(v => `- ${v.file}:${v.line} -> ${v.text}`).join('\n');
      const report = violations
        .map(v => `- ${v.file}:${v.line} -> ${v.text}`)
        .join('\n');

      throw new Error(
        'offline-first.ts is legacy-only. Move callers to canonical backend config path.\n' +
          report
      );
    }

    expect(violations).toHaveLength(0);
  });
});

function findSourceFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}
