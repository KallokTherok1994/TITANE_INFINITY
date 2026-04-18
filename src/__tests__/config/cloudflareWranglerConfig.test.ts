import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function loadConfig(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8');
}

describe('Cloudflare Wrangler config', () => {
  it('declares a repository-owned Wrangler configuration for static SPA deploys', () => {
    const wranglerConfig = loadConfig('wrangler.jsonc');

    expect(wranglerConfig).toContain('"name": "titane"');
    expect(wranglerConfig).toContain('"directory": "./dist"');
    expect(wranglerConfig).toContain('"not_found_handling": "single-page-application"');
  });

  it('exposes explicit Cloudflare deploy scripts instead of relying on interactive bootstrap', () => {
    const packageJson = loadConfig('package.json');

    expect(packageJson).toContain(
      '"deploy:cloudflare": "pnpm exec wrangler deploy --config wrangler.jsonc"'
    );
    expect(packageJson).toContain(
      '"preview:cloudflare": "pnpm exec wrangler dev --config wrangler.jsonc"'
    );
    expect(packageJson).toContain('"wrangler": "^4.83.0"');
  });
});