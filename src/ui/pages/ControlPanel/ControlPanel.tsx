/**
 * TITANE∞ OS v24.7 - Control Panel Principal
 * Interface de configuration système avancée
 * Optimisé avec lazy loading pour réduire le bundle initial
 *
 * @module ControlPanel
 * @version v24.7.0
 */

import React, { useState, useEffect, lazy, Suspense, useCallback, memo } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
import { SystemInfo } from '../../../types/tauri';
import { ControlPanelLayout } from './components/ControlPanelLayout';
import './ControlPanel.css';

export type { ControlPanelSection } from './types';
import type { ControlPanelSection } from './types';

// ═══════════════════════════════════════════════════════════════════
// Lazy Loading des sections (réduit bundle initial de ~50KB)
// ═══════════════════════════════════════════════════════════════════

const SystemSection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/SystemSection').then(m => ({
    default: m.SystemSection,
  }))
);
const AppearanceSection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/AppearanceSection').then(m => ({
    default: m.AppearanceSection,
  }))
);
const SingularitySection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/SingularitySection').then(m => ({
    default: m.SingularitySection,
  }))
);
const AISection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/AISection').then(m => ({
    default: m.AISection,
  }))
);
const MemorySection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/MemorySection').then(m => ({
    default: m.MemorySection,
  }))
);
const ModulesSection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/ModulesSection').then(m => ({
    default: m.ModulesSection,
  }))
);
const NetworkSection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/NetworkSection').then(m => ({
    default: m.NetworkSection,
  }))
);
const UpdatesSection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/UpdatesSection').then(m => ({
    default: m.UpdatesSection,
  }))
);
const LogsSection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/LogsSection').then(m => ({
    default: m.LogsSection,
  }))
);
const SecuritySection = lazy(() =>
  import('@/ui/pages/ControlPanel/sections/SecuritySection').then(m => ({
    default: m.SecuritySection,
  }))
);

// ═══════════════════════════════════════════════════════════════════
// Composant de chargement
// ═══════════════════════════════════════════════════════════════════

const SectionLoader = memo(function SectionLoader() {
  return (
    <div className="cp-loading">
      <div className="cp-spinner" />
      <p>Chargement de la section...</p>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// Composant Principal
// ═══════════════════════════════════════════════════════════════════

export const ControlPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ControlPanelSection>('system');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSystemInfo = useCallback(async () => {
    try {
      const info = (await tauriClient.getSystemInfo()) as SystemInfo;
      setSystemInfo(info);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement system info:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystemInfo();
    const interval = setInterval(loadSystemInfo, REFRESH_INTERVALS.NORMAL);
    return () => clearInterval(interval);
  }, [loadSystemInfo]);

  const renderSection = useCallback(() => {
    if (loading && activeSection === 'system') {
      return (
        <div className="cp-loading">
          <div className="cp-spinner" />
          <p>Chargement...</p>
        </div>
      );
    }

    // Mapping des sections vers les composants lazy-loaded
    const sectionComponents: Record<ControlPanelSection, JSX.Element | null> = {
      system: systemInfo ? (
        <SystemSection systemInfo={systemInfo} onRefresh={loadSystemInfo} />
      ) : null,
      appearance: <AppearanceSection />,
      singularity: <SingularitySection />,
      ai: <AISection />,
      memory: <MemorySection />,
      modules: <ModulesSection />,
      network: <NetworkSection />,
      updates: <UpdatesSection />,
      logs: <LogsSection />,
      security: <SecuritySection />,
    };

    return sectionComponents[activeSection] ?? sectionComponents.system;
  }, [activeSection, loading, systemInfo, loadSystemInfo]);

  return (
    <ControlPanelLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      systemInfo={systemInfo || null}
    >
      <div className="cp-content">
        <Suspense fallback={<SectionLoader />}>{renderSection()}</Suspense>
      </div>
    </ControlPanelLayout>
  );
};

export default ControlPanel;
