import { describe, expect, it } from 'vitest';
import {
  canonicalRoutePages,
  devOwnedRoutePages,
  uiPages,
  topLevelPageOrder,
  devEngineRoutePages,
  fusionOwnedRoutePages,
  moreMenuRoutePages,
  titaneOwnedRoutePages,
} from '../../../e2e/desktop/page-objects/uiPages.po.js';

describe('WDIO UI page inventory', () => {
  it('keeps engine route pages explicitly inventoried under the DEV navigation owner', () => {
    expect(devEngineRoutePages.map(page => page.id)).toEqual([
      'singularity',
      'sentinel',
      'watchdog',
      'selfheal',
      'adaptive',
    ]);

    for (const page of devEngineRoutePages) {
      expect(page.navTestId).toBe('nav-dev');
      expect(page.route.startsWith('/')).toBe(true);
      expect(page.root).toContain('[data-testid=');
    }
  });

  it('keeps engine route pages outside the top-level page order because they reuse the DEV top-level entry', () => {
    const topLevelIds = topLevelPageOrder.map(page => page.id);

    expect(topLevelIds).toEqual([
      'titane',
      'time',
      'admin',
      'dev',
      'fusion',
      'optimization',
    ]);

    expect(topLevelIds).not.toContain(uiPages.singularity.id);
    expect(topLevelIds).not.toContain(uiPages.sentinel.id);
    expect(topLevelIds).not.toContain(uiPages.watchdog.id);
    expect(topLevelIds).not.toContain(uiPages.selfheal.id);
    expect(topLevelIds).not.toContain(uiPages.adaptive.id);
  });

  it('keeps every canonical route page uniquely inventoried with a stable selector and owning nav entry', () => {
    const ids = canonicalRoutePages.map(page => page.id);
    const routes = canonicalRoutePages.map(page => page.route);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);

    for (const page of canonicalRoutePages) {
      expect(page.route.startsWith('/')).toBe(true);
      expect(page.root).toContain('[data-testid=');
      expect(page.navTestId).toMatch(/^nav-/);
    }
  });

  it('keeps secondary canonical route groups aligned to their owning top-level nav entries', () => {
    for (const page of titaneOwnedRoutePages) {
      expect(page.navTestId).toBe('nav-titane');
      expect(topLevelPageOrder.map(item => item.id)).not.toContain(page.id);
    }

    for (const page of devOwnedRoutePages) {
      expect(page.navTestId).toBe('nav-dev');
      expect(topLevelPageOrder.map(item => item.id)).not.toContain(page.id);
    }

    for (const page of fusionOwnedRoutePages) {
      expect(page.navTestId).toBe('nav-fusion');
      expect(topLevelPageOrder.map(item => item.id)).not.toContain(page.id);
    }

    for (const page of moreMenuRoutePages) {
      expect(['nav-twins', 'nav-optimization', 'nav-total-dev']).toContain(page.navTestId);
    }
  });
});
