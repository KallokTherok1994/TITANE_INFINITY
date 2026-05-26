/**
 * TITANE∞ v35.1.2 — lazyWithRetry tests (deterministic, pure async)
 *
 * We test `loadWithRetry` directly instead of mounting a Suspense boundary,
 * because happy-dom + React Suspense + vitest microtask scheduling proved
 * non-deterministic (8/8 PASS one run, 4/4 timeout the next). The pure-async
 * helper exercises the exact same retry/cache/backoff code path the lazy()
 * wrapper depends on, with stable timing.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComponentType } from 'react';
import {
  loadWithRetry,
  lazyWithRetry,
  __resetLazyWithRetryCacheForTests,
} from '../lazyWithRetry';

type Mod = { default: ComponentType<unknown> };

function makeFactory(behaviour: ('ok' | 'fail')[]) {
  let call = 0;
  // A trivial component sentinel; we never render it.
  const Sentinel = (() => null) as unknown as ComponentType<unknown>;
  return vi.fn<() => Promise<Mod>>(async () => {
    const idx = call++;
    const op = behaviour[Math.min(idx, behaviour.length - 1)];
    if (op === 'fail') {
      throw new Error(`fail#${idx}`);
    }
    return { default: Sentinel };
  });
}

describe('loadWithRetry (deterministic core)', () => {
  beforeEach(() => {
    __resetLazyWithRetryCacheForTests();
  });

  it('resolves on first attempt when factory succeeds', async () => {
    const factory = makeFactory(['ok']);
    const mod = await loadWithRetry(factory, undefined, 3, [1, 1, 1]);
    expect(mod.default).toBeDefined();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('retries on rejection and eventually succeeds', async () => {
    const factory = makeFactory(['fail', 'fail', 'ok']);
    const mod = await loadWithRetry(factory, undefined, 3, [1, 1, 1]);
    expect(mod.default).toBeDefined();
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('throws after retries exhausted', async () => {
    const factory = makeFactory(['fail', 'fail', 'fail']);
    await expect(loadWithRetry(factory, undefined, 3, [1, 1, 1])).rejects.toThrow(
      /fail#2/
    );
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('respects backoff schedule (uses last entry when attempts exceed schedule)', async () => {
    const factory = makeFactory(['fail', 'ok']);
    const start = Date.now();
    await loadWithRetry(factory, undefined, 3, [5]); // single-entry schedule, reused
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(4); // at least ~5ms backoff once
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('caches resolved module under cacheKey across multiple calls', async () => {
    const factory = makeFactory(['ok']);
    const a = await loadWithRetry(factory, 'shared-key', 3, [1]);
    const b = await loadWithRetry(factory, 'shared-key', 3, [1]);
    expect(a.default).toBe(b.default);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('does not cache when no cacheKey is provided', async () => {
    const factory = makeFactory(['ok', 'ok']);
    await loadWithRetry(factory, undefined, 3, [1]);
    await loadWithRetry(factory, undefined, 3, [1]);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('isolates caches across distinct cacheKeys', async () => {
    const factory = makeFactory(['ok', 'ok']);
    await loadWithRetry(factory, 'key-a', 3, [1]);
    await loadWithRetry(factory, 'key-b', 3, [1]);
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe('lazyWithRetry (wrapper surface)', () => {
  it('returns a LazyExoticComponent shape compatible with React.lazy', () => {
    const factory = makeFactory(['ok']);
    const Comp = lazyWithRetry(factory, undefined, 3, [1]);
    // React.lazy returns an object exposing $$typeof + _payload internals.
    expect(typeof Comp).toBe('object');
    expect(Comp).not.toBeNull();
    // The $$typeof symbol is React's lazy marker.
    expect((Comp as unknown as { $$typeof: symbol }).$$typeof).toBeDefined();
  });
});
