import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '../..');
const ROOT_HOOKS_BARREL = path.normalize('src/hooks/index.ts');
const APP_FILE = path.normalize('src/App.tsx');

describe('Architecture: runtime root hooks barrel isolation', () => {
  it('disallows runtime imports from the root hooks barrel', () => {
    const violations: Array<{ file: string; line: number; text: string }> = [];

    for (const file of findSourceFiles(SRC_DIR)) {
      const relative = path.normalize(path.relative(process.cwd(), file));

      if (relative.includes('__tests__')) continue;
      if (relative === ROOT_HOOKS_BARREL) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const importsRootBarrel =
          line.includes("from '@/hooks'") ||
          line.includes('from "@/hooks"') ||
          (relative === APP_FILE &&
            (line.includes("from './hooks'") || line.includes('from "./hooks"')));

        if (!importsRootBarrel) {
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
      throw new Error(
        'Runtime imports must target dedicated hook modules instead of src/hooks/index.ts.\n' +
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