import React, { useEffect, useState } from 'react';
import {
  getOrchestratorAgentStatus,
  getOrchestratorDashboardRefreshIntervalMs,
} from './index';

const OrchestratorDashboard: React.FC = () => {
  const [status, setStatus] = useState(() => getOrchestratorAgentStatus());
  const detailSections = status.detailSections ?? [];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStatus(getOrchestratorAgentStatus());
    }, getOrchestratorDashboardRefreshIntervalMs());

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      data-testid="orchestrator-dashboard"
      data-readiness={status.readiness}
      style={{
        background: '#111827',
        color: '#e5e7eb',
        padding: 12,
        margin: 4,
        borderRadius: 10,
        border: '1px solid rgba(45, 212, 191, 0.35)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Agent avance</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{status.title}</h2>
        </div>
        <strong data-testid="orchestrator-dashboard-status">{status.readinessLabel}</strong>
      </header>
      <p data-testid="orchestrator-dashboard-summary" style={{ marginBottom: 10 }}>
        {status.summary}
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>{status.serviceState}</p>
      <p data-testid="orchestrator-dashboard-refresh" style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.8 }}>
        Refresh borne: {Math.round(getOrchestratorDashboardRefreshIntervalMs() / 1000)}s
      </p>
      <ul data-testid="orchestrator-dashboard-proof-list" style={{ margin: '0 0 8px', paddingLeft: 18 }}>
        {status.evidence.map((item, index) => (
          <li key={item} data-testid={`orchestrator-dashboard-proof-${index}`}>
            {item}
          </li>
        ))}
      </ul>
      <ul data-testid="orchestrator-dashboard-blockers" style={{ margin: '0 0 8px', paddingLeft: 18 }}>
        {status.blockers.map(blocker => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>
      {detailSections.map(section => (
        <div
          key={section.key}
          data-testid={`orchestrator-dashboard-${section.key}`}
          style={{ margin: '0 0 8px' }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.8 }}>{section.title}</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {section.items.map((item, index) => (
              <li
                key={`${section.key}-${item.id}`}
                data-testid={`orchestrator-dashboard-${section.key}-${index}`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p data-testid="orchestrator-dashboard-next-step" style={{ margin: 0, fontSize: 13 }}>
        {status.nextStep}
      </p>
    </section>
  );
};
export default OrchestratorDashboard;
