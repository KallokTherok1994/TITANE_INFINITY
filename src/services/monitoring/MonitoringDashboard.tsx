import React from 'react';
import { getMonitoringAgentStatus } from './index';

const MonitoringDashboard: React.FC = () => {
  const status = getMonitoringAgentStatus();

  return (
    <section
      data-testid="monitoring-dashboard"
      data-readiness={status.readiness}
      style={{
        background: '#0f172a',
        color: '#e2e8f0',
        padding: 12,
        margin: 4,
        borderRadius: 10,
        border: '1px solid rgba(148, 163, 184, 0.35)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Agent avance</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{status.title}</h2>
        </div>
        <strong data-testid="monitoring-dashboard-status">{status.readinessLabel}</strong>
      </header>
      <p data-testid="monitoring-dashboard-summary" style={{ marginBottom: 10 }}>
        {status.summary}
      </p>
      <p
        data-testid="monitoring-dashboard-sync-state"
        style={{ margin: '0 0 6px', fontSize: 13 }}
      >
        {`Sync runtime: ${status.syncSnapshot.label}`}
      </p>
      <p
        data-testid="monitoring-dashboard-sync-reason"
        style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.9 }}
      >
        {status.syncSnapshot.reason}
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>{status.serviceState}</p>
      <ul
        data-testid="monitoring-dashboard-proof-list"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.evidence.map((item, index) => (
          <li key={item} data-testid={`monitoring-dashboard-proof-${index}`}>
            {item}
          </li>
        ))}
      </ul>
      <ul
        data-testid="monitoring-dashboard-blockers"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.blockers.map(blocker => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>
      <p data-testid="monitoring-dashboard-next-step" style={{ margin: 0, fontSize: 13 }}>
        {status.nextStep}
      </p>
    </section>
  );
};
export default MonitoringDashboard;
