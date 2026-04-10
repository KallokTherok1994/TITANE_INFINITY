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
  it('keeps desktop windows devtools-enabled for F12 and Ctrl+Shift+I', () => {
    const config = loadJson<TauriConfig>('src-tauri/tauri.conf.json');
    const mainWindow = config.app?.windows?.find(window => window.label === 'main');
    const avatarWindow = config.app?.windows?.find(
      window => window.label === 'avatar-floating'
    );
    const mainCapability = config.app?.security?.capabilities?.find(capability =>
      capability.windows?.includes('main')
    );

    expect(mainWindow?.devtools).toBe(true);
    expect(avatarWindow?.devtools).toBe(true);
    expect(mainCapability?.permissions).toContain(
      'core:webview:allow-internal-toggle-devtools'
    );
  });

  it('keeps the base Tauri config aligned so the generator cannot disable F12 again', () => {
    const baseConfig = loadJson<TauriConfig>('src-tauri/tauri.base.json');
    const mainWindow = baseConfig.app?.windows?.find(window => window.label === 'main');

    expect(mainWindow?.devtools).toBe(true);
  });
});
