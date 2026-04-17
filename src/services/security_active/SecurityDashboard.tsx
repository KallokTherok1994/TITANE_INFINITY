import React from 'react';
import { getSecurityActiveAgentStatus } from './index';

const SecurityDashboard: React.FC = () => {
  const status = getSecurityActiveAgentStatus();
  const detailSections = status.detailSections ?? [];

  return (
    <section
      data-testid="security-dashboard"
      data-readiness={status.readiness}
      style={{
        background: '#450a0a',
        color: '#fecaca',
        padding: 12,
        margin: 4,
        borderRadius: 10,
        border: '1px solid rgba(248, 113, 113, 0.35)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Agent avance</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{status.title}</h2>
        </div>
        <strong data-testid="security-dashboard-status">{status.readinessLabel}</strong>
      </header>
      <p data-testid="security-dashboard-summary" style={{ marginBottom: 10 }}>
        {status.summary}
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>{status.serviceState}</p>
      <ul data-testid="security-dashboard-proof-list" style={{ margin: '0 0 8px', paddingLeft: 18 }}>
        {status.evidence.map((item, index) => (
          <li key={item} data-testid={`security-dashboard-proof-${index}`}>
            {item}
          </li>
        ))}
      </ul>
      <ul data-testid="security-dashboard-blockers" style={{ margin: '0 0 8px', paddingLeft: 18 }}>
        {status.blockers.map(blocker => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>
      {detailSections.map(section => (
        <div
          key={section.key}
          data-testid={`security-dashboard-${section.key}`}
          style={{ margin: '0 0 8px' }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.8 }}>{section.title}</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {section.items.map((item, index) => (
              <li
                key={`${section.key}-${item}`}
                data-testid={`security-dashboard-${section.key}-${index}`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p data-testid="security-dashboard-next-step" style={{ margin: 0, fontSize: 13 }}>
        {status.nextStep}
      </p>
    </section>
  );
};
export default SecurityDashboard;
