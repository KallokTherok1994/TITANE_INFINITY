/**
 * Tests pour MetricsDisplay Component
 * Coverage: Real-time metrics, Charts, History
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsDisplay } from '@/components/devtools/MetricsDisplay';
import type { PerformanceMetrics } from '@/types';

describe('MetricsDisplay Component', () => {
  const mockMetrics: PerformanceMetrics = {
    cpu: 45.5,
    memory: 1024,
    fps: 60,
    timestamp: Date.now(),
  };

  describe('Rendering', () => {
    it('should render metrics display', () => {
      render(<MetricsDisplay metrics={mockMetrics} />);
      expect(screen.getByText(/cpu/i)).toBeInTheDocument();
      expect(screen.getByText(/memory/i)).toBeInTheDocument();
      expect(screen.getByText(/fps/i)).toBeInTheDocument();
    });

    it('should show CPU percentage', () => {
      render(<MetricsDisplay metrics={mockMetrics} />);
      expect(screen.getByText(/45\.5%/)).toBeInTheDocument();
    });

    it('should show memory in MB', () => {
      render(<MetricsDisplay metrics={mockMetrics} />);
      expect(screen.getByText(/1024.*mb/i)).toBeInTheDocument();
    });

    it('should show FPS value', () => {
      render(<MetricsDisplay metrics={mockMetrics} />);
      expect(screen.getByText(/60.*fps/i)).toBeInTheDocument();
    });
  });

  describe('Thresholds', () => {
    it('should highlight high CPU', () => {
      const highCPU = { ...mockMetrics, cpu: 90 };
      render(<MetricsDisplay metrics={highCPU} />);
      
      const cpuElement = screen.getByText(/90%/);
      expect(cpuElement.className).toMatch(/warning|danger|high/i);
    });

    it('should highlight low FPS', () => {
      const lowFPS = { ...mockMetrics, fps: 20 };
      render(<MetricsDisplay metrics={lowFPS} />);
      
      const fpsElement = screen.getByText(/20.*fps/i);
      expect(fpsElement.className).toMatch(/warning|danger|low/i);
    });
  });

  describe('History', () => {
    it('should show metric history', () => {
      const history = [
        { ...mockMetrics, timestamp: Date.now() - 3000 },
        { ...mockMetrics, timestamp: Date.now() - 2000 },
        { ...mockMetrics, timestamp: Date.now() - 1000 },
      ];

      render(<MetricsDisplay metrics={mockMetrics} history={history} />);
      expect(screen.getByRole('img', { name: /chart|graph/i })).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should render CPU chart', () => {
      render(<MetricsDisplay metrics={mockMetrics} showCharts />);
      expect(screen.getByText(/cpu.*chart/i)).toBeInTheDocument();
    });

    it('should render Memory chart', () => {
      render(<MetricsDisplay metrics={mockMetrics} showCharts />);
      expect(screen.getByText(/memory.*chart/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MetricsDisplay metrics={mockMetrics} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
