import React, { useEffect, useState } from 'react';
import {
  acknowledgeSecurityDashboardEvent,
  exportSecurityContainmentCorrelations,
  getGovernedSecurityAuditSnapshot,
  getLastSecurityContainmentCorrelationExport,
  getSecurityActiveAgentStatus,
  getSecurityDashboardRefreshIntervalMs,
  type SecurityAuditSeverityFilter,
} from './index';

const SecurityDashboard: React.FC = () => {
  const [severityFilter, setSeverityFilter] =
    useState<SecurityAuditSeverityFilter>('all');
  const [status, setStatus] = useState(() => getSecurityActiveAgentStatus('all'));
  const [exportPayload, setExportPayload] = useState(() =>
    getLastSecurityContainmentCorrelationExport()
  );
  const detailSections = status.detailSections ?? [];

  useEffect(() => {
    const refresh = async () => {
      const snapshot = await getGovernedSecurityAuditSnapshot(severityFilter);
      setStatus(snapshot.status);
      setExportPayload(snapshot.exportPayload);
    };

    void refresh();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, getSecurityDashboardRefreshIntervalMs());

    return () => {
      window.clearInterval(intervalId);
    };
  }, [severityFilter]);

  const acknowledgeEvent = (eventId: string) => {
    acknowledgeSecurityDashboardEvent(eventId);
    setStatus(getSecurityActiveAgentStatus(severityFilter));
    void getGovernedSecurityAuditSnapshot(severityFilter).then(snapshot => {
      setStatus(snapshot.status);
      setExportPayload(snapshot.exportPayload);
    });
  };

  const setFilter = (nextFilter: SecurityAuditSeverityFilter) => {
    setSeverityFilter(nextFilter);
    setStatus(getSecurityActiveAgentStatus(nextFilter));
    void getGovernedSecurityAuditSnapshot(nextFilter).then(snapshot => {
      setStatus(snapshot.status);
      setExportPayload(snapshot.exportPayload);
    });
  };

  const exportCorrelations = async () => {
    const payload = await exportSecurityContainmentCorrelations(severityFilter);
    const snapshot = await getGovernedSecurityAuditSnapshot(severityFilter);
    setStatus(snapshot.status);
    setExportPayload(snapshot.exportPayload ?? payload);
  };

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
      <p
        data-testid="security-dashboard-refresh"
        style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.8 }}
      >
        Refresh borne: {Math.round(getSecurityDashboardRefreshIntervalMs() / 1000)}s
      </p>
      <div
        data-testid="security-dashboard-severity-filters"
        style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '0 0 8px' }}
      >
        {(['all', 'critical', 'warning', 'info'] as const).map(filter => (
          <button
            key={filter}
            type="button"
            data-testid={`security-dashboard-filter-${filter}`}
            data-active={severityFilter === filter ? 'yes' : 'no'}
            onClick={() => setFilter(filter)}
            style={{ fontSize: 12, padding: '2px 8px' }}
          >
            {filter}
          </button>
        ))}
      </div>
      <p
        data-testid="security-dashboard-severity-filter-summary"
        style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.8 }}
      >
        Filtre severite actif: {severityFilter}
      </p>
      <ul
        data-testid="security-dashboard-proof-list"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.evidence.map((item, index) => (
          <li key={item} data-testid={`security-dashboard-proof-${index}`}>
            {item}
          </li>
        ))}
      </ul>
      <ul
        data-testid="security-dashboard-blockers"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
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
                key={`${section.key}-${item.id}`}
                data-testid={`security-dashboard-${section.key}-${index}`}
                data-acknowledged={item.acknowledged ? 'yes' : 'no'}
              >
                <span>{item.label}</span>
                {(section.key === 'detection-events' ||
                  section.key === 'containment-events') &&
                !item.acknowledged ? (
                  <button
                    type="button"
                    data-testid={`security-dashboard-ack-${section.key}-${index}`}
                    onClick={() => acknowledgeEvent(item.id)}
                    style={{ marginLeft: 8, fontSize: 12 }}
                  >
                    Ack
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div data-testid="security-dashboard-export-controls" style={{ margin: '0 0 8px' }}>
        <button
          type="button"
          data-testid="security-dashboard-export-correlations"
          onClick={() => {
            void exportCorrelations();
          }}
          style={{ fontSize: 12, padding: '2px 8px' }}
        >
          Exporter correlations confinement
        </button>
      </div>
      <pre
        data-testid="security-dashboard-containment-correlation-export"
        style={{
          margin: '0 0 8px',
          whiteSpace: 'pre-wrap',
          fontSize: 11,
          maxHeight: 160,
          overflow: 'auto',
        }}
      >
        {exportPayload ??
          'Aucun export de correlation n a encore ete genere sur cette surface.'}
      </pre>
      <p data-testid="security-dashboard-next-step" style={{ margin: 0, fontSize: 13 }}>
        {status.nextStep}
      </p>
    </section>
  );
};
export default SecurityDashboard;
