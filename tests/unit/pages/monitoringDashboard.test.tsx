/**
 * TITANE∞ — MonitoringDashboard ProjectHealthCard unit tests
 * Rule 16: new UI component requires Vitest + data-testid E2E gates.
 * Tests Phase B2/B1/D2/D3 surface: getProjectHealthMetrics + dispatchToAgents
 * wired into MonitoringDashboard.
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks (vi.hoisted required — prevent initialization before vi.mock) ─
const mockGetProjectHealthMetrics = vi.hoisted(() => vi.fn());
const mockDispatchToAgents = vi.hoisted(() => vi.fn());
const mockServiceMetricsExport = vi.hoisted(() => vi.fn(() => []));

vi.mock('@/services/monitoring', () => ({
  getProjectHealthMetrics: mockGetProjectHealthMetrics,
  resetProjectHealthMetricsCacheForTests: vi.fn(),
}));

vi.mock('@/services/orchestrator', () => ({
  dispatchToAgents: mockDispatchToAgents,
}));

vi.mock('@/lib/serviceMetrics', () => ({
  ServiceMetrics: {
    export: mockServiceMetricsExport,
    clear: vi.fn(),
  },
}));

// Stub sub-components to isolate ProjectHealthCard
vi.mock('@/components/monitoring/GlobalMetricsSummary', () => ({
  GlobalMetricsSummary: () => <div data-testid="global-metrics-stub" />,
}));
vi.mock('@/components/monitoring/ServiceMetricsPanel', () => ({
  ServiceMetricsPanel: () => <div data-testid="service-metrics-stub" />,
}));
vi.mock('@/components/monitoring/CommandStatsTable', () => ({
  CommandStatsTable: () => <div data-testid="command-stats-stub" />,
}));

import { MonitoringDashboard } from '../../../src/pages/MonitoringDashboard';

const HEALTH_METRICS_OK = {
  incidentRecurrenceRate: 0.12,
  mostImpactedRing: 'Ring 0',
  avgLeadTimeMinutes: 35,
  computedAt: new Date().toISOString(),
  evidenceNote: '8 incidents, 6 rings, 6 fixes',
};

const CONSENSUS_PASS = {
  verdicts: { monitoring: 'PASS', diagnostic: 'PASS', security: 'PASS' },
  aggregated: 'PASS' as const,
  blockers: [],
  timestamp: Date.now(),
};

describe('MonitoringDashboard — ProjectHealthCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders data-testid=project-health-metrics', async () => {
    mockGetProjectHealthMetrics.mockResolvedValue(HEALTH_METRICS_OK);
    mockDispatchToAgents.mockResolvedValue(CONSENSUS_PASS);

    render(<MonitoringDashboard />);
    expect(screen.getByTestId('project-health-metrics')).toBeInTheDocument();
  });

  it('displays incidentRecurrenceRate, mostImpactedRing, avgLeadTimeMinutes after load', async () => {
    mockGetProjectHealthMetrics.mockResolvedValue(HEALTH_METRICS_OK);
    mockDispatchToAgents.mockResolvedValue(CONSENSUS_PASS);

    render(<MonitoringDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ring 0')).toBeInTheDocument();
      // recurrence rate 12.0% is shown inside the health card
      const card = screen.getByTestId('project-health-metrics');
      expect(card).toHaveTextContent('12.0');
      // avg lead time 35 min
      expect(card).toHaveTextContent('35');
    });
  });

  it('calls dispatchToAgents with health_check event on mount', async () => {
    mockGetProjectHealthMetrics.mockResolvedValue(HEALTH_METRICS_OK);
    mockDispatchToAgents.mockResolvedValue(CONSENSUS_PASS);

    render(<MonitoringDashboard />);

    await waitFor(() => {
      expect(mockDispatchToAgents).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'health_check', source: 'monitoring_dashboard' }),
      );
    });
  });

  it('displays PASS consensus after agent dispatch', async () => {
    mockGetProjectHealthMetrics.mockResolvedValue(HEALTH_METRICS_OK);
    mockDispatchToAgents.mockResolvedValue(CONSENSUS_PASS);

    render(<MonitoringDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/PASS/)).toBeInTheDocument();
    });
  });

  it('displays FAIL consensus with blockers when agents disagree', async () => {
    mockGetProjectHealthMetrics.mockResolvedValue(HEALTH_METRICS_OK);
    mockDispatchToAgents.mockResolvedValue({
      verdicts: { monitoring: 'FAIL', diagnostic: 'PASS', security: 'UNKNOWN' },
      aggregated: 'FAIL' as const,
      blockers: ['monitoring_agent_fail'],
      timestamp: Date.now(),
    });

    render(<MonitoringDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/FAIL/)).toBeInTheDocument();
      expect(screen.getByText(/monitoring_agent_fail/)).toBeInTheDocument();
    });
  });

  it('renders card even if getProjectHealthMetrics rejects (graceful degradation)', async () => {
    mockGetProjectHealthMetrics.mockRejectedValue(new Error('IPC error'));
    mockDispatchToAgents.mockResolvedValue(CONSENSUS_PASS);

    render(<MonitoringDashboard />);

    await waitFor(() => {
      // Card should still be present (error state, not crashed)
      expect(screen.getByTestId('project-health-metrics')).toBeInTheDocument();
    });
  });

  it('renders data-testid=monitoring-dashboard-page root element', () => {
    mockGetProjectHealthMetrics.mockResolvedValue(HEALTH_METRICS_OK);
    mockDispatchToAgents.mockResolvedValue(CONSENSUS_PASS);

    render(<MonitoringDashboard />);
    expect(screen.getByTestId('monitoring-dashboard-page')).toBeInTheDocument();
  });
});
