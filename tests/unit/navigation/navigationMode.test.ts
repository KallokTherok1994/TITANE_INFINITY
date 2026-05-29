/**
 * Gate 11 Navigation Mode Test — navigationMode constants
 *
 * Verifies:
 * 1. SIMULATED routes are excluded from Daily/System/Dev route sets
 * 2. Daily route count matches Gate 7 Surface Decision Matrix (11 routes)
 * 3. SIMULATED route detection helpers work correctly
 * 4. Route classification is exhaustive for known primary routes
 * 5. /total-dev is classified as DEV (not DAILY)
 */

import { describe, it, expect } from 'vitest';
import {
  DAILY_ROUTES,
  SYSTEM_ROUTES,
  DEV_ROUTES,
  SIMULATED_ROUTES,
  getRouteNavMode,
  isSimulatedRoute,
  isDailyRoute,
} from '@/lib/navigationMode';

describe('navigationMode — SIMULATED_UI exclusion (SIM-03)', () => {
  it('SIMULATED routes are not in DAILY_ROUTES', () => {
    for (const sr of SIMULATED_ROUTES) {
      expect(DAILY_ROUTES).not.toContain(sr);
    }
  });

  it('SIMULATED routes are not in SYSTEM_ROUTES', () => {
    for (const sr of SIMULATED_ROUTES) {
      expect(SYSTEM_ROUTES).not.toContain(sr);
    }
  });

  it('SIMULATED routes are not in DEV_ROUTES', () => {
    for (const sr of SIMULATED_ROUTES) {
      expect(DEV_ROUTES).not.toContain(sr);
    }
  });

  it('/orchestration-intelligence is classified as SIMULATED', () => {
    expect(getRouteNavMode('/orchestration-intelligence')).toBe('SIMULATED');
    expect(isSimulatedRoute('/orchestration-intelligence')).toBe(true);
    expect(isDailyRoute('/orchestration-intelligence')).toBe(false);
  });

  it('/quantum-center is classified as SIMULATED', () => {
    expect(getRouteNavMode('/quantum-center')).toBe('SIMULATED');
    expect(isSimulatedRoute('/quantum-center')).toBe(true);
    expect(isDailyRoute('/quantum-center')).toBe(false);
  });
});

describe('navigationMode — Daily route count (Gate 7 matrix: 11 routes)', () => {
  it('DAILY_ROUTES has exactly 11 routes', () => {
    expect(DAILY_ROUTES).toHaveLength(11);
  });

  it('DAILY_ROUTES contains all expected primary surfaces', () => {
    const expected = [
      '/titane', '/experience', '/time', '/memory', '/twins',
      '/research', '/multiproject', '/skills', '/knowledge', '/creation', '/evolution',
    ];
    for (const r of expected) {
      expect(DAILY_ROUTES).toContain(r);
    }
  });
});

describe('navigationMode — DEV route isolation (DV-02)', () => {
  it('/total-dev is classified as DEV, not DAILY', () => {
    expect(getRouteNavMode('/total-dev')).toBe('DEV');
    expect(isDailyRoute('/total-dev')).toBe(false);
    expect(isSimulatedRoute('/total-dev')).toBe(false);
  });

  it('/dev is classified as DEV', () => {
    expect(getRouteNavMode('/dev')).toBe('DEV');
    expect(isDailyRoute('/dev')).toBe(false);
  });
});

describe('navigationMode — Daily route helper', () => {
  it('primary daily surfaces return DAILY mode', () => {
    for (const route of ['/titane', '/time', '/memory', '/twins', '/knowledge']) {
      expect(isDailyRoute(route)).toBe(true);
    }
  });

  it('query strings are stripped before classification', () => {
    expect(getRouteNavMode('/titane?tab=conversation')).toBe('DAILY');
    expect(getRouteNavMode('/orchestration-intelligence?debug=1')).toBe('SIMULATED');
  });

  it('unknown routes return null', () => {
    expect(getRouteNavMode('/unknown-route')).toBeNull();
    expect(getRouteNavMode('/')).toBeNull();
  });
});

describe('navigationMode — System route count (Gate 7 matrix: 14 routes)', () => {
  it('SYSTEM_ROUTES has exactly 14 routes', () => {
    expect(SYSTEM_ROUTES).toHaveLength(14);
  });

  it('/admin is classified as SYSTEM', () => {
    expect(getRouteNavMode('/admin')).toBe('SYSTEM');
    expect(isDailyRoute('/admin')).toBe(false);
  });
});
