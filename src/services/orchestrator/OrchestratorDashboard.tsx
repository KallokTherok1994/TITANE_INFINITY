import React from 'react';
import { getOrchestratorAgentStatus } from './index';

const OrchestratorDashboard: React.FC = () => {
  const status = getOrchestratorAgentStatus();

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
      <p data-testid="orchestrator-dashboard-next-step" style={{ margin: 0, fontSize: 13 }}>
        {status.nextStep}
      </p>
    </section>
  );
};
export default OrchestratorDashboard;
