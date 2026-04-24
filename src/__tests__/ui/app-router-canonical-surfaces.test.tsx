import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { AppRouter } from '@/App';
import { publishActiveModuleContext } from '@/services/chat/moduleRouteContext';
import { canonicalRoutePages } from './uiPagesInventory.adapter';

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(async () => () => undefined),
}));

vi.mock('@/hooks/useWindowControls', () => ({
  useWindowControls: () => undefined,
}));

const RouteLocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="route-location-probe">{`${location.pathname}${location.search}`}</div>
  );
};

const primeChatStorage = () => {
  const conversationId = 'conv-app-router-proof';
  const now = Date.now();

  window.localStorage.setItem('titane_active_conversation_id', conversationId);
  window.localStorage.setItem(
    `titane_conversation_${conversationId}`,
    JSON.stringify({
      id: conversationId,
      title: 'AppRouter proof conversation',
      created_at: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
      messages: [
        {
          role: 'assistant',
          content: 'AppRouter proof ready',
          timestamp: now,
          metadata: { uiId: 'router-proof-seed-1' },
        },
      ],
    })
  );
  window.localStorage.setItem(
    'titane_chat_mode_default',
    JSON.stringify({
      mode: 'default',
      messages: [],
      compressed: [],
      lastCompacted: now,
    })
  );
};

const renderRoute = async (initialRoute: string) => {
  primeChatStorage();

  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppRouter />
      <RouteLocationProbe />
    </MemoryRouter>
  );

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const STABILIZATION_TIMEOUT_MS = 5000;
const SVG_TRANSFORM_STUB = {
  baseVal: {
    consolidate: () => ({
      matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    }),
  },
};

describe('AppRouter canonical active surfaces', () => {
  beforeEach(() => {
    vi.stubGlobal('__APP_VERSION__', 'test');
    window.localStorage.clear();
    if (typeof SVGElement !== 'undefined') {
      Object.defineProperty(SVGElement.prototype, 'transform', {
        configurable: true,
        value: SVG_TRANSFORM_STUB,
      });
    }
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it.each([
    ['/titane', 'page-titane', 'titane_core'],
    ['/experience', 'page-experience', 'experience_page'],
    ['/time', 'page-time', 'time_center'],
    ['/admin?tab=config', 'page-admin', 'admin_center'],
    ['/dev?tab=diagnostics', 'page-dev', 'dev_center'],
    ['/fusion', 'page-fusion', 'fusion_center'],
    ['/optimization', 'page-optimization', 'optimization_center'],
    [
      '/orchestration-intelligence',
      'page-orchestration-intelligence',
      'orchestration_intelligence',
    ],
    ['/orchestration-center', 'page-orchestration-meta-center', 'orchestration_meta'],
    ['/total-dev', 'page-total-dev', 'total_dev_center'],
    ['/reality-center', 'page-reality-center', 'reality_center'],
    ['/hyper-center', 'page-hyper-center', 'hyper_center'],
    ['/quantum-center', 'page-quantum-center', 'quantum_center'],
    ['/twins', 'page-twins', 'twins_page'],
    ['/cloud', 'page-cloud-center', 'cloud_center'],
    ['/knowledge', 'page-knowledge', 'knowledge_page'],
    ['/creation', 'page-creation-studio', 'creation_studio'],
    ['/evolution', 'page-evolution-monitor', 'evolution_monitor'],
    ['/singularity', 'page-singularity-monitor', 'singularity_monitor'],
    ['/sentinel', 'page-sentinel', 'sentinel_guard'],
    ['/watchdog', 'page-watchdog', 'watchdog_monitor'],
    ['/selfheal', 'page-selfheal', 'selfheal_engine'],
    ['/adaptive', 'page-adaptive-engine', 'adaptive_engine'],
    ['/memory', 'page-memory', 'memory_page'],
    ['/performance', 'page-performance-test', 'performance_test'],
    ['/research', 'research-page', 'research_page'],
    ['/skills', 'page-skills', 'skill_os'],
    ['/doc-center', 'doc-center-page', 'doc_center'],
  ])(
    'mounts %s on its canonical UI surface and keeps the canonical route truth',
    async (route, pageTestId, moduleId) => {
      await renderRoute(route);

      expect(
        await screen.findByTestId(pageTestId, undefined, {
          timeout: STABILIZATION_TIMEOUT_MS,
        })
      ).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.getByTestId('route-location-probe')).toHaveTextContent(route);
        },
        { timeout: STABILIZATION_TIMEOUT_MS }
      );

      const activeContext = publishActiveModuleContext(route);
      expect(activeContext.moduleId).toBe(moduleId);
      expect(activeContext.route).toBe(route.split('?')[0]);
      expect(activeContext.fullRoute).toBe(route);
    }
  );

  it('keeps every canonical route inventory entry connected to a known module context', () => {
    for (const page of canonicalRoutePages) {
      const activeContext = publishActiveModuleContext(page.route);

      expect(activeContext.moduleId).not.toBe('unknown_module');
      expect(activeContext.route).toBe(page.route);
      expect(activeContext.fullRoute).toBe(page.route);
    }
  });

  it.each([
    ['/titane', 'nav-titane'],
    ['/experience', 'nav-titane'],
    ['/time', 'nav-time'],
    ['/admin?tab=config', 'nav-admin'],
    ['/dev?tab=diagnostics', 'nav-dev'],
    ['/fusion', 'nav-fusion'],
    ['/orchestration-intelligence', 'nav-dev'],
    ['/orchestration-center', 'nav-dev'],
    ['/reality-center', 'nav-fusion'],
    ['/hyper-center', 'nav-fusion'],
    ['/quantum-center', 'nav-fusion'],
    ['/cloud', 'nav-fusion'],
    ['/knowledge', 'nav-titane'],
    ['/creation', 'nav-titane'],
    ['/evolution', 'nav-titane'],
    ['/singularity', 'nav-dev'],
    ['/sentinel', 'nav-dev'],
    ['/watchdog', 'nav-dev'],
    ['/selfheal', 'nav-dev'],
    ['/adaptive', 'nav-dev'],
    ['/optimization', 'btn-nav-more'],
    ['/twins', 'btn-nav-more'],
  ])(
    'keeps %s aligned with the owning TopNav entry %s in the real AppRouter shell',
    async (route, navTestId) => {
      await renderRoute(route);

      await waitFor(
        () => {
          expect(screen.getByTestId(navTestId)).toHaveAttribute('aria-current', 'page');
        },
        { timeout: STABILIZATION_TIMEOUT_MS }
      );
    }
  );

  it.each([
    [
      '/chat',
      '/titane?tab=conversation',
      'page-titane',
      'titane_core',
      'tab=conversation',
    ],
    ['/settings', '/admin?tab=config', 'page-admin', 'admin_center', 'tab=config'],
    ['/voice', '/admin?tab=audio', 'page-admin', 'admin_center', 'tab=audio'],
    ['/doc', '/doc-center', 'doc-center-page', 'doc_center', undefined],
    ['/titane.sh/deep-link', '/titane', 'page-titane', 'titane_core', undefined],
  ])(
    'normalizes %s to %s and keeps route/page truth aligned with canonical context mapping',
    async (legacyRoute, canonicalRoute, pageTestId, moduleId, pageState) => {
      await renderRoute(legacyRoute);

      expect(
        await screen.findByTestId(pageTestId, undefined, {
          timeout: STABILIZATION_TIMEOUT_MS,
        })
      ).toBeInTheDocument();
      await waitFor(
        () => {
          expect(screen.getByTestId('route-location-probe')).toHaveTextContent(
            canonicalRoute
          );
        },
        { timeout: STABILIZATION_TIMEOUT_MS }
      );

      const activeContext = publishActiveModuleContext(canonicalRoute);
      expect(activeContext.moduleId).toBe(moduleId);
      expect(activeContext.fullRoute).toBe(canonicalRoute);
      expect(activeContext.pageState).toBe(pageState);
    }
  );
});
