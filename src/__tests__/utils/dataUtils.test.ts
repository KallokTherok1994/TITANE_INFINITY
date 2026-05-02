/**
 * Tests: dataUtils — safeDisplay, extractNumber, extractString, mapBackendData,
 *        formatValue, getStatusVariant, formatUptime
 * Coverage: src/utils/dataUtils.ts (100% functions)
 * SPRINT 7 — Test Coverage Elevation
 */

import { describe, it, expect } from 'vitest';
import {
  safeDisplay,
  extractNumber,
  extractString,
  mapBackendData,
  formatValue,
  getStatusVariant,
  formatUptime,
} from '@/utils/dataUtils';

describe('safeDisplay', () => {
  it('devrait retourner N/A pour null', () => {
    expect(safeDisplay(null)).toBe('N/A');
  });

  it('devrait retourner N/A pour undefined', () => {
    expect(safeDisplay(undefined)).toBe('N/A');
  });

  it('devrait retourner une string inchangée', () => {
    expect(safeDisplay('hello')).toBe('hello');
  });

  it('devrait convertir un nombre en string (toString)', () => {
    // safeDisplay appelle .toString() sur les primitives
    expect(safeDisplay(42)).toBe('42');
  });

  it('devrait convertir un booléen en string', () => {
    expect(safeDisplay(true)).toBe('true');
    expect(safeDisplay(false)).toBe('false');
  });

  it("devrait extraire la propriété value d'un objet", () => {
    expect(safeDisplay({ value: 'inner' })).toBe('inner');
  });

  it("devrait extraire la propriété data d'un objet (converti en string)", () => {
    // data=99 → safeDisplay(99) → '99'
    expect(safeDisplay({ data: 99 })).toBe('99');
  });

  it('devrait sérialiser un objet sans value ni data', () => {
    const result = safeDisplay({ x: 1, y: 2 });
    expect(typeof result).toBe('string');
    expect(result).toContain('"x"');
  });
});

describe('extractNumber', () => {
  it('devrait retourner un number directement', () => {
    expect(extractNumber(42)).toBe(42);
  });

  it('devrait parser une string numérique', () => {
    expect(extractNumber('3.14')).toBeCloseTo(3.14);
  });

  it('devrait retourner le fallback pour une string non-numérique', () => {
    expect(extractNumber('abc', 5)).toBe(5);
  });

  it('devrait utiliser fallback 0 par défaut', () => {
    expect(extractNumber(null as unknown as number)).toBe(0);
  });

  it('devrait extraire depuis { value: n }', () => {
    expect(extractNumber({ value: 7 })).toBe(7);
  });

  it('devrait extraire depuis { data: n }', () => {
    expect(extractNumber({ data: 8 })).toBe(8);
  });

  it('devrait extraire depuis { weight: n }', () => {
    expect(extractNumber({ weight: 9 })).toBe(9);
  });
});

describe('extractString', () => {
  it('devrait retourner une string directement', () => {
    expect(extractString('hello')).toBe('hello');
  });

  it('devrait convertir un nombre en string', () => {
    expect(extractString(5)).toBe('5');
  });

  it('devrait retourner Actif pour true', () => {
    expect(extractString(true)).toBe('Actif');
  });

  it('devrait retourner Inactif pour false', () => {
    expect(extractString(false)).toBe('Inactif');
  });

  it('devrait retourner le fallback pour null', () => {
    expect(extractString(null, 'default')).toBe('default');
  });

  it('devrait extraire depuis { status: str }', () => {
    expect(extractString({ status: 'active' })).toBe('active');
  });

  it('devrait extraire depuis { state: str }', () => {
    expect(extractString({ state: 'running' })).toBe('running');
  });

  it('devrait extraire depuis { name: str }', () => {
    expect(extractString({ name: 'titan' })).toBe('titan');
  });

  it('devrait extraire depuis { id: str }', () => {
    expect(extractString({ id: 'kb-001' })).toBe('kb-001');
  });
});

describe('mapBackendData', () => {
  it('devrait mapper un objet backend complet', () => {
    const data = {
      id: 'mod-1',
      name: 'Module Alpha',
      status: 'active',
      value: 42,
      unit: '%',
      connections: { a: 1 },
    };
    const result = mapBackendData(data);
    expect(result.id).toBe('mod-1');
    expect(result.name).toBe('Module Alpha');
    expect(result.status).toBe('active');
    expect(result.value).toBe(42);
    expect(result.unit).toBe('%');
    expect(result.metadata).toEqual({ a: 1 });
  });

  it('devrait utiliser node_type comme fallback pour id et name', () => {
    const data = { node_type: 'kb_node', state: 'idle', weight: 0.5 };
    const result = mapBackendData(data);
    expect(result.id).toBe('kb_node');
    expect(result.name).toBe('kb_node');
    expect(result.status).toBe('idle');
    expect(result.value).toBe(0.5);
  });

  it('devrait retourner des defaults pour une non-objet', () => {
    const result = mapBackendData('raw string');
    expect(result.id).toBe('unknown');
    expect(result.name).toBe('Module');
    expect(result.status).toBe('Unknown');
  });

  it('devrait retourner des defaults pour null', () => {
    const result = mapBackendData(null);
    expect(result.id).toBe('unknown');
  });
});

describe('formatValue', () => {
  it('devrait formater en pourcentage avec %', () => {
    expect(formatValue(85.7, '%')).toBe('86%');
  });

  it('devrait formater en pourcentage avec percent', () => {
    expect(formatValue(50, 'percent')).toBe('50%');
  });

  it('devrait formater en millisecondes avec ms', () => {
    expect(formatValue(123.4, 'ms')).toBe('123ms');
  });

  it('devrait formater en millisecondes avec milliseconds', () => {
    expect(formatValue(200, 'milliseconds')).toBe('200ms');
  });

  it('devrait formater en BPM', () => {
    expect(formatValue(75, 'bpm')).toBe('75 BPM');
  });

  it('devrait formater avec une unité arbitraire', () => {
    expect(formatValue(1.5, 'kg')).toBe('1.5 kg');
  });

  it('devrait retourner le nombre seul sans unité', () => {
    expect(formatValue(100)).toBe('100');
  });
});

describe('getStatusVariant', () => {
  it('devrait retourner success pour >= high (80)', () => {
    expect(getStatusVariant(80)).toBe('success');
    expect(getStatusVariant(100)).toBe('success');
  });

  it('devrait retourner warning entre low et high', () => {
    expect(getStatusVariant(50)).toBe('warning');
    expect(getStatusVariant(79)).toBe('warning');
  });

  it('devrait retourner error sous low (50)', () => {
    expect(getStatusVariant(0)).toBe('error');
    expect(getStatusVariant(49)).toBe('error');
  });

  it('devrait accepter des seuils personnalisés', () => {
    expect(getStatusVariant(60, { high: 70, low: 40 })).toBe('warning');
    expect(getStatusVariant(75, { high: 70, low: 40 })).toBe('success');
    expect(getStatusVariant(30, { high: 70, low: 40 })).toBe('error');
  });
});

describe('formatUptime', () => {
  it('devrait formater les secondes seules (< 1h)', () => {
    expect(formatUptime(90)).toBe('1m');
    expect(formatUptime(0)).toBe('0m');
  });

  it('devrait formater en heures et minutes', () => {
    expect(formatUptime(3661)).toBe('1h 1m');
    expect(formatUptime(7200)).toBe('2h 0m');
  });

  it('devrait formater en jours quand > 24h', () => {
    expect(formatUptime(86400 + 3600)).toBe('1j 1h');
    expect(formatUptime(172800)).toBe('2j 0h');
  });
});
