import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = process.cwd();

const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('Progression route fusion', () => {
  it('routes /progression to the canonical TITANE progression tab', () => {
    const app = read('src/App.tsx');
    const moduleRouteContext = read('src/services/chat/moduleRouteContext.ts');
    const uiSurfaceRegistry = read('src/registry/uiSurfaceRegistry.ts');

    expect(app).toContain('path="/progression"');
    expect(app).toContain('to="/titane?tab=progression"');
    expect(moduleRouteContext).toContain("'/progression': '/titane?tab=progression'");
    expect(uiSurfaceRegistry).toContain("from: '/progression'");
    expect(uiSurfaceRegistry).toContain("to: '/titane?tab=progression'");
  });
});
