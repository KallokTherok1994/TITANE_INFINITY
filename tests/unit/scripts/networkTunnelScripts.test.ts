import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function loadScript(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8');
}

describe('network tunnel scripts', () => {
  it('detects the active Vite port dynamically instead of hardcoding 5173', () => {
    const startScript = loadScript('scripts/network/start-tunnel.sh');
    const validateScript = loadScript('scripts/network/validate-network.sh');

    expect(startScript).toContain('candidates+=(4000 4001 5173)');
    expect(validateScript).toContain('candidates+=(4000 4001 5173)');
    expect(startScript).toContain('DEV_PORT="$(detect_dev_port || true)"');
    expect(validateScript).toContain('DEV_PORT="$(detect_dev_port || true)"');
  });

  it('suggests the canonical Vite command instead of a missing local helper script', () => {
    const startScript = loadScript('scripts/network/start-tunnel.sh');

    expect(startScript).toContain(
      'corepack pnpm exec vite --host 0.0.0.0 --port ${PORT:-4000}'
    );
    expect(startScript).not.toContain('bash ./deploy-http-server-pure.sh');
  });
});