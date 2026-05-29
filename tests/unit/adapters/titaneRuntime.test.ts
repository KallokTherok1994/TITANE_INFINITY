/**
 * Gate 10 Pilot Test — titaneRuntime adapter
 *
 * FallbackRuntimeAdapter is tested directly (avoids relying on isTauriRuntimeAvailable()).
 * In the Vitest environment, secureInvoke is mocked via src/test/setup.ts so
 * createRuntime() returns TauriRuntimeAdapter. That behavior is verified separately.
 *
 * Pilot command: persistent_memory_get_stats
 */

import { describe, it, expect } from 'vitest';
import { createRuntime, FallbackRuntimeAdapter, type TitaneRuntime } from '@/lib/adapters/titaneRuntime';

describe('FallbackRuntimeAdapter — direct usage', () => {
  it('mode is always fallback', () => {
    const adapter = new FallbackRuntimeAdapter();
    expect(adapter.mode).toBe('fallback');
  });

  it('isAvailable() returns true', () => {
    const adapter = new FallbackRuntimeAdapter();
    expect(adapter.isAvailable()).toBe(true);
  });

  it('resolves persistent_memory_get_stats from configured mock', async () => {
    const mockStats = {
      total: 7,
      count_by_level: { session: 2, intermediate: 3, long_term: 2 },
    };
    const adapter = new FallbackRuntimeAdapter({ persistent_memory_get_stats: mockStats });

    const result = await adapter.call('persistent_memory_get_stats');

    expect(result).toEqual(mockStats);
  });

  it('throws BLOCKED_ENV for commands not configured in mock map', async () => {
    const adapter = new FallbackRuntimeAdapter();
    await expect(adapter.call('persistent_memory_get_stats')).rejects.toThrow('BLOCKED_ENV');
  });

  it('throws BLOCKED_ENV with command name in message', async () => {
    const adapter = new FallbackRuntimeAdapter();
    await expect(adapter.call('any_unconfigured_command')).rejects.toThrow(
      "BLOCKED_ENV: 'any_unconfigured_command' is not available in fallback mode"
    );
  });

  it('type-erased TitaneRuntime interface works correctly', async () => {
    const mockData = { total: 0, count_by_level: {} };
    const runtime: TitaneRuntime = new FallbackRuntimeAdapter({
      persistent_memory_get_stats: mockData,
    });

    expect(runtime.mode).toBe('fallback');
    const result = await runtime.call('persistent_memory_get_stats');
    expect(result).toMatchObject({ total: 0 });
  });
});

describe('createRuntime — Vitest environment (Tauri mocked via setup.ts)', () => {
  it('returns TauriRuntimeAdapter because isTauriRuntimeAvailable() is true in test env', () => {
    const runtime = createRuntime();
    // Vitest setup.ts mocks the Tauri environment, so TauriRuntimeAdapter is selected
    expect(runtime.mode).toBe('tauri');
    expect(runtime.isAvailable()).toBe(true);
  });
});
