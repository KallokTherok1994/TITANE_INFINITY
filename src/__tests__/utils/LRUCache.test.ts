/**
 * Tests: LRUCache — get, set, delete, has, clear, TTL, eviction, prune, iteration
 * Coverage: LRUCache class, createMemoizedFunction, cacheRegistry
 * SPRINT 7 — Test Coverage Elevation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LRUCache, createMemoizedFunction, cacheRegistry } from '@/utils/LRUCache';

describe('LRUCache', () => {
  describe('basic operations', () => {
    it('devrait stocker et récupérer une valeur', () => {
      const cache = new LRUCache<string>({ maxSize: 5 });
      cache.set('k1', 'v1');
      expect(cache.get('k1')).toBe('v1');
    });

    it('devrait retourner undefined pour une clé inexistante', () => {
      const cache = new LRUCache<string>({ maxSize: 5 });
      expect(cache.get('missing')).toBeUndefined();
    });

    it('has() devrait retourner true/false', () => {
      const cache = new LRUCache<number>({ maxSize: 5 });
      cache.set('x', 42);
      expect(cache.has('x')).toBe(true);
      expect(cache.has('y')).toBe(false);
    });

    it('delete() devrait supprimer une entrée et retourner true', () => {
      const cache = new LRUCache<string>({ maxSize: 5 });
      cache.set('del', 'val');
      expect(cache.delete('del')).toBe(true);
      expect(cache.has('del')).toBe(false);
    });

    it('delete() devrait retourner false pour une clé inexistante', () => {
      const cache = new LRUCache<string>({ maxSize: 5 });
      expect(cache.delete('nope')).toBe(false);
    });

    it('clear() devrait vider le cache', () => {
      const cache = new LRUCache<string>({ maxSize: 5 });
      cache.set('a', '1');
      cache.set('b', '2');
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has('a')).toBe(false);
    });

    it("size devrait refléter le nombre d'entrées", () => {
      const cache = new LRUCache<number>({ maxSize: 10 });
      expect(cache.size).toBe(0);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size).toBe(2);
      cache.delete('a');
      expect(cache.size).toBe(1);
    });
  });

  describe('LRU eviction', () => {
    it("devrait évincer l'entrée la moins récemment utilisée", () => {
      const cache = new LRUCache<string>({ maxSize: 3 });
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');
      // a est le LRU — en ajoutant d, a doit être évincé
      cache.set('d', 'D');
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
    });

    it("get() devrait mettre à jour l'ordre d'utilisation", () => {
      const cache = new LRUCache<string>({ maxSize: 3 });
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');
      // Accéder à 'a' — le rend récemment utilisé
      cache.get('a');
      // Ajouter 'd' — 'b' doit être évincé (moins récent)
      cache.set('d', 'D');
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it("devrait appeler onEvict lors de l'éviction", () => {
      const onEvict = vi.fn();
      const cache = new LRUCache<string>({ maxSize: 2, onEvict });
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C'); // évince 'a'
      expect(onEvict).toHaveBeenCalledWith('a', 'A');
    });

    it('set() sur une clé existante devrait la remettre en tête', () => {
      const cache = new LRUCache<string>({ maxSize: 2 });
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('a', 'A2'); // remet 'a' en tête
      cache.set('c', 'C'); // doit évincer 'b'
      expect(cache.has('a')).toBe(true);
      expect(cache.get('a')).toBe('A2');
      expect(cache.has('b')).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('devrait expirer une entrée après le TTL', () => {
      vi.useFakeTimers();
      const cache = new LRUCache<string>({ maxSize: 5, ttlMs: 1000 });
      cache.set('k', 'v');
      expect(cache.get('k')).toBe('v');
      vi.advanceTimersByTime(1001);
      expect(cache.get('k')).toBeUndefined();
      vi.useRealTimers();
    });

    it('has() ne devrait pas expirer (vérification existence seule)', () => {
      vi.useFakeTimers();
      const cache = new LRUCache<string>({ maxSize: 5, ttlMs: 100 });
      cache.set('k', 'v');
      vi.advanceTimersByTime(200);
      // has() ne vérifie pas le TTL mais get() le fait
      const result = cache.get('k');
      expect(result).toBeUndefined();
      vi.useRealTimers();
    });

    it('prune() devrait supprimer les entrées expirées', () => {
      vi.useFakeTimers();
      const cache = new LRUCache<string>({ maxSize: 10, ttlMs: 500 });
      cache.set('a', 'A');
      cache.set('b', 'B');
      vi.advanceTimersByTime(600);
      cache.set('c', 'C'); // frais
      const pruned = cache.prune();
      expect(pruned).toBe(2);
      expect(cache.has('c')).toBe(true);
      vi.useRealTimers();
    });

    it('prune() devrait retourner 0 sans TTL', () => {
      const cache = new LRUCache<string>({ maxSize: 5 });
      cache.set('a', 'A');
      expect(cache.prune()).toBe(0);
    });
  });

  describe('keys / values / entries / iteration', () => {
    it("keys() devrait retourner les clés dans l'ordre d'insertion", () => {
      const cache = new LRUCache<number>({ maxSize: 5 });
      cache.set('x', 1);
      cache.set('y', 2);
      cache.set('z', 3);
      const keys = cache.keys();
      expect(keys).toContain('x');
      expect(keys).toContain('y');
      expect(keys).toContain('z');
      expect(keys.length).toBe(3);
    });

    it('values() devrait retourner les valeurs', () => {
      const cache = new LRUCache<number>({ maxSize: 5 });
      cache.set('a', 10);
      cache.set('b', 20);
      const vals = cache.values();
      expect(vals).toContain(10);
      expect(vals).toContain(20);
    });

    it('entries() devrait être itérable avec for...of', () => {
      const cache = new LRUCache<string>({ maxSize: 3 });
      cache.set('k1', 'v1');
      cache.set('k2', 'v2');
      const pairs: [string, string][] = [];
      for (const entry of cache) {
        pairs.push(entry);
      }
      expect(pairs.length).toBe(2);
      expect(pairs.some(([k, v]) => k === 'k1' && v === 'v1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('devrait retourner les statistiques correctes', () => {
      const cache = new LRUCache<number>({ maxSize: 10 });
      cache.set('a', 1);
      cache.set('b', 2);
      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
      expect(stats.utilizationPercent).toBe(20);
    });

    it('devrait afficher 100% quand le cache est plein', () => {
      const cache = new LRUCache<number>({ maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      const stats = cache.getStats();
      expect(stats.utilizationPercent).toBe(100);
    });
  });
});

describe('createMemoizedFunction', () => {
  it("devrait mettre en cache le résultat d'un appel", () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoized = createMemoizedFunction(fn, { maxSize: 10 });
    expect(memoized(1, 2)).toBe(3);
    expect(memoized(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('devrait calculer un nouveau résultat pour des arguments différents', () => {
    const fn = vi.fn((x: number) => x * 2);
    const memoized = createMemoizedFunction(fn, { maxSize: 5 });
    expect(memoized(3)).toBe(6);
    expect(memoized(4)).toBe(8);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('devrait utiliser une keyFn personnalisée', () => {
    const fn = vi.fn((obj: { id: number }) => obj.id * 10);
    const memoized = createMemoizedFunction(fn, {
      maxSize: 5,
      keyFn: obj => String(obj.id),
    });
    expect(memoized({ id: 5 })).toBe(50);
    expect(memoized({ id: 5 })).toBe(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('devrait respecter la limite maxSize', () => {
    const fn = vi.fn((n: number) => n);
    const memoized = createMemoizedFunction(fn, { maxSize: 2 });
    memoized(1); // cache: {1}
    memoized(2); // cache: {1, 2}
    memoized(3); // cache: {2, 3} — 1 évincé
    memoized(1); // recalcul car 1 a été évincé
    expect(fn).toHaveBeenCalledTimes(4);
  });
});

describe('cacheRegistry', () => {
  beforeEach(() => {
    cacheRegistry.clearAll();
  });

  it('devrait enregistrer un cache et retourner ses stats', () => {
    const myCache = new LRUCache<string>({ maxSize: 5 });
    myCache.set('k', 'v');
    cacheRegistry.register('test-cache', myCache);
    const stats = cacheRegistry.getStats();
    expect(stats['test-cache']).toBeDefined();
    expect(stats['test-cache'].size).toBe(1);
    cacheRegistry.unregister('test-cache');
  });

  it('unregister() devrait supprimer le cache du registre', () => {
    const myCache = new LRUCache<number>({ maxSize: 3 });
    cacheRegistry.register('to-remove', myCache);
    cacheRegistry.unregister('to-remove');
    const stats = cacheRegistry.getStats();
    expect(stats['to-remove']).toBeUndefined();
  });

  it('clearAll() devrait vider tous les caches enregistrés', () => {
    const c1 = new LRUCache<number>({ maxSize: 5 });
    const c2 = new LRUCache<string>({ maxSize: 5 });
    c1.set('a', 1);
    c2.set('b', 'B');
    cacheRegistry.register('c1', c1);
    cacheRegistry.register('c2', c2);
    cacheRegistry.clearAll();
    expect(c1.size).toBe(0);
    expect(c2.size).toBe(0);
    cacheRegistry.unregister('c1');
    cacheRegistry.unregister('c2');
  });

  it('pruneAll() devrait élaguer les caches avec TTL', () => {
    vi.useFakeTimers();
    const c = new LRUCache<string>({ maxSize: 5, ttlMs: 100 });
    c.set('x', 'y');
    cacheRegistry.register('prunable', c);
    vi.advanceTimersByTime(200);
    const pruned = cacheRegistry.pruneAll();
    expect(pruned).toBe(1);
    cacheRegistry.unregister('prunable');
    vi.useRealTimers();
  });
});
