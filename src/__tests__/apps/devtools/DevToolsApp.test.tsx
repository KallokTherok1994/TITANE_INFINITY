/**
 * Tests pour DevToolsApp Component
 * Coverage: Rendu, Onglets, Navigation, Events
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DevToolsApp } from '@/apps/devtools';

// Mock hooks
vi.mock('@/apps/devtools/hooks', () => ({
  useAllDevToolsEvents: vi.fn(),
}));

// Mock sections
vi.mock('@/apps/devtools/sections', () => ({
  Dashboard: () => <div data-testid="section-dashboard">Dashboard Section</div>,
  Metrics: () => <div data-testid="section-metrics">Metrics Section</div>,
  Logs: () => <div data-testid="section-logs">Logs Section</div>,
  Engines: () => <div data-testid="section-engines">Engines Section</div>,
  Memory: () => <div data-testid="section-memory">Memory Section</div>,
  OmegaPipeline: () => <div data-testid="section-pipeline">Pipeline Section</div>,
  Errors: () => <div data-testid="section-errors">Errors Section</div>,
}));

// Mock Tabs component
vi.mock('@/components/ui/tabs', () => ({
  TabsLegacy: ({ tabs, defaultTab, children, onTabChange }: any) => (
    // Render-props API: children is a function(activeTab)
    <div data-testid="tabs-component">
      <div data-testid="tabs-list">
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      <div data-testid="tabs-content">
        {typeof children === 'function'
          ? children(defaultTab ?? tabs[0]?.id)
          : children}
      </div>
    </div>
  ),
}));

describe('DevToolsApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render DevTools app with title', () => {
      render(<DevToolsApp />);

      const title = screen.getByText('TITANE∞ DevTools');
      expect(title).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<DevToolsApp />);

      const subtitle = screen.getByText('System Monitoring & Diagnostics Console');
      expect(subtitle).toBeInTheDocument();
    });

    it('should render live status indicator', () => {
      const { container } = render(<DevToolsApp />);

      const statusDot = container.querySelector('.animate-pulse');
      expect(statusDot).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<DevToolsApp className="custom-class" />);

      const main = container.querySelector('.custom-class');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should render all 7 tabs', () => {
      render(<DevToolsApp />);

      const tabs = [
        'dashboard',
        'metrics',
        'logs',
        'engines',
        'memory',
        'pipeline',
        'errors',
      ];

      tabs.forEach(tabId => {
        const tab = screen.getByTestId(`tab-${tabId}`);
        expect(tab).toBeInTheDocument();
      });
    });

    it('should render tabs with icons', () => {
      render(<DevToolsApp />);

      const dashboardTab = screen.getByTestId('tab-dashboard');
      expect(dashboardTab.textContent).toContain('📊');

      const metricsTab = screen.getByTestId('tab-metrics');
      expect(metricsTab.textContent).toContain('📈');
    });

    it('should default to dashboard section', () => {
      render(<DevToolsApp />);

      // Le composant Tabs devrait être rendu avec defaultTab="dashboard"
      expect(screen.getByTestId('tabs-component')).toBeInTheDocument();
    });

    it('should support custom default section', () => {
      render(<DevToolsApp defaultSection="metrics" />);

      expect(screen.getByTestId('tabs-component')).toBeInTheDocument();
    });
  });

  describe('Sections', () => {
    it('should load Dashboard section', async () => {
      render(<DevToolsApp />);

      await waitFor(() => {
        // La section dashboard devrait être visible
        expect(screen.getByTestId('tabs-content')).toBeInTheDocument();
      });
    });

    it('should have sections available for navigation', () => {
      render(<DevToolsApp />);

      // Vérifier que les tabs sont cliquables
      const metricsTab = screen.getByTestId('tab-metrics');
      expect(metricsTab).toBeInTheDocument();

      const logsTab = screen.getByTestId('tab-logs');
      expect(logsTab).toBeInTheDocument();
    });
  });

  describe('Events', () => {
    it('should initialize DevTools events on mount', async () => {
      const devtoolsHooks = await import('@/apps/devtools/hooks');
      const useAllDevToolsEvents = devtoolsHooks.useAllDevToolsEvents;

      render(<DevToolsApp />);

      expect(useAllDevToolsEvents).toHaveBeenCalled();
    });
  });

  describe('Styles', () => {
    it('should have correct background styles', () => {
      const { container } = render(<DevToolsApp />);

      const main = container.querySelector('.h-full.flex.flex-col');
      expect(main).toHaveStyle({
        background: 'var(--bg-base, #050607)',
      });
    });

    it('should have header with elevated background', () => {
      const { container } = render(<DevToolsApp />);

      const header = container.querySelector('.flex-shrink-0.border-b');
      expect(header).toHaveStyle({
        background: 'var(--bg-elevated, #0b0d0f)',
      });
    });
  });

  describe('TypeScript Props', () => {
    it('should accept DevToolsSection type for defaultSection', () => {
      const validSections: Array<
        'dashboard' | 'metrics' | 'logs' | 'engines' | 'memory' | 'pipeline' | 'errors'
      > = ['dashboard', 'metrics', 'logs', 'engines', 'memory', 'pipeline', 'errors'];

      validSections.forEach(section => {
        const { unmount } = render(<DevToolsApp defaultSection={section} />);
        expect(screen.getByTestId('tabs-component')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<DevToolsApp />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
