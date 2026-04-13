import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type TauriWindowConfig = {
  label?: string;
  devtools?: boolean;
};

type TauriCapability = {
  windows?: string[];
  permissions?: string[];
};

type TauriConfig = {
  app?: {
    windows?: TauriWindowConfig[];
    security?: {
      capabilities?: TauriCapability[];
    };
  };
};

function loadJson<T>(relativePath: string): T {
  const filePath = path.resolve(process.cwd(), relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

describe('Tauri devtools configuration', () => {
  it('disables devtools in production build (security hardening)', () => {
    const config = loadJson<TauriConfig>('src-tauri/tauri.conf.json');
    const mainWindow = config.app?.windows?.find(window => window.label === 'main');
    const mainCapability = config.app?.security?.capabilities?.find(capability =>
      capability.windows?.includes('main')
    );

    // devtools must be disabled by default in production (security hardening).
    expect(mainWindow?.devtools).toBe(false);
    // The toggle permission is intentionally retained to allow the devtools_enable/devtools_disable
    // IPC commands to function for authorized developer debug sessions; it does not enable
    // devtools automatically in the window.
    expect(mainCapability?.permissions).toContain(
      'core:webview:allow-internal-toggle-devtools'
    );
  });

  it('keeps the base Tauri config without a devtools override (inherits false from production)', () => {
    const baseConfig = loadJson<TauriConfig>('src-tauri/tauri.base.json');
    // tauri.base.json is a base config without window definitions;
    // devtools defaults are handled per-runtime config.
    const mainWindow = baseConfig.app?.windows?.find(window => window.label === 'main');

    // No windows block in base config — override lives in tauri.conf.json
    expect(mainWindow).toBeUndefined();
  });
});
