import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * One Door governance gate — direct `@tauri-apps/api/core` imports.
 *
 * Only the canonical door files are allowed to import from @tauri-apps/api/core.
 * All other src/ files must route through safeInvokeCanonical (src/utils/invoke.ts)
 * or secureInvoke (src/lib/security.ts) — never call invoke() directly.
 *
 * Allowed exceptions (the "door" files):
 *   src/utils/invoke.ts          — canonical public IPC helper
 *   src/lib/security.ts          — secureInvoke primitive
 *   src/utils/tauriProtector.ts  — runtime environment guard
 *   src/test/setup.ts            — vitest global mock setup
 */
const ALLOWED_DIRECT_IMPORTERS = new Set([
  path.normalize('src/utils/invoke.ts'),
  path.normalize('src/lib/security.ts'),
  path.normalize('src/utils/tauriProtector.ts'),
  path.normalize('src/test/setup.ts'),
]);

const SRC_DIR = path.resolve(__dirname, '../..');

describe('Architecture: One Door — no direct @tauri-apps/api/core imports', () => {
  it('disallows non-canonical files from importing @tauri-apps/api/core directly', () => {
    const violations: Array<{ file: string; line: number; text: string }> = [];
    const sourceFiles = findSourceFiles(SRC_DIR);

    for (const file of sourceFiles) {
      const relative = path.normalize(path.relative(process.cwd(), file));

      // Skip test files (they may mock the module)
      if (relative.includes('__tests__')) continue;
      if (relative.includes(path.normalize('src/test/'))) continue;

      if (ALLOWED_DIRECT_IMPORTERS.has(relative)) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (!line.includes('@tauri-apps/api/core')) return;

        const isImport =
          line.includes('from') || line.includes('import(') || line.includes('require(');
        if (!isImport) return;

        violations.push({ file: relative, line: index + 1, text: line.trim() });
      });
    }

    if (violations.length > 0) {
      const report = violations
        .map(v => `  ${v.file}:${v.line}  →  ${v.text}`)
        .join('\n');
      throw new Error(
        'One Door violation: @tauri-apps/api/core imported outside allowed door files.\n' +
          'Route through safeInvokeCanonical (src/utils/invoke.ts) instead.\n\n' +
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
