/**
 * TITANE∞ v25.2.2 — Admin Center Page
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

import React, { useState, useCallback, lazy, Suspense, memo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { type AdminTab, ADMIN_TABS } from './types';
import './AdminPage.css';

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

// ══════════════════════════════════════════════════════════════════
// LAZY IMPORTS - Performance Optimization
// ══════════════════════════════════════════════════════════════════

const SystemCenterPage = lazy(() =>
  import('../system-center').then(m => ({ default: m.SystemCenterPage }))
);

const ConfigurationHub = lazy(() =>
  import('../../pages/ConfigurationHub').then(m => ({ default: m.ConfigurationHub }))
);

const AudioCenterPage = lazy(() =>
  import('../audio-center').then(m => ({ default: m.AudioCenterPage }))
);

const DesignCenterPage = lazy(() =>
  import('../design-center').then(m => ({ default: m.DesignCenterPage }))
);

const GovernanceCenterPage = lazy(() =>
  import('../governance-center').then(m => ({ default: m.GovernanceCenterPage }))
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

    default:
      return <div className="admin-empty">Onglet non trouvé</div>;
  }
};

// ══════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════

const AdminPageComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('system');

  const handleTabChange = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="admin-page">
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
            <span className="admin-header-icon">👑</span>
            <div>
              <h1>ADMIN</h1>
              <p className="admin-header-subtitle">
                Centre d'Administration TITANE∞ — Système, Config, Audio, Design,
                Gouvernance
              </p>
            </div>
          </div>
          <div className="admin-header-badge">
            <span className="admin-version">v25.2.2</span>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <nav className="admin-tabs">
        {ADMIN_TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'admin-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            title={tab.description}
          >
            <span className="admin-tab-icon">{tab.icon}</span>
            <div className="admin-tab-content">
              <span className="admin-tab-label">{tab.label}</span>
              {tab.badge && <span className="admin-tab-badge">{tab.badge}</span>}
            </div>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="admin-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="admin-content-wrapper"
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
