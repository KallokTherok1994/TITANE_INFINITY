import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
) as { scripts: Record<string, string>; engines: Record<string, string> };
const browserE2EScript = fs.readFileSync(
  path.join(rootDir, 'scripts/e2e/run-android-ui-browser.cjs'),
  'utf8'
);
const buildCanonicalScript = fs.readFileSync(
  path.join(rootDir, 'scripts/android/build-canonical.mjs'),
  'utf8'
);

describe('android canonical authorities', () => {
  it('keeps one canonical Android dev authority and one canonical Android build authority', () => {
    expect(packageJson.scripts['android:dev:stable']).toBe('bash scripts/android/dev-stable.sh');
    expect(packageJson.scripts['android:build']).toBe(
      'node scripts/android/build-canonical.mjs'
    );
  });

  it('requires browser E2E to reuse canonical server authority without launching a second vite path', () => {
    expect(browserE2EScript).toContain('http://127.0.0.1:1420/');
    expect(browserE2EScript).toContain('android:dev:stable');
    expect(browserE2EScript).not.toContain('vite dev');
  });

  it('enforces sync and artifact checks in canonical Android build flow', () => {
    expect(buildCanonicalScript).toContain('sync:versions');
    expect(buildCanonicalScript).toContain('gen:tauri-config:force');
    expect(buildCanonicalScript).toContain('android:build:mock:debug');
    expect(buildCanonicalScript).toContain('android:artifact:check');
  });

  it('keeps Node engine guard at >=20 for Android lane scripts', () => {
    expect(packageJson.engines.node).toBe('>=20.0.0');
  });
});
