/**
 * Tests pour SystemHealthMonitor Component
 * Coverage: Monitoring santé, Alertes, Métriques temps-réel
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemHealthMonitor } from '@/components/monitoring/SystemHealthMonitor';
import { secureInvoke } from '@/lib/security';

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

const mockSecureInvoke = secureInvoke as ReturnType<typeof vi.fn>;

describe('SystemHealthMonitor Component', () => {
  const mockMetrics = {
    cpu_usage_percent: 42.5,
    memory_used_mb: 512,
    memory_total_mb: 1024,
    uptime_seconds: 3661,
  };

  const mockEngines = [
    { name: 'SingularityEngine', status: 'active', lastUpdate: 0 },
    { name: 'MemoryEngine', status: 'idle', lastUpdate: 0 },
  ];

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-02-06T19:00:00Z').getTime());
    mockSecureInvoke.mockImplementation((command: string) => {
      if (command === 'get_system_metrics') {
        return Promise.resolve(mockMetrics);
      }
      if (command === 'get_engines_status') {
        return Promise.resolve(mockEngines);
      }
      return Promise.reject(new Error('Unknown command'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render health monitor', () => {
      render(<SystemHealthMonitor />);
      expect(screen.getByText(/system health/i)).toBeInTheDocument();
    });

    it('should display health status', () => {
      render(<SystemHealthMonitor />);
      expect(screen.getByText(/last update/i)).toBeInTheDocument();
    });

    it('should show all metrics', async () => {
      render(<SystemHealthMonitor />);
      expect(await screen.findByText(/cpu usage/i)).toBeInTheDocument();
      expect(screen.getAllByText(/memory/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/uptime/i)).toBeInTheDocument();
      expect(screen.getByText(/active engines/i)).toBeInTheDocument();
    });
  });

  describe('Errors', () => {
    it('should show error banner when metrics fetch fails', async () => {
      mockSecureInvoke.mockImplementation((command: string) => {
        if (command === 'get_system_metrics') {
          return Promise.reject(new Error('Metrics unavailable'));
        }
        if (command === 'get_engines_status') {
          return Promise.resolve(mockEngines);
        }
        return Promise.reject(new Error('Unknown command'));
      });

      render(<SystemHealthMonitor />);
      expect(await screen.findByText(/unknown error/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<SystemHealthMonitor />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
