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
  it('reflects production devtools policy (disabled in tauri.conf.json, IPC toggle commands remain)', () => {
    const config = loadJson<TauriConfig>('src-tauri/tauri.conf.json');
    const mainWindow = config.app?.windows?.find(window => window.label === 'main');
    const mainCapability = config.app?.security?.capabilities?.find(capability =>
      capability.windows?.includes('main')
    );

    expect(mainWindow?.devtools).toBe(false);
    expect(mainCapability?.permissions).toContain(
      'core:webview:allow-internal-toggle-devtools'
    );
  });

  it('keeps the canonical production base config aligned with disabled devtools', () => {
    const baseConfig = loadJson<TauriConfig>('src-tauri/tauri.base.json');
    const mainWindow = baseConfig.app?.windows?.find(window => window.label === 'main');

    expect(mainWindow?.devtools).toBe(false);
  });
});
