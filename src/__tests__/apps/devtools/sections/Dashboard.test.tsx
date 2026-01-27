/**
 * Tests pour DevTools Dashboard Section
 * Coverage: Rendu, Métriques système, Status cards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '@/apps/devtools/sections/Dashboard';

// Mock des composants Dashboard
vi.mock('@/apps/devtools/components/CoreHealthMonitor', () => ({
  CoreHealthMonitor: () => <div data-testid="core-health">Core Health Monitor</div>,
}));

vi.mock('@/apps/devtools/components/MetricsDisplay', () => ({
  MetricsDisplay: ({ metrics }: any) => (
    <div data-testid="metrics-display">
      Metrics Display: {metrics ? 'loaded' : 'empty'}
    </div>
  ),
}));

describe('DevTools Dashboard Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard section', () => {
      render(<Dashboard />);
      
      expect(screen.getByTestId('core-health')).toBeInTheDocument();
    });

    it('should display metrics when available', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        const metricsDisplay = screen.getByTestId('metrics-display');
        expect(metricsDisplay).toBeInTheDocument();
      });
    });
  });

  describe('Core Health', () => {
    it('should render CoreHealthMonitor component', () => {
      render(<Dashboard />);
      
      const healthMonitor = screen.getByTestId('core-health');
      expect(healthMonitor).toBeInTheDocument();
      expect(healthMonitor).toHaveTextContent('Core Health Monitor');
    });
  });

  describe('Metrics Display', () => {
    it('should render metrics display section', () => {
      render(<Dashboard />);
      
      const metrics = screen.getByTestId('metrics-display');
      expect(metrics).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Dashboard />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
