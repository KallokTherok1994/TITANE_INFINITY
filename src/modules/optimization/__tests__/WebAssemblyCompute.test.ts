import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { webAssemblyCompute } from '../WebAssemblyCompute';

describe('WebAssemblyCompute', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await webAssemblyCompute.destroy();
  });

  afterEach(async () => {
    await webAssemblyCompute.destroy();
  });

  it('downgrades initialization compile failures to a warned JS fallback', async () => {
    const compileSpy = vi
      .spyOn(WebAssembly, 'compile')
      .mockRejectedValueOnce(new WebAssembly.CompileError('invalid wasm test fixture'));
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const initialized = await webAssemblyCompute.initialize();

    expect(initialized).toBe(false);
    expect(webAssemblyCompute.getMetrics().isWASMActive).toBe(false);
    expect(compileSpy).toHaveBeenCalledOnce();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[WebAssemblyCompute] WASM initialization failed, using JS fallback:',
      expect.any(WebAssembly.CompileError)
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('executes vector addition through the JS fallback when WASM initialization fails', async () => {
    vi.spyOn(WebAssembly, 'compile').mockRejectedValueOnce(
      new WebAssembly.CompileError('invalid wasm test fixture')
    );
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await webAssemblyCompute.initialize();
    const beforeMetrics = webAssemblyCompute.getMetrics();

    const result = await webAssemblyCompute.executeTask({
      id: 'vector-add-fallback',
      type: 'vectorOp',
      input: new Float32Array([1, 2, 3, 4]),
      parameters: { operation: 'add' },
      priority: 1,
    });

    expect(result.success).toBe(true);
    expect(result.usedWASM).toBe(false);
    expect(Array.from(result.output as Float32Array)).toEqual([4, 6]);
    expect(webAssemblyCompute.getMetrics().tasksExecutedJS).toBe(
      beforeMetrics.tasksExecutedJS + 1
    );
  });
});