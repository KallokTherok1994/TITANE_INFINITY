/**
 * TITANE∞ vΩ.3 — UI Navigation Anti-Regression Tests
 * Tests enforcing UI_NAVIGATION_CONSTITUTION.md
 * © 2026 TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TitanePage } from '@/pages/TitanePage';
import { App } from '@/App';
import {
  countTopNavInstances,
  validateLocalTabsStyles,
  checkLayoutCompliance,
  navigationRegistry,
} from '@/types/ui-layout-contract';

// ═══════════════════════════════════════════════════════════════
// TEST 1: SINGLE TOPNAV (CONSTITUTION ARTICLE 1)
// ═══════════════════════════════════════════════════════════════

describe('UI Navigation — Single TopNav (Article 1)', () => {
  beforeEach(() => {
    navigationRegistry.reset();
  });

  it('renders exactly one TopNav component globally', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Chercher toutes les navigations globales
    const navElements = screen.queryAllByRole('navigation', { 
      name: /principale|navigation principale/i,
    });
    
    expect(navElements).toHaveLength(1);
  });

  it('programmatic check: countTopNavInstances === 1', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

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
    }).toThrow(/SINGLE_TOPNAV_VIOLATED/);
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST 2: LOCAL TABS NOT NAVBAR-LIKE (CONSTITUTION ARTICLE 2)
// ═══════════════════════════════════════════════════════════════

describe('UI Navigation — Tabs Not Navbar-Like (Article 2)', () => {
  beforeEach(() => {
    navigationRegistry.reset();
  });

  it('TitanePage tabs do not have TopNav-like backdrop-filter', () => {
    render(
      <BrowserRouter>
        <TitanePage />
      </BrowserRouter>
    );

    const tablist = screen.getByRole('tablist', { 
      name: /sections principales titane/i 
    });
    
    const styles = window.getComputedStyle(tablist);
    
    // backdrop-filter should be 'none' or empty
    expect(styles.backdropFilter).toMatch(/^(none|)$/);
  });

  it('TitanePage tabs do not have excessive box-shadow', () => {
    render(
      <BrowserRouter>
        <TitanePage />
      </BrowserRouter>
    );

    const tablist = screen.getByRole('tablist');
    const styles = window.getComputedStyle(tablist);
    
    // Extract first shadow offset (rough check)
    const shadowMatch = styles.boxShadow.match(/(\d+)px/);
    if (shadowMatch) {
      const shadowSize = parseInt(shadowMatch[1]);
      expect(shadowSize).toBeLessThanOrEqual(4);
    }
  });

  it('TitanePage tabs are not sticky by default', () => {
    render(
      <BrowserRouter>
        <TitanePage />
      </BrowserRouter>
    );

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
    expect(result.violations).toContain(
      expect.stringMatching(/backdrop-filter/)
    );
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
    render(
      <BrowserRouter>
        <TitanePage />
      </BrowserRouter>
    );

    // Simulate scroll
    window.scrollTo(0, 500);

    // Wait for any potential sticky effects
    await new Promise(resolve => setTimeout(resolve, 100));

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
  });
});
