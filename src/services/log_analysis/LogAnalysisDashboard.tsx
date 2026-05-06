import React, { useEffect, useMemo, useState } from 'react';
import {
  getLogAnalysisAgentStatus,
  getLogAnalysisReportMarkdown,
  getLogAnalysisSnapshot,
  runLogAnalysisScan,
} from './index';

const REFRESH_INTERVAL_MS = 60_000;

const LogAnalysisDashboard: React.FC = () => {
  const [status, setStatus] = useState(() => getLogAnalysisAgentStatus());
  const [snapshot, setSnapshot] = useState(() => getLogAnalysisSnapshot());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await runLogAnalysisScan();
    } finally {
      setSnapshot(getLogAnalysisSnapshot());
      setStatus(getLogAnalysisAgentStatus());
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const markdownPreview = useMemo(() => {
    if (!snapshot.report) {
      return 'Aucun rapport disponible.';
    }
    return getLogAnalysisReportMarkdown(snapshot.report)
      .split('\n')
      .slice(0, 8)
      .join('\n');
  }, [snapshot.report]);

  return (
    <section
      data-testid="log-analysis-dashboard"
      data-readiness={status.readiness}
      style={{
        background: '#1f2937',
        color: '#e5e7eb',
        padding: 12,
        margin: 4,
        borderRadius: 10,
        border: '1px solid rgba(156, 163, 175, 0.35)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Agent avance</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{status.title}</h2>
        </div>
        <strong data-testid="log-analysis-dashboard-status">
          {status.readinessLabel}
        </strong>
      </header>

      <p data-testid="log-analysis-dashboard-summary" style={{ marginBottom: 10 }}>
        {status.summary}
      </p>

      <p data-testid="log-analysis-dashboard-service-state" style={{ margin: '0 0 8px' }}>
        {status.serviceState}
      </p>

      <button
        type="button"
        data-testid="log-analysis-dashboard-refresh"
        onClick={() => {
          void refresh();
        }}
        disabled={isRefreshing}
        style={{
          marginBottom: 8,
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid rgba(156, 163, 175, 0.35)',
          background: isRefreshing ? '#374151' : '#111827',
          color: '#e5e7eb',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
        }}
      >
        {isRefreshing ? 'Analyse en cours...' : 'Analyser maintenant'}
      </button>

      <ul
        data-testid="log-analysis-dashboard-proof-list"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.evidence.map((item, index) => (
          <li key={item} data-testid={`log-analysis-dashboard-proof-${index}`}>
            {item}
          </li>
        ))}
      </ul>

      <ul
        data-testid="log-analysis-dashboard-blockers"
        style={{ margin: '0 0 8px', paddingLeft: 18 }}
      >
        {status.blockers.map(blocker => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>

      <p
        data-testid="log-analysis-dashboard-next-step"
        style={{ margin: '0 0 10px', fontSize: 13 }}
      >
        {status.nextStep}
      </p>

      <section
        data-testid="log-analysis-dashboard-report"
        style={{
          marginTop: 8,
          borderTop: '1px solid rgba(156,163,175,0.3)',
          paddingTop: 8,
        }}
      >
        <p
          data-testid="log-analysis-dashboard-freshness"
          style={{ margin: '0 0 6px', fontSize: 12 }}
        >
          {snapshot.report
            ? `Fraicheur du rapport: ${snapshot.freshnessSeconds ?? 0}s (source=${snapshot.source})`
            : 'Rapport non disponible'}
        </p>

        <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.8 }}>
          Aperçu rapport intelligent
        </p>
        <pre
          data-testid="log-analysis-dashboard-markdown-preview"
          style={{
            margin: 0,
            padding: 8,
            borderRadius: 6,
            background: '#111827',
            color: '#d1d5db',
            fontSize: 11,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {markdownPreview}
        </pre>

        {snapshot.report && (
          <>
            <ul
              data-testid="log-analysis-dashboard-anomalies"
              style={{ margin: '8px 0 0', paddingLeft: 18 }}
            >
              {snapshot.report.anomalies.length === 0 ? (
                <li>Aucune anomalie détectée.</li>
              ) : (
                snapshot.report.anomalies.map(entry => (
                  <li
                    key={entry.id}
                  >{`[${entry.severity.toUpperCase()}] ${entry.source} · ${entry.message}`}</li>
                ))
              )}
            </ul>

            <ul
              data-testid="log-analysis-dashboard-inconsistencies"
              style={{ margin: '8px 0 0', paddingLeft: 18 }}
            >
              {snapshot.report.inconsistencies.length === 0 ? (
                <li>Aucune incohérence détectée.</li>
              ) : (
                snapshot.report.inconsistencies.map(item => <li key={item}>{item}</li>)
              )}
            </ul>

            <ul
              data-testid="log-analysis-dashboard-improvements"
              style={{ margin: '8px 0 0', paddingLeft: 18 }}
            >
              {snapshot.report.improvementOpportunities.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </section>
  );
};

export default LogAnalysisDashboard;
