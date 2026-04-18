import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  getAdvancedAgentStatus,
  listAdvancedAgentStatuses,
} from '@/services/agents/advancedAgentCatalog';
import {
  getDiagnosticAgentStatus,
  resetDiagnosticReportHistoryForTests,
} from '@/services/diagnostic';
import {
  getExplainabilityAgentStatus,
  resetExplainabilityTraceHistoryForTests,
} from '@/services/explainability';
import {
  getOrchestratorAgentStatus,
  resetOrchestratorSessionSnapshotsForTests,
} from '@/services/orchestrator';
import { getMonitoringAgentStatus } from '@/services/monitoring';
import MonitoringDashboard from '@/services/monitoring/MonitoringDashboard';
import DiagnosticDashboard from '@/services/diagnostic/DiagnosticDashboard';
import ExplainabilityDashboard from '@/services/explainability/ExplainabilityDashboard';
import OrchestratorDashboard from '@/services/orchestrator/OrchestratorDashboard';
import SecurityDashboard from '@/services/security_active/SecurityDashboard';
import { exportSecurityContainmentCorrelations } from '@/services/security_active';
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
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetDiagnosticReportHistoryForTests();
    resetExplainabilityTraceHistoryForTests();
    resetOrchestratorSessionSnapshotsForTests();
  });

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

  it('publishes a bounded structural diagnostic report without duplicating unchanged snapshots', () => {
    const firstStatus = getDiagnosticAgentStatus();
    const secondStatus = getDiagnosticAgentStatus();
    const firstHistory = firstStatus.detailSections?.find(section => section.key === 'diagnostic-history');
    const secondHistory = secondStatus.detailSections?.find(section => section.key === 'diagnostic-history');

    expect(firstStatus.serviceState).toContain('rapports bornes');
    expect(firstStatus.detailSections?.find(section => section.key === 'diagnostic-report')).toBeDefined();
    expect(firstHistory?.items).toHaveLength(1);
    expect(secondHistory?.items).toHaveLength(1);
    expect(firstStatus.evidence.some(item => item.includes('dernier rapport'))).toBe(true);
  });

  it('publishes a bounded explainability history when multiple runtime traces are observed', () => {
    const SECOND_EXPLAINABILITY_CONVERSATION_ID = 'conv-explainability-test-2';

    localStorage.setItem('omega-chat-preferred-provider', 'ollama');
    localStorage.setItem('titane_active_conversation_id', EXPLAINABILITY_CONVERSATION_ID);
    localStorage.setItem(
      `titane_conversation_${EXPLAINABILITY_CONVERSATION_ID}`,
      JSON.stringify(EXPLAINABILITY_CONVERSATION)
    );

    const firstStatus = getExplainabilityAgentStatus();
    const firstHistory = firstStatus.detailSections?.find(section => section.key === 'inference-history');

    localStorage.setItem('titane_active_conversation_id', SECOND_EXPLAINABILITY_CONVERSATION_ID);
    localStorage.setItem(
      `titane_conversation_${SECOND_EXPLAINABILITY_CONVERSATION_ID}`,
      JSON.stringify({
        ...EXPLAINABILITY_CONVERSATION,
        id: SECOND_EXPLAINABILITY_CONVERSATION_ID,
        title: 'Explainability Trace 2',
        updated_at: 3,
        messages: [
          {
            role: 'assistant',
            content: 'Deuxieme trace explainability',
            timestamp: 3,
            metadata: {
              providerMeta: {
                provider_used: 'Ollama (OMEGA+Singularity)',
                provider_class: 'local',
                mode: 'LOCAL',
                reason_code: 'FALLBACK_OK',
                latency_ms_total: 57,
                timeout_ms: 30000,
                retries: 1,
                attempts: [
                  {
                    provider_id: 'ollama',
                    provider_class: 'local',
                    latency_ms: 57,
                    outcome: 'success',
                    reason_code: 'FALLBACK_OK',
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
      })
    );

    const secondStatus = getExplainabilityAgentStatus();
    const secondHistory = secondStatus.detailSections?.find(section => section.key === 'inference-history');

    expect(firstHistory?.items).toHaveLength(1);
    expect(secondHistory?.items).toHaveLength(2);
    expect(secondStatus.evidence.some(item => item.includes('historique local'))).toBe(true);
  });

  it('publishes local multi-session comparison and champion breakdown on orchestrator status', () => {
    localStorage.setItem(
      'titane_orchestrator_session_snapshots',
      JSON.stringify([
        {
          sessionId: 'session-remote-alpha',
          timestamp: Date.now() - 5000,
          totalRequests: 4,
          successRate: 75,
          healthyProviders: 2,
          providerCount: 3,
          totalFallbacks: 1,
          topProvider: 'ollama',
        },
      ])
    );

    const status = getOrchestratorAgentStatus();
    const multiSessionSection = status.detailSections?.find(
      section => section.key === 'multi-session-compare'
    );
    const championBreakdownSection = status.detailSections?.find(
      section => section.key === 'champion-breakdown'
    );

    expect(status.serviceState).toContain('sessions locales');
    expect(multiSessionSection?.items.length).toBeGreaterThan(0);
    expect(championBreakdownSection?.items[0]?.label).toContain('champion=');
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
    expect(screen.getByTestId('orchestrator-dashboard-multi-session-compare')).toBeInTheDocument();
    expect(screen.getByTestId('orchestrator-dashboard-champion-breakdown')).toBeInTheDocument();
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
    expect(screen.getByTestId('explainability-dashboard-inference-history')).toBeInTheDocument();
  });

  it('renders a structural diagnostic report and bounded history on the canonical diagnostic surface', () => {
    render(<DiagnosticDashboard />);

    expect(screen.getByTestId('diagnostic-panel-diagnostic-report')).toBeInTheDocument();
    expect(screen.getByTestId('diagnostic-panel-diagnostic-history')).toBeInTheDocument();
    expect(screen.getByTestId('diagnostic-panel-diagnostic-report-0')).toHaveTextContent(
      'Severite:'
    );
  });

  it('renders acknowledgement, history and correlation on the active security surface', async () => {
    const now = Date.now();
    uiLogger.security('Test security alert', { scope: 'dashboard-test' });
    localStorage.setItem(
      'titane_security_dashboard_event_history',
      JSON.stringify([
        {
          id: 'seed-detection-session-alpha',
          category: 'detection',
          severity: 'warning',
          source: 'uiLogger',
          message: 'UILogger:Seed warning session alpha',
          correlationKey: 'scope-alpha',
          timestamp: now - 1000,
          lastSeen: now - 1000,
          acknowledged: false,
          sessionId: 'session-alpha',
        },
        {
          id: 'seed-containment-session-beta',
          category: 'containment',
          severity: 'critical',
          source: 'provider-governance',
          message: 'Provider:beta: active=no · healthy=no · consecutiveFailures=4',
          correlationKey: 'provider-beta',
          timestamp: now - 500,
          lastSeen: now - 500,
          acknowledged: false,
          sessionId: 'session-beta',
        },
      ])
    );

    render(<SecurityDashboard />);

    expect(screen.getByTestId('security-dashboard-refresh')).toHaveTextContent(
      'Refresh borne: 10s'
    );
    expect(screen.getByTestId('security-dashboard-detection-events')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-containment-events')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-event-history')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-correlation-summary')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-multi-session-federation')).toBeInTheDocument();
    expect(screen.getByTestId('security-dashboard-governed-export')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('security-dashboard-ack-detection-events-0'));

    expect(screen.getByTestId('security-dashboard-detection-events-0')).toHaveAttribute(
      'data-acknowledged',
      'yes'
    );

    fireEvent.click(screen.getByTestId('security-dashboard-filter-critical'));

    await waitFor(() => {
      expect(screen.getByTestId('security-dashboard-filter-critical')).toHaveAttribute(
        'data-active',
        'yes'
      );
      expect(screen.getByTestId('security-dashboard-severity-filter-summary')).toHaveTextContent(
        'critical'
      );
      expect(screen.getByTestId('security-dashboard-event-history-0')).toHaveTextContent(
        'severity=critical'
      );
      expect(screen.getByTestId('security-dashboard-multi-session-federation')).toHaveTextContent(
        'session-beta'
      );
    });

    expect(screen.getByTestId('security-dashboard-export-correlations')).toBeInTheDocument();
  });

  it('exports containment correlations for the active security service', async () => {
    const now = Date.now();
    localStorage.setItem(
      'titane_security_dashboard_event_history',
      JSON.stringify([
        {
          id: 'seed-containment-session-beta',
          category: 'containment',
          severity: 'critical',
          source: 'provider-governance',
          message: 'Provider:beta: active=no · healthy=no · consecutiveFailures=4',
          correlationKey: 'provider-beta',
          timestamp: now - 500,
          lastSeen: now - 500,
          acknowledged: false,
          sessionId: 'session-beta',
        },
      ])
    );

    const payload = await exportSecurityContainmentCorrelations('critical');

    expect(payload).toContain('"severityFilter": "critical"');
    expect(payload).toContain('"sessionId": "session-beta"');
  });

  it('renders governed export metadata when a signed export payload is already present', () => {
    localStorage.setItem(
      'titane_security_dashboard_correlation_export',
      JSON.stringify({
        governance: {
          scope: 'tauri-app-data',
          exportId: 'security-audit-123456',
          exportPath: '/tmp/security-audit-123456.json',
          sha256: 'abc123sha',
          signature: 'sig',
          publicKey: 'pub',
          fingerprint: 'fp-security-01',
          publishedAt: '2026-04-17T23:58:00.000Z',
        },
        content: {
          severityFilter: 'critical',
          exportedEvents: [{ id: 'containment-1' }],
        },
      })
    );

    render(<SecurityDashboard />);

    expect(screen.getByTestId('security-dashboard-governed-export-0')).toHaveTextContent(
      'exportId=security-audit-123456'
    );
    expect(screen.getByTestId('security-dashboard-governed-export-1')).toHaveTextContent(
      'exportPath=/tmp/security-audit-123456.json'
    );
    expect(screen.getByTestId('security-dashboard-governed-export-2')).toHaveTextContent(
      'fingerprint=fp-security-01'
    );
  });
});