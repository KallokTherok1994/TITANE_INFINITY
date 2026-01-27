/**
 * Tests pour SystemHealthMonitor Component
 * Coverage: Monitoring santé, Alertes, Métriques temps-réel
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemHealthMonitor } from '@/features/monitoring/SystemHealthMonitor';

describe('SystemHealthMonitor Component', () => {
  const mockHealth = {
    status: 'optimal',
    cpu: 40,
    memory: 55,
    disk: 70,
    network: 'connected',
  };

  describe('Rendering', () => {
    it('should render health monitor', () => {
      render(<SystemHealthMonitor health={mockHealth} />);
      expect(screen.getByText(/health|monitor|system/i)).toBeTruthy();
    });

    it('should display health status', () => {
      render(<SystemHealthMonitor health={mockHealth} />);
      expect(screen.getByText(/optimal/i)).toBeInTheDocument();
    });

    it('should show all metrics', () => {
      render(<SystemHealthMonitor health={mockHealth} />);
      expect(screen.getByText(/cpu|memory|disk|network/i)).toBeTruthy();
    });
  });

  describe('Alerts', () => {
    it('should show warning when thresholds exceeded', () => {
      const warningHealth = { ...mockHealth, cpu: 85, status: 'warning' };
      render(<SystemHealthMonitor health={warningHealth} />);
      expect(screen.getByText(/warning|alert|high/i)).toBeTruthy();
    });

    it('should show critical alert', () => {
      const criticalHealth = { ...mockHealth, memory: 95, status: 'critical' };
      render(<SystemHealthMonitor health={criticalHealth} />);
      expect(screen.getByText(/critical|danger/i)).toBeTruthy();
    });
  });

  describe('Network Status', () => {
    it('should show connected status', () => {
      render(<SystemHealthMonitor health={mockHealth} />);
      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });

    it('should show disconnected status', () => {
      render(<SystemHealthMonitor health={{ ...mockHealth, network: 'disconnected' }} />);
      expect(screen.getByText(/disconnected|offline/i)).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<SystemHealthMonitor health={mockHealth} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
