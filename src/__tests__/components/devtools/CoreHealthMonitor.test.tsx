/**
 * Tests pour CoreHealthMonitor Component
 * Coverage: Health display, Thresholds, Alerts, History
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoreHealthMonitor } from '@/components/devtools/CoreHealthMonitor';
import type { CoreHealth } from '@/types';

describe('CoreHealthMonitor Component', () => {
  const mockHealth: CoreHealth = {
    cpu: 45,
    memory: 65,
    fps: 60,
    network: 'connected',
    status: 'healthy',
    timestamp: Date.now()
  };

  describe('Rendering', () => {
    it('should render health monitor', () => {
      render(<CoreHealthMonitor health={mockHealth} />);
      expect(screen.getByText(/health/i)).toBeInTheDocument();
    });

    it('should show all metrics', () => {
      render(<CoreHealthMonitor health={mockHealth} />);
      expect(screen.getByText(/cpu/i)).toBeInTheDocument();
      expect(screen.getByText(/memory/i)).toBeInTheDocument();
      expect(screen.getByText(/fps/i)).toBeInTheDocument();
    });
  });

  describe('Health Status', () => {
    it('should show healthy status', () => {
      render(<CoreHealthMonitor health={mockHealth} />);
      const status = screen.getByText(/healthy/i);
      expect(status.className).toMatch(/success|green/i);
    });

    it('should show warning status', () => {
      const warningHealth = { ...mockHealth, status: 'warning', cpu: 85 };
      render(<CoreHealthMonitor health={warningHealth} />);
      const status = screen.getByText(/warning/i);
      expect(status.className).toMatch(/warning|yellow/i);
    });

    it('should show critical status', () => {
      const criticalHealth = { ...mockHealth, status: 'critical', cpu: 95 };
      render(<CoreHealthMonitor health={criticalHealth} />);
      const status = screen.getByText(/critical/i);
      expect(status.className).toMatch(/error|red|danger|critical/i);
    });
  });

  describe('Metric Thresholds', () => {
    it('should highlight high CPU', () => {
      const highCPU = { ...mockHealth, cpu: 90 };
      render(<CoreHealthMonitor health={highCPU} />);
      
      const cpuMetric = screen.getByText(/90%/);
      expect(cpuMetric.className).toMatch(/warning|danger|high/i);
    });

    it('should highlight high memory', () => {
      const highMemory = { ...mockHealth, memory: 95 };
      render(<CoreHealthMonitor health={highMemory} />);
      
      const memoryMetric = screen.getByText(/95%/);
      expect(memoryMetric.className).toMatch(/warning|danger|high/i);
    });

    it('should highlight low FPS', () => {
      const lowFPS = { ...mockHealth, fps: 20 };
      render(<CoreHealthMonitor health={lowFPS} />);
      
      const fpsMetric = screen.getByText(/20/);
      expect(fpsMetric.className).toMatch(/warning|danger|low/i);
    });
  });

  describe('Network Status', () => {
    it('should show connected status', () => {
      render(<CoreHealthMonitor health={mockHealth} />);
      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });

    it('should show disconnected status', () => {
      const disconnected = { ...mockHealth, network: 'disconnected' };
      render(<CoreHealthMonitor health={disconnected} />);
      const networkStatus = screen.getByText(/disconnected/i);
      expect(networkStatus.className).toMatch(/error|red/i);
    });
  });

  describe('Alerts', () => {
    it('should show CPU alert', () => {
      const highCPU = { ...mockHealth, cpu: 95, status: 'critical' };
      render(<CoreHealthMonitor health={highCPU} showAlerts />);
      expect(screen.getByText(/cpu.*high|critical/i)).toBeInTheDocument();
    });

    it('should show memory alert', () => {
      const highMemory = { ...mockHealth, memory: 92, status: 'warning' };
      render(<CoreHealthMonitor health={highMemory} showAlerts />);
      expect(screen.getByText(/memory.*high|warning/i)).toBeInTheDocument();
    });
  });

  describe('History Chart', () => {
    it('should render history chart', () => {
      const history = [
        { ...mockHealth, timestamp: Date.now() - 3000 },
        { ...mockHealth, timestamp: Date.now() - 2000 },
        { ...mockHealth, timestamp: Date.now() - 1000 },
      ];
      render(<CoreHealthMonitor health={mockHealth} history={history} showChart />);
      expect(screen.getByRole('img', { name: /chart|graph/i })).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<CoreHealthMonitor health={mockHealth} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
