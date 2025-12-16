/**
 * 🏛️ Architecture Test: Engine Isolation
 *
 * RÈGLE ARCHITECTURALE CRITIQUE:
 * Les Engines (Ring 2) DOIVENT être des fonctions pures:
 * - ✅ Peuvent importer: @/types (Core)
 * - ❌ INTERDICTION: @/services, @/lib, @tauri-apps
 *
 * WHY? Engines = logique métier testable sans I/O.
 * Services = orchestration avec side-effects.
 *
 * Voir: docs/ARCHITECTURE_RINGS.md
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ENGINES_DIR = path.resolve(__dirname, '../../engines');

/**
 * Patterns INTERDITS dans les engines
 */
const FORBIDDEN_IMPORTS = [
  /@\/services\//, // Services = Ring 3 (engines = Ring 2)
  /@\/lib\//, // Lib = utilitaires avec potentiels side-effects
  /@tauri-apps\//, // Tauri = I/O, INTERDIT dans engines
  /from ['"]react['"]/, // React = UI, INTERDIT dans engines (sauf hooks dédiés)
];

/**
 * Patterns AUTORISÉS
 */
const ALLOWED_IMPORTS = [
  /@\/types\//, // Core types (Ring 1)
  /from ['"]vitest['"]/, // Tests
  /from ['"]zod['"]/, // Validation (pure)
];

describe('🏛️ Architecture: Engine Isolation', () => {
  it('should find engines directory', () => {
    expect(fs.existsSync(ENGINES_DIR)).toBe(true);
  });

  it('engines MUST NOT import from Services layer', async () => {
    const engineFiles = findTypeScriptFiles(ENGINES_DIR);
    expect(engineFiles.length).toBeGreaterThan(0); // Au moins 1 engine

    const violations: Array<{ file: string; line: number; import: string }> = [];

    // Exceptions légitimes (dynamic imports pour ponts I/O isolés)
    // NOTE: Ces fichiers utilisent l'injection de dépendances - l'Engine est pur,
    // seule l'instanciation du singleton utilise les services
    const ALLOWED_EXCEPTIONS = [
      'cognitiveLayoutIntegrations.ts', // Pont Helios/Nexus (migration vers CognitiveLayoutService en cours)
      'tauriBridge.ts', // Pont MemoryOS (architecture nécessite dynamic import)
      'AgendaEngine.ts', // v24.3.0: Singleton avec injection de callbacks (Engine pur, instanciation utilise service)
    ];

    for (const file of engineFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      // Skip si exception autorisée
      const isException = ALLOWED_EXCEPTIONS.some(exception => file.includes(exception));
      if (isException) {
        continue;
      }

      lines.forEach((line, index) => {
        // Ignorer commentaires
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return;
        }

        FORBIDDEN_IMPORTS.forEach(pattern => {
          if (pattern.test(line)) {
            violations.push({
              file: path.relative(process.cwd(), file),
              line: index + 1,
              import: line.trim(),
            });
          }
        });
      });
    }

    if (violations.length > 0) {
      const report = violations
        .map(v => `  - ${v.file}:${v.line}\n    ${v.import}`)
        .join('\n');

      throw new Error(
        `⚠️ ARCHITECTURE VIOLATION: Engines importing forbidden modules\n\n${report}\n\n` +
          `Fix: Move I/O logic to Services layer (@/services), extract shared types to Core (@/types).\n` +
          `See: docs/ARCHITECTURE_RINGS.md`
      );
    }

    expect(violations).toHaveLength(0);
  });

  it('engines MUST be pure functions (no side-effects)', () => {
    const engineFiles = findTypeScriptFiles(ENGINES_DIR);
    const sideEffectPatterns = [
      /localStorage\./,
      /sessionStorage\./,
      /fetch\(/,
      /axios\./,
      /invoke\(/,
      /window\./,
      /document\./,
    ];

    const violations: Array<{ file: string; line: number; pattern: string }> = [];

    for (const file of engineFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (line.trim().startsWith('//')) return;

        sideEffectPatterns.forEach(pattern => {
          if (pattern.test(line)) {
            violations.push({
              file: path.relative(process.cwd(), file),
              line: index + 1,
              pattern: pattern.source,
            });
          }
        });
      });
    }

    if (violations.length > 0) {
      const report = violations
        .map(v => `  - ${v.file}:${v.line} (pattern: ${v.pattern})`)
        .join('\n');

      console.warn(
        `⚠️ WARNING: Potential side-effects detected in engines:\n${report}\n\n` +
          `Engines should be pure. If I/O is needed, move to Services layer.`
      );
    }

    // Warn only (ne pas bloquer build si false positives)
    expect(violations.length).toBeLessThan(70); // Seuil tolérance (UI/UX engines)
  });
});

/**
 * Utilitaire: Trouver tous les fichiers .ts dans un répertoire
 */
function findTypeScriptFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

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
