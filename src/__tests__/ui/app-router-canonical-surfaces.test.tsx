import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { AppRouter } from '@/App';
import { publishActiveModuleContext } from '@/services/chat/moduleRouteContext';

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

describe('AppRouter canonical active surfaces', () => {
  beforeEach(() => {
    vi.stubGlobal('__APP_VERSION__', 'test');
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it.each([
    ['/titane', 'page-titane', 'titane_core'],
    ['/time', 'page-time', 'time_center'],
    ['/admin?tab=config', 'page-admin', 'admin_center'],
    ['/dev?tab=diagnostics', 'page-dev', 'dev_center'],
    ['/cloud', 'page-cloud-center', 'cloud_center'],
    ['/singularity', 'page-singularity-monitor', 'singularity_monitor'],
    ['/performance', 'page-performance-test', 'performance_test'],
    ['/research', 'research-page', 'research_page'],
  ])(
    'mounts %s on its canonical UI surface and keeps the canonical route truth',
    async (route, pageTestId, moduleId) => {
      await renderRoute(route);

      expect(
        await screen.findByTestId(pageTestId, undefined, {
          timeout: STABILIZATION_TIMEOUT_MS,
        })
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('route-location-probe')).toHaveTextContent(route);
      }, { timeout: STABILIZATION_TIMEOUT_MS });

      const activeContext = publishActiveModuleContext(route);
      expect(activeContext.moduleId).toBe(moduleId);
      expect(activeContext.route).toBe(route.split('?')[0]);
      expect(activeContext.fullRoute).toBe(route);
    }
  );

  it.each([
    ['/chat', '/titane?tab=conversation', 'page-titane', 'titane_core', 'tab=conversation'],
    ['/settings', '/admin?tab=config', 'page-admin', 'admin_center', 'tab=config'],
    ['/voice', '/admin?tab=audio', 'page-admin', 'admin_center', 'tab=audio'],
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
      await waitFor(() => {
        expect(screen.getByTestId('route-location-probe')).toHaveTextContent(canonicalRoute);
      }, { timeout: STABILIZATION_TIMEOUT_MS });

      const activeContext = publishActiveModuleContext(canonicalRoute);
      expect(activeContext.moduleId).toBe(moduleId);
      expect(activeContext.fullRoute).toBe(canonicalRoute);
      expect(activeContext.pageState).toBe(pageState);
    }
  );
});
