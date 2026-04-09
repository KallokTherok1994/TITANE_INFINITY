// @ts-nocheck
/**
 * Tests pour CoreHealthMonitor Component
 * Coverage: Health display, Thresholds, Alerts, History
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { CoreHealthMonitor } from '@/components/devtools/CoreHealthMonitor';
import { secureInvoke } from '@/lib/security';

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

describe('CoreHealthMonitor Component', () => {
  const mockSecureInvoke = secureInvoke as unknown as ReturnType<typeof vi.fn>;

  const buildMetrics = (cpu: number, memory: number, operations = 123) => [
    { name: 'cpu_percent', value: cpu, unit: '%' },
    { name: 'memory_mb', value: memory, unit: 'MB' },
    { name: 'operations_total', value: operations, unit: 'ops' },
  ];

  beforeEach(() => {
    mockSecureInvoke.mockReset();
    mockSecureInvoke.mockImplementation(async (_command: string, payload: any) => {
      const core = payload?.core_name ?? 'unknown';
      if (core === 'emotionengine') {
        return {
          name: core,
          version: '1.0.0',
          status: 'degraded',
          dependencies: [],
          metrics: buildMetrics(82, 78),
        };
      }

      if (core === 'systemhealth') {
        return {
          name: core,
          version: '1.0.0',
          status: 'failing',
          dependencies: [],
          metrics: buildMetrics(95, 92),
        };
      }

      return {
        name: core,
        version: '1.0.0',
        status: 'healthy',
        dependencies: [],
        metrics: buildMetrics(45, 65),
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render health monitor', async () => {
      render(<CoreHealthMonitor />);

      await waitFor(() => {
        expect(screen.getByText(/core engine health/i)).toBeInTheDocument();
      });
    });

    it('should show all cores', async () => {
      render(<CoreHealthMonitor />);

      await waitFor(() => {
        expect(screen.getByText(/orchestrator/i)).toBeInTheDocument();
        expect(screen.getByText(/systemhealth/i)).toBeInTheDocument();
      });
    });
  });

  describe('Health Status', () => {
    it('should show healthy status', async () => {
      render(<CoreHealthMonitor />);

      await waitFor(() => {
        const status = screen.getAllByText('HEALTHY')[0];
        expect(status.className).toMatch(/text-green-400/i);
      });
    });

    it('should show degraded status', async () => {
      render(<CoreHealthMonitor />);

      await waitFor(() => {
        const status = screen.getByText(/degraded/i);
        expect(status.className).toMatch(/text-yellow-400/i);
      });
    });

    it('should show failing status', async () => {
      render(<CoreHealthMonitor />);

      await waitFor(() => {
        const status = screen.getByText('FAILING');
        expect(status.className).toMatch(/text-red-400/i);
      });
    });
  });

  describe('Metrics Display', () => {
    it('should show CPU and memory values', async () => {
      render(<CoreHealthMonitor />);

      await waitFor(() => {
        expect(screen.getAllByText(/cpu:/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/memory:/i).length).toBeGreaterThan(0);
      });
    });

    it('should avoid overlapping auto-refresh cycles while a previous health batch is still pending', async () => {
      vi.useFakeTimers();

      let releaseBatch: (() => void) | null = null;
      const pendingBatch = new Promise<void>(resolve => {
        releaseBatch = resolve;
      });

      mockSecureInvoke.mockImplementation(async (_command: string, payload: any) => {
        const core = payload?.core_name ?? 'unknown';
        await pendingBatch;
        return {
          name: core,
          version: '1.0.0',
          status: 'healthy',
          dependencies: [],
          metrics: buildMetrics(45, 65),
        };
      });

      render(<CoreHealthMonitor refreshInterval={10} />);

      await act(async () => {
        await Promise.resolve();
      });

      const initialCallCount = mockSecureInvoke.mock.calls.length;
      expect(initialCallCount).toBeGreaterThan(0);

      await act(async () => {
        vi.advanceTimersByTime(50);
        await Promise.resolve();
      });

      expect(mockSecureInvoke).toHaveBeenCalledTimes(initialCallCount);

      await act(async () => {
        releaseBatch?.();
        await Promise.resolve();
      });
    });
  });
});
