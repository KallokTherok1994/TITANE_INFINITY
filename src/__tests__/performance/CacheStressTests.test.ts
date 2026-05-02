/**
 * Tests Performance — stress render, memoization, concurrent ops
 * Coverage: LRUCache haute charge, createMemoizedFunction, rendu listes larges
 * SPRINT 7 — Test Coverage Elevation
 */

import { describe, it, expect, vi } from 'vitest';
import { LRUCache, createMemoizedFunction } from '@/utils/LRUCache';

describe('Performance — LRUCache stress', () => {
  it('devrait gérer 10 000 insertions sans erreur', () => {
    const cache = new LRUCache<number>({ maxSize: 1000 });
    for (let i = 0; i < 10000; i++) {
      cache.set(`key-${i}`, i);
    }
    expect(cache.size).toBe(1000);
  });

  it('devrait maintenir maxSize après 10 000 insertions', () => {
    const cache = new LRUCache<string>({ maxSize: 100 });
    for (let i = 0; i < 10000; i++) {
      cache.set(`k${i}`, `v${i}`);
    }
    expect(cache.size).toBeLessThanOrEqual(100);
  });

  it('devrait compléter 10 000 get() en <100ms', () => {
    const cache = new LRUCache<number>({ maxSize: 500 });
    for (let i = 0; i < 500; i++) {
      cache.set(`k${i}`, i);
    }
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      cache.get(`k${i % 500}`);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('devrait gérer les appels delete() massifs', () => {
    const cache = new LRUCache<number>({ maxSize: 1000 });
    for (let i = 0; i < 500; i++) {
      cache.set(`k${i}`, i);
    }
    for (let i = 0; i < 500; i++) {
      cache.delete(`k${i}`);
    }
    expect(cache.size).toBe(0);
  });
});

describe('Performance — createMemoizedFunction stress', () => {
  it('devrait servir 1000 hits cache sans recalcul', () => {
    const fn = vi.fn((n: number) => n * n);
    const memoized = createMemoizedFunction(fn, { maxSize: 100 });
    // Pré-charger 10 valeurs
    for (let i = 0; i < 10; i++) {
      memoized(i);
    }
    // 1000 hits depuis le cache
    for (let j = 0; j < 1000; j++) {
      memoized(j % 10);
    }
    expect(fn).toHaveBeenCalledTimes(10);
  });

  it('devrait être plus rapide avec memoization', () => {
    let callCount = 0;
    const expensiveFn = (n: number) => {
      callCount++;
      // Simulation légère (pas de sleep)
      let result = 0;
      for (let i = 0; i < 1000; i++) result += n * i;
      return result;
    };
    const memoized = createMemoizedFunction(expensiveFn, { maxSize: 50 });

    const start1 = performance.now();
    for (let i = 0; i < 50; i++) memoized(i);
    const firstRun = performance.now() - start1;

    const start2 = performance.now();
    for (let i = 0; i < 50; i++) memoized(i);
    const cachedRun = performance.now() - start2;

    // Le deuxième passage doit être plus rapide que le premier
    expect(cachedRun).toBeLessThan(firstRun + 1); // tolérance 1ms
    expect(callCount).toBe(50); // calculé une seule fois chaque
  });
});

describe('Performance — TTL mass expiry', () => {
  it('prune() sur 1000 entrées expirées doit être rapide', () => {
    vi.useFakeTimers();
    const cache = new LRUCache<number>({ maxSize: 2000, ttlMs: 100 });
    for (let i = 0; i < 1000; i++) {
      cache.set(`k${i}`, i);
    }
    vi.advanceTimersByTime(200);

    const start = performance.now();
    const pruned = cache.prune();
    const elapsed = performance.now() - start;

    expect(pruned).toBe(1000);
    expect(elapsed).toBeLessThan(50);
    vi.useRealTimers();
  });
});

describe('Performance — onEvict callback count', () => {
  it("onEvict appelé exactement N fois lors d'overflow", () => {
    const onEvict = vi.fn();
    const cache = new LRUCache<number>({ maxSize: 10, onEvict });
    // Insérer 20 entrées → 10 évictions
    for (let i = 0; i < 20; i++) {
      cache.set(`k${i}`, i);
    }
    expect(onEvict).toHaveBeenCalledTimes(10);
  });
});
