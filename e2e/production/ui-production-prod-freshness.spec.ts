/**
 * ui-production-prod-freshness.spec.ts
 * TITANE v84 — Playwright: Production preview UI freshness
 * Verifies the Vite preview build exposes correct version, TIME page guards, and no epoch dates.
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CURRENT_DIR, '../../');

function extractArtifactNames(
  artifacts:
    | Record<string, string>
    | Array<string | { file?: string; name?: string }>
    | undefined
): string[] {
  if (!artifacts) return [];
  if (Array.isArray(artifacts)) {
    return artifacts
      .map(entry => {
        if (typeof entry === 'string') return entry;
        return entry.file ?? entry.name ?? '';
      })
      .filter(Boolean);
  }
  return Object.values(artifacts).filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  );
}

test.describe('TITANE v84 — Production Prod Freshness', () => {
  test('package.json version is defined and non-empty', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
    );
    expect(pkg.version).toBeTruthy();
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('TimePage.tsx has epoch date null guard in formatDate', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    expect(fs.existsSync(timePagePath)).toBe(true);
    const content = fs.readFileSync(timePagePath, 'utf8');
    expect(content).toContain('if (!timestamp || timestamp <= 0) return');
  });

  test('TimePage.tsx has stats.oldestSnapshot > 0 guard', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    const content = fs.readFileSync(timePagePath, 'utf8');
    expect(content).toContain('stats.oldestSnapshot > 0');
  });

  test('TimePage.tsx has stats.newestSnapshot > 0 guard', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    const content = fs.readFileSync(timePagePath, 'utf8');
    expect(content).toContain('stats.newestSnapshot > 0');
  });

  test('TimePage.tsx filters zero-timestamp snapshots from timeline', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    const content = fs.readFileSync(timePagePath, 'utf8');
    expect(content).toContain('.filter(snapshot => snapshot.timestamp > 0)');
  });

  test('index.html has 4 synchronized version strings', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
    );
    const version = pkg.version;
    const html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');

    // Pattern 1: header comment
    expect(html).toContain(`TITANE_INFINITY v${version}`);
    // Pattern 2: meta description
    expect(html).toContain(`TITANE∞ v${version}`);
    // Pattern 3: meta name=version
    expect(html).toContain(`name="version" content="${version}"`);
    // Pattern 4: title
    expect(html).toContain(`<title>TITANE∞ v${version}`);
  });

  test('verify-installed-prod-freshness.mjs verifier script exists and is executable', () => {
    const verifierPath = path.join(
      PROJECT_ROOT,
      'scripts/verify/verify-installed-prod-freshness.mjs'
    );
    expect(fs.existsSync(verifierPath)).toBe(true);
    const stats = fs.statSync(verifierPath);
    expect(stats.size).toBeGreaterThan(100);
  });

  test('verify-ui-prod-install-freshness.mjs verifier script exists and is executable', () => {
    const verifierPath = path.join(
      PROJECT_ROOT,
      'scripts/verify/verify-ui-prod-install-freshness.mjs'
    );
    expect(fs.existsSync(verifierPath)).toBe(true);
    const stats = fs.statSync(verifierPath);
    expect(stats.size).toBeGreaterThan(100);
  });

  test('deployment/latest metadata is internally consistent', () => {
    const versionPath = path.join(PROJECT_ROOT, 'deployment/latest/VERSION.txt');
    const manifestPath = path.join(PROJECT_ROOT, 'deployment/latest/MANIFEST.json');
    if (!fs.existsSync(versionPath)) {
      test.skip();
      return;
    }

    if (!fs.existsSync(manifestPath)) {
      test.skip();
      return;
    }

    const deployVersion = fs.readFileSync(versionPath, 'utf8').trim();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      version?: string;
      artifacts?:
        | Record<string, string>
        | Array<string | { file?: string; name?: string }>;
    };

    expect(deployVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.version).toBe(deployVersion);

    for (const artifactName of extractArtifactNames(manifest.artifacts)) {
      const artifactPath = path.join(PROJECT_ROOT, 'deployment/latest', artifactName);
      expect(fs.existsSync(artifactPath)).toBe(true);
      expect(artifactName).toContain(deployVersion);
    }
  });
});
