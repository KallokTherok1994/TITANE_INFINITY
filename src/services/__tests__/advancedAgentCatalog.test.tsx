import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  getAdvancedAgentStatus,
  listAdvancedAgentStatuses,
} from '@/services/agents/advancedAgentCatalog';
import { getMonitoringAgentStatus } from '@/services/monitoring';
import MonitoringDashboard from '@/services/monitoring/MonitoringDashboard';
import DiagnosticDashboard from '@/services/diagnostic/DiagnosticDashboard';
import ExplainabilityDashboard from '@/services/explainability/ExplainabilityDashboard';
import OrchestratorDashboard from '@/services/orchestrator/OrchestratorDashboard';
import SecurityDashboard from '@/services/security_active/SecurityDashboard';
import { AppShell } from '@/components/layout/AppShell';

describe('advancedAgentCatalog', () => {
  it('returns the five governed advanced agent statuses', () => {
    const statuses = listAdvancedAgentStatuses();

    expect(statuses).toHaveLength(5);
    expect(statuses.map(status => status.id)).toEqual([
      'monitoring',
      'diagnostic',
      'explainability',
      'orchestrator',
      'security_active',
    ]);
  });

  it('keeps diagnostic aligned on the canonical diagnostic-panel selector', () => {
    const status = getAdvancedAgentStatus('diagnostic');

    expect(status.testId).toBe('diagnostic-panel');
    expect(status.readiness).toBe('partial');
    expect(status.evidence.length).toBeGreaterThan(0);
    expect(status.blockers.length).toBeGreaterThan(0);
  });

  it('resolves monitoring runtime signals without throwing a missing lazy-loader binding', () => {
    const status = getMonitoringAgentStatus();

    expect(status.testId).toBe('monitoring-dashboard');
    expect(status.readiness).toBe('partial');
    expect(status.serviceState).toContain('Monitoring');
    expect(status.evidence[0]).toContain('Runtime:');
  });
});

describe('advanced agent dashboards', () => {
  const cases = [
    {
      selector: 'monitoring-dashboard',
      readiness: 'partial',
      Component: MonitoringDashboard,
    },
    {
      selector: 'diagnostic-panel',
      readiness: 'partial',
      Component: DiagnosticDashboard,
    },
    {
      selector: 'explainability-dashboard',
      readiness: 'partial',
      Component: ExplainabilityDashboard,
    },
    {
      selector: 'orchestrator-dashboard',
      readiness: 'partial',
      Component: OrchestratorDashboard,
    },
    {
      selector: 'security-dashboard',
      readiness: 'partial',
      Component: SecurityDashboard,
    },
  ] as const;

  it.each(cases)('renders $selector with governed status details', ({
    selector,
    readiness,
    Component,
  }) => {
    render(<Component />);

    expect(screen.getByTestId(selector)).toHaveAttribute('data-readiness', readiness);
    expect(screen.getByTestId(`${selector}-status`)).toBeInTheDocument();
    expect(screen.getByTestId(`${selector}-summary`)).toBeInTheDocument();
    expect(screen.getByTestId(`${selector}-proof-0`)).toBeInTheDocument();
    expect(screen.getByTestId(`${selector}-next-step`)).toBeInTheDocument();
    expect(screen.getByTestId(`${selector}-blockers`)).toBeInTheDocument();
  });

  it('mounts the canonical dashboards panel inside AppShell', () => {
    render(
      <AppShell topNav={<div>TopNav</div>}>
        <div>content</div>
      </AppShell>
    );

    expect(screen.getByTestId('agent-dashboards-panel')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('diagnostic-panel')).toBeInTheDocument();
  });
});