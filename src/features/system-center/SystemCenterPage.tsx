/**
 * TITANE∞ v∞ — System Center Page
 *
 * Page principale du Centre Système unifié avec 5 onglets :
 * - Diagnostics
 * - DevTools
 * - Node Cluster
 * - Introspection
 * - HyperVision
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export const SystemCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SystemCenterTab>('diagnostics');

  const handleTabChange = useCallback((tab: SystemCenterTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="system-center-page">
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
      <nav className="sc-tabs">
        {SYSTEM_CENTER_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sc-tab ${activeTab === tab.id ? 'sc-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            title={tab.description}
          >
            <span className="sc-tab-icon">{tab.icon}</span>
            <span className="sc-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="sc-content">
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
