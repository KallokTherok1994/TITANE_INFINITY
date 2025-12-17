/**
 * TITANE∞ v25.7.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   DEVTOOLS TAB SYSTEM — P1-B Performance Optimization
 *   Tab-based conditional rendering with lazy loading
 *   Impact: Monitoring chunk split into per-tab chunks (-100 KB)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { lazy, Suspense } from 'react';
import type { SystemStatus } from '../components/monitoring/SystemStatusCard';

// Lazy load tabs (only loaded when active)
// Magic comments force Vite to create separate chunks
const SystemTab = lazy(
  () => import(/* webpackChunkName: "devtools-system" */ './tabs/DevTools/SystemTab')
);
const LogsTab = lazy(
  () => import(/* webpackChunkName: "devtools-logs" */ './tabs/DevTools/LogsTab')
);
const PerformanceTab = lazy(
  () =>
    import(
      /* webpackChunkName: "devtools-performance" */ './tabs/DevTools/PerformanceTab'
    )
);
const DiagnosticTab = lazy(
  () =>
    import(/* webpackChunkName: "devtools-diagnostic" */ './tabs/DevTools/DiagnosticTab')
);

export type DevToolsTab = 'system' | 'logs' | 'performance' | 'diagnostic';

interface DevToolsTabsProps {
  activeTab: DevToolsTab;
  systemStatus: SystemStatus;
  logs: string[];
  livingEngines: ReturnType<typeof import('../hooks/useLivingEngines').useLivingEngines>;
  moduleMetrics: Record<
    string,
    { value: number; label: string; status: 'stable' | 'active' | 'critical' }
  >;
  errorCount: number;
}

/**
 * Loading fallback for lazy tabs
 */
const TabLoading = ({ tabName }: { tabName: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      background: '#10151c',
      borderRadius: '16px',
      border: '1px solid #1f2933',
      color: '#94a3b8',
      fontSize: '0.95rem',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
      Chargement {tabName}...
    </div>
  </div>
);

/**
 * DevTools Tab System with lazy loading
 */
export const DevToolsTabs = ({
  activeTab,
  systemStatus,
  logs,
  livingEngines,
  moduleMetrics,
  errorCount,
}: DevToolsTabsProps) => {
  return (
    <div className="devtools-tabs-content">
      <Suspense fallback={<TabLoading tabName="System" />}>
        {activeTab === 'system' && (
          <SystemTab
            systemStatus={systemStatus}
            livingEngines={livingEngines}
            moduleMetrics={moduleMetrics}
            errorCount={errorCount}
          />
        )}
      </Suspense>

      <Suspense fallback={<TabLoading tabName="Logs" />}>
        {activeTab === 'logs' && <LogsTab logs={logs} errorCount={errorCount} />}
      </Suspense>

      <Suspense fallback={<TabLoading tabName="Performance" />}>
        {activeTab === 'performance' && (
          <PerformanceTab livingEngines={livingEngines} moduleMetrics={moduleMetrics} />
        )}
      </Suspense>

      <Suspense fallback={<TabLoading tabName="Diagnostic" />}>
        {activeTab === 'diagnostic' && <DiagnosticTab />}
      </Suspense>
    </div>
  );
};
