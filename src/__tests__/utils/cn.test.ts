/**
 * Tests: cn — class names utility (clsx wrapper)
 * Coverage: src/utils/cn.ts
 * SPRINT 7 — Test Coverage Elevation
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn', () => {
  it('devrait retourner une string vide sans arguments', () => {
    expect(cn()).toBe('');
  });

  it('devrait retourner une seule classe', () => {
    expect(cn('btn')).toBe('btn');
  });

  it('devrait combiner plusieurs classes', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('devrait ignorer les valeurs falsy', () => {
    expect(cn('btn', false, null, undefined, 'active')).toBe('btn active');
  });

  it('devrait supporter les conditions ternaires', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')).toBe(
      'btn btn-active'
    );
  });

  it('devrait supporter les tableaux de classes', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('devrait supporter les objets conditionnels', () => {
    expect(cn({ active: true, disabled: false, visible: true })).toBe(
      'active visible'
    );
  });

  it('devrait combiner objets, tableaux et strings', () => {
    const result = cn('base', ['extra'], { conditional: true });
    expect(result).toBe('base extra conditional');
  });

  it('devrait préserver les espaces dans les classes multiples', () => {
    const result = cn('flex', 'items-center', 'justify-between');
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-between');
  });
});
