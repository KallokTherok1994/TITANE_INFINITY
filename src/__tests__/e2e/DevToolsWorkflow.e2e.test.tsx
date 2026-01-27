/**
 * E2E Tests: DevTools Workflow
 * Coverage: DevTools → Monitoring → Alerts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '@/App';

describe('E2E: DevTools Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Metrics Monitoring', () => {
    it('should display real-time metrics', async () => {
      render(<App />);
      
      // Open DevTools
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      
      // Navigate to Metrics
      fireEvent.click(screen.getByText(/metrics/i));
      
      // Verify metrics displayed
      await waitFor(() => {
        expect(screen.getByText(/cpu/i)).toBeInTheDocument();
        expect(screen.getByText(/memory/i)).toBeInTheDocument();
        expect(screen.getByText(/fps/i)).toBeInTheDocument();
      });
      
      // Metrics should update
      await waitFor(() => {
        const cpuValue = screen.getByText(/\d+.*%/);
        expect(cpuValue).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show metric history', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/metrics/i));
      
      // Wait for history to accumulate
      await waitFor(() => {
        expect(screen.getByRole('img', { name: /chart|graph/i })).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Log Viewing', () => {
    it('should display system logs', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/logs/i));
      
      await waitFor(() => {
        expect(screen.getByText(/log|entry/i)).toBeInTheDocument();
      });
    });

    it('should filter logs by level', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/logs/i));
      
      // Select error level
      const errorFilter = screen.getByLabelText(/error/i);
      fireEvent.click(errorFilter);
      
      await waitFor(() => {
        const logs = screen.getAllByRole('listitem');
        logs.forEach(log => {
          expect(log.className).toMatch(/error/i);
        });
      });
    });

    it('should search logs', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/logs/i));
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        const results = screen.getAllByText(/test/i);
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Memory Inspection', () => {
    it('should visualize memory tree', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/memory/i));
      
      await waitFor(() => {
        expect(screen.getByText(/stm|mtm|ltm/i)).toBeInTheDocument();
      });
      
      // Expand tree node
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const children = screen.getAllByRole('treeitem');
        expect(children.length).toBeGreaterThan(1);
      });
    });

    it('should search memory entries', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/memory/i));
      
      const searchInput = screen.getByPlaceholderText(/search.*memory/i);
      fireEvent.change(searchInput, { target: { value: 'test entry' } });
      
      fireEvent.click(screen.getByRole('button', { name: /search/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/test entry/i)).toBeInTheDocument();
      });
    });
  });

  describe('Health Monitoring', () => {
    it('should show system health status', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/health/i));
      
      await waitFor(() => {
        expect(screen.getByText(/healthy|warning|critical/i)).toBeInTheDocument();
      });
    });

    it('should trigger alerts on thresholds', async () => {
      render(<App />);
      
      // Mock high CPU
      vi.spyOn(window, 'performance').mockReturnValue({
        now: () => Date.now(),
        // @ts-ignore
        memory: { usedJSHeapSize: 1500000000 } // 1.5GB (high)
      });
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/health/i));
      
      await waitFor(() => {
        expect(screen.getByText(/warning|alert|high/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Engine Management', () => {
    it('should list active engines', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/engines/i });
      
      await waitFor(() => {
        expect(screen.getByText(/fusion.*engine/i)).toBeInTheDocument();
      });
    });

    it('should start/stop engine', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      fireEvent.click(screen.getByText(/engines/i));
      
      // Stop engine
      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);
      
      await waitFor(() => {
        expect(screen.getByText(/stopped|inactive/i)).toBeInTheDocument();
      });
      
      // Restart engine
      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText(/active|running/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Diagnostics', () => {
    it('should export diagnostic report', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /devtools/i }));
      
      const exportButton = screen.getByRole('button', { name: /export.*diagnostic/i });
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByText(/exported|downloaded/i)).toBeInTheDocument();
      });
    });
  });
});
