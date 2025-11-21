/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — DEVTOOLS PAGE (FIXED)
 *   Outils développeur avec affichage sécurisé
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useTitaneCore } from '../hooks';
import { extractString } from '../utils/dataUtils';
import './ModulePages.css';

export const DevTools = () => {
  const { systemStatus, error } = useTitaneCore();
  const [logs, setLogs] = useState<string[]>([
    '[INFO] System initialized',
    '[DEBUG] All modules loaded',
    '[INFO] Frontend connected',
  ]);
  const [activeTab, setActiveTab] = useState<'system' | 'logs' | 'performance'>('system');

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [
        ...prev,
        `[DEBUG] System tick at ${new Date().toLocaleTimeString()}`,
      ]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const systemStatusStr = extractString(systemStatus, 'Unknown');
  const errorStr = extractString(error, 'No errors');

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🔧</span>
          DevTools — Outils Développeur
        </h1>
        <p className="module-page__subtitle">Monitoring avancé et débogage</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Logs Système"
          icon="📋"
          value={logs.length}
          subtitle="Entrées totales"
          variant="primary"
        />

        <ModuleCard
          title="État Système"
          icon="💻"
          status={systemStatusStr}
          subtitle="Statut global"
          variant="success"
        />

        <ModuleCard
          title="Erreurs"
          icon="⚠️"
          status={errorStr}
          subtitle="Dernière erreur détectée"
          variant={error ? 'error' : 'success'}
        />
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        {(['system', 'logs', 'performance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab ? 'rgba(102,126,234,0.2)' : 'transparent',
              border: activeTab === tab ? '1px solid rgba(102,126,234,0.5)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: activeTab === tab ? '#667eea' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {tab === 'system' ? 'Système' : tab === 'logs' ? 'Logs' : 'Performance'}
          </button>
        ))}
      </div>

      {activeTab === 'system' && (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white', fontSize: '1rem', fontWeight: 600 }}>État du Système</h3>
          <pre style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', color: '#a5f3fc', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {typeof systemStatus === 'object' ? JSON.stringify(systemStatus, null, 2) : String(systemStatus)}
          </pre>
          {error && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.9rem' }}>
              ⚠️ {String(error)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white', fontSize: '1rem', fontWeight: 600 }}>Logs Système ({logs.length})</h3>
          <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {logs.map((log, i) => (
              <div
                key={i}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: log.includes('[ERROR]') ? 'rgba(239,68,68,0.1)' : log.includes('[WARN]') ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  color: log.includes('[ERROR]') ? '#f87171' : log.includes('[WARN]') ? '#fbbf24' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white', fontSize: '1rem', fontWeight: 600 }}>Métriques de Performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '0.5rem' }}>CPU Usage</div>
              <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>12%</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ color: '#3b82f6', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Memory Usage</div>
              <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>256 MB</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div style={{ color: '#a855f7', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Uptime</div>
              <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>2h 34m</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
