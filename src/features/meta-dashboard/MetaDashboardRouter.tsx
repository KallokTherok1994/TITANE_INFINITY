/**
 * TITANE∞ v24.2.1 — Meta-Dashboard Router
 *
 * Quick Win: Unified entry point for all monitoring dashboards
 * Timeline: 2-3 hours
 * Impact: +100% UX cohérence sans refonte complète
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useState, useMemo } from 'react';

// Lazy load dashboard components for better performance
const SystemHealthMonitor = React.lazy(() =>
  import('@/components/monitoring/SystemHealthMonitor').then(m => ({
    default: m.SystemHealthMonitor,
  }))
);
const SingularityDashboard = React.lazy(() =>
  import('@/components/monitoring/SingularityDashboard').then(m => ({
    default: m.SingularityDashboard,
  }))
);
const MonitoringDashboard = React.lazy(() => import('@/pages/MonitoringDashboard'));

// Placeholder for missing dashboards
const PlaceholderDashboard = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
    <h2>Dashboard en cours d'implémentation</h2>
    <p>Ce tableau de bord sera intégré prochainement.</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type DashboardView =
  | 'overview' // System health overview
  | 'singularity' // Singularity engine dashboard
  | 'monitoring' // Full monitoring dashboard
  | 'hypervision'; // HyperVision real-time
type DashboardView =
  | 'overview' // System health overview
  | 'singularity' // Singularity engine dashboard
  | 'monitoring' // Full monitoring dashboard
  | 'hypervision' // HyperVision real-time
  | 'performance'; // Performance metrics

interface TabConfig {
  id: DashboardView;
  label: string;
  icon: string;
  description: string;
  component: React.ComponentType;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DASHBOARD_TABS: TabConfig[] = [
  {
    id: 'overview',
    label: 'System Health',
    icon: '🏥',
    description: "Vue d'ensemble santé système",
    component: SystemHealthMonitor,
  },
  {
    id: 'singularity',
    label: 'Singularity',
    icon: '🌌',
    description: 'Dashboard conscience cognitive',
    component: SingularityDashboard,
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: '📊',
    description: 'Monitoring complet services',
    component: MonitoringDashboard,
  },
  {
    id: 'hypervision',
    label: 'HyperVision',
    icon: '🔭',
    description: 'Vision temps réel système',
    component: PlaceholderDashboard,
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: '⚡',
    description: 'Métriques performance détaillées',
    component: PlaceholderDashboard,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const MetaDashboardRouter: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  // Active dashboard component
  const ActiveDashboard = useMemo(() => {
    const config = DASHBOARD_TABS.find(tab => tab.id === activeView);
    return config?.component || SystemHealthMonitor;
  }, [activeView]);

  return (
    <div className="meta-dashboard">
      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <span className="title-icon">📡</span>
            TITANE∞ Monitoring Center
          </h1>
          <div className="dashboard-subtitle">
            Unified monitoring & observability platform
          </div>
        </div>

        <div className="dashboard-tabs">
          {DASHBOARD_TABS.map(tab => (
            <button
              key={tab.id}
              className={`dashboard-tab ${activeView === tab.id ? 'active' : ''}`}
              onClick={() => setActiveView(tab.id)}
              title={tab.description}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Active Dashboard View */}
      <main className="dashboard-content">
        <ActiveDashboard />
      </main>

      <style jsx>{`
        .meta-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0e27 0%, #151b3d 100%);
          color: #f8fafc;
        }

        .dashboard-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 14, 39, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(147, 179, 153, 0.2);
        }

        .dashboard-header {
          padding: 2rem 2rem 1rem;
          text-align: center;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #00d4ff, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .title-icon {
          font-size: 2.5rem;
        }

        .dashboard-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .dashboard-tabs {
          display: flex;
          gap: 0.5rem;
          padding: 0 2rem 1rem;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 179, 153, 0.3) transparent;
        }

        .dashboard-tab {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(21, 27, 61, 0.5);
          border: 1px solid rgba(147, 179, 153, 0.2);
          border-radius: 12px;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dashboard-tab:hover {
          background: rgba(21, 27, 61, 0.8);
          border-color: rgba(0, 212, 255, 0.5);
          color: #f8fafc;
          transform: translateY(-2px);
        }

        .dashboard-tab.active {
          background: linear-gradient(
            135deg,
            rgba(0, 212, 255, 0.2),
            rgba(168, 85, 247, 0.2)
          );
          border-color: #00d4ff;
          color: #f8fafc;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }

        .tab-icon {
          font-size: 1.25rem;
        }

        .tab-label {
          white-space: nowrap;
        }

        .dashboard-content {
          padding: 2rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }

          .dashboard-title {
            font-size: 1.5rem;
          }

          .dashboard-tabs {
            padding: 0 1rem 1rem;
          }

          .dashboard-tab {
            padding: 0.5rem 1rem;
          }

          .tab-label {
            display: none;
          }

          .tab-icon {
            font-size: 1.5rem;
          }

          .dashboard-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default MetaDashboardRouter;

/**
 * Usage:
 *
 * ```tsx
 * // In App.tsx or routing
 * import { MetaDashboardRouter } from '@/features/meta-dashboard';
 *
 * <Route path="/dashboard" element={<MetaDashboardRouter />} />
 * ```
 *
 * Benefits:
 * - ✅ Single entry point (/dashboard)
 * - ✅ Tab-based navigation (UX cohérence)
 * - ✅ No code deletion (safe)
 * - ✅ Progressive enhancement ready
 * - ✅ 2-3 hours implementation
 *
 * Future enhancements:
 * - [ ] URL routing (/dashboard/singularity)
 * - [ ] Keyboard shortcuts (Ctrl+1-5)
 * - [ ] Tab state persistence
 * - [ ] Custom dashboard builder
 */
