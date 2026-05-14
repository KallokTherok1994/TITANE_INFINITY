import React from 'react';
import { useAgentLiveSnapshot } from '@/hooks/useAgentLiveSnapshot';
import { getDiagnosticAgentStatus } from './index';

export const DIAGNOSTIC_DASHBOARD_REFRESH_INTERVAL_MS = 60_000;

function formatDiagnosticClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const DiagnosticDashboard: React.FC = () => {
  const {
    data: status,
    lastUpdate,
    refresh,
  } = useAgentLiveSnapshot(
    getDiagnosticAgentStatus,
    DIAGNOSTIC_DASHBOARD_REFRESH_INTERVAL_MS
  );
  const detailSections = status.detailSections ?? [];

  return (
    <section
      data-testid="diagnostic-panel"
      data-readiness={status.readiness}
      style={{
        background: '#172554',
        color: '#dbeafe',
        padding: 12,
        margin: 4,
        borderRadius: 10,
        border: '1px solid rgba(96, 165, 250, 0.35)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Agent avance</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{status.title}</h2>
        </div>
        <strong data-testid="diagnostic-panel-status">{status.readinessLabel}</strong>
      </header>
      <p data-testid="diagnostic-panel-summary" style={{ marginBottom: 10 }}>
        {status.summary}
      </p>
      <div
        data-testid="diagnostic-panel-live"
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
          data-testid="diagnostic-panel-live-dot"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 6px rgba(52, 211, 153, 0.6)',
          }}
        />
        <span data-testid="diagnostic-panel-live-label">
          Live - maj {formatDiagnosticClock(lastUpdate)} - refresh{' '}
          {Math.round(DIAGNOSTIC_DASHBOARD_REFRESH_INTERVAL_MS / 1000)}s
        </span>
        <button
          type="button"
          data-testid="diagnostic-panel-refresh-now"
          onClick={refresh}
          style={{ fontSize: 11, padding: '1px 6px', marginLeft: 6 }}
        >
          Rafraichir
        </button>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>{status.serviceState}</p>
      <ul
        data-testid="diagnostic-panel-proof-list"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.evidence.map((item, index) => (
          <li key={item} data-testid={`diagnostic-panel-proof-${index}`}>
            {item}
          </li>
        ))}
      </ul>
      <ul
        data-testid="diagnostic-panel-blockers"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.blockers.map(blocker => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>
      {detailSections.map(section => (
        <div
          key={section.key}
          data-testid={`diagnostic-panel-${section.key}`}
          style={{ margin: '0 0 8px' }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.8 }}>{section.title}</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {section.items.map((item, index) => (
              <li
                key={`${section.key}-${item.id}`}
                data-testid={`diagnostic-panel-${section.key}-${index}`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p data-testid="diagnostic-panel-next-step" style={{ margin: 0, fontSize: 13 }}>
        {status.nextStep}
      </p>
    </section>
  );
};
export default React.memo(DiagnosticDashboard);
