import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readRepoFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function readCurrentVersion(): string {
  const pkg = JSON.parse(readRepoFile('package.json')) as { version: string };
  return pkg.version;
}

describe('v73 production-visible version sync', () => {
  it('index metadata reflects the current production version marker', () => {
    const html = readRepoFile('index.html');
    const version = readCurrentVersion();
    expect(html).toContain(`meta name="version" content="${version}"`);
    expect(html).toContain(
      `<title>TITANE∞ v${version} - Cognitive Operating System</title>`
    );
  });

  it('critical visible pages use build-time runtime version in UI labels', () => {
    const menu = readRepoFile('src/ui/Menu.tsx');
    const dev = readRepoFile('src/pages/DevPage.tsx');
    const admin = readRepoFile('src/features/admin/AdminPage.tsx');
    const totalDev = readRepoFile('src/pages/TotalDevPage.tsx');

    expect(menu).toContain('const appVersion = __APP_VERSION__');
    expect(dev).toContain('const APP_RUNTIME_VERSION = __APP_VERSION__');
    expect(admin).toContain('const APP_RUNTIME_VERSION = __APP_VERSION__');
    expect(totalDev).toContain('const APP_RUNTIME_VERSION = __APP_VERSION__');

    expect(dev).not.toContain('TITANE∞ v30.0.0 • 5 tabs fusionnés');
    expect(admin).not.toContain('<span className="admin-version">v30.0.0</span>');
    expect(totalDev).not.toContain('TITANE∞ v30.0.0 · TOTAL_DEV · Ring1→IPC→Rust');
  });
});
