/**
 * TITANE∞ — Architecture Tests: Ring Boundary Validation
 *
 * Validates that 4-Ring architecture boundaries are respected:
 * - Ring 0: Kernel Rust (src-tauri/src/) — no imports
 * - Ring 1: Types/Data (src/types/, src/lib/) — imported by Ring 2/3/4
 * - Ring 2: Engines/Services (src/engines/, src/services/) — no Ring 3/4 imports
 * - Ring 3: Orchestration (src/stores/, src/hooks/) — no Ring 4 component imports
 * - Ring 4: UI (src/components/, src/pages/) — leaf layer
 *
 * Rule 3: No inverse imports. No Ring 1/Ring 2 I/O.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

// ─── helpers ────────────────────────────────────────────────────────────────

function getAllTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '__tests__', 'dist', 'target', '.git'].includes(entry.name))
        continue;
      results.push(...getAllTsFiles(full));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

function getImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /^(?:import|export)\s+(?:.*?from\s+)?['"]([^'"]+)['"]/gm;
  const imports: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(content)) !== null) {
    imports.push(m[1]);
  }
  return imports;
}

function resolvePath(from: string, importedPath: string): string | null {
  if (!importedPath.startsWith('.') && !importedPath.startsWith('/')) return null;
  const resolved = path.resolve(path.dirname(from), importedPath);
  return resolved;
}

function isRing4Path(p: string): boolean {
  const rel = path.relative(ROOT, p);
  return (
    rel.startsWith('src/components') ||
    rel.startsWith('src/pages') ||
    rel.startsWith('src/ui')
  );
}

function isRing3Path(p: string): boolean {
  const rel = path.relative(ROOT, p);
  return rel.startsWith('src/stores') || rel.startsWith('src/hooks');
}

function isRing2Path(p: string): boolean {
  const rel = path.relative(ROOT, p);
  return rel.startsWith('src/engines') || rel.startsWith('src/services');
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('🏛️ Architecture: Ring Boundary Validation', () => {
  describe('Ring 2 (engines/services) — no direct React component imports', () => {
    it('src/engines/** should not import from src/components or src/pages', () => {
      const enginesDir = path.join(ROOT, 'src/engines');
      const files = getAllTsFiles(enginesDir);
      const violations: string[] = [];

      for (const file of files) {
        const imports = getImports(file);
        for (const imp of imports) {
          // Check for @components, @pages, @ui aliases
          if (
            imp.startsWith('@components') ||
            imp.startsWith('@pages') ||
            imp.startsWith('@ui')
          ) {
            violations.push(`${path.relative(ROOT, file)} -> ${imp}`);
            continue;
          }
          // Check relative imports that resolve to Ring 4
          const resolved = resolvePath(file, imp);
          if (resolved && isRing4Path(resolved)) {
            violations.push(`${path.relative(ROOT, file)} -> ${imp}`);
          }
        }
      }

      if (violations.length > 0) {
        console.warn(
          'Ring 2→Ring 4 violations (static import check):\n',
          violations.join('\n')
        );
      }
      expect(violations).toHaveLength(0);
    });

    it('src/services/** should not import from src/components or src/pages', () => {
      const servicesDir = path.join(ROOT, 'src/services');
      const files = getAllTsFiles(servicesDir);
      const violations: string[] = [];

      for (const file of files) {
        const imports = getImports(file);
        for (const imp of imports) {
          if (
            imp.startsWith('@components') ||
            imp.startsWith('@pages') ||
            imp.startsWith('@ui')
          ) {
            violations.push(`${path.relative(ROOT, file)} -> ${imp}`);
            continue;
          }
          const resolved = resolvePath(file, imp);
          if (resolved && isRing4Path(resolved)) {
            violations.push(`${path.relative(ROOT, file)} -> ${imp}`);
          }
        }
      }

      if (violations.length > 0) {
        console.warn('Ring 2→Ring 4 violations (services):\n', violations.join('\n'));
      }
      expect(violations).toHaveLength(0);
    });
  });

  describe('Ring 3 (stores/hooks) — no Ring 4 component imports', () => {
    it('src/stores/** should not import Ring 4 components', () => {
      const storesDir = path.join(ROOT, 'src/stores');
      const files = getAllTsFiles(storesDir);
      const violations: string[] = [];

      for (const file of files) {
        const imports = getImports(file);
        for (const imp of imports) {
          if (
            imp.startsWith('@components') ||
            imp.startsWith('@pages') ||
            imp.startsWith('@ui')
          ) {
            violations.push(`${path.relative(ROOT, file)} -> ${imp}`);
          }
          const resolved = resolvePath(file, imp);
          if (resolved && isRing4Path(resolved)) {
            violations.push(`${path.relative(ROOT, file)} -> ${imp}`);
          }
        }
      }

      expect(violations).toHaveLength(0);
    });
  });

  describe('Ring directory existence', () => {
    it('Ring 2 directories must exist', () => {
      expect(fs.existsSync(path.join(ROOT, 'src/engines'))).toBe(true);
      expect(fs.existsSync(path.join(ROOT, 'src/services'))).toBe(true);
    });

    it('Ring 3 directories must exist', () => {
      expect(fs.existsSync(path.join(ROOT, 'src/stores'))).toBe(true);
      expect(fs.existsSync(path.join(ROOT, 'src/hooks'))).toBe(true);
    });

    it('Ring 4 directories must exist', () => {
      expect(fs.existsSync(path.join(ROOT, 'src/components'))).toBe(true);
      expect(fs.existsSync(path.join(ROOT, 'src/pages'))).toBe(true);
    });
  });
});
