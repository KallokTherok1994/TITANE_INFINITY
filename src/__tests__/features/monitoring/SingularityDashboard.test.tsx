/**
 * Tests pour SingularityDashboard Component
 * Coverage: Dashboard principal, Metrics, Core health, États système
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SingularityDashboard } from '@/features/monitoring/SingularityDashboard';

describe('SingularityDashboard Component', () => {
  const mockMetrics = {
    cpu: 45,
    memory: 60,
    fps: 60,
    uptime: 3600000,
  };

  describe('Rendering', () => {
    it('should render dashboard', () => {
      render(<SingularityDashboard metrics={mockMetrics} />);
      expect(screen.getByText(/dashboard|singularity/i)).toBeInTheDocument();
    });

    it('should display core metrics', () => {
      render(<SingularityDashboard metrics={mockMetrics} />);
      expect(screen.getByText(/cpu|memory|fps/i)).toBeTruthy();
    });

    it('should show system health status', () => {
      render(<SingularityDashboard metrics={mockMetrics} health="optimal" />);
      expect(screen.getByText(/optimal|healthy|good/i)).toBeTruthy();
    });
  });

  describe('Metrics Display', () => {
    it('should render CPU metric', () => {
      render(<SingularityDashboard metrics={mockMetrics} />);
      expect(screen.getByText(/45%|45|cpu/i)).toBeTruthy();
    });

    it('should render Memory metric', () => {
      render(<SingularityDashboard metrics={mockMetrics} />);
      expect(screen.getByText(/60%|60|memory/i)).toBeTruthy();
    });

    it('should render FPS metric', () => {
      render(<SingularityDashboard metrics={mockMetrics} />);
      expect(screen.getByText(/60|fps/i)).toBeTruthy();
    });
  });

  describe('Health States', () => {
    it('should show optimal state', () => {
      render(<SingularityDashboard metrics={mockMetrics} health="optimal" />);
      expect(screen.getByText(/optimal/i)).toBeInTheDocument();
    });

    it('should show warning state', () => {
      render(<SingularityDashboard metrics={{ ...mockMetrics, cpu: 85 }} health="warning" />);
      expect(screen.getByText(/warning|caution/i)).toBeTruthy();
    });

    it('should show critical state', () => {
      render(<SingularityDashboard metrics={{ ...mockMetrics, cpu: 95 }} health="critical" />);
      expect(screen.getByText(/critical|danger/i)).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<SingularityDashboard metrics={mockMetrics} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
