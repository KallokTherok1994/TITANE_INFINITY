/**
 * TITANE∞ — Ollama Proxy Routing Tests
 * Ensures frontend routes through /api/ollama and avoids direct localhost calls.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

describe('Ollama proxy routing', () => {
  it('uses /api/ollama as base and forbids direct localhost', () => {
    const testDir = dirname(fileURLToPath(import.meta.url));
    const target = resolve(testDir, '../services/ai/providers/ollama.ts');
    const source = readFileSync(target, 'utf8');

    const forbidden = ['127', '0', '0', '1'].join('.') + ':11434';
    expect(source).toContain("const OLLAMA_API_BASE = '/api/ollama';");
    expect(source).not.toContain(forbidden);
  });
});
