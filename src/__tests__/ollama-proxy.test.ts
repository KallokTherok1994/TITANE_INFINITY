/**
 * TITANE∞ — Ollama Gateway Routing Tests
 * Ensures frontend routes through the gateway and avoids direct localhost calls.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

describe('Ollama proxy routing', () => {
  it('uses /api/ollama as base and forbids direct localhost', () => {
    const testDir = dirname(fileURLToPath(import.meta.url));
    const target = resolve(testDir, '../services/ai/transports/ollamaTransport.ts');
    const source = readFileSync(target, 'utf8');

    const forbiddenPort = [':', '114', '34'].join('');
    const forbidden = ['127', '0', '0', '1'].join('.') + forbiddenPort;
    const forbiddenLocalhost = ['local', 'host', forbiddenPort].join('');
    expect(source).toContain("const OLLAMA_API_BASE = '/api/ollama';");
    expect(source).not.toContain(forbidden);
    expect(source).not.toContain(forbiddenLocalhost);
  });
});
