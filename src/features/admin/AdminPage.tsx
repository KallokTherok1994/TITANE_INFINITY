/**
 * TITANE∞ v30.0.0 — Admin Center Page
 *
 * 🎯 MODULE ADMIN UNIFIÉ - Fusion de 5 modules:
 *   1. Centre Système (⚙️)
 *   2. Configuration HUB (🎛️)
 *   3. Audio & Voix (🔊)
 *   4. Design / Gesign (🎨)
 *   5. Gouvernance (🛡️)
 *
 * Architecture: Système à onglets avec sous-composants chargés dynamiquement
 * Performance: Lazy loading + ErrorBoundary + Optimisations v22Ω
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useState, useCallback, useEffect, lazy, Suspense, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { type AdminTab, ADMIN_TABS } from './types';
import './AdminPage.css';
import { SurfaceTruthBadge } from '@/components/system/SurfaceTruthBadge';
import { safeInvokeCanonical } from '@/utils/invoke';

// ══════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS - Performance Constants
// ══════════════════════════════════════════════════════════════════

const contentVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const headerVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const APP_RUNTIME_VERSION = __APP_VERSION__;

// ══════════════════════════════════════════════════════════════════
// LAZY IMPORTS - Performance Optimization
// ══════════════════════════════════════════════════════════════════

const SystemCenterPage = lazy(async () => {
  const m = await import('../system-center/SystemCenterPage');
  if (!m.SystemCenterPage) {
    throw new Error('[ADMIN_IMPORT] Export SystemCenterPage manquant');
  }
  return { default: m.SystemCenterPage };
});

const ConfigurationHub = lazy(() =>
  import('../../pages/ConfigurationHub').then(m => ({ default: m.ConfigurationHub }))
);

const AudioCenterPage = lazy(() =>
  import('../audio-center').then(m => ({ default: m.AudioCenterPage }))
);

const DesignCenterPage = lazy(() =>
  import('../design-center').then(m => ({ default: m.DesignCenterPage }))
);

const GovernanceCenterPage = lazy(async () => {
  const m = await import('../governance-center/GovernanceCenterPage');
  if (!m.GovernanceCenterPage) {
    throw new Error('[ADMIN_IMPORT] Export GovernanceCenterPage manquant');
  }
  return { default: m.GovernanceCenterPage };
});

const SelfHealingDashboard = lazy(async () => {
  const m = await import('../../ui/pages/SelfHealingDashboard');
  if (!m.SelfHealingDashboard) {
    throw new Error('[ADMIN_IMPORT] Export SelfHealingDashboard manquant');
  }
  return { default: m.SelfHealingDashboard };
});

const ProductionHealthPanel = lazy(async () => {
  const m = await import('../production-health/ProductionHealthPanel');
  if (!m.ProductionHealthPanel) {
    throw new Error('[ADMIN_IMPORT] Export ProductionHealthPanel manquant');
  }
  return { default: m.ProductionHealthPanel };
});

const RemoteKeyDashboard = lazy(() =>
  import('../../components/RemoteKeyDashboard').then(m => ({ default: m.default }))
);

// ══════════════════════════════════════════════════════════════════
// LOADING SPINNER
// ══════════════════════════════════════════════════════════════════

const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Chargement...',
}) => (
  <div className="admin-loading">
    <div className="admin-loading-spinner">⚡</div>
    <p className="admin-loading-text">{message}</p>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// TAB CONTENT COMPONENT
// ══════════════════════════════════════════════════════════════════

interface TabContentProps {
  tab: AdminTab;
}

const TabContent: React.FC<TabContentProps> = ({ tab }) => {
  switch (tab) {
    case 'system':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Centre Système..." />}>
          <ErrorBoundary context="AdminSystemCenter">
            <SystemCenterPage />
          </ErrorBoundary>
        </Suspense>
      );

    case 'config':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Configuration..." />}>
          <ErrorBoundary context="AdminConfigHub">
            <ConfigurationHub />
          </ErrorBoundary>
        </Suspense>
      );

    case 'audio':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Audio & Voix..." />}>
          <ErrorBoundary context="AdminAudioCenter">
            <AudioCenterPage />
          </ErrorBoundary>
        </Suspense>
      );

    case 'design':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Design..." />}>
          <ErrorBoundary context="AdminDesignCenter">
            <DesignCenterPage />
          </ErrorBoundary>
        </Suspense>
      );

    case 'governance':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Gouvernance..." />}>
          <ErrorBoundary context="AdminGovernanceCenter">
            <GovernanceCenterPage />
          </ErrorBoundary>
        </Suspense>
      );

    case 'anti-regression':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Anti-Régression..." />}>
          <ErrorBoundary context="AdminAntiRegressionCenter">
            <SelfHealingDashboard />
          </ErrorBoundary>
        </Suspense>
      );

    case 'production-health':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Santé Production..." />}>
          <ErrorBoundary context="AdminProductionHealth">
            <ProductionHealthPanel />
          </ErrorBoundary>
        </Suspense>
      );

    case 'remote-keys':
      return (
        <Suspense fallback={<LoadingSpinner message="Chargement Clés Remote..." />}>
          <ErrorBoundary context="AdminRemoteKeys">
            <RemoteKeyDashboard />
          </ErrorBoundary>
        </Suspense>
      );

    default:
      return <div className="admin-empty">Onglet non trouvé</div>;
  }
};

// ══════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════

const AdminPageComponent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const requestedTab = searchParams.get('tab');
    return ADMIN_TABS.some(tab => tab.id === requestedTab)
      ? (requestedTab as AdminTab)
      : 'system';
  });

  const handleTabChange = useCallback(
    (tab: AdminTab) => {
      setActiveTab(tab);
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          next.set('tab', tab);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleTabListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tabIds = ADMIN_TABS.map(t => t.id);
      const currentIndex = tabIds.indexOf(activeTab);
      const navigate = (targetId: AdminTab | undefined) => {
        if (!targetId) return;
        handleTabChange(targetId);
        document.getElementById(`admin-tab-${targetId}`)?.focus();
      };
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(tabIds[(currentIndex + 1) % tabIds.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(tabIds[(currentIndex - 1 + tabIds.length) % tabIds.length]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigate(tabIds[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigate(tabIds[tabIds.length - 1]);
      }
    },
    [activeTab, handleTabChange]
  );

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (ADMIN_TABS.some(tab => tab.id === requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab as AdminTab);
    }
  }, [activeTab, searchParams]);

  // Runtime truth probe — quick_health_check (60s)
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const r = await safeInvokeCanonical<string>('quick_health_check');
      if (cancelled) return;
      if (r.ok && r.content) {
        setHealthStatus(r.content);
        setHealthError(false);
      } else {
        setHealthStatus(null);
        setHealthError(true);
      }
    };
    void probe();
    const id = setInterval(() => void probe(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const adminBadgeVariant: 'LIVE' | 'PARTIAL' | 'DEGRADED' =
    healthStatus === 'Healthy'
      ? 'LIVE'
      : healthError || healthStatus === 'Critical' || healthStatus === 'Offline'
        ? 'DEGRADED'
        : 'PARTIAL';

  return (
    <div className="admin-page" data-testid="page-admin">
      {/* Runtime Truth Badge — DYNAMIC via quick_health_check */}
      <SurfaceTruthBadge variant={adminBadgeVariant} className="mb-4" />
      {/* Header */}
      <motion.header
        className="admin-header"
        variants={headerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <div className="admin-header-content">
          <div className="admin-header-title">
            <span className="admin-header-icon" aria-hidden="true">
              👑
            </span>
            <div>
              <h1>ADMIN</h1>
              <p className="admin-header-subtitle">
                Centre d&apos;Administration TITANE∞ — Système, Config, Audio, Design,
                Gouvernance
              </p>
            </div>
          </div>
          <div className="admin-header-badge">
            <span className="admin-version">v{APP_RUNTIME_VERSION}</span>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <nav
        className="admin-tabs"
        role="tablist"
        aria-label="Onglets Administration"
        onKeyDown={handleTabListKeyDown}
      >
        {ADMIN_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`admin-tabpanel-${tab.id}`}
              id={`admin-tab-${tab.id}`}
              data-testid={`tab-admin-${tab.id}`}
              className={`admin-tab ${isActive ? 'admin-tab--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              tabIndex={isActive ? 0 : -1}
              title={tab.description}
            >
              <span className="admin-tab-icon" aria-hidden="true">
                {tab.icon}
              </span>
              <div className="admin-tab-content">
                <span className="admin-tab-label">{tab.label}</span>
                {tab.badge && (
                  <span className="admin-tab-badge" aria-hidden="true">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <main
        className="admin-content"
        data-testid="page-admin-content"
        role="tabpanel"
        id={`admin-tabpanel-${activeTab}`}
        aria-labelledby={`admin-tab-${activeTab}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="admin-content-wrapper"
            role="tabpanel"
            id={`admin-tabpanel-${activeTab}`}
            aria-labelledby={`admin-tab-${activeTab}`}
          >
            <TabContent tab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Memoization pour optimiser les re-renders
export const AdminPage = memo(AdminPageComponent);
AdminPage.displayName = 'AdminPage';

export default AdminPage;
