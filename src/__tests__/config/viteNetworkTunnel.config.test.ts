import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function loadConfig(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8');
}

describe('vite network tunnel config', () => {
  it('allows Cloudflare quick tunnel hosts on the dev server', () => {
    const viteConfig = loadConfig('vite.config.ts');

    expect(viteConfig).toContain("allowedHosts: ['.trycloudflare.com']");
  });
});
