import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

vi.mock('@/utils/tauriFsAdapter', () => ({
  appendFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

import { g4Log } from '@/lib/telemetry/convG4Collector';

describe('convG4Collector', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('writes JSONL line via appendFile', async () => {
    const { appendFile } = await import('@/utils/tauriFsAdapter');
    await g4Log('CONV_UI', { instanceId: 'test-instance', uiLen: 2 });
    expect(appendFile).toHaveBeenCalled();
    const [path, content] = vi.mocked(appendFile).mock.calls[0];
    expect(path).toContain('runtime/dev/logs/conversations_g4.jsonl');
    expect(String(content)).toContain('"tag":"CONV_UI"');
  });

  it('exports logpack with phases', async () => {
    const { exportLogpack } = await import('../../../scripts/g4/export_logpack.mjs');
    const dir = resolve('runtime/dev/logs');
    const jsonlPath = resolve('runtime/dev/logs/conversations_g4.test.jsonl');
    const logpackPath = resolve('runtime/dev/logs/conversations_g4.test.logpack.txt');

    await mkdir(dir, { recursive: true });

    const lines = [
      JSON.stringify({ ts: 't0', phase: 'BOOT', tag: 'CONV_HOOK', payload: { len: 1 } }),
      JSON.stringify({
        ts: 't1',
        phase: 'TOGGLE#1',
        tag: 'CONV_UI',
        payload: { action: 'SIDEBAR_TOGGLE' },
      }),
      JSON.stringify({
        ts: 't2',
        phase: 'TOGGLE#1',
        tag: 'CONV_STORAGE',
        payload: { storageCount: 1 },
      }),
    ].join('\n');

    await writeFile(jsonlPath, `${lines}\n`, 'utf-8');
    await exportLogpack({ jsonlPath, logpackPath });
    const content = await readFile(logpackPath, 'utf-8');

    expect(content).toContain('---BOOT---');
    expect(content).toContain('---TOGGLE#1---');
    expect(content).toContain('[G4] BOOT [CONV_HOOK]');
    expect(content).toContain('[G4] TOGGLE#1 [CONV_UI]');

    await rm(jsonlPath, { force: true });
    await rm(logpackPath, { force: true });
  });
});
