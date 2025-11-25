/**
 * TITANE∞ OS - Control Panel Principal
 * Interface de configuration système avancée
 *
 * @module ControlPanel
 * @version v19.1.0
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { ControlPanelLayout } from './components/ControlPanelLayout';
import { SystemSection } from './sections/SystemSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { SingularitySection } from './sections/SingularitySection';
import { AISection } from './sections/AISection';
import { MemorySection } from './sections/MemorySection';
import { ModulesSection } from './sections/ModulesSection';
import { NetworkSection } from './sections/NetworkSection';
import { UpdatesSection } from './sections/UpdatesSection';
import { LogsSection } from './sections/LogsSection';
import { SecuritySection } from './sections/SecuritySection';
import './ControlPanel.css';

export type ControlPanelSection =
  | 'system'
  | 'appearance'
  | 'singularity'
  | 'ai'
  | 'memory'
  | 'modules'
  | 'network'
  | 'updates'
  | 'logs'
  | 'security';

interface SystemInfo {
  version: string;
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  singularity_active: boolean;
}

export const ControlPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ControlPanelSection>('system');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemInfo();
    const interval = setInterval(loadSystemInfo, 5000); // Refresh toutes les 5s
    return () => clearInterval(interval);
  }, []);

  const loadSystemInfo = async () => {
    try {
      const info = await invoke<SystemInfo>('get_system_info');
      setSystemInfo(info);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement system info:', error);
      setLoading(false);
    }
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className="cp-loading">
          <div className="cp-spinner" />
          <p>Chargement...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'system':
        return <SystemSection systemInfo={systemInfo} onRefresh={loadSystemInfo} />;
      case 'appearance':
        return <AppearanceSection />;
      case 'singularity':
        return <SingularitySection />;
      case 'ai':
        return <AISection />;
      case 'memory':
        return <MemorySection />;
      case 'modules':
        return <ModulesSection />;
      case 'network':
        return <NetworkSection />;
      case 'updates':
        return <UpdatesSection />;
      case 'logs':
        return <LogsSection />;
      case 'security':
        return <SecuritySection />;
      default:
        return <SystemSection systemInfo={systemInfo} onRefresh={loadSystemInfo} />;
    }
  };

  return (
    <ControlPanelLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      systemInfo={systemInfo}
    >
      <div className="cp-content">
        {renderSection()}
      </div>
    </ControlPanelLayout>
  );
};
