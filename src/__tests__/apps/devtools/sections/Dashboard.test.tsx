/**
 * Tests pour DevTools Dashboard Section
 * Coverage: Rendu, Métriques système, Status cards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '@/apps/devtools/sections';

// Mock du store DevTools avec données de test
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    systemHealth: 'healthy',
    engines: [
      { id: 'helios', name: 'Helios', status: 'running' },
      { id: 'nexus', name: 'Nexus', status: 'running' },
    ],
    metrics: {
      'ipc-latency-p50': { id: 'ipc-latency-p50', label: 'IPC Latency P50', value: 12, unit: 'ms', trend: 'stable', history: [10, 11, 12] },
      'cpu-usage': { id: 'cpu-usage', label: 'CPU Usage', value: 34, unit: '%', trend: 'up', history: [30, 32, 34] },
    },
    logs: [],
    errors: [],
  }),
}));

// Mock des composants enfants
vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title, description }: any) => <div data-testid="section-header"><h2>{title}</h2><p>{description}</p></div>,
  MetricCard: ({ label }: any) => <div data-testid={`metric-card-${label.replace(/\s+/g, '-')}`}>{label}</div>,
  StatusPill: ({ label }: any) => <span data-testid="status-pill">{label}</span>,
  EngineCard: ({ engine }: any) => <div data-testid={`engine-${engine.id}`}>{engine.name}</div>,
}));

describe('DevTools Dashboard Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard section with header', () => {
      render(<Dashboard />);
      
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
      expect(screen.getByText('System Dashboard')).toBeInTheDocument();
    });

    it('should display metrics section', () => {
      render(<Dashboard />);
      
      const metricsDisplay = screen.getByTestId('metrics-display');
      expect(metricsDisplay).toBeInTheDocument();
    });

    it('should display system health status', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByTestId('status-pill')).toBeInTheDocument();
    });
  });

  describe('Metrics', () => {
    it('should render metric cards', () => {
      render(<Dashboard />);
      
      expect(screen.getByTestId('metric-card-IPC-Latency-P50')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-CPU-Usage')).toBeInTheDocument();
    });
  });

  describe('Engines', () => {
    it('should render active engines', () => {
      render(<Dashboard />);
      
      expect(screen.getByTestId('engine-helios')).toBeInTheDocument();
      expect(screen.getByTestId('engine-nexus')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Dashboard />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
