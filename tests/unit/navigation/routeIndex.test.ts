/**
 * Gate 12 Surface Migration Test — routeIndex
 *
 * Verifies:
 * 1. All 30 routes from the Surface Decision Matrix are in ROUTE_INDEX
 * 2. Route counts match the matrix (11 DAILY, 14 SYSTEM, 2 DEV, 1 DISPLAY_ONLY, 2 SIMULATED)
 * 3. SIMULATED routes have KEEP_SIMULATED decision and SIMULATED_UI truthClass
 * 4. No route has inDailyMode=true with decision != KEEP_DAILY
 * 5. Alias counts match the matrix for key routes
 * 6. getRouteEntry lookup works
 * 7. isSimulatedEntry helper works
 * 8. PALETTE_ROUTES covers all 30 classified routes
 * 9. PALETTE_ROUTES SIMULATED routes have [SIMULATED] label prefix
 */

import { describe, it, expect } from 'vitest';
import {
  ROUTE_INDEX,
  DAILY_ENTRIES,
  SYSTEM_ENTRIES,
  DEV_ENTRIES,
  SIMULATED_ENTRIES,
  DISPLAY_ONLY_ENTRIES,
  getRouteEntry,
  isSimulatedEntry,
} from '@/lib/routeIndex';
import { PALETTE_ROUTES } from '@/components/palette/commands/routes';

describe('routeIndex — route count (Gate 7 matrix: 30 routes)', () => {
  it('ROUTE_INDEX has exactly 30 routes', () => {
    expect(ROUTE_INDEX).toHaveLength(30);
  });

  it('DAILY_ENTRIES has exactly 11 routes', () => {
    expect(DAILY_ENTRIES).toHaveLength(11);
  });

  it('SYSTEM_ENTRIES has exactly 14 routes', () => {
    expect(SYSTEM_ENTRIES).toHaveLength(14);
  });

  it('DEV_ENTRIES has exactly 2 routes', () => {
    expect(DEV_ENTRIES).toHaveLength(2);
  });

  it('DISPLAY_ONLY_ENTRIES has exactly 1 route', () => {
    expect(DISPLAY_ONLY_ENTRIES).toHaveLength(1);
  });

  it('SIMULATED_ENTRIES has exactly 2 routes', () => {
    expect(SIMULATED_ENTRIES).toHaveLength(2);
  });

  it('all 30 routes are unique paths', () => {
    const routes = ROUTE_INDEX.map(r => r.route);
    const unique = new Set(routes);
    expect(unique.size).toBe(30);
  });
});

describe('routeIndex — SIMULATED_UI classification (SIM-03)', () => {
  it('/orchestration-intelligence is KEEP_SIMULATED with SIMULATED_UI truthClass', () => {
    const entry = getRouteEntry('/orchestration-intelligence');
    expect(entry).toBeDefined();
    expect(entry?.decision).toBe('KEEP_SIMULATED');
    expect(entry?.truthClass).toBe('SIMULATED_UI');
    expect(entry?.inDailyMode).toBe(false);
  });

  it('/quantum-center is KEEP_SIMULATED with SIMULATED_UI truthClass', () => {
    const entry = getRouteEntry('/quantum-center');
    expect(entry).toBeDefined();
    expect(entry?.decision).toBe('KEEP_SIMULATED');
    expect(entry?.truthClass).toBe('SIMULATED_UI');
    expect(entry?.inDailyMode).toBe(false);
  });

  it('isSimulatedEntry returns true for SIMULATED routes', () => {
    expect(isSimulatedEntry('/orchestration-intelligence')).toBe(true);
    expect(isSimulatedEntry('/quantum-center')).toBe(true);
  });

  it('isSimulatedEntry returns false for non-SIMULATED routes', () => {
    expect(isSimulatedEntry('/titane')).toBe(false);
    expect(isSimulatedEntry('/admin')).toBe(false);
    expect(isSimulatedEntry('/dev')).toBe(false);
  });
});

describe('routeIndex — Daily mode integrity', () => {
  it('no SIMULATED route has inDailyMode=true', () => {
    for (const entry of SIMULATED_ENTRIES) {
      expect(entry.inDailyMode).toBe(false);
    }
  });

  it('no SYSTEM route has inDailyMode=true', () => {
    for (const entry of SYSTEM_ENTRIES) {
      expect(entry.inDailyMode).toBe(false);
    }
  });

  it('all KEEP_DAILY routes have inDailyMode=true', () => {
    for (const entry of DAILY_ENTRIES) {
      expect(entry.inDailyMode).toBe(true);
    }
  });
});

describe('routeIndex — key route classifications', () => {
  it('/titane is KEEP_DAILY with 12 aliases', () => {
    const entry = getRouteEntry('/titane');
    expect(entry?.decision).toBe('KEEP_DAILY');
    expect(entry?.aliasCount).toBe(12);
  });

  it('/admin is KEEP_SYSTEM with 17 aliases (gateway)', () => {
    const entry = getRouteEntry('/admin');
    expect(entry?.decision).toBe('KEEP_SYSTEM');
    expect(entry?.aliasCount).toBe(17);
  });

  it('/dev is KEEP_DEV with 13 aliases', () => {
    const entry = getRouteEntry('/dev');
    expect(entry?.decision).toBe('KEEP_DEV');
    expect(entry?.aliasCount).toBe(13);
  });

  it('/total-dev is KEEP_DEV', () => {
    const entry = getRouteEntry('/total-dev');
    expect(entry?.decision).toBe('KEEP_DEV');
    expect(entry?.inDailyMode).toBe(false);
  });

  it('/performance is KEEP_DISPLAY_ONLY', () => {
    const entry = getRouteEntry('/performance');
    expect(entry?.decision).toBe('KEEP_DISPLAY_ONLY');
  });
});

describe('routeIndex — getRouteEntry', () => {
  it('query strings are stripped before lookup', () => {
    const entry = getRouteEntry('/titane?tab=conversation');
    expect(entry?.route).toBe('/titane');
  });

  it('returns undefined for unclassified routes', () => {
    expect(getRouteEntry('/unknown')).toBeUndefined();
    expect(getRouteEntry('/')).toBeUndefined();
  });
});

describe('PALETTE_ROUTES — 30-route surface migration (Gate 12)', () => {
  it('PALETTE_ROUTES has exactly 30 entries', () => {
    expect(PALETTE_ROUTES).toHaveLength(30);
  });

  it('every route in ROUTE_INDEX has a corresponding palette entry', () => {
    const paletteRoutes = new Set(PALETTE_ROUTES.map(r => r.to));
    for (const entry of ROUTE_INDEX) {
      expect(paletteRoutes).toContain(entry.route);
    }
  });

  it('SIMULATED palette entries have [SIMULATED] label prefix', () => {
    const simulated = PALETTE_ROUTES.filter(r => r.decision === 'KEEP_SIMULATED');
    expect(simulated).toHaveLength(2);
    for (const entry of simulated) {
      expect(entry.label).toMatch(/^\[SIMULATED\]/);
    }
  });

  it('PALETTE_ROUTES IDs are unique', () => {
    const ids = PALETTE_ROUTES.map(r => r.id);
    expect(new Set(ids).size).toBe(30);
  });

  it('all PALETTE_ROUTES have a decision field', () => {
    for (const r of PALETTE_ROUTES) {
      expect(r.decision).toBeDefined();
      expect(['KEEP_DAILY', 'KEEP_SYSTEM', 'KEEP_DEV', 'KEEP_SIMULATED', 'KEEP_DISPLAY_ONLY']).toContain(r.decision);
    }
  });
});
