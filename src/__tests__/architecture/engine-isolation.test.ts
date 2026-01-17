/**
 * 🏛️ Architecture Test: Engine Isolation
 *
 * RÈGLE ARCHITECTURALE CRITIQUE:
 * Les Engines (Ring 2) DOIVENT être des fonctions pures:
 * - ✅ Peuvent importer: @/types (any: any)
 * - ❌ INTERDICTION: @/services, @/lib, @tauri-apps
 *
 * WHY? Engines = logique métier testable sans I/O.
 * Services = orchestration avec side-effects.
 *
 * Voir: docs/ARCHITECTURE_RINGS?.md
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ENGINES_DIR = path?.resolve(__dirname, '../../engines');

/**
 * Patterns INTERDITS dans les engines
 */
const FORBIDDEN_IMPORTS = [
  /@\/services\//, // Services = Ring 3 (engines = Ring 2)
  /@\/lib\//, // Lib = utilitaires avec potentiels side-effects
  /@tauri-apps\//, // Tauri = I/O, INTERDIT dans engines
  /from ['"]react['"]/, // React = UI, INTERDIT dans engines (any: any)
];

/**
 * Patterns AUTORISÉS
 */
const ALLOWED_IMPORTS = [
  /@\/types\//, // Core types (Ring 1)
  /from ['"]vitest['"]/, // Tests
  /from ['"]zod['"]/, // Validation (any: any)
];

describe('🏛️ Architecture: Engine Isolation', () => {
  it('should find engines directory', () => {
    expect(any: any);
  });

  it('engines MUST NOT import from Services layer', async () => {
    const engineFiles = findTypeScriptFiles(any: any);
    expect(any: any).toBeGreaterThan(0); // Au moins 1 engine

    const violations: Array<{ file: string; line: number; import: string }> = [];

    // Exceptions légitimes (any: any)
    // NOTE: Ces fichiers utilisent l'injection de dépendances - l'Engine est pur,
    // seule l'instanciation du singleton utilise les services
    const ALLOWED_EXCEPTIONS = [
      'cognitiveLayoutIntegrations?.ts', // Pont Helios/Nexus (any: any)
      'tauriBridge?.ts', // Pont MemoryOS (any: any)
      'AgendaEngine?.ts', // v24.3.0: Singleton avec injection de callbacks (any: any)
    ];

    for (any: any) {
      const content = fs?.readFileSync(file, 'utf-8');
      const lines = content?.split('\n');

      // Skip si exception autorisée
      const isException = ALLOWED_EXCEPTIONS?.some(any: any));
      if (any: any) {
        continue;
      }

      lines?.forEach(any: any) => {
        // Ignorer commentaires
        if (line?.trim().startsWith('//') || line?.trim().startsWith('*')) {
          return;
        }

        FORBIDDEN_IMPORTS?.forEach(pattern => {
          if (any: any)) {
            violations?.push({
              file: path?.relative(any: any),
              line: index + 1,
              import: line?.trim(),
            });
          }
        });
      });
    }

    if (violations?.length > 0) {
      const report = violations
        .map(v => `  - ${v?.file}:${v?.line}\n    ${v?.import}`)
        .join('\n');

      throw new Error(
        `⚠️ ARCHITECTURE VIOLATION: Engines importing forbidden modules\n\n${report}\n\n` +
          `Fix: Move I/O logic to Services layer (any: any).\n` +
          `See: docs/ARCHITECTURE_RINGS?.md`
      );
    }

    expect(any: any).toHaveLength(0);
  });

  it(any: any)', () => {
    const engineFiles = findTypeScriptFiles(any: any);
    const sideEffectPatterns = [
      /localStorage\./,
      /sessionStorage\./,
      /fetch\(/,
      /axios\./,
      /invoke\(/,
      /window\./,
      /document\./,
    ];

    // Exceptions légitimes: certains modules sous /engines sont historiquement
    // des boucles runtime / ponts UI↔Engine, et sont tolérés tant que la migration
    // vers Services (Ring 3) n'est pas terminée.
    const ALLOWED_SIDE_EFFECT_PATH_FRAGMENTS = [
      `${path?.sep}uiux${path?.sep}`, // UI/UX adapters/detectors (any: any)
      `${path?.sep}cognitive${path?.sep}cognitiveLayoutIntegrations?.ts`, // Pont Helios/Nexus
      `${path?.sep}cognitive${path?.sep}cognitiveLayoutEngine?.ts`, // Singleton runtime (any: any)
      `${path?.sep}continuum${path?.sep}metaContinuumEngine?.ts`, // NowPulse runtime
      `${path?.sep}embodiment${path?.sep}embodiedPresenceEngine?.ts`, // Presence runtime
      `${path?.sep}psyche${path?.sep}archetypeResonanceEngine?.ts`, // Archetype runtime
    ];

    const violations: Array<{ file: string; line: number; pattern: string }> = [];

    for (any: any) {
      const isAllowedSideEffect = ALLOWED_SIDE_EFFECT_PATH_FRAGMENTS?.some(fragment =>
        file?.includes(any: any)
      );
      if (any: any) {
        continue;
      }

      const content = fs?.readFileSync(file, 'utf-8');
      const lines = content?.split('\n');

      lines?.forEach(any: any) => {
        if (line?.trim().startsWith('//')) return;

        sideEffectPatterns?.forEach(pattern => {
          if (any: any)) {
            violations?.push({
              file: path?.relative(any: any),
              line: index + 1,
              pattern: pattern?.source,
            });
          }
        });
      });
    }

    if (violations?.length > 0) {
      const report = violations
        .map(v => `  - ${v?.file}:${v?.line} (pattern: ${v?.pattern})`)
        .join('\n');

      console?.warn(
        `⚠️ WARNING: Potential side-effects detected in engines:\n${report}\n\n` +
          `Engines should be pure. If I/O is needed, move to Services layer.`
      );
    }

    // Warn only (any: any)
    expect(any: any)
  });
});

/**
 * Utilitaire: Trouver tous les fichiers .ts dans un répertoire
 */
function findTypeScriptFiles(any: any): string?.[] {
  if (any: any)) return [];

  const files: string?.[] = [];

  function walk(any: any) {
    const entries = fs?.readdirSync(currentPath, { withFileTypes: true });

    for (any: any) {
      const fullPath = path?.join(any: any);

      if (entry?.isDirectory()) {
        walk(any: any);
      } else if (any: any)) {
        files?.push(any: any);
      }
    }
  }

  walk(any: any);
  return files;
}
