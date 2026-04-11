/**
 * TITANE∞ v30.0.0 — System Center Page
 *
 * Page principale du Centre Système unifié avec 5 onglets :
 * - Diagnostics
 * - DevTools
 * - Node Cluster
 * - Introspection
 * - HyperVision
 *
 * v22Ω AI Performance Optimizations Compatible
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { type SystemCenterTab, SYSTEM_CENTER_TABS } from './types/systemCenter.types';
import { DiagnosticsTab } from './tabs/DiagnosticsTab';
import { DevToolsTab } from './tabs/DevToolsTab';
import { NodeClusterTab } from './tabs/NodeClusterTab';
import { IntrospectionTab } from './tabs/IntrospectionTab';
import { HyperVisionTab } from './tabs/HyperVisionTab';
import './SystemCenterPage.css';

// ══════════════════════════════════════════════════════════════════
// TAB CONTENT COMPONENT
// ══════════════════════════════════════════════════════════════════

interface TabContentProps {
  tab: SystemCenterTab;
}

const TabContent: React.FC<TabContentProps> = ({ tab }) => {
  switch (tab) {
    case 'diagnostics':
      return <DiagnosticsTab />;
    case 'devtools':
      return <DevToolsTab />;
    case 'cluster':
      return <NodeClusterTab />;
    case 'introspection':
      return <IntrospectionTab />;
    case 'hypervision':
      return <HyperVisionTab />;
    default:
      return <div className="sc-empty">Onglet non trouvé</div>;
  }
};

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════

const normalizeSystemCenterTab = (value: string | null): SystemCenterTab => {
  switch (value) {
    case 'diagnostics':
    case 'devtools':
    case 'cluster':
    case 'introspection':
    case 'hypervision':
      return value;
    default:
      return 'diagnostics';
  }
};

export const SystemCenterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SystemCenterTab>(() =>
    normalizeSystemCenterTab(searchParams.get('systemTab'))
  );

  useEffect(() => {
    const nextTab = normalizeSystemCenterTab(searchParams.get('systemTab'));
    setActiveTab(currentTab => (currentTab === nextTab ? currentTab : nextTab));
  }, [searchParams]);

  const handleTabChange = useCallback(
    (tab: SystemCenterTab) => {
      setActiveTab(tab);

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('systemTab', tab);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="system-center-page" data-testid="page-system-center">
      {/* Header */}
      <motion.header
        className="sc-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sc-header-title">
          <span className="sc-header-icon">⚙️</span>
          <h1>Centre Système TITANE∞</h1>
        </div>
        <p className="sc-header-subtitle">
          Observabilité, diagnostics et monitoring unifiés
        </p>
      </motion.header>

      {/* Tab Navigation */}
      <nav className="sc-tabs" role="tablist" aria-label="Onglets Centre Système">
        {SYSTEM_CENTER_TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`sc-tabpanel-${tab.id}`}
            id={`sc-tab-${tab.id}`}
            className={`sc-tab ${activeTab === tab.id ? 'sc-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            title={tab.description}
          >
            <span className="sc-tab-icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="sc-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main
        className="sc-content"
        role="tabpanel"
        id={`sc-tabpanel-${activeTab}`}
        aria-labelledby={`sc-tab-${activeTab}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="sc-tab-content"
          >
            <TabContent tab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SystemCenterPage;
