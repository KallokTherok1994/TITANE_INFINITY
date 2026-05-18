import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();
const scriptPath = path.join(
  rootDir,
  'scripts/verify/generate-ollama-dev-awareness.mjs'
);

describe('Ollama DEV awareness manifest', () => {
  it('generates a compact repo-owned manifest without secret paths', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'titane-ollama-awareness-'));

    execFileSync('node', [scriptPath, '--check'], {
      cwd: rootDir,
      env: {
        ...process.env,
        TITANE_OLLAMA_DEV_AWARENESS_OUT_DIR: outDir,
      },
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const manifestPath = path.join(outDir, 'latest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const sourcePaths = manifest.sources.map((source: { path: string }) => source.path);
    const indexedPaths = [
      ...sourcePaths,
      ...manifest.inventory.flatMap((root: { files: { path: string }[] }) =>
        root.files.map(file => file.path)
      ),
    ];

    expect(manifest.models.product_chat).toBe('gemma2:2b');
    expect(manifest.models.ollama_dev).toBe('qwen3.5:9b');
    expect(sourcePaths).toContain('OLLAMA_RUNTIME_MAP.md');
    expect(sourcePaths).toContain('ARCHITECTURE.md');
    expect(sourcePaths).toContain('UI_SURFACE_MAP.md');
    expect(sourcePaths).toContain('docs/IPC_CATALOG.md');
    expect(sourcePaths).toContain('src/pages/TotalDevPage.tsx');
    expect(sourcePaths).toContain('src-tauri/src/commands/total_dev_commands.rs');
    expect(manifest.product_boundary.product_default_dev_model_contamination).toBe(
      false
    );
    expect(manifest.product_boundary.mcp_declares_dev_model).toBe(true);
    expect(manifest.product_boundary.total_dev_declares_dev_model).toBe(true);
    expect(manifest.safety.sensitive_indexed_paths).toEqual([]);
    expect(indexedPaths.some((candidate: string) => /(^|\/)\.env($|[./])/i.test(candidate))).toBe(
      false
    );
  });

  it('is exposed through package.json as a governed verification script', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
    );

    expect(packageJson.scripts['verify:ollama:dev:awareness']).toBe(
      'node scripts/verify/generate-ollama-dev-awareness.mjs --check'
    );
    expect(packageJson.scripts['verify:ollama:dev:global-awareness']).toBe(
      'bash scripts/verify/verify-ollama-dev-global-awareness.sh'
    );
  });
});
