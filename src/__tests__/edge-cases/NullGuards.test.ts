/**
 * Tests Edge Cases — NullGuards, TypeCoercion, BoundaryValues, AsyncErrors
 * Coverage: cas limites sur dataUtils, LRUCache, hooks, composants
 * SPRINT 7 — Test Coverage Elevation (élargissement edge-cases)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  safeDisplay,
  extractNumber,
  extractString,
  formatValue,
  formatUptime,
} from '@/utils/dataUtils';
import { LRUCache } from '@/utils/LRUCache';
import { cn } from '@/utils/cn';

describe('Edge Cases — NullGuards', () => {
  describe('safeDisplay null/undefined/empty', () => {
    it('null → N/A', () => expect(safeDisplay(null)).toBe('N/A'));
    it('undefined → N/A', () => expect(safeDisplay(undefined)).toBe('N/A'));
    it('empty string → empty string', () => expect(safeDisplay('')).toBe(''));
    it('0 → "0" (safeDisplay appelle toString)', () => expect(safeDisplay(0)).toBe('0'));
    it('false → "false"', () => expect(safeDisplay(false)).toBe('false'));
    it('NaN → "NaN"', () => expect(safeDisplay(NaN)).toBe('NaN'));
  });

  describe('extractNumber boundary values', () => {
    it('Number.MAX_SAFE_INTEGER passe', () => {
      expect(extractNumber(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
    });
    it('Number.MIN_SAFE_INTEGER passe', () => {
      expect(extractNumber(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
    });
    it('0 → 0', () => expect(extractNumber(0)).toBe(0));
    it('"0" → 0', () => expect(extractNumber('0')).toBe(0));
    it('NaN string → fallback', () => expect(extractNumber('NaN', 99)).toBe(99));
    it('Infinity → Infinity', () => expect(extractNumber(Infinity)).toBe(Infinity));
    it('true → fallback (non-numeric type)', () => {
      // true n'est ni number ni string ni object avec value/data/weight
      expect(extractNumber(true as unknown as number, 5)).toBe(5);
    });
  });

  describe('extractString edge cases', () => {
    it('empty string → empty string', () => {
      expect(extractString('')).toBe('');
    });
    it('objet vide → fallback', () => {
      expect(extractString({}, 'N/A')).toBe('N/A');
    });
    it('nested status chain', () => {
      expect(extractString({ status: { status: 'deep' } })).toBe('deep');
    });
  });

  describe('formatValue edge cases', () => {
    it('value=0 avec unité', () => expect(formatValue(0, '%')).toBe('0%'));
    it('value négatif', () => expect(formatValue(-5, 'ms')).toBe('-5ms'));
    it('très grand nombre en BPM', () => expect(formatValue(999, 'bpm')).toBe('999 BPM'));
    it('décimaux arrondis en %', () => expect(formatValue(99.9, '%')).toBe('100%'));
  });

  describe('formatUptime boundary values', () => {
    it('0 secondes → 0m', () => expect(formatUptime(0)).toBe('0m'));
    it('59 secondes → 0m', () => expect(formatUptime(59)).toBe('0m'));
    it('3600 secondes exactement → 1h 0m', () =>
      expect(formatUptime(3600)).toBe('1h 0m'));
    it('86399 secondes → 23h 59m', () => expect(formatUptime(86399)).toBe('23h 59m'));
    it('86400 secondes (24h exactement) → 24h 0m (car 24 > 24 est false)', () =>
      expect(formatUptime(86400)).toBe('24h 0m'));
    it('90000 secondes (25h) → 1j 1h', () => expect(formatUptime(90000)).toBe('1j 1h'));
  });
});

describe('Edge Cases — LRUCache', () => {
  it("maxSize=1 évince l'unique entrée", () => {
    const cache = new LRUCache<string>({ maxSize: 1 });
    cache.set('a', 'A');
    cache.set('b', 'B');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
  });

  it('set() avec même clé ne duplique pas', () => {
    const cache = new LRUCache<number>({ maxSize: 3 });
    cache.set('x', 1);
    cache.set('x', 2);
    expect(cache.size).toBe(1);
    expect(cache.get('x')).toBe(2);
  });

  it('get() sur clé vide retourne undefined', () => {
    const cache = new LRUCache<string>({ maxSize: 5 });
    expect(cache.get('')).toBeUndefined();
  });

  it('prune() sans TTL retourne 0', () => {
    const cache = new LRUCache<number>({ maxSize: 5 });
    cache.set('k', 1);
    expect(cache.prune()).toBe(0);
  });

  it('cache vide: keys() retourne []', () => {
    const cache = new LRUCache<string>({ maxSize: 5 });
    expect(cache.keys()).toEqual([]);
  });

  it('cache vide: values() retourne []', () => {
    const cache = new LRUCache<string>({ maxSize: 5 });
    expect(cache.values()).toEqual([]);
  });

  it('getStats() sur cache vide: utilization=0', () => {
    const cache = new LRUCache<string>({ maxSize: 10 });
    expect(cache.getStats().utilizationPercent).toBe(0);
  });

  it("onEvict s'appelle lors de delete() manuel (impl appelle onEvict dans delete)", () => {
    const onEvict = vi.fn();
    const cache = new LRUCache<string>({ maxSize: 5, onEvict });
    cache.set('a', 'A');
    cache.delete('a');
    expect(onEvict).toHaveBeenCalledWith('a', 'A');
  });
});

describe('Edge Cases — cn utility', () => {
  it('string vide → vide', () => {
    expect(cn('')).toBe('');
  });

  it('0 (falsy) est ignoré', () => {
    expect(cn('a', 0 as unknown as string, 'b')).toBe('a b');
  });

  it('tableau vide → vide', () => {
    expect(cn([])).toBe('');
  });

  it('objet entièrement false → vide', () => {
    expect(cn({ a: false, b: false })).toBe('');
  });

  it('classes avec espaces multiples', () => {
    const result = cn('  a  ', 'b');
    // clsx normalise les espaces
    expect(result).toContain('a');
    expect(result).toContain('b');
  });
});

describe('Edge Cases — Type coercion protection', () => {
  it('safeDisplay sur objet circulaire retourne String(value) en fallback', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    // JSON.stringify throw sur circulaire, fallback String()
    const result = safeDisplay(circular);
    expect(typeof result).toBe('string');
    expect(result).not.toBe('N/A');
  });

  it('extractNumber sur objet imbriqué profond', () => {
    const deep = { value: { value: { value: 42 } } };
    // extractNumber recursion sur { value: ... }
    expect(extractNumber(deep as unknown as number)).toBe(42);
  });
});
