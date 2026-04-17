import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
import { uiLogger } from '@/lib/UILogger';

const EXPLAINABILITY_CONVERSATION_ID = 'conv-explainability-test';

const EXPLAINABILITY_CONVERSATION = {
  id: EXPLAINABILITY_CONVERSATION_ID,
  title: 'Explainability Trace',
  status: 'active',
  created_at: 1,
  updated_at: 2,
  messages: [
    {
      role: 'assistant',
      content: 'Trace de réponse canonique',
      timestamp: 2,
      metadata: {
        providerMeta: {
          provider_used: 'Ollama (OMEGA+Singularity)',
          provider_class: 'local',
          mode: 'LOCAL',
          reason_code: 'OK',
          latency_ms_total: 42,
          timeout_ms: 30000,
          retries: 0,
          attempts: [
            {
              provider_id: 'ollama',
              provider_class: 'local',
              latency_ms: 42,
              outcome: 'success',
              reason_code: 'OK',
              network_used_attempt: false,
            },
          ],
          network_used: false,
          cache_hit: false,
          policy: 'default',
        },
      },
    },
  ],
};

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

  beforeEach(() => {
    localStorage.clear();
    uiLogger.clearLogs();
  });

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

  it('renders live orchestration metrics and provider snapshots', () => {
    render(<OrchestratorDashboard />);

    expect(screen.getByTestId('orchestrator-dashboard-refresh')).toHaveTextContent(
      'Refresh borne: 15s'
    );
    expect(screen.getByTestId('orchestrator-dashboard-live-metrics')).toBeInTheDocument();
    expect(
      screen.getByTestId('orchestrator-dashboard-provider-snapshots')
    ).toBeInTheDocument();
    expect(screen.getByTestId('orchestrator-dashboard-live-timeline')).toBeInTheDocument();
  });

  it('renders the requested -> used -> shown chain and inference report from persisted conversation runtime', () => {
    localStorage.setItem('omega-chat-preferred-provider', 'ollama');
    localStorage.setItem('titane_active_conversation_id', EXPLAINABILITY_CONVERSATION_ID);
    localStorage.setItem(
      `titane_conversation_${EXPLAINABILITY_CONVERSATION_ID}`,
      JSON.stringify(EXPLAINABILITY_CONVERSATION)
    );

    render(<ExplainabilityDashboard />);

    expect(
      screen.getByTestId('explainability-dashboard-inference-chain-0')
    ).toHaveTextContent('Requested: Ollama');
    expect(
      screen.getByTestId('explainability-dashboard-inference-report-1')
    ).toHaveTextContent('Attempts: ollama:success/OK/42ms');
  });

  it('renders acknowledgement, history and correlation on the active security surface', () => {
    uiLogger.security('Test security alert', { scope: 'dashboard-test' });

    render(<SecurityDashboard />);

    expect(screen.getByTestId('security-dashboard-refresh')).toHaveTextContent(
      'Refresh borne: 10s'
    );
    expect(screen.getByTestId('security-dashboard-detection-events')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-containment-events')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-event-history')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-correlation-summary')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('security-dashboard-ack-detection-events-0'));

    expect(screen.getByTestId('security-dashboard-detection-events-0')).toHaveAttribute(
      'data-acknowledged',
      'yes'
    );
  });
});