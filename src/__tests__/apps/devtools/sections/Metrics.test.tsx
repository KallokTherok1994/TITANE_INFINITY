/**
 * Tests pour DevTools Metrics Section
 * Coverage: Affichage métriques, Graphiques, Filtres
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Metrics } from '@/apps/devtools/sections';

// Mock du store DevTools
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    metrics: {
      'ipc-latency-p50': { id: 'ipc-latency-p50', label: 'IPC Latency P50', value: 12, unit: 'ms', trend: 'stable', history: [10, 11, 12] },
      'ipc-latency-p90': { id: 'ipc-latency-p90', label: 'IPC Latency P90', value: 25, unit: 'ms', trend: 'down', history: [28, 26, 25] },
      'cpu-usage': { id: 'cpu-usage', label: 'CPU Usage', value: 34, unit: '%', trend: 'up', history: [30, 32, 34] },
      'memory-usage': { id: 'memory-usage', label: 'Memory Usage', value: 512, unit: 'MB', trend: 'stable', history: [500, 510, 512] },
      'omega-duration': { id: 'omega-duration', label: 'Omega Duration', value: 145, unit: 'ms', trend: 'stable', history: [140, 143, 145] },
    },
    timeRange: '2m',
    setTimeRange: vi.fn(),
  }),
}));

// Mock des composants enfants
vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title }: any) => <div data-testid="section-header">{title}</div>,
  MetricCard: ({ label }: any) => <div data-testid={`metric-${label.replace(/\s+/g, '-')}`}>{label}</div>,
}));

describe('DevTools Metrics Section', () => {
  describe('Rendering', () => {
    it('should render metrics section with header', () => {
      render(<Metrics />);
      
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
      expect(screen.getByText('System Metrics')).toBeInTheDocument();
    });

    it('should display all metric cards', () => {
      render(<Metrics />);
      
      expect(screen.getByTestId('metric-IPC-Latency-P50')).toBeInTheDocument();
      expect(screen.getByTestId('metric-IPC-Latency-P90')).toBeInTheDocument();
      expect(screen.getByTestId('metric-CPU-Usage')).toBeInTheDocument();
      expect(screen.getByTestId('metric-Memory-Usage')).toBeInTheDocument();
    });
  });

  describe('Metric Cards', () => {
    it('should render latency metrics', () => {
      render(<Metrics />);
      
      expect(screen.getByTestId('metric-IPC-Latency-P50')).toHaveTextContent('IPC Latency P50');
      expect(screen.getByTestId('metric-IPC-Latency-P90')).toHaveTextContent('IPC Latency P90');
    });

    it('should render system resource metrics', () => {
      render(<Metrics />);
      
      expect(screen.getByTestId('metric-CPU-Usage')).toHaveTextContent('CPU Usage');
      expect(screen.getByTestId('metric-Memory-Usage')).toHaveTextContent('Memory Usage');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Metrics />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
