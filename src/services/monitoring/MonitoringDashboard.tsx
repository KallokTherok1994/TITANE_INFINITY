import React, { useEffect, useState } from 'react';
import { useAgentLiveSnapshot } from '@/hooks/useAgentLiveSnapshot';
import { getMonitoringAgentStatus, getProjectHealthMetrics } from './index';
import type { ProjectHealthMetrics } from './index';

export const MONITORING_DASHBOARD_REFRESH_INTERVAL_MS = 60_000;

function formatMonitoringClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const MonitoringDashboard: React.FC = () => {
  const { data: status, lastUpdate, refresh } = useAgentLiveSnapshot(
    getMonitoringAgentStatus,
    MONITORING_DASHBOARD_REFRESH_INTERVAL_MS,
  );
  const [health, setHealth] = useState<ProjectHealthMetrics | null>(null);

  useEffect(() => {
    getProjectHealthMetrics()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

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
      <div
        data-testid="monitoring-dashboard-live"
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
          data-testid="monitoring-dashboard-live-dot"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 6px rgba(52, 211, 153, 0.6)',
          }}
        />
        <span data-testid="monitoring-dashboard-live-label">
          Live - maj {formatMonitoringClock(lastUpdate)} - refresh{' '}
          {Math.round(MONITORING_DASHBOARD_REFRESH_INTERVAL_MS / 1000)}s
        </span>
        <button
          type="button"
          data-testid="monitoring-dashboard-refresh-now"
          onClick={refresh}
          style={{ fontSize: 11, padding: '1px 6px', marginLeft: 6 }}
        >
          Rafraichir
        </button>
      </div>
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
      {health && (
        <section
          data-testid="monitoring-dashboard-health-metrics"
          style={{
            marginTop: 10,
            borderTop: '1px solid rgba(148,163,184,0.2)',
            paddingTop: 8,
          }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.7 }}>
            Métriques IPC projet
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
            <li data-testid="monitoring-dashboard-health-recurrence">
              {`Récurrence incidents : ${(health.incidentRecurrenceRate * 100).toFixed(1)}%`}
            </li>
            <li data-testid="monitoring-dashboard-health-ring">
              {`Ring le plus impacté : ${health.mostImpactedRing}`}
            </li>
            <li data-testid="monitoring-dashboard-health-leadtime">
              {`Lead time moyen : ${health.avgLeadTimeMinutes.toFixed(1)} min`}
            </li>
            <li
              data-testid="monitoring-dashboard-health-evidence-note"
              style={{ opacity: 0.7, fontStyle: 'italic' }}
            >
              {health.evidenceNote}
            </li>
          </ul>
        </section>
      )}
    </section>
  );
};
export default React.memo(MonitoringDashboard);
