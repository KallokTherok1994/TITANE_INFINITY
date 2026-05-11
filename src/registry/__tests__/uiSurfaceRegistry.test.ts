/**
 * Registry tests — UI_BACKEND_TRUTH_CERTIFICATION_v46
 * Validates structural integrity of uiSurfaceRegistry.ts
 * Rule 16: mandatory tests for every new integration.
 */
import { describe, it, expect } from 'vitest';
import {
  UI_SURFACE_REGISTRY,
  UI_ALIAS_REGISTRY,
  getSurface,
  getSurfacesByStatus,
  getSurfacesByTruthClass,
  getSimulatedSurfaces,
  getAliasRoutes,
  getCanonicalRoutes,
  getRegistryStats,
} from '../uiSurfaceRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURAL INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────

describe('UI_SURFACE_REGISTRY structural integrity', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(UI_SURFACE_REGISTRY)).toBe(true);
    expect(UI_SURFACE_REGISTRY.length).toBeGreaterThan(0);
  });

  it('has no duplicate canonical routes', () => {
    const routes = UI_SURFACE_REGISTRY.map(s => s.route);
    const unique = new Set(routes);
    expect(unique.size).toBe(routes.length);
  });

  it('has no duplicate pageIds', () => {
    const ids = UI_SURFACE_REGISTRY.map(s => s.pageId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every surface has a valid route starting with /', () => {
    for (const surface of UI_SURFACE_REGISTRY) {
      expect(surface.route).toMatch(/^\//);
    }
  });

  it('every surface has a non-empty rootTestId', () => {
    for (const surface of UI_SURFACE_REGISTRY) {
      expect(surface.rootTestId).toBeTruthy();
      expect(typeof surface.rootTestId).toBe('string');
    }
  });

  it('every surface has a status that is not UNKNOWN', () => {
    const unknownSurfaces = UI_SURFACE_REGISTRY.filter(s => s.status === 'UNKNOWN');
    expect(unknownSurfaces.map(s => s.route)).toEqual([]);
  });

  it('every surface has a truthClass', () => {
    for (const surface of UI_SURFACE_REGISTRY) {
      expect(surface.truthClass).toBeTruthy();
    }
  });

  it('every surface has a navOwner or null (not undefined)', () => {
    for (const surface of UI_SURFACE_REGISTRY) {
      expect(surface.navOwner !== undefined).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TABS VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe('Tab definitions', () => {
  it('every tab has a non-empty tabId and testId', () => {
    for (const surface of UI_SURFACE_REGISTRY) {
      if (!surface.tabs || surface.tabs.length === 0) continue;
      for (const tab of surface.tabs) {
        expect(tab.tabId).toBeTruthy();
        expect(tab.testId).toBeTruthy();
        expect(typeof tab.testId).toBe('string');
      }
    }
  });

  it('no duplicate tabIds within a surface', () => {
    for (const surface of UI_SURFACE_REGISTRY) {
      if (!surface.tabs || surface.tabs.length === 0) continue;
      const tabIds = surface.tabs.map(t => t.tabId);
      const unique = new Set(tabIds);
      expect(unique.size).toBe(tabIds.length);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ALIAS VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe('Alias registry', () => {
  it('exports a non-empty alias array', () => {
    expect(Array.isArray(UI_ALIAS_REGISTRY)).toBe(true);
    expect(UI_ALIAS_REGISTRY.length).toBeGreaterThan(0);
  });

  it('every alias has a non-empty from and canonicalRoute', () => {
    for (const alias of UI_ALIAS_REGISTRY) {
      expect(alias.from).toMatch(/^\//);
      expect(alias.canonicalRoute).toMatch(/^\//);
    }
  });

  it('every alias canonicalRoute exists in registry', () => {
    const canonicals = new Set(UI_SURFACE_REGISTRY.map(s => s.route));
    for (const alias of UI_ALIAS_REGISTRY) {
      expect(
        canonicals.has(alias.canonicalRoute),
        `Alias ${alias.from} → ${alias.canonicalRoute}: canonicalRoute not in registry`
      ).toBe(true);
    }
  });

  it('no alias points to itself as canonicalRoute', () => {
    for (const alias of UI_ALIAS_REGISTRY) {
      expect(alias.from).not.toBe(alias.canonicalRoute);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TRUTH CLASS RULES
// ─────────────────────────────────────────────────────────────────────────────

describe('Truth class rules', () => {
  it('SIMULATED_UI surfaces must not be ACTIVE_SYNCED', () => {
    const simulated = getSimulatedSurfaces();
    for (const s of simulated) {
      expect(s.status).not.toBe('ACTIVE_SYNCED');
    }
  });

  it('ACTIVE_SYNCED surfaces must have canClaimSyncedWithoutRuntime=true', () => {
    const synced = getSurfacesByStatus('ACTIVE_SYNCED');
    for (const s of synced) {
      expect(s.canClaimSyncedWithoutRuntime).toBe(true);
    }
  });

  it('SIMULATED_UI surfaces must have canClaimSyncedWithoutRuntime=true', () => {
    const simulated = getSurfacesByTruthClass('SIMULATED_UI');
    for (const s of simulated) {
      expect(s.canClaimSyncedWithoutRuntime).toBe(true);
    }
  });

  it('at least 2 SIMULATED_UI surfaces exist', () => {
    const simulated = getSimulatedSurfaces();
    expect(simulated.length).toBeGreaterThanOrEqual(2);
  });

  it('no surface has truthClass=LIVE_TAURI but status=DISPLAY_ONLY', () => {
    const contradictions = UI_SURFACE_REGISTRY.filter(
      s => s.truthClass === 'LIVE_TAURI' && s.status === 'DISPLAY_ONLY'
    );
    expect(contradictions.map(s => s.route)).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSOR FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

describe('Accessor functions', () => {
  it('getSurface returns correct surface by route', () => {
    const titane = getSurface('/titane');
    expect(titane).not.toBeNull();
    expect(titane?.route).toBe('/titane');
  });

  it('getSurface returns undefined for unknown route', () => {
    expect(getSurface('/nonexistent-route-xyz')).toBeUndefined();
  });

  it('getSurfacesByStatus returns correct subset', () => {
    const partial = getSurfacesByStatus('ACTIVE_PARTIAL');
    expect(partial.length).toBeGreaterThan(0);
    expect(partial.every(s => s.status === 'ACTIVE_PARTIAL')).toBe(true);
  });

  it('getSurfacesByTruthClass returns correct subset', () => {
    const simulated = getSurfacesByTruthClass('SIMULATED_UI');
    expect(simulated.every(s => s.truthClass === 'SIMULATED_UI')).toBe(true);
  });

  it('getSimulatedSurfaces matches getSurfacesByTruthClass SIMULATED_UI', () => {
    const a = getSimulatedSurfaces()
      .map(s => s.route)
      .sort();
    const b = getSurfacesByTruthClass('SIMULATED_UI')
      .map(s => s.route)
      .sort();
    expect(a).toEqual(b);
  });

  it('getCanonicalRoutes returns all canonical routes', () => {
    const canonicals = getCanonicalRoutes();
    expect(canonicals.length).toBe(UI_SURFACE_REGISTRY.length);
    expect(canonicals).toContain('/titane');
    expect(canonicals).toContain('/orchestration-intelligence');
    expect(canonicals).toContain('/quantum-center');
  });

  it('getAliasRoutes returns all alias from-paths', () => {
    const aliases = getAliasRoutes();
    expect(Array.isArray(aliases)).toBe(true);
    expect(aliases.length).toBeGreaterThan(0);
    // /chat should be an alias
    expect(aliases).toContain('/chat');
  });

  it('getRegistryStats returns coherent counts', () => {
    const stats = getRegistryStats();
    expect(stats.canonical).toBe(UI_SURFACE_REGISTRY.length);
    expect(stats.aliases).toBe(UI_ALIAS_REGISTRY.length);
    expect(stats.simulated).toBeGreaterThanOrEqual(2);
    expect(stats.byStatus).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SPECIFIC KNOWN SURFACES
// ─────────────────────────────────────────────────────────────────────────────

describe('Known surface facts', () => {
  it('/orchestration-intelligence is SIMULATED_UI', () => {
    const s = getSurface('/orchestration-intelligence');
    expect(s?.truthClass).toBe('SIMULATED_UI');
  });

  it('/quantum-center is SIMULATED_UI', () => {
    const s = getSurface('/quantum-center');
    expect(s?.truthClass).toBe('SIMULATED_UI');
  });

  it('/performance is DISPLAY_ONLY', () => {
    const s = getSurface('/performance');
    expect(s?.status).toBe('DISPLAY_ONLY');
  });

  it('/titane is the main dashboard surface', () => {
    const s = getSurface('/titane');
    expect(s?.rootTestId).toBe('page-titane');
    expect(s?.navOwner).toBe('titane');
  });

  it('/cloud has LIVE_TAURI truth class', () => {
    const s = getSurface('/cloud');
    expect(s?.truthClass).toBe('LIVE_TAURI');
  });

  it('/memory has LIVE_TAURI_SERVICE_BRIDGE truth class', () => {
    const s = getSurface('/memory');
    expect(s?.truthClass).toBe('LIVE_TAURI_SERVICE_BRIDGE');
  });
});
