import React from 'react';
import { useAgentLiveSnapshot } from '@/hooks/useAgentLiveSnapshot';
import {
  getExplainabilityAgentStatus,
  getExplainabilityDashboardRefreshIntervalMs,
} from './index';

function formatExplainabilityClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const ExplainabilityDashboard: React.FC = () => {
  const {
    data: status,
    lastUpdate,
    refresh,
  } = useAgentLiveSnapshot(
    getExplainabilityAgentStatus,
    getExplainabilityDashboardRefreshIntervalMs()
  );
  const detailSections = status.detailSections ?? [];

  return (
    <section
      data-testid="explainability-dashboard"
      data-readiness={status.readiness}
      style={{
        background: '#1e293b',
        color: '#e2e8f0',
        padding: 12,
        margin: 4,
        borderRadius: 10,
        border: '1px solid rgba(129, 140, 248, 0.35)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Agent avance</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{status.title}</h2>
        </div>
        <strong data-testid="explainability-dashboard-status">
          {status.readinessLabel}
        </strong>
      </header>
      <p data-testid="explainability-dashboard-summary" style={{ marginBottom: 10 }}>
        {status.summary}
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>{status.serviceState}</p>
      <div
        data-testid="explainability-dashboard-live"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          margin: '0 0 8px',
          fontSize: 12,
          opacity: 0.85,
        }}
      >
        <span
          aria-hidden="true"
          data-testid="explainability-dashboard-live-dot"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 6px rgba(52, 211, 153, 0.6)',
          }}
        />
        <span data-testid="explainability-dashboard-live-label">
          Live - maj {formatExplainabilityClock(lastUpdate)} - refresh{' '}
          {Math.round(getExplainabilityDashboardRefreshIntervalMs() / 1000)}s
        </span>
        <button
          type="button"
          data-testid="explainability-dashboard-refresh-now"
          onClick={refresh}
          style={{ fontSize: 11, padding: '1px 6px', marginLeft: 6 }}
        >
          Rafraichir
        </button>
      </div>
      <ul
        data-testid="explainability-dashboard-proof-list"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.evidence.map((item, index) => (
          <li key={item} data-testid={`explainability-dashboard-proof-${index}`}>
            {item}
          </li>
        ))}
      </ul>
      <ul
        data-testid="explainability-dashboard-blockers"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.blockers.map(blocker => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>
      {detailSections.map(section => (
        <div
          key={section.key}
          data-testid={`explainability-dashboard-${section.key}`}
          style={{ margin: '0 0 8px' }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.8 }}>{section.title}</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {section.items.map((item, index) => (
              <li
                key={`${section.key}-${item.id}`}
                data-testid={`explainability-dashboard-${section.key}-${index}`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p
        data-testid="explainability-dashboard-next-step"
        style={{ margin: 0, fontSize: 13 }}
      >
        {status.nextStep}
      </p>
    </section>
  );
};

export default React.memo(ExplainabilityDashboard);
