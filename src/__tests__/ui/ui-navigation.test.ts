/**
 * TITANE∞ vΩ.3 — UI Navigation Anti-Regression Tests
 * Tests enforcing UI_NAVIGATION_CONSTITUTION.md
 * © 2026 TITANE Team. All rights reserved.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, useLocation } from 'react-router-dom';
import { AppRouter } from '../../App';
import { ChatPage } from '../../pages/ChatPage';
import { TitanePage } from '../../pages/TitanePage';
import { AppShell } from '../../components/layout/AppShell';
import { TopNav, type TopNavItem } from '../../components/layout/TopNav';
import {
  countTopNavInstances,
  validateLocalTabsStyles,
  checkLayoutCompliance,
  navigationRegistry,
} from '../../types/ui-layout-contract';

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(async () => () => undefined),
}));

vi.mock('../../hooks/useWindowControls', () => ({
  useWindowControls: () => undefined,
}));

const primeChatStorage = () => {
  const conversationId = 'conv-ui-nav-test';
  const now = Date.now();

  window.localStorage.setItem('titane_active_conversation_id', conversationId);
  window.localStorage.setItem(
    `titane_conversation_${conversationId}`,
    JSON.stringify({
      id: conversationId,
      title: 'UI navigation test conversation',
      created_at: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
      messages: [
        {
          role: 'assistant',
          content: 'Navigation test ready',
          timestamp: now,
          metadata: { uiId: 'ui-nav-seed-1' },
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

const renderWithRouter = async (ui: React.ReactElement) => {
  primeChatStorage();
  render(React.createElement(BrowserRouter, null, ui));

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const RouteLocationProbe = () => {
  const location = useLocation();
  return React.createElement(
    'div',
    { 'data-testid': 'route-location-probe' },
    `${location.pathname}${location.search}`
  );
};

// ═══════════════════════════════════════════════════════════════
// TEST 1: SINGLE TOPNAV (CONSTITUTION ARTICLE 1)
// ═══════════════════════════════════════════════════════════════

describe('UI Navigation — Single TopNav (Article 1)', () => {
  beforeEach(() => {
    vi.stubGlobal('__APP_VERSION__', 'test');
    navigationRegistry.reset();
  });

  const renderTopNavShell = async () => {
    const items: TopNavItem[] = [
      { id: 'titane', label: 'TITANE', icon: '⚡', route: '/titane' },
      { id: 'time', label: 'TIME', icon: '🕐', route: '/time' },
    ];

    await renderWithRouter(
      React.createElement(
        AppShell,
        {
          topNav: React.createElement(TopNav, {
            items,
            currentRoute: '/titane',
            onNavigate: () => undefined,
            maxVisibleItems: 5,
          }),
        },
        React.createElement('div', null)
      )
    );
  };

  it('renders exactly one TopNav component globally', async () => {
    await renderTopNavShell();

    // Chercher toutes les navigations globales
    const navElements = screen.queryAllByRole('navigation', {
      name: /principale|navigation principale/i,
    });

    expect(navElements).toHaveLength(1);
  });

  it('keeps the AppShell main column height-locked for fullscreen chat surfaces', async () => {
    await renderTopNavShell();

    const main = screen.getByRole('main');
    const scrollHost = main.firstElementChild;

    expect(main.className).toContain('min-h-0');
    expect(main.className).toContain('overflow-hidden');
    expect(scrollHost).not.toBeNull();
    expect(scrollHost?.className).toContain('min-h-0');
    expect(scrollHost?.className).toContain('flex-col');
  });

  it('marks the More menu active when the current route belongs to an overflow item', async () => {
    const items: TopNavItem[] = [
      { id: 'titane', label: 'TITANE', icon: '⚡', route: '/titane' },
      { id: 'time', label: 'TIME', icon: '🕐', route: '/time' },
      { id: 'admin', label: 'ADMIN', icon: '⚙️', route: '/admin' },
      { id: 'dev', label: 'DEV', icon: '🛠️', route: '/dev' },
      { id: 'fusion', label: 'FUSION', icon: '✨', route: '/fusion' },
      { id: 'optimization', label: 'OPTIMIZE', icon: '⚡', route: '/optimization' },
    ];

    await renderWithRouter(
      React.createElement(TopNav, {
        items,
        currentRoute: '/optimization',
        onNavigate: () => undefined,
        maxVisibleItems: 5,
      })
    );

    const moreButton = screen.getByTestId('btn-nav-more');
    expect(moreButton).toHaveAttribute('aria-current', 'page');

    fireEvent.click(moreButton);
    expect(screen.getByTestId('nav-optimization')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('programmatic check: countTopNavInstances === 1', () => {
    navigationRegistry.register({
      id: 'topnav-global',
      region: 'topnav',
      componentName: 'TopNav',
      scope: 'global',
      isSticky: true,
      zIndex: 1000,
    });

    const count = countTopNavInstances();
    expect(count).toBe(1);
  });

  it('throws error when attempting to register second TopNav', () => {
    // Simulate TopNav registration
    navigationRegistry.register({
      id: 'topnav-1',
      region: 'topnav',
      componentName: 'TopNav',
      scope: 'global',
      isSticky: true,
      zIndex: 1000,
    });

    // Attempting to register second TopNav should throw
    expect(() => {
      navigationRegistry.register({
        id: 'topnav-2',
        region: 'topnav',
        componentName: 'DuplicateTopNav',
        scope: 'global',
      });
    }).toThrow(/Tentative d'ajouter une 2e TopNav/);
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST 2: LOCAL TABS NOT NAVBAR-LIKE (CONSTITUTION ARTICLE 2)
// ═══════════════════════════════════════════════════════════════

describe('UI Navigation — Tabs Not Navbar-Like (Article 2)', () => {
  beforeEach(() => {
    vi.stubGlobal('__APP_VERSION__', 'test');
    navigationRegistry.reset();
  });

  it('TitanePage conversation opens in fullscreen chat layout', async () => {
    await renderWithRouter(React.createElement(TitanePage, null));

    expect(screen.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
    expect(screen.getByTestId('page-conversation')).toHaveAttribute(
      'data-layout',
      'fullscreen'
    );
  });

  it('legacy ChatPage delegates to the canonical Titane conversation surface', async () => {
    await renderWithRouter(React.createElement(ChatPage, null));

    expect(screen.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
    expect(screen.getByTestId('page-conversation')).toHaveAttribute(
      'data-layout',
      'fullscreen'
    );
  });

  it('legacy /chat route redirects to the canonical Titane conversation tab', async () => {
    primeChatStorage();

    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/chat'] },
        React.createElement(React.Fragment, null,
          React.createElement(AppRouter, null),
          React.createElement(RouteLocationProbe, null)
        )
      )
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
    expect(screen.getByTestId('page-conversation')).toHaveAttribute(
      'data-layout',
      'fullscreen'
    );
    expect(screen.getByTestId('route-location-probe')).toHaveTextContent(
      '/titane?tab=conversation'
    );
  });

  it('TitanePage tabs do not have TopNav-like backdrop-filter', async () => {
    await renderWithRouter(React.createElement(TitanePage, null));

    const tablist = screen.getByRole('tablist', {
      name: /sections principales titane/i,
    });

    const styles = window.getComputedStyle(tablist);

    // backdrop-filter should be 'none' or empty
    expect(styles.backdropFilter).toMatch(/^(none|)$/);
  });

  it('TitanePage tabs do not have excessive box-shadow', async () => {
    await renderWithRouter(React.createElement(TitanePage, null));

    const tablist = screen.getByRole('tablist');
    const styles = window.getComputedStyle(tablist);

    // Extract first shadow offset (rough check)
    const shadowMatch = styles.boxShadow.match(/(\d+)px/);
    if (shadowMatch) {
      const shadowSize = parseInt(shadowMatch[1]);
      expect(shadowSize).toBeLessThanOrEqual(4);
    }
  });

  it('TitanePage tabs are not sticky by default', async () => {
    await renderWithRouter(React.createElement(TitanePage, null));

    const tablist = screen.getByRole('tablist');
    const styles = window.getComputedStyle(tablist);

    expect(styles.position).not.toBe('sticky');
    expect(styles.position).not.toBe('fixed');
  });

  it('validateLocalTabsStyles utility detects violations', () => {
    // Create mock styles object
    const validStyles = {
      backdropFilter: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      height: '48px',
      position: 'relative',
    } as CSSStyleDeclaration;

    const result = validateLocalTabsStyles(validStyles);
    expect(result.isValid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('validateLocalTabsStyles detects invalid backdrop-filter', () => {
    const invalidStyles = {
      backdropFilter: 'blur(10px)',
      boxShadow: 'none',
      height: '48px',
      position: 'relative',
    } as CSSStyleDeclaration;

    const result = validateLocalTabsStyles(invalidStyles);
    expect(result.isValid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST 3: SCROLL NO DOUBLE STICKY HEADERS (CONSTITUTION ARTICLE 3)
// ═══════════════════════════════════════════════════════════════

describe('UI Navigation — Scroll Behavior (Article 3)', () => {
  beforeEach(() => {
    navigationRegistry.reset();
  });

  it('scrolling does not reveal double sticky headers', async () => {
    await renderWithRouter(React.createElement(TitanePage, null));

    // Simulate scroll
    window.scrollTo(0, 500);

    // Wait for any potential sticky effects
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Count sticky elements
    const stickyElements = document.querySelectorAll(
      '[style*="position: sticky"], [style*="position: fixed"]'
    );

    // Should have max 1 sticky (the TopNav)
    expect(stickyElements.length).toBeLessThanOrEqual(1);
  });

  it('checkLayoutCompliance reports no critical violations', () => {
    // Register valid TopNav
    navigationRegistry.register({
      id: 'topnav-global',
      region: 'topnav',
      componentName: 'TopNav',
      scope: 'global',
      isSticky: true,
      zIndex: 1000,
    });

    // Register valid local tabs
    navigationRegistry.register({
      id: 'titane-tabs',
      region: 'local-tabs',
      componentName: 'TitaneTabs',
      scope: 'local',
      isSticky: false,
    });

    const report = checkLayoutCompliance();

    expect(report.compliant).toBe(true);
    expect(report.criticalViolations).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST 4: LAYOUT COMPLIANCE REPORTING
// ═══════════════════════════════════════════════════════════════

describe('UI Navigation — Layout Compliance', () => {
  beforeEach(() => {
    navigationRegistry.reset();
  });

  it('detects and reports compliance status', () => {
    // Valid setup
    navigationRegistry.register({
      id: 'topnav',
      region: 'topnav',
      componentName: 'TopNav',
      scope: 'global',
      isSticky: true,
      zIndex: 1000,
    });

    const report = checkLayoutCompliance();

    expect(report).toHaveProperty('compliant');
    expect(report).toHaveProperty('criticalViolations');
    expect(report).toHaveProperty('warnings');
    expect(report).toHaveProperty('details');
  });

  it('warns when local-tabs are sticky', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      navigationRegistry.register({
        id: 'tabs-sticky',
        region: 'local-tabs',
        componentName: 'StickyTabs',
        scope: 'local',
        isSticky: true, // Violation
      });

      const report = checkLayoutCompliance();

      // Should have warnings (not critical)
      expect(report.warnings).toBeGreaterThan(0);
    } finally {
      warnSpy.mockRestore();
    }
  });
});
