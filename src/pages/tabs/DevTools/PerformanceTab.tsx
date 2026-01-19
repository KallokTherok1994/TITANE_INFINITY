/**
 * TITANE∞ v25.7.5 — Performance Tab
 */

import { LazyCognitiveModuleCard } from '../../DevToolsLazy';
import type { LivingEnginesState } from '../../../hooks/useLivingEngines';

type LivingEngines = { state: LivingEnginesState };

interface PerformanceTabProps {
  livingEngines: LivingEngines;
  moduleMetrics: Record<
    string,
    { value: number; label: string; status: 'stable' | 'active' | 'critical' }
  >;
}

const PerformanceTab = ({ livingEngines, moduleMetrics }: PerformanceTabProps) => {
  return (
    <div className="devtools-tab-performance">
      <div className="devtools-panel__content">
        <div className="devtools-panel__header">
          <h3 className="devtools-panel__title">Métriques Performance</h3>
        </div>

        <div
          className="devtools-metrics-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginTop: '16px',
          }}
        >
          <div
            className="metric-card"
            style={{
              background: '#10151c',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #1f2933',
            }}
          >
            <div
              className="metric-label"
              style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '8px' }}
            >
              Cognitive Load
            </div>
            <div
              className="metric-value"
              style={{ color: '#e2e8f0', fontSize: '2rem', fontWeight: 'bold' }}
            >
              {Math.round(livingEngines.state.cognitiveLoad * 100)}%
            </div>
          </div>

          <div
            className="metric-card"
            style={{
              background: '#10151c',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #1f2933',
            }}
          >
            <div
              className="metric-label"
              style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '8px' }}
            >
              Active Threads
            </div>
            <div
              className="metric-value"
              style={{ color: '#e2e8f0', fontSize: '2rem', fontWeight: 'bold' }}
            >
              {livingEngines.state.activeThreads || 0}
            </div>
          </div>

          <div
            className="metric-card"
            style={{
              background: '#10151c',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #1f2933',
            }}
          >
            <div
              className="metric-label"
              style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '8px' }}
            >
              System Rhythm
            </div>
            <div
              className="metric-value"
              style={{ color: '#e2e8f0', fontSize: '2rem', fontWeight: 'bold' }}
            >
              {Math.round(livingEngines.state.rhythmScore * 100)}%
            </div>
          </div>

          <div
            className="metric-card"
            style={{
              background: '#10151c',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #1f2933',
            }}
          >
            <div
              className="metric-label"
              style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '8px' }}
            >
              Glow Intensity
            </div>
            <div
              className="metric-value"
              style={{ color: '#e2e8f0', fontSize: '2rem', fontWeight: 'bold' }}
            >
              {Math.round((livingEngines.state.glow - 0.5) * 100 + 50)}%
            </div>
          </div>
        </div>

        {/* Modules Performance */}
        <div
          className="devtools-grid devtools-grid--modules"
          style={{ marginTop: '24px' }}
        >
          {Object.entries(moduleMetrics).map(([key, metric]) => (
            <LazyCognitiveModuleCard
              key={key}
              module={key as 'helios' | 'nexus' | 'harmonia' | 'memory'}
              value={metric.value}
              label={metric.label}
              status={metric.status}
              subtitle={`${metric.value}% utilisation`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;
