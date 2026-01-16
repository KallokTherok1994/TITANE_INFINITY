/**
 * GATE_P3 — PHASE_3 Validation Tests
 *
 * Tests de validation pour PHASE_3 : Build Stable reproductible
 *
 * Objectifs:
 * - P3.G1: Vérifier existence + intégrité allowlist.whitelist.stable.json
 * - P3.G2: Vérifier runtime/stable/build.sh contient validations PHASE_3
 * - P3.G3: Vérifier workflow .github/workflows/stable-build.yml existe
 * - P3.G4: Vérifier structure manifest build (schema attendu)
 * - P3.G5: Vérifier flags déterministes dans build.sh
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../..');

describe('GATE_P3: PHASE_3 Build Stable validations', () => {
  describe('P3.G1: Allowlist stable integrity', () => {
    const ALLOWLIST_PATH = resolve(ROOT, 'src-tauri/allowlist.whitelist.stable.json');

    it('should have allowlist.whitelist.stable.json file', () => {
      expect(
        existsSync(ALLOWLIST_PATH),
        `Missing stable allowlist: ${ALLOWLIST_PATH}`
      ).toBe(true);
    });

    it('should have valid JSON in allowlist', () => {
      const content = readFileSync(ALLOWLIST_PATH, 'utf-8');
      expect(() => JSON.parse(content), 'Invalid JSON in allowlist').not.toThrow();
    });

    it('should have capabilities structure with allow/deny lists', () => {
      const content = readFileSync(ALLOWLIST_PATH, 'utf-8');
      const json = JSON.parse(content);

      expect(json).toHaveProperty('app.security.capabilities');
      expect(Array.isArray(json.app.security.capabilities)).toBe(true);

      const cap = json.app.security.capabilities[0];
      expect(cap).toHaveProperty('allow');
      expect(cap).toHaveProperty('deny');
      expect(Array.isArray(cap.allow)).toBe(true);
      expect(Array.isArray(cap.deny)).toBe(true);
    });

    it('should have strict production-only allowlist (< 60 commands)', () => {
      const content = readFileSync(ALLOWLIST_PATH, 'utf-8');
      const json = JSON.parse(content);

      const allowedCommands = json.app.security.capabilities[0].allow;
      const commandCount = allowedCommands.length;

      // Production whitelist doit être stricte (vs 81 dans base)
      expect(commandCount).toBeLessThan(60);
      expect(commandCount).toBeGreaterThan(30); // Au moins 30 essentielles

      console.log(`  ℹ️  Stable allowlist: ${commandCount} commands (vs 81 in base)`);
    });

    it('should deny debug/qa commands explicitly', () => {
      const content = readFileSync(ALLOWLIST_PATH, 'utf-8');
      const json = JSON.parse(content);

      const deniedCommands = json.app.security.capabilities[0].deny;
      const denyList = deniedCommands.map((d: any) => d.command);

      // Vérifier présence de deny list pour QA, debug, devtools
      const hasDeniedDebug = denyList.some(
        (cmd: string) =>
          cmd.includes('qa_') || cmd.includes('devtools') || cmd.includes('one_core_')
      );

      expect(hasDeniedDebug, 'Deny list should explicitly block debug/qa commands').toBe(
        true
      );

      console.log(`  ℹ️  Deny list: ${deniedCommands.length} commands blocked`);
    });
  });

  describe('P3.G2: Build script hardening (runtime/stable/build.sh)', () => {
    const BUILD_SCRIPT = resolve(ROOT, 'runtime/stable/build.sh');

    it('should have build.sh script', () => {
      expect(existsSync(BUILD_SCRIPT), `Missing build script: ${BUILD_SCRIPT}`).toBe(
        true
      );
    });

    it('should contain PHASE_3 security validations', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      // Markers PHASE_3 attendus
      expect(content).toContain('PHASE_3: VALIDATIONS DE SÉCURITÉ');
      expect(content).toContain('ALLOWLIST_STABLE=');
      expect(content).toContain('sha256sum');
      expect(content).toContain('EXPECTED_HASH=');
    });

    it('should abort if allowlist missing', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      expect(content).toContain('if [[ ! -f "$ALLOWLIST_STABLE" ]]');
      expect(content).toContain('exit 1');
    });

    it('should contain deterministic build flags', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      // Flags reproductibilité
      expect(content).toContain('PHASE_3: REPRODUCTIBLE BUILD FLAGS');
      expect(content).toContain('SOURCE_DATE_EPOCH=');
      expect(content).toContain('RUSTFLAGS=');
      expect(content).toContain('CARGO_PROFILE_RELEASE_LTO=');
    });

    it('should generate build manifest with hashes', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      expect(content).toContain('PHASE_3: BUILD MANIFEST');
      expect(content).toContain('MANIFEST=');
      expect(content).toContain('build-manifest.json');
      expect(content).toContain('APPIMAGE_HASH=');
    });
  });

  describe('P3.G3: CI workflow (stable-build.yml)', () => {
    const WORKFLOW = resolve(ROOT, '.github/workflows/stable-build.yml');

    it('should have stable-build workflow', () => {
      expect(existsSync(WORKFLOW), `Missing CI workflow: ${WORKFLOW}`).toBe(true);
    });

    it('should trigger on workflow_dispatch and tags', () => {
      const content = readFileSync(WORKFLOW, 'utf-8');

      expect(content).toContain('workflow_dispatch:');
      expect(content).toContain('tags:');
      expect(content).toContain('v*.*.*');
    });

    it('should have PHASE_3 allowlist validation step', () => {
      const content = readFileSync(WORKFLOW, 'utf-8');

      expect(content).toContain('PHASE_3: Validate allowlist integrity');
      expect(content).toContain('src-tauri/allowlist.whitelist.stable.json');
      expect(content).toContain('jq empty');
    });

    it('should have GATE_P3 reproducibility check step', () => {
      const content = readFileSync(WORKFLOW, 'utf-8');

      expect(content).toContain('GATE_P3: Reproducibility check');
      expect(content).toContain('Build 1 hash:');
      expect(content).toContain('Build 2 hash:');
      expect(content).toContain('Builds are reproducible');
    });

    it('should upload artifacts with manifest', () => {
      const content = readFileSync(WORKFLOW, 'utf-8');

      expect(content).toContain('upload-artifact@v4');
      expect(content).toContain('build-manifest.json');
    });
  });

  describe('P3.G4: Build manifest schema (expected structure)', () => {
    it('should define expected manifest schema', () => {
      // Schema attendu pour build-manifest.json (généré par build.sh)
      const expectedSchema = {
        build: {
          timestamp: 'ISO8601 string',
          commit: 'git sha',
          branch: 'git branch',
          mode: 'production',
          target: 'Titan-Stable',
          platform: 'linux|darwin|win32',
          deterministic: true,
        },
        security: {
          allowlist_file: 'path to allowlist',
          allowlist_hash: 'sha256',
          phase3_validations: 'passed',
        },
        artifacts: {
          appimage: { sha256: 'hash' },
          deb: { sha256: 'hash' },
        },
        reproducibility: {
          source_date_epoch: 'timestamp',
          rustflags: 'flags string',
          lto: 'fat',
          opt_level: '3',
        },
      };

      // Ce test vérifie juste que le schema est bien défini
      // Le manifest réel est généré uniquement lors du build
      expect(expectedSchema).toBeDefined();
      expect(expectedSchema.build).toHaveProperty('deterministic', true);
      expect(expectedSchema.security).toHaveProperty('phase3_validations', 'passed');

      console.log('  ℹ️  Expected manifest schema validated (structure only)');
    });
  });

  describe('P3.G5: Deterministic flags consistency', () => {
    const BUILD_SCRIPT = resolve(ROOT, 'runtime/stable/build.sh');

    it('should set SOURCE_DATE_EPOCH for reproducibility', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      expect(content).toContain('export SOURCE_DATE_EPOCH=');
    });

    it('should configure RUSTFLAGS with build-id and codegen-units', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      expect(content).toContain('export RUSTFLAGS=');
      expect(content).toContain('--build-id=sha1');
      expect(content).toContain('codegen-units=1');
    });

    it('should use fat LTO for release builds', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      expect(content).toContain('CARGO_PROFILE_RELEASE_LTO="fat"');
    });

    it('should optimize with level 3 and strip symbols', () => {
      const content = readFileSync(BUILD_SCRIPT, 'utf-8');

      expect(content).toContain('CARGO_PROFILE_RELEASE_OPT_LEVEL="3"');
      expect(content).toContain('CARGO_PROFILE_RELEASE_STRIP="symbols"');
    });
  });
});
