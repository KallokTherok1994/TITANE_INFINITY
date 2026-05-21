import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const scriptPath = path.join(rootDir, 'scripts/verify/verify-ollama-dev-live.sh');
const scriptRaw = fs.readFileSync(scriptPath, 'utf8');

describe('verify-ollama-dev-live.sh', () => {
  it('exists at the canonical path', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('is executable', () => {
    const stat = fs.statSync(scriptPath);
    if (process.platform !== 'win32') {
      // eslint-disable-next-line no-bitwise
      expect(stat.mode & 0o111).toBeGreaterThan(0);
    } else {
      expect(stat.isFile()).toBe(true);
    }
  });

  it('contains the required live-readiness probes and prompt contract', () => {
    for (const needle of [
      '/api/version',
      '/api/generate',
      'TITANE_OLLAMA_DEV_READY',
      'TITANE_OLLAMA_DEV_MODEL',
      'OLLAMA_HOST',
      'verify:ollama:boundary',
      'ollamaDevConfig.test.ts',
      'stream',
      'think',
      'keep_alive',
      'num_ctx',
      'temperature',
      'TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC',
      'TITANE_OLLAMA_DEV_COMPAT_TIMEOUT_SEC',
      'TITANE_OLLAMA_DEV_SMOKE_NUM_PREDICT',
    ]) {
      expect(scriptRaw).toContain(needle);
    }
  });
});
